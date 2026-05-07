import { redirect } from "next/navigation";
import { getSession } from "@/lib/session";
import { Sidebar } from "@/components/app/Sidebar";
import { PageTransition } from "@/components/app/PageTransition";

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const session = await getSession();
  if (!session.userId) redirect("/auth/signin");

  return (
    <div className="flex h-screen overflow-hidden bg-background md:flex-row flex-col">
      <Sidebar />
      <main className="relative min-w-0 flex-1 overflow-hidden pt-12 md:pt-0">
        <PageTransition>{children}</PageTransition>
      </main>
    </div>
  );
}
