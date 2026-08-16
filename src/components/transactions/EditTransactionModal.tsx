'use client';

import React, { useState } from 'react';
import { useAppStore } from '@/lib/store/appStore';
import { Transaction, TransactionType } from '@/types';
import { useToast } from '@/components/feedback/ToastProvider';
import { formatInputCurrency, parseInputCurrency } from '@/lib/finance/portfolio';

interface EditTransactionModalProps {
  transaction: Transaction;
  onClose: () => void;
}

export default function EditTransactionModal({ transaction, onClose }: EditTransactionModalProps) {
  const { funds, portfolios, goals, updateTransaction } = useAppStore();
  const { showToast } = useToast();

  const [portfolioId, setPortfolioId] = useState<string>(transaction.portfolioId);
  const [fundCode, setFundCode] = useState<string>(transaction.fundCode);
  const [goalId, setGoalId] = useState<string>(transaction.goalId || '');
  const [type, setType] = useState<TransactionType>(transaction.type);
  const [date, setDate] = useState<string>(transaction.date);
  const [amount, setAmount] = useState<string>(formatInputCurrency(transaction.amount));
  const [unitPrice, setUnitPrice] = useState<string>(formatInputCurrency(transaction.unitPrice));
  const [units, setUnits] = useState<string>(String(transaction.units));
  const [fee, setFee] = useState<string>(formatInputCurrency(transaction.fee || 0));
  const [notes, setNotes] = useState<string>(transaction.notes || '');

  const handleAmountChange = (val: string) => {
    const formatted = formatInputCurrency(val);
    setAmount(formatted);
    const numAmount = parseInputCurrency(formatted);
    const numPrice = parseInputCurrency(unitPrice);
    if (numPrice > 0) {
      setUnits((numAmount / numPrice).toFixed(2));
    }
  };

  const handleUnitPriceChange = (val: string) => {
    const formatted = formatInputCurrency(val);
    setUnitPrice(formatted);
    const numPrice = parseInputCurrency(formatted);
    const numAmount = parseInputCurrency(amount);
    if (numPrice > 0) {
      setUnits((numAmount / numPrice).toFixed(2));
    }
  };

  const handleUnitsChange = (val: string) => {
    setUnits(val);
    const numUnits = parseFloat(String(val).replace(',', '.')) || 0;
    const numPrice = parseInputCurrency(unitPrice);
    if (numUnits > 0 && numPrice > 0) {
      setAmount(formatInputCurrency(Math.round(numUnits * numPrice)));
    }
  };

  const handleFundChange = (code: string) => {
    setFundCode(code);
    const selectedFund = funds.find((f) => f.code === code);
    if (selectedFund) {
      const formattedNav = formatInputCurrency(selectedFund.nav);
      setUnitPrice(formattedNav);
      const numAmount = parseInputCurrency(amount);
      if (selectedFund.nav > 0) {
        setUnits((numAmount / selectedFund.nav).toFixed(2));
      }
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const selectedFund = funds.find((f) => f.code === fundCode);
    const parsedAmount = parseInputCurrency(amount);
    const parsedPrice = parseInputCurrency(unitPrice);
    const parsedUnits = parseFloat(String(units).replace(',', '.')) || (parsedPrice > 0 ? parsedAmount / parsedPrice : 0);
    const parsedFee = parseInputCurrency(fee);

    if (!portfolioId) {
      showToast('error', 'Hãy chọn danh mục.');
      return;
    }
    if (parsedAmount <= 0 || parsedPrice <= 0 || parsedUnits <= 0) {
      showToast('error', 'Số tiền, NAV và số CCQ phải lớn hơn 0.');
      return;
    }

    updateTransaction(transaction.id, {
      portfolioId,
      fundId: selectedFund?.id || transaction.fundId,
      fundCode,
      type,
      date,
      amount: parsedAmount,
      unitPrice: parsedPrice,
      units: parsedUnits,
      fee: parsedFee,
      goalId: goalId || undefined,
      notes,
    });

    showToast('success', 'Đã cập nhật giao dịch.');
    onClose();
  };

  return (
    <div
      className="journal-scrim"
      onClick={onClose}
    >
      <div
        className="journal-sheet"
        style={{
          width: 'min(100%, 540px)',
          maxHeight: '90vh',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
          <h2 style={{ fontSize: '18px', fontWeight: 500, color: 'var(--md-sys-color-on-surface)' }}>
            Chỉnh Sửa Giao Dịch CCQ
          </h2>
          <button
            type="button"
            onClick={onClose}
            style={{
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              color: 'var(--md-sys-color-on-surface-variant)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '4px',
            }}
          >
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {/* 1. Transaction Type Toggle */}
          <div className="m3-segmented-group" style={{ width: '100%', display: 'flex' }}>
            <button
              type="button"
              onClick={() => setType('BUY')}
              className={`m3-segmented-item ${type === 'BUY' ? 'active' : ''}`}
              style={{ flex: 1, justifyContent: 'center' }}
            >
              <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>
                {type === 'BUY' ? 'check' : 'add_circle'}
              </span>
              Mua CCQ
            </button>
            <button
              type="button"
              onClick={() => setType('SELL')}
              className={`m3-segmented-item ${type === 'SELL' ? 'active' : ''}`}
              style={{ flex: 1, justifyContent: 'center' }}
            >
              <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>
                {type === 'SELL' ? 'check' : 'remove_circle'}
              </span>
              Bán CCQ
            </button>
          </div>

          {/* 2. Portfolio and Fund Selection */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
            <div className="m3-form-group">
              <label className="m3-form-label">Danh mục (*)</label>
              <select
                value={portfolioId}
                onChange={(e) => setPortfolioId(e.target.value)}
                className="m3-select"
                required
              >
                {portfolios.map((p) => (
                  <option key={p.id} value={p.id}>{p.name}</option>
                ))}
              </select>
            </div>

            <div className="m3-form-group">
              <label className="m3-form-label">Mã Quỹ (*)</label>
              <select
                value={fundCode}
                onChange={(e) => handleFundChange(e.target.value)}
                className="m3-select"
                required
              >
                {funds.map((f) => (
                  <option key={f.id} value={f.code}>{f.code} - {f.name}</option>
                ))}
              </select>
            </div>
          </div>

          {/* 3. Goal Selection & Date */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
            <div className="m3-form-group">
              <label className="m3-form-label">Mục tiêu tài chính (Tùy chọn)</label>
              <select
                value={goalId}
                onChange={(e) => setGoalId(e.target.value)}
                className="m3-select"
              >
                <option value="">-- Không gán mục tiêu --</option>
                {goals.map((g) => (
                  <option key={g.id} value={g.id}>🎯 {g.name}</option>
                ))}
              </select>
            </div>

            <div className="m3-form-group">
              <label className="m3-form-label">Ngày giao dịch (*)</label>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                required
                className="m3-input"
              />
            </div>
          </div>

          {/* 4. Financial Figures (Amount, NAV, Units, Fee) */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
            <div className="m3-form-group">
              <label className="m3-form-label">Tổng số tiền (VND) (*)</label>
              <input
                type="text"
                inputMode="numeric"
                placeholder="10.000.000"
                value={amount}
                onChange={(e) => handleAmountChange(e.target.value)}
                required
                className="m3-input"
              />
            </div>

            <div className="m3-form-group">
              <label className="m3-form-label">Giá NAV khớp lệnh (VND)</label>
              <input
                type="text"
                inputMode="numeric"
                placeholder="28.000"
                value={unitPrice}
                onChange={(e) => handleUnitPriceChange(e.target.value)}
                required
                className="m3-input"
              />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
            <div className="m3-form-group">
              <label className="m3-form-label">Số CCQ</label>
              <input
                type="number"
                step="any"
                placeholder="0.00"
                value={units}
                onChange={(e) => handleUnitsChange(e.target.value)}
                required
                className="m3-input"
              />
            </div>

            <div className="m3-form-group">
              <label className="m3-form-label">Phí giao dịch (VND)</label>
              <input
                type="text"
                inputMode="numeric"
                placeholder="30.000"
                value={fee}
                onChange={(e) => setFee(formatInputCurrency(e.target.value))}
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
              Lưu Thay Đổi
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
