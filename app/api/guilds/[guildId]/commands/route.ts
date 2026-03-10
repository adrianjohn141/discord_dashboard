import { NextRequest, NextResponse } from "next/server";

import { requireGuildAccess } from "@/lib/auth/guards";
import {
  dashboardCacheTags,
  revalidateDashboardTag,
} from "@/lib/db/cache-tags";
import { createAdminClient } from "@/lib/supabase/admin";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ guildId: string }> }
) {
  const { guildId } = await params;
  try {
    await requireGuildAccess(guildId);
    const admin = createAdminClient();

    const { data, error } = await admin
      .from("dashboard_custom_commands_v")
      .select("*")
      .eq("guild_id", guildId)
      .order("name", { ascending: true });

    if (error) throw error;

    return NextResponse.json(data);
  } catch (error) {
    console.error("Failed to fetch custom commands:", error);
    return NextResponse.json(
      { error: "Failed to fetch custom commands" },
      { status: 500 }
    );
  }
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ guildId: string }> }
) {
  const { guildId } = await params;
  try {
    const { user } = await requireGuildAccess(guildId);
    const body = await req.json();
    const { name, response, adminOnly, isEmbed } = body;

    if (!name || !response) {
      return NextResponse.json(
        { error: "Name and response are required" },
        { status: 400 }
      );
    }

    const admin = createAdminClient();

    // Fetch before state if editing
    const { data: beforeData } = await admin
      .from("custom_commands")
      .select("*")
      .eq("guild_id", guildId)
      .eq("name", name.toLowerCase())
      .maybeSingle();

    const { data, error } = await admin
      .from("custom_commands")
      .upsert(
        {
          guild_id: guildId,
          name: name.toLowerCase(),
          response: response,
          admin_only: Boolean(adminOnly),
          is_embed: Boolean(isEmbed),
        },
        { onConflict: "guild_id,name" }
      )
      .select()
      .single();

    if (error) throw error;

    // Log the audit action
    await admin.from("dashboard_audit_logs").insert({
      actor_user_id: user.id,
      guild_id: guildId,
      entity: "custom_command",
      action: beforeData ? "update" : "create",
      before: beforeData,
      after: data,
    });

    revalidateDashboardTag(dashboardCacheTags.commands(guildId));
    return NextResponse.json(data);
  } catch (error) {
    console.error("Failed to save custom command:", error);
    return NextResponse.json(
      { error: "Failed to save custom command" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ guildId: string }> }
) {
  const { guildId } = await params;
  const { searchParams } = new URL(req.url);
  const name = searchParams.get("name");

  if (!name) {
    return NextResponse.json(
      { error: "Command name is required" },
      { status: 400 }
    );
  }

  try {
    const { user } = await requireGuildAccess(guildId);
    const admin = createAdminClient();

    // Fetch before state for audit log
    const { data: beforeData } = await admin
      .from("custom_commands")
      .select("*")
      .eq("guild_id", guildId)
      .eq("name", name.toLowerCase())
      .maybeSingle();

    const { error } = await admin
      .from("custom_commands")
      .delete()
      .eq("guild_id", guildId)
      .eq("name", name.toLowerCase());

    if (error) throw error;

    if (beforeData) {
      await admin.from("dashboard_audit_logs").insert({
        actor_user_id: user.id,
        guild_id: guildId,
        entity: "custom_command",
        action: "delete",
        before: beforeData,
        after: null,
      });
    }

    revalidateDashboardTag(dashboardCacheTags.commands(guildId));
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Failed to delete custom command:", error);
    return NextResponse.json(
      { error: "Failed to delete custom command" },
      { status: 500 }
    );
  }
}
