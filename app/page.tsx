import Link from "next/link";
import { createClient } from "@/lib/supabase/server";

const PAGE_SIZE = 5;

type SearchParams = Promise<{ page?: string }>;

export default async function HomePage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const params = await searchParams;
  const supabase = await createClient();

  const currentPage = Math.max(1, Number(params.page) || 1);
  const from = (currentPage - 1) * PAGE_SIZE;
  const to = from + PAGE_SIZE - 1;

  const {
    data: posts,
    error,
    count,
  } = await supabase
    .from("posts")
    .select(
      `
      *,
      profiles (
        display_name,
        avatar_url
      )
    `,
      { count: "exact" },
    )
    .eq("status", "published")
    .order("published_at", { ascending: false })
    .range(from, to);

  const totalItems = count ?? 0;
  const totalPages = Math.max(1, Math.ceil(totalItems / PAGE_SIZE));
  const hasPreviousPage = currentPage > 1;
  const hasNextPage = currentPage < totalPages;

  if (error) {
    console.error("Error fetching posts:", error);
  }

  return (
    <main className="max-w-4xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Bai viet moi nhat</h1>

      {posts && posts.length > 0 ? (
        <div className="space-y-6">
          {posts.map((post) => (
            <article
              key={post.id}
              className="bg-white p-6 rounded-lg shadow border border-gray-200"
            >
              <Link href={`/posts/${post.slug}`}>
                <h2 className="text-2xl font-semibold hover:text-blue-600 transition-colors">
                  {post.title}
                </h2>
              </Link>

              {post.excerpt && (
                <p className="text-gray-600 mt-2">{post.excerpt}</p>
              )}

              <div className="flex items-center gap-4 mt-4 text-sm text-gray-500">
                <span>Boi {post.profiles?.display_name || "An danh"}</span>
                <span>•</span>
                <span>
                  {post.published_at
                    ? new Date(post.published_at).toLocaleDateString("vi-VN")
                    : "Chua xuat ban"}
                </span>
              </div>

              <Link
                href={`/posts/${post.slug}`}
                className="inline-block mt-4 text-blue-600 hover:text-blue-500"
              >
                Doc tiep →
              </Link>
            </article>
          ))}

          <div className="flex items-center justify-between pt-2">
            {hasPreviousPage ? (
              <Link
                href={`/?page=${currentPage - 1}`}
                className="px-4 py-2 rounded-md border border-gray-300 text-gray-700 hover:bg-gray-50"
              >
                ← Trang truoc
              </Link>
            ) : (
              <span className="px-4 py-2 rounded-md border border-gray-200 text-gray-300">
                ← Trang truoc
              </span>
            )}

            <p className="text-sm text-gray-500">
              Trang {currentPage} / {totalPages}
            </p>

            {hasNextPage ? (
              <Link
                href={`/?page=${currentPage + 1}`}
                className="px-4 py-2 rounded-md border border-gray-300 text-gray-700 hover:bg-gray-50"
              >
                Trang sau →
              </Link>
            ) : (
              <span className="px-4 py-2 rounded-md border border-gray-200 text-gray-300">
                Trang sau →
              </span>
            )}
          </div>
        </div>
      ) : (
        <div className="text-center py-12 bg-gray-50 rounded-lg">
          <p className="text-gray-500">Chua co bai viet nao.</p>
        </div>
      )}
    </main>
  );
}
