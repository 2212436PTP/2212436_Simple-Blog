import type { Comment } from "@/types/database";

interface CommentListProps {
  comments: Comment[];
}

export function CommentList({ comments }: CommentListProps) {
  if (comments.length === 0) {
    return (
      <p className="text-gray-500 text-center py-8">
        Chua co binh luan nao. Hay la nguoi dau tien!
      </p>
    );
  }

  return (
    <div className="space-y-4">
      {comments.map((comment) => (
        <div key={comment.id} className="bg-gray-50 p-4 rounded-lg">
          <div className="flex items-center gap-2 mb-2">
            <span className="font-medium">
              {comment.profiles?.display_name || "An danh"}
            </span>
            <span className="text-gray-400 text-sm">
              {new Date(comment.created_at).toLocaleDateString("vi-VN")}
            </span>
          </div>
          <p className="text-gray-700">{comment.content}</p>
        </div>
      ))}
    </div>
  );
}
