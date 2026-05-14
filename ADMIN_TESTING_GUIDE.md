# Hướng dẫn Test Role Admin

## 1️⃣ Setup Admin User

### Cách A: Dùng API Endpoint (Nhanh nhất)

Mở trình duyệt, vào DevTools Console và chạy:

```javascript
// Thay YOUR_EMAIL bằng email của bạn
fetch("/api/admin/setup", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({ email: "YOUR_EMAIL", role: "admin" }),
})
  .then((r) => r.json())
  .then((d) => console.log(d));
```

Hoặc dùng `curl` trong PowerShell:

```powershell
$body = @{
  email = "YOUR_EMAIL"
  role = "admin"
} | ConvertTo-Json

Invoke-WebRequest -Uri "http://localhost:3000/api/admin/setup" `
  -Method POST `
  -Headers @{"Content-Type"="application/json"} `
  -Body $body
```

✅ Nếu thành công, bạn sẽ thấy: `{ ok: true, email: "YOUR_EMAIL", role: "admin", ... }`

### Cách B: Supabase Console (Safer)

1. Mở [Supabase Console](https://supabase.com/dashboard)
2. Vào **Authentication** → **Users**
3. Tìm user của bạn → click **Edit**
4. Tìm `user_metadata` field (JSON)
5. Thêm hoặc sửa: `"role": "admin"`

   Ví dụ:

   ```json
   {
     "display_name": "Tên của bạn",
     "avatar_url": "...",
     "role": "admin"
   }
   ```

6. Click **Save** → ✅ Xong

## 2️⃣ Verify Admin Role

Sau khi setup, **logout rồi login lại** để refresh metadata:

1. Đăng xuất: click **Đăng xuất** (hoặc vào `/logout`)
2. Đăng nhập lại
3. Kiểm tra header: bạn sẽ thấy link **Admin** xuất hiện (ngoài cùng bên trái của menu)

## 3️⃣ Test Admin Panel

Nhấp vào link **Admin** → Vào trang `/admin`

### Bạn sẽ thấy 3 sections:

**📋 Người dùng:**

- Danh sách tất cả user (email, display name, role)
- **Cấp quyền admin**: Chọn user → nhấp "Cấp quyền admin" → user sẽ chuyển từ "user" thành "admin"
- **Hạ quyền**: Admin → nhấp "Hạ quyền" → user chuyển về "user"
- **Xóa user**: Xóa user hoàn toàn (xóa cả profile + tất cả bài viết/bình luận của user)

**📝 Bài viết:**

- Danh sách tất cả bài viết (tiêu đề, tác giả, status, ngày tạo)
- **Xóa bài viết**: Nhấp "Xóa bài viết" → bài sẽ bị xóa (không thể phục hồi)

**💬 Bình luận:**

- Danh sách tất cả bình luận (nội dung, tác giả, bài viết, ngày tạo)
- **Xóa bình luận**: Nhấp "Xóa bình luận" → bình luận bị xóa

## 4️⃣ Test Chức năng Admin Chi Tiết

### Test 4a: Cấp/hạ role admin

1. Tìm user không phải admin
2. Nhấp **"Cấp quyền admin"**
3. Xác nhận → user sẽ xuất hiện với role **admin**
4. Nhấp **"Hạ quyền"** → role sẽ thay đổi về **user**
5. ✅ Nếu thành công: role thay đổi ngay lập tức

### Test 4b: Xóa user

1. Chọn một user test (hoặc tạo user mới để test)
2. Nhấp **"Xóa"** user
3. Xác nhận dialog → user sẽ bị xóa khỏi danh sách
4. ✅ Xác minh: User không còn trong danh sách sau khi reload trang

### Test 4c: Xóa bài viết

1. Tìm bài viết cần test
2. Nhấp **"Xóa bài viết"**
3. Xác nhận dialog → bài viết sẽ bị xóa
4. ✅ Xác minh:
   - Bài viết biến mất khỏi danh sách admin
   - Bài viết biến mất khỏi trang chủ (refresh)

### Test 4d: Xóa bình luận

1. Tìm bình luận cần test
2. Nhấp **"Xóa bình luận"**
3. Xác nhận dialog → bình luận sẽ bị xóa
4. ✅ Xác minh:
   - Bình luận biến mất khỏi danh sách admin
   - Comment count trên bài viết giảm 1

## 5️⃣ Diagnostics

Để kiểm tra nhanh các bảng DB đã tạo hay chưa:

- Đăng nhập user admin
- Mở `/admin/diagnostics`
- Kiểm tra status:
  - ✅ **post_reactions: Có** → reactions feature sẵn sàng
  - ✅ **profiles: Có** → avatar/profile feature sẵn sàng

## 6️⃣ Xem Server Logs

Mở terminal chạy dev server, kiểm tra logs:

```
POST /api/admin/users/{id}/role 200 → role được thay đổi
DELETE /api/admin/users/{id} 200 → user được xóa
DELETE /api/posts/{id} 200 → bài viết được xóa (admin delete)
DELETE /api/comments/{id} 200 → bình luận được xóa (admin delete)
```

Nếu gặp lỗi: **403 Forbidden** = user không phải admin, **401 Unauthorized** = chưa đăng nhập

## 🚨 Important Notes

⚠️ **Endpoint `/api/admin/setup` chỉ nên dùng để test!**

- Trong production, xóa endpoint này
- Chỉ quản lý admin role qua Supabase Console

⚠️ **RLS (Row Level Security):**

- Hiện tại app không bật RLS
- Nếu bật RLS, cần add policies cho admin delete
- Mình có thể hỗ trợ setup RLS nếu bạn yêu cầu

## ✅ Checklist Sau Khi Test Xong

- [ ] Admin user được tạo thành công
- [ ] Link "Admin" xuất hiện trong header sau login
- [ ] Admin panel tải được (view users, posts, comments)
- [ ] Cấp/hạ role admin hoạt động
- [ ] Xóa user hoạt động
- [ ] Xóa bài viết hoạt động
- [ ] Xóa bình luận hoạt động
- [ ] Diagnostics page hiển thị correct DB status

---

💬 **Cần hỗ trợ gì khác?**

- Enable RLS + policies
- Xóa endpoint `/api/admin/setup` nếu không cần nữa
- Test scenario khác
