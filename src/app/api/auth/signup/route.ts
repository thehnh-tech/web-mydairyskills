import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { collections, ensureIndexes } from "@/lib/mongo";
import { getSession } from "@/lib/session";
import { rateLimit, clientKey } from "@/lib/rateLimit";

const Body = z.object({
  email: z.string().email(),
  password: z.string().min(8).max(200),
  name: z.string().max(80).optional().default(""),
  timezone: z.string().max(64).optional().default("UTC"),
});

export async function POST(req: Request) {
  // Sign-up is more expensive (bcrypt + insert + index ensure). Cap to 5
  // accounts per IP per hour, then a 1-hour lockout. Discourages drive-by
  // mass-account creation.
  const limit = rateLimit({
    key: clientKey(req, "signup"),
    windowMs: 60 * 60_000,
    max: 5,
    blockMs: 60 * 60_000,
  });
  if (!limit.ok) {
    return NextResponse.json(
      { error: "Too many signups from this network. Try again later." },
      {
        status: 429,
        headers: { "Retry-After": String(limit.retryAfterSeconds) },
      }
    );
  }

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
      provider: "gemini",
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
