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
        <h1 style={{ fontSize: '22px', fontWeight: 900, color: '#E2E2E6' }}>Tra Cứu Giá NAV Quỹ</h1>
        <p style={{ fontSize: '13px', color: '#909299', marginTop: '2px' }}>
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
                border: 'none',
                backgroundColor: isSelected ? '#A8C7FA' : '#202328',
                color: isSelected ? '#041E49' : '#E2E2E6',
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
          <div className="m3-card-dark">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div className={getFundBadgeClass(selectedFund.code)}>
                  <span style={{ fontWeight: 900, fontSize: '12px' }}>{selectedFund.code.slice(0, 3)}</span>
                </div>
                <div>
                  <h2 style={{ fontSize: '18px', fontWeight: 900, color: '#E2E2E6' }}>
                    {selectedFund.code}
                  </h2>
                  <div style={{ fontSize: '12px', color: '#909299' }}>{selectedFund.company}</div>
                </div>
              </div>

              <span className="badge-neutral" style={{ fontSize: '11px' }}>
                {selectedFund.category}
              </span>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginTop: '16px', borderTop: '1px solid #282B31', paddingTop: '12px' }}>
              <div>
                <div style={{ fontSize: '11px', color: '#909299' }}>Giá NAV ({selectedFund.navDate})</div>
                <div style={{ fontSize: '24px', fontWeight: 900, color: '#A8C7FA' }}>
                  {formatVND(selectedFund.nav)}
                </div>
              </div>
              <span className={dailyChange >= 0 ? 'badge-positive' : 'badge-negative'}>
                {formatVND(dailyChange)} ({formatPercent(dailyChangePct)})
              </span>
            </div>

            <p style={{ fontSize: '12px', marginTop: '12px', color: '#909299', lineHeight: 1.5, padding: '10px 12px', backgroundColor: '#191B1F', borderRadius: '14px' }}>
              {selectedFund.description}
            </p>
          </div>

          {/* NAV History Line Chart */}
          <div className="m3-card-dark">
            <h3 style={{ fontSize: '14px', fontWeight: 800, marginBottom: '14px', color: '#909299', textTransform: 'uppercase' }}>
              Biểu Đồ Giá NAV (1 Năm)
            </h3>
            <div style={{ width: '100%', height: '200px' }}>
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={selectedFund.navHistory} margin={{ top: 8, right: 8, left: -20, bottom: 0 }}>
                  <XAxis dataKey="date" stroke="#909299" fontSize={10} tickLine={false} />
                  <YAxis stroke="#909299" fontSize={10} domain={['auto', 'auto']} tickFormatter={(v) => (v / 1e3).toFixed(1) + 'k'} tickLine={false} />
                  <Tooltip
                    formatter={(val: any) => [formatVND(Number(val)), 'Giá NAV']}
                    contentStyle={{
                      backgroundColor: '#202328',
                      borderRadius: '12px',
                      border: '1px solid #282B31',
                      color: '#E2E2E6',
                      fontWeight: 700,
                      fontSize: '12px',
                    }}
                  />
                  <Line type="monotone" dataKey="nav" stroke="#A8C7FA" strokeWidth={2.5} dot={false} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
