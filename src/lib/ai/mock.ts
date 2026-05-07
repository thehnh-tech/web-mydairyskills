import type { AIProvider, AIAnalyzeInput, AIAnalyzeOutput } from "@mds/shared";

export function mockProvider(): AIProvider {
  return {
    name: "mock",
    async analyze({ content, existingSkills }: AIAnalyzeInput): Promise<AIAnalyzeOutput> {
      const text = content.toLowerCase();
      const upgrades: AIAnalyzeOutput["upgradedSkills"] = [];
      const news: AIAnalyzeOutput["newSkills"] = [];
      const ignored: AIAnalyzeOutput["ignored"] = [];

      const triggers: { match: RegExp; name: string; emoji: string; category: any; reason: string }[] = [
        { match: /\b(bug|fix(ed)?|test|refactor|deploy|pr review|pull request)\b/, name: "Bug Hunter", emoji: "🐛", category: "Code", reason: "Touched code maintenance work." },
        { match: /\b(cook(ed|ing)?|pasta|recipe|dinner|breakfast)\b/, name: "Home Chef", emoji: "🍝", category: "Life", reason: "Cooked something." },
        { match: /\b(stud(y|ied)|calculus|math|read(ing)?|chapter)\b/, name: "Calculus Grinder", emoji: "🧠", category: "Study", reason: "Sustained study session." },
        { match: /\b(ran|run(ning)?|jog|walk(ed)?|hike)\b/, name: "Morning Runner", emoji: "🏃", category: "Body", reason: "Moved the body." },
        { match: /\b(wrote|journal|diary|page)\b/, name: "Diary Devotee", emoji: "📖", category: "Practice", reason: "Showed up to the page." },
      ];

      for (const t of triggers) {
        const m = content.match(t.match);
        if (!m) continue;
        const evidence = sliceAround(content, m.index ?? 0, 120);
        const existing = existingSkills.find(
          (s) => s.name.toLowerCase() === t.name.toLowerCase()
        );
        if (existing) {
          upgrades.push({
            kind: "upgrade",
            skillId: existing.id,
            name: existing.name,
            emoji: existing.emoji,
            levelBefore: existing.level,
            levelAfter: existing.level + 1,
            evidence,
            reason: t.reason,
            confidence: 0.8,
          });
        } else {
          news.push({
            kind: "new",
            name: t.name,
            emoji: t.emoji,
            category: t.category,
            description: t.reason,
            evidence,
            confidence: 0.6,
          });
        }
      }

      if (text.includes("never doing that again") || text.includes("regret")) {
        ignored.push({
          text: "self-criticism in the entry",
          reason: "Self-criticism, not a skill.",
        });
      }

      return {
        summary: shortSummary(content) || "A day on the page.",
        newSkills: news,
        upgradedSkills: upgrades,
        ignored,
      };
    },
  };
}

function shortSummary(s: string): string {
  const firstLine = s.split("\n").map((l) => l.trim()).find(Boolean) || "";
  return firstLine.replace(/^#+\s*/, "").slice(0, 140);
}

function sliceAround(s: string, idx: number, span: number): string {
  const start = Math.max(0, idx - 20);
  const end = Math.min(s.length, idx + span);
  return s.slice(start, end).replace(/\s+/g, " ").trim();
}
