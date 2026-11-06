# Website kỷ yếu – bản có trình chỉnh sửa riêng

## Cách mở trình chỉnh sửa
1. Mở website đã triển khai trên GitHub Pages.
2. Ở màn hình nhập tên, nhập chính xác: `Khổng Tiến Anh đẹp trai`.
3. Sau khi thiệp mở ra, bảng **Chỉnh sửa thiệp mời** sẽ xuất hiện bên dưới.
4. Sửa lời mời, tiêu đề, lời nhắn, thời gian, địa điểm, chữ trên nút; chọn ảnh thiệp, ảnh nền và kiểu chữ.
5. Bấm **Lưu thay đổi trên máy này** để lưu trong trình duyệt đang dùng.
6. Muốn cập nhật cho tất cả khách xem: bấm **Tải config.js để cập nhật GitHub**, rồi thay file `config.js` cũ trong repository bằng file vừa tải và commit changes.

## Lưu ý quan trọng
- Đây là website tĩnh chạy bằng GitHub Pages. Phần chỉnh sửa được mở bằng một cụm từ bí mật ở phía trình duyệt, không phải hệ thống đăng nhập bảo mật; người biết mã nguồn có thể xem được cụm từ này. Không dùng nó để bảo vệ dữ liệu nhạy cảm.
- Nút lưu trên máy này chỉ lưu trong trình duyệt hiện tại. Muốn mọi người thấy nội dung mới, cần xuất `config.js` và cập nhật file đó lên GitHub.
- Ảnh tải lên được nhúng vào `config.js`; nên chọn ảnh dưới 3 MB.
- Giữ thư mục `assets/` của website gốc khi tải dự án lên GitHub để các ảnh mặc định và hình nền trang đăng nhập hiển thị đúng.

## Triển khai
Giữ nguyên cấu hình GitHub Pages: branch `main`, folder `/ (root)`. Sau khi thay file, chờ GitHub Pages cập nhật rồi tải lại website.


## Bảng quản trị và thư viện ảnh
- Nhập tên `Khổng Tiến Anh đẹp trai` để mở bảng chỉnh sửa.
- Dòng “Kính chào” tự động lấy tên mà khách vừa nhập.
- Có thể thay ảnh bìa, ảnh nền và từng ảnh kỷ yếu 1, 2, 3 trong bảng quản trị.
- Chọn “Lưu thay đổi trên máy này” để lưu trong trình duyệt hiện tại.
- Chọn “Tải config.js để cập nhật GitHub”, sau đó thay file `config.js` trong repository để khách khác thấy thay đổi.
- Giữ nguyên thư mục `assets` đang có trong repository.
