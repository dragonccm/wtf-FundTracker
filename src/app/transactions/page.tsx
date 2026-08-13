'use client';

import React, { useState } from 'react';
import { useAppStore } from '@/lib/store/appStore';
import { formatVND } from '@/lib/finance/portfolio';
import AddTransactionModal from '@/components/transactions/AddTransactionModal';

export default function TransactionsPage() {
  const { transactions, funds, deleteTransaction, portfolios } = useAppStore();
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
          <h1 style={{ fontSize: '22px', fontWeight: 900, color: '#E2E2E6' }}>Sổ Giao Dịch CCQ</h1>
          <p style={{ fontSize: '13px', color: '#909299', marginTop: '2px' }}>
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
      <div className="m3-card-dark" style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        {/* Type Filter Segmented Control */}
        <div className="m3-segmented-control">
          {[
            { id: 'ALL', label: 'Tất cả lệnh' },
            { id: 'BUY', label: 'Lệnh Mua' },
            { id: 'SELL', label: 'Lệnh Bán' },
          ].map((t) => (
            <button
              key={t.id}
              type="button"
              onClick={() => setSelectedTypeFilter(t.id)}
              className={`m3-segment-btn ${selectedTypeFilter === t.id ? 'active' : ''}`}
            >
              {t.label}
            </button>
          ))}
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
      <div className="m3-card-dark">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
          <span style={{ fontSize: '13px', fontWeight: 800, color: '#909299', textTransform: 'uppercase' }}>
            Lịch Sử Giao Dịch ({filteredTx.length})
          </span>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {filteredTx.length > 0 ? (
            filteredTx.map((tx) => {
              const port = portfolios.find((p) => p.id === tx.portfolioId);
              return (
                <div
                  key={tx.id}
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '8px',
                    padding: '14px',
                    borderRadius: '18px',
                    backgroundColor: '#191B1F',
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <div className={getFundBadgeClass(tx.fundCode)}>
                        <span style={{ fontWeight: 900, fontSize: '11px' }}>{tx.fundCode.slice(0, 3)}</span>
                      </div>
                      <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                          <span style={{ fontSize: '14px', fontWeight: 900, color: '#E2E2E6' }}>{tx.fundCode}</span>
                          <span className={tx.type === 'BUY' ? 'badge-positive' : 'badge-negative'} style={{ fontSize: '10px' }}>
                            {tx.type === 'BUY' ? 'MUA' : 'BÁN'}
                          </span>
                        </div>
                        <div style={{ fontSize: '11px', color: '#909299' }}>
                          {tx.date} • {port ? port.name : tx.portfolioId}
                        </div>
                      </div>
                    </div>

                    <div style={{ textAlign: 'right' }}>
                      <div style={{ fontSize: '14px', fontWeight: 900, color: tx.type === 'BUY' ? '#E2E2E6' : '#FFB4AB' }}>
                        {formatVND(tx.amount)}
                      </div>
                      <div style={{ fontSize: '11px', color: '#909299' }}>
                        {tx.units.toLocaleString('vi-VN')} CCQ @ {formatVND(tx.unitPrice)}
                      </div>
                    </div>
                  </div>

                  {/* Notes & Delete Action */}
                  <div
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      borderTop: '1px solid #282B31',
                      paddingTop: '6px',
                      marginTop: '4px',
                      fontSize: '11px',
                      color: '#909299',
                    }}
                  >
                    <span>{tx.notes || 'Không có ghi chú'}</span>
                    <button
                      onClick={() => {
                        if (confirm('Bạn có chắc chắn muốn xóa giao dịch này?')) {
                          deleteTransaction(tx.id);
                        }
                      }}
                      style={{
                        background: 'none',
                        border: 'none',
                        cursor: 'pointer',
                        color: '#FFB4AB',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '2px',
                        fontWeight: 700,
                        fontSize: '11px',
                      }}
                    >
                      <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>
                        delete
                      </span>
                      Xóa
                    </button>
                  </div>
                </div>
              );
            })
          ) : (
            <div style={{ textAlign: 'center', padding: '32px 0', color: '#909299', fontSize: '13px' }}>
              Không tìm thấy giao dịch nào phù hợp.
            </div>
          )}
        </div>
      </div>

      {isAddModalOpen && <AddTransactionModal onClose={() => setIsAddModalOpen(false)} />}
    </div>
  );
}
