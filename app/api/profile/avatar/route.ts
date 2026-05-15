import { createClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";
import { createClient as createServerClient } from "@/lib/supabase/server";

const BUCKET_NAME = "avatars";

export async function POST(request: Request) {
 const supabase = await createServerClient();

 const {
 data: { user },
 } = await supabase.auth.getUser();

 if (!user) {
 return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
 }

 const formData = await request.formData();
 const file = formData.get("file");

 if (!(file instanceof File)) {
 return NextResponse.json({ error: "Thiếu file ảnh" }, { status: 400 });
 }

 if (!file.type.startsWith("image/")) {
 return NextResponse.json(
 { error: "Tệp tải lên phải là ảnh" },
 { status: 400 },
 );
 }

 const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
 const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

 if (!supabaseUrl || !serviceRoleKey) {
 return NextResponse.json(
 { error: "Thiếu cấu hình upload ảnh đại diện" },
 { status: 500 },
 );
 }

 const admin = createClient(supabaseUrl, serviceRoleKey);
 const { error: bucketError } = await admin.storage.createBucket(BUCKET_NAME, {
 public: true,
 });

 if (
 bucketError &&
 !bucketError.message.toLowerCase().includes("already exists")
 ) {
 return NextResponse.json({ error: bucketError.message }, { status: 400 });
 }

 const path = `${user.id}/${Date.now()}-${file.name.replace(/[^a-zA-Z0-9.\-_]/g, "_")}`;
 const arrayBuffer = await file.arrayBuffer();
 const buffer = Buffer.from(arrayBuffer);

 const { error: uploadError } = await admin.storage
 .from(BUCKET_NAME)
 .upload(path, buffer, {
 contentType: file.type,
 upsert: true,
 });

 if (uploadError) {
 return NextResponse.json({ error: uploadError.message }, { status: 400 });
 }

 const { data } = admin.storage.from(BUCKET_NAME).getPublicUrl(path);

 const { error: profileError } = await admin.from("profiles").upsert({
 id: user.id,
 avatar_url: data.publicUrl,
 display_name:
 user.user_metadata?.display_name ||
 user.email?.split("@")[0] ||
 "Người dùng",
 });

 if (profileError) {
 return NextResponse.json({ error: profileError.message }, { status: 400 });
 }

 await admin.auth.admin.updateUserById(user.id, {
 user_metadata: {
 ...(user.user_metadata || {}),
 avatar_url: data.publicUrl,
 },
 });

 return NextResponse.json({ url: data.publicUrl }, { status: 200 });
}
