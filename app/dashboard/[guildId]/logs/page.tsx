import { LogTable } from "@/components/logs/log-table";
import { AutoRefresh } from "@/components/dashboard/auto-refresh";
import { requireDashboardGuildAccess } from "@/lib/dashboard/request-context";
import { getGuildLogs, getManagedGuildStatus } from "@/lib/db/queries";

// Force Next.js to always fetch fresh data for this route
export const dynamic = "force-dynamic";

const dateFormatter = new Intl.DateTimeFormat("en", {
  dateStyle: "medium",
  timeStyle: "short",
});

function formatDate(value: string | null) {
  if (!value) {
    return "Not available";
  }

  return dateFormatter.format(new Date(value));
}

export default async function GuildLogsPage({
  params,
  searchParams,
}: {
  params: Promise<{ guildId: string }>;
  searchParams: Promise<{ action?: string }>;
}) {
  const { guildId } = await params;
  const { action } = await searchParams;
  await requireDashboardGuildAccess(guildId);
  const [status, logs] = await Promise.all([
    getManagedGuildStatus(guildId),
    getGuildLogs(guildId, action),
  ]);

  return (
    <section className="space-y-5">
      <AutoRefresh intervalMs={3000} />
      <div className="table-panel rounded-[24px] p-5 md:p-6">
        <p className="text-[11px] uppercase tracking-[0.38em] text-[var(--accent-strong)]">
          Logs And History
        </p>
        <h2 className="mt-2 text-lg font-semibold text-white md:text-xl">
          {status?.name ?? guildId}
        </h2>
        <form className="mt-5 flex flex-wrap items-end gap-3">
          <label className="space-y-2">
            <span className="text-sm font-medium text-white">Filter moderation action</span>
            <select name="action" defaultValue={action ?? ""} className="control-input min-w-[240px]">
              <option value="">All actions</option>
              <option value="warn">warn</option>
              <option value="ban">ban</option>
              <option value="timeout">timeout</option>
              <option value="auto_tempban">auto_tempban</option>
            </select>
          </label>
          <button type="submit" className="secondary-button px-5 py-3 text-sm font-medium">
            Apply Filter
          </button>
        </form>
      </div>

      <LogTable
        title="Moderation Logs"
        columns={["Action", "User", "Moderator", "Duration", "When"]}
        rows={logs.moderationLogs.map((log) => [
          <div key={`${log.id}-action`} className="space-y-1">
            <p className="font-medium text-white">{log.action}</p>
            <p className="subtle-copy">{log.reason}</p>
          </div>,
          log.userId,
          log.moderatorId,
          log.duration ?? "n/a",
          formatDate(log.createdAt),
        ])}
        emptyMessage="No moderation logs match the selected filter."
      />
    </section>
  );
}
