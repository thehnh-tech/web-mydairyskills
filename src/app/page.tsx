import { redirect } from "next/navigation";
import { getSession } from "@/lib/session";
import { LandingPageClient } from "./LandingPageClient";

export default async function LandingPage() {
  const session = await getSession();
  if (session.userId) redirect("/today");
  return <LandingPageClient />;
}
