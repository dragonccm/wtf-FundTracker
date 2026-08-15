'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { useAppStore } from '@/lib/store/appStore';
import { FundCategory } from '@/types';
import { formatVND } from '@/lib/finance/portfolio';
import { useToast } from '@/components/feedback/ToastProvider';

const today = () => new Date().toISOString().slice(0, 10);

interface MarketFundItem {
  code: string;
  name: string;
  company: string;
  category: FundCategory;
  nav: number;
  previousNav: number;
  navDate: string;
  changePercent: number;
}

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
  const [createMode, setCreateMode] = useState<'LOOKUP' | 'MANUAL'>('LOOKUP');
  const [editingFundId, setEditingFundId] = useState<string | null>(null);

  // Market Catalog State
  const [marketCatalog, setMarketCatalog] = useState<MarketFundItem[]>([]);
  const [isLoadingCatalog, setIsLoadingCatalog] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState<'ALL' | FundCategory>('ALL');

  // Manual Form State
  const [code, setCode] = useState('');
  const [name, setName] = useState('');
  const [company, setCompany] = useState('');
  const [category, setCategory] = useState<FundCategory>('Equity');
  const [nav, setNav] = useState('');
  const [navDate, setNavDate] = useState(today());

  // Edit NAV Form State
  const [newNav, setNewNav] = useState('');
  const [newNavDate, setNewNavDate] = useState(today());

  // Existing fund codes set for fast lookup
  const existingFundCodes = useMemo(
    () => new Set(funds.map((f) => f.code.toUpperCase())),
    [funds]
  );

  // Fetch full Fmarket catalog when modal opens
  useEffect(() => {
    if (!isCreateOpen || marketCatalog.length > 0) return;

    setIsLoadingCatalog(true);
    fetch('/api/funds/auto-sync', { method: 'GET' })
      .then((res) => res.json())
      .then((data) => {
        if (data?.success && data?.data) {
          const list: MarketFundItem[] = Object.values(data.data);
          setMarketCatalog(list);
        }
      })
      .catch((err) => {
        console.debug('Failed to fetch market catalog:', err);
      })
      .finally(() => {
        setIsLoadingCatalog(false);
      });
  }, [isCreateOpen, marketCatalog.length]);

  // Filtered Catalog
  const filteredCatalog = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    return marketCatalog.filter((item) => {
      if (selectedCategoryFilter !== 'ALL' && item.category !== selectedCategoryFilter) {
        return false;
      }
      if (!query) return true;
      return (
        item.code.toLowerCase().includes(query) ||
        item.name.toLowerCase().includes(query) ||
        item.company.toLowerCase().includes(query)
      );
    });
  }, [marketCatalog, searchQuery, selectedCategoryFilter]);

  const handleAddFromMarket = (marketItem: MarketFundItem) => {
    if (existingFundCodes.has(marketItem.code.toUpperCase())) {
      showToast('info', `Quỹ ${marketItem.code} đã có trong danh mục của bạn.`);
      return;
    }

    addFund({
      code: marketItem.code,
      name: marketItem.name,
      company: marketItem.company,
      category: marketItem.category,
      nav: marketItem.nav,
      previousNav: marketItem.previousNav || marketItem.nav,
      navDate: marketItem.navDate || today(),
      inceptionDate: marketItem.navDate || today(),
      expenseRatioPercent: 0,
      description: '',
    });

    showToast('success', `Đã thêm quỹ ${marketItem.code} vào danh mục.`);
    setIsCreateOpen(false);
  };

  const createManualFund = (event: React.FormEvent) => {
    event.preventDefault();
    const normalizedCode = code.trim().toUpperCase();
    const parsedNav = Number(nav);
    if (!normalizedCode || !name.trim() || !company.trim() || parsedNav <= 0) {
      showToast('error', 'Hãy nhập đủ mã quỹ, tên quỹ, công ty quản lý và NAV hợp lệ.');
      return;
    }

    if (existingFundCodes.has(normalizedCode)) {
      showToast('error', `Quỹ ${normalizedCode} đã có trong danh mục của bạn.`);
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
        <button
          type="button"
          className="journal-icon-button"
          onClick={() => {
            setSearchQuery('');
            setIsCreateOpen(true);
          }}
          aria-label="Thêm quỹ"
        >
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
          <p>Tra cứu và thêm các quỹ từ Fmarket để bắt đầu theo dõi tự động.</p>
          <button
            className="journal-primary-button"
            type="button"
            onClick={() => {
              setSearchQuery('');
              setIsCreateOpen(true);
            }}
          >
            <span className="material-symbols-outlined">search</span>
            Tra cứu & Thêm quỹ
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
        Nhấn vào từng quỹ để xem chi tiết hoặc chỉnh sửa NAV thủ công nếu cần.
      </div>

      {/* MODAL: Thêm Quỹ & Tra cứu từ Fmarket */}
      {isCreateOpen && (
        <div className="journal-scrim" onClick={() => setIsCreateOpen(false)}>
          <section
            className="journal-sheet"
            style={{ maxHeight: '85vh', display: 'flex', flexDirection: 'column' }}
            onClick={(event) => event.stopPropagation()}
          >
            <div className="journal-sheet-handle" />

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
              <h2 style={{ fontSize: 18, margin: 0 }}>Thêm Quỹ Đầu Tư</h2>
              <button
                type="button"
                onClick={() => setIsCreateOpen(false)}
                className="journal-icon-button"
                aria-label="Đóng"
              >
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>

            {/* Switch Mode Segmented Tabs */}
            <div className="m3-segmented-control" style={{ marginBottom: 14 }}>
              <button
                type="button"
                className={`m3-segment-btn ${createMode === 'LOOKUP' ? 'active' : ''}`}
                onClick={() => setCreateMode('LOOKUP')}
              >
                <span className="material-symbols-outlined" style={{ fontSize: 18 }}>search</span>
                Tra cứu Fmarket ({marketCatalog.length || '68+'})
              </button>
              <button
                type="button"
                className={`m3-segment-btn ${createMode === 'MANUAL' ? 'active' : ''}`}
                onClick={() => setCreateMode('MANUAL')}
              >
                <span className="material-symbols-outlined" style={{ fontSize: 18 }}>edit_note</span>
                Tự nhập thủ công
              </button>
            </div>

            {/* TAB 1: LOOKUP FROM FMARKET */}
            {createMode === 'LOOKUP' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10, flex: 1, minHeight: 0 }}>
                <div className="journal-field" style={{ margin: 0 }}>
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Tìm theo mã quỹ hoặc công ty (VD: VESAF, DCDS, SSI, Vina...)"
                    autoFocus
                  />
                </div>

                {/* Category Chips Filter */}
                <div style={{ display: 'flex', gap: 6, overflowX: 'auto', paddingBottom: 4 }}>
                  {[
                    { id: 'ALL', label: 'Tất cả' },
                    { id: 'Equity', label: 'Cổ phiếu' },
                    { id: 'Bond', label: 'Trái phiếu' },
                    { id: 'Balanced', label: 'Cân bằng' },
                  ].map((cat) => (
                    <button
                      key={cat.id}
                      type="button"
                      onClick={() => setSelectedCategoryFilter(cat.id as any)}
                      className={`m3-chip ${selectedCategoryFilter === cat.id ? 'active' : ''}`}
                      style={{ padding: '4px 12px', fontSize: 12, height: 30 }}
                    >
                      {cat.label}
                    </button>
                  ))}
                </div>

                {/* Fund List Results */}
                <div
                  style={{
                    flex: 1,
                    overflowY: 'auto',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 8,
                    maxHeight: '45vh',
                    paddingRight: 2,
                  }}
                >
                  {isLoadingCatalog ? (
                    <div style={{ textAlign: 'center', padding: '30px 0', color: 'var(--journal-muted)' }}>
                      <span className="material-symbols-outlined" style={{ animation: 'spin 1.5s linear infinite', fontSize: 28 }}>
                        progress_activity
                      </span>
                      <p style={{ marginTop: 8, fontSize: 13 }}>Đang tải danh sách 68 quỹ từ Fmarket...</p>
                    </div>
                  ) : filteredCatalog.length === 0 ? (
                    <div style={{ textAlign: 'center', padding: '30px 0', color: 'var(--journal-muted)' }}>
                      <span className="material-symbols-outlined" style={{ fontSize: 32 }}>search_off</span>
                      <p style={{ marginTop: 6, fontSize: 13 }}>Không tìm thấy quỹ nào khớp với từ khóa "{searchQuery}"</p>
                      <button
                        type="button"
                        className="journal-text-button"
                        onClick={() => {
                          setCode(searchQuery.toUpperCase());
                          setCreateMode('MANUAL');
                        }}
                        style={{ marginTop: 8 }}
                      >
                        + Tự tạo quỹ "{searchQuery.toUpperCase()}"
                      </button>
                    </div>
                  ) : (
                    filteredCatalog.map((item) => {
                      const isAdded = existingFundCodes.has(item.code.toUpperCase());
                      return (
                        <div
                          key={item.code}
                          style={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            padding: '12px 14px',
                            borderRadius: 16,
                            backgroundColor: 'var(--journal-surface-variant)',
                            border: isAdded ? '1px solid var(--journal-primary)' : '1px solid transparent',
                          }}
                        >
                          <div style={{ display: 'flex', alignItems: 'center', gap: 10, minWidth: 0, flex: 1 }}>
                            <span className="journal-fund-mark" style={{ minWidth: 38, width: 38, height: 38 }}>
                              {item.code.slice(0, 4)}
                            </span>
                            <div style={{ minWidth: 0, paddingRight: 8 }}>
                              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                                <strong style={{ fontSize: 14 }}>{item.code}</strong>
                                <span
                                  style={{
                                    fontSize: 10,
                                    padding: '2px 6px',
                                    borderRadius: 6,
                                    backgroundColor: 'var(--journal-canvas)',
                                    color: 'var(--journal-muted)',
                                  }}
                                >
                                  {item.category === 'Equity' ? 'Cổ phiếu' : item.category === 'Bond' ? 'Trái phiếu' : 'Cân bằng'}
                                </span>
                              </div>
                              <small
                                style={{
                                  color: 'var(--journal-muted)',
                                  display: 'block',
                                  overflow: 'hidden',
                                  textOverflow: 'ellipsis',
                                  whiteSpace: 'nowrap',
                                  fontSize: 11,
                                }}
                              >
                                {item.company} • {item.name}
                              </small>
                            </div>
                          </div>

                          <div style={{ textAlign: 'right', display: 'flex', alignItems: 'center', gap: 10 }}>
                            <div>
                              <strong style={{ display: 'block', fontSize: 13 }}>{formatVND(item.nav)}</strong>
                              <small
                                style={{
                                  fontSize: 10,
                                  color: item.changePercent >= 0 ? 'var(--journal-success)' : 'var(--journal-danger)',
                                  fontWeight: 500,
                                }}
                              >
                                {item.changePercent >= 0 ? '+' : ''}{item.changePercent.toFixed(2)}%
                              </small>
                            </div>

                            {isAdded ? (
                              <span
                                style={{
                                  fontSize: 11,
                                  color: 'var(--journal-primary)',
                                  display: 'flex',
                                  alignItems: 'center',
                                  gap: 2,
                                  fontWeight: 500,
                                }}
                              >
                                <span className="material-symbols-outlined" style={{ fontSize: 16 }}>check_circle</span>
                                Đã thêm
                              </span>
                            ) : (
                              <button
                                type="button"
                                onClick={() => handleAddFromMarket(item)}
                                className="journal-primary-button"
                                style={{
                                  minHeight: 32,
                                  padding: '0 12px',
                                  fontSize: 12,
                                  borderRadius: 12,
                                }}
                              >
                                + Thêm
                              </button>
                            )}
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>
            )}

            {/* TAB 2: MANUAL INPUT */}
            {createMode === 'MANUAL' && (
              <form className="journal-form" onSubmit={createManualFund}>
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
                  <input id="fund-name" value={name} onChange={(event) => setName(event.target.value)} placeholder="Tên đầy đủ của quỹ" required />
                </div>
                <div className="journal-field">
                  <label htmlFor="fund-company">Công ty quản lý</label>
                  <input id="fund-company" value={company} onChange={(event) => setCompany(event.target.value)} placeholder="VinaCapital / Dragon Capital..." required />
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                  <div className="journal-field">
                    <label htmlFor="fund-nav">NAV ban đầu</label>
                    <input id="fund-nav" type="number" min="0" step="any" value={nav} onChange={(event) => setNav(event.target.value)} placeholder="30000" required />
                  </div>
                  <div className="journal-field">
                    <label htmlFor="fund-date">Ngày NAV</label>
                    <input id="fund-date" type="date" value={navDate} onChange={(event) => setNavDate(event.target.value)} required />
                  </div>
                </div>
                <button className="journal-primary-button" type="submit">Lưu quỹ vào danh mục</button>
              </form>
            )}
          </section>
        </div>
      )}

      {/* MODAL: Chỉnh Sửa NAV Thủ Công */}
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
