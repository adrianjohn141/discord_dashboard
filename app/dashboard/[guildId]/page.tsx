import Link from "next/link";
import type { ReactNode } from "react";

import {
  AppealIcon,
  ArrowRightIcon,
  AutomationIcon,
  BanIcon,
  CaseIcon,
  ChartIcon,
  EvidenceIcon,
  ExternalLinkIcon,
  LogsIcon,
  PulseIcon,
  QueueIcon,
  ShieldIcon,
  TemporaryIcon,
  WarningIcon,
} from "@/components/dashboard/icons";
import { StatusPill } from "@/components/dashboard/status-pill";
import { getGuildDashboardSummary } from "@/lib/db/queries";
import { requireDashboardGuildAccess } from "@/lib/dashboard/request-context";
import type { AppealRecord, ModerationCaseRecord } from "@/types/dashboard";

const compactDateFormatter = new Intl.DateTimeFormat("en", {
  month: "short",
  day: "numeric",
});

type IconComponent = (props: { className?: string }) => ReactNode;

function formatShortDate(value: string | null) {
  if (!value) {
    return "No date";
  }

  return compactDateFormatter.format(new Date(value));
}

function formatCaseId(caseRef: string | null, id: string) {
  if (caseRef) {
    return caseRef;
  }

  return `#${id.padStart(6, "0")}`;
}

function formatAppealId(appealRef: string | null, id: string) {
  if (appealRef) {
    return appealRef;
  }

  return `A${id.padStart(6, "0")}`;
}

function formatActionLabel(action: string) {
  return action
    .replaceAll("_", " ")
    .replace(/\b\w/g, (letter) => letter.toUpperCase());
}

function formatIdentityLabel(identity: string) {
  if (identity.length <= 12) {
    return identity;
  }

  return `${identity.slice(0, 5)}...${identity.slice(-4)}`;
}

function formatIdentityToken(kind: "User" | "Moderator", identity: string) {
  return `${kind === "User" ? "U" : "M"}${identity.slice(-2)}`;
}

function formatOriginLabel(origin: ModerationCaseRecord["origin"]) {
  switch (origin) {
    case "auto_anti_abuse":
      return "Auto abuse";
    case "auto_antiraid":
      return "Anti-raid";
    case "system":
      return "System";
    default:
      return "Manual";
  }
}

function getIdentityTone(identity: string) {
  const tones = [
    "border-sky-400/20 bg-sky-400/10 text-sky-100",
    "border-violet-400/20 bg-violet-400/10 text-violet-100",
    "border-emerald-400/20 bg-emerald-400/10 text-emerald-100",
    "border-amber-300/20 bg-amber-400/10 text-amber-100",
  ];

  const seed = identity
    .split("")
    .reduce((total, character) => total + character.charCodeAt(0), 0);

  return tones[seed % tones.length];
}

function getActionMeta(action: string): {
  icon: IconComponent;
  badgeClass: string;
  railClass: string;
  glowClass: string;
} {
  const normalized = action.toLowerCase();

  if (normalized.includes("appeal")) {
    return {
      icon: AppealIcon,
      badgeClass: "border-emerald-400/20 bg-emerald-400/10 text-emerald-50",
      railClass: "from-emerald-300 via-emerald-400 to-transparent",
      glowClass: "bg-emerald-400/20",
    };
  }

  if (normalized.includes("untimeout") || normalized.includes("unban")) {
    return {
      icon: ShieldIcon,
      badgeClass: "border-cyan-400/20 bg-cyan-400/10 text-cyan-50",
      railClass: "from-cyan-300 via-cyan-400 to-transparent",
      glowClass: "bg-cyan-400/20",
    };
  }

  if (normalized.includes("ban")) {
    return {
      icon: BanIcon,
      badgeClass: "border-rose-400/20 bg-rose-500/10 text-rose-100",
      railClass: "from-rose-300 via-rose-400 to-transparent",
      glowClass: "bg-rose-400/20",
    };
  }

  if (normalized.includes("warn")) {
    return {
      icon: WarningIcon,
      badgeClass: "border-amber-300/20 bg-amber-400/10 text-amber-100",
      railClass: "from-amber-200 via-amber-300 to-transparent",
      glowClass: "bg-amber-300/20",
    };
  }

  if (normalized.includes("timeout")) {
    return {
      icon: TemporaryIcon,
      badgeClass: "border-orange-300/20 bg-orange-400/10 text-orange-100",
      railClass: "from-orange-200 via-orange-300 to-transparent",
      glowClass: "bg-orange-300/20",
    };
  }

  return {
    icon: LogsIcon,
    badgeClass: "border-indigo-300/20 bg-indigo-400/10 text-indigo-50",
    railClass: "from-indigo-200 via-indigo-300 to-transparent",
    glowClass: "bg-indigo-300/20",
  };
}

function getStatusTone(
  status: ModerationCaseRecord["status"] | AppealRecord["status"],
): "default" | "success" | "warning" | "danger" {
  if (status === "resolved" || status === "accepted") {
    return "success";
  }

  if (status === "open" || status === "pending") {
    return "warning";
  }

  if (status === "voided" || status === "denied") {
    return "danger";
  }

  return "default";
}

function PanelHeader({
  kicker,
  title,
  icon,
  href,
  actionLabel,
}: {
  kicker: string;
  title: string;
  icon: ReactNode;
  href?: string;
  actionLabel?: string;
}) {
  return (
    <div className="relative flex items-center justify-between gap-4 border-b border-[var(--line)] px-6 py-5">
      <div className="flex min-w-0 items-center gap-4">
        <span className="dashboard-section-icon shrink-0">{icon}</span>
        <div className="min-w-0">
          <p className="dashboard-header-kicker">{kicker}</p>
          <h2 className="mt-1 text-lg font-semibold text-white">{title}</h2>
        </div>
      </div>

      {href && actionLabel ? (
        <Link
          href={href}
          className="group inline-flex items-center gap-2 text-sm font-medium text-[var(--accent-strong)] transition-colors hover:text-white"
        >
          {actionLabel}
          <ArrowRightIcon className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
        </Link>
      ) : null}
    </div>
  );
}

function IdentityBadge({
  kind,
  identity,
}: {
  kind: "User" | "Moderator";
  identity: string;
}) {
  const toneClass = getIdentityTone(identity);

  return (
    <div className="flex min-w-0 items-center gap-3">
      <span
        className={`inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-[14px] border text-[11px] font-bold uppercase ${toneClass}`}
      >
        {formatIdentityToken(kind, identity)}
      </span>
      <div className="min-w-0">
        <p className="truncate text-sm font-semibold text-white">
          {formatIdentityLabel(identity)}
        </p>
        <p className="text-[10px] uppercase tracking-[0.18em] text-[var(--text-faint)]">
          {kind}
        </p>
      </div>
    </div>
  );
}

export default async function GuildOverviewPage({
  params,
}: {
  params: Promise<{ guildId: string }>;
}) {
  const { guildId } = await params;
  await requireDashboardGuildAccess(guildId);
  const summary = await getGuildDashboardSummary(guildId);

  const latestCases = (
    summary.latestCases ??
    ((summary as unknown as { latestModerationLogs?: unknown[] }).latestModerationLogs ?? [])
  ).slice(0, 3);
  const latestWarningCases = (summary.latestWarningCases ?? []).slice(0, 2);
  const reviewQueue = (summary.latestAppeals ?? [])
    .filter((appeal) => appeal.status === "pending")
    .slice(0, 2);
  const pendingAppealCount = Number(summary.pendingAppealCount ?? 0);

  const activityBars = [
    { label: "Warnings", value: summary.warningCount, color: "from-[#ffe08a] to-[#f0b232]" },
    { label: "Cases", value: summary.caseCount, color: "from-[#a6b7ff] to-[#6f8fff]" },
    { label: "Temp Bans", value: summary.temporaryBanCount, color: "from-[#ff9d88] to-[#f2675c]" },
    { label: "Temp Roles", value: summary.temporaryRoleCount, color: "from-[#7fe1d5] to-[#33b8b0]" },
    { label: "Role Locks", value: summary.roleLockCount, color: "from-[#d7a7ff] to-[#9e72ff]" },
  ];

  const maxActivity = Math.max(1, ...activityBars.map((bar) => bar.value));

  const metrics = [
    {
      label: "Total Cases",
      value: summary.caseCount,
      copy:
        latestCases.length > 0
          ? `${latestCases.length} recent case records are highlighted below.`
          : "No moderation cases have been recorded yet.",
      icon: CaseIcon,
      accent: "#90a7ff",
      iconClass: "text-[#dfe7ff]",
      glowClass: "bg-[#6f8fff]",
    },
    {
      label: "Active Bans",
      value: summary.temporaryBanCount,
      copy:
        summary.temporaryBanCount > 0
          ? "Temporary bans are currently active in this guild."
          : "No temporary bans are active right now.",
      icon: BanIcon,
      accent: "#ff8f7d",
      iconClass: "text-rose-100",
      glowClass: "bg-rose-500",
    },
    {
      label: "Warnings",
      value: summary.warningCount,
      copy:
        summary.warningCount > 0
          ? "Warnings are still open and should be reviewed by staff."
          : "The warning queue is currently clear.",
      icon: WarningIcon,
      accent: "#ffd36d",
      iconClass: "text-amber-100",
      glowClass: "bg-amber-400",
    },
    {
      label: "Review Queue",
      value: pendingAppealCount,
      copy: summary.status?.lastHeartbeatAt
        ? `Runtime heartbeat was recorded on ${formatShortDate(summary.status.lastHeartbeatAt)}.`
        : "Runtime heartbeat has not been recorded yet.",
      icon: QueueIcon,
      accent: "#7fe1d5",
      iconClass: "text-cyan-100",
      glowClass: "bg-cyan-400",
    },
  ] as const;

  const automationRows = [
    {
      label: "Spam Detection",
      description: "Repeated message and burst suppression.",
      value: summary.config.antispam ? "Enabled" : "Disabled",
      tone: summary.config.antispam ? "success" : "default",
      icon: PulseIcon,
    },
    {
      label: "Invite Links",
      description: "Protect shared channels from outside invites.",
      value: summary.config.antiinvite ? "Blocked" : "Allowed",
      tone: summary.config.antiinvite ? "warning" : "default",
      icon: ExternalLinkIcon,
    },
    {
      label: "Link Filtering",
      description: "Suspicious outbound link screening.",
      value: summary.config.antilink ? "Enabled" : "Disabled",
      tone: summary.config.antilink ? "success" : "default",
      icon: EvidenceIcon,
    },
    {
      label: "Raid Protection",
      description: "High-risk join and abuse response posture.",
      value: summary.config.antiraid ? "Armed" : "Standby",
      tone: summary.config.antiraid ? "warning" : "default",
      icon: ShieldIcon,
    },
  ] as const;

  return (
    <div className="space-y-6 animate-fade-in">
      <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {metrics.map((metric, idx) => (
          <div
            key={metric.label}
            className="dashboard-metric-card dashboard-metric-card--compact animate-slide-up"
            style={{ animationDelay: `${idx * 0.05}s` }}
          >
            <span
              className="dashboard-metric-card__bar"
              style={{
                background: `linear-gradient(180deg, ${metric.accent} 0%, transparent 100%)`,
              }}
            />
            <span
              className={`dashboard-metric-card__glow ${metric.glowClass}`}
              aria-hidden="true"
            />

            <div className="relative flex items-start justify-between gap-4">
              <div className="min-w-0">
                <p className="dashboard-header-kicker">{metric.label}</p>
                <p className="mt-2 text-3xl font-semibold tracking-tight text-white xl:text-[2rem]">
                  {metric.value}
                </p>
                <p className="mt-2 max-w-[16rem] text-xs leading-5 text-[var(--text-muted)] lg:text-[13px]">
                  {metric.copy}
                </p>
              </div>

              <span className="dashboard-section-icon h-10 w-10 shrink-0 rounded-[14px]">
                <metric.icon className={`h-4.5 w-4.5 ${metric.iconClass}`} />
              </span>
            </div>
          </div>
        ))}
      </section>

      <section className="grid gap-5 xl:grid-cols-[minmax(0,1.55fr)_minmax(300px,0.88fr)]">
        <div className="space-y-5">
          <div
            className="dashboard-panel dashboard-panel--compact dashboard-panel--interactive animate-slide-up"
            style={{ animationDelay: "0.2s" }}
          >
            <div className="pointer-events-none absolute inset-y-6 left-0 w-[3px] rounded-full bg-gradient-to-b from-[#9bb4ff] via-[#61b7ff] to-transparent" />
            <PanelHeader
              kicker="Moderation Flow"
              title="Recent Cases"
              icon={<CaseIcon className="h-5 w-5" />}
              href={`/dashboard/${guildId}/logs`}
              actionLabel="View all"
            />

            <div className="space-y-3 p-4 sm:hidden">
              {latestCases.length === 0 ? (
                <p className="rounded-[18px] border border-dashed border-[var(--line)] px-4 py-5 text-sm text-[var(--text-faint)]">
                  No recent moderation cases are available yet.
                </p>
              ) : (
                latestCases.map((log) => {
                  const actionMeta = getActionMeta(log.action);
                  const ActionIcon = actionMeta.icon;

                  return (
                    <div
                      key={log.id}
                      className="relative overflow-hidden rounded-[22px] border border-[var(--line)] bg-white/[0.03] p-4"
                    >
                      <div
                        className={`pointer-events-none absolute inset-y-4 left-0 w-[3px] rounded-full bg-gradient-to-b ${actionMeta.railClass}`}
                      />
                      <span
                        className={`pointer-events-none absolute -right-8 -top-8 h-24 w-24 rounded-full blur-3xl ${actionMeta.glowClass}`}
                        aria-hidden="true"
                      />

                      <div className="relative flex items-start justify-between gap-3">
                        <div>
                          <p className="text-[10px] uppercase tracking-[0.22em] text-[var(--text-faint)]">
                            Case ID
                          </p>
                          <p className="mt-1 font-mono text-sm text-white">
                            {formatCaseId(log.caseRef, log.id)}
                          </p>
                          <p className="mt-2 text-xs text-[var(--text-muted)]">
                            {formatOriginLabel(log.origin)}
                          </p>
                        </div>
                        <span
                          className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.16em] ${actionMeta.badgeClass}`}
                        >
                          <ActionIcon className="h-3.5 w-3.5" />
                          {formatActionLabel(log.action)}
                        </span>
                      </div>

                      <div className="mt-4 grid gap-3">
                        <IdentityBadge kind="User" identity={log.userId} />
                        <IdentityBadge kind="Moderator" identity={log.moderatorId} />
                        <div className="flex items-center justify-between gap-3 text-xs">
                          <StatusPill tone={getStatusTone(log.status)}>{log.status}</StatusPill>
                          <span className="text-[var(--text-muted)]">
                            {formatShortDate(log.createdAt)}
                          </span>
                        </div>
                        <div className="rounded-[16px] border border-white/6 bg-black/10 px-3 py-3">
                          <p className="text-[10px] uppercase tracking-[0.2em] text-[var(--text-faint)]">
                            Summary
                          </p>
                          <p className="mt-2 text-sm leading-6 text-[var(--text-muted)]">
                            {log.reason}
                          </p>
                          <p className="mt-3 text-[11px] text-[var(--text-faint)]">
                            Evidence:{" "}
                            {log.evidenceLinks.length > 0
                              ? `${log.evidenceLinks.length} linked item(s)`
                              : "No linked evidence"}
                          </p>
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            <div className="hidden overflow-x-auto sm:block">
              <table className="w-full min-w-[780px] text-left text-sm">
                <thead>
                  <tr className="border-b border-[var(--line)] text-[10px] font-bold uppercase tracking-[0.24em] text-[var(--text-faint)]">
                    <th className="px-6 py-4">Case</th>
                    <th className="px-6 py-4">Member</th>
                    <th className="px-6 py-4">Action</th>
                    <th className="px-6 py-4">Status</th>
                    <th className="px-6 py-4">Moderator</th>
                    <th className="px-6 py-4 text-right">Opened</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[var(--line)]">
                  {latestCases.length === 0 ? (
                    <tr>
                      <td
                        colSpan={6}
                        className="px-6 py-10 text-center text-sm text-[var(--text-faint)]"
                      >
                        No recent moderation cases are available yet.
                      </td>
                    </tr>
                  ) : (
                    latestCases.map((log) => {
                      const actionMeta = getActionMeta(log.action);
                      const ActionIcon = actionMeta.icon;

                      return (
                        <tr
                          key={log.id}
                          className="transition-colors hover:bg-white/[0.025]"
                        >
                          <td className="px-6 py-4 align-top">
                            <div className="min-w-0">
                              <p className="font-mono text-sm text-white">
                                {formatCaseId(log.caseRef, log.id)}
                              </p>
                              <p className="mt-1 text-xs text-[var(--text-faint)]">
                                {formatOriginLabel(log.origin)} ·{" "}
                                {log.evidenceLinks.length > 0
                                  ? `${log.evidenceLinks.length} evidence`
                                  : "No evidence"}
                              </p>
                            </div>
                          </td>
                          <td className="px-6 py-4 align-top">
                            <IdentityBadge kind="User" identity={log.userId} />
                          </td>
                          <td className="px-6 py-4 align-top">
                            <div className="flex max-w-[240px] flex-col gap-2">
                              <span
                                className={`inline-flex w-fit items-center gap-1.5 rounded-full border px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.16em] ${actionMeta.badgeClass}`}
                              >
                                <ActionIcon className="h-3.5 w-3.5" />
                                {formatActionLabel(log.action)}
                              </span>
                              <p className="line-clamp-2 text-sm leading-6 text-[var(--text-muted)]">
                                {log.reason}
                              </p>
                            </div>
                          </td>
                          <td className="px-6 py-4 align-top">
                            <StatusPill tone={getStatusTone(log.status)}>{log.status}</StatusPill>
                          </td>
                          <td className="px-6 py-4 align-top">
                            <IdentityBadge kind="Moderator" identity={log.moderatorId} />
                          </td>
                          <td className="px-6 py-4 text-right align-top">
                            <p className="text-sm font-medium text-white">
                              {formatShortDate(log.createdAt)}
                            </p>
                            <p className="mt-1 text-xs text-[var(--text-faint)]">
                              Updated {formatShortDate(log.updatedAt)}
                            </p>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>

          <div
            className="dashboard-panel dashboard-panel--compact dashboard-panel--interactive animate-slide-up"
            style={{ animationDelay: "0.3s" }}
          >
            <div className="pointer-events-none absolute inset-y-6 left-0 w-[3px] rounded-full bg-gradient-to-b from-[#ffd36d] via-[#ff9f4d] to-transparent" />
            <PanelHeader
              kicker="Signal Strength"
              title="Warnings Overview"
              icon={<ChartIcon className="h-5 w-5" />}
            />

            <div className="grid gap-4 p-5 lg:grid-cols-[minmax(0,1.2fr)_minmax(230px,0.9fr)]">
              <div>
                <div className="grid grid-cols-5 items-end gap-2 rounded-[20px] border border-white/6 bg-black/10 px-3 pb-3 pt-4">
                  {activityBars.map((bar) => (
                    <div key={bar.label} className="flex min-w-0 flex-col items-center gap-2">
                      <span className="text-xs font-semibold text-white">{bar.value}</span>
                      <div className="flex h-[132px] w-full max-w-[44px] items-end rounded-full bg-white/[0.04] p-1">
                        <div
                          className={`w-full rounded-full bg-gradient-to-t ${bar.color} shadow-[0_10px_22px_rgba(0,0,0,0.25)] transition-all duration-700 ease-out`}
                          style={{
                            height: `${bar.value === 0 ? 12 : Math.max(18, (bar.value / maxActivity) * 100)}%`,
                          }}
                        />
                      </div>
                      <p className="text-center text-[10px] font-bold uppercase tracking-[0.16em] text-[var(--text-faint)]">
                        {bar.label}
                      </p>
                    </div>
                  ))}
                </div>

                <div className="mt-3 grid gap-2 sm:grid-cols-3">
                  <div className="rounded-[16px] border border-amber-300/12 bg-amber-400/[0.06] px-3 py-2.5">
                    <p className="text-[10px] uppercase tracking-[0.2em] text-amber-100/80">
                      Open Warnings
                    </p>
                    <p className="mt-1.5 text-xl font-semibold text-white">{summary.warningCount}</p>
                  </div>
                  <div className="rounded-[16px] border border-cyan-300/12 bg-cyan-400/[0.06] px-3 py-2.5">
                    <p className="text-[10px] uppercase tracking-[0.2em] text-cyan-100/80">
                      Temp Roles
                    </p>
                    <p className="mt-1.5 text-xl font-semibold text-white">
                      {summary.temporaryRoleCount}
                    </p>
                  </div>
                  <div className="rounded-[16px] border border-violet-300/12 bg-violet-400/[0.06] px-3 py-2.5">
                    <p className="text-[10px] uppercase tracking-[0.2em] text-violet-100/80">
                      Role Locks
                    </p>
                    <p className="mt-1.5 text-xl font-semibold text-white">
                      {summary.roleLockCount}
                    </p>
                  </div>
                </div>
              </div>

              <div className="rounded-[20px] border border-white/6 bg-white/[0.03] p-3.5">
                <div className="flex items-center gap-3">
                  <span className="dashboard-section-icon h-10 w-10 rounded-[14px]">
                    <WarningIcon className="h-4.5 w-4.5" />
                  </span>
                  <div>
                    <p className="dashboard-header-kicker">Priority Watchlist</p>
                    <p className="mt-1 text-sm font-semibold text-white">
                      Latest warning records
                    </p>
                  </div>
                </div>

                <div className="mt-3 space-y-2.5">
                  {latestWarningCases.length === 0 ? (
                    <p className="rounded-[16px] border border-dashed border-[var(--line)] px-4 py-5 text-sm text-[var(--text-faint)]">
                      No open warning cases are waiting for review.
                    </p>
                  ) : (
                    latestWarningCases.map((warningCase) => (
                      <div
                        key={warningCase.id}
                        className="rounded-[16px] border border-white/6 bg-black/10 px-3.5 py-3"
                      >
                        <div className="flex items-center justify-between gap-3">
                          <p className="text-sm font-semibold text-white">
                            {formatCaseId(warningCase.caseRef, warningCase.id)}
                          </p>
                          <StatusPill tone={getStatusTone(warningCase.status)}>
                            {warningCase.status}
                          </StatusPill>
                        </div>
                        <p className="mt-3 text-xs uppercase tracking-[0.16em] text-[var(--text-faint)]">
                          Member
                        </p>
                        <p className="mt-1 text-sm text-white">
                          {formatIdentityLabel(warningCase.userId)}
                        </p>
                        <p className="mt-2.5 line-clamp-2 text-sm leading-5 text-[var(--text-muted)]">
                          {warningCase.reason}
                        </p>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-5">
          <div
            className="dashboard-panel dashboard-panel--compact dashboard-panel--interactive animate-slide-up"
            style={{ animationDelay: "0.4s" }}
          >
            <div className="pointer-events-none absolute inset-y-6 left-0 w-[3px] rounded-full bg-gradient-to-b from-[#7fe1d5] via-[#40c9b7] to-transparent" />
            <PanelHeader
              kicker="Safety Controls"
              title="AutoMod Settings"
              icon={<AutomationIcon className="h-5 w-5" />}
              href={`/dashboard/${guildId}/automation`}
              actionLabel="Configure"
            />

            <div className="space-y-1.5 p-2.5">
              {automationRows.map((row) => (
                <Link
                  key={row.label}
                  href={`/dashboard/${guildId}/automation`}
                  className="group flex items-center justify-between gap-3 rounded-[16px] border border-transparent px-3 py-2.5 transition-all hover:border-white/6 hover:bg-white/[0.04]"
                >
                  <div className="flex min-w-0 items-center gap-3">
                    <span className="dashboard-section-icon h-10 w-10 rounded-[14px]">
                      <row.icon className="h-4.5 w-4.5" />
                    </span>
                    <div className="min-w-0">
                      <p className="truncate text-sm font-semibold text-white">{row.label}</p>
                      <p className="mt-0.5 text-xs leading-4.5 text-[var(--text-muted)]">
                        {row.description}
                      </p>
                    </div>
                  </div>

                  <div className="flex shrink-0 items-center gap-3">
                    <StatusPill tone={row.tone}>{row.value}</StatusPill>
                    <ArrowRightIcon className="h-4 w-4 text-[var(--text-faint)] transition-colors group-hover:text-white" />
                  </div>
                </Link>
              ))}
            </div>
          </div>

          <div
            className="dashboard-panel dashboard-panel--compact dashboard-panel--interactive animate-slide-up"
            style={{ animationDelay: "0.5s" }}
          >
            <div className="pointer-events-none absolute inset-y-6 left-0 w-[3px] rounded-full bg-gradient-to-b from-[#ffc97d] via-[#ff9e4b] to-transparent" />
            <PanelHeader
              kicker="Triage"
              title="Review Queue"
              icon={<QueueIcon className="h-5 w-5" />}
              href={`/dashboard/${guildId}/appeals`}
              actionLabel="Manage"
            />

            <div className="space-y-3 p-3.5">
              {reviewQueue.length === 0 ? (
                <div className="rounded-[18px] border border-dashed border-[var(--line)] px-4 py-6 text-center">
                  <p className="text-sm font-medium text-white">No pending reviews</p>
                  <p className="mt-2 text-sm leading-6 text-[var(--text-faint)]">
                    Appeals will appear here as soon as users submit them.
                  </p>
                </div>
              ) : (
                reviewQueue.map((appeal) => {
                  const TypeIcon = appeal.appealType === "ban" ? BanIcon : TemporaryIcon;

                  return (
                    <div
                      key={appeal.id}
                      className="rounded-[18px] border border-white/6 bg-white/[0.03] p-3.5"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex items-center gap-3">
                          <span className="dashboard-section-icon h-10 w-10 rounded-[14px]">
                            <TypeIcon className="h-4.5 w-4.5" />
                          </span>
                          <div>
                            <p className="text-sm font-semibold text-white">
                              Appeal {formatAppealId(appeal.appealRef, appeal.id)}
                            </p>
                            <p className="mt-1 text-[10px] uppercase tracking-[0.18em] text-[var(--text-faint)]">
                              {appeal.appealType} review
                            </p>
                          </div>
                        </div>
                        <StatusPill tone={getStatusTone(appeal.status)}>
                          {appeal.status}
                        </StatusPill>
                      </div>

                      <div className="mt-3">
                        <IdentityBadge kind="User" identity={appeal.userId} />
                      </div>

                      <div className="mt-3 rounded-[15px] border border-white/6 bg-black/10 px-3 py-2.5">
                        <p className="text-[10px] uppercase tracking-[0.2em] text-[var(--text-faint)]">
                          Appeal reason
                        </p>
                        <p className="mt-1.5 line-clamp-2 text-sm leading-5 text-[var(--text-muted)]">
                          {appeal.reason}
                        </p>
                      </div>

                      <div className="mt-3 flex items-center justify-between gap-3 text-xs">
                        <span className="text-[var(--text-faint)]">
                          Opened {formatShortDate(appeal.createdAt)}
                        </span>
                        <span className="text-[var(--text-muted)]">
                          {appeal.caseRef ? `Linked to ${appeal.caseRef}` : "No linked case"}
                        </span>
                      </div>
                    </div>
                  );
                })
              )}

              <Link
                href={`/dashboard/${guildId}/appeals`}
                className="secondary-button w-full justify-between text-sm"
              >
                Open full appeals queue
                <ArrowRightIcon className="h-4 w-4" />
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
