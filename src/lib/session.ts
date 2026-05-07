import { getIronSession, type SessionOptions } from "iron-session";
import { cookies } from "next/headers";

export type SessionData = {
  userId?: string;
  email?: string;
};

const password = process.env.SESSION_PASSWORD;

export const sessionOptions: SessionOptions = {
  password: password || "dev-only-replace-me-with-32-plus-character-string-please",
  cookieName: "mds_session",
  cookieOptions: {
    secure: process.env.NODE_ENV === "production",
    httpOnly: true,
    sameSite: "lax",
    path: "/",
  },
};

export async function getSession() {
  const store = await cookies();
  return getIronSession<SessionData>(store, sessionOptions);
}

export async function requireUser(): Promise<{ userId: string; email: string }> {
  const s = await getSession();
  if (!s.userId || !s.email) {
    throw new UnauthorizedError();
  }
  return { userId: s.userId, email: s.email };
}

export class UnauthorizedError extends Error {
  status = 401;
  constructor() {
    super("Not signed in");
  }
}
