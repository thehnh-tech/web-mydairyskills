import { NextResponse } from "next/server";
import { requireUser } from "@/lib/session";

export async function POST() {
  await requireUser();
  return NextResponse.json(
    { error: "Skill updates are applied automatically by the AI." },
    { status: 410 }
  );
}
