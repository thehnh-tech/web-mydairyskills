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
  if (!user.ai.enabled) {
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

  const existingSkills = await skills.find({ userId }).toArray();
  const provider = getAIProvider(user.ai.provider);

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

  const now = new Date().toISOString();
  const inserted = await suggestions.insertOne({
    userId,
    dateKey,
    provider: provider.name,
    summary: result.summary,
    newSkills: result.newSkills,
    upgradedSkills: result.upgradedSkills,
    ignored: result.ignored,
    status: "pending",
    createdAt: now,
    reviewedAt: null,
  });

  return NextResponse.json({
    id: inserted.insertedId.toString(),
    provider: provider.name,
    summary: result.summary,
    newSkills: result.newSkills,
    upgradedSkills: result.upgradedSkills,
    ignored: result.ignored,
  });
}
