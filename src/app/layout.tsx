import React from 'react';
import '@/styles/globals.css';
import MaterialLoader from '@/lib/material/MaterialLoader';
import { AppProvider } from '@/lib/store/appStore';
import AppNavigation from '@/components/navigation/AppNavigation';

export const metadata = {
  title: 'Nhật Ký Quỹ - Quản Lý & Theo Dõi Đầu Tư Chứng Chỉ Quỹ',
  description: 'Hệ thống theo dõi danh mục đầu tư chứng chỉ quỹ cá nhân, tính XIRR, quản lý giao dịch và mục tiêu tài chính chuẩn Google Material 3.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="vi">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        {/* Google Fonts: Plus Jakarta Sans & Roboto */}
        <link
          href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@300;400;500;600;700;800;900&family=Roboto:wght@300;400;500;700&display=swap"
          rel="stylesheet"
        />
        {/* Official Google Material Symbols Outlined Icon Font */}
        <link
          href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@20..48,100..700,0..1,-50..200"
          rel="stylesheet"
        />
      </head>
      <body>
        <MaterialLoader />
        <AppProvider>
          <AppNavigation>{children}</AppNavigation>
        </AppProvider>
      </body>
    </html>
  );
}
