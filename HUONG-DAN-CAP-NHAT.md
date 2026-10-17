# EduLMS – Nối Firestore (bản cập nhật)

## 1. Chép đè file vào dự án
Giải nén gói này, chép đè vào thư mục dự án (giữ nguyên đường dẫn):

| File | Thay đổi |
|---|---|
| `firestore.rules` | Quy tắc bảo mật mới |
| `src/firebase.ts` | Đăng nhập Google + Email/Mật khẩu, kết nối Firestore (có bộ nhớ đệm) |
| `src/data/cloudStore.ts` | **Mới** – lớp đồng bộ dữ liệu với Firestore |
| `src/App.tsx` | Dữ liệu lấy từ Firestore thay vì localStorage; đăng nhập thật |
| `src/components/AuthModal.tsx` | Đăng nhập/đăng ký/quên mật khẩu bằng Firebase Auth |
| `src/components/ProfilePage.tsx` | Chờ kết quả lưu hồ sơ / đổi mật khẩu |
| `src/components/AdminPanel.tsx` | Đổi nội dung nút "Khôi phục mẫu" thành "Nạp danh mục mẫu" |
| `src/types/edulms.ts` | Thêm trường `userReactions` |

Không cần sửa `package.json`, không cần biến môi trường trên Vercel.

## 2. Thiết lập Firebase Console (làm một lần)
Mở https://console.firebase.google.com → project `gen-lang-client-0471372305`.

1. **Authentication → Sign-in method:** bật **Google** (đã bật) và bật thêm **Email/Password**.
2. **Authentication → Settings → Authorized domains:** thêm tên miền Vercel (ví dụ `ten-du-an.vercel.app`, và tên miền riêng nếu có).
3. **Firestore Database:** nếu chưa có database `(default)` thì bấm *Create database* → chọn chế độ *Production* → vị trí gần Việt Nam (ví dụ `asia-southeast1`).
   - Code đang dùng database `(default)`. Nếu muốn dùng database có tên riêng, đặt biến môi trường `VITE_FIRESTORE_DATABASE_ID` trên Vercel.
4. **Firestore → Rules:** xóa nội dung cũ, dán toàn bộ `firestore.rules` → **Publish**.
   (Nếu có nhiều database, chọn đúng database ở ô chọn phía trên trang Rules.)
5. Kiểm tra gói đang dùng là **Spark (No cost)**. Không dùng Firebase Storage (đã yêu cầu gói trả phí).

## 3. Deploy lại lên Vercel
Đẩy mã mới lên (Git hoặc upload lại) để Vercel build.

## 4. Lần chạy đầu tiên
1. Mở web, bấm **Đăng nhập → Đăng nhập với Google** bằng `cuongtt.tkao@gmail.com`. Tài khoản này tự có quyền **ADMIN**.
2. Cơ sở dữ liệu đang trống nên sẽ hiện khung vàng → bấm **Tạo danh mục mẫu** (công ty, khu vực, ban ngành), rồi chỉnh sửa trong trang Quản trị.
3. Các thành viên khác đăng ký (email + mật khẩu, có thư xác thực thật) hoặc đăng nhập bằng Google. Mỗi người tự có hồ sơ thành viên.
4. Cấp quyền ADMIN cho người khác: Firebase Console → Firestore → collection `users` → mở tài liệu của người đó → đổi trường `role` thành `ADMIN`.

## 5. Cần biết
- **Phải đăng nhập mới xem được dữ liệu.** Muốn mở công khai bảng xếp hạng: trong `firestore.rules`, mục `members`, đổi `allow read: if isSignedIn();` thành `allow read: if true;` (lưu ý tên "đối tượng" của từng thành viên cũng sẽ công khai).
- **Ai có tài khoản Google/email cũng đăng ký và xem được.** Chưa có bước admin duyệt thành viên.
- **Thành viên tự ghi điểm của mình** (không cần duyệt), và quy tắc không kiểm tra được điểm có đúng công thức hay không.
- **Hạn mức miễn phí Spark:** 50.000 lượt đọc/ngày, 20.000 lượt ghi/ngày. Mỗi lần một người mở web sau thời gian dài sẽ đọc toàn bộ thành viên (≈ số thành viên lượt đọc). Với khoảng 500 thành viên mở web mỗi ngày có thể vượt hạn mức; khi vượt, Firestore chỉ báo lỗi cho đến ngày hôm sau (gói Spark không tự tính phí). Nếu gặp tình huống này, cần gộp dữ liệu thành viên theo khu vực để giảm số lượt đọc.
- **Dữ liệu cũ trong localStorage của từng trình duyệt không được chuyển lên.** Dữ liệu mẫu (Nguyễn Văn An...) cũng không được nạp.
- **Tên đăng nhập** chỉ còn là tên hiển thị (không dùng để đăng nhập, không kiểm tra trùng). Đăng nhập bằng email.
- Tài khoản đăng nhập bằng Google không có mật khẩu riêng nên không đổi mật khẩu được.
- Nếu hai người cùng bình luận/thả cảm xúc vào một bài đúng cùng lúc, một thao tác có thể bị ghi đè.
- Nếu thành viên không phải ADMIN tạo "thành viên nhanh" (nhập tên chưa có trong danh sách) sẽ bị từ chối ghi; chỉ ADMIN tạo được thành viên cho người khác.
