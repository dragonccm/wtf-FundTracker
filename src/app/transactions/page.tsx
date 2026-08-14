'use client';

import React, { useState } from 'react';
import { useAppStore } from '@/lib/store/appStore';
import { formatVND } from '@/lib/finance/portfolio';
import AddTransactionModal from '@/components/transactions/AddTransactionModal';

export default function TransactionsPage() {
  const { transactions, funds, deleteTransaction } = useAppStore();
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  const [selectedFundFilter, setSelectedFundFilter] = useState('ALL');
  const [selectedTypeFilter, setSelectedTypeFilter] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');

  const filteredTx = transactions.filter((tx) => {
    if (selectedFundFilter !== 'ALL' && tx.fundCode !== selectedFundFilter) return false;
    if (selectedTypeFilter !== 'ALL' && tx.type !== selectedTypeFilter) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchCode = tx.fundCode.toLowerCase().includes(q);
      const matchNotes = tx.notes?.toLowerCase().includes(q);
      if (!matchCode && !matchNotes) return false;
    }
    return true;
  });

  const getFundBadgeClass = (code: string) => {
    switch (code) {
      case 'VESAF':
        return 'm3-icon-badge-green';
      case 'DCBC':
        return 'm3-icon-badge-blue';
      case 'DSI':
        return 'm3-icon-badge-orange';
      case 'SSISCA':
        return 'm3-icon-badge-cyan';
      case 'TCBF':
        return 'm3-icon-badge-purple';
      case 'E1VFVN30':
        return 'm3-icon-badge-pink';
      default:
        return 'm3-icon-badge-blue';
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <h1 style={{ fontSize: '22px', fontWeight: 900, color: 'var(--md-sys-color-on-surface)' }}>Sổ Giao Dịch CCQ</h1>
          <p style={{ fontSize: '13px', color: 'var(--md-sys-color-on-surface-variant)', marginTop: '2px' }}>
            Xem toàn bộ lịch sử nạp tiền, mua/bán CCQ và phí
          </p>
        </div>

        <button
          onClick={() => setIsAddModalOpen(true)}
          className="m3-pill-btn-primary"
        >
          <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>add</span>
          Thêm Giao Dịch
        </button>
      </div>

      {/* Filter Panel */}
      <div className="m3-card" style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        {/* (7) Type Filter M3 Connected Segmented Group (Mẫu 7) */}
        <div className="m3-segmented-group" style={{ width: '100%', display: 'flex' }}>
          {[
            { id: 'ALL', label: 'Tất cả lệnh', icon: 'list_alt' },
            { id: 'BUY', label: 'Lệnh Mua', icon: 'add_circle' },
            { id: 'SELL', label: 'Lệnh Bán', icon: 'remove_circle' },
          ].map((t) => {
            const isActive = selectedTypeFilter === t.id;
            return (
              <button
                key={t.id}
                type="button"
                onClick={() => setSelectedTypeFilter(t.id)}
                className={`m3-segmented-item ${isActive ? 'active' : ''}`}
                style={{ flex: 1, justifyContent: 'center' }}
              >
                <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>
                  {isActive ? 'check' : t.icon}
                </span>
                {t.label}
              </button>
            );
          })}
        </div>

        {/* Fund Filter & Search */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
          <div className="m3-form-group">
            <label className="m3-form-label">Lọc theo Quỹ</label>
            <select
              value={selectedFundFilter}
              onChange={(e) => setSelectedFundFilter(e.target.value)}
              className="m3-select"
            >
              <option value="ALL">Tất cả các Quỹ</option>
              {funds.map((f) => (
                <option key={f.id} value={f.code}>
                  {f.code}
                </option>
              ))}
            </select>
          </div>

          <div className="m3-form-group">
            <label className="m3-form-label">Tìm kiếm ghi chú</label>
            <input
              type="text"
              placeholder="Nhập ghi chú..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="m3-input"
            />
          </div>
        </div>
      </div>

      {/* Transaction List Mobile Cards */}
      <div className="m3-card">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
          <span style={{ fontSize: '13px', fontWeight: 800, color: 'var(--md-sys-color-on-surface-variant)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
            Lịch Sử Giao Dịch ({filteredTx.length})
          </span>
        </div>

        {filteredTx.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '32px 16px', color: 'var(--md-sys-color-on-surface-variant)' }}>
            <span className="material-symbols-outlined" style={{ fontSize: '40px', color: 'var(--md-sys-color-outline)' }}>
              receipt_long
            </span>
            <p style={{ marginTop: '8px', fontSize: '13px', fontWeight: 600 }}>Không tìm thấy giao dịch nào</p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {filteredTx.map((tx) => (
              <div
                key={tx.id}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '12px 14px',
                  borderRadius: '16px',
                  backgroundColor: 'var(--md-sys-color-surface-container-low)',
                  border: '1px solid var(--md-sys-color-outline-variant)',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <div className={getFundBadgeClass(tx.fundCode)}>
                    <span style={{ fontWeight: 900, fontSize: '11px' }}>{tx.fundCode.slice(0, 3)}</span>
                  </div>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <span style={{ fontSize: '14px', fontWeight: 800, color: 'var(--md-sys-color-on-surface)' }}>{tx.fundCode}</span>
                      <span className={tx.type === 'BUY' ? 'badge-positive' : 'badge-negative'} style={{ fontSize: '10px' }}>
                        {tx.type === 'BUY' ? 'MUA' : 'BÁN'}
                      </span>
                    </div>
                    <div style={{ fontSize: '11px', color: 'var(--md-sys-color-on-surface-variant)', marginTop: '2px' }}>
                      {tx.units.toLocaleString('vi-VN')} CCQ • {tx.date}
                    </div>
                  </div>
                </div>

                <div style={{ textAlign: 'right', display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <div>
                    <div style={{ fontSize: '14px', fontWeight: 900, color: 'var(--md-sys-color-on-surface)' }}>{formatVND(tx.amount)}</div>
                    <div style={{ fontSize: '10px', color: 'var(--md-sys-color-on-surface-variant)' }}>NAV: {formatVND(tx.unitPrice)}</div>
                  </div>
                  <button
                    onClick={() => {
                      if (confirm('Bạn có chắc chắn muốn xóa giao dịch này?')) {
                        deleteTransaction(tx.id);
                      }
                    }}
                    style={{
                      background: 'none',
                      border: 'none',
                      color: 'var(--md-sys-color-outline)',
                      cursor: 'pointer',
                      padding: '4px',
                    }}
                  >
                    <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>delete</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {isAddModalOpen && <AddTransactionModal onClose={() => setIsAddModalOpen(false)} />}
    </div>
  );
}
