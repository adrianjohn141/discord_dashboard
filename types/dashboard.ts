export interface DashboardUser {
  id: string;
  email: string | null;
  displayName: string;
  avatarUrl: string | null;
}

export interface AccessibleGuild {
  guildId: string;
  guildName: string;
  iconUrl: string | null;
  permissions: string;
  canManage: boolean;
  botPresent: boolean;
  botJoinedAt: string | null;
  lastSeenAt: string | null;
  lastHeartbeatAt: string | null;
}

export interface GuildConfigRecord {
  guildId: string;
  prefix: string | null;
  modLogChannelId: string | null;
  muteRoleId: string | null;
  autoroleId: string | null;
  antispam: boolean;
  antilink: boolean;
  antiinvite: boolean;
  antiraid: boolean;
  antiAbuseTimeoutWarnings: number;
  antiAbuseTimeoutDuration: string;
  antiAbuseTempbanWarnings: number;
  antiAbuseTempbanDuration: string;
  antiAbuseBanWarnings: number;
  antiAbuseWindowDays: number;
  createdAt: string | null;
}

export interface ManagedGuildStatus {
  guildId: string;
  name: string;
  iconUrl: string | null;
  botPresent: boolean;
  botJoinedAt: string | null;
  lastSeenAt: string | null;
  lastHeartbeatAt: string | null;
}

export interface GuildChannelOption {
  guildId: string;
  channelId: string;
  name: string;
  type: string;
  position: number;
  parentId: string | null;
  parentName: string | null;
  isTextLogCandidate: boolean;
  botCanSend: boolean;
}

export interface GuildRoleOption {
  guildId: string;
  roleId: string;
  name: string;
  position: number;
  managed: boolean;
  isDefault: boolean;
  botAssignable: boolean;
}

export interface GuildResourceCatalog {
  channels: GuildChannelOption[];
  roles: GuildRoleOption[];
}

export interface ModerationLogRecord {
  id: string;
  guildId: string;
  userId: string;
  moderatorId: string;
  action: string;
  reason: string;
  duration: string | null;
  createdAt: string | null;
}

export interface WarningRecord {
  id: string;
  guildId: string;
  userId: string;
  moderatorId: string;
  reason: string;
  createdAt: string | null;
}

export interface TemporaryRoleRecord {
  id: string;
  guildId: string;
  userId: string;
  roleId: string;
  expiresAt: string;
  createdAt: string | null;
}

export interface TemporaryBanRecord {
  id: string;
  guildId: string;
  userId: string;
  expiresAt: string;
  reason: string;
  createdAt: string | null;
}

export interface CustomCommandRecord {
  id: string;
  guildId: string;
  name: string;
  response: string;
  adminOnly: boolean;
  isEmbed: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface RoleLockRecord {
  guildId: string;
  userId: string;
  lockedRoles: string[];
  createdAt: string | null;
}

export interface DashboardAuditLogRecord {
  id: string;
  actorUserId: string;
  guildId: string;
  entity: string;
  action: string;
  before: Record<string, unknown> | null;
  after: Record<string, unknown> | null;
  createdAt: string;
}

export interface GuildDashboardSummary {
  guildId: string;
  config: GuildConfigRecord;
  status: ManagedGuildStatus | null;
  warningCount: number;
  moderationLogCount: number;
  temporaryRoleCount: number;
  temporaryBanCount: number;
  roleLockCount: number;
  latestModerationLogs: ModerationLogRecord[];
  latestWarnings: WarningRecord[];
  latestAuditLogs: DashboardAuditLogRecord[];
}

export interface StatusRoutePayload {
  authenticated: boolean;
  guildCount: number;
  userId: string | null;
  checkedAt: string;
}
