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

  const getFundColor = (code: string) => {
    switch (code) {
      case 'VESAF':
        return '#006837';
      case 'DCBC':
        return '#0B57D0';
      case 'DSI':
        return '#C25400';
      case 'SSISCA':
        return '#007791';
      case 'TCBF':
        return '#8021B1';
      case 'E1VFVN30':
        return '#B3261E';
      default:
        return '#0B57D0';
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      {/* Header */}
      <div>
        <h1 style={{ fontSize: '22px', fontWeight: 900, color: '#1F1F1F' }}>Tra Cứu Giá NAV Quỹ</h1>
        <p style={{ fontSize: '13px', color: '#74777F', marginTop: '2px' }}>
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
                borderRadius: '20px',
                border: isSelected ? 'none' : '1px solid #C4C6D0',
                backgroundColor: isSelected ? '#0B57D0' : '#FFFFFF',
                color: isSelected ? '#FFFFFF' : '#1F1F1F',
                fontWeight: 800,
                fontSize: '12px',
                cursor: 'pointer',
                whiteSpace: 'nowrap',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
              }}
            >
              <div
                style={{
                  width: '8px',
                  height: '8px',
                  borderRadius: '50%',
                  backgroundColor: isSelected ? '#FFFFFF' : getFundColor(f.code),
                }}
              />
              {f.code}
            </button>
          );
        })}
      </div>

      {/* Selected Fund Details Card */}
      {selectedFund && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {/* Fund Hero Card */}
          <div className="m3-card-white">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div
                  style={{
                    width: '42px',
                    height: '42px',
                    borderRadius: '14px',
                    backgroundColor: getFundColor(selectedFund.code),
                    color: '#FFFFFF',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontWeight: 900,
                    fontSize: '14px',
                  }}
                >
                  {selectedFund.code.slice(0, 3)}
                </div>
                <div>
                  <h2 style={{ fontSize: '18px', fontWeight: 900, color: '#1F1F1F' }}>
                    {selectedFund.code}
                  </h2>
                  <div style={{ fontSize: '12px', color: '#74777F' }}>{selectedFund.company}</div>
                </div>
              </div>

              <span className="badge-neutral" style={{ fontSize: '11px' }}>
                {selectedFund.category}
              </span>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginTop: '16px', borderTop: '1px solid #E1E7F0', paddingTop: '12px' }}>
              <div>
                <div style={{ fontSize: '11px', color: '#74777F' }}>Giá NAV ({selectedFund.navDate})</div>
                <div style={{ fontSize: '24px', fontWeight: 900, color: '#0B57D0' }}>
                  {formatVND(selectedFund.nav)}
                </div>
              </div>
              <span className={dailyChange >= 0 ? 'badge-positive' : 'badge-negative'}>
                {formatVND(dailyChange)} ({formatPercent(dailyChangePct)})
              </span>
            </div>

            <p style={{ fontSize: '12px', marginTop: '12px', color: '#444746', lineHeight: 1.5, padding: '10px 12px', backgroundColor: '#F7F9FC', borderRadius: '12px' }}>
              {selectedFund.description}
            </p>
          </div>

          {/* NAV History Line Chart */}
          <div className="m3-card-white">
            <h3 style={{ fontSize: '15px', fontWeight: 800, marginBottom: '14px' }}>Biểu Đồ Giá NAV (1 Năm)</h3>
            <div style={{ width: '100%', height: '200px' }}>
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={selectedFund.navHistory} margin={{ top: 8, right: 8, left: -20, bottom: 0 }}>
                  <XAxis dataKey="date" stroke="#74777F" fontSize={10} tickLine={false} />
                  <YAxis stroke="#74777F" fontSize={10} domain={['auto', 'auto']} tickFormatter={(v) => (v / 1e3).toFixed(1) + 'k'} tickLine={false} />
                  <Tooltip formatter={(val: any) => [formatVND(Number(val)), 'Giá NAV']} />
                  <Line type="monotone" dataKey="nav" stroke="#0B57D0" strokeWidth={2.5} dot={false} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
