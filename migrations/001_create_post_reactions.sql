-- PostgreSQL / Supabase migration
-- Creates the table used to store one reaction per user per post.

CREATE TABLE
IF NOT EXISTS public.post_reactions
(
  post_id uuid NOT NULL REFERENCES public.posts
(id) ON
DELETE CASCADE,
  user_id uuid
NOT NULL,
  reaction text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now
(),
  PRIMARY KEY
(post_id, user_id)
);

CREATE INDEX
IF NOT EXISTS idx_post_reactions_post_id
  ON public.post_reactions
(post_id);

CREATE INDEX
IF NOT EXISTS idx_post_reactions_reaction
  ON public.post_reactions
(reaction);
