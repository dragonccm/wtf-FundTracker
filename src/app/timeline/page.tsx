'use client';

import React from 'react';
import { useAppStore } from '@/lib/store/appStore';
import { formatVND } from '@/lib/finance/portfolio';

export default function TimelinePage() {
  const { transactions } = useAppStore();

  const sortedTx = [...transactions].sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
  );

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      {/* Header */}
      <div>
        <h1 style={{ fontSize: '22px', fontWeight: 500, color: 'var(--md-sys-color-on-surface)' }}>Lịch Sử Dòng Tiền</h1>
        <p style={{ fontSize: '13px', color: 'var(--md-sys-color-on-surface-variant)', marginTop: '2px' }}>
          Dòng thời gian ghi nhận chi tiết mọi sự kiện giao dịch nạp/rút CCQ
        </p>
      </div>

      {/* Timeline Stream */}
      <div className="m3-card" style={{ padding: '20px 16px' }}>
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

          {sortedTx.map((tx) => (
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
                <span className="material-symbols-outlined" style={{ fontSize: '12px', fontWeight: 500 }}>
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
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <span className={tx.type === 'BUY' ? 'badge-positive' : 'badge-negative'} style={{ fontSize: '10px' }}>
                      {tx.type === 'BUY' ? 'MUA CCQ' : 'BÁN CCQ'}
                    </span>
                    <span style={{ fontWeight: 500, fontSize: '14px', color: 'var(--md-sys-color-primary)' }}>
                      {tx.fundCode}
                    </span>
                  </div>
                  <span style={{ fontSize: '11px', fontWeight: 500, color: 'var(--md-sys-color-on-surface-variant)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <span className="material-symbols-outlined" style={{ fontSize: '14px' }}>calendar_today</span>
                    {tx.date}
                  </span>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', marginTop: '10px', fontSize: '12px' }}>
                  <div>
                    <div style={{ fontSize: '10px', color: 'var(--md-sys-color-on-surface-variant)' }}>Giá trị giao dịch</div>
                    <div style={{ fontSize: '14px', fontWeight: 500, color: 'var(--md-sys-color-on-surface)' }}>{formatVND(tx.amount)}</div>
                  </div>
                  <div>
                    <div style={{ fontSize: '10px', color: 'var(--md-sys-color-on-surface-variant)' }}>Khối lượng CCQ</div>
                    <div style={{ fontSize: '13px', fontWeight: 500, color: 'var(--md-sys-color-on-surface)' }}>{tx.units.toLocaleString('vi-VN')} CCQ</div>
                  </div>
                </div>

                {tx.notes && (
                  <div style={{ marginTop: '8px', fontSize: '11px', color: 'var(--md-sys-color-on-surface-variant)', borderTop: '1px solid var(--md-sys-color-outline-variant)', paddingTop: '6px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <span className="material-symbols-outlined" style={{ fontSize: '14px' }}>notes</span>
                    {tx.notes}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
