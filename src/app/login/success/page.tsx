'use client';

import React, { useEffect, useRef, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAppStore } from '@/lib/store/appStore';

function LoginSuccessHandler() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { login } = useAppStore();
  const isProcessedRef = React.useRef(false);

  useEffect(() => {
    if (isProcessedRef.current) return;

    const email = searchParams.get('email');
    const name = searchParams.get('name');
    const avatar = searchParams.get('avatar');

    if (email) {
      isProcessedRef.current = true;
      login(email, name || undefined, avatar || undefined);
    }

    router.replace('/dashboard');
  }, [searchParams, router, login]);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', gap: '16px' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '22px', fontWeight: 800, color: 'var(--md-sys-color-primary)' }}>
        <span className="material-symbols-outlined" style={{ fontSize: '28px' }}>
          account_circle
        </span>
        Đang xử lý đăng nhập Google...
      </div>
      <p style={{ color: 'var(--md-sys-color-secondary)' }}>Vui lòng đợi trong giây lát...</p>
    </div>
  );
}

export default function LoginSuccessPage() {
  return (
    <Suspense fallback={<div>Đang tải...</div>}>
      <LoginSuccessHandler />
    </Suspense>
  );
}
