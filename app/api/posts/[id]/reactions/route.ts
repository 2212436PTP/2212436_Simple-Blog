import { createClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";
import { createClient as createServerClient } from "@/lib/supabase/server";
import { createNotification } from "@/lib/notifications";

type ReactionKey = "like" | "love" | "wow" | "haha" | "sad";

const VALID_REACTIONS: ReactionKey[] = ["like", "love", "wow", "haha", "sad"];

function isReactionKey(value: unknown): value is ReactionKey {
  return typeof value === "string" && VALID_REACTIONS.includes(value as ReactionKey);
}

function getAdminClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !serviceRoleKey) {
    return null;
  }

  return createClient(supabaseUrl, serviceRoleKey);
}

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const supabase = await createServerClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const client = getAdminClient() || supabase;
  const { data, error } = await client
    .from("post_reactions")
    .select("reaction, user_id")
    .eq("post_id", id);

  // If table doesn't exist or other error, return empty counts
  if (error) {
    console.warn("[GET /api/posts/:id/reactions] Error:", error.message);
    return NextResponse.json(
      { counts: { like: 0, love: 0, wow: 0, haha: 0, sad: 0 }, selected: null },
      { status: 200 },
    );
  }

  const counts = VALID_REACTIONS.reduce(
    (accumulator, reaction) => {
      accumulator[reaction] = 0;
      return accumulator;
    },
    {} as Record<ReactionKey, number>,
  );

  let selected: ReactionKey | null = null;

  for (const row of data || []) {
    if (isReactionKey(row.reaction)) {
      counts[row.reaction] += 1;
      if (user && row.user_id === user.id) {
        selected = row.reaction;
      }
    }
  }

  return NextResponse.json({ counts, selected }, { status: 200 });
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const supabase = await createServerClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = (await request.json().catch(() => null)) as {
    reaction?: ReactionKey;
  } | null;

  if (!body?.reaction || !VALID_REACTIONS.includes(body.reaction)) {
    return NextResponse.json({ error: "Invalid reaction" }, { status: 400 });
  }

  const client = getAdminClient() || supabase;
  const { data: post } = await client
    .from("posts")
    .select("id, author_id, title")
    .eq("id", id)
    .maybeSingle();

  const { data: existing, error: readError } = await client
    .from("post_reactions")
    .select("reaction")
    .eq("post_id", id)
    .eq("user_id", user.id)
    .maybeSingle();

  if (readError) {
    console.warn(
      `[POST /api/posts/:id/reactions] read error (post_reactions):`,
      readError.message,
    );
    // Likely the `post_reactions` table does not exist. Return a clear
    // message so developers can create the table in Supabase.
    return NextResponse.json(
      {
        error:
          "Reactions feature is not available: 'post_reactions' table missing. Create the table in Supabase to enable reactions.",
      },
      { status: 400 },
    );
  }

  if (existing?.reaction === body.reaction) {
    const { error: deleteError } = await client
      .from("post_reactions")
      .delete()
      .eq("post_id", id)
      .eq("user_id", user.id);

    if (deleteError) {
      return NextResponse.json({ error: deleteError.message }, { status: 400 });
    }
  } else {
    const { error: upsertError } = await client.from("post_reactions").upsert({
      post_id: id,
      user_id: user.id,
      reaction: body.reaction,
    });

    if (upsertError) {
      return NextResponse.json({ error: upsertError.message }, { status: 400 });
    }

    if (post && post.author_id !== user.id) {
      const { data: profile } = await client
        .from("profiles")
        .select("display_name")
        .eq("id", user.id)
        .maybeSingle();

      await createNotification({
        userId: post.author_id,
        actorId: user.id,
        type: "reaction",
        postId: post.id,
        reaction: body.reaction,
        message: `${profile?.display_name || user.email?.split("@")[0] || "Ai đó"} đã thả ${body.reaction} cho bài viết của bạn: ${post.title}`,
      });
    }
  }

  return NextResponse.json({ ok: true }, { status: 200 });
}
