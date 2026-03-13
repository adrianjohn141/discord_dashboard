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
  appealChannelId: string | null;
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
  caseId: string | null;
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
  caseId: string | null;
  guildId: string;
  userId: string;
  moderatorId: string;
  reason: string;
  createdAt: string | null;
}

export interface ModerationCaseRecord {
  id: string;
  caseRef: string | null;
  guildId: string;
  userId: string;
  moderatorId: string;
  action: string;
  reason: string;
  status: "open" | "resolved" | "voided";
  origin: "manual" | "auto_anti_abuse" | "auto_antiraid" | "system";
  duration: string | null;
  evidenceLinks: string[];
  relatedCaseId: string | null;
  resolutionNote: string | null;
  createdAt: string | null;
  updatedAt: string | null;
  resolvedAt: string | null;
}

export interface EvidenceSnapshotRecord {
  id: string;
  guildId: string;
  caseId: string | null;
  caseRef: string | null;
  source: "automod" | "bot_command" | "manual_delete" | "unknown_delete";
  deletedByUserId: string | null;
  deletedByType: "automod" | "staff" | "system" | "unknown";
  channelId: string;
  messageId: string;
  authorId: string;
  messageContent: string | null;
  attachmentsJson: unknown;
  embedsJson: unknown;
  linksJson: unknown;
  contextBeforeJson: unknown;
  contextAfterJson: unknown;
  authorMetadata: unknown;
  channelMetadata: unknown;
  messageCreatedAt: string | null;
  messageDeletedAt: string | null;
  createdAt: string | null;
}

export interface AppealRecord {
  id: string;
  appealRef: string | null;
  guildId: string;
  caseId: string | null;
  caseRef: string | null;
  userId: string;
  appealType: "ban" | "timeout";
  status: "pending" | "accepted" | "denied" | "withdrawn";
  reason: string;
  evidenceLinks: string[];
  decisionNote: string | null;
  staffNotes: string | null;
  reviewedBy: string | null;
  reviewedAt: string | null;
  source: "discord" | "dashboard";
  createdAt: string | null;
  updatedAt: string | null;
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
  caseId: string | null;
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

export interface BuiltInCommand {
  name: string;
  description: string;
  usage?: string;
  adminOnly?: boolean;
}

export interface BuiltInCommandCategory {
  name: string;
  id: string;
  commands: BuiltInCommand[];
}

export type BuiltInCommandToggleMap = Record<string, boolean>;


export interface RoleLockRecord {
  guildId: string;
  userId: string;
  lockedRoles: string[];
  createdAt: string | null;
}

export interface FeedbackCommentRecord {
  id: string;
  feedbackId: string;
  content: string;
  createdAt: string;
  isAdmin: boolean;
}

export interface FeedbackRecord {
  id: string;
  content: string;
  status: "open" | "done";
  createdAt: string;
  starsCount: number;
  hasStarred: boolean;
  isAuthor: boolean;
  comments: FeedbackCommentRecord[];
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
  caseCount: number;
  pendingAppealCount: number;
  temporaryRoleCount: number;
  temporaryBanCount: number;
  roleLockCount: number;
  latestCases: ModerationCaseRecord[];
  latestWarningCases: ModerationCaseRecord[];
  latestAppeals: AppealRecord[];
  latestAuditLogs: DashboardAuditLogRecord[];
}

export interface StatusRoutePayload {
  authenticated: boolean;
  guildCount: number;
  userId: string | null;
  checkedAt: string;
}
