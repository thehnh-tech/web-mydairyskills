import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Terms of Use",
  description: "Terms for using MyDiarySkills.",
  alternates: {
    canonical: "/terms",
  },
};

export default function TermsPage() {
  return (
    <main className="min-h-screen bg-background text-foreground">
      <article className="mx-auto max-w-3xl px-5 py-12 sm:px-6">
        <Link href="/" className="text-sm text-muted-foreground hover:text-foreground">
          MyDiarySkills
        </Link>
        <h1 className="mt-6 text-3xl font-semibold tracking-tight">Terms of Use</h1>
        <p className="mt-3 text-sm text-muted-foreground">Last updated: May 8, 2026</p>

        <div className="mt-8 space-y-7 text-sm leading-7 text-muted-foreground">
          <section>
            <h2 className="text-base font-semibold text-foreground">Use of the service</h2>
            <p className="mt-2">
              MyDiarySkills is a private diary and skill tracking tool. You are responsible
              for the content you write and for keeping your login credentials secure.
            </p>
          </section>

          <section>
            <h2 className="text-base font-semibold text-foreground">AI suggestions</h2>
            <p className="mt-2">
              AI analysis can make mistakes. Skill suggestions are informational and are only
              saved when you review and accept them.
            </p>
          </section>

          <section>
            <h2 className="text-base font-semibold text-foreground">Availability</h2>
            <p className="mt-2">
              The service is provided as-is. Features may change over time, and temporary
              interruptions can happen during maintenance or provider outages.
            </p>
          </section>

          <section>
            <h2 className="text-base font-semibold text-foreground">Account deletion</h2>
            <p className="mt-2">
              You can delete your account from settings. Deletion removes your account data,
              diary entries, skills, and AI suggestions from the database.
            </p>
          </section>
        </div>
      </article>
    </main>
  );
}
