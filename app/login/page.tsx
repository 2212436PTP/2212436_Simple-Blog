import { LoginForm } from "@/components/auth/login-form";

type SearchParams = Promise<{ message?: string }>;

export default async function LoginPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const params = await searchParams;

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-12 bg-[radial-gradient(circle_at_top,_rgba(59,130,246,0.10),_transparent_38%),linear-gradient(180deg,_#f8fafc_0%,_#eef2ff_100%)] dark:bg-[radial-gradient(circle_at_top,_rgba(96,165,250,0.12),_transparent_35%),linear-gradient(180deg,_#0f172a_0%,_#111827_100%)]">
      <div className="w-full max-w-md space-y-8 rounded-3xl border border-white/60 bg-white/90 p-8 shadow-[0_30px_80px_-40px_rgba(15,23,42,0.45)] backdrop-blur-xl dark:border-slate-700/60 dark:bg-slate-900/85 dark:shadow-[0_30px_80px_-40px_rgba(2,6,23,0.85)]">
        <div className="text-center space-y-2">
          <h2 className="text-3xl font-bold">Đăng nhập</h2>
          <p className="text-gray-600 dark:text-slate-400">
            Đăng nhập để quản lý blog của bạn
          </p>
        </div>

        {params?.message && (
          <div className="rounded-2xl border border-green-200 bg-green-50/90 p-3 text-sm text-green-700 dark:border-green-800/60 dark:bg-green-900/20 dark:text-green-300">
            {params.message}
          </div>
        )}

        <LoginForm />
      </div>
    </div>
  );
}
