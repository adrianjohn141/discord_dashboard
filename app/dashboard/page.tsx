import { GuildCard } from "@/components/guild/guild-card";
import { RefreshAccessButton } from "@/components/dashboard/refresh-access-button";
import { getDashboardRequestContext } from "@/lib/dashboard/request-context";
import { getBotInviteUrl } from "@/lib/discord/invite";
import { getGlobalBotStatus } from "@/lib/db/queries";
import { GlobalBotStatus } from "@/components/dashboard/global-bot-status";

export default async function DashboardIndexPage({
  searchParams,
}: {
  searchParams: Promise<{ refresh?: string }>;
}) {
  const [{ guilds }, globalStatus, resolvedSearchParams] = await Promise.all([
    getDashboardRequestContext(),
    getGlobalBotStatus(),
    searchParams,
  ]);

  const missingGuilds = guilds.filter((guild) => !guild.botPresent);
  const primaryInviteGuild = missingGuilds[0] ?? null;
  const primaryInviteUrl = getBotInviteUrl(
    primaryInviteGuild ? { guildId: primaryInviteGuild.guildId } : undefined,
  );

  return (
    <div className="space-y-5 animate-fade-in">
      <div className="table-panel p-5 md:p-6 animate-slide-up">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <p className="text-[10px] uppercase tracking-[0.2em] font-bold text-[var(--primary)]">
              Guild Directory
            </p>
            <h2 className="mt-1 text-xl font-bold text-white tracking-tight md:text-2xl">
              Choose a server to manage
            </h2>
            <p className="mt-1 text-[13px] text-[var(--text-muted)] md:text-sm">
              Select a server to access its moderation control room.
            </p>
            {resolvedSearchParams.refresh === "required" ? (
              <p className="mt-2 text-[13px] text-amber-200 md:text-sm">
                Discord guild access needs a fresh sync before the dashboard can use the latest server list.
              </p>
            ) : null}
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            <GlobalBotStatus isOnline={globalStatus.isOnline} lastHeartbeatAt={globalStatus.lastHeartbeatAt} />
            <RefreshAccessButton />
            {missingGuilds.length > 0 && primaryInviteUrl ? (
              <a
                href={primaryInviteUrl}
                target="_blank"
                rel="noreferrer"
                className="primary-button px-3.5 py-2 text-sm"
              >
                Install Bot
              </a>
            ) : null}
          </div>
        </div>
      </div>

      <div className="grid gap-4 xl:grid-cols-2">
        {guilds.map((guild, idx) => (
          <div key={guild.guildId} className="animate-slide-up" style={{ animationDelay: `${(idx + 1) * 0.05}s` }}>
            <GuildCard guild={guild} />
          </div>
        ))}
      </div>
    </div>
  );
}
