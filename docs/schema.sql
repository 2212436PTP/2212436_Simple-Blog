-- ============================================================
--  GenZ.Space — Simple Blog
--  SCHEMA: Tạo bảng, Index, RLS Policies, Storage Bucket
--  Chạy script này trong Supabase > SQL Editor
-- ============================================================


-- ============================================================
-- PHẦN 1: CÁC EXTENSIONS CẦN THIẾT
-- ============================================================
CREATE EXTENSION IF NOT EXISTS pgcrypto;


-- ============================================================
-- PHẦN 2: TẠO CÁC BẢNG CHÍNH
-- ============================================================

-- ----------------------------------------------------------
-- Bảng 1: profiles
-- Lưu thông tin hiển thị của người dùng (liên kết auth.users)
-- ----------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.profiles (
  id            uuid        PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  display_name  text        NOT NULL DEFAULT '',
  avatar_url    text        NULL,
  created_at    timestamptz NOT NULL DEFAULT now(),
  updated_at    timestamptz NOT NULL DEFAULT now()
);

-- ----------------------------------------------------------
-- Bảng 2: posts
-- Lưu bài viết của người dùng
-- ----------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.posts (
  id               uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  author_id        uuid        NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title            text        NOT NULL,
  slug             text        NOT NULL UNIQUE,
  excerpt          text        NULL,                         -- tóm tắt ngắn
  content          text        NOT NULL DEFAULT '',
  image_url        text        NULL,                         -- ảnh bìa bài viết
  status           text        NOT NULL DEFAULT 'draft'
                               CHECK (status IN ('draft', 'published')),
  is_anonymous     boolean     NOT NULL DEFAULT false,
  comments_enabled boolean     NOT NULL DEFAULT true,
  views            integer     NOT NULL DEFAULT 0,           -- lượt xem
  published_at     timestamptz NULL,
  created_at       timestamptz NOT NULL DEFAULT now(),
  updated_at       timestamptz NOT NULL DEFAULT now()
);

-- ----------------------------------------------------------
-- Bảng 3: comments
-- Lưu bình luận theo từng bài viết (hỗ trợ thread / reply)
-- ----------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.comments (
  id         uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id    uuid        NOT NULL REFERENCES public.posts(id) ON DELETE CASCADE,
  author_id  uuid        NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  content    text        NOT NULL,
  parent_id  uuid        NULL REFERENCES public.comments(id) ON DELETE CASCADE,  -- reply
  created_at timestamptz NOT NULL DEFAULT now()
);

-- ----------------------------------------------------------
-- Bảng 4: post_reactions
-- Mỗi user chỉ được 1 reaction / bài viết
-- ----------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.post_reactions (
  post_id    uuid  NOT NULL REFERENCES public.posts(id) ON DELETE CASCADE,
  user_id    uuid  NOT NULL,
  reaction   text  NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (post_id, user_id)
);

-- ----------------------------------------------------------
-- Bảng 5: comment_reactions
-- Reaction trên bình luận
-- ----------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.comment_reactions (
  id         uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  comment_id uuid        NOT NULL REFERENCES public.comments(id) ON DELETE CASCADE,
  user_id    uuid        NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  reaction   text        NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (comment_id, user_id)
);

-- ----------------------------------------------------------
-- Bảng 6: notifications
-- Thông báo khi có comment / reaction trên bài viết
-- ----------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.notifications (
  id         uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id    uuid        NOT NULL,
  actor_id   uuid        NOT NULL,
  type       text        NOT NULL CHECK (type IN ('comment', 'reaction')),
  post_id    uuid        NOT NULL REFERENCES public.posts(id) ON DELETE CASCADE,
  comment_id uuid        NULL REFERENCES public.comments(id) ON DELETE CASCADE,
  reaction   text        NULL,
  message    text        NOT NULL,
  read_at    timestamptz NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- ----------------------------------------------------------
-- Bảng 7: saved_posts
-- Cho phép user lưu bài viết yêu thích
-- ----------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.saved_posts (
  id         uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id    uuid        NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  post_id    uuid        NOT NULL REFERENCES public.posts(id) ON DELETE CASCADE,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, post_id)
);


-- ============================================================
-- PHẦN 3: INDEX TỐI ƯU TRUY VẤN
-- ============================================================

-- posts
CREATE INDEX IF NOT EXISTS idx_posts_author_id        ON public.posts(author_id);
CREATE INDEX IF NOT EXISTS idx_posts_status           ON public.posts(status);
CREATE INDEX IF NOT EXISTS idx_posts_slug             ON public.posts(slug);
CREATE INDEX IF NOT EXISTS idx_posts_published_at     ON public.posts(published_at DESC);
CREATE INDEX IF NOT EXISTS idx_posts_views            ON public.posts(views DESC);

-- comments
CREATE INDEX IF NOT EXISTS idx_comments_post_id       ON public.comments(post_id);
CREATE INDEX IF NOT EXISTS idx_comments_author_id     ON public.comments(author_id);
CREATE INDEX IF NOT EXISTS idx_comments_parent_id     ON public.comments(parent_id);  -- thread

-- post_reactions
CREATE INDEX IF NOT EXISTS idx_post_reactions_post_id  ON public.post_reactions(post_id);
CREATE INDEX IF NOT EXISTS idx_post_reactions_reaction ON public.post_reactions(reaction);

-- comment_reactions
CREATE INDEX IF NOT EXISTS idx_comment_reactions_comment_id ON public.comment_reactions(comment_id);

-- notifications
CREATE INDEX IF NOT EXISTS idx_notifications_user_id_created_at
  ON public.notifications(user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_notifications_user_id_read_at
  ON public.notifications(user_id, read_at);

-- saved_posts
CREATE INDEX IF NOT EXISTS idx_saved_posts_user_id    ON public.saved_posts(user_id);


-- ============================================================
-- PHẦN 4: ROW LEVEL SECURITY (RLS)
-- ============================================================

-- Enable RLS
ALTER TABLE public.profiles          ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.posts             ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.comments          ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.post_reactions    ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.comment_reactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications     ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.saved_posts       ENABLE ROW LEVEL SECURITY;

-- ---- profiles ----
CREATE POLICY "Profiles are viewable by everyone"
  ON public.profiles FOR SELECT USING (true);

CREATE POLICY "Users can update own profile"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile"
  ON public.profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

-- ---- posts ----
CREATE POLICY "Published posts are viewable by everyone"
  ON public.posts FOR SELECT
  USING (status = 'published' OR auth.uid() = author_id);

CREATE POLICY "Authors can insert own posts"
  ON public.posts FOR INSERT
  WITH CHECK (auth.uid() = author_id);

CREATE POLICY "Authors can update own posts"
  ON public.posts FOR UPDATE
  USING (auth.uid() = author_id);

CREATE POLICY "Authors can delete own posts"
  ON public.posts FOR DELETE
  USING (auth.uid() = author_id);

-- ---- comments ----
CREATE POLICY "Comments are viewable by everyone"
  ON public.comments FOR SELECT USING (true);

CREATE POLICY "Authenticated users can insert comments"
  ON public.comments FOR INSERT
  WITH CHECK (auth.uid() = author_id);

CREATE POLICY "Authors can delete own comments"
  ON public.comments FOR DELETE
  USING (auth.uid() = author_id);

-- ---- post_reactions ----
CREATE POLICY "Post reactions viewable by everyone"
  ON public.post_reactions FOR SELECT USING (true);

CREATE POLICY "Authenticated users can react to posts"
  ON public.post_reactions FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own post reaction"
  ON public.post_reactions FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own post reaction"
  ON public.post_reactions FOR DELETE
  USING (auth.uid() = user_id);

-- ---- comment_reactions ----
CREATE POLICY "Comment reactions viewable by everyone"
  ON public.comment_reactions FOR SELECT USING (true);

CREATE POLICY "Authenticated users can react to comments"
  ON public.comment_reactions FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own comment reaction"
  ON public.comment_reactions FOR DELETE
  USING (auth.uid() = user_id);

-- ---- notifications ----
CREATE POLICY "Users can view own notifications"
  ON public.notifications FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update own notifications"
  ON public.notifications FOR UPDATE
  USING (auth.uid() = user_id);

-- ---- saved_posts ----
CREATE POLICY "Users can view own saved posts"
  ON public.saved_posts FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can save posts"
  ON public.saved_posts FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can unsave posts"
  ON public.saved_posts FOR DELETE
  USING (auth.uid() = user_id);


-- ============================================================
-- PHẦN 5: STORAGE BUCKETS
-- ============================================================

-- Bucket cho ảnh đại diện người dùng
INSERT INTO storage.buckets (id, name, public)
VALUES ('avatars', 'avatars', true)
ON CONFLICT (id) DO NOTHING;

-- Bucket cho ảnh bìa bài viết (tên thực tế trên Supabase)
INSERT INTO storage.buckets (id, name, public)
VALUES ('blog-images', 'blog-images', true)
ON CONFLICT (id) DO NOTHING;

-- ---- Storage RLS: avatars ----
CREATE POLICY "Avatar images are publicly viewable"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'avatars');

CREATE POLICY "Users can upload own avatar"
  ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'avatars' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can update own avatar"
  ON storage.objects FOR UPDATE
  USING (bucket_id = 'avatars' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can delete own avatar"
  ON storage.objects FOR DELETE
  USING (bucket_id = 'avatars' AND auth.uid()::text = (storage.foldername(name))[1]);

-- ---- Storage RLS: blog-images ----
CREATE POLICY "Blog images are publicly viewable"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'blog-images');

CREATE POLICY "Authors can upload blog image"
  ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'blog-images' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Authors can update own blog image"
  ON storage.objects FOR UPDATE
  USING (bucket_id = 'blog-images' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Authors can delete own blog image"
  ON storage.objects FOR DELETE
  USING (bucket_id = 'blog-images' AND auth.uid()::text = (storage.foldername(name))[1]);

-- ============================================================
-- HOÀN THÀNH — SCHEMA
-- ============================================================
