import Link from "next/link";

import { ArrowRightIcon, ExternalLinkIcon, GuildsIcon, PulseIcon } from "@/components/dashboard/icons";
import { StatusPill } from "@/components/dashboard/status-pill";
import { getBotInviteUrl } from "@/lib/discord/invite";
import type { AccessibleGuild } from "@/types/dashboard";

interface GuildCardProps {
  guild: AccessibleGuild;
}

function getInitials(name: string) {
  return (
    name
      .split(/\s+/)
      .filter(Boolean)
      .slice(0, 2)
      .map((part) => part[0]?.toUpperCase())
      .join("") || "SG"
  );
}

export function GuildCard({ guild }: GuildCardProps) {
  const inviteUrl = getBotInviteUrl({ guildId: guild.guildId });

  return (
    <div className="table-panel overflow-hidden p-4">
      <div className="flex items-center justify-between gap-4">
        <div className="flex min-w-0 items-center gap-3">
          <div className="brand-badge h-12 w-12 overflow-hidden rounded-xl text-sm font-semibold text-white flex-shrink-0">
            {guild.iconUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img alt={guild.guildName} src={guild.iconUrl} className="h-full w-full object-cover" />
            ) : (
              <span>{getInitials(guild.guildName)}</span>
            )}
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <p className="truncate text-base font-bold text-white tracking-tight">{guild.guildName}</p>
              <StatusPill tone={guild.botPresent ? "success" : "warning"}>
                {guild.botPresent ? "Installed" : "Required"}
              </StatusPill>
            </div>
            <p className="mt-0.5 truncate text-[11px] text-[var(--text-faint)] uppercase tracking-wider font-medium">
              ID {guild.guildId} • {guild.lastHeartbeatAt ? "Online" : "Offline"}
            </p>
          </div>
        </div>

        {guild.botPresent ? (
          <Link
            href={`/dashboard/${guild.guildId}`}
            className="secondary-button px-4 py-2 text-sm font-bold flex-shrink-0"
          >
            Manage
            <ArrowRightIcon className="h-4 w-4" />
          </Link>
        ) : (
          inviteUrl && (
            <a
              href={inviteUrl}
              target="_blank"
              rel="noreferrer"
              className="primary-button px-4 py-2 text-sm font-bold flex-shrink-0"
            >
              Install
              <ExternalLinkIcon className="h-4 w-4" />
            </a>
          )
        )}
      </div>
    </div>
  );
}
