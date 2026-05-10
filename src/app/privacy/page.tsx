import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description: "How MyDiarySkills handles diary data, account data, and optional AI analysis.",
  alternates: {
    canonical: "/privacy",
  },
};

const LAST_UPDATED = "May 8, 2026";
const CONTACT_EMAIL = "support@thehnh.tech";

export default function PrivacyPage() {
  return (
    <main className="min-h-screen bg-background text-foreground">
      <article className="mx-auto max-w-3xl px-5 py-12 sm:px-6">
        <Link href="/" className="text-sm text-muted-foreground hover:text-foreground">
          ← MyDiarySkills
        </Link>
        <h1 className="mt-6 text-3xl font-semibold tracking-tight">Privacy Policy</h1>
        <p className="mt-3 text-sm text-muted-foreground">Last updated: {LAST_UPDATED}</p>

        <div className="mt-8 space-y-8 text-sm leading-7 text-muted-foreground">
          <section>
            <p>
              MyDiarySkills (&quot;the app&quot;, &quot;we&quot;) is a private diary and skill tracking
              service. This policy describes what we collect, why, who we share it with, and the
              controls available to you. We try to keep this short and concrete — if anything is
              unclear, write to us at{" "}
              <a className="text-chart-3 hover:underline" href={`mailto:${CONTACT_EMAIL}`}>
                {CONTACT_EMAIL}
              </a>
              .
            </p>
          </section>

          <section>
            <h2 className="text-base font-semibold text-foreground">1. Data we collect</h2>
            <ul className="mt-3 space-y-2.5 list-disc pl-5">
              <li>
                <strong className="text-foreground">Account data:</strong> email, name (optional),
                timezone, password (stored only as a bcrypt hash — we never see your raw password).
              </li>
              <li>
                <strong className="text-foreground">Diary content:</strong> the text you write each
                day, stored encrypted at rest, plus metadata (date, word count, save timestamps,
                whether the day was analyzed).
              </li>
              <li>
                <strong className="text-foreground">Skills:</strong> skill names, emojis, levels,
                progress, and descriptions managed by the AI skill engine.
              </li>
              <li>
                <strong className="text-foreground">AI update history:</strong> raw AI skill updates
                attached to a date, kept so you can audit them. You can disable this in
                Settings → AI analysis (&quot;Retain analysis history&quot;).
              </li>
              <li>
                <strong className="text-foreground">Session cookie:</strong> an encrypted, HTTP-only
                cookie used to keep you signed in. It does not track you across other sites.
              </li>
              <li>
                <strong className="text-foreground">Server logs:</strong> standard request logs
                (timestamps, IPs, user agents) retained for up to 14 days for security and
                debugging. We do not run third-party analytics or advertising trackers.
              </li>
            </ul>
            <p className="mt-3">
              We do not collect: location, device contacts, photos, microphone or camera input,
              third-party advertising IDs, or biometric data.
            </p>
          </section>

          <section>
            <h2 className="text-base font-semibold text-foreground">2. How we use your data</h2>
            <ul className="mt-3 space-y-2 list-disc pl-5">
              <li>To provide the daily writing surface, calendar, skill dashboard, and export.</li>
              <li>To authenticate you and protect your account from unauthorized access.</li>
              <li>To send AI analysis requests, only when you tap Analyze.</li>
              <li>To respond to your support requests when you write to us.</li>
            </ul>
            <p className="mt-3">
              We do not sell, rent, or trade your data. We do not use your diary content to train
              AI models.
            </p>
          </section>

          <section>
            <h2 className="text-base font-semibold text-foreground">3. Third parties we share with</h2>
            <ul className="mt-3 space-y-2.5 list-disc pl-5">
              <li>
                <strong className="text-foreground">Google Gemini API.</strong> When you tap
                Analyze, that day&apos;s diary text is sent to Gemini to generate skill
                suggestions. If Gemini is overloaded or quota-limited, the request can fall back to
                Groq or local template suggestions. AI providers process the request to return a
                response; we do not use your diary content to train AI models. See{" "}
                <a
                  className="text-chart-3 hover:underline"
                  href="https://policies.google.com/privacy"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  policies.google.com/privacy
                </a>{" "}
                and{" "}
                <a
                  className="text-chart-3 hover:underline"
                  href="https://groq.com/privacy-policy/"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  groq.com/privacy-policy
                </a>
                .
              </li>
              <li>
                <strong className="text-foreground">MongoDB Atlas (MongoDB, Inc.)</strong> — hosts
                the database where your account, diary, skills, and suggestions are stored. See{" "}
                <a
                  className="text-chart-3 hover:underline"
                  href="https://www.mongodb.com/legal/privacy-policy"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  mongodb.com/legal/privacy-policy
                </a>
                .
              </li>
              <li>
                <strong className="text-foreground">Vercel, Inc.</strong> — runs the web app and API
                endpoints. Standard request logs are processed by Vercel. See{" "}
                <a
                  className="text-chart-3 hover:underline"
                  href="https://vercel.com/legal/privacy-policy"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  vercel.com/legal/privacy-policy
                </a>
                .
              </li>
            </ul>
            <p className="mt-3">
              We disclose data to law enforcement only when compelled by a valid legal request.
            </p>
          </section>

          <section>
            <h2 className="text-base font-semibold text-foreground">4. Where data is stored</h2>
            <p className="mt-2">
              Account, encrypted diary, skills and suggestion data are stored in MongoDB Atlas.
              The web app is served from Vercel&apos;s edge infrastructure. Your data may be
              processed in the United States and the European Union depending on the closest
              available region.
            </p>
          </section>

          <section>
            <h2 className="text-base font-semibold text-foreground">5. Retention and deletion</h2>
            <ul className="mt-3 space-y-2 list-disc pl-5">
              <li>Account data and diary content are kept for as long as your account exists.</li>
              <li>
                Sign in to Settings → Privacy and tap <em>Delete account</em>. This permanently
                erases your account, diary entries, skills, and AI suggestions from our database
                within 30 days. Backups are rotated within 35 days.
              </li>
              <li>
                You can also export everything as a JSON file at any time from Settings → Privacy.
              </li>
            </ul>
          </section>

          <section>
            <h2 className="text-base font-semibold text-foreground">6. Your rights</h2>
            <p className="mt-2">
              Depending on where you live (notably the EU/EEA, UK, Switzerland, and California), you
              may have rights to access, correct, export, restrict, or delete your personal data,
              and to object to processing. The export and delete features above already cover most
              of these. For anything else, write to{" "}
              <a className="text-chart-3 hover:underline" href={`mailto:${CONTACT_EMAIL}`}>
                {CONTACT_EMAIL}
              </a>
              .
            </p>
          </section>

          <section>
            <h2 className="text-base font-semibold text-foreground">7. Children</h2>
            <p className="mt-2">
              MyDiarySkills is not directed to children under 13 (or the equivalent minimum age in
              your jurisdiction). We do not knowingly collect data from children under 13. If you
              believe a child has signed up, please contact us and we will delete the account.
            </p>
          </section>

          <section>
            <h2 className="text-base font-semibold text-foreground">8. Security</h2>
            <p className="mt-2">
              Passwords are hashed with bcrypt. Diary text is encrypted before it is stored in
              MongoDB. Sessions use encrypted, HTTP-only, SameSite=Lax cookies. Database
              connections use TLS. No system is perfectly secure — please use a unique, strong
              password and contact us at once if you suspect your account has been compromised.
            </p>
          </section>

          <section>
            <h2 className="text-base font-semibold text-foreground">9. Changes to this policy</h2>
            <p className="mt-2">
              If we change this policy materially, we will update the &quot;Last updated&quot; date
              and, when appropriate, surface a notice in the app.
            </p>
          </section>

          <section>
            <h2 className="text-base font-semibold text-foreground">10. Contact</h2>
            <p className="mt-2">
              Questions, deletion requests, or store-review queries:{" "}
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
