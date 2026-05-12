"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ArrowRight, BookOpen, Smartphone } from "lucide-react";

const IOS_APP_URL = "https://apps.apple.com/ch/app/mydiaryskills/id6767645628?l=en-GB";

export default function SignupPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [created, setCreated] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    const tz = Intl.DateTimeFormat().resolvedOptions().timeZone || "UTC";
    const res = await fetch("/api/auth/signup", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password, name, timezone: tz }),
    });
    const data = await res.json();
    setLoading(false);
    if (!res.ok) {
      setError(data.error || "Could not sign up");
      return;
    }
    setCreated(true);
  }

  return (
    <main className="min-h-screen grid place-items-center px-6">
      <div className="w-full max-w-sm">
        <Link href="/" className="mb-6 flex items-center gap-2 text-sm font-semibold">
          <span className="grid h-7 w-7 place-items-center rounded-md bg-primary text-primary-foreground">
            <BookOpen size={14} />
          </span>
          MyDiarySkills
        </Link>
        <h1 className="text-2xl font-semibold tracking-tight">Create your diary</h1>
        <p className="mt-1.5 text-[13px] text-muted-foreground">
          One page per day. Yours, private by default.
        </p>

        {created ? (
          <div className="mt-6 rounded-md border border-border bg-card p-4">
            <div className="inline-flex h-9 w-9 items-center justify-center rounded-md bg-chart-3 text-white">
              <Smartphone size={17} />
            </div>
            <h2 className="mt-4 text-lg font-semibold tracking-tight">Account created</h2>
            <p className="mt-2 text-[13px] leading-6 text-muted-foreground">
              Your account is ready. Open MyDiarySkills on iOS, then sign in with{" "}
              <span className="font-medium text-foreground">{email}</span>.
            </p>
            <div className="mt-4 grid gap-2">
              <Button asChild className="w-full">
                <a href={IOS_APP_URL}>
                  <Smartphone size={15} />
                  Open iOS app
                </a>
              </Button>
              <Button
                type="button"
                variant="outline"
                className="w-full"
                onClick={() => router.push("/onboarding")}
              >
                Continue on web
                <ArrowRight size={15} />
              </Button>
            </div>
          </div>
        ) : (
          <>
            <form onSubmit={onSubmit} className="mt-6 space-y-3">
              <Input placeholder="Name (optional)" value={name} onChange={(e) => setName(e.target.value)} />
              <Input type="email" required placeholder="you@example.com" value={email} onChange={(e) => setEmail(e.target.value)} />
              <Input type="password" required minLength={8} placeholder="Password (min 8 chars)" value={password} onChange={(e) => setPassword(e.target.value)} />
              {error && <div className="text-[13px] text-destructive">{error}</div>}
              <Button type="submit" disabled={loading} className="w-full">
                {loading ? "Creating..." : "Start writing"}
              </Button>
            </form>

            <p className="mt-4 text-center text-[11.5px] leading-relaxed text-muted-foreground">
              By creating an account, you agree to our{" "}
              <Link href="/terms" className="text-chart-3 hover:underline">Terms of Use</Link>{" "}
              and{" "}
              <Link href="/privacy" className="text-chart-3 hover:underline">Privacy Policy</Link>.
            </p>

            <div className="mt-5 text-center text-[13px] text-muted-foreground">
              Already have an account?{" "}
              <Link href="/auth/signin" className="text-chart-3 hover:underline">
                Sign in
              </Link>
            </div>
          </>
        )}
      </div>
    </main>
  );
}
