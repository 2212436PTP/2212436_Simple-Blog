"use client";

import { useRouter } from "next/navigation";
import { useState, useEffect, useCallback } from "react";
import type { Comment } from "@/types/database";
import { spawnFloatingEmojis } from "@/lib/spawn-emojis";

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
        const p = (await res.json().catch(() => null)) as {
          error?: string;
        } | null;
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
        <p className="mb-2 rounded-lg bg-red-50 px-3 py-2 text-xs text-red-600">
          {err}
        </p>
      )}
      <div className="flex flex-col gap-2 sm:flex-row">
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          rows={2}
          placeholder="Viết trả lời..."
          className="flex-1 resize-none rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-800 outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-400/20"
        />
        <div className="flex flex-row gap-2 sm:flex-col sm:gap-1">
          <button
            type="button"
            onClick={submit}
            disabled={loading || !text.trim()}
            className="w-full sm:w-auto rounded-xl bg-blue-600 px-3 py-2 text-xs font-semibold text-white hover:bg-blue-700 disabled:opacity-50"
          >
            {loading ? "..." : "Gửi"}
          </button>
          <button
            type="button"
            onClick={onDone}
            className="w-full sm:w-auto rounded-xl border border-slate-200 px-3 py-2 text-xs font-semibold text-slate-500 hover:bg-slate-50"
          >
            Huỷ
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Like button + Flying Hearts ─────────────────────────────────────────────
function LikeButton({
  commentId,
  currentUserId,
}: {
  commentId: string;
  currentUserId?: string | null;
}) {
  const [count, setCount] = useState(0);
  const [liked, setLiked] = useState(false);
  const [loading, setLoading] = useState(false);

  const load = useCallback(async () => {
    const res = await fetch(`/api/comments/${commentId}/reactions`);
    if (!res.ok) return;
    const data = (await res.json()) as { count: number; userReacted: boolean };
    setCount(data.count);
    setLiked(data.userReacted);
  }, [commentId]);

  useEffect(() => {
    void load();
  }, [load]);

  const toggle = async () => {
    if (!currentUserId) return;
    setLoading(true);
    const wasLiked = liked;
    setLiked(!wasLiked);
    setCount((c) => (wasLiked ? c - 1 : c + 1));
    // 💖 Fullscreen hearts (escapes overflow:hidden via fixed position DOM elements)
    if (!wasLiked) spawnFloatingEmojis("❤️", 10);
    try {
      await fetch(`/api/comments/${commentId}/reactions`, { method: "POST" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      type="button"
      onClick={toggle}
      disabled={loading || !currentUserId}
      title={
        currentUserId ? (liked ? "Bỏ thích" : "Thích") : "Đăng nhập để thích"
      }
      className={`flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-semibold transition-all hover:scale-105 active:scale-95 ${
        liked
          ? "bg-rose-50 text-rose-600 ring-1 ring-rose-200 hover:bg-rose-100"
          : "text-slate-500 hover:bg-slate-100 hover:text-slate-700"
      } disabled:cursor-not-allowed`}
    >
      <span className={`text-sm ${liked ? "animate-pop-in" : ""}`}>
        {liked ? "❤️" : "🤍"}
      </span>
      {count > 0 && <span>{count}</span>}
    </button>
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
  const name = parsed.anonymous
    ? "Ẩn danh"
    : comment.profiles?.display_name || "Ẩn danh";
  const avatar = parsed.anonymous ? null : comment.profiles?.avatar_url;
  const canDelete =
    isAdmin ||
    comment.author_id === currentUserId ||
    postAuthorId === currentUserId;

  return (
    <div
      className={`animate-fade-in-up ${depth > 0 ? "ml-4 sm:ml-8 border-l-2 border-blue-100 pl-3 sm:pl-4" : ""}`}
    >
      <div className="rounded-2xl border border-slate-200 bg-white/80 p-4 shadow-sm backdrop-blur">
        {/* Header */}
        <div className="mb-3 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-2">
            <span
              className={`flex h-8 w-8 shrink-0 items-center justify-center overflow-hidden rounded-full text-xs font-semibold ${
                parsed.anonymous
                  ? "bg-slate-200 text-slate-700"
                  : "bg-blue-100 text-blue-700"
              }`}
            >
              {avatar ? (
                <img
                  src={avatar}
                  alt={name}
                  className="h-full w-full object-cover"
                />
              ) : (
                name[0]?.toUpperCase() || "U"
              )}
            </span>
            <div>
              <span
                className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                  parsed.anonymous
                    ? "bg-slate-200 text-slate-700"
                    : "bg-blue-50 text-blue-700"
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
              className="self-start text-xs font-medium text-red-500 hover:text-red-700 sm:self-auto"
            >
              Xóa
            </button>
          )}
        </div>

        {/* Content */}
        <p className="whitespace-pre-wrap text-sm leading-7 text-slate-700">
          {parsed.content}
        </p>

        {/* Actions */}
        <div className="mt-3 flex flex-wrap items-center gap-3 border-t border-slate-100 pt-3">
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
      const p = (await res.json().catch(() => null)) as {
        error?: string;
      } | null;
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
