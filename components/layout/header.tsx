"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { logout } from "@/app/actions/auth";
import { useTheme } from "./theme-provider";

type SessionUser = {
  id: string;
  email?: string | null;
  user_metadata?: {
    display_name?: string | null;
    avatar_url?: string | null;
    role?: string | null;
  };
};

type HeaderNotification = {
  id: string;
  message: string;
  created_at: string;
  read_at: string | null;
};

export function Header() {
  const [user, setUser] = useState<SessionUser | null>(null);
  const [displayName, setDisplayName] = useState("Người dùng");
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [unreadNotifications, setUnreadNotifications] = useState(0);
  const [latestNotifications, setLatestNotifications] = useState<
    HeaderNotification[]
  >([]);
  const [notificationOpen, setNotificationOpen] = useState(false);
  const [toastNotification, setToastNotification] =
    useState<HeaderNotification | null>(null);
  const [mounted, setMounted] = useState(false);
  const { theme, toggleTheme } = useTheme();
  const lastNotificationIdRef = useRef<string | null>(null);
  const hasLoadedNotificationsRef = useRef(false);
  const toastTimerRef = useRef<number | null>(null);

  const clearToastTimer = () => {
    if (toastTimerRef.current) {
      window.clearTimeout(toastTimerRef.current);
      toastTimerRef.current = null;
    }
  };

  const showNotificationToast = (notification: HeaderNotification) => {
    setToastNotification(notification);
    clearToastTimer();
    toastTimerRef.current = window.setTimeout(() => {
      setToastNotification(null);
      toastTimerRef.current = null;
    }, 5000);
  };

  const loadNotifications = async () => {
    const response = await fetch("/api/notifications");
    const payload = (await response.json().catch(() => null)) as {
      unreadCount?: number;
      notifications?: HeaderNotification[];
    } | null;

    if (!response.ok || !payload) {
      return;
    }

    const notifications = payload.notifications || [];
    setUnreadNotifications(payload.unreadCount || 0);
    setLatestNotifications(notifications);

    if (notifications.length > 0) {
      const latest = notifications[0];
      const hasNewNotification =
        hasLoadedNotificationsRef.current &&
        lastNotificationIdRef.current !== null &&
        latest.id !== lastNotificationIdRef.current &&
        latest.read_at === null;

      if (hasNewNotification) {
        showNotificationToast(latest);
      }

      lastNotificationIdRef.current = latest.id;
    }

    hasLoadedNotificationsRef.current = true;
  };

  useEffect(() => {
    let active = true;

    const init = async () => {
      const supabase = createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!active) {
        return;
      }

      setUser(user);

      if (user) {
        const { data: profile } = await supabase
          .from("profiles")
          .select("display_name, avatar_url")
          .eq("id", user.id)
          .maybeSingle();

        if (!active) {
          return;
        }

        setDisplayName(
          profile?.display_name ||
            user.user_metadata?.display_name ||
            user.email?.split("@")[0] ||
            "Người dùng",
        );
        setAvatarUrl(
          profile?.avatar_url || user.user_metadata?.avatar_url || null,
        );

        await loadNotifications();
        await fetch("/api/profile/sync", { method: "POST" });
      }

      if (active) {
        setMounted(true);
      }
    };

    void init();

    const interval = window.setInterval(() => {
      if (user) {
        void loadNotifications();
      }
    }, 15000);

    return () => {
      active = false;
      window.clearInterval(interval);
      clearToastTimer();
    };
  }, []);

  if (!mounted) {
    return null;
  }

  return (
    <header className="relative border-b border-gray-200 bg-white shadow-md dark:border-slate-700 dark:bg-slate-900">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          <Link
            href="/"
            className="text-2xl font-bold text-blue-600 transition-colors hover:text-blue-500 dark:text-blue-400 dark:hover:text-blue-300"
          >
            Simple Blog
          </Link>

          <nav className="flex items-center gap-4 sm:gap-6">
            <Link
              href="/"
              className="font-medium text-gray-700 transition-colors hover:text-blue-600 dark:text-gray-300 dark:hover:text-blue-400"
            >
              Trang chủ
            </Link>
            {user ? (
              <>
                <div className="hidden items-center gap-2 rounded-full border border-gray-200 bg-white px-3 py-1.5 text-sm text-gray-700 shadow-sm dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 sm:flex">
                  <span className="flex h-6 w-6 items-center justify-center overflow-hidden rounded-full bg-blue-600 text-xs font-bold text-white">
                    {avatarUrl ? (
                      <img
                        src={avatarUrl}
                        alt={displayName}
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      displayName[0]?.toUpperCase() || "U"
                    )}
                  </span>
                  <span className="max-w-36 truncate font-medium">
                    {displayName}
                  </span>
                </div>
                <Link
                  href="/dashboard"
                  className="font-medium text-gray-700 transition-colors hover:text-blue-600 dark:text-gray-300 dark:hover:text-blue-400"
                >
                  Bảng điều khiển
                </Link>
                <Link
                  href="/dashboard/settings"
                  className="font-medium text-gray-700 transition-colors hover:text-blue-600 dark:text-gray-300 dark:hover:text-blue-400"
                >
                  Hồ sơ
                </Link>
                <button
                  type="button"
                  onClick={() => setNotificationOpen((value) => !value)}
                  className="relative font-medium text-gray-700 transition-colors hover:text-blue-600 dark:text-gray-300 dark:hover:text-blue-400"
                >
                  Thông báo
                  {unreadNotifications > 0 && (
                    <span className="absolute -right-3 -top-2 flex h-5 min-w-5 items-center justify-center rounded-full bg-red-600 px-1 text-[10px] font-bold text-white">
                      {unreadNotifications}
                    </span>
                  )}
                </button>
                {user.user_metadata?.role === "admin" && (
                  <Link
                    href="/admin"
                    className="font-medium text-gray-700 transition-colors hover:text-blue-600 dark:text-gray-300 dark:hover:text-blue-400"
                  >
                    Admin
                  </Link>
                )}
                <form action={logout}>
                  <button
                    type="submit"
                    className="font-medium text-gray-700 transition-colors hover:text-red-600 dark:text-gray-300 dark:hover:text-red-400"
                  >
                    Đăng xuất
                  </button>
                </form>
              </>
            ) : (
              <>
                <Link
                  href="/login"
                  className="font-medium text-gray-700 transition-colors hover:text-blue-600 dark:text-gray-300 dark:hover:text-blue-400"
                >
                  Đăng nhập
                </Link>
                <Link
                  href="/register"
                  className="rounded-lg bg-blue-600 px-4 py-2 font-medium text-white transition-all duration-200 hover:bg-blue-500 hover:shadow-lg"
                >
                  Đăng ký
                </Link>
              </>
            )}

            <button
              onClick={toggleTheme}
              className="rounded-lg bg-gray-200 p-2 text-gray-800 transition-colors hover:bg-gray-300 dark:bg-slate-700 dark:text-yellow-300 dark:hover:bg-slate-600"
              aria-label="Toggle theme"
            >
              {theme === "light" ? (
                <svg
                  className="h-5 w-5"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path d="M17.293 13.293A8 8 0 016.707 2.707a8.001 8.001 0 1010.586 10.586z" />
                </svg>
              ) : (
                <svg
                  className="h-5 w-5"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M10 2a1 1 0 011 1v1a1 1 0 11-2 0V3a1 1 0 011-1zm4 8a4 4 0 11-8 0 4 4 0 018 0zm-.464 4.536l.707.707a1 1 0 001.414-1.414l-.707-.707a1 1 0 00-1.414 1.414zm2.121-10.607a1 1 0 010 1.414l-.707.707a1 1 0 11-1.414-1.414l.707-.707a1 1 0 011.414 0zM17 11a1 1 0 100-2h-1a1 1 0 100 2h1zm-7 4a1 1 0 011 1v1a1 1 0 11-2 0v-1a1 1 0 011-1zM5.05 6.464A1 1 0 106.464 5.05l-.707-.707a1 1 0 00-1.414 1.414l.707.707zm5.414 5.414a1 1 0 01-1.414 0l-.707-.707a1 1 0 011.414-1.414l.707.707zM5 6a1 1 0 100-2H4a1 1 0 000 2h1z"
                    clipRule="evenodd"
                  />
                </svg>
              )}
            </button>
          </nav>
        </div>
      </div>

      {notificationOpen && user && (
        <div className="absolute right-4 top-17 z-50 w-[calc(100vw-2rem)] max-w-sm rounded-2xl border border-slate-200 bg-white p-4 shadow-2xl dark:border-slate-700 dark:bg-slate-900 sm:right-6 sm:w-88">
          <div className="mb-3 flex items-center justify-between gap-3">
            <div>
              <p className="text-sm font-semibold text-slate-950 dark:text-white">
                Thông báo gần đây
              </p>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Xem nhanh mà không cần chuyển trang
              </p>
            </div>
            <button
              type="button"
              onClick={() => setNotificationOpen(false)}
              className="rounded-full px-2 py-1 text-xs font-semibold text-slate-500 hover:bg-slate-100 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-white"
            >
              Đóng
            </button>
          </div>

          {latestNotifications.length === 0 ? (
            <p className="rounded-xl border border-dashed border-slate-200 px-4 py-3 text-sm text-slate-500 dark:border-slate-700 dark:text-slate-400">
              Chưa có thông báo nào.
            </p>
          ) : (
            <div className="max-h-80 space-y-2 overflow-auto pr-1">
              {latestNotifications.slice(0, 5).map((notification) => (
                <div
                  key={notification.id}
                  className={`rounded-xl border px-3 py-2 text-sm ${
                    notification.read_at
                      ? "border-slate-200 bg-slate-50 text-slate-700 dark:border-slate-700 dark:bg-slate-800/60 dark:text-slate-200"
                      : "border-blue-200 bg-blue-50 text-slate-900 dark:border-blue-900 dark:bg-blue-950/30 dark:text-white"
                  }`}
                >
                  <p className="leading-6">{notification.message}</p>
                  <p className="mt-1 text-[11px] text-slate-500 dark:text-slate-400">
                    {new Date(notification.created_at).toLocaleString("vi-VN")}
                  </p>
                </div>
              ))}
            </div>
          )}

          <div className="mt-4 flex items-center justify-between gap-3">
            <Link
              href="/notifications"
              className="text-sm font-semibold text-blue-600 hover:text-blue-500 dark:text-blue-400 dark:hover:text-blue-300"
              onClick={() => setNotificationOpen(false)}
            >
              Xem tất cả
            </Link>
            {unreadNotifications > 0 && (
              <button
                type="button"
                onClick={async () => {
                  await fetch("/api/notifications", { method: "PATCH" });
                  setUnreadNotifications(0);
                  await loadNotifications();
                }}
                className="text-sm font-semibold text-slate-600 hover:text-slate-900 dark:text-slate-300 dark:hover:text-white"
              >
                Đánh dấu đã đọc
              </button>
            )}
          </div>
        </div>
      )}

      {toastNotification && (
        <div className="pointer-events-none fixed right-4 top-20 z-60 w-[calc(100vw-2rem)] max-w-sm sm:right-6 sm:top-24">
          <div className="pointer-events-auto rounded-2xl border border-blue-200 bg-white p-4 shadow-2xl ring-1 ring-blue-100 dark:border-blue-900 dark:bg-slate-900 dark:ring-blue-950/50">
            <div className="flex items-start gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-blue-600 text-white">
                !
              </div>
              <div className="flex-1">
                <p className="text-sm font-semibold text-slate-950 dark:text-white">
                  Thông báo mới
                </p>
                <p className="mt-1 text-sm leading-6 text-slate-700 dark:text-slate-300">
                  {toastNotification.message}
                </p>
                <div className="mt-3 flex items-center justify-between gap-3">
                  <button
                    type="button"
                    onClick={() => setToastNotification(null)}
                    className="text-xs font-semibold text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white"
                  >
                    Bỏ qua
                  </button>
                  <Link
                    href="/notifications"
                    className="text-xs font-semibold text-blue-600 hover:text-blue-500 dark:text-blue-400 dark:hover:text-blue-300"
                    onClick={() => setToastNotification(null)}
                  >
                    Mở hộp thông báo
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
