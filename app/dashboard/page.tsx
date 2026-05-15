"use client";

import Link from "next/link";
import { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { PostList } from "@/components/dashboard/post-list";
import type { Post } from "@/types/database";

function DashboardContent() {
 const supabase = createClient();
 const searchParams = useSearchParams();
 const [posts, setPosts] = useState<Post[]>([]);
 const [filteredPosts, setFilteredPosts] = useState<Post[]>([]);
 const [loading, setLoading] = useState(true);
 const [searchQuery, setSearchQuery] = useState(
 searchParams.get("search") || "",
 );
 const [user, setUser] = useState<{ id: string } | null>(null);

 useEffect(() => {
 const fetchUserAndPosts = async () => {
 try {
 const {
 data: { user },
 } = await supabase.auth.getUser();

 if (!user) {
 window.location.href = "/login";
 return;
 }

 setUser(user);

 const { data, error } = await supabase
 .from("posts")
 .select("*")
 .eq("author_id", user.id)
 .order("created_at", { ascending: false });

 if (error) {
 console.error("Error fetching posts:", error);
 } else {
 setPosts(data || []);
 }
 } finally {
 setLoading(false);
 }
 };

 fetchUserAndPosts();
 }, [supabase]);

 useEffect(() => {
 const query = searchQuery.toLowerCase();
 const filtered = posts.filter(
 (post) =>
 query === "" ||
 post.title.toLowerCase().includes(query) ||
 post.excerpt?.toLowerCase().includes(query) ||
 post.content?.toLowerCase().includes(query),
 );
 setFilteredPosts(filtered);
 }, [posts, searchQuery]);

 if (loading) {
 return (
 <main className="max-w-4xl mx-auto px-4 py-8">
 <div className="text-center text-gray-500">Đang tải...</div>
 </main>
 );
 }

 return (
 <main className="max-w-4xl mx-auto px-4 py-8">
 <div className="flex justify-between items-center mb-8">
 <h1 className="text-3xl font-bold">Bài viết của tôi</h1>
 <Link
 href="/dashboard/new"
 className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
 >
 + Viết bài mới
 </Link>
 </div>

 {posts.length > 0 && (
 <div className="mb-6 flex gap-2">
 <input
 type="text"
 placeholder="Tìm kiếm bài viết..."
 value={searchQuery}
 onChange={(e) => setSearchQuery(e.target.value)}
 className="flex-1 px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
 />
 </div>
 )}

 {filteredPosts.length > 0 ? (
 <PostList posts={filteredPosts} />
 ) : posts.length > 0 ? (
 <div className="text-center py-12 bg-gray-50 rounded-lg">
 <p className="text-gray-500 mb-4">
 Không tìm thấy bài viết nào phù hợp.
 </p>
 </div>
 ) : (
 <div className="text-center py-12 bg-gray-50 rounded-lg">
 <p className="text-gray-500 mb-4">Bạn chưa có bài viết nào.</p>
 <Link
 href="/dashboard/new"
 className="text-blue-600 hover:text-blue-500"
 >
 Viết bài đầu tiên →
 </Link>
 </div>
 )}
 </main>
 );
}

export default function DashboardPage() {
 return (
 <Suspense
 fallback={
 <main className="max-w-4xl mx-auto px-4 py-8">
 <div className="text-center text-gray-500">Đang tải...</div>
 </main>
 }
 >
 <DashboardContent />
 </Suspense>
 );
}
