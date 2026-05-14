import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { PostForm } from "@/components/dashboard/post-form";

export default async function NewPostPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  return (
    <main className="max-w-4xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Viết bài mới</h1>
      <PostForm authorId={user.id} />
    </main>
  );
}
