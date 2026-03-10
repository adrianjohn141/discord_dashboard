import { NextRequest, NextResponse } from "next/server";
import { requireUserSession, isGlobalAdmin } from "@/lib/auth/guards";
import { createAdminClient } from "@/lib/supabase/admin";

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ feedbackId: string }> }
) {
  const { feedbackId } = await params;
  try {
    const user = await requireUserSession();
    const adminUser = isGlobalAdmin(user as any);
    
    const body = await req.json();
    if (!body.content || typeof body.content !== "string") {
      return NextResponse.json({ error: "Content is required" }, { status: 400 });
    }

    const admin = createAdminClient();
    
    // Check ownership
    const { data: feedback } = await admin
      .from("feedback")
      .select("user_id")
      .eq("id", feedbackId)
      .single();

    if (!feedback) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    if (feedback.user_id !== user.id && !adminUser) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const { error } = await admin
      .from("feedback")
      .update({ content: body.content })
      .eq("id", feedbackId);

    if (error) throw error;
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Failed to update feedback:", error);
    return NextResponse.json({ error: "Failed to update feedback" }, { status: 500 });
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ feedbackId: string }> }
) {
  const { feedbackId } = await params;
  try {
    const user = await requireUserSession();
    const adminUser = isGlobalAdmin(user as any);

    const admin = createAdminClient();
    
    // Check ownership
    const { data: feedback } = await admin
      .from("feedback")
      .select("user_id")
      .eq("id", feedbackId)
      .single();

    if (!feedback) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    if (feedback.user_id !== user.id && !adminUser) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const { error } = await admin
      .from("feedback")
      .delete()
      .eq("id", feedbackId);

    if (error) throw error;
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Failed to delete feedback:", error);
    return NextResponse.json({ error: "Failed to delete feedback" }, { status: 500 });
  }
}
