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
          className="bg-white p-4 rounded-lg shadow border border-gray-200"
        >
          <div className="flex justify-between items-start">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <h2 className="text-xl font-semibold">{post.title}</h2>
                <span
                  className={`px-2 py-1 text-xs rounded-full ${
                    post.status === "published"
                      ? "bg-green-100 text-green-800"
                      : "bg-yellow-100 text-yellow-800"
                  }`}
                >
                  {post.status === "published" ? "Da xuat ban" : "Ban nhap"}
                </span>
              </div>

              {post.excerpt && (
                <p className="text-gray-600 text-sm mb-2">{post.excerpt}</p>
              )}

              <p className="text-gray-400 text-xs">
                Tao ngay:{" "}
                {new Date(post.created_at).toLocaleDateString("vi-VN")}
              </p>
            </div>

            <div className="flex items-center gap-2">
              <Link
                href={`/posts/${post.slug}`}
                className="text-gray-500 hover:text-gray-700 px-3 py-1 text-sm"
              >
                Xem
              </Link>
              <Link
                href={`/dashboard/edit/${post.id}`}
                className="text-blue-600 hover:text-blue-500 px-3 py-1 text-sm"
              >
                Sua
              </Link>
              <DeletePostButton postId={post.id} postTitle={post.title} />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
