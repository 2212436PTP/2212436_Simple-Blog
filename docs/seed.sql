-- ============================================================
--  GenZ.Space — Simple Blog
--  SEED DATA: Dữ liệu mẫu cho môi trường dev / demo
--
--  LƯU Ý QUAN TRỌNG:
--  Script này dùng UUID giả định cho author_id / user_id.
--  Trong Supabase thực tế, auth.users phải tồn tại trước.
--  Hãy thay các UUID sau bằng user thật, hoặc tạo user test
--  qua Supabase Dashboard > Authentication > Users, rồi
--  dùng UUID thật của họ.
--
--  Chạy SCHEMA (schema.sql) trước, sau đó chạy file này.
-- ============================================================


-- ============================================================
-- UUID tham chiếu (thay bằng UUID thật nếu cần)
-- ============================================================
--  User 1 (Thành Phát):  00000000-0000-0000-0000-000000000001
--  User 2 (Minh Tuấn):   00000000-0000-0000-0000-000000000002
--  User 3 (Thanh Lan):   00000000-0000-0000-0000-000000000003
-- ============================================================


-- ============================================================
-- 1. profiles
-- ============================================================
INSERT INTO public.profiles (id, display_name, bio) VALUES
  (
    '00000000-0000-0000-0000-000000000001',
    'Thành Phát',
    'Lập trình viên GenZ yêu thích chia sẻ kiến thức công nghệ.'
  ),
  (
    '00000000-0000-0000-0000-000000000002',
    'Minh Tuấn',
    'Sinh viên CNTT, đam mê AI và Web Development.'
  ),
  (
    '00000000-0000-0000-0000-000000000003',
    'Thanh Lan',
    'Content creator, yêu thích viết về lifestyle và công nghệ.'
  )
ON CONFLICT (id) DO NOTHING;


-- ============================================================
-- 2. posts  (4 published + 1 draft)
-- ============================================================
INSERT INTO public.posts
  (id, author_id, title, slug, summary, content, status, published_at)
VALUES
  -- Post 1
  (
    'aaaaaaaa-0000-0000-0000-000000000001',
    '00000000-0000-0000-0000-000000000001',
    'Bắt đầu với Next.js 16 App Router',
    'bat-dau-voi-nextjs-16-app-router',
    'Hướng dẫn xây dựng ứng dụng web hiện đại với Next.js 16 và App Router từ con số 0.',
    'Next.js 16 mang đến nhiều cải tiến vượt trội so với các phiên bản trước. '
    'App Router cho phép tổ chức route theo thư mục một cách trực quan. '
    'Server Components giúp giảm JavaScript phía client đáng kể. '
    'Trong bài viết này chúng ta sẽ cùng khám phá cách tạo một ứng dụng blog đơn giản từ đầu...',
    'published',
    now() - interval '5 days'
  ),
  -- Post 2
  (
    'aaaaaaaa-0000-0000-0000-000000000002',
    '00000000-0000-0000-0000-000000000001',
    'Supabase Auth: Hướng dẫn tích hợp đăng nhập GitHub OAuth',
    'supabase-auth-huong-dan-tich-hop-github-oauth',
    'Cách tích hợp đăng nhập bằng GitHub vào ứng dụng Next.js sử dụng Supabase Auth.',
    'Supabase cung cấp giải pháp xác thực mạnh mẽ với hỗ trợ nhiều nhà cung cấp OAuth. '
    'GitHub OAuth là lựa chọn phổ biến cho các ứng dụng dành cho developer. '
    'Bài viết sẽ hướng dẫn từng bước cấu hình Supabase Dashboard, '
    'xử lý callback và quản lý session trong Next.js App Router...',
    'published',
    now() - interval '3 days'
  ),
  -- Post 3
  (
    'aaaaaaaa-0000-0000-0000-000000000003',
    '00000000-0000-0000-0000-000000000002',
    'Docker cho dự án Next.js: Tối ưu image với Multi-stage Build',
    'docker-cho-du-an-nextjs-toi-uu-image-multi-stage-build',
    'Cách đóng gói ứng dụng Next.js bằng Docker với kỹ thuật multi-stage build để giảm dung lượng image.',
    'Docker giúp đóng gói ứng dụng nhất quán trên mọi môi trường. '
    'Multi-stage build là kỹ thuật quan trọng giúp giảm kích thước Docker image từ vài GB xuống còn dưới 200MB. '
    'Chúng ta sẽ viết Dockerfile với 3 stage: deps, builder và runner, '
    'kết hợp với output standalone của Next.js...',
    'published',
    now() - interval '1 day'
  ),
  -- Post 4
  (
    'aaaaaaaa-0000-0000-0000-000000000004',
    '00000000-0000-0000-0000-000000000003',
    'Tailwind CSS 4: Những thay đổi nổi bật bạn cần biết',
    'tailwind-css-4-nhung-thay-doi-noi-bat',
    'Tổng hợp các thay đổi quan trọng trong Tailwind CSS v4 so với v3.',
    'Tailwind CSS v4 đánh dấu một bước chuyển lớn với cú pháp cấu hình hoàn toàn mới. '
    'Thay vì tailwind.config.js, giờ đây bạn cấu hình trực tiếp trong CSS với @theme. '
    'Hiệu năng build nhanh hơn đáng kể nhờ engine mới viết bằng Rust...',
    'published',
    now() - interval '2 days'
  ),
  -- Post 5 (draft)
  (
    'aaaaaaaa-0000-0000-0000-000000000005',
    '00000000-0000-0000-0000-000000000001',
    'Bài viết nháp - Triển khai lên DigitalOcean VPS',
    'trien-khai-len-digitalocean-vps-draft',
    'Ghi chú về quy trình deploy ứng dụng lên VPS.',
    'Nội dung đang soạn thảo...',
    'draft',
    NULL
  )
ON CONFLICT (id) DO NOTHING;


-- ============================================================
-- 3. comments
-- ============================================================
INSERT INTO public.comments (id, post_id, author_id, content) VALUES
  (
    'cccccccc-0000-0000-0000-000000000001',
    'aaaaaaaa-0000-0000-0000-000000000001',
    '00000000-0000-0000-0000-000000000002',
    'Bài viết rất hữu ích! Mình đã áp dụng thành công cho dự án của mình rồi 🎉'
  ),
  (
    'cccccccc-0000-0000-0000-000000000002',
    'aaaaaaaa-0000-0000-0000-000000000001',
    '00000000-0000-0000-0000-000000000003',
    'Cảm ơn tác giả, mình đang tìm hiểu về App Router đúng lúc!'
  ),
  (
    'cccccccc-0000-0000-0000-000000000003',
    'aaaaaaaa-0000-0000-0000-000000000002',
    '00000000-0000-0000-0000-000000000002',
    'Phần cấu hình callback URL mình bị lỗi 404, bạn có thể giải thích thêm không?'
  ),
  (
    'cccccccc-0000-0000-0000-000000000004',
    'aaaaaaaa-0000-0000-0000-000000000003',
    '00000000-0000-0000-0000-000000000003',
    'Multi-stage build giúp image của mình nhỏ hơn 60%! Tuyệt vời 🐳'
  )
ON CONFLICT (id) DO NOTHING;


-- ============================================================
-- 4. post_reactions
-- ============================================================
INSERT INTO public.post_reactions (post_id, user_id, reaction) VALUES
  ('aaaaaaaa-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000002', '❤️'),
  ('aaaaaaaa-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000003', '🔥'),
  ('aaaaaaaa-0000-0000-0000-000000000002', '00000000-0000-0000-0000-000000000002', '👍'),
  ('aaaaaaaa-0000-0000-0000-000000000003', '00000000-0000-0000-0000-000000000003', '❤️')
ON CONFLICT (post_id, user_id) DO NOTHING;


-- ============================================================
-- 5. saved_posts
-- ============================================================
INSERT INTO public.saved_posts (user_id, post_id) VALUES
  ('00000000-0000-0000-0000-000000000002', 'aaaaaaaa-0000-0000-0000-000000000001'),
  ('00000000-0000-0000-0000-000000000003', 'aaaaaaaa-0000-0000-0000-000000000002'),
  ('00000000-0000-0000-0000-000000000003', 'aaaaaaaa-0000-0000-0000-000000000003')
ON CONFLICT (user_id, post_id) DO NOTHING;


-- ============================================================
-- 6. notifications
-- ============================================================
INSERT INTO public.notifications
  (user_id, actor_id, type, post_id, comment_id, message)
VALUES
  (
    '00000000-0000-0000-0000-000000000001',
    '00000000-0000-0000-0000-000000000002',
    'comment',
    'aaaaaaaa-0000-0000-0000-000000000001',
    'cccccccc-0000-0000-0000-000000000001',
    'Minh Tuấn đã bình luận vào bài viết của bạn: "Bắt đầu với Next.js 16 App Router"'
  ),
  (
    '00000000-0000-0000-0000-000000000001',
    '00000000-0000-0000-0000-000000000002',
    'reaction',
    'aaaaaaaa-0000-0000-0000-000000000001',
    NULL,
    'Minh Tuấn đã thả ❤️ vào bài viết của bạn: "Bắt đầu với Next.js 16 App Router"'
  )
ON CONFLICT DO NOTHING;


-- ============================================================
-- HOÀN THÀNH — SEED DATA
-- ============================================================
