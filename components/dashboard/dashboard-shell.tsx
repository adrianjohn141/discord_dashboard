"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { RefreshAccessButton } from "@/components/dashboard/refresh-access-button";
import {
  ArrowRightIcon,
  AutomationIcon,
  BrandMark,
  ExternalLinkIcon,
  GuildsIcon,
  LogsIcon,
  LogOutIcon,
  OverviewIcon,
  SettingsIcon,
  TemporaryIcon,
  TerminalIcon,
} from "@/components/dashboard/icons";
import { StatusPill } from "@/components/dashboard/status-pill";
import { getBotInviteUrl } from "@/lib/discord/invite";
import type { AccessibleGuild, DashboardUser } from "@/types/dashboard";

interface DashboardShellProps {
  user: DashboardUser;
  guilds: AccessibleGuild[];
  children: React.ReactNode;
}

interface NavigationItem {
  href: string;
  label: string;
  icon: (props: { className?: string }) => React.ReactNode;
}

function buildNavigation(activeGuildId: string | null): NavigationItem[] {
  const items: NavigationItem[] = [{ href: "/dashboard", label: "Guild Management", icon: GuildsIcon }];

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

function getGuildInitials(name: string) {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  return parts.slice(0, 2).map((part) => part[0]?.toUpperCase()).join("") || "SG";
}

function getPageMeta(pathname: string, activeGuild: AccessibleGuild | null) {
  if (!activeGuild) {
    return {
      section: "Guild Directory",
      shellTitle: "Akbash Moderation Dashboard",
    };
  }

  if (pathname.endsWith("/settings")) {
    return {
      section: "Guild Settings",
      shellTitle: "Akbash Moderation Dashboard",
    };
  }

  if (pathname.endsWith("/automation")) {
    return {
      section: "AutoMod Settings",
      shellTitle: "Akbash Moderation Dashboard",
    };
  }

  if (pathname.endsWith("/logs")) {
    return {
      section: "Moderation Logs",
      shellTitle: "Akbash Moderation Dashboard",
    };
  }

  if (pathname.endsWith("/temporary-actions")) {
    return {
      section: "Temporary Actions",
      shellTitle: "Akbash Moderation Dashboard",
    };
  }

  return {
    section: "Guild Overview",
    shellTitle: "Akbash Moderation Dashboard",
  };
}

function IdentityAvatar({
  label,
  imageUrl,
  roundedClassName,
}: {
  label: string;
  imageUrl: string | null | undefined;
  roundedClassName: string;
}) {
  return (
    <div
      className={`brand-badge overflow-hidden text-sm font-semibold text-white ${roundedClassName}`}
    >
      {imageUrl ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img alt={label} src={imageUrl} className="h-full w-full object-cover" />
      ) : (
        <span>{getGuildInitials(label)}</span>
      )}
    </div>
  );
}

function getActiveGuildSummary(activeGuild: AccessibleGuild | null) {
  if (!activeGuild) {
    return "Browse all manageable guilds and open a control room.";
  }

  if (!activeGuild.botPresent) {
    return "Bot installation is still required before moderation controls unlock.";
  }

  if (activeGuild.lastHeartbeatAt) {
    return "Bot runtime is online and reporting heartbeat data.";
  }

  return "Bot is installed and waiting for its first runtime heartbeat.";
}

export function DashboardShell({ user, guilds, children }: DashboardShellProps) {
  const pathname = usePathname();
  const activeGuildId =
    pathname.split("/").find((segment) => /^\d+$/.test(segment)) ?? null;
  const activeGuild = guilds.find((guild) => guild.guildId === activeGuildId) ?? null;
  const pageMeta = getPageMeta(pathname, activeGuild);
  const navigation = buildNavigation(activeGuildId);
  const firstName = user.displayName.split(" ")[0] || user.displayName;

  return (
    <div className="app-shell flex h-screen overflow-hidden bg-[var(--bg)]">
      {/* Sidebar */}
      <aside className="dashboard-sidebar hidden w-64 flex-col lg:flex">
        <div className="flex flex-col h-full px-3 py-4">
          {/* Guild Selector Placeholder / Brand */}
          <div className="flex items-center gap-3 px-3 py-4 mb-4 bg-[var(--bg-surface-elevated)] rounded-[var(--radius)] border border-[var(--line)]">
            <div className="h-8 w-8 rounded-[8px] overflow-hidden flex-shrink-0">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/Akbash -1.png" alt="Akbash Logo" className="h-full w-full object-cover" />
            </div>
            <div className="min-w-0">
              <p className="truncate text-sm font-semibold text-white">
                {activeGuild?.guildName ?? "Select Server"}
              </p>
            </div>
          </div>

          <nav className="flex-1 space-y-1">
            {navigation.map((item) => {
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`nav-button ${isActive ? "nav-button--active" : ""}`}
                >
                  <item.icon className="h-5 w-5" />
                  <span className="text-sm font-medium">{item.label}</span>
                </Link>
              );
            })}
          </nav>

          {/* User Profile */}
          <div className="mt-auto px-3 py-4 border-t border-[var(--line)] space-y-4">
            <div className="flex items-center gap-3 min-w-0 px-1">
              <IdentityAvatar
                label={user.displayName}
                imageUrl={user.avatarUrl}
                roundedClassName="h-8 w-8 rounded-full"
              />
              <div className="min-w-0">
                <p className="truncate text-sm font-semibold text-white">{user.displayName}</p>
                <p className="truncate text-[10px] text-[var(--text-faint)]">Discord Session</p>
              </div>
            </div>
            
            <form action="/auth/signout" method="post">
              <button 
                type="submit" 
                className="w-full flex items-center justify-between px-3 py-2 text-xs font-semibold text-[var(--text-muted)] hover:text-white bg-[var(--bg-surface-elevated)] hover:bg-[var(--line)] border border-[var(--line)] rounded-[var(--radius)] transition-all group"
              >
                <span className="flex items-center gap-2">
                  <LogOutIcon className="h-4 w-4" />
                  Log Out
                </span>
                <ArrowRightIcon className="h-3 w-3 opacity-0 group-hover:opacity-100 transition-opacity" />
              </button>
            </form>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Header */}
        <header className="dashboard-topbar h-16 flex items-center justify-between px-6">
          <h1 className="text-xl font-semibold text-white">
            {pageMeta.shellTitle}
          </h1>

          <div className="flex items-center gap-4">
            <div className="flex items-center gap-3">
              <p className="text-sm text-[var(--text-muted)] hidden sm:block">
                Welcome, {firstName}
              </p>
              <IdentityAvatar
                label={user.displayName}
                imageUrl={user.avatarUrl}
                roundedClassName="h-8 w-8 rounded-full"
              />
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto p-6 scrollbar-thin">
          <div className="max-w-[1400px] mx-auto">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
