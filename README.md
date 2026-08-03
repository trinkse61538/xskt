# V5.1 XSKT 2026–2030

Source dành cho GitHub Pages của `xskt.khaitringuyen.com`.

## Cấu trúc

- `index.html` – trang chính
- `assets/style.css` – giao diện
- `assets/app.js` – filter/render app
- `data/v51-2026-2030.js` – dữ liệu 1.826 ngày
- `CNAME` – custom domain `xskt.khaitringuyen.com`
- `.nojekyll` – yêu cầu GitHub Pages phục vụ file tĩnh nguyên bản

## Publish GitHub Pages

```bash
cd /duong-dan/toi/xskt-khaitringuyen-github-pages

git init
git add .
git commit -m "Deploy V5.1 XSKT 2026-2030"

git branch -M main
git remote add origin git@github.com:YOUR_GITHUB_USERNAME/YOUR_REPO.git
git push -u origin main
```

Sau đó trên GitHub:
1. Settings → Pages
2. Build and deployment → Deploy from a branch
3. Branch `main` / root
4. Custom domain: `xskt.khaitringuyen.com`

## DNS

Ở DNS của `khaitringuyen.com`, tạo:

- Type: `CNAME`
- Name/Host: `xskt`
- Target: `YOUR_GITHUB_USERNAME.github.io`

Sau khi GitHub xác nhận domain, bật **Enforce HTTPS**.

## Cập nhật dữ liệu sau này

Thay file `data/v51-2026-2030.js`, commit và push lại. Giao diện không cần build.

> Lưu ý: V5.1 là hệ xếp hạng huyền học cá nhân hóa; backtest 2023–2025 chưa xác nhận predictive edge có ý nghĩa thống kê.
