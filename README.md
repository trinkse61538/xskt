# XSKT V5.1 PWA v3.3 — Tab Quy ước

Bản v3.3 thêm tab **Quy ước**.

Tab này giải thích rõ:

- Hồ sơ cá nhân hóa đang dùng
- Tên có / không có ảnh hưởng gì
- Ngày sinh, giờ sinh, nơi sinh được dùng thế nào
- Tứ Trụ nền
- Công thức điểm V5
- Công thức Bát Tự / Quẻ / Consensus / Agreement
- Quy ước lập quẻ ngày
- Vì sao quẻ ngày dùng giờ Ngọ 12:00, không dùng giờ sinh 20:40
- Pipeline từ ngày → chữ số → 00–99 → Top 6 → vai trò V5.1
- Trọng số cặp V5.1
- Những dữ liệu KHÔNG dùng
- Trạng thái backtest 2023–2025

## Deploy

```bash
rsync -av --delete --exclude='.git' ./ ../xskt-khaitringuyen-github-pages/
cd ../xskt-khaitringuyen-github-pages
git add .
git commit -m "Add methodology tab to XSKT V5.1 v3.3"
git push origin main
```

Mở:
`https://xskt.khaitringuyen.com/?v=33`

Thấy `v3.3` ở góc trên là đúng build mới.
