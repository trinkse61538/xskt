# XSKT V5.1 PWA v3 — Calendar Dương/Âm

Bản v3 có 4 tab:

1. **Hôm nay**
2. **4 ngày chính**
3. **Lịch tháng**
4. **Tất cả ngày**

## Lịch tháng
- Grid Thứ 2 → Chủ Nhật
- Ngày dương hiển thị lớn
- Ngày âm hiển thị nhỏ
- Ngày mùng 1 âm hiển thị cả tháng âm
- Màu trạng thái: Chính / Phụ A / Phụ B / Phụ C
- Điểm V5 nhỏ ở góc
- Bấm ngày mở detail bottom sheet

## Ngày âm
Dữ liệu 2026–2030 đã được precompute theo lịch âm Việt Nam UTC+7.
Đã kiểm tra các mốc Tết:
- 17/02/2026 = 01/01 AL
- 06/02/2027 = 01/01 AL
- 26/01/2028 = 01/01 AL
- 13/02/2029 = 01/01 AL
- 02/02/2030 = 01/01 AL

## Deploy vào repo hiện tại

```bash
rsync -av --exclude='.git' ./ ../xskt-khaitringuyen-github-pages/
cd ../xskt-khaitringuyen-github-pages
git add .
git commit -m "Add lunar calendar tab to XSKT V5.1 PWA"
git push origin main
```

Service Worker cache version:
`xskt-v51-pwa-v3-lunar-calendar`

## Ghi chú lịch Việt Nam 2030

Năm 2030 có khác biệt 1 ngày giữa một số lịch quốc tế và lịch âm Việt Nam do múi giờ.
Bản app dùng UTC+7 theo lịch Việt Nam: **02/02/2030 = 01/01/2030 âm lịch**.
