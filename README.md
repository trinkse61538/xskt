# V5.1 XSKT PWA 2026–2030

PWA dành cho `https://xskt.khaitringuyen.com`.

## Có gì mới so với bản web trước

- Cài lên Home Screen như một app
- `display: standalone` — mở không có thanh trình duyệt
- Offline sau lần tải đầu tiên
- Service Worker tự cache giao diện + dữ liệu 2026–2030
- Icon 192 / 512 + Apple Touch Icon
- Nút **Cài ứng dụng** trên trình duyệt hỗ trợ
- Hướng dẫn riêng cho iPhone/iPad
- Vẫn giữ đủ 4 ngày chính + toàn bộ ngày phụ

## File mới

- `manifest.webmanifest`
- `sw.js`
- `offline.html`
- `icons/icon-192.png`
- `icons/icon-512.png`
- `icons/apple-touch-icon.png`

## Update repo hiện tại

Giải nén package này và copy đè toàn bộ file vào repo `xskt`, sau đó:

```bash
git add .
git commit -m "Upgrade XSKT V5.1 to PWA"
git push
```

GitHub Pages sẽ deploy lại tự động.

## iPhone

1. Mở `https://xskt.khaitringuyen.com` bằng **Safari**
2. Bấm nút **Share / Chia sẻ**
3. Chọn **Add to Home Screen / Thêm vào Màn hình chính**
4. Mở icon XSKT V5.1 vừa tạo

## Android / Chrome

Nếu đủ điều kiện PWA, website sẽ hiện nút **Cài ứng dụng**. Hoặc dùng menu Chrome → **Install app / Add to Home Screen**.

## Lưu ý update cache

Khi cập nhật app lớn, đổi biến `CACHE_VERSION` đầu file `sw.js`, ví dụ:

```js
const CACHE_VERSION = 'xskt-v51-pwa-2026-2030-v2';
```

Sau khi push, Service Worker mới sẽ thay cache cũ.
