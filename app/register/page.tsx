import { RegisterForm } from "@/components/auth/register-form";

export default function RegisterPage() {
 return (
 <div className="auth-page-bg min-h-screen flex items-center justify-center px-4 py-12">
 <div className="auth-card w-full max-w-md space-y-8 rounded-3xl p-8 shadow-[0_30px_80px_-40px_rgba(15,23,42,0.45)] backdrop-blur-xl">
 <div className="text-center space-y-2">
 <h2 className="text-3xl font-bold">Đăng ký tài khoản</h2>
 <p className="text-gray-600 ">
 Tạo tài khoản để bắt đầu viết blog
 </p>
 </div>
 <RegisterForm />
 </div>
 </div>
 );
}
