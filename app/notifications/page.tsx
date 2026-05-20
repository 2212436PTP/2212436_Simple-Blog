"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import type { Notification } from "@/types/database";

export default function NotificationsPage() {
  const supabase = createClient();
  const router = useRouter();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadNotifications = async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/notifications");
      const payload = (await response.json().catch(() => null)) as {
        notifications?: Notification[];
        error?: string;
      } | null;

      if (!response.ok) {
        throw new Error(payload?.error || "Không thể tải thông báo");
      }

      setNotifications(payload?.notifications || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Có lỗi xảy ra");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void (async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        router.push("/login");
        return;
      }

      await loadNotifications();
    })();
  }, []);

  const markAllAsRead = async () => {
    const response = await fetch("/api/notifications", { method: "PATCH" });
    if (!response.ok) {
      const payload = (await response.json().catch(() => null)) as {
        error?: string;
      } | null;
      throw new Error(payload?.error || "Không thể đánh dấu đã đọc");
    }
    await loadNotifications();
  };

  return (
    <main className="mx-auto max-w-4xl px-4 py-10">
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-950 ">Thông báo</h1>
          <p className="text-sm text-slate-500 ">
            Bình luận và phản ứng mới trên bài viết của bạn.
          </p>
        </div>
        <button
          type="button"
          onClick={async () => {
            try {
              await markAllAsRead();
            } catch (err) {
              setError(
                err instanceof Error ? err.message : "Không thể cập nhật",
              );
            }
          }}
          className="w-full sm:w-auto rounded-full border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50 "
        >
          Đánh dấu đã đọc
        </button>
      </div>

      {error && (
        <div className="mb-4 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 /20 ">
          {error}
        </div>
      )}

      {loading ? (
        <p className="text-slate-500 ">Đang tải...</p>
      ) : notifications.length === 0 ? (
        <div className="rounded-3xl border border-dashed border-slate-300 bg-white/80 p-8 text-center text-slate-500 /70 ">
          Chưa có thông báo nào.
        </div>
      ) : (
        <div className="space-y-4">
          {notifications.map((notification) => (
            <article
              key={notification.id}
              className={`rounded-3xl border p-5 shadow-sm backdrop-blur ${
                notification.read_at
                  ? "border-slate-200 bg-white/70 /60"
                  : "border-blue-200 bg-blue-50/80 /30"
              }`}
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-sm font-semibold text-slate-950 ">
                    {notification.message}
                  </p>
                  <p className="mt-2 text-xs text-slate-500 ">
                    {new Date(notification.created_at).toLocaleString("vi-VN")}
                  </p>
                </div>
                {!notification.read_at && (
                  <span className="rounded-full bg-blue-600 px-2.5 py-1 text-xs font-semibold text-white">
                    Mới
                  </span>
                )}
              </div>
            </article>
          ))}
        </div>
      )}
    </main>
  );
}
