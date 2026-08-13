'use client';

import React, { useState } from 'react';
import { useAppStore } from '@/lib/store/appStore';
import { formatVND, formatPercent } from '@/lib/finance/portfolio';

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
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <h1 style={{ fontSize: '22px', fontWeight: 900, color: '#1F1F1F' }}>Quản Lý Danh Mục</h1>
          <p style={{ fontSize: '13px', color: '#74777F', marginTop: '2px' }}>
            Theo dõi chi tiết giá vốn bình quân và lãi/lỗ từng CCQ
          </p>
        </div>

        <button
          onClick={() => setIsAddPortModalOpen(true)}
          className="m3-btn-filled"
        >
          <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>add</span>
          Tạo Danh Mục
        </button>
      </div>

      {/* Portfolio Selector Chips */}
      <div style={{ display: 'flex', gap: '8px', overflowX: 'auto', paddingBottom: '4px' }}>
        <button
          onClick={() => setActivePortfolioId('ALL')}
          style={{
            padding: '8px 16px',
            borderRadius: '20px',
            border: activePortfolioId === 'ALL' ? 'none' : '1px solid #C4C6D0',
            backgroundColor: activePortfolioId === 'ALL' ? '#0B57D0' : '#FFFFFF',
            color: activePortfolioId === 'ALL' ? '#FFFFFF' : '#1F1F1F',
            fontWeight: 800,
            fontSize: '12px',
            cursor: 'pointer',
            whiteSpace: 'nowrap',
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
          }}
        >
          <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>language</span>
          Tất Cả Danh Mục
        </button>
        {portfolios.map((p) => (
          <button
            key={p.id}
            onClick={() => setActivePortfolioId(p.id)}
            style={{
              padding: '8px 16px',
              borderRadius: '20px',
              border: activePortfolioId === p.id ? 'none' : '1px solid #C4C6D0',
              backgroundColor: activePortfolioId === p.id ? '#0B57D0' : '#FFFFFF',
              color: activePortfolioId === p.id ? '#FFFFFF' : '#1F1F1F',
              fontWeight: 800,
              fontSize: '12px',
              cursor: 'pointer',
              whiteSpace: 'nowrap',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
            }}
          >
            <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>business_center</span>
            {p.name}
          </button>
        ))}
      </div>

      {/* Portfolio Summary Card */}
      <div className="m3-card-white">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '14px' }}>
          <div>
            <h3 style={{ fontSize: '16px', fontWeight: 900, color: '#0B57D0' }}>
              {activePortfolioId === 'ALL' ? 'Toàn Bộ Tài Sản Hợp Nhất' : activePort?.name}
            </h3>
            {activePort?.description && (
              <p style={{ fontSize: '12px', color: '#74777F', marginTop: '2px' }}>{activePort.description}</p>
            )}
          </div>
          <div style={{ textAlign: 'right' }}>
            <span style={{ fontSize: '11px', color: '#74777F' }}>Giá trị thị trường</span>
            <div style={{ fontSize: '20px', fontWeight: 900, color: '#1F1F1F' }}>
              {formatVND(metrics.currentMarketValue)}
            </div>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', paddingTop: '12px', borderTop: '1px solid #E1E7F0' }}>
          <div style={{ padding: '10px 12px', borderRadius: '14px', backgroundColor: '#F7F9FC' }}>
            <div style={{ fontSize: '11px', color: '#74777F' }}>Vốn đầu tư</div>
            <div style={{ fontSize: '14px', fontWeight: 800 }}>{formatVND(metrics.totalInvested)}</div>
          </div>
          <div style={{ padding: '10px 12px', borderRadius: '14px', backgroundColor: metrics.totalPnL >= 0 ? '#C4EDD0' : '#FFDAD6' }}>
            <div style={{ fontSize: '11px', color: metrics.totalPnL >= 0 ? '#004D1A' : '#93000A' }}>Tổng Lãi / Lỗ</div>
            <div style={{ fontSize: '14px', fontWeight: 900, color: metrics.totalPnL >= 0 ? '#004D1A' : '#93000A' }}>
              {formatVND(metrics.totalPnL)} ({formatPercent(metrics.totalPnLPercent)})
            </div>
          </div>
        </div>
      </div>

      {/* Holdings Mobile Cards */}
      <div className="m3-card-white">
        <h3 style={{ fontSize: '15px', fontWeight: 800, marginBottom: '12px' }}>
          Danh Sách CCQ Đang Nắm Giữ ({holdings.length})
        </h3>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {holdings.length > 0 ? (
            holdings.map((h) => (
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
                        width: '38px',
                        height: '38px',
                        borderRadius: '12px',
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
                      <div style={{ fontSize: '14px', fontWeight: 900, color: '#1F1F1F' }}>{h.fundCode}</div>
                      <div style={{ fontSize: '11px', color: '#74777F' }}>{h.fundName}</div>
                    </div>
                  </div>

                  <span className="badge-neutral" style={{ fontSize: '10px' }}>
                    {h.category}
                  </span>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', fontSize: '12px', borderTop: '1px solid #E1E7F0', paddingTop: '8px' }}>
                  <div>
                    <span style={{ color: '#74777F' }}>Số lượng: </span>
                    <strong>{h.totalUnits.toLocaleString('vi-VN')} CCQ</strong>
                  </div>
                  <div>
                    <span style={{ color: '#74777F' }}>Giá vốn BQ: </span>
                    <strong>{formatVND(h.avgCostBasis)}</strong>
                  </div>
                  <div>
                    <span style={{ color: '#74777F' }}>NAV hiện tại: </span>
                    <strong>{formatVND(h.currentNav)}</strong>
                  </div>
                  <div>
                    <span style={{ color: '#74777F' }}>Tỷ trọng: </span>
                    <strong>{h.weightPercent.toFixed(1)}%</strong>
                  </div>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid #E1E7F0', paddingTop: '8px' }}>
                  <div>
                    <div style={{ fontSize: '11px', color: '#74777F' }}>Giá trị thị trường</div>
                    <div style={{ fontSize: '15px', fontWeight: 900, color: '#1F1F1F' }}>{formatVND(h.currentValue)}</div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: '11px', color: '#74777F' }}>Lãi / Lỗ</div>
                    <span className={h.unrealizedPnL >= 0 ? 'badge-positive' : 'badge-negative'}>
                      {h.unrealizedPnL >= 0 ? '+' : ''}
                      {formatVND(h.unrealizedPnL)} ({formatPercent(h.unrealizedPnLPercent)})
                    </span>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div style={{ textAlign: 'center', padding: '32px 0', color: '#74777F', fontSize: '13px' }}>
              Chưa có giao dịch CCQ nào trong danh mục này.
            </div>
          )}
        </div>
      </div>

      {/* Add Portfolio Modal */}
      {isAddPortModalOpen && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0,0,0,0.4)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
            padding: '20px',
          }}
        >
          <div className="m3-card-white" style={{ width: '100%', maxWidth: '420px', padding: '24px' }}>
            <h2 style={{ fontSize: '18px', fontWeight: 900, color: '#0B57D0', marginBottom: '14px' }}>Tạo Danh Mục Mới</h2>
            <form onSubmit={handleCreatePortfolio} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div className="m3-form-group">
                <label className="m3-form-label">Tên danh mục</label>
                <input
                  type="text"
                  required
                  placeholder="VD: Quỹ Đầu Tư Ngắn Hạn..."
                  value={newPortName}
                  onChange={(e) => setNewPortName(e.target.value)}
                  className="m3-input"
                />
              </div>

              <div className="m3-form-group">
                <label className="m3-form-label">Mô tả ngắn</label>
                <textarea
                  placeholder="Mô tả chiến lược danh mục..."
                  value={newPortDesc}
                  onChange={(e) => setNewPortDesc(e.target.value)}
                  className="m3-textarea"
                  style={{ height: '70px' }}
                />
              </div>

              <div style={{ display: 'flex', gap: '10px', marginTop: '10px' }}>
                <button
                  type="button"
                  onClick={() => setIsAddPortModalOpen(false)}
                  className="m3-btn-outlined"
                  style={{ flex: 1 }}
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="m3-btn-filled"
                  style={{ flex: 1 }}
                >
                  Tạo Danh Mục
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
