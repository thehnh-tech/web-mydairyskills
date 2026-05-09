import { NextResponse } from "next/server";
import { z } from "zod";
import { collections, ObjectId } from "@/lib/mongo";
import { requireUser } from "@/lib/session";
import { getAIProvider } from "@/lib/ai";

const Body = z.object({
  dateKey: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
});

export async function POST(req: Request) {
  const { userId } = await requireUser();
  const { dateKey } = Body.parse(await req.json());
  const { users, diary, skills, suggestions } = await collections();

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
    user.ai.shareTextWithProvider === false ? "mock" : user.ai.provider;
  const provider = getAIProvider(providerName);

  const existingSkills = await skills.find({ userId }).toArray();

  let result;
  try {
    result = await provider.analyze({
      dateKey,
      content: entry.content,
      existingSkills: existingSkills.map((s) => ({
        id: s._id!.toString(),
        name: s.name,
        emoji: s.emoji,
        category: s.category as any,
        level: s.level,
      })),
    });
  } catch (e: any) {
    console.error("[ai/analyze] provider error:", e?.message || e);
    return NextResponse.json(
      { error: `Provider ${provider.name} failed: ${e?.message || "unknown error"}` },
      { status: 502 }
    );
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
