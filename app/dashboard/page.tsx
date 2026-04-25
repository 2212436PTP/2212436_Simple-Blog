import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { PostList } from "@/components/dashboard/post-list";

export default async function DashboardPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data: posts, error } = await supabase
    .from("posts")
    .select("*")
    .eq("author_id", user.id)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Error fetching posts:", error);
  }

  return (
    <main className="max-w-4xl mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Bai viet cua toi</h1>
        <Link
          href="/dashboard/new"
          className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
        >
          + Viet bai moi
        </Link>
      </div>

      {posts && posts.length > 0 ? (
        <PostList posts={posts} />
      ) : (
        <div className="text-center py-12 bg-gray-50 rounded-lg">
          <p className="text-gray-500 mb-4">Ban chua co bai viet nao.</p>
          <Link
            href="/dashboard/new"
            className="text-blue-600 hover:text-blue-500"
          >
            Viet bai dau tien →
          </Link>
        </div>
      )}
    </main>
  );
}
