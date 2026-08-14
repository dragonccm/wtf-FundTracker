'use client';

import React from 'react';
import Link from 'next/link';
import { Cell, Pie, PieChart, ResponsiveContainer } from 'recharts';
import { useAppStore } from '@/lib/store/appStore';
import { formatPercent, formatVND } from '@/lib/finance/portfolio';

const allocationColors = ['#a4c6fb', '#b98bd7', '#73b8fa', '#63d18a', '#d0b36f', '#a9b4d6'];

function compactVND(value: number) {
  return new Intl.NumberFormat('vi-VN', {
    notation: 'compact',
    maximumFractionDigits: 1,
  }).format(value);
}

export default function DashboardPage() {
  const { metrics, holdings, goals } = useAppStore();
  const hasPortfolioData = holdings.length > 0;
  const allocation = holdings.map((holding) => ({
    name: holding.fundCode,
    value: holding.currentValue,
  }));
  const highlightedGoal = goals
    .filter((goal) => goal.targetAmount > 0)
    .sort((a, b) => new Date(a.targetDate).getTime() - new Date(b.targetDate).getTime())[0];

  return (
    <div className="journal-page">
      <div className="journal-page-header">
        <div>
          <span className="journal-eyebrow">Hôm nay</span>
          <h1 className="journal-page-title">Tài sản của bạn</h1>
        </div>
        <Link href="/performance" className="journal-icon-button" aria-label="Xem hiệu suất">
          <span className="material-symbols-outlined">monitoring</span>
        </Link>
      </div>

      {hasPortfolioData ? (
        <>
          <section className="journal-card journal-hero">
            <div className="journal-hero-heading">
              <span className="journal-eyebrow" style={{ color: 'var(--journal-muted)' }}>Tổng giá trị tài sản</span>
              <div className={metrics.totalPnL >= 0 ? 'journal-positive' : 'journal-negative'}>
                <span className="material-symbols-outlined" style={{ fontSize: 15 }}>
                  {metrics.totalPnL >= 0 ? 'trending_up' : 'trending_down'}
                </span>
                {formatVND(metrics.totalPnL)} · {formatPercent(metrics.totalPnLPercent)}
              </div>
            </div>

            <div className="journal-allocation" aria-label="Phân bổ danh mục">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={allocation}
                    dataKey="value"
                    cx="50%"
                    cy="50%"
                    innerRadius="61%"
                    outerRadius="88%"
                    paddingAngle={allocation.length > 1 ? 4 : 0}
                    stroke="var(--journal-surface)"
                    strokeWidth={3}
                  >
                    {allocation.map((item, index) => (
                      <Cell key={item.name} fill={allocationColors[index % allocationColors.length]} />
                    ))}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
              <div style={{
                position: 'absolute', inset: 0, display: 'grid', placeItems: 'center',
                color: 'var(--journal-ink)', textAlign: 'center', pointerEvents: 'none',
              }}>
                <span className="journal-allocation-label">
                  <strong>{formatVND(metrics.currentMarketValue)}</strong>
                  <small>{holdings.length} quỹ nắm giữ</small>
                </span>
              </div>
            </div>
            <Link href="/performance" className="journal-hero-action">
              <span className="material-symbols-outlined">insights</span>
              Phân tích hiệu suất XIRR
              <span className="material-symbols-outlined journal-hero-action-arrow">expand_more</span>
            </Link>
          </section>

          <section className="journal-metrics" aria-label="Chỉ số danh mục">
            <div className="journal-metric">
              <span className="material-symbols-outlined" style={{ color: 'var(--journal-primary)', fontSize: 21 }}>payments</span>
              <span className="journal-eyebrow">Vốn</span>
              <strong title={formatVND(metrics.totalInvested)}>{compactVND(metrics.totalInvested)}</strong>
            </div>
            <div className="journal-metric">
              <span className="material-symbols-outlined" style={{ color: 'var(--journal-primary)', fontSize: 21 }}>query_stats</span>
              <span className="journal-eyebrow">XIRR</span>
              <strong>{formatPercent(metrics.xirrPercent)}</strong>
            </div>
            <div className="journal-metric">
              <span className="material-symbols-outlined" style={{ color: 'var(--journal-primary)', fontSize: 21 }}>today</span>
              <span className="journal-eyebrow">Hôm nay</span>
              <strong title={formatVND(metrics.dailyChange)}>{compactVND(metrics.dailyChange)}</strong>
            </div>
          </section>

          <section>
            <div className="journal-section-title">
              <h2>Đang nắm giữ</h2>
              <Link className="journal-text-button" href="/portfolio">Tất cả</Link>
            </div>
            <div className="journal-list">
              {holdings.slice(0, 4).map((holding, index) => (
                <Link className="journal-list-item" href="/portfolio" key={holding.fundCode}>
                  <span
                    className="journal-fund-mark"
                    style={{ background: allocationColors[index % allocationColors.length] }}
                  >
                    {holding.fundCode.slice(0, 4)}
                  </span>
                  <span style={{ minWidth: 0 }}>
                    <strong style={{ display: 'block', fontSize: 14 }}>{holding.fundCode}</strong>
                    <small style={{ color: 'var(--journal-muted)' }}>{holding.weightPercent.toFixed(1)}% danh mục</small>
                  </span>
                  <span style={{ textAlign: 'right' }}>
                    <strong style={{ display: 'block', fontSize: 14 }}>{compactVND(holding.currentValue)}</strong>
                    <small style={{ color: holding.unrealizedPnL >= 0 ? 'var(--journal-success)' : 'var(--journal-danger)', fontWeight: 500 }}>
                      {formatPercent(holding.unrealizedPnLPercent)}
                    </small>
                  </span>
                </Link>
              ))}
            </div>
          </section>
        </>
      ) : (
        <section className="journal-card journal-empty">
          <div className="journal-empty-visual">
            <span className="material-symbols-outlined" style={{ fontSize: 36 }}>add_chart</span>
          </div>
          <h2>Danh mục của bạn đang trống</h2>
          <p>Thêm quỹ đầu tiên để theo dõi số tiền đầu tư, lãi/lỗ và hiệu suất.</p>
          <Link className="journal-primary-button" href="/funds">
            Thêm quỹ đầu tiên
            <span className="material-symbols-outlined" style={{ fontSize: 19 }}>arrow_forward</span>
          </Link>
        </section>
      )}

      {highlightedGoal && (
        <section>
          <div className="journal-section-title">
            <h2>Mục tiêu gần nhất</h2>
            <Link className="journal-text-button" href="/goals">Chi tiết</Link>
          </div>
          <Link href="/goals" className="journal-card" style={{ display: 'block', padding: 20 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', gap: 16, alignItems: 'center' }}>
              <div>
                <strong style={{ fontSize: 15 }}>{highlightedGoal.name}</strong>
                <div style={{ marginTop: 4, color: 'var(--journal-muted)', fontSize: 12 }}>
                  {formatVND(highlightedGoal.currentAmount)} / {formatVND(highlightedGoal.targetAmount)}
                </div>
              </div>
              <strong style={{ color: 'var(--journal-primary)', fontSize: 18 }}>
                {Math.min(100, (highlightedGoal.currentAmount / highlightedGoal.targetAmount) * 100).toFixed(0)}%
              </strong>
            </div>
            <div className="m3-progress-bar-bg" style={{ marginTop: 14 }}>
              <div
                className="m3-progress-bar-fill"
                style={{ width: `${Math.min(100, (highlightedGoal.currentAmount / highlightedGoal.targetAmount) * 100)}%` }}
              />
            </div>
          </Link>
        </section>
      )}
    </div>
  );
}
