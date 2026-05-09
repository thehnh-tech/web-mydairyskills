import { redirect } from "next/navigation";
import { collections, ObjectId } from "@/lib/mongo";
import { requireUser } from "@/lib/session";
import { todayKey } from "@mds/shared";
import { TodayClient } from "./TodayClient";

export default async function TodayPage() {
  const { userId } = await requireUser();
  const { users, diary, skills } = await collections();
  const user = await users.findOne({ _id: new ObjectId(userId) });
  if (!user) redirect("/auth/signin");
  if (!user.onboarded) redirect("/onboarding");

  const tz = user.timezone || "UTC";
  const dateKey = todayKey(tz);
  const [entry, skillCount] = await Promise.all([
    diary.findOne({ userId, dateKey }),
    skills.countDocuments({ userId }),
  ]);

  return (
    <TodayClient
      dateKey={dateKey}
      initialContent={entry?.content || ""}
      initialAnalyzed={!!entry?.analyzedAt}
      initialAIProvider={entry?.analyzedProvider || null}
      aiEnabled={user.ai.enabled}
      totalSkills={skillCount}
    />
  );
}
