'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAppStore } from '@/lib/store/appStore';
import AddTransactionModal from '../transactions/AddTransactionModal';
import M3SearchBar from '../search/M3SearchBar';

export default function AppNavigation({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { user, portfolios, activePortfolioId, setActivePortfolioId, addPortfolio } = useAppStore();
  
  const [isAddTxOpen, setIsAddTxOpen] = useState(false);
  const [isMoreMenuOpen, setIsMoreMenuOpen] = useState(false);
  const [isPortfolioModalOpen, setIsPortfolioModalOpen] = useState(false);
  const [isCreatePortModalOpen, setIsCreatePortModalOpen] = useState(false);

  const [newPortName, setNewPortName] = useState('');
  const [newPortDesc, setNewPortDesc] = useState('');

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

            {/* Profile Avatar */}
            <Link
              href="/settings"
              style={{
                width: '34px',
                height: '34px',
                borderRadius: '50%',
                overflow: 'hidden',
                border: '1.5px solid var(--md-sys-color-outline-variant)',
                display: 'block',
              }}
            >
              <img
                src={user.avatarUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100'}
                alt={user.name}
                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
              />
            </Link>
          </div>
        </header>

        {/* Main Content Area */}
        <main style={{ flex: 1, padding: '8px 16px 110px 16px' }}>{children}</main>

        {/* Floating Action Button (FAB) */}
        <button
          onClick={() => setIsAddTxOpen(true)}
          style={{
            position: 'fixed',
            bottom: '96px',
            right: 'calc(50% - 200px + 16px)',
            zIndex: 95,
          }}
          className="m3-fab"
        >
          <span className="material-symbols-outlined" style={{ fontSize: '22px' }}>
            add
          </span>
          Giao Dịch
        </button>

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

        {/* Add Transaction Modal */}
        {isAddTxOpen && <AddTransactionModal onClose={() => setIsAddTxOpen(false)} />}
      </div>
    </div>
  );
}
