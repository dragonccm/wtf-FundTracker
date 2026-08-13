'use client';

import React, { useState } from 'react';
import { useAppStore } from '@/lib/store/appStore';
import { formatVND, formatPercent } from '@/lib/finance/portfolio';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
} from 'recharts';

export default function PerformancePage() {
  const { metrics, holdings } = useAppStore();
  const [timeframe, setTimeframe] = useState<'6M' | 'YTD' | '1Y' | 'ALL'>('ALL');

  const comparisonData = holdings.map((h) => ({
    name: h.fundCode,
    invested: Number((h.totalCost / 1e6).toFixed(2)),
    current: Number((h.currentValue / 1e6).toFixed(2)),
    pnl: h.unrealizedPnL,
  }));

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
        <h1 style={{ fontSize: '22px', fontWeight: 900, color: '#E2E2E6' }}>
          Hiệu Suất & Tỷ Suất XIRR
        </h1>
        <p style={{ fontSize: '13px', color: '#909299', marginTop: '2px' }}>
          Đo lường lợi nhuận thực tế theo dòng tiền nạp/rút chính xác
        </p>
      </div>

      {/* Pixel Segmented Control */}
      <div className="m3-segmented-control">
        {(['6M', 'YTD', '1Y', 'ALL'] as const).map((tf) => (
          <button
            key={tf}
            type="button"
            onClick={() => setTimeframe(tf)}
            className={`m3-segment-btn ${timeframe === tf ? 'active' : ''}`}
          >
            {tf}
          </button>
        ))}
      </div>

      {/* 1. XIRR Hero Card - Pixel Dark Surface */}
      <div className="m3-card-dark" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span className="material-symbols-outlined" style={{ fontSize: '20px', color: '#A8C7FA' }}>
            auto_graph
          </span>
          <span style={{ fontSize: '12px', fontWeight: 800, color: '#A8C7FA', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
            Extended Internal Rate of Return
          </span>
        </div>

        <div>
          <div style={{ fontSize: '36px', fontWeight: 900, color: '#E2E2E6', letterSpacing: '-0.5px', lineHeight: 1.1 }}>
            {formatPercent(metrics.xirrPercent)} / năm
          </div>
          <p style={{ fontSize: '12px', color: '#909299', marginTop: '8px', lineHeight: 1.5 }}>
            XIRR tính toán tỷ suất sinh lời thực tế quy năm của các khoản đầu tư có dòng tiền không đều đặn.
          </p>
        </div>

        {/* Sub Tonal Container inside Hero */}
        <div
          style={{
            backgroundColor: '#191B1F',
            borderRadius: '16px',
            padding: '14px 16px',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}
        >
          <div>
            <div style={{ fontSize: '11px', color: '#909299' }}>Tỷ Suất ROI Đơn Thuần</div>
            <div style={{ fontSize: '18px', fontWeight: 900, color: '#85D397' }}>{formatPercent(metrics.totalPnLPercent)}</div>
          </div>
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontSize: '11px', color: '#909299' }}>Tổng Tiền Lãi Thực Tế</div>
            <div style={{ fontSize: '18px', fontWeight: 900, color: '#E2E2E6' }}>{formatVND(metrics.totalPnL)}</div>
          </div>
        </div>
      </div>

      {/* 2. Bar Chart: Cost Basis vs Market Value */}
      <div className="m3-card-dark">
        <h3 style={{ fontSize: '14px', fontWeight: 800, marginBottom: '14px', color: '#909299', textTransform: 'uppercase' }}>
          So Sánh Giá Vốn vs Giá Trị (Triệu VNĐ)
        </h3>

        <div style={{ width: '100%', height: '200px' }}>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={comparisonData} margin={{ top: 10, right: 10, left: -15, bottom: 0 }}>
              <XAxis dataKey="name" stroke="#909299" fontSize={11} tickLine={false} />
              <YAxis stroke="#909299" fontSize={10} tickFormatter={(v) => `${v}M`} tickLine={false} />
              <Tooltip
                formatter={(val: any) => [`${val} Triệu VNĐ`]}
                contentStyle={{
                  backgroundColor: '#202328',
                  borderRadius: '12px',
                  border: '1px solid #282B31',
                  color: '#E2E2E6',
                  fontWeight: 700,
                  fontSize: '12px',
                }}
              />
              <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />
              <Bar dataKey="invested" name="Giá Vốn Đầu Tư" fill="#44474E" radius={[6, 6, 0, 0]} />
              <Bar dataKey="current" name="Giá Trị Hiện Tại" fill="#A8C7FA" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* 3. Fund Performance Mobile Cards */}
      <div className="m3-card-dark">
        <h3 style={{ fontSize: '14px', fontWeight: 800, marginBottom: '12px', color: '#909299', textTransform: 'uppercase' }}>
          Chi Tiết Hiệu Suất Từng Quỹ
        </h3>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {holdings.map((h) => (
            <div
              key={h.fundCode}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '12px 14px',
                borderRadius: '18px',
                backgroundColor: '#191B1F',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div className={getFundBadgeClass(h.fundCode)}>
                  <span style={{ fontWeight: 900, fontSize: '11px' }}>{h.fundCode.slice(0, 3)}</span>
                </div>
                <div>
                  <div style={{ fontSize: '14px', fontWeight: 900, color: '#E2E2E6' }}>{h.fundCode}</div>
                  <div style={{ fontSize: '11px', color: '#909299' }}>
                    {h.totalUnits.toLocaleString('vi-VN')} CCQ • Vốn: {formatVND(h.totalCost)}
                  </div>
                </div>
              </div>

              <div style={{ textAlign: 'right' }}>
                <div style={{ fontSize: '14px', fontWeight: 900, color: '#E2E2E6' }}>{formatVND(h.currentValue)}</div>
                <span className={h.unrealizedPnL >= 0 ? 'badge-positive' : 'badge-negative'} style={{ fontSize: '11px' }}>
                  {h.unrealizedPnL >= 0 ? '+' : ''}
                  {formatVND(h.unrealizedPnL)} ({formatPercent(h.unrealizedPnLPercent)})
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
