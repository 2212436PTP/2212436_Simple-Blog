"use client";

import { useEffect, useState } from "react";

export default function DiagnosticsPage() {
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState<Record<string, any> | null>(null);

  useEffect(() => {
    let mounted = true;

    void (async () => {
      try {
        const res = await fetch("/api/admin/check-db");
        const json = await res.json();
        if (mounted) setStatus(json);
      } catch (err) {
        if (mounted) setStatus({ error: String(err) });
      } finally {
        if (mounted) setLoading(false);
      }
    })();

    return () => {
      mounted = false;
    };
  }, []);

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-4">Diagnostics</h1>

      {loading ? (
        <p>Đang kiểm tra cơ sở dữ liệu...</p>
      ) : status ? (
        <div className="space-y-3">
          <div className="p-4 rounded border bg-white/60 dark:bg-slate-800">
            <strong>post_reactions:</strong>{" "}
            {status.post_reactions ? (
              <span className="text-green-600">Có</span>
            ) : (
              <span className="text-red-600">Không</span>
            )}
            {status.post_reactions_error && (
              <div className="text-xs text-red-500 mt-2">
                {status.post_reactions_error}
              </div>
            )}
          </div>

          <div className="p-4 rounded border bg-white/60 dark:bg-slate-800">
            <strong>profiles:</strong>{" "}
            {status.profiles ? (
              <span className="text-green-600">Có</span>
            ) : (
              <span className="text-red-600">Không</span>
            )}
            {status.profiles_error && (
              <div className="text-xs text-red-500 mt-2">
                {status.profiles_error}
              </div>
            )}
          </div>

          {status.error && (
            <div className="p-4 rounded border bg-yellow-50 text-sm text-rose-700">
              Lỗi: {String(status.error)}
            </div>
          )}
        </div>
      ) : (
        <p>Không có kết quả.</p>
      )}
    </div>
  );
}
