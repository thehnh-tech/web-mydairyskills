import { NextResponse } from "next/server";
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

export async function POST() {
  await requireUser();
  return NextResponse.json(
    { error: "Skills are created by AI analysis, not manually." },
    { status: 403 }
  );
}
