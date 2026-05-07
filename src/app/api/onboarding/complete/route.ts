import { NextResponse } from "next/server";
import { collections, ObjectId } from "@/lib/mongo";
import { requireUser } from "@/lib/session";

export async function POST() {
  const { userId } = await requireUser();
  const { users } = await collections();
  await users.updateOne({ _id: new ObjectId(userId) }, { $set: { onboarded: true } });
  return NextResponse.json({ ok: true });
}
