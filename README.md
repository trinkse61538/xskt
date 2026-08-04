# XSKT V5.1 PWA v4.0 — 2050 + Recent Form + Auto Update

## Mới
- lịch V5.1 từ 01/01/2026 đến 31/12/2050
- tab **Đối chiếu** theo đài xổ hôm nay
- cửa sổ 10 / 30 / 100 kỳ
- tỷ lệ kỳ có xuất hiện cho 00–99
- so trực tiếp 5 số V5.1 với Recent Form
- historical seed 2005–2025 + dữ liệu 2026 hiện có
- GitHub Actions tự backfill/cập nhật kỳ mới sau giờ xổ
- Station recommendation bị tắt sau long-history validation

## Deploy
```bash
rsync -av --exclude='.git' ./ ../xskt-khaitringuyen-github-pages/
cd ../xskt-khaitringuyen-github-pages
git add .
git commit -m "Upgrade XSKT V5.1 to 2050 with Recent Form and auto history"
git push origin main
```

Sau deploy mở:
`https://xskt.khaitringuyen.com/?v=40`

## GitHub Actions
Workflow: `.github/workflows/update-history.yml`
Chạy mỗi ngày lúc 18:45 Việt Nam và có `workflow_dispatch`.

Lần chạy đầu sẽ backfill từ ngày mới nhất trong `data/history/xsmn_history.csv` đến hiện tại.
Nếu một ngày fetch/parser lỗi, updater DỪNG tại ngày đó để lần sau retry; không ghi một hàng 0-hit giả.

## Lưu ý hidden files
Package có:
- `.nojekyll`
- `.github/workflows/update-history.yml`

Khi copy/deploy cần giữ cả hai.
