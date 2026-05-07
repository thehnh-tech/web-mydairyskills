import { NextResponse } from "next/server";
import { collections, ObjectId } from "@/lib/mongo";
import { getSession } from "@/lib/session";

export async function GET() {
  const session = await getSession();
  if (!session.userId) return NextResponse.json({ user: null });
  const { users } = await collections();
  const user = await users.findOne({ _id: new ObjectId(session.userId) });
  if (!user) return NextResponse.json({ user: null });

  // One-shot migration: existing users created before AI-on-by-default get
  // flipped to enabled=true unless they explicitly opted out (lastConsentedAt set).
  const needsMigration =
    !user.ai ||
    (user.ai.enabled === false && !user.ai.lastConsentedAt) ||
    user.ai.provider === "gemini";
  if (needsMigration) {
    const now = new Date().toISOString();
    const migrated = {
      enabled: true,
      provider: "groq" as const,
      shareTextWithProvider: true,
      retainHistory: user.ai?.retainHistory ?? true,
      lastConsentedAt: user.ai?.lastConsentedAt || now,
    };
    await users.updateOne(
      { _id: user._id },
      { $set: { ai: migrated } }
    );
    user.ai = migrated;
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
