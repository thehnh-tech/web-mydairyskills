import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description: "How MyDiarySkills handles diary data, account data, and optional AI analysis.",
  alternates: {
    canonical: "/privacy",
  },
};

export default function PrivacyPage() {
  return (
    <main className="min-h-screen bg-background text-foreground">
      <article className="mx-auto max-w-3xl px-5 py-12 sm:px-6">
        <Link href="/" className="text-sm text-muted-foreground hover:text-foreground">
          MyDiarySkills
        </Link>
        <h1 className="mt-6 text-3xl font-semibold tracking-tight">Privacy Policy</h1>
        <p className="mt-3 text-sm text-muted-foreground">Last updated: May 8, 2026</p>

        <div className="mt-8 space-y-7 text-sm leading-7 text-muted-foreground">
          <section>
            <h2 className="text-base font-semibold text-foreground">What we collect</h2>
            <p className="mt-2">
              MyDiarySkills stores the account details needed to run the service, including
              your email address, password hash, optional name, timezone, diary entries,
              skills, and AI review suggestions.
            </p>
          </section>

          <section>
            <h2 className="text-base font-semibold text-foreground">How the diary works</h2>
            <p className="mt-2">
              Your diary content is used to provide the daily writing experience, calendar,
              skills dashboard, exports, and account features. Private diary pages are not
              indexed intentionally through the public sitemap.
            </p>
          </section>

          <section>
            <h2 className="text-base font-semibold text-foreground">AI analysis</h2>
            <p className="mt-2">
              AI analysis only runs when you request it. When enabled, the diary entry you
              choose to analyze may be sent to the configured AI provider so MyDiarySkills
              can suggest skills. Suggestions are not applied until you review and accept them.
            </p>
          </section>

          <section>
            <h2 className="text-base font-semibold text-foreground">Your controls</h2>
            <p className="mt-2">
              You can disable AI analysis, export your data, sign out, or delete your account
              from the app settings. Account deletion removes your account, diary entries,
              skills, and AI suggestions from the database.
            </p>
          </section>

          <section>
            <h2 className="text-base font-semibold text-foreground">Contact</h2>
            <p className="mt-2">
              For privacy requests or store review questions, contact the developer through
              the support email listed in App Store Connect or Google Play Console.
            </p>
          </section>
        </div>
      </article>
    </main>
  );
}
