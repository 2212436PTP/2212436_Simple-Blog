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
          className="overflow-hidden rounded-2xl border border-slate-200 bg-white/80 p-4 shadow-sm backdrop-blur"
        >
          <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <h2 className="text-xl font-semibold text-slate-900 ">
                  {post.title}
                </h2>
                <span
                  className={`px-2 py-1 text-xs rounded-full ${
                    post.status === "published"
                      ? "bg-emerald-100 text-emerald-800 /15 "
                      : "bg-amber-100 text-amber-800 /15 "
                  }`}
                >
                  {post.status === "published" ? "Đã xuất bản" : "Bản nháp"}
                </span>
              </div>

              {post.excerpt && (
                <p className="mb-2 text-sm text-slate-600 ">{post.excerpt}</p>
              )}

              <p className="text-xs text-slate-400 ">
                Tạo ngày:{" "}
                {new Date(post.created_at).toLocaleDateString("vi-VN")}
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2 sm:justify-end">
              <Link
                href={`/posts/${post.slug}`}
                className="w-full sm:w-auto px-3 py-1 text-sm text-slate-600 hover:text-slate-900 "
              >
                Xem
              </Link>
              <Link
                href={`/dashboard/edit/${post.id}`}
                className="w-full sm:w-auto px-3 py-1 text-sm text-blue-600 hover:text-blue-500 "
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
