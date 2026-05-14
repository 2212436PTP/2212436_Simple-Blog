"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

interface DeletePostButtonProps {
  postId: string;
  postTitle: string;
}

export function DeletePostButton({ postId, postTitle }: DeletePostButtonProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleDelete = async () => {
    const confirmed = window.confirm(
      `Bạn có chắc muốn xóa bài viết "${postTitle}"? Hành động này không thể hoàn tác.`,
    );

    if (!confirmed) return;

    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/posts/${postId}`, {
        method: "DELETE",
      });

      const payload = (await response.json().catch(() => null)) as {
        error?: string;
        debug?: unknown;
      } | null;

      console.log("[DeletePostButton] Response:", {
        status: response.status,
        ok: response.ok,
        payload,
      });

      if (!response.ok) {
        const errorMsg = payload?.error || "Có lỗi xảy ra khi xóa bài viết";
        setError(errorMsg);
        throw new Error(errorMsg);
      }

      // Success - refresh the page to show updated post list
      router.refresh();
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Có lỗi xảy ra khi xóa bài viết";
      console.error("[DeletePostButton] Error:", err);
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col gap-1">
      <button
        onClick={handleDelete}
        disabled={loading}
        className="text-red-600 hover:text-red-500 px-3 py-1 text-sm disabled:opacity-50"
      >
        {loading ? "Đang xóa..." : "Xóa"}
      </button>
      {error && <p className="text-xs text-red-500 px-3">{error}</p>}
    </div>
  );
}
