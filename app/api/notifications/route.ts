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

export async function GET() {
 const supabase = await createServerClient();

 const {
 data: { user },
 } = await supabase.auth.getUser();

 if (!user) {
 return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
 }

 const admin = getAdminClient() || supabase;

 const [{ data: notifications, error }, unreadCountResult] = await Promise.all(
 [
 admin
 .from("notifications")
 .select("*")
 .eq("user_id", user.id)
 .order("created_at", { ascending: false })
 .limit(20),
 admin
 .from("notifications")
 .select("id", { count: "exact", head: true })
 .eq("user_id", user.id)
 .is("read_at", null),
 ],
 );

 if (error) {
 return NextResponse.json({ error: error.message }, { status: 400 });
 }

 return NextResponse.json(
 {
 notifications: notifications || [],
 unreadCount: unreadCountResult.count ?? 0,
 },
 { status: 200 },
 );
}

export async function PATCH() {
 const supabase = await createServerClient();

 const {
 data: { user },
 } = await supabase.auth.getUser();

 if (!user) {
 return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
 }

 const admin = getAdminClient() || supabase;

 const { error } = await admin
 .from("notifications")
 .update({ read_at: new Date().toISOString() })
 .eq("user_id", user.id)
 .is("read_at", null);

 if (error) {
 return NextResponse.json({ error: error.message }, { status: 400 });
 }

 return NextResponse.json({ ok: true }, { status: 200 });
}
