import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { ProfileForm } from "@/components/dashboard/profile-form";

export default async function SettingsPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("display_name, avatar_url")
    .eq("id", user.id)
    .maybeSingle();

  return (
    <main className="mx-auto max-w-3xl px-4 py-10">
      <h1 className="mb-6 text-3xl font-bold text-slate-950 dark:text-white">
        Hồ sơ cá nhân
      </h1>
      <ProfileForm
        displayName={
          profile?.display_name || user.email?.split("@")[0] || "Người dùng"
        }
        avatarUrl={profile?.avatar_url || ""}
      />
    </main>
  );
}
