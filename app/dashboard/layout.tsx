import { DashboardShell } from "@/components/dashboard/dashboard-shell";
import { getCurrentDashboardUser, requireUserSession } from "@/lib/auth/guards";
import { getAccessibleGuilds } from "@/lib/db/queries";

export const dynamic = "force-dynamic";

export default async function DashboardLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const user = await requireUserSession();
  const [dashboardUser, guilds] = await Promise.all([
    getCurrentDashboardUser(),
    getAccessibleGuilds(user.id),
  ]);

  return (
    <DashboardShell user={dashboardUser} guilds={guilds}>
      {children}
    </DashboardShell>
  );
}
