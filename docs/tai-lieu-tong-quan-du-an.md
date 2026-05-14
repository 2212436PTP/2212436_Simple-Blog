# Tài liệu tổng quan dự án cá nhân - Simple Blog

## 1) Tổng quan dự án

Simple Blog là ứng dụng blog cá nhân được xây dựng bằng Next.js (App Router) kết hợp Supabase cho xác thực, lưu trữ dữ liệu và đồng bộ session. Dự án hướng đến việc cho phép người dùng đăng ký/đăng nhập, viết bài, chỉnh sửa, xóa bài, đọc bài và bình luận.

Phần front-end được triển khai bằng React + Tailwind CSS. Phần back-end được thực hiện theo mô hình BaaS thông qua Supabase (Auth + Postgres + API).

## 2) Mục tiêu dự án

### 2.1 Mục tiêu tổng quát

- Xây dựng một hệ thống blog gọn nhẹ, dễ sử dụng, phục vụ nhu cầu viết và quản lý nội dung cá nhân.
- Tổ chức hệ thống theo hướng fullstack hiện đại (SSR/CSR kết hợp), tối ưu trải nghiệm người dùng.
- Đảm bảo các luồng nghiệp vụ cơ bản của một nền tảng blog: auth, CRUD bài viết, đọc bài, bình luận.

### 2.2 Mục tiêu cụ thể

- Cho phép đăng ký tài khoản và đăng nhập an toàn với Supabase Auth.
- Hỗ trợ khôi phục mật khẩu qua email.
- Quản lý bài viết theo trạng thái (draft/published).
- Hiển thị danh sách bài viết đã xuất bản có phân trang.
- Hỗ trợ bình luận trên bài viết.
- Bảo vệ các route quản trị, chặn truy cập trái phép.
- Cung cấp UX rõ ràng khi gặp lỗi xác thực (rate limit, email chưa xác nhận, sai thông tin đăng nhập).

## 3) Phạm vi và đối tượng sử dụng

### 3.1 Phạm vi chức năng

- Public: xem trang chủ, xem bài viết đã xuất bản.
- User đã đăng nhập: vào dashboard, tạo/sửa/xóa bài viết, bình luận.
- Auth flow: đăng ký, đăng nhập, đăng xuất, quên mật khẩu, callback OAuth.

### 3.2 Đối tượng sử dụng

- Người viết blog cá nhân.
- Người đọc có nhu cầu xem bài viết và thảo luận thông qua bình luận.

## 4) Công nghệ và kiến trúc

### 4.1 Công nghệ chính

- Next.js 16 (App Router)
- React 19
- TypeScript
- Tailwind CSS 4
- Supabase SSR + Supabase JS

### 4.2 Kiến trúc tổng thể

- Presentation layer: các page và component trong `app/` và `components/`.
- Application layer: form handlers, route handlers, server actions.
- Data/Auth layer: Supabase (Auth + Postgres).

### 4.3 Dữ liệu cốt lõi

- `profiles`: thông tin hiển thị người dùng (display_name, avatar_url).
- `posts`: bài viết, liên kết `author_id`, có `status` (draft/published), `slug`, `published_at`.
- `comments`: bình luận theo `post_id`, `author_id`.

## 5) Phân tích chức năng theo module

### 5.1 Module xác thực và tài khoản

#### Đăng ký

- Form đăng ký gồm: tên hiển thị, email, mật khẩu.
- Có chuẩn hóa email trước khi gửi lên server.
- Có cơ chế cooldown theo từng email trên client (localStorage) để UX rõ ràng khi bị rate limit.
- API `POST /api/auth/register` xử lý đăng ký và map lỗi.
- Hiện tại route đăng ký có nhánh tạo user bằng admin key nếu có `SUPABASE_SERVICE_ROLE_KEY`.

#### Đăng nhập

- Đăng nhập email/mật khẩu qua Supabase `signInWithPassword`.
- Hỗ trợ OAuth với GitHub.
- Có map lỗi thân thiện (email chưa xác nhận, thông tin đăng nhập không đúng).

#### Quên mật khẩu

- Gửi email reset password qua Supabase `resetPasswordForEmail`.
- Redirect về callback route sau khi click link reset.

#### Đăng xuất

- Sử dụng server action để signOut và redirect về login.

### 5.2 Module bảo vệ route và session

- Middleware cập nhật session và xử lý redirect theo trạng thái đăng nhập.
- Route được bảo vệ: `/dashboard`.
- Nếu chưa đăng nhập mà vào dashboard -> redirect `/login`.
- Nếu đã đăng nhập mà vào `/login` hoặc `/register` -> redirect `/dashboard`.

### 5.3 Module quản lý bài viết (Dashboard)

#### Danh sách bài viết của tôi

- Lấy bài viết theo `author_id` của user đang nhập.
- Sắp xếp theo ngày tạo mới nhất.

#### Tạo bài viết

- Nhập tiêu đề, tóm tắt, nội dung, trạng thái.
- Tự động tạo `slug` từ tiêu đề (xử lý bỏ dấu và ký tự đặc biệt).
- Nếu chọn `published` thì gán `published_at`.

#### Sửa bài viết

- Chỉ cho phép sửa bài viết của chính user (`author_id = user.id`).
- Nếu không tìm thấy hoặc không đúng quyền -> notFound.

#### Xóa bài viết

- Có hộp thoại xác nhận trước khi xóa.
- Sau xóa refresh lại danh sách.

### 5.4 Module hiển thị bài viết công khai

- Trang chủ lấy bài viết đã xuất bản (`status = published`) và phân trang.
- Chi tiết bài viết theo `slug`, hiển thị metadata tác giả và ngày xuất bản.
- Render nội dung dạng plain text theo đoạn văn.

### 5.5 Module bình luận

- Chỉ user đã đăng nhập mới có thể gửi bình luận.
- Lấy danh sách bình luận theo `post_id`, sắp xếp theo thời gian tăng dần.
- Có component realtime comments (lắng nghe sự kiện insert từ Supabase Realtime).

### 5.6 Module email verification / resend

- Có trang hướng dẫn xác nhận email: `/confirm-email`.
- Có API `POST /api/auth/resend-confirmation` để gửi lại email xác nhận.
- Callback route `/auth/callback` exchange code thành session, sau đó redirect theo `next`.

## 6) Luồng nghiệp vụ chính

### Luồng A: Đăng ký -> Đăng nhập

1. User nhập thông tin đăng ký.
2. Client gọi API đăng ký.
3. Server tạo user qua Supabase.
4. User chuyển sang đăng nhập.
5. Nếu tài khoản hợp lệ và đã đủ điều kiện xác thực, hệ thống tạo session và vào dashboard.

### Luồng B: Tạo bài viết mới

1. User đăng nhập vào dashboard.
2. Chọn "Viết bài mới".
3. Nhập dữ liệu bài viết và lưu.
4. Hệ thống tạo bài viết trong bảng `posts`.
5. Quay lại dashboard để xem kết quả.

### Luồng C: Đọc bài và bình luận

1. Người dùng mở bài viết công khai.
2. Nếu đã đăng nhập có thể gửi bình luận.
3. Bình luận mới được thêm vào `comments`.
4. Danh sách bình luận cập nhật và hiển thị.

## 7) Đánh giá điểm mạnh hiện tại

- Cấu trúc rõ ràng theo App Router, tách page/component hợp lý.
- Tích hợp Supabase SSR đúng hướng cho auth/session.
- Có middleware bảo vệ route quản trị.
- CRUD bài viết đầy đủ, có phân trang trang chủ.
- UX auth được cải thiện (map lỗi, cooldown, thông điệp hướng dẫn).

## 8) Hạn chế và rủi ro cần lưu ý

- Có 2 bộ thư mục song song `lib/` và `src/lib/` (tương tự với `types/` và `src/types/`), dễ gây nhầm lẫn nếu mở rộng codebase.
- Đăng ký hiện tại có logic `admin.createUser(email_confirm: true)` khi có service key; nếu muốn bắt buộc email verification thật sự cần cấu hình lại.
- Component realtime comments đã tồn tại nhưng trang chi tiết đang dùng `CommentList` thông thường, chưa sử dụng realtime component ở UI chính.
- README chưa mô tả đầy đủ nghiệp vụ và quy trình deploy cho dự án cá nhân.

## 9) Định hướng phát triển tiếp theo

- Chuẩn hóa 1 cấu trúc thư mục duy nhất (`lib/`, `types/`) để giảm tech debt.
- Tách rõ 2 mode đăng ký:
  - Mode A: bắt buộc xác nhận email.
  - Mode B: bỏ qua xác nhận email (chỉ cho dev/test).
- Thêm trang hồ sơ người dùng, cập nhật avatar/display name.
- Thêm tìm kiếm bài viết và lọc theo tác giả/chủ đề.
- Nâng cấp trình soạn thảo nội dung (Markdown preview, image upload).
- Thêm test tự động cho các luồng auth và CRUD.

## 10) Kết luận

Simple Blog đạt mục tiêu của một dự án cá nhân fullstack ở mức thực hiện: có auth, phân quyền route, CRUD bài viết, bình luận và sử dụng dịch vụ BaaS hiện đại. Nền tảng hiện tại phù hợp để tiếp tục phát triển thành sản phẩm blog cá nhân hoàn chỉnh hơn, đặc biệt nếu bổ sung thêm test, chuẩn hóa cấu trúc code và hội nhập quy trình vận hành/deploy đầy đủ.
