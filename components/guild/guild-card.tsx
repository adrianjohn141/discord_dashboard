import Link from "next/link";

import { DashboardAvatar } from "@/components/dashboard/dashboard-avatar";
import { ArrowRightIcon, ExternalLinkIcon } from "@/components/dashboard/icons";
import { StatusPill } from "@/components/dashboard/status-pill";
import { getBotInviteUrl } from "@/lib/discord/invite";
import type { AccessibleGuild } from "@/types/dashboard";

interface GuildCardProps {
  guild: AccessibleGuild;
}

export function GuildCard({ guild }: GuildCardProps) {
  const inviteUrl = getBotInviteUrl({ guildId: guild.guildId });

  return (
    <div className="table-panel overflow-hidden p-4">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex min-w-0 items-center gap-3">
          <DashboardAvatar
            label={guild.guildName}
            imageUrl={guild.iconUrl}
            className="h-12 w-12 flex-shrink-0 rounded-xl"
            sizes="48px"
          />
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
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
            prefetch={false}
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
