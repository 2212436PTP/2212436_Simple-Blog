import { createClient } from "@supabase/supabase-js";

export type NotificationType = "comment" | "reaction";

function getAdminClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !serviceRoleKey) {
    return null;
  }

  return createClient(supabaseUrl, serviceRoleKey);
}

export async function createNotification(input: {
  userId: string;
  actorId: string;
  type: NotificationType;
  postId: string;
  message: string;
  commentId?: string | null;
  reaction?: string | null;
}) {
  const admin = getAdminClient();

  if (!admin) {
    return { ok: false as const, error: "Missing service role key" };
  }

  const { error } = await admin.from("notifications").insert({
    user_id: input.userId,
    actor_id: input.actorId,
    type: input.type,
    post_id: input.postId,
    comment_id: input.commentId ?? null,
    reaction: input.reaction ?? null,
    message: input.message,
  });

  if (error) {
    return { ok: false as const, error: error.message };
  }

  return { ok: true as const };
}
