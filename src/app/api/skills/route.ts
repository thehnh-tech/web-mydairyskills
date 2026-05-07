import { NextResponse } from "next/server";
import { z } from "zod";
import { collections } from "@/lib/mongo";
import { requireUser } from "@/lib/session";

export async function GET() {
  const { userId } = await requireUser();
  const { skills } = await collections();
  const docs = await skills.find({ userId }).sort({ updatedAt: -1 }).toArray();
  return NextResponse.json({
    skills: docs.map((d) => ({
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
    })),
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
