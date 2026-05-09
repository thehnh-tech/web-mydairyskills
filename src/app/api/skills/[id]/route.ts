import { NextResponse } from "next/server";
import { requireUser } from "@/lib/session";

export async function PATCH() {
  await requireUser();
  return NextResponse.json(
    { error: "Skills can only be changed by AI analysis." },
    { status: 403 }
  );
}

export async function DELETE() {
  await requireUser();
  return NextResponse.json(
    { error: "Skills can only be removed by account deletion." },
    { status: 403 }
  );
}
