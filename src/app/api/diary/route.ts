import { NextResponse } from "next/server";
import { collections } from "@/lib/mongo";
import { requireUser } from "@/lib/session";

// Recent diary days for sidebar / calendar
export async function GET(req: Request) {
  const { userId } = await requireUser();
  const url = new URL(req.url);
  const limit = Math.min(60, Number(url.searchParams.get("limit") || 14));
  const { diary } = await collections();
  const docs = await diary
    .find({ userId })
    .sort({ dateKey: -1 })
    .limit(limit)
    .toArray();
  return NextResponse.json({
    days: docs.map((d) => ({
      dateKey: d.dateKey,
      excerpt: excerpt(d.content),
      wordCount: d.wordCount,
      analyzedAt: d.analyzedAt,
    })),
  });
}

function excerpt(s: string): string {
  return (s || "").replace(/^#+\s*/gm, "").replace(/\s+/g, " ").trim().slice(0, 90);
}
