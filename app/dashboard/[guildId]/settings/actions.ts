"use server";

import { requireGuildAccess } from "@/lib/auth/guards";
import { getGuildConfig } from "@/lib/db/queries";
import { updateGuildConfig } from "@/lib/db/mutations";

export async function updateGuildSettingsAction(formData: FormData) {
  const guildId = String(formData.get("guildId") ?? "");
  const { user } = await requireGuildAccess(guildId);
  const existingConfig = await getGuildConfig(guildId);

  await updateGuildConfig(
    user.id,
    {
      guildId,
      modLogChannelId: String(formData.get("modLogChannelId") ?? "").trim(),
      appealChannelId: String(formData.get("appealChannelId") ?? "").trim(),
      muteRoleId: String(formData.get("muteRoleId") ?? "").trim(),
      autoroleId: String(formData.get("autoroleId") ?? "").trim(),
    },
    existingConfig,
  );
}
