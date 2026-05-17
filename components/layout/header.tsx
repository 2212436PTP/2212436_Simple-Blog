"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { logout } from "@/app/actions/auth";

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
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [toastNotification, setToastNotification] =
    useState<HeaderNotification | null>(null);
  const [mounted, setMounted] = useState(false);
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

  const navLinkClass =
    "relative font-semibold text-slate-600 hover:text-violet-600 transition-colors after:absolute after:bottom-[-2px] after:left-0 after:h-0.5 after:w-0 hover:after:w-full after:transition-all after:duration-300 after:rounded-full" +
    " " + "after:bg-gradient-to-r after:from-violet-600 after:to-pink-500";
  const mobileNavLinkClass =
    "block w-full px-4 py-3 text-left font-semibold text-slate-700 hover:bg-violet-50 hover:text-violet-700 rounded-xl transition-colors";

  return (
    <header
      className="sticky top-0 z-50"
      style={{
        background: "rgba(255,255,255,0.85)",
        backdropFilter: "blur(20px)",
        WebkitBackdropFilter: "blur(20px)",
        borderBottom: "1px solid rgba(124,58,237,0.1)",
        boxShadow: "0 1px 32px rgba(124,58,237,0.07)",
      }}
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <Link
            href="/"
            className="shrink-0 text-xl font-extrabold tracking-tight transition-opacity hover:opacity-80"
          >
            <span className="bg-gradient-to-r from-blue-600 via-purple-500 to-pink-500 bg-clip-text text-transparent animate-gradient">
              GenZ.Space
            </span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-4 lg:gap-6">
            <Link href="/" className={navLinkClass}>
              Trang chủ
            </Link>
            {user ? (
              <>
                <div className="hidden items-center gap-2 rounded-full border border-gray-200 bg-white px-3 py-1.5 text-sm text-gray-700 shadow-sm lg:flex">
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
                  <span className="max-w-28 truncate font-medium">
                    {displayName}
                  </span>
                </div>
                <Link href="/dashboard" className={navLinkClass}>
                  Bảng điều khiển
                </Link>
                <Link href="/dashboard/settings" className={navLinkClass}>
                  Hồ sơ
                </Link>
                <button
                  type="button"
                  onClick={() => setNotificationOpen((value) => !value)}
                  className={`relative ${navLinkClass}`}
                >
                  Thông báo
                  {unreadNotifications > 0 && (
                    <span className="absolute -right-3 -top-2 flex h-5 min-w-5 items-center justify-center rounded-full bg-red-600 px-1 text-[10px] font-bold text-white animate-bounce">
                      {unreadNotifications}
                    </span>
                  )}
                </button>
                {user.user_metadata?.role === "admin" && (
                  <Link href="/admin" className={navLinkClass}>
                    Admin
                  </Link>
                )}
                <form action={logout}>
                  <button
                    type="submit"
                    className="font-medium text-gray-700 transition-colors hover:text-red-600"
                  >
                    Đăng xuất
                  </button>
                </form>
              </>
            ) : (
              <>
                <Link href="/login" className={navLinkClass}>
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
          </nav>

          {/* Mobile: Right side controls */}
          <div className="flex items-center gap-3 md:hidden">
            {/* Notification badge on mobile */}
            {user && unreadNotifications > 0 && (
              <button
                type="button"
                onClick={() => setNotificationOpen((v) => !v)}
                className="relative p-1 text-gray-600"
              >
                <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                </svg>
                <span className="absolute -right-1 -top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-red-600 px-0.5 text-[9px] font-bold text-white animate-bounce">
                  {unreadNotifications}
                </span>
              </button>
            )}

            {/* Hamburger button */}
            <button
              type="button"
              onClick={() => setMobileMenuOpen((v) => !v)}
              className="rounded-lg p-2 text-gray-600 hover:bg-gray-100 hover:text-gray-900 transition-colors"
              aria-label="Toggle mobile menu"
            >
              {mobileMenuOpen ? (
                <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              ) : (
                <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu Dropdown */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-gray-100 bg-white shadow-lg animate-slide-down">
          <div className="mx-auto max-w-7xl px-4 py-3 space-y-1">
            {user && (
              <div className="flex items-center gap-3 px-4 py-3 mb-2 bg-blue-50 rounded-xl">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center overflow-hidden rounded-full bg-blue-600 text-sm font-bold text-white">
                  {avatarUrl ? (
                    <img src={avatarUrl} alt={displayName} className="h-full w-full object-cover" />
                  ) : (
                    displayName[0]?.toUpperCase() || "U"
                  )}
                </div>
                <div>
                  <p className="font-semibold text-slate-900 text-sm">{displayName}</p>
                  <p className="text-xs text-slate-500">Đang đăng nhập</p>
                </div>
              </div>
            )}

            <Link href="/" className={mobileNavLinkClass} onClick={() => setMobileMenuOpen(false)}>
              🏠 Trang chủ
            </Link>

            {user ? (
              <>
                <Link href="/dashboard" className={mobileNavLinkClass} onClick={() => setMobileMenuOpen(false)}>
                  📊 Bảng điều khiển
                </Link>
                <Link href="/dashboard/settings" className={mobileNavLinkClass} onClick={() => setMobileMenuOpen(false)}>
                  👤 Hồ sơ
                </Link>
                <Link href="/notifications" className={mobileNavLinkClass} onClick={() => setMobileMenuOpen(false)}>
                  🔔 Thông báo
                  {unreadNotifications > 0 && (
                    <span className="ml-2 inline-flex items-center justify-center rounded-full bg-red-600 px-2 py-0.5 text-[10px] font-bold text-white">
                      {unreadNotifications}
                    </span>
                  )}
                </Link>
                {user.user_metadata?.role === "admin" && (
                  <Link href="/admin" className={mobileNavLinkClass} onClick={() => setMobileMenuOpen(false)}>
                    ⚙️ Admin
                  </Link>
                )}
                <div className="pt-2 border-t border-gray-100">
                  <form action={logout}>
                    <button
                      type="submit"
                      className="block w-full px-4 py-3 text-left font-medium text-red-600 hover:bg-red-50 rounded-xl transition-colors"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      🚪 Đăng xuất
                    </button>
                  </form>
                </div>
              </>
            ) : (
              <div className="flex flex-col gap-2 pt-2">
                <Link
                  href="/login"
                  className="block w-full px-4 py-3 text-center font-medium text-gray-700 border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Đăng nhập
                </Link>
                <Link
                  href="/register"
                  className="block w-full px-4 py-3 text-center font-medium text-white bg-blue-600 rounded-xl hover:bg-blue-700 transition-colors"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Đăng ký
                </Link>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Notification Panel (Desktop) */}
      {notificationOpen && user && (
        <div className="absolute right-4 top-17 z-50 w-[calc(100vw-2rem)] max-w-sm rounded-2xl border border-slate-200 bg-white p-4 shadow-2xl sm:right-6 sm:w-88">
          <div className="mb-3 flex items-center justify-between gap-3">
            <div>
              <p className="text-sm font-semibold text-slate-950">
                Thông báo gần đây
              </p>
              <p className="text-xs text-slate-500">
                Xem nhanh mà không cần chuyển trang
              </p>
            </div>
            <button
              type="button"
              onClick={() => setNotificationOpen(false)}
              className="rounded-full px-2 py-1 text-xs font-semibold text-slate-500 hover:bg-slate-100 hover:text-slate-900"
            >
              Đóng
            </button>
          </div>

          {latestNotifications.length === 0 ? (
            <p className="rounded-xl border border-dashed border-slate-200 px-4 py-3 text-sm text-slate-500">
              Chưa có thông báo nào.
            </p>
          ) : (
            <div className="max-h-80 space-y-2 overflow-auto pr-1">
              {latestNotifications.slice(0, 5).map((notification) => (
                <div
                  key={notification.id}
                  className={`rounded-xl border px-3 py-2 text-sm ${
                    notification.read_at
                      ? "border-slate-200 bg-slate-50 text-slate-700"
                      : "border-blue-200 bg-blue-50 text-slate-900"
                  }`}
                >
                  <p className="leading-6">{notification.message}</p>
                  <p className="mt-1 text-[11px] text-slate-500">
                    {new Date(notification.created_at).toLocaleString("vi-VN")}
                  </p>
                </div>
              ))}
            </div>
          )}

          <div className="mt-4 flex items-center justify-between gap-3">
            <Link
              href="/notifications"
              className="text-sm font-semibold text-blue-600 hover:text-blue-500"
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
                className="text-sm font-semibold text-slate-600 hover:text-slate-900"
              >
                Đánh dấu đã đọc
              </button>
            )}
          </div>
        </div>
      )}

      {/* Toast Notification */}
      {toastNotification && (
        <div className="pointer-events-none fixed right-4 top-20 z-60 w-[calc(100vw-2rem)] max-w-sm sm:right-6 sm:top-24">
          <div className="pointer-events-auto rounded-2xl border border-blue-200 bg-white p-4 shadow-2xl ring-1 ring-blue-100">
            <div className="flex items-start gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-blue-600 text-white">
                !
              </div>
              <div className="flex-1">
                <p className="text-sm font-semibold text-slate-950">
                  Thông báo mới
                </p>
                <p className="mt-1 text-sm leading-6 text-slate-700">
                  {toastNotification.message}
                </p>
                <div className="mt-3 flex items-center justify-between gap-3">
                  <button
                    type="button"
                    onClick={() => setToastNotification(null)}
                    className="text-xs font-semibold text-slate-500 hover:text-slate-900"
                  >
                    Bỏ qua
                  </button>
                  <Link
                    href="/notifications"
                    className="text-xs font-semibold text-blue-600 hover:text-blue-500"
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
