import { NextResponse } from "next/server";
import { getSession, sessionOptions } from "@/lib/session";

export async function POST() {
  const session = await getSession();
  session.destroy();
  const res = NextResponse.json({ ok: true });
  res.cookies.set(sessionOptions.cookieName, "", {
    ...sessionOptions.cookieOptions,
    maxAge: 0,
    expires: new Date(0),
  });
  return res;
}
