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
 <main className="min-h-screen bg-slate-50 pb-20">
 {/* Hero Section */}
 <section className="max-w-7xl mx-auto px-4 py-16 sm:py-24">
 <div className="text-center mb-12">
 <h1 className="text-5xl sm:text-6xl font-extrabold text-slate-900 tracking-tight mb-6">
 Khám phá <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">bài viết mới</span>
 </h1>
 <p className="text-lg text-slate-600 max-w-2xl mx-auto">
 Góc chia sẻ kiến thức, kinh nghiệm và những trải nghiệm cá nhân độc đáo
 </p>
 </div>

 <form className="max-w-2xl mx-auto mb-16" action="/" method="get">
 <div className="flex flex-col sm:flex-row gap-2 rounded-full border border-slate-200 bg-white p-2 shadow-sm focus-within:ring-2 focus-within:ring-blue-500 transition-all">
 <div className="flex-1 flex items-center pl-4">
 <svg className="w-5 h-5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
 </svg>
 <input
 type="search"
 name="q"
 defaultValue={query}
 placeholder="Tìm kiếm bài viết..."
 className="w-full bg-transparent px-4 py-2 text-slate-900 outline-none placeholder:text-slate-400"
 />
 </div>
 <button
 type="submit"
 className="rounded-full bg-blue-600 px-8 py-3 font-semibold text-white shadow-md transition-all hover:bg-blue-700 hover:shadow-lg"
 >
 Tìm kiếm
 </button>
 </div>
 {query && (
 <div className="mt-4 flex items-center justify-center gap-3 text-sm text-slate-600">
 <p>Kết quả cho: <span className="font-semibold text-slate-900">{query}</span></p>
 <Link href="/" className="font-semibold text-blue-600 hover:underline">Xóa bộ lọc</Link>
 </div>
 )}
 </form>

 {posts && posts.length > 0 ? (
 <>
 {/* Bài viết nổi bật (Chỉ hiện ở trang 1 và khi không tìm kiếm) */}
 {currentPage === 1 && !query && posts[0] && (
 <div className="mb-16">
 <Link href={`/posts/${posts[0].slug}`} className="group block">
 <article className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center bg-white rounded-3xl p-4 sm:p-6 shadow-sm border border-slate-100 transition-all duration-300 hover:shadow-xl hover:-translate-y-1">
 <div className="aspect-[4/3] md:aspect-[16/10] w-full overflow-hidden rounded-2xl bg-slate-100">
 {posts[0].image_url ? (
 /* eslint-disable-next-line @next/next/no-img-element */
 <img src={posts[0].image_url} alt={posts[0].title} className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105" />
 ) : (
 <div className="flex h-full w-full items-center justify-center bg-slate-100 text-6xl">📄</div>
 )}
 </div>
 <div className="flex flex-col justify-center p-4">
 <div className="mb-4 inline-flex w-fit items-center rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-600">
 🌟 Bài nổi bật
 </div>
 <h2 className="mb-4 text-3xl md:text-4xl font-bold text-slate-900 transition-colors group-hover:text-blue-600 line-clamp-3">
 {posts[0].title}
 </h2>
 <p className="mb-6 text-slate-600 line-clamp-3 text-lg">
 {posts[0].excerpt || "Không có mô tả cho bài viết này."}
 </p>
 <div className="flex items-center justify-between">
 <div className="flex items-center gap-3">
 <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-600 text-white font-bold text-sm">
 {(posts[0].is_anonymous ? "Ẩn danh" : posts[0].profiles?.display_name || "A")[0].toUpperCase()}
 </div>
 <div>
 <p className="font-semibold text-slate-900 text-sm">
 {posts[0].is_anonymous ? "Ẩn danh" : posts[0].profiles?.display_name || "Ẩn danh"}
 </p>
 <p className="text-xs text-slate-500">
 {posts[0].published_at ? new Date(posts[0].published_at).toLocaleDateString("vi-VN") : ""}
 </p>
 </div>
 </div>
 <div className="hidden sm:block">
 <PostStats postId={posts[0].id} />
 </div>
 </div>
 </div>
 </article>
 </Link>
 </div>
 )}

 {/* Lưới bài viết (Grid) */}
 <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
 {(currentPage === 1 && !query ? posts.slice(1) : posts).map((post) => (
 <Link key={post.id} href={`/posts/${post.slug}`} className="group h-full flex">
 <article className="flex w-full flex-col overflow-hidden rounded-2xl bg-white shadow-sm border border-slate-100 transition-all duration-300 hover:shadow-xl hover:-translate-y-2">
 <div className="aspect-[16/10] w-full overflow-hidden bg-slate-100 relative">
 {post.image_url ? (
 /* eslint-disable-next-line @next/next/no-img-element */
 <img src={post.image_url} alt={post.title} className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105" />
 ) : (
 <div className="flex h-full w-full items-center justify-center bg-slate-100 text-4xl">📄</div>
 )}
 </div>
 <div className="flex flex-1 flex-col p-6">
 <h2 className="mb-3 text-xl font-bold text-slate-900 transition-colors group-hover:text-blue-600 line-clamp-2">
 {post.title}
 </h2>
 <p className="mb-6 flex-1 text-sm text-slate-600 line-clamp-3">
 {post.excerpt || "Không có mô tả."}
 </p>
 
 <div className="mb-4">
 <PostStats postId={post.id} />
 </div>

 <div className="flex items-center justify-between border-t border-slate-100 pt-4 mt-auto">
 <div className="flex items-center gap-2">
 <div className="flex h-7 w-7 items-center justify-center rounded-full bg-slate-100 text-slate-600 font-bold text-[10px]">
 {(post.is_anonymous ? "A" : post.profiles?.display_name || "A")[0].toUpperCase()}
 </div>
 <p className="text-xs font-medium text-slate-600 truncate max-w-[100px]">
 {post.is_anonymous ? "Ẩn danh" : post.profiles?.display_name || "Ẩn danh"}
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

 {/* Phân trang */}
 <div className="flex items-center justify-center gap-2">
 {hasPreviousPage ? (
 <Link href={buildPageUrl(currentPage - 1)} className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50 transition-colors">
 Trang trước
 </Link>
 ) : (
 <button disabled className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-2 text-sm font-semibold text-slate-400">Trang trước</button>
 )}

 <div className="flex items-center gap-1 mx-2">
 {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
 <Link
 key={page}
 href={buildPageUrl(page)}
 className={`flex h-9 w-9 items-center justify-center rounded-xl text-sm font-semibold transition-colors ${
 page === currentPage
 ? "bg-blue-600 text-white shadow-md"
 : "text-slate-600 hover:bg-slate-100"
 }`}
 >
 {page}
 </Link>
 ))}
 </div>

 {hasNextPage ? (
 <Link href={buildPageUrl(currentPage + 1)} className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50 transition-colors">
 Trang sau
 </Link>
 ) : (
 <button disabled className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-2 text-sm font-semibold text-slate-400">Trang sau</button>
 )}
 </div>
 </>
 ) : (
 <div className="text-center py-20 bg-white rounded-3xl border border-dashed border-slate-300 shadow-sm max-w-2xl mx-auto">
 <div className="text-6xl mb-4">📝</div>
 <p className="text-2xl text-slate-900 font-bold mb-3">Chưa có bài viết nào</p>
 <p className="text-slate-500 mb-6">Hãy là người đầu tiên chia sẻ kiến thức của bạn trên cộng đồng này.</p>
 <Link href="/dashboard/new" className="inline-flex items-center justify-center rounded-full bg-blue-600 px-6 py-3 font-semibold text-white shadow-md transition-all hover:bg-blue-700">
 Tạo bài viết mới
 </Link>
 </div>
 )}
 </section>
 </main>
 );
}
