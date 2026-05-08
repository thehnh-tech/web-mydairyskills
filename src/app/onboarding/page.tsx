"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";

const STEPS = [
  {
    emoji: "📓",
    title: "One page. One day. That's it.",
    body: "No feed, no notifications, no pressure. Just write what happened today — tomorrow gets a fresh page of its own.",
  },
  {
    emoji: "🔒",
    title: "It locks at midnight",
    body: "Yesterday is frozen. You can read it back, but you can't rewrite it. That's what makes the diary trustworthy over time.",
  },
  {
    emoji: "✨",
    title: "AI catches your vibes",
    body: "When you tap Analyze, the AI reads your page and proposes skills it noticed. You decide what's real — no skill moves without your OK.",
  },
  {
    emoji: "🛡️",
    title: "Your diary, your property",
    body: "Everything is private. Export to JSON or wipe your account in one click. No feed, no sharing, no leaderboard — just you and your pages.",
  },
];

export default function OnboardingPage() {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const Step = STEPS[step];

  async function next() {
    if (step < STEPS.length - 1) {
      setStep(step + 1);
      return;
    }
    setSubmitting(true);
    await fetch("/api/onboarding/complete", { method: "POST" });
    router.push("/today");
  }

  return (
    <main className="min-h-screen grid place-items-center px-5 sm:px-6">
      <div className="w-full max-w-md">
        <div className="flex items-center justify-between text-[11px] uppercase tracking-wide text-muted-foreground">
          <span>Step {step + 1} of {STEPS.length}</span>
          <button
            onClick={() => router.push("/today")}
            className="hover:text-foreground transition-colors"
          >
            Skip →
          </button>
        </div>

        <div className="mt-6 overflow-hidden rounded-[var(--radius)] border border-border bg-card">
          <AnimatePresence mode="wait">
            <motion.div
              key={step}
              initial={{ opacity: 0, x: 24 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -24 }}
              transition={{ duration: 0.25, ease: "easeOut" }}
              className="p-7"
            >
              <div className="text-4xl">{Step.emoji}</div>
              <h1 className="mt-4 text-[22px] font-semibold tracking-tight leading-tight">{Step.title}</h1>
              <p className="mt-2.5 text-[14.5px] leading-relaxed text-muted-foreground">{Step.body}</p>
            </motion.div>
          </AnimatePresence>
        </div>

        <div className="mt-5 flex items-center justify-between gap-3">
          <div className="flex gap-1.5">
            {STEPS.map((_, i) => (
              <motion.span
                key={i}
                animate={{
                  width: i === step ? 28 : 8,
                  backgroundColor: i <= step ? "var(--primary)" : "var(--muted)",
                }}
                transition={{ duration: 0.25 }}
                className="h-1.5 rounded-full"
              />
            ))}
          </div>
          <div className="flex gap-2">
            {step > 0 && (
              <Button variant="outline" size="sm" onClick={() => setStep(step - 1)}>
                Back
              </Button>
            )}
            <Button size="sm" onClick={next} disabled={submitting}>
              {step === STEPS.length - 1 ? (submitting ? "Loading…" : "Let's go ✨") : "Next"}
            </Button>
          </div>
        </div>
      </div>
    </main>
  );
}
