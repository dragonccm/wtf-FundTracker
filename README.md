# 📊 Nhật Ký Quỹ (Fund Tracker) - Hệ Thống Quản Lý Danh Mục Quỹ Mở & ETF

> **Tài liệu Hướng dẫn Cài đặt, Triển khai và Bàn giao Hệ thống**  
> *Phiên bản: 1.0.0 (Production Ready) • Chuẩn thiết kế: Google Material Design 3*

---

## 📖 1. Giới thiệu Tổng quan

**Nhật Ký Quỹ** là hệ thống quản lý danh mục đầu tư chứng chỉ quỹ (CCQ) cá nhân toàn diện, chuyên nghiệp. Hệ thống được thiết kế theo tiêu chuẩn Google Material Design 3, cung cấp công cụ theo dõi tài sản, tính toán lợi nhuận, phân bổ danh mục, đo lường tỷ suất sinh lời hàng năm (XIRR) và tự động đồng bộ giá trị tài sản ròng (NAV) từ hơn 68 quỹ mở trên thị trường Việt Nam (Fmarket).

### 🛠️ Công nghệ sử dụng:
- **Frontend / Fullstack Framework**: [Next.js 15 (App Router)](https://nextjs.org/) + [React 19](https://react.dev/) + [TypeScript](https://www.typescriptlang.org/)
- **Giao diện & Trải nghiệm**: Vanilla CSS theo chuẩn Google Material Design 3 Tokens, font chữ [MoMo Trust Sans / Plus Jakarta Sans](https://fonts.google.com/), tối ưu 100% cho màn hình di động (iOS Safari & Android).
- **Cơ sở dữ liệu (Database)**: [MongoDB](https://www.mongodb.com/) (Hỗ trợ MongoDB Atlas hoặc MongoDB Server tự lưu trữ).
- **Xác thực & Bảo mật**: JWT Authentication với thư viện `jose`, mã hóa mật khẩu `bcryptjs`, tích hợp đăng nhập bảo mật qua Google OAuth 2.0.
- **Tính toán tài chính**: Công cụ tính toán danh mục tự động, thuật toán Newton-Raphson tính tỷ suất lợi nhuận nội bộ hàng năm (XIRR / CAGR).
- **Xử lý dữ liệu**: Hỗ trợ xuất/nhập sao lưu Excel (`xlsx`), JSON và CSV.

---

## ✨ 2. Các Tính năng Cốt lõi

1. **Quản lý Quỹ & Tự động đồng bộ NAV**:
   - Tích hợp sẵn danh mục hơn 68 quỹ mở (Cổ phiếu, Trái phiếu, Cân bằng, Chỉ số).
   - Tự động lấy NAV mới nhất và lịch sử biến động từ Fmarket API.
   - Hỗ trợ thêm hàng loạt (*Thêm tất cả*) hoặc thêm quỹ tùy chỉnh thủ công.
2. **Ghi nhận & Quản lý Giao dịch**:
   - Ghi nhận lệnh Mua / Bán CCQ với tính toán tức thời theo giá trị NAV khớp lệnh, phí giao dịch và số lượng CCQ.
   - Gán giao dịch theo từng danh mục riêng biệt và liên kết với các Mục tiêu tài chính.
   - Hỗ trợ xem dòng thời gian (Timeline) và chỉnh sửa/xóa giao dịch linh hoạt.
3. **Phân tích Hiệu quả Đầu tư (Dashboard & Performance)**:
   - Tổng tài sản, tổng vốn đầu tư, lợi nhuận ròng (PnL) và tỷ lệ sinh lời.
   - Biểu đồ phân bổ tỷ trọng theo loại tài sản (Cổ phiếu, Trái phiếu, Tiền mặt).
   - Bảng theo dõi mục tiêu tài chính với thanh tiến độ thông minh.
   - Tính toán chỉ số XIRR cá nhân hóa theo từng mốc thời gian thực.
4. **Nhập / Xuất dữ liệu (Import & Export)**:
   - Xuất báo cáo danh mục ra file Excel (.xlsx).
   - Khôi phục và nhập dữ liệu lịch sử giao dịch từ file Excel / CSV.
5. **Hỗ trợ Đa nền tảng (PWA & Mobile Ready)**:
   - Giao diện chuẩn App di động, hỗ trợ cài đặt PWA lên màn hình chính.
   - Tối ưu hóa triệt để hiển thị trên trình duyệt di động (iOS Safari, Android Chrome, Edge).

---

## 💻 3. Yêu cầu Môi trường (System Prerequisites)

Trước khi bắt đầu cài đặt, máy chủ hoặc máy tính phát triển cần cài đặt sẵn:
- **Node.js**: Phiên bản **20.x LTS** trở lên (Khuyến nghị Node.js 20 hoặc 22).
- **npm** (đi kèm Node.js) hoặc **pnpm** / **yarn**.
- **MongoDB**: MongoDB 6.0+ (Cài đặt cục bộ) HOẶC chuỗi kết nối **MongoDB Atlas** (Cloud).
- **Git**: Dùng để quản lý mã nguồn.

---

## 🚀 4. Hướng dẫn Cài đặt & Chạy Cục bộ (Local Development)

### Bước 1: Clone mã nguồn
```bash
git clone https://github.com/dragonccm/wtf-FundTracker.git
cd wtf-FundTracker
```

### Bước 2: Cài đặt các gói phụ thuộc (Dependencies)
```bash
npm install
# hoặc nếu dùng npm ci cho môi trường chuẩn:
npm ci
```

### Bước 3: Cấu hình biến môi trường
Tạo file `.env.local` tại thư mục gốc của dự án:
```env
# 1. Cấu hình Database MongoDB (Local hoặc MongoDB Atlas Cloud)
MONGODB_URI=mongodb://127.0.0.1:27017/wtf-FundTracker

# 2. Đường dẫn ứng dụng
NEXT_PUBLIC_APP_URL=http://localhost:3000

# 3. Khóa bí mật JWT Auth (Tạo một chuỗi ngẫu nhiên dài từ 32 ký tự trở lên)
AUTH_SECRET=nhat-ky-quy-secret-key-production-change-this-32-chars-long

# 4. Cấu hình Google OAuth 2.0 (Tùy chọn - xem Mục 6 nếu muốn bật Google Login)
NEXT_PUBLIC_GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=
```

### Bước 4: Khởi tạo dữ liệu mẫu (Seed Database)
Hệ thống cung cấp sẵn script khởi tạo dữ liệu mẫu (quỹ, danh mục, giao dịch mẫu):
```bash
# Khởi tạo tài khoản demo mặc định (demo@nhatkyquy.local / NhatKyQuy2026!)
npm run db:seed
```

### Bước 5: Chạy ứng dụng ở chế độ phát triển (Development Mode)
```bash
npm run dev
```
Mở trình duyệt và truy cập: **`http://localhost:3000`** (hoặc port được hiển thị trên màn hình).

---

## 🌐 5. Hướng dẫn Triển khai Production (Deployment Guides)

### 🌟 Phương pháp 1: Triển khai lên Vercel (Khuyến nghị nhanh nhất)
1. Đăng nhập [Vercel](https://vercel.com/) và bấm **Add New Project**.
2. Kết nối tới Git repository `wtf-FundTracker`.
3. Trong phần **Environment Variables**, thêm các biến sau:
   - `MONGODB_URI`: Chuỗi kết nối MongoDB Atlas (VD: `mongodb+srv://user:pass@cluster.mongodb.net/fundtracker?retryWrites=true&w=majority`)
   - `NEXT_PUBLIC_APP_URL`: Domain thật của bạn (VD: `https://fundtracker.yourdomain.com`)
   - `AUTH_SECRET`: Chuỗi bảo mật ngẫu nhiên dài tối thiểu 32 ký tự.
   - `NEXT_PUBLIC_GOOGLE_CLIENT_ID`: (Nếu có dùng Google Login).
   - `GOOGLE_CLIENT_SECRET`: (Nếu có dùng Google Login).
4. Bấm **Deploy**. Vercel sẽ tự động build và cấp phát HTTPS miễn phí.

---

### 🐳 Phương pháp 2: Triển khai trên Dokploy / Docker (Self-hosted VPS)
1. **Tạo MongoDB Service**: Tạo một MongoDB Database container trên Dokploy và lấy Internal Connection String.
2. **Tạo Application Service**:
   - Repository: Chọn nhánh `main` của repository này.
   - Build Command: `npm ci && npm run build`
   - Start Command: `npm run start`
   - Port: `3000`
3. **Cấu hình Environment Variables**:
   ```env
   NODE_ENV=production
   MONGODB_URI=mongodb://<username>:<password>@<mongodb-host>:27017/wtf-FundTracker?authSource=admin
   NEXT_PUBLIC_APP_URL=https://your-app-domain.com
   AUTH_SECRET=<chuoi-bao-mat-ngau-nhien-it-nhat-32-ky-tu>
   ```
4. **Cấu hình SSL / Domain**: Trỏ Domain về IP máy chủ, Dokploy sẽ tự động cấp chứng chỉ SSL Let's Encrypt.

---

### 🖥️ Phương pháp 3: Triển khai trên VPS Ubuntu với Node.js, PM2 & Nginx

#### 1. Cài đặt môi trường trên VPS
```bash
sudo apt update && sudo apt install -y nodejs npm nginx git
sudo npm install -g pm2
```

#### 2. Clone mã nguồn và Build
```bash
cd /var/www
sudo git clone https://github.com/dragonccm/wtf-FundTracker.git
cd wtf-FundTracker
sudo npm ci
sudo nano .env.local # Nhập các biến môi trường
sudo npm run build
```

#### 3. Khởi chạy tiến trình với PM2
```bash
pm2 start npm --name "fund-tracker" -- start
pm2 save
pm2 startup
```

#### 4. Cấu hình Nginx Reverse Proxy
Tạo file cấu hình `/etc/nginx/sites-available/fundtracker`:
```nginx
server {
    listen 80;
    server_name your-domain.com;

    location / {
        proxy_pass http://127.0.0.1:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```
Kích hoạt cấu hình và cài SSL với Certbot:
```bash
sudo ln -s /etc/nginx/sites-available/fundtracker /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
sudo apt install -y certbot python3-certbot-nginx
sudo certbot --nginx -d your-domain.com
```

---

## 🔑 6. Hướng dẫn Cấu hình Google OAuth 2.0 (Đăng nhập bằng Google)

Nếu muốn cho phép người dùng đăng nhập nhanh bằng tài khoản Google:

1. Truy cập [Google Cloud Console](https://console.cloud.google.com/).
2. Tạo một **Project mới** (ví dụ: `Fund Tracker Production`).
3. Điều hướng tới **APIs & Services** > **OAuth consent screen**:
   - Chọn **External** > Điền tên ứng dụng, email hỗ trợ.
4. Điều hướng tới **APIs & Services** > **Credentials**:
   - Bấm **Create Credentials** > Chọn **OAuth client ID**.
   - Application type: Chọn **Web application**.
   - **Authorized JavaScript origins**:
     - `http://localhost:3000` (dành cho local)
     - `https://your-domain.com` (domain production thật)
   - **Authorized redirect URIs**:
     - `http://localhost:3000/api/auth/callback/google` (dành cho local)
     - `https://your-domain.com/api/auth/callback/google` (domain production thật)
5. Nhận `Client ID` và `Client Secret`, sau đó điền vào biến môi trường:
   ```env
   NEXT_PUBLIC_GOOGLE_CLIENT_ID=xxxxxx.apps.googleusercontent.com
   GOOGLE_CLIENT_SECRET=GOCSPX-xxxxxx
   ```

---

## 📂 7. Cấu trúc Thư mục Dự án

```text
wtf-FundTracker/
├── src/
│   ├── app/                      # Next.js App Router Pages & API Routes
│   │   ├── (auth)/login/         # Màn hình Đăng nhập & Đăng ký
│   │   ├── api/auth/             # API đăng ký, đăng nhập, Google OAuth callback
│   │   ├── api/funds/auto-sync/  # API tự động đồng bộ NAV 68+ quỹ từ Fmarket
│   │   ├── api/user/sync/        # API đồng bộ dữ liệu MongoDB theo User
│   │   ├── dashboard/            # Dashboard tổng quan tài sản, PnL, phân bổ
│   │   ├── funds/                # Quản lý danh sách quỹ & tra cứu Fmarket
│   │   ├── transactions/         # Quản lý & ghi nhận giao dịch CCQ
│   │   ├── portfolio/            # Quản lý danh mục & phân bổ đầu tư
│   │   ├── performance/          # Báo cáo hiệu suất, tính toán chỉ số XIRR
│   │   ├── goals/                # Quản lý mục tiêu tài chính
│   │   ├── import-export/        # Nhập/Xuất file Excel và CSV
│   │   ├── timeline/             # Dòng thời gian lịch sử hoạt động
│   │   └── settings/             # Cài đặt người dùng & bảo mật
│   ├── components/               # React Components tái sử dụng
│   │   ├── navigation/           # Thanh điều hướng Bottom Nav / Sidebar M3
│   │   ├── transactions/         # Modal Thêm/Sửa giao dịch chuẩn Material 3
│   │   ├── feedback/             # Toast notifications & dialogs
│   │   └── charts/               # Biểu đồ tài chính
│   ├── lib/
│   │   ├── store/appStore.tsx    # State Management trung tâm (Context + Sync)
│   │   ├── models/               # MongoDB Mongoose Models (User, Transaction, Fund...)
│   │   ├── db/                   # MongoDB Connection Handler
│   │   └── utils/                # Thuật toán tài chính, XIRR, formatters
│   ├── styles/                   # CSS Tokens theo chuẩn Google Material Design 3
│   └── types/                    # TypeScript interfaces & domain types
├── scripts/
│   └── seed.ts                   # Script khởi tạo dữ liệu mẫu
├── public/                       # Favicon, icons, manifest PWA
├── package.json
└── tsconfig.json
```

---

## 🔒 8. Quy định Bảo mật & Vận hành

1. **Tuyệt đối không lưu trữ thông tin nhạy cảm vào Git**:
   - Không commit file `.env`, `.env.local` hoặc các thông tin `AUTH_SECRET`, MongoDB URI có chứa mật khẩu.
2. **Khóa bảo mật `AUTH_SECRET`**:
   - Trên môi trường Production, luôn tạo một khóa bí mật ngẫu nhiên và an toàn (sử dụng lệnh `openssl rand -base64 32`).
3. **Sao lưu Cơ sở dữ liệu định kỳ**:
   - Sử dụng công cụ `mongodump` hoặc tính năng Automated Backup của MongoDB Atlas để đảm bảo an toàn dữ liệu khách hàng.

---

## 📞 9. Bàn giao & Hỗ trợ Kỹ thuật

- **Người thực hiện**: Antigravity Pair Programming Engine & Developer Team
- **Hỗ trợ kỹ thuật**: Mọi thắc mắc trong quá trình triển khai, cài đặt hoặc bảo trì hệ thống, vui lòng liên hệ trực tiếp qua kênh bàn giao dự án.
