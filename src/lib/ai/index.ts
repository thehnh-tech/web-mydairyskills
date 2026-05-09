import type { AIProvider } from "@mds/shared";
import { mockProvider } from "./mock";
import { geminiProvider } from "./gemini";
import { groqProvider } from "./groq";

export function getAIProvider(name?: string): AIProvider {
  const requested = (name || process.env.AI_PROVIDER || "gemini").toLowerCase();
  if (requested === "gemini" && process.env.GEMINI_API_KEY) {
    return geminiProvider();
  }
  if (requested === "groq" && process.env.GROQ_API_KEY) {
    return groqProvider();
  }
  if (requested === "mock") return mockProvider();
  if (process.env.GROQ_API_KEY) return groqProvider();
  if (process.env.GEMINI_API_KEY) return geminiProvider();
  return mockProvider();
}

export function hasGroqFallback(): boolean {
  return Boolean(process.env.GROQ_API_KEY);
}

export function isQuotaLikeError(error: unknown): boolean {
  const anyError = error as { status?: number; body?: string; message?: string };
  const haystack = `${anyError?.body || ""} ${anyError?.message || ""}`.toLowerCase();
  return (
    anyError?.status === 429 ||
    haystack.includes("resource_exhausted") ||
    haystack.includes("quota") ||
    haystack.includes("rate limit") ||
    haystack.includes("rate_limit")
  );
}
