'use client';

import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAppStore } from '@/lib/store/appStore';

export default function LoginSuccessPage() {
  const router = useRouter();
  const { login } = useAppStore();

  useEffect(() => {
    fetch('/api/auth/me', { cache: 'no-store' })
      .then((response) => response.json())
      .then((data) => {
        if (!data.success || !data.user) throw new Error('Session not found');
        login(data.user.email, data.user.name, data.user.avatarUrl);
        router.replace('/dashboard');
      })
      .catch(() => router.replace('/login?error=GoogleAuthFailed'));
  }, [login, router]);

  return (
    <main className="journal-auth">
      <div className="journal-auth-mark">
        <span className="material-symbols-outlined" style={{ fontSize: 32 }}>progress_activity</span>
      </div>
    </main>
  );
}
