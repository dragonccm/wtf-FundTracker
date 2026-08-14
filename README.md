# Nhật Ký Quỹ

Ứng dụng theo dõi danh mục quỹ đầu tư cá nhân, xây dựng với Next.js 15, Material 3 và MongoDB. Dữ liệu quỹ, giao dịch, danh mục và mục tiêu được lưu theo từng tài khoản; dashboard chỉ tính toán từ các dữ liệu đó.

## Chức năng

- Đăng ký/đăng nhập bằng email hoặc Google OAuth.
- Quản lý danh mục, quỹ, giao dịch và mục tiêu tài chính.
- Tổng hợp giá trị tài sản, lãi/lỗ, XIRR và phân bổ danh mục.
- Đồng bộ MongoDB theo tài khoản, import/export giao dịch.
- Giao diện Material 3 tối ưu cho màn hình nhỏ.

## Chạy local

Yêu cầu: Node.js 20 trở lên và npm.

```bash
git clone https://github.com/dragonccm/wtf-FundTracker.git
cd wtf-FundTracker
npm ci
```

Tạo `.env.local` từ `.env.example`, rồi đặt URI MongoDB local:

```env
MONGODB_URI=mongodb://127.0.0.1:27017/wtf-FundTracker
NEXT_PUBLIC_APP_URL=http://localhost:3000
AUTH_SECRET=mot-chuoi-ngau-nhien-dai-it-nhat-32-ky-tu
```

Mở hai terminal:

```bash
# Terminal 1: MongoDB local có dữ liệu được giữ trong .data/mongodb
npm run db:local

# Terminal 2: web app
npm run dev
```

Truy cập `http://localhost:3000`.

## Seed dữ liệu phát triển

Seed ghi document thật vào MongoDB bằng upsert, vì vậy chạy lại không tạo bản ghi trùng và không xóa dữ liệu đã có.

```bash
npm run db:seed
```

Lệnh mặc định tạo tài khoản demo local:

```text
Email: demo@nhatkyquy.local
Mật khẩu: NhatKyQuy2026!
```

Để seed cho một tài khoản đã tồn tại, truyền biến môi trường trước khi chạy:

```bash
# PowerShell
$env:SEED_EMAIL="you@example.com"
npm run db:seed
Remove-Item Env:SEED_EMAIL
```

## Triển khai Dokploy

1. Tạo một MongoDB service trong Dokploy và lấy **internal connection URI**. Không đưa URI hay mật khẩu vào Git.
2. Tạo Application mới từ repository GitHub này, chọn nhánh `main`.
3. Cấu hình build/start command:

   ```text
   Build: npm ci && npm run build
   Start: npm run start
   Port: 3000
   ```

4. Gắn domain HTTPS cho Application và thêm các biến môi trường sau trong Dokploy:

   ```env
   NODE_ENV=production
   MONGODB_URI=mongodb://<user>:<password>@<mongo-host>:<port>/wtf-FundTracker?authSource=admin
   NEXT_PUBLIC_APP_URL=https://your-domain.example
   AUTH_SECRET=<chuoi-ngau-nhien-dai-it-nhat-32-ky-tu>
   ```

5. Nếu dùng Google login, bổ sung:

   ```env
   NEXT_PUBLIC_GOOGLE_CLIENT_ID=<google-client-id>
   GOOGLE_CLIENT_SECRET=<google-client-secret>
   ```

   Trong Google Cloud Console, thêm Redirect URI chính xác:

   ```text
   https://your-domain.example/api/auth/callback/google
   ```

6. Deploy, rồi mở `/login` để tạo tài khoản và kiểm tra thêm một giao dịch. Ứng dụng cần trả HTTP 200 ở domain trước khi cấu hình OAuth.

### Seed trên Dokploy (tùy chọn)

Chỉ chạy seed trong môi trường thử nghiệm hoặc cho tài khoản bạn kiểm soát. Mở terminal của application, đặt `SEED_EMAIL` nếu cần rồi chạy `npm run db:seed`. Script dùng `MONGODB_URI` của container, không cần `.env.local`.

## Kiểm tra trước khi deploy

```bash
npx tsc --noEmit
npm run build
```

## Bảo mật

- Không commit `.env`, `.env.local`, URI MongoDB hoặc Google client secret.
- Dùng `AUTH_SECRET` riêng, ngẫu nhiên và đủ dài ở production.
- Chỉ dùng tài khoản seed mặc định cho local development; đổi hoặc xóa trước khi triển khai môi trường công khai.
