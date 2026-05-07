"use client";
import Link from "next/link";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { BookOpen, Sparkles, Lock, Calendar } from "lucide-react";

export default function LandingPage() {
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
          transition={{ duration: 0.4, ease: "easeOut" }}
          className="inline-flex items-center gap-1.5 rounded-full border border-border bg-background px-2.5 py-1 text-[11.5px] font-medium text-muted-foreground"
        >
          <Sparkles size={12} className="text-chart-3" /> Privé. Toujours.
        </motion.span>
        <motion.h1
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.05, ease: "easeOut" }}
          className="mt-5 text-4xl sm:text-5xl font-semibold tracking-tight leading-[1.05]"
        >
          Écris ta journée.
          <br />
          <span className="text-muted-foreground">Découvre tes skills.</span>
        </motion.h1>
        <motion.p
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1, ease: "easeOut" }}
          className="mx-auto mt-5 max-w-xl text-[15px] leading-relaxed text-muted-foreground"
        >
          Une page par jour. Aujourd'hui s'écrit, hier se relit, demain attend.
          Tap Analyze quand t'es prêt — l'IA repère ce qui mérite d'être tracké, toi tu valides.
        </motion.p>
        <motion.div
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.15, ease: "easeOut" }}
          className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3"
        >
          <Button size="lg" asChild className="w-full sm:w-auto">
            <Link href="/auth/signup">Commencer ✨</Link>
          </Button>
          <Button size="lg" variant="outline" asChild className="w-full sm:w-auto">
            <Link href="/auth/signin">J'ai déjà un compte</Link>
          </Button>
        </motion.div>
      </section>

      <section className="mx-auto grid max-w-5xl gap-4 px-5 sm:px-6 pb-24 sm:grid-cols-2 md:grid-cols-3">
        <Feature
          delay={0.2}
          icon={<BookOpen size={16} />}
          title="Une page. Un jour."
          body="Pas de scroll infini, pas de système de dossiers. Juste aujourd'hui, hier à un clic."
        />
        <Feature
          delay={0.25}
          icon={<Calendar size={16} />}
          title="Verrouillé à minuit"
          body="Hier devient read-only — ce que t'as écrit, t'as écrit. Aucun rewrite a posteriori."
        />
        <Feature
          delay={0.3}
          icon={<Lock size={16} />}
          title="Tu valides chaque skill"
          body="L'IA propose, tu décides. Aucune skill ne se met à jour sans ton OK explicite."
        />
      </section>

      <footer className="border-t border-border">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-5 sm:px-6 py-6 text-xs text-muted-foreground">
          <span>© MyDiarySkills</span>
          <span>Diary privé · skills en bonus</span>
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
      transition={{ duration: 0.45, delay, ease: "easeOut" }}
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
