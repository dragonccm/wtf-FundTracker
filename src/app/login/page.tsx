'use client';

import React, { useState } from 'react';
import { useAppStore } from '@/lib/store/appStore';
import { useRouter } from 'next/navigation';

export default function LoginPage() {
  const router = useRouter();
  const { login } = useAppStore();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isRegister, setIsRegister] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    login(email);
    router.push('/dashboard');
  };

  const handleGoogleLogin = () => {
    window.location.href = '/api/auth/google';
  };

  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#E9EEF6',
        padding: '16px',
      }}
    >
      <div
        className="m3-card-white"
        style={{
          width: '100%',
          maxWidth: '400px',
          borderRadius: '28px',
          padding: '32px 24px',
        }}
      >
        {/* Brand Header */}
        <div style={{ textAlign: 'center', marginBottom: '24px' }}>
          <div
            style={{
              width: '52px',
              height: '52px',
              borderRadius: '16px',
              backgroundColor: '#0B57D0',
              color: '#FFFFFF',
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontWeight: 900,
              fontSize: '22px',
              marginBottom: '12px',
            }}
          >
            NKQ
          </div>
          <h1 style={{ fontSize: '22px', fontWeight: 900, color: '#0B57D0' }}>
            Nhật Ký Quỹ
          </h1>
          <p style={{ fontSize: '13px', color: '#74777F', marginTop: '2px' }}>
            {isRegister ? 'Tạo tài khoản theo dõi đầu tư mới' : 'Đăng nhập vào tài khoản của bạn'}
          </p>
        </div>

        {/* Google OAuth Login Button */}
        <button
          type="button"
          onClick={handleGoogleLogin}
          style={{
            width: '100%',
            padding: '11px',
            borderRadius: '20px',
            border: '1px solid #74777F',
            backgroundColor: '#FFFFFF',
            fontWeight: 800,
            fontSize: '13px',
            color: '#1F1F1F',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '10px',
            cursor: 'pointer',
            marginBottom: '16px',
          }}
        >
          <svg width="18" height="18" viewBox="0 0 24 24">
            <path
              fill="#4285F4"
              d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
            />
            <path
              fill="#34A853"
              d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
            />
            <path
              fill="#FBBC05"
              d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
            />
            <path
              fill="#EA4335"
              d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
            />
          </svg>
          Đăng Nhập Bằng Google
        </button>

        {/* Divider */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', margin: '14px 0 16px 0' }}>
          <div style={{ flex: 1, height: '1px', backgroundColor: '#E1E7F0' }} />
          <span style={{ fontSize: '11px', color: '#74777F', fontWeight: 600 }}>hoặc Email</span>
          <div style={{ flex: 1, height: '1px', backgroundColor: '#E1E7F0' }} />
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <div className="m3-form-group">
            <label className="m3-form-label">Email của bạn</label>
            <input
              type="email"
              required
              placeholder="nhap.email@domain.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="m3-input"
            />
          </div>

          <div className="m3-form-group">
            <label className="m3-form-label">Mật khẩu</label>
            <input
              type="password"
              required
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="m3-input"
            />
          </div>

          <button
            type="submit"
            className="m3-btn-filled"
            style={{ marginTop: '6px', width: '100%' }}
          >
            {isRegister ? 'Đăng Ký Tài Khoản' : 'Đăng Nhập'}
          </button>
        </form>

        {/* Switch Login/Register */}
        <div style={{ textAlign: 'center', marginTop: '16px', fontSize: '12px', color: '#74777F' }}>
          {isRegister ? 'Đã có tài khoản? ' : 'Chưa có tài khoản? '}
          <button
            type="button"
            onClick={() => setIsRegister(!isRegister)}
            style={{
              background: 'none',
              border: 'none',
              color: '#0B57D0',
              fontWeight: 800,
              cursor: 'pointer',
            }}
          >
            {isRegister ? 'Đăng nhập ngay' : 'Tạo tài khoản mới'}
          </button>
        </div>
      </div>
    </div>
  );
}
