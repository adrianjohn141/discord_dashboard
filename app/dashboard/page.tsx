import { GuildCard } from "@/components/guild/guild-card";
import { CaseIcon, GuildsIcon, PulseIcon, ShieldIcon } from "@/components/dashboard/icons";
import { getBotInviteUrl } from "@/lib/discord/invite";
import { requireUserSession } from "@/lib/auth/guards";
import { getAccessibleGuilds } from "@/lib/db/queries";

export default async function DashboardIndexPage() {
  const user = await requireUserSession();
  const guilds = await getAccessibleGuilds(user.id);

  const installedCount = guilds.filter((guild) => guild.botPresent).length;
  const missingGuilds = guilds.filter((guild) => !guild.botPresent);
  const heartbeatCount = guilds.filter((guild) => guild.lastHeartbeatAt).length;
  const primaryInviteGuild = missingGuilds[0] ?? null;
  const primaryInviteUrl = getBotInviteUrl(
    primaryInviteGuild ? { guildId: primaryInviteGuild.guildId } : undefined,
  );

  const stats = [
    {
      label: "Manageable Guilds",
      value: guilds.length,
      copy: "Discord servers visible in your current OAuth scope.",
      icon: GuildsIcon,
    },
    {
      label: "Bot Installed",
      value: installedCount,
      copy: "Guilds that the Python bot has reported into shared status state.",
      icon: ShieldIcon,
    },
    {
      label: "Heartbeat Active",
      value: heartbeatCount,
      copy: "Guilds with recent runtime heartbeat records available.",
      icon: PulseIcon,
    },
    {
      label: "Access Model",
      value: "Scoped",
      copy: "All writes are filtered through your server-side guild access snapshot.",
      icon: CaseIcon,
    },
  ];

  return (
    <div className="space-y-4 animate-fade-in">
      <div className="table-panel p-6 animate-slide-up">
        <div className="flex items-center justify-between gap-4">
          <div>
            <p className="text-[10px] uppercase tracking-[0.2em] font-bold text-[var(--primary)]">
              Guild Directory
            </p>
            <h2 className="mt-1 text-2xl font-bold text-white tracking-tight">
              Choose a server to manage
            </h2>
            <p className="mt-1 text-sm text-[var(--text-muted)]">
              Select a server to access its moderation control room.
            </p>
          </div>
          
          {missingGuilds.length > 0 && primaryInviteUrl && (
            <a
              href={primaryInviteUrl}
              target="_blank"
              rel="noreferrer"
              className="primary-button px-4 py-2 text-sm"
            >
              Install Bot
            </a>
          )}
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
