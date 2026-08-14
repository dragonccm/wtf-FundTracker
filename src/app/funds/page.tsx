'use client';

import React, { useState } from 'react';
import { useAppStore } from '@/lib/store/appStore';
import { formatVND, formatPercent } from '@/lib/finance/portfolio';
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip } from 'recharts';

export default function FundsPage() {
  const { funds } = useAppStore();
  const [selectedFundCode, setSelectedFundCode] = useState<string>(funds[0]?.code || 'VESAF');

  const selectedFund = funds.find((f) => f.code === selectedFundCode) || funds[0];

  const dailyChange = selectedFund ? selectedFund.nav - selectedFund.previousNav : 0;
  const dailyChangePct = selectedFund && selectedFund.previousNav > 0 ? (dailyChange / selectedFund.previousNav) * 100 : 0;

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
      <div>
        <h1 style={{ fontSize: '22px', fontWeight: 900, color: 'var(--md-sys-color-on-surface)' }}>Tra Cứu Giá NAV Quỹ</h1>
        <p style={{ fontSize: '13px', color: 'var(--md-sys-color-on-surface-variant)', marginTop: '2px' }}>
          Lịch sử giá NAV theo ngày của các quỹ mở niêm yết tại Việt Nam
        </p>
      </div>

      {/* Fund Selector Chips */}
      <div style={{ display: 'flex', gap: '8px', overflowX: 'auto', paddingBottom: '4px' }}>
        {funds.map((f) => {
          const isSelected = f.code === selectedFundCode;
          return (
            <button
              key={f.id}
              onClick={() => setSelectedFundCode(f.code)}
              style={{
                padding: '8px 16px',
                borderRadius: '24px',
                border: '1px solid var(--md-sys-color-outline-variant)',
                backgroundColor: isSelected ? 'var(--md-sys-color-primary-container)' : 'var(--md-sys-color-surface-container-lowest)',
                color: isSelected ? 'var(--md-sys-color-on-primary-container)' : 'var(--md-sys-color-on-surface)',
                fontWeight: 800,
                fontSize: '12px',
                cursor: 'pointer',
                whiteSpace: 'nowrap',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
              }}
            >
              {f.code}
            </button>
          );
        })}
      </div>

      {/* Selected Fund Details Card */}
      {selectedFund && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {/* Fund Hero Card */}
          <div className="m3-card">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div className={getFundBadgeClass(selectedFund.code)}>
                  <span style={{ fontWeight: 900, fontSize: '12px' }}>{selectedFund.code.slice(0, 3)}</span>
                </div>
                <div>
                  <h2 style={{ fontSize: '18px', fontWeight: 900, color: 'var(--md-sys-color-on-surface)' }}>
                    {selectedFund.code}
                  </h2>
                  <div style={{ fontSize: '12px', color: 'var(--md-sys-color-on-surface-variant)' }}>{selectedFund.company}</div>
                </div>
              </div>

              <span className="badge-neutral" style={{ fontSize: '11px' }}>
                {selectedFund.category}
              </span>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginTop: '16px', borderTop: '1px solid var(--md-sys-color-outline-variant)', paddingTop: '12px' }}>
              <div>
                <div style={{ fontSize: '11px', color: 'var(--md-sys-color-on-surface-variant)' }}>Giá NAV ({selectedFund.navDate})</div>
                <div style={{ fontSize: '24px', fontWeight: 900, color: 'var(--md-sys-color-on-surface)' }}>{formatVND(selectedFund.nav)}</div>
              </div>

              <div style={{ textAlign: 'right' }}>
                <div style={{ fontSize: '11px', color: 'var(--md-sys-color-on-surface-variant)' }}>Biến động phiên gần nhất</div>
                <span className={dailyChange >= 0 ? 'badge-positive' : 'badge-negative'} style={{ marginTop: '2px' }}>
                  {dailyChange >= 0 ? '+' : ''}{formatVND(dailyChange)} ({formatPercent(dailyChangePct)})
                </span>
              </div>
            </div>
          </div>

          {/* NAV History Chart Card */}
          <div className="m3-card">
            <h3 style={{ fontSize: '15px', fontWeight: 900, color: 'var(--md-sys-color-on-surface)', marginBottom: '14px' }}>
              Biểu Đồ Lịch Sử NAV (VND)
            </h3>

            <div style={{ width: '100%', height: '220px' }}>
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={selectedFund.navHistory} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <XAxis dataKey="date" stroke="var(--md-sys-color-on-surface-variant)" fontSize={11} tickLine={false} />
                  <YAxis stroke="var(--md-sys-color-on-surface-variant)" fontSize={11} tickLine={false} domain={['auto', 'auto']} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'var(--md-sys-color-surface)',
                      borderRadius: '12px',
                      border: '1px solid var(--md-sys-color-outline-variant)',
                      color: 'var(--md-sys-color-on-surface)',
                      fontSize: '12px',
                      boxShadow: 'var(--md-sys-elevation-2)',
                    }}
                  />
                  <Line type="monotone" dataKey="nav" stroke="#0B57D0" strokeWidth={3} dot={{ r: 4, fill: '#0B57D0' }} activeDot={{ r: 6 }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Fund Details Information */}
          <div className="m3-card">
            <h3 style={{ fontSize: '15px', fontWeight: 900, color: 'var(--md-sys-color-on-surface)', marginBottom: '10px' }}>
              Thông Tin Tổng Quan Quỹ
            </h3>
            <p style={{ fontSize: '13px', color: 'var(--md-sys-color-on-surface-variant)', lineHeight: 1.6 }}>{selectedFund.description}</p>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', marginTop: '14px', borderTop: '1px solid var(--md-sys-color-outline-variant)', paddingTop: '12px' }}>
              <div>
                <div style={{ fontSize: '10px', color: 'var(--md-sys-color-on-surface-variant)' }}>Ngày thành lập</div>
                <div style={{ fontSize: '13px', fontWeight: 800, color: 'var(--md-sys-color-on-surface)' }}>{selectedFund.inceptionDate}</div>
              </div>
              <div>
                <div style={{ fontSize: '10px', color: 'var(--md-sys-color-on-surface-variant)' }}>Phí quản lý hàng năm</div>
                <div style={{ fontSize: '13px', fontWeight: 800, color: 'var(--md-sys-color-on-surface)' }}>{selectedFund.expenseRatioPercent}% / năm</div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
