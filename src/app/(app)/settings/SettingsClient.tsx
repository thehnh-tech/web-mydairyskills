"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Download, ShieldCheck, Sparkles, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";

type AIState = {
  enabled: boolean;
  provider: "groq" | "gemini" | "mock" | "openai";
  shareTextWithProvider: boolean;
  retainHistory: boolean;
  lastConsentedAt: string | null;
};

export function SettingsClient({
  email, name, timezone, ai, hasGeminiKey, hasGroqKey,
}: {
  email: string;
  name: string;
  timezone: string;
  ai: AIState;
  hasGeminiKey: boolean;
  hasGroqKey: boolean;
}) {
  const router = useRouter();
  const [state, setState] = useState<AIState>(ai);
  const [saving, setSaving] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);

  async function save(next: AIState) {
    setSaving(true);
    setState(next);
    await fetch("/api/settings/ai", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(next),
    });
    setSaving(false);
  }

  async function deleteAccount() {
    await fetch("/api/settings/delete-account", { method: "POST" });
    router.push("/");
  }

  return (
    <div className="flex h-full flex-col overflow-hidden">
      <header className="flex shrink-0 items-center justify-between border-b border-border px-4 sm:px-6 py-3">
        <h1 className="text-[18px] font-semibold tracking-tight">Settings</h1>
        {saving && <span className="text-[12px] text-muted-foreground">Saving…</span>}
      </header>

      <div className="scroll flex-1 overflow-auto p-4 sm:p-6 lg:p-8">
        <div className="mx-auto max-w-[720px] space-y-6 sm:space-y-8">
          <Section title="Account">
            <Row label="Name" value={name || "—"} />
            <Row label="Email" value={email} />
            <Row label="Timezone" value={timezone} />
          </Section>

          <Section
            title="AI analysis"
            icon={<Sparkles size={14} className="text-chart-3" />}
            description="On by default. The AI only looks at your diary when you hit Analyze, and every suggestion goes through review — nothing auto-applies."
          >
            <Toggle
              label="AI analysis"
              hint={
                state.enabled
                  ? "On — tap Analyze on Today to use it."
                  : "Off — turn it back on whenever you want."
              }
              checked={state.enabled}
              onChange={(v) => save({ ...state, enabled: v })}
            />

            <div className="space-y-1.5">
              <div className="text-[13px] font-medium">Provider</div>
              <div className="flex flex-col gap-2">
                <ProviderRow
                  selected={state.provider === "groq"}
                  onClick={() => save({ ...state, provider: "groq" })}
                  title="Groq (default · fast)"
                  badge={hasGroqKey ? <Badge variant="green">Configured</Badge> : <Badge variant="amber">Set GROQ_API_KEY</Badge>}
                  body="Default. Llama 3.3 70B with strict JSON output. Free tier, sub-second responses."
                />
                <ProviderRow
                  selected={state.provider === "gemini"}
                  onClick={() => save({ ...state, provider: "gemini" })}
                  title="Google Gemini"
                  badge={hasGeminiKey ? <Badge variant="green">Configured</Badge> : <Badge variant="amber">Set GEMINI_API_KEY</Badge>}
                  body="Backup provider. JSON-mode prompt with strict schema."
                />
                <ProviderRow
                  selected={state.provider === "mock"}
                  onClick={() => save({ ...state, provider: "mock" })}
                  title="Mock provider (offline)"
                  badge={<Badge>Always available</Badge>}
                  body="Deterministic local provider. Useful for demos and testing the review flow."
                />
              </div>
            </div>

            <Toggle
              label="Share entry text with provider"
              hint="Required for analysis. If off, you'll only see template suggestions."
              checked={state.shareTextWithProvider}
              onChange={(v) => save({ ...state, shareTextWithProvider: v })}
            />
            <Toggle
              label="Retain analysis history"
              hint="Keeps a record of past suggestions. Off = we only store accepted skill changes."
              checked={state.retainHistory}
              onChange={(v) => save({ ...state, retainHistory: v })}
            />
          </Section>

          <Section
            title="Privacy"
            icon={<ShieldCheck size={14} className="text-chart-3" />}
            description="Your diary belongs to you. Export everything as JSON, or wipe your account entirely."
          >
            <div className="flex flex-wrap items-center gap-3">
              <a href="/api/settings/export" download>
                <Button variant="outline" size="sm">
                  <Download size={14} /> Export everything (JSON)
                </Button>
              </a>
              {!confirmDelete ? (
                <Button variant="ghost" size="sm" onClick={() => setConfirmDelete(true)}>
                  <Trash2 size={14} /> Delete account
                </Button>
              ) : (
                <div className="flex items-center gap-2">
                  <span className="text-[13px] text-muted-foreground">Delete diary, skills, suggestions and account?</span>
                  <Button size="sm" variant="ghost" onClick={() => setConfirmDelete(false)}>Cancel</Button>
                  <Button size="sm" variant="destructive" onClick={deleteAccount}>Delete forever</Button>
                </div>
              )}
            </div>
          </Section>
        </div>
      </div>
    </div>
  );
}

function Section({
  title, icon, description, children,
}: {
  title: string; icon?: React.ReactNode; description?: string; children: React.ReactNode;
}) {
  return (
    <section className="rounded-[var(--radius)] border border-border bg-card">
      <header className="flex items-start gap-2.5 border-b border-border px-5 py-3.5">
        {icon}
        <div>
          <div className="text-[14px] font-semibold">{title}</div>
          {description && <div className="mt-0.5 text-[12.5px] leading-relaxed text-muted-foreground">{description}</div>}
        </div>
      </header>
      <div className="space-y-4 p-5">{children}</div>
    </section>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between text-[13.5px]">
      <span className="text-muted-foreground">{label}</span>
      <span className="font-medium">{value}</span>
    </div>
  );
}

function Toggle({
  label, hint, checked, onChange,
}: { label: string; hint?: string; checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <div className="flex items-start justify-between gap-4">
      <div>
        <div className="text-[13.5px] font-medium">{label}</div>
        {hint && <div className="mt-0.5 text-[12px] text-muted-foreground">{hint}</div>}
      </div>
      <Switch checked={checked} onCheckedChange={onChange} />
    </div>
  );
}

function ProviderRow({
  selected, onClick, title, body, badge,
}: { selected: boolean; onClick: () => void; title: string; body: string; badge: React.ReactNode }) {
  return (
    <button
      onClick={onClick}
      className={`text-left rounded-[var(--radius)] border p-3 transition-colors ${
        selected ? "border-chart-3 bg-[#eff6ff]/40" : "border-border bg-background hover:bg-muted/40"
      }`}
    >
      <div className="flex items-center justify-between">
        <div className="text-[13.5px] font-medium">{title}</div>
        {badge}
      </div>
      <div className="mt-1 text-[12px] text-muted-foreground">{body}</div>
    </button>
  );
}
