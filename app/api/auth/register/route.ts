import { createClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";

type RegisterBody = {
 email?: string;
 password?: string;
 displayName?: string;
};

const DEFAULT_RATE_LIMIT_SECONDS = 60;

function isRateLimitError(message: string) {
 return message.toLowerCase().includes("rate limit");
}

export async function POST(request: Request) {
 try {
 const body = (await request.json()) as RegisterBody;
 console.log("[register API] incoming body:", JSON.stringify(body));
 const email = (body.email ?? "").trim().toLowerCase();
 const password = (body.password ?? "").trim();
 const displayName = (body.displayName ?? "").trim();

 if (!email || !password || !displayName) {
 return NextResponse.json(
 { error: "Thiếu thông tin đăng ký." },
 { status: 400 },
 );
 }

 if (password.length < 6) {
 return NextResponse.json(
 { error: "Mật khẩu phải có ít nhất 6 ký tự." },
 { status: 400 },
 );
 }

 const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
 const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

 if (!supabaseUrl || !anonKey) {
 return NextResponse.json(
 { error: "Thiếu biến môi trường Supabase." },
 { status: 500 },
 );
 }

 const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

 // Use service role key to create user with email auto-confirmed (no email confirmation needed)
 if (serviceRoleKey) {
 const admin = createClient(supabaseUrl, serviceRoleKey);
 console.log(
 "[register API] using admin.createUser with email_confirm: true",
 );
 const { data: created, error: adminError } =
 await admin.auth.admin.createUser({
 email,
 password,
 email_confirm: true,
 user_metadata: { display_name: displayName, role: "user" },
 });

 if (adminError) {
 console.error("[register API] admin.createUser error:", adminError);
 return NextResponse.json(
 { error: adminError.message },
 { status: 400 },
 );
 }

 console.log("[register API] admin.createUser success", {
 user: created.user?.id,
 });
 await admin.from("profiles").upsert({
 id: created.user?.id,
 display_name: displayName,
 avatar_url: null,
 });
 return NextResponse.json(
 { ok: true, user: created.user },
 { status: 200 },
 );
 }

 // Fallback: normal signUp (email confirmation will be required by Supabase)
 const supabase = createClient(supabaseUrl, anonKey);
 console.log("[register API] attempting signUp for", email);
 const { data, error } = await supabase.auth.signUp({
 email,
 password,
 options: {
 data: { display_name: displayName },
 },
 });

 if (!error) {
 console.log("[register API] signUp success", { user: data.user?.id });
 return NextResponse.json({ ok: true, user: data.user }, { status: 200 });
 }

 // Only use the service role fallback in non-production environments
 // to avoid accidentally creating users with elevated privileges in prod.
 if (isRateLimitError(error.message)) {
 const retryAfterSeconds = DEFAULT_RATE_LIMIT_SECONDS;

 if (serviceRoleKey && process.env.NODE_ENV !== "production") {
 const admin = createClient(supabaseUrl, serviceRoleKey);
 console.log(
 "[register API] rate limit detected, attempting admin.createUser fallback",
 );
 const { data: created, error: adminError } =
 await admin.auth.admin.createUser({
 email,
 password,
 email_confirm: true,
 user_metadata: {
 display_name: displayName,
 role: "user",
 },
 });

 if (adminError) {
 console.error("[register API] admin.createUser error:", adminError);
 return NextResponse.json(
 {
 error: adminError.message,
 retryAfterSeconds,
 },
 { status: 429 },
 );
 }

 console.log("[register API] admin.createUser success", {
 user: created.user?.id,
 });
 await admin.from("profiles").upsert({
 id: created.user?.id,
 display_name: displayName,
 avatar_url: null,
 });
 return NextResponse.json(
 {
 ok: true,
 user: created.user,
 bypassedRateLimit: true,
 },
 { status: 200 },
 );
 }

 console.error("[register API] signUp rate limit error:", error);
 return NextResponse.json(
 {
 error: error.message,
 retryAfterSeconds,
 },
 { status: 429 },
 );
 }

 console.error("[register API] signUp error:", error);
 return NextResponse.json({ error: error.message }, { status: 400 });
 } catch (err) {
 console.error("[register API] unexpected error:", err);
 return NextResponse.json(
 { error: "Không thể xử lý yêu cầu đăng ký.", details: String(err) },
 { status: 500 },
 );
 }
}
