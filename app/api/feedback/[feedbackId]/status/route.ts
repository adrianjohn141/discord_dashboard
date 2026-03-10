import { NextRequest, NextResponse } from "next/server";

import {
  dashboardCacheTags,
  revalidateDashboardTag,
} from "@/lib/db/cache-tags";
import { isGlobalAdmin, requireUserSession } from "@/lib/auth/guards";
import { createAdminClient } from "@/lib/supabase/admin";

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ feedbackId: string }> }
) {
  const { feedbackId } = await params;
  try {
    const user = await requireUserSession();
    if (!isGlobalAdmin(user)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const admin = createAdminClient();
    const { error } = await admin
      .from("feedback")
      .update({ status: "done" })
      .eq("id", feedbackId);

    if (error) throw error;
    revalidateDashboardTag(dashboardCacheTags.feedback());
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Failed to update status:", error);
    return NextResponse.json({ error: "Failed to update status" }, { status: 500 });
  }
}
