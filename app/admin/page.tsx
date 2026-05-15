import { notFound, redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { AdminPanel } from "@/components/admin/admin-panel";

function getRelationValue<T>(value: T | T[] | null | undefined): T | null {
 if (!value) {
 return null;
 }

 return Array.isArray(value) ? value[0] || null : value;
}

export default async function AdminPage() {
 const supabase = await createClient();

 const {
 data: { user },
 } = await supabase.auth.getUser();

 if (!user) {
 redirect("/login");
 }

 if (user.user_metadata?.role !== "admin") {
 notFound();
 }

 const admin = createAdminClient();
 if (!admin) {
 notFound();
 }

 const { data: usersResponse, error: usersError } =
 await admin.auth.admin.listUsers();

 const users = (usersResponse?.users || []).map((item) => ({
 id: item.id,
 email: item.email,
 displayName:
 item.user_metadata?.display_name ||
 item.email?.split("@")[0] ||
 "Người dùng",
 role: item.user_metadata?.role || "user",
 }));

 if (usersError) {
 console.warn("Failed to list users (admin):", usersError.message);
 }

 const { data: posts } = await admin
 .from("posts")
 .select(
 `
 id,
 title,
 status,
 created_at,
 profiles (
 display_name
 )
 `,
 )
 .order("created_at", { ascending: false });

 const { data: comments } = await admin
 .from("comments")
 .select(
 `
 id,
 content,
 created_at,
 profiles (
 display_name
 ),
 posts (
 title
 )
 `,
 )
 .order("created_at", { ascending: false });

 return (
 <main className="mx-auto max-w-6xl px-4 py-10">
 <h1 className="mb-6 text-3xl font-bold text-slate-950 ">
 Bảng quản trị
 </h1>
 <p className="mb-8 text-slate-600 ">
 Quản lý người dùng, bài viết và bình luận.
 </p>
 <AdminPanel
 users={users}
 posts={(posts || []).map((post) => {
 const profile = getRelationValue(
 post.profiles as
 | { display_name?: string | null }
 | { display_name?: string | null }[]
 | null,
 );

 return {
 id: post.id,
 title: post.title,
 status: post.status,
 created_at: post.created_at,
 authorName: profile?.display_name || "Ẩn danh",
 };
 })}
 comments={(comments || []).map((comment) => {
 const profile = getRelationValue(
 comment.profiles as
 | { display_name?: string | null }
 | { display_name?: string | null }[]
 | null,
 );
 const post = getRelationValue(
 comment.posts as
 | { title?: string | null }
 | { title?: string | null }[]
 | null,
 );

 return {
 id: comment.id,
 content: comment.content,
 created_at: comment.created_at,
 authorName: profile?.display_name || "Ẩn danh",
 postTitle: post?.title || "Bài viết",
 };
 })}
 />
 </main>
 );
}
