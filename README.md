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


## Bản sửa lỗi lưu ảnh
Bản này dùng IndexedDB thay cho localStorage để lưu ảnh và cấu hình, giúp tránh lỗi vượt giới hạn localStorage. Mỗi ảnh tối đa 5 MB. Muốn mọi khách đều thấy thay đổi, vẫn cần xuất config.js và cập nhật lên GitHub.


## Xác nhận tham gia và tối ưu ảnh
- Nút “Chấp nhận lời mời” mở hộp xác nhận. Khi khách đồng ý, website gửi POST đến Google Apps Script đã cấu hình trong `script.js`; Apps Script dùng `MailApp.sendEmail` để gửi thông báo về `khongtienanhlrtt@gmail.com`.
- Google Apps Script cần được triển khai dưới dạng Web app, thực thi với tư cách chủ sở hữu và cho phép người dùng truy cập phù hợp; chủ sở hữu phải cấp quyền gửi email. Nếu thay đổi mã Apps Script, hãy cập nhật deployment đang dùng.
- Trình duyệt gọi Apps Script bằng `fetch` ở chế độ `no-cors`, vì vậy website không đọc được phản hồi chi tiết từ Google. Thông báo trên web xác nhận yêu cầu đã được gửi đi, không đảm bảo email đã vào Inbox; hãy kiểm tra cả Spam và nhật ký Executions của Apps Script khi thử nghiệm.
- Có hiệu ứng mở trang, hộp xác nhận, nút bấm, bong bóng khi nhấn, vệt bong bóng và ánh sáng đi theo chuột; tiếng click được tạo bằng Web Audio (không tải thêm thư viện).
- Ảnh tải lên tối đa 15 MB mỗi ảnh gốc; website tự thu nhỏ cạnh dài tối đa 1600 px và nén WebP mục tiêu khoảng 450 KB, giới hạn 500 KB mỗi ảnh sau nén.


## Lưu tên đăng nhập và đăng xuất
- Ở màn hình đầu, bật **Nhớ tên trên thiết bị này** để trình duyệt ghi nhớ tên đã nhập bằng IndexedDB. Lần sau mở website trên cùng trình duyệt/thiết bị, tên sẽ được điền sẵn.
- Nút **Đăng xuất** đưa người dùng về màn hình nhập tên; tên đã nhớ vẫn được giữ lại để tiện đăng nhập lần sau. Bỏ chọn ô nhớ tên khi đăng nhập để xóa tên đã lưu.
- Đây là trang tĩnh chỉ đăng nhập bằng tên, không có mật khẩu hay xác thực máy chủ; không dùng cách này để bảo vệ dữ liệu bí mật.

## Nội dung có thể chỉnh sửa
Trong bảng PRIVATE EDITOR có thể chỉnh tiêu đề trang, nội dung màn hình đăng nhập, lời chào, tiêu đề và nội dung thiệp, ngày giờ, địa điểm, chữ nút, email nhận RSVP, lời nhắn cuối trang, chú thích ảnh, font và các ảnh. Sau khi lưu trên máy, bấm **Tải config.js để cập nhật GitHub** rồi thay file config.js trong repository để công khai thay đổi cho tất cả khách.


## Chỉnh sửa giao diện ngay trên website

Đăng nhập bằng tên quản trị hiện có để mở bảng **Chỉnh sửa thiệp mời**. Ngoài các nội dung chữ, email và ảnh vốn có, bảng quản trị còn cho phép:

- Thay riêng ảnh nền màn hình đăng nhập (sảnh), ảnh nền phần thiệp chính và ảnh nền thư viện ảnh.
- Chỉnh màu nhấn, màu chữ, màu nền sảnh và màu nền thư viện; điều chỉnh độ mờ lớp phủ ảnh nền.
- Đổi kiểu chữ và chú thích ảnh bìa.
- Bật/tắt chuyển động, chọn chuyển động sang trọng/nhẹ/tắt; bật/tắt âm thanh và chỉnh âm lượng.
- Lưu để xem ngay trên trình duyệt đang dùng hoặc xuất `config.js` để cập nhật bản GitHub Pages công khai.

**Lưu ý quan trọng:** GitHub Pages chỉ lưu website tĩnh. Nút lưu trong bảng quản trị lưu riêng trên thiết bị/trình duyệt của bạn; khách truy cập bằng thiết bị khác sẽ không tự thấy thay đổi đó. Để cập nhật cho tất cả mọi người, hãy chọn **Tải config.js để cập nhật GitHub**, sau đó thay `config.js` trong kho GitHub và commit. Các nội dung mặc định ban đầu được giữ nguyên; chỉ những trường bạn thay đổi mới ghi đè nội dung cũ.
