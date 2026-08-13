'use client';

import React from 'react';
import { useAppStore } from '@/lib/store/appStore';
import { formatVND, formatPercent } from '@/lib/finance/portfolio';
import Link from 'next/link';
import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from 'recharts';

export default function DashboardPage() {
  const { metrics, holdings, goals } = useAppStore();

  // Pixel Material You Pastel Palette
  const PIXEL_COLORS = ['#A8C7FA', '#85D397', '#FFB74D', '#D0BCFF', '#7DD0E2', '#FFB4AB'];

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

  const pieData = holdings.map((h) => ({
    name: h.fundCode,
    value: h.currentValue,
    percentage: h.weightPercent,
  }));

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      {/* 1. Digital Wellbeing Style Hero Card (From Screenshot 3) */}
      <div className="m3-card-dark" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px' }}>
        <div style={{ width: '100%', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{ fontSize: '12px', fontWeight: 700, color: '#909299' }}>Tổng Giá Trị Danh Mục</span>
          <span className={metrics.dailyChange >= 0 ? 'badge-positive' : 'badge-negative'}>
            {metrics.dailyChange >= 0 ? '+' : ''}
            {formatVND(metrics.dailyChange)} ({formatPercent(metrics.dailyChangePercent)})
          </span>
        </div>

        {/* Central Donut Ring with Total Amount */}
        <div style={{ position: 'relative', width: '220px', height: '220px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={pieData.length > 0 ? pieData : [{ name: 'Empty', value: 1 }]}
                cx="50%"
                cy="50%"
                innerRadius={76}
                outerRadius={96}
                paddingAngle={pieData.length > 1 ? 4 : 0}
                dataKey="value"
                stroke="none"
              >
                {pieData.length > 0 ? (
                  pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={PIXEL_COLORS[index % PIXEL_COLORS.length]} />
                  ))
                ) : (
                  <Cell fill="#33363D" />
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
            <span style={{ fontSize: '11px', fontWeight: 600, color: '#909299' }}>Tổng Tài Sản</span>
            <div style={{ fontSize: '18px', fontWeight: 900, color: '#E2E2E6', lineHeight: 1.2, marginTop: '2px' }}>
              {formatVND(metrics.currentMarketValue)}
            </div>
            <span style={{ fontSize: '10px', color: '#A8C7FA', fontWeight: 700, marginTop: '2px' }}>
              {holdings.length} Quỹ Nắm Giữ
            </span>
          </div>
        </div>

        {/* Action Pill Button inside Card */}
        <Link
          href="/performance"
          className="m3-pill-btn"
          style={{ width: '100%', backgroundColor: '#282B31', color: '#E2E2E6' }}
        >
          <span className="material-symbols-outlined" style={{ fontSize: '18px', color: '#A8C7FA' }}>
            analytics
          </span>
          Xem Phân Tích Hiệu Suất XIRR
        </Link>
      </div>

      {/* 2. Pixel Quick Settings 2x2 Metric Tiles (From Screenshot 2 & 3) */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
        {/* Tile A: Invested Amount */}
        <div className="m3-card-tile" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between', minHeight: '94px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '11px', fontWeight: 700, color: '#909299' }}>Vốn Đầu Tư</span>
            <div className="m3-icon-badge-blue" style={{ width: '28px', height: '28px' }}>
              <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>payments</span>
            </div>
          </div>
          <div>
            <div style={{ fontSize: '16px', fontWeight: 900, color: '#E2E2E6' }}>{formatVND(metrics.totalInvested)}</div>
            <div style={{ fontSize: '10px', color: '#909299' }}>Giá vốn đang giữ</div>
          </div>
        </div>

        {/* Tile B: Total P&L */}
        <div className="m3-card-tile" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between', minHeight: '94px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '11px', fontWeight: 700, color: '#909299' }}>Lãi / Lỗ Tổng</span>
            <div className="m3-icon-badge-green" style={{ width: '28px', height: '28px' }}>
              <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>trending_up</span>
            </div>
          </div>
          <div>
            <div style={{ fontSize: '16px', fontWeight: 900, color: metrics.totalPnL >= 0 ? '#85D397' : '#FFB4AB' }}>
              {formatVND(metrics.totalPnL)}
            </div>
            <div style={{ fontSize: '10px', color: '#909299' }}>ROI: {formatPercent(metrics.totalPnLPercent)}</div>
          </div>
        </div>

        {/* Tile C: XIRR */}
        <div className="m3-card-tile" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between', minHeight: '94px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '11px', fontWeight: 700, color: '#909299' }}>Tỷ Suất XIRR</span>
            <div className="m3-icon-badge-purple" style={{ width: '28px', height: '28px' }}>
              <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>auto_graph</span>
            </div>
          </div>
          <div>
            <div style={{ fontSize: '16px', fontWeight: 900, color: '#D0BCFF' }}>{formatPercent(metrics.xirrPercent)}</div>
            <div style={{ fontSize: '10px', color: '#909299' }}>Quy năm (%/năm)</div>
          </div>
        </div>

        {/* Tile D: Quick Import */}
        <Link
          href="/import-export"
          className="m3-card-tile"
          style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between', minHeight: '94px', textDecoration: 'none' }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '11px', fontWeight: 700, color: '#909299' }}>Đồng Bộ Excel</span>
            <div className="m3-icon-badge-cyan" style={{ width: '28px', height: '28px' }}>
              <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>upload_file</span>
            </div>
          </div>
          <div>
            <div style={{ fontSize: '14px', fontWeight: 800, color: '#7DD0E2' }}>Import / Export</div>
            <div style={{ fontSize: '10px', color: '#909299' }}>Nhập dữ liệu nhanh</div>
          </div>
        </Link>
      </div>

      {/* 3. Pixel Callout Banner (From Screenshot 3) */}
      <div
        style={{
          backgroundColor: '#1E2833',
          borderRadius: '24px',
          padding: '16px',
          display: 'flex',
          alignItems: 'center',
          gap: '14px',
          border: '1px solid #283645',
        }}
      >
        <div className="m3-icon-badge-blue">
          <span className="material-symbols-outlined">savings</span>
        </div>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: '13px', fontWeight: 800, color: '#E2E2E6' }}>Tích Lũy Đầu Tư Kỷ Luật</div>
          <div style={{ fontSize: '11px', color: '#A8C7FA', marginTop: '2px' }}>
            Duy trì nạp định kỳ hàng tháng giúp tối ưu giá vốn bình quân (DCA).
          </div>
        </div>
      </div>

      {/* 4. Fund Holdings List (From Screenshot 1 Android Settings Style) */}
      <div className="m3-card-dark">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
          <span style={{ fontSize: '13px', fontWeight: 800, color: '#909299', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
            Tài Sản Quỹ Nắm Giữ
          </span>
          <Link href="/portfolio" style={{ fontSize: '12px', fontWeight: 800, color: '#A8C7FA' }}>
            Tất cả →
          </Link>
        </div>

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
                  <div style={{ fontSize: '14px', fontWeight: 800, color: '#E2E2E6' }}>{h.fundCode}</div>
                  <div style={{ fontSize: '11px', color: '#909299' }}>
                    {h.totalUnits.toLocaleString('vi-VN')} CCQ • NAV: {formatVND(h.currentNav)}
                  </div>
                </div>
              </div>

              <div style={{ textAlign: 'right' }}>
                <div style={{ fontSize: '14px', fontWeight: 900, color: '#E2E2E6' }}>{formatVND(h.currentValue)}</div>
                <span className={h.unrealizedPnL >= 0 ? 'badge-positive' : 'badge-negative'} style={{ fontSize: '11px' }}>
                  {formatPercent(h.unrealizedPnLPercent)}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 5. Financial Goals Progress */}
      <div className="m3-card-dark">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
          <span style={{ fontSize: '13px', fontWeight: 800, color: '#909299', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
            Mục Tiêu Tài Chính
          </span>
          <Link href="/goals" style={{ fontSize: '12px', fontWeight: 800, color: '#A8C7FA' }}>
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
                  backgroundColor: '#191B1F',
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px' }}>
                  <span style={{ fontWeight: 800, color: '#E2E2E6' }}>{g.name}</span>
                  <span style={{ fontWeight: 900, color: '#A8C7FA' }}>{pct.toFixed(1)}%</span>
                </div>
                <div
                  style={{
                    height: '8px',
                    borderRadius: '4px',
                    backgroundColor: '#282B31',
                    overflow: 'hidden',
                  }}
                >
                  <div
                    style={{
                      height: '100%',
                      width: `${pct}%`,
                      backgroundColor: '#A8C7FA',
                      borderRadius: '4px',
                    }}
                  />
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', color: '#909299' }}>
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
