import Link from "next/link";
import type { Post } from "@/types/database";
import { DeletePostButton } from "./delete-post-button";

interface PostListProps {
  posts: Post[];
}

export function PostList({ posts }: PostListProps) {
  return (
    <div className="space-y-4">
      {posts.map((post) => (
        <div
          key={post.id}
          className="overflow-hidden rounded-2xl border border-slate-200 bg-white/80 p-4 shadow-sm backdrop-blur dark:border-slate-700 dark:bg-slate-900/70"
        >
          <div className="flex justify-between items-start">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <h2 className="text-xl font-semibold text-slate-900 dark:text-white">
                  {post.title}
                </h2>
                <span
                  className={`px-2 py-1 text-xs rounded-full ${
                    post.status === "published"
                      ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-500/15 dark:text-emerald-200"
                      : "bg-amber-100 text-amber-800 dark:bg-amber-500/15 dark:text-amber-200"
                  }`}
                >
                  {post.status === "published" ? "Đã xuất bản" : "Bản nháp"}
                </span>
              </div>

              {post.excerpt && (
                <p className="mb-2 text-sm text-slate-600 dark:text-slate-300">
                  {post.excerpt}
                </p>
              )}

              <p className="text-xs text-slate-400 dark:text-slate-500">
                Tạo ngày:{" "}
                {new Date(post.created_at).toLocaleDateString("vi-VN")}
              </p>
            </div>

            <div className="flex items-center gap-2">
              <Link
                href={`/posts/${post.slug}`}
                className="px-3 py-1 text-sm text-slate-600 hover:text-slate-900 dark:text-slate-300 dark:hover:text-white"
              >
                Xem
              </Link>
              <Link
                href={`/dashboard/edit/${post.id}`}
                className="px-3 py-1 text-sm text-blue-600 hover:text-blue-500 dark:text-blue-400"
              >
                Sửa
              </Link>
              <DeletePostButton postId={post.id} postTitle={post.title} />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
