import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { collections, ensureIndexes } from "@/lib/mongo";
import { getSession } from "@/lib/session";

const Body = z.object({
  email: z.string().email(),
  password: z.string().min(8).max(200),
  name: z.string().max(80).optional().default(""),
  timezone: z.string().max(64).optional().default("UTC"),
});

export async function POST(req: Request) {
  await ensureIndexes();
  const data = Body.parse(await req.json());
  const { users } = await collections();

  const existing = await users.findOne({ email: data.email.toLowerCase() });
  if (existing) {
    return NextResponse.json({ error: "Email already registered" }, { status: 409 });
  }

  const passwordHash = await bcrypt.hash(data.password, 10);
  const now = new Date().toISOString();
  const result = await users.insertOne({
    email: data.email.toLowerCase(),
    passwordHash,
    name: data.name,
    timezone: data.timezone,
    onboarded: false,
    ai: {
      enabled: true,
      provider: "groq",
      shareTextWithProvider: true,
      retainHistory: true,
      lastConsentedAt: now,
    },
    createdAt: now,
  });

  const session = await getSession();
  session.userId = result.insertedId.toString();
  session.email = data.email.toLowerCase();
  await session.save();

  return NextResponse.json({ ok: true, userId: result.insertedId.toString() });
}
