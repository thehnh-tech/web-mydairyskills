import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import { ChevronLeft, ChevronRight, Lock, Sparkles } from "lucide-react";
import { collections, ObjectId } from "@/lib/mongo";
import { requireUser } from "@/lib/session";
import { getDiaryContent } from "@/lib/diaryCrypto";
import { migrateLegacyDiaryEntry } from "@/lib/diaryMigration";
import { classifyDay, formatLong, shiftDateKey, todayKey } from "@mds/shared";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export default async function DayPage({
  params,
}: {
  params: Promise<{ dateKey: string }>;
}) {
  const { dateKey } = await params;
  if (!/^\d{4}-\d{2}-\d{2}$/.test(dateKey)) notFound();

  const { userId } = await requireUser();
  const { users, diary } = await collections();
  const user = await users.findOne({ _id: new ObjectId(userId) });
  const tz = user?.timezone || "UTC";

  // Today redirects to /today (canonical url for the writable page).
  if (dateKey === todayKey(tz)) redirect("/today");

  const state = classifyDay(dateKey, tz);
  const entry = state === "past" ? await diary.findOne({ userId, dateKey }) : null;
  await migrateLegacyDiaryEntry(diary, entry);
  const content = getDiaryContent(entry);

  return (
    <div className="flex h-full flex-col overflow-hidden">
      <header className="flex shrink-0 items-center justify-between border-b border-border bg-background px-6 py-3">
        <div className="flex items-center gap-2">
          <Link href={`/d/${shiftDateKey(dateKey, -1)}`}>
            <Button variant="ghost" size="icon"><ChevronLeft size={16} /></Button>
          </Link>
          <Link href={`/d/${shiftDateKey(dateKey, 1)}`}>
            <Button variant="ghost" size="icon"><ChevronRight size={16} /></Button>
          </Link>
          <Badge>
            <Lock size={11} /> {state === "future" ? "Locked — future" : "Read-only"}
          </Badge>
        </div>
        <div className="flex items-center gap-2">
          <Link href="/today">
            <Button variant="outline" size="sm">Back to today</Button>
          </Link>
        </div>
      </header>

      <div className="scroll flex-1 overflow-auto px-14 pt-8 pb-14">
        <div className="mx-auto max-w-[720px]">
          <div className="mb-1.5 flex items-baseline justify-between gap-4">
            <h1 className="text-[28px] font-semibold tracking-tight">{formatLong(dateKey)}</h1>
          </div>
          <div className="mb-6 text-[13px] text-muted-foreground">
            {state === "future"
              ? "This day hasn't happened yet. The page unlocks at midnight in your timezone."
              : "This page locked at midnight. What you wrote, you wrote."}
          </div>

          {state === "past" ? (
            entry && content ? (
              <PlainDiaryText value={content} />
            ) : (
              <div className="rounded-[var(--radius)] border border-dashed border-border p-8 text-center text-[13px] text-muted-foreground">
                No entry on this day.
              </div>
            )
          ) : (
            <div className="rounded-[var(--radius)] border border-dashed border-border p-8 text-center">
              <div className="mx-auto mb-2 grid h-9 w-9 place-items-center rounded-full bg-muted text-muted-foreground">
                <Lock size={16} />
              </div>
              <div className="text-[13.5px] font-medium">Future days are locked</div>
              <div className="mt-1 text-[12.5px] text-muted-foreground">
                Show up tomorrow.
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function PlainDiaryText({ value }: { value: string }) {
  return (
    <div className="min-h-[360px] whitespace-pre-wrap text-[15px] leading-[1.7] text-foreground">
      {value}
    </div>
  );
}
