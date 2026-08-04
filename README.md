# XSKT V5.1 PWA v4.1 — Quant Research

## Nguyên tắc
Core V5.1 vẫn frozen. Không đưa một giả thuyết mới vào điểm/số chỉ vì nó nghe hợp lý.

## Bổ sung
- Signal Separation: Std, Z-score #1, #1→#10, percentile
- Weight Robustness: 5 cấu hình trọng số cho rank ngày
- Event-Time Research: quẻ giờ Thân ~16:15, không cộng vào core
- Vượng/Tướng/Hưu/Tù/Tử: hiển thị mùa khí động
- Seasonal challenger đã được kiểm định nhưng chưa promote
- Monte Carlo 100.000 simulation trong tab Quy ước
- Recent Form / auto-update v4.0 vẫn giữ nguyên

## Deploy
```bash
rsync -av --exclude='.git' ./ ../xskt-khaitringuyen-github-pages/
cd ../xskt-khaitringuyen-github-pages
git add .
git commit -m "Add Quant Research layers to XSKT V5.1 v4.1"
git push origin main
```

Mở:
`https://xskt.khaitringuyen.com/?v=41`

Hidden files cần giữ:
- `.nojekyll`
- `.github/workflows/update-history.yml`
