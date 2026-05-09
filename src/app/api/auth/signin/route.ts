import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { collections } from "@/lib/mongo";
import { getSession } from "@/lib/session";
import { rateLimit, clientKey } from "@/lib/rateLimit";

const Body = z.object({ email: z.string().email(), password: z.string().min(1) });

export async function POST(req: Request) {
  // 8 attempts per 5 minutes per IP, then a 10 min lockout. Tight enough to
  // stop trivial credential stuffing, loose enough that a normal user
  // fumbling their password isn't punished.
  const limit = rateLimit({
    key: clientKey(req, "signin"),
    windowMs: 5 * 60_000,
    max: 8,
    blockMs: 10 * 60_000,
  });
  if (!limit.ok) {
    return NextResponse.json(
      { error: "Too many sign-in attempts. Try again later." },
      {
        status: 429,
        headers: { "Retry-After": String(limit.retryAfterSeconds) },
      }
    );
  }

  const data = Body.parse(await req.json());
  const { users } = await collections();
  const user = await users.findOne({ email: data.email.toLowerCase() });
  // Always run bcrypt.compare with a fixed-cost dummy hash if the user wasn't
  // found, so response time doesn't reveal account existence.
  const compareHash =
    user?.passwordHash || "$2a$10$abcdefghijklmnopqrstuvCDEFGHIJKLMNOPQRSTUVWXYZ012345/.";
  const ok = await bcrypt.compare(data.password, compareHash);
  if (!user || !ok) {
    return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
  }

  const session = await getSession();
  session.userId = user._id!.toString();
  session.email = user.email;
  await session.save();

  return NextResponse.json({ ok: true });
}
