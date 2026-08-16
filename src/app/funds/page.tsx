'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { useAppStore } from '@/lib/store/appStore';
import { FundCategory } from '@/types';
import { formatVND, formatInputCurrency, parseInputCurrency } from '@/lib/finance/portfolio';
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

const getCategoryMeta = (cat: FundCategory) => {
  switch (cat) {
    case 'Equity':
      return { label: 'Cổ phiếu', bg: '#e8eaf6', text: '#283593', icon: 'trending_up' };
    case 'Bond':
      return { label: 'Trái phiếu', bg: '#e8f5e9', text: '#2e7d32', icon: 'shield' };
    case 'Balanced':
      return { label: 'Cân bằng', bg: '#fff3e0', text: '#e65100', icon: 'balance' };
    case 'Index':
    default:
      return { label: 'Chỉ số', bg: '#f3e5f5', text: '#6a1b9a', icon: 'analytics' };
  }
};

export default function FundsPage() {
  const { funds, addFund, addFundsBatch, updateFundNav, lastNavSyncAt, isSyncingNav, syncNavAutomatically } = useAppStore();
  const { showToast } = useToast();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalTab, setModalTab] = useState<'CATALOG' | 'MANUAL'>('CATALOG');
  const [editingFundId, setEditingFundId] = useState<string | null>(null);

  // Search & Filters on main list
  const [mainFilterCategory, setMainFilterCategory] = useState<'ALL' | FundCategory>('ALL');

  // Market Catalog State in Modal
  const [marketCatalog, setMarketCatalog] = useState<MarketFundItem[]>([]);
  const [isLoadingCatalog, setIsLoadingCatalog] = useState(false);
  const [modalSearch, setModalSearch] = useState('');
  const [modalCategoryFilter, setModalCategoryFilter] = useState<'ALL' | 'UNADDED' | 'ADDED' | FundCategory>('ALL');

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

  // Fetch full Fmarket catalog when modal opens or on demand
  const loadMarketCatalog = () => {
    if (isLoadingCatalog) return;
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
  };

  useEffect(() => {
    if (isModalOpen && marketCatalog.length === 0) {
      loadMarketCatalog();
    }
  }, [isModalOpen, marketCatalog.length]);

  // Filtered Catalog in Modal
  const filteredCatalog = useMemo(() => {
    const query = modalSearch.trim().toLowerCase();
    return marketCatalog.filter((item) => {
      const isAdded = existingFundCodes.has(item.code.toUpperCase());
      if (modalCategoryFilter === 'UNADDED' && isAdded) return false;
      if (modalCategoryFilter === 'ADDED' && !isAdded) return false;
      if (
        modalCategoryFilter !== 'ALL' &&
        modalCategoryFilter !== 'UNADDED' &&
        modalCategoryFilter !== 'ADDED' &&
        item.category !== modalCategoryFilter
      ) {
        return false;
      }
      if (!query) return true;
      return (
        item.code.toLowerCase().includes(query) ||
        item.name.toLowerCase().includes(query) ||
        item.company.toLowerCase().includes(query)
      );
    });
  }, [marketCatalog, modalSearch, modalCategoryFilter, existingFundCodes]);

  const unaddedCountInFilter = useMemo(() => {
    return filteredCatalog.filter((item) => !existingFundCodes.has(item.code.toUpperCase())).length;
  }, [filteredCatalog, existingFundCodes]);

  // Main Page Filtered Funds
  const filteredMainFunds = useMemo(() => {
    if (mainFilterCategory === 'ALL') return funds;
    return funds.filter((f) => f.category === mainFilterCategory);
  }, [funds, mainFilterCategory]);

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
  };

  const handleAddAllFiltered = () => {
    const toAdd = filteredCatalog.filter((item) => !existingFundCodes.has(item.code.toUpperCase()));
    if (toAdd.length === 0) {
      showToast('info', 'Tất cả quỹ trong danh sách đã được thêm.');
      return;
    }

    addFundsBatch(
      toAdd.map((item) => ({
        code: item.code,
        name: item.name,
        company: item.company,
        category: item.category,
        nav: item.nav,
        previousNav: item.previousNav || item.nav,
        navDate: item.navDate || today(),
        inceptionDate: item.navDate || today(),
        expenseRatioPercent: 0,
        description: '',
      }))
    );
  };

  const handleCreateManualFund = (event: React.FormEvent) => {
    event.preventDefault();
    const normalizedCode = code.trim().toUpperCase();
    const parsedNav = parseInputCurrency(nav);
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
    setIsModalOpen(false);
  };

  const handleSaveNav = (event: React.FormEvent) => {
    event.preventDefault();
    const value = parseInputCurrency(newNav);
    if (!editingFundId || value <= 0) {
      showToast('error', 'NAV mới phải lớn hơn 0.');
      return;
    }
    updateFundNav(editingFundId, value, newNavDate);
    setEditingFundId(null);
    setNewNav('');
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      {/* Header Section */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <h1 style={{ fontSize: '22px', fontWeight: 600, color: 'var(--md-sys-color-on-surface)', margin: 0 }}>
              Quỹ Đầu Tư
            </h1>
            <span
              style={{
                fontSize: '11px',
                fontWeight: 600,
                padding: '2px 8px',
                borderRadius: '999px',
                backgroundColor: 'var(--journal-primary-container)',
                color: 'var(--journal-primary-strong)',
              }}
            >
              {funds.length} quỹ
            </span>
          </div>
          <p style={{ fontSize: '12px', color: 'var(--md-sys-color-on-surface-variant)', marginTop: '2px', margin: 0 }}>
            {isSyncingNav ? 'Đang đồng bộ NAV từ Fmarket...' : `Fmarket • Cập nhật: ${formatSyncTime(lastNavSyncAt)}`}
          </p>
        </div>

        {/* Top Actions: Thêm Quỹ & Icon Reload Đồng Bộ */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <button
            type="button"
            onClick={() => {
              setModalSearch('');
              setModalCategoryFilter('ALL');
              setIsModalOpen(true);
            }}
            className="m3-pill-btn-primary"
          >
            <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>add</span>
            Thêm Quỹ
          </button>

          <button
            type="button"
            onClick={() => syncNavAutomatically(true)}
            disabled={isSyncingNav}
            title={isSyncingNav ? 'Đang đồng bộ...' : `Đồng bộ NAV từ Fmarket (Cập nhật: ${formatSyncTime(lastNavSyncAt)})`}
            aria-label="Đồng bộ NAV Fmarket"
            className="m3-pill-btn"
            style={{
              width: '40px',
              height: '40px',
              padding: 0,
              display: 'grid',
              placeItems: 'center',
              borderRadius: '50%',
            }}
          >
            <span
              className="material-symbols-outlined"
              style={{
                fontSize: '20px',
                animation: isSyncingNav ? 'spin 1.5s linear infinite' : 'none',
              }}
            >
              refresh
            </span>
          </button>
        </div>
      </div>

      {/* Category Filter Chips on Main Page */}
      {funds.length > 0 && (
        <div style={{ display: 'flex', gap: '8px', overflowX: 'auto', paddingBottom: '2px' }}>
          {[
            { id: 'ALL', label: `Tất cả (${funds.length})` },
            { id: 'Equity', label: `Cổ phiếu (${funds.filter((f) => f.category === 'Equity').length})` },
            { id: 'Bond', label: `Trái phiếu (${funds.filter((f) => f.category === 'Bond').length})` },
            { id: 'Balanced', label: `Cân bằng (${funds.filter((f) => f.category === 'Balanced').length})` },
          ].map((tab) => {
            const isActive = mainFilterCategory === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setMainFilterCategory(tab.id as any)}
                className={`m3-chip ${isActive ? 'active' : ''}`}
                style={{ fontSize: '12px', padding: '6px 14px', height: '32px' }}
              >
                {tab.label}
              </button>
            );
          })}
        </div>
      )}

      {/* Main Funds List (Clean M3 Material UI) */}
      {funds.length === 0 ? (
        <div className="m3-card" style={{ textAlign: 'center', padding: '36px 16px' }}>
          <span className="material-symbols-outlined" style={{ fontSize: '44px', color: 'var(--md-sys-color-outline)' }}>
            account_balance_wallet
          </span>
          <h3 style={{ marginTop: '10px', fontSize: '15px', fontWeight: 600, color: 'var(--md-sys-color-on-surface)' }}>
            Chưa có quỹ nào trong danh mục
          </h3>
          <p style={{ marginTop: '4px', fontSize: '12px', color: 'var(--md-sys-color-on-surface-variant)', maxWidth: '340px', margin: '6px auto 16px auto' }}>
            Tra cứu và thêm các quỹ từ Fmarket để theo dõi NAV và ghi nhận giao dịch mua/bán.
          </p>
          <button
            type="button"
            onClick={() => {
              setModalSearch('');
              setIsModalOpen(true);
            }}
            className="m3-pill-btn-primary"
            style={{ margin: '0 auto', display: 'inline-flex' }}
          >
            <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>search</span>
            Tra cứu & Thêm Quỹ
          </button>
        </div>
      ) : (
        <div
          className="m3-card"
          style={{
            padding: 0,
            overflow: 'hidden',
            display: 'flex',
            flexDirection: 'column',
          }}
        >
          {filteredMainFunds.map((fund, index) => {
            const change = fund.previousNav > 0 ? ((fund.nav - fund.previousNav) / fund.previousNav) * 100 : 0;
            const meta = getCategoryMeta(fund.category);

            return (
              <div
                key={fund.id}
                onClick={() => {
                  setEditingFundId(fund.id);
                  setNewNav(formatInputCurrency(fund.nav));
                  setNewNavDate(today());
                }}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '14px 16px',
                  cursor: 'pointer',
                  borderBottom: index < filteredMainFunds.length - 1 ? '1px solid var(--md-sys-color-outline-variant)' : 'none',
                  backgroundColor: 'transparent',
                  transition: 'background-color 0.15s ease',
                }}
                onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = 'var(--md-sys-color-surface-container)')}
                onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
              >
                {/* Left: Avatar & Info */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', minWidth: 0 }}>
                  <div
                    style={{
                      width: '42px',
                      height: '42px',
                      borderRadius: '12px',
                      backgroundColor: meta.bg,
                      color: meta.text,
                      display: 'grid',
                      placeItems: 'center',
                      fontWeight: 700,
                      fontSize: '11px',
                      letterSpacing: '0.5px',
                    }}
                  >
                    {fund.code.slice(0, 4)}
                  </div>

                  <div style={{ minWidth: 0 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <span style={{ fontSize: '15px', fontWeight: 600, color: 'var(--md-sys-color-on-surface)' }}>
                        {fund.code}
                      </span>
                      <span
                        style={{
                          fontSize: '10px',
                          padding: '1px 6px',
                          borderRadius: '6px',
                          backgroundColor: meta.bg,
                          color: meta.text,
                          fontWeight: 600,
                        }}
                      >
                        {meta.label}
                      </span>
                    </div>
                    <div style={{ fontSize: '11px', color: 'var(--md-sys-color-on-surface-variant)', marginTop: '2px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {fund.company} • {fund.navDate || 'Hôm nay'}
                    </div>
                  </div>
                </div>

                {/* Right: NAV Price & Change % */}
                <div style={{ textAlign: 'right', display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '2px' }}>
                  <span style={{ fontSize: '15px', fontWeight: 600, color: 'var(--md-sys-color-on-surface)', fontVariantNumeric: 'tabular-nums' }}>
                    {formatVND(fund.nav)}
                  </span>
                  <span
                    style={{
                      fontSize: '11px',
                      fontWeight: 600,
                      color: change > 0 ? 'var(--journal-success)' : change < 0 ? 'var(--journal-danger)' : 'var(--md-sys-color-on-surface-variant)',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '2px',
                    }}
                  >
                    <span className="material-symbols-outlined" style={{ fontSize: '13px' }}>
                      {change > 0 ? 'trending_up' : change < 0 ? 'trending_down' : 'remove'}
                    </span>
                    {change > 0 ? `+${change.toFixed(2)}%` : `${change.toFixed(2)}%`}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* MODAL: Tra cứu & Thêm Quỹ Fmarket (Clean Google M3 Layout) */}
      {isModalOpen && (
        <div
          className="journal-scrim"
          onClick={() => setIsModalOpen(false)}
        >
          <div
            className="journal-sheet"
            style={{
              width: 'min(100%, 560px)',
              maxHeight: '88vh',
              display: 'flex',
              flexDirection: 'column',
              padding: '20px',
              borderRadius: '24px',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
              <div>
                <h2 style={{ fontSize: '18px', fontWeight: 600, color: 'var(--md-sys-color-on-surface)', margin: 0 }}>
                  Thêm Quỹ Đầu Tư
                </h2>
                <p style={{ fontSize: '12px', color: 'var(--md-sys-color-on-surface-variant)', margin: '2px 0 0' }}>
                  Toàn bộ 68+ quỹ mở và ETF niêm yết trên Fmarket
                </p>
              </div>

              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                style={{
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  padding: '6px',
                  color: 'var(--md-sys-color-on-surface-variant)',
                  display: 'flex',
                }}
              >
                <span className="material-symbols-outlined" style={{ fontSize: '20px' }}>close</span>
              </button>
            </div>

            {/* Segmented Mode Tabs */}
            <div className="m3-segmented-group" style={{ marginBottom: '12px' }}>
              <button
                type="button"
                onClick={() => setModalTab('CATALOG')}
                className={`m3-segmented-item ${modalTab === 'CATALOG' ? 'active' : ''}`}
                style={{ flex: 1, justifyContent: 'center' }}
              >
                <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>search</span>
                Tra cứu Fmarket ({marketCatalog.length || '68+'})
              </button>
              <button
                type="button"
                onClick={() => setModalTab('MANUAL')}
                className={`m3-segmented-item ${modalTab === 'MANUAL' ? 'active' : ''}`}
                style={{ flex: 1, justifyContent: 'center' }}
              >
                <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>edit_note</span>
                Tự nhập thủ công
              </button>
            </div>

            {/* TAB 1: CATALOG FROM FMARKET */}
            {modalTab === 'CATALOG' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', flex: 1, minHeight: 0 }}>
                {/* Search Input */}
                <div style={{ position: 'relative', width: '100%' }}>
                  <span
                    className="material-symbols-outlined"
                    style={{
                      position: 'absolute',
                      left: '12px',
                      top: '50%',
                      transform: 'translateY(-50%)',
                      fontSize: '18px',
                      color: 'var(--md-sys-color-on-surface-variant)',
                    }}
                  >
                    search
                  </span>
                  <input
                    type="text"
                    value={modalSearch}
                    onChange={(e) => setModalSearch(e.target.value)}
                    placeholder="Tìm theo mã hoặc tên (VD: VESAF, DCDS, SSI...)"
                    className="m3-input"
                    style={{ paddingLeft: '38px', height: '42px', fontSize: '13px' }}
                    autoFocus
                  />
                  {modalSearch.trim() && (
                    <button
                      type="button"
                      onClick={() => setModalSearch('')}
                      style={{
                        position: 'absolute',
                        right: '10px',
                        top: '50%',
                        transform: 'translateY(-50%)',
                        background: 'none',
                        border: 'none',
                        cursor: 'pointer',
                        color: 'var(--md-sys-color-on-surface-variant)',
                        padding: '4px',
                      }}
                    >
                      <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>cancel</span>
                    </button>
                  )}
                </div>

                {/* Filters & Bulk Action Header */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '6px' }}>
                  {/* Category Chips */}
                  <div style={{ display: 'flex', gap: '6px', overflowX: 'auto', paddingBottom: '2px' }}>
                    {[
                      { id: 'ALL', label: 'Tất cả (68)' },
                      { id: 'UNADDED', label: 'Chưa thêm' },
                      { id: 'ADDED', label: 'Đã thêm' },
                      { id: 'Equity', label: 'Cổ phiếu' },
                      { id: 'Bond', label: 'Trái phiếu' },
                      { id: 'Balanced', label: 'Cân bằng' },
                    ].map((tab) => {
                      const isActive = modalCategoryFilter === tab.id;
                      return (
                        <button
                          key={tab.id}
                          type="button"
                          onClick={() => setModalCategoryFilter(tab.id as any)}
                          className={`m3-chip ${isActive ? 'active' : ''}`}
                          style={{ padding: '3px 10px', fontSize: '11px', height: '26px' }}
                        >
                          {tab.label}
                        </button>
                      );
                    })}
                  </div>

                  {/* "Thêm tất cả" button */}
                  {unaddedCountInFilter > 0 && (
                    <button
                      type="button"
                      onClick={handleAddAllFiltered}
                      className="m3-pill-btn-primary"
                      style={{ padding: '4px 10px', fontSize: '11px' }}
                    >
                      <span className="material-symbols-outlined" style={{ fontSize: '14px' }}>playlist_add</span>
                      Thêm tất cả ({unaddedCountInFilter})
                    </button>
                  )}
                </div>

                {/* Catalog List (Material 3 Surface List) */}
                <div
                  style={{
                    flex: 1,
                    overflowY: 'auto',
                    border: '1px solid var(--md-sys-color-outline-variant)',
                    borderRadius: '16px',
                    backgroundColor: 'var(--md-sys-color-surface-container-lowest)',
                    maxHeight: '44vh',
                  }}
                >
                  {isLoadingCatalog ? (
                    <div style={{ textAlign: 'center', padding: '32px 0', color: 'var(--md-sys-color-on-surface-variant)' }}>
                      <span className="material-symbols-outlined" style={{ animation: 'spin 1.5s linear infinite', fontSize: '28px' }}>
                        progress_activity
                      </span>
                      <p style={{ marginTop: '8px', fontSize: '12px' }}>Đang tải 68 quỹ từ Fmarket...</p>
                    </div>
                  ) : filteredCatalog.length === 0 ? (
                    <div style={{ textAlign: 'center', padding: '32px 16px', color: 'var(--md-sys-color-on-surface-variant)' }}>
                      <span className="material-symbols-outlined" style={{ fontSize: '32px' }}>search_off</span>
                      <p style={{ marginTop: '6px', fontSize: '12px' }}>
                        Không có quỹ nào khớp với bộ lọc
                      </p>
                      <button
                        type="button"
                        onClick={() => {
                          setModalSearch('');
                          setModalCategoryFilter('ALL');
                        }}
                        className="m3-pill-btn"
                        style={{ marginTop: '8px', fontSize: '11px' }}
                      >
                        Xem lại tất cả 68 quỹ
                      </button>
                    </div>
                  ) : (
                    filteredCatalog.map((item, idx) => {
                      const isAdded = existingFundCodes.has(item.code.toUpperCase());
                      const meta = getCategoryMeta(item.category);

                      return (
                        <div
                          key={item.code}
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            padding: '10px 14px',
                            borderBottom: idx < filteredCatalog.length - 1 ? '1px solid var(--md-sys-color-outline-variant)' : 'none',
                            backgroundColor: isAdded ? 'var(--md-sys-color-surface-container-low)' : 'transparent',
                            gap: '10px',
                          }}
                        >
                          {/* Left: Mark & Info */}
                          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', minWidth: 0, flex: 1 }}>
                            <div
                              style={{
                                width: '36px',
                                height: '36px',
                                minWidth: '36px',
                                borderRadius: '10px',
                                backgroundColor: meta.bg,
                                color: meta.text,
                                display: 'grid',
                                placeItems: 'center',
                                fontWeight: 700,
                                fontSize: '10px',
                              }}
                            >
                              {item.code.slice(0, 4)}
                            </div>

                            <div style={{ minWidth: 0 }}>
                              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                <span style={{ fontSize: '13px', fontWeight: 600, color: 'var(--md-sys-color-on-surface)' }}>
                                  {item.code}
                                </span>
                                <span
                                  style={{
                                    fontSize: '9px',
                                    padding: '1px 5px',
                                    borderRadius: '4px',
                                    backgroundColor: meta.bg,
                                    color: meta.text,
                                    fontWeight: 600,
                                  }}
                                >
                                  {meta.label}
                                </span>
                              </div>
                              <div style={{ fontSize: '11px', color: 'var(--md-sys-color-on-surface-variant)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                {item.company} • {item.name}
                              </div>
                            </div>
                          </div>

                          {/* Right: Price & Action */}
                          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                            <div style={{ textAlign: 'right' }}>
                              <div style={{ fontSize: '13px', fontWeight: 600, color: 'var(--md-sys-color-on-surface)', fontVariantNumeric: 'tabular-nums' }}>
                                {formatVND(item.nav)}
                              </div>
                              <div
                                style={{
                                  fontSize: '10px',
                                  fontWeight: 600,
                                  color: item.changePercent > 0 ? 'var(--journal-success)' : item.changePercent < 0 ? 'var(--journal-danger)' : 'var(--md-sys-color-on-surface-variant)',
                                }}
                              >
                                {item.changePercent > 0 ? `+${item.changePercent.toFixed(2)}%` : `${item.changePercent.toFixed(2)}%`}
                              </div>
                            </div>

                            {isAdded ? (
                              <span
                                style={{
                                  display: 'inline-flex',
                                  alignItems: 'center',
                                  gap: '3px',
                                  fontSize: '11px',
                                  fontWeight: 600,
                                  color: 'var(--journal-success)',
                                  padding: '4px 8px',
                                  borderRadius: '999px',
                                  backgroundColor: 'rgba(56, 142, 60, 0.1)',
                                }}
                              >
                                <span className="material-symbols-outlined" style={{ fontSize: '14px' }}>check</span>
                                Đã thêm
                              </span>
                            ) : (
                              <button
                                type="button"
                                onClick={() => handleAddFromMarket(item)}
                                className="m3-pill-btn-primary"
                                style={{ padding: '4px 10px', fontSize: '11px' }}
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

                {/* Footer close button */}
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="m3-pill-btn"
                  style={{ width: '100%', marginTop: '4px' }}
                >
                  Xong ({funds.length} quỹ đang theo dõi)
                </button>
              </div>
            )}

            {/* TAB 2: MANUAL FORM */}
            {modalTab === 'MANUAL' && (
              <form onSubmit={handleCreateManualFund} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, minmax(0, 1fr))', gap: '10px' }}>
                  <div className="m3-form-group">
                    <label className="m3-form-label">Mã quỹ (*)</label>
                    <input
                      value={code}
                      onChange={(e) => setCode(e.target.value)}
                      placeholder="VD: VESAF"
                      required
                      className="m3-input"
                    />
                  </div>

                  <div className="m3-form-group">
                    <label className="m3-form-label">Loại quỹ</label>
                    <select
                      value={category}
                      onChange={(e) => setCategory(e.target.value as FundCategory)}
                      className="m3-select"
                    >
                      <option value="Equity">Cổ phiếu (Equity)</option>
                      <option value="Bond">Trái phiếu (Bond)</option>
                      <option value="Balanced">Cân bằng (Balanced)</option>
                      <option value="Index">Chỉ số (Index)</option>
                    </select>
                  </div>
                </div>

                <div className="m3-form-group">
                  <label className="m3-form-label">Tên đầy đủ của quỹ (*)</label>
                  <input
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="VD: Quỹ Đầu Tư Cổ Phiếu Tiếp Cận Thị Trường..."
                    required
                    className="m3-input"
                  />
                </div>

                <div className="m3-form-group">
                  <label className="m3-form-label">Công ty quản lý (*)</label>
                  <input
                    value={company}
                    onChange={(e) => setCompany(e.target.value)}
                    placeholder="VD: VinaCapital / Dragon Capital..."
                    required
                    className="m3-input"
                  />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, minmax(0, 1fr))', gap: '10px' }}>
                  <div className="m3-form-group">
                    <label className="m3-form-label">NAV ban đầu (VND) (*)</label>
                    <input
                      type="text"
                      inputMode="numeric"
                      value={nav}
                      onChange={(e) => setNav(formatInputCurrency(e.target.value))}
                      placeholder="30.000"
                      required
                      className="m3-input"
                    />
                  </div>

                  <div className="m3-form-group">
                    <label className="m3-form-label">Ngày NAV (*)</label>
                    <input
                      type="date"
                      value={navDate}
                      onChange={(e) => setNavDate(e.target.value)}
                      required
                      className="m3-input"
                    />
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '10px', marginTop: '6px' }}>
                  <button
                    type="button"
                    onClick={() => setIsModalOpen(false)}
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
                    Lưu Quỹ Mới
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

      {/* MODAL: Chỉnh Sửa NAV Thủ Công */}
      {editingFundId && (
        <div
          className="journal-scrim"
          onClick={() => setEditingFundId(null)}
        >
          <div
            className="journal-sheet"
            style={{
              width: 'min(100%, 420px)',
              padding: '20px',
              borderRadius: '24px',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
              <h2 style={{ fontSize: '17px', fontWeight: 600, color: 'var(--md-sys-color-on-surface)', margin: 0 }}>
                Chỉnh sửa NAV thủ công
              </h2>
              <button
                type="button"
                onClick={() => setEditingFundId(null)}
                style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '4px' }}
              >
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>

            <form onSubmit={handleSaveNav} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div className="m3-form-group">
                <label className="m3-form-label">NAV mới (VND) (*)</label>
                <input
                  type="text"
                  inputMode="numeric"
                  value={newNav}
                  onChange={(e) => setNewNav(formatInputCurrency(e.target.value))}
                  placeholder="30.000"
                  required
                  className="m3-input"
                />
              </div>

              <div className="m3-form-group">
                <label className="m3-form-label">Ngày công bố (*)</label>
                <input
                  type="date"
                  value={newNavDate}
                  onChange={(e) => setNewNavDate(e.target.value)}
                  required
                  className="m3-input"
                />
              </div>

              <div style={{ display: 'flex', gap: '10px', marginTop: '6px' }}>
                <button
                  type="button"
                  onClick={() => setEditingFundId(null)}
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
                  Cập nhật
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
