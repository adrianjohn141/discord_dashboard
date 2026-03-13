import { AutoRefresh } from "@/components/dashboard/auto-refresh";
import { LogTable } from "@/components/logs/log-table";
import { requireDashboardGuildAccess } from "@/lib/dashboard/request-context";
import { getGuildEvidenceSnapshots, getManagedGuildStatus } from "@/lib/db/queries";

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

function formatCaseLabel(caseRef: string | null, caseId: string | null) {
  if (caseRef) {
    return caseRef;
  }

  if (!caseId) {
    return "Unlinked";
  }

  return `#${caseId.padStart(6, "0")}`;
}

function formatPrettyJson(value: unknown) {
  if (value === null || value === undefined) {
    return "null";
  }

  try {
    return JSON.stringify(value, null, 2);
  } catch {
    return String(value);
  }
}

function isSupportedSource(value: string | undefined) {
  return (
    value === "automod" ||
    value === "bot_command" ||
    value === "manual_delete" ||
    value === "unknown_delete"
  );
}

export default async function GuildEvidencePage({
  params,
  searchParams,
}: {
  params: Promise<{ guildId: string }>;
  searchParams: Promise<{ case?: string; source?: string }>;
}) {
  const { guildId } = await params;
  const { case: caseFilter, source } = await searchParams;
  await requireDashboardGuildAccess(guildId);

  const normalizedSource = source && source !== "all" && isSupportedSource(source) ? source : undefined;
  const [guildStatus, evidenceResult] = await Promise.all([
    getManagedGuildStatus(guildId),
    getGuildEvidenceSnapshots(guildId, {
      caseQuery: caseFilter,
      source: normalizedSource,
    }),
  ]);

  return (
    <section className="space-y-5">
      <AutoRefresh intervalMs={3000} />
      <div className="table-panel rounded-[24px] p-5 md:p-6">
        <p className="text-[11px] uppercase tracking-[0.38em] text-[var(--accent-strong)]">
          Evidence Snapshots
        </p>
        <h2 className="mt-2 text-lg font-semibold text-white md:text-xl">
          {guildStatus?.name ?? guildId}
        </h2>
        <p className="mt-3 max-w-3xl text-sm leading-7 subtle-copy md:text-base">
          Browse deleted message evidence captured by AutoMod, bot commands, or manual moderation.
          Filter by case reference or case ID to trace snapshots linked to a specific incident.
        </p>
        <form className="mt-5 flex flex-wrap items-end gap-3">
          <label className="space-y-2">
            <span className="text-sm font-medium text-white">Case Ref / Case ID</span>
            <input
              name="case"
              defaultValue={caseFilter ?? ""}
              className="control-input min-w-[240px]"
              placeholder="Ex: C123ABC456DEF or 4182"
            />
          </label>
          <label className="space-y-2">
            <span className="text-sm font-medium text-white">Source</span>
            <select name="source" defaultValue={source ?? "all"} className="control-input min-w-[220px]">
              <option value="all">All sources</option>
              <option value="automod">automod</option>
              <option value="bot_command">bot_command</option>
              <option value="manual_delete">manual_delete</option>
              <option value="unknown_delete">unknown_delete</option>
            </select>
          </label>
          <button type="submit" className="secondary-button px-5 py-3 text-sm font-medium">
            Apply Filter
          </button>
        </form>
      </div>

      <LogTable
        title="Evidence Snapshot Records"
        columns={[
          "Snapshot",
          "Case",
          "Source",
          "Deleted By",
          "Channel",
          "Author",
          "Deleted At",
          "Details",
        ]}
        rows={evidenceResult.evidenceSnapshots.map((snapshot) => [
          <div key={`${snapshot.id}-snapshot`} className="space-y-1">
            <p className="font-mono font-medium text-white">#{snapshot.id.padStart(6, "0")}</p>
            <p className="subtle-copy">Message {snapshot.messageId}</p>
          </div>,
          <p key={`${snapshot.id}-case`} className="font-mono text-white">
            {formatCaseLabel(snapshot.caseRef, snapshot.caseId)}
          </p>,
          snapshot.source,
          snapshot.deletedByType,
          snapshot.channelId,
          snapshot.authorId,
          formatDate(snapshot.messageDeletedAt ?? snapshot.createdAt),
          <details key={`${snapshot.id}-details`} className="max-w-[36rem] text-xs text-[var(--text-muted)]">
            <summary className="cursor-pointer text-[var(--accent-strong)]">Expand</summary>
            <div className="mt-3 space-y-3">
              <div>
                <p className="text-[10px] uppercase tracking-[0.2em] text-[var(--text-faint)]">
                  Message Content
                </p>
                <pre className="mt-1 overflow-auto whitespace-pre-wrap rounded-[12px] border border-[var(--line)] p-2">
                  {snapshot.messageContent && snapshot.messageContent.length > 0
                    ? snapshot.messageContent
                    : "(empty)"}
                </pre>
              </div>
              <div>
                <p className="text-[10px] uppercase tracking-[0.2em] text-[var(--text-faint)]">Attachments</p>
                <pre className="mt-1 overflow-auto rounded-[12px] border border-[var(--line)] p-2">
                  {formatPrettyJson(snapshot.attachmentsJson)}
                </pre>
              </div>
              <div>
                <p className="text-[10px] uppercase tracking-[0.2em] text-[var(--text-faint)]">Embeds</p>
                <pre className="mt-1 overflow-auto rounded-[12px] border border-[var(--line)] p-2">
                  {formatPrettyJson(snapshot.embedsJson)}
                </pre>
              </div>
              <div>
                <p className="text-[10px] uppercase tracking-[0.2em] text-[var(--text-faint)]">Links</p>
                <pre className="mt-1 overflow-auto rounded-[12px] border border-[var(--line)] p-2">
                  {formatPrettyJson(snapshot.linksJson)}
                </pre>
              </div>
              <div>
                <p className="text-[10px] uppercase tracking-[0.2em] text-[var(--text-faint)]">Context Before</p>
                <pre className="mt-1 overflow-auto rounded-[12px] border border-[var(--line)] p-2">
                  {formatPrettyJson(snapshot.contextBeforeJson)}
                </pre>
              </div>
              <div>
                <p className="text-[10px] uppercase tracking-[0.2em] text-[var(--text-faint)]">Context After</p>
                <pre className="mt-1 overflow-auto rounded-[12px] border border-[var(--line)] p-2">
                  {formatPrettyJson(snapshot.contextAfterJson)}
                </pre>
              </div>
              <div>
                <p className="text-[10px] uppercase tracking-[0.2em] text-[var(--text-faint)]">
                  Author Metadata
                </p>
                <pre className="mt-1 overflow-auto rounded-[12px] border border-[var(--line)] p-2">
                  {formatPrettyJson(snapshot.authorMetadata)}
                </pre>
              </div>
              <div>
                <p className="text-[10px] uppercase tracking-[0.2em] text-[var(--text-faint)]">
                  Channel Metadata
                </p>
                <pre className="mt-1 overflow-auto rounded-[12px] border border-[var(--line)] p-2">
                  {formatPrettyJson(snapshot.channelMetadata)}
                </pre>
              </div>
            </div>
          </details>,
        ])}
        emptyMessage="No evidence snapshots match this filter."
      />
    </section>
  );
}
