export const SITE_NAME = "MyDiarySkills";

export const SITE_DESCRIPTION =
  "A private daily diary where AI turns reflection into evolving skills.";

export function getSiteUrl(): URL {
  const raw =
    process.env.NEXT_PUBLIC_SITE_URL ||
    process.env.VERCEL_PROJECT_PRODUCTION_URL ||
    process.env.VERCEL_URL;

  if (!raw) return new URL("http://localhost:3000");

  const normalized =
    raw.startsWith("http://") || raw.startsWith("https://") ? raw : `https://${raw}`;

  try {
    return new URL(normalized);
  } catch {
    return new URL("http://localhost:3000");
  }
}
