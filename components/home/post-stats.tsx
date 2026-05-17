"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";

interface PostStatsProps {
  postId: string;
  showViews?: boolean;
}

export function PostStats({ postId, showViews = false }: PostStatsProps) {
  const [commentCount, setCommentCount] = useState(0);
  const [reactionCount, setReactionCount] = useState(0);
  const [views, setViews] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const [reactionsRes, commentsRes] = await Promise.all([
          fetch(`/api/posts/${postId}/reactions`),
          fetch(`/api/posts/${postId}/comments-count`),
        ]);

        if (reactionsRes.ok) {
          const d = (await reactionsRes.json().catch(() => null)) as { counts?: Record<string, number> } | null;
          if (d?.counts) setReactionCount(Object.values(d.counts).reduce((s, c) => s + c, 0));
        }

        if (commentsRes.ok) {
          const d = (await commentsRes.json().catch(() => null)) as { count?: number } | null;
          if (d?.count !== undefined) setCommentCount(d.count);
        }

        if (showViews) {
          const supabase = createClient();
          const { data } = await supabase
            .from("posts")
            .select("views")
            .eq("id", postId)
            .single();
          if (data && "views" in data) setViews((data as { views: number }).views || 0);
        }
      } catch (e) {
        console.error("Failed to fetch post stats:", e);
      } finally {
        setLoading(false);
      }
    };

    void fetchStats();
  }, [postId, showViews]);

  return (
    <div className="flex items-center gap-3 text-xs font-medium text-slate-500">
      {!loading && (
        <>
          <span className="flex items-center gap-1">
            💬 {commentCount}
          </span>
          {reactionCount > 0 && (
            <span className="flex items-center gap-1">
              ❤️ {reactionCount}
            </span>
          )}
          {showViews && views !== null && (
            <span className="flex items-center gap-1">
              👁️ {views.toLocaleString("vi-VN")} lượt xem
            </span>
          )}
        </>
      )}
    </div>
  );
}
