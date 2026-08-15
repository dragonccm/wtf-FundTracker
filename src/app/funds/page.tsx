'use client';

import React, { useState } from 'react';
import { useAppStore } from '@/lib/store/appStore';
import { FundCategory } from '@/types';
import { formatVND } from '@/lib/finance/portfolio';
import { useToast } from '@/components/feedback/ToastProvider';

const today = () => new Date().toISOString().slice(0, 10);

function formatSyncTime(timestamp: number | null) {
  if (!timestamp) return 'Chưa đồng bộ';
  const date = new Date(timestamp);
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const month = String(date.getMonth() + 1).padStart(2, '0');
  return `${hours}:${minutes} (${day}/${month})`;
}

export default function FundsPage() {
  const { funds, addFund, updateFundNav, lastNavSyncAt, isSyncingNav, syncNavAutomatically } = useAppStore();
  const { showToast } = useToast();
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [editingFundId, setEditingFundId] = useState<string | null>(null);
  const [code, setCode] = useState('');
  const [name, setName] = useState('');
  const [company, setCompany] = useState('');
  const [category, setCategory] = useState<FundCategory>('Equity');
  const [nav, setNav] = useState('');
  const [navDate, setNavDate] = useState(today());
  const [newNav, setNewNav] = useState('');
  const [newNavDate, setNewNavDate] = useState(today());

  const createFund = (event: React.FormEvent) => {
    event.preventDefault();
    const normalizedCode = code.trim().toUpperCase();
    const parsedNav = Number(nav);
    if (!normalizedCode || !name.trim() || !company.trim() || parsedNav <= 0) {
      showToast('error', 'Hãy nhập đủ mã quỹ, tên quỹ, công ty quản lý và NAV hợp lệ.');
      return;
    }

    addFund({
      code: normalizedCode,
      name: name.trim(),
      company: company.trim(),
      category,
      nav: parsedNav,
      previousNav: parsedNav,
      navDate,
      inceptionDate: navDate,
      expenseRatioPercent: 0,
      description: '',
    });
    setCode('');
    setName('');
    setCompany('');
    setNav('');
    setIsCreateOpen(false);
  };

  const saveNav = (event: React.FormEvent) => {
    event.preventDefault();
    const value = Number(newNav);
    if (!editingFundId || value <= 0) {
      showToast('error', 'NAV mới phải lớn hơn 0.');
      return;
    }
    updateFundNav(editingFundId, value, newNavDate);
    setEditingFundId(null);
    setNewNav('');
  };

  return (
    <div className="journal-page">
      <div className="journal-page-header">
        <div>
          <span className="journal-eyebrow">Nguồn dữ liệu</span>
          <h1 className="journal-page-title">Quỹ đầu tư</h1>
        </div>
        <button type="button" className="journal-icon-button" onClick={() => setIsCreateOpen(true)} aria-label="Thêm quỹ">
          <span className="material-symbols-outlined">add</span>
        </button>
      </div>

      {/* Auto-Sync Status Bar */}
      <div
        className="journal-card"
        style={{
          padding: '12px 16px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          gap: 12,
          backgroundColor: 'var(--journal-surface-variant)',
          borderRadius: 16,
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span
            className="material-symbols-outlined"
            style={{
              fontSize: 20,
              color: isSyncingNav ? 'var(--journal-primary)' : 'var(--journal-success)',
              animation: isSyncingNav ? 'spin 1.5s linear infinite' : 'none',
            }}
          >
            {isSyncingNav ? 'sync' : 'cloud_done'}
          </span>
          <span style={{ fontSize: 13, color: 'var(--journal-ink)' }}>
            <strong>Tự động đồng bộ Fmarket</strong>
            <span style={{ display: 'block', fontSize: 11, color: 'var(--journal-muted)' }}>
              {isSyncingNav ? 'Đang kiểm tra NAV mới...' : `Cập nhật gần nhất: ${formatSyncTime(lastNavSyncAt)}`}
            </span>
          </span>
        </div>

        <button
          type="button"
          onClick={() => syncNavAutomatically(true)}
          disabled={isSyncingNav}
          className="journal-text-button"
          style={{ fontSize: 12, display: 'flex', alignItems: 'center', gap: 4 }}
        >
          <span className="material-symbols-outlined" style={{ fontSize: 16 }}>refresh</span>
          Đồng bộ ngay
        </button>
      </div>

      {funds.length === 0 ? (
        <section className="journal-card journal-empty">
          <div className="journal-empty-visual">
            <span className="material-symbols-outlined" style={{ fontSize: 36 }}>finance</span>
          </div>
          <h2>Chưa có dữ liệu quỹ</h2>
          <p>Hệ thống tự động cập nhật NAV hàng ngày từ các công ty quản lý quỹ.</p>
          <button className="journal-primary-button" type="button" onClick={() => setIsCreateOpen(true)}>
            Thêm quỹ đầu tiên
          </button>
        </section>
      ) : (
        <section className="journal-list">
          {funds.map((fund) => {
            const change = fund.previousNav > 0 ? ((fund.nav - fund.previousNav) / fund.previousNav) * 100 : 0;
            return (
              <button
                type="button"
                className="journal-list-item"
                key={fund.id}
                style={{ width: '100%', border: 0, background: 'transparent', textAlign: 'left', cursor: 'pointer' }}
                onClick={() => {
                  setEditingFundId(fund.id);
                  setNewNav(String(fund.nav));
                  setNewNavDate(today());
                }}
              >
                <span className="journal-fund-mark">{fund.code.slice(0, 4)}</span>
                <span style={{ minWidth: 0 }}>
                  <strong style={{ display: 'block', fontSize: 14 }}>{fund.code}</strong>
                  <small style={{ color: 'var(--journal-muted)', display: 'block', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {fund.company} • {fund.navDate || 'Hôm nay'}
                  </small>
                </span>
                <span style={{ textAlign: 'right' }}>
                  <strong style={{ display: 'block', fontSize: 14 }}>{formatVND(fund.nav)}</strong>
                  <small style={{ color: change >= 0 ? 'var(--journal-success)' : 'var(--journal-danger)', fontWeight: 500 }}>
                    {change >= 0 ? '+' : ''}{change.toFixed(2)}%
                  </small>
                </span>
              </button>
            );
          })}
        </section>
      )}

      <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: 'var(--journal-muted)', fontSize: 12, paddingInline: 4 }}>
        <span className="material-symbols-outlined" style={{ fontSize: 18 }}>info</span>
        Nhấn vào từng quỹ nếu bạn muốn ghi đè hoặc chỉnh sửa NAV thủ công.
      </div>

      {isCreateOpen && (
        <div className="journal-scrim" onClick={() => setIsCreateOpen(false)}>
          <section className="journal-sheet" onClick={(event) => event.stopPropagation()}>
            <div className="journal-sheet-handle" />
            <h2 style={{ marginBottom: 16 }}>Thêm quỹ</h2>
            <form className="journal-form" onSubmit={createFund}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                <div className="journal-field">
                  <label htmlFor="fund-code">Mã quỹ</label>
                  <input id="fund-code" value={code} onChange={(event) => setCode(event.target.value)} placeholder="VESAF" required />
                </div>
                <div className="journal-field">
                  <label htmlFor="fund-category">Loại</label>
                  <select id="fund-category" value={category} onChange={(event) => setCategory(event.target.value as FundCategory)}>
                    <option value="Equity">Cổ phiếu</option>
                    <option value="Bond">Trái phiếu</option>
                    <option value="Balanced">Cân bằng</option>
                    <option value="Index">Chỉ số</option>
                  </select>
                </div>
              </div>
              <div className="journal-field">
                <label htmlFor="fund-name">Tên quỹ</label>
                <input id="fund-name" value={name} onChange={(event) => setName(event.target.value)} required />
              </div>
              <div className="journal-field">
                <label htmlFor="fund-company">Công ty quản lý</label>
                <input id="fund-company" value={company} onChange={(event) => setCompany(event.target.value)} required />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                <div className="journal-field">
                  <label htmlFor="fund-nav">NAV</label>
                  <input id="fund-nav" type="number" min="0" step="any" value={nav} onChange={(event) => setNav(event.target.value)} required />
                </div>
                <div className="journal-field">
                  <label htmlFor="fund-date">Ngày NAV</label>
                  <input id="fund-date" type="date" value={navDate} onChange={(event) => setNavDate(event.target.value)} required />
                </div>
              </div>
              <button className="journal-primary-button" type="submit">Lưu quỹ</button>
            </form>
          </section>
        </div>
      )}

      {editingFundId && (
        <div className="journal-scrim" onClick={() => setEditingFundId(null)}>
          <section className="journal-sheet" onClick={(event) => event.stopPropagation()}>
            <div className="journal-sheet-handle" />
            <h2 style={{ marginBottom: 16 }}>Chỉnh sửa NAV thủ công</h2>
            <form className="journal-form" onSubmit={saveNav}>
              <div className="journal-field">
                <label htmlFor="new-nav">NAV mới</label>
                <input id="new-nav" type="number" min="0" step="any" value={newNav} onChange={(event) => setNewNav(event.target.value)} required />
              </div>
              <div className="journal-field">
                <label htmlFor="new-nav-date">Ngày công bố</label>
                <input id="new-nav-date" type="date" value={newNavDate} onChange={(event) => setNewNavDate(event.target.value)} required />
              </div>
              <button className="journal-primary-button" type="submit">Cập nhật</button>
            </form>
          </section>
        </div>
      )}
    </div>
  );
}
