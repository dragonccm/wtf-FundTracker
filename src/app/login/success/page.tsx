'use client';

import { useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAppStore } from '@/lib/store/appStore';

function LoginSuccessHandler() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { updateProfile, login } = useAppStore();

  useEffect(() => {
    const email = searchParams.get('email');
    const name = searchParams.get('name');
    const avatar = searchParams.get('avatar');

    if (email) {
      login(email);
      updateProfile({
        email,
        name: name || email.split('@')[0],
        avatarUrl: avatar || undefined,
      });
    }

    router.replace('/dashboard');
  }, [searchParams, router, updateProfile, login]);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', gap: '16px' }}>
      <div style={{ fontSize: '24px', fontWeight: 800, color: 'var(--md-sys-color-primary)' }}>
        🎉 Đang xử lý đăng nhập Google...
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
