'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useAppStore } from '@/lib/store/appStore';
import { useRouter, useSearchParams } from 'next/navigation';
import { authService, UserAccount } from '@/lib/auth/authService';

function LoginFormContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { login, updateProfile } = useAppStore();

  // Auth Mode: LOGIN or REGISTER
  const [authMode, setAuthMode] = useState<'LOGIN' | 'REGISTER'>('LOGIN');

  // Form Fields
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(true);

  // UI state
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // Modals
  const [isForgotModalOpen, setIsForgotModalOpen] = useState(false);
  const [forgotEmail, setForgotEmail] = useState('');
  const [forgotNewPass, setForgotNewPass] = useState('');
  const [forgotStatus, setForgotStatus] = useState<{ type: 'error' | 'success'; text: string } | null>(null);

  const [isGooglePickerOpen, setIsGooglePickerOpen] = useState(false);
  const [recentAccounts, setRecentAccounts] = useState<UserAccount[]>([]);

  // Load remembered email and recent accounts on mount
  useEffect(() => {
    const remembered = authService.getRememberedEmail();
    if (remembered) {
      setEmail(remembered);
    } else {
      setEmail('admin@fundtracker.vn');
      setPassword('password123');
    }
    setRecentAccounts(authService.getRecentAccounts());

    const err = searchParams.get('error');
    if (err) {
      setErrorMsg(`Lỗi đăng nhập Google: ${decodeURIComponent(err)}`);
    }
  }, [searchParams]);

  // Password strength calculation
  const getPasswordStrength = (pass: string) => {
    if (!pass) return { score: 0, text: '', color: '#CAC4D0' };
    if (pass.length < 6) return { score: 1, text: 'Quá ngắn (tối thiểu 6 ký tự)', color: '#BA1A1A' };
    let score = 1;
    if (pass.length >= 8) score += 1;
    if (/[A-Z]/.test(pass) || /[0-9]/.test(pass)) score += 1;
    if (/[^A-Za-z0-9]/.test(pass)) score += 1;

    if (score <= 2) return { score: 2, text: 'Mật khẩu trung bình', color: '#ECA354' };
    return { score: 3, text: 'Mật khẩu mạnh', color: '#2E6C38' };
  };

  const passStrength = getPasswordStrength(password);

  // Handle Form Submit
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');

    if (!email.trim()) {
      setErrorMsg('Vui lòng nhập địa chỉ email.');
      return;
    }
    if (!password) {
      setErrorMsg('Vui lòng nhập mật khẩu.');
      return;
    }

    if (authMode === 'REGISTER') {
      if (!name.trim()) {
        setErrorMsg('Vui lòng nhập họ và tên của bạn.');
        return;
      }
      if (password.length < 6) {
        setErrorMsg('Mật khẩu phải có độ dài tối thiểu 6 ký tự.');
        return;
      }
      if (password !== confirmPassword) {
        setErrorMsg('Mật khẩu xác nhận không trùng khớp.');
        return;
      }

      setIsLoading(true);
      const res = authService.registerUser({
        name: name.trim(),
        email: email.trim(),
        password: password.trim(),
      });

      if (!res.success) {
        setIsLoading(false);
        setErrorMsg(res.error || 'Đăng ký không thành công.');
        return;
      }

      if (rememberMe) authService.setRememberedEmail(email.trim());
      login(res.user!.email, res.user!.name, res.user!.avatarUrl);

      setSuccessMsg('Đăng ký tài khoản thành công! Đang chuyển đến bảng điều khiển...');
      setTimeout(() => {
        router.push('/dashboard');
      }, 700);
    } else {
      setIsLoading(true);
      const res = authService.authenticateUser(email, password);

      if (!res.success) {
        setIsLoading(false);
        setErrorMsg(res.error || 'Đăng nhập không thành công.');
        return;
      }

      if (rememberMe) {
        authService.setRememberedEmail(email.trim());
      } else {
        authService.setRememberedEmail('');
      }

      login(res.user!.email, res.user!.name, res.user!.avatarUrl);
      setSuccessMsg('Đăng nhập thành công! Đang vào hệ thống...');
      setTimeout(() => {
        router.push('/dashboard');
      }, 600);
    }
  };

  // One-click quick login from Saved Account
  const handleQuickAccountLogin = (account: UserAccount) => {
    setIsLoading(true);
    setEmail(account.email);
    authService.saveRecentAccount(account);
    login(account.email, account.name, account.avatarUrl);
    setSuccessMsg(`Chào mừng ${account.name}! Đang mở danh mục...`);
    setTimeout(() => {
      router.push('/dashboard');
    }, 600);
  };

  // Google OAuth flow
  const handleGoogleOAuthRedirect = () => {
    setIsLoading(true);
    window.location.href = '/api/auth/google';
  };

  // Google Mock Sign-in (Instant picker for Demo accounts)
  const handleGoogleMockSelect = (googleUser: { email: string; name: string; avatarUrl: string }) => {
    setIsLoading(true);
    setIsGooglePickerOpen(false);
    const user = authService.googleLogin(googleUser);
    login(user.email, user.name, user.avatarUrl);
    setSuccessMsg(`Đã đăng nhập tài khoản Google: ${user.name}!`);
    setTimeout(() => {
      router.push('/dashboard');
    }, 600);
  };

  // Handle Forgot Password Reset
  const handleResetPasswordSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setForgotStatus(null);
    const res = authService.resetPassword(forgotEmail, forgotNewPass);
    if (!res.success) {
      setForgotStatus({ type: 'error', text: res.error || 'Không thể đặt lại mật khẩu.' });
    } else {
      setForgotStatus({
        type: 'success',
        text: 'Đặt lại mật khẩu thành công! Bạn có thể đăng nhập bằng mật khẩu mới ngay.',
      });
      setPassword(forgotNewPass);
      setEmail(forgotEmail);
      setTimeout(() => {
        setIsForgotModalOpen(false);
        setForgotStatus(null);
      }, 1500);
    }
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
      {/* Main Form Container Card */}
      <div
        style={{
          width: '100%',
          maxWidth: '430px',
          backgroundColor: '#F3EDF7',
          borderRadius: '32px',
          padding: '36px 28px',
          boxShadow: '0px 4px 24px rgba(0, 0, 0, 0.07)',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          boxSizing: 'border-box',
        }}
      >
        {/* Brand Icon & Heading */}
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
            marginBottom: '14px',
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
            margin: '0 0 22px 0',
            fontWeight: 500,
          }}
        >
          Quản lý danh mục chứng chỉ quỹ chuẩn Material 3
        </p>

        {/* M3 Segmented Control (Tabs: Đăng Nhập / Đăng Ký) */}
        <div
          style={{
            width: '100%',
            display: 'flex',
            backgroundColor: '#ECE6F0',
            borderRadius: '9999px',
            padding: '4px',
            marginBottom: '20px',
            boxSizing: 'border-box',
          }}
        >
          <button
            type="button"
            onClick={() => {
              setAuthMode('LOGIN');
              setErrorMsg('');
              setSuccessMsg('');
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
              setSuccessMsg('');
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

        {/* Google OAuth & Fast Sign-in Section */}
        <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '18px' }}>
          {/* Official Google OAuth Trigger */}
          <button
            type="button"
            onClick={handleGoogleOAuthRedirect}
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

          {/* Quick Google Picker Button */}
          <button
            type="button"
            onClick={() => setIsGooglePickerOpen(true)}
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
              transition: 'all 0.2s ease',
            }}
          >
            <span className="material-symbols-outlined" style={{ fontSize: '18px', color: '#6750A4' }}>
              bolt
            </span>
            Đăng nhập nhanh tài khoản Google Demo
          </button>
        </div>

        {/* Saved Accounts Quick Chooser (Google Account Selector pattern) */}
        {authMode === 'LOGIN' && recentAccounts.length > 0 && (
          <div
            style={{
              width: '100%',
              backgroundColor: '#FFFFFF',
              borderRadius: '18px',
              padding: '12px 14px',
              marginBottom: '18px',
              boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
              border: '1px solid #ECE6F0',
            }}
          >
            <div
              style={{
                fontSize: '11px',
                fontWeight: 800,
                color: '#6750A4',
                textTransform: 'uppercase',
                letterSpacing: '0.5px',
                marginBottom: '8px',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
              }}
            >
              <span className="material-symbols-outlined" style={{ fontSize: '14px' }}>
                manage_accounts
              </span>
              Tài khoản đã lưu trên thiết bị
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              {recentAccounts.map((acc) => (
                <div
                  key={acc.email}
                  onClick={() => handleQuickAccountLogin(acc)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '8px 10px',
                    borderRadius: '12px',
                    backgroundColor: '#F8F9FA',
                    cursor: 'pointer',
                    transition: 'background-color 0.15s ease',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <img
                      src={
                        acc.avatarUrl ||
                        `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(acc.name)}`
                      }
                      alt={acc.name}
                      style={{ width: '32px', height: '32px', borderRadius: '50%', objectFit: 'cover' }}
                    />
                    <div>
                      <div style={{ fontSize: '13px', fontWeight: 800, color: '#1D1B20', lineHeight: 1.2 }}>
                        {acc.name}
                      </div>
                      <div style={{ fontSize: '11px', color: '#49454F' }}>{acc.email}</div>
                    </div>
                  </div>

                  <span className="material-symbols-outlined" style={{ fontSize: '18px', color: '#6750A4' }}>
                    arrow_forward_ios
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Divider with Text */}
        <div
          style={{
            width: '100%',
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            marginBottom: '18px',
          }}
        >
          <div style={{ flex: 1, height: '1px', backgroundColor: '#CAC4D0' }} />
          <span style={{ fontSize: '11px', fontWeight: 800, color: '#49454F', letterSpacing: '0.5px' }}>
            HOẶC DÙNG EMAIL
          </span>
          <div style={{ flex: 1, height: '1px', backgroundColor: '#CAC4D0' }} />
        </div>

        {/* Alerts / Error & Success Banners */}
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
              boxSizing: 'border-box',
            }}
          >
            <span className="material-symbols-outlined" style={{ fontSize: '20px', color: '#BA1A1A' }}>
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
              boxSizing: 'border-box',
            }}
          >
            <span className="material-symbols-outlined" style={{ fontSize: '20px', color: '#2E6C38' }}>
              check_circle
            </span>
            <span>{successMsg}</span>
          </div>
        )}

        {/* Main Email & Password Form */}
        <form
          onSubmit={handleSubmit}
          style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: '14px' }}
        >
          {/* Register Name Field */}
          {authMode === 'REGISTER' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <label style={{ fontSize: '12px', fontWeight: 700, color: '#49454F' }}>
                Họ và Tên
              </label>
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  backgroundColor: '#FFFFFF',
                  borderRadius: '14px',
                  border: '1px solid #CAC4D0',
                  padding: '0 14px',
                }}
              >
                <span className="material-symbols-outlined" style={{ fontSize: '18px', color: '#79747E', marginRight: '8px' }}>
                  badge
                </span>
                <input
                  type="text"
                  placeholder="Ví dụ: Nguyễn Văn A"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '12px 0',
                    border: 'none',
                    backgroundColor: 'transparent',
                    color: '#1D1B20',
                    fontSize: '14px',
                    fontWeight: 600,
                    outline: 'none',
                  }}
                />
              </div>
            </div>
          )}

          {/* Email Field */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <label style={{ fontSize: '12px', fontWeight: 700, color: '#49454F' }}>
              Địa chỉ Email
            </label>
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                backgroundColor: '#FFFFFF',
                borderRadius: '14px',
                border: '1px solid #CAC4D0',
                padding: '0 14px',
              }}
            >
              <span className="material-symbols-outlined" style={{ fontSize: '18px', color: '#79747E', marginRight: '8px' }}>
                mail
              </span>
              <input
                type="email"
                placeholder="name@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                style={{
                  width: '100%',
                  padding: '12px 0',
                  border: 'none',
                  backgroundColor: 'transparent',
                  color: '#1D1B20',
                  fontSize: '14px',
                  fontWeight: 600,
                  outline: 'none',
                }}
              />
            </div>
          </div>

          {/* Password Field with Show/Hide Toggle */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <label style={{ fontSize: '12px', fontWeight: 700, color: '#49454F' }}>
              Mật khẩu
            </label>
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                backgroundColor: '#FFFFFF',
                borderRadius: '14px',
                border: '1px solid #CAC4D0',
                padding: '0 14px',
              }}
            >
              <span className="material-symbols-outlined" style={{ fontSize: '18px', color: '#79747E', marginRight: '8px' }}>
                lock
              </span>
              <input
                type={showPassword ? 'text' : 'password'}
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                style={{
                  width: '100%',
                  padding: '12px 0',
                  border: 'none',
                  backgroundColor: 'transparent',
                  color: '#1D1B20',
                  fontSize: '14px',
                  fontWeight: 600,
                  outline: 'none',
                }}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                style={{
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  color: '#79747E',
                  display: 'flex',
                  alignItems: 'center',
                  padding: '4px',
                }}
              >
                <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>
                  {showPassword ? 'visibility_off' : 'visibility'}
                </span>
              </button>
            </div>

            {/* Password Strength Indicator (Register mode) */}
            {authMode === 'REGISTER' && password && (
              <div style={{ marginTop: '4px', display: 'flex', flexDirection: 'column', gap: '3px' }}>
                <div style={{ display: 'flex', gap: '4px', height: '4px' }}>
                  <div
                    style={{
                      flex: 1,
                      borderRadius: '2px',
                      backgroundColor: passStrength.score >= 1 ? passStrength.color : '#CAC4D0',
                    }}
                  />
                  <div
                    style={{
                      flex: 1,
                      borderRadius: '2px',
                      backgroundColor: passStrength.score >= 2 ? passStrength.color : '#CAC4D0',
                    }}
                  />
                  <div
                    style={{
                      flex: 1,
                      borderRadius: '2px',
                      backgroundColor: passStrength.score >= 3 ? passStrength.color : '#CAC4D0',
                    }}
                  />
                </div>
                <span style={{ fontSize: '11px', fontWeight: 700, color: passStrength.color }}>
                  {passStrength.text}
                </span>
              </div>
            )}
          </div>

          {/* Confirm Password Field (Register mode) */}
          {authMode === 'REGISTER' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <label style={{ fontSize: '12px', fontWeight: 700, color: '#49454F' }}>
                Xác nhận Mật khẩu
              </label>
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  backgroundColor: '#FFFFFF',
                  borderRadius: '14px',
                  border: '1px solid #CAC4D0',
                  padding: '0 14px',
                }}
              >
                <span className="material-symbols-outlined" style={{ fontSize: '18px', color: '#79747E', marginRight: '8px' }}>
                  lock_reset
                </span>
                <input
                  type={showConfirmPassword ? 'text' : 'password'}
                  placeholder="••••••••"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '12px 0',
                    border: 'none',
                    backgroundColor: 'transparent',
                    color: '#1D1B20',
                    fontSize: '14px',
                    fontWeight: 600,
                    outline: 'none',
                  }}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  style={{
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    color: '#79747E',
                    display: 'flex',
                    alignItems: 'center',
                    padding: '4px',
                  }}
                >
                  <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>
                    {showConfirmPassword ? 'visibility_off' : 'visibility'}
                  </span>
                </button>
              </div>
            </div>
          )}

          {/* Login Options: Remember Me & Forgot Password */}
          {authMode === 'LOGIN' && (
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                margin: '2px 0',
              }}
            >
              <label
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  fontSize: '12px',
                  fontWeight: 700,
                  color: '#49454F',
                  cursor: 'pointer',
                }}
              >
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
                onClick={() => {
                  setForgotEmail(email);
                  setIsForgotModalOpen(true);
                }}
                style={{
                  background: 'none',
                  border: 'none',
                  color: '#6750A4',
                  fontSize: '12px',
                  fontWeight: 800,
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
              boxShadow: '0px 2px 6px rgba(0, 0, 0, 0.08)',
              transition: 'all 0.2s cubic-bezier(0.2, 0, 0, 1)',
            }}
          >
            <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>
              {authMode === 'LOGIN' ? 'arrow_forward' : 'how_to_reg'}
            </span>
            {isLoading ? 'Đang xử lý...' : authMode === 'LOGIN' ? 'Đăng Nhập' : 'Tạo Tài Khoản Mới'}
          </button>
        </form>

        {/* Footer switch prompt */}
        <div style={{ marginTop: '24px', textAlign: 'center', fontSize: '13px', color: '#49454F' }}>
          {authMode === 'LOGIN' ? (
            <>
              Chưa có tài khoản?{' '}
              <button
                type="button"
                onClick={() => {
                  setAuthMode('REGISTER');
                  setErrorMsg('');
                  setSuccessMsg('');
                }}
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
                onClick={() => {
                  setAuthMode('LOGIN');
                  setErrorMsg('');
                  setSuccessMsg('');
                }}
                style={{ background: 'none', border: 'none', color: '#6750A4', fontWeight: 900, cursor: 'pointer' }}
              >
                Đăng nhập ngay
              </button>
            </>
          )}
        </div>
      </div>

      {/* =========================================================================
          MODAL 1: FORGOT PASSWORD DIALOG
          ========================================================================= */}
      {isForgotModalOpen && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.45)',
            zIndex: 300,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '16px',
          }}
        >
          <div
            style={{
              width: '100%',
              maxWidth: '380px',
              backgroundColor: '#FFFFFF',
              borderRadius: '28px',
              padding: '24px',
              boxShadow: '0 4px 24px rgba(0,0,0,0.15)',
              display: 'flex',
              flexDirection: 'column',
              gap: '16px',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span className="material-symbols-outlined" style={{ color: '#6750A4' }}>
                  lock_reset
                </span>
                <h3 style={{ margin: 0, fontSize: '18px', fontWeight: 800 }}>Đặt Lại Mật Khẩu</h3>
              </div>
              <button
                type="button"
                onClick={() => setIsForgotModalOpen(false)}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#79747E' }}
              >
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>

            <p style={{ fontSize: '13px', color: '#49454F', margin: 0 }}>
              Nhập email tài khoản của bạn và thiết lập mật khẩu mới ngay lập tức.
            </p>

            {forgotStatus && (
              <div
                style={{
                  padding: '10px 14px',
                  borderRadius: '12px',
                  backgroundColor: forgotStatus.type === 'error' ? '#FFDAD6' : '#C8ECCB',
                  color: forgotStatus.type === 'error' ? '#410002' : '#00210B',
                  fontSize: '12px',
                  fontWeight: 700,
                }}
              >
                {forgotStatus.text}
              </div>
            )}

            <form onSubmit={handleResetPasswordSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                <label style={{ fontSize: '12px', fontWeight: 700, color: '#49454F' }}>Email</label>
                <input
                  type="email"
                  required
                  placeholder="name@example.com"
                  value={forgotEmail}
                  onChange={(e) => setForgotEmail(e.target.value)}
                  style={{
                    padding: '10px 14px',
                    borderRadius: '12px',
                    border: '1px solid #CAC4D0',
                    outline: 'none',
                    fontSize: '13px',
                  }}
                />
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                <label style={{ fontSize: '12px', fontWeight: 700, color: '#49454F' }}>Mật khẩu mới (tối thiểu 6 ký tự)</label>
                <input
                  type="password"
                  required
                  placeholder="••••••••"
                  value={forgotNewPass}
                  onChange={(e) => setForgotNewPass(e.target.value)}
                  style={{
                    padding: '10px 14px',
                    borderRadius: '12px',
                    border: '1px solid #CAC4D0',
                    outline: 'none',
                    fontSize: '13px',
                  }}
                />
              </div>

              <div style={{ display: 'flex', gap: '8px', marginTop: '6px' }}>
                <button
                  type="button"
                  onClick={() => setIsForgotModalOpen(false)}
                  style={{
                    flex: 1,
                    padding: '10px',
                    borderRadius: '9999px',
                    border: '1px solid #CAC4D0',
                    background: 'transparent',
                    fontWeight: 700,
                    cursor: 'pointer',
                  }}
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  style={{
                    flex: 1,
                    padding: '10px',
                    borderRadius: '9999px',
                    border: 'none',
                    backgroundColor: '#6750A4',
                    color: '#FFFFFF',
                    fontWeight: 800,
                    cursor: 'pointer',
                  }}
                >
                  Cập Nhật
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* =========================================================================
          MODAL 2: GOOGLE ACCOUNT PICKER (Instant Demo Select)
          ========================================================================= */}
      {isGooglePickerOpen && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.45)',
            zIndex: 300,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '16px',
          }}
        >
          <div
            style={{
              width: '100%',
              maxWidth: '400px',
              backgroundColor: '#FFFFFF',
              borderRadius: '28px',
              padding: '24px',
              boxShadow: '0 4px 24px rgba(0,0,0,0.15)',
              display: 'flex',
              flexDirection: 'column',
              gap: '16px',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <svg width="22" height="22" viewBox="0 0 24 24">
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
                <h3 style={{ margin: 0, fontSize: '17px', fontWeight: 800 }}>Chọn Tài Khoản Google</h3>
              </div>
              <button
                type="button"
                onClick={() => setIsGooglePickerOpen(false)}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#79747E' }}
              >
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>

            <p style={{ fontSize: '13px', color: '#49454F', margin: 0 }}>
              Chọn tài khoản Google để đăng nhập ngay lập tức:
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {[
                {
                  name: 'Nhà Đầu Tư M3',
                  email: 'demo.investor@gmail.com',
                  avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120',
                  badge: 'Tài khoản Trải nghiệm',
                },
                {
                  name: 'Dragon Capital Pro',
                  email: 'investor@dragoncapital.com',
                  avatarUrl: 'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?w=120',
                  badge: 'Nhà Đầu Tư VIP',
                },
                {
                  name: 'Quản Trị Viên Hệ Thống',
                  email: 'admin@fundtracker.vn',
                  avatarUrl: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=120',
                  badge: 'Admin',
                },
              ].map((item) => (
                <div
                  key={item.email}
                  onClick={() => handleGoogleMockSelect(item)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '12px 14px',
                    borderRadius: '16px',
                    border: '1px solid #ECE6F0',
                    backgroundColor: '#F8F9FA',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <img
                      src={item.avatarUrl}
                      alt={item.name}
                      style={{ width: '38px', height: '38px', borderRadius: '50%', objectFit: 'cover' }}
                    />
                    <div>
                      <div style={{ fontSize: '14px', fontWeight: 800, color: '#1D1B20' }}>
                        {item.name}
                      </div>
                      <div style={{ fontSize: '12px', color: '#49454F' }}>{item.email}</div>
                    </div>
                  </div>
                  <span
                    style={{
                      fontSize: '11px',
                      fontWeight: 700,
                      color: '#6750A4',
                      backgroundColor: '#EADDFF',
                      padding: '3px 8px',
                      borderRadius: '8px',
                    }}
                  >
                    {item.badge}
                  </span>
                </div>
              ))}
            </div>

            <div style={{ borderTop: '1px solid #ECE6F0', paddingTop: '10px' }}>
              <button
                type="button"
                onClick={handleGoogleOAuthRedirect}
                style={{
                  width: '100%',
                  padding: '10px',
                  borderRadius: '9999px',
                  border: 'none',
                  backgroundColor: '#E8DEF8',
                  color: '#1D192B',
                  fontSize: '13px',
                  fontWeight: 800,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                }}
              >
                <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>
                  add_circle
                </span>
                Sử dụng tài khoản Google khác
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <div
          style={{
            minHeight: '100vh',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: '#FEF7FF',
            fontFamily: 'sans-serif',
          }}
        >
          Đang tải trang đăng nhập...
        </div>
      }
    >
      <LoginFormContent />
    </Suspense>
  );
}
