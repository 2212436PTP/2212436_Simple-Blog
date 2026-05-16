import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createClient as createAdminClient } from "@supabase/supabase-js";
import { createNotification } from "@/lib/notifications";

function getAdminClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) return null;
  return createAdminClient(url, key);
}

// GET /api/comments/[id]/reactions
export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id: commentId } = await params;
  const supabase = await createClient();
  const admin = getAdminClient() ?? supabase;

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { count } = await admin
    .from("comment_reactions")
    .select("*", { count: "exact", head: true })
    .eq("comment_id", commentId);

  let userReacted = false;
  if (user) {
    const { data } = await admin
      .from("comment_reactions")
      .select("id")
      .eq("comment_id", commentId)
      .eq("user_id", user.id)
      .maybeSingle();
    userReacted = Boolean(data);
  }

  return NextResponse.json({ count: count ?? 0, userReacted });
}

// POST /api/comments/[id]/reactions — toggle like + send notification
export async function POST(
  _req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id: commentId } = await params;
  const supabase = await createClient();
  const admin = getAdminClient() ?? supabase;

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Check if already reacted → toggle off
  const { data: existing } = await admin
    .from("comment_reactions")
    .select("id")
    .eq("comment_id", commentId)
    .eq("user_id", user.id)
    .maybeSingle();

  if (existing) {
    await admin.from("comment_reactions").delete().eq("id", existing.id);
    return NextResponse.json({ liked: false });
  }

  // Insert reaction
  await admin.from("comment_reactions").insert({
    comment_id: commentId,
    user_id: user.id,
    reaction: "like",
  });

  // Send notification to comment author (if not self-like)
  const { data: comment } = await admin
    .from("comments")
    .select("author_id, post_id, profiles(display_name)")
    .eq("id", commentId)
    .maybeSingle();

  if (comment && comment.author_id !== user.id) {
    const { data: liker } = await admin
      .from("profiles")
      .select("display_name")
      .eq("id", user.id)
      .maybeSingle();

    const likerName = liker?.display_name || user.email?.split("@")[0] || "Ai đó";

    await createNotification({
      userId: comment.author_id,
      actorId: user.id,
      type: "reaction",
      postId: comment.post_id,
      commentId,
      reaction: "like",
      message: `❤️ ${likerName} đã thích bình luận của bạn`,
    });
  }

  return NextResponse.json({ liked: true });
}
