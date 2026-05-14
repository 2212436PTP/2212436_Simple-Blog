import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { createClient as createServerClient } from "@/lib/supabase/server";

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const supabase = await createServerClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { data: comment, error: commentError } = await supabase
    .from("comments")
    .select("author_id, post_id")
    .eq("id", id)
    .single();

  if (commentError || !comment) {
    return NextResponse.json({ error: "Comment not found" }, { status: 404 });
  }

  const { data: post } = await supabase
    .from("posts")
    .select("author_id")
    .eq("id", comment.post_id)
    .single();

  const isAdmin = user.user_metadata?.role === "admin";
  const isCommentAuthor = comment.author_id === user.id;
  const isPostAuthor = post?.author_id === user.id;
  const canDelete = isCommentAuthor || isPostAuthor || isAdmin;

  console.log("[DELETE /api/comments] Request details:", {
    userId: user.id,
    commentId: id,
    commentAuthorId: comment.author_id,
    postAuthorId: post?.author_id,
    isCommentAuthor,
    isPostAuthor,
    isAdmin,
    canDelete,
  });

  if (!canDelete) {
    return NextResponse.json(
      {
        error: "You don't have permission to delete this comment",
        debug: {
          isCommentAuthor,
          isPostAuthor,
          isAdmin,
        },
      },
      { status: 403 },
    );
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  const adminClient =
    supabaseUrl && serviceRoleKey
      ? createClient(supabaseUrl, serviceRoleKey)
      : supabase;

  const { error } = await adminClient.from("comments").delete().eq("id", id);

  if (error) {
    console.error("[DELETE /api/comments] Delete failed:", {
      commentId: id,
      error: error.message,
    });
    return NextResponse.json(
      { error: `Failed to delete comment: ${error.message}` },
      { status: 400 },
    );
  }

  console.log("[DELETE /api/comments] Comment deleted successfully:", {
    commentId: id,
    deletedBy: user.email,
  });

  return NextResponse.json({ ok: true }, { status: 200 });
}
