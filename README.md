# XSKT V5.1 PWA v3.4 — Station Layer

Bản v3.4 tự xác định các đài XSMN theo ngày và xếp hạng đài bằng historical compatibility của bộ 3 core V5.1 trên dữ liệu 2020–2025.

Deploy:
```bash
rsync -av --exclude='.git' ./ ../xskt-khaitringuyen-github-pages/
cd ../xskt-khaitringuyen-github-pages
git add .
git commit -m "Add XSMN station layer to V5.1 v3.4"
git push origin main
```

Mở `https://xskt.khaitringuyen.com/?v=34`.

Lưu ý: lịch 2027–2030 đang giả định lịch tuần XSMN hiện hành 2026 không đổi.
