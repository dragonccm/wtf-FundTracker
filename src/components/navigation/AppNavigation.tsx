'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAppStore } from '@/lib/store/appStore';
import AddTransactionModal from '../transactions/AddTransactionModal';

export default function AppNavigation({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { user, portfolios, activePortfolioId, setActivePortfolioId, addPortfolio } = useAppStore();
  
  const [isAddTxOpen, setIsAddTxOpen] = useState(false);
  const [isMoreMenuOpen, setIsMoreMenuOpen] = useState(false);
  const [isPortfolioModalOpen, setIsPortfolioModalOpen] = useState(false);
  const [isCreatePortModalOpen, setIsCreatePortModalOpen] = useState(false);

  const [newPortName, setNewPortName] = useState('');
  const [newPortDesc, setNewPortDesc] = useState('');

  // Bottom Navigation 4 main items
  const mainNavItems = [
    { href: '/dashboard', label: 'Tổng quan', icon: 'dashboard' },
    { href: '/portfolio', label: 'Danh mục', icon: 'pie_chart' },
    { href: '/transactions', label: 'Giao dịch', icon: 'receipt_long' },
    { href: '/goals', label: 'Mục tiêu', icon: 'flag' },
  ];

  // More menu items
  const moreNavItems = [
    { href: '/performance', label: 'Hiệu suất & XIRR', icon: 'query_stats', desc: 'Tính XIRR theo dòng tiền' },
    { href: '/import-export', label: 'Import / Export', icon: 'upload_file', desc: 'Đọc/Xuất dữ liệu Excel' },
    { href: '/funds', label: 'Tra cứu giá Quỹ', icon: 'finance_chip', desc: 'NAV lịch sử các quỹ VN' },
    { href: '/timeline', label: 'Lịch sử tài chính', icon: 'timeline', desc: 'Timeline sự kiện tài sản' },
    { href: '/settings', label: 'Cài đặt & Tài khoản', icon: 'settings', desc: 'Đơn vị tiền, cấu hình' },
  ];

  const activePort = portfolios.find((p) => p.id === activePortfolioId);

  const handleCreatePortfolio = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPortName.trim()) return;
    addPortfolio({
      name: newPortName,
      description: newPortDesc,
      color: '#A8C7FA',
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
        backgroundColor: '#0C0E10',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'flex-start',
      }}
    >
      {/* Mobile Frame Container - Google Pixel Material You Dark */}
      <div
        style={{
          width: '100%',
          maxWidth: '480px',
          minHeight: '100vh',
          backgroundColor: '#111315',
          display: 'flex',
          flexDirection: 'column',
          position: 'relative',
          borderLeft: '1px solid #1E2024',
          borderRight: '1px solid #1E2024',
        }}
      >
        {/* Pixel Top App Bar */}
        <header
          style={{
            position: 'sticky',
            top: 0,
            zIndex: 90,
            backgroundColor: '#111315',
            padding: '12px 16px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            borderBottom: '1px solid #1E2024',
          }}
        >
          {/* Left: Brand Logo & Title */}
          <Link href="/dashboard" style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div
              style={{
                width: '38px',
                height: '38px',
                borderRadius: '12px',
                backgroundColor: '#A8C7FA',
                color: '#041E49',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontWeight: 900,
                fontSize: '15px',
              }}
            >
              NKQ
            </div>
            <div>
              <div style={{ fontSize: '15px', fontWeight: 900, color: '#E2E2E6', lineHeight: 1.2 }}>
                Nhật Ký Quỹ
              </div>
              <div style={{ fontSize: '10px', fontWeight: 600, color: '#909299' }}>Fund Tracker</div>
            </div>
          </Link>

          {/* Right: Portfolio Switcher Chip & User Avatar */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            {/* Pixel Portfolio Switcher Pill */}
            <button
              onClick={() => setIsPortfolioModalOpen(true)}
              style={{
                padding: '7px 14px',
                borderRadius: '24px',
                border: 'none',
                backgroundColor: '#202328',
                color: '#E2E2E6',
                fontSize: '12px',
                fontWeight: 800,
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                cursor: 'pointer',
              }}
            >
              <span className="material-symbols-outlined" style={{ fontSize: '16px', color: '#A8C7FA' }}>
                folder
              </span>
              <span style={{ maxWidth: '100px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {activePortfolioId === 'ALL' ? 'Tất cả danh mục' : activePort?.name}
              </span>
              <span className="material-symbols-outlined" style={{ fontSize: '18px', color: '#909299' }}>
                expand_more
              </span>
            </button>

            {/* User Avatar */}
            <Link
              href="/settings"
              style={{
                width: '36px',
                height: '36px',
                borderRadius: '50%',
                overflow: 'hidden',
                border: '2px solid #282B31',
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
        <main style={{ flex: 1, padding: '16px', paddingBottom: '110px' }}>{children}</main>

        {/* Pixel Floating Action Button (FAB) */}
        <button
          onClick={() => setIsAddTxOpen(true)}
          style={{
            position: 'fixed',
            bottom: '80px',
            right: 'calc(50% - 220px + 16px)',
            zIndex: 95,
          }}
          className="m3-fab"
        >
          <span className="material-symbols-outlined" style={{ fontSize: '20px' }}>
            add
          </span>
          Giao Dịch
        </button>

        {/* Pixel Bottom Navigation Bar */}
        <nav
          style={{
            position: 'fixed',
            bottom: 0,
            width: '100%',
            maxWidth: '480px',
            backgroundColor: '#191B1F',
            borderTop: '1px solid #202328',
            display: 'grid',
            gridTemplateColumns: 'repeat(5, 1fr)',
            padding: '8px 0 12px 0',
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
                  color: isActive ? '#A8C7FA' : '#909299',
                  textDecoration: 'none',
                }}
              >
                {/* Pixel Active Indicator Pill */}
                <div
                  style={{
                    width: '56px',
                    height: '30px',
                    borderRadius: '15px',
                    backgroundColor: isActive ? '#A8C7FA' : 'transparent',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    transition: 'all 0.15s ease',
                  }}
                >
                  <span
                    className="material-symbols-outlined"
                    style={{
                      fontSize: '22px',
                      color: isActive ? '#041E49' : '#909299',
                    }}
                  >
                    {item.icon}
                  </span>
                </div>
                <span style={{ fontSize: '11px', fontWeight: isActive ? 800 : 500 }}>{item.label}</span>
              </Link>
            );
          })}

          {/* More Menu Trigger */}
          <button
            onClick={() => setIsMoreMenuOpen(true)}
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '4px',
              color: isMoreMenuOpen ? '#A8C7FA' : '#909299',
              background: 'none',
              border: 'none',
              cursor: 'pointer',
            }}
          >
            <div
              style={{
                width: '56px',
                height: '30px',
                borderRadius: '15px',
                backgroundColor: isMoreMenuOpen ? '#A8C7FA' : 'transparent',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <span
                className="material-symbols-outlined"
                style={{
                  fontSize: '22px',
                  color: isMoreMenuOpen ? '#041E49' : '#909299',
                }}
              >
                widgets
              </span>
            </div>
            <span style={{ fontSize: '11px', fontWeight: isMoreMenuOpen ? 800 : 500 }}>Mở rộng</span>
          </button>
        </nav>

        {/* Portfolio Switcher M3 Bottom Sheet Modal */}
        {isPortfolioModalOpen && (
          <div
            onClick={() => setIsPortfolioModalOpen(false)}
            style={{
              position: 'fixed',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              backgroundColor: 'rgba(0,0,0,0.6)',
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
                maxWidth: '480px',
                backgroundColor: '#202328',
                borderTopLeftRadius: '28px',
                borderTopRightRadius: '28px',
                padding: '24px 20px 32px 20px',
                borderTop: '1px solid #282B31',
              }}
            >
              <div
                style={{
                  width: '36px',
                  height: '4px',
                  backgroundColor: '#44474E',
                  borderRadius: '2px',
                  margin: '0 auto 20px auto',
                }}
              />

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                <h3 style={{ fontSize: '18px', fontWeight: 900, color: '#E2E2E6' }}>
                  Chọn Danh Mục Đầu Tư
                </h3>
                <button
                  onClick={() => setIsCreatePortModalOpen(true)}
                  style={{
                    padding: '8px 14px',
                    borderRadius: '16px',
                    backgroundColor: '#A8C7FA',
                    color: '#041E49',
                    border: 'none',
                    fontSize: '12px',
                    fontWeight: 800,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px',
                  }}
                >
                  <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>
                    add
                  </span>
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
                    padding: '14px 16px',
                    borderRadius: '18px',
                    backgroundColor: activePortfolioId === 'ALL' ? '#282B31' : '#191B1F',
                    border: activePortfolioId === 'ALL' ? '1px solid #A8C7FA' : '1px solid #282B31',
                    cursor: 'pointer',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <div className="m3-icon-badge-blue">
                      <span className="material-symbols-outlined">language</span>
                    </div>
                    <div>
                      <div style={{ fontSize: '14px', fontWeight: 800, color: '#E2E2E6' }}>Tất cả danh mục</div>
                      <div style={{ fontSize: '11px', color: '#909299' }}>Hợp nhất toàn bộ tài sản</div>
                    </div>
                  </div>

                  {activePortfolioId === 'ALL' && (
                    <span className="material-symbols-outlined" style={{ color: '#A8C7FA', fontWeight: 900 }}>
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
                        padding: '14px 16px',
                        borderRadius: '18px',
                        backgroundColor: isSelected ? '#282B31' : '#191B1F',
                        border: isSelected ? '1px solid #A8C7FA' : '1px solid #282B31',
                        cursor: 'pointer',
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <div className="m3-icon-badge-cyan">
                          <span className="material-symbols-outlined">business_center</span>
                        </div>
                        <div>
                          <div style={{ fontSize: '14px', fontWeight: 800, color: '#E2E2E6' }}>{p.name}</div>
                          {p.description && (
                            <div style={{ fontSize: '11px', color: '#909299' }}>{p.description}</div>
                          )}
                        </div>
                      </div>

                      {isSelected && (
                        <span className="material-symbols-outlined" style={{ color: '#A8C7FA', fontWeight: 900 }}>
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
              backgroundColor: 'rgba(0,0,0,0.7)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              zIndex: 300,
              padding: '20px',
            }}
          >
            <div className="m3-card-dark" style={{ width: '100%', maxWidth: '420px', padding: '24px' }}>
              <h3 style={{ fontSize: '18px', fontWeight: 900, color: '#E2E2E6', marginBottom: '14px' }}>
                Tạo Danh Mục Đầu Tư Mới
              </h3>
              <form onSubmit={handleCreatePortfolio} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
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
                    placeholder="Mô tả chiến lược danh mục..."
                    value={newPortDesc}
                    onChange={(e) => setNewPortDesc(e.target.value)}
                    className="m3-textarea"
                    style={{ height: '70px' }}
                  />
                </div>

                <div style={{ display: 'flex', gap: '10px', marginTop: '10px' }}>
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
                    Tạo Danh Mục
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
              backgroundColor: 'rgba(0,0,0,0.6)',
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
                maxWidth: '480px',
                backgroundColor: '#202328',
                borderTopLeftRadius: '28px',
                borderTopRightRadius: '28px',
                padding: '24px 20px 32px 20px',
                borderTop: '1px solid #282B31',
              }}
            >
              <div
                style={{
                  width: '36px',
                  height: '4px',
                  backgroundColor: '#44474E',
                  borderRadius: '2px',
                  margin: '0 auto 20px auto',
                }}
              />

              <h3 style={{ fontSize: '18px', fontWeight: 900, marginBottom: '16px', color: '#E2E2E6' }}>
                Tất Cả Chức Năng Mở Rộng
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
                        gap: '14px',
                        padding: '12px 16px',
                        borderRadius: '18px',
                        backgroundColor: pathname === item.href ? '#282B31' : '#191B1F',
                        border: pathname === item.href ? '1px solid #A8C7FA' : '1px solid transparent',
                      }}
                    >
                      <div className={badgeClasses[idx % badgeClasses.length]}>
                        <span className="material-symbols-outlined">{item.icon}</span>
                      </div>
                      <div>
                        <div style={{ fontSize: '14px', fontWeight: 800, color: '#E2E2E6' }}>{item.label}</div>
                        <div style={{ fontSize: '11px', color: '#909299' }}>{item.desc}</div>
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
