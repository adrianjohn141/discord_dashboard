import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

import { requireGuildAccess } from "@/lib/auth/guards";
import {
  dashboardCacheTags,
  revalidateDashboardTag,
} from "@/lib/db/cache-tags";
import {
  BUILTIN_COMMAND_NAME_SET,
  BUILTIN_COMMAND_NAMES,
} from "@/lib/dashboard/builtin-commands";
import { createAdminClient } from "@/lib/supabase/admin";

const updateBuiltinCommandPayloadSchema = z.object({
  commandName: z.string().trim().min(1),
  enabled: z.boolean(),
});

function makeDefaultToggleMap() {
  return BUILTIN_COMMAND_NAMES.reduce<Record<string, boolean>>((acc, name) => {
    acc[name] = true;
    return acc;
  }, {});
}

function isMissingBuiltinCommandToggleStorageError(error: {
  code?: string | null;
  message?: string | null;
}) {
  const code = error.code ?? "";
  const message = (error.message ?? "").toLowerCase();

  return (
    code === "42P01" ||
    code === "PGRST205" ||
    (message.includes("dashboard_builtin_command_toggles_v") &&
      (message.includes("not found") || message.includes("does not exist"))) ||
    (message.includes("guild_builtin_command_toggles") &&
      (message.includes("not found") || message.includes("does not exist")))
  );
}

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ guildId: string }> },
) {
  const { guildId } = await params;

  try {
    await requireGuildAccess(guildId);
    const admin = createAdminClient();
    const { data, error } = await admin
      .from("dashboard_builtin_command_toggles_v")
      .select("command_name,enabled")
      .eq("guild_id", guildId);

    if (error) {
      if (isMissingBuiltinCommandToggleStorageError(error)) {
        return NextResponse.json(makeDefaultToggleMap());
      }
      throw error;
    }

    const toggleMap = makeDefaultToggleMap();

    for (const row of data ?? []) {
      const commandName = String(row.command_name ?? "").trim().toLowerCase();
      if (!BUILTIN_COMMAND_NAME_SET.has(commandName)) {
        continue;
      }
      toggleMap[commandName] = Boolean(row.enabled);
    }

    return NextResponse.json(toggleMap);
  } catch (error) {
    console.error("Failed to fetch built-in command toggles:", error);
    return NextResponse.json(
      { error: "Failed to fetch built-in command toggles" },
      { status: 500 },
    );
  }
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ guildId: string }> },
) {
  const { guildId } = await params;

  try {
    const { user } = await requireGuildAccess(guildId);
    const body = await req.json();
    const parsed = updateBuiltinCommandPayloadSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid payload. Expected commandName and enabled." },
        { status: 400 },
      );
    }

    const commandName = parsed.data.commandName.toLowerCase();
    const enabled = parsed.data.enabled;

    if (!BUILTIN_COMMAND_NAME_SET.has(commandName)) {
      return NextResponse.json(
        { error: "Unknown built-in command." },
        { status: 400 },
      );
    }

    const admin = createAdminClient();

    const { data: beforeData, error: beforeError } = await admin
      .from("guild_builtin_command_toggles")
      .select("*")
      .eq("guild_id", guildId)
      .eq("command_name", commandName)
      .maybeSingle();

    if (beforeError) {
      if (isMissingBuiltinCommandToggleStorageError(beforeError)) {
        return NextResponse.json(
          { error: "Built-in command toggle storage is not available yet." },
          { status: 503 },
        );
      }
      throw beforeError;
    }

    const { data: saved, error: saveError } = await admin
      .from("guild_builtin_command_toggles")
      .upsert(
        {
          guild_id: guildId,
          command_name: commandName,
          enabled,
        },
        { onConflict: "guild_id,command_name" },
      )
      .select("*")
      .single();

    if (saveError) {
      if (isMissingBuiltinCommandToggleStorageError(saveError)) {
        return NextResponse.json(
          { error: "Built-in command toggle storage is not available yet." },
          { status: 503 },
        );
      }
      throw saveError;
    }

    await admin.from("dashboard_audit_logs").insert({
      actor_user_id: user.id,
      guild_id: guildId,
      entity: "builtin_command",
      action: "toggle",
      before: beforeData
        ? {
            commandName,
            enabled: Boolean(beforeData.enabled),
          }
        : {
            commandName,
            enabled: true,
          },
      after: {
        commandName,
        enabled: Boolean(saved.enabled),
      },
    });

    revalidateDashboardTag(dashboardCacheTags.commands(guildId));

    return NextResponse.json({
      commandName,
      enabled: Boolean(saved.enabled),
      updatedAt: saved.updated_at ?? null,
    });
  } catch (error) {
    console.error("Failed to update built-in command toggle:", error);
    return NextResponse.json(
      { error: "Failed to update built-in command toggle" },
      { status: 500 },
    );
  }
}
