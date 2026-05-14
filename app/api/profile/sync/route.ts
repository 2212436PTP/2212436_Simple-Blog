import { createClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";
import { createClient as createServerClient } from "@/lib/supabase/server";

type SyncBody = {
  displayName?: string;
};

export async function POST(request: Request) {
  const supabase = await createServerClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = (await request.json().catch(() => ({}))) as SyncBody;
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  const displayName =
    (body.displayName ?? "").trim() ||
    user.user_metadata?.display_name ||
    user.email?.split("@")[0] ||
    "Người dùng";

  const client =
    supabaseUrl && serviceRoleKey
      ? createClient(supabaseUrl, serviceRoleKey)
      : supabase;

  // Preserve any avatar already stored in the `profiles` table so we don't
  // overwrite a newly uploaded avatar with stale user metadata.
  const { data: existingProfile } = await client
    .from("profiles")
    .select("avatar_url")
    .eq("id", user.id)
    .maybeSingle();

  const avatarUrl =
    existingProfile?.avatar_url || user.user_metadata?.avatar_url || null;

  const { error } = await client.from("profiles").upsert({
    id: user.id,
    display_name: displayName,
    avatar_url: avatarUrl,
  });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  if (serviceRoleKey && supabaseUrl) {
    await createClient(supabaseUrl, serviceRoleKey).auth.admin.updateUserById(
      user.id,
      {
        user_metadata: {
          ...(user.user_metadata || {}),
          display_name: displayName,
        },
      },
    );
  }

  return NextResponse.json({ ok: true, displayName }, { status: 200 });
}
