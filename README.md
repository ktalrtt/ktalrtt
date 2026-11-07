# Kỷ yếu 3D – Cosmic Lobby (GitHub Pages)

- Sau đăng nhập chỉ còn một sảnh chính toàn màn hình; không có phần thiệp/album kéo dài bên dưới.
- Sảnh phong cách vũ trụ nhiều màu: sao, tinh vân, vòng xoáy trung tâm và các thẻ nội dung nổi có chiều sâu.
- Kéo chuột hoặc vuốt để xoay 360°. Bấm từng thẻ để mở trang HTML riêng trong `pages/`.
- Đã sửa xử lý pointer để thao tác click không bị kéo camera chặn.

## Cài đặt trên GitHub Pages
1. Giải nén ZIP và upload nội dung vào thư mục gốc repository (cùng cấp `index.html`).
2. Ghi đè `index.html`, `style.css`, `world3d.js`, `script.js`, `config.js`, `README.md` nếu có.
3. Giữ thư mục `pages/` trong gói này. Không xóa thư mục `assets/` cũ trong repository.
4. Commit changes, chờ GitHub Pages deploy rồi tải lại bằng Ctrl+F5.

## Đổi nội dung xung quanh
Sửa `worldItems` trong `config.js`: mỗi mục có `title`, `description`, `url`, `icon`. Các trang riêng gồm album, thành viên, video, kỷ niệm, lời nhắn và hành trình lớp.

## Chỉnh sửa trên web và giới hạn GitHub Pages
Trình chỉnh sửa hiện có vẫn được giữ. Lưu trên trình duyệt chỉ áp dụng trên thiết bị đó; muốn mọi người cùng thấy, xuất `config.js` rồi commit lên GitHub. GitHub Pages là hosting tĩnh nên không tự ghi dữ liệu chỉnh sửa ngược vào repository.

Không cần cài ứng dụng khác hoặc thuê server; website được host bằng GitHub Pages.
