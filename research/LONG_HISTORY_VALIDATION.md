# XSMN 2005–2025 — Long-history audit & V5.1 validation

## Dataset integrity

- Valid station-draw rows: **22,815**
- Actual draw dates: **7,259**
- Stations: **21**
- Date range: **2005-10-01 → 2025-12-31**
- Rows with exactly 18 prize results: **22,815/22,815**
- Duplicate date/station rows: **0**
- Known NO_DRAW dates among collector failures: **133**
- Remaining source/parser gaps: **5** — 17-10-2007, 02-09-2008, 16-07-2009, 07-08-2009, 03-02-2011

## Frozen V5.1 — all actual draws 2005–2025

| Metric | V5.1 observed | Random baseline | Delta |
|---|---:|---:|---:|
| Chủ 1 | 16.480% | 16.548% | **−0.068 pp** |
| Any Top 3 | 41.394% | 42.203% | **−0.809 pp** |
| Any Top 5 | 59.680% | 60.277% | **−0.596 pp** |

Cluster-by-date testing:
- Chủ 1: p ≈ 0.811
- Top 3: p ≈ 0.014
- Top 5: p ≈ 0.080

**Kết luận:** không có predictive edge dương được xác nhận; Top 3 còn thấp hơn baseline trên toàn bộ mẫu.

## Untouched holdout 2023–2025

| Metric | Delta vs baseline |
|---|---:|
| Chủ 1 | **−0.771 pp** |
| Top 3 | **−1.999 pp** |
| Top 5 | **−1.901 pp** |

Top 3 và Top 5 đều kém baseline trong holdout. Vì vậy không được dùng lịch sử để “tối ưu” ngược trọng số V5.1.

## 4 ngày CHÍNH/tháng

Toàn bộ lịch sử:
- Chủ 1: **−1.518 pp**
- Top 3: **−2.002 pp**
- Top 5: **−1.960 pp**

Holdout 2023–2025:
- Chủ 1: +1.055 pp
- Top 3: +0.478 pp
- Top 5: −3.081 pp

Không có lợi thế dương có ý nghĩa thống kê.

## Station Layer

Walk-forward chỉ dùng quá khứ để chọn đài cho năm kế tiếp, 2011–2025:
- Out-of-sample dates: **5,345**
- Selected-station Top 3 hit: **41.235%**
- Baseline: **42.154%**
- Delta: **−0.919 pp**
- p ≈ 0.172

Bạc Liêu khi nhìn 2005–2025 có Top3 delta khoảng **−0.223 pp**, tức lợi thế nhìn thấy trong 2020–2025 không bền khi kéo lịch sử dài hơn.

**Quyết định app:** không khuyến nghị một đài là “tốt hơn”; chỉ hiển thị lịch đài và dữ liệu thực nghiệm để đối chiếu.

## Recent Form — hot-number windows

Walk-forward, mỗi đài chỉ dùng các kỳ trước đó:

| Window | All-history Top3 delta | Holdout 2023–2025 |
|---|---:|---:|
| 10 kỳ | +0.293 pp | +0.586 pp |
| 30 kỳ | +0.288 pp | +0.992 pp |
| 100 kỳ | +1.052 pp | **+0.034 pp** |

Hiệu ứng 100 kỳ nhìn đẹp trên toàn lịch sử nhưng gần như biến mất trong holdout. 10/30 kỳ cũng không ổn định xuyên các era.

**Quyết định app:** tab Đối chiếu hiển thị 10/30/100 kỳ nhưng **không đưa recent frequency vào điểm V5.1**.

## Ngôn ngữ thống kê trong app

Dùng:
- “Tỷ lệ kỳ có xuất hiện”
- “Tần suất thực nghiệm”
- “Số kỳ vắng”

Không dùng:
- “Xác suất kỳ tới = X%”
- “Đài chắc hơn”
- “Số sắp ra”

Baseline lý thuyết của một số 2 chữ số xuất hiện ít nhất một lần trong 18 kết quả là khoảng **16.55%**.
