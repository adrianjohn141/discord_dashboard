import { DashboardAvatar } from "@/components/dashboard/dashboard-avatar";
import { DashboardShellSidebar } from "@/components/dashboard/dashboard-shell-sidebar";
import { DashboardSidebarToggleButton } from "@/components/dashboard/dashboard-sidebar-toggle-button";
import { DashboardShellStateProvider } from "@/components/dashboard/dashboard-shell-state";
import type { AccessibleGuild, DashboardUser } from "@/types/dashboard";

export function DashboardShell({
  user,
  guilds,
  children,
}: {
  user: DashboardUser;
  guilds: AccessibleGuild[];
  children: React.ReactNode;
}) {
  const firstName = user.displayName.split(" ")[0] || user.displayName;

  return (
    <DashboardShellStateProvider>
      <div className="app-shell flex min-h-[100dvh] bg-[var(--bg)] lg:h-[100dvh] lg:overflow-hidden">
        <DashboardShellSidebar user={user} guilds={guilds} />

        <div className="flex min-w-0 flex-1 flex-col">
          <header className="dashboard-topbar sticky top-0 z-30 flex h-16 flex-shrink-0 items-center justify-between px-4 lg:px-6">
            <div className="flex min-w-0 items-center gap-4">
              <DashboardSidebarToggleButton />
              <h1 className="truncate text-lg font-semibold text-white lg:text-xl">
                Akbash Moderation Dashboard
              </h1>
            </div>

            <div className="flex items-center gap-3">
              <p className="hidden text-sm text-[var(--text-muted)] md:block">
                Welcome, {firstName}
              </p>
              <DashboardAvatar
                label={user.displayName}
                imageUrl={user.avatarUrl}
                className="h-8 w-8 rounded-full"
                sizes="32px"
              />
            </div>
          </header>

          <main className="flex-1 overflow-y-auto p-4 lg:min-h-0 lg:p-6">
            <div className="mx-auto max-w-[1400px] animate-in fade-in slide-in-from-bottom-4 duration-500">
              {children}
            </div>
          </main>
        </div>
      </div>
    </DashboardShellStateProvider>
  );
}
