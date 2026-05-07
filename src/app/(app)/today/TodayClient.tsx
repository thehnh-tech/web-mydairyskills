"use client";
import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { ChevronLeft, ChevronRight, Sparkles, ShieldCheck, PenLine } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { StatusPill } from "@/components/app/StatusPill";
import { DiaryEditor } from "@/components/app/DiaryEditor";
import { AIReviewModal } from "@/components/app/AIReviewModal";
import { formatLong, shiftDateKey, wordCount } from "@mds/shared";

type Props = {
  dateKey: string;
  initialContent: string;
  initialAnalyzed: boolean;
  aiEnabled: boolean;
  totalSkills: number;
};

export function TodayClient({ dateKey, initialContent, initialAnalyzed, aiEnabled, totalSkills }: Props) {
  const [content, setContent] = useState(initialContent);
  const [status, setStatus] = useState<"saved" | "saving" | "offline">("saved");
  const [analyzed, setAnalyzed] = useState(initialAnalyzed);
  const [analyzing, setAnalyzing] = useState(false);
  const [suggestion, setSuggestion] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const debounceRef = useRef<NodeJS.Timeout | null>(null);

  const save = useCallback(
    async (next: string) => {
      setStatus("saving");
      try {
        const res = await fetch(`/api/diary/${dateKey}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ content: next }),
        });
        setStatus(res.ok ? "saved" : "offline");
      } catch {
        setStatus("offline");
      }
    },
    [dateKey]
  );

  function onChange(v: string) {
    setContent(v);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    setStatus("saving");
    debounceRef.current = setTimeout(() => save(v), 800);
  }

  useEffect(() => () => { if (debounceRef.current) clearTimeout(debounceRef.current); }, []);

  async function analyze() {
    setError(null);
    if (!aiEnabled) {
      setError("AI analysis is disabled. Enable it in Settings → AI.");
      return;
    }
    if (debounceRef.current) clearTimeout(debounceRef.current);
    await save(content);
    setAnalyzing(true);
    const res = await fetch("/api/ai/analyze", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ dateKey }),
    });
    setAnalyzing(false);
    const data = await res.json();
    if (!res.ok) {
      setError(data.error || "Analysis failed");
      return;
    }
    setSuggestion(data);
  }

  const wc = wordCount(content);

  return (
    <div className="flex h-full flex-col overflow-hidden">
      <header className="flex shrink-0 items-center justify-between border-b border-border bg-background px-4 sm:px-6 py-3">
        <div className="flex items-center gap-1.5 sm:gap-2">
          <Link href={`/d/${shiftDateKey(dateKey, -1)}`}>
            <Button variant="ghost" size="icon"><ChevronLeft size={16} /></Button>
          </Link>
          <Link href={`/d/${shiftDateKey(dateKey, 1)}`}>
            <Button variant="ghost" size="icon"><ChevronRight size={16} /></Button>
          </Link>
          <Badge variant="solid">Today</Badge>
        </div>
        <div className="flex items-center gap-2">
          <StatusPill state={analyzed ? "complete" : status === "saving" ? "saving" : status === "offline" ? "offline" : "saved"} />
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden flex-col lg:flex-row">
        <div className="scroll flex-1 overflow-auto px-5 sm:px-8 lg:px-14 pt-6 sm:pt-8 pb-14">
          <motion.div
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.25, ease: "easeOut" }}
            className="mx-auto max-w-[720px]"
          >
            <div className="mb-1.5 flex items-baseline justify-between gap-4 flex-wrap">
              <h1 className="text-[22px] sm:text-[28px] font-semibold leading-tight tracking-tight">
                {formatLong(dateKey)}
              </h1>
              <Badge><PenLine size={11} /> Editable today</Badge>
            </div>
            <div className="mb-6 text-[13px] text-muted-foreground">
              You're writing today's page. It locks at midnight in your timezone.
            </div>

            <DiaryEditor value={content} onChange={onChange} />

            <div className="mt-6 flex flex-wrap items-center gap-2.5 border-t border-border pt-4">
              <motion.div whileTap={{ scale: 0.97 }}>
                <Button onClick={analyze} disabled={analyzing || content.trim().length < 20}>
                  <Sparkles size={14} /> {analyzing ? "Analyzing…" : "Analyze today"}
                </Button>
              </motion.div>
              <span className="text-[12.5px] text-muted-foreground">
                {wc} words · {status === "saved" ? "saved" : status === "saving" ? "saving…" : "will sync"}
              </span>
              <span className="ml-auto text-[12px] text-muted-foreground">
                {!aiEnabled && (
                  <Link href="/settings" className="text-chart-3 hover:underline">
                    Turn AI back on →
                  </Link>
                )}
              </span>
            </div>

            {error && (
              <motion.div
                initial={{ opacity: 0, y: -4 }}
                animate={{ opacity: 1, y: 0 }}
                className="mt-3 rounded-md border border-destructive/30 bg-destructive/5 p-3 text-[13px] text-destructive"
              >
                {error}
              </motion.div>
            )}
          </motion.div>
        </div>

        <aside className="scroll w-full lg:w-[304px] shrink-0 overflow-auto border-t lg:border-t-0 lg:border-l border-border bg-background py-6" style={{ paddingLeft: 18, paddingRight: 18 }}>
          <SectionLabel>At a glance</SectionLabel>
          <div className="mb-3.5 rounded-[var(--radius)] border border-border bg-card p-3.5">
            <div className="grid grid-cols-2 gap-3">
              <Stat label="Words today" value={String(wc)} sub="goal 200" />
              <Stat label="Total skills" value={String(totalSkills)} sub="across categories" />
            </div>
          </div>

          <SectionLabel>{analyzed ? "Today's detected skills" : "Today's skills"}</SectionLabel>
          {!analyzed ? (
            <div className="rounded-[var(--radius)] border border-border bg-card p-4 text-center">
              <div className="mx-auto mb-2.5 grid h-9 w-9 place-items-center rounded-full bg-muted text-muted-foreground">
                <Sparkles size={16} />
              </div>
              <div className="text-[13px] font-medium">No analysis yet</div>
              <div className="mt-1 text-[12px] leading-relaxed text-muted-foreground">
                When you're done writing, run AI analysis to see what skills today added.
              </div>
            </div>
          ) : (
            <div className="rounded-[var(--radius)] border border-border bg-card p-4 text-[13px] text-muted-foreground">
              Today's skills are recorded in <Link href="/skills" className="text-chart-3 hover:underline">Skills</Link>.
            </div>
          )}

          <div style={{ height: 18 }} />
          <SectionLabel>Privacy</SectionLabel>
          <div className="rounded-[var(--radius)] border border-border bg-card p-3 text-[12px] leading-snug text-muted-foreground">
            <div className="flex gap-2.5">
              <ShieldCheck size={14} className="mt-0.5 shrink-0 text-chart-3" />
              <div>
                Your diary is private. Running analysis sends today's text to the AI provider you chose.{" "}
                <Link href="/settings" className="text-chart-3 hover:underline">Manage</Link>
              </div>
            </div>
          </div>
        </aside>
      </div>

      <AIReviewModal
        suggestion={suggestion}
        open={!!suggestion}
        onClose={() => setSuggestion(null)}
        onAccepted={() => setAnalyzed(true)}
      />
    </div>
  );
}

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <div className="mb-2 px-0.5 text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
      {children}
    </div>
  );
}

function Stat({ label, value, sub }: { label: string; value: string; sub: string }) {
  return (
    <div>
      <div className="mb-1 text-[11px] font-medium uppercase tracking-wide text-muted-foreground">{label}</div>
      <div className="text-[22px] font-semibold leading-none tracking-tight">{value}</div>
      <div className="mt-0.5 text-[11px] text-muted-foreground">{sub}</div>
    </div>
  );
}
