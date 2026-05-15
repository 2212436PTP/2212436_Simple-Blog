"use client";

import { useState, type FormEvent } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export function LoginForm() {
 const router = useRouter();
 const searchParams = useSearchParams();
 const supabase = createClient();
 const justRegistered = searchParams.get("registered") === "1";

 const [email, setEmail] = useState("");
 const [password, setPassword] = useState("");
 const [error, setError] = useState<string | null>(null);
 const [loading, setLoading] = useState(false);

 const handleLogin = async (e: FormEvent) => {
 e.preventDefault();
 setError(null);
 setLoading(true);

 try {
 const { data, error } = await supabase.auth.signInWithPassword({
 email,
 password,
 });

 if (error) {
 // Map Supabase error messages to Vietnamese
 let errorMsg = error.message;
 if (error.message.includes("Email not confirmed")) {
 errorMsg =
 "Email của bạn chưa được xác nhận. Vui lòng kiểm tra email và click link xác nhận.";
 } else if (error.message.includes("Invalid login credentials")) {
 errorMsg = "Email hoặc mật khẩu không đúng.";
 }
 setError(errorMsg);
 return;
 }

 if (data.session) {
 router.push("/dashboard");
 router.refresh();
 }
 } catch {
 setError("Có lỗi xảy ra. Vui lòng thử lại.");
 } finally {
 setLoading(false);
 }
 };

 const handleGitHubLogin = async () => {
 setError(null);

 const { error } = await supabase.auth.signInWithOAuth({
 provider: "github",
 options: {
 redirectTo: `${window.location.origin}/auth/callback`,
 },
 });

 if (error) {
 setError(error.message);
 }
 };

 return (
 <div className="mt-8 space-y-6">
 {justRegistered && (
 <div className="bg-green-50 /20 border border-green-200 rounded-lg p-4">
 <p className="text-green-700 text-sm font-medium">
 ✓ Đăng ký thành công! Vui lòng đăng nhập để tiếp tục.
 </p>
 </div>
 )}

 {error && (
 <div className="bg-red-50 /20 border border-red-200 rounded-lg p-4">
 <p className="text-red-700 text-sm">{error}</p>
 </div>
 )}

 <div>
 <button
 type="button"
 onClick={handleGitHubLogin}
 className="w-full flex items-center justify-center gap-2 py-3 px-4 border-2 border-gray-300 rounded-lg shadow-sm text-sm font-semibold text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
 >
 <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
 <path
 fillRule="evenodd"
 d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z"
 clipRule="evenodd"
 />
 </svg>
 Đăng nhập với GitHub
 </button>
 </div>

 <div className="relative">
 <div className="absolute inset-0 flex items-center">
 <div className="w-full border-t border-gray-300 " />
 </div>
 <div className="relative flex justify-center text-sm">
 <span className="px-2 bg-white text-gray-500 ">
 Hoặc
 </span>
 </div>
 </div>

 <form onSubmit={handleLogin} className="space-y-4">
 <div>
 <label
 htmlFor="email"
 className="block text-sm font-semibold text-gray-700 "
 >
 Email
 </label>
 <input
 id="email"
 type="email"
 value={email}
 onChange={(e) => setEmail(e.target.value)}
 required
 className="mt-2 block w-full px-4 py-2 border border-gray-300 rounded-lg shadow-sm bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
 placeholder="email@example.com"
 />
 </div>

 <div>
 <label
 htmlFor="password"
 className="block text-sm font-semibold text-gray-700 "
 >
 Mật khẩu
 </label>
 <input
 id="password"
 type="password"
 value={password}
 onChange={(e) => setPassword(e.target.value)}
 required
 className="mt-2 block w-full px-4 py-2 border border-gray-300 rounded-lg shadow-sm bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
 placeholder="••••••••"
 />
 <div className="mt-3 text-right">
 <Link
 href="/forgot-password"
 className="text-sm text-blue-600 hover:text-blue-500 font-medium"
 >
 Quên mật khẩu?
 </Link>
 </div>
 </div>

 <button
 type="submit"
 disabled={loading}
 className="w-full flex justify-center py-3 px-4 rounded-lg shadow-md text-base font-semibold text-white bg-linear-to-r from-blue-600 to-purple-600 hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
 >
 {loading ? "Đang xử lý..." : "Đăng nhập"}
 </button>
 </form>

 <p className="text-center text-sm text-gray-700 ">
 Chưa có tài khoản?{" "}
 <Link
 href="/register"
 className="text-blue-600 hover:text-blue-500 font-semibold"
 >
 Đăng ký ngay
 </Link>
 </p>
 </div>
 );
}
