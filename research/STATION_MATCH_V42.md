# Station Match v4.2 — Experimental selector

## Mục tiêu

Giải quyết câu hỏi thực tế: sau khi V5.1 đã khóa **Chủ 1 + Chủ 2**, nếu hôm đó có 3–4 đài XSMN thì đài nào có historical match tốt hơn với chính hai số đã khóa?

Đây không phải mô hình dự báo xác suất và không thay thế V5.1.

## Công thức khóa trước

Với mỗi đài và mỗi số Chủ 1 / Chủ 2:

- rate10 = tỷ lệ kỳ có xuất hiện trong 10 kỳ gần nhất
- rate30 = tỷ lệ kỳ có xuất hiện trong 30 kỳ gần nhất
- rate100 = tỷ lệ kỳ có xuất hiện trong 100 kỳ gần nhất
- weighted = 0.20×rate10 + 0.35×rate30 + 0.45×rate100

Sau đó:

- pair10 / pair30 / pair100 = trung bình của Chủ 1 + Chủ 2
- raw_match = 0.20×pair10 + 0.35×pair30 + 0.45×pair100
- spread = standard deviation(pair10, pair30, pair100)
- adjusted_match = raw_match − 0.25×spread

## Clear-rule được khóa trước

Chỉ hiện **“Đài đối chiếu nổi bật”** nếu đồng thời:

1. adjusted_match của #1 ≥ baseline + 2 điểm %
2. #1 dẫn #2 ≥ 2 điểm %
3. weighted rate của cả Chủ 1 và Chủ 2 ≥ baseline − 5 điểm %

Nếu không, app hiện **“Không có đài nổi bật”**.

## Past-only validation 2006–2025

Mỗi ngày chỉ dùng những kỳ đã xảy ra trước ngày đó.

### Toàn bộ giai đoạn
- Evaluation dates: 6.659
- Clear dates: 2.457 (~36,9%)
- Selected station — ít nhất 1 trong 2 số chủ hit: 31,054%
- Trung bình các đài cùng ngày: 30,040%
- Delta: **+1,014 điểm %**
- p ≈ **0,185**

### Development 2006–2016
- Clear: 1.284
- Delta: +0,519 điểm %
- p ≈ 0,625

### Validation 2017–2022
- Clear: 764
- Delta: +0,698 điểm %
- p ≈ 0,616

### Holdout 2023–2025
- Clear: 409
- Selected: 31,785%
- Same-day average: 28,627%
- Delta: **+3,158 điểm %**
- p ≈ **0,083**

## Quyết định

Station Match có hướng dương xuyên development / validation / holdout, tốt hơn Station Layer cũ về tính ổn định dấu. Tuy nhiên p-value tổng thể và holdout vẫn chưa đủ mạnh để gọi là predictive edge.

Vì vậy:

- dùng nhãn **Đài đối chiếu**
- trạng thái **EXPERIMENTAL**
- không gọi là “đài xác suất cao”
- không dùng Station Match để đổi số V5.1
- khi các đài gần nhau, app phải nói rõ **Không có đài nổi bật**
