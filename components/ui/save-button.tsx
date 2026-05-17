"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";

interface SaveButtonProps {
  postId: string;
  postSlug: string;
}

export function SaveButton({ postId, postSlug }: SaveButtonProps) {
  const [saved, setSaved] = useState(false);
  const [loading, setLoading] = useState(true);
  const [userId, setUserId] = useState<string | null>(null);
  const supabase = createClient();

  useEffect(() => {
    const load = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { setLoading(false); return; }
      setUserId(user.id);

      const { data } = await supabase
        .from("saved_posts")
        .select("id")
        .eq("user_id", user.id)
        .eq("post_id", postId)
        .maybeSingle();

      setSaved(!!data);
      setLoading(false);
    };
    void load();
  }, [postId, supabase]);

  const toggle = async () => {
    if (!userId) {
      window.location.href = "/login";
      return;
    }
    setLoading(true);
    if (saved) {
      await supabase
        .from("saved_posts")
        .delete()
        .eq("user_id", userId)
        .eq("post_id", postId);
      setSaved(false);
    } else {
      await supabase
        .from("saved_posts")
        .insert({ user_id: userId, post_id: postId });
      setSaved(true);
    }
    setLoading(false);
  };

  void postSlug; // used for future link to saved list

  return (
    <button
      onClick={toggle}
      disabled={loading}
      aria-label={saved ? "Bỏ lưu bài viết" : "Lưu bài viết"}
      title={saved ? "Bỏ lưu" : "Lưu bài viết để đọc sau"}
      className={`flex items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold transition-all hover:scale-105 disabled:opacity-60 ${
        saved
          ? "text-amber-600"
          : "text-slate-600 hover:text-amber-600"
      }`}
      style={{
        background: saved
          ? "linear-gradient(135deg, #fef3c7, #fde68a)"
          : "linear-gradient(135deg, #f8f7ff, #f3f0ff)",
        border: saved
          ? "1px solid rgba(245, 158, 11, 0.3)"
          : "1px solid rgba(124, 58, 237, 0.15)",
      }}
    >
      <svg
        className={`w-4 h-4 transition-all duration-300 ${saved ? "scale-110" : ""}`}
        fill={saved ? "currentColor" : "none"}
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z"
        />
      </svg>
      {saved ? "Đã lưu" : "Lưu lại"}
    </button>
  );
}
