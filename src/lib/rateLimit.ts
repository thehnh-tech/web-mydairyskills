// Tiny in-memory sliding-window rate limiter. Good enough for hardening
// auth endpoints against simple brute-force / scripted attacks.
//
// Limitations:
// - Per-instance memory: Vercel serverless cold-starts reset the bucket, so
//   determined attackers across regions can sneak through. For production
//   hardening, swap this for Upstash Redis or Vercel KV (10 lines of change).
// - Single-process: each lambda has its own map. Acceptable for MVP.

type Bucket = { hits: number[]; blockedUntil: number };
const store = new Map<string, Bucket>();

export type RateLimitResult = {
  ok: boolean;
  retryAfterSeconds: number;
};

export function rateLimit(opts: {
  key: string;
  windowMs: number;
  max: number;
  // Optional cooldown after exceeding the limit. Without this, the bucket
  // immediately allows requests as old hits age out — fine for soft limits.
  blockMs?: number;
}): RateLimitResult {
  const now = Date.now();
  const b = store.get(opts.key) ?? { hits: [], blockedUntil: 0 };

  if (b.blockedUntil > now) {
    return { ok: false, retryAfterSeconds: Math.ceil((b.blockedUntil - now) / 1000) };
  }

  // Drop hits outside the window
  const cutoff = now - opts.windowMs;
  b.hits = b.hits.filter((t) => t > cutoff);

  if (b.hits.length >= opts.max) {
    if (opts.blockMs) b.blockedUntil = now + opts.blockMs;
    store.set(opts.key, b);
    const wait = Math.ceil((opts.blockMs ?? opts.windowMs) / 1000);
    return { ok: false, retryAfterSeconds: wait };
  }

  b.hits.push(now);
  store.set(opts.key, b);

  // Best-effort cleanup: prune random stale entries to keep memory bounded.
  if (Math.random() < 0.01) {
    for (const [k, v] of store) {
      if (v.hits.length === 0 && v.blockedUntil < now) store.delete(k);
    }
  }

  return { ok: true, retryAfterSeconds: 0 };
}

// Pull a stable client identifier from the request. In Vercel's runtime,
// `x-forwarded-for` is set to the visitor's IP. Behind other proxies, fall
// back to a bucket name + the connection IP (which Edge runtimes don't
// expose, hence the fallback).
export function clientKey(req: Request, prefix: string): string {
  const xff = req.headers.get("x-forwarded-for");
  const ip = xff?.split(",")[0]?.trim() || req.headers.get("x-real-ip") || "unknown";
  return `${prefix}:${ip}`;
}
