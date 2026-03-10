import "server-only";

import { unstable_noStore as noStore } from "next/cache";

import { createAdminClient } from "@/lib/supabase/admin";
import type {
  AccessibleGuild,
  DashboardAuditLogRecord,
  GuildChannelOption,
  GuildConfigRecord,
  GuildDashboardSummary,
  GuildResourceCatalog,
  GuildRoleOption,
  ManagedGuildStatus,
  ModerationLogRecord,
  RoleLockRecord,
  TemporaryBanRecord,
  TemporaryRoleRecord,
  WarningRecord,
} from "@/types/dashboard";

const DEFAULT_GUILD_CONFIG: Omit<GuildConfigRecord, "guildId" | "createdAt"> = {
  prefix: "!",
  modLogChannelId: null,
  muteRoleId: null,
  autoroleId: null,
  antispam: false,
  antilink: false,
  antiinvite: false,
  antiraid: false,
  antiAbuseTimeoutWarnings: 2,
  antiAbuseTimeoutDuration: "30m",
  antiAbuseTempbanWarnings: 3,
  antiAbuseTempbanDuration: "3d",
  antiAbuseBanWarnings: 4,
  antiAbuseWindowDays: 30,
};

function isMissingGuildCatalogError(error: { code?: string | null; message?: string | null }) {
  const code = error.code ?? "";
  const message = (error.message ?? "").toLowerCase();

  return (
    code === "42P01" ||
    code === "PGRST205" ||
    (message.includes("dashboard_guild_channels_v") && message.includes("not found")) ||
    (message.includes("dashboard_guild_roles_v") && message.includes("not found")) ||
    (message.includes("dashboard_guild_channels_v") && message.includes("does not exist")) ||
    (message.includes("dashboard_guild_roles_v") && message.includes("does not exist"))
  );
}

function mapGuildConfig(row: Record<string, unknown> | null, guildId: string): GuildConfigRecord {
  if (!row) {
    return {
      guildId,
      createdAt: null,
      ...DEFAULT_GUILD_CONFIG,
    };
  }

  return {
    guildId,
    prefix: (row.prefix as string | null) ?? "!",
    modLogChannelId: (row.mod_log_channel_id as string | null) ?? null,
    muteRoleId: (row.mute_role_id as string | null) ?? null,
    autoroleId: (row.autorole_id as string | null) ?? null,
    antispam: Boolean(row.antispam),
    antilink: Boolean(row.antilink),
    antiinvite: Boolean(row.antiinvite),
    antiraid: Boolean(row.antiraid),
    antiAbuseTimeoutWarnings: Number(row.anti_abuse_timeout_warnings ?? 2),
    antiAbuseTimeoutDuration: String(row.anti_abuse_timeout_duration ?? "30m"),
    antiAbuseTempbanWarnings: Number(row.anti_abuse_tempban_warnings ?? 3),
    antiAbuseTempbanDuration: String(row.anti_abuse_tempban_duration ?? "3d"),
    antiAbuseBanWarnings: Number(row.anti_abuse_ban_warnings ?? 4),
    antiAbuseWindowDays: Number(row.anti_abuse_window_days ?? 30),
    createdAt: (row.created_at as string | null) ?? null,
  };
}

function mapManagedGuild(row: Record<string, unknown> | null): ManagedGuildStatus | null {
  if (!row) {
    return null;
  }

  return {
    guildId: String(row.guild_id),
    name: String(row.name),
    iconUrl: (row.icon_url as string | null) ?? null,
    botPresent: Boolean(row.bot_present),
    botJoinedAt: (row.bot_joined_at as string | null) ?? null,
    lastSeenAt: (row.last_seen_at as string | null) ?? null,
    lastHeartbeatAt: (row.last_heartbeat_at as string | null) ?? null,
  };
}

function mapGuildChannel(row: Record<string, unknown>): GuildChannelOption {
  return {
    guildId: String(row.guild_id),
    channelId: String(row.channel_id),
    name: String(row.name),
    type: String(row.type),
    position: Number(row.position ?? 0),
    parentId: (row.parent_id as string | null) ?? null,
    parentName: (row.parent_name as string | null) ?? null,
    isTextLogCandidate: Boolean(row.is_text_log_candidate),
    botCanSend: Boolean(row.bot_can_send),
  };
}

function mapGuildRole(row: Record<string, unknown>): GuildRoleOption {
  return {
    guildId: String(row.guild_id),
    roleId: String(row.role_id),
    name: String(row.name),
    position: Number(row.position ?? 0),
    managed: Boolean(row.managed),
    isDefault: Boolean(row.is_default),
    botAssignable: Boolean(row.bot_assignable),
  };
}

function mapModerationLog(row: Record<string, unknown>): ModerationLogRecord {
  return {
    id: String(row.id),
    guildId: String(row.guild_id),
    userId: String(row.user_id),
    moderatorId: String(row.moderator_id),
    action: String(row.action),
    reason: String(row.reason),
    duration: (row.duration as string | null) ?? null,
    createdAt: (row.created_at as string | null) ?? null,
  };
}

function mapWarning(row: Record<string, unknown>): WarningRecord {
  return {
    id: String(row.id),
    guildId: String(row.guild_id),
    userId: String(row.user_id),
    moderatorId: String(row.moderator_id),
    reason: String(row.reason),
    createdAt: (row.created_at as string | null) ?? null,
  };
}

function mapTemporaryRole(row: Record<string, unknown>): TemporaryRoleRecord {
  return {
    id: String(row.id),
    guildId: String(row.guild_id),
    userId: String(row.user_id),
    roleId: String(row.role_id),
    expiresAt: String(row.expires_at),
    createdAt: (row.created_at as string | null) ?? null,
  };
}

function mapTemporaryBan(row: Record<string, unknown>): TemporaryBanRecord {
  return {
    id: String(row.id),
    guildId: String(row.guild_id),
    userId: String(row.user_id),
    expiresAt: String(row.expires_at),
    reason: String(row.reason),
    createdAt: (row.created_at as string | null) ?? null,
  };
}

function mapRoleLock(row: Record<string, unknown>): RoleLockRecord {
  return {
    guildId: String(row.guild_id),
    userId: String(row.user_id),
    lockedRoles: Array.isArray(row.locked_roles)
      ? row.locked_roles.map((value) => String(value))
      : [],
    createdAt: (row.created_at as string | null) ?? null,
  };
}

function mapAuditLog(row: Record<string, unknown>): DashboardAuditLogRecord {
  return {
    id: String(row.id),
    actorUserId: String(row.actor_user_id),
    guildId: String(row.guild_id),
    entity: String(row.entity),
    action: String(row.action),
    before: (row.before as Record<string, unknown> | null) ?? null,
    after: (row.after as Record<string, unknown> | null) ?? null,
    createdAt: String(row.created_at),
  };
}

export async function getAccessibleGuilds(userId: string) {
  noStore();
  const admin = createAdminClient();

  const { data: accessRows, error: accessError } = await admin
    .from("dashboard_guild_access_v")
    .select("*")
    .eq("user_id", userId)
    .eq("can_manage", true)
    .order("guild_name", { ascending: true });

  if (accessError) {
    throw accessError;
  }

  const { data: managedGuildRows, error: managedGuildError } = await admin
    .from("dashboard_managed_guilds_v")
    .select("*");

  if (managedGuildError) {
    throw managedGuildError;
  }

  const managedGuildMap = new Map<string, ManagedGuildStatus>(
    (managedGuildRows ?? []).map((row) => {
      const mapped = mapManagedGuild(row as Record<string, unknown>);
      return [mapped!.guildId, mapped!];
    }),
  );

  return (accessRows ?? []).map((row) => {
    const status = managedGuildMap.get(String(row.guild_id));

    const result: AccessibleGuild = {
      guildId: String(row.guild_id),
      guildName: String(row.guild_name),
      iconUrl: (row.icon_url as string | null) ?? status?.iconUrl ?? null,
      permissions: String(row.permissions),
      canManage: Boolean(row.can_manage),
      botPresent: status?.botPresent ?? false,
      botJoinedAt: status?.botJoinedAt ?? null,
      lastSeenAt: status?.lastSeenAt ?? null,
      lastHeartbeatAt: status?.lastHeartbeatAt ?? null,
    };

    return result;
  });
}

export async function getGuildAccessRecord(userId: string, guildId: string) {
  noStore();
  const admin = createAdminClient();
  const { data, error } = await admin
    .from("dashboard_guild_access_v")
    .select("*")
    .eq("user_id", userId)
    .eq("guild_id", guildId)
    .maybeSingle();

  if (error) {
    throw error;
  }

  if (!data) {
    return null;
  }

  return {
    guildId: String(data.guild_id),
    guildName: String(data.guild_name),
    canManage: Boolean(data.can_manage),
  };
}

export async function getGuildConfig(guildId: string) {
  noStore();
  const admin = createAdminClient();
  const { data, error } = await admin
    .from("dashboard_guild_config_v")
    .select("*")
    .eq("guild_id", guildId)
    .maybeSingle();

  if (error) {
    throw error;
  }

  return mapGuildConfig((data as Record<string, unknown> | null) ?? null, guildId);
}

export async function getManagedGuildStatus(guildId: string) {
  noStore();
  const admin = createAdminClient();
  const { data, error } = await admin
    .from("dashboard_managed_guilds_v")
    .select("*")
    .eq("guild_id", guildId)
    .maybeSingle();

  if (error) {
    throw error;
  }

  return mapManagedGuild((data as Record<string, unknown> | null) ?? null);
}

export async function getGuildResourceCatalog(guildId: string): Promise<GuildResourceCatalog> {
  noStore();
  const admin = createAdminClient();

  const [channelsResponse, rolesResponse] = await Promise.all([
    admin
      .from("dashboard_guild_channels_v")
      .select("*")
      .eq("guild_id", guildId)
      .order("position", { ascending: true })
      .order("name", { ascending: true }),
    admin
      .from("dashboard_guild_roles_v")
      .select("*")
      .eq("guild_id", guildId)
      .order("position", { ascending: false })
      .order("name", { ascending: true }),
  ]);
  const channelError = channelsResponse.error;
  const roleError = rolesResponse.error;

  if (channelError || roleError) {
    const resourceError = channelError ?? roleError;

    if (resourceError && isMissingGuildCatalogError(resourceError)) {
      return {
        channels: [],
        roles: [],
      };
    }

    if (channelError) {
      throw channelError;
    }

    if (roleError) {
      throw roleError;
    }
  }

  return {
    channels: (channelsResponse.data ?? []).map((row) =>
      mapGuildChannel(row as Record<string, unknown>),
    ),
    roles: (rolesResponse.data ?? []).map((row) =>
      mapGuildRole(row as Record<string, unknown>),
    ),
  };
}

export async function getGuildDashboardSummary(guildId: string): Promise<GuildDashboardSummary> {
  noStore();
  const admin = createAdminClient();

  const [
    config,
    status,
    warningsCountResponse,
    moderationCountResponse,
    temporaryRoleCountResponse,
    temporaryBanCountResponse,
    roleLockCountResponse,
    latestModerationResponse,
    latestWarningsResponse,
    latestAuditResponse,
  ] = await Promise.all([
    getGuildConfig(guildId),
    getManagedGuildStatus(guildId),
    admin.from("dashboard_warnings_v").select("id", { count: "exact", head: true }).eq("guild_id", guildId),
    admin
      .from("dashboard_moderation_logs_v")
      .select("id", { count: "exact", head: true })
      .eq("guild_id", guildId),
    admin
      .from("dashboard_temporary_roles_v")
      .select("id", { count: "exact", head: true })
      .eq("guild_id", guildId),
    admin
      .from("dashboard_temporary_bans_v")
      .select("id", { count: "exact", head: true })
      .eq("guild_id", guildId),
    admin
      .from("dashboard_role_locks_v")
      .select("user_id", { count: "exact", head: true })
      .eq("guild_id", guildId),
    admin
      .from("dashboard_moderation_logs_v")
      .select("*")
      .eq("guild_id", guildId)
      .order("created_at", { ascending: false })
      .limit(6),
    admin
      .from("dashboard_warnings_v")
      .select("*")
      .eq("guild_id", guildId)
      .order("created_at", { ascending: false })
      .limit(6),
    admin
      .from("dashboard_audit_logs_v")
      .select("*")
      .eq("guild_id", guildId)
      .order("created_at", { ascending: false })
      .limit(6),
  ]);

  for (const response of [
    warningsCountResponse,
    moderationCountResponse,
    temporaryRoleCountResponse,
    temporaryBanCountResponse,
    roleLockCountResponse,
    latestModerationResponse,
    latestWarningsResponse,
    latestAuditResponse,
  ]) {
    if (response.error) {
      throw response.error;
    }
  }

  return {
    guildId,
    config,
    status,
    warningCount: warningsCountResponse.count ?? 0,
    moderationLogCount: moderationCountResponse.count ?? 0,
    temporaryRoleCount: temporaryRoleCountResponse.count ?? 0,
    temporaryBanCount: temporaryBanCountResponse.count ?? 0,
    roleLockCount: roleLockCountResponse.count ?? 0,
    latestModerationLogs: (latestModerationResponse.data ?? []).map((row) =>
      mapModerationLog(row as Record<string, unknown>),
    ),
    latestWarnings: (latestWarningsResponse.data ?? []).map((row) =>
      mapWarning(row as Record<string, unknown>),
    ),
    latestAuditLogs: (latestAuditResponse.data ?? []).map((row) =>
      mapAuditLog(row as Record<string, unknown>),
    ),
  };
}

export async function getGuildLogs(guildId: string, action?: string) {
  noStore();
  const admin = createAdminClient();

  let moderationQuery = admin
    .from("dashboard_moderation_logs_v")
    .select("*")
    .eq("guild_id", guildId)
    .order("created_at", { ascending: false })
    .limit(50);

  if (action) {
    moderationQuery = moderationQuery.eq("action", action);
  }

  const [moderationResponse, warningResponse] = await Promise.all([
    moderationQuery,
    admin
      .from("dashboard_warnings_v")
      .select("*")
      .eq("guild_id", guildId)
      .order("created_at", { ascending: false })
      .limit(50),
  ]);

  if (moderationResponse.error) {
    throw moderationResponse.error;
  }

  if (warningResponse.error) {
    throw warningResponse.error;
  }

  return {
    moderationLogs: (moderationResponse.data ?? []).map((row) =>
      mapModerationLog(row as Record<string, unknown>),
    ),
    warnings: (warningResponse.data ?? []).map((row) =>
      mapWarning(row as Record<string, unknown>),
    ),
  };
}

export async function getGuildTemporaryActions(guildId: string) {
  noStore();
  const admin = createAdminClient();

  const [temporaryRolesResponse, temporaryBansResponse, roleLocksResponse] =
    await Promise.all([
      admin
        .from("dashboard_temporary_roles_v")
        .select("*")
        .eq("guild_id", guildId)
        .order("expires_at", { ascending: true })
        .limit(50),
      admin
        .from("dashboard_temporary_bans_v")
        .select("*")
        .eq("guild_id", guildId)
        .order("expires_at", { ascending: true })
        .limit(50),
      admin
        .from("dashboard_role_locks_v")
        .select("*")
        .eq("guild_id", guildId)
        .order("created_at", { ascending: false })
        .limit(50),
    ]);

  if (temporaryRolesResponse.error) {
    throw temporaryRolesResponse.error;
  }

  if (temporaryBansResponse.error) {
    throw temporaryBansResponse.error;
  }

  if (roleLocksResponse.error) {
    throw roleLocksResponse.error;
  }

  return {
    temporaryRoles: (temporaryRolesResponse.data ?? []).map((row) =>
      mapTemporaryRole(row as Record<string, unknown>),
    ),
    temporaryBans: (temporaryBansResponse.data ?? []).map((row) =>
      mapTemporaryBan(row as Record<string, unknown>),
    ),
    roleLocks: (roleLocksResponse.data ?? []).map((row) =>
      mapRoleLock(row as Record<string, unknown>),
    ),
  };
}
