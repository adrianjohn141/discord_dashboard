import { LogTable } from "@/components/logs/log-table";
import { requireDashboardGuildAccess } from "@/lib/dashboard/request-context";
import { getGuildTemporaryActions, getManagedGuildStatus } from "@/lib/db/queries";

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

export default async function GuildTemporaryActionsPage({
  params,
}: {
  params: Promise<{ guildId: string }>;
}) {
  const { guildId } = await params;
  await requireDashboardGuildAccess(guildId);
  const [status, temporaryActions] = await Promise.all([
    getManagedGuildStatus(guildId),
    getGuildTemporaryActions(guildId),
  ]);

  return (
    <section className="space-y-5">
      <div className="table-panel rounded-[24px] p-5 md:p-6">
        <p className="text-[11px] uppercase tracking-[0.38em] text-[var(--accent-strong)]">
          Temporary Actions
        </p>
        <h2 className="mt-2 text-lg font-semibold text-white md:text-xl">
          {status?.name ?? guildId}
        </h2>
        <p className="mt-3 max-w-3xl text-sm leading-7 subtle-copy md:text-base">
          View the time-bound actions the bot is currently tracking in Supabase:
          temporary roles, temporary bans, and role locks.
        </p>
      </div>

      <div className="space-y-5">
        <LogTable
          title="Temporary Roles"
          columns={["User", "Role", "Expires", "Created"]}
          rows={temporaryActions.temporaryRoles.map((entry) => [
            entry.userId,
            entry.roleId,
            formatDate(entry.expiresAt),
            formatDate(entry.createdAt),
          ])}
          emptyMessage="There are no pending temporary role assignments for this guild."
        />

        <LogTable
          title="Temporary Bans"
          columns={["User", "Reason", "Expires", "Created"]}
          rows={temporaryActions.temporaryBans.map((entry) => [
            entry.userId,
            entry.reason,
            formatDate(entry.expiresAt),
            formatDate(entry.createdAt),
          ])}
          emptyMessage="There are no pending temporary bans for this guild."
        />

        <LogTable
          title="Role Locks"
          columns={["User", "Locked Roles", "Created"]}
          rows={temporaryActions.roleLocks.map((entry) => [
            entry.userId,
            entry.lockedRoles.length > 0 ? entry.lockedRoles.join(", ") : "No roles stored",
            formatDate(entry.createdAt),
          ])}
          emptyMessage="There are no role locks stored for this guild."
        />
      </div>
    </section>
  );
}
