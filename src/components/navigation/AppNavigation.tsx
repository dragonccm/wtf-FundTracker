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
    { href: '/settings', label: 'Cài đặt & Tài khoản', icon: 'settings', desc: 'Đơn vị tiền, ngày tháng' },
  ];

  const activePort = portfolios.find((p) => p.id === activePortfolioId);

  const handleCreatePortfolio = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPortName.trim()) return;
    addPortfolio({
      name: newPortName,
      description: newPortDesc,
      color: '#0B57D0',
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
        backgroundColor: '#E9EEF6',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'flex-start',
      }}
    >
      {/* Mobile Frame Container - Google M3 Tonal Surface */}
      <div
        style={{
          width: '100%',
          maxWidth: '480px',
          minHeight: '100vh',
          backgroundColor: '#F0F4F9',
          display: 'flex',
          flexDirection: 'column',
          position: 'relative',
          borderLeft: '1px solid #E1E7F0',
          borderRight: '1px solid #E1E7F0',
        }}
      >
        {/* Google M3 Top App Bar */}
        <header
          style={{
            position: 'sticky',
            top: 0,
            zIndex: 90,
            backgroundColor: '#FFFFFF',
            borderBottom: '1px solid #E1E7F0',
            padding: '12px 16px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          {/* Left: Brand Logo & Title */}
          <Link href="/dashboard" style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div
              style={{
                width: '36px',
                height: '36px',
                borderRadius: '10px',
                backgroundColor: '#0B57D0',
                color: '#FFFFFF',
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
              <div style={{ fontSize: '15px', fontWeight: 900, color: '#0B57D0', lineHeight: 1.2 }}>
                Nhật Ký Quỹ
              </div>
              <div style={{ fontSize: '10px', fontWeight: 600, color: '#74777F' }}>Fund Tracker</div>
            </div>
          </Link>

          {/* Right: Portfolio Switcher Chip & User Avatar */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            {/* M3 Portfolio Switcher Pill Button */}
            <button
              onClick={() => setIsPortfolioModalOpen(true)}
              style={{
                padding: '6px 12px',
                borderRadius: '20px',
                border: '1px solid #C4C6D0',
                backgroundColor: '#F7F9FC',
                color: '#1F1F1F',
                fontSize: '12px',
                fontWeight: 800,
                display: 'flex',
                alignItems: 'center',
                gap: '4px',
                cursor: 'pointer',
              }}
            >
              <span className="material-symbols-outlined" style={{ fontSize: '16px', color: '#0B57D0' }}>
                folder
              </span>
              <span style={{ maxWidth: '100px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {activePortfolioId === 'ALL' ? 'Tất cả danh mục' : activePort?.name}
              </span>
              <span className="material-symbols-outlined" style={{ fontSize: '18px', color: '#74777F' }}>
                expand_more
              </span>
            </button>

            {/* User Avatar */}
            <Link
              href="/settings"
              style={{
                width: '34px',
                height: '34px',
                borderRadius: '50%',
                overflow: 'hidden',
                border: '2px solid #D3E3FD',
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

        {/* Material 3 Floating Action Button (FAB) */}
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

        {/* Material 3 Bottom Navigation Bar */}
        <nav
          style={{
            position: 'fixed',
            bottom: 0,
            width: '100%',
            maxWidth: '480px',
            backgroundColor: '#FFFFFF',
            borderTop: '1px solid #E1E7F0',
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
                  color: isActive ? '#0B57D0' : '#74777F',
                  textDecoration: 'none',
                }}
              >
                {/* M3 Active Indicator Pill */}
                <div
                  style={{
                    width: '56px',
                    height: '30px',
                    borderRadius: '15px',
                    backgroundColor: isActive ? '#D3E3FD' : 'transparent',
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
                      color: isActive ? '#041E49' : '#74777F',
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
              color: isMoreMenuOpen ? '#0B57D0' : '#74777F',
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
                backgroundColor: isMoreMenuOpen ? '#D3E3FD' : 'transparent',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <span className="material-symbols-outlined" style={{ fontSize: '22px' }}>
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
              backgroundColor: 'rgba(0,0,0,0.4)',
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
                backgroundColor: '#FFFFFF',
                borderTopLeftRadius: '28px',
                borderTopRightRadius: '28px',
                padding: '24px 20px 32px 20px',
                borderTop: '1px solid #E1E7F0',
              }}
            >
              <div
                style={{
                  width: '36px',
                  height: '4px',
                  backgroundColor: '#C4C6D0',
                  borderRadius: '2px',
                  margin: '0 auto 20px auto',
                }}
              />

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                <h3 style={{ fontSize: '18px', fontWeight: 900, color: '#0B57D0' }}>
                  Chọn Danh Mục Đầu Tư
                </h3>
                <button
                  onClick={() => setIsCreatePortModalOpen(true)}
                  style={{
                    padding: '6px 12px',
                    borderRadius: '12px',
                    backgroundColor: '#D3E3FD',
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
                    borderRadius: '16px',
                    backgroundColor: activePortfolioId === 'ALL' ? '#D3E3FD' : '#F7F9FC',
                    border: '1px solid #E1E7F0',
                    cursor: 'pointer',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <span className="material-symbols-outlined" style={{ color: '#0B57D0' }}>
                      language
                    </span>
                    <div>
                      <div style={{ fontSize: '14px', fontWeight: 800, color: '#1F1F1F' }}>Tất cả danh mục</div>
                      <div style={{ fontSize: '11px', color: '#74777F' }}>Xem hợp nhất toàn bộ tài sản</div>
                    </div>
                  </div>

                  {activePortfolioId === 'ALL' && (
                    <span className="material-symbols-outlined" style={{ color: '#0B57D0', fontWeight: 900 }}>
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
                        borderRadius: '16px',
                        backgroundColor: isSelected ? '#D3E3FD' : '#F7F9FC',
                        border: '1px solid #E1E7F0',
                        cursor: 'pointer',
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <span className="material-symbols-outlined" style={{ color: '#0B57D0' }}>
                          business_center
                        </span>
                        <div>
                          <div style={{ fontSize: '14px', fontWeight: 800, color: '#1F1F1F' }}>{p.name}</div>
                          {p.description && (
                            <div style={{ fontSize: '11px', color: '#74777F' }}>{p.description}</div>
                          )}
                        </div>
                      </div>

                      {isSelected && (
                        <span className="material-symbols-outlined" style={{ color: '#0B57D0', fontWeight: 900 }}>
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
              backgroundColor: 'rgba(0,0,0,0.5)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              zIndex: 300,
              padding: '20px',
            }}
          >
            <div className="m3-card-white" style={{ width: '100%', maxWidth: '420px', padding: '24px' }}>
              <h3 style={{ fontSize: '18px', fontWeight: 900, color: '#0B57D0', marginBottom: '14px' }}>
                Tạo Danh Mục Đầu Tư Mới
              </h3>
              <form onSubmit={handleCreatePortfolio} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                <div>
                  <label style={{ fontSize: '12px', fontWeight: 700, color: '#74777F' }}>Tên danh mục</label>
                  <input
                    type="text"
                    required
                    placeholder="VD: Quỹ Mua Nhà, Quỹ Hưu Trí..."
                    value={newPortName}
                    onChange={(e) => setNewPortName(e.target.value)}
                    style={{ width: '100%', marginTop: '4px', padding: '10px', borderRadius: '10px', border: '1px solid #C4C6D0' }}
                  />
                </div>

                <div>
                  <label style={{ fontSize: '12px', fontWeight: 700, color: '#74777F' }}>Mô tả ngắn</label>
                  <textarea
                    placeholder="Mô tả chiến lược danh mục..."
                    value={newPortDesc}
                    onChange={(e) => setNewPortDesc(e.target.value)}
                    style={{ width: '100%', marginTop: '4px', padding: '10px', borderRadius: '10px', border: '1px solid #C4C6D0', height: '70px' }}
                  />
                </div>

                <div style={{ display: 'flex', gap: '12px', marginTop: '12px' }}>
                  <button
                    type="button"
                    onClick={() => setIsCreatePortModalOpen(false)}
                    style={{ flex: 1, padding: '10px', borderRadius: '10px', border: '1px solid #C4C6D0', background: 'none' }}
                  >
                    Hủy
                  </button>
                  <button
                    type="submit"
                    style={{ flex: 1, padding: '10px', borderRadius: '10px', border: 'none', backgroundColor: '#0B57D0', color: '#FFFFFF', fontWeight: 800 }}
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
              backgroundColor: 'rgba(0,0,0,0.4)',
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
                backgroundColor: '#FFFFFF',
                borderTopLeftRadius: '28px',
                borderTopRightRadius: '28px',
                padding: '24px 20px 32px 20px',
                borderTop: '1px solid #E1E7F0',
              }}
            >
              <div
                style={{
                  width: '36px',
                  height: '4px',
                  backgroundColor: '#C4C6D0',
                  borderRadius: '2px',
                  margin: '0 auto 20px auto',
                }}
              />

              <h3 style={{ fontSize: '18px', fontWeight: 800, marginBottom: '16px', color: '#0B57D0' }}>
                Tất Cả Chức Năng Mở Rộng
              </h3>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {moreNavItems.map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setIsMoreMenuOpen(false)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '14px',
                      padding: '12px 16px',
                      borderRadius: '16px',
                      backgroundColor: pathname === item.href ? '#D3E3FD' : '#F7F9FC',
                      border: '1px solid #E1E7F0',
                    }}
                  >
                    <div
                      style={{
                        width: '40px',
                        height: '40px',
                        borderRadius: '12px',
                        backgroundColor: '#FFFFFF',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: '#0B57D0',
                      }}
                    >
                      <span className="material-symbols-outlined">{item.icon}</span>
                    </div>
                    <div>
                      <div style={{ fontSize: '14px', fontWeight: 700, color: '#1F1F1F' }}>{item.label}</div>
                      <div style={{ fontSize: '11px', color: '#74777F' }}>{item.desc}</div>
                    </div>
                  </Link>
                ))}
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
