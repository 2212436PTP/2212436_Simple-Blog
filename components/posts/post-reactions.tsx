"use client";

import { useEffect, useMemo, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { spawnFloatingEmojis } from "@/lib/spawn-emojis";

type ReactionKey = "like" | "love" | "wow" | "haha" | "sad";

type ReactionState = {
  counts: Record<ReactionKey, number>;
  selected: ReactionKey | null;
};

const REACTIONS: Array<{
  key: ReactionKey;
  label: string;
  emoji: string;
  accent: string;
}> = [
  { key: "like",  label: "Thích",     emoji: "👍", accent: "from-blue-600 to-cyan-500" },
  { key: "love",  label: "Yêu thích", emoji: "❤️", accent: "from-rose-600 to-pink-500" },
  { key: "wow",   label: "Wow",       emoji: "🤩", accent: "from-amber-500 to-orange-500" },
  { key: "haha",  label: "Haha",      emoji: "😂", accent: "from-emerald-500 to-lime-500" },
  { key: "sad",   label: "Buồn",      emoji: "😢", accent: "from-slate-500 to-slate-600" },
];

function getEmptyState(): ReactionState {
  return { counts: { like: 0, love: 0, wow: 0, haha: 0, sad: 0 }, selected: null };
}

export function PostReactions({ postId }: { postId: string }) {
  const supabase = useMemo(() => createClient(), []);
  const [state, setState] = useState<ReactionState>(getEmptyState);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);

  const loadState = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    setIsAuthenticated(Boolean(user));

    const response = await fetch(`/api/posts/${postId}/reactions`);
    const payload = (await response.json().catch(() => null)) as {
      counts?: Record<ReactionKey, number>;
      selected?: ReactionKey | null;
    } | null;

    if (response.ok && payload?.counts) {
      setState({ counts: payload.counts, selected: payload.selected ?? null });
    }
    setLoading(false);
  };

  useEffect(() => { void loadState(); }, [postId, supabase]);

  const handleReact = async (reaction: ReactionKey) => {
    const r = REACTIONS.find((x) => x.key === reaction)!;
    const wasSelected = state.selected === reaction;

    // Optimistic update
    setState((prev) => {
      const newCounts = { ...prev.counts };
      if (prev.selected) newCounts[prev.selected] = Math.max(0, newCounts[prev.selected] - 1);
      if (!wasSelected) newCounts[reaction] += 1;
      return { counts: newCounts, selected: wasSelected ? null : reaction };
    });

    // 🌟 Fullscreen emoji burst (only when ADDING a reaction)
    if (!wasSelected) {
      spawnFloatingEmojis(r.emoji, 14);
    }

    const response = await fetch(`/api/posts/${postId}/reactions`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ reaction }),
    });

    if (!response.ok) await loadState(); // revert on error
  };

  const totalReactions = Object.values(state.counts).reduce((s, v) => s + v, 0);

  return (
    <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
      <div className="mb-4 flex items-center justify-between gap-3">
        <div>
          <h3 className="text-sm font-semibold text-slate-900">Cảm xúc bài viết</h3>
          <p className="text-xs text-slate-500">
            {totalReactions > 0 ? `${totalReactions} lượt phản ứng` : "Hãy chọn cảm xúc đầu tiên"}
          </p>
        </div>
        {state.selected && (
          <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-600 shadow-sm ring-1 ring-slate-200">
            Đã chọn: {REACTIONS.find((x) => x.key === state.selected)?.label}
          </span>
        )}
      </div>

      {!isAuthenticated ? (
        <p className="mb-4 rounded-2xl border border-dashed border-slate-300 bg-white px-4 py-3 text-sm text-slate-500">
          <a href="/login" className="font-semibold text-violet-600 hover:text-violet-500">Đăng nhập</a>{" "}
          để thả cảm xúc cho bài viết này.
        </p>
      ) : loading ? (
        <p className="mb-4 text-sm text-slate-500">Đang tải lượt phản ứng...</p>
      ) : null}

      <div className="grid grid-cols-2 gap-2 sm:grid-cols-5">
        {REACTIONS.map((reaction) => {
          const active = state.selected === reaction.key;
          const count = state.counts[reaction.key];

          return (
            <button
              key={reaction.key}
              type="button"
              onClick={() => void handleReact(reaction.key)}
              disabled={!isAuthenticated}
              className={`flex flex-col items-center justify-center gap-1 rounded-2xl border px-3 py-3 text-sm font-medium transition-all hover:scale-105 active:scale-95 disabled:cursor-not-allowed disabled:opacity-60 ${
                active
                  ? `border-transparent bg-gradient-to-r ${reaction.accent} text-white shadow-lg`
                  : "border-slate-200 bg-slate-50 text-slate-700 hover:border-violet-300 hover:bg-violet-50"
              }`}
              aria-pressed={active}
            >
              <span className={`text-2xl transition-transform ${active ? "scale-125 animate-pop-in" : ""}`}>
                {reaction.emoji}
              </span>
              <span>{reaction.label}</span>
              <span className="text-xs opacity-80">{count}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
