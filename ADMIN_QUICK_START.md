# Admin Role Testing - Hướng dẫn nhanh

## 🚀 Bắt đầu ngay

### 1. Setup Admin User (Chọn 1 cách)

**Cách 1: UI Page (Dễ nhất)**

```
http://localhost:3000/admin/setup
```

- Nhập email của bạn
- Chọn role: "admin"
- Nhấp "Gán Role"

**Cách 2: DevTools Console**

```javascript
fetch("/api/admin/setup", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({ email: "YOUR_EMAIL", role: "admin" }),
})
  .then((r) => r.json())
  .then((d) => console.log(d));
```

**Cách 3: Supabase Console**

- Vào Authentication → Users
- Edit user → Thêm `"role": "admin"` vào user_metadata
- Save

### 2. Logout & Login lại

- Đăng xuất (Đăng xuất button ở header)
- Đăng nhập lại
- ✅ Nếu thành công, sẽ thấy link **"Admin"** ở header

### 3. Vào Admin Panel

Nhấp link **"Admin"** → `/admin`

### 4. Các chức năng để test

- 👥 **Người dùng**: Cấp/hạ quyền admin, xóa user
- 📝 **Bài viết**: Xóa bài viết
- 💬 **Bình luận**: Xóa bình luận
- 🔍 **Diagnostics**: Kiểm tra DB status (`/admin/diagnostics`)

## 📚 Chi tiết

Xem file **ADMIN_TESTING_GUIDE.md** để biết:

- Test case từng chức năng
- Kiểm tra server logs
- Xóa endpoint setup trong production
- Enable RLS policies (nếu cần)

## ⚠️ Important

- Endpoint `/api/admin/setup` chỉ để **test development**
- Trong production: xóa endpoint này + quản lý role qua Supabase Console
- Xem ADMIN_TESTING_GUIDE.md dòng "🚨 Important Notes"

---

**Bạn đã sẵn sàng! Hãy test admin features ngay 🎉**
