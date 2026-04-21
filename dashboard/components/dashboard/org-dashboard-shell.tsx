"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutGrid,
  List,
  BarChart3,
  Settings,
  ChevronDown,
  LogOut,
} from "lucide-react";
import { useState, useRef, useEffect } from "react";
import {
  orgEndpointsPath,
  orgOverviewPath,
  orgRequestsPath,
  orgSettingsPath,
} from "@/lib/routes";
import { cn } from "@/lib/cn";
import type { OrgSummary } from "@/types/org";

type NavKey = "overview" | "requests" | "endpoints" | "settings";

const navItems: {
  key: NavKey;
  label: string;
  icon: typeof LayoutGrid;
  href: (orgId: string) => string;
}[] = [
  { key: "overview", label: "Overview", icon: LayoutGrid, href: orgOverviewPath },
  { key: "requests", label: "Requests", icon: List, href: orgRequestsPath },
  { key: "endpoints", label: "Endpoints", icon: BarChart3, href: orgEndpointsPath },
  { key: "settings", label: "Settings", icon: Settings, href: orgSettingsPath },
];

function activeNavKey(pathname: string): NavKey {
  if (pathname.includes("/requests")) return "requests";
  if (pathname.includes("/endpoints")) return "endpoints";
  if (pathname.includes("/settings")) return "settings";
  return "overview";
}

type Props = {
  orgId: string;
  orgName: string;
  orgs: OrgSummary[];
  children: React.ReactNode;
};

export function OrgDashboardShell({
  orgId,
  orgName,
  orgs,
  children,
}: Props) {
  const pathname = usePathname();
  const active = activeNavKey(pathname);
  const [desktopOrgOpen, setDesktopOrgOpen] = useState(false);
  const [mobileOrgOpen, setMobileOrgOpen] = useState(false);
  const desktopOrgRef = useRef<HTMLDivElement>(null);
  const mobileOrgRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function onDocClick(e: MouseEvent) {
      const t = e.target as Node;
      if (!desktopOrgRef.current?.contains(t)) setDesktopOrgOpen(false);
      if (!mobileOrgRef.current?.contains(t)) setMobileOrgOpen(false);
    }
    document.addEventListener("click", onDocClick);
    return () => document.removeEventListener("click", onDocClick);
  }, []);

  const NavBody = (
    <>
      <div className="px-4 pt-6">
        <Link
          href={orgOverviewPath(orgId)}
          className="flex items-center gap-2 text-lg font-bold tracking-tight text-tl-text-primary"
        >
          <span aria-hidden>⚡</span>
          TraceLite
        </Link>
      </div>

      <nav className="mt-8 flex flex-col gap-1 px-3">
        {navItems.map(({ key, label, icon: Icon, href }) => {
          const isActive = active === key;
          return (
            <Link
              key={key}
              href={href(orgId)}
              className={cn(
                "relative flex items-center gap-3 rounded-lg py-2.5 pl-3 pr-3 text-sm font-medium transition-colors",
                isActive
                  ? "bg-tl-card-hover text-tl-text-primary before:absolute before:left-0 before:top-1 before:bottom-1 before:w-[3px] before:rounded-full before:bg-tl-accent"
                  : "text-tl-text-secondary hover:bg-tl-card-hover hover:text-tl-text-primary",
              )}
            >
              <Icon className="size-4 shrink-0 opacity-90" strokeWidth={1.75} />
              {label}
            </Link>
          );
        })}
      </nav>

      <div className="mt-auto border-t border-tl-border px-4 py-4">
        <div className="relative" ref={desktopOrgRef}>
          <button
            type="button"
            onClick={() => setDesktopOrgOpen((o) => !o)}
            className="flex w-full items-center justify-between gap-2 rounded-lg border border-tl-border bg-tl-bg px-3 py-2.5 text-left text-sm font-medium text-tl-text-primary transition-colors hover:bg-tl-card-hover"
          >
            <span className="truncate">{orgName}</span>
            <ChevronDown
              className={cn(
                "size-4 shrink-0 text-tl-text-muted transition-transform",
                desktopOrgOpen && "rotate-180",
              )}
            />
          </button>
          {desktopOrgOpen && (
            <div className="absolute bottom-full left-0 right-0 z-50 mb-1 overflow-hidden rounded-lg border border-tl-border bg-tl-card py-1 shadow-lg">
              {orgs.map((o) => (
                <Link
                  key={o.id}
                  href={orgOverviewPath(o.id)}
                  className={cn(
                    "block px-3 py-2 text-sm hover:bg-tl-card-hover",
                    o.id === orgId
                      ? "text-tl-text-primary"
                      : "text-tl-text-secondary",
                  )}
                  onClick={() => setDesktopOrgOpen(false)}
                >
                  {o.name}
                </Link>
              ))}
              <Link
                href="/orgs"
                className="block px-3 py-2 text-sm text-tl-text-secondary hover:bg-tl-card-hover hover:text-tl-text-primary"
                onClick={() => setDesktopOrgOpen(false)}
              >
                All organizations…
              </Link>
            </div>
          )}
        </div>
        <p className="mt-3 truncate text-xs text-tl-text-muted">dev@myapp.com</p>
        <Link
          href="/login"
          className="mt-2 inline-flex items-center gap-1.5 text-xs text-tl-text-muted transition-colors hover:text-tl-text-secondary"
        >
          <LogOut className="size-3.5" strokeWidth={1.75} />
          Log out
        </Link>
      </div>
    </>
  );

  const MobileTabs = (
    <nav className="fixed bottom-0 left-0 right-0 z-40 flex border-t border-tl-border bg-tl-card px-2 pb-[max(0.5rem,env(safe-area-inset-bottom))] pt-2 lg:hidden">
      {navItems.map(({ key, label, icon: Icon, href }) => {
        const isActive = active === key;
        return (
          <Link
            key={key}
            href={href(orgId)}
            className={cn(
              "flex flex-1 flex-col items-center gap-1 py-2 text-[10px] font-medium",
              isActive ? "text-tl-accent" : "text-tl-text-muted",
            )}
          >
            <Icon className="size-5" strokeWidth={1.75} />
            {label}
          </Link>
        );
      })}
    </nav>
  );

  return (
    <div className="flex min-h-full flex-1 flex-col bg-tl-bg lg:flex-row">
      <aside className="hidden w-[240px] shrink-0 flex-col border-r border-tl-border bg-tl-card lg:flex">
        {NavBody}
      </aside>

      <div className="flex min-w-0 flex-1 flex-col pb-20 lg:pb-0">
        <header className="flex items-center justify-between border-b border-tl-border bg-tl-bg px-4 py-3 lg:hidden">
          <Link
            href={orgOverviewPath(orgId)}
            className="flex items-center gap-2 text-base font-bold text-tl-text-primary"
          >
            <span aria-hidden>⚡</span>
            TraceLite
          </Link>
          <div className="relative" ref={mobileOrgRef}>
            <button
              type="button"
              onClick={() => setMobileOrgOpen((o) => !o)}
              className="flex items-center gap-1 rounded-lg border border-tl-border bg-tl-card px-2.5 py-1.5 text-xs font-medium text-tl-text-primary"
            >
              <span className="max-w-[120px] truncate">{orgName}</span>
              <ChevronDown className="size-3.5 text-tl-text-muted" />
            </button>
            {mobileOrgOpen && (
              <div className="absolute right-0 top-full z-50 mt-1 w-48 overflow-hidden rounded-lg border border-tl-border bg-tl-card py-1 shadow-lg">
                {orgs.map((o) => (
                  <Link
                    key={o.id}
                    href={orgOverviewPath(o.id)}
                    className="block px-3 py-2 text-sm hover:bg-tl-card-hover"
                    onClick={() => setMobileOrgOpen(false)}
                  >
                    {o.name}
                  </Link>
                ))}
                <Link
                  href="/orgs"
                  className="block px-3 py-2 text-sm text-tl-text-secondary hover:bg-tl-card-hover"
                  onClick={() => setMobileOrgOpen(false)}
                >
                  All organizations…
                </Link>
              </div>
            )}
          </div>
        </header>

        <main className="flex-1 px-4 py-6 sm:px-6 sm:py-8 lg:p-8">{children}</main>
      </div>

      {MobileTabs}
    </div>
  );
}
