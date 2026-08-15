'use client';

import React from 'react';
import { useAppStore } from '@/lib/store/appStore';
import { formatCompactVND, formatVND, formatUnits, calculateTransactionPnL } from '@/lib/finance/portfolio';

export default function TimelinePage() {
  const { transactions, funds, goals } = useAppStore();

  const sortedTx = [...transactions].sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
  );

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      {/* Header */}
      <div>
        <h1 style={{ fontSize: '22px', fontWeight: 500, color: 'var(--md-sys-color-on-surface)' }}>Lịch Sử Dòng Tiền</h1>
        <p style={{ fontSize: '13px', color: 'var(--md-sys-color-on-surface-variant)', marginTop: '2px' }}>
          Dòng thời gian ghi nhận chi tiết mọi sự kiện giao dịch nạp/rút CCQ và lãi lỗ thời gian thực
        </p>
      </div>

      {/* Timeline Stream */}
      <div className="m3-card" style={{ padding: '20px 16px' }}>
        {sortedTx.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '32px 16px', color: 'var(--md-sys-color-on-surface-variant)' }}>
            <span className="material-symbols-outlined" style={{ fontSize: '40px', color: 'var(--md-sys-color-outline)' }}>
              timeline
            </span>
            <p style={{ marginTop: '8px', fontSize: '13px', fontWeight: 500 }}>Chưa có sự kiện dòng tiền nào</p>
          </div>
        ) : (
          <div style={{ position: 'relative', paddingLeft: '24px' }}>
            {/* Vertical Line */}
            <div
              style={{
                position: 'absolute',
                top: '8px',
                bottom: '8px',
                left: '9px',
                width: '2px',
                backgroundColor: 'var(--md-sys-color-outline-variant)',
              }}
            />

            {sortedTx.map((tx) => {
              const pnlResult = calculateTransactionPnL(tx, funds);
              const linkedGoal = tx.goalId ? goals.find((g) => g.id === tx.goalId) : null;

              return (
                <div key={tx.id} style={{ position: 'relative', marginBottom: '20px' }}>
                  {/* Timeline Dot */}
                  <div
                    style={{
                      position: 'absolute',
                      left: '-24px',
                      top: '2px',
                      width: '20px',
                      height: '20px',
                      borderRadius: '50%',
                      backgroundColor: tx.type === 'BUY' ? 'var(--md-sys-color-success-container)' : 'var(--md-sys-color-error-container)',
                      color: tx.type === 'BUY' ? 'var(--md-sys-color-on-success-container)' : 'var(--md-sys-color-on-error-container)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      border: '2px solid var(--md-sys-color-surface)',
                      boxShadow: 'var(--md-sys-elevation-1)',
                    }}
                  >
                    <span className="material-symbols-outlined" style={{ fontSize: '12px', fontWeight: 600 }}>
                      {tx.type === 'BUY' ? 'add' : 'remove'}
                    </span>
                  </div>

                  {/* Event Content Box */}
                  <div
                    style={{
                      backgroundColor: 'var(--md-sys-color-surface-container-low)',
                      border: '1px solid var(--md-sys-color-outline-variant)',
                      borderRadius: '16px',
                      padding: '12px 14px',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '8px',
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '6px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap' }}>
                        <span className={tx.type === 'BUY' ? 'badge-positive' : 'badge-negative'} style={{ fontSize: '10px' }}>
                          {tx.type === 'BUY' ? 'MUA CCQ' : 'BÁN CCQ'}
                        </span>
                        <span style={{ fontWeight: 600, fontSize: '14px', color: 'var(--md-sys-color-primary)' }}>
                          {tx.fundCode}
                        </span>
                        {linkedGoal && (
                          <span
                            style={{
                              fontSize: '10px',
                              padding: '2px 7px',
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
                      <span style={{ fontSize: '11px', fontWeight: 500, color: 'var(--md-sys-color-on-surface-variant)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <span className="material-symbols-outlined" style={{ fontSize: '14px' }}>calendar_today</span>
                        {tx.date}
                      </span>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', fontSize: '12px' }}>
                      <div>
                        <div style={{ fontSize: '10px', color: 'var(--md-sys-color-on-surface-variant)' }}>Giá trị giao dịch</div>
                        <div title={formatVND(tx.amount)} style={{ fontSize: '14px', fontWeight: 600, color: 'var(--md-sys-color-on-surface)' }}>
                          {formatCompactVND(tx.amount)}
                        </div>
                      </div>
                      <div>
                        <div style={{ fontSize: '10px', color: 'var(--md-sys-color-on-surface-variant)' }}>Khối lượng CCQ</div>
                        <div style={{ fontSize: '13px', fontWeight: 500, color: 'var(--md-sys-color-on-surface)' }}>
                          {formatUnits(tx.units)} CCQ
                        </div>
                      </div>
                    </div>

                    {/* Live PnL Badge in Timeline */}
                    {pnlResult && (
                      <div
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          padding: '6px 10px',
                          borderRadius: '10px',
                          backgroundColor: pnlResult.isProfit ? 'rgba(46, 108, 56, 0.08)' : 'rgba(179, 38, 30, 0.08)',
                          fontSize: '11px',
                        }}
                      >
                        <span style={{ color: 'var(--journal-muted)' }}>
                          {tx.type === 'BUY' ? 'Lãi / Lỗ hiện tại' : 'Lãi / Lỗ chốt'}
                        </span>
                        <span
                          style={{
                            fontWeight: 600,
                            color: pnlResult.isProfit ? 'var(--journal-success)' : 'var(--journal-danger)',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '2px',
                          }}
                        >
                          <span className="material-symbols-outlined" style={{ fontSize: '14px' }}>
                            {pnlResult.isProfit ? 'trending_up' : 'trending_down'}
                          </span>
                          {pnlResult.isProfit ? '+' : ''}{formatCompactVND(pnlResult.pnl)} ({pnlResult.isProfit ? '+' : ''}{pnlResult.pnlPercent.toFixed(2)}%)
                        </span>
                      </div>
                    )}

                    {tx.notes && (
                      <div style={{ fontSize: '11px', color: 'var(--md-sys-color-on-surface-variant)', borderTop: '1px solid var(--md-sys-color-outline-variant)', paddingTop: '6px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <span className="material-symbols-outlined" style={{ fontSize: '14px' }}>notes</span>
                        {tx.notes}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
