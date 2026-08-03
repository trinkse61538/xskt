# XSKT V5.1 PWA v3.1 — Cache Fix

Bản v3.1 sửa lỗi HTML mới bị ghép với CSS/JS cũ do cache Service Worker.

## Cách sửa triệt để

Asset đã được đổi tên:
- `assets/style.v31.css`
- `assets/app.v31.js`
- `data/v51-2026-2030.v31.js`

Service Worker:
- cache version `xskt-v51-pwa-v31-cachefix`
- network-first cho toàn bộ asset
- `skipWaiting()` + `clients.claim()`
- app tự reload một lần khi Service Worker mới takeover

Ở góc phải trên cùng có chữ rất nhỏ `v3.1`.
Nếu thấy `v3.1`, bạn đang chạy đúng build mới.

## Deploy

Từ folder package này:

```bash
rsync -av --delete --exclude='.git' ./ ../xskt-khaitringuyen-github-pages/
cd ../xskt-khaitringuyen-github-pages

git add .
git commit -m "Fix PWA cache and calendar assets v3.1"
git push origin main
```

`--delete` rất quan trọng trong lần này: nó xóa asset cũ khỏi repo để tránh GitHub Pages còn phục vụ nhầm file.

## Nếu iPhone vẫn giữ bản cũ

Safari:
1. Mở `https://xskt.khaitringuyen.com/?v=31`
2. Refresh một lần.
3. Nếu app Home Screen đang mở, đóng hoàn toàn rồi mở lại.

Nếu vẫn không đổi:
Settings → Safari → Advanced → Website Data → tìm `khaitringuyen.com` → Delete.
Sau đó mở lại website và Add to Home Screen.

Không cần làm bước xóa Website Data nếu đã thấy chữ `v3.1` ở góc trên.
