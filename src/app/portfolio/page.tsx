'use client';

import React, { useState } from 'react';
import { useAppStore } from '@/lib/store/appStore';
import { formatCompactVND, formatVND, formatPercent } from '@/lib/finance/portfolio';

export default function PortfolioPage() {
  const { holdings, portfolios, activePortfolioId, setActivePortfolioId, addPortfolio, metrics } = useAppStore();
  const [isAddPortModalOpen, setIsAddPortModalOpen] = useState(false);
  const [newPortName, setNewPortName] = useState('');
  const [newPortDesc, setNewPortDesc] = useState('');

  const activePort = portfolios.find((p) => p.id === activePortfolioId);

  const handleCreatePortfolio = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPortName.trim()) return;
    addPortfolio({
      name: newPortName,
      description: newPortDesc,
      color: '#0B57D0',
    });
    setNewPortName('');
    setNewPortDesc('');
    setIsAddPortModalOpen(false);
  };

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
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <h1 style={{ fontSize: '22px', fontWeight: 500, color: 'var(--md-sys-color-on-surface)' }}>Quản Lý Danh Mục</h1>
          <p style={{ fontSize: '13px', color: 'var(--md-sys-color-on-surface-variant)', marginTop: '2px' }}>
            Theo dõi chi tiết giá vốn bình quân và lãi/lỗ từng CCQ
          </p>
        </div>

        <button
          onClick={() => setIsAddPortModalOpen(true)}
          className="m3-pill-btn-primary"
        >
          <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>add</span>
          Tạo Danh Mục
        </button>
      </div>

      {/* Portfolio Selector Chips (Smooth M3 Carousel without ugly scrollbar) */}
      <div className="m3-chips-scroll">
        <button
          type="button"
          onClick={() => setActivePortfolioId('ALL')}
          className={`m3-chip ${activePortfolioId === 'ALL' ? 'active' : ''}`}
        >
          <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>language</span>
          Tất Cả Danh Mục
        </button>
        {portfolios.map((p) => (
          <button
            key={p.id}
            type="button"
            onClick={() => setActivePortfolioId(p.id)}
            className={`m3-chip ${activePortfolioId === p.id ? 'active' : ''}`}
          >
            <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>business_center</span>
            {p.name}
          </button>
        ))}
      </div>

      {/* Summary Card for Active Portfolio */}
      <div className="m3-card">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <div style={{ fontSize: '11px', fontWeight: 500, color: 'var(--md-sys-color-on-surface-variant)' }}>DANH MỤC HIỆN TẠI</div>
            <h2 style={{ fontSize: '18px', fontWeight: 500, color: 'var(--md-sys-color-on-surface)', marginTop: '2px' }}>
              {activePortfolioId === 'ALL' ? 'Toàn Bộ Tài Sản Hợp Nhất' : activePort?.name}
            </h2>
            {activePort?.description && (
              <p style={{ fontSize: '12px', color: 'var(--md-sys-color-on-surface-variant)', marginTop: '2px' }}>{activePort.description}</p>
            )}
          </div>
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontSize: '11px', color: 'var(--md-sys-color-on-surface-variant)' }}>Giá trị thị trường</div>
            <div title={formatVND(metrics.currentMarketValue)} style={{ fontSize: '18px', fontWeight: 500, color: 'var(--md-sys-color-on-surface)' }}>{formatCompactVND(metrics.currentMarketValue)}</div>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '8px', marginTop: '16px', borderTop: '1px solid var(--md-sys-color-outline-variant)', paddingTop: '12px' }}>
          <div>
            <div style={{ fontSize: '10px', color: 'var(--md-sys-color-on-surface-variant)' }}>Tổng Vốn</div>
            <div title={formatVND(metrics.totalInvested)} style={{ fontSize: '13px', fontWeight: 500, color: 'var(--md-sys-color-on-surface)' }}>{formatCompactVND(metrics.totalInvested)}</div>
          </div>
          <div>
            <div style={{ fontSize: '10px', color: 'var(--md-sys-color-on-surface-variant)' }}>Lợi Nhuận</div>
            <div style={{ fontSize: '13px', fontWeight: 500, color: metrics.totalPnL >= 0 ? '#198754' : '#BA1A1A' }}>
              {formatCompactVND(metrics.totalPnL)}
            </div>
          </div>
          <div>
            <div style={{ fontSize: '10px', color: 'var(--md-sys-color-on-surface-variant)' }}>Tỷ Suất (ROI)</div>
            <div style={{ fontSize: '13px', fontWeight: 500, color: metrics.totalPnLPercent >= 0 ? '#198754' : '#BA1A1A' }}>
              {formatPercent(metrics.totalPnLPercent)}
            </div>
          </div>
        </div>
      </div>

      {/* Holdings Detailed Cards */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        <h3 style={{ fontSize: '15px', fontWeight: 500, color: 'var(--md-sys-color-on-surface)' }}>
          Chi Tiết Các Quỹ ({holdings.length})
        </h3>

        {holdings.length === 0 ? (
          <div className="m3-card" style={{ textAlign: 'center', padding: '32px 16px', color: 'var(--md-sys-color-on-surface-variant)' }}>
            <span className="material-symbols-outlined" style={{ fontSize: '40px', color: 'var(--md-sys-color-outline)' }}>
              account_balance_wallet
            </span>
            <p style={{ marginTop: '8px', fontSize: '13px', fontWeight: 500 }}>Chưa có chứng chỉ quỹ nào trong danh mục này</p>
          </div>
        ) : (
          holdings.map((h) => (
            <div key={h.fundCode} className="m3-card" style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <div className={getFundBadgeClass(h.fundCode)}>
                    <span style={{ fontWeight: 500, fontSize: '12px' }}>{h.fundCode.slice(0, 3)}</span>
                  </div>
                  <div>
                    <h4 style={{ fontSize: '16px', fontWeight: 500, color: 'var(--md-sys-color-on-surface)' }}>{h.fundCode}</h4>
                    <span style={{ fontSize: '11px', color: 'var(--md-sys-color-on-surface-variant)' }}>{h.fundName}</span>
                  </div>
                </div>

                <div style={{ textAlign: 'right' }}>
                  <div title={formatVND(h.currentValue)} style={{ fontSize: '16px', fontWeight: 500, color: 'var(--md-sys-color-on-surface)' }}>{formatCompactVND(h.currentValue)}</div>
                  <span className={h.unrealizedPnL >= 0 ? 'badge-positive' : 'badge-negative'} style={{ fontSize: '11px', marginTop: '2px' }}>
                    {h.unrealizedPnL >= 0 ? '+' : ''}{formatCompactVND(h.unrealizedPnL)} ({formatPercent(h.unrealizedPnLPercent)})
                  </span>
                </div>
              </div>

              {/* Progress Weight */}
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', marginBottom: '4px' }}>
                  <span style={{ color: 'var(--md-sys-color-on-surface-variant)' }}>Tỷ trọng trong danh mục</span>
                  <span style={{ fontWeight: 500, color: 'var(--md-sys-color-primary)' }}>{h.weightPercent.toFixed(1)}%</span>
                </div>
                <div className="m3-progress-bar-bg">
                  <div
                    className="m3-progress-bar-fill"
                    style={{ width: `${h.weightPercent}%` }}
                  />
                </div>
              </div>

              {/* 4 Stat Boxes inside Card */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', backgroundColor: 'var(--md-sys-color-surface-container-low)', padding: '10px 12px', borderRadius: '14px', border: '1px solid var(--md-sys-color-outline-variant)' }}>
                <div>
                  <div style={{ fontSize: '10px', color: 'var(--md-sys-color-on-surface-variant)' }}>Số lượng CCQ</div>
                  <div style={{ fontSize: '13px', fontWeight: 500, color: 'var(--md-sys-color-on-surface)' }}>{h.totalUnits.toLocaleString('vi-VN')} CCQ</div>
                </div>
                <div>
                  <div style={{ fontSize: '10px', color: 'var(--md-sys-color-on-surface-variant)' }}>Giá vốn bình quân</div>
                  <div style={{ fontSize: '13px', fontWeight: 500, color: 'var(--md-sys-color-on-surface)' }}>{formatVND(h.avgCostBasis)}</div>
                </div>
                <div>
                  <div style={{ fontSize: '10px', color: 'var(--md-sys-color-on-surface-variant)' }}>Giá NAV hiện tại</div>
                  <div style={{ fontSize: '13px', fontWeight: 500, color: 'var(--md-sys-color-on-surface)' }}>{formatVND(h.currentNav)}</div>
                </div>
                <div>
                  <div style={{ fontSize: '10px', color: 'var(--md-sys-color-on-surface-variant)' }}>Tổng giá vốn</div>
                  <div style={{ fontSize: '13px', fontWeight: 500, color: 'var(--md-sys-color-on-surface)' }}>{formatVND(h.totalCost)}</div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Create Portfolio Modal */}
      {isAddPortModalOpen && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0,0,0,0.5)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 300,
            padding: '20px',
          }}
        >
          <div className="m3-card" style={{ width: '100%', maxWidth: '420px', padding: '24px' }}>
            <h3 style={{ fontSize: '16px', fontWeight: 500, color: 'var(--md-sys-color-on-surface)', marginBottom: '14px' }}>
              Tạo Danh Mục Mới
            </h3>
            <form onSubmit={handleCreatePortfolio} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div className="m3-form-group">
                <label className="m3-form-label">Tên danh mục</label>
                <input
                  type="text"
                  required
                  placeholder="VD: Quỹ Mua Nhà, Quỹ Hưu Trí..."
                  value={newPortName}
                  onChange={(e) => setNewPortName(e.target.value)}
                  className="m3-input"
                />
              </div>

              <div className="m3-form-group">
                <label className="m3-form-label">Mô tả ngắn</label>
                <textarea
                  placeholder="Mô tả chiến lược..."
                  value={newPortDesc}
                  onChange={(e) => setNewPortDesc(e.target.value)}
                  className="m3-textarea"
                  style={{ height: '60px' }}
                />
              </div>

              <div style={{ display: 'flex', gap: '10px', marginTop: '8px' }}>
                <button
                  type="button"
                  onClick={() => setIsAddPortModalOpen(false)}
                  className="m3-pill-btn"
                  style={{ flex: 1 }}
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="m3-pill-btn-primary"
                  style={{ flex: 1 }}
                >
                  Tạo Mới
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
