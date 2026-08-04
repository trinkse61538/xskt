# XSKT v4.3 — 3 Independent Layers + Anomaly Watch

1. V5.1: khóa số
2. Station Match: đối chiếu đài sau khi khóa số
3. Anomaly Watch: chỉ cảnh báo thống kê

Không có tổng điểm 3 lớp. ALIGNMENT / CONFLICT / NEUTRAL / STATION WATCH không thay picks, điểm hay stake.

## Deploy PATCH an toàn
PATCH không chứa xsmn_history.csv hoặc recent-history.v40.js.

```bash
cd ~/Downloads/xskt-khaitringuyen-github-pages
git pull --rebase origin main

cd ~/Downloads/xskt-v4.3-AnomalyWatch-PATCH
rsync -av ./ ../xskt-khaitringuyen-github-pages/

cd ../xskt-khaitringuyen-github-pages
git add .
git commit -m "Add independent Anomaly Watch layer v4.3"
git push origin main
```

Mở: https://xskt.khaitringuyen.com/?v=43

Sau deploy: GitHub → Actions → Update XSMN History → Run workflow một lần.
Workflow mới sẽ rebuild cả Recent Form và Anomaly Watch từ historical CSV live.
