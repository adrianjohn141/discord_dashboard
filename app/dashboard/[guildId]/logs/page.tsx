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
  searchParams: Promise<{ action?: string; status?: string }>;
}) {
  const { guildId } = await params;
  const { action, status: caseStatus } = await searchParams;
  await requireDashboardGuildAccess(guildId);
  const [guildStatus, logs] = await Promise.all([
    getManagedGuildStatus(guildId),
    getGuildLogs(guildId, action, caseStatus),
  ]);

  return (
    <section className="space-y-5">
      <AutoRefresh intervalMs={3000} />
      <div className="table-panel rounded-[24px] p-5 md:p-6">
        <p className="text-[11px] uppercase tracking-[0.38em] text-[var(--accent-strong)]">
          Logs And History
        </p>
        <h2 className="mt-2 text-lg font-semibold text-white md:text-xl">
          {guildStatus?.name ?? guildId}
        </h2>
        <form className="mt-5 flex flex-wrap items-end gap-3">
          <label className="space-y-2">
            <span className="text-sm font-medium text-white">Filter moderation action</span>
            <select name="action" defaultValue={action ?? ""} className="control-input min-w-[240px]">
              <option value="">All actions</option>
              <option value="warn">warn</option>
              <option value="ban">ban</option>
              <option value="kick">kick</option>
              <option value="timeout">timeout</option>
              <option value="unban">unban</option>
              <option value="untimeout">untimeout</option>
              <option value="softban">softban</option>
              <option value="massban">massban</option>
              <option value="auto_tempban">auto_tempban</option>
            </select>
          </label>
          <label className="space-y-2">
            <span className="text-sm font-medium text-white">Filter case status</span>
            <select name="status" defaultValue={caseStatus ?? ""} className="control-input min-w-[200px]">
              <option value="">All statuses</option>
              <option value="open">open</option>
              <option value="resolved">resolved</option>
              <option value="voided">voided</option>
            </select>
          </label>
          <button type="submit" className="secondary-button px-5 py-3 text-sm font-medium">
            Apply Filter
          </button>
        </form>
      </div>

      <LogTable
        title="Moderation Cases"
        columns={["Case", "Action", "User", "Moderator", "Status", "When"]}
        rows={logs.moderationCases.map((log) => [
          <div key={`${log.id}-case`} className="space-y-1">
            <p className="font-mono font-medium text-white">#{log.id.padStart(6, "0")}</p>
            <p className="subtle-copy">{log.origin.replaceAll("_", " ")}</p>
          </div>,
          <div key={`${log.id}-action`} className="space-y-1">
            <p className="font-medium text-white">{log.action}</p>
            <p className="subtle-copy">{log.reason}</p>
          </div>,
          log.userId,
          log.moderatorId,
          log.status,
          formatDate(log.createdAt),
        ])}
        emptyMessage="No moderation cases match the selected filter."
      />
    </section>
  );
}
