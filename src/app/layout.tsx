import React from 'react';
import '@/styles/globals.css';
import MaterialLoader from '@/lib/material/MaterialLoader';
import { AppProvider } from '@/lib/store/appStore';
import AppNavigation from '@/components/navigation/AppNavigation';

export const metadata = {
  title: 'Nhật Ký Quỹ - Quản Lý & Theo Dõi Đầu Tư Chứng Chỉ Quỹ',
  description: 'Hệ thống theo dõi danh mục đầu tư chứng chỉ quỹ cá nhân, tính XIRR, quản lý giao dịch và mục tiêu tài chính.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="vi">
      <body>
        <MaterialLoader />
        <AppProvider>
          <AppNavigation>{children}</AppNavigation>
        </AppProvider>
      </body>
    </html>
  );
}
