import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { createClient as createServerClient } from "@/lib/supabase/server";

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const supabase = await createServerClient();

  // Get current user
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Fetch the post to verify ownership
  const { data: post, error: selectError } = await supabase
    .from("posts")
    .select("id, author_id, title")
    .eq("id", id)
    .single();

  console.log("[DELETE /api/posts] Request details:", {
    userId: user.id,
    userEmail: user.email,
    postId: id,
    postFound: !!post,
    postAuthorId: post?.author_id,
    authorIdMatch: post?.author_id === user.id,
    isAdmin: user.user_metadata?.role === "admin",
    selectError: selectError?.message,
  });

  // Check permissions
  const isAdmin = user.user_metadata?.role === "admin";
  const canDelete = post && (post.author_id === user.id || isAdmin);

  if (!post) {
    return NextResponse.json({ error: "Post not found" }, { status: 404 });
  }

  if (!canDelete) {
    return NextResponse.json(
      {
        error: "You don't have permission to delete this post",
        debug: {
          postAuthorId: post.author_id,
          currentUserId: user.id,
          isAdmin,
          mismatch: post.author_id !== user.id,
        },
      },
      { status: 403 },
    );
  }

  // Delete the post using service role key for reliability
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  const adminClient =
    supabaseUrl && serviceRoleKey
      ? createClient(supabaseUrl, serviceRoleKey)
      : supabase;

  const { error: deleteError } = await adminClient
    .from("posts")
    .delete()
    .eq("id", id);

  if (deleteError) {
    console.error("[DELETE /api/posts] Delete failed:", {
      postId: id,
      error: deleteError.message,
    });
    return NextResponse.json(
      { error: `Failed to delete post: ${deleteError.message}` },
      { status: 400 },
    );
  }

  console.log("[DELETE /api/posts] Post deleted successfully:", {
    postId: id,
    postTitle: post.title,
    deletedBy: user.email,
  });

  return NextResponse.json({ ok: true }, { status: 200 });
}
