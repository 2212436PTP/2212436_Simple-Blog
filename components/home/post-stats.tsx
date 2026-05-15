"use client";

import { useEffect, useState } from "react";

interface PostStatsProps {
 postId: string;
}

export function PostStats({ postId }: PostStatsProps) {
 const [commentCount, setCommentCount] = useState(0);
 const [reactionCount, setReactionCount] = useState(0);
 const [loading, setLoading] = useState(true);

 useEffect(() => {
 const fetchStats = async () => {
 try {
 // Fetch reactions
 const reactionsRes = await fetch(`/api/posts/${postId}/reactions`);
 if (reactionsRes.ok) {
 const reactionsData = (await reactionsRes
 .json()
 .catch(() => null)) as {
 counts?: Record<string, number>;
 } | null;
 if (reactionsData?.counts) {
 const total = Object.values(reactionsData.counts).reduce(
 (sum, count) => sum + count,
 0,
 );
 setReactionCount(total);
 }
 }

 // Fetch comment count
 const commentsRes = await fetch(`/api/posts/${postId}/comments-count`);
 if (commentsRes.ok) {
 const commentsData = (await commentsRes.json().catch(() => null)) as {
 count?: number;
 } | null;
 if (commentsData?.count !== undefined) {
 setCommentCount(commentsData.count);
 }
 }
 } catch (error) {
 console.error("Failed to fetch post stats:", error);
 } finally {
 setLoading(false);
 }
 };

 void fetchStats();
 }, [postId]);

 return (
 <div className="flex items-center gap-4 text-sm text-gray-600 ">
 {!loading && (
 <>
 <span className="flex items-center gap-1">
 💬 {commentCount} bình luận
 </span>
 {reactionCount > 0 && (
 <span className="flex items-center gap-1">
 ❤️ {reactionCount} cảm xúc
 </span>
 )}
 </>
 )}
 </div>
 );
}
