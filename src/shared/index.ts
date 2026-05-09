import { z } from "zod";

export type DateKey = string;

export const SkillCategory = z.enum([
  "Life",
  "Code",
  "Study",
  "Body",
  "Practice",
  "Social",
  "Work",
]);
export type SkillCategory = z.infer<typeof SkillCategory>;

export const Skill = z.object({
  id: z.string(),
  userId: z.string(),
  name: z.string().min(1).max(60),
  emoji: z.string().min(1).max(8),
  category: SkillCategory,
  description: z.string().max(280).default(""),
  level: z.number().int().min(1).max(99).default(1),
  progress: z.number().min(0).max(1).default(0),
  entries: z.number().int().min(0).default(0),
  updatedAt: z.string(),
  createdAt: z.string(),
});
export type Skill = z.infer<typeof Skill>;

export const DiaryEntry = z.object({
  id: z.string(),
  userId: z.string(),
  dateKey: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  content: z.string().default(""),
  wordCount: z.number().int().default(0),
  status: z.enum(["draft", "saved", "locked"]).default("draft"),
  analyzedAt: z.string().nullable().default(null),
  createdAt: z.string(),
  updatedAt: z.string(),
});
export type DiaryEntry = z.infer<typeof DiaryEntry>;

export const SkillProposal = z.object({
  kind: z.literal("new"),
  name: z.string(),
  emoji: z.string(),
  category: SkillCategory,
  description: z.string(),
  evidence: z.string(),
  confidence: z.number().min(0).max(1),
});
export type SkillProposal = z.infer<typeof SkillProposal>;

export const SkillUpgrade = z.object({
  kind: z.literal("upgrade"),
  skillId: z.string(),
  name: z.string(),
  emoji: z.string(),
  levelBefore: z.number(),
  levelAfter: z.number(),
  evidence: z.string(),
  reason: z.string(),
  confidence: z.number().min(0).max(1),
});
export type SkillUpgrade = z.infer<typeof SkillUpgrade>;

export const IgnoredFragment = z.object({
  text: z.string(),
  reason: z.string(),
});
export type IgnoredFragment = z.infer<typeof IgnoredFragment>;

export const AISuggestionSet = z.object({
  id: z.string(),
  userId: z.string(),
  dateKey: z.string(),
  provider: z.string(),
  summary: z.string(),
  newSkills: z.array(SkillProposal),
  upgradedSkills: z.array(SkillUpgrade),
  ignored: z.array(IgnoredFragment),
  status: z.enum(["pending", "reviewed", "rejected"]).default("pending"),
  createdAt: z.string(),
  reviewedAt: z.string().nullable().default(null),
});
export type AISuggestionSet = z.infer<typeof AISuggestionSet>;

export const UserAIConsent = z.object({
  enabled: z.boolean().default(true),
  provider: z.enum(["groq", "gemini", "mock", "openai"]).default("gemini"),
  shareTextWithProvider: z.boolean().default(true),
  retainHistory: z.boolean().default(true),
  lastConsentedAt: z.string().nullable().default(null),
});
export type UserAIConsent = z.infer<typeof UserAIConsent>;

export const User = z.object({
  id: z.string(),
  email: z.string().email(),
  name: z.string().default(""),
  timezone: z.string().default("UTC"),
  onboarded: z.boolean().default(false),
  ai: UserAIConsent,
  createdAt: z.string(),
});
export type User = z.infer<typeof User>;

export type DayState = "future" | "today" | "past";

export function toDateKey(date: Date, timezone = "UTC"): DateKey {
  const fmt = new Intl.DateTimeFormat("en-CA", {
    timeZone: timezone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  });
  return fmt.format(date);
}

export function todayKey(timezone = "UTC"): DateKey {
  return toDateKey(new Date(), timezone);
}

export function classifyDay(dateKey: DateKey, timezone = "UTC"): DayState {
  const today = todayKey(timezone);
  if (dateKey === today) return "today";
  return dateKey > today ? "future" : "past";
}

export function assertWritable(dateKey: DateKey, timezone = "UTC"): void {
  const state = classifyDay(dateKey, timezone);
  if (state === "future") {
    throw new DateLockError("future_locked", "This day is in the future and cannot be written yet.");
  }
  if (state === "past") {
    throw new DateLockError("past_locked", "Past days are read-only. The page locked at midnight.");
  }
}

export class DateLockError extends Error {
  code: "future_locked" | "past_locked";

  constructor(code: "future_locked" | "past_locked", message: string) {
    super(message);
    this.code = code;
    this.name = "DateLockError";
  }
}

export function shiftDateKey(dateKey: DateKey, days: number): DateKey {
  const [year, month, day] = dateKey.split("-").map(Number);
  const date = new Date(Date.UTC(year, month - 1, day));
  date.setUTCDate(date.getUTCDate() + days);
  return date.toISOString().slice(0, 10);
}

export function formatLong(dateKey: DateKey): string {
  const [year, month, day] = dateKey.split("-").map(Number);
  return new Date(Date.UTC(year, month - 1, day)).toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
    timeZone: "UTC",
  });
}

export function formatShort(dateKey: DateKey): string {
  const [year, month, day] = dateKey.split("-").map(Number);
  return new Date(Date.UTC(year, month - 1, day)).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    timeZone: "UTC",
  });
}

export function entriesForNextLevel(level: number): number {
  return Math.max(2, Math.ceil(level * 1.5));
}

export function wordCount(value: string): number {
  return (value || "").trim().split(/\s+/).filter(Boolean).length;
}

export type RarityTier = "common" | "uncommon" | "rare" | "epic" | "legendary";

export function rarityTier(userCount: number, totalUsers: number): RarityTier {
  if (totalUsers < 1 || userCount < 1) return "common";
  const pct = userCount / totalUsers;
  if (pct < 0.02) return "legendary";
  if (pct < 0.07) return "epic";
  if (pct < 0.2) return "rare";
  if (pct < 0.5) return "uncommon";
  return "common";
}

export function rarityLabel(tier: RarityTier): string {
  switch (tier) {
    case "legendary":
      return "Legendary";
    case "epic":
      return "Epic";
    case "rare":
      return "Rare";
    case "uncommon":
      return "Uncommon";
    case "common":
      return "Common";
  }
}

export function rarityColors(tier: RarityTier): { fg: string; bg: string; border: string } {
  switch (tier) {
    case "legendary":
      return { fg: "#a16207", bg: "#fef3c7", border: "#fde68a" };
    case "epic":
      return { fg: "#7c3aed", bg: "#ede9fe", border: "#ddd6fe" };
    case "rare":
      return { fg: "#2563eb", bg: "#dbeafe", border: "#bfdbfe" };
    case "uncommon":
      return { fg: "#059669", bg: "#d1fae5", border: "#a7f3d0" };
    case "common":
      return { fg: "#525252", bg: "#f5f5f5", border: "#e5e5e5" };
  }
}

export function normalizeSkillName(name: string): string {
  return (name || "").toLowerCase().trim().replace(/\s+/g, " ");
}

export interface AIAnalyzeInput {
  dateKey: string;
  content: string;
  existingSkills: Pick<Skill, "id" | "name" | "emoji" | "category" | "level">[];
}

export interface AIAnalyzeOutput {
  summary: string;
  newSkills: SkillProposal[];
  upgradedSkills: SkillUpgrade[];
  ignored: IgnoredFragment[];
}

export interface AIProvider {
  readonly name: string;
  analyze(input: AIAnalyzeInput): Promise<AIAnalyzeOutput>;
}

export const ANALYZE_SYSTEM_PROMPT = `You analyze a single day of a user's private diary and decide skill updates.

OUTPUT RULES:
- Output JSON matching the requested schema exactly. No prose outside JSON.
- Every proposal must cite a short verbatim "evidence" quote from the diary.
- Do not infer feelings, mental health, or sensitive attributes.
- Prefer upgrading an existing skill over creating a new one.
- The app applies your newSkills and upgradedSkills automatically after the user taps Analyze.
- The user cannot manually pick, edit, approve, reject, or rename skills. You are the skill engine.
- Do not make moral judgments. A messy, bad, chaotic, lazy, or embarrassing action can still be a skill if it is concrete.
- Do not ignore something just because it sounds negative.
- Use ignored only for text that is too vague, not an action, or not tied to anything skill-like.
- If nothing concrete happened, return empty arrays. Do not invent.

NAMING STYLE:
Skill names should be fun, intriguing, specific, and slightly playful, not corporate job titles.
Use punchy names, two to three words max, lowercase or Title Case, often with a vibe. Names may evolve over time.
Always include a relevant emoji in the emoji field.
For upgradedSkills, you may change the skill name and emoji if the user's pattern has evolved.

Good examples:
- "Pasta Wizard" for cooking something good
- "Bug Slayer" for fixing code bugs
- "Sleep Speedrunner" for going to bed early or napping
- "Locked In" for a deep focus session
- "Gym Rat" for working out
- "Chaos Cartographer" for navigating a messy situation
- "Doomscroll Wizard" for a clearly described doomscrolling streak
- "Argument Acrobat" for getting into or handling a conflict

Bad examples:
- "Software Engineer", "Productive Day", "Effective Communicator", "Time Manager",
  "Self-Improvement", "Daily Journaling", "Morning Routine"

Lean specific over generic. "Pasta Wizard" beats "Cooking". "Bug Slayer" beats "Coding".
The user wants to feel a little bit of dopamine when they see the skill name.`;
