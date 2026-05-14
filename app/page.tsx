import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { PostStats } from "@/components/home/post-stats";
const PAGE_SIZE = 5;

type SearchParams = Promise<{ page?: string; q?: string }>;

export default async function HomePage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const params = await searchParams;
  const supabase = await createClient();

  const currentPage = Math.max(1, Number(params.page) || 1);
  const query = (params.q || "").trim();
  const from = (currentPage - 1) * PAGE_SIZE;
  const to = from + PAGE_SIZE - 1;

  let queryBuilder = supabase
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
    .eq("status", "published");

  if (query) {
    const escapedQuery = query.replace(/[%_]/g, "\\$&");
    queryBuilder = queryBuilder.or(
      `title.ilike.%${escapedQuery}%,excerpt.ilike.%${escapedQuery}%,content.ilike.%${escapedQuery}%`,
    );
  }

  const {
    data: posts,
    error,
    count,
  } = await queryBuilder
    .order("published_at", { ascending: false })
    .range(from, to);

  const totalItems = count ?? 0;
  const totalPages = Math.max(1, Math.ceil(totalItems / PAGE_SIZE));
  const hasPreviousPage = currentPage > 1;
  const hasNextPage = currentPage < totalPages;
  const buildPageUrl = (page: number) => {
    const searchParams = new URLSearchParams();
    if (page > 1) searchParams.set("page", String(page));
    if (query) searchParams.set("q", query);
    const search = searchParams.toString();
    return search ? `/?${search}` : "/";
  };

  if (error) {
    console.error("Error fetching posts:", error);
  }

  return (
    <main className="min-h-screen bg-linear-to-b from-white to-gray-50 dark:from-slate-900 dark:to-slate-950">
      {/* Hero Section */}
      <section className="max-w-5xl mx-auto px-4 py-16 sm:py-24">
        <div className="text-center mb-16">
          <h1 className="text-5xl sm:text-6xl font-bold bg-linear-to-r from-blue-600 via-purple-600 to-pink-600 dark:from-blue-400 dark:via-purple-400 dark:to-pink-400 bg-clip-text text-transparent mb-4">
            Bài viết mới nhất
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
            Khám phá những bài viết thú vị, chia sẻ kiến thức và trải nghiệm cá
            nhân
          </p>
        </div>

        <form className="max-w-2xl mx-auto mb-12" action="/" method="get">
          <div className="flex flex-col sm:flex-row gap-3 rounded-3xl border border-white/60 bg-white/80 p-3 shadow-lg backdrop-blur-xl dark:border-slate-700/60 dark:bg-slate-900/70">
            <input
              type="search"
              name="q"
              defaultValue={query}
              placeholder="Tìm kiếm bài viết theo tiêu đề, mô tả hoặc nội dung..."
              className="flex-1 rounded-2xl border border-slate-200 bg-white px-4 py-3 text-gray-900 outline-none transition-colors focus:border-blue-500 dark:border-slate-700 dark:bg-slate-950 dark:text-white dark:placeholder:text-slate-500"
            />
            <button
              type="submit"
              className="rounded-2xl bg-linear-to-r from-blue-600 to-purple-600 px-6 py-3 font-semibold text-white shadow-md transition-all hover:shadow-lg"
            >
              Tìm kiếm
            </button>
          </div>
          {query && (
            <div className="mt-4 flex items-center justify-between gap-3 text-sm text-gray-600 dark:text-gray-400">
              <p>
                Kết quả cho:{" "}
                <span className="font-semibold text-gray-900 dark:text-white">
                  {query}
                </span>
              </p>
              <Link
                href="/"
                className="font-semibold text-blue-600 dark:text-blue-400 hover:underline"
              >
                Xóa bộ lọc
              </Link>
            </div>
          )}
        </form>

        {/* Posts Grid */}
        {posts && posts.length > 0 ? (
          <>
            <div className="space-y-6 mb-12">
              {posts.map((post) => (
                <article
                  key={post.id}
                  className="group bg-white dark:bg-slate-800 rounded-2xl shadow-md hover:shadow-2xl border border-gray-200 dark:border-slate-700 transition-all duration-300 hover:-translate-y-1 overflow-hidden"
                >
                  <div className="p-8">
                    <div className="flex items-start justify-between gap-4 mb-4">
                      <div className="flex-1">
                        <Link href={`/posts/${post.slug}`}>
                          <h2 className="text-3xl font-bold text-gray-900 dark:text-white group-hover:bg-linear-to-r group-hover:from-blue-600 group-hover:to-purple-600 group-hover:bg-clip-text group-hover:text-transparent transition-all duration-300 mb-2">
                            {post.title}
                          </h2>
                        </Link>
                      </div>
                    </div>

                    {post.excerpt && (
                      <p className="text-base text-gray-600 dark:text-gray-300 mb-4 line-clamp-2">
                        {post.excerpt}
                      </p>
                    )}

                    <div className="flex flex-col sm:flex-row sm:items-center gap-4 pt-4 border-t border-gray-200 dark:border-slate-700">
                      <div className="flex items-center gap-3">
                        {(() => {
                          const authorName = post.is_anonymous
                            ? "Ẩn danh"
                            : post.profiles?.display_name || "Ẩn danh";

                          return (
                            <>
                              <div className="w-10 h-10 rounded-full bg-linear-to-r from-blue-600 to-purple-600 flex items-center justify-center">
                                <span className="text-white text-sm font-bold">
                                  {authorName[0].toUpperCase()}
                                </span>
                              </div>
                              <div>
                                <p className="font-semibold text-gray-900 dark:text-white">
                                  {authorName}
                                </p>
                                <p className="text-sm text-gray-500 dark:text-gray-400">
                                  {post.published_at
                                    ? new Date(
                                        post.published_at,
                                      ).toLocaleDateString("vi-VN", {
                                        year: "numeric",
                                        month: "long",
                                        day: "numeric",
                                      })
                                    : "Chưa xuất bản"}
                                </p>
                              </div>
                            </>
                          );
                        })()}
                      </div>
                      <PostStats postId={post.id} />
                      <Link
                        href={`/posts/${post.slug}`}
                        className="sm:ml-auto inline-flex items-center gap-2 text-blue-600 dark:text-blue-400 font-semibold group-hover:gap-3 transition-all duration-300"
                      >
                        Đọc tiếp
                        <span className="transition-transform">→</span>
                      </Link>
                    </div>
                  </div>
                </article>
              ))}
            </div>

            {/* Pagination */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-8">
              {hasPreviousPage ? (
                <Link
                  href={buildPageUrl(currentPage - 1)}
                  className="px-6 py-3 rounded-lg border-2 border-gray-300 dark:border-slate-600 text-gray-700 dark:text-gray-300 font-semibold hover:bg-gray-100 dark:hover:bg-slate-700 transition-colors w-full sm:w-auto text-center"
                >
                  ← Trang trước
                </Link>
              ) : (
                <div className="px-6 py-3 rounded-lg border-2 border-gray-200 dark:border-slate-700 text-gray-400 dark:text-gray-600 font-semibold w-full sm:w-auto text-center">
                  ← Trang trước
                </div>
              )}

              <div className="flex items-center gap-2">
                <span className="text-gray-600 dark:text-gray-400 font-medium">
                  Trang
                </span>
                <div className="flex items-center gap-2">
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map(
                    (page) => (
                      <Link
                        key={page}
                        href={buildPageUrl(page)}
                        className={`w-10 h-10 rounded-lg font-semibold transition-all ${
                          page === currentPage
                            ? "bg-linear-to-r from-blue-600 to-purple-600 text-white"
                            : "bg-gray-200 dark:bg-slate-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-slate-600"
                        }`}
                      >
                        {page}
                      </Link>
                    ),
                  )}
                </div>
                <span className="text-gray-600 dark:text-gray-400 font-medium">
                  / {totalPages}
                </span>
              </div>

              {hasNextPage ? (
                <Link
                  href={buildPageUrl(currentPage + 1)}
                  className="px-6 py-3 rounded-lg border-2 border-gray-300 dark:border-slate-600 text-gray-700 dark:text-gray-300 font-semibold hover:bg-gray-100 dark:hover:bg-slate-700 transition-colors w-full sm:w-auto text-center"
                >
                  Trang sau →
                </Link>
              ) : (
                <div className="px-6 py-3 rounded-lg border-2 border-gray-200 dark:border-slate-700 text-gray-400 dark:text-gray-600 font-semibold w-full sm:w-auto text-center">
                  Trang sau →
                </div>
              )}
            </div>
          </>
        ) : (
          <div className="text-center py-20 bg-gray-100 dark:bg-slate-800 rounded-2xl border-2 border-dashed border-gray-300 dark:border-slate-600">
            <div className="text-6xl mb-4">📝</div>
            <p className="text-xl text-gray-600 dark:text-gray-400 font-medium mb-2">
              Chưa có bài viết nào
            </p>
            <p className="text-gray-500 dark:text-gray-500">
              Hãy đăng nhập và tạo bài viết đầu tiên của bạn
            </p>
          </div>
        )}
      </section>
    </main>
  );
}
