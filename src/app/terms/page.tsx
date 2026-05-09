import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Terms of Use",
  description: "Terms governing your use of MyDiarySkills.",
  alternates: {
    canonical: "/terms",
  },
};

const LAST_UPDATED = "May 8, 2026";
const CONTACT_EMAIL = "support@thehnh.tech";

export default function TermsPage() {
  return (
    <main className="min-h-screen bg-background text-foreground">
      <article className="mx-auto max-w-3xl px-5 py-12 sm:px-6">
        <Link href="/" className="text-sm text-muted-foreground hover:text-foreground">
          ← MyDiarySkills
        </Link>
        <h1 className="mt-6 text-3xl font-semibold tracking-tight">Terms of Use</h1>
        <p className="mt-3 text-sm text-muted-foreground">Last updated: {LAST_UPDATED}</p>

        <div className="mt-8 space-y-8 text-sm leading-7 text-muted-foreground">
          <section>
            <p>
              These terms govern your use of MyDiarySkills (&quot;the app&quot;, &quot;the
              service&quot;, &quot;we&quot;). By creating an account or using the app, you agree to
              these terms and to our{" "}
              <Link href="/privacy" className="text-chart-3 hover:underline">
                Privacy Policy
              </Link>
              . If you disagree with any part, please don&apos;t use the service.
            </p>
          </section>

          <section>
            <h2 className="text-base font-semibold text-foreground">1. Eligibility</h2>
            <p className="mt-2">
              You must be at least 13 years old (or the minimum digital-consent age in your
              jurisdiction — 16 in much of the EEA) to create an account. If you&apos;re under that
              age, please don&apos;t sign up.
            </p>
          </section>

          <section>
            <h2 className="text-base font-semibold text-foreground">2. Your account</h2>
            <p className="mt-2">
              You are responsible for keeping your login credentials secure and for all activity
              that happens under your account. Tell us promptly at{" "}
              <a className="text-chart-3 hover:underline" href={`mailto:${CONTACT_EMAIL}`}>
                {CONTACT_EMAIL}
              </a>{" "}
              if you suspect unauthorized access.
            </p>
          </section>

          <section>
            <h2 className="text-base font-semibold text-foreground">3. Your content</h2>
            <p className="mt-2">
              Diary entries, skill names, descriptions, and any other text you create stay yours.
              You grant MyDiarySkills the limited permission needed to host, display back to you,
              process for AI analysis (only when you tap Analyze), back up, and export your
              content — strictly to operate the service for you. We don&apos;t use your diary to
              train AI models, advertise to you, or share with third parties beyond the providers
              listed in the Privacy Policy.
            </p>
          </section>

          <section>
            <h2 className="text-base font-semibold text-foreground">4. Acceptable use</h2>
            <p className="mt-2">You agree not to use the service to:</p>
            <ul className="mt-3 space-y-2 list-disc pl-5">
              <li>Break the law or infringe someone else&apos;s rights.</li>
              <li>Attack, probe, or attempt to gain unauthorized access to the service or other accounts.</li>
              <li>
                Reverse engineer, scrape at scale, abuse rate limits, or automate account creation.
              </li>
              <li>
                Upload content you don&apos;t have the right to share, including data of other
                people that they haven&apos;t consented to.
              </li>
            </ul>
          </section>

          <section>
            <h2 className="text-base font-semibold text-foreground">5. AI skill updates</h2>
            <p className="mt-2">
              AI analysis is optional and runs only when you tap Analyze on today&apos;s page. AI
              outputs are best-effort and may be inaccurate, biased, or incomplete. Skill
              updates are applied automatically by the AI after analysis. After running an
              analysis, today&apos;s page is locked to keep the diary trustworthy over time — you
              can disable AI analysis at any time in Settings.
            </p>
          </section>

          <section>
            <h2 className="text-base font-semibold text-foreground">6. Service availability</h2>
            <p className="mt-2">
              The service is provided &quot;as is&quot;. Features may change, be added, or be
              removed. Temporary interruptions can happen during maintenance, deploys, or upstream
              provider outages (Gemini, Groq, MongoDB, Vercel). We make reasonable efforts to keep the
              service running but offer no uptime guarantee.
            </p>
          </section>

          <section>
            <h2 className="text-base font-semibold text-foreground">7. Account deletion and termination</h2>
            <p className="mt-2">
              You can delete your account at any time from Settings → Privacy. We may suspend or
              terminate accounts that violate these terms or applicable law, after a reasonable
              attempt to notify you when feasible. On termination, your data is removed as
              described in the Privacy Policy.
            </p>
          </section>

          <section>
            <h2 className="text-base font-semibold text-foreground">8. Disclaimer and liability</h2>
            <p className="mt-2">
              MyDiarySkills is a personal journaling tool. It is not medical, legal, financial,
              psychological, or professional advice. To the fullest extent permitted by law, we
              disclaim implied warranties and are not liable for indirect, incidental, special, or
              consequential damages, or for any loss of data resulting from your use of the
              service. Some jurisdictions do not allow these limitations, in which case they apply
              only to the extent permitted.
            </p>
          </section>

          <section>
            <h2 className="text-base font-semibold text-foreground">9. Changes to these terms</h2>
            <p className="mt-2">
              We may update these terms from time to time. If a change is material, we&apos;ll
              update the &quot;Last updated&quot; date and surface a notice in the app when
              appropriate. Continued use of the service after a change means you accept the new
              terms.
            </p>
          </section>

          <section>
            <h2 className="text-base font-semibold text-foreground">10. Governing law</h2>
            <p className="mt-2">
              These terms are governed by the laws of Switzerland, without regard to conflict of
              laws principles. Mandatory consumer-protection laws of your country of residence
              still apply.
            </p>
          </section>

          <section>
            <h2 className="text-base font-semibold text-foreground">11. Contact</h2>
            <p className="mt-2">
              Questions about these terms:{" "}
              <a className="text-chart-3 hover:underline" href={`mailto:${CONTACT_EMAIL}`}>
                {CONTACT_EMAIL}
              </a>
              .
            </p>
          </section>
        </div>
      </article>
    </main>
  );
}
