'use client';

import React from 'react';
import Link from 'next/link';
import { Cell, Pie, PieChart, ResponsiveContainer } from 'recharts';
import { useAppStore } from '@/lib/store/appStore';
import { formatCompactVND, formatPercent, formatVND } from '@/lib/finance/portfolio';

const allocationColors = ['#a4c6fb', '#b98bd7', '#73b8fa', '#63d18a', '#d0b36f', '#a9b4d6'];

export default function DashboardPage() {
  const { metrics, holdings, goals, transactions } = useAppStore();
  const hasPortfolioData = holdings.length > 0;
  const allocation = holdings.map((holding) => ({
    name: holding.fundCode,
    value: holding.currentValue,
    weight: holding.weightPercent,
  }));
  const investmentDates = transactions
    .filter((transaction) => transaction.type === 'BUY' || transaction.type === 'DEPOSIT')
    .map((transaction) => new Date(transaction.date).getTime())
    .filter(Number.isFinite);
  const earliestInvestment = investmentDates.length ? Math.min(...investmentDates) : null;
  const investmentAgeInDays = earliestInvestment
    ? Math.floor((Date.now() - earliestInvestment) / (1000 * 60 * 60 * 24))
    : 0;
  const hasMatureXirr = investmentAgeInDays >= 30;
  const hasSuspiciousXirr = Math.abs(metrics.xirrPercent) > 200;
  const xirrLabel = !hasMatureXirr
    ? 'Chưa đủ kỳ'
    : hasSuspiciousXirr
      ? 'Kiểm tra dữ liệu'
      : formatPercent(metrics.xirrPercent);
  const xirrHint = !hasMatureXirr
    ? 'Cần tối thiểu 30 ngày'
    : hasSuspiciousXirr
      ? 'Kiểm tra ngày mua và NAV'
      : 'Tỷ suất quy năm';
  const highlightedGoal = goals
    .filter((goal) => goal.targetAmount > 0 && goal.name.trim().length > 0)
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
              <span className="journal-hero-updated">{holdings.length} quỹ đang nắm giữ</span>
            </div>
            <strong className="journal-hero-value" title={formatVND(metrics.currentMarketValue)}>{formatCompactVND(metrics.currentMarketValue)}</strong>
            <div className="journal-hero-performance">
              <div className={metrics.totalPnL >= 0 ? 'journal-positive' : 'journal-negative'}>
                <span className="material-symbols-outlined" style={{ fontSize: 15 }}>
                  {metrics.totalPnL >= 0 ? 'trending_up' : 'trending_down'}
                </span>
                Lãi/lỗ {formatCompactVND(metrics.totalPnL)} ({formatPercent(metrics.totalPnLPercent)})
              </div>
              <span className={metrics.dailyChange >= 0 ? 'journal-daily-positive' : 'journal-daily-negative'}>
                Hôm nay {formatCompactVND(metrics.dailyChange)}
              </span>
            </div>
            <div className="journal-hero-pie" aria-label={`Biểu đồ phân bổ danh mục: ${allocation.map((item) => `${item.name} ${item.weight.toFixed(1)}%`).join(', ')}`}>
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={allocation}
                    dataKey="value"
                    cx="50%"
                    cy="50%"
                    innerRadius={70}
                    outerRadius={102}
                    paddingAngle={allocation.length > 1 ? 3 : 0}
                    stroke="#f3edf7"
                    strokeWidth={3}
                  >
                    {allocation.map((item, index) => (
                      <Cell key={item.name} fill={allocationColors[index % allocationColors.length]} />
                    ))}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
              <div className="journal-hero-pie-label" aria-hidden="true">
                <strong>{holdings.length}</strong>
                <span>quỹ nắm giữ</span>
              </div>
            </div>
            <div className="journal-hero-allocation-legend" aria-hidden="true">
              {allocation.slice(0, 3).map((item, index) => (
                <span key={item.name}>
                  <i style={{ backgroundColor: allocationColors[index % allocationColors.length] }} />
                  {item.name} {item.weight.toFixed(0)}%
                </span>
              ))}
              {allocation.length > 3 && <span>+{allocation.length - 3} quỹ khác</span>}
            </div>
            <Link href="/performance" className="journal-hero-action">
              <span className="material-symbols-outlined">insights</span>
              Phân tích hiệu suất XIRR
              <span className="material-symbols-outlined journal-hero-action-arrow">arrow_forward</span>
            </Link>
          </section>

          <section className="journal-metrics" aria-label="Chỉ số danh mục">
            <div className="journal-metric">
              <span className="material-symbols-outlined" style={{ color: 'var(--journal-primary)', fontSize: 21 }}>payments</span>
              <span className="journal-eyebrow">Vốn</span>
              <strong title={formatVND(metrics.totalInvested)}>{formatCompactVND(metrics.totalInvested)}</strong>
            </div>
            <div className="journal-metric">
              <span className="material-symbols-outlined" style={{ color: 'var(--journal-primary)', fontSize: 21 }}>trending_up</span>
              <span className="journal-eyebrow">Lãi / lỗ</span>
              <strong className={metrics.totalPnL >= 0 ? 'journal-value-positive' : 'journal-value-negative'} title={formatVND(metrics.totalPnL)}>{formatCompactVND(metrics.totalPnL)}</strong>
            </div>
            <div className="journal-metric">
              <span className="material-symbols-outlined" style={{ color: 'var(--journal-primary)', fontSize: 21 }}>query_stats</span>
              <span className="journal-eyebrow">XIRR</span>
              <strong className={hasSuspiciousXirr || !hasMatureXirr ? 'journal-value-muted' : undefined}>{xirrLabel}</strong>
              <small className="journal-metric-hint">{xirrHint}</small>
            </div>
            <div className="journal-metric">
              <span className="material-symbols-outlined" style={{ color: 'var(--journal-primary)', fontSize: 21 }}>today</span>
              <span className="journal-eyebrow">Hôm nay</span>
              <strong title={formatVND(metrics.dailyChange)}>{formatCompactVND(metrics.dailyChange)}</strong>
              <small className="journal-metric-hint">{formatPercent(metrics.dailyChangePercent)}</small>
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
                    <small style={{ color: 'var(--journal-muted)' }}>
                      {holding.totalUnits.toLocaleString('vi-VN', { maximumFractionDigits: 2 })} CCQ · NAV {formatVND(holding.currentNav)}
                    </small>
                  </span>
                  <span style={{ textAlign: 'right' }}>
                    <strong title={formatVND(holding.currentValue)} style={{ display: 'block', fontSize: 14 }}>{formatCompactVND(holding.currentValue)}</strong>
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
