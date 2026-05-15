import { createClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";

export async function GET() {
 const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
 const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

 if (!supabaseUrl || !serviceRoleKey) {
 return NextResponse.json(
 {
 error:
 "SUPABASE_SERVICE_ROLE_KEY or NEXT_PUBLIC_SUPABASE_URL not configured",
 },
 { status: 500 },
 );
 }

 const admin = createClient(supabaseUrl, serviceRoleKey);

 const result: Record<string, any> = {};

 try {
 // Check post_reactions
 const { error: prError } = await admin
 .from("post_reactions")
 .select("post_id", { head: true, count: "exact" });

 result.post_reactions = prError ? false : true;
 } catch (err) {
 result.post_reactions = false;
 result.post_reactions_error = String(err);
 }

 try {
 const { error: profilesError } = await admin
 .from("profiles")
 .select("id", { head: true, count: "exact" });

 result.profiles = profilesError ? false : true;
 } catch (err) {
 result.profiles = false;
 result.profiles_error = String(err);
 }

 return NextResponse.json(result, { status: 200 });
}
