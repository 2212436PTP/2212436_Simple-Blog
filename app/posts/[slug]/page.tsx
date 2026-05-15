import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { CommentForm } from "@/components/posts/comment-form";
import { CommentList } from "@/components/posts/comment-list";
import { PostReactions } from "@/components/posts/post-reactions";

interface PostPageProps {
 params: Promise<{ slug: string }>;
}

export async function generateMetadata({
 params,
}: PostPageProps): Promise<Metadata> {
 const { slug } = await params;
 const supabase = await createClient();

 const { data: post } = await supabase
 .from("posts")
 .select("title, excerpt")
 .eq("slug", slug)
 .eq("status", "published")
 .single();

 return {
 title: post?.title || "Bài viết",
 description: post?.excerpt || "",
 };
}

export default async function PostPage({ params }: PostPageProps) {
 const { slug } = await params;
 const supabase = await createClient();

 const { data: post, error } = await supabase
 .from("posts")
 .select(
 `
 *,
 profiles (
 display_name,
 avatar_url
 )
 `,
 )
 .eq("slug", slug)
 .eq("status", "published")
 .single();

 if (error || !post) {
 notFound();
 }

 const { data: comments } = await supabase
 .from("comments")
 .select(
 `
 *,
 profiles (
 display_name,
 avatar_url
 )
 `,
 )
 .eq("post_id", post.id)
 .order("created_at", { ascending: true });

 const {
 data: { user },
 } = await supabase.auth.getUser();
 const isAdmin = user?.user_metadata?.role === "admin";
 const commentsEnabled = post.comments_enabled !== false;
 const postAuthorName = post.is_anonymous
 ? "Ẩn danh"
 : post.profiles?.display_name || "Ẩn danh";

 return (
 <main className="mx-auto max-w-4xl px-4 py-10">
 <article className="overflow-hidden rounded-3xl border border-slate-200/80 bg-white/80 shadow-xl backdrop-blur /80 /70">
 <div className="px-8 pt-8 sm:px-10 sm:pt-10">
 <h1 className="mb-4 text-4xl font-bold tracking-tight text-slate-950 sm:text-5xl">
 {post.title}
 </h1>

 <div className="flex flex-wrap items-center gap-3 text-sm text-slate-500 ">
 <span className="rounded-full bg-slate-100 px-3 py-1 ">
 Bởi {postAuthorName}
 </span>
 <span>•</span>
 <time className="rounded-full bg-slate-100 px-3 py-1 ">
 {post.published_at
 ? new Date(post.published_at).toLocaleDateString("vi-VN", {
 year: "numeric",
 month: "long",
 day: "numeric",
 })
 : ""}
 </time>
 </div>
 </div>

 {post.image_url && (
 <div className="w-full h-auto px-8 sm:px-10">
 {/* eslint-disable-next-line @next/next/no-img-element */}
 <img 
 src={post.image_url} 
 alt={post.title} 
 className="w-full h-auto max-h-[500px] object-cover rounded-xl shadow-md"
 />
 </div>
 )}

 <div className="px-8 py-8 sm:px-10">
 <div className="prose prose-slate max-w-none ">
 {post.content
 ?.split("\n")
 .map((paragraph: string, index: number) => (
 <p key={index}>{paragraph}</p>
 ))}
 </div>

 <div className="mt-8">
 <PostReactions postId={post.id} />
 </div>
 </div>
 </article>

 <section className="mt-8 rounded-3xl border border-slate-200/80 bg-white/80 px-8 py-8 shadow-xl backdrop-blur /80 /70 sm:px-10">
 <h2 className="mb-6 text-2xl font-bold text-slate-950 ">
 Bình luận ({comments?.length || 0})
 </h2>

 {commentsEnabled ? (
 user ? (
 <div className="mb-8">
 <CommentForm postId={post.id} />
 </div>
 ) : (
 <p className="mb-8 text-slate-500 ">
 <a href="/login" className="text-blue-600 hover:text-blue-500">
 Đăng nhập
 </a>{" "}
 để bình luận.
 </p>
 )
 ) : (
 <div className="mb-8 rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800 /30 ">
 Chủ bài viết đã tắt bình luận cho bài này.
 </div>
 )}

 <CommentList
 comments={(comments || []) as never}
 currentUserId={user?.id}
 postAuthorId={post.author_id}
 isAdmin={isAdmin}
 />
 </section>
 </main>
 );
}
