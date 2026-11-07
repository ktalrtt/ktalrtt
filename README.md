# Kỷ yếu 3D – Cosmic Lobby (GitHub Pages)

## Bản đã chỉnh sửa
- Sảnh vũ trụ 3D xoay 360° bằng kéo chuột hoặc vuốt.
- Zoom gần/xa bằng con lăn chuột, nút +/− và thanh thu phóng; nút “Về giữa” khôi phục góc nhìn và zoom mặc định.
- Các thẻ nội dung được tạo đường dẫn tương thích cả GitHub Pages dạng `username.github.io/repository/` (không trỏ nhầm về thư mục gốc domain).
- Bổ sung ảnh SVG mặc định còn thiếu để màn hình mở đầu và album không bị ảnh lỗi.
- Giữ các trang Album, Thành viên, Video, Kỷ niệm, Lời nhắn và Hành trình lớp.

## Cài đặt GitHub Pages (quan trọng để hết lỗi 404)
1. Giải nén ZIP này.
2. Mở repository GitHub của bạn và đưa **toàn bộ nội dung bên trong ZIP** lên thư mục gốc repository. `index.html` phải nằm ngay ở cấp đầu tiên, không nằm trong một thư mục con.
3. Đảm bảo các mục `pages/`, `assets/` và các file `config.js`, `script.js`, `world3d.js`, `style.css` được commit cùng nhau.
4. Vào **Settings → Pages**. Chọn đúng branch đang chứa website (thường là `main`) và folder `/ (root)`, rồi Save.
5. Đợi GitHub Pages deploy hoàn tất. Mở URL Pages do GitHub cung cấp, không mở URL preview của repository. Tải lại bằng `Ctrl + Shift + R`.

Ví dụ cấu trúc repository đúng:

```text
repository/
├── index.html
├── config.js
├── script.js
├── world3d.js
├── style.css
├── assets/
└── pages/
    ├── album.html
    ├── members.html
    ├── videos.html
    ├── memories.html
    ├── messages.html
    ├── journey.html
    └── detail.js
```

Nếu vẫn 404 sau khi deploy, kiểm tra GitHub Pages đang trỏ đúng branch/folder và tên file đúng chữ hoa-thường. GitHub Pages phân biệt `Pages` với `pages`.

## Chỉnh nội dung
Sửa `worldItems` và `worldPages` trong `config.js`. Các đường dẫn nội bộ nên để dạng `pages/album.html`, không thêm dấu `/` ở đầu. Trình chỉnh sửa trong website vẫn lưu cấu hình trên trình duyệt; để cập nhật cho tất cả người xem, xuất `config.js` rồi commit file đó lên GitHub.
