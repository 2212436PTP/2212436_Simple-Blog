# PHỤ LỤC: MINH CHỨNG SỬ DỤNG AI TOOL

**Tên dự án:** Simple Blog
**Công cụ AI sử dụng:** Gemini / Antigravity AI (trong trình soạn thảo)

Dưới đây là danh sách các câu lệnh (prompts) đã sử dụng trong quá trình phát triển để hoàn thiện đồ án theo đúng yêu cầu đề cương.

| STT | Câu lệnh (Prompt) | Mục đích / Tại sao dùng | Kết quả đạt được |
| :--- | :--- | :--- | :--- |
| 1 | *"Tôi muốn kết nối với Docker"* | Để thiết lập Containerization (đóng gói ứng dụng) cho dự án Next.js bằng Docker theo yêu cầu bắt buộc số 3 của đồ án. | AI phân tích cấu trúc dự án, cấu hình lại `next.config.ts` thành chế độ standalone, và tạo thành công các file `Dockerfile` (multi-stage), `.dockerignore`, `docker-compose.yml`. |
| 2 | *"Đọc tất cả các yêu này và đưa ra gợi ý lựa chọn - Sẵn check xem tôi còn thiếu gì trong các yêu cầu này"* (Kèm ảnh/text yêu cầu đồ án) | Cần rà soát lại toàn bộ source code hiện tại so với đề cương để đảm bảo không bị thiếu điểm, lên kế hoạch hoàn thiện. | AI quét source code, xác nhận các phần đã đạt (Next.js App Router, Tailwind, TypeScript, Supabase Auth) và lập Action Plan cho các phần còn thiếu (Storage, RLS, Deployment). |
| 3 | *"Có"* (Đồng ý tạo các file Docker) | Lệnh cho AI tự động sinh code Docker chuẩn best-practice cho dự án Next.js. | Hoàn thành 100% tiêu chí Containerization một cách nhanh chóng và tối ưu dung lượng image. |
| 4 | *"Tiếp tục thực hiện bước thứ 2"* (Hoàn thiện CRUD Blog & Supabase Storage) | Cần tích hợp thêm ít nhất 1 tính năng bổ sung của Supabase (Storage) ngoài Auth và DB, đồng thời đảm bảo bảo mật RLS. | AI đã chỉnh sửa mã nguồn React để thêm chức năng Upload Ảnh bìa (Thumbnail) vào form bài viết, cập nhật trang chi tiết, và cung cấp script SQL chuẩn để tạo Bucket, thiết lập RLS (Row Level Security) bảo vệ dữ liệu. |
| 5 | *"Hướng dẫn tôi bước Deployment như yêu cầu tôi đã gửi cho bạn"* (Yêu cầu VPS, Domain, SSL) | Cần triển khai ứng dụng lên môi trường internet thực tế với tên miền và bảo mật HTTPS theo yêu cầu nâng cao của đồ án. | AI đã lập kế hoạch chi tiết, tạo file hướng dẫn `DEPLOYMENT.md` với các bước cài đặt Nginx Reverse Proxy, Certbot SSL và cấu hình Docker trên VPS. Đồng thời cập nhật mã nguồn để bảo mật endpoint Admin trong môi trường Production. |
| 6 | *"Tôi đã hoàn thành"* | Xác nhận việc chạy SQL thành công để AI đánh giá tổng thể và hỗ trợ làm báo cáo minh chứng. | AI tổng hợp lại các đoạn chat thành bảng phụ lục này để sinh viên tiện copy dán vào báo cáo môn học. |

### Đánh giá hiệu quả sử dụng AI
- **Tiết kiệm thời gian:** Giảm thiểu thời gian thiết lập cấu hình Docker phức tạp và viết các file cấu hình.
- **Tối ưu mã nguồn:** Code được AI sinh ra (như Dockerfile Multi-stage) tối ưu dung lượng và bảo mật tốt hơn so với tự viết thủ công.
- **Hướng dẫn cấu hình Database:** AI cung cấp chính xác các câu lệnh SQL để setup Supabase Storage và RLS, hạn chế các lỗi bảo mật.
