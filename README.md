# Bản nâng cấp không gian 3D tương tác

## Có gì mới
- Không gian 3D có chiều sâu và hiệu ứng parallax.
- Kéo chuột trên máy tính hoặc vuốt tay trên điện thoại để xoay góc nhìn.
- Có thể dùng phím mũi tên khi vùng 3D được chọn; giữ Shift để xoay nhanh hơn.
- Nút điều hướng nhanh tới Lời mời, Kỷ niệm và Xác nhận.
- Nút ↺ Góc nhìn để đưa không gian về vị trí ban đầu.
- Chuyển cảnh đăng nhập được làm mềm và kéo dài hơn, có hiệu ứng xuất hiện không gian.
- Nội dung thiệp, thư viện ảnh, xác nhận RSVP và bảng quản trị cũ vẫn được giữ lại.
- Không dùng thư viện 3D hay ứng dụng ngoài; chạy bằng HTML/CSS/JavaScript tĩnh trên GitHub Pages.

## Cập nhật GitHub
1. Tải và giải nén gói ZIP này.
2. Mở repository GitHub đang chứa website.
3. Tải lên và ghi đè `index.html`, `script.js`, `style.css`, `config.js`.
4. Giữ `README.md` hoặc thay bằng README trong gói nếu muốn cập nhật hướng dẫn.
5. Commit changes và chờ GitHub Pages triển khai.
6. Mở website và nhấn Ctrl + F5 để tải bản mới.

## Điều khiển
- Máy tính: kéo vùng không gian để xoay; rê chuột để có hiệu ứng nghiêng nhẹ.
- Điện thoại/máy tính bảng: vuốt ngang/dọc trên vùng không gian để xoay. Vuốt dọc trang vẫn hoạt động.
- Bàn phím: chọn vùng 3D rồi dùng các phím mũi tên; Shift + mũi tên để xoay nhanh.
- Chọn các nút Lời mời / Kỷ niệm / Xác nhận để nhảy tới nội dung tương ứng.

## Lưu ý
- Đây là hiệu ứng 3D bằng CSS transform và JavaScript, không phải thế giới WebGL 360° tự do. Nó được tối ưu để chạy nhẹ trên GitHub Pages và điện thoại.
- Nếu thiết bị bật chế độ giảm chuyển động hoặc cài đặt hiệu ứng bị tắt, chuyển động 3D sẽ được giảm/tắt để dễ sử dụng.
- Các thay đổi nội dung lưu trong trình duyệt vẫn theo cơ chế cũ của website; muốn mọi người thấy thay đổi cấu hình, hãy cập nhật `config.js` trên GitHub.
