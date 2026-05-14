"use client";

import { useRouter } from "next/navigation";
import type { Comment } from "@/types/database";

interface CommentListProps {
  comments: Comment[];
  currentUserId?: string | null;
  postAuthorId?: string;
  isAdmin?: boolean;
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

export function CommentList({
  comments,
  currentUserId,
  postAuthorId,
  isAdmin = false,
}: CommentListProps) {
  const router = useRouter();

  if (comments.length === 0) {
    return (
      <p className="py-8 text-center text-slate-500 dark:text-slate-400">
        Chưa có bình luận nào. Hãy là người đầu tiên!
      </p>
    );
  }

  const canDeleteComment = (comment: Comment) =>
    isAdmin ||
    comment.author_id === currentUserId ||
    postAuthorId === currentUserId;

  const handleDelete = async (commentId: string) => {
    const response = await fetch(`/api/comments/${commentId}`, {
      method: "DELETE",
    });

    if (!response.ok) {
      const payload = (await response.json().catch(() => null)) as {
        error?: string;
      } | null;
      throw new Error(payload?.error || "Không thể xóa bình luận");
    }

    router.refresh();
  };

  return (
    <div className="space-y-4">
      {comments.map((comment) => (
        <div
          key={comment.id}
          className="rounded-2xl border border-slate-200 bg-white/80 p-4 shadow-sm backdrop-blur dark:border-slate-700 dark:bg-slate-900/70"
        >
          {(() => {
            const parsed = parseCommentContent(comment.content);
            const name = parsed.anonymous
              ? "Ẩn danh"
              : comment.profiles?.display_name || "Ẩn danh";
            const avatar = parsed.anonymous
              ? null
              : comment.profiles?.avatar_url;

            return (
              <>
                <div className="mb-3 flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2">
                    <span
                      className={`flex h-9 w-9 items-center justify-center overflow-hidden rounded-full text-xs font-semibold ${
                        parsed.anonymous
                          ? "bg-slate-200 text-slate-700 dark:bg-slate-800 dark:text-slate-200"
                          : "bg-blue-50 text-blue-700 dark:bg-blue-500/15 dark:text-blue-200"
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
                      <div className="flex items-center gap-2">
                        <span
                          className={`rounded-full px-3 py-1 text-xs font-semibold ${
                            parsed.anonymous
                              ? "bg-slate-200 text-slate-700 dark:bg-slate-800 dark:text-slate-200"
                              : "bg-blue-50 text-blue-700 dark:bg-blue-500/15 dark:text-blue-200"
                          }`}
                        >
                          {name}
                        </span>
                        {parsed.anonymous && (
                          <span className="text-xs text-slate-400 dark:text-slate-500">
                            Ẩn danh
                          </span>
                        )}
                      </div>
                      <span className="text-sm text-slate-400 dark:text-slate-500">
                        {new Date(comment.created_at).toLocaleDateString(
                          "vi-VN",
                        )}
                      </span>
                    </div>
                  </div>
                  {canDeleteComment(comment) && (
                    <button
                      type="button"
                      onClick={async () => {
                        const confirmed = window.confirm(
                          "Bạn có chắc muốn xóa bình luận này?",
                        );
                        if (!confirmed) return;
                        try {
                          await handleDelete(comment.id);
                        } catch (err) {
                          alert(
                            err instanceof Error
                              ? err.message
                              : "Không thể xóa bình luận",
                          );
                        }
                      }}
                      className="text-sm font-medium text-red-600 hover:text-red-500"
                    >
                      Xóa
                    </button>
                  )}
                </div>
                <p className="whitespace-pre-wrap leading-7 text-slate-700 dark:text-slate-200">
                  {parsed.content}
                </p>
              </>
            );
          })()}
        </div>
      ))}
    </div>
  );
}
