import { ForgotPasswordForm } from "@/components/auth/forgot-password-form";

export default function ForgotPasswordPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full space-y-8 p-8 bg-white rounded-lg shadow">
        <div className="text-center">
          <h2 className="text-3xl font-bold">Quen mat khau</h2>
          <p className="mt-2 text-gray-600">
            Nhap email de nhan link dat lai mat khau
          </p>
        </div>
        <ForgotPasswordForm />
      </div>
    </div>
  );
}
