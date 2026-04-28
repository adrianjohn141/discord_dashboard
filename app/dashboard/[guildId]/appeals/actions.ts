"use server";

import { requireGuildAccess } from "@/lib/auth/guards";
import {
  dashboardCacheTags,
  revalidateDashboardTags,
} from "@/lib/db/cache-tags";
import { createAdminClient } from "@/lib/supabase/admin";
import { enqueueAction } from "@/lib/db/mutations";

const VALID_DECISIONS = new Set(["accepted", "denied"]);
const DISCORD_API_BASE = "https://discord.com/api/v10";

function extractDiscordId(user: { user_metadata?: Record<string, unknown> }) {
  const raw = String(user.user_metadata?.provider_id ?? user.user_metadata?.sub ?? "").trim();
  if (!/^\d+$/.test(raw)) {
    return null;
  }
  return raw;
}

function getBotToken() {
  const token =
    process.env.DISCORD_BOT_TOKEN?.trim() ||
    process.env.DISCORD_TOKEN?.trim();
  return token || null;
}

function parseSnowflake(value: unknown, fieldName: string) {
  const raw = String(value ?? "").trim();
  if (!/^\d+$/.test(raw)) {
    throw new Error(`Invalid ${fieldName} value.`);
  }
  return raw;
}

function parseRecordId(value: string, fieldName: string) {
  if (!/^\d+$/.test(value)) {
    throw new Error(`Invalid ${fieldName} value.`);
  }
  const parsed = Number.parseInt(value, 10);
  if (!Number.isSafeInteger(parsed)) {
    throw new Error(`${fieldName} is too large for safe numeric operations.`);
  }
  return parsed;
}

async function sendAppealAcceptedDm(params: {
  userId: string;
  guildId: string;
  appealRef: string;
  caseRef: string | null;
  decisionNote: string;
}) {
  const botToken = getBotToken();
  if (!botToken) {
    throw new Error("Accepted appeal DM blocked: configure DISCORD_BOT_TOKEN (or DISCORD_TOKEN) on dashboard server.");
  }

  const dmChannelResponse = await fetch(`${DISCORD_API_BASE}/users/@me/channels`, {
    method: "POST",
    headers: {
      Authorization: `Bot ${botToken}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      recipient_id: params.userId,
    }),
  });

  if (!dmChannelResponse.ok) {
    const body = await dmChannelResponse.text();
    throw new Error(
      `Accepted appeal DM blocked: failed to open DM channel (status ${dmChannelResponse.status}) ${body}`,
    );
  }

  const dmChannel = (await dmChannelResponse.json()) as { id?: unknown };
  const dmChannelId = parseSnowflake(dmChannel.id, "DM channel ID");
  const caseLabel = params.caseRef ?? "N/A";
  const message =
    `Your appeal \`${params.appealRef}\` in guild \`${params.guildId}\` was \`accepted\`.\n` +
    `Case: \`${caseLabel}\`\n` +
    `Server ID: \`${params.guildId}\`\n` +
    `Decision note: ${params.decisionNote}`;

  const messageResponse = await fetch(`${DISCORD_API_BASE}/channels/${dmChannelId}/messages`, {
    method: "POST",
    headers: {
      Authorization: `Bot ${botToken}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      content: message,
    }),
  });

  if (!messageResponse.ok) {
    const body = await messageResponse.text();
    throw new Error(
      `Accepted appeal DM blocked: failed to send DM (status ${messageResponse.status}) ${body}`,
    );
  }
}

export async function decideAppealAction(formData: FormData) {
  const guildId = String(formData.get("guildId") ?? "");
  const appealRef = String(formData.get("appealRef") ?? "").trim().toUpperCase();
  const decision = String(formData.get("decision") ?? "").toLowerCase();
  const decisionNote = String(formData.get("decisionNote") ?? "").trim() || "No reason provided.";

  if (!/^\d+$/.test(guildId) || !/^[A-Z0-9]+$/.test(appealRef) || !VALID_DECISIONS.has(decision)) {
    return;
  }

  const { user } = await requireGuildAccess(guildId);
  const moderatorDiscordId = extractDiscordId(user);
  if (moderatorDiscordId === null) {
    throw new Error("Unable to resolve Discord moderator ID for this session.");
  }

  const admin = createAdminClient();
  let { data: appeal, error: appealError } = await admin
    .from("dashboard_appeals_v")
    .select("*")
    .eq("appeal_ref", appealRef)
    .eq("guild_id", guildId)
    .maybeSingle();

  if ((!appeal || appealError) && /^\d+$/.test(appealRef)) {
    const fallback = await admin
      .from("dashboard_appeals_v")
      .select("*")
      .eq("id", appealRef)
      .eq("guild_id", guildId)
      .maybeSingle();

    appeal = fallback.data;
    appealError = fallback.error;
  }

  if (appealError) {
    throw appealError;
  }

  if (!appeal || appeal.status !== "pending") {
    return;
  }

  const status = decision === "accepted" ? "accepted" : "denied";
  const now = new Date().toISOString();
  const appealRecordId = parseRecordId(String(appeal.id ?? ""), "appeal ID");
  const normalizedAppealRef = String(appeal.appeal_ref ?? appealRef);
  const appealType = String(appeal.appeal_type ?? "").trim().toLowerCase();
  const targetUserId = parseSnowflake(appeal.user_id, "appeal user ID");
  const caseId = appeal.case_id ? String(appeal.case_id) : null;
  const caseRef = appeal.case_ref ? String(appeal.case_ref) : null;

  if (status === "accepted") {
    // Enqueue reversal action instead of performing it synchronously
    if (appealType === "ban" || appealType === "timeout") {
      await enqueueAction({
        guildId,
        moderatorId: user.id,
        targetUserId,
        actionType: appealType === "ban" ? "unban" : "remove_timeout",
        actionPayload: {
          reason: `Appeal ${normalizedAppealRef} accepted: ${decisionNote}`,
        },
      });
    }
  }

  const { error: updateError } = await admin
    .from("appeals")
    .update({
      status,
      decision_note: decisionNote,
      reviewed_by: moderatorDiscordId,
      reviewed_at: now,
    })
    .eq("id", appealRecordId)
    .eq("guild_id", guildId);

  if (updateError) {
    throw updateError;
  }

  if (status === "accepted" && caseId) {
    await admin
      .from("moderation_cases")
      .update({
        status: "resolved",
        resolution_note: `Appeal ${normalizedAppealRef} accepted via dashboard: ${decisionNote}`,
        resolved_at: now,
      })
      .eq("id", caseId);
  }

  if (status === "accepted" && (appealType === "ban" || appealType === "timeout")) {
    await admin.from("moderation_cases").insert({
      guild_id: guildId,
      user_id: targetUserId,
      moderator_id: moderatorDiscordId,
      action: appealType === "ban" ? "unban" : "untimeout",
      reason: `Appeal ${normalizedAppealRef} accepted: ${decisionNote}`,
      status: "resolved",
      origin: "manual",
      related_case_id: caseId,
      resolution_note: "Appeal accepted via dashboard.",
      resolved_at: now,
    });
  }

  await admin.from("moderation_cases").insert({
    guild_id: guildId,
    user_id: targetUserId,
    moderator_id: moderatorDiscordId,
    action: status === "accepted" ? "appeal_accept" : "appeal_deny",
    reason: `Appeal ${normalizedAppealRef} ${status}: ${decisionNote}`,
    status: "resolved",
    origin: "manual",
    related_case_id: caseId,
    resolution_note: `Appeal ${status} via dashboard.`,
    resolved_at: now,
  });

  await admin.from("dashboard_audit_logs").insert({
    actor_user_id: user.id,
    guild_id: guildId,
    entity: "appeal",
    action: `appeal.${status}`,
    before: {
      appealRef: normalizedAppealRef,
      previousStatus: appeal.status,
      caseId,
      caseRef,
      reason: appeal.reason,
    },
    after: {
      appealRef: normalizedAppealRef,
      status,
      decisionNote,
      reviewedBy: moderatorDiscordId,
    },
  });

  if (status === "accepted") {
    try {
      await sendAppealAcceptedDm({
        userId: targetUserId,
        guildId,
        appealRef: normalizedAppealRef,
        caseRef,
        decisionNote,
      });
    } catch (error) {
      console.warn("Failed to send accepted appeal DM", {
        guildId,
        appealRef: normalizedAppealRef,
        userId: targetUserId,
        error: error instanceof Error ? error.message : String(error),
      });
    }
  }

  revalidateDashboardTags([
    dashboardCacheTags.guildSummary(guildId),
    dashboardCacheTags.guildLogs(guildId),
    dashboardCacheTags.guildAppeals(guildId),
  ]);
}
