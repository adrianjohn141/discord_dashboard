import { TerminalIcon, BookIcon } from "@/components/dashboard/icons";
import CustomCommandsManager from "@/components/dashboard/custom-commands-manager";
import { requireDashboardGuildAccess } from "@/lib/dashboard/request-context";
import { getCustomCommands } from "@/lib/db/queries";
import Link from "next/link";

export default async function GuildCommandsPage({
  params,
}: {
  params: Promise<{ guildId: string }>;
}) {
  const { guildId } = await params;
  const [, commands] = await Promise.all([
    requireDashboardGuildAccess(guildId),
    getCustomCommands(guildId),
  ]);

  return (
    <div className="space-y-6">
      <div className="table-panel p-8 flex flex-col md:flex-row md:items-start justify-between gap-4">
        <div>
          <div className="flex items-center gap-4">
            <div className="p-3 bg-[var(--bg-surface-elevated)] rounded-xl border border-[var(--line)] text-[var(--primary)]">
              <TerminalIcon className="h-6 w-6" />
            </div>
            <div>
              <p className="text-[10px] uppercase tracking-[0.2em] font-bold text-[var(--primary)]">
                Custom Commands
              </p>
              <h2 className="mt-1 text-3xl font-bold text-white tracking-tight">
                Command Management
              </h2>
            </div>
          </div>
          <p className="mt-4 max-w-2xl text-base text-[var(--text-muted)] leading-relaxed">
            View, create, and manage custom text-based commands for your server. 
            Commands use the guild prefix (default is <code>!</code>) and support dynamic variables.
          </p>
        </div>
        <Link 
          href={`/dashboard/${guildId}/commands/docs`}
          className="secondary-button flex items-center gap-2 whitespace-nowrap self-start"
        >
          <BookIcon className="h-4 w-4" />
          View Documentation
        </Link>
      </div>

      <CustomCommandsManager guildId={guildId} initialCommands={commands} />
    </div>
  );
}
