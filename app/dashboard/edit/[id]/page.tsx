import { createClient } from "@/lib/supabase/server";
import { notFound, redirect } from "next/navigation";
import { PostForm } from "@/components/dashboard/post-form";
import type { Post } from "@/types/database";

interface EditPostPageProps {
 params: Promise<{ id: string }>;
}

export default async function EditPostPage({ params }: EditPostPageProps) {
 const { id } = await params;
 const supabase = await createClient();

 const {
 data: { user },
 } = await supabase.auth.getUser();

 if (!user) {
 redirect("/login");
 }

 const { data: post, error } = await supabase
 .from("posts")
 .select("*")
 .eq("id", id)
 .eq("author_id", user.id)
 .single();

 if (error || !post) {
 notFound();
 }

 return (
 <main className="max-w-4xl mx-auto px-4 py-8">
 <h1 className="text-3xl font-bold mb-8">Chỉnh sửa bài viết</h1>
 <PostForm post={post as Post} authorId={user.id} />
 </main>
 );
}
