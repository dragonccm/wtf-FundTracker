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

  // Comparison Bar Chart data
  const comparisonData = holdings.map((h) => ({
    name: h.fundCode,
    invested: Number((h.totalCost / 1e6).toFixed(2)),
    current: Number((h.currentValue / 1e6).toFixed(2)),
    pnl: h.unrealizedPnL,
  }));

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
        <h1 style={{ fontSize: '22px', fontWeight: 900, color: '#1F1F1F' }}>
          Phân Tích Hiệu Suất & Tỷ Suất XIRR
        </h1>
        <p style={{ fontSize: '13px', color: '#74777F', marginTop: '2px' }}>
          Đo lường lợi nhuận thực tế theo dòng tiền nạp/rút chính xác bằng thuật toán XIRR
        </p>
      </div>

      {/* M3 Segmented Control for Timeframe */}
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

      {/* 1. XIRR Hero Card - M3 Royal Blue Solid */}
      <div className="m3-card-hero" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span className="material-symbols-outlined" style={{ fontSize: '20px' }}>
            auto_graph
          </span>
          <span style={{ fontSize: '12px', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
            Extended Internal Rate of Return (XIRR)
          </span>
        </div>

        <div>
          <div style={{ fontSize: '36px', fontWeight: 900, letterSpacing: '-0.5px', lineHeight: 1.1 }}>
            {formatPercent(metrics.xirrPercent)} / năm
          </div>
          <p style={{ fontSize: '12px', opacity: 0.9, marginTop: '8px', lineHeight: 1.5 }}>
            XIRR tính toán tỷ suất sinh lời thực tế quy năm của các khoản đầu tư có dòng tiền không đều đặn (nạp thêm tiền định kỳ hoặc rút bớt vốn lẻ).
          </p>
        </div>

        {/* Sub Tonal Container inside Hero */}
        <div
          style={{
            backgroundColor: 'rgba(255, 255, 255, 0.15)',
            borderRadius: '16px',
            padding: '14px 16px',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}
        >
          <div>
            <div style={{ fontSize: '11px', opacity: 0.85 }}>Tỷ Suất ROI Đơn Thuần</div>
            <div style={{ fontSize: '18px', fontWeight: 900 }}>{formatPercent(metrics.totalPnLPercent)}</div>
          </div>
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontSize: '11px', opacity: 0.85 }}>Tổng Tiền Lãi Thực Tế</div>
            <div style={{ fontSize: '18px', fontWeight: 900 }}>{formatVND(metrics.totalPnL)}</div>
          </div>
        </div>
      </div>

      {/* 2. Bar Chart: Cost Basis vs Market Value */}
      <div className="m3-card-white">
        <h3 style={{ fontSize: '15px', fontWeight: 800, marginBottom: '14px', color: '#1F1F1F' }}>
          So Sánh Giá Vốn vs Giá Trị Hiện Tại (Triệu VNĐ)
        </h3>

        <div style={{ width: '100%', height: '220px' }}>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={comparisonData} margin={{ top: 10, right: 10, left: -15, bottom: 0 }}>
              <XAxis dataKey="name" stroke="#74777F" fontSize={11} tickLine={false} />
              <YAxis stroke="#74777F" fontSize={10} tickFormatter={(v) => `${v}M`} tickLine={false} />
              <Tooltip
                formatter={(val: any) => [`${val} Triệu VNĐ`]}
                contentStyle={{
                  backgroundColor: '#FFFFFF',
                  borderRadius: '12px',
                  border: '1px solid #E1E7F0',
                  fontWeight: 700,
                  fontSize: '12px',
                }}
              />
              <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />
              <Bar dataKey="invested" name="Giá Vốn Đầu Tư" fill="#5A6065" radius={[6, 6, 0, 0]} />
              <Bar dataKey="current" name="Giá Trị Hiện Tại" fill="#0B57D0" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* 3. Fund Performance Mobile Cards (Replaces cramped table) */}
      <div className="m3-card-white">
        <h3 style={{ fontSize: '15px', fontWeight: 800, marginBottom: '12px', color: '#1F1F1F' }}>
          Chi Tiết Hiệu Suất Từng Quỹ
        </h3>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {holdings.map((h) => (
            <div
              key={h.fundCode}
              style={{
                display: 'flex',
                flexDirection: 'column',
                gap: '10px',
                padding: '14px',
                borderRadius: '16px',
                backgroundColor: '#F7F9FC',
                border: '1px solid #E1E7F0',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <div
                    style={{
                      width: '36px',
                      height: '36px',
                      borderRadius: '10px',
                      backgroundColor: getFundColor(h.fundCode),
                      color: '#FFFFFF',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontWeight: 900,
                      fontSize: '12px',
                    }}
                  >
                    {h.fundCode.slice(0, 3)}
                  </div>
                  <div>
                    <div style={{ fontSize: '14px', fontWeight: 900, color: '#1F1F1F' }}>{h.fundCode}</div>
                    <div style={{ fontSize: '11px', color: '#74777F' }}>
                      {h.totalUnits.toLocaleString('vi-VN')} CCQ • Vốn: {formatVND(h.totalCost)}
                    </div>
                  </div>
                </div>

                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: '14px', fontWeight: 900, color: '#1F1F1F' }}>{formatVND(h.currentValue)}</div>
                  <span className={h.unrealizedPnL >= 0 ? 'badge-positive' : 'badge-negative'} style={{ fontSize: '11px' }}>
                    {h.unrealizedPnL >= 0 ? '+' : ''}
                    {formatVND(h.unrealizedPnL)} ({formatPercent(h.unrealizedPnLPercent)})
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
