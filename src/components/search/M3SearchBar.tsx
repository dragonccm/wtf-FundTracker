'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useAppStore } from '@/lib/store/appStore';
import { formatVND } from '@/lib/finance/portfolio';
import { useRouter } from 'next/navigation';

interface M3SearchBarProps {
  placeholder?: string;
  className?: string;
}

export default function M3SearchBar({
  placeholder = 'Tìm kiếm quỹ, giao dịch, mục tiêu...',
}: M3SearchBarProps) {
  const router = useRouter();
  const { funds, transactions, goals, portfolios } = useAppStore();

  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [recentSearches, setRecentSearches] = useState<string[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);

  // Load recent searches from localStorage
  useEffect(() => {
    try {
      const saved = localStorage.getItem('nhatkyquy_recent_searches');
      if (saved) {
        setRecentSearches(JSON.parse(saved));
      } else {
        setRecentSearches(['VESAF', 'DCBC', 'Lệnh mua gần nhất', 'Quỹ hưu trí']);
      }
    } catch (e) {
      console.error(e);
    }
  }, []);

  const saveRecentSearch = (text: string) => {
    if (!text.trim()) return;
    const updated = [text.trim(), ...recentSearches.filter((s) => s.toLowerCase() !== text.toLowerCase())].slice(0, 6);
    setRecentSearches(updated);
    try {
      localStorage.setItem('nhatkyquy_recent_searches', JSON.stringify(updated));
    } catch (e) {
      console.error(e);
    }
  };

  const clearRecentSearches = () => {
    setRecentSearches([]);
    try {
      localStorage.removeItem('nhatkyquy_recent_searches');
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => {
        inputRef.current?.focus();
      }, 100);
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  // Filter Data
  const trimmed = query.trim().toLowerCase();

  const matchedFunds = trimmed
    ? funds.filter(
        (f) =>
          f.code.toLowerCase().includes(trimmed) ||
          f.name.toLowerCase().includes(trimmed) ||
          f.company.toLowerCase().includes(trimmed)
      )
    : [];

  const matchedTransactions = trimmed
    ? transactions.filter(
        (t) =>
          t.fundCode.toLowerCase().includes(trimmed) ||
          (t.notes && t.notes.toLowerCase().includes(trimmed)) ||
          t.type.toLowerCase().includes(trimmed)
      ).slice(0, 5)
    : [];

  const matchedGoals = trimmed
    ? goals.filter((g) => g.name.toLowerCase().includes(trimmed) || (g.notes && g.notes.toLowerCase().includes(trimmed)))
    : [];

  const handleSelectFund = (fundCode: string) => {
    saveRecentSearch(fundCode);
    setIsOpen(false);
    router.push('/funds');
  };

  const handleSelectGoal = (goalName: string) => {
    saveRecentSearch(goalName);
    setIsOpen(false);
    router.push('/goals');
  };

  const handleSelectTransaction = () => {
    saveRecentSearch(query);
    setIsOpen(false);
    router.push('/transactions');
  };

  return (
    <>
      {/* 1. M3 Search Bar (Collapsed State - Official Height 56px, Radius 28px Pill) */}
      <div
        onClick={() => setIsOpen(true)}
        style={{
          height: '48px',
          width: '100%',
          borderRadius: '28px',
          backgroundColor: 'var(--md-sys-color-surface-container-low)',
          border: '1px solid var(--md-sys-color-outline-variant)',
          display: 'flex',
          alignItems: 'center',
          padding: '0 16px',
          gap: '12px',
          cursor: 'pointer',
          boxShadow: 'var(--md-sys-elevation-1)',
          transition: 'background-color 0.2s ease, box-shadow 0.2s ease',
        }}
      >
        <span className="material-symbols-outlined" style={{ color: 'var(--md-sys-color-on-surface-variant)', fontSize: '22px' }}>
          search
        </span>
        <span
          style={{
            flex: 1,
            fontSize: '14px',
            color: 'var(--md-sys-color-on-surface-variant)',
            fontWeight: 500,
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
          }}
        >
          {placeholder}
        </span>
        <span className="material-symbols-outlined" style={{ color: 'var(--md-sys-color-primary)', fontSize: '20px' }}>
          tune
        </span>
      </div>

      {/* 2. M3 Search View (Expanded / Active Overlay State) */}
      {isOpen && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0,0,0,0.4)',
            zIndex: 1000,
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'flex-start',
          }}
        >
          <div
            style={{
              width: '100%',
              maxWidth: '480px',
              height: '100vh',
              backgroundColor: 'var(--md-sys-color-surface)',
              display: 'flex',
              flexDirection: 'column',
              boxShadow: 'var(--md-sys-elevation-4)',
              overflow: 'hidden',
            }}
          >
            {/* Search View Top Bar (M3 Search View Header) */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                padding: '8px 12px',
                borderBottom: '1px solid var(--md-sys-color-outline-variant)',
                gap: '8px',
                backgroundColor: 'var(--md-sys-color-surface-container-lowest)',
              }}
            >
              {/* Back Button */}
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                style={{
                  width: '40px',
                  height: '40px',
                  borderRadius: '50%',
                  border: 'none',
                  background: 'transparent',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'var(--md-sys-color-on-surface)',
                }}
              >
                <span className="material-symbols-outlined" style={{ fontSize: '24px' }}>arrow_back</span>
              </button>

              {/* Search Input */}
              <input
                ref={inputRef}
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder={placeholder}
                style={{
                  flex: 1,
                  border: 'none',
                  outline: 'none',
                  backgroundColor: 'transparent',
                  fontSize: '16px',
                  fontWeight: 600,
                  color: 'var(--md-sys-color-on-surface)',
                }}
              />

              {/* Clear Query Action */}
              {query && (
                <button
                  type="button"
                  onClick={() => setQuery('')}
                  style={{
                    width: '36px',
                    height: '36px',
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
              )}
            </div>

            {/* Quick Suggestion Assist Chips */}
            <div
              style={{
                display: 'flex',
                gap: '6px',
                padding: '10px 16px',
                overflowX: 'auto',
                borderBottom: '1px solid var(--md-sys-color-outline-variant)',
                backgroundColor: 'var(--md-sys-color-surface-container-low)',
              }}
            >
              {['VESAF', 'DCBC', 'TCBF', 'DSI', 'Hưu trí', 'Lệnh mua'].map((chip) => (
                <button
                  key={chip}
                  type="button"
                  onClick={() => {
                    setQuery(chip);
                    saveRecentSearch(chip);
                  }}
                  className="m3-chip"
                  style={{
                    whiteSpace: 'nowrap',
                    padding: '6px 12px',
                    borderRadius: '8px',
                    fontSize: '12px',
                  }}
                >
                  <span className="material-symbols-outlined" style={{ fontSize: '14px' }}>search</span>
                  {chip}
                </button>
              ))}
            </div>

            {/* Search Results Area */}
            <div style={{ flex: 1, overflowY: 'auto', padding: '16px' }}>
              {/* Empty query state: Show Recent Searches */}
              {!trimmed && (
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                    <span style={{ fontSize: '12px', fontWeight: 800, color: 'var(--md-sys-color-on-surface-variant)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                      Tìm Kiếm Gần Đây
                    </span>
                    {recentSearches.length > 0 && (
                      <button
                        type="button"
                        onClick={clearRecentSearches}
                        style={{
                          background: 'none',
                          border: 'none',
                          fontSize: '12px',
                          fontWeight: 700,
                          color: 'var(--md-sys-color-primary)',
                          cursor: 'pointer',
                        }}
                      >
                        Xóa lịch sử
                      </button>
                    )}
                  </div>

                  {recentSearches.length === 0 ? (
                    <p style={{ fontSize: '13px', color: 'var(--md-sys-color-on-surface-variant)', padding: '12px 0' }}>
                      Chưa có lịch sử tìm kiếm
                    </p>
                  ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                      {recentSearches.map((item, idx) => (
                        <div
                          key={idx}
                          onClick={() => setQuery(item)}
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '14px',
                            padding: '12px 8px',
                            borderRadius: '12px',
                            cursor: 'pointer',
                            transition: 'background-color 0.15s ease',
                          }}
                        >
                          <span className="material-symbols-outlined" style={{ color: 'var(--md-sys-color-on-surface-variant)', fontSize: '20px' }}>
                            history
                          </span>
                          <span style={{ fontSize: '14px', fontWeight: 600, color: 'var(--md-sys-color-on-surface)', flex: 1 }}>
                            {item}
                          </span>
                          <span className="material-symbols-outlined" style={{ color: 'var(--md-sys-color-outline)', fontSize: '18px' }}>
                            north_west
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* Active query state: Multi-category live search */}
              {trimmed && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  {/* Category 1: Chứng Chỉ Quỹ */}
                  {matchedFunds.length > 0 && (
                    <div>
                      <span style={{ fontSize: '12px', fontWeight: 800, color: 'var(--md-sys-color-primary)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                        Chứng Chỉ Quỹ ({matchedFunds.length})
                      </span>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginTop: '8px' }}>
                        {matchedFunds.map((f) => (
                          <div
                            key={f.id}
                            onClick={() => handleSelectFund(f.code)}
                            style={{
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'space-between',
                              padding: '12px 14px',
                              borderRadius: '16px',
                              backgroundColor: 'var(--md-sys-color-surface-container-low)',
                              border: '1px solid var(--md-sys-color-outline-variant)',
                              cursor: 'pointer',
                            }}
                          >
                            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                              <div className="m3-icon-badge-blue" style={{ width: '36px', height: '36px' }}>
                                <span style={{ fontWeight: 900, fontSize: '11px' }}>{f.code.slice(0, 3)}</span>
                              </div>
                              <div>
                                <div style={{ fontSize: '14px', fontWeight: 800, color: 'var(--md-sys-color-on-surface)' }}>{f.code}</div>
                                <div style={{ fontSize: '11px', color: 'var(--md-sys-color-on-surface-variant)' }}>{f.company} • {f.category}</div>
                              </div>
                            </div>
                            <div style={{ textAlign: 'right' }}>
                              <div style={{ fontSize: '13px', fontWeight: 800, color: 'var(--md-sys-color-on-surface)' }}>{formatVND(f.nav)}</div>
                              <span style={{ fontSize: '10px', color: 'var(--md-sys-color-primary)', fontWeight: 700 }}>Xem chi tiết →</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Category 2: Giao Dịch */}
                  {matchedTransactions.length > 0 && (
                    <div>
                      <span style={{ fontSize: '12px', fontWeight: 800, color: 'var(--md-sys-color-secondary)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                        Lịch Sử Giao Dịch ({matchedTransactions.length})
                      </span>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginTop: '8px' }}>
                        {matchedTransactions.map((tx) => (
                          <div
                            key={tx.id}
                            onClick={handleSelectTransaction}
                            style={{
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'space-between',
                              padding: '10px 14px',
                              borderRadius: '16px',
                              backgroundColor: 'var(--md-sys-color-surface-container-low)',
                              border: '1px solid var(--md-sys-color-outline-variant)',
                              cursor: 'pointer',
                            }}
                          >
                            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                              <span className={tx.type === 'BUY' ? 'badge-positive' : 'badge-negative'} style={{ fontSize: '10px' }}>
                                {tx.type}
                              </span>
                              <div>
                                <div style={{ fontSize: '13px', fontWeight: 800, color: 'var(--md-sys-color-on-surface)' }}>
                                  {tx.fundCode} • {formatVND(tx.amount)}
                                </div>
                                <div style={{ fontSize: '10px', color: 'var(--md-sys-color-on-surface-variant)' }}>
                                  {tx.date} {tx.notes ? `• ${tx.notes}` : ''}
                                </div>
                              </div>
                            </div>
                            <span className="material-symbols-outlined" style={{ fontSize: '16px', color: 'var(--md-sys-color-outline)' }}>
                              arrow_forward
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Category 3: Mục Tiêu Tài Chính */}
                  {matchedGoals.length > 0 && (
                    <div>
                      <span style={{ fontSize: '12px', fontWeight: 800, color: 'var(--md-sys-color-tertiary)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                        Mục Tiêu Tài Chính ({matchedGoals.length})
                      </span>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginTop: '8px' }}>
                        {matchedGoals.map((g) => (
                          <div
                            key={g.id}
                            onClick={() => handleSelectGoal(g.name)}
                            style={{
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'space-between',
                              padding: '10px 14px',
                              borderRadius: '16px',
                              backgroundColor: 'var(--md-sys-color-surface-container-low)',
                              border: '1px solid var(--md-sys-color-outline-variant)',
                              cursor: 'pointer',
                            }}
                          >
                            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                              <div className="m3-icon-badge-purple" style={{ width: '32px', height: '32px' }}>
                                <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>flag</span>
                              </div>
                              <div>
                                <div style={{ fontSize: '13px', fontWeight: 800, color: 'var(--md-sys-color-on-surface)' }}>{g.name}</div>
                                <div style={{ fontSize: '10px', color: 'var(--md-sys-color-on-surface-variant)' }}>Mục tiêu: {formatVND(g.targetAmount)}</div>
                              </div>
                            </div>
                            <span className="material-symbols-outlined" style={{ fontSize: '16px', color: 'var(--md-sys-color-outline)' }}>
                              arrow_forward
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* No results */}
                  {matchedFunds.length === 0 && matchedTransactions.length === 0 && matchedGoals.length === 0 && (
                    <div style={{ textAlign: 'center', padding: '40px 16px', color: 'var(--md-sys-color-on-surface-variant)' }}>
                      <span className="material-symbols-outlined" style={{ fontSize: '48px', color: 'var(--md-sys-color-outline)' }}>
                        search_off
                      </span>
                      <p style={{ marginTop: '12px', fontSize: '14px', fontWeight: 700 }}>
                        Không tìm thấy kết quả nào cho "{query}"
                      </p>
                      <p style={{ fontSize: '12px', marginTop: '4px' }}>
                        Thử tìm theo mã quỹ (VD: VESAF, DCBC) hoặc tên mục tiêu.
                      </p>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
