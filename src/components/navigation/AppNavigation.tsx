'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAppStore } from '@/lib/store/appStore';
import AddTransactionModal from '@/components/transactions/AddTransactionModal';

const primaryItems = [
  { href: '/dashboard', label: 'Tổng quan', icon: 'space_dashboard' },
  { href: '/portfolio', label: 'Danh mục', icon: 'donut_large' },
  { href: '/transactions', label: 'Giao dịch', icon: 'receipt_long' },
  { href: '/goals', label: 'Mục tiêu', icon: 'flag' },
];

const moreItems = [
  { href: '/performance', label: 'Hiệu suất', icon: 'monitoring' },
  { href: '/funds', label: 'Dữ liệu quỹ', icon: 'finance' },
  { href: '/timeline', label: 'Dòng thời gian', icon: 'timeline' },
  { href: '/import-export', label: 'Nhập & xuất', icon: 'swap_vert' },
  { href: '/settings', label: 'Cài đặt', icon: 'settings' },
];

export default function AppNavigation({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const {
    user,
    funds,
    portfolios,
    activePortfolioId,
    setActivePortfolioId,
    addPortfolio,
    isAuthenticated,
    isAuthResolved,
  } = useAppStore();

  const [isAddTransactionOpen, setIsAddTransactionOpen] = useState(false);
  const [isMoreOpen, setIsMoreOpen] = useState(false);
  const [isPortfolioOpen, setIsPortfolioOpen] = useState(false);
  const [isCreatePortfolioOpen, setIsCreatePortfolioOpen] = useState(false);
  const [portfolioName, setPortfolioName] = useState('');

  if (pathname === '/login' || pathname === '/login/success') {
    return <>{children}</>;
  }

  if (!isAuthResolved) {
    return (
      <main className="journal-auth" aria-busy="true" aria-label="Đang tải dữ liệu">
        <div className="journal-loading-mark" />
      </main>
    );
  }

  if (!isAuthenticated) {
    return (
      <main className="journal-auth">
        <section className="journal-auth-card" style={{ textAlign: 'center' }}>
          <div className="journal-auth-mark" style={{ margin: '0 auto' }}>
            <span className="material-symbols-outlined" style={{ fontSize: 32 }}>savings</span>
          </div>
          <h1>Nhật ký quỹ<br />của riêng bạn</h1>
          <p>Một nơi gọn gàng để theo dõi tiền, mục tiêu và hiệu suất thật.</p>
          <Link className="journal-primary-button" href="/login" style={{ width: '100%' }}>
            Bắt đầu
            <span className="material-symbols-outlined" style={{ fontSize: 19 }}>arrow_forward</span>
          </Link>
        </section>
      </main>
    );
  }

  const activePortfolio = portfolios.find((portfolio) => portfolio.id === activePortfolioId);
  const activeName = activePortfolioId === 'ALL' ? 'Tất cả danh mục' : activePortfolio?.name || 'Danh mục';
  const isMoreActive = moreItems.some((item) => item.href === pathname);

  const createPortfolio = (event: React.FormEvent) => {
    event.preventDefault();
    const name = portfolioName.trim();
    if (!name) return;
    addPortfolio({ name, color: '#6750a4' });
    setPortfolioName('');
    setIsCreatePortfolioOpen(false);
  };

  return (
    <div className="journal-shell">
      <header className="journal-topbar">
        <Link href="/dashboard" className="journal-brand" aria-label="Nhật Ký Quỹ">
          <span className="material-symbols-outlined">savings</span>
        </Link>

        <button
          type="button"
          className="journal-portfolio-button"
          onClick={() => setIsPortfolioOpen(true)}
          aria-label="Chọn danh mục"
        >
          <span className="journal-eyebrow">Danh mục</span>
          <span className="journal-portfolio-name">
            {activeName}
            <span className="material-symbols-outlined" style={{ fontSize: 18 }}>arrow_drop_down</span>
          </span>
        </button>

        <Link href="/settings" className="journal-icon-button" aria-label="Tài khoản">
          {user.avatarUrl ? (
            <img className="journal-avatar" src={user.avatarUrl} alt="" />
          ) : (
            <span className="material-symbols-outlined">account_circle</span>
          )}
        </Link>
      </header>

      <main className="journal-content">{children}</main>

      {funds.length > 0 && (
        <button
          type="button"
          className="journal-fab"
          onClick={() => setIsAddTransactionOpen(true)}
          aria-label="Thêm giao dịch"
        >
          <span className="material-symbols-outlined">add</span>
        </button>
      )}

      <nav className="journal-nav" aria-label="Điều hướng chính">
        {primaryItems.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className={`journal-nav-item ${pathname === item.href ? 'active' : ''}`}
          >
            <span className="material-symbols-outlined">{item.icon}</span>
            <span>{item.label}</span>
          </Link>
        ))}
        <button
          type="button"
          className={`journal-nav-item ${isMoreActive ? 'active' : ''}`}
          onClick={() => setIsMoreOpen(true)}
        >
          <span className="material-symbols-outlined">apps</span>
          <span>Thêm</span>
        </button>
      </nav>

      {isPortfolioOpen && (
        <div className="journal-scrim" onClick={() => setIsPortfolioOpen(false)}>
          <section className="journal-sheet" onClick={(event) => event.stopPropagation()}>
            <div className="journal-sheet-handle" />
            <div className="journal-section-title" style={{ marginBottom: 8 }}>
              <h2>Danh mục</h2>
              <button type="button" className="journal-text-button" onClick={() => setIsCreatePortfolioOpen(true)}>
                + Tạo mới
              </button>
            </div>

            <button
              type="button"
              className={`journal-sheet-option ${activePortfolioId === 'ALL' ? 'active' : ''}`}
              onClick={() => {
                setActivePortfolioId('ALL');
                setIsPortfolioOpen(false);
              }}
            >
              <span className="journal-fund-mark"><span className="material-symbols-outlined">all_inclusive</span></span>
              <strong>Tất cả danh mục</strong>
              {activePortfolioId === 'ALL' && <span className="material-symbols-outlined">check</span>}
            </button>

            {portfolios.map((portfolio) => (
              <button
                type="button"
                key={portfolio.id}
                className={`journal-sheet-option ${activePortfolioId === portfolio.id ? 'active' : ''}`}
                onClick={() => {
                  setActivePortfolioId(portfolio.id);
                  setIsPortfolioOpen(false);
                }}
              >
                <span className="journal-fund-mark">{portfolio.name.slice(0, 2).toUpperCase()}</span>
                <span style={{ minWidth: 0 }}>
                  <strong style={{ display: 'block' }}>{portfolio.name}</strong>
                  {portfolio.description && (
                    <small style={{ color: 'var(--journal-muted)' }}>{portfolio.description}</small>
                  )}
                </span>
                {activePortfolioId === portfolio.id && <span className="material-symbols-outlined">check</span>}
              </button>
            ))}
          </section>
        </div>
      )}

      {isCreatePortfolioOpen && (
        <div className="journal-scrim" onClick={() => setIsCreatePortfolioOpen(false)}>
          <section className="journal-sheet" onClick={(event) => event.stopPropagation()}>
            <div className="journal-sheet-handle" />
            <h2 style={{ marginBottom: 16 }}>Danh mục mới</h2>
            <form className="journal-form" onSubmit={createPortfolio}>
              <div className="journal-field">
                <label htmlFor="portfolio-name">Tên danh mục</label>
                <input
                  id="portfolio-name"
                  value={portfolioName}
                  onChange={(event) => setPortfolioName(event.target.value)}
                  placeholder="Ví dụ: Mua nhà"
                  autoFocus
                  required
                />
              </div>
              <button className="journal-primary-button" type="submit">Tạo danh mục</button>
            </form>
          </section>
        </div>
      )}

      {isMoreOpen && (
        <div className="journal-scrim" onClick={() => setIsMoreOpen(false)}>
          <section className="journal-sheet" onClick={(event) => event.stopPropagation()}>
            <div className="journal-sheet-handle" />
            <h2 style={{ marginBottom: 8 }}>Công cụ</h2>
            {moreItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={`journal-sheet-option ${pathname === item.href ? 'active' : ''}`}
                onClick={() => setIsMoreOpen(false)}
              >
                <span className="journal-fund-mark">
                  <span className="material-symbols-outlined">{item.icon}</span>
                </span>
                <strong>{item.label}</strong>
                <span className="material-symbols-outlined" style={{ color: 'var(--journal-muted)' }}>chevron_right</span>
              </Link>
            ))}
          </section>
        </div>
      )}

      {isAddTransactionOpen && <AddTransactionModal onClose={() => setIsAddTransactionOpen(false)} />}
    </div>
  );
}
