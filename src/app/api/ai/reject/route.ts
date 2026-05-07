import { NextResponse } from "next/server";
import { z } from "zod";
import { collections, ObjectId } from "@/lib/mongo";
import { requireUser } from "@/lib/session";

const Body = z.object({ suggestionId: z.string() });

export async function POST(req: Request) {
  const { userId } = await requireUser();
  const { suggestionId } = Body.parse(await req.json());
  const { suggestions } = await collections();
  await suggestions.updateOne(
    { _id: new ObjectId(suggestionId), userId },
    { $set: { status: "rejected", reviewedAt: new Date().toISOString() } }
  );
  return NextResponse.json({ ok: true });
}
