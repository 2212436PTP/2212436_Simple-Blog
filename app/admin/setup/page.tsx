"use client";

import { useState } from "react";

export default function AdminSetupPage() {
  const [email, setEmail] = useState("");
  const [role, setRole] = useState<"admin" | "user">("admin");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<{
    ok?: boolean;
    error?: string;
    message?: string;
  } | null>(null);

  const handleSetup = async () => {
    if (!email.trim()) {
      setResult({ error: "Vui lòng nhập email" });
      return;
    }

    setLoading(true);
    setResult(null);

    try {
      const res = await fetch("/api/admin/setup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim(), role }),
      });

      const data = (await res.json()) as Record<string, unknown>;

      if (res.ok) {
        setResult({
          ok: true,
          message: `✅ User ${email} được gán role ${role} thành công!`,
        });
        setEmail("");
      } else {
        setResult({
          error: String(data.error || "Có lỗi xảy ra"),
        });
      }
    } catch (err) {
      setResult({ error: String(err) });
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="max-w-2xl mx-auto px-4 py-10">
      <div className="rounded-3xl border border-slate-200 bg-white/80 p-8 shadow-sm backdrop-blur dark:border-slate-700 dark:bg-slate-900/70">
        <h1 className="mb-2 text-2xl font-bold text-slate-950 dark:text-white">
          Setup Admin Role
        </h1>
        <p className="mb-6 text-sm text-slate-500 dark:text-slate-400">
          Gán role admin cho một user bằng email.{" "}
          <strong>
            ⚠️ Chỉ dùng để test, xóa endpoint này trong production!
          </strong>
        </p>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
              Email của user
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="user@example.com"
              className="w-full rounded-lg border border-slate-300 bg-white px-4 py-2 text-slate-900 placeholder-slate-400 dark:border-slate-600 dark:bg-slate-800 dark:text-white dark:placeholder-slate-500"
              disabled={loading}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
              Role
            </label>
            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => setRole("admin")}
                className={`flex-1 rounded-lg px-4 py-2 font-medium transition-colors ${
                  role === "admin"
                    ? "bg-blue-600 text-white"
                    : "border border-slate-300 bg-white text-slate-700 hover:bg-slate-50 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700"
                }`}
                disabled={loading}
              >
                👮 Admin
              </button>
              <button
                type="button"
                onClick={() => setRole("user")}
                className={`flex-1 rounded-lg px-4 py-2 font-medium transition-colors ${
                  role === "user"
                    ? "bg-blue-600 text-white"
                    : "border border-slate-300 bg-white text-slate-700 hover:bg-slate-50 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700"
                }`}
                disabled={loading}
              >
                👤 User
              </button>
            </div>
          </div>

          <button
            onClick={handleSetup}
            disabled={loading}
            className="w-full rounded-lg bg-blue-600 px-4 py-2 font-medium text-white hover:bg-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {loading ? "Đang xử lý..." : "Gán Role"}
          </button>

          {result && (
            <div
              className={`rounded-lg p-4 text-sm ${
                result.ok
                  ? "border border-green-200 bg-green-50 text-green-800 dark:border-green-700 dark:bg-green-900/30 dark:text-green-300"
                  : "border border-red-200 bg-red-50 text-red-800 dark:border-red-700 dark:bg-red-900/30 dark:text-red-300"
              }`}
            >
              {result.message || result.error}
            </div>
          )}
        </div>

        <div className="mt-8 rounded-lg bg-slate-100 p-4 dark:bg-slate-800">
          <h2 className="font-semibold text-slate-900 dark:text-white mb-2">
            📖 Hướng dẫn
          </h2>
          <ol className="text-sm text-slate-700 dark:text-slate-300 space-y-2 list-decimal list-inside">
            <li>Nhập email của user muốn gán role</li>
            <li>Chọn role (admin hoặc user)</li>
            <li>Nhấp "Gán Role"</li>
            <li>Logout rồi login lại để thấy thay đổi</li>
            <li>Admin sẽ thấy link "Admin" trong header</li>
          </ol>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-3">
            Xem <strong>ADMIN_TESTING_GUIDE.md</strong> để biết thêm chi tiết.
          </p>
        </div>
      </div>
    </main>
  );
}
