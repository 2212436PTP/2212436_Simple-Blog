"use client";

import { useRouter } from "next/navigation";

type AdminUser = {
 id: string;
 email?: string | null;
 displayName: string;
 role: string;
};

type AdminPost = {
 id: string;
 title: string;
 status: string;
 created_at: string;
 authorName: string;
};

type AdminComment = {
 id: string;
 content: string;
 created_at: string;
 authorName: string;
 postTitle: string;
};

interface AdminPanelProps {
 users: AdminUser[];
 posts: AdminPost[];
 comments: AdminComment[];
}

export function AdminPanel({ users, posts, comments }: AdminPanelProps) {
 const router = useRouter();

 const updateRole = async (userId: string, role: "admin" | "user") => {
 const response = await fetch(`/api/admin/users/${userId}/role`, {
 method: "PATCH",
 headers: { "Content-Type": "application/json" },
 body: JSON.stringify({ role }),
 });

 if (!response.ok) {
 const payload = (await response.json().catch(() => null)) as {
 error?: string;
 } | null;
 throw new Error(payload?.error || "Không thể cập nhật role");
 }

 router.refresh();
 };

 const deleteUser = async (userId: string) => {
 const response = await fetch(`/api/admin/users/${userId}`, {
 method: "DELETE",
 });

 if (!response.ok) {
 const payload = (await response.json().catch(() => null)) as {
 error?: string;
 } | null;
 throw new Error(payload?.error || "Không thể xóa người dùng");
 }

 router.refresh();
 };

 const deletePost = async (postId: string) => {
 const response = await fetch(`/api/posts/${postId}`, { method: "DELETE" });
 if (!response.ok) {
 const payload = (await response.json().catch(() => null)) as {
 error?: string;
 } | null;
 throw new Error(payload?.error || "Không thể xóa bài viết");
 }

 router.refresh();
 };

 const deleteComment = async (commentId: string) => {
 const response = await fetch(`/api/comments/${commentId}`, {
 method: "DELETE",
 });
 if (!response.ok) {
 const payload = (await response.json().catch(() => null)) as {
 error?: string;
 } | null;
 throw new Error(payload?.error || "Không thể xóa bình luận");
 }

 router.refresh();
 };

 return (
 <div className="space-y-10">
 <section className="rounded-3xl border border-slate-200 bg-white/80 p-6 shadow-sm backdrop-blur /70">
 <h2 className="mb-4 text-xl font-bold text-slate-950 ">
 Người dùng
 </h2>
 <div className="space-y-3">
 {users.map((user) => (
 <div
 key={user.id}
 className="flex flex-col gap-3 rounded-2xl border border-slate-200 p-4 sm:flex-row sm:items-center sm:justify-between"
 >
 <div>
 <p className="font-semibold text-slate-950 ">
 {user.displayName}
 </p>
 <p className="text-sm text-slate-500 ">
 {user.email || "Không có email"}
 </p>
 </div>
 <div className="flex flex-wrap items-center gap-2">
 <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600 ">
 {user.role || "user"}
 </span>
 <button
 type="button"
 onClick={async () => {
 const nextRole = user.role === "admin" ? "user" : "admin";
 try {
 await updateRole(user.id, nextRole);
 } catch (err) {
 alert(
 err instanceof Error
 ? err.message
 : "Không thể cập nhật role",
 );
 }
 }}
 className="rounded-full border border-blue-200 px-3 py-1 text-xs font-semibold text-blue-600 hover:bg-blue-50 /30 /10"
 >
 {user.role === "admin" ? "Hạ quyền" : "Cấp quyền admin"}
 </button>
 <button
 type="button"
 onClick={async () => {
 const confirmed = window.confirm("Xóa người dùng này?");
 if (!confirmed) return;
 try {
 await deleteUser(user.id);
 } catch (err) {
 alert(
 err instanceof Error
 ? err.message
 : "Không thể xóa người dùng",
 );
 }
 }}
 className="rounded-full border border-red-200 px-3 py-1 text-xs font-semibold text-red-600 hover:bg-red-50 /30 /10"
 >
 Xóa
 </button>
 </div>
 </div>
 ))}
 </div>
 </section>

 <section className="rounded-3xl border border-slate-200 bg-white/80 p-6 shadow-sm backdrop-blur /70">
 <h2 className="mb-4 text-xl font-bold text-slate-950 ">
 Bài viết
 </h2>
 <div className="space-y-3">
 {posts.map((post) => (
 <div
 key={post.id}
 className="flex flex-col gap-3 rounded-2xl border border-slate-200 p-4 sm:flex-row sm:items-center sm:justify-between"
 >
 <div>
 <p className="font-semibold text-slate-950 ">
 {post.title}
 </p>
 <p className="text-sm text-slate-500 ">
 {post.authorName} · {post.status} ·{" "}
 {new Date(post.created_at).toLocaleDateString("vi-VN")}
 </p>
 </div>
 <button
 type="button"
 onClick={async () => {
 const confirmed = window.confirm("Xóa bài viết này?");
 if (!confirmed) return;
 try {
 await deletePost(post.id);
 } catch (err) {
 alert(
 err instanceof Error
 ? err.message
 : "Không thể xóa bài viết",
 );
 }
 }}
 className="rounded-full border border-red-200 px-3 py-1 text-xs font-semibold text-red-600 hover:bg-red-50 /30 /10"
 >
 Xóa bài viết
 </button>
 </div>
 ))}
 </div>
 </section>

 <section className="rounded-3xl border border-slate-200 bg-white/80 p-6 shadow-sm backdrop-blur /70">
 <h2 className="mb-4 text-xl font-bold text-slate-950 ">
 Bình luận
 </h2>
 <div className="space-y-3">
 {comments.map((comment) => (
 <div
 key={comment.id}
 className="flex flex-col gap-3 rounded-2xl border border-slate-200 p-4 sm:flex-row sm:items-center sm:justify-between"
 >
 <div>
 <p className="font-semibold text-slate-950 ">
 {comment.authorName}
 </p>
 <p className="text-sm text-slate-500 ">
 {comment.postTitle} ·{" "}
 {new Date(comment.created_at).toLocaleDateString("vi-VN")}
 </p>
 <p className="mt-2 text-sm text-slate-700 ">
 {comment.content}
 </p>
 </div>
 <button
 type="button"
 onClick={async () => {
 const confirmed = window.confirm("Xóa bình luận này?");
 if (!confirmed) return;
 try {
 await deleteComment(comment.id);
 } catch (err) {
 alert(
 err instanceof Error
 ? err.message
 : "Không thể xóa bình luận",
 );
 }
 }}
 className="rounded-full border border-red-200 px-3 py-1 text-xs font-semibold text-red-600 hover:bg-red-50 /30 /10"
 >
 Xóa bình luận
 </button>
 </div>
 ))}
 </div>
 </section>
 </div>
 );
}
