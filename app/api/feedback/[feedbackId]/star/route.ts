import { NextRequest, NextResponse } from "next/server";
import { requireUserSession } from "@/lib/auth/guards";
import { createAdminClient } from "@/lib/supabase/admin";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ feedbackId: string }> }
) {
  const { feedbackId } = await params;
  try {
    const user = await requireUserSession();
    const admin = createAdminClient();

    // Check if user already starred
    const { data: existingStar } = await admin
      .from("feedback_stars")
      .select("*")
      .eq("feedback_id", feedbackId)
      .eq("user_id", user.id)
      .maybeSingle();

    if (existingStar) {
      // Unstar
      const { error } = await admin
        .from("feedback_stars")
        .delete()
        .eq("feedback_id", feedbackId)
        .eq("user_id", user.id);
      
      if (error) throw error;
      return NextResponse.json({ starred: false });
    } else {
      // Star
      const { error } = await admin
        .from("feedback_stars")
        .insert({ feedback_id: feedbackId, user_id: user.id });

      // If it throws a 23505 (unique constraint violation), it means a concurrent request
      // already inserted the star before our select could see it. We can just ignore it
      // since the end result (user has starred it) is the same.
      if (error && error.code !== '23505') throw error;
      
      return NextResponse.json({ starred: true });
    }
  } catch (error) {
    console.error("Failed to toggle star:", error);
    return NextResponse.json({ error: "Failed to toggle star" }, { status: 500 });
  }
}
