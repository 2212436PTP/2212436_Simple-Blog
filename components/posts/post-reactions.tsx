"use client";

import { useEffect, useMemo, useState } from "react";
import { createClient } from "@/lib/supabase/client";

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
 {
 key: "like",
 label: "Thích",
 emoji: "👍",
 accent: "from-blue-600 to-cyan-500",
 },
 {
 key: "love",
 label: "Yêu thích",
 emoji: "❤️",
 accent: "from-rose-600 to-pink-500",
 },
 {
 key: "wow",
 label: "Wow",
 emoji: "😮",
 accent: "from-amber-500 to-orange-500",
 },
 {
 key: "haha",
 label: "Haha",
 emoji: "😂",
 accent: "from-emerald-500 to-lime-500",
 },
 {
 key: "sad",
 label: "Buồn",
 emoji: "😢",
 accent: "from-slate-500 to-slate-600",
 },
];

function getEmptyState(): ReactionState {
 return {
 counts: { like: 0, love: 0, wow: 0, haha: 0, sad: 0 },
 selected: null,
 };
}

export function PostReactions({ postId }: { postId: string }) {
 const supabase = useMemo(() => createClient(), []);
 const [state, setState] = useState<ReactionState>(getEmptyState);
 const [isAuthenticated, setIsAuthenticated] = useState(false);
 const [loading, setLoading] = useState(true);

 const loadState = async () => {
 const {
 data: { user },
 } = await supabase.auth.getUser();

 setIsAuthenticated(Boolean(user));

 const response = await fetch(`/api/posts/${postId}/reactions`);
 const payload = (await response.json().catch(() => null)) as {
 counts?: Record<ReactionKey, number>;
 selected?: ReactionKey | null;
 } | null;

 if (response.ok && payload?.counts) {
 setState({
 counts: payload.counts,
 selected: payload.selected ?? null,
 });
 }

 setLoading(false);
 };

 useEffect(() => {
 void loadState();
 }, [postId, supabase]);

 const handleReact = async (reaction: ReactionKey) => {
 const response = await fetch(`/api/posts/${postId}/reactions`, {
 method: "POST",
 headers: {
 "Content-Type": "application/json",
 },
 body: JSON.stringify({ reaction }),
 });

 if (!response.ok) {
 return;
 }

 await loadState();
 };

 const totalReactions = Object.values(state.counts).reduce(
 (sum, value) => sum + value,
 0,
 );

 return (
 <div className="rounded-2xl border border-slate-200 bg-slate-50/80 p-4 /60">
 <div className="mb-4 flex items-center justify-between gap-3">
 <div>
 <h3 className="text-sm font-semibold text-slate-900 ">
 Cảm xúc bài viết
 </h3>
 <p className="text-xs text-slate-500 ">
 {totalReactions > 0
 ? `${totalReactions} lượt phản ứng`
 : "Hãy chọn cảm xúc đầu tiên"}
 </p>
 </div>
 {state.selected && (
 <span className="rounded-full bg-white px-3 py-1 text-xs font-medium text-slate-600 shadow-sm ring-1 ring-slate-200 ">
 Đã chọn:{" "}
 {REACTIONS.find((item) => item.key === state.selected)?.label}
 </span>
 )}
 </div>

 {!isAuthenticated ? (
 <p className="mb-4 rounded-2xl border border-dashed border-slate-300 bg-white px-4 py-3 text-sm text-slate-500 ">
 <a
 href="/login"
 className="font-semibold text-blue-600 hover:text-blue-500 "
 >
 Đăng nhập
 </a>{" "}
 để thả cảm xúc cho bài viết này.
 </p>
 ) : loading ? (
 <p className="mb-4 text-sm text-slate-500 ">
 Đang tải lượt phản ứng...
 </p>
 ) : null}

 <div className="grid grid-cols-2 gap-2 sm:grid-cols-5">
 {REACTIONS.map((reaction) => {
 const active = state.selected === reaction.key;
 const count = state.counts[reaction.key];

 return (
 <button
 key={reaction.key}
 type="button"
 onClick={() => handleReact(reaction.key)}
 disabled={!isAuthenticated}
 className={`flex flex-col items-center justify-center gap-1 rounded-2xl border px-3 py-3 text-sm font-medium transition-all disabled:cursor-not-allowed disabled:opacity-60 ${
 active
 ? `border-transparent bg-linear-to-r ${reaction.accent} text-white shadow-lg`
 : "border-slate-200 bg-white text-slate-700 hover:border-blue-300 hover:bg-blue-50 /40 "
 }`}
 aria-pressed={active}
 >
 <span className="text-xl">{reaction.emoji}</span>
 <span>{reaction.label}</span>
 <span className="text-xs opacity-80">{count}</span>
 </button>
 );
 })}
 </div>
 </div>
 );
}
