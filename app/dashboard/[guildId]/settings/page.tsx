import { requireGuildAccess } from "@/lib/auth/guards";
import {
  getGuildConfig,
  getGuildResourceCatalog,
  getManagedGuildStatus,
} from "@/lib/db/queries";
import { GuildChannelSelect } from "@/components/settings/guild-channel-select";
import { GuildRoleSelect } from "@/components/settings/guild-role-select";

import { updateGuildSettingsAction } from "./actions";

export default async function GuildSettingsPage({
  params,
}: {
  params: Promise<{ guildId: string }>;
}) {
  const { guildId } = await params;
  await requireGuildAccess(guildId);
  const [config, status, resourceCatalog] = await Promise.all([
    getGuildConfig(guildId),
    getManagedGuildStatus(guildId),
    getGuildResourceCatalog(guildId),
  ]);
  const channelFallbackMessage = status?.botPresent
    ? "No synced eligible channels are available yet. Enter a channel ID manually."
    : "The bot is not currently connected to this guild. Enter a channel ID manually.";
  const roleFallbackMessage = status?.botPresent
    ? "No synced assignable roles are available yet. Enter a role ID manually."
    : "The bot is not currently connected to this guild. Enter a role ID manually.";

  return (
    <section className="space-y-5">
      <div className="table-panel rounded-[24px] p-5 md:p-6">
        <p className="text-[11px] uppercase tracking-[0.38em] text-[var(--accent-strong)]">
          Guild Settings
        </p>
        <h2 className="mt-3 text-2xl font-semibold text-white md:text-3xl">
          {status?.name ?? guildId}
        </h2>
        <p className="mt-3 max-w-3xl text-sm leading-7 subtle-copy md:text-base">
          Update the persistent configuration rows.
          These values affect channel logging, mute-role operations, and new-member
          autorole behavior.
        </p>
      </div>

      <form action={updateGuildSettingsAction} className="table-panel rounded-[24px] p-5 md:p-6">
        <input type="hidden" name="guildId" value={guildId} />

        <div className="grid gap-5 md:grid-cols-2">
          <GuildChannelSelect
            name="modLogChannelId"
            label="Moderation Log Channel"
            defaultValue={config.modLogChannelId}
            channels={resourceCatalog.channels}
            fallbackMessage={channelFallbackMessage}
          />

          <GuildRoleSelect
            name="muteRoleId"
            label="Mute Role"
            defaultValue={config.muteRoleId}
            roles={resourceCatalog.roles}
            fallbackMessage={roleFallbackMessage}
          />

          <GuildRoleSelect
            name="autoroleId"
            label="Autorole"
            defaultValue={config.autoroleId}
            roles={resourceCatalog.roles}
            fallbackMessage={roleFallbackMessage}
          />

          <div className="control-card p-5">
            <p className="text-sm font-medium text-white">Slash-first policy</p>
            <p className="mt-3 text-sm leading-7 subtle-copy">
              The bot stays slash-first. The legacy prefix value is stored in Supabase
              for compatibility, but the dashboard intentionally treats it as read-only.
            </p>
            <p className="mt-4 text-sm font-medium text-[var(--accent-strong)]">
              Stored prefix: {config.prefix ?? "!"}
            </p>
          </div>
        </div>

        <div className="mt-6 flex justify-end">
          <button type="submit" className="primary-button px-6 py-3 font-medium">
            Save Settings
          </button>
        </div>
      </form>
    </section>
  );
}
