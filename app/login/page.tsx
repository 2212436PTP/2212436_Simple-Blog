import { LoginForm } from "@/components/auth/login-form";

type SearchParams = Promise<{ message?: string }>;

export default async function LoginPage({
 searchParams,
}: {
 searchParams: SearchParams;
}) {
 const params = await searchParams;

 return (
 <div className="auth-page-bg min-h-screen flex items-center justify-center px-4 py-12">
 <div className="auth-card w-full max-w-md space-y-8 rounded-3xl p-8 shadow-[0_30px_80px_-40px_rgba(15,23,42,0.45)] backdrop-blur-xl">
 <div className="text-center space-y-2">
 <h2 className="text-3xl font-bold">Đăng nhập</h2>
 <p className="text-gray-600 ">
 Đăng nhập để quản lý blog của bạn
 </p>
 </div>

 {params?.message && (
 <div className="rounded-2xl border border-green-200 bg-green-50/90 p-3 text-sm text-green-700 ">
 {params.message}
 </div>
 )}

 <LoginForm />
 </div>
 </div>
 );
}
