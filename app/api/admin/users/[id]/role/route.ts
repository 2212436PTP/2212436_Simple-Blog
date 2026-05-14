import { NextResponse } from "next/server";
import { createClient as createAdminClient } from "@supabase/supabase-js";
import { createClient as createServerClient } from "@/lib/supabase/server";

function getAdminClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !serviceRoleKey) {
    return null;
  }

  return createAdminClient(supabaseUrl, serviceRoleKey);
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const supabase = await createServerClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (user.user_metadata?.role !== "admin") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { id } = await params;
  const body = (await request.json().catch(() => null)) as {
    role?: string;
  } | null;

  if (body?.role !== "admin" && body?.role !== "user") {
    return NextResponse.json({ error: "Role không hợp lệ" }, { status: 400 });
  }

  const admin = getAdminClient();

  if (!admin) {
    return NextResponse.json(
      { error: "Missing service role key" },
      { status: 500 },
    );
  }

  const { data: existingUser, error: fetchError } =
    await admin.auth.admin.getUserById(id);

  if (fetchError || !existingUser.user) {
    return NextResponse.json(
      { error: fetchError?.message || "User not found" },
      { status: 404 },
    );
  }

  const nextMetadata = {
    ...(existingUser.user.user_metadata || {}),
    role: body.role,
  };

  const { error } = await admin.auth.admin.updateUserById(id, {
    user_metadata: nextMetadata,
  });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  return NextResponse.json({ ok: true }, { status: 200 });
}
