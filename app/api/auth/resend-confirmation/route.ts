import { createClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";

type ResendBody = {
  email?: string;
};

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as ResendBody;
    const email = (body.email ?? "").trim().toLowerCase();

    if (!email) {
      return NextResponse.json(
        { error: "Dia chi email la bat buoc." },
        { status: 400 },
      );
    }

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    if (!supabaseUrl || !anonKey) {
      return NextResponse.json(
        { error: "Thieu bien moi truong Supabase." },
        { status: 500 },
      );
    }

    const supabase = createClient(supabaseUrl, anonKey);
    console.log("[resend confirmation] attempting for", email);

    const { error } = await supabase.auth.resend({
      type: "signup",
      email,
    });

    if (error) {
      console.error("[resend confirmation] error:", error);
      return NextResponse.json(
        { error: error.message || "Khong the gui lai email xac nhan." },
        { status: 400 },
      );
    }

    console.log("[resend confirmation] success for", email);
    return NextResponse.json(
      { ok: true, message: "Email xac nhan da duoc gui." },
      { status: 200 },
    );
  } catch (err) {
    console.error("[resend confirmation] unexpected error:", err);
    return NextResponse.json(
      { error: "Có lỗi xảy ra. Vui lòng thử lại sau." },
      { status: 500 },
    );
  }
}
