import { ForgotPasswordForm } from "@/components/auth/forgot-password-form";

export default function ForgotPasswordPage() {
  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-10 sm:px-6 sm:py-12 bg-[radial-gradient(circle_at_top,rgba(59,130,246,0.10),transparent_38%),linear-gradient(180deg,#f8fafc_0%,#eef2ff_100%)] -[radial-gradient(circle_at_top,_rgba(96,165,250,0.12),_transparent_35%),linear-gradient(180deg,_#0f172a_0%,_#111827_100%)]">
      <div className="w-full max-w-md space-y-6 rounded-3xl border border-white/60 bg-white/90 p-6 shadow-[0_30px_80px_-40px_rgba(15,23,42,0.45)] backdrop-blur-xl sm:max-w-lg sm:space-y-8 sm:p-8">
        <div className="text-center space-y-2">
          <h2 className="text-2xl font-bold sm:text-3xl">Quên mật khẩu</h2>
          <p className="text-sm text-gray-600 sm:text-base">
            Nhập email để nhận link đặt lại mật khẩu
          </p>
        </div>
        <ForgotPasswordForm />
      </div>
    </div>
  );
}
