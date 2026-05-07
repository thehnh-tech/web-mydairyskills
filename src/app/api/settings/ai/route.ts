import { NextResponse } from "next/server";
import { z } from "zod";
import { collections, ObjectId } from "@/lib/mongo";
import { requireUser } from "@/lib/session";

const Body = z.object({
  enabled: z.boolean(),
  provider: z.enum(["groq", "gemini", "mock", "openai"]),
  shareTextWithProvider: z.boolean(),
  retainHistory: z.boolean(),
});

export async function PUT(req: Request) {
  const { userId } = await requireUser();
  const data = Body.parse(await req.json());
  const { users } = await collections();
  await users.updateOne(
    { _id: new ObjectId(userId) },
    {
      $set: {
        "ai.enabled": data.enabled,
        "ai.provider": data.provider,
        "ai.shareTextWithProvider": data.shareTextWithProvider,
        "ai.retainHistory": data.retainHistory,
        "ai.lastConsentedAt": data.enabled ? new Date().toISOString() : null,
      },
    }
  );
  return NextResponse.json({ ok: true });
}
