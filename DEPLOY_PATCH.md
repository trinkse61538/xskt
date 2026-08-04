# XSKT V5.1 PWA v4.2 — Station Match

## Điểm mới
- V5.1 khóa Chủ 1 + Chủ 2 trước.
- Station Match mới so các đài đang xổ sau khi số đã khóa.
- 20% × 10 kỳ + 35% × 30 kỳ + 45% × 100 kỳ.
- Có consistency penalty để giảm các đài có 10/30/100 kỳ mâu thuẫn.
- Chỉ hiện **Đài đối chiếu nổi bật** khi vượt clear-rule.
- Nếu không đủ chênh lệch: **Không có đài nổi bật**.
- Đây là Experimental layer, không phải xác suất kỳ tới.

## Deploy an toàn
Ưu tiên dùng PATCH zip v4.2 để không ghi đè historical data live do GitHub Actions đang cập nhật.

```bash
cd ~/Downloads/xskt-khaitringuyen-github-pages
git pull --rebase origin main

cd ~/Downloads/xskt-v4.2-StationMatch-PATCH
rsync -av ./ ../xskt-khaitringuyen-github-pages/

cd ../xskt-khaitringuyen-github-pages
git add .
git commit -m "Add Station Match experimental selector v4.2"
git push origin main
```

Mở:
`https://xskt.khaitringuyen.com/?v=42`

Nếu push bị `fetch first` vì GitHub Actions vừa commit:
```bash
git fetch origin
git rebase origin/main
git push origin main
```

PATCH không chứa:
- `data/history/xsmn_history.csv`
- `data/history/recent-history.v40.js`

nên không làm lùi historical data live.
