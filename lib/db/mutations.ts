import "server-only";

import type { User } from "@supabase/supabase-js";
import { z } from "zod";

import {
  dashboardCacheTags,
  revalidateDashboardTags,
} from "@/lib/db/cache-tags";
import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";
import type { GuildConfigRecord } from "@/types/dashboard";

const antiAbuseDurationPattern = /^\d+[smhd]$/;

const integerFieldSchema = (minimum: number) =>
  z.preprocess((value) => {
    if (typeof value === "number") {
      return value;
    }

    if (typeof value === "string") {
      const trimmed = value.trim();

      if (!trimmed) {
        return value;
      }

      const parsed = Number(trimmed);
      return Number.isFinite(parsed) ? parsed : value;
    }

    return value;
  }, z.number().finite().int().min(minimum));

const antiAbuseDurationSchema = (message: string) =>
  z.string().trim().toLowerCase().regex(antiAbuseDurationPattern, message);

const optionalSnowflakeSchema = z
  .string()
  .trim()
  .optional()
  .nullable()
  .transform((value) => {
    if (!value) {
      return null;
    }

    return /^\d+$/.test(value) ? value : null;
  });

export const settingsPayloadSchema = z.object({
  guildId: z.string().regex(/^\d+$/),
  modLogChannelId: optionalSnowflakeSchema,
  appealChannelId: optionalSnowflakeSchema,
  muteRoleId: optionalSnowflakeSchema,
  autoroleId: optionalSnowflakeSchema,
});

export const automationPayloadSchema = z
  .object({
    guildId: z.string().regex(/^\d+$/),
    antispam: z.boolean(),
    antilink: z.boolean(),
    antiinvite: z.boolean(),
    antiraid: z.boolean(),
    antiAbuseTimeoutWarnings: integerFieldSchema(1),
    antiAbuseTimeoutDuration: antiAbuseDurationSchema(
      "Timeout duration must use formats like 30m, 1h, or 1d.",
    ),
    antiAbuseTempbanWarnings: integerFieldSchema(2),
    antiAbuseTempbanDuration: antiAbuseDurationSchema(
      "Temporary ban duration must use formats like 1d or 7d.",
    ),
    antiAbuseBanWarnings: integerFieldSchema(3),
    antiAbuseWindowDays: integerFieldSchema(1),
  })
  .superRefine((value, ctx) => {
    if (
      !(
        value.antiAbuseTimeoutWarnings < value.antiAbuseTempbanWarnings &&
        value.antiAbuseTempbanWarnings < value.antiAbuseBanWarnings
      )
    ) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Thresholds must follow timeout < tempban < ban.",
      });
    }
  });

function pickConfigAuditShape(config: GuildConfigRecord | null) {
  if (!config) {
    return null;
  }

  return {
    modLogChannelId: config.modLogChannelId,
    appealChannelId: config.appealChannelId,
    muteRoleId: config.muteRoleId,
    autoroleId: config.autoroleId,
    antispam: config.antispam,
    antilink: config.antilink,
    antiinvite: config.antiinvite,
    antiraid: config.antiraid,
    antiAbuseTimeoutWarnings: config.antiAbuseTimeoutWarnings,
    antiAbuseTimeoutDuration: config.antiAbuseTimeoutDuration,
    antiAbuseTempbanWarnings: config.antiAbuseTempbanWarnings,
    antiAbuseTempbanDuration: config.antiAbuseTempbanDuration,
    antiAbuseBanWarnings: config.antiAbuseBanWarnings,
    antiAbuseWindowDays: config.antiAbuseWindowDays,
  };
}

export async function upsertDashboardProfile(user: User) {
  const admin = createAdminClient();

  const payload = {
    id: user.id,
    discord_user_id: String(user.user_metadata?.provider_id ?? user.user_metadata?.sub ?? ""),
    email: user.email ?? null,
    display_name: String(
      user.user_metadata?.full_name ??
        user.user_metadata?.custom_claims?.global_name ??
        user.user_metadata?.name ??
        user.user_metadata?.user_name ??
        user.email ??
        "Discord User",
    ),
    avatar_url: String(
      user.user_metadata?.avatar_url ?? user.user_metadata?.picture ?? "",
    ) || null,
    raw_user_meta: user.user_metadata ?? {},
    last_login_at: new Date().toISOString(),
  };

  const { error } = await admin.from("dashboard_profiles").upsert(payload, {
    onConflict: "id",
  });

  if (error) {
    throw error;
  }
}

export async function createDashboardAuditLog(input: {
  actorUserId: string;
  guildId: string;
  entity: string;
  action: string;
  before: Record<string, unknown> | null;
  after: Record<string, unknown> | null;
}) {
  const admin = createAdminClient();
  const { error } = await admin.from("dashboard_audit_logs").insert({
    actor_user_id: input.actorUserId,
    guild_id: input.guildId,
    entity: input.entity,
    action: input.action,
    before: input.before,
    after: input.after,
  });

  if (error) {
    throw error;
  }
}

export async function updateGuildConfig(
  actorUserId: string,
  payload: z.input<typeof settingsPayloadSchema>,
  existingConfig: GuildConfigRecord | null,
) {
  const parsed = settingsPayloadSchema.parse(payload);
  const admin = createAdminClient();

  const configUpdate = {
    guild_id: parsed.guildId,
    mod_log_channel_id: parsed.modLogChannelId,
    appeal_channel_id: parsed.appealChannelId,
    mute_role_id: parsed.muteRoleId,
    autorole_id: parsed.autoroleId,
  };

  const { error } = await admin.from("guild_config").upsert(configUpdate, {
    onConflict: "guild_id",
  });

  if (error) {
    throw error;
  }

  await createDashboardAuditLog({
    actorUserId,
    guildId: parsed.guildId,
    entity: "guild_config",
    action: "settings.updated",
    before: pickConfigAuditShape(existingConfig),
    after: {
      ...pickConfigAuditShape(existingConfig),
      modLogChannelId: parsed.modLogChannelId,
      appealChannelId: parsed.appealChannelId,
      muteRoleId: parsed.muteRoleId,
      autoroleId: parsed.autoroleId,
    },
  });
  revalidateDashboardTags([
    dashboardCacheTags.guildConfig(parsed.guildId),
    dashboardCacheTags.guildSummary(parsed.guildId),
  ]);
}

export async function updateAntiAbusePolicy(
  actorUserId: string,
  payload: z.input<typeof automationPayloadSchema>,
  existingConfig: GuildConfigRecord | null,
) {
  const parsed = automationPayloadSchema.parse(payload);
  const admin = createAdminClient();

  const automationUpdate = {
    guild_id: parsed.guildId,
    antispam: parsed.antispam,
    antilink: parsed.antilink,
    antiinvite: parsed.antiinvite,
    antiraid: parsed.antiraid,
    anti_abuse_timeout_warnings: parsed.antiAbuseTimeoutWarnings,
    anti_abuse_timeout_duration: parsed.antiAbuseTimeoutDuration,
    anti_abuse_tempban_warnings: parsed.antiAbuseTempbanWarnings,
    anti_abuse_tempban_duration: parsed.antiAbuseTempbanDuration,
    anti_abuse_ban_warnings: parsed.antiAbuseBanWarnings,
    anti_abuse_window_days: parsed.antiAbuseWindowDays,
  };

  const { error } = await admin.from("guild_config").upsert(automationUpdate, {
    onConflict: "guild_id",
  });

  if (error) {
    throw error;
  }

  await createDashboardAuditLog({
    actorUserId,
    guildId: parsed.guildId,
    entity: "guild_config",
    action: "automation.updated",
    before: pickConfigAuditShape(existingConfig),
    after: {
      ...pickConfigAuditShape(existingConfig),
      antispam: parsed.antispam,
      antilink: parsed.antilink,
      antiinvite: parsed.antiinvite,
      antiraid: parsed.antiraid,
      antiAbuseTimeoutWarnings: parsed.antiAbuseTimeoutWarnings,
      antiAbuseTimeoutDuration: parsed.antiAbuseTimeoutDuration,
      antiAbuseTempbanWarnings: parsed.antiAbuseTempbanWarnings,
      antiAbuseTempbanDuration: parsed.antiAbuseTempbanDuration,
      antiAbuseBanWarnings: parsed.antiAbuseBanWarnings,
      antiAbuseWindowDays: parsed.antiAbuseWindowDays,
    },
  });
  revalidateDashboardTags([
    dashboardCacheTags.guildConfig(parsed.guildId),
    dashboardCacheTags.guildSummary(parsed.guildId),
  ]);
}

export async function enqueueAction(input: {
  guildId: string;
  moderatorId: string; // The UUID from auth.users.id
  targetUserId?: string | null;
  actionType: string;
  actionPayload: Record<string, unknown>;
}) {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("action_queue")
    .insert({
      guild_id: input.guildId,
      moderator_id: input.moderatorId,
      target_user_id: input.targetUserId ?? null,
      action_type: input.actionType,
      action_payload: input.actionPayload,
      status: "pending",
    })
    .select("id")
    .single();

  if (error) {
    throw error;
  }

  return { taskId: String(data.id) };
}
