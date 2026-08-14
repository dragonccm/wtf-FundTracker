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
  const [showCallout, setShowCallout] = useState(true);
  const [isSplitMenuOpen, setIsSplitMenuOpen] = useState(false);

  // Pixel Native Donut Colors (Matching Digital Wellbeing Palette)
  const PIXEL_DONUT_COLORS = ['#A8C7FA', '#B48CD8', '#7FC0FF', '#6DD58C', '#F2B8B5', '#FFD8E4'];

  const getFundCircleBadge = (code: string) => {
    switch (code) {
      case 'VESAF':
        return 'pixel-circle-icon pixel-icon-green';
      case 'DCBC':
        return 'pixel-circle-icon pixel-icon-blue';
      case 'DSI':
        return 'pixel-circle-icon pixel-icon-orange';
      case 'SSISCA':
        return 'pixel-circle-icon pixel-icon-cyan';
      case 'TCBF':
        return 'pixel-circle-icon pixel-icon-purple';
      case 'E1VFVN30':
        return 'pixel-circle-icon pixel-icon-pink';
      default:
        return 'pixel-circle-icon pixel-icon-purple';
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
    <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
      {/* 1. M3 Search Bar Component */}
      <M3SearchBar placeholder="Tìm kiếm quỹ, giao dịch, mục tiêu..." />

      {/* 2. Horizontal Filter Chips (M3 Subheader Category Chips) */}
      <div className="m3-chips-scroll">
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
            >
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* 3. Hero Visual Card (Exact match to Digital Wellbeing Donut Screen 3) */}
      <div
        className="m3-card"
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '18px',
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

        {/* Central Thick Donut Ring (Digital Wellbeing Style) */}
        <div style={{ position: 'relative', width: '220px', height: '220px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={pieData.length > 0 ? pieData : [{ name: 'Empty', value: 1 }]}
                cx="50%"
                cy="50%"
                innerRadius={70}
                outerRadius={95}
                paddingAngle={pieData.length > 1 ? 4 : 0}
                dataKey="value"
                stroke="none"
              >
                {pieData.length > 0 ? (
                  pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={PIXEL_DONUT_COLORS[index % PIXEL_DONUT_COLORS.length]} />
                  ))
                ) : (
                  <Cell fill="var(--md-sys-color-surface-container-highest)" />
                )}
              </Pie>
            </PieChart>
          </ResponsiveContainer>

          {/* Center Label (Matches 'Hôm nay / 1 phút' style in Digital Wellbeing) */}
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
            <span style={{ fontSize: '11px', fontWeight: 700, color: 'var(--md-sys-color-on-surface-variant)' }}>
              Tài Sản Ròng
            </span>
            <div style={{ fontSize: '20px', fontWeight: 900, color: 'var(--md-sys-color-on-surface)', lineHeight: 1.2, marginTop: '2px' }}>
              {formatVND(metrics.currentMarketValue)}
            </div>
            <span style={{ fontSize: '11px', color: 'var(--md-sys-color-primary)', fontWeight: 800, marginTop: '2px' }}>
              {holdings.length} Quỹ Nắm Giữ
            </span>
          </div>
        </div>

        {/* (5) M3 Split Button with Dropdown Menu (Mẫu 5 & material-web/menu.md) */}
        <div style={{ position: 'relative', width: '100%' }}>
          <div className="m3-split-button" style={{ width: '100%', display: 'flex' }}>
            <Link
              href="/performance"
              className="m3-split-main"
              style={{ flex: 1, textDecoration: 'none', justifyContent: 'center' }}
            >
              <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>
                query_stats
              </span>
              Phân Tích Hiệu Suất XIRR
            </Link>
            <div className="m3-split-divider" />
            <button
              type="button"
              onClick={() => setIsSplitMenuOpen(!isSplitMenuOpen)}
              className="m3-split-trigger"
            >
              <span className="material-symbols-outlined" style={{ fontSize: '20px' }}>
                {isSplitMenuOpen ? 'arrow_drop_up' : 'arrow_drop_down'}
              </span>
            </button>
          </div>

          {/* M3 Menu Surface (Material Web Menu Specification) */}
          {isSplitMenuOpen && (
            <>
              <div
                onClick={() => setIsSplitMenuOpen(false)}
                style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, zIndex: 240 }}
              />
              <div
                className="m3-menu-surface"
                style={{
                  top: '100%',
                  right: 0,
                  marginTop: '8px',
                  width: '100%',
                  boxShadow: 'var(--md-sys-elevation-3)',
                }}
              >
                <Link
                  href="/performance"
                  onClick={() => setIsSplitMenuOpen(false)}
                  className="m3-menu-item"
                >
                  <span className="material-symbols-outlined" style={{ fontSize: '20px', color: 'var(--md-sys-color-primary)' }}>
                    auto_graph
                  </span>
                  <div>
                    <div style={{ fontSize: '14px', fontWeight: 700 }}>Tính XIRR Dòng Tiền</div>
                    <div style={{ fontSize: '11px', color: 'var(--md-sys-color-on-surface-variant)' }}>Lợi suất theo ngày nạp/rút</div>
                  </div>
                </Link>

                <Link
                  href="/funds"
                  onClick={() => setIsSplitMenuOpen(false)}
                  className="m3-menu-item"
                >
                  <span className="material-symbols-outlined" style={{ fontSize: '20px', color: 'var(--md-sys-color-secondary)' }}>
                    finance_chip
                  </span>
                  <div>
                    <div style={{ fontSize: '14px', fontWeight: 700 }}>Tra Cứu Giá NAV Quỹ</div>
                    <div style={{ fontSize: '11px', color: 'var(--md-sys-color-on-surface-variant)' }}>Lịch sử tăng trưởng NAV</div>
                  </div>
                </Link>

                <Link
                  href="/timeline"
                  onClick={() => setIsSplitMenuOpen(false)}
                  className="m3-menu-item"
                >
                  <span className="material-symbols-outlined" style={{ fontSize: '20px', color: 'var(--md-sys-color-tertiary)' }}>
                    timeline
                  </span>
                  <div>
                    <div style={{ fontSize: '14px', fontWeight: 700 }}>Lịch Sử Dòng Tiền Timeline</div>
                    <div style={{ fontSize: '11px', color: 'var(--md-sys-color-on-surface-variant)' }}>Theo dõi biến động dòng vốn</div>
                  </div>
                </Link>

                <Link
                  href="/import-export"
                  onClick={() => setIsSplitMenuOpen(false)}
                  className="m3-menu-item"
                >
                  <span className="material-symbols-outlined" style={{ fontSize: '20px', color: '#198754' }}>
                    table_chart
                  </span>
                  <div>
                    <div style={{ fontSize: '14px', fontWeight: 700 }}>Xuất / Nhập Báo Cáo Excel</div>
                    <div style={{ fontSize: '11px', color: 'var(--md-sys-color-on-surface-variant)' }}>Sao lưu dữ liệu cá nhân</div>
                  </div>
                </Link>
              </div>
            </>
          )}
        </div>
      </div>

      {/* 4. Two Metric Tiles (Matches '1 Lượt mở khóa' & '3 Thông báo' in Screenshot 3) */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
        {/* Tile 1: Vốn đầu tư */}
        <div className="m3-card-tile" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between', padding: '16px', minHeight: '94px' }}>
          <div style={{ fontSize: '22px', fontWeight: 900, color: 'var(--md-sys-color-on-surface)' }}>
            {formatVND(metrics.totalInvested)}
          </div>
          <div style={{ fontSize: '12px', fontWeight: 600, color: 'var(--md-sys-color-on-surface-variant)' }}>
            Vốn đầu tư gốc
          </div>
        </div>

        {/* Tile 2: Lãi / Lỗ */}
        <div className="m3-card-tile" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between', padding: '16px', minHeight: '94px' }}>
          <div style={{ fontSize: '22px', fontWeight: 900, color: metrics.totalPnL >= 0 ? '#2E6C38' : '#BA1A1A' }}>
            {formatVND(metrics.totalPnL)}
          </div>
          <div style={{ fontSize: '12px', fontWeight: 600, color: 'var(--md-sys-color-on-surface-variant)' }}>
            Lãi / Lỗ ({formatPercent(metrics.totalPnLPercent)})
          </div>
        </div>
      </div>

      {/* 5. Callout Banner (Exact match to 'Ngủ ngon hơn nhờ Chế độ giờ đi ngủ' in Screenshot 3) */}
      {showCallout && (
        <div
          style={{
            display: 'flex',
            alignItems: 'flex-start',
            gap: '14px',
            padding: '16px 18px',
            borderRadius: '24px',
            backgroundColor: 'var(--md-sys-color-surface-container-high)',
            position: 'relative',
          }}
        >
          <div
            style={{
              width: '40px',
              height: '40px',
              borderRadius: '50%',
              backgroundColor: 'var(--md-sys-color-surface-container-lowest)',
              color: 'var(--md-sys-color-on-surface)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
            }}
          >
            <span className="material-symbols-outlined" style={{ fontSize: '22px' }}>
              auto_graph
            </span>
          </div>

          <div style={{ flex: 1, paddingRight: '20px' }}>
            <div style={{ fontSize: '14px', fontWeight: 800, color: 'var(--md-sys-color-on-surface)' }}>
              Đầu tư bền vững nhờ chiến lược DCA định kỳ
            </div>
            <div style={{ fontSize: '12px', color: 'var(--md-sys-color-on-surface-variant)', marginTop: '4px', lineHeight: 1.4 }}>
              Tự động tích lũy chứng chỉ quỹ hàng tháng giúp bình quân giá vốn và tối đa hóa lợi suất kép dài hạn.
            </div>
          </div>

          <button
            type="button"
            onClick={() => setShowCallout(false)}
            style={{
              position: 'absolute',
              top: '14px',
              right: '14px',
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              color: 'var(--md-sys-color-on-surface-variant)',
            }}
          >
            <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>close</span>
          </button>
        </div>
      )}

      {/* 6. Holdings Section (Grouped Pixel Card) */}
      <div className="pixel-grouped-card" style={{ padding: '4px 0' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '14px 18px 8px 18px' }}>
          <span style={{ fontSize: '13px', fontWeight: 800, color: 'var(--md-sys-color-on-surface-variant)', textTransform: 'uppercase', letterSpacing: '0.4px' }}>
            Tài Sản Quỹ Nắm Giữ ({filteredHoldings.length})
          </span>
          <Link href="/portfolio" style={{ fontSize: '12px', fontWeight: 800, color: 'var(--md-sys-color-primary)' }}>
            Xem tất cả →
          </Link>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column' }}>
          {filteredHoldings.length === 0 ? (
            <p style={{ fontSize: '13px', color: 'var(--md-sys-color-on-surface-variant)', textAlign: 'center', padding: '16px 0' }}>
              Không có quỹ nào trong danh mục này
            </p>
          ) : (
            filteredHoldings.map((h) => (
              <div key={h.fundCode} className="pixel-settings-item">
                <div className={getFundCircleBadge(h.fundCode)}>
                  <span style={{ fontWeight: 900, fontSize: '12px' }}>{h.fundCode.slice(0, 3)}</span>
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: '15px', fontWeight: 800, color: 'var(--md-sys-color-on-surface)' }}>
                    {h.fundCode}
                  </div>
                  <div style={{ fontSize: '12px', color: 'var(--md-sys-color-on-surface-variant)' }}>
                    {h.totalUnits.toLocaleString('vi-VN')} CCQ • NAV: {formatVND(h.currentNav)}
                  </div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: '14px', fontWeight: 900, color: 'var(--md-sys-color-on-surface)' }}>
                    {formatVND(h.currentValue)}
                  </div>
                  <span className={h.unrealizedPnL >= 0 ? 'badge-positive' : 'badge-negative'} style={{ fontSize: '10px' }}>
                    {formatPercent(h.unrealizedPnLPercent)}
                  </span>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
