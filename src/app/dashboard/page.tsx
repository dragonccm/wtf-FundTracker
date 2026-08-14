'use client';

import React, { useState } from 'react';
import { useAppStore } from '@/lib/store/appStore';
import { formatVND, formatPercent } from '@/lib/finance/portfolio';
import Link from 'next/link';
import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from 'recharts';
import M3SearchBar from '@/components/search/M3SearchBar';

export default function DashboardPage() {
  const { metrics, holdings, goals } = useAppStore();
  const [selectedCategory, setSelectedCategory] = useState('ALL');

  // M3 Tonal Palette for Pie Chart
  const M3_PIE_COLORS = ['#6750A4', '#2E6C38', '#B26A00', '#006876', '#7D5260', '#BA1A1A'];

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
        return 'm3-icon-badge-purple';
    }
  };

  const filteredHoldings = selectedCategory === 'ALL'
    ? holdings
    : holdings.filter((h) => h.category === selectedCategory);

  const pieData = holdings.map((h) => ({
    name: h.fundCode,
    value: h.currentValue,
    percentage: h.weightPercent,
  }));

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      {/* 1. M3 Search Bar Component */}
      <M3SearchBar placeholder="Tìm kiếm nhanh quỹ, giao dịch, mục tiêu..." />

      {/* 2. Horizontal Filter Chips (M3 Subheader Category Chips) */}
      <div style={{ display: 'flex', gap: '8px', overflowX: 'auto', paddingBottom: '2px' }}>
        {[
          { id: 'ALL', label: 'Tất cả quỹ' },
          { id: 'Equity', label: 'Cổ phiếu' },
          { id: 'Bond', label: 'Trái phiếu' },
          { id: 'Balanced', label: 'Cân bằng' },
          { id: 'Index', label: 'Chỉ số ETF' },
        ].map((tab) => {
          const isActive = selectedCategory === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => setSelectedCategory(tab.id)}
              className={`m3-chip ${isActive ? 'active' : ''}`}
              style={{
                borderRadius: '20px',
                padding: '8px 16px',
                whiteSpace: 'nowrap',
                fontWeight: isActive ? 800 : 600,
              }}
            >
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* 3. Hero Visual Card (Matching Figma M3 Example Layouts Hero Container) */}
      <div
        className="m3-card"
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '16px',
          padding: '24px 20px',
          backgroundColor: 'var(--md-sys-color-surface-container)',
        }}
      >
        <div style={{ width: '100%', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{ fontSize: '12px', fontWeight: 800, color: 'var(--md-sys-color-on-surface-variant)', letterSpacing: '0.4px', textTransform: 'uppercase' }}>
            Tổng Giá Trị Tài Sản
          </span>
          <span className={metrics.dailyChange >= 0 ? 'badge-positive' : 'badge-negative'}>
            {metrics.dailyChange >= 0 ? '+' : ''}
            {formatVND(metrics.dailyChange)} ({formatPercent(metrics.dailyChangePercent)})
          </span>
        </div>

        {/* Central Donut Ring with Total Amount */}
        <div style={{ position: 'relative', width: '210px', height: '210px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={pieData.length > 0 ? pieData : [{ name: 'Empty', value: 1 }]}
                cx="50%"
                cy="50%"
                innerRadius={72}
                outerRadius={92}
                paddingAngle={pieData.length > 1 ? 4 : 0}
                dataKey="value"
                stroke="none"
              >
                {pieData.length > 0 ? (
                  pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={M3_PIE_COLORS[index % M3_PIE_COLORS.length]} />
                  ))
                ) : (
                  <Cell fill="var(--md-sys-color-surface-container-highest)" />
                )}
              </Pie>
            </PieChart>
          </ResponsiveContainer>

          {/* Centered Total Label inside Donut */}
          <div
            style={{
              position: 'absolute',
              textAlign: 'center',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              pointerEvents: 'none',
              maxWidth: '140px',
            }}
          >
            <span style={{ fontSize: '11px', fontWeight: 700, color: 'var(--md-sys-color-on-surface-variant)' }}>Tài Sản Ròng</span>
            <div style={{ fontSize: '20px', fontWeight: 900, color: 'var(--md-sys-color-on-surface)', lineHeight: 1.2, marginTop: '2px' }}>
              {formatVND(metrics.currentMarketValue)}
            </div>
            <span style={{ fontSize: '11px', color: 'var(--md-sys-color-primary)', fontWeight: 800, marginTop: '2px' }}>
              {holdings.length} Quỹ Nắm Giữ
            </span>
          </div>
        </div>

        {/* Action Pill Button */}
        <Link
          href="/performance"
          className="m3-pill-btn"
          style={{
            width: '100%',
            backgroundColor: 'var(--md-sys-color-surface-container-lowest)',
            color: 'var(--md-sys-color-on-surface)',
            boxShadow: 'var(--md-sys-elevation-1)',
          }}
        >
          <span className="material-symbols-outlined" style={{ fontSize: '18px', color: 'var(--md-sys-color-primary)' }}>
            analytics
          </span>
          Xem Phân Tích Hiệu Suất XIRR
        </Link>
      </div>

      {/* 4. M3 Quick Metric 2x2 Grid (As seen in Figma Example Layouts Grid) */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
        {/* Tile A: Invested */}
        <div className="m3-card-tile" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between', minHeight: '96px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '11px', fontWeight: 800, color: 'var(--md-sys-color-on-surface-variant)' }}>Vốn Đầu Tư</span>
            <div className="m3-icon-badge-blue" style={{ width: '28px', height: '28px', borderRadius: '8px' }}>
              <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>payments</span>
            </div>
          </div>
          <div>
            <div style={{ fontSize: '16px', fontWeight: 900, color: 'var(--md-sys-color-on-surface)' }}>{formatVND(metrics.totalInvested)}</div>
            <div style={{ fontSize: '10px', color: 'var(--md-sys-color-on-surface-variant)' }}>Giá vốn đang giữ</div>
          </div>
        </div>

        {/* Tile B: Total PnL */}
        <div className="m3-card-tile" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between', minHeight: '96px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '11px', fontWeight: 800, color: 'var(--md-sys-color-on-surface-variant)' }}>Lãi / Lỗ Tổng</span>
            <div className="m3-icon-badge-green" style={{ width: '28px', height: '28px', borderRadius: '8px' }}>
              <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>trending_up</span>
            </div>
          </div>
          <div>
            <div style={{ fontSize: '16px', fontWeight: 900, color: metrics.totalPnL >= 0 ? '#2E6C38' : '#BA1A1A' }}>
              {formatVND(metrics.totalPnL)}
            </div>
            <div style={{ fontSize: '10px', color: 'var(--md-sys-color-on-surface-variant)' }}>ROI: {formatPercent(metrics.totalPnLPercent)}</div>
          </div>
        </div>

        {/* Tile C: XIRR */}
        <div className="m3-card-tile" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between', minHeight: '96px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '11px', fontWeight: 800, color: 'var(--md-sys-color-on-surface-variant)' }}>Tỷ Suất XIRR</span>
            <div className="m3-icon-badge-purple" style={{ width: '28px', height: '28px', borderRadius: '8px' }}>
              <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>auto_graph</span>
            </div>
          </div>
          <div>
            <div style={{ fontSize: '16px', fontWeight: 900, color: '#6750A4' }}>{formatPercent(metrics.xirrPercent)}</div>
            <div style={{ fontSize: '10px', color: 'var(--md-sys-color-on-surface-variant)' }}>Quy năm (%/năm)</div>
          </div>
        </div>

        {/* Tile D: Import/Export */}
        <Link
          href="/import-export"
          className="m3-card-tile"
          style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between', minHeight: '96px', textDecoration: 'none' }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '11px', fontWeight: 800, color: 'var(--md-sys-color-on-surface-variant)' }}>Đồng Bộ Excel</span>
            <div className="m3-icon-badge-cyan" style={{ width: '28px', height: '28px', borderRadius: '8px' }}>
              <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>upload_file</span>
            </div>
          </div>
          <div>
            <div style={{ fontSize: '14px', fontWeight: 800, color: 'var(--md-sys-color-primary)' }}>Import / Export</div>
            <div style={{ fontSize: '10px', color: 'var(--md-sys-color-on-surface-variant)' }}>Nhập dữ liệu nhanh</div>
          </div>
        </Link>
      </div>

      {/* 5. Holdings Multi-line M3 List Items (Matching Figma Example Layouts List Section) */}
      <div className="m3-card" style={{ padding: '18px 16px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
          <span style={{ fontSize: '13px', fontWeight: 800, color: 'var(--md-sys-color-on-surface-variant)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
            Tài Sản Quỹ Nắm Giữ ({filteredHoldings.length})
          </span>
          <Link href="/portfolio" style={{ fontSize: '12px', fontWeight: 800, color: 'var(--md-sys-color-primary)' }}>
            Xem tất cả →
          </Link>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {filteredHoldings.length === 0 ? (
            <p style={{ fontSize: '13px', color: 'var(--md-sys-color-on-surface-variant)', textAlign: 'center', padding: '16px 0' }}>
              Không có quỹ nào trong danh mục này
            </p>
          ) : (
            filteredHoldings.map((h) => (
              <div
                key={h.fundCode}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '12px 14px',
                  borderRadius: '16px',
                  backgroundColor: 'var(--md-sys-color-surface-container-lowest)',
                  boxShadow: 'var(--md-sys-elevation-1)',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <div className={getFundBadgeClass(h.fundCode)}>
                    <span style={{ fontWeight: 900, fontSize: '11px' }}>{h.fundCode.slice(0, 3)}</span>
                  </div>
                  <div>
                    <div style={{ fontSize: '15px', fontWeight: 800, color: 'var(--md-sys-color-on-surface)' }}>{h.fundCode}</div>
                    <div style={{ fontSize: '11px', color: 'var(--md-sys-color-on-surface-variant)' }}>
                      {h.totalUnits.toLocaleString('vi-VN')} CCQ • NAV: {formatVND(h.currentNav)}
                    </div>
                  </div>
                </div>

                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: '14px', fontWeight: 900, color: 'var(--md-sys-color-on-surface)' }}>{formatVND(h.currentValue)}</div>
                  <span className={h.unrealizedPnL >= 0 ? 'badge-positive' : 'badge-negative'} style={{ fontSize: '11px' }}>
                    {formatPercent(h.unrealizedPnLPercent)}
                  </span>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* 6. Financial Goals Progress Card */}
      <div className="m3-card" style={{ padding: '18px 16px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
          <span style={{ fontSize: '13px', fontWeight: 800, color: 'var(--md-sys-color-on-surface-variant)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
            Mục Tiêu Tài Chính
          </span>
          <Link href="/goals" style={{ fontSize: '12px', fontWeight: 800, color: 'var(--md-sys-color-primary)' }}>
            Quản lý →
          </Link>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {goals.slice(0, 3).map((g) => {
            const pct = Math.min(100, (g.currentAmount / g.targetAmount) * 100);
            return (
              <div
                key={g.id}
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '6px',
                  padding: '12px 14px',
                  borderRadius: '16px',
                  backgroundColor: 'var(--md-sys-color-surface-container-lowest)',
                  boxShadow: 'var(--md-sys-elevation-1)',
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px' }}>
                  <span style={{ fontWeight: 800, color: 'var(--md-sys-color-on-surface)' }}>{g.name}</span>
                  <span style={{ fontWeight: 900, color: 'var(--md-sys-color-primary)' }}>{pct.toFixed(1)}%</span>
                </div>
                <div className="m3-progress-bar-bg">
                  <div
                    className="m3-progress-bar-fill"
                    style={{ width: `${pct}%` }}
                  />
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', color: 'var(--md-sys-color-on-surface-variant)' }}>
                  <span>Đã tích lũy: {formatVND(g.currentAmount)}</span>
                  <span>Mục tiêu: {formatVND(g.targetAmount)}</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
