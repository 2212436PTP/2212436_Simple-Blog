-- PostgreSQL / Supabase migration
-- Adds anonymous-post support, a per-post comments toggle, and notifications.

CREATE EXTENSION
IF NOT EXISTS pgcrypto;

ALTER TABLE public.posts
  ADD COLUMN
IF NOT EXISTS is_anonymous boolean NOT NULL DEFAULT false,
ADD COLUMN
IF NOT EXISTS comments_enabled boolean NOT NULL DEFAULT true;

CREATE TABLE
IF NOT EXISTS public.notifications
(
  id uuid PRIMARY KEY DEFAULT gen_random_uuid
(),
  user_id uuid NOT NULL,
  actor_id uuid NOT NULL,
  type text NOT NULL CHECK
(type IN
('comment', 'reaction')),
  post_id uuid NOT NULL REFERENCES public.posts
(id) ON
DELETE CASCADE,
  comment_id uuid
NULL REFERENCES public.comments
(id) ON
DELETE CASCADE,
  reaction text
NULL,
  message text NOT NULL,
  read_at timestamptz NULL,
  created_at timestamptz NOT NULL DEFAULT now
()
);

CREATE INDEX
IF NOT EXISTS idx_notifications_user_id_created_at
  ON public.notifications
(user_id, created_at DESC);

CREATE INDEX
IF NOT EXISTS idx_notifications_user_id_read_at
  ON public.notifications
(user_id, read_at);
