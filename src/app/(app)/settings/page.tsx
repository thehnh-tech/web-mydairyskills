import { collections, ObjectId } from "@/lib/mongo";
import { requireUser } from "@/lib/session";
import { SettingsClient } from "./SettingsClient";

export default async function SettingsPage() {
  const { userId } = await requireUser();
  const { users } = await collections();
  const user = await users.findOne({ _id: new ObjectId(userId) });
  if (!user) return null;

  return (
    <SettingsClient
      email={user.email}
      name={user.name}
      timezone={user.timezone}
      ai={user.ai}
      hasGeminiKey={Boolean(process.env.GEMINI_API_KEY)}
      hasGroqKey={Boolean(process.env.GROQ_API_KEY)}
    />
  );
}
