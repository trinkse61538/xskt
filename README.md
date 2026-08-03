# XSKT V5.1 PWA v2 — Tabbed Mobile App

Bản này thay giao diện dashboard dài bằng 3 tab chính:

1. **Hôm nay**
   - Trạng thái ngày hiện tại
   - 3 số nổi bật
   - V5 / Agreement / Hạng tháng
   - Tóm tắt Can-Chi, 12 Trực, Thể/Dụng
   - Bấm **Xem chi tiết hôm nay** để mở toàn bộ quẻ

2. **4 ngày chính**
   - Điều hướng tháng trước / sau
   - Chỉ hiện đúng 4 ngày ưu tiên trong tháng
   - Mỗi ngày là một card gọn

3. **Tất cả ngày**
   - Lọc theo năm / tháng / Chính / Phụ A / Phụ B / Phụ C
   - Search theo số, Can-Chi, quẻ
   - Không dồn nội dung chuyên sâu vào list

## Trang chi tiết

Bấm một ngày bất kỳ sẽ mở bottom sheet riêng:
- 5 số và điểm
- V5 / Agreement / Tier / rank
- Can-Chi / 12 Trực / Nạp âm
- Quẻ chủ → quẻ hỗ → hào động → quẻ biến
- Thể / Dụng
- Đơn vị tham chiếu

## PWA

- Add to Home Screen
- Standalone
- Offline sau lần tải đầu
- Service Worker cache version: `xskt-v51-pwa-v2-tabbed-app`

## Update repo đang dùng

Copy đè toàn bộ source này vào folder repo `xskt-khaitringuyen-github-pages`, sau đó:

```bash
git add .
git commit -m "Redesign XSKT V5.1 as tabbed PWA"
git push origin main
```

Trên iPhone: Safari → Chia sẻ → Thêm vào Màn hình chính.

> V5.1 là hệ xếp hạng huyền học cá nhân hóa. Backtest 2023–2025 chưa xác nhận predictive edge có ý nghĩa thống kê.
