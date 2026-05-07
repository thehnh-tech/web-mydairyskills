import { cn } from "@/lib/utils";

const MAP = {
  saved: { cls: "bg-[#f0fdf4] text-[#16a34a] border-[#dcfce7]", dot: "#16a34a", text: "Saved" },
  saving: { cls: "bg-[#fffbeb] text-[#b45309] border-[#fef3c7]", dot: "#b45309", text: "Saving…" },
  offline: { cls: "bg-[#fffbeb] text-[#b45309] border-[#fef3c7]", dot: "#b45309", text: "Offline — will sync" },
  pending: { cls: "bg-[#eff6ff] text-chart-3 border-[#dbeafe]", dot: "var(--chart-3)", text: "Analysis pending" },
  complete: { cls: "bg-[#eff6ff] text-chart-3 border-[#dbeafe]", dot: "var(--chart-3)", text: "Analyzed" },
  failed: { cls: "bg-[#fef2f2] text-destructive border-[#fee2e2]", dot: "var(--destructive)", text: "Analysis failed" },
} as const;

export function StatusPill({ state }: { state: keyof typeof MAP }) {
  const m = MAP[state];
  return (
    <span className={cn("inline-flex items-center gap-1.5 rounded-full border px-2 py-[2px] text-[11.5px] font-medium", m.cls)}>
      <span className="inline-block h-1.5 w-1.5 rounded-full" style={{ background: m.dot }} />
      {m.text}
    </span>
  );
}
