import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { collections } from "@/lib/mongo";
import { getSession } from "@/lib/session";

const Body = z.object({ email: z.string().email(), password: z.string().min(1) });

export async function POST(req: Request) {
  const data = Body.parse(await req.json());
  const { users } = await collections();
  const user = await users.findOne({ email: data.email.toLowerCase() });
  if (!user) return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });

  const ok = await bcrypt.compare(data.password, user.passwordHash);
  if (!ok) return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });

  const session = await getSession();
  session.userId = user._id!.toString();
  session.email = user.email;
  await session.save();

  return NextResponse.json({ ok: true });
}
