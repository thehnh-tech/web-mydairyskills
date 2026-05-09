/** @type {import('next').NextConfig} */

// Hardened HTTP headers applied to every response. These are the floor; tune
// CSP if you add a third-party script (analytics, embeds) — keep `frame-
// ancestors 'none'` and `base-uri 'self'` no matter what.
const isProd = process.env.NODE_ENV === "production";

const csp = [
  "default-src 'self'",
  // Next 15 still inlines a few scripts (Server Component hydration). In dev
  // we need 'unsafe-eval' for HMR / fast refresh.
  `script-src 'self' 'unsafe-inline' ${isProd ? "" : "'unsafe-eval'"}`.trim(),
  // Tailwind injects style tags; allow inline styles. Style-src-elem covers
  // <style> tags specifically in browsers that split the directive.
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self' data: https:",
  "font-src 'self' data:",
  // We call Groq + (legacy) Gemini directly server-side, but the browser also
  // hits /api/* on our own origin. Keep this list narrow.
  "connect-src 'self' https://api.groq.com https://generativelanguage.googleapis.com",
  "frame-ancestors 'none'",
  "form-action 'self'",
  "base-uri 'self'",
  "object-src 'none'",
  "manifest-src 'self'",
  "worker-src 'self' blob:",
  "upgrade-insecure-requests",
].join("; ");

const securityHeaders = [
  { key: "Content-Security-Policy", value: csp },
  // 1 year HSTS, applies only when served over HTTPS (Vercel does in prod).
  ...(isProd
    ? [
        {
          key: "Strict-Transport-Security",
          value: "max-age=63072000; includeSubDomains; preload",
        },
      ]
    : []),
  { key: "X-Frame-Options", value: "DENY" },
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  { key: "X-DNS-Prefetch-Control", value: "on" },
  {
    key: "Permissions-Policy",
    value: [
      "accelerometer=()",
      "autoplay=()",
      "camera=()",
      "display-capture=()",
      "encrypted-media=()",
      "fullscreen=(self)",
      "geolocation=()",
      "gyroscope=()",
      "magnetometer=()",
      "microphone=()",
      "midi=()",
      "payment=()",
      "picture-in-picture=()",
      "usb=()",
      "xr-spatial-tracking=()",
    ].join(", "),
  },
  { key: "Cross-Origin-Opener-Policy", value: "same-origin" },
  { key: "Cross-Origin-Resource-Policy", value: "same-origin" },
];

const nextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  // Allow Next.js dev server to be reached from LAN IPs (e.g. phone on same
  // wifi, VPN-attached IPs like 128.179.x.x at EPFL). Loose in dev only.
  allowedDevOrigins: [
    "localhost",
    "127.0.0.1",
    "0.0.0.0",
    "*.local",
    "128.179.0.0/16",
    "192.168.0.0/16",
    "10.0.0.0/8",
  ],
  typedRoutes: false,
  async headers() {
    return [
      {
        source: "/:path*",
        headers: securityHeaders,
      },
      {
        // Long-cache static assets — Next already fingerprints filenames.
        source: "/_next/static/:path*",
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=31536000, immutable",
          },
        ],
      },
    ];
  },
};

export default nextConfig;
