"use client";

import { useState, type FormEvent } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";

export function ForgotPasswordForm() {
  const supabase = createClient();

  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    setMessage(null);
    setLoading(true);

    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/auth/callback?next=/login`,
      });

      if (error) {
        setError(error.message);
        return;
      }

      setMessage("Đã gửi email đặt lại mật khẩu. Vui lòng kiểm tra hộp thư.");
    } catch {
      setError("Có lỗi xảy ra. Vui lòng thử lại.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-5">
      {error && (
        <div className="bg-red-50 text-red-500 p-3 rounded-md text-sm sm:text-base">
          {error}
        </div>
      )}
      {message && (
        <div className="bg-green-50 text-green-700 p-3 rounded-md text-sm sm:text-base">
          {message}
        </div>
      )}

      <div>
        <label
          htmlFor="email"
          className="block text-sm font-medium text-gray-700"
        >
          Email
        </label>
        <input
          id="email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          className="mt-2 block w-full px-4 py-2.5 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
          placeholder="email@example.com"
        />
      </div>

      <button
        type="submit"
        disabled={loading}
        className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {loading ? "Đang gửi..." : "Gửi link đặt lại mật khẩu"}
      </button>

      <p className="text-center text-sm text-gray-600">
        Quay lại{" "}
        <Link href="/login" className="text-blue-600 hover:text-blue-500">
          đăng nhập
        </Link>
      </p>
    </form>
  );
}
