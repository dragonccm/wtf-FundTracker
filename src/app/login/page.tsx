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
  const [email, setEmail] = useState('admin@fundtracker.vn');
  const [password, setPassword] = useState('123456');
  const [confirmPassword, setConfirmPassword] = useState('123456');
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
      }, 400);
    } else {
      setIsLoading(true);
      setTimeout(() => {
        login(email);
        setSuccessMsg('Đăng nhập thành công! Đang chuyển hướng...');
        setTimeout(() => {
          router.push('/dashboard');
        }, 600);
      }, 400);
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
    }, 500);
  };

  return (
    <div
      style={{
        minHeight: '100vh',
        backgroundColor: '#FEF7FF',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        padding: '24px 16px',
        fontFamily: "'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, 'Roboto', sans-serif",
      }}
    >
      {/* M3 Phone / Card Container */}
      <div
        style={{
          width: '100%',
          maxWidth: '420px',
          backgroundColor: '#F3EDF7',
          borderRadius: '32px',
          padding: '36px 28px',
          boxShadow: '0px 4px 20px 0px rgba(0, 0, 0, 0.06), 0px 1px 4px 0px rgba(0, 0, 0, 0.04)',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
        }}
      >
        {/* Brand Logo & Header */}
        <div
          style={{
            width: '64px',
            height: '64px',
            borderRadius: '20px',
            backgroundColor: '#EADDFF',
            color: '#21005D',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: '16px',
            boxShadow: '0 2px 8px rgba(103, 80, 164, 0.15)',
          }}
        >
          <span className="material-symbols-outlined" style={{ fontSize: '34px', color: '#6750A4' }}>
            account_balance_wallet
          </span>
        </div>

        <h1
          style={{
            fontSize: '24px',
            fontWeight: 900,
            color: '#1D1B20',
            textAlign: 'center',
            lineHeight: 1.2,
            margin: '0 0 6px 0',
          }}
        >
          Nhật Ký Quỹ
        </h1>
        <p
          style={{
            fontSize: '13px',
            color: '#49454F',
            textAlign: 'center',
            margin: '0 0 24px 0',
            fontWeight: 500,
          }}
        >
          Quản lý danh mục chứng chỉ quỹ chuẩn Material 3
        </p>

        {/* M3 Segmented Control (Login / Register Tabs) */}
        <div
          style={{
            width: '100%',
            display: 'flex',
            backgroundColor: '#ECE6F0',
            borderRadius: '9999px',
            padding: '4px',
            marginBottom: '20px',
          }}
        >
          <button
            type="button"
            onClick={() => {
              setAuthMode('LOGIN');
              setErrorMsg('');
            }}
            style={{
              flex: 1,
              padding: '10px 16px',
              border: 'none',
              borderRadius: '9999px',
              backgroundColor: authMode === 'LOGIN' ? '#E8DEF8' : 'transparent',
              color: authMode === 'LOGIN' ? '#1D192B' : '#49454F',
              fontSize: '13px',
              fontWeight: authMode === 'LOGIN' ? 800 : 600,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '6px',
              transition: 'all 0.2s cubic-bezier(0.2, 0, 0, 1)',
            }}
          >
            <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>
              login
            </span>
            Đăng Nhập
          </button>
          <button
            type="button"
            onClick={() => {
              setAuthMode('REGISTER');
              setErrorMsg('');
            }}
            style={{
              flex: 1,
              padding: '10px 16px',
              border: 'none',
              borderRadius: '9999px',
              backgroundColor: authMode === 'REGISTER' ? '#E8DEF8' : 'transparent',
              color: authMode === 'REGISTER' ? '#1D192B' : '#49454F',
              fontSize: '13px',
              fontWeight: authMode === 'REGISTER' ? 800 : 600,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '6px',
              transition: 'all 0.2s cubic-bezier(0.2, 0, 0, 1)',
            }}
          >
            <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>
              person_add
            </span>
            Đăng Ký
          </button>
        </div>

        {/* Google OAuth Button */}
        <button
          type="button"
          onClick={handleGoogleOAuth}
          disabled={isLoading}
          style={{
            width: '100%',
            padding: '12px 20px',
            borderRadius: '9999px',
            border: '1px solid #CAC4D0',
            backgroundColor: '#FFFFFF',
            color: '#1D1B20',
            fontSize: '14px',
            fontWeight: 700,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '12px',
            cursor: 'pointer',
            boxShadow: '0 1px 3px rgba(0,0,0,0.06)',
            transition: 'all 0.2s ease',
            marginBottom: '10px',
          }}
        >
          <svg width="20" height="20" viewBox="0 0 24 24">
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

        {/* Quick Demo Login Option */}
        <button
          type="button"
          onClick={handleQuickDemoGoogle}
          disabled={isLoading}
          style={{
            width: '100%',
            padding: '10px 16px',
            borderRadius: '9999px',
            border: 'none',
            backgroundColor: '#E8DEF8',
            color: '#1D192B',
            fontSize: '13px',
            fontWeight: 800,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '8px',
            cursor: 'pointer',
            marginBottom: '20px',
            transition: 'all 0.2s ease',
          }}
        >
          <span style={{ fontSize: '15px' }}>⚡</span>
          Đăng nhập nhanh tài khoản Google Demo
        </button>

        {/* Divider with Text */}
        <div
          style={{
            width: '100%',
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            marginBottom: '20px',
          }}
        >
          <div style={{ flex: 1, height: '1px', backgroundColor: '#CAC4D0' }} />
          <span style={{ fontSize: '11px', fontWeight: 800, color: '#49454F', letterSpacing: '0.5px' }}>
            HOẶC DÙNG EMAIL
          </span>
          <div style={{ flex: 1, height: '1px', backgroundColor: '#CAC4D0' }} />
        </div>

        {/* Feedback Messages */}
        {errorMsg && (
          <div
            style={{
              width: '100%',
              padding: '12px 16px',
              borderRadius: '16px',
              backgroundColor: '#FFDAD6',
              color: '#410002',
              fontSize: '13px',
              fontWeight: 700,
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              marginBottom: '16px',
            }}
          >
            <span className="material-symbols-outlined" style={{ fontSize: '20px' }}>
              error
            </span>
            <span>{errorMsg}</span>
          </div>
        )}

        {successMsg && (
          <div
            style={{
              width: '100%',
              padding: '12px 16px',
              borderRadius: '16px',
              backgroundColor: '#C8ECCB',
              color: '#00210B',
              fontSize: '13px',
              fontWeight: 700,
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              marginBottom: '16px',
            }}
          >
            <span className="material-symbols-outlined" style={{ fontSize: '20px' }}>
              check_circle
            </span>
            <span>{successMsg}</span>
          </div>
        )}

        {/* Main Email Form */}
        <form onSubmit={handleSubmit} style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: '14px' }}>
          {authMode === 'REGISTER' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <label style={{ fontSize: '12px', fontWeight: 700, color: '#49454F' }}>
                Họ và Tên
              </label>
              <input
                type="text"
                placeholder="Ví dụ: Nguyễn Văn A"
                value={name}
                onChange={(e) => setName(e.target.value)}
                style={{
                  width: '100%',
                  padding: '12px 16px',
                  borderRadius: '14px',
                  border: '1px solid #CAC4D0',
                  backgroundColor: '#FFFFFF',
                  color: '#1D1B20',
                  fontSize: '14px',
                  fontWeight: 600,
                  outline: 'none',
                  boxSizing: 'border-box',
                }}
              />
            </div>
          )}

          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <label style={{ fontSize: '12px', fontWeight: 700, color: '#49454F' }}>
              Địa chỉ Email
            </label>
            <input
              type="email"
              placeholder="name@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              style={{
                width: '100%',
                padding: '12px 16px',
                borderRadius: '14px',
                border: '1px solid #CAC4D0',
                backgroundColor: '#FFFFFF',
                color: '#1D1B20',
                fontSize: '14px',
                fontWeight: 600,
                outline: 'none',
                boxSizing: 'border-box',
              }}
            />
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <label style={{ fontSize: '12px', fontWeight: 700, color: '#49454F' }}>
              Mật khẩu
            </label>
            <input
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              style={{
                width: '100%',
                padding: '12px 16px',
                borderRadius: '14px',
                border: '1px solid #CAC4D0',
                backgroundColor: '#FFFFFF',
                color: '#1D1B20',
                fontSize: '14px',
                fontWeight: 600,
                outline: 'none',
                boxSizing: 'border-box',
              }}
            />
          </div>

          {authMode === 'REGISTER' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <label style={{ fontSize: '12px', fontWeight: 700, color: '#49454F' }}>
                Xác nhận Mật khẩu
              </label>
              <input
                type="password"
                placeholder="••••••••"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                style={{
                  width: '100%',
                  padding: '12px 16px',
                  borderRadius: '14px',
                  border: '1px solid #CAC4D0',
                  backgroundColor: '#FFFFFF',
                  color: '#1D1B20',
                  fontSize: '14px',
                  fontWeight: 600,
                  outline: 'none',
                  boxSizing: 'border-box',
                }}
              />
            </div>
          )}

          {authMode === 'LOGIN' && (
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', margin: '2px 0' }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12px', fontWeight: 700, color: '#49454F', cursor: 'pointer' }}>
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  style={{ accentColor: '#6750A4', width: '16px', height: '16px' }}
                />
                Ghi nhớ đăng nhập
              </label>
              <button
                type="button"
                onClick={() => alert('Vui lòng liên hệ quản trị viên hoặc sử dụng Đăng nhập Google để lấy lại mật khẩu.')}
                style={{ background: 'none', border: 'none', color: '#6750A4', fontSize: '12px', fontWeight: 800, cursor: 'pointer' }}
              >
                Quên mật khẩu?
              </button>
            </div>
          )}

          {/* Primary Submit Button (Mẫu 1: Filled M3 Button) */}
          <button
            type="submit"
            disabled={isLoading}
            style={{
              width: '100%',
              padding: '14px 24px',
              borderRadius: '9999px',
              border: 'none',
              backgroundColor: '#6750A4',
              color: '#FFFFFF',
              fontSize: '14px',
              fontWeight: 800,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              cursor: 'pointer',
              marginTop: '8px',
              boxShadow: '0px 2px 6px 2px rgba(0, 0, 0, 0.08)',
              transition: 'all 0.2s cubic-bezier(0.2, 0, 0, 1)',
            }}
          >
            <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>
              {authMode === 'LOGIN' ? 'arrow_forward' : 'how_to_reg'}
            </span>
            {isLoading ? 'Đang xử lý...' : authMode === 'LOGIN' ? 'Đăng Nhập' : 'Đăng Ký Tài Khoản'}
          </button>
        </form>

        {/* Footer switch prompt */}
        <div style={{ marginTop: '24px', textAlign: 'center', fontSize: '13px', color: '#49454F' }}>
          {authMode === 'LOGIN' ? (
            <>
              Chưa có tài khoản?{' '}
              <button
                type="button"
                onClick={() => setAuthMode('REGISTER')}
                style={{ background: 'none', border: 'none', color: '#6750A4', fontWeight: 900, cursor: 'pointer' }}
              >
                Đăng ký ngay
              </button>
            </>
          ) : (
            <>
              Đã có tài khoản?{' '}
              <button
                type="button"
                onClick={() => setAuthMode('LOGIN')}
                style={{ background: 'none', border: 'none', color: '#6750A4', fontWeight: 900, cursor: 'pointer' }}
              >
                Đăng nhập ngay
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: '#FEF7FF', fontFamily: 'sans-serif' }}>
          Đang tải trang đăng nhập...
        </div>
      }
    >
      <LoginFormContent />
    </Suspense>
  );
}
