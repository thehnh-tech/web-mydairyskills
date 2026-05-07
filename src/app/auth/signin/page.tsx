"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { BookOpen } from "lucide-react";

export default function SigninPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    const res = await fetch("/api/auth/signin", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });
    setLoading(false);
    if (!res.ok) {
      const data = await res.json();
      setError(data.error || "Could not sign in");
      return;
    }
    router.push("/today");
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
        <h1 className="text-2xl font-semibold tracking-tight">Welcome back</h1>
        <p className="mt-1.5 text-[13px] text-muted-foreground">
          Today's page is waiting.
        </p>

        <form onSubmit={onSubmit} className="mt-6 space-y-3">
          <Input type="email" required placeholder="you@example.com" value={email} onChange={(e) => setEmail(e.target.value)} />
          <Input type="password" required placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} />
          {error && <div className="text-[13px] text-destructive">{error}</div>}
          <Button type="submit" disabled={loading} className="w-full">
            {loading ? "Signing in…" : "Sign in"}
          </Button>
        </form>

        <div className="mt-5 text-center text-[13px] text-muted-foreground">
          New here?{" "}
          <Link href="/auth/signup" className="text-chart-3 hover:underline">
            Create your diary
          </Link>
        </div>
      </div>
    </main>
  );
}
