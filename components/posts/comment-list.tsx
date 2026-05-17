"use client";

import { useRouter } from "next/navigation";
import { useState, useEffect, useCallback } from "react";
import type { Comment } from "@/types/database";

interface CommentListProps {
  comments: Comment[];
  currentUserId?: string | null;
  postAuthorId?: string;
  isAdmin?: boolean;
  postId: string;
}

const ANONYMOUS_MARKER = "[[anonymous]]";

function parseCommentContent(content: string) {
  if (content.startsWith(ANONYMOUS_MARKER)) {
    return {
      content: content.slice(ANONYMOUS_MARKER.length).trimStart(),
      anonymous: true,
    };
  }
  return { content, anonymous: false };
}

// ─── Inline reply form ────────────────────────────────────────────────────────
function ReplyForm({
  postId,
  parentId,
  onDone,
}: {
  postId: string;
  parentId: string;
  onDone: () => void;
}) {
  const router = useRouter();
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  const submit = async () => {
    if (!text.trim()) return;
    setLoading(true);
    setErr(null);
    try {
      const res = await fetch("/api/comments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ postId, content: text.trim(), parentId }),
      });
      if (!res.ok) {
        const p = (await res.json().catch(() => null)) as { error?: string } | null;
        throw new Error(p?.error || "Không thể gửi trả lời");
      }
      setText("");
      onDone();
      router.refresh();
    } catch (e) {
      setErr(e instanceof Error ? e.message : "Có lỗi xảy ra");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mt-3 animate-slide-down">
      {err && (
        <p className="mb-2 rounded-lg bg-red-50 px-3 py-2 text-xs text-red-600">{err}</p>
      )}
      <div className="flex gap-2">
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          rows={2}
          placeholder="Viết trả lời..."
          className="flex-1 resize-none rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-800 outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-400/20"
        />
        <div className="flex flex-col gap-1">
          <button
            type="button"
            onClick={submit}
            disabled={loading || !text.trim()}
            className="rounded-xl bg-blue-600 px-3 py-2 text-xs font-semibold text-white hover:bg-blue-700 disabled:opacity-50"
          >
            {loading ? "..." : "Gửi"}
          </button>
          <button
            type="button"
            onClick={onDone}
            className="rounded-xl border border-slate-200 px-3 py-2 text-xs font-semibold text-slate-500 hover:bg-slate-50"
          >
            Huỷ
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Like button + Flying Hearts ─────────────────────────────────────────────
interface FlyingHeart { id: number; x: number; }

function LikeButton({ commentId, currentUserId }: { commentId: string; currentUserId?: string | null }) {
  const [count, setCount] = useState(0);
  const [liked, setLiked] = useState(false);
  const [loading, setLoading] = useState(false);
  const [hearts, setHearts] = useState<FlyingHeart[]>([]);

  const load = useCallback(async () => {
    const res = await fetch(`/api/comments/${commentId}/reactions`);
    if (!res.ok) return;
    const data = (await res.json()) as { count: number; userReacted: boolean };
    setCount(data.count);
    setLiked(data.userReacted);
  }, [commentId]);

  useEffect(() => { void load(); }, [load]);

  const spawnHearts = () => {
    const batch: FlyingHeart[] = Array.from({ length: 5 }, (_, i) => ({
      id: Date.now() + i,
      x: Math.random() * 40 - 20, // -20 to +20px offset
    }));
    setHearts((h) => [...h, ...batch]);
    setTimeout(() => {
      setHearts((h) => h.filter((fh) => !batch.find((b) => b.id === fh.id)));
    }, 900);
  };

  const toggle = async () => {
    if (!currentUserId) return;
    setLoading(true);
    const wasLiked = liked;
    setLiked(!wasLiked);
    setCount((c) => (wasLiked ? c - 1 : c + 1));
    if (!wasLiked) spawnHearts();
    try {
      await fetch(`/api/comments/${commentId}/reactions`, { method: "POST" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative inline-flex">
      {/* Flying hearts */}
      {hearts.map((h) => (
        <span
          key={h.id}
          className="pointer-events-none absolute text-rose-500 select-none"
          style={{
            left: `calc(50% + ${h.x}px)`,
            bottom: "100%",
            fontSize: "14px",
            animation: "flyHeart 0.85s ease-out forwards",
          }}
        >
          ❤️
        </span>
      ))}
      <button
        type="button"
        onClick={toggle}
        disabled={loading || !currentUserId}
        title={currentUserId ? (liked ? "Bỏ thích" : "Thích") : "Đăng nhập để thích"}
        className={`flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-semibold transition-all ${
          liked
            ? "bg-rose-50 text-rose-600 ring-1 ring-rose-200 hover:bg-rose-100"
            : "text-slate-500 hover:bg-slate-100 hover:text-slate-700"
        } disabled:cursor-not-allowed`}
      >
        <span className={`text-sm ${liked ? "animate-pop-in" : ""}`}>{liked ? "❤️" : "🤍"}</span>
        {count > 0 && <span>{count}</span>}
      </button>
    </div>
  );
}


// ─── Single comment card ──────────────────────────────────────────────────────
function CommentCard({
  comment,
  depth,
  currentUserId,
  postAuthorId,
  isAdmin,
  postId,
  onDelete,
}: {
  comment: Comment;
  depth: number;
  currentUserId?: string | null;
  postAuthorId?: string;
  isAdmin?: boolean;
  postId: string;
  onDelete: (id: string) => void;
}) {
  const [showReply, setShowReply] = useState(false);
  const parsed = parseCommentContent(comment.content);
  const name = parsed.anonymous ? "Ẩn danh" : comment.profiles?.display_name || "Ẩn danh";
  const avatar = parsed.anonymous ? null : comment.profiles?.avatar_url;
  const canDelete = isAdmin || comment.author_id === currentUserId || postAuthorId === currentUserId;

  return (
    <div className={`animate-fade-in-up ${depth > 0 ? "ml-4 sm:ml-8 border-l-2 border-blue-100 pl-3 sm:pl-4" : ""}`}>
      <div className="rounded-2xl border border-slate-200 bg-white/80 p-4 shadow-sm backdrop-blur">
        {/* Header */}
        <div className="mb-3 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span
              className={`flex h-8 w-8 shrink-0 items-center justify-center overflow-hidden rounded-full text-xs font-semibold ${
                parsed.anonymous ? "bg-slate-200 text-slate-700" : "bg-blue-100 text-blue-700"
              }`}
            >
              {avatar ? (
                <img src={avatar} alt={name} className="h-full w-full object-cover" />
              ) : (
                name[0]?.toUpperCase() || "U"
              )}
            </span>
            <div>
              <span
                className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                  parsed.anonymous ? "bg-slate-200 text-slate-700" : "bg-blue-50 text-blue-700"
                }`}
              >
                {name}
              </span>
              <p className="mt-0.5 text-[11px] text-slate-400">
                {new Date(comment.created_at).toLocaleDateString("vi-VN", {
                  day: "numeric",
                  month: "numeric",
                  year: "numeric",
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </p>
            </div>
          </div>
          {canDelete && (
            <button
              type="button"
              onClick={() => {
                if (window.confirm("Bạn có chắc muốn xóa bình luận này?")) {
                  onDelete(comment.id);
                }
              }}
              className="text-xs font-medium text-red-500 hover:text-red-700"
            >
              Xóa
            </button>
          )}
        </div>

        {/* Content */}
        <p className="whitespace-pre-wrap text-sm leading-7 text-slate-700">{parsed.content}</p>

        {/* Actions */}
        <div className="mt-3 flex items-center gap-3 border-t border-slate-100 pt-3">
          <LikeButton commentId={comment.id} currentUserId={currentUserId} />
          {currentUserId && depth < 2 && (
            <button
              type="button"
              onClick={() => setShowReply((v) => !v)}
              className="text-xs font-semibold text-slate-500 hover:text-blue-600"
            >
              💬 Trả lời
            </button>
          )}
        </div>

        {/* Inline Reply Form */}
        {showReply && currentUserId && (
          <ReplyForm
            postId={postId}
            parentId={comment.id}
            onDone={() => setShowReply(false)}
          />
        )}
      </div>

      {/* Nested Replies */}
      {comment.replies && comment.replies.length > 0 && (
        <div className="mt-3 space-y-3">
          {comment.replies.map((reply) => (
            <CommentCard
              key={reply.id}
              comment={reply}
              depth={depth + 1}
              currentUserId={currentUserId}
              postAuthorId={postAuthorId}
              isAdmin={isAdmin}
              postId={postId}
              onDelete={onDelete}
            />
          ))}
        </div>
      )}
    </div>
  );
}

// ─── Main CommentList ─────────────────────────────────────────────────────────
export function CommentList({
  comments,
  currentUserId,
  postAuthorId,
  isAdmin = false,
  postId,
}: CommentListProps) {
  const router = useRouter();

  const handleDelete = async (commentId: string) => {
    const res = await fetch(`/api/comments/${commentId}`, { method: "DELETE" });
    if (!res.ok) {
      const p = (await res.json().catch(() => null)) as { error?: string } | null;
      alert(p?.error || "Không thể xóa bình luận");
      return;
    }
    router.refresh();
  };

  // Build tree: top-level comments + attach replies
  const topLevel = comments.filter((c) => !c.parent_id);
  const replies = comments.filter((c) => c.parent_id);

  const tree: Comment[] = topLevel.map((c) => ({
    ...c,
    replies: replies.filter((r) => r.parent_id === c.id),
  }));

  if (tree.length === 0) {
    return (
      <p className="py-8 text-center text-slate-500">
        Chưa có bình luận nào. Hãy là người đầu tiên!
      </p>
    );
  }

  return (
    <div className="space-y-4">
      {tree.map((comment) => (
        <CommentCard
          key={comment.id}
          comment={comment}
          depth={0}
          currentUserId={currentUserId}
          postAuthorId={postAuthorId}
          isAdmin={isAdmin}
          postId={postId}
          onDelete={handleDelete}
        />
      ))}
    </div>
  );
}
