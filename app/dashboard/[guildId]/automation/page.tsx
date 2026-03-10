import { requireDashboardGuildAccess } from "@/lib/dashboard/request-context";
import { getGuildConfig, getManagedGuildStatus } from "@/lib/db/queries";

import { AutomationForm } from "./automation-form";

export default async function GuildAutomationPage({
  params,
}: {
  params: Promise<{ guildId: string }>;
}) {
  const { guildId } = await params;
  await requireDashboardGuildAccess(guildId);
  const [config, status] = await Promise.all([
    getGuildConfig(guildId),
    getManagedGuildStatus(guildId),
  ]);

  return (
    <section className="space-y-5">
      <div className="table-panel rounded-[24px] p-5 md:p-6">
        <p className="text-[11px] uppercase tracking-[0.38em] text-[var(--accent-strong)]">
          AutoMod Settings
        </p>
        <h2 className="mt-2 text-lg font-semibold text-white md:text-xl">
          {status?.name ?? guildId}
        </h2>
        <p className="mt-3 max-w-3xl text-sm leading-7 subtle-copy md:text-base">
          Manage the same anti-spam, anti-link, anti-invite, anti-raid, and escalation
          settings.
          guild configuration.
        </p>
      </div>

      <AutomationForm guildId={guildId} config={config} />
    </section>
  );
}
