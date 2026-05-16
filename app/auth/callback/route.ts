import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get("code");
  const next = requestUrl.searchParams.get("next");

  // Use SITE_URL env var to get the correct public URL when behind a reverse proxy
  // (requestUrl.origin would return http://localhost:3001 behind Nginx/Docker)
  const siteUrl =
    process.env.SITE_URL ||
    `${requestUrl.protocol}//${request.headers.get("x-forwarded-host") || request.headers.get("host") || requestUrl.host}`;

  if (code) {
    try {
      const supabase = await createClient();
      await supabase.auth.exchangeCodeForSession(code);
    } catch (error) {
      console.error("Auth callback error:", error);
      return NextResponse.redirect(`${siteUrl}/login?error=auth_callback_failed`);
    }
  }

  const safeNext = next && next.startsWith("/") ? next : "/dashboard";
  return NextResponse.redirect(`${siteUrl}${safeNext}`);
}
