import { NextRequest, NextResponse } from "next/server";

import {
  dashboardCacheTags,
  revalidateDashboardTag,
} from "@/lib/db/cache-tags";
import { requireUserSession } from "@/lib/auth/guards";
import { getFeedbackRecords } from "@/lib/db/queries";
import { createAdminClient } from "@/lib/supabase/admin";

export async function GET() {
  try {
    const user = await requireUserSession();
    return NextResponse.json(await getFeedbackRecords(user.id));
  } catch (error) {
    console.error("Failed to fetch feedback:", error);
    return NextResponse.json({ error: "Failed to fetch feedback" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = await requireUserSession();
    const body = await req.json();
    
    if (!body.content || typeof body.content !== "string") {
      return NextResponse.json({ error: "Content is required" }, { status: 400 });
    }

    const admin = createAdminClient();
    const { data, error } = await admin
      .from("feedback")
      .insert({ content: body.content, user_id: user.id })
      .select()
      .single();

    if (error) throw error;

    revalidateDashboardTag(dashboardCacheTags.feedback());
    return NextResponse.json(data);
  } catch (error) {
    console.error("Failed to create feedback:", error);
    return NextResponse.json({ error: "Failed to create feedback" }, { status: 500 });
  }
}
