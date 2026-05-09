import { NextResponse } from "next/server";
import { z } from "zod";
import { entriesForNextLevel, normalizeSkillName } from "@mds/shared";
import { collections, ObjectId } from "@/lib/mongo";
import { requireUser } from "@/lib/session";
import { getAIProvider, hasGroqFallback, isQuotaLikeError } from "@/lib/ai";

const Body = z.object({
  dateKey: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
});

const CATEGORIES = new Set(["Life", "Code", "Study", "Body", "Practice", "Social", "Work"]);

export async function POST(req: Request) {
  const { userId } = await requireUser();
  const { dateKey } = Body.parse(await req.json());
  const { users, diary, skills, suggestions, aiUsage } = await collections();

  const user = await users.findOne({ _id: new ObjectId(userId) });
  if (!user) return NextResponse.json({ error: "user not found" }, { status: 404 });

  if (!user.ai?.enabled) {
    return NextResponse.json(
      { error: "AI analysis is disabled. Enable it in Settings > AI." },
      { status: 403 }
    );
  }

  const entry = await diary.findOne({ userId, dateKey });
  if (!entry || entry.content.trim().length < 20) {
    return NextResponse.json(
      { error: "Write at least 20 characters before analyzing." },
      { status: 400 }
    );
  }

  if (entry.analyzedAt) {
    return NextResponse.json(
      { error: "Today's page is already analyzed and frozen.", code: "already-analyzed" },
      { status: 409 }
    );
  }

  // Legacy pending suggestions from the old review flow are applied
  // automatically now. The product rule is: the AI decides; users do not
  // manually approve, reject, or cherry-pick skills.
  const pending = await suggestions.findOne({ userId, dateKey, status: "pending" });
  if (pending) {
    const now = new Date().toISOString();
    const restored = {
      summary: pending.summary || "",
      newSkills: Array.isArray(pending.newSkills) ? pending.newSkills : [],
      upgradedSkills: Array.isArray(pending.upgradedSkills) ? pending.upgradedSkills : [],
      ignored: [],
    };
    const applied = await applySkillUpdates(skills, userId, restored, now);
    await suggestions.updateOne(
      { _id: pending._id! },
      { $set: { status: "reviewed", reviewedAt: now } }
    );
    await markDiaryAnalyzed(diary, userId, dateKey, pending.provider || "ai", now);
    return analysisResponse(pending._id!.toString(), pending.provider || "ai", restored, applied);
  }

  const providerName = user.ai.shareTextWithProvider === false ? "mock" : "gemini";
  const existingSkills = await skills.find({ userId }).toArray();
  const input = {
    dateKey,
    content: entry.content,
    existingSkills: existingSkills.map((s) => ({
      id: s._id!.toString(),
      name: s.name,
      emoji: s.emoji,
      category: s.category as any,
      level: s.level,
    })),
  };

  let provider = getAIProvider(providerName);

  if (provider.name === "gemini") {
    const reservation = await reserveGeminiRequest(aiUsage);
    if (!reservation.allowed) {
      provider = hasGroqFallback() ? getAIProvider("groq") : getAIProvider("mock");
    }
  }

  let result;
  try {
    result = await analyzeWithRetry(provider, input);
  } catch (e: any) {
    if (provider.name === "gemini" && isQuotaLikeError(e)) {
      const fallbackReason = e?.message || "Gemini temporary failure";
      provider = hasGroqFallback() ? getAIProvider("groq") : getAIProvider("mock");
      try {
        result = await analyzeWithRetry(provider, input);
      } catch (fallbackError: any) {
        console.error("[ai/analyze] fallback error:", fallbackError?.message || fallbackError);
        if (provider.name !== "mock") {
          provider = getAIProvider("mock");
          result = await provider.analyze(input);
        } else {
          return NextResponse.json(
            {
              error: `Provider ${provider.name} failed after Gemini fallback (${fallbackReason}): ${
                fallbackError?.message || "unknown error"
              }`,
            },
            { status: 502 }
          );
        }
      }
    } else if (provider.name === "groq" && isQuotaLikeError(e)) {
      console.error("[ai/analyze] groq temporary error:", e?.message || e);
      provider = getAIProvider("mock");
      result = await provider.analyze(input);
    } else {
      console.error("[ai/analyze] provider error:", e?.message || e);
      return NextResponse.json(
        { error: `Provider ${provider.name} failed: ${e?.message || "unknown error"}` },
        { status: 502 }
      );
    }
  }

  const now = new Date().toISOString();
  const applied = await applySkillUpdates(skills, userId, result, now);
  const retain = user.ai.retainHistory !== false;
  const inserted = await suggestions.insertOne({
    userId,
    dateKey,
    provider: provider.name,
    summary: retain ? result.summary : "",
    newSkills: retain ? result.newSkills : [],
    upgradedSkills: retain ? result.upgradedSkills : [],
    ignored: retain ? result.ignored : [],
    status: "reviewed" as const,
    createdAt: now,
    reviewedAt: now,
  });

  await markDiaryAnalyzed(diary, userId, dateKey, provider.name, now);
  return analysisResponse(inserted.insertedId.toString(), provider.name, result, applied);
}

async function applySkillUpdates(skills: any, userId: string, result: any, now: string) {
  const created: any[] = [];
  const upgraded: any[] = [];
  const existing = await skills.find({ userId }).toArray();
  const byName = new Map(existing.map((s: any) => [normalizeSkillName(s.name), s]));

  for (const proposal of result.newSkills || []) {
    const normalized = normalizeSkillName(proposal.name);
    const duplicate = byName.get(normalized);
    if (duplicate) {
      const updated = await applyExistingSkill(skills, duplicate, proposal, now);
      upgraded.push(updated);
      byName.set(normalized, updated);
      continue;
    }

    const doc = {
      userId,
      name: cleanText(proposal.name, "Mystery Skill", 60),
      emoji: cleanText(proposal.emoji, "*", 8),
      category: cleanCategory(proposal.category),
      description: cleanText(proposal.description || proposal.evidence, "", 280),
      level: 1,
      progress: Math.min(1, 1 / entriesForNextLevel(1)),
      entries: 1,
      createdAt: now,
      updatedAt: now,
    };
    const inserted = await skills.insertOne(doc);
    created.push({ id: inserted.insertedId.toString(), ...doc });
    byName.set(normalized, { ...doc, _id: inserted.insertedId });
  }

  for (const upgrade of result.upgradedSkills || []) {
    let current = null;
    try {
      current = await skills.findOne({ _id: new ObjectId(upgrade.skillId), userId });
    } catch {}
    if (!current) continue;
    upgraded.push(await applyExistingSkill(skills, current, upgrade, now));
  }

  return { created, upgraded };
}

async function applyExistingSkill(skills: any, current: any, update: any, now: string) {
  const previousLevel = Number(current.level) || 1;
  const levelAfter = Math.max(previousLevel, Number(update.levelAfter) || previousLevel);
  const progress = Math.min(1, (Number(current.progress) || 0) + 1 / entriesForNextLevel(levelAfter));
  const next = {
    name: cleanText(update.name, current.name, 60),
    emoji: cleanText(update.emoji, current.emoji || "*", 8),
    description: cleanText(
      update.reason || update.description || current.description,
      current.description || "",
      280
    ),
    level: levelAfter,
    progress,
    updatedAt: now,
  };
  await skills.updateOne(
    { _id: current._id, userId: current.userId },
    { $set: next, $inc: { entries: 1 } }
  );
  return {
    id: current._id?.toString(),
    ...next,
    category: current.category,
    entries: (Number(current.entries) || 0) + 1,
    levelBefore: previousLevel,
    evidence: update.evidence || "",
    reason: update.reason || update.description || "",
  };
}

function analysisResponse(id: string, provider: string, result: any, applied: any) {
  return NextResponse.json({
    id,
    provider,
    summary: result.summary,
    newSkills: applied.created,
    upgradedSkills: applied.upgraded,
    createdCount: applied.created.length,
    upgradedCount: applied.upgraded.length,
    ignored: [],
  });
}

async function markDiaryAnalyzed(
  diary: any,
  userId: string,
  dateKey: string,
  provider: string,
  now: string
) {
  await diary.updateOne(
    { userId, dateKey },
    {
      $set: {
        analyzedAt: now,
        analyzedProvider: provider,
        status: "locked",
        updatedAt: now,
      },
    }
  );
}

function cleanText(value: unknown, fallback: string, max: number) {
  const text = String(value || fallback).trim() || fallback;
  return text.slice(0, max);
}

function cleanCategory(value: unknown) {
  const text = String(value || "Practice");
  return CATEGORIES.has(text) ? text : "Practice";
}

function utcDateKey(date = new Date()): string {
  return date.toISOString().slice(0, 10);
}

function geminiDailyLimit(): number {
  const raw = Number.parseInt(process.env.GEMINI_DAILY_LIMIT || "250", 10);
  return Number.isFinite(raw) && raw > 0 ? raw : 250;
}

async function reserveGeminiRequest(aiUsage: any): Promise<{ allowed: boolean; count: number; limit: number }> {
  const now = new Date();
  const dateKey = utcDateKey(now);
  const limit = geminiDailyLimit();
  const key = `gemini:${dateKey}`;
  const expiresAt = new Date(now.getTime() + 3 * 24 * 60 * 60 * 1000);

  const result = await aiUsage.findOneAndUpdate(
    { key },
    {
      $inc: { count: 1 },
      $set: { updatedAt: now.toISOString() },
      $setOnInsert: {
        key,
        provider: "gemini",
        dateKey,
        createdAt: now.toISOString(),
        expiresAt,
      },
    },
    { upsert: true, returnDocument: "after" }
  );

  const count = result?.count || result?.value?.count || 1;
  return { allowed: count <= limit, count, limit };
}

async function analyzeWithRetry(provider: any, input: any) {
  const maxAttempts = provider.name === "gemini" ? 2 : 1;
  let lastError;

  for (let attempt = 1; attempt <= maxAttempts; attempt += 1) {
    try {
      return await provider.analyze(input);
    } catch (error) {
      lastError = error;
      if (attempt >= maxAttempts || !isQuotaLikeError(error)) break;
      await wait(750 * attempt);
    }
  }

  throw lastError;
}

function wait(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
