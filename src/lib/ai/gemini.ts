import { ANALYZE_SYSTEM_PROMPT, type AIAnalyzeInput, type AIAnalyzeOutput, type AIProvider } from "@mds/shared";

export const GEMINI_MODEL = process.env.GEMINI_MODEL || "gemini-3-flash-preview";
const GEMINI_URL = `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent`;

const RESPONSE_SCHEMA = {
  type: "OBJECT",
  properties: {
    summary: { type: "STRING" },
    newSkills: {
      type: "ARRAY",
      items: {
        type: "OBJECT",
        properties: {
          name: { type: "STRING" },
          emoji: { type: "STRING" },
          category: { type: "STRING", enum: ["Life", "Code", "Study", "Body", "Practice", "Social", "Work"] },
          description: { type: "STRING" },
          evidence: { type: "STRING" },
          confidence: { type: "NUMBER" },
        },
        required: ["name", "emoji", "category", "description", "evidence", "confidence"],
      },
    },
    upgradedSkills: {
      type: "ARRAY",
      items: {
        type: "OBJECT",
        properties: {
          skillId: { type: "STRING" },
          name: { type: "STRING" },
          emoji: { type: "STRING" },
          levelBefore: { type: "NUMBER" },
          levelAfter: { type: "NUMBER" },
          evidence: { type: "STRING" },
          reason: { type: "STRING" },
          confidence: { type: "NUMBER" },
        },
        required: ["skillId", "name", "emoji", "levelBefore", "levelAfter", "evidence", "reason", "confidence"],
      },
    },
    ignored: {
      type: "ARRAY",
      items: {
        type: "OBJECT",
        properties: { text: { type: "STRING" }, reason: { type: "STRING" } },
        required: ["text", "reason"],
      },
    },
  },
  required: ["summary", "newSkills", "upgradedSkills", "ignored"],
};

export function geminiProvider(): AIProvider {
  return {
    name: "gemini",
    async analyze(input: AIAnalyzeInput): Promise<AIAnalyzeOutput> {
      const apiKey = process.env.GEMINI_API_KEY;
      if (!apiKey) throw new Error("GEMINI_API_KEY missing");

      const userPrompt = buildUserPrompt(input);
      const res = await fetch(`${GEMINI_URL}?key=${apiKey}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          systemInstruction: { parts: [{ text: ANALYZE_SYSTEM_PROMPT }] },
          contents: [{ role: "user", parts: [{ text: userPrompt }] }],
          generationConfig: {
            temperature: 0.2,
            responseMimeType: "application/json",
            responseSchema: RESPONSE_SCHEMA,
          },
        }),
      });

      if (!res.ok) {
        const body = await res.text();
        throw new AIProviderError("gemini", res.status, body);
      }
      const json = await res.json();
      const text =
        json?.candidates?.[0]?.content?.parts?.[0]?.text ||
        json?.candidates?.[0]?.content?.parts?.[0]?.inline_data?.data;
      if (!text) throw new Error("Gemini returned no content");

      const parsed = JSON.parse(text);
      return {
        summary: String(parsed.summary || ""),
        newSkills: (parsed.newSkills || []).map((s: any) => ({ kind: "new", ...s })),
        upgradedSkills: (parsed.upgradedSkills || []).map((s: any) => ({ kind: "upgrade", ...s })),
        ignored: parsed.ignored || [],
      };
    },
  };
}

export class AIProviderError extends Error {
  constructor(
    readonly provider: string,
    readonly status: number,
    readonly body: string
  ) {
    super(`${provider} ${status}: ${body.slice(0, 240)}`);
    this.name = "AIProviderError";
  }
}

function buildUserPrompt(input: AIAnalyzeInput): string {
  const skillList = input.existingSkills
    .map((s) => `- ${s.id} | ${s.name} (${s.category}, level ${s.level})`)
    .join("\n") || "(none yet)";
  return `Date: ${input.dateKey}

Existing skills (only propose upgrades for these IDs):
${skillList}

Diary content:
"""
${input.content}
"""

Return JSON exactly matching the schema. Reuse skillId values from the list above for upgrades.`;
}
