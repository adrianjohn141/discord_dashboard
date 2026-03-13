import "server-only";

import { revalidateTag } from "next/cache";

export const dashboardCacheTtls = {
  guildAccess: 30,
  guildSummary: 15,
  guildConfig: 60,
  guildResources: 60,
  guildLogs: 15,
  guildEvidence: 15,
  guildAppeals: 15,
  guildTempActions: 15,
  feedback: 15,
  commands: 30,
} as const;

export const dashboardCacheTags = {
  guildAccess: (userId: string) => `guild-access:${userId}`,
  guildSummary: (guildId: string) => `guild-summary:${guildId}`,
  guildConfig: (guildId: string) => `guild-config:${guildId}`,
  guildResources: (guildId: string) => `guild-resources:${guildId}`,
  guildLogs: (guildId: string) => `guild-logs:${guildId}`,
  guildEvidence: (guildId: string) => `guild-evidence:${guildId}`,
  guildAppeals: (guildId: string) => `guild-appeals:${guildId}`,
  guildTempActions: (guildId: string) => `guild-temp-actions:${guildId}`,
  feedback: () => "feedback",
  commands: (guildId: string) => `commands:${guildId}`,
} as const;

const immediateExpiration = { expire: 0 } as const;

export function revalidateDashboardTag(tag: string) {
  revalidateTag(tag, immediateExpiration);
}

export function revalidateDashboardTags(tags: string[]) {
  for (const tag of new Set(tags)) {
    revalidateDashboardTag(tag);
  }
}
