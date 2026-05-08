import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Delete your account",
  description:
    "How to delete your MyDiarySkills account and the data we erase or keep, with retention timelines.",
  alternates: {
    canonical: "/delete-account",
  },
};

const LAST_UPDATED = "May 8, 2026";
const CONTACT_EMAIL = "support@thehnh.tech";
const APP_NAME = "MyDiarySkills";
const PUBLISHER = "thehnh-tech";

export default function DeleteAccountPage() {
  const mailtoSubject = encodeURIComponent("Account deletion request — MyDiarySkills");
  const mailtoBody = encodeURIComponent(
    [
      "Hello,",
      "",
      "Please delete my MyDiarySkills account and all associated data.",
      "",
      "Account email: <write the email you signed up with>",
      "",
      "I confirm I am the owner of this account.",
      "",
      "Thanks.",
    ].join("\n")
  );
  const mailto = `mailto:${CONTACT_EMAIL}?subject=${mailtoSubject}&body=${mailtoBody}`;

  return (
    <main className="min-h-screen bg-background text-foreground">
      <article className="mx-auto max-w-3xl px-5 py-12 sm:px-6">
        <Link href="/" className="text-sm text-muted-foreground hover:text-foreground">
          ← {APP_NAME}
        </Link>
        <h1 className="mt-6 text-3xl font-semibold tracking-tight">
          Delete your account and data
        </h1>
        <p className="mt-3 text-sm text-muted-foreground">
          {APP_NAME} · published by {PUBLISHER}. Last updated: {LAST_UPDATED}
        </p>

        <p className="mt-6 text-[14px] leading-relaxed text-muted-foreground">
          You can delete your {APP_NAME} account and the data tied to it at any time. This page
          describes both the in-app self-serve route and an email request route in case you
          can&apos;t sign in.
        </p>

        {/* Method 1 — self serve */}
        <section className="mt-10 rounded-[var(--radius)] border border-border bg-card p-5">
          <h2 className="text-base font-semibold text-foreground">
            Option 1 — Delete from the app (recommended)
          </h2>
          <ol className="mt-4 list-decimal space-y-2 pl-5 text-[14px] leading-relaxed text-muted-foreground">
            <li>
              Open the {APP_NAME} app or visit{" "}
              <Link href="/auth/signin" className="text-chart-3 hover:underline">
                the web app
              </Link>{" "}
              and sign in.
            </li>
            <li>
              Go to <strong className="text-foreground">Settings → Privacy</strong>.
            </li>
            <li>
              Tap{" "}
              <strong className="text-foreground">Delete account</strong>, then confirm{" "}
              <strong className="text-foreground">Delete forever</strong>.
            </li>
            <li>
              Your account and associated data are removed from our database immediately. Encrypted
              backups rotate within 35 days.
            </li>
          </ol>
        </section>

        {/* Method 2 — email */}
        <section className="mt-6 rounded-[var(--radius)] border border-border bg-card p-5">
          <h2 className="text-base font-semibold text-foreground">
            Option 2 — Email request (if you can&apos;t sign in)
          </h2>
          <p className="mt-3 text-[14px] leading-relaxed text-muted-foreground">
            If you&apos;ve lost access to your account, send a deletion request from the email
            address you signed up with. We will verify ownership and delete the account within{" "}
            <strong className="text-foreground">7 business days</strong>, then confirm by reply.
          </p>
          <div className="mt-4 flex flex-wrap items-center gap-3">
            <a
              href={mailto}
              className="inline-flex h-10 items-center rounded-[var(--radius)] bg-primary px-4 text-[13.5px] font-medium text-primary-foreground transition-colors hover:bg-black"
            >
              Email a deletion request
            </a>
            <span className="text-[13px] text-muted-foreground">
              or write to{" "}
              <a className="text-chart-3 hover:underline" href={`mailto:${CONTACT_EMAIL}`}>
                {CONTACT_EMAIL}
              </a>
            </span>
          </div>
          <p className="mt-3 text-[12.5px] text-muted-foreground">
            Include the subject &quot;Account deletion request — {APP_NAME}&quot; and the email you
            used to sign up. The button above pre-fills both for you.
          </p>
        </section>

        {/* What gets deleted vs kept */}
        <section className="mt-10">
          <h2 className="text-base font-semibold text-foreground">What gets deleted</h2>
          <p className="mt-2 text-[14px] leading-relaxed text-muted-foreground">
            When you delete your account, we permanently erase the following from our active
            database:
          </p>
          <ul className="mt-3 list-disc space-y-1.5 pl-5 text-[14px] leading-relaxed text-muted-foreground">
            <li>Your account record (email, hashed password, name, timezone).</li>
            <li>All your diary entries and associated metadata.</li>
            <li>All your skills, levels, progress, and descriptions.</li>
            <li>All AI suggestion history attached to your account.</li>
            <li>Your active session cookie, immediately on next request.</li>
          </ul>
        </section>

        <section className="mt-10">
          <h2 className="text-base font-semibold text-foreground">What we may keep, and for how long</h2>
          <p className="mt-2 text-[14px] leading-relaxed text-muted-foreground">
            For security, anti-abuse, and legal compliance, the following may persist for a limited
            time after deletion:
          </p>
          <ul className="mt-3 list-disc space-y-2 pl-5 text-[14px] leading-relaxed text-muted-foreground">
            <li>
              <strong className="text-foreground">Encrypted database backups:</strong> rotated and
              fully overwritten within <strong className="text-foreground">35 days</strong>. Once a
              backup ages out, your data is gone from there too.
            </li>
            <li>
              <strong className="text-foreground">Server access logs:</strong> request timestamps,
              IPs, user agents — kept for at most{" "}
              <strong className="text-foreground">14 days</strong> for security and abuse
              investigation.
            </li>
            <li>
              <strong className="text-foreground">Deletion record:</strong> a minimal audit record
              (deletion timestamp + email hash) may be kept for up to{" "}
              <strong className="text-foreground">12 months</strong> to handle deletion disputes
              and prevent reuse of the account email immediately.
            </li>
          </ul>
          <p className="mt-3 text-[14px] leading-relaxed text-muted-foreground">
            We do not retain your diary content, skills, or AI suggestions in any form beyond the
            backup rotation window above. We do not transfer them out of our active systems before
            erasure.
          </p>
        </section>

        <section className="mt-10">
          <h2 className="text-base font-semibold text-foreground">Before you delete</h2>
          <p className="mt-2 text-[14px] leading-relaxed text-muted-foreground">
            If you want a copy of your diary first, sign in and go to{" "}
            <strong className="text-foreground">Settings → Privacy → Export everything (JSON)</strong>
            . The export includes your entries, skills, and suggestions in a single JSON file you
            can keep locally.
          </p>
        </section>

        <section className="mt-10">
          <h2 className="text-base font-semibold text-foreground">Related</h2>
          <ul className="mt-3 list-disc space-y-1.5 pl-5 text-[14px] leading-relaxed text-muted-foreground">
            <li>
              <Link href="/privacy" className="text-chart-3 hover:underline">Privacy Policy</Link>
            </li>
            <li>
              <Link href="/terms" className="text-chart-3 hover:underline">Terms of Use</Link>
            </li>
          </ul>
        </section>

        <p className="mt-12 text-[12.5px] text-muted-foreground">
          Questions or trouble deleting? Email{" "}
          <a className="text-chart-3 hover:underline" href={`mailto:${CONTACT_EMAIL}`}>
            {CONTACT_EMAIL}
          </a>
          .
        </p>
      </article>
    </main>
  );
}
