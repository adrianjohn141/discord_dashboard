import { DashboardShell } from "@/components/dashboard/dashboard-shell";
import { getDashboardRequestContext } from "@/lib/dashboard/request-context";

export default async function DashboardLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const { dashboardUser, guilds } = await getDashboardRequestContext();

  return (
    <DashboardShell user={dashboardUser} guilds={guilds}>
      {children}
    </DashboardShell>
  );
}
