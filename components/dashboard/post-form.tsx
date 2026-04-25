"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import type { Post, PostStatus } from "@/types/database";

interface PostFormProps {
  post?: Post;
}

function slugify(value: string) {
  return value
    .toLowerCase()
    .trim()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");
}

export function PostForm({ post }: PostFormProps) {
  const router = useRouter();
  const supabase = createClient();

  const isEditing = !!post;
  const [title, setTitle] = useState(post?.title || "");
  const [content, setContent] = useState(post?.content || "");
  const [excerpt, setExcerpt] = useState(post?.excerpt || "");
  const [status, setStatus] = useState<PostStatus>(post?.status || "draft");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        setError("Ban can dang nhap de thuc hien thao tac nay");
        return;
      }

      const postData = {
        title,
        slug: slugify(title),
        content,
        excerpt,
        status,
        author_id: user.id,
        published_at: status === "published" ? new Date().toISOString() : null,
      };

      if (isEditing) {
        const { error } = await supabase
          .from("posts")
          .update(postData)
          .eq("id", post.id);
        if (error) throw error;
      } else {
        const { error } = await supabase.from("posts").insert(postData);
        if (error) throw error;
      }

      router.push("/dashboard");
      router.refresh();
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : "Co loi xay ra. Vui long thu lai.";
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && (
        <div className="bg-red-50 text-red-500 p-3 rounded-md text-sm">
          {error}
        </div>
      )}

      <div>
        <label
          htmlFor="title"
          className="block text-sm font-medium text-gray-700"
        >
          Tieu de <span className="text-red-500">*</span>
        </label>
        <input
          id="title"
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
          className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
          placeholder="Nhap tieu de bai viet"
        />
      </div>

      <div>
        <label
          htmlFor="excerpt"
          className="block text-sm font-medium text-gray-700"
        >
          Tom tat
        </label>
        <input
          id="excerpt"
          type="text"
          value={excerpt}
          onChange={(e) => setExcerpt(e.target.value)}
          className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
          placeholder="Mo ta ngan ve bai viet"
        />
      </div>

      <div>
        <label
          htmlFor="content"
          className="block text-sm font-medium text-gray-700"
        >
          Noi dung
        </label>
        <textarea
          id="content"
          value={content}
          onChange={(e) => setContent(e.target.value)}
          rows={15}
          className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 font-mono"
          placeholder="Viet noi dung bai viet cua ban..."
        />
        <p className="mt-1 text-xs text-gray-500">Ho tro Markdown</p>
      </div>

      <div>
        <label
          htmlFor="status"
          className="block text-sm font-medium text-gray-700"
        >
          Trang thai
        </label>
        <select
          id="status"
          value={status}
          onChange={(e) => setStatus(e.target.value as PostStatus)}
          className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
        >
          <option value="draft">Ban nhap</option>
          <option value="published">Xuat ban</option>
        </select>
      </div>

      <div className="flex justify-end gap-4">
        <button
          type="button"
          onClick={() => router.back()}
          className="px-4 py-2 text-gray-700 hover:text-gray-900"
        >
          Huy
        </button>
        <button
          type="submit"
          disabled={loading}
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? "Dang luu..." : isEditing ? "Cap nhat" : "Tao bai viet"}
        </button>
      </div>
    </form>
  );
}
