import Link from "next/link";
import { collections } from "@/lib/mongo";
import { requireUser } from "@/lib/session";
import { Badge } from "@/components/ui/badge";

export default async function SkillsDashboardPage() {
  const { userId } = await requireUser();
  const { skills } = await collections();
  const docs = await skills.find({ userId }).sort({ updatedAt: -1 }).toArray();

  const byCategory = new Map<string, typeof docs>();
  for (const s of docs) {
    const arr = byCategory.get(s.category) || [];
    arr.push(s);
    byCategory.set(s.category, arr);
  }

  return (
    <div className="flex h-full flex-col overflow-hidden">
      <header className="flex shrink-0 items-center justify-between border-b border-border px-6 py-3">
        <div>
          <h1 className="text-[18px] font-semibold tracking-tight">Skills</h1>
          <div className="text-[12px] text-muted-foreground">
            Built one entry at a time. Side-effect of writing.
          </div>
        </div>
        <Badge variant="solid">{docs.length} total</Badge>
      </header>

      <div className="scroll flex-1 overflow-auto p-8">
        <div className="mx-auto max-w-[1080px]">
          {docs.length === 0 ? (
            <div className="rounded-[var(--radius)] border border-dashed border-border p-10 text-center">
              <div className="text-[14px] font-medium">No skills yet</div>
              <div className="mt-1 text-[13px] text-muted-foreground">
                Write a few days, run an analysis, and the skills will start showing up here.
              </div>
              <Link href="/today" className="mt-4 inline-block text-[13px] text-chart-3 hover:underline">
                Open today →
              </Link>
            </div>
          ) : (
            Array.from(byCategory.entries()).map(([cat, list]) => (
              <section key={cat} className="mb-8">
                <div className="mb-3 flex items-center gap-2 text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
                  {cat} <span className="font-normal">· {list.length}</span>
                </div>
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
                  {list.map((s) => (
                    <Link
                      key={s._id?.toString()}
                      href={`/skills/${s._id?.toString()}`}
                      className="rounded-[var(--radius)] border border-border bg-card p-4 transition-colors hover:bg-muted/30"
                    >
                      <div className="flex items-start gap-3">
                        <div className="grid h-10 w-10 shrink-0 place-items-center rounded-md bg-muted text-xl">
                          {s.emoji}
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center justify-between gap-2">
                            <div className="text-[14px] font-semibold">{s.name}</div>
                            <Badge variant="blue">Lv {s.level}</Badge>
                          </div>
                          <div className="mt-1 line-clamp-2 text-[12.5px] text-muted-foreground">
                            {s.description || "No description yet."}
                          </div>
                          <div className="mt-3 progress-bar">
                            <span style={{ width: `${Math.round(s.progress * 100)}%` }} />
                          </div>
                          <div className="mt-2 flex items-center justify-between text-[11px] text-muted-foreground">
                            <span>{s.entries} entries</span>
                            <span>{Math.round(s.progress * 100)}% to next level</span>
                          </div>
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              </section>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
