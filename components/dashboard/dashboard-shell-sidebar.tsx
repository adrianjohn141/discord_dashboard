"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { CSSProperties, ReactNode } from "react";

import { DashboardAvatar } from "@/components/dashboard/dashboard-avatar";
import {
  AppealIcon,
  ArrowRightIcon,
  AutomationIcon,
  CloseIcon,
  EvidenceIcon,
  GuildsIcon,
  LogsIcon,
  LogOutIcon,
  MessageSquareIcon,
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
  eyebrow: string;
  tone: string;
  group: "Workspace" | "Moderation" | "Controls" | "Review";
  icon: (props: { className?: string }) => ReactNode;
}

function buildNavigation(activeGuildId: string | null): NavigationItem[] {
  const items: NavigationItem[] = [
    {
      href: "/dashboard",
      label: "Guild Management",
      eyebrow: "Servers",
      group: "Workspace",
      tone: "#8fd4ff",
      icon: GuildsIcon,
    },
    {
      href: "/dashboard/feedback",
      label: "Feedback",
      eyebrow: "Requests",
      group: "Workspace",
      tone: "#77a8ff",
      icon: MessageSquareIcon,
    },
  ];

  if (!activeGuildId) {
    return items;
  }

  return [
    ...items,
    {
      href: `/dashboard/${activeGuildId}`,
      label: "Dashboard",
      eyebrow: "Overview",
      group: "Moderation",
      tone: "#7c8fff",
      icon: OverviewIcon,
    },
    {
      href: `/dashboard/${activeGuildId}/logs`,
      label: "Logs",
      eyebrow: "Audit",
      group: "Moderation",
      tone: "#a6b7ff",
      icon: LogsIcon,
    },
    {
      href: `/dashboard/${activeGuildId}/evidence`,
      label: "Evidence",
      eyebrow: "Archive",
      group: "Moderation",
      tone: "#8adfdd",
      icon: EvidenceIcon,
    },
    {
      href: `/dashboard/${activeGuildId}/temporary-actions`,
      label: "Temporary",
      eyebrow: "Expiring",
      group: "Moderation",
      tone: "#f1b75a",
      icon: TemporaryIcon,
    },
    {
      href: `/dashboard/${activeGuildId}/commands`,
      label: "Commands",
      eyebrow: "Actions",
      group: "Controls",
      tone: "#91dfb5",
      icon: TerminalIcon,
    },
    {
      href: `/dashboard/${activeGuildId}/settings`,
      label: "Settings",
      eyebrow: "Config",
      group: "Controls",
      tone: "#c0a3ff",
      icon: SettingsIcon,
    },
    {
      href: `/dashboard/${activeGuildId}/automation`,
      label: "AutoMod",
      eyebrow: "Filters",
      group: "Controls",
      tone: "#5dd695",
      icon: AutomationIcon,
    },
    {
      href: `/dashboard/${activeGuildId}/appeals`,
      label: "Appeals",
      eyebrow: "Queue",
      group: "Review",
      tone: "#ffbe72",
      icon: AppealIcon,
    },
  ];
}

const navGroups: NavigationItem["group"][] = [
  "Workspace",
  "Moderation",
  "Controls",
  "Review",
];

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

  const groupedNavigation = navigation.reduce<Record<string, NavigationItem[]>>((acc, item) => {
    const bucket = acc[item.group];

    if (bucket) {
      bucket.push(item);
    } else {
      acc[item.group] = [item];
    }

    return acc;
  }, {});

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
          dashboard-sidebar fixed inset-y-0 left-0 z-50 flex w-72 max-w-[85vw] flex-col border-r border-[var(--line)]
          transition-transform duration-300 ease-in-out lg:static lg:max-w-none lg:translate-x-0
          ${isSidebarOpen ? "translate-x-0" : "-translate-x-full"}
        `}
      >
        <div className="flex h-full flex-col px-3 py-4">
          <div className="relative mb-4 overflow-hidden rounded-[22px] border border-[var(--line)] bg-[linear-gradient(180deg,rgba(25,28,42,0.98),rgba(15,17,26,0.98))] px-4 py-4 shadow-[0_20px_40px_rgba(0,0,0,0.24)]">
            <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(122,149,255,0.18),transparent_42%)]" />

            <div className="relative flex items-start justify-between gap-3">
              <div className="flex min-w-0 items-center gap-3">
                <DashboardAvatar
                  label={activeGuild?.guildName ?? "Akbash Dashboard"}
                  imageUrl={activeGuild?.iconUrl}
                  className="h-11 w-11 rounded-[18px]"
                  sizes="44px"
                  priority
                />
                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold text-white">
                    {activeGuild?.guildName ?? "Akbash Dashboard"}
                  </p>
                  <p className="truncate text-[10px] uppercase tracking-[0.22em] text-[var(--text-faint)]">
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

            <div className="relative mt-4 flex items-center justify-between rounded-[16px] border border-white/6 bg-white/[0.03] px-3 py-2">
              <div>
                <p className="text-[10px] uppercase tracking-[0.18em] text-[var(--text-faint)]">
                  Runtime
                </p>
                <p className="text-xs font-medium text-white">
                  {activeGuild?.botPresent ? "Connected" : "Awaiting bot"}
                </p>
              </div>
              <span
                className={`inline-flex items-center gap-1 rounded-full border px-2 py-1 text-[10px] font-bold uppercase tracking-[0.16em] ${
                  activeGuild?.botPresent
                    ? "border-emerald-400/20 bg-emerald-400/10 text-emerald-100"
                    : "border-amber-300/20 bg-amber-400/10 text-amber-100"
                }`}
              >
                <span
                  className={`h-1.5 w-1.5 rounded-full ${
                    activeGuild?.botPresent ? "bg-emerald-300" : "bg-amber-300"
                  }`}
                />
                {activeGuild?.botPresent ? "Live" : "Setup"}
              </span>
            </div>
          </div>

          <nav className="sidebar-scrollbar flex-1 overflow-y-auto pr-1">
            {navGroups
              .filter((group) => groupedNavigation[group]?.length)
              .map((group) => (
                <div key={group} className="nav-section space-y-1.5">
                  <p className="nav-section__label">{group}</p>
                  <div className="space-y-1">
                    {groupedNavigation[group].map((item) => {
                      const isActive = pathname === item.href;
                      const isGuildDirectoryLink =
                        item.href.startsWith("/dashboard/") &&
                        /^\d+$/.test(item.href.split("/").at(-1) ?? "");

                      return (
                        <Link
                          key={item.href}
                          href={item.href}
                          className={`nav-button ${isActive ? "nav-button--active" : ""}`}
                          style={{ "--nav-accent": item.tone } as CSSProperties}
                          onClick={closeSidebar}
                          prefetch={isGuildDirectoryLink ? false : undefined}
                        >
                          <span className="nav-button__icon">
                            <item.icon className="h-[18px] w-[18px]" />
                          </span>
                          <span className="nav-button__meta">
                            <span className="truncate text-sm font-medium text-current">
                              {item.label}
                            </span>
                            <span className="nav-button__eyebrow">{item.eyebrow}</span>
                          </span>
                        </Link>
                      );
                    })}
                  </div>
                </div>
              ))}
          </nav>

          <div className="mt-4 space-y-4 border-t border-[var(--line)] px-2 pt-4">
            <div className="flex min-w-0 items-center gap-3 rounded-[18px] border border-white/6 bg-white/[0.03] px-3 py-3">
              <DashboardAvatar
                label={user.displayName}
                imageUrl={user.avatarUrl}
                className="h-10 w-10 rounded-[16px]"
                sizes="40px"
              />
              <div className="min-w-0">
                <p className="truncate text-sm font-semibold text-white">{user.displayName}</p>
                <p className="truncate text-[10px] uppercase tracking-[0.18em] text-[var(--text-faint)]">
                  Discord Session
                </p>
              </div>
            </div>

            <form action="/auth/signout" method="post">
              <button
                type="submit"
                className="group flex w-full items-center justify-between rounded-[16px] border border-[var(--line)] bg-[var(--bg-surface-elevated)] px-3 py-2.5 text-xs font-semibold text-[var(--text-muted)] transition-all hover:border-white/8 hover:bg-white/[0.05] hover:text-white"
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
