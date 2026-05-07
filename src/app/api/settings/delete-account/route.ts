import { NextResponse } from "next/server";
import { collections, ObjectId } from "@/lib/mongo";
import { getSession, requireUser } from "@/lib/session";

export async function POST() {
  const { userId } = await requireUser();
  const { users, diary, skills, suggestions } = await collections();
  await Promise.all([
    diary.deleteMany({ userId }),
    skills.deleteMany({ userId }),
    suggestions.deleteMany({ userId }),
    users.deleteOne({ _id: new ObjectId(userId) }),
  ]);
  const session = await getSession();
  session.destroy();
  return NextResponse.json({ ok: true });
}
