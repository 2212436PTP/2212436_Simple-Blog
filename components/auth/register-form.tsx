"use client";

import { useEffect, useState, type FormEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

const REGISTER_COOLDOWN_SECONDS = 3;

function getCooldownKey(email: string): string {
  return `registerCooldownUntil_${btoa(email)}`;
}

function getCooldownForEmail(email: string): number {
  if (!email.trim()) return 0;
  try {
    const key = getCooldownKey(email);
    const stored = localStorage.getItem(key);
    if (stored) {
      const until = Number(stored);
      const diff = Math.ceil((until - Date.now()) / 1000);
      if (diff > 0) return diff;
      localStorage.removeItem(key);
    }
  } catch {
    // ignore
  }
  return 0;
}

function mapRegisterError(message: string) {
  if (message.toLowerCase().includes("rate limit")) {
    return {
      text: "Bạn vừa gửi quá nhanh. Vui lòng chờ một lúc rồi thử lại.",
      isRateLimit: true,
    };
  }

  return {
    text: message,
    isRateLimit: false,
  };
}

type ApiPayload = {
  ok?: boolean;
  user?: Record<string, unknown>;
  error?: string;
  message?: string;
  details?: string;
  raw?: string;
  bypassedRateLimit?: boolean;
  retryAfterSeconds?: number;
};

export function RegisterForm() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [cooldownSeconds, setCooldownSeconds] = useState<number>(0);

  // Countdown timer
  useEffect(() => {
    if (cooldownSeconds <= 0) return;

    const timer = window.setInterval(() => {
      setCooldownSeconds((prev) => {
        if (prev <= 1) {
          window.clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => window.clearInterval(timer);
  }, [cooldownSeconds]);

  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newEmail = e.target.value;
    setEmail(newEmail);
    // Check cooldown for the new email immediately
    const cooldown = getCooldownForEmail(newEmail);
    setCooldownSeconds(cooldown > 0 ? cooldown : 0);
  };

  const handleRegister = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    // Check cooldown for current email before validating
    const currentCooldown = getCooldownForEmail(email);
    if (currentCooldown > 0) {
      setError(`Vui lòng đợi ${currentCooldown}s trước khi thử lại.`);
      setCooldownSeconds(currentCooldown);
      setLoading(false);
      return;
    }

    if (cooldownSeconds > 0) {
      setError(`Vui lòng đợi ${cooldownSeconds}s trước khi thử lại.`);
      setLoading(false);
      return;
    }

    // Normalize and validate email
    const cleanedEmail = email
      .trim()
      .replace(/^['"`]+|['"`]+$/g, "")
      .toLowerCase();
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(cleanedEmail)) {
      setError("Địa chỉ email không hợp lệ.");
      setLoading(false);
      return;
    }

    let response: Response | null = null;
    let payload: ApiPayload | null = null;
    let rawText = "";

    try {
      response = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: cleanedEmail, password, displayName }),
      });

      rawText = await response.text().catch(() => "");
      try {
        payload = rawText ? (JSON.parse(rawText) as ApiPayload) : null;
      } catch {
        payload = { raw: rawText };
      }
    } catch (fetchErr) {
      console.error("Register fetch failed:", fetchErr);
      setError("Không thể kết nối đến server. Vui lòng thử lại sau.");
      setLoading(false);
      return;
    }

    if (!response.ok) {
      const raw =
        payload?.error ??
        payload?.message ??
        payload?.details ??
        payload?.raw ??
        rawText ??
        response.statusText ??
        "Có lỗi xảy ra.";
      console.warn("Register API error details:", {
        status: response.status,
        statusText: response.statusText,
        contentType: response.headers.get("content-type"),
        payload,
        rawText,
      });

      const mapped = mapRegisterError(raw ?? "Có lỗi xảy ra.");
      setError(mapped.text);
      if (mapped.isRateLimit) {
        try {
          const retryAfterSeconds = Math.min(
            Math.max(Number(payload?.retryAfterSeconds || 0), 1),
            REGISTER_COOLDOWN_SECONDS,
          );
          const until = Date.now() + retryAfterSeconds * 1000;
          localStorage.setItem(getCooldownKey(cleanedEmail), String(until));
          setCooldownSeconds(retryAfterSeconds);
          setError(
            `Bạn vừa gửi quá nhanh. Vui lòng đợi ${retryAfterSeconds}s rồi thử lại.`,
          );
        } catch {
          setCooldownSeconds(REGISTER_COOLDOWN_SECONDS);
          setError(
            `Bạn vừa gửi quá nhanh. Vui lòng đợi ${REGISTER_COOLDOWN_SECONDS}s rồi thử lại.`,
          );
          try {
            localStorage.setItem(
              getCooldownKey(cleanedEmail),
              String(Date.now() + REGISTER_COOLDOWN_SECONDS * 1000),
            );
          } catch {}
        }
      }

      setLoading(false);
      return;
    }

    // success
    if (payload?.ok) {
      try {
        localStorage.removeItem(getCooldownKey(cleanedEmail));
      } catch {}
      router.push(`/login?registered=1`);
      setLoading(false);
      return;
    }

    // unexpected payload
    const raw =
      payload?.error ??
      payload?.message ??
      payload?.details ??
      payload?.raw ??
      rawText ??
      "Có lỗi xảy ra.";
    console.warn("Register API unexpected payload:", {
      status: response?.status,
      statusText: response?.statusText,
      contentType: response?.headers.get("content-type"),
      payload,
      rawText,
    });
    const mapped = mapRegisterError(raw ?? "Có lỗi xảy ra.");
    setError(mapped.text);
    setLoading(false);
  };

  return (
    <form onSubmit={handleRegister} noValidate className="mt-8 space-y-6">
      {error && (
        <div className="bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400 p-4 rounded-lg text-sm border border-red-200 dark:border-red-800">
          {error}
          {cooldownSeconds > 0 && (
            <p className="mt-2 text-xs text-red-600 dark:text-red-300">
              Bạn có thể thử lại sau {cooldownSeconds}s.
            </p>
          )}
        </div>
      )}

      <div className="space-y-4">
        <div>
          <label
            htmlFor="displayName"
            className="block text-sm font-semibold text-gray-700 dark:text-gray-300"
          >
            Tên hiển thị
          </label>
          <input
            id="displayName"
            type="text"
            value={displayName}
            onChange={(e) => setDisplayName(e.target.value)}
            required
            className="mt-2 block w-full px-4 py-2 border border-gray-300 dark:border-slate-600 rounded-lg shadow-sm bg-white dark:bg-slate-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="Nguyễn Văn A"
          />
        </div>

        <div>
          <label
            htmlFor="email"
            className="block text-sm font-semibold text-gray-700 dark:text-gray-300"
          >
            Email
          </label>
          <input
            id="email"
            type="text"
            inputMode="email"
            autoComplete="email"
            value={email}
            onChange={handleEmailChange}
            required
            className="mt-2 block w-full px-4 py-2 border border-gray-300 dark:border-slate-600 rounded-lg shadow-sm bg-white dark:bg-slate-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="email@example.com"
          />
        </div>

        <div>
          <label
            htmlFor="password"
            className="block text-sm font-semibold text-gray-700 dark:text-gray-300"
          >
            Mật khẩu
          </label>
          <input
            id="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            minLength={6}
            className="mt-2 block w-full px-4 py-2 border border-gray-300 dark:border-slate-600 rounded-lg shadow-sm bg-white dark:bg-slate-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="••••••••"
          />
          <p className="mt-2 text-xs text-gray-500 dark:text-gray-400">
            Tối thiểu 6 ký tự
          </p>
        </div>
      </div>

      <button
        type="submit"
        disabled={loading || cooldownSeconds > 0}
        className="w-full flex justify-center py-3 px-4 rounded-lg shadow-md text-base font-semibold text-white bg-linear-to-r from-blue-600 to-purple-600 hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
      >
        {loading
          ? "Đang xử lý..."
          : cooldownSeconds > 0
            ? `Tạm khóa ${cooldownSeconds}s`
            : "Đăng ký"}
      </button>

      {cooldownSeconds > 0 ? (
        <div className="text-center space-y-3 bg-yellow-50 dark:bg-yellow-900/20 p-4 rounded-lg border border-yellow-200 dark:border-yellow-800">
          <p className="text-sm font-medium text-yellow-800 dark:text-yellow-300">
            Tài khoản tạm khóa. Vui lòng đợi {cooldownSeconds}s rồi thử lại.
          </p>
          <button
            type="button"
            onClick={() => {
              try {
                localStorage.removeItem(getCooldownKey(email));
                setCooldownSeconds(0);
                setError(null);
              } catch {}
            }}
            className="text-sm text-blue-600 dark:text-blue-400 hover:text-blue-500 dark:hover:text-blue-300 underline font-semibold"
          >
            Xóa tạm khóa cho email này
          </button>
        </div>
      ) : (
        <p className="text-xs text-gray-600 dark:text-gray-400 text-center">
          Đăng ký nhanh: chỉ cần email và mật khẩu 6+ ký tự.
        </p>
      )}

      <p className="text-center text-xs text-gray-600 dark:text-gray-400">
        Nếu đã từng đăng ký email này, bạn có thể dùng{" "}
        <Link
          href="/forgot-password"
          className="text-blue-600 dark:text-blue-400 hover:text-blue-500 dark:hover:text-blue-300 underline"
        >
          quên mật khẩu
        </Link>
        .
      </p>

      <p className="text-center text-sm text-gray-700 dark:text-gray-300">
        Đã có tài khoản?{" "}
        <Link
          href="/login"
          className="text-blue-600 dark:text-blue-400 hover:text-blue-500 dark:hover:text-blue-300 font-semibold"
        >
          Đăng nhập
        </Link>
      </p>
    </form>
  );
}
