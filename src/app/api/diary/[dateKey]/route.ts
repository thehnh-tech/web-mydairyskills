import { NextResponse } from "next/server";
import { z } from "zod";
import { assertWritable, classifyDay, wordCount } from "@mds/shared";
import { collections, ObjectId } from "@/lib/mongo";
import { requireUser } from "@/lib/session";
import { encryptDiaryContent, getDiaryContent } from "@/lib/diaryCrypto";

const Params = z.object({ dateKey: z.string().regex(/^\d{4}-\d{2}-\d{2}$/) });
const PutBody = z.object({ content: z.string().max(50000) });

export async function GET(
  _req: Request,
  ctx: { params: Promise<{ dateKey: string }> }
) {
  const { userId } = await requireUser();
  const { dateKey } = Params.parse(await ctx.params);
  const { users, diary } = await collections();
  const user = await users.findOne({ _id: new ObjectId(userId) });
  const tz = user?.timezone || "UTC";
  const entry = await diary.findOne({ userId, dateKey });
  return NextResponse.json({
    state: classifyDay(dateKey, tz),
    entry: entry ? serializeEntry(entry) : null,
  });
}

export async function PUT(
  req: Request,
  ctx: { params: Promise<{ dateKey: string }> }
) {
  const { userId } = await requireUser();
  const { dateKey } = Params.parse(await ctx.params);
  const { content } = PutBody.parse(await req.json());
  const { users, diary } = await collections();
  const user = await users.findOne({ _id: new ObjectId(userId) });
  const tz = user?.timezone || "UTC";

  try {
    assertWritable(dateKey, tz);
  } catch (e: any) {
    return NextResponse.json(
      { error: e.message, code: e.code || "locked" },
      { status: 403 }
    );
  }

  // Once the user has analyzed today's page, it freezes — no more edits.
  // (The 1-analysis-per-day rule from the product spec.)
  const existing = await diary.findOne({ userId, dateKey });
  if (existing?.analyzedAt) {
    return NextResponse.json(
      {
        error: "This page is frozen — you already ran today's analysis.",
        code: "frozen",
      },
      { status: 403 }
    );
  }

  const now = new Date().toISOString();
  const wc = wordCount(content);
  const encrypted = encryptDiaryContent(content, userId, dateKey);

  const result = await diary.findOneAndUpdate(
    { userId, dateKey },
    {
      $set: { ...encrypted, wordCount: wc, status: "saved", updatedAt: now },
      $unset: { content: "" },
      $setOnInsert: { userId, dateKey, createdAt: now, analyzedAt: null },
    },
    { upsert: true, returnDocument: "after" }
  );

  return NextResponse.json({ entry: result ? serializeEntry(result) : null });
}

function serializeEntry(d: any) {
  return {
    id: d._id?.toString(),
    userId: d.userId,
    dateKey: d.dateKey,
    content: getDiaryContent(d),
    wordCount: d.wordCount,
    status: d.status,
    analyzedAt: d.analyzedAt,
    analyzedProvider: d.analyzedProvider || null,
    createdAt: d.createdAt,
    updatedAt: d.updatedAt,
  };
}
