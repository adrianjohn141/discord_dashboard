import { requireDashboardGuildAccess } from "@/lib/dashboard/request-context";
import { getGuildAppeals, getManagedGuildStatus } from "@/lib/db/queries";

import { decideAppealAction } from "./actions";

function formatAppealId(appealRef: string | null, id: string) {
  if (appealRef) {
    return appealRef;
  }
  return `A${id.padStart(6, "0")}`;
}

function formatCaseId(caseRef: string | null, id: string | null) {
  if (caseRef) {
    return caseRef;
  }
  if (!id) {
    return "N/A";
  }
  return `#${id.padStart(6, "0")}`;
}

function formatShortDate(value: string | null) {
  if (!value) {
    return "Unknown";
  }
  return new Intl.DateTimeFormat("en", { month: "short", day: "numeric" }).format(new Date(value));
}

export default async function GuildAppealsPage({
  params,
  searchParams,
}: {
  params: Promise<{ guildId: string }>;
  searchParams: Promise<{ status?: string; type?: string }>;
}) {
  const { guildId } = await params;
  const { status, type } = await searchParams;
  await requireDashboardGuildAccess(guildId);

  const normalizedStatus = status && status !== "all" ? status : undefined;
  const normalizedType = type && type !== "all" ? type : undefined;

  const [statusRow, appealRows] = await Promise.all([
    getManagedGuildStatus(guildId),
    getGuildAppeals(guildId, normalizedStatus, normalizedType),
  ]);

  return (
    <section className="space-y-5">
      <div className="table-panel rounded-[24px] p-5 md:p-6">
        <p className="text-[11px] uppercase tracking-[0.38em] text-[var(--accent-strong)]">
          Appeals
        </p>
        <h2 className="mt-2 text-lg font-semibold text-white md:text-xl">
          {statusRow?.name ?? guildId}
        </h2>
        <p className="mt-3 max-w-3xl text-sm leading-7 subtle-copy md:text-base">
          Review appeal submissions and decide whether each punishment should be upheld or reversed.
        </p>
      </div>

      <form className="table-panel rounded-[24px] p-5 md:p-6">
        <div className="flex flex-wrap items-end gap-4">
          <label className="flex min-w-[220px] flex-col gap-2">
            <span className="text-sm font-medium text-white">Filter status</span>
            <select name="status" defaultValue={status ?? "all"} className="control-input">
              <option value="all">All</option>
              <option value="pending">Pending</option>
              <option value="accepted">Accepted</option>
              <option value="denied">Denied</option>
              <option value="withdrawn">Withdrawn</option>
            </select>
          </label>

          <label className="flex min-w-[220px] flex-col gap-2">
            <span className="text-sm font-medium text-white">Filter type</span>
            <select name="type" defaultValue={type ?? "all"} className="control-input">
              <option value="all">All</option>
              <option value="ban">Ban</option>
              <option value="timeout">Timeout</option>
            </select>
          </label>

          <button type="submit" className="secondary-button px-5 py-3 text-sm">
            Apply Filters
          </button>
        </div>
      </form>

      <div className="table-panel overflow-hidden rounded-[24px]">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-[var(--line)] bg-black/10 text-[11px] uppercase tracking-[0.2em] text-[var(--text-faint)]">
                <th className="px-4 py-3 text-left font-medium">Appeal</th>
                <th className="px-4 py-3 text-left font-medium">User</th>
                <th className="px-4 py-3 text-left font-medium">Type</th>
                <th className="px-4 py-3 text-left font-medium">Case</th>
                <th className="px-4 py-3 text-left font-medium">Status</th>
                <th className="px-4 py-3 text-left font-medium">Reason</th>
                <th className="px-4 py-3 text-left font-medium">Submitted</th>
                <th className="px-4 py-3 text-left font-medium">Decision</th>
              </tr>
            </thead>
            <tbody>
              {appealRows.appeals.length === 0 ? (
                <tr>
                  <td className="px-4 py-6 text-sm text-[var(--text-faint)]" colSpan={8}>
                    No appeals match this filter.
                  </td>
                </tr>
              ) : (
                appealRows.appeals.map((appeal) => (
                  <tr key={appeal.id} className="border-b border-[var(--line)] align-top">
                    <td className="px-4 py-4 font-mono text-xs text-white">{formatAppealId(appeal.appealRef, appeal.id)}</td>
                    <td className="px-4 py-4 text-sm text-white">{appeal.userId}</td>
                    <td className="px-4 py-4 text-sm text-[var(--text-muted)] uppercase">{appeal.appealType}</td>
                    <td className="px-4 py-4 font-mono text-xs text-[var(--text-muted)]">{formatCaseId(appeal.caseRef, appeal.caseId)}</td>
                    <td className="px-4 py-4 text-sm text-[var(--text-muted)] uppercase">{appeal.status}</td>
                    <td className="px-4 py-4 text-sm text-[var(--text-muted)]">{appeal.reason}</td>
                    <td className="px-4 py-4 text-sm text-[var(--text-faint)]">{formatShortDate(appeal.createdAt)}</td>
                    <td className="px-4 py-4">
                      {appeal.status === "pending" ? (
                        <form action={decideAppealAction} className="space-y-2">
                          <input type="hidden" name="guildId" value={guildId} />
                          <input type="hidden" name="appealRef" value={appeal.appealRef ?? appeal.id} />
                          <input
                            type="text"
                            name="decisionNote"
                            placeholder="Decision note"
                            className="control-input h-9 min-w-[220px]"
                          />
                          <div className="flex gap-2">
                            <button
                              type="submit"
                              name="decision"
                              value="accepted"
                              className="primary-button px-3 py-1.5 text-xs"
                            >
                              Accept
                            </button>
                            <button
                              type="submit"
                              name="decision"
                              value="denied"
                              className="secondary-button px-3 py-1.5 text-xs"
                            >
                              Deny
                            </button>
                          </div>
                        </form>
                      ) : (
                        <p className="text-sm text-[var(--text-muted)]">
                          {appeal.decisionNote ?? "Reviewed"}
                        </p>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
}
