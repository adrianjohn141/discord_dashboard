import Link from "next/link";

import {
  ArrowRightIcon,
  BanIcon,
  CaseIcon,
  LogsIcon,
  WarningIcon,
} from "@/components/dashboard/icons";
import { requireDashboardGuildAccess } from "@/lib/dashboard/request-context";
import { getGuildDashboardSummary } from "@/lib/db/queries";

const compactDateFormatter = new Intl.DateTimeFormat("en", {
  month: "short",
  day: "numeric",
});

function formatShortDate(value: string | null) {
  if (!value) {
    return "No date";
  }

  return compactDateFormatter.format(new Date(value));
}

function formatCaseId(id: string) {
  return `#${id.padStart(6, "0")}`;
}

function formatActionLabel(action: string) {
  return action
    .replaceAll("_", " ")
    .replace(/\b\w/g, (letter) => letter.toUpperCase());
}

function getActionTone(action: string) {
  const normalized = action.toLowerCase();

  if (normalized.includes("ban")) {
    return {
      badge: "border-rose-400/20 bg-rose-500/10 text-rose-100",
      dot: "bg-rose-400",
    };
  }

  if (normalized.includes("warn")) {
    return {
      badge: "border-amber-300/20 bg-amber-400/10 text-amber-100",
      dot: "bg-amber-300",
    };
  }

  if (normalized.includes("timeout")) {
    return {
      badge: "border-emerald-300/20 bg-emerald-400/10 text-emerald-50",
      dot: "bg-emerald-300",
    };
  }

  return {
    badge: "border-indigo-300/20 bg-indigo-400/10 text-indigo-50",
    dot: "bg-indigo-300",
  };
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
  const reviewQueue = (
    summary.latestWarningCases ??
    ((summary as unknown as { latestWarnings?: unknown[] }).latestWarnings ?? [])
  ).slice(0, 3);
  const activityBars = [
    {
      label: "Warnings",
      value: summary.warningCount,
      color: "from-[#8fa7f0] to-[#6c85d3]",
    },
    {
      label: "Cases",
      value: summary.caseCount,
      color: "from-[#6b8fd7] to-[#4e6fb7]",
    },
    {
      label: "Temp Bans",
      value: summary.temporaryBanCount,
      color: "from-[#de9d55] to-[#c37a32]",
    },
    {
      label: "Temp Roles",
      value: summary.temporaryRoleCount,
      color: "from-[#cf7567] to-[#bb5c4f]",
    },
    {
      label: "Role Locks",
      value: summary.roleLockCount,
      color: "from-[#d66a62] to-[#ab3f43]",
    },
  ];
  const maxActivity = Math.max(1, ...activityBars.map((bar) => bar.value));
  const metrics = [
    {
      label: "Total Cases",
      value: summary.caseCount,
      copy: latestCases.length > 0
        ? `${latestCases.length} recent case records in view.`
        : "No moderation cases have been recorded yet.",
      icon: CaseIcon,
      iconTone: "text-[var(--accent-strong)]",
      surface: "from-[rgba(155,180,255,0.18)] via-transparent to-transparent",
    },
    {
      label: "Active Bans",
      value: summary.temporaryBanCount,
      copy: summary.temporaryBanCount > 0
        ? "Temporary bans are currently active in this guild."
        : "No temporary bans are active right now.",
      icon: BanIcon,
      iconTone: "text-[var(--danger)]",
      surface: "from-[rgba(224,138,122,0.18)] via-transparent to-transparent",
    },
    {
      label: "Warnings",
      value: summary.warningCount,
      copy: reviewQueue.length > 0
        ? `${reviewQueue.length} warning records need moderator review.`
        : "The warning queue is currently clear.",
      icon: WarningIcon,
      iconTone: "text-[var(--warning)]",
      surface: "from-[rgba(234,194,122,0.2)] via-transparent to-transparent",
    },
    {
      label: "Review Queue",
      value: reviewQueue.length,
      copy: summary.status?.lastHeartbeatAt
        ? `Runtime heartbeat received ${formatShortDate(summary.status.lastHeartbeatAt)}.`
        : "Runtime heartbeat has not been recorded yet.",
      icon: LogsIcon,
      iconTone: "text-[#dfe8ff]",
      surface: "from-[rgba(185,204,245,0.16)] via-transparent to-transparent",
    },
  ] as const;

  const automationRows = [
    {
      label: "Spam Detection",
      description: "Repeated message and burst suppression.",
      value: summary.config.antispam ? "Enabled" : "Disabled",
      tone: summary.config.antispam ? "success" : "default",
    },
    {
      label: "Invite Links",
      description: "Protect shared channels from outside invites.",
      value: summary.config.antiinvite ? "Blocked" : "Allowed",
      tone: summary.config.antiinvite ? "warning" : "default",
    },
    {
      label: "Link Filtering",
      description: "Suspicious outbound link screening.",
      value: summary.config.antilink ? "Enabled" : "Disabled",
      tone: summary.config.antilink ? "success" : "default",
    },
    {
      label: "Raid Protection",
      description: "High-risk join and abuse response posture.",
      value: summary.config.antiraid ? "Armed" : "Standby",
      tone: summary.config.antiraid ? "warning" : "default",
    },
  ] as const;

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Summary Stats */}
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {metrics.map((metric, idx) => (
          <div 
            key={metric.label} 
            className="metric-card bg-[var(--bg-surface)] border-[var(--line)] animate-slide-up"
            style={{ animationDelay: `${idx * 0.05}s` }}
          >
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm font-medium text-[var(--text-muted)]">{metric.label}</p>
                <p className="mt-2 text-3xl font-bold text-white tracking-tight">{metric.value}</p>
              </div>
              <div className="p-2 bg-[var(--bg-surface-elevated)] rounded-lg border border-[var(--line)]">
                <metric.icon className={`h-5 w-5 ${metric.iconTone}`} />
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Recent Cases Table */}
        <div className="lg:col-span-2 space-y-6">
          <div className="table-panel animate-slide-up" style={{ animationDelay: "0.2s" }}>
            <div className="flex items-center justify-between p-6 border-b border-[var(--line)]">
              <h2 className="text-lg font-semibold text-white">Recent Cases</h2>
              <Link
                href={`/dashboard/${guildId}/logs`}
                className="text-sm font-medium text-[var(--primary)] hover:underline flex items-center gap-1"
              >
                View All <ArrowRightIcon className="h-4 w-4" />
              </Link>
            </div>
            <div className="space-y-3 p-4 sm:hidden">
              {latestCases.length === 0 ? (
                <p className="rounded-[18px] border border-dashed border-[var(--line)] px-4 py-5 text-sm text-[var(--text-faint)]">
                  No recent moderation cases are available yet.
                </p>
              ) : (
                latestCases.map((log) => {
                  const actionTone = getActionTone(log.action);

                  return (
                    <div key={log.id} className="control-card rounded-[22px] p-4">
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <p className="text-[10px] uppercase tracking-[0.2em] text-[var(--text-faint)]">
                            Case ID
                          </p>
                          <p className="mt-1 font-mono text-sm text-white">{formatCaseId(log.id)}</p>
                          <p className="mt-2 text-xs text-[var(--text-muted)] uppercase">{log.status}</p>
                        </div>
                        <span className={`inline-flex items-center gap-1.5 rounded-full border px-2 py-0.5 text-[10px] font-bold uppercase ${actionTone.badge}`}>
                          <span className={`h-1.5 w-1.5 rounded-full ${actionTone.dot}`} />
                          {formatActionLabel(log.action)}
                        </span>
                      </div>
                      <div className="mt-4 grid gap-3">
                        <div>
                          <p className="text-[10px] uppercase tracking-[0.2em] text-[var(--text-faint)]">User</p>
                          <p className="mt-1 text-sm text-white">{log.userId}</p>
                        </div>
                        <div>
                          <p className="text-[10px] uppercase tracking-[0.2em] text-[var(--text-faint)]">Moderator</p>
                          <p className="mt-1 text-sm text-white">{log.moderatorId}</p>
                        </div>
                        <div>
                          <p className="text-[10px] uppercase tracking-[0.2em] text-[var(--text-faint)]">When</p>
                          <p className="mt-1 text-sm text-[var(--text-muted)]">{formatShortDate(log.createdAt)}</p>
                        </div>
                        <div>
                          <p className="text-[10px] uppercase tracking-[0.2em] text-[var(--text-faint)]">Evidence</p>
                          <p className="mt-1 text-sm text-[var(--text-muted)]">
                            {log.evidenceLinks.length > 0 ? `${log.evidenceLinks.length} link(s)` : "None"}
                          </p>
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            <div className="hidden overflow-x-auto scrollbar-thin sm:block">
              <table className="w-full min-w-[600px] text-left text-sm">
                <thead>
                  <tr className="text-[var(--text-faint)] font-medium uppercase tracking-wider text-[10px] border-b border-[var(--line)]">
                    <th className="px-6 py-4">Case ID</th>
                    <th className="px-6 py-4">User</th>
                    <th className="px-6 py-4">Action</th>
                    <th className="px-6 py-4">Status</th>
                    <th className="px-6 py-4">Moderator</th>
                    <th className="px-6 py-4 text-right">Date</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[var(--line)]">
                  {latestCases.map((log) => {
                    const actionTone = getActionTone(log.action);
                    return (
                      <tr key={log.id} className="hover:bg-[var(--bg-surface-elevated)] transition-colors">
                        <td className="px-6 py-4 text-[var(--text-faint)] font-mono">
                          {formatCaseId(log.id)}
                        </td>
                        <td className="px-6 py-4 font-medium text-[var(--primary)]">
                          {log.userId}
                        </td>
                        <td className="px-6 py-4">
                          <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full border text-[10px] font-bold uppercase ${actionTone.badge}`}>
                            <span className={`h-1.5 w-1.5 rounded-full ${actionTone.dot}`} />
                            {formatActionLabel(log.action)}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-[var(--text-muted)] uppercase">{log.status}</td>
                        <td className="px-6 py-4 text-white">{log.moderatorId}</td>
                        <td className="px-6 py-4 text-right text-[var(--text-muted)]">
                          {formatShortDate(log.createdAt)}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* Warnings Overview Chart */}
          <div className="table-panel p-6 animate-slide-up" style={{ animationDelay: "0.3s" }}>
            <h2 className="text-lg font-semibold text-white mb-6">Warnings Overview</h2>
            <div className="flex items-end gap-2 sm:gap-3 h-[200px]">
              {activityBars.map((bar) => (
                <div key={bar.label} className="flex-1 flex flex-col items-center gap-3">
                  <div 
                    className={`w-full max-w-[40px] rounded-t-lg bg-gradient-to-t ${bar.color} transition-all duration-1000 ease-out`}
                    style={{ height: `${(bar.value / maxActivity) * 100}%` }}
                  />
                  <p className="text-[10px] font-bold text-[var(--text-faint)] uppercase tracking-tighter">
                    {bar.label}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Sidebar Panels */}
        <div className="space-y-6">
          {/* AutoMod Settings */}
          <div className="table-panel animate-slide-up" style={{ animationDelay: "0.4s" }}>
            <div className="p-6 border-b border-[var(--line)]">
              <h2 className="text-lg font-semibold text-white">AutoMod Settings</h2>
            </div>
            <div className="p-2">
              {automationRows.map((row) => (
                <div key={row.label} className="flex items-center justify-between p-4 hover:bg-[var(--bg-surface-elevated)] rounded-lg group cursor-pointer transition-colors">
                  <div>
                    <p className="text-sm font-medium text-white">{row.label}</p>
                    <p className="text-xs text-[var(--text-faint)]">{row.value}</p>
                  </div>
                  <ArrowRightIcon className="h-4 w-4 text-[var(--text-faint)] group-hover:text-white transition-colors" />
                </div>
              ))}
            </div>
          </div>

          {/* Active Appeals / Review Queue */}
          <div className="table-panel animate-slide-up" style={{ animationDelay: "0.5s" }}>
            <div className="p-6 border-b border-[var(--line)]">
              <h2 className="text-lg font-semibold text-white">Review Queue</h2>
            </div>
            <div className="p-4 space-y-4">
              {reviewQueue.length === 0 ? (
                <p className="text-sm text-[var(--text-faint)] text-center py-4">No pending reviews</p>
              ) : (
                reviewQueue.map((warning) => (
                  <div key={warning.id} className="p-3 bg-[var(--bg-surface-elevated)] rounded-lg border border-[var(--line)]">
                    <div className="flex items-center justify-between mb-2">
                      <p className="text-xs font-bold text-white">Appeal {formatCaseId(warning.id)}</p>
                      <span className="text-[10px] font-bold text-[var(--text-faint)] uppercase">{warning.status}</span>
                    </div>
                    <p className="text-xs text-[var(--text-muted)]">User: {warning.userId}</p>
                    <p className="mt-1 text-xs text-[var(--text-faint)]">{warning.reason}</p>
                  </div>
                ))
              )}
              <Link
                href={`/dashboard/${guildId}/logs`}
                className="secondary-button w-full text-sm"
              >
                Manage Appeals
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
