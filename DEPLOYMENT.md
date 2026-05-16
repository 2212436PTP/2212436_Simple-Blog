# Hướng dẫn Triển khai Simple Blog lên VPS (Domain + SSL)

Tài liệu này hướng dẫn bạn từng bước để đưa dự án **Simple Blog** lên môi trường Internet thực tế, sử dụng VPS, Tên miền (Domain), Docker và SSL (HTTPS).

---

## 🛠️ Yêu cầu chuẩn bị
1. **VPS**: Ubuntu 22.04 LTS (Khuyến nghị).
2. **Domain**: Đã sở hữu một tên miền (ví dụ: `yourblog.com`).
3. **Cloudflare**: Đã trỏ DNS của Domain về Cloudflare (Khuyến nghị để quản lý SSL/DNS dễ dàng).

---

## 🚀 Bước 1: Chuẩn bị Server (VPS)

Đăng nhập vào VPS qua SSH và cài đặt các công cụ cần thiết:

```bash
# Cập nhật hệ thống
sudo apt update && sudo apt upgrade -y

# Cài đặt Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh

# Cài đặt Nginx (Reverse Proxy)
sudo apt install nginx -y
```

---

## 📦 Bước 2: Triển khai Code lên VPS

1. **Clone mã nguồn**:
   ```bash
   git clone <link-repo-cua-ban>
   cd simple-blog
   ```

2. **Cấu hình biến môi trường**:
   Tạo file `.env.local` trên server và điền thông tin Supabase Production của bạn:
   ```bash
   nano .env.local
   ```
   *Dán nội dung sau vào:*
   ```env
   NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
   SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
   ```

3. **Chạy ứng dụng với Docker**:
   ```bash
   sudo docker compose up -d --build
   ```
   *Ứng dụng sẽ chạy tại cổng `3001` trên server (theo file docker-compose.yml).*

---

## 🌐 Bước 3: Cấu hình Domain & Nginx Reverse Proxy

Nginx sẽ đóng vai trò nhận các yêu cầu từ internet (cổng 80/443) và chuyển tiếp vào Docker (cổng 3001).

1. **Tạo cấu hình Nginx**:
   ```bash
   sudo nano /etc/nginx/sites-available/simple-blog
   ```

2. **Dán cấu hình sau (thay `yourblog.com` bằng domain của bạn)**:
   ```nginx
   server {
       listen 80;
       server_name yourblog.com;

       location / {
           proxy_pass http://localhost:3001;
           proxy_http_version 1.1;
           proxy_set_header Upgrade $http_upgrade;
           proxy_set_header Connection 'upgrade';
           proxy_set_header Host $host;
           proxy_cache_bypass $http_upgrade;
       }
   }
   ```

3. **Kích hoạt cấu hình**:
   ```bash
   sudo ln -s /etc/nginx/sites-available/simple-blog /etc/nginx/sites-enabled/
   sudo nginx -t
   sudo systemctl restart nginx
   ```

---

## 🔐 Bước 4: Cài đặt SSL (HTTPS) với Certbot

Sử dụng Let's Encrypt để có chứng chỉ SSL miễn phí:

```bash
sudo apt install certbot python3-certbot-nginx -y
sudo certbot --nginx -d yourblog.com
```
*Làm theo hướng dẫn, chọn "Redirect" để tự động chuyển từ HTTP sang HTTPS.*

---

## 🛡️ Bước 5: Cấu hình Supabase Production

1. **Auth Redirect URL**: Trong Supabase Dashboard -> Authentication -> URL Configuration:
   - Site URL: `https://yourblog.com`
   - Redirect URLs: `https://yourblog.com/auth/callback`
2. **Storage RLS**: Đảm bảo bucket `blog-images` có Policy cho phép `public` read và `authenticated` upload.
3. **Database**: Chạy các script SQL trong thư mục `migrations/` nếu bạn dùng một project Supabase mới.

---

## ✅ Checklist Kiểm tra
- [ ] Truy cập được website qua `https://yourblog.com`.
- [ ] Đăng nhập/Đăng ký hoạt động (kiểm tra email callback).
- [ ] Upload ảnh bài viết hoạt động.
- [ ] Docker container tự khởi động lại khi server reboot (`restart: unless-stopped`).

---

> [!TIP]
> Nếu bạn dùng **Cloudflare**, hãy bật đám mây màu vàng (Proxied) và chỉnh chế độ SSL/TLS thành **Full (Strict)**.
