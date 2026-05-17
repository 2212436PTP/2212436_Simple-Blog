import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { PostStats } from "@/components/home/post-stats";
import { GSAPAnimations } from "@/components/animations/gsap-init";

const PAGE_SIZE = 6;

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
      `*, profiles (display_name, avatar_url)`,
      { count: "exact" },
    )
    .eq("status", "published");

  if (query) {
    const escaped = query.replace(/[%_]/g, "\\$&");
    queryBuilder = queryBuilder.or(
      `title.ilike.%${escaped}%,excerpt.ilike.%${escaped}%,content.ilike.%${escaped}%`,
    );
  }

  const { data: posts, error, count } = await queryBuilder
    .order("published_at", { ascending: false })
    .range(from, to);

  const totalItems = count ?? 0;
  const totalPages = Math.max(1, Math.ceil(totalItems / PAGE_SIZE));
  const hasPreviousPage = currentPage > 1;
  const hasNextPage = currentPage < totalPages;

  const buildPageUrl = (page: number) => {
    const sp = new URLSearchParams();
    if (page > 1) sp.set("page", String(page));
    if (query) sp.set("q", query);
    const s = sp.toString();
    return s ? `/?${s}` : "/";
  };

  if (error) console.error("Error fetching posts:", error);

  const authorName = (p: typeof posts extends (infer T)[] ? T : never) =>
    (p as { is_anonymous: boolean; profiles?: { display_name?: string | null } | null }).is_anonymous
      ? "Ẩn danh"
      : ((p as { profiles?: { display_name?: string | null } | null }).profiles?.display_name) || "Ẩn danh";

  const authorInitial = (p: typeof posts extends (infer T)[] ? T : never) =>
    authorName(p)[0]?.toUpperCase() || "U";

  return (
    <>
      {/* GSAP scroll animations */}
      <GSAPAnimations />

      <main className="min-h-screen" style={{ background: "#f8f7ff" }}>

        {/* ══════════ HERO ══════════ */}
        <section className="relative overflow-hidden">
          {/* Gradient background */}
          <div className="absolute inset-0 -z-10"
            style={{ background: "linear-gradient(160deg, #ede9fe 0%, #fdf4ff 40%, #fce7f3 100%)" }} />

          {/* Floating orbs (CSS only, no JS) */}
          <div className="pointer-events-none absolute -top-40 -left-40 h-[500px] w-[500px] rounded-full opacity-30 animate-float"
            style={{ background: "radial-gradient(circle, #8b5cf6 0%, transparent 70%)", filter: "blur(60px)" }} />
          <div className="pointer-events-none absolute -top-20 right-0 h-[400px] w-[400px] rounded-full opacity-25 animate-float delay-300"
            style={{ background: "radial-gradient(circle, #ec4899 0%, transparent 70%)", filter: "blur(60px)" }} />
          <div className="pointer-events-none absolute bottom-0 left-1/3 h-[300px] w-[300px] rounded-full opacity-20 animate-float delay-500"
            style={{ background: "radial-gradient(circle, #06b6d4 0%, transparent 70%)", filter: "blur(60px)" }} />

          <div className="mx-auto max-w-4xl px-4 py-24 sm:py-32 text-center">

            {/* Live badge */}
            <div className="gsap-hero-badge inline-flex items-center gap-2 rounded-full px-4 py-1.5 text-sm font-semibold mb-6 glass shadow-sm"
              style={{ color: "#7c3aed", border: "1px solid rgba(124,58,237,0.2)" }}>
              <span className="relative flex h-2.5 w-2.5">
                <span className="absolute inline-flex h-full w-full rounded-full bg-violet-400 opacity-75 animate-ping" />
                <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-violet-600" />
              </span>
              Không gian của thế hệ GenZ
            </div>

            {/* Heading */}
            <h1 className="gsap-hero-title text-5xl sm:text-7xl font-extrabold tracking-tight mb-6 leading-[1.1]">
              <span className="text-slate-900">Khám phá </span>
              <span className="text-gradient">bài viết mới</span>
            </h1>

            {/* Subtitle */}
            <p className="gsap-hero-sub text-lg sm:text-xl font-medium mb-10 max-w-xl mx-auto"
              style={{ color: "#6b7280" }}>
              Góc chia sẻ kiến thức, kinh nghiệm và những trải nghiệm cá nhân độc đáo
            </p>

            {/* Search */}
            <form className="gsap-hero-search mx-auto max-w-2xl" action="/" method="get">
              <div className="flex flex-col sm:flex-row gap-2 p-2 glass rounded-2xl sm:rounded-full shadow-lg"
                style={{ border: "1px solid rgba(124,58,237,0.15)", boxShadow: "0 8px 32px rgba(124,58,237,0.1)" }}>
                <div className="flex flex-1 items-center pl-3">
                  <svg className="w-5 h-5 shrink-0" style={{ color: "#8b5cf6" }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                  <input type="search" name="q" defaultValue={query}
                    placeholder="Tìm kiếm bài viết..."
                    className="w-full bg-transparent px-3 py-2.5 text-slate-800 outline-none placeholder:text-slate-400 text-sm sm:text-base"
                  />
                </div>
                <button type="submit"
                  className="rounded-xl sm:rounded-full px-7 py-3 text-sm sm:text-base font-semibold text-white w-full sm:w-auto animate-pulse-glow"
                  style={{ background: "linear-gradient(135deg, #7c3aed, #ec4899)", boxShadow: "0 4px 20px rgba(124,58,237,0.35)" }}
                >
                  Tìm kiếm
                </button>
              </div>
              {query && (
                <div className="mt-3 flex items-center justify-center gap-3 text-sm" style={{ color: "#6b7280" }}>
                  <p>Kết quả cho: <span className="font-semibold" style={{ color: "#7c3aed" }}>&ldquo;{query}&rdquo;</span></p>
                  <Link href="/" className="font-semibold hover:underline" style={{ color: "#ec4899" }}>Xóa bộ lọc</Link>
                </div>
              )}
            </form>
          </div>
        </section>

        {/* ══════════ POSTS ══════════ */}
        <section className="mx-auto max-w-7xl px-4 pb-20">

          {posts && posts.length > 0 ? (
            <>
              {/* Featured post (page 1, no search) */}
              {currentPage === 1 && !query && posts[0] && (
                <div className="gsap-featured mb-12 -mt-6">
                  <Link href={`/posts/${posts[0].slug}`} className="group block">
                    <article className="card-gradient-border grid grid-cols-1 lg:grid-cols-5 gap-0 overflow-hidden shadow-lg transition-all duration-500 hover:-translate-y-1"
                      style={{ boxShadow: "var(--shadow-card)" }}>
                      {/* Image */}
                      <div className="lg:col-span-3 aspect-[16/10] lg:aspect-auto overflow-hidden bg-violet-50">
                        {posts[0].image_url ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img src={posts[0].image_url} alt={posts[0].title}
                            className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
                            style={{ minHeight: "280px" }} />
                        ) : (
                          <div className="flex h-full w-full min-h-[280px] items-center justify-center text-7xl"
                            style={{ background: "linear-gradient(135deg, #ede9fe 0%, #fce7f3 100%)" }}>📄</div>
                        )}
                      </div>
                      {/* Content */}
                      <div className="lg:col-span-2 flex flex-col justify-center p-8">
                        <span className="inline-flex w-fit items-center gap-1.5 rounded-full px-3 py-1 text-xs font-bold mb-5"
                          style={{ background: "linear-gradient(135deg, #ede9fe, #fce7f3)", color: "#7c3aed" }}>
                          ✨ Bài nổi bật
                        </span>
                        <h2 className="text-2xl lg:text-3xl font-extrabold text-slate-900 mb-4 leading-tight transition-colors duration-300 group-hover:text-violet-600 line-clamp-3">
                          {posts[0].title}
                        </h2>
                        <p className="text-slate-500 mb-6 line-clamp-3 leading-relaxed">
                          {posts[0].excerpt || "Không có mô tả cho bài viết này."}
                        </p>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className="h-9 w-9 rounded-full flex items-center justify-center text-white text-xs font-bold"
                              style={{ background: "linear-gradient(135deg, #7c3aed, #ec4899)" }}>
                              {authorInitial(posts[0] as Parameters<typeof authorInitial>[0])}
                            </div>
                            <div>
                              <p className="font-semibold text-slate-800 text-sm">{authorName(posts[0] as Parameters<typeof authorName>[0])}</p>
                              <p className="text-xs text-slate-400">
                                {posts[0].published_at ? new Date(posts[0].published_at).toLocaleDateString("vi-VN") : ""}
                              </p>
                            </div>
                          </div>
                          <PostStats postId={posts[0].id} />
                        </div>
                      </div>
                    </article>
                  </Link>
                </div>
              )}

              {/* Grid */}
              {(currentPage === 1 && !query && posts.length > 1) || (currentPage > 1 || query) ? (
                <>
                  {(query || currentPage > 1) && (
                    <p className="gsap-section-title text-sm font-semibold mb-6" style={{ color: "#7c3aed" }}>
                      {totalItems} bài viết {query ? `cho "${query}"` : ""}
                    </p>
                  )}
                  <div className="gsap-grid grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
                    {(currentPage === 1 && !query ? posts.slice(1) : posts).map((post) => (
                      <Link key={post.id} href={`/posts/${post.slug}`} className="gsap-card group flex h-full">
                        <article className="card-gradient-border flex w-full flex-col overflow-hidden shadow-sm transition-all duration-400 hover:-translate-y-2"
                          style={{ boxShadow: "var(--shadow-card)" }}>
                          {/* Image */}
                          <div className="aspect-[16/10] w-full overflow-hidden">
                            {post.image_url ? (
                              // eslint-disable-next-line @next/next/no-img-element
                              <img src={post.image_url} alt={post.title}
                                className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-108"
                                style={{ transform: "scale(1)" }}
                                onMouseEnter={(e) => { e.currentTarget.style.transform = "scale(1.06)"; }}
                                onMouseLeave={(e) => { e.currentTarget.style.transform = "scale(1)"; }}
                              />
                            ) : (
                              <div className="flex h-full w-full items-center justify-center text-4xl"
                                style={{ background: "linear-gradient(135deg, #ede9fe 0%, #fce7f3 100%)" }}>📄</div>
                            )}
                          </div>
                          {/* Body */}
                          <div className="flex flex-1 flex-col p-5">
                            <h2 className="mb-2 text-base font-bold text-slate-900 line-clamp-2 leading-snug transition-colors duration-300 group-hover:text-violet-600">
                              {post.title}
                            </h2>
                            <p className="mb-4 flex-1 text-sm text-slate-500 line-clamp-2 leading-relaxed">
                              {post.excerpt || "Không có mô tả."}
                            </p>
                            <div className="mb-3">
                              <PostStats postId={post.id} />
                            </div>
                            <div className="flex items-center justify-between border-t pt-3 mt-auto" style={{ borderColor: "#f3f0ff" }}>
                              <div className="flex items-center gap-2">
                                <div className="h-7 w-7 rounded-full flex items-center justify-center text-white text-[10px] font-bold"
                                  style={{ background: "linear-gradient(135deg, #7c3aed, #ec4899)" }}>
                                  {authorInitial(post as Parameters<typeof authorInitial>[0])}
                                </div>
                                <p className="text-xs font-medium text-slate-500 truncate max-w-[90px]">
                                  {authorName(post as Parameters<typeof authorName>[0])}
                                </p>
                              </div>
                              <p className="text-xs text-slate-400 shrink-0">
                                {post.published_at ? new Date(post.published_at).toLocaleDateString("vi-VN") : ""}
                              </p>
                            </div>
                          </div>
                        </article>
                      </Link>
                    ))}
                  </div>
                </>
              ) : null}

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex items-center justify-center gap-2 animate-fade-in-up">
                  {hasPreviousPage ? (
                    <Link href={buildPageUrl(currentPage - 1)}
                      className="flex items-center gap-1.5 rounded-xl border px-4 py-2 text-sm font-semibold text-slate-700 hover:text-violet-700 transition-colors"
                      style={{ borderColor: "#e5e7eb", background: "white" }}>
                      ← Trước
                    </Link>
                  ) : (
                    <span className="rounded-xl border px-4 py-2 text-sm font-semibold text-slate-300"
                      style={{ borderColor: "#e5e7eb", background: "#fafafa" }}>← Trước</span>
                  )}

                  <div className="flex items-center gap-1">
                    {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                      <Link key={page} href={buildPageUrl(page)}
                        className={`flex h-9 w-9 items-center justify-center rounded-xl text-sm font-semibold transition-all ${page === currentPage ? "text-white scale-110 shadow-md" : "text-slate-600 hover:text-violet-700"}`}
                        style={page === currentPage ? { background: "linear-gradient(135deg, #7c3aed, #ec4899)" } : { background: "white", border: "1px solid #e5e7eb" }}>
                        {page}
                      </Link>
                    ))}
                  </div>

                  {hasNextPage ? (
                    <Link href={buildPageUrl(currentPage + 1)}
                      className="flex items-center gap-1.5 rounded-xl border px-4 py-2 text-sm font-semibold text-slate-700 hover:text-violet-700 transition-colors"
                      style={{ borderColor: "#e5e7eb", background: "white" }}>
                      Sau →
                    </Link>
                  ) : (
                    <span className="rounded-xl border px-4 py-2 text-sm font-semibold text-slate-300"
                      style={{ borderColor: "#e5e7eb", background: "#fafafa" }}>Sau →</span>
                  )}
                </div>
              )}
            </>
          ) : (
            /* Empty state */
            <div className="text-center py-28 animate-fade-in-up">
              <div className="text-7xl mb-6 animate-float">✍️</div>
              <h2 className="text-2xl font-extrabold text-slate-800 mb-3">
                {query ? "Không tìm thấy bài viết" : "Chưa có bài viết nào"}
              </h2>
              <p className="text-slate-500 mb-8 max-w-sm mx-auto">
                {query ? `Không có kết quả cho "${query}". Thử từ khóa khác nhé!` : "Hãy là người đầu tiên chia sẻ trên GenZ.Space!"}
              </p>
              {query ? (
                <Link href="/" className="inline-flex items-center gap-2 rounded-full px-6 py-3 font-semibold text-white text-sm"
                  style={{ background: "linear-gradient(135deg, #7c3aed, #ec4899)", boxShadow: "0 4px 20px rgba(124,58,237,0.3)" }}>
                  ← Xem tất cả bài viết
                </Link>
              ) : (
                <Link href="/dashboard/new" className="inline-flex items-center gap-2 rounded-full px-8 py-3 font-semibold text-white animate-pulse-glow"
                  style={{ background: "linear-gradient(135deg, #7c3aed, #ec4899)", boxShadow: "0 4px 24px rgba(124,58,237,0.35)" }}>
                  ✨ Viết bài đầu tiên
                </Link>
              )}
            </div>
          )}
        </section>
      </main>
    </>
  );
}
