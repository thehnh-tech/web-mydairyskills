import { NextResponse } from "next/server";
import { z } from "zod";
import { collections } from "@/lib/mongo";
import { requireUser } from "@/lib/session";
import { normalizeSkillName, rarityTier } from "@mds/shared";

export async function GET() {
  const { userId } = await requireUser();
  const { skills, users } = await collections();
  const docs = await skills.find({ userId }).sort({ updatedAt: -1 }).toArray();

  // Compute rarity: how many distinct users have each skill (by normalized name)?
  // One aggregation across the whole skills collection covers it.
  const totalUsers = await users.countDocuments();
  const userCountByName = new Map<string, number>();

  if (docs.length > 0) {
    const cursor = await skills
      .aggregate<{ _id: string; users: number }>([
        {
          $group: {
            _id: { $toLower: { $trim: { input: "$name" } } },
            uniqueUsers: { $addToSet: "$userId" },
          },
        },
        { $project: { _id: 1, users: { $size: "$uniqueUsers" } } },
      ])
      .toArray();
    for (const row of cursor) {
      userCountByName.set(row._id, row.users);
    }
  }

  return NextResponse.json({
    totalUsers,
    skills: docs.map((d) => {
      const userCount = userCountByName.get(normalizeSkillName(d.name)) ?? 1;
      return {
        id: d._id!.toString(),
        name: d.name,
        emoji: d.emoji,
        category: d.category,
        description: d.description,
        level: d.level,
        progress: d.progress,
        entries: d.entries,
        updatedAt: d.updatedAt,
        createdAt: d.createdAt,
        rarity: {
          tier: rarityTier(userCount, totalUsers),
          userCount,
          totalUsers,
        },
      };
    }),
  });
}

const Body = z.object({
  name: z.string().min(1).max(60),
  emoji: z.string().min(1).max(8),
  category: z.string().max(40),
  description: z.string().max(280).default(""),
});

export async function POST(req: Request) {
  const { userId } = await requireUser();
  const data = Body.parse(await req.json());
  const { skills } = await collections();
  const now = new Date().toISOString();
  const inserted = await skills.insertOne({
    userId,
    name: data.name,
    emoji: data.emoji,
    category: data.category,
    description: data.description,
    level: 1,
    progress: 0,
    entries: 0,
    createdAt: now,
    updatedAt: now,
  });
  return NextResponse.json({ id: inserted.insertedId.toString() });
}
