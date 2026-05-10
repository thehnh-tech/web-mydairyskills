import { NextResponse } from "next/server";
import { collections } from "@/lib/mongo";
import { requireUser } from "@/lib/session";
import { getDiaryContent } from "@/lib/diaryCrypto";
import { migrateLegacyDiaryEntries } from "@/lib/diaryMigration";

export async function GET() {
  const { userId } = await requireUser();
  const { diary, skills } = await collections();
  const [days, sk] = await Promise.all([
    diary.find({ userId }).sort({ dateKey: 1 }).toArray(),
    skills.find({ userId }).sort({ createdAt: 1 }).toArray(),
  ]);
  await migrateLegacyDiaryEntries(diary, days);
  return NextResponse.json(
    {
      exportedAt: new Date().toISOString(),
      days: days.map((d) => ({
        dateKey: d.dateKey,
        content: getDiaryContent(d),
        wordCount: d.wordCount,
        analyzedAt: d.analyzedAt,
      })),
      skills: sk.map((s) => ({
        name: s.name,
        emoji: s.emoji,
        category: s.category,
        level: s.level,
        entries: s.entries,
      })),
    },
    {
      headers: { "Content-Disposition": 'attachment; filename="mydiaryskills-export.json"' },
    }
  );
}
