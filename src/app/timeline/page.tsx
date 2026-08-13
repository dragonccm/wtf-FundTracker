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
        <h1 style={{ fontSize: '22px', fontWeight: 900, color: '#E2E2E6' }}>Lịch Sử Dòng Tiền</h1>
        <p style={{ fontSize: '13px', color: '#909299', marginTop: '2px' }}>
          Dòng thời gian ghi nhận chi tiết mọi sự kiện giao dịch nạp/rút CCQ
        </p>
      </div>

      {/* Timeline Stream */}
      <div className="m3-card-dark" style={{ padding: '20px 16px' }}>
        <div style={{ position: 'relative', paddingLeft: '24px' }}>
          {/* Vertical Line */}
          <div
            style={{
              position: 'absolute',
              top: '8px',
              bottom: '8px',
              left: '9px',
              width: '2px',
              backgroundColor: '#282B31',
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
                  backgroundColor: tx.type === 'BUY' ? 'rgba(133, 211, 151, 0.25)' : 'rgba(255, 180, 171, 0.25)',
                  color: tx.type === 'BUY' ? '#85D397' : '#FFB4AB',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  border: '2px solid #111315',
                }}
              >
                <span className="material-symbols-outlined" style={{ fontSize: '12px', fontWeight: 900 }}>
                  {tx.type === 'BUY' ? 'add' : 'remove'}
                </span>
              </div>

              {/* Event Content Box */}
              <div
                style={{
                  backgroundColor: '#191B1F',
                  borderRadius: '16px',
                  padding: '12px 14px',
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <span className={tx.type === 'BUY' ? 'badge-positive' : 'badge-negative'} style={{ fontSize: '10px' }}>
                      {tx.type === 'BUY' ? 'MUA CCQ' : 'BÁN CCQ'}
                    </span>
                    <span style={{ fontWeight: 900, fontSize: '14px', color: '#A8C7FA' }}>
                      {tx.fundCode}
                    </span>
                  </div>
                  <span style={{ fontSize: '11px', fontWeight: 600, color: '#909299', display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <span className="material-symbols-outlined" style={{ fontSize: '14px' }}>calendar_today</span>
                    {tx.date}
                  </span>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', marginTop: '10px', fontSize: '12px' }}>
                  <div>
                    <div style={{ fontSize: '10px', color: '#909299' }}>Giá trị giao dịch</div>
                    <div style={{ fontSize: '14px', fontWeight: 800, color: '#E2E2E6' }}>{formatVND(tx.amount)}</div>
                  </div>
                  <div>
                    <div style={{ fontSize: '10px', color: '#909299' }}>Khối lượng CCQ</div>
                    <div style={{ fontSize: '13px', fontWeight: 700, color: '#E2E2E6' }}>{tx.units.toLocaleString('vi-VN')} CCQ</div>
                  </div>
                </div>

                {tx.notes && (
                  <div style={{ marginTop: '8px', fontSize: '11px', color: '#909299', borderTop: '1px solid #282B31', paddingTop: '6px', display: 'flex', alignItems: 'center', gap: '4px' }}>
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
