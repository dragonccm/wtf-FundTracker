'use client';

import React from 'react';
import { useAppStore } from '@/lib/store/appStore';
import { formatVND, formatPercent } from '@/lib/finance/portfolio';
import Link from 'next/link';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  PieChart,
  Pie,
  Cell,
} from 'recharts';

export default function DashboardPage() {
  const { metrics, holdings, goals, portfolios, activePortfolioId } = useAppStore();

  const activePort = portfolios.find((p) => p.id === activePortfolioId);

  // Asset growth history data
  const growthChartData = [
    { date: 'Thg 3', value: metrics.totalInvested * 0.72 },
    { date: 'Thg 4', value: metrics.totalInvested * 0.8 },
    { date: 'Thg 5', value: metrics.totalInvested * 0.88 },
    { date: 'Thg 6', value: metrics.totalInvested * 0.93 },
    { date: 'Thg 7', value: metrics.totalInvested * 0.97 },
    { date: 'Hiện tại', value: metrics.currentMarketValue },
  ];

  // Material 3 Vibrant Color Palette
  const COLORS = ['#0B57D0', '#137333', '#C25400', '#8021B1', '#B3261E', '#007791'];

  // Fund logo badge background helper
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

  const pieData = holdings.map((h) => ({
    name: h.fundCode,
    value: h.currentValue,
    percentage: h.weightPercent,
  }));

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      {/* 1. M3 Hero Container - Google Royal Blue Solid (NO Gradient, NO Box Shadow) */}
      <div
        className="m3-card-hero"
        style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '16px',
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span
            style={{
              fontSize: '12px',
              fontWeight: 800,
              backgroundColor: 'rgba(255, 255, 255, 0.2)',
              color: '#FFFFFF',
              padding: '6px 14px',
              borderRadius: '20px',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
            }}
          >
            <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>
              folder
            </span>
            {activePortfolioId === 'ALL' ? 'Tất cả danh mục' : activePort?.name}
          </span>

          <span style={{ fontSize: '12px', fontWeight: 600, opacity: 0.9 }}>Tổng Giá Trị Tài Sản</span>
        </div>

        <div>
          <div style={{ fontSize: '34px', fontWeight: 900, letterSpacing: '-0.5px', lineHeight: 1.1 }}>
            {formatVND(metrics.currentMarketValue)}
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '12px' }}>
            <span
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '4px',
                backgroundColor: metrics.dailyChange >= 0 ? '#C4EDD0' : '#FFDAD6',
                color: metrics.dailyChange >= 0 ? '#004D1A' : '#93000A',
                padding: '5px 12px',
                borderRadius: '20px',
                fontSize: '12px',
                fontWeight: 900,
              }}
            >
              <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>
                {metrics.dailyChange >= 0 ? 'trending_up' : 'trending_down'}
              </span>
              {formatVND(metrics.dailyChange)} ({formatPercent(metrics.dailyChangePercent)})
            </span>
            <span style={{ fontSize: '11px', opacity: 0.85 }}>hôm nay</span>
          </div>
        </div>

        {/* Action Pills */}
        <div
          style={{
            display: 'flex',
            gap: '10px',
            paddingTop: '12px',
            borderTop: '1px solid rgba(255, 255, 255, 0.2)',
          }}
        >
          <Link
            href="/import-export"
            style={{
              flex: 1,
              padding: '11px',
              borderRadius: '16px',
              backgroundColor: 'rgba(255, 255, 255, 0.2)',
              color: '#FFFFFF',
              fontSize: '13px',
              fontWeight: 800,
              textAlign: 'center',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '6px',
            }}
          >
            <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>
              upload_file
            </span>
            Import Excel
          </Link>
          <Link
            href="/performance"
            style={{
              flex: 1,
              padding: '11px',
              borderRadius: '16px',
              backgroundColor: '#FFFFFF',
              color: '#0B57D0',
              fontSize: '13px',
              fontWeight: 900,
              textAlign: 'center',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '6px',
            }}
          >
            <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>
              equalizer
            </span>
            Xem XIRR
          </Link>
        </div>
      </div>

      {/* 2. 2x2 M3 Tonal Metric Cards - Pure Surface Contrast (NO Gradient, NO Box Shadow) */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
        {/* Card A: Cost Basis (M3 White Card) */}
        <div
          className="m3-card-white"
          style={{
            padding: '16px',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '12px', fontWeight: 700, color: 'var(--md-sys-color-secondary)' }}>
              Vốn Đầu Tư
            </span>
            <div
              style={{
                width: '32px',
                height: '32px',
                borderRadius: '10px',
                backgroundColor: 'var(--md-sys-color-primary-container)',
                color: 'var(--md-sys-color-primary)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>
                payments
              </span>
            </div>
          </div>
          <div style={{ fontSize: '18px', fontWeight: 900, marginTop: '8px', color: '#1F1F1F' }}>
            {formatVND(metrics.totalInvested)}
          </div>
          <div style={{ fontSize: '11px', color: 'var(--md-sys-color-secondary)', marginTop: '4px' }}>
            Giá vốn đang nắm giữ
          </div>
        </div>

        {/* Card B: Total P&L (M3 Success Tonal Card) */}
        <div
          className="m3-card-success"
          style={{
            padding: '16px',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '12px', fontWeight: 800, color: '#004D1A' }}>Lãi / Lỗ Tổng</span>
            <div
              style={{
                width: '32px',
                height: '32px',
                borderRadius: '10px',
                backgroundColor: '#FFFFFF',
                color: '#137333',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>
                show_chart
              </span>
            </div>
          </div>
          <div style={{ fontSize: '18px', fontWeight: 900, marginTop: '8px', color: '#004D1A' }}>
            {formatVND(metrics.totalPnL)}
          </div>
          <div style={{ marginTop: '4px' }}>
            <span className="badge-positive" style={{ fontSize: '11px' }}>
              ROI: {formatPercent(metrics.totalPnLPercent)}
            </span>
          </div>
        </div>

        {/* Card C: XIRR (M3 Tertiary Tonal Card - Warm Plum Purple) */}
        <div
          className="m3-card-tertiary"
          style={{
            padding: '16px',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '12px', fontWeight: 800, color: 'var(--md-sys-color-on-tertiary-container)' }}>
              Tỷ Suất XIRR
            </span>
            <div
              style={{
                width: '32px',
                height: '32px',
                borderRadius: '10px',
                backgroundColor: '#FFFFFF',
                color: 'var(--md-sys-color-tertiary)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>
                auto_graph
              </span>
            </div>
          </div>
          <div
            style={{
              fontSize: '22px',
              fontWeight: 900,
              marginTop: '6px',
              color: 'var(--md-sys-color-on-tertiary-container)',
            }}
          >
            {formatPercent(metrics.xirrPercent)}
          </div>
          <div style={{ fontSize: '11px', fontWeight: 600, opacity: 0.9 }}>Lợi nhuận năm (%/năm)</div>
        </div>

        {/* Card D: Active Funds Count (M3 White Card) */}
        <div
          className="m3-card-white"
          style={{
            padding: '16px',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '12px', fontWeight: 700, color: 'var(--md-sys-color-secondary)' }}>
              CCQ Nắm Giữ
            </span>
            <div
              style={{
                width: '32px',
                height: '32px',
                borderRadius: '10px',
                backgroundColor: 'var(--md-sys-color-secondary-container)',
                color: 'var(--md-sys-color-secondary)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>
                pie_chart
              </span>
            </div>
          </div>
          <div style={{ fontSize: '22px', fontWeight: 900, marginTop: '6px', color: '#0B57D0' }}>
            {holdings.length} Quỹ
          </div>
          <div style={{ fontSize: '11px', color: 'var(--md-sys-color-secondary)' }}>Đang hoạt động</div>
        </div>
      </div>

      {/* 3. Asset Growth Line Chart (M3 White Container) */}
      <div className="m3-card-white">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div
              style={{
                width: '28px',
                height: '28px',
                borderRadius: '8px',
                backgroundColor: 'var(--md-sys-color-primary-container)',
                color: 'var(--md-sys-color-primary)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>
                monitoring
              </span>
            </div>
            <h3 style={{ fontSize: '15px', fontWeight: 800 }}>Biểu Đồ Tăng Trưởng Tài Sản</h3>
          </div>
          <span className="badge-neutral" style={{ fontSize: '11px' }}>
            6 Tháng
          </span>
        </div>

        <div style={{ width: '100%', height: '190px' }}>
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={growthChartData} margin={{ top: 8, right: 8, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="colorValueM3Solid" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#0B57D0" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#0B57D0" stopOpacity={0.0} />
                </linearGradient>
              </defs>
              <XAxis dataKey="date" stroke="#74777F" fontSize={11} tickLine={false} />
              <YAxis stroke="#74777F" fontSize={10} tickFormatter={(v) => (v / 1e6).toFixed(0) + 'M'} tickLine={false} />
              <Tooltip
                formatter={(val: any) => [formatVND(Number(val)), 'Giá trị']}
                contentStyle={{
                  backgroundColor: '#FFFFFF',
                  borderRadius: '14px',
                  border: '1px solid #E1E7F0',
                  fontWeight: 700,
                  fontSize: '12px',
                }}
              />
              <Area type="monotone" dataKey="value" stroke="#0B57D0" strokeWidth={3} fillOpacity={1} fill="url(#colorValueM3Solid)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* 4. Fund Holdings Mobile List Items (M3 White Container) */}
      <div className="m3-card-white">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
          <h3 style={{ fontSize: '15px', fontWeight: 800 }}>Tài Sản Nắm Giữ</h3>
          <Link href="/portfolio" style={{ fontSize: '12px', fontWeight: 800, color: '#0B57D0' }}>
            Xem chi tiết →
          </Link>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {holdings.map((h) => (
            <div
              key={h.fundCode}
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                padding: '12px 14px',
                borderRadius: '18px',
                backgroundColor: '#F7F9FC',
                border: '1px solid #E1E7F0',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div
                  style={{
                    width: '42px',
                    height: '42px',
                    borderRadius: '14px',
                    backgroundColor: getFundColor(h.fundCode),
                    color: '#FFFFFF',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontWeight: 900,
                    fontSize: '13px',
                  }}
                >
                  {h.fundCode.slice(0, 3)}
                </div>
                <div>
                  <div style={{ fontSize: '14px', fontWeight: 800, color: '#1F1F1F' }}>{h.fundCode}</div>
                  <div style={{ fontSize: '11px', color: 'var(--md-sys-color-secondary)' }}>
                    {h.totalUnits.toLocaleString('vi-VN')} CCQ • NAV: {formatVND(h.currentNav)}
                  </div>
                </div>
              </div>

              <div style={{ textAlign: 'right' }}>
                <div style={{ fontSize: '14px', fontWeight: 900 }}>{formatVND(h.currentValue)}</div>
                <span className={h.unrealizedPnL >= 0 ? 'badge-positive' : 'badge-negative'} style={{ fontSize: '11px' }}>
                  {formatPercent(h.unrealizedPnLPercent)}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 5. Fund Allocation Donut Chart */}
      <div className="m3-card-white">
        <h3 style={{ fontSize: '15px', fontWeight: 800, marginBottom: '12px' }}>Phân Bổ Tỷ Trọng Danh Mục</h3>
        {pieData.length > 0 ? (
          <div>
            <div style={{ width: '100%', height: '160px' }}>
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={pieData} cx="50%" cy="50%" innerRadius={42} outerRadius={68} paddingAngle={4} dataKey="value">
                    {pieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(val: any) => [formatVND(Number(val)), 'Giá trị']} />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', marginTop: '8px' }}>
              {pieData.map((item, idx) => (
                <div
                  key={item.name}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    fontSize: '12px',
                    padding: '6px 10px',
                    borderRadius: '12px',
                    backgroundColor: '#F7F9FC',
                    border: '1px solid #E1E7F0',
                  }}
                >
                  <div style={{ width: '10px', height: '10px', borderRadius: '50%', backgroundColor: COLORS[idx % COLORS.length] }} />
                  <span style={{ fontWeight: 800 }}>{item.name}:</span>
                  <span>{item.percentage.toFixed(1)}%</span>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div style={{ textAlign: 'center', padding: '24px 0', color: 'var(--md-sys-color-secondary)' }}>Chưa có dữ liệu</div>
        )}
      </div>

      {/* 6. Financial Goal Progress Widget */}
      <div className="m3-card-white">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
          <h3 style={{ fontSize: '15px', fontWeight: 800 }}>Mục Tiêu Tài Chính</h3>
          <Link href="/goals" style={{ fontSize: '12px', fontWeight: 800, color: '#0B57D0' }}>
            Quản lý →
          </Link>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {goals.slice(0, 3).map((g) => {
            const pct = Math.min(100, (g.currentAmount / g.targetAmount) * 100);
            return (
              <div
                key={g.id}
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '6px',
                  padding: '12px',
                  borderRadius: '16px',
                  backgroundColor: '#F7F9FC',
                  border: '1px solid #E1E7F0',
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px' }}>
                  <span style={{ fontWeight: 800 }}>{g.name}</span>
                  <span style={{ fontWeight: 900, color: '#0B57D0' }}>{pct.toFixed(1)}%</span>
                </div>
                <div
                  style={{
                    height: '8px',
                    borderRadius: '4px',
                    backgroundColor: '#E1E7F0',
                    overflow: 'hidden',
                  }}
                >
                  <div
                    style={{
                      height: '100%',
                      width: `${pct}%`,
                      backgroundColor: '#0B57D0',
                      borderRadius: '4px',
                    }}
                  />
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', color: 'var(--md-sys-color-secondary)' }}>
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
