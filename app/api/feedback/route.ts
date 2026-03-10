import { NextRequest, NextResponse } from "next/server";
import { requireUserSession, isGlobalAdmin } from "@/lib/auth/guards";
import { createAdminClient } from "@/lib/supabase/admin";

export async function GET(req: NextRequest) {
  try {
    const user = await requireUserSession();
    const admin = createAdminClient();

    // Fetch all feedback
    const { data: feedbackData, error: feedbackError } = await admin
      .from("feedback")
      .select("*")
      .order("created_at", { ascending: false });

    if (feedbackError) throw feedbackError;

    // Fetch stars for the current user to see which ones they've starred
    const { data: userStars, error: starsError } = await admin
      .from("feedback_stars")
      .select("feedback_id")
      .eq("user_id", user.id);

    if (starsError) throw starsError;

    // Fetch total star counts for all feedback
    // Since Supabase doesn't easily support dynamic subqueries with COUNT in simple select, 
    // we fetch all stars and group them, or we could use an RPC. For simplicity with small data:
    const { data: allStars, error: allStarsError } = await admin
      .from("feedback_stars")
      .select("feedback_id");
    
    if (allStarsError) throw allStarsError;

    const starCounts = allStars.reduce((acc, curr) => {
      acc[curr.feedback_id] = (acc[curr.feedback_id] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const starredSet = new Set(userStars.map(s => s.feedback_id));

    // Fetch comments
    const { data: comments, error: commentsError } = await admin
      .from("feedback_comments")
      .select("*")
      .order("created_at", { ascending: true });

    if (commentsError) throw commentsError;

    // Map everything together
    const result = feedbackData.map(f => ({
      id: f.id,
      content: f.content,
      status: f.status,
      createdAt: f.created_at,
      starsCount: starCounts[f.id] || 0,
      hasStarred: starredSet.has(f.id),
      isAuthor: f.user_id === user.id,
      comments: comments.filter(c => c.feedback_id === f.id).map(c => ({
        id: c.id,
        feedbackId: c.feedback_id,
        content: c.content,
        createdAt: c.created_at,
        isAdmin: c.is_admin
      }))
    }));

    return NextResponse.json(result);
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

    return NextResponse.json(data);
  } catch (error) {
    console.error("Failed to create feedback:", error);
    return NextResponse.json({ error: "Failed to create feedback" }, { status: 500 });
  }
}
