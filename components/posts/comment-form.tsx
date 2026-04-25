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
        setError("Ban can dang nhap de binh luan");
        return;
      }

      const { error } = await supabase.from("comments").insert({
        post_id: postId,
        author_id: user.id,
        content,
      });

      if (error) throw error;

      setContent("");
      router.refresh();
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Co loi xay ra";
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && (
        <div className="bg-red-50 text-red-500 p-3 rounded-md text-sm">
          {error}
        </div>
      )}

      <div>
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          required
          rows={3}
          className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
          placeholder="Viet binh luan cua ban..."
        />
      </div>

      <button
        type="submit"
        disabled={loading || !content.trim()}
        className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {loading ? "Dang gui..." : "Gui binh luan"}
      </button>
    </form>
  );
}
