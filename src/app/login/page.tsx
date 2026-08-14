'use client';

import React, { Suspense, useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAppStore } from '@/lib/store/appStore';

type Mode = 'login' | 'register';

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { login } = useAppStore();
  const [mode, setMode] = useState<Mode>('login');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const reason = searchParams.get('error');
    if (reason === 'GoogleNotConfigured') setError('Đăng nhập Google chưa được cấu hình.');
    else if (reason === 'DatabaseUnavailable') setError('Kho dữ liệu đám mây đang ngoại tuyến. Hãy thử đăng nhập Google lại để dùng chế độ lưu trên thiết bị.');
    else if (reason) setError('Không thể đăng nhập bằng Google. Vui lòng thử lại.');
  }, [searchParams]);

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const response = await fetch(`/api/auth/${mode}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password }),
      });
      const data = await response.json();
      if (!response.ok || !data.success || !data.user) {
        throw new Error(data.error || 'Không thể tiếp tục.');
      }

      login(data.user.email, data.user.name, data.user.avatarUrl);
      router.replace('/dashboard');
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : 'Không thể tiếp tục.');
    } finally {
      setIsLoading(false);
    }
  };

  const switchMode = (nextMode: Mode) => {
    setMode(nextMode);
    setError('');
  };

  return (
    <main className="journal-auth">
      <section className="journal-auth-card">
        <div className="journal-auth-mark">
          <span className="material-symbols-outlined" style={{ fontSize: 32 }}>savings</span>
        </div>

        <h1>{mode === 'login' ? 'Chào mừng trở lại.' : 'Bắt đầu nhật ký.'}</h1>
        <p>{mode === 'login' ? 'Mở danh mục và tiếp tục từ nơi bạn dừng lại.' : 'Dữ liệu của bạn được lưu trong tài khoản riêng.'}</p>

        <div className="m3-segmented-control" style={{ marginBottom: 20 }}>
          <button type="button" className={`m3-segment-btn ${mode === 'login' ? 'active' : ''}`} onClick={() => switchMode('login')}>
            Đăng nhập
          </button>
          <button type="button" className={`m3-segment-btn ${mode === 'register' ? 'active' : ''}`} onClick={() => switchMode('register')}>
            Tạo tài khoản
          </button>
        </div>

        <form className="journal-form" onSubmit={submit}>
          {mode === 'register' && (
            <div className="journal-field">
              <label htmlFor="name">Tên của bạn</label>
              <input id="name" autoComplete="name" value={name} onChange={(event) => setName(event.target.value)} required />
            </div>
          )}
          <div className="journal-field">
            <label htmlFor="email">Email</label>
            <input id="email" type="email" autoComplete="email" value={email} onChange={(event) => setEmail(event.target.value)} required />
          </div>
          <div className="journal-field">
            <label htmlFor="password">Mật khẩu</label>
            <input
              id="password"
              type="password"
              minLength={mode === 'register' ? 8 : undefined}
              autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              required
            />
          </div>

          {error && <div className="journal-error" role="alert">{error}</div>}

          <button type="submit" className="journal-primary-button" disabled={isLoading} style={{ width: '100%' }}>
            {isLoading ? 'Đang xử lý…' : mode === 'login' ? 'Đăng nhập' : 'Tạo tài khoản'}
            {!isLoading && <span className="material-symbols-outlined" style={{ fontSize: 19 }}>arrow_forward</span>}
          </button>

          <div className="journal-divider">hoặc</div>

          <a href="/api/auth/google" className="journal-secondary-button" style={{ width: '100%' }}>
            <span style={{ fontSize: 18, fontWeight: 500 }}>G</span>
            Tiếp tục với Google
          </a>
        </form>

        <p style={{ margin: '20px 0 0', textAlign: 'center', fontSize: 11 }}>
          Bằng việc tiếp tục, bạn đồng ý bảo vệ dữ liệu tài chính của chính mình.
        </p>
      </section>
    </main>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<main className="journal-auth" />}>
      <LoginForm />
    </Suspense>
  );
}
