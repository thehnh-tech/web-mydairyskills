"use client";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Check, Sparkles } from "lucide-react";

type UpdatedSkill = {
  id?: string;
  name: string;
  emoji: string;
  category?: string;
  description?: string;
  level?: number;
  levelBefore?: number;
  evidence?: string;
  reason?: string;
};

type Suggestion = {
  provider: string;
  summary: string;
  newSkills: UpdatedSkill[];
  upgradedSkills: UpdatedSkill[];
  createdCount?: number;
  upgradedCount?: number;
};

export function SkillsUpdatedModal({
  suggestion,
  open,
  onClose,
}: {
  suggestion: Suggestion | null;
  open: boolean;
  onClose: () => void;
}) {
  if (!suggestion) return null;

  const changed = (suggestion.createdCount || 0) + (suggestion.upgradedCount || 0);

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Sparkles size={16} className="text-chart-3" />
            Skills updated
          </DialogTitle>
          <DialogDescription>
            <span className="text-[12px] text-muted-foreground">
              AI used: <span className="font-mono">{suggestion.provider}</span>
            </span>
          </DialogDescription>
        </DialogHeader>

        <div className="max-h-[58vh] overflow-auto px-5 pb-2 scroll">
          <div className="rounded-md border border-border bg-muted/40 p-3 text-[13px] leading-relaxed">
            <span className="font-medium">Summary: </span>
            <span className="text-muted-foreground">{suggestion.summary || "Skills checked for today."}</span>
          </div>

          {suggestion.upgradedSkills.length > 0 && (
            <Section title="Leveled up">
              {suggestion.upgradedSkills.map((skill, i) => (
                <SkillCard
                  key={`${skill.id || skill.name}-up-${i}`}
                  skill={skill}
                  meta={
                    skill.levelBefore && skill.level
                      ? <>Lv {skill.levelBefore} {"->"} <span className="font-semibold">{skill.level}</span></>
                      : undefined
                  }
                />
              ))}
            </Section>
          )}

          {suggestion.newSkills.length > 0 && (
            <Section title="New skills">
              {suggestion.newSkills.map((skill, i) => (
                <SkillCard
                  key={`${skill.id || skill.name}-new-${i}`}
                  skill={skill}
                  meta={skill.category ? <Badge variant="blue">{skill.category}</Badge> : undefined}
                />
              ))}
            </Section>
          )}

          {changed === 0 && (
            <div className="mt-4 rounded-md border border-border p-5 text-center text-[13px] text-muted-foreground">
              No skill changed today.
            </div>
          )}
        </div>

        <div className="flex justify-end border-t border-border p-4">
          <Button size="sm" onClick={onClose}>
            <Check size={14} /> Done
          </Button>
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

function SkillCard({ skill, meta }: { skill: UpdatedSkill; meta?: React.ReactNode }) {
  return (
    <div className="rounded-[var(--radius)] border border-border bg-card p-3.5">
      <div className="flex items-start gap-3">
        <div className="grid h-10 w-10 shrink-0 place-items-center rounded-md bg-muted text-xl">{skill.emoji}</div>
        <div className="min-w-0 flex-1">
          <div className="flex items-center justify-between gap-2">
            <div className="truncate text-[14px] font-semibold">{skill.name}</div>
            {meta && <div className="flex shrink-0 items-center gap-2 text-[11px] text-muted-foreground">{meta}</div>}
          </div>
          {skill.evidence && (
            <div className="mt-1.5 text-[12.5px] italic text-muted-foreground">"{skill.evidence}"</div>
          )}
          {(skill.reason || skill.description) && (
            <div className="mt-1 text-[12.5px] text-foreground/80">{skill.reason || skill.description}</div>
          )}
        </div>
      </div>
    </div>
  );
}
