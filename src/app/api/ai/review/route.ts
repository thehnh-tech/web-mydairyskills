import { NextResponse } from "next/server";
import { z } from "zod";
import { collections, ObjectId } from "@/lib/mongo";
import { requireUser } from "@/lib/session";
import { entriesForNextLevel } from "@mds/shared";

const Body = z.object({
  suggestionId: z.string(),
  acceptedNew: z.array(
    z.object({
      name: z.string().min(1).max(60),
      emoji: z.string().min(1).max(8),
      category: z.string(),
      description: z.string().default(""),
    })
  ),
  acceptedUpgrades: z.array(
    z.object({ skillId: z.string(), levelAfter: z.number().int().min(1).max(99) })
  ),
});

export async function POST(req: Request) {
  const { userId } = await requireUser();
  const data = Body.parse(await req.json());
  const { skills, suggestions, diary } = await collections();

  const suggestion = await suggestions.findOne({
    _id: new ObjectId(data.suggestionId),
    userId,
  });
  if (!suggestion) return NextResponse.json({ error: "not found" }, { status: 404 });
  if (suggestion.status !== "pending") {
    return NextResponse.json({ error: "already reviewed" }, { status: 409 });
  }

  const now = new Date().toISOString();

  // 1. Insert accepted new skills.
  for (const s of data.acceptedNew) {
    await skills.insertOne({
      userId,
      name: s.name,
      emoji: s.emoji,
      category: s.category,
      description: s.description,
      level: 1,
      progress: 0,
      entries: 1,
      createdAt: now,
      updatedAt: now,
    });
  }

  // 2. Apply accepted upgrades.
  for (const u of data.acceptedUpgrades) {
    const sk = await skills.findOne({ _id: new ObjectId(u.skillId), userId });
    if (!sk) continue;
    const levelAfter = Math.max(sk.level, u.levelAfter);
    const progress = Math.min(1, sk.progress + 1 / entriesForNextLevel(levelAfter));
    await skills.updateOne(
      { _id: sk._id! },
      {
        $set: { level: levelAfter, progress, updatedAt: now },
        $inc: { entries: 1 },
      }
    );
  }

  // 3. Mark suggestion reviewed and entry analyzed.
  await suggestions.updateOne(
    { _id: suggestion._id! },
    { $set: { status: "reviewed", reviewedAt: now } }
  );
  await diary.updateOne(
    { userId, dateKey: suggestion.dateKey },
    { $set: { analyzedAt: now } }
  );

  return NextResponse.json({ ok: true });
}
