"use client";

import { useEffect, useState, type FormEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

const REGISTER_COOLDOWN_SECONDS = 60;

function mapRegisterError(message: string) {
  if (message.toLowerCase().includes("rate limit")) {
    return {
      text: "Ban vua gui qua nhieu yeu cau. Vui long doi 60 giay roi thu lai.",
      isRateLimit: true,
    };
  }

  return {
    text: message,
    isRateLimit: false,
  };
}

export function RegisterForm() {
  const router = useRouter();
  const supabase = createClient();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [cooldownSeconds, setCooldownSeconds] = useState(0);

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

  const handleRegister = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            display_name: displayName,
          },
        },
      });

      if (error) {
        const mapped = mapRegisterError(error.message);
        setError(mapped.text);
        if (mapped.isRateLimit) {
          setCooldownSeconds(REGISTER_COOLDOWN_SECONDS);
        }
        return;
      }

      if (data.user) {
        router.push(
          "/login?message=Dang ky thanh cong! Vui long kiem tra email de xac nhan.",
        );
      }
    } catch {
      setError("Co loi xay ra. Vui long thu lai.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleRegister} className="mt-8 space-y-6">
      {error && (
        <div className="bg-red-50 text-red-500 p-3 rounded-md text-sm">
          {error}
          {cooldownSeconds > 0 && (
            <p className="mt-2 text-xs text-red-400">
              Ban co the thu lai sau {cooldownSeconds}s.
            </p>
          )}
        </div>
      )}

      <div className="space-y-4">
        <div>
          <label
            htmlFor="displayName"
            className="block text-sm font-medium text-gray-700"
          >
            Ten hien thi
          </label>
          <input
            id="displayName"
            type="text"
            value={displayName}
            onChange={(e) => setDisplayName(e.target.value)}
            required
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            placeholder="Nguyen Van A"
          />
        </div>

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
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            placeholder="email@example.com"
          />
        </div>

        <div>
          <label
            htmlFor="password"
            className="block text-sm font-medium text-gray-700"
          >
            Mat khau
          </label>
          <input
            id="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            minLength={6}
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            placeholder="••••••••"
          />
          <p className="mt-1 text-xs text-gray-500">Toi thieu 6 ky tu</p>
        </div>
      </div>

      <button
        type="submit"
        disabled={loading || cooldownSeconds > 0}
        className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {loading
          ? "Dang xu ly..."
          : cooldownSeconds > 0
            ? `Thu lai sau ${cooldownSeconds}s`
            : "Dang ky"}
      </button>

      <p className="text-center text-xs text-gray-500">
        Neu da tung dang ky email nay, ban co the dung{" "}
        <Link
          href="/forgot-password"
          className="text-blue-600 hover:text-blue-500"
        >
          quen mat khau
        </Link>
        .
      </p>

      <p className="text-center text-sm text-gray-600">
        Da co tai khoan?{" "}
        <Link href="/login" className="text-blue-600 hover:text-blue-500">
          Dang nhap
        </Link>
      </p>
    </form>
  );
}
