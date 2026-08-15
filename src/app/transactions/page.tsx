'use client';

import React, { useState } from 'react';
import { useAppStore } from '@/lib/store/appStore';
import { Transaction } from '@/types';
import { formatCompactVND, formatVND, calculateTransactionPnL } from '@/lib/finance/portfolio';
import AddTransactionModal from '@/components/transactions/AddTransactionModal';
import EditTransactionModal from '@/components/transactions/EditTransactionModal';

export default function TransactionsPage() {
  const { transactions, funds, goals, deleteTransaction } = useAppStore();
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null);

  const [selectedFundFilter, setSelectedFundFilter] = useState('ALL');
  const [selectedTypeFilter, setSelectedTypeFilter] = useState('ALL');
  const [selectedGoalFilter, setSelectedGoalFilter] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');

  const filteredTx = transactions.filter((tx) => {
    if (selectedFundFilter !== 'ALL' && tx.fundCode !== selectedFundFilter) return false;
    if (selectedTypeFilter !== 'ALL' && tx.type !== selectedTypeFilter) return false;
    if (selectedGoalFilter !== 'ALL') {
      if (selectedGoalFilter === 'NONE' && tx.goalId) return false;
      if (selectedGoalFilter !== 'NONE' && tx.goalId !== selectedGoalFilter) return false;
    }
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
          <h1 style={{ fontSize: '22px', fontWeight: 500, color: 'var(--md-sys-color-on-surface)' }}>Sổ Giao Dịch CCQ</h1>
          <p style={{ fontSize: '13px', color: 'var(--md-sys-color-on-surface-variant)', marginTop: '2px' }}>
            Xem toàn bộ lịch sử nạp tiền, mua/bán CCQ, lãi lỗ thời gian thực và quản lý giao dịch
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
        {/* Type Filter M3 Connected Segmented Group */}
        <div className="m3-segmented-group" style={{ width: '100%', display: 'flex' }}>
          {[
            { id: 'ALL', label: 'Tất cả', icon: 'list_alt' },
            { id: 'BUY', label: 'Mua CCQ', icon: 'add_circle' },
            { id: 'SELL', label: 'Bán CCQ', icon: 'remove_circle' },
          ].map((t) => {
            const isActive = selectedTypeFilter === t.id;
            return (
              <button
                key={t.id}
                type="button"
                onClick={() => setSelectedTypeFilter(t.id)}
                className={`m3-segmented-item ${isActive ? 'active' : ''}`}
                style={{ flex: 1, justifyContent: 'center', whiteSpace: 'nowrap' }}
              >
                <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>
                  {isActive ? 'check' : t.icon}
                </span>
                {t.label}
              </button>
            );
          })}
        </div>

        {/* Fund Filter, Goal Filter & Search */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '10px' }}>
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
            <label className="m3-form-label">Lọc theo Mục Tiêu</label>
            <select
              value={selectedGoalFilter}
              onChange={(e) => setSelectedGoalFilter(e.target.value)}
              className="m3-select"
            >
              <option value="ALL">Tất cả mục tiêu</option>
              <option value="NONE">Chưa gán mục tiêu</option>
              {goals.map((g) => (
                <option key={g.id} value={g.id}>🎯 {g.name}</option>
              ))}
            </select>
          </div>

          <div className="m3-form-group">
            <label className="m3-form-label">Tìm kiếm ghi chú</label>
            <input
              type="text"
              placeholder="Nhập từ khóa..."
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
          <span style={{ fontSize: '13px', fontWeight: 500, color: 'var(--md-sys-color-on-surface-variant)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
            Lịch Sử Giao Dịch ({filteredTx.length})
          </span>
        </div>

        {filteredTx.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '32px 16px', color: 'var(--md-sys-color-on-surface-variant)' }}>
            <span className="material-symbols-outlined" style={{ fontSize: '40px', color: 'var(--md-sys-color-outline)' }}>
              receipt_long
            </span>
            <p style={{ marginTop: '8px', fontSize: '13px', fontWeight: 500 }}>Không tìm thấy giao dịch nào</p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {filteredTx.map((tx) => {
              const pnlResult = calculateTransactionPnL(tx, funds);
              const linkedGoal = tx.goalId ? goals.find((g) => g.id === tx.goalId) : null;

              return (
                <div
                  key={tx.id}
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '8px',
                    padding: '14px 16px',
                    borderRadius: '18px',
                    backgroundColor: 'var(--md-sys-color-surface-container-low)',
                    border: '1px solid var(--md-sys-color-outline-variant)',
                    transition: 'all 0.2s cubic-bezier(0.2, 0, 0, 1)',
                  }}
                >
                  {/* Top row: Fund, Type, Goal, Actions */}
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '8px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', minWidth: 0 }}>
                      <div className={getFundBadgeClass(tx.fundCode)}>
                        <span style={{ fontWeight: 600, fontSize: '11px' }}>{tx.fundCode.slice(0, 3)}</span>
                      </div>
                      <div style={{ minWidth: 0 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap' }}>
                          <span style={{ fontSize: '14px', fontWeight: 600, color: 'var(--md-sys-color-on-surface)' }}>
                            {tx.fundCode}
                          </span>
                          <span className={tx.type === 'BUY' ? 'badge-positive' : 'badge-negative'} style={{ fontSize: '10px' }}>
                            {tx.type === 'BUY' ? 'MUA' : 'BÁN'}
                          </span>
                          {linkedGoal && (
                            <span
                              style={{
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '3px',
                                fontSize: '10px',
                                padding: '2px 8px',
                                borderRadius: '999px',
                                backgroundColor: 'var(--journal-primary-container)',
                                color: 'var(--journal-primary-strong)',
                                fontWeight: 500,
                              }}
                            >
                              🎯 {linkedGoal.name}
                            </span>
                          )}
                        </div>
                        <div style={{ fontSize: '11px', color: 'var(--md-sys-color-on-surface-variant)', marginTop: '2px' }}>
                          {tx.units.toLocaleString('vi-VN')} CCQ • Ngày: {tx.date}
                        </div>
                      </div>
                    </div>

                    {/* Action buttons (Edit, Delete) */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <button
                        type="button"
                        onClick={() => setEditingTransaction(tx)}
                        title="Chỉnh sửa giao dịch"
                        style={{
                          background: 'none',
                          border: 'none',
                          color: 'var(--journal-primary)',
                          cursor: 'pointer',
                          padding: '6px',
                          borderRadius: '50%',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                        }}
                      >
                        <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>edit</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          if (confirm('Bạn có chắc chắn muốn xóa giao dịch này?')) {
                            deleteTransaction(tx.id);
                          }
                        }}
                        title="Xóa giao dịch"
                        style={{
                          background: 'none',
                          border: 'none',
                          color: 'var(--md-sys-color-outline)',
                          cursor: 'pointer',
                          padding: '6px',
                          borderRadius: '50%',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                        }}
                      >
                        <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>delete</span>
                      </button>
                    </div>
                  </div>

                  {/* Bottom row: Value, Price NAV, and PnL */}
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      flexWrap: 'wrap',
                      gap: '8px',
                      paddingTop: '8px',
                      borderTop: '1px solid var(--md-sys-color-outline-variant)',
                    }}
                  >
                    <div>
                      <div style={{ fontSize: '10px', color: 'var(--md-sys-color-on-surface-variant)' }}>Giá trị giao dịch</div>
                      <div title={formatVND(tx.amount)} style={{ fontSize: '14px', fontWeight: 600, color: 'var(--md-sys-color-on-surface)' }}>
                        {formatCompactVND(tx.amount)}
                      </div>
                      <div style={{ fontSize: '10px', color: 'var(--md-sys-color-on-surface-variant)' }}>
                        NAV mua: {formatCompactVND(tx.unitPrice)}
                      </div>
                    </div>

                    {pnlResult && (
                      <div style={{ textAlign: 'right' }}>
                        <div style={{ fontSize: '10px', color: 'var(--md-sys-color-on-surface-variant)' }}>
                          {tx.type === 'BUY' ? 'Lãi / Lỗ hiện tại' : 'Lãi / Lỗ chốt'}
                        </div>
                        <div
                          style={{
                            fontSize: '13px',
                            fontWeight: 600,
                            color: pnlResult.isProfit ? 'var(--journal-success)' : 'var(--journal-danger)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'flex-end',
                            gap: '3px',
                          }}
                        >
                          <span className="material-symbols-outlined" style={{ fontSize: '15px' }}>
                            {pnlResult.isProfit ? 'trending_up' : 'trending_down'}
                          </span>
                          {pnlResult.isProfit ? '+' : ''}{formatCompactVND(pnlResult.pnl)} ({pnlResult.isProfit ? '+' : ''}{pnlResult.pnlPercent.toFixed(2)}%)
                        </div>
                        <div style={{ fontSize: '10px', color: 'var(--md-sys-color-on-surface-variant)' }}>
                          NAV hiện tại: {formatCompactVND(pnlResult.currentNav)}
                        </div>
                      </div>
                    )}
                  </div>

                  {tx.notes && (
                    <div style={{ fontSize: '11px', color: 'var(--journal-muted)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <span className="material-symbols-outlined" style={{ fontSize: '14px' }}>notes</span>
                      {tx.notes}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Add Transaction Modal */}
      {isAddModalOpen && <AddTransactionModal onClose={() => setIsAddModalOpen(false)} />}

      {/* Edit Transaction Modal */}
      {editingTransaction && (
        <EditTransactionModal
          transaction={editingTransaction}
          onClose={() => setEditingTransaction(null)}
        />
      )}
    </div>
  );
}
