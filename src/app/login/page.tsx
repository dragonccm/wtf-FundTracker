'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useAppStore } from '@/lib/store/appStore';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';

function LoginFormContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { login, updateProfile } = useAppStore();

  const [authMode, setAuthMode] = useState<'LOGIN' | 'REGISTER'>('LOGIN');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(true);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const err = searchParams.get('error');
    if (err) {
      setErrorMsg(`Lỗi đăng nhập Google: ${decodeURIComponent(err)}`);
    }
  }, [searchParams]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');

    if (!email.trim()) {
      setErrorMsg('Vui lòng nhập địa chỉ email hợp lệ');
      return;
    }

    if (!password) {
      setErrorMsg('Vui lòng nhập mật khẩu');
      return;
    }

    if (authMode === 'REGISTER') {
      if (password.length < 6) {
        setErrorMsg('Mật khẩu phải có ít nhất 6 ký tự');
        return;
      }
      if (password !== confirmPassword) {
        setErrorMsg('Mật khẩu xác nhận không khớp');
        return;
      }
      if (!name.trim()) {
        setErrorMsg('Vui lòng nhập họ và tên của bạn');
        return;
      }

      setIsLoading(true);
      setTimeout(() => {
        login(email);
        updateProfile({
          name: name.trim(),
          email: email.trim(),
        });
        setSuccessMsg('Đăng ký tài khoản thành công! Đang chuyển hướng...');
        setTimeout(() => {
          router.push('/dashboard');
        }, 600);
      }, 500);
    } else {
      setIsLoading(true);
      setTimeout(() => {
        login(email);
        setSuccessMsg('Đăng nhập thành công! Đang chuyển hướng...');
        setTimeout(() => {
          router.push('/dashboard');
        }, 600);
      }, 500);
    }
  };

  const handleGoogleOAuth = () => {
    setIsLoading(true);
    window.location.href = '/api/auth/google';
  };

  // Quick Demo Account Login for instant preview
  const handleQuickDemoGoogle = () => {
    setIsLoading(true);
    login('demo.investor@gmail.com');
    updateProfile({
      name: 'Nhà Đầu Tư M3',
      email: 'demo.investor@gmail.com',
      avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120',
    });
    setSuccessMsg('Đã đăng nhập tài khoản Google Demo! Đang vào hệ thống...');
    setTimeout(() => {
      router.push('/dashboard');
    }, 600);
  };

  return (
    <div
      style={{
        width: '100%',
        maxWidth: '430px',
        backgroundColor: 'var(--md-sys-color-surface-container)',
        borderRadius: '28px',
        padding: '32px 24px',
        boxShadow: 'var(--md-sys-elevation-2)',
        display: 'flex',
        flexDirection: 'column',
        gap: '20px',
      }}
    >
      {/* Brand Header */}
      <div style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        <div
          style={{
            width: '56px',
            height: '56px',
            borderRadius: '18px',
            backgroundColor: 'var(--md-sys-color-primary-container)',
            color: 'var(--md-sys-color-on-primary-container)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: '12px',
            boxShadow: 'var(--md-sys-elevation-1)',
          }}
        >
          <span className="material-symbols-outlined" style={{ fontSize: '28px' }}>
            account_balance_wallet
          </span>
        </div>
        <h1 style={{ fontSize: '24px', fontWeight: 900, color: 'var(--md-sys-color-on-surface)' }}>
          Nhật Ký Quỹ
        </h1>
        <p style={{ fontSize: '13px', color: 'var(--md-sys-color-on-surface-variant)', marginTop: '4px' }}>
          Quản lý danh mục chứng chỉ quỹ chuẩn Material 3
        </p>
      </div>

      {/* M3 Segmented Control (Switch between Login & Register) */}
      <div className="m3-segmented-control">
        <button
          type="button"
          onClick={() => {
            setAuthMode('LOGIN');
            setErrorMsg('');
            setSuccessMsg('');
          }}
          className={`m3-segment-btn ${authMode === 'LOGIN' ? 'active' : ''}`}
        >
          <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>login</span>
          Đăng Nhập
        </button>
        <button
          type="button"
          onClick={() => {
            setAuthMode('REGISTER');
            setErrorMsg('');
            setSuccessMsg('');
          }}
          className={`m3-segment-btn ${authMode === 'REGISTER' ? 'active' : ''}`}
        >
          <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>person_add</span>
          Đăng Ký
        </button>
      </div>

      {/* Error & Success Alerts */}
      {errorMsg && (
        <div
          style={{
            padding: '12px 14px',
            borderRadius: '16px',
            backgroundColor: 'var(--md-sys-color-error-container)',
            color: 'var(--md-sys-color-on-error-container)',
            fontSize: '13px',
            fontWeight: 700,
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
          }}
        >
          <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>error</span>
          <span>{errorMsg}</span>
        </div>
      )}

      {successMsg && (
        <div
          style={{
            padding: '12px 14px',
            borderRadius: '16px',
            backgroundColor: 'var(--md-sys-color-success-container)',
            color: 'var(--md-sys-color-on-success-container)',
            fontSize: '13px',
            fontWeight: 700,
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
          }}
        >
          <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>check_circle</span>
          <span>{successMsg}</span>
        </div>
      )}

      {/* Google OAuth Login Button */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
        <button
          type="button"
          onClick={handleGoogleOAuth}
          disabled={isLoading}
          style={{
            width: '100%',
            padding: '12px',
            borderRadius: '24px',
            border: '1px solid var(--md-sys-color-outline-variant)',
            backgroundColor: 'var(--md-sys-color-surface-container-lowest)',
            fontWeight: 800,
            fontSize: '13px',
            color: 'var(--md-sys-color-on-surface)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '10px',
            cursor: 'pointer',
            boxShadow: 'var(--md-sys-elevation-1)',
            transition: 'all 0.2s ease',
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
          Tiếp tục với Google OAuth
        </button>

        {/* Quick Demo Google Button */}
        <button
          type="button"
          onClick={handleQuickDemoGoogle}
          style={{
            background: 'none',
            border: 'none',
            color: 'var(--md-sys-color-primary)',
            fontSize: '12px',
            fontWeight: 800,
            cursor: 'pointer',
            textAlign: 'center',
            padding: '4px',
          }}
        >
          ⚡ Đăng nhập nhanh tài khoản Google Demo (Trải nghiệm ngay)
        </button>
      </div>

      {/* Divider */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
        <div style={{ flex: 1, height: '1px', backgroundColor: 'var(--md-sys-color-outline-variant)' }} />
        <span style={{ fontSize: '11px', color: 'var(--md-sys-color-on-surface-variant)', fontWeight: 700 }}>
          HOẶC DÙNG EMAIL
        </span>
        <div style={{ flex: 1, height: '1px', backgroundColor: 'var(--md-sys-color-outline-variant)' }} />
      </div>

      {/* Main Email Auth Form */}
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        {/* Name input (only for Register) */}
        {authMode === 'REGISTER' && (
          <div className="m3-form-group">
            <label className="m3-form-label">Họ và tên của bạn</label>
            <input
              type="text"
              required
              placeholder="VD: Nguyễn Văn A"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="m3-input"
            />
          </div>
        )}

        {/* Email input */}
        <div className="m3-form-group">
          <label className="m3-form-label">Địa chỉ Email</label>
          <input
            type="email"
            required
            placeholder="example@domain.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="m3-input"
          />
        </div>

        {/* Password input */}
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

        {/* Confirm Password input (only for Register) */}
        {authMode === 'REGISTER' && (
          <div className="m3-form-group">
            <label className="m3-form-label">Xác nhận mật khẩu</label>
            <input
              type="password"
              required
              placeholder="••••••••"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="m3-input"
            />
          </div>
        )}

        {/* Login Extra Options */}
        {authMode === 'LOGIN' && (
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '12px' }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer', color: 'var(--md-sys-color-on-surface-variant)', fontWeight: 600 }}>
              <input
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                style={{ accentColor: 'var(--md-sys-color-primary)' }}
              />
              Ghi nhớ đăng nhập
            </label>
            <button
              type="button"
              onClick={() => alert('Vui lòng liên hệ quản trị viên hoặc sử dụng Đăng nhập bằng Google để đặt lại mật khẩu.')}
              style={{
                background: 'none',
                border: 'none',
                color: 'var(--md-sys-color-primary)',
                fontWeight: 700,
                cursor: 'pointer',
              }}
            >
              Quên mật khẩu?
            </button>
          </div>
        )}

        {/* Submit Button */}
        <button
          type="submit"
          disabled={isLoading}
          className="m3-pill-btn-primary"
          style={{ width: '100%', padding: '12px', marginTop: '6px' }}
        >
          <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>
            {authMode === 'LOGIN' ? 'arrow_forward' : 'how_to_reg'}
          </span>
          {isLoading
            ? 'Đang xử lý...'
            : authMode === 'LOGIN'
            ? 'Đăng Nhập'
            : 'Tạo Tài Khoản Mới'}
        </button>
      </form>

      {/* Switch Mode Footer */}
      <div style={{ textAlign: 'center', fontSize: '13px', color: 'var(--md-sys-color-on-surface-variant)' }}>
        {authMode === 'LOGIN' ? 'Chưa có tài khoản? ' : 'Đã có tài khoản? '}
        <button
          type="button"
          onClick={() => {
            setAuthMode(authMode === 'LOGIN' ? 'REGISTER' : 'LOGIN');
            setErrorMsg('');
            setSuccessMsg('');
          }}
          style={{
            background: 'none',
            border: 'none',
            color: 'var(--md-sys-color-primary)',
            fontWeight: 800,
            cursor: 'pointer',
          }}
        >
          {authMode === 'LOGIN' ? 'Đăng ký ngay' : 'Đăng nhập tại đây'}
        </button>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: 'var(--md-sys-color-background)',
        padding: '16px',
      }}
    >
      <Suspense fallback={<div>Đang tải...</div>}>
        <LoginFormContent />
      </Suspense>
    </div>
  );
}
