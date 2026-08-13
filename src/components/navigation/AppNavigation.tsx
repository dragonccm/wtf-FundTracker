'use client';

import React, { useState, useEffect, useRef } from 'react';
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

  // Scroll detection for auto-hiding floating nav & FAB
  const [isNavVisible, setIsNavVisible] = useState(true);
  const lastScrollY = useRef(0);

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      if (currentScrollY < 10) {
        setIsNavVisible(true);
      } else if (currentScrollY > lastScrollY.current + 8) {
        // Scrolling down
        setIsNavVisible(false);
      } else if (currentScrollY < lastScrollY.current - 8) {
        // Scrolling up
        setIsNavVisible(true);
      }
      lastScrollY.current = currentScrollY;
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Bottom Navigation 4 main items
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
      {/* Mobile Frame Container */}
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
            backgroundColor: 'rgba(17, 19, 21, 0.88)',
            backdropFilter: 'blur(16px)',
            padding: '10px 16px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            borderBottom: '1px solid rgba(255, 255, 255, 0.06)',
          }}
        >
          {/* Left: Brand Logo & Title */}
          <Link href="/dashboard" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div
              style={{
                width: '34px',
                height: '34px',
                borderRadius: '10px',
                backgroundColor: '#A8C7FA',
                color: '#041E49',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontWeight: 900,
                fontSize: '14px',
              }}
            >
              NKQ
            </div>
            <div>
              <div style={{ fontSize: '14px', fontWeight: 900, color: '#E2E2E6', lineHeight: 1.2 }}>
                Nhật Ký Quỹ
              </div>
            </div>
          </Link>

          {/* Right: Portfolio Switcher Chip & User Avatar */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            {/* Pixel Portfolio Switcher Pill */}
            <button
              onClick={() => setIsPortfolioModalOpen(true)}
              style={{
                padding: '6px 12px',
                borderRadius: '20px',
                border: '1px solid #282B31',
                backgroundColor: '#191B1F',
                color: '#E2E2E6',
                fontSize: '12px',
                fontWeight: 800,
                display: 'flex',
                alignItems: 'center',
                gap: '4px',
                cursor: 'pointer',
              }}
            >
              <span className="material-symbols-outlined" style={{ fontSize: '15px', color: '#A8C7FA' }}>
                folder
              </span>
              <span style={{ maxWidth: '95px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {activePortfolioId === 'ALL' ? 'Tất cả' : activePort?.name}
              </span>
              <span className="material-symbols-outlined" style={{ fontSize: '16px', color: '#909299' }}>
                expand_more
              </span>
            </button>

            {/* User Avatar */}
            <Link
              href="/settings"
              style={{
                width: '32px',
                height: '32px',
                borderRadius: '50%',
                overflow: 'hidden',
                border: '1.5px solid #282B31',
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
        <main style={{ flex: 1, padding: '16px', paddingBottom: '96px' }}>{children}</main>

        {/* Floating Action Button (FAB - Auto hides on scroll down) */}
        <button
          onClick={() => setIsAddTxOpen(true)}
          style={{
            position: 'fixed',
            bottom: '84px',
            right: 'calc(50% - 220px + 16px)',
            zIndex: 95,
            transform: isNavVisible ? 'translateY(0)' : 'translateY(120px)',
            opacity: isNavVisible ? 1 : 0,
            transition: 'transform 0.28s cubic-bezier(0.2, 0, 0, 1), opacity 0.28s ease',
          }}
          className="m3-fab"
        >
          <span className="material-symbols-outlined" style={{ fontSize: '20px' }}>
            add
          </span>
          Giao Dịch
        </button>

        {/* Floating Pill Navigation Bar (Auto hides on scroll down, active-label mechanism) */}
        <nav
          style={{
            position: 'fixed',
            bottom: '16px',
            left: '50%',
            transform: isNavVisible ? 'translateX(-50%) translateY(0)' : 'translateX(-50%) translateY(120px)',
            opacity: isNavVisible ? 1 : 0,
            transition: 'transform 0.3s cubic-bezier(0.2, 0, 0, 1), opacity 0.3s ease',
            width: 'calc(100% - 32px)',
            maxWidth: '430px',
            backgroundColor: 'rgba(30, 32, 37, 0.92)',
            backdropFilter: 'blur(20px)',
            borderRadius: '32px',
            border: '1px solid rgba(255, 255, 255, 0.08)',
            boxShadow: '0 8px 32px rgba(0, 0, 0, 0.45)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-around',
            padding: '6px 8px',
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
                  alignItems: 'center',
                  gap: '6px',
                  padding: isActive ? '8px 14px' : '8px 12px',
                  borderRadius: '24px',
                  backgroundColor: isActive ? '#A8C7FA' : 'transparent',
                  color: isActive ? '#041E49' : '#909299',
                  textDecoration: 'none',
                  transition: 'all 0.2s cubic-bezier(0.2, 0, 0, 1)',
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

                {/* Only show label text when active */}
                {isActive && (
                  <span
                    style={{
                      fontSize: '12px',
                      fontWeight: 800,
                      whiteSpace: 'nowrap',
                      lineHeight: 1,
                    }}
                  >
                    {item.label}
                  </span>
                )}
              </Link>
            );
          })}

          {/* More Menu Trigger */}
          <button
            onClick={() => setIsMoreMenuOpen(true)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              padding: isMoreMenuOpen ? '8px 14px' : '8px 12px',
              borderRadius: '24px',
              backgroundColor: isMoreMenuOpen ? '#A8C7FA' : 'transparent',
              color: isMoreMenuOpen ? '#041E49' : '#909299',
              border: 'none',
              cursor: 'pointer',
              transition: 'all 0.2s cubic-bezier(0.2, 0, 0, 1)',
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
            {isMoreMenuOpen && (
              <span style={{ fontSize: '12px', fontWeight: 800, whiteSpace: 'nowrap', lineHeight: 1 }}>
                Thêm
              </span>
            )}
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
                padding: '20px 16px 28px 16px',
                borderTop: '1px solid #282B31',
              }}
            >
              <div
                style={{
                  width: '36px',
                  height: '4px',
                  backgroundColor: '#44474E',
                  borderRadius: '2px',
                  margin: '0 auto 16px auto',
                }}
              />

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
                <h3 style={{ fontSize: '16px', fontWeight: 900, color: '#E2E2E6' }}>
                  Danh Mục Đầu Tư
                </h3>
                <button
                  onClick={() => setIsCreatePortModalOpen(true)}
                  style={{
                    padding: '6px 12px',
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
                  <span className="material-symbols-outlined" style={{ fontSize: '15px' }}>
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
                    padding: '12px 14px',
                    borderRadius: '16px',
                    backgroundColor: activePortfolioId === 'ALL' ? '#282B31' : '#191B1F',
                    border: activePortfolioId === 'ALL' ? '1px solid #A8C7FA' : '1px solid transparent',
                    cursor: 'pointer',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <div className="m3-icon-badge-blue" style={{ width: '34px', height: '34px' }}>
                      <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>language</span>
                    </div>
                    <div>
                      <div style={{ fontSize: '13px', fontWeight: 800, color: '#E2E2E6' }}>Tất cả danh mục</div>
                      <div style={{ fontSize: '10px', color: '#909299' }}>Hợp nhất toàn bộ tài sản</div>
                    </div>
                  </div>

                  {activePortfolioId === 'ALL' && (
                    <span className="material-symbols-outlined" style={{ color: '#A8C7FA', fontWeight: 900, fontSize: '18px' }}>
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
                        backgroundColor: isSelected ? '#282B31' : '#191B1F',
                        border: isSelected ? '1px solid #A8C7FA' : '1px solid transparent',
                        cursor: 'pointer',
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <div className="m3-icon-badge-cyan" style={{ width: '34px', height: '34px' }}>
                          <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>business_center</span>
                        </div>
                        <div>
                          <div style={{ fontSize: '13px', fontWeight: 800, color: '#E2E2E6' }}>{p.name}</div>
                          {p.description && (
                            <div style={{ fontSize: '10px', color: '#909299' }}>{p.description}</div>
                          )}
                        </div>
                      </div>

                      {isSelected && (
                        <span className="material-symbols-outlined" style={{ color: '#A8C7FA', fontWeight: 900, fontSize: '18px' }}>
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
              <h3 style={{ fontSize: '16px', fontWeight: 900, color: '#E2E2E6', marginBottom: '14px' }}>
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
                padding: '20px 16px 28px 16px',
                borderTop: '1px solid #282B31',
              }}
            >
              <div
                style={{
                  width: '36px',
                  height: '4px',
                  backgroundColor: '#44474E',
                  borderRadius: '2px',
                  margin: '0 auto 16px auto',
                }}
              />

              <h3 style={{ fontSize: '16px', fontWeight: 900, marginBottom: '14px', color: '#E2E2E6' }}>
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
                        padding: '10px 14px',
                        borderRadius: '16px',
                        backgroundColor: pathname === item.href ? '#282B31' : '#191B1F',
                        border: pathname === item.href ? '1px solid #A8C7FA' : '1px solid transparent',
                      }}
                    >
                      <div className={badgeClasses[idx % badgeClasses.length]} style={{ width: '36px', height: '36px' }}>
                        <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>{item.icon}</span>
                      </div>
                      <div>
                        <div style={{ fontSize: '13px', fontWeight: 800, color: '#E2E2E6' }}>{item.label}</div>
                        <div style={{ fontSize: '10px', color: '#909299' }}>{item.desc}</div>
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
