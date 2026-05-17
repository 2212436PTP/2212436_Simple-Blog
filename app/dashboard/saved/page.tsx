"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import Link from "next/link";

interface SavedPost {
  id: string;
  post_id: string;
  created_at: string;
  posts: {
    id: string;
    title: string;
    slug: string;
    excerpt: string | null;
    image_url: string | null;
    published_at: string | null;
  } | null;
}

export default function SavedPostsPage() {
  const [saved, setSaved] = useState<SavedPost[]>([]);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  useEffect(() => {
    const load = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { window.location.href = "/login"; return; }

      const { data } = await supabase
        .from("saved_posts")
        .select("*, posts(id, title, slug, excerpt, image_url, published_at)")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

      setSaved((data as SavedPost[]) || []);
      setLoading(false);
    };
    void load();
  }, [supabase]);

  const unsave = async (savedId: string) => {
    await supabase.from("saved_posts").delete().eq("id", savedId);
    setSaved((prev) => prev.filter((s) => s.id !== savedId));
  };

  return (
    <main className="max-w-3xl mx-auto px-4 py-10">
      <div className="flex items-center gap-3 mb-8">
        <span className="text-2xl">🔖</span>
        <h1 className="text-2xl font-bold">Bài viết đã lưu</h1>
      </div>

      {loading ? (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-24 rounded-2xl bg-slate-100 animate-pulse" />
          ))}
        </div>
      ) : saved.length === 0 ? (
        <div className="text-center py-20 rounded-3xl border-2 border-dashed border-slate-200">
          <p className="text-4xl mb-3">📭</p>
          <p className="text-slate-500 font-medium">Chưa có bài viết nào được lưu</p>
          <Link href="/" className="mt-4 inline-block text-violet-600 hover:underline text-sm font-semibold">
            Khám phá bài viết →
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {saved.map((item) => {
            const post = item.posts;
            if (!post) return null;
            return (
              <div
                key={item.id}
                className="group flex items-start gap-4 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm hover:shadow-md transition-all"
              >
                {post.image_url && (
                  <img
                    src={post.image_url}
                    alt={post.title}
                    className="h-20 w-28 shrink-0 rounded-xl object-cover"
                  />
                )}
                <div className="flex-1 min-w-0">
                  <Link href={`/posts/${post.slug}`} className="block">
                    <h2 className="font-semibold text-slate-900 group-hover:text-violet-700 transition-colors line-clamp-2">
                      {post.title}
                    </h2>
                    {post.excerpt && (
                      <p className="mt-1 text-sm text-slate-500 line-clamp-2">{post.excerpt}</p>
                    )}
                  </Link>
                  <div className="mt-2 flex items-center justify-between">
                    <span className="text-xs text-slate-400">
                      {post.published_at
                        ? new Date(post.published_at).toLocaleDateString("vi-VN")
                        : ""}
                    </span>
                    <button
                      onClick={() => void unsave(item.id)}
                      className="text-xs font-medium text-rose-500 hover:text-rose-700 transition-colors"
                    >
                      Bỏ lưu
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </main>
  );
}
