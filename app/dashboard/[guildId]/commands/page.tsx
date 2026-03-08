import { requireGuildAccess } from "@/lib/auth/guards";
import { TerminalIcon, ArrowRightIcon } from "@/components/dashboard/icons";

export default async function GuildCommandsPage({
  params,
}: {
  params: Promise<{ guildId: string }>;
}) {
  const { guildId } = await params;
  await requireGuildAccess(guildId);

  return (
    <div className="space-y-6">
      <div className="table-panel p-8">
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
          View, create, and manage custom slash commands for your server. 
          Define responses, parameters, and permission requirements.
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <div className="table-panel min-h-[400px] flex flex-col items-center justify-center p-12 text-center">
            <div className="w-16 h-16 bg-[var(--bg-surface-elevated)] rounded-full flex items-center justify-center mb-6 border border-[var(--line)]">
              <TerminalIcon className="h-8 w-8 text-[var(--text-faint)]" />
            </div>
            <h3 className="text-xl font-bold text-white">No commands found</h3>
            <p className="mt-2 text-[var(--text-muted)] max-w-sm">
              You haven&apos;t created any custom commands for this server yet. 
              Get started by clicking the button below.
            </p>
            <button className="primary-button mt-8">
              Create New Command
            </button>
          </div>
        </div>

        <div className="space-y-6">
          <div className="table-panel p-6">
            <h4 className="text-sm font-bold text-white uppercase tracking-wider mb-4">Documentation</h4>
            <div className="space-y-4">
              <div className="p-4 bg-[var(--bg-surface-elevated)] rounded-xl border border-[var(--line)] hover:border-[var(--primary)]/30 cursor-pointer transition-colors group">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-bold text-white">Slash Command Basics</p>
                  <ArrowRightIcon className="h-4 w-4 text-[var(--text-faint)] group-hover:text-white transition-opacity" />
                </div>
                <p className="mt-1 text-xs text-[var(--text-faint)]">Learn how to structure your commands and options.</p>
              </div>
              <div className="p-4 bg-[var(--bg-surface-elevated)] rounded-xl border border-[var(--line)] hover:border-[var(--primary)]/30 cursor-pointer transition-colors group">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-bold text-white">Variables & Templates</p>
                  <ArrowRightIcon className="h-4 w-4 text-[var(--text-faint)] group-hover:text-white transition-opacity" />
                </div>
                <p className="mt-1 text-xs text-[var(--text-faint)]">Use dynamic placeholders in your command responses.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
