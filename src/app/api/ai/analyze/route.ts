import { NextResponse } from "next/server";
import { z } from "zod";
import { collections, ObjectId } from "@/lib/mongo";
import { requireUser } from "@/lib/session";
import { getAIProvider, hasGroqFallback, isQuotaLikeError } from "@/lib/ai";

const Body = z.object({
  dateKey: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
});

export async function POST(req: Request) {
  const { userId } = await requireUser();
  const { dateKey } = Body.parse(await req.json());
  const { users, diary, skills, suggestions, aiUsage } = await collections();

  const user = await users.findOne({ _id: new ObjectId(userId) });
  if (!user) return NextResponse.json({ error: "user not found" }, { status: 404 });

  // Hard gate: AI requires explicit consent recorded in settings.
  if (!user.ai?.enabled) {
    return NextResponse.json(
      { error: "AI analysis is disabled. Enable it in Settings → AI." },
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

  // Server-side enforcement of "one analysis per day". Two states block:
  //   1) The day was already analyzed and skills accepted (analyzedAt set).
  //   2) A pending suggestion exists awaiting review — running another would
  //      double-bill the provider and let the user double-apply skills.
  if (entry.analyzedAt) {
    return NextResponse.json(
      { error: "Today's page is already analyzed and frozen.", code: "already-analyzed" },
      { status: 409 }
    );
  }
  const pending = await suggestions.findOne({ userId, dateKey, status: "pending" });
  if (pending) {
    return NextResponse.json(
      {
        error: "An analysis is already pending. Review or reject it first.",
        code: "pending",
        suggestionId: pending._id?.toString(),
      },
      { status: 409 }
    );
  }

  // Privacy gate: if the user has explicitly chosen NOT to share their entry
  // text with the AI provider, force the offline mock provider so diary
  // content never leaves our infrastructure. This matches the privacy copy:
  // "If off, you'll only see template suggestions."
  const providerName =
    user.ai.shareTextWithProvider === false ? "mock" : "gemini";

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
      if (hasGroqFallback()) {
        provider = getAIProvider("groq");
      } else {
        return NextResponse.json(
          {
            error:
              "Gemini daily quota is reached and GROQ_API_KEY is not configured for fallback.",
            code: "gemini-quota",
          },
          { status: 429 }
        );
      }
    }
  }

  let result;
  try {
    result = await provider.analyze(input);
  } catch (e: any) {
    if (provider.name === "gemini" && isQuotaLikeError(e) && hasGroqFallback()) {
      provider = getAIProvider("groq");
      try {
        result = await provider.analyze(input);
      } catch (fallbackError: any) {
        console.error("[ai/analyze] groq fallback error:", fallbackError?.message || fallbackError);
        return NextResponse.json(
          {
            error: `Provider ${provider.name} failed after Gemini quota fallback: ${
              fallbackError?.message || "unknown error"
            }`,
          },
          { status: 502 }
        );
      }
    } else {
      console.error("[ai/analyze] provider error:", e?.message || e);
      return NextResponse.json(
        { error: `Provider ${provider.name} failed: ${e?.message || "unknown error"}` },
        { status: 502 }
      );
    }
  }

  // Storage gate: when retainHistory=false, persist only the bare minimum
  // needed to enforce one-per-day and to wire the review flow (status,
  // provider, dates). The full payload is still returned to the client so
  // the user can review and accept — the review route uses the client-sent
  // items, not the stored doc.
  const now = new Date().toISOString();
  const retain = user.ai.retainHistory !== false;
  const docPayload = {
    userId,
    dateKey,
    provider: provider.name,
    summary: retain ? result.summary : "",
    newSkills: retain ? result.newSkills : [],
    upgradedSkills: retain ? result.upgradedSkills : [],
    ignored: retain ? result.ignored : [],
    status: "pending" as const,
    createdAt: now,
    reviewedAt: null,
  };
  const inserted = await suggestions.insertOne(docPayload);

  return NextResponse.json({
    id: inserted.insertedId.toString(),
    provider: provider.name,
    summary: result.summary,
    newSkills: result.newSkills,
    upgradedSkills: result.upgradedSkills,
    ignored: result.ignored,
  });
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
