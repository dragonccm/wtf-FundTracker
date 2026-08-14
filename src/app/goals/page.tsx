'use client';

import React, { useState } from 'react';
import { useAppStore } from '@/lib/store/appStore';
import { formatVND } from '@/lib/finance/portfolio';
import { GoalCategory } from '@/types';

export default function GoalsPage() {
  const { goals, addGoal, deleteGoal } = useAppStore();
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  const [name, setName] = useState('');
  const [category, setCategory] = useState<GoalCategory>('HOUSE');
  const [targetAmount, setTargetAmount] = useState('1000000000');
  const [currentAmount, setCurrentAmount] = useState('100000000');
  const [targetDate, setTargetDate] = useState('2030-12-31');
  const [notes, setNotes] = useState('');

  const handleCreateGoal = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    addGoal({
      name,
      category,
      targetAmount: parseFloat(targetAmount) || 0,
      currentAmount: parseFloat(currentAmount) || 0,
      targetDate,
      notes,
    });

    setName('');
    setIsAddModalOpen(false);
  };

  const getCategoryIconBadge = (cat: GoalCategory) => {
    switch (cat) {
      case 'HOUSE':
        return { badgeClass: 'm3-icon-badge-blue', icon: 'home' };
      case 'RETIREMENT':
        return { badgeClass: 'm3-icon-badge-purple', icon: 'elderly' };
      case 'EDUCATION':
        return { badgeClass: 'm3-icon-badge-orange', icon: 'school' };
      case 'CAR':
        return { badgeClass: 'm3-icon-badge-cyan', icon: 'directions_car' };
      case 'EMERGENCY':
        return { badgeClass: 'm3-icon-badge-pink', icon: 'medical_services' };
      default:
        return { badgeClass: 'm3-icon-badge-green', icon: 'savings' };
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <h1 style={{ fontSize: '22px', fontWeight: 900, color: 'var(--md-sys-color-on-surface)' }}>Mục Tiêu Tài Chính</h1>
          <p style={{ fontSize: '13px', color: 'var(--md-sys-color-on-surface-variant)', marginTop: '2px' }}>
            Đặt mục tiêu mua nhà, hưu trí, học phí cho con và theo dõi tiến độ
          </p>
        </div>

        <button
          onClick={() => setIsAddModalOpen(true)}
          className="m3-pill-btn-primary"
        >
          <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>add_task</span>
          Thêm Mục Tiêu
        </button>
      </div>

      {/* Goal Cards List */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
        {goals.length === 0 ? (
          <div className="m3-card" style={{ textAlign: 'center', padding: '36px 16px' }}>
            <span className="material-symbols-outlined" style={{ fontSize: '44px', color: 'var(--md-sys-color-outline)' }}>
              flag
            </span>
            <h3 style={{ marginTop: '10px', fontSize: '15px', fontWeight: 800, color: 'var(--md-sys-color-on-surface)' }}>
              Chưa Có Mục Tiêu Tài Chính
            </h3>
            <p style={{ marginTop: '4px', fontSize: '12px', color: 'var(--md-sys-color-on-surface-variant)', maxWidth: '320px', margin: '6px auto 16px auto' }}>
              Hãy đặt mục tiêu mua nhà, hưu trí hoặc quỹ khẩn cấp để theo dõi tiến độ tích lũy chứng chỉ quỹ.
            </p>
            <button
              type="button"
              onClick={() => setIsAddModalOpen(true)}
              className="m3-btn-filled"
              style={{ margin: '0 auto', display: 'inline-flex' }}
            >
              <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>add</span>
              Tạo Mục Tiêu Ngay
            </button>
          </div>
        ) : (
          goals.map((g) => {
          const completionPct = Math.min(100, (g.currentAmount / g.targetAmount) * 100);
          const remainingAmount = Math.max(0, g.targetAmount - g.currentAmount);

          const today = new Date();
          const target = new Date(g.targetDate);
          const monthsLeft = Math.max(1, (target.getFullYear() - today.getFullYear()) * 12 + (target.getMonth() - today.getMonth()));
          const monthlyRequired = remainingAmount / monthsLeft;
          const { badgeClass, icon } = getCategoryIconBadge(g.category);

          return (
            <div key={g.id} className="m3-card" style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <div className={badgeClass}>
                    <span className="material-symbols-outlined" style={{ fontSize: '22px' }}>
                      {icon}
                    </span>
                  </div>
                  <div>
                    <h3 style={{ fontSize: '16px', fontWeight: 900, color: 'var(--md-sys-color-on-surface)' }}>{g.name}</h3>
                    <span style={{ fontSize: '11px', color: 'var(--md-sys-color-on-surface-variant)' }}>
                      Hạn: {g.targetDate} ({monthsLeft} tháng)
                    </span>
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span style={{ fontSize: '16px', fontWeight: 900, color: 'var(--md-sys-color-primary)' }}>
                    {completionPct.toFixed(1)}%
                  </span>
                  <button
                    onClick={() => {
                      if (confirm('Bạn có muốn xóa mục tiêu này?')) {
                        deleteGoal(g.id);
                      }
                    }}
                    style={{
                      background: 'none',
                      border: 'none',
                      color: 'var(--md-sys-color-outline)',
                      cursor: 'pointer',
                      padding: '4px',
                    }}
                  >
                    <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>delete</span>
                  </button>
                </div>
              </div>

              {/* Progress Bar */}
              <div className="m3-progress-bar-bg">
                <div
                  className="m3-progress-bar-fill"
                  style={{ width: `${completionPct}%` }}
                />
              </div>

              {/* Stats Row */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', backgroundColor: 'var(--md-sys-color-surface-container-low)', padding: '10px 12px', borderRadius: '14px', border: '1px solid var(--md-sys-color-outline-variant)' }}>
                <div>
                  <div style={{ fontSize: '10px', color: 'var(--md-sys-color-on-surface-variant)' }}>Đã tích lũy</div>
                  <div style={{ fontSize: '14px', fontWeight: 800, color: 'var(--md-sys-color-on-surface)' }}>{formatVND(g.currentAmount)}</div>
                </div>
                <div>
                  <div style={{ fontSize: '10px', color: 'var(--md-sys-color-on-surface-variant)' }}>Mục tiêu</div>
                  <div style={{ fontSize: '14px', fontWeight: 800, color: 'var(--md-sys-color-on-surface)' }}>{formatVND(g.targetAmount)}</div>
                </div>
                <div>
                  <div style={{ fontSize: '10px', color: 'var(--md-sys-color-on-surface-variant)' }}>Còn thiếu</div>
                  <div style={{ fontSize: '13px', fontWeight: 700, color: '#BA1A1A' }}>{formatVND(remainingAmount)}</div>
                </div>
                <div>
                  <div style={{ fontSize: '10px', color: 'var(--md-sys-color-on-surface-variant)' }}>Cần nạp / tháng</div>
                  <div style={{ fontSize: '13px', fontWeight: 700, color: 'var(--md-sys-color-primary)' }}>{formatVND(monthlyRequired)}</div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Add Goal Modal */}
      {isAddModalOpen && (
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
          <div className="m3-card" style={{ width: '100%', maxWidth: '440px', padding: '24px 20px' }}>
            <h2 style={{ fontSize: '18px', fontWeight: 900, color: 'var(--md-sys-color-on-surface)', marginBottom: '14px' }}>
              Thêm Mục Tiêu Tài Chính
            </h2>
            <form onSubmit={handleCreateGoal} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div className="m3-form-group">
                <label className="m3-form-label">Tên mục tiêu</label>
                <input
                  type="text"
                  required
                  placeholder="VD: Mua nhà Vinhome, Quỹ hưu trí..."
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="m3-input"
                />
              </div>

              <div className="m3-form-group">
                <label className="m3-form-label">Phân loại</label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value as GoalCategory)}
                  className="m3-select"
                >
                  <option value="HOUSE">Mua nhà (House)</option>
                  <option value="RETIREMENT">Hưu trí (Retirement)</option>
                  <option value="EDUCATION">Học vấn con cái (Education)</option>
                  <option value="CAR">Mua xe (Car)</option>
                  <option value="EMERGENCY">Quỹ khẩn cấp (Emergency)</option>
                  <option value="OTHER">Mục tiêu khác (Other)</option>
                </select>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                <div className="m3-form-group">
                  <label className="m3-form-label">Số tiền mục tiêu</label>
                  <input
                    type="number"
                    value={targetAmount}
                    onChange={(e) => setTargetAmount(e.target.value)}
                    required
                    className="m3-input"
                  />
                </div>

                <div className="m3-form-group">
                  <label className="m3-form-label">Đã tích lũy sẵn</label>
                  <input
                    type="number"
                    value={currentAmount}
                    onChange={(e) => setCurrentAmount(e.target.value)}
                    required
                    className="m3-input"
                  />
                </div>
              </div>

              <div className="m3-form-group">
                <label className="m3-form-label">Hạn hoàn thành</label>
                <input
                  type="date"
                  value={targetDate}
                  onChange={(e) => setTargetDate(e.target.value)}
                  required
                  className="m3-input"
                />
              </div>

              <div style={{ display: 'flex', gap: '10px', marginTop: '6px' }}>
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
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
                  Lưu Mục Tiêu
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
