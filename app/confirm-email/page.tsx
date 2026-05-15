"use client";

import { useSearchParams, useRouter } from "next/navigation";
import { Suspense, useState } from "react";
import Link from "next/link";

function ConfirmEmailContent() {
 const searchParams = useSearchParams();
 const router = useRouter();
 const email = searchParams.get("email") || "";
 const [loading, setLoading] = useState(false);
 const [message, setMessage] = useState<string | null>(null);
 const [error, setError] = useState<string | null>(null);

 const handleResendEmail = async () => {
 if (!email) {
 setError("Địa chỉ email không hợp lệ.");
 return;
 }

 setLoading(true);
 setError(null);
 setMessage(null);

 try {
 const response = await fetch("/api/auth/resend-confirmation", {
 method: "POST",
 headers: { "Content-Type": "application/json" },
 body: JSON.stringify({ email }),
 });

 const data = await response.json();

 if (!response.ok) {
 setError(data.error || "Có lỗi xảy ra khi gửi lại email.");
 return;
 }

 setMessage("Email xác nhận đã được gửi lại. Vui lòng kiểm tra hộp thư.");
 } catch {
 setError("Không thể kết nối đến server. Vui lòng thử lại sau.");
 } finally {
 setLoading(false);
 }
 };

 return (
 <div className="min-h-screen bg-linear-to-b from-white to-gray-50 flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8">
 <div className="max-w-md w-full mx-auto bg-white rounded-2xl shadow-lg p-8">
 {/* Success Icon */}
 <div className="flex justify-center mb-6">
 <div className="w-16 h-16 bg-linear-to-br from-green-100 to-green-50 /30 /20 rounded-full flex items-center justify-center">
 <svg
 className="w-8 h-8 text-green-600 "
 fill="none"
 stroke="currentColor"
 viewBox="0 0 24 24"
 >
 <path
 strokeLinecap="round"
 strokeLinejoin="round"
 strokeWidth={2}
 d="M5 13l4 4L19 7"
 />
 </svg>
 </div>
 </div>

 <h1 className="text-3xl font-bold text-center text-gray-900 mb-2">
 Đăng ký thành công!
 </h1>
 <p className="text-center text-gray-600 mb-6">
 Chúng tôi đã gửi email xác nhận đến
 </p>

 {/* Email Display */}
 <div className="bg-blue-50 /20 border border-blue-200 rounded-lg p-4 mb-6 text-center">
 <p className="text-sm text-gray-600 mb-1">
 Email của bạn:
 </p>
 <p className="text-lg font-semibold text-gray-900 break-all">
 {email}
 </p>
 </div>

 {/* Instructions */}
 <div className="bg-yellow-50 /20 border border-yellow-200 rounded-lg p-4 mb-6">
 <h3 className="font-semibold text-gray-900 mb-3">
 Bước tiếp theo:
 </h3>
 <ol className="list-decimal list-inside space-y-2 text-sm text-gray-700 ">
 <li>Mở email và tìm email từ Simple Blog</li>
 <li>Click link "Xác nhận email" trong email</li>
 <li>Trở lại và đăng nhập với mật khẩu của bạn</li>
 </ol>
 </div>

 {/* Messages */}
 {message && (
 <div className="bg-green-50 /20 text-green-700 p-4 rounded-lg text-sm mb-4 border border-green-200 ">
 ✓ {message}
 </div>
 )}

 {error && (
 <div className="bg-red-50 /20 text-red-700 p-4 rounded-lg text-sm mb-4 border border-red-200 ">
 {error}
 </div>
 )}

 {/* Resend Button */}
 <button
 onClick={handleResendEmail}
 disabled={loading}
 className="w-full mb-4 py-3 px-4 bg-linear-to-r from-blue-600 to-purple-600 text-white font-semibold rounded-lg hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
 >
 {loading ? "Đang gửi..." : "Gửi lại email xác nhận"}
 </button>

 {/* Links */}
 <div className="space-y-3 text-sm text-center">
 <p className="text-gray-600 ">
 Email không đến?{" "}
 <button
 onClick={handleResendEmail}
 className="text-blue-600 hover:underline font-semibold"
 >
 Gửi lại
 </button>
 </p>
 <p className="text-gray-600 ">
 Đã xác nhận email?{" "}
 <Link
 href="/login"
 className="text-blue-600 hover:underline font-semibold"
 >
 Đăng nhập
 </Link>
 </p>
 </div>
 </div>
 </div>
 );
}

export default function ConfirmEmailPage() {
 return (
 <Suspense
 fallback={
 <div className="min-h-screen bg-linear-to-b from-white to-gray-50 flex items-center justify-center px-4">
 <p className="text-sm text-slate-500 ">
 Đang tải...
 </p>
 </div>
 }
 >
 <ConfirmEmailContent />
 </Suspense>
 );
}
