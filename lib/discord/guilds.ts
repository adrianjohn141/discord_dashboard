import "server-only";

import type { User } from "@supabase/supabase-js";

import { createAdminClient } from "@/lib/supabase/admin";

const ADMINISTRATOR = BigInt(1) << BigInt(3);
const KICK_MEMBERS = BigInt(1) << BigInt(1);
const BAN_MEMBERS = BigInt(1) << BigInt(2);
const MANAGE_CHANNELS = BigInt(1) << BigInt(4);
const MANAGE_GUILD = BigInt(1) << BigInt(5);
const MANAGE_MESSAGES = BigInt(1) << BigInt(13);

export interface DiscordGuild {
  id: string;
  name: string;
  icon: string | null;
  owner: boolean;
  permissions: string;
}

function hasManagePermissions(permissionValue: string) {
  const permissions = BigInt(permissionValue);

  return (
    (permissions & ADMINISTRATOR) === ADMINISTRATOR ||
    (permissions & MANAGE_GUILD) === MANAGE_GUILD ||
    (permissions & MANAGE_CHANNELS) === MANAGE_CHANNELS ||
    (permissions & MANAGE_MESSAGES) === MANAGE_MESSAGES ||
    (permissions & BAN_MEMBERS) === BAN_MEMBERS ||
    (permissions & KICK_MEMBERS) === KICK_MEMBERS
  );
}

export function toDiscordCdnUrl(guildId: string, iconHash: string | null) {
  if (!iconHash) {
    return null;
  }

  return `https://cdn.discordapp.com/icons/${guildId}/${iconHash}.png?size=256`;
}

export async function fetchDiscordGuilds(providerToken: string) {
  const response = await fetch("https://discord.com/api/users/@me/guilds", {
    headers: {
      Authorization: `Bearer ${providerToken}`,
    },
    cache: "no-store",
  });

  if (!response.ok) {
    throw new Error(`Discord guild lookup failed with status ${response.status}.`);
  }

  return (await response.json()) as DiscordGuild[];
}

export async function syncUserGuildAccess(user: User, providerToken: string) {
  const admin = createAdminClient();
  const guilds = await fetchDiscordGuilds(providerToken);

  const rows = guilds.map((guild) => ({
    user_id: user.id,
    guild_id: guild.id,
    guild_name: guild.name,
    icon_url: toDiscordCdnUrl(guild.id, guild.icon),
    permissions: guild.permissions,
    can_manage: guild.owner || hasManagePermissions(guild.permissions),
    refreshed_at: new Date().toISOString(),
  }));

  const { error: deleteError } = await admin
    .from("dashboard_guild_access")
    .delete()
    .eq("user_id", user.id);

  if (deleteError) {
    throw deleteError;
  }

  if (rows.length === 0) {
    return [];
  }

  const { error: insertError } = await admin.from("dashboard_guild_access").insert(rows);

  if (insertError) {
    throw insertError;
  }

  return rows;
}
