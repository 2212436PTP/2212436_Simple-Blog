export type PostStatus = "draft" | "published";

export interface Profile {
  id: string;
  display_name: string | null;
  avatar_url: string | null;
  created_at: string;
  updated_at: string;
}

export interface Post {
  id: string;
  author_id: string;
  title: string;
  slug: string;
  content: string | null;
  excerpt: string | null;
  image_url: string | null;
  status: PostStatus;
  is_anonymous: boolean;
  comments_enabled: boolean;
  created_at: string;
  updated_at: string;
  published_at: string | null;
  profiles?: Profile;
}

export interface Comment {
  id: string;
  post_id: string;
  author_id: string;
  content: string;
  created_at: string;
  parent_id?: string | null;
  profiles?: Profile;
  replies?: Comment[];
  reaction_count?: number;
  user_reacted?: boolean;
}

export interface CommentReaction {
  id: string;
  comment_id: string;
  user_id: string;
  reaction: string;
  created_at: string;
}

export interface Notification {
  id: string;
  user_id: string;
  actor_id: string;
  type: "comment" | "reaction";
  post_id: string;
  comment_id: string | null;
  reaction: string | null;
  message: string;
  read_at: string | null;
  created_at: string;
}
