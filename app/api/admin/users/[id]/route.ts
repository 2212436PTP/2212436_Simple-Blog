import { NextResponse } from "next/server";
import { createClient as createAdminClient } from "@supabase/supabase-js";
import { createClient as createServerClient } from "@/lib/supabase/server";

async function requireAdmin() {
 const supabase = await createServerClient();

 const {
 data: { user },
 } = await supabase.auth.getUser();

 if (!user) {
 return {
 error: NextResponse.json({ error: "Unauthorized" }, { status: 401 }),
 };
 }

 if (user.user_metadata?.role !== "admin") {
 return {
 error: NextResponse.json({ error: "Forbidden" }, { status: 403 }),
 };
 }

 return { supabase, user };
}

function getAdminClient() {
 const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
 const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

 if (!supabaseUrl || !serviceRoleKey) {
 return null;
 }

 return createAdminClient(supabaseUrl, serviceRoleKey);
}

export async function DELETE(
 _request: Request,
 { params }: { params: Promise<{ id: string }> },
) {
 const auth = await requireAdmin();
 if ("error" in auth) return auth.error;

 const { id } = await params;
 const admin = getAdminClient();

 if (!admin) {
 return NextResponse.json(
 { error: "Missing service role key" },
 { status: 500 },
 );
 }

 const { error } = await admin.auth.admin.deleteUser(id);

 if (error) {
 return NextResponse.json({ error: error.message }, { status: 400 });
 }

 await admin.from("profiles").delete().eq("id", id);

 return NextResponse.json({ ok: true }, { status: 200 });
}
