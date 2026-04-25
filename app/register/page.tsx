import { RegisterForm } from "@/components/auth/register-form";

export default function RegisterPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full space-y-8 p-8 bg-white rounded-lg shadow">
        <div className="text-center">
          <h2 className="text-3xl font-bold">Dang ky tai khoan</h2>
          <p className="mt-2 text-gray-600">
            Tao tai khoan de bat dau viet blog
          </p>
        </div>
        <RegisterForm />
      </div>
    </div>
  );
}
