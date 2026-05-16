import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { createClient as createServerClient } from "@/lib/supabase/server";
import { createNotification } from "@/lib/notifications";

const ANONYMOUS_MARKER = "[[anonymous]]";

function getAdminClient() {
 const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
 const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

 if (!supabaseUrl || !serviceRoleKey) {
 return null;
 }

 return createClient(supabaseUrl, serviceRoleKey);
}

export async function POST(request: Request) {
 const supabase = await createServerClient();

 const {
 data: { user },
 } = await supabase.auth.getUser();

 if (!user) {
 return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
 }

  const body = (await request.json().catch(() => null)) as {
    postId?: string;
    content?: string;
    anonymous?: boolean;
    parentId?: string | null;
  } | null;

 if (!body?.postId || !body?.content?.trim()) {
 return NextResponse.json(
 { error: "Thiếu postId hoặc nội dung bình luận" },
 { status: 400 },
 );
 }

 const admin = getAdminClient() || supabase;

 const { data: post, error: postError } = await admin
 .from("posts")
 .select("id, author_id, comments_enabled, title")
 .eq("id", body.postId)
 .single();

 if (postError || !post) {
 return NextResponse.json({ error: "Post not found" }, { status: 404 });
 }

 if (post.comments_enabled === false) {
 return NextResponse.json(
 { error: "Bài viết này đang tắt bình luận" },
 { status: 403 },
 );
 }

 const content = body.anonymous
 ? `${ANONYMOUS_MARKER}\n${body.content.trim()}`
 : body.content.trim();

 const { data: comment, error } = await admin
 .from("comments")
 .insert({
 post_id: body.postId,
 author_id: user.id,
 content,
 ...(body.parentId ? { parent_id: body.parentId } : {}),
 })
 .select("*")
 .single();

 if (error) {
 return NextResponse.json({ error: error.message }, { status: 400 });
 }

 if (post.author_id !== user.id) {
 const { data: profile } = await admin
 .from("profiles")
 .select("display_name")
 .eq("id", user.id)
 .maybeSingle();

 await createNotification({
 userId: post.author_id,
 actorId: user.id,
 type: "comment",
 postId: post.id,
 commentId: comment.id,
 message: `${profile?.display_name || user.email?.split("@")[0] || "Ai đó"} đã bình luận bài viết của bạn: ${post.title}`,
 });
 }

 return NextResponse.json({ ok: true, comment }, { status: 200 });
}
