"use client";

import { useEffect, useRef } from "react";
import { createClient } from "@/lib/supabase/client";

interface ViewCounterProps {
  postId: string;
}

/** Silently increments views on mount; renders nothing visible.
 *  Requires the `views` column on posts table (see SQL migration). */
export function ViewCounter({ postId }: ViewCounterProps) {
  const called = useRef(false);
  const supabase = createClient();

  useEffect(() => {
    if (called.current) return;
    called.current = true;

    // Use rpc to increment safely — falls back gracefully if function missing
    void (async () => {
      try {
        await supabase.rpc("increment_post_views", { post_id: postId });
      } catch {
        // Silently ignore if function doesn't exist yet
      }
    })();
  }, [postId, supabase]);

  return null;
}
