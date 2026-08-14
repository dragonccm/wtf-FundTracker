'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAppStore } from '@/lib/store/appStore';
import { authService } from '@/lib/auth/authService';
import AddTransactionModal from '../transactions/AddTransactionModal';
import M3SearchBar from '../search/M3SearchBar';
import M3FabMenu from './M3FabMenu';

export default function AppNavigation({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { user, portfolios, activePortfolioId, setActivePortfolioId, addPortfolio, isAuthenticated, login, logout } = useAppStore();
  
  const [isAddTxOpen, setIsAddTxOpen] = useState(false);
  const [isMoreMenuOpen, setIsMoreMenuOpen] = useState(false);
  const [isPortfolioModalOpen, setIsPortfolioModalOpen] = useState(false);
  const [isCreatePortModalOpen, setIsCreatePortModalOpen] = useState(false);
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);

  const [newPortName, setNewPortName] = useState('');
  const [newPortDesc, setNewPortDesc] = useState('');

  // Standalone Auth Pages (No Header/Bottom bar)
  if (pathname === '/login' || pathname === '/login/success') {
    return <>{children}</>;
  }

  // Logged Out Screen (Màn hình báo Hãy Đăng Nhập khi đã đăng xuất)
  if (!isAuthenticated) {
    return (
      <div
        style={{
          minHeight: '100vh',
          backgroundColor: 'var(--md-sys-color-background)',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          padding: '16px',
        }}
      >
        <div
          style={{
            width: '100%',
            maxWidth: '400px',
            backgroundColor: 'var(--md-sys-color-surface-container)',
            borderRadius: '28px',
            padding: '36px 24px',
            boxShadow: 'var(--md-sys-elevation-2)',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            textAlign: 'center',
            gap: '18px',
          }}
        >
          {/* Lock Icon */}
          <div
            style={{
              width: '64px',
              height: '64px',
              borderRadius: '20px',
              backgroundColor: 'var(--md-sys-color-primary-container)',
              color: 'var(--md-sys-color-on-primary-container)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: 'var(--md-sys-elevation-1)',
            }}
          >
            <span className="material-symbols-outlined" style={{ fontSize: '32px' }}>
              lock_open
            </span>
          </div>

          <div>
            <h2 style={{ fontSize: '20px', fontWeight: 900, color: 'var(--md-sys-color-on-surface)' }}>
              Bạn Đã Đăng Xuất
            </h2>
            <p style={{ fontSize: '13px', color: 'var(--md-sys-color-on-surface-variant)', marginTop: '6px', lineHeight: 1.5 }}>
              Phiên làm việc đã kết thúc. Vui lòng đăng nhập để tiếp tục theo dõi danh mục đầu tư chứng chỉ quỹ và đồng bộ tài sản.
            </p>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', width: '100%', marginTop: '6px' }}>
            {/* Primary Login Button */}
            <Link
              href="/login"
              className="m3-btn-filled"
              style={{ width: '100%', padding: '12px', textDecoration: 'none' }}
            >
              <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>login</span>
              Đăng Nhập Tài Khoản
            </Link>

            {/* Google OAuth Login Button */}
            <button
              type="button"
              onClick={() => {
                window.location.href = '/api/auth/google';
              }}
              style={{
                width: '100%',
                padding: '11px',
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
              Tiếp Tục Với Google
            </button>

            {/* Quick Demo Access Button */}
            <button
              type="button"
              onClick={() => {
                login('demo.investor@gmail.com');
              }}
              style={{
                background: 'none',
                border: 'none',
                color: 'var(--md-sys-color-primary)',
                fontSize: '12px',
                fontWeight: 800,
                cursor: 'pointer',
                padding: '6px',
              }}
            >
              ⚡ Xem nhanh danh mục với Tài khoản Demo
            </button>
          </div>
        </div>
      </div>
    );
  }

  // 4 Bottom Navigation Bar standard M3 Destinations
  const mainNavItems = [
    { href: '/dashboard', label: 'Tổng quan', icon: 'dashboard' },
    { href: '/portfolio', label: 'Danh mục', icon: 'pie_chart' },
    { href: '/transactions', label: 'Giao dịch', icon: 'receipt_long' },
    { href: '/goals', label: 'Mục tiêu', icon: 'flag' },
  ];

  // More menu items
  const moreNavItems = [
    { href: '/performance', label: 'Hiệu suất & XIRR', icon: 'query_stats', desc: 'Tính XIRR dòng tiền' },
    { href: '/import-export', label: 'Import / Export', icon: 'upload_file', desc: 'Đồng bộ Excel' },
    { href: '/funds', label: 'Tra cứu giá Quỹ', icon: 'finance_chip', desc: 'NAV lịch sử các quỹ' },
    { href: '/timeline', label: 'Lịch sử tài chính', icon: 'timeline', desc: 'Timeline sự kiện' },
    { href: '/settings', label: 'Cài đặt tài khoản', icon: 'settings', desc: 'Cấu hình cá nhân' },
  ];

  const activePort = portfolios.find((p) => p.id === activePortfolioId);

  const handleCreatePortfolio = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPortName.trim()) return;
    addPortfolio({
      name: newPortName,
      description: newPortDesc,
      color: '#6750A4',
    });
    setNewPortName('');
    setNewPortDesc('');
    setIsCreatePortModalOpen(false);
    setIsPortfolioModalOpen(false);
  };

  return (
    <div
      style={{
        minHeight: '100vh',
        backgroundColor: 'var(--md-sys-color-background)',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'flex-start',
      }}
    >
      {/* Phone Frame Container (390px - 440px width matching Figma Example Compact Class) */}
      <div
        style={{
          width: '100%',
          maxWidth: '430px',
          minHeight: '100vh',
          backgroundColor: 'var(--md-sys-color-background)',
          display: 'flex',
          flexDirection: 'column',
          position: 'relative',
          boxShadow: '0 0 40px rgba(0, 0, 0, 0.05)',
        }}
      >
        {/* M3 Standard Top App Bar (As seen in Figma Example Layouts Header) */}
        <header
          style={{
            position: 'sticky',
            top: 0,
            zIndex: 90,
            backgroundColor: 'var(--md-sys-color-background)',
            padding: '12px 16px 8px 16px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          {/* Left: Brand Icon & Title */}
          <Link href="/dashboard" style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div
              style={{
                width: '36px',
                height: '36px',
                borderRadius: '12px',
                backgroundColor: 'var(--md-sys-color-primary-container)',
                color: 'var(--md-sys-color-on-primary-container)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontWeight: 900,
                fontSize: '15px',
              }}
            >
              <span className="material-symbols-outlined" style={{ fontSize: '20px' }}>
                account_balance_wallet
              </span>
            </div>
            <div>
              <div style={{ fontSize: '17px', fontWeight: 800, color: 'var(--md-sys-color-on-surface)', lineHeight: 1.2 }}>
                Nhật Ký Quỹ
              </div>
            </div>
          </Link>

          {/* Right Action Icons: Portfolio Switcher, More widgets, Profile Avatar */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            {/* Portfolio Switcher Chip */}
            <button
              onClick={() => setIsPortfolioModalOpen(true)}
              style={{
                padding: '6px 12px',
                borderRadius: '20px',
                border: '1px solid var(--md-sys-color-outline-variant)',
                backgroundColor: 'var(--md-sys-color-surface-container-low)',
                color: 'var(--md-sys-color-on-surface)',
                fontSize: '12px',
                fontWeight: 700,
                display: 'flex',
                alignItems: 'center',
                gap: '4px',
                cursor: 'pointer',
              }}
            >
              <span className="material-symbols-outlined" style={{ fontSize: '15px', color: 'var(--md-sys-color-primary)' }}>
                folder
              </span>
              <span style={{ maxWidth: '80px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {activePortfolioId === 'ALL' ? 'Tất cả' : activePort?.name}
              </span>
              <span className="material-symbols-outlined" style={{ fontSize: '16px', color: 'var(--md-sys-color-on-surface-variant)' }}>
                expand_more
              </span>
            </button>

            {/* More Menu Trigger Button */}
            <button
              onClick={() => setIsMoreMenuOpen(true)}
              style={{
                width: '36px',
                height: '36px',
                borderRadius: '50%',
                border: 'none',
                backgroundColor: 'transparent',
                color: 'var(--md-sys-color-on-surface-variant)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
              }}
            >
              <span className="material-symbols-outlined" style={{ fontSize: '22px' }}>
                widgets
              </span>
            </button>

            {/* Profile Avatar Button (Opens Google Profile Switcher Dialog) */}
            <button
              type="button"
              onClick={() => setIsProfileMenuOpen(true)}
              style={{
                width: '34px',
                height: '34px',
                borderRadius: '50%',
                overflow: 'hidden',
                border: '1.5px solid var(--md-sys-color-primary)',
                display: 'block',
                padding: 0,
                background: 'none',
                cursor: 'pointer',
              }}
            >
              <img
                src={user.avatarUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100'}
                alt={user.name}
                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
              />
            </button>
          </div>
        </header>

        {/* Main Content Area */}
        <main style={{ flex: 1, padding: '8px 16px 110px 16px' }}>{children}</main>

        {/* M3 Speed Dial FAB Menu (Mẫu 10: Official Material 3 Component) */}
        <M3FabMenu
          onOpenAddTx={() => setIsAddTxOpen(true)}
          onOpenCreatePortfolio={() => setIsCreatePortModalOpen(true)}
        />

        {/* Official M3 Bottom Navigation Bar (Standard 80px Height with Capsule Pill Active Indicator) */}
        <nav
          style={{
            position: 'fixed',
            bottom: 0,
            left: '50%',
            transform: 'translateX(-50%)',
            width: '100%',
            maxWidth: '430px',
            height: '80px',
            backgroundColor: 'var(--md-sys-color-surface-container)',
            borderTop: '1px solid var(--md-sys-color-surface-container-highest)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-around',
            padding: '0 8px',
            zIndex: 99,
          }}
        >
          {mainNavItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: '4px',
                  textDecoration: 'none',
                  flex: 1,
                  padding: '4px 0',
                }}
              >
                {/* M3 Active Capsule Pill (64px x 32px standard) */}
                <div
                  style={{
                    width: '64px',
                    height: '32px',
                    borderRadius: '16px',
                    backgroundColor: isActive ? 'var(--md-sys-color-secondary-container)' : 'transparent',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    transition: 'all 0.2s cubic-bezier(0.2, 0, 0, 1)',
                  }}
                >
                  <span
                    className="material-symbols-outlined"
                    style={{
                      fontSize: '22px',
                      color: isActive ? 'var(--md-sys-color-on-secondary-container)' : 'var(--md-sys-color-on-surface-variant)',
                      fontVariationSettings: isActive ? "'FILL' 1" : "'FILL' 0",
                    }}
                  >
                    {item.icon}
                  </span>
                </div>

                {/* Destination Label */}
                <span
                  style={{
                    fontSize: '12px',
                    fontWeight: isActive ? 800 : 500,
                    color: isActive ? 'var(--md-sys-color-on-surface)' : 'var(--md-sys-color-on-surface-variant)',
                    lineHeight: 1,
                  }}
                >
                  {item.label}
                </span>
              </Link>
            );
          })}
        </nav>

        {/* Portfolio Switcher M3 Bottom Sheet */}
        {isPortfolioModalOpen && (
          <div
            onClick={() => setIsPortfolioModalOpen(false)}
            style={{
              position: 'fixed',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              backgroundColor: 'rgba(0,0,0,0.35)',
              zIndex: 200,
              display: 'flex',
              alignItems: 'flex-end',
              justifyContent: 'center',
            }}
          >
            <div
              onClick={(e) => e.stopPropagation()}
              style={{
                width: '100%',
                maxWidth: '430px',
                backgroundColor: 'var(--md-sys-color-surface-container-low)',
                borderTopLeftRadius: '28px',
                borderTopRightRadius: '28px',
                padding: '16px 16px 28px 16px',
                boxShadow: 'var(--md-sys-elevation-3)',
              }}
            >
              <div
                style={{
                  width: '32px',
                  height: '4px',
                  backgroundColor: 'var(--md-sys-color-outline-variant)',
                  borderRadius: '2px',
                  margin: '0 auto 16px auto',
                }}
              />

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
                <h3 style={{ fontSize: '17px', fontWeight: 800, color: 'var(--md-sys-color-on-surface)' }}>
                  Danh Mục Đầu Tư
                </h3>
                <button
                  onClick={() => setIsCreatePortModalOpen(true)}
                  className="m3-pill-btn-primary"
                  style={{ padding: '6px 14px', fontSize: '12px' }}
                >
                  <span className="material-symbols-outlined" style={{ fontSize: '15px' }}>add</span>
                  Tạo Mới
                </button>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {/* Option: ALL */}
                <div
                  onClick={() => {
                    setActivePortfolioId('ALL');
                    setIsPortfolioModalOpen(false);
                  }}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '12px 14px',
                    borderRadius: '16px',
                    backgroundColor: activePortfolioId === 'ALL' ? 'var(--md-sys-color-secondary-container)' : 'var(--md-sys-color-surface-container)',
                    cursor: 'pointer',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <div className="m3-icon-badge-blue" style={{ width: '36px', height: '36px' }}>
                      <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>language</span>
                    </div>
                    <div>
                      <div style={{ fontSize: '14px', fontWeight: 800, color: 'var(--md-sys-color-on-surface)' }}>Tất cả danh mục</div>
                      <div style={{ fontSize: '11px', color: 'var(--md-sys-color-on-surface-variant)' }}>Hợp nhất toàn bộ tài sản</div>
                    </div>
                  </div>

                  {activePortfolioId === 'ALL' && (
                    <span className="material-symbols-outlined" style={{ color: 'var(--md-sys-color-primary)', fontWeight: 900, fontSize: '18px' }}>
                      check
                    </span>
                  )}
                </div>

                {/* Portfolios list */}
                {portfolios.map((p) => {
                  const isSelected = activePortfolioId === p.id;
                  return (
                    <div
                      key={p.id}
                      onClick={() => {
                        setActivePortfolioId(p.id);
                        setIsPortfolioModalOpen(false);
                      }}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        padding: '12px 14px',
                        borderRadius: '16px',
                        backgroundColor: isSelected ? 'var(--md-sys-color-secondary-container)' : 'var(--md-sys-color-surface-container)',
                        cursor: 'pointer',
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <div className="m3-icon-badge-cyan" style={{ width: '36px', height: '36px' }}>
                          <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>business_center</span>
                        </div>
                        <div>
                          <div style={{ fontSize: '14px', fontWeight: 800, color: 'var(--md-sys-color-on-surface)' }}>{p.name}</div>
                          {p.description && (
                            <div style={{ fontSize: '11px', color: 'var(--md-sys-color-on-surface-variant)' }}>{p.description}</div>
                          )}
                        </div>
                      </div>

                      {isSelected && (
                        <span className="material-symbols-outlined" style={{ color: 'var(--md-sys-color-primary)', fontWeight: 900, fontSize: '18px' }}>
                          check
                        </span>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* Create Portfolio Modal */}
        {isCreatePortModalOpen && (
          <div
            style={{
              position: 'fixed',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              backgroundColor: 'rgba(0,0,0,0.4)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              zIndex: 300,
              padding: '20px',
            }}
          >
            <div className="m3-card-elevated" style={{ width: '100%', maxWidth: '400px', padding: '24px' }}>
              <h3 style={{ fontSize: '17px', fontWeight: 800, color: 'var(--md-sys-color-on-surface)', marginBottom: '14px' }}>
                Tạo Danh Mục Mới
              </h3>
              <form onSubmit={handleCreatePortfolio} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <div className="m3-form-group">
                  <label className="m3-form-label">Tên danh mục</label>
                  <input
                    type="text"
                    required
                    placeholder="VD: Quỹ Mua Nhà, Quỹ Hưu Trí..."
                    value={newPortName}
                    onChange={(e) => setNewPortName(e.target.value)}
                    className="m3-input"
                  />
                </div>

                <div className="m3-form-group">
                  <label className="m3-form-label">Mô tả ngắn</label>
                  <textarea
                    placeholder="Mô tả chiến lược..."
                    value={newPortDesc}
                    onChange={(e) => setNewPortDesc(e.target.value)}
                    className="m3-textarea"
                    style={{ height: '60px' }}
                  />
                </div>

                <div style={{ display: 'flex', gap: '10px', marginTop: '8px' }}>
                  <button
                    type="button"
                    onClick={() => setIsCreatePortModalOpen(false)}
                    className="m3-pill-btn"
                    style={{ flex: 1 }}
                  >
                    Hủy
                  </button>
                  <button
                    type="submit"
                    className="m3-pill-btn-primary"
                    style={{ flex: 1 }}
                  >
                    Tạo Mới
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* More Menu Bottom Sheet */}
        {isMoreMenuOpen && (
          <div
            onClick={() => setIsMoreMenuOpen(false)}
            style={{
              position: 'fixed',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              backgroundColor: 'rgba(0,0,0,0.35)',
              zIndex: 200,
              display: 'flex',
              alignItems: 'flex-end',
              justifyContent: 'center',
            }}
          >
            <div
              onClick={(e) => e.stopPropagation()}
              style={{
                width: '100%',
                maxWidth: '430px',
                backgroundColor: 'var(--md-sys-color-surface-container-low)',
                borderTopLeftRadius: '28px',
                borderTopRightRadius: '28px',
                padding: '16px 16px 28px 16px',
                boxShadow: 'var(--md-sys-elevation-3)',
              }}
            >
              <div
                style={{
                  width: '32px',
                  height: '4px',
                  backgroundColor: 'var(--md-sys-color-outline-variant)',
                  borderRadius: '2px',
                  margin: '0 auto 16px auto',
                }}
              />

              <h3 style={{ fontSize: '17px', fontWeight: 800, marginBottom: '14px', color: 'var(--md-sys-color-on-surface)' }}>
                Chức Năng Mở Rộng
              </h3>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {moreNavItems.map((item, idx) => {
                  const badgeClasses = ['m3-icon-badge-blue', 'm3-icon-badge-cyan', 'm3-icon-badge-purple', 'm3-icon-badge-orange', 'm3-icon-badge-green'];
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={() => setIsMoreMenuOpen(false)}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '12px',
                        padding: '12px 14px',
                        borderRadius: '16px',
                        backgroundColor: pathname === item.href ? 'var(--md-sys-color-secondary-container)' : 'var(--md-sys-color-surface-container)',
                      }}
                    >
                      <div className={badgeClasses[idx % badgeClasses.length]} style={{ width: '38px', height: '38px' }}>
                        <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>{item.icon}</span>
                      </div>
                      <div>
                        <div style={{ fontSize: '14px', fontWeight: 800, color: 'var(--md-sys-color-on-surface)' }}>{item.label}</div>
                        <div style={{ fontSize: '11px', color: 'var(--md-sys-color-on-surface-variant)' }}>{item.desc}</div>
                      </div>
                    </Link>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* Google Account Profile Switcher Dialog (Pixel / Google Native Modal) */}
        {isProfileMenuOpen && (
          <div
            onClick={() => setIsProfileMenuOpen(false)}
            style={{
              position: 'fixed',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              backgroundColor: 'rgba(0,0,0,0.4)',
              zIndex: 300,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '16px',
            }}
          >
            <div
              onClick={(e) => e.stopPropagation()}
              style={{
                width: '100%',
                maxWidth: '380px',
                backgroundColor: 'var(--md-sys-color-surface-container)',
                borderRadius: '28px',
                padding: '24px 20px',
                boxShadow: 'var(--md-sys-elevation-3)',
                display: 'flex',
                flexDirection: 'column',
                gap: '16px',
              }}
            >
              {/* Header with Close */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span className="material-symbols-outlined" style={{ color: 'var(--md-sys-color-primary)', fontSize: '22px' }}>
                    account_circle
                  </span>
                  <span style={{ fontSize: '15px', fontWeight: 800, color: 'var(--md-sys-color-on-surface)' }}>
                    Tài Khoản Google
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => setIsProfileMenuOpen(false)}
                  style={{
                    width: '32px',
                    height: '32px',
                    borderRadius: '50%',
                    border: 'none',
                    background: 'transparent',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: 'var(--md-sys-color-on-surface-variant)',
                  }}
                >
                  <span className="material-symbols-outlined" style={{ fontSize: '20px' }}>close</span>
                </button>
              </div>

              {/* Active User Card */}
              <div
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  padding: '16px',
                  borderRadius: '20px',
                  backgroundColor: 'var(--md-sys-color-surface-container-lowest)',
                  gap: '8px',
                }}
              >
                <div
                  style={{
                    width: '64px',
                    height: '64px',
                    borderRadius: '50%',
                    overflow: 'hidden',
                    border: '2px solid var(--md-sys-color-primary)',
                  }}
                >
                  <img
                    src={user.avatarUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120'}
                    alt={user.name}
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                  />
                </div>
                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: '16px', fontWeight: 900, color: 'var(--md-sys-color-on-surface)' }}>{user.name}</div>
                  <div style={{ fontSize: '12px', color: 'var(--md-sys-color-on-surface-variant)', marginTop: '2px' }}>{user.email}</div>
                </div>

                <Link
                  href="/settings"
                  onClick={() => setIsProfileMenuOpen(false)}
                  className="m3-pill-btn"
                  style={{
                    marginTop: '6px',
                    padding: '8px 18px',
                    fontSize: '12px',
                    backgroundColor: 'var(--md-sys-color-surface-container-high)',
                    border: '1px solid var(--md-sys-color-outline-variant)',
                  }}
                >
                  <span className="material-symbols-outlined" style={{ fontSize: '16px', color: 'var(--md-sys-color-primary)' }}>
                    settings
                  </span>
                  Quản lý tài khoản & Cài đặt
                </Link>
              </div>

              {/* Account Actions & Quick Switcher */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {/* Switch to Other Accounts list */}
                {authService.getRecentAccounts().filter((a) => a.email.toLowerCase() !== user.email.toLowerCase()).length > 0 && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                    <div style={{ fontSize: '11px', fontWeight: 800, color: 'var(--md-sys-color-primary)', textTransform: 'uppercase' }}>
                      Chuyển đổi tài khoản nhanh
                    </div>
                    {authService
                      .getRecentAccounts()
                      .filter((a) => a.email.toLowerCase() !== user.email.toLowerCase())
                      .map((acc) => (
                        <div
                          key={acc.email}
                          onClick={() => {
                            login(acc.email, acc.name, acc.avatarUrl);
                            setIsProfileMenuOpen(false);
                          }}
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            padding: '8px 12px',
                            borderRadius: '14px',
                            backgroundColor: 'var(--md-sys-color-surface-container-low)',
                            cursor: 'pointer',
                          }}
                        >
                          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                            <img
                              src={acc.avatarUrl || `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(acc.name)}`}
                              alt={acc.name}
                              style={{ width: '28px', height: '28px', borderRadius: '50%', objectFit: 'cover' }}
                            />
                            <div>
                              <div style={{ fontSize: '13px', fontWeight: 800, color: 'var(--md-sys-color-on-surface)' }}>{acc.name}</div>
                              <div style={{ fontSize: '11px', color: 'var(--md-sys-color-on-surface-variant)' }}>{acc.email}</div>
                            </div>
                          </div>
                          <span className="material-symbols-outlined" style={{ fontSize: '18px', color: 'var(--md-sys-color-primary)' }}>
                            swap_horiz
                          </span>
                        </div>
                      ))}
                  </div>
                )}

                {/* Switch to Another Account / Login */}
                <Link
                  href="/login"
                  onClick={() => setIsProfileMenuOpen(false)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '14px',
                    padding: '12px 14px',
                    borderRadius: '16px',
                    backgroundColor: 'var(--md-sys-color-surface-container-low)',
                    color: 'var(--md-sys-color-on-surface)',
                    textDecoration: 'none',
                    fontSize: '14px',
                    fontWeight: 700,
                  }}
                >
                  <span className="material-symbols-outlined" style={{ fontSize: '20px', color: 'var(--md-sys-color-primary)' }}>
                    person_add
                  </span>
                  Đăng nhập tài khoản khác
                </Link>

                {/* Google OAuth Login */}
                <button
                  type="button"
                  onClick={() => {
                    setIsProfileMenuOpen(false);
                    window.location.href = '/api/auth/google';
                  }}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '14px',
                    padding: '12px 14px',
                    borderRadius: '16px',
                    backgroundColor: 'var(--md-sys-color-surface-container-low)',
                    border: 'none',
                    color: 'var(--md-sys-color-on-surface)',
                    fontSize: '14px',
                    fontWeight: 700,
                    cursor: 'pointer',
                    width: '100%',
                    textAlign: 'left',
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
                  Xác thực tài khoản Google
                </button>

                {/* Logout Button */}
                <button
                  type="button"
                  onClick={() => {
                    setIsProfileMenuOpen(false);
                    logout();
                  }}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '14px',
                    padding: '12px 14px',
                    borderRadius: '16px',
                    backgroundColor: 'var(--md-sys-color-error-container)',
                    border: 'none',
                    color: 'var(--md-sys-color-on-error-container)',
                    fontSize: '14px',
                    fontWeight: 800,
                    cursor: 'pointer',
                    width: '100%',
                    textAlign: 'left',
                    marginTop: '4px',
                  }}
                >
                  <span className="material-symbols-outlined" style={{ fontSize: '20px' }}>
                    logout
                  </span>
                  Đăng xuất khỏi thiết bị này
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Add Transaction Modal */}
        {isAddTxOpen && <AddTransactionModal onClose={() => setIsAddTxOpen(false)} />}
      </div>
    </div>
  );
}
