import type { AIProvider } from "@mds/shared";
import { mockProvider } from "./mock";
import { geminiProvider } from "./gemini";
import { groqProvider } from "./groq";

export function getAIProvider(name?: string): AIProvider {
  const requested = (name || process.env.AI_PROVIDER || "groq").toLowerCase();
  if (requested === "groq" && process.env.GROQ_API_KEY) {
    return groqProvider();
  }
  if (requested === "gemini" && process.env.GEMINI_API_KEY) {
    return geminiProvider();
  }
  if (process.env.GROQ_API_KEY) return groqProvider();
  if (process.env.GEMINI_API_KEY) return geminiProvider();
  return mockProvider();
}
