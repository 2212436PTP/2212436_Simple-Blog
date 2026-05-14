import { NextResponse } from "next/server";
import { createClient as createAdminClient } from "@supabase/supabase-js";

/**
 * ADMIN SETUP ENDPOINT
 *
 * WARNING: This endpoint allows assigning admin role to a user by email.
 * In production, remove this endpoint and manage admin roles through Supabase console only.
 *
 * Usage:
 *   POST /api/admin/setup
 *   Body: { email: "user@example.com", role: "admin" }
 *
 * Returns: { ok: true } or error
 */

function getAdminClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !serviceRoleKey) {
    return null;
  }

  return createAdminClient(supabaseUrl, serviceRoleKey);
}

export async function POST(request: Request) {
  const admin = getAdminClient();

  if (!admin) {
    return NextResponse.json(
      { error: "Missing SUPABASE_SERVICE_ROLE_KEY" },
      { status: 500 },
    );
  }

  const body = (await request.json().catch(() => null)) as {
    email?: string;
    role?: string;
  } | null;

  if (!body?.email || !body?.role) {
    return NextResponse.json(
      { error: "Missing email or role in request body" },
      { status: 400 },
    );
  }

  if (body.role !== "admin" && body.role !== "user") {
    return NextResponse.json(
      { error: "Role must be 'admin' or 'user'" },
      { status: 400 },
    );
  }

  // Find user by email
  const { data: usersData, error: listError } =
    await admin.auth.admin.listUsers();

  if (listError || !usersData?.users) {
    return NextResponse.json(
      { error: listError?.message || "Failed to list users" },
      { status: 400 },
    );
  }

  const user = usersData.users.find((u) => u.email === body.email);

  if (!user) {
    return NextResponse.json(
      { error: `User with email "${body.email}" not found` },
      { status: 404 },
    );
  }

  // Update user metadata with role
  const { error } = await admin.auth.admin.updateUserById(user.id, {
    user_metadata: {
      ...(user.user_metadata || {}),
      role: body.role,
    },
  });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  return NextResponse.json(
    {
      ok: true,
      userId: user.id,
      email: user.email,
      role: body.role,
      message: `User ${body.email} is now ${body.role}`,
    },
    { status: 200 },
  );
}
