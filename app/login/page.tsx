import { LoginForm } from "@/components/auth/login-form";

type SearchParams = Promise<{ message?: string }>;

export default async function LoginPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const params = await searchParams;

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-10 sm:px-6 sm:py-12 bg-[radial-gradient(circle_at_top,rgba(59,130,246,0.10),transparent_38%),linear-gradient(180deg,#f8fafc_0%,#eef2ff_100%)] ">
      <div className="w-full max-w-md space-y-6 rounded-3xl border border-white/60 bg-white/90 p-6 shadow-[0_30px_80px_-40px_rgba(15,23,42,0.45)] backdrop-blur-xl sm:max-w-lg sm:space-y-8 sm:p-8">
        <div className="text-center space-y-2">
          <h2 className="text-2xl font-bold sm:text-3xl">Đăng nhập</h2>
          <p className="text-sm text-gray-600 sm:text-base">
            Đăng nhập để quản lý blog của bạn
          </p>
        </div>

        {params?.message && (
          <div className="rounded-2xl border border-green-200 bg-green-50/90 p-3 text-sm text-green-700 sm:text-base">
            {params.message}
          </div>
        )}

        <LoginForm />
      </div>
    </div>
  );
}
