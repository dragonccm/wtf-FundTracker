'use client';

import React from 'react';
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
  CartesianGrid,
} from 'recharts';

export default function PerformancePage() {
  const { metrics, holdings } = useAppStore();
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
        <h1 style={{ fontSize: '22px', fontWeight: 500, color: 'var(--md-sys-color-on-surface)' }}>
          Hiệu Suất & Tỷ Suất XIRR
        </h1>
        <p style={{ fontSize: '13px', color: 'var(--md-sys-color-on-surface-variant)', marginTop: '2px' }}>
          Đo lường lợi nhuận thực tế theo dòng tiền nạp/rút chính xác
        </p>
      </div>

      {/* 1. XIRR Hero Card */}
      <div className="m3-card" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span className="material-symbols-outlined" style={{ fontSize: '20px', color: 'var(--md-sys-color-primary)' }}>
            auto_graph
          </span>
          <span style={{ fontSize: '12px', fontWeight: 500, color: 'var(--md-sys-color-primary)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
            Extended Internal Rate of Return
          </span>
        </div>

        <div>
          <div style={{ fontSize: '38px', fontWeight: 500, color: 'var(--md-sys-color-on-surface)', letterSpacing: '-0.5px', lineHeight: 1.1 }}>
            {formatPercent(metrics.xirrPercent)} / năm
          </div>
          <p style={{ fontSize: '12px', color: 'var(--md-sys-color-on-surface-variant)', marginTop: '8px', lineHeight: 1.5 }}>
            XIRR tính toán tỷ suất sinh lời thực tế quy năm của các khoản đầu tư có dòng tiền không đều đặn.
          </p>
        </div>

        {/* Sub Tonal Container inside Hero */}
        <div
          style={{
            backgroundColor: 'var(--md-sys-color-surface-container-low)',
            borderRadius: '16px',
            padding: '14px 16px',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            border: '1px solid var(--md-sys-color-outline-variant)',
          }}
        >
          <div>
            <div style={{ fontSize: '11px', color: 'var(--md-sys-color-on-surface-variant)' }}>Lợi nhuận gộp (PnL)</div>
            <div style={{ fontSize: '18px', fontWeight: 500, color: metrics.totalPnL >= 0 ? '#198754' : '#BA1A1A' }}>
              {formatVND(metrics.totalPnL)}
            </div>
          </div>
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontSize: '11px', color: 'var(--md-sys-color-on-surface-variant)' }}>Tỷ suất ROI giản đơn</div>
            <div style={{ fontSize: '18px', fontWeight: 500, color: metrics.totalPnLPercent >= 0 ? '#198754' : '#BA1A1A' }}>
              {formatPercent(metrics.totalPnLPercent)}
            </div>
          </div>
        </div>
      </div>

      {/* 2. Chart: Invested vs Market Value */}
      <div className="m3-card">
        <h3 style={{ fontSize: '15px', fontWeight: 500, color: 'var(--md-sys-color-on-surface)', marginBottom: '14px' }}>
          So Sánh Vốn Đầu Tư & Giá Trị Hiện Tại (triệu VND)
        </h3>

        <div style={{ width: '100%', height: '230px' }}>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={comparisonData} margin={{ top: 10, right: 10, left: 15, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--md-sys-color-outline-variant)" opacity={0.3} />
              <XAxis dataKey="name" stroke="var(--md-sys-color-on-surface-variant)" fontSize={11} tickLine={false} />
              <YAxis
                width={45}
                stroke="var(--md-sys-color-on-surface-variant)"
                fontSize={10}
                tickLine={false}
                axisLine={false}
                tickFormatter={(v) => `${v} tr`}
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
                formatter={(value: any) => [`${Number(value).toLocaleString('vi-VN')} tr`]}
              />
              <Legend wrapperStyle={{ fontSize: '12px', paddingTop: '10px' }} />
              <Bar dataKey="invested" name="Vốn đầu tư" fill="#74777F" radius={[6, 6, 0, 0]} />
              <Bar dataKey="current" name="Giá trị hiện tại" fill="#0B57D0" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* 3. Holdings Performance Table */}
      <div className="m3-card">
        <h3 style={{ fontSize: '15px', fontWeight: 500, color: 'var(--md-sys-color-on-surface)', marginBottom: '12px' }}>
          Chi Tiết Hiệu Suất Từng Quỹ
        </h3>

        <div className="m3-table-container">
          <table className="m3-table">
            <thead>
              <tr>
                <th>Quỹ</th>
                <th>Giá vốn</th>
                <th>Giá trị</th>
                <th>Lãi / Lỗ</th>
                <th>Tỷ suất</th>
              </tr>
            </thead>
            <tbody>
              {holdings.map((h) => (
                <tr key={h.fundCode}>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <div className={getFundBadgeClass(h.fundCode)} style={{ width: '28px', height: '28px' }}>
                        <span style={{ fontSize: '10px', fontWeight: 500 }}>{h.fundCode.slice(0, 3)}</span>
                      </div>
                      <span style={{ fontWeight: 500 }}>{h.fundCode}</span>
                    </div>
                  </td>
                  <td>{formatVND(h.totalCost)}</td>
                  <td style={{ fontWeight: 500 }}>{formatVND(h.currentValue)}</td>
                  <td style={{ color: h.unrealizedPnL >= 0 ? '#198754' : '#BA1A1A', fontWeight: 500 }}>
                    {h.unrealizedPnL >= 0 ? '+' : ''}{formatVND(h.unrealizedPnL)}
                  </td>
                  <td>
                    <span className={h.unrealizedPnL >= 0 ? 'badge-positive' : 'badge-negative'}>
                      {formatPercent(h.unrealizedPnLPercent)}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
