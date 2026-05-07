"use client";
import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Check, X, Sparkles } from "lucide-react";

type Suggestion = {
  id: string;
  provider: string;
  summary: string;
  newSkills: {
    name: string; emoji: string; category: string; description: string; evidence: string; confidence: number;
  }[];
  upgradedSkills: {
    skillId: string; name: string; emoji: string; levelBefore: number; levelAfter: number; evidence: string; reason: string; confidence: number;
  }[];
  ignored: { text: string; reason: string }[];
};

export function AIReviewModal({
  suggestion,
  open,
  onClose,
  onAccepted,
}: {
  suggestion: Suggestion | null;
  open: boolean;
  onClose: () => void;
  onAccepted: () => void;
}) {
  const [acceptedNew, setAcceptedNew] = useState<Set<number>>(new Set());
  const [acceptedUpgrades, setAcceptedUpgrades] = useState<Set<number>>(new Set());
  const [busy, setBusy] = useState(false);

  if (!suggestion) return null;

  function toggle(set: Set<number>, setSet: (s: Set<number>) => void, i: number) {
    const next = new Set(set);
    if (next.has(i)) next.delete(i); else next.add(i);
    setSet(next);
  }

  async function applySelections() {
    if (!suggestion) return;
    setBusy(true);
    const body = {
      suggestionId: suggestion.id,
      acceptedNew: suggestion.newSkills
        .filter((_, i) => acceptedNew.has(i))
        .map((s) => ({ name: s.name, emoji: s.emoji, category: s.category, description: s.description })),
      acceptedUpgrades: suggestion.upgradedSkills
        .filter((_, i) => acceptedUpgrades.has(i))
        .map((s) => ({ skillId: s.skillId, levelAfter: s.levelAfter })),
    };
    const res = await fetch("/api/ai/review", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    setBusy(false);
    if (res.ok) {
      setAcceptedNew(new Set());
      setAcceptedUpgrades(new Set());
      onAccepted();
      onClose();
    }
  }

  async function rejectAll() {
    if (!suggestion) return;
    setBusy(true);
    await fetch("/api/ai/reject", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ suggestionId: suggestion.id }),
    });
    setBusy(false);
    onClose();
  }

  function acceptAll() {
    setAcceptedNew(new Set(suggestion!.newSkills.map((_, i) => i)));
    setAcceptedUpgrades(new Set(suggestion!.upgradedSkills.map((_, i) => i)));
  }

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-w-3xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Sparkles size={16} className="text-chart-3" />
            Today's analysis
          </DialogTitle>
          <DialogDescription>
            <span className="text-[12px] text-muted-foreground">
              Provider: <span className="font-mono">{suggestion.provider}</span> · Nothing
              is applied until you confirm.
            </span>
          </DialogDescription>
        </DialogHeader>

        <div className="max-h-[60vh] overflow-auto px-5 pb-2 scroll">
          <div className="rounded-md border border-border bg-muted/40 p-3 text-[13px] leading-relaxed">
            <span className="font-medium">Summary: </span>
            <span className="text-muted-foreground">{suggestion.summary || "—"}</span>
          </div>

          {suggestion.upgradedSkills.length > 0 && (
            <Section title="Upgrade existing skills">
              {suggestion.upgradedSkills.map((s, i) => (
                <ProposalCard
                  key={i}
                  emoji={s.emoji}
                  title={s.name}
                  meta={<>Lv {s.levelBefore} → <span className="font-semibold">{s.levelAfter}</span></>}
                  evidence={s.evidence}
                  reason={s.reason}
                  confidence={s.confidence}
                  selected={acceptedUpgrades.has(i)}
                  onToggle={() => toggle(acceptedUpgrades, setAcceptedUpgrades, i)}
                />
              ))}
            </Section>
          )}

          {suggestion.newSkills.length > 0 && (
            <Section title="New skills the AI noticed">
              {suggestion.newSkills.map((s, i) => (
                <ProposalCard
                  key={i}
                  emoji={s.emoji}
                  title={s.name}
                  meta={<Badge variant="blue">{s.category}</Badge>}
                  evidence={s.evidence}
                  reason={s.description}
                  confidence={s.confidence}
                  selected={acceptedNew.has(i)}
                  onToggle={() => toggle(acceptedNew, setAcceptedNew, i)}
                />
              ))}
            </Section>
          )}

          {suggestion.ignored.length > 0 && (
            <Section title="Things the AI deliberately ignored">
              {suggestion.ignored.map((it, i) => (
                <div key={i} className="rounded-md border border-dashed border-border p-3 text-[13px] text-muted-foreground">
                  <div className="italic">"{it.text}"</div>
                  <div className="mt-1 text-[12px]">{it.reason}</div>
                </div>
              ))}
            </Section>
          )}

          {suggestion.upgradedSkills.length === 0 && suggestion.newSkills.length === 0 && (
            <div className="mt-4 rounded-md border border-border p-6 text-center text-[13px] text-muted-foreground">
              The AI didn't find anything worth proposing today. That's fine — not every day is a level-up.
            </div>
          )}
        </div>

        <div className="flex items-center justify-between gap-2 border-t border-border p-4">
          <Button variant="ghost" size="sm" onClick={rejectAll} disabled={busy}>
            <X size={14} /> Reject all
          </Button>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={acceptAll} disabled={busy}>
              Select all
            </Button>
            <Button size="sm" onClick={applySelections} disabled={busy}>
              <Check size={14} /> Apply {acceptedNew.size + acceptedUpgrades.size > 0 ? `(${acceptedNew.size + acceptedUpgrades.size})` : ""}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="mt-4">
      <div className="mb-2 text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">{title}</div>
      <div className="flex flex-col gap-2">{children}</div>
    </div>
  );
}

function ProposalCard({
  emoji, title, meta, evidence, reason, confidence, selected, onToggle,
}: {
  emoji: string; title: string; meta: React.ReactNode;
  evidence: string; reason: string; confidence: number;
  selected: boolean; onToggle: () => void;
}) {
  return (
    <button
      onClick={onToggle}
      className={`w-full text-left rounded-[var(--radius)] border bg-card p-3.5 transition-colors ${
        selected ? "border-chart-3 ring-2 ring-chart-3/30" : "border-border hover:bg-muted/40"
      }`}
    >
      <div className="flex items-start gap-3">
        <div className="grid h-10 w-10 shrink-0 place-items-center rounded-md bg-muted text-xl">{emoji}</div>
        <div className="min-w-0 flex-1">
          <div className="flex items-center justify-between gap-2">
            <div className="text-[14px] font-semibold">{title}</div>
            <div className="flex items-center gap-2">
              <span className="text-[11px] text-muted-foreground">{Math.round(confidence * 100)}%</span>
              {meta}
            </div>
          </div>
          <div className="mt-1.5 text-[12.5px] italic text-muted-foreground">"{evidence}"</div>
          <div className="mt-1 text-[12.5px] text-foreground/80">{reason}</div>
        </div>
        <div
          className={`mt-1 grid h-5 w-5 place-items-center rounded-md border ${
            selected ? "border-chart-3 bg-chart-3 text-white" : "border-border bg-background"
          }`}
        >
          {selected && <Check size={12} />}
        </div>
      </div>
    </button>
  );
}
