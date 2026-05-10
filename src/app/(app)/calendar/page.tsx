import Link from "next/link";
import { collections, ObjectId } from "@/lib/mongo";
import { requireUser } from "@/lib/session";
import { getDiaryContent } from "@/lib/diaryCrypto";
import { migrateLegacyDiaryEntries } from "@/lib/diaryMigration";
import { todayKey } from "@mds/shared";

function buildMonthGrid(today: string) {
  const [y, m] = today.split("-").map(Number);
  const first = new Date(Date.UTC(y, m - 1, 1));
  const start = first.getUTCDay();
  const days = new Date(Date.UTC(y, m, 0)).getUTCDate();
  const cells: ({ key: string; day: number } | null)[] = [];
  for (let i = 0; i < start; i++) cells.push(null);
  for (let d = 1; d <= days; d++) {
    const key = `${y}-${String(m).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
    cells.push({ key, day: d });
  }
  while (cells.length % 7) cells.push(null);
  return { cells, label: first.toLocaleDateString("en-US", { month: "long", year: "numeric", timeZone: "UTC" }) };
}

export default async function CalendarPage() {
  const { userId } = await requireUser();
  const { users, diary } = await collections();
  const user = await users.findOne({ _id: new ObjectId(userId) });
  const tz = user?.timezone || "UTC";
  const today = todayKey(tz);
  const grid = buildMonthGrid(today);

  // Limit the scan to the current month — much cheaper than a regex scan once
  // the user has dozens of months of entries.
  const yyyymm = today.slice(0, 7);
  const startKey = `${yyyymm}-01`;
  const endKey = `${yyyymm}-32`;
  const dayDocs = await diary
    .find({ userId, dateKey: { $gte: startKey, $lte: endKey } })
    .toArray();
  await migrateLegacyDiaryEntries(diary, dayDocs);
  const has = new Map(dayDocs.map((d) => [d.dateKey, d]));

  return (
    <div className="flex h-full flex-col overflow-hidden">
      <header className="flex shrink-0 items-center justify-between gap-3 border-b border-border px-4 sm:px-6 py-3">
        <h1 className="text-[16px] sm:text-[18px] font-semibold tracking-tight truncate">{grid.label}</h1>
        <div className="hidden sm:block text-[12px] text-muted-foreground">
          Days with an entry are highlighted.
        </div>
      </header>

      <div className="scroll flex-1 overflow-auto p-3 sm:p-6 lg:p-8">
        <div className="mx-auto max-w-[920px]">
          <div className="grid grid-cols-7 gap-1 sm:gap-2 px-0.5 sm:px-1 pb-2 text-[10px] sm:text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
            {["S", "M", "T", "W", "T", "F", "S"].map((d, i) => (
              <div key={i} className="text-center sm:text-left">
                <span className="sm:hidden">{d}</span>
                <span className="hidden sm:inline">{["Sun","Mon","Tue","Wed","Thu","Fri","Sat"][i]}</span>
              </div>
            ))}
          </div>
          <div className="grid grid-cols-7 gap-1 sm:gap-2">
            {grid.cells.map((c, i) => {
              if (!c) return <div key={i} />;
              const entry = has.get(c.key);
              const entryText = entry ? getDiaryContent(entry) : "";
              const isToday = c.key === today;
              const isFuture = c.key > today;
              const href = isToday ? "/today" : `/d/${c.key}`;
              return (
                <Link
                  key={c.key}
                  href={href}
                  className={`min-h-[56px] sm:min-h-[88px] rounded-[var(--radius)] border p-1.5 sm:p-2 text-[12px] transition-colors ${
                    isToday
                      ? "border-chart-3 bg-[#eff6ff]"
                      : entry
                      ? "border-border bg-card hover:bg-muted/40"
                      : "border-dashed border-border bg-muted/20 hover:bg-muted/40"
                  } ${isFuture ? "opacity-50" : ""}`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-[12px] sm:text-[13px] font-semibold">{c.day}</span>
                    {entry && entry.analyzedAt && (
                      <span className="h-1.5 w-1.5 rounded-full bg-chart-3" title="Analyzed" />
                    )}
                  </div>
                  {entry && (
                    <div className="mt-1 hidden sm:block line-clamp-3 text-[11.5px] leading-tight text-muted-foreground">
                      {entryText.replace(/\s+/g, " ").trim().slice(0, 80)}
                    </div>
                  )}
                </Link>
              );
            })}
          </div>
          <div className="mt-4 flex sm:hidden items-center justify-center gap-3 text-[11px] text-muted-foreground">
            <span className="flex items-center gap-1">
              <span className="h-1.5 w-1.5 rounded-full bg-chart-3" /> Analyzed
            </span>
            <span className="flex items-center gap-1">
              <span className="inline-block h-2 w-2 rounded-sm border border-dashed border-border" /> Empty
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
