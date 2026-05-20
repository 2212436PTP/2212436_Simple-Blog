"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

interface CommentFormProps {
  postId: string;
}

export function CommentForm({ postId }: CommentFormProps) {
  const router = useRouter();
  const supabase = createClient();

  const [content, setContent] = useState("");
  const [anonymous, setAnonymous] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        setError("Bạn cần đăng nhập để bình luận");
        return;
      }

      const response = await fetch("/api/comments", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          postId,
          content: content.trim(),
          anonymous,
        }),
      });

      const payload = (await response.json().catch(() => null)) as {
        error?: string;
      } | null;

      if (!response.ok) {
        throw new Error(payload?.error || "Không thể gửi bình luận");
      }

      setContent("");
      setAnonymous(false);
      router.refresh();
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Có lỗi xảy ra";
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-4 rounded-2xl border border-slate-200 bg-white/80 p-4 shadow-sm backdrop-blur"
    >
      {error && (
        <div className="rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-600 /20 ">
          {error}
        </div>
      )}

      <div>
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          required
          rows={3}
          className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-slate-900 shadow-sm outline-none transition-colors focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 "
          placeholder="Viết bình luận của bạn..."
        />
      </div>

      <label className="flex items-center gap-3 text-sm text-slate-600 ">
        <input
          type="checkbox"
          checked={anonymous}
          onChange={(e) => setAnonymous(e.target.checked)}
          className="h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
        />
        Đăng ẩn danh
      </label>

      <p className="text-xs text-slate-500 ">
        Nếu không chọn, bình luận sẽ hiển thị tên của bạn từ hồ sơ.
      </p>

      <button
        type="submit"
        disabled={loading || !content.trim()}
        className="inline-flex w-full sm:w-auto items-center justify-center rounded-xl bg-linear-to-r from-blue-600 to-purple-600 px-4 py-2.5 font-semibold text-white shadow-md transition-all hover:shadow-lg disabled:cursor-not-allowed disabled:opacity-50"
      >
        {loading ? "Đang gửi..." : "Gửi bình luận"}
      </button>
    </form>
  );
}
