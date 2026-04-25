import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { CommentForm } from "@/components/posts/comment-form";
import { CommentList } from "@/components/posts/comment-list";

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
    title: post?.title || "Bai viet",
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

  return (
    <main className="max-w-3xl mx-auto px-4 py-8">
      <article>
        <header className="mb-8">
          <h1 className="text-4xl font-bold mb-4">{post.title}</h1>

          <div className="flex items-center gap-4 text-gray-500">
            <span>Boi {post.profiles?.display_name || "An danh"}</span>
            <span>•</span>
            <time>
              {post.published_at
                ? new Date(post.published_at).toLocaleDateString("vi-VN", {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })
                : ""}
            </time>
          </div>
        </header>

        <div className="prose prose-lg max-w-none mb-12">
          {post.content?.split("\n").map((paragraph: string, index: number) => (
            <p key={index}>{paragraph}</p>
          ))}
        </div>
      </article>

      <section className="border-t pt-8">
        <h2 className="text-2xl font-bold mb-6">
          Binh luan ({comments?.length || 0})
        </h2>

        {user ? (
          <div className="mb-8">
            <CommentForm postId={post.id} />
          </div>
        ) : (
          <p className="text-gray-500 mb-8">
            <a href="/login" className="text-blue-600 hover:text-blue-500">
              Dang nhap
            </a>{" "}
            de binh luan.
          </p>
        )}

        <CommentList comments={(comments || []) as never} />
      </section>
    </main>
  );
}
