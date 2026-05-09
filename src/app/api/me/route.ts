import { NextResponse } from "next/server";
import { collections, ObjectId } from "@/lib/mongo";
import { getSession } from "@/lib/session";

export async function GET() {
  const session = await getSession();
  if (!session.userId) return NextResponse.json({ user: null });
  const { users } = await collections();
  const user = await users.findOne({ _id: new ObjectId(session.userId) });
  if (!user) return NextResponse.json({ user: null });

  // Backfill the `ai` sub-document only if it's completely missing (legacy
  // accounts created before AI was a first-class field). NEVER override an
  // existing `ai` object — disabling AI in Settings writes
  // `lastConsentedAt: null`, and treating that as "needs migration" would
  // silently re-enable AI on the user's behalf, breaking opt-out.
  if (!user.ai) {
    const now = new Date().toISOString();
    const seeded = {
      enabled: true,
      provider: "groq" as const,
      shareTextWithProvider: true,
      retainHistory: true,
      lastConsentedAt: now,
    };
    await users.updateOne({ _id: user._id }, { $set: { ai: seeded } });
    user.ai = seeded;
  }

  return NextResponse.json({
    user: {
      id: user._id!.toString(),
      email: user.email,
      name: user.name,
      timezone: user.timezone,
      onboarded: user.onboarded,
      ai: user.ai,
    },
  });
}
