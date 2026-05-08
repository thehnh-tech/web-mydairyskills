"use client";
import Link from "next/link";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { BookOpen, Sparkles, Lock, Calendar } from "lucide-react";

export function LandingPageClient() {
  return (
    <main className="min-h-screen bg-background text-foreground overflow-x-hidden">
      <header className="mx-auto flex max-w-6xl items-center justify-between px-5 sm:px-6 py-5">
        <div className="flex items-center gap-2">
          <div className="grid h-7 w-7 place-items-center rounded-md bg-primary text-primary-foreground">
            <BookOpen size={14} />
          </div>
          <span className="text-sm font-semibold tracking-tight">MyDiarySkills</span>
        </div>
        <nav className="flex items-center gap-2">
          <Button variant="ghost" size="sm" asChild>
            <Link href="/auth/signin">Sign in</Link>
          </Button>
          <Button size="sm" asChild>
            <Link href="/auth/signup">Start writing</Link>
          </Button>
        </nav>
      </header>

      <section className="mx-auto max-w-3xl px-5 sm:px-6 pt-12 sm:pt-20 pb-16 sm:pb-24 text-center">
        <motion.span
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, ease: "easeOut" }}
          className="inline-flex items-center gap-1.5 rounded-full border border-border bg-background px-2.5 py-1 text-[11.5px] font-medium text-muted-foreground"
        >
          <Sparkles size={12} className="text-chart-3" /> Private. Always.
        </motion.span>
        <motion.h1
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35, delay: 0.04, ease: "easeOut" }}
          className="mt-5 text-4xl sm:text-5xl font-semibold tracking-tight leading-[1.05]"
        >
          Write your day.
          <br />
          <span className="text-muted-foreground">Discover your skills.</span>
        </motion.h1>
        <motion.p
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35, delay: 0.08, ease: "easeOut" }}
          className="mx-auto mt-5 max-w-xl text-[15px] leading-relaxed text-muted-foreground"
        >
          One page per day. Today is editable, yesterday is read-only, tomorrow is locked.
          Tap Analyze when you're ready — the AI spots what's worth tracking, you validate it.
        </motion.p>
        <motion.div
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35, delay: 0.12, ease: "easeOut" }}
          className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3"
        >
          <Button size="lg" asChild className="w-full sm:w-auto">
            <Link href="/auth/signup">Get started ✨</Link>
          </Button>
          <Button size="lg" variant="outline" asChild className="w-full sm:w-auto">
            <Link href="/auth/signin">I already have an account</Link>
          </Button>
        </motion.div>
      </section>

      <section className="mx-auto grid max-w-5xl gap-4 px-5 sm:px-6 pb-24 sm:grid-cols-2 md:grid-cols-3">
        <Feature
          delay={0.16}
          icon={<BookOpen size={16} />}
          title="One page. One day."
          body="No infinite scroll, no folder system. Just today, with yesterday a click away."
        />
        <Feature
          delay={0.2}
          icon={<Calendar size={16} />}
          title="Locked at midnight"
          body="Yesterday becomes read-only — what you wrote, you wrote. No retroactive edits."
        />
        <Feature
          delay={0.24}
          icon={<Lock size={16} />}
          title="You validate every skill"
          body="The AI proposes, you decide. No skill updates without your explicit OK."
        />
      </section>

      <footer className="border-t border-border">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-5 sm:px-6 py-6 text-xs text-muted-foreground">
          <span>© MyDiarySkills</span>
          <span>Private diary · skills as a side-effect</span>
        </div>
      </footer>
    </main>
  );
}

function Feature({
  icon,
  title,
  body,
  delay,
}: {
  icon: React.ReactNode;
  title: string;
  body: string;
  delay: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, delay, ease: "easeOut" }}
      whileHover={{ y: -2 }}
      className="rounded-[var(--radius)] border border-border bg-card p-5 transition-shadow hover:shadow-sm"
    >
      <div className="grid h-8 w-8 place-items-center rounded-md bg-muted text-foreground">
        {icon}
      </div>
      <h3 className="mt-3 text-sm font-semibold">{title}</h3>
      <p className="mt-1.5 text-[13px] leading-relaxed text-muted-foreground">{body}</p>
    </motion.div>
  );
}
