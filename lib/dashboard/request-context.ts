import "server-only";

import { redirect } from "next/navigation";
import { cache } from "react";
import type { User } from "@supabase/supabase-js";

import { buildDashboardUser, requireUserSession } from "@/lib/auth/guards";
import { getAccessibleGuilds } from "@/lib/db/queries";
import type { AccessibleGuild, DashboardUser } from "@/types/dashboard";

export interface DashboardRequestContext {
  user: User;
  dashboardUser: DashboardUser;
  guilds: AccessibleGuild[];
}

export const getDashboardRequestContext = cache(
  async (): Promise<DashboardRequestContext> => {
    const user = await requireUserSession();
    const guilds = await getAccessibleGuilds(user.id);

    return {
      user,
      dashboardUser: buildDashboardUser(user),
      guilds,
    };
  },
);

export const requireDashboardGuildAccess = cache(async (guildId: string) => {
  const context = await getDashboardRequestContext();
  const accessRecord = context.guilds.find((guild) => guild.guildId === guildId) ?? null;

  if (!accessRecord?.canManage) {
    redirect("/dashboard");
  }

  return {
    ...context,
    accessRecord: {
      guildId: accessRecord.guildId,
      guildName: accessRecord.guildName,
      canManage: accessRecord.canManage,
    },
  };
});
