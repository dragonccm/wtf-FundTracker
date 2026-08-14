'use client';

import React, { useState } from 'react';
import { useAppStore } from '@/lib/store/appStore';
import { TransactionType } from '@/types';

export default function AddTransactionModal({ onClose }: { onClose: () => void }) {
  const { funds, portfolios, addTransaction, activePortfolioId } = useAppStore();

  const [portfolioId, setPortfolioId] = useState<string>(
    activePortfolioId !== 'ALL' ? activePortfolioId : portfolios[0]?.id || 'p_main'
  );
  const [fundCode, setFundCode] = useState<string>(funds[0]?.code || 'VESAF');
  const [type, setType] = useState<TransactionType>('BUY');
  const [date, setDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [amount, setAmount] = useState<string>('10000000');
  const [unitPrice, setUnitPrice] = useState<string>(
    funds.find((f) => f.code === funds[0]?.code)?.nav.toString() || '28000'
  );
  const [units, setUnits] = useState<string>('');
  const [fee, setFee] = useState<string>('30000');
  const [notes, setNotes] = useState<string>('');

  const handleAmountChange = (val: string) => {
    setAmount(val);
    const numAmount = parseFloat(val) || 0;
    const numPrice = parseFloat(unitPrice) || 0;
    if (numPrice > 0) {
      setUnits((numAmount / numPrice).toFixed(2));
    }
  };

  const handleUnitPriceChange = (val: string) => {
    setUnitPrice(val);
    const numPrice = parseFloat(val) || 0;
    const numAmount = parseFloat(amount) || 0;
    if (numPrice > 0) {
      setUnits((numAmount / numPrice).toFixed(2));
    }
  };

  const handleFundChange = (code: string) => {
    setFundCode(code);
    const selectedFund = funds.find((f) => f.code === code);
    if (selectedFund) {
      setUnitPrice(selectedFund.nav.toString());
      const numAmount = parseFloat(amount) || 0;
      if (selectedFund.nav > 0) {
        setUnits((numAmount / selectedFund.nav).toFixed(2));
      }
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const selectedFund = funds.find((f) => f.code === fundCode);
    const parsedAmount = parseFloat(amount) || 0;
    const parsedPrice = parseFloat(unitPrice) || 0;
    const parsedUnits = parseFloat(units) || (parsedPrice > 0 ? parsedAmount / parsedPrice : 0);
    const parsedFee = parseFloat(fee) || 0;

    addTransaction({
      portfolioId,
      fundId: selectedFund?.id || 'f_' + fundCode.toLowerCase(),
      fundCode,
      type,
      date,
      amount: parsedAmount,
      unitPrice: parsedPrice,
      units: parsedUnits,
      fee: parsedFee,
      notes,
    });

    onClose();
  };

  return (
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
        zIndex: 1000,
        padding: '16px',
      }}
    >
      <div
        style={{
          width: '100%',
          maxWidth: '440px',
          backgroundColor: 'var(--md-sys-color-surface)',
          borderRadius: '28px',
          border: '1px solid var(--md-sys-color-outline-variant)',
          boxShadow: 'var(--md-sys-elevation-4)',
          padding: '24px 20px',
          display: 'flex',
          flexDirection: 'column',
          gap: '16px',
        }}
      >
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <h2 style={{ fontSize: '18px', fontWeight: 500, color: 'var(--md-sys-color-on-surface)' }}>
              Ghi Nhận Giao Dịch Mới
            </h2>
            <p style={{ fontSize: '12px', color: 'var(--md-sys-color-on-surface-variant)' }}>Thêm lệnh mua/bán chứng chỉ quỹ</p>
          </div>
          <button
            onClick={onClose}
            style={{
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              color: 'var(--md-sys-color-on-surface-variant)',
              padding: '4px',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <span className="material-symbols-outlined" style={{ fontSize: '20px' }}>close</span>
          </button>
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {/* M3 Segmented Control for Transaction Type */}
          <div className="m3-segmented-control">
            <button
              type="button"
              onClick={() => setType('BUY')}
              className={`m3-segment-btn ${type === 'BUY' ? 'active' : ''}`}
              style={{
                backgroundColor: type === 'BUY' ? 'var(--md-sys-color-primary-container)' : 'transparent',
                color: type === 'BUY' ? 'var(--md-sys-color-on-primary-container)' : 'var(--md-sys-color-on-surface-variant)',
              }}
            >
              <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>
                add_circle
              </span>
              MUA CCQ
            </button>
            <button
              type="button"
              onClick={() => setType('SELL')}
              className={`m3-segment-btn ${type === 'SELL' ? 'active' : ''}`}
              style={{
                backgroundColor: type === 'SELL' ? 'var(--md-sys-color-error-container)' : 'transparent',
                color: type === 'SELL' ? 'var(--md-sys-color-on-error-container)' : 'var(--md-sys-color-on-surface-variant)',
              }}
            >
              <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>
                remove_circle
              </span>
              BÁN CCQ
            </button>
          </div>

          {/* Form Fields in M3 Outlined Group */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
            <div className="m3-form-group">
              <label className="m3-form-label">Danh mục</label>
              <select
                value={portfolioId}
                onChange={(e) => setPortfolioId(e.target.value)}
                className="m3-select"
              >
                {portfolios.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="m3-form-group">
              <label className="m3-form-label">Chứng chỉ quỹ</label>
              <select
                value={fundCode}
                onChange={(e) => handleFundChange(e.target.value)}
                className="m3-select"
              >
                {funds.map((f) => (
                  <option key={f.id} value={f.code}>
                    {f.code}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
            <div className="m3-form-group">
              <label className="m3-form-label">Ngày giao dịch</label>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                required
                className="m3-input"
              />
            </div>

            <div className="m3-form-group">
              <label className="m3-form-label">Tổng số tiền (VND)</label>
              <input
                type="number"
                value={amount}
                onChange={(e) => handleAmountChange(e.target.value)}
                required
                className="m3-input"
              />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '8px' }}>
            <div className="m3-form-group">
              <label className="m3-form-label">Giá NAV</label>
              <input
                type="number"
                step="0.01"
                value={unitPrice}
                onChange={(e) => handleUnitPriceChange(e.target.value)}
                required
                className="m3-input"
              />
            </div>

            <div className="m3-form-group">
              <label className="m3-form-label">Số CCQ</label>
              <input
                type="number"
                step="0.01"
                value={units}
                onChange={(e) => setUnits(e.target.value)}
                required
                className="m3-input"
              />
            </div>

            <div className="m3-form-group">
              <label className="m3-form-label">Phí (VND)</label>
              <input
                type="number"
                value={fee}
                onChange={(e) => setFee(e.target.value)}
                className="m3-input"
              />
            </div>
          </div>

          <div className="m3-form-group">
            <label className="m3-form-label">Ghi chú</label>
            <input
              type="text"
              placeholder="VD: Mua tích lũy định kỳ..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="m3-input"
            />
          </div>

          {/* Action Buttons */}
          <div style={{ display: 'flex', gap: '10px', marginTop: '6px' }}>
            <button
              type="button"
              onClick={onClose}
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
              Lưu Giao Dịch
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
