import { NextResponse } from "next/server";
import { z } from "zod";
import { collections, ObjectId } from "@/lib/mongo";
import { requireUser } from "@/lib/session";

const Patch = z.object({
  name: z.string().min(1).max(60).optional(),
  emoji: z.string().min(1).max(8).optional(),
  description: z.string().max(280).optional(),
  category: z.string().max(40).optional(),
});

export async function PATCH(req: Request, ctx: { params: Promise<{ id: string }> }) {
  const { userId } = await requireUser();
  const { id } = await ctx.params;
  const data = Patch.parse(await req.json());
  const { skills } = await collections();
  await skills.updateOne(
    { _id: new ObjectId(id), userId },
    { $set: { ...data, updatedAt: new Date().toISOString() } }
  );
  return NextResponse.json({ ok: true });
}

export async function DELETE(_req: Request, ctx: { params: Promise<{ id: string }> }) {
  const { userId } = await requireUser();
  const { id } = await ctx.params;
  const { skills } = await collections();
  await skills.deleteOne({ _id: new ObjectId(id), userId });
  return NextResponse.json({ ok: true });
}
