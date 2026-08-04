# XSKT V5.1 PWA v3.5 — Research Guardrail

Thay đổi:
- vẫn hiển thị đúng các đài XSMN theo ngày;
- vẫn hiển thị Historical Index 2020–2025;
- **tắt khuyến nghị chọn đài** vì walk-forward 2022–2025 chưa xác nhận lợi thế;
- banner giải thích Top3 selected ~39.7% vs baseline ~42.2%;
- chờ long-history validation 2005–2025.

Deploy:
```bash
rsync -av --exclude='.git' ./ ../xskt-khaitringuyen-github-pages/
cd ../xskt-khaitringuyen-github-pages
git add .
git commit -m "Disable station recommendation pending long-history validation v3.5"
git push origin main
```

Mở `https://xskt.khaitringuyen.com/?v=35`.
