"use client";

import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";

interface ProfileFormProps {
  displayName: string;
  avatarUrl: string;
}

export function ProfileForm({ displayName, avatarUrl }: ProfileFormProps) {
  const router = useRouter();
  const [name, setName] = useState(displayName);
  const [preview, setPreview] = useState(avatarUrl);
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selected = event.target.files?.[0];
    if (!selected) return;

    if (!selected.type.startsWith("image/")) {
      setError("Vui lòng chọn một tệp ảnh.");
      return;
    }

    setFile(selected);
    setError(null);

    const reader = new FileReader();
    reader.onload = () => {
      setPreview(String(reader.result || ""));
    };
    reader.readAsDataURL(selected);
  };

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setError(null);
    setSuccess(null);
    setLoading(true);

    try {
      if (file) {
        const formData = new FormData();
        formData.append("file", file);

        const response = await fetch("/api/profile/avatar", {
          method: "POST",
          body: formData,
        });

        const payload = (await response.json().catch(() => null)) as {
          error?: string;
        } | null;

        if (!response.ok) {
          throw new Error(payload?.error || "Không thể upload ảnh đại diện");
        }
      }

      const syncResponse = await fetch("/api/profile/sync", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ displayName: name }),
      });

      if (!syncResponse.ok) {
        const payload = (await syncResponse.json().catch(() => null)) as {
          error?: string;
        } | null;
        throw new Error(payload?.error || "Không thể đồng bộ hồ sơ");
      }

      setSuccess("Đã cập nhật hồ sơ.");
      setFile(null);
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Có lỗi xảy ra");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-6 rounded-3xl border border-slate-200 bg-white/80 p-6 shadow-sm backdrop-blur dark:border-slate-700 dark:bg-slate-900/70"
    >
      {error && (
        <div className="rounded-2xl border border-red-200 bg-red-50 p-3 text-sm text-red-700 dark:border-red-900 dark:bg-red-900/20 dark:text-red-200">
          {error}
        </div>
      )}

      {success && (
        <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-3 text-sm text-emerald-700 dark:border-emerald-900 dark:bg-emerald-900/20 dark:text-emerald-200">
          {success}
        </div>
      )}

      <div>
        <label className="mb-2 block text-sm font-medium text-slate-700 dark:text-slate-300">
          Tên hiển thị
        </label>
        <input
          value={name}
          onChange={(event) => setName(event.target.value)}
          className="w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-slate-900 outline-none focus:border-blue-500 dark:border-slate-700 dark:bg-slate-950 dark:text-white"
          placeholder="Tên của bạn"
        />
      </div>

      <div>
        <label className="mb-2 block text-sm font-medium text-slate-700 dark:text-slate-300">
          Ảnh đại diện
        </label>
        <div className="mb-4 flex items-center gap-4">
          <div className="h-20 w-20 overflow-hidden rounded-full border border-slate-200 bg-slate-100 dark:border-slate-700 dark:bg-slate-800">
            {preview ? (
              <img
                src={preview}
                alt="Avatar preview"
                className="h-full w-full object-cover"
              />
            ) : (
              <div className="flex h-full w-full items-center justify-center text-lg font-semibold text-slate-500">
                {name?.[0]?.toUpperCase() || "U"}
              </div>
            )}
          </div>
          <div className="flex-1">
            <input
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              className="block w-full text-sm text-slate-600 file:mr-4 file:rounded-full file:border-0 file:bg-blue-600 file:px-4 file:py-2 file:text-white hover:file:bg-blue-700 dark:text-slate-300"
            />
            <p className="mt-2 text-xs text-slate-500 dark:text-slate-400">
              JPG, PNG, GIF. Ảnh đại diện sẽ hiển thị ở header và bình luận.
            </p>
          </div>
        </div>
      </div>

      <button
        type="submit"
        disabled={loading}
        className="rounded-2xl bg-linear-to-r from-blue-600 to-purple-600 px-5 py-3 font-semibold text-white shadow-md transition-all hover:shadow-lg disabled:cursor-not-allowed disabled:opacity-50"
      >
        {loading ? "Đang lưu..." : "Lưu hồ sơ"}
      </button>
    </form>
  );
}
