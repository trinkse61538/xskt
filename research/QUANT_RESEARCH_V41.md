# Quant Research Addendum — V5.1

## Quyết định
Không thay core V5.1. Các module dưới đây được giữ dưới dạng **Research / diagnostic**.

## 1. Signal Separation
Đo độ nổi bật của #1 so với toàn bộ 00–99 bằng:
- standard deviation
- Z-score của #1
- khoảng cách #1 → #10 theo đơn vị sigma
- percentile tương đối trong toàn bộ lịch 2026–2050

Historical 2005–2025 theo quartile separation:
- Q1 Top3 delta: -1.024 pp
- Q2: -0.491 pp
- Q3: -0.306 pp
- Q4 (rõ nhất): -1.418 pp

=> Signal Separation chỉ mô tả **độ rõ nội bộ**, không phải confidence dự đoán.

## 2. Event-Time / giờ Thân
Quẻ chuẩn V5.1 vẫn dùng giờ Ngọ 12:00.
Research layer lập thêm quẻ với giờ Thân (number 9) gần thời điểm XSMN ~16:15.

Nhóm Event-Time thuận hơn:
- Primary all-history: +0.370 pp vs baseline
- Top3 all-history: -0.604 pp
- Primary holdout 2023–2025: -0.386 pp
- Top3 holdout: -1.912 pp

=> Không cộng 5–10% vào core.

## 3. Vượng–Tướng–Hưu–Tù–Tử challenger
Quy ước multiplier khóa trước khi xem kết quả:
- Vượng 1.15
- Tướng 1.08
- Hưu 0.95
- Tù 0.85
- Tử 0.75

Seasonal challenger holdout 2023–2025:
- Primary: -0.510 pp
- Top3: -1.911 pp
- Top5: -1.698 pp

V5.1 cùng holdout:
- Primary: -0.771 pp
- Top3: -1.999 pp
- Top5: -1.901 pp

Challenger có cải thiện nhỏ ở một số metric nhưng vẫn dưới random baseline và không đủ ổn định.
=> Không promote thành V5.2 core.

## 4. Monte Carlo — 100,000 simulations
### Chủ 1
- observed 16.480%
- random mean 16.548%
- random 95% interval 16.068–17.028%
- V5.1 percentile 39.5%

### Top3
- observed 41.394%
- random mean 42.203%
- random 95% interval 41.560–42.845%
- percentile 0.7%

### Top5
- observed 59.680%
- random mean 60.277%
- random 95% interval 59.645–60.912%
- percentile 3.3%

=> Không có bằng chứng predictive edge dương.

## 5. Weight Robustness
App kiểm tra ngày hiện tại dưới 5 cấu hình:
- 55/35/10 (core)
- 50/40/10
- 60/30/10
- 45/45/10
- 65/25/10

Robustness áp dụng cho **xếp hạng ngày trong tháng**, không dùng để tuyên bố một cặp số có xác suất cao hơn.
