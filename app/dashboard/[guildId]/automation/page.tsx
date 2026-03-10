import { requireGuildAccess } from "@/lib/auth/guards";
import { getGuildConfig, getManagedGuildStatus } from "@/lib/db/queries";

import { AutomationForm } from "./automation-form";

export default async function GuildAutomationPage({
  params,
}: {
  params: Promise<{ guildId: string }>;
}) {
  const { guildId } = await params;
  await requireGuildAccess(guildId);
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
        <h2 className="mt-3 text-2xl font-semibold text-white md:text-3xl">
          {status?.name ?? guildId}
        </h2>
        <p className="mt-3 max-w-3xl text-sm leading-7 subtle-copy md:text-base">
          Manage the same anti-spam, anti-link, anti-invite, anti-raid, and escalation
          settings that the bot already enforces through its existing Supabase-backed
          guild configuration.
        </p>
      </div>

      <AutomationForm guildId={guildId} config={config} />
    </section>
  );
}
