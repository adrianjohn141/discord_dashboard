import "server-only";

import { unstable_cache } from "next/cache";

import {
  dashboardCacheTags,
  dashboardCacheTtls,
} from "@/lib/db/cache-tags";
import { createAdminClient } from "@/lib/supabase/admin";
import type {
  AccessibleGuild,
  AppealRecord,
  BuiltInCommandToggleMap,
  CustomCommandRecord,
  DashboardAuditLogRecord,
  FeedbackCommentRecord,
  FeedbackRecord,
  GuildChannelOption,
  GuildConfigRecord,
  GuildDashboardSummary,
  GuildResourceCatalog,
  GuildRoleOption,
  ManagedGuildStatus,
  ModerationCaseRecord,
  ModerationLogRecord,
  RoleLockRecord,
  TemporaryBanRecord,
  TemporaryRoleRecord,
  WarningRecord,
} from "@/types/dashboard";

const DEFAULT_GUILD_CONFIG: Omit<GuildConfigRecord, "guildId" | "createdAt"> = {
  prefix: "!",
  modLogChannelId: null,
  appealChannelId: null,
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

function runCachedQuery<T>(
  keyParts: string[],
  tags: string[],
  revalidate: number,
  loader: () => Promise<T>,
) {
  return unstable_cache(loader, keyParts, { tags, revalidate })();
}

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

function isMissingAppealsViewError(error: { code?: string | null; message?: string | null }) {
  const code = error.code ?? "";
  const message = (error.message ?? "").toLowerCase();

  return (
    code === "42P01" ||
    code === "PGRST205" ||
    (message.includes("dashboard_appeals_v") && message.includes("not found")) ||
    (message.includes("dashboard_appeals_v") && message.includes("does not exist"))
  );
}

function isMissingBuiltinToggleViewError(error: { code?: string | null; message?: string | null }) {
  const code = error.code ?? "";
  const message = (error.message ?? "").toLowerCase();

  return (
    code === "42P01" ||
    code === "PGRST205" ||
    (message.includes("dashboard_builtin_command_toggles_v") && message.includes("not found")) ||
    (message.includes("dashboard_builtin_command_toggles_v") && message.includes("does not exist"))
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
    appealChannelId: (row.appeal_channel_id as string | null) ?? null,
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
    caseId: (row.case_id as string | null) ?? null,
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
    caseId: (row.case_id as string | null) ?? null,
    guildId: String(row.guild_id),
    userId: String(row.user_id),
    moderatorId: String(row.moderator_id),
    reason: String(row.reason),
    createdAt: (row.created_at as string | null) ?? null,
  };
}

function mapModerationCase(row: Record<string, unknown>): ModerationCaseRecord {
  const status = String(row.status ?? "open");
  const origin = String(row.origin ?? "manual");

  return {
    id: String(row.id),
    caseRef: (row.case_ref as string | null) ?? null,
    guildId: String(row.guild_id),
    userId: String(row.user_id),
    moderatorId: String(row.moderator_id),
    action: String(row.action),
    reason: String(row.reason),
    status: status === "resolved" || status === "voided" ? status : "open",
    origin:
      origin === "auto_anti_abuse" || origin === "auto_antiraid" || origin === "system"
        ? origin
        : "manual",
    duration: (row.duration as string | null) ?? null,
    evidenceLinks: Array.isArray(row.evidence_links)
      ? row.evidence_links.map((value) => String(value))
      : [],
    relatedCaseId: (row.related_case_id as string | null) ?? null,
    resolutionNote: (row.resolution_note as string | null) ?? null,
    createdAt: (row.created_at as string | null) ?? null,
    updatedAt: (row.updated_at as string | null) ?? null,
    resolvedAt: (row.resolved_at as string | null) ?? null,
  };
}

function mapAppeal(row: Record<string, unknown>): AppealRecord {
  const status = String(row.status ?? "pending");
  const appealType = String(row.appeal_type ?? "ban");
  const source = String(row.source ?? "discord");

  return {
    id: String(row.id),
    appealRef: (row.appeal_ref as string | null) ?? null,
    guildId: String(row.guild_id),
    caseId: (row.case_id as string | null) ?? null,
    caseRef: (row.case_ref as string | null) ?? null,
    userId: String(row.user_id),
    appealType: appealType === "timeout" ? "timeout" : "ban",
    status:
      status === "accepted" || status === "denied" || status === "withdrawn"
        ? status
        : "pending",
    reason: String(row.reason),
    evidenceLinks: Array.isArray(row.evidence_links)
      ? row.evidence_links.map((value) => String(value))
      : [],
    decisionNote: (row.decision_note as string | null) ?? null,
    staffNotes: (row.staff_notes as string | null) ?? null,
    reviewedBy: (row.reviewed_by as string | null) ?? null,
    reviewedAt: (row.reviewed_at as string | null) ?? null,
    source: source === "dashboard" ? "dashboard" : "discord",
    createdAt: (row.created_at as string | null) ?? null,
    updatedAt: (row.updated_at as string | null) ?? null,
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
    caseId: (row.case_id as string | null) ?? null,
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

function mapCustomCommand(row: Record<string, unknown>): CustomCommandRecord {
  return {
    id: String(row.id),
    guildId: String(row.guild_id),
    name: String(row.name),
    response: String(row.response),
    adminOnly: Boolean(row.admin_only),
    isEmbed: Boolean(row.is_embed),
    createdAt: String(row.created_at),
    updatedAt: String(row.updated_at),
  };
}

function mapFeedbackComment(row: Record<string, unknown>): FeedbackCommentRecord {
  return {
    id: String(row.id),
    feedbackId: String(row.feedback_id),
    content: String(row.content),
    createdAt: String(row.created_at),
    isAdmin: Boolean(row.is_admin),
  };
}

async function readAccessibleGuilds(userId: string) {
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

    return {
      guildId: String(row.guild_id),
      guildName: String(row.guild_name),
      iconUrl: (row.icon_url as string | null) ?? status?.iconUrl ?? null,
      permissions: String(row.permissions),
      canManage: Boolean(row.can_manage),
      botPresent: status?.botPresent ?? false,
      botJoinedAt: status?.botJoinedAt ?? null,
      lastSeenAt: status?.lastSeenAt ?? null,
      lastHeartbeatAt: status?.lastHeartbeatAt ?? null,
    } satisfies AccessibleGuild;
  });
}

async function readGuildConfig(guildId: string) {
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

async function readManagedGuildStatus(guildId: string) {
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

async function readGuildResourceCatalog(guildId: string): Promise<GuildResourceCatalog> {
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

async function readGuildDashboardSummary(guildId: string): Promise<GuildDashboardSummary> {
  const admin = createAdminClient();

  const [
    config,
    status,
    warningsCountResponse,
    caseCountResponse,
    pendingAppealCountResponse,
    temporaryRoleCountResponse,
    temporaryBanCountResponse,
    roleLockCountResponse,
    latestCasesResponse,
    latestWarningCasesResponse,
    latestAppealsResponse,
    latestAuditResponse,
  ] = await Promise.all([
    readGuildConfig(guildId),
    readManagedGuildStatus(guildId),
    admin
      .from("dashboard_moderation_cases_v")
      .select("id", { count: "exact", head: true })
      .eq("guild_id", guildId)
      .eq("action", "warn")
      .eq("status", "open"),
    admin
      .from("dashboard_moderation_cases_v")
      .select("id", { count: "exact", head: true })
      .eq("guild_id", guildId),
    admin
      .from("dashboard_appeals_v")
      .select("id", { count: "exact", head: true })
      .eq("guild_id", guildId)
      .eq("status", "pending"),
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
      .from("dashboard_moderation_cases_v")
      .select("*")
      .eq("guild_id", guildId)
      .order("created_at", { ascending: false })
      .limit(6),
    admin
      .from("dashboard_moderation_cases_v")
      .select("*")
      .eq("guild_id", guildId)
      .eq("action", "warn")
      .eq("status", "open")
      .order("created_at", { ascending: false })
      .limit(6),
    admin
      .from("dashboard_appeals_v")
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

  const missingAppealsView =
    (pendingAppealCountResponse.error && isMissingAppealsViewError(pendingAppealCountResponse.error)) ||
    (latestAppealsResponse.error && isMissingAppealsViewError(latestAppealsResponse.error));

  for (const response of [
    warningsCountResponse,
    caseCountResponse,
    pendingAppealCountResponse,
    temporaryRoleCountResponse,
    temporaryBanCountResponse,
    roleLockCountResponse,
    latestCasesResponse,
    latestWarningCasesResponse,
    latestAppealsResponse,
    latestAuditResponse,
  ]) {
    if (response.error) {
      if (
        missingAppealsView &&
        (response === pendingAppealCountResponse || response === latestAppealsResponse)
      ) {
        continue;
      }
      throw response.error;
    }
  }

  return {
    guildId,
    config,
    status,
    warningCount: warningsCountResponse.count ?? 0,
    caseCount: caseCountResponse.count ?? 0,
    pendingAppealCount: missingAppealsView ? 0 : (pendingAppealCountResponse.count ?? 0),
    temporaryRoleCount: temporaryRoleCountResponse.count ?? 0,
    temporaryBanCount: temporaryBanCountResponse.count ?? 0,
    roleLockCount: roleLockCountResponse.count ?? 0,
    latestCases: (latestCasesResponse.data ?? []).map((row) =>
      mapModerationCase(row as Record<string, unknown>),
    ),
    latestWarningCases: (latestWarningCasesResponse.data ?? []).map((row) =>
      mapModerationCase(row as Record<string, unknown>),
    ),
    latestAppeals: (missingAppealsView ? [] : (latestAppealsResponse.data ?? [])).map((row) =>
      mapAppeal(row as Record<string, unknown>),
    ),
    latestAuditLogs: (latestAuditResponse.data ?? []).map((row) =>
      mapAuditLog(row as Record<string, unknown>),
    ),
  };
}

async function readGuildLogs(guildId: string, action?: string, status?: string) {
  const admin = createAdminClient();

  let moderationQuery = admin
    .from("dashboard_moderation_cases_v")
    .select("*")
    .eq("guild_id", guildId)
    .order("created_at", { ascending: false })
    .limit(50);

  if (action) {
    moderationQuery = moderationQuery.eq("action", action);
  }

  if (status) {
    moderationQuery = moderationQuery.eq("status", status);
  }

  const moderationResponse = await moderationQuery;

  if (moderationResponse.error) {
    throw moderationResponse.error;
  }

  return {
    moderationCases: (moderationResponse.data ?? []).map((row) =>
      mapModerationCase(row as Record<string, unknown>),
    ),
  };
}

async function readGuildAppeals(guildId: string, status?: string, appealType?: string) {
  const admin = createAdminClient();

  let appealQuery = admin
    .from("dashboard_appeals_v")
    .select("*")
    .eq("guild_id", guildId)
    .order("created_at", { ascending: false })
    .limit(100);

  if (status) {
    appealQuery = appealQuery.eq("status", status);
  }

  if (appealType) {
    appealQuery = appealQuery.eq("appeal_type", appealType);
  }

  const appealResponse = await appealQuery;
  if (appealResponse.error) {
    if (isMissingAppealsViewError(appealResponse.error)) {
      return { appeals: [] };
    }
    throw appealResponse.error;
  }

  return {
    appeals: (appealResponse.data ?? []).map((row) =>
      mapAppeal(row as Record<string, unknown>),
    ),
  };
}

async function readGuildTemporaryActions(guildId: string) {
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

async function readCustomCommands(guildId: string) {
  const admin = createAdminClient();
  const { data, error } = await admin
    .from("dashboard_custom_commands_v")
    .select("*")
    .eq("guild_id", guildId)
    .order("name", { ascending: true });

  if (error) {
    throw error;
  }

  return (data ?? []).map((row) => mapCustomCommand(row as Record<string, unknown>));
}

async function readBuiltInCommandToggles(guildId: string): Promise<BuiltInCommandToggleMap> {
  const admin = createAdminClient();
  const { data, error } = await admin
    .from("dashboard_builtin_command_toggles_v")
    .select("command_name,enabled")
    .eq("guild_id", guildId);

  if (error) {
    if (isMissingBuiltinToggleViewError(error)) {
      return {};
    }
    throw error;
  }

  return (data ?? []).reduce<BuiltInCommandToggleMap>((acc, row) => {
    const commandName = String(row.command_name ?? "").trim().toLowerCase();
    if (!commandName) {
      return acc;
    }

    acc[commandName] = Boolean(row.enabled);
    return acc;
  }, {});
}

async function readFeedbackRecords(userId: string) {
  const admin = createAdminClient();
  const [feedbackResponse, userStarsResponse, allStarsResponse, commentsResponse] =
    await Promise.all([
      admin.from("feedback").select("*").order("created_at", { ascending: false }),
      admin.from("feedback_stars").select("feedback_id").eq("user_id", userId),
      admin.from("feedback_stars").select("feedback_id"),
      admin.from("feedback_comments").select("*").order("created_at", { ascending: true }),
    ]);

  if (feedbackResponse.error) {
    throw feedbackResponse.error;
  }

  if (userStarsResponse.error) {
    throw userStarsResponse.error;
  }

  if (allStarsResponse.error) {
    throw allStarsResponse.error;
  }

  if (commentsResponse.error) {
    throw commentsResponse.error;
  }

  const starCounts = (allStarsResponse.data ?? []).reduce<Record<string, number>>((acc, row) => {
    const feedbackId = String(row.feedback_id);
    acc[feedbackId] = (acc[feedbackId] ?? 0) + 1;
    return acc;
  }, {});

  const starredSet = new Set((userStarsResponse.data ?? []).map((row) => String(row.feedback_id)));
  const commentsByFeedbackId = new Map<string, FeedbackCommentRecord[]>();

  for (const row of commentsResponse.data ?? []) {
    const comment = mapFeedbackComment(row as Record<string, unknown>);
    const bucket = commentsByFeedbackId.get(comment.feedbackId);

    if (bucket) {
      bucket.push(comment);
      continue;
    }

    commentsByFeedbackId.set(comment.feedbackId, [comment]);
  }

  return (feedbackResponse.data ?? []).map((row) => {
    const feedbackId = String(row.id);

    return {
      id: feedbackId,
      content: String(row.content),
      status: row.status === "done" ? "done" : "open",
      createdAt: String(row.created_at),
      starsCount: starCounts[feedbackId] ?? 0,
      hasStarred: starredSet.has(feedbackId),
      isAuthor: String(row.user_id) === userId,
      comments: commentsByFeedbackId.get(feedbackId) ?? [],
    } satisfies FeedbackRecord;
  });
}

export async function getAccessibleGuilds(userId: string) {
  return runCachedQuery(
    ["guild-access", userId],
    [dashboardCacheTags.guildAccess(userId)],
    dashboardCacheTtls.guildAccess,
    () => readAccessibleGuilds(userId),
  );
}

export async function getGuildAccessRecord(userId: string, guildId: string) {
  const guilds = await getAccessibleGuilds(userId);
  const accessRecord = guilds.find((guild) => guild.guildId === guildId) ?? null;

  if (!accessRecord) {
    return null;
  }

  return {
    guildId: accessRecord.guildId,
    guildName: accessRecord.guildName,
    canManage: accessRecord.canManage,
  };
}

export async function getGuildConfig(guildId: string) {
  return runCachedQuery(
    ["guild-config", guildId],
    [dashboardCacheTags.guildConfig(guildId)],
    dashboardCacheTtls.guildConfig,
    () => readGuildConfig(guildId),
  );
}

export async function getManagedGuildStatus(guildId: string) {
  return runCachedQuery(
    ["guild-summary-status", guildId],
    [dashboardCacheTags.guildSummary(guildId)],
    dashboardCacheTtls.guildSummary,
    () => readManagedGuildStatus(guildId),
  );
}

export async function getGuildResourceCatalog(guildId: string): Promise<GuildResourceCatalog> {
  return runCachedQuery(
    ["guild-resources", guildId],
    [dashboardCacheTags.guildResources(guildId)],
    dashboardCacheTtls.guildResources,
    () => readGuildResourceCatalog(guildId),
  );
}

export async function getGuildDashboardSummary(guildId: string): Promise<GuildDashboardSummary> {
  return runCachedQuery(
    ["guild-summary-v3", guildId],
    [dashboardCacheTags.guildSummary(guildId)],
    dashboardCacheTtls.guildSummary,
    () => readGuildDashboardSummary(guildId),
  );
}

export async function getGuildLogs(guildId: string, action?: string, status?: string) {
  return runCachedQuery(
    ["guild-logs", guildId, action ?? "all", status ?? "all"],
    [dashboardCacheTags.guildLogs(guildId)],
    dashboardCacheTtls.guildLogs,
    () => readGuildLogs(guildId, action, status),
  );
}

export async function getGuildAppeals(guildId: string, status?: string, appealType?: string) {
  return runCachedQuery(
    ["guild-appeals", guildId, status ?? "all", appealType ?? "all"],
    [dashboardCacheTags.guildAppeals(guildId)],
    dashboardCacheTtls.guildAppeals,
    () => readGuildAppeals(guildId, status, appealType),
  );
}

export async function getGuildTemporaryActions(guildId: string) {
  return runCachedQuery(
    ["guild-temp-actions", guildId],
    [dashboardCacheTags.guildTempActions(guildId)],
    dashboardCacheTtls.guildTempActions,
    () => readGuildTemporaryActions(guildId),
  );
}

export async function getCustomCommands(guildId: string): Promise<CustomCommandRecord[]> {
  return runCachedQuery(
    ["commands", guildId],
    [dashboardCacheTags.commands(guildId)],
    dashboardCacheTtls.commands,
    () => readCustomCommands(guildId),
  );
}

export async function getBuiltInCommandToggles(
  guildId: string,
): Promise<BuiltInCommandToggleMap> {
  return runCachedQuery(
    ["builtin-command-toggles", guildId],
    [dashboardCacheTags.commands(guildId)],
    dashboardCacheTtls.commands,
    () => readBuiltInCommandToggles(guildId),
  );
}

export async function getFeedbackRecords(userId: string): Promise<FeedbackRecord[]> {
  return runCachedQuery(
    ["feedback", userId],
    [dashboardCacheTags.feedback()],
    dashboardCacheTtls.feedback,
    () => readFeedbackRecords(userId),
  );
}
