import { getIronSession, type SessionOptions } from "iron-session";
import { cookies } from "next/headers";

export type SessionData = {
  userId?: string;
  email?: string;
};

const password = process.env.SESSION_PASSWORD;
const isProd = process.env.NODE_ENV === "production";

// Fail closed in production. Iron-session needs a 32+ char secret to seal
// cookies; if it's missing we'd silently fall back to a public dev string,
// which means anyone can forge sessions. Throwing at module load makes the
// deploy fail loudly instead.
if (isProd && (!password || password.length < 32)) {
  throw new Error(
    "SESSION_PASSWORD is required in production and must be at least 32 characters. " +
      "Generate one with: openssl rand -base64 32"
  );
}

export const sessionOptions: SessionOptions = {
  password: password || "dev-only-replace-me-with-32-plus-character-string-please",
  cookieName: "mds_session",
  cookieOptions: {
    secure: isProd,
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
