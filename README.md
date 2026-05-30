# GenZ.Space — Simple Blog

Nền tảng blog cộng đồng dành cho GenZ, cho phép đăng bài, bình luận, react và lưu bài viết yêu thích.

## Tech Stack

| Thành phần | Công nghệ |
|-----------|-----------|
| Framework | Next.js (App Router) |
| Database & Auth | Supabase (PostgreSQL + Auth) |
| Styling | Tailwind CSS |
| Ngôn ngữ | TypeScript |
| Deploy | Docker / Vercel |

## Tính năng chính

- 🔐 Đăng ký / Đăng nhập (Email + GitHub OAuth)
- ✍️ Viết và quản lý bài viết (published / draft)
- 💬 Bình luận và reply theo thread
- ❤️ React bài viết và bình luận
- 🔔 Thông báo real-time
- 🔖 Lưu bài viết yêu thích
- 👤 Trang cá nhân người dùng
- 🕶️ Đăng bài ẩn danh

## Cài đặt & Chạy thử

### 1. Clone và cài dependencies

```bash
git clone <repo-url>
cd simple-blog
npm install
```

### 2. Cấu hình biến môi trường

```bash
cp .env.local.example .env.local
```

Mở `.env.local` và điền thông tin Supabase của bạn:

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-public-anon-key
# Tuỳ chọn — chỉ dùng khi dev local
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
```

> Lấy key tại: Supabase Dashboard → Project Settings → API

### 3. Khởi tạo Database

Chạy các script sau trong **Supabase SQL Editor** theo thứ tự:

1. `docs/schema.sql` — Tạo bảng, Index, RLS Policies, Storage Buckets
2. `docs/seed.sql` _(tuỳ chọn)_ — Thêm dữ liệu mẫu để demo

### 4. Chạy Development Server

```bash
npm run dev
```

Mở [http://localhost:3000](http://localhost:3000) để xem kết quả.

### 5. Build Production

```bash
npm run build
npm run start
```

## Chạy bằng Docker

```bash
docker-compose up --build
```

## Cấu trúc thư mục

```
simple-blog/
├── app/                  # Next.js App Router pages
│   ├── (auth)/           # Login, Register
│   ├── blog/             # Danh sách bài viết
│   ├── posts/            # Chi tiết & tạo bài viết
│   └── profile/          # Trang cá nhân
├── components/           # React components dùng chung
├── lib/                  # Supabase client, utilities
├── types/                # TypeScript type definitions
├── migrations/           # Lịch sử migration DB
├── docs/
│   ├── schema.sql        # Script tạo DB (schema thực tế)
│   └── seed.sql          # Dữ liệu mẫu
└── public/               # Static assets
```

## Tài khoản test (sau khi chạy seed.sql)

> Seed data chỉ là dữ liệu giả. Tạo tài khoản mới qua trang `/register`.

## Supabase Service Role Key

Nếu gặp lỗi `email rate limit exceeded` khi đăng ký trong môi trường dev:

1. Copy `.env.local.example` → `.env.local`
2. Điền `SUPABASE_SERVICE_ROLE_KEY` (chỉ dùng local, **không commit**)

Fallback này chỉ kích hoạt khi `NODE_ENV !== "production"`.

---

*Dự án được phát triển cho môn học tại Đại học Đà Lạt.*
