const DEFAULT_BOT_CLIENT_ID = "1478830601892270281";
const DEFAULT_PERMISSIONS = "8";

interface BotInviteOptions {
  guildId?: string;
}

function getConfiguredInviteUrl() {
  return process.env.NEXT_PUBLIC_DISCORD_BOT_INVITE_URL?.trim() || null;
}

function getConfiguredClientId() {
  return (
    process.env.NEXT_PUBLIC_DISCORD_BOT_CLIENT_ID?.trim() ||
    process.env.DISCORD_BOT_CLIENT_ID?.trim() ||
    DEFAULT_BOT_CLIENT_ID
  );
}

export function getBotInviteUrl(options: BotInviteOptions = {}) {
  const configuredInviteUrl = getConfiguredInviteUrl();

  if (configuredInviteUrl) {
    const inviteUrl = new URL(configuredInviteUrl);

    if (options.guildId) {
      inviteUrl.searchParams.set("guild_id", options.guildId);
      inviteUrl.searchParams.set("disable_guild_select", "true");
    }

    return inviteUrl.toString();
  }

  const clientId = getConfiguredClientId();

  if (!clientId) {
    return null;
  }

  const params = new URLSearchParams({
    client_id: clientId,
    permissions: process.env.NEXT_PUBLIC_DISCORD_BOT_PERMISSIONS?.trim() || DEFAULT_PERMISSIONS,
    scope: "bot applications.commands",
  });

  if (options.guildId) {
    params.set("guild_id", options.guildId);
    params.set("disable_guild_select", "true");
  }

  return `https://discord.com/oauth2/authorize?${params.toString()}`;
}
