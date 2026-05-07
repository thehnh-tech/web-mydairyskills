"use client";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  BookOpen,
  Calendar as CalIcon,
  Sparkles,
  Settings as Cog,
  PenLine,
  MoreHorizontal,
  Menu,
  X,
} from "lucide-react";
import { useEffect, useState } from "react";
import { formatShort } from "@mds/shared";

type RecentDay = { dateKey: string; excerpt: string };
type Me = { id: string; email: string; name: string };

export function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const [days, setDays] = useState<RecentDay[]>([]);
  const [me, setMe] = useState<Me | null>(null);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    fetch("/api/me").then((r) => r.json()).then((d) => setMe(d.user));
    fetch("/api/diary?limit=6").then((r) => r.json()).then((d) => setDays(d.days || []));
  }, [pathname]);

  // Close drawer on route change
  useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

  const items = [
    { href: "/today", label: "Today", icon: PenLine },
    { href: "/calendar", label: "Calendar", icon: CalIcon },
    { href: "/skills", label: "Skills", icon: Sparkles },
    { href: "/settings", label: "Settings", icon: Cog },
  ];

  async function signOut() {
    await fetch("/api/auth/signout", { method: "POST" });
    router.push("/");
  }

  return (
    <>
      {/* Mobile top bar with hamburger */}
      <div className="md:hidden fixed top-0 left-0 right-0 z-40 flex items-center justify-between border-b border-sidebar-border bg-sidebar px-3 py-2.5">
        <button
          onClick={() => setMobileOpen(true)}
          aria-label="Open menu"
          className="grid h-9 w-9 place-items-center rounded-md hover:bg-sidebar-accent"
        >
          <Menu size={18} />
        </button>
        <div className="flex items-center gap-2">
          <div className="grid h-[24px] w-[24px] place-items-center rounded-[7px] bg-primary text-primary-foreground">
            <BookOpen size={13} />
          </div>
          <span className="text-[13.5px] font-semibold tracking-tight">MyDiarySkills</span>
        </div>
        <div className="w-9" />
      </div>

      {/* Mobile backdrop */}
      {mobileOpen && (
        <button
          onClick={() => setMobileOpen(false)}
          aria-label="Close menu"
          className="md:hidden fixed inset-0 z-40 bg-foreground/30 backdrop-blur-sm animate-in fade-in duration-200"
        />
      )}

      <aside
        className={`flex flex-col border-r border-sidebar-border bg-sidebar text-sidebar-foreground transition-transform duration-300 ease-out
          md:static md:w-[232px] md:translate-x-0 md:shrink-0
          fixed inset-y-0 left-0 z-50 w-[260px]
          ${mobileOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"}`}
        style={{ padding: "14px 10px" }}
      >
      <div className="flex items-center justify-between gap-2 px-2 pb-3.5 pt-1.5">
        <div className="flex items-center gap-2">
          <div className="grid h-[26px] w-[26px] place-items-center rounded-[7px] bg-primary text-primary-foreground">
            <BookOpen size={14} />
          </div>
          <div className="text-[14px] font-semibold tracking-tight">MyDiarySkills</div>
        </div>
        <button
          onClick={() => setMobileOpen(false)}
          aria-label="Close menu"
          className="md:hidden grid h-7 w-7 place-items-center rounded-md hover:bg-sidebar-accent"
        >
          <X size={16} />
        </button>
      </div>

      <nav className="flex flex-col gap-0.5">
        {items.map((it) => {
          const Icon = it.icon;
          const active = pathname?.startsWith(it.href) ?? false;
          return (
            <Link
              key={it.href}
              href={it.href}
              className={`flex items-center gap-2.5 rounded-md px-2.5 py-1.5 text-[13.5px] ${
                active
                  ? "bg-sidebar-accent text-sidebar-accent-foreground font-medium"
                  : "text-sidebar-foreground hover:bg-sidebar-accent/60"
              }`}
            >
              <span className={active ? "text-sidebar-accent-foreground" : "text-muted-foreground"}>
                <Icon size={16} />
              </span>
              {it.label}
            </Link>
          );
        })}
      </nav>

      <div className="mt-4 px-2.5 pb-1.5 text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
        Recent days
      </div>
      <div className="flex flex-col">
        {days.length === 0 && (
          <div className="px-2.5 py-1.5 text-[12px] italic text-muted-foreground">
            Your past days will appear here.
          </div>
        )}
        {days.map((d) => (
          <Link
            key={d.dateKey}
            href={`/d/${d.dateKey}`}
            className="flex items-center gap-2.5 rounded-md px-2.5 py-1.5 text-[13px] text-sidebar-foreground hover:bg-sidebar-accent/60"
          >
            <span className="font-mono text-[11px] text-muted-foreground" style={{ width: 44 }}>
              {formatShort(d.dateKey)}
            </span>
            <span className="flex-1 overflow-hidden text-ellipsis whitespace-nowrap">
              {d.excerpt || <span className="italic">—</span>}
            </span>
          </Link>
        ))}
      </div>

      <div className="mt-auto flex items-center gap-2.5 border-t border-sidebar-border px-2 pt-2.5">
        <div className="avatar">
          {(me?.name || me?.email || "•").slice(0, 2).toUpperCase()}
        </div>
        <div className="flex flex-col leading-tight">
          <span className="text-[13px] font-medium">{me?.name || me?.email?.split("@")[0] || "—"}</span>
          <span className="text-[11px] text-muted-foreground">{me?.email}</span>
        </div>
        <button
          onClick={signOut}
          className="ml-auto grid h-7 w-7 place-items-center rounded-md text-muted-foreground hover:bg-muted"
          title="Sign out"
        >
          <MoreHorizontal size={14} />
        </button>
      </div>
    </aside>
    </>
  );
}
