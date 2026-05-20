import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { CommentForm } from "@/components/posts/comment-form";
import { CommentList } from "@/components/posts/comment-list";
import { PostReactions } from "@/components/posts/post-reactions";
import { ReadingProgress } from "@/components/ui/reading-progress";
import { ShareButton } from "@/components/ui/share-button";
import { SaveButton } from "@/components/ui/save-button";
import { ViewCounter } from "@/components/ui/view-counter";
import { PostStats } from "@/components/home/post-stats";

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
    title: post?.title ? `${post.title} | GenZ.Space` : "Bài viết | GenZ.Space",
    description: post?.excerpt || "",
  };
}

export default async function PostPage({ params }: PostPageProps) {
  const { slug } = await params;
  const supabase = await createClient();

  const { data: post, error } = await supabase
    .from("posts")
    .select(`*, profiles (display_name, avatar_url)`)
    .eq("slug", slug)
    .eq("status", "published")
    .single();

  if (error || !post) notFound();

  const { data: comments } = await supabase
    .from("comments")
    .select(`*, profiles (display_name, avatar_url)`)
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
    <>
      {/* Reading progress bar */}
      <ReadingProgress />
      {/* Silently increment view count */}
      <ViewCounter postId={post.id} />

      <main className="mx-auto max-w-4xl px-4 py-8 sm:py-10">
        <article className="overflow-hidden rounded-3xl border border-slate-200/80 bg-white/80 shadow-xl backdrop-blur animate-fade-in-up">
          <div className="px-4 pt-8 sm:px-10 sm:pt-10">
            <h1 className="mb-5 text-3xl font-extrabold tracking-tight text-slate-950 sm:text-5xl leading-tight">
              {post.title}
            </h1>

            {/* Meta row */}
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between sm:gap-4 mb-2">
              <div className="flex flex-wrap items-center gap-2 text-sm text-slate-500">
                <span className="rounded-full bg-violet-50 px-3 py-1 text-violet-700 font-medium">
                  ✍️ {postAuthorName}
                </span>
                <span>•</span>
                <time className="rounded-full bg-slate-100 px-3 py-1">
                  {post.published_at
                    ? new Date(post.published_at).toLocaleDateString("vi-VN", {
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                      })
                    : ""}
                </time>
                <span>•</span>
                <PostStats postId={post.id} showViews />
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <SaveButton postId={post.id} postSlug={post.slug} />
                <ShareButton url={`/posts/${post.slug}`} title={post.title} />
              </div>
            </div>
          </div>

          {/* Cover image */}
          {post.image_url && (
            <div className="w-full px-4 sm:px-10 mt-6">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={post.image_url}
                alt={post.title}
                className="w-full h-auto rounded-2xl shadow-md"
                style={{
                  maxHeight: "600px",
                  objectFit: "contain",
                  background: "#f8fafc",
                }}
              />
            </div>
          )}

          {/* Content */}
          <div className="px-4 py-8 sm:px-10">
            <div className="prose prose-slate max-w-none text-slate-800 leading-8">
              {post.content
                ?.split("\n")
                .map((paragraph: string, index: number) => (
                  <p key={index}>{paragraph}</p>
                ))}
            </div>

            {/* Reactions */}
            <div className="mt-8 pt-6 border-t border-slate-100">
              <PostReactions postId={post.id} />
            </div>
          </div>
        </article>

        {/* Comments */}
        <section className="mt-8 rounded-3xl border border-slate-200/80 bg-white/80 px-4 py-8 shadow-xl backdrop-blur animate-fade-in-up delay-200 sm:px-10">
          <h2 className="mb-6 text-2xl font-bold text-slate-950">
            💬 Bình luận ({comments?.length || 0})
          </h2>

          {commentsEnabled ? (
            user ? (
              <div className="mb-8">
                <CommentForm postId={post.id} />
              </div>
            ) : (
              <p className="mb-8 rounded-xl bg-violet-50 px-4 py-3 text-sm text-slate-600">
                <a
                  href="/login"
                  className="font-semibold text-violet-700 hover:underline"
                >
                  Đăng nhập
                </a>{" "}
                để tham gia bình luận.
              </p>
            )
          ) : (
            <div className="mb-8 rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
              Chủ bài viết đã tắt bình luận cho bài này.
            </div>
          )}

          <CommentList
            comments={(comments || []) as never}
            currentUserId={user?.id}
            postAuthorId={post.author_id}
            isAdmin={isAdmin}
            postId={post.id}
          />
        </section>
      </main>
    </>
  );
}
