"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";

import { DashboardAvatar } from "@/components/dashboard/dashboard-avatar";
import {
  ArrowRightIcon,
  AutomationIcon,
  CloseIcon,
  GuildsIcon,
  LogsIcon,
  LogOutIcon,
  OverviewIcon,
  SettingsIcon,
  TemporaryIcon,
  TerminalIcon,
} from "@/components/dashboard/icons";
import { useDashboardShellState } from "@/components/dashboard/dashboard-shell-state";
import type { AccessibleGuild, DashboardUser } from "@/types/dashboard";

interface NavigationItem {
  href: string;
  label: string;
  icon: (props: { className?: string }) => React.ReactNode;
}

function buildNavigation(activeGuildId: string | null): NavigationItem[] {
  const items: NavigationItem[] = [
    { href: "/dashboard", label: "Guild Management", icon: GuildsIcon },
    { href: "/dashboard/feedback", label: "Feedback", icon: LogsIcon },
  ];

  if (!activeGuildId) {
    return items;
  }

  return [
    ...items,
    { href: `/dashboard/${activeGuildId}`, label: "Dashboard", icon: OverviewIcon },
    { href: `/dashboard/${activeGuildId}/commands`, label: "Commands", icon: TerminalIcon },
    { href: `/dashboard/${activeGuildId}/settings`, label: "Settings", icon: SettingsIcon },
    { href: `/dashboard/${activeGuildId}/automation`, label: "AutoMod", icon: AutomationIcon },
    { href: `/dashboard/${activeGuildId}/logs`, label: "Logs", icon: LogsIcon },
    { href: `/dashboard/${activeGuildId}/temporary-actions`, label: "Temporary", icon: TemporaryIcon },
  ];
}

export function DashboardShellSidebar({
  user,
  guilds,
}: {
  user: DashboardUser;
  guilds: AccessibleGuild[];
}) {
  const pathname = usePathname();
  const { isSidebarOpen, closeSidebar } = useDashboardShellState();
  const activeGuildId =
    pathname.split("/").find((segment) => /^\d+$/.test(segment)) ?? null;
  const activeGuild = guilds.find((guild) => guild.guildId === activeGuildId) ?? null;
  const navigation = buildNavigation(activeGuildId);

  return (
    <>
      {isSidebarOpen ? (
        <button
          type="button"
          aria-label="Close navigation"
          className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm lg:hidden"
          onClick={closeSidebar}
        />
      ) : null}

      <aside
        className={`
          fixed inset-y-0 left-0 z-50 flex w-72 max-w-[85vw] flex-col border-r border-[var(--line)]
          bg-[var(--bg-surface)] transition-transform duration-300 ease-in-out lg:static lg:max-w-none lg:translate-x-0
          ${isSidebarOpen ? "translate-x-0" : "-translate-x-full"}
        `}
      >
        <div className="flex h-full flex-col px-3 py-4">
          <div className="mb-4 flex items-center justify-between gap-3 rounded-[var(--radius)] border border-[var(--line)] bg-[var(--bg-surface-elevated)] px-3 py-4">
            <div className="flex min-w-0 items-center gap-3">
              <div className="relative h-8 w-8 flex-shrink-0 overflow-hidden rounded-[8px]">
                <Image
                  src="/Akbash -1.png"
                  alt="Akbash Logo"
                  fill
                  sizes="32px"
                  priority
                  className="object-cover"
                />
              </div>
              <div className="min-w-0">
                <p className="truncate text-sm font-semibold text-white">
                  {activeGuild?.guildName ?? "Akbash Dashboard"}
                </p>
                <p className="truncate text-[10px] uppercase tracking-[0.18em] text-[var(--text-faint)]">
                  Moderation Control
                </p>
              </div>
            </div>

            <button
              type="button"
              className="p-1 text-[var(--text-faint)] transition-colors hover:text-white lg:hidden"
              onClick={closeSidebar}
            >
              <CloseIcon className="h-5 w-5" />
            </button>
          </div>

          <nav className="flex-1 space-y-1 overflow-y-auto">
            {navigation.map((item) => {
              const isActive = pathname === item.href;
              const isGuildDirectoryLink = item.href.startsWith("/dashboard/") && /^\d+$/.test(item.href.split("/").at(-1) ?? "");

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`nav-button ${isActive ? "nav-button--active" : ""}`}
                  onClick={closeSidebar}
                  prefetch={isGuildDirectoryLink ? false : undefined}
                >
                  <item.icon className="h-5 w-5" />
                  <span className="text-sm font-medium">{item.label}</span>
                </Link>
              );
            })}
          </nav>

          <div className="mt-auto space-y-4 border-t border-[var(--line)] px-3 py-4">
            <div className="flex min-w-0 items-center gap-3 px-1">
              <DashboardAvatar
                label={user.displayName}
                imageUrl={user.avatarUrl}
                className="h-8 w-8 rounded-full"
                sizes="32px"
              />
              <div className="min-w-0">
                <p className="truncate text-sm font-semibold text-white">{user.displayName}</p>
                <p className="truncate text-[10px] text-[var(--text-faint)]">Discord Session</p>
              </div>
            </div>

            <form action="/auth/signout" method="post">
              <button
                type="submit"
                className="group flex w-full items-center justify-between rounded-[var(--radius)] border border-[var(--line)] bg-[var(--bg-surface-elevated)] px-3 py-2 text-xs font-semibold text-[var(--text-muted)] transition-all hover:bg-[var(--line)] hover:text-white"
              >
                <span className="flex items-center gap-2">
                  <LogOutIcon className="h-4 w-4" />
                  Log Out
                </span>
                <ArrowRightIcon className="h-3 w-3 opacity-0 transition-opacity group-hover:opacity-100" />
              </button>
            </form>
          </div>
        </div>
      </aside>
    </>
  );
}
