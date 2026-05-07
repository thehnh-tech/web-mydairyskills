import { ANALYZE_SYSTEM_PROMPT, type AIAnalyzeInput, type AIAnalyzeOutput, type AIProvider } from "@mds/shared";

const GROQ_URL = "https://api.groq.com/openai/v1/chat/completions";
const DEFAULT_MODEL = process.env.GROQ_MODEL || "llama-3.3-70b-versatile";

export function groqProvider(): AIProvider {
  return {
    name: "groq",
    async analyze(input: AIAnalyzeInput): Promise<AIAnalyzeOutput> {
      const apiKey = process.env.GROQ_API_KEY;
      if (!apiKey) throw new Error("GROQ_API_KEY missing");

      const userPrompt = buildUserPrompt(input);
      const res = await fetch(GROQ_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          model: DEFAULT_MODEL,
          temperature: 0.2,
          response_format: { type: "json_object" },
          messages: [
            { role: "system", content: ANALYZE_SYSTEM_PROMPT + "\n\n" + SCHEMA_HINT },
            { role: "user", content: userPrompt },
          ],
        }),
      });

      if (!res.ok) {
        const body = await res.text();
        throw new Error(`Groq ${res.status}: ${body.slice(0, 240)}`);
      }
      const json = await res.json();
      const text: string | undefined = json?.choices?.[0]?.message?.content;
      if (!text) throw new Error("Groq returned no content");

      const parsed = safeJsonParse(text);
      return {
        summary: String(parsed.summary || ""),
        newSkills: (parsed.newSkills || []).map((s: any) => ({ kind: "new", ...s })),
        upgradedSkills: (parsed.upgradedSkills || []).map((s: any) => ({ kind: "upgrade", ...s })),
        ignored: parsed.ignored || [],
      };
    },
  };
}

const SCHEMA_HINT = `Return ONLY a JSON object with this exact shape:
{
  "summary": string,
  "newSkills": [
    { "name": string, "emoji": string, "category": "Life"|"Code"|"Study"|"Body"|"Practice"|"Social"|"Work", "description": string, "evidence": string, "confidence": number }
  ],
  "upgradedSkills": [
    { "skillId": string, "name": string, "emoji": string, "levelBefore": number, "levelAfter": number, "evidence": string, "reason": string, "confidence": number }
  ],
  "ignored": [ { "text": string, "reason": string } ]
}`;

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

Return JSON exactly matching the schema. Reuse skillId values from the list above for upgrades. If nothing meaningful happened, return empty arrays.`;
}

function safeJsonParse(text: string): any {
  try {
    return JSON.parse(text);
  } catch {
    const match = text.match(/\{[\s\S]*\}/);
    if (match) return JSON.parse(match[0]);
    throw new Error("Groq response was not valid JSON");
  }
}
