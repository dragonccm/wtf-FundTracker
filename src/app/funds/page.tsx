'use client';

import React, { useState } from 'react';
import { useAppStore } from '@/lib/store/appStore';
import { formatVND, formatPercent } from '@/lib/finance/portfolio';
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';

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

      {/* Fund Selector Chips (Smooth M3 Carousel) */}
      <div className="m3-chips-scroll">
        {funds.map((f) => {
          const isSelected = f.code === selectedFundCode;
          return (
            <button
              key={f.id}
              type="button"
              onClick={() => setSelectedFundCode(f.code)}
              className={`m3-chip ${isSelected ? 'active' : ''}`}
            >
              <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>finance_chip</span>
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
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
              <h3 style={{ fontSize: '15px', fontWeight: 900, color: 'var(--md-sys-color-on-surface)' }}>
                Biểu Đồ Lịch Sử NAV (VND)
              </h3>
              <span style={{ fontSize: '11px', color: 'var(--md-sys-color-on-surface-variant)', fontWeight: 600 }}>
                12 Tháng Gần Nhất
              </span>
            </div>

            <div style={{ width: '100%', height: '230px' }}>
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={selectedFund.navHistory} margin={{ top: 10, right: 12, left: 18, bottom: 4 }}>
                  <defs>
                    <linearGradient id="navAreaGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#0B57D0" stopOpacity={0.25} />
                      <stop offset="100%" stopColor="#0B57D0" stopOpacity={0.0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--md-sys-color-outline-variant)" opacity={0.3} />
                  <XAxis
                    dataKey="date"
                    stroke="var(--md-sys-color-on-surface-variant)"
                    fontSize={10}
                    tickLine={false}
                    tickFormatter={(val) => {
                      if (!val) return '';
                      const parts = val.split('-');
                      return parts.length >= 3 ? `${parts[2]}/${parts[1]}` : val;
                    }}
                  />
                  <YAxis
                    width={60}
                    stroke="var(--md-sys-color-on-surface-variant)"
                    fontSize={10}
                    tickLine={false}
                    axisLine={false}
                    domain={['auto', 'auto']}
                    tickFormatter={(v) => Number(v).toLocaleString('vi-VN')}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'var(--md-sys-color-surface-container-high)',
                      borderRadius: '12px',
                      border: '1px solid var(--md-sys-color-outline-variant)',
                      color: 'var(--md-sys-color-on-surface)',
                      fontSize: '12px',
                      boxShadow: 'var(--md-sys-elevation-2)',
                      padding: '8px 12px',
                    }}
                    formatter={(value: any) => [formatVND(Number(value)), 'Giá NAV']}
                    labelFormatter={(label) => `Ngày: ${label}`}
                  />
                  <Area
                    type="monotone"
                    dataKey="nav"
                    stroke="#0B57D0"
                    strokeWidth={2.5}
                    fillOpacity={1}
                    fill="url(#navAreaGradient)"
                    dot={false}
                    activeDot={{ r: 5, fill: '#0B57D0', stroke: '#ffffff', strokeWidth: 2 }}
                  />
                </AreaChart>
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
