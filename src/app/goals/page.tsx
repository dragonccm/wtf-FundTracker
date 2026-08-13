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
          <h1 style={{ fontSize: '22px', fontWeight: 900, color: '#E2E2E6' }}>Mục Tiêu Tài Chính</h1>
          <p style={{ fontSize: '13px', color: '#909299', marginTop: '2px' }}>
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
        {goals.map((g) => {
          const completionPct = Math.min(100, (g.currentAmount / g.targetAmount) * 100);
          const remainingAmount = Math.max(0, g.targetAmount - g.currentAmount);

          const today = new Date();
          const target = new Date(g.targetDate);
          const monthsLeft = Math.max(1, (target.getFullYear() - today.getFullYear()) * 12 + (target.getMonth() - today.getMonth()));
          const monthlyRequired = remainingAmount / monthsLeft;
          const { badgeClass, icon } = getCategoryIconBadge(g.category);

          return (
            <div key={g.id} className="m3-card-dark" style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <div className={badgeClass}>
                    <span className="material-symbols-outlined" style={{ fontSize: '22px' }}>
                      {icon}
                    </span>
                  </div>
                  <div>
                    <h3 style={{ fontSize: '15px', fontWeight: 800, color: '#E2E2E6' }}>{g.name}</h3>
                    <span style={{ fontSize: '11px', color: '#909299' }}>
                      Hạn: {g.targetDate} ({monthsLeft} tháng)
                    </span>
                  </div>
                </div>

                <button
                  onClick={() => {
                    if (confirm('Xóa mục tiêu này?')) deleteGoal(g.id);
                  }}
                  style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#909299' }}
                >
                  <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>delete</span>
                </button>
              </div>

              {/* Progress Bar */}
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', marginBottom: '6px' }}>
                  <span style={{ fontWeight: 600, color: '#909299' }}>Tiến độ tích lũy</span>
                  <span style={{ fontWeight: 900, color: '#A8C7FA' }}>{completionPct.toFixed(1)}%</span>
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
                      width: `${completionPct}%`,
                      backgroundColor: '#A8C7FA',
                      borderRadius: '4px',
                    }}
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', padding: '10px 12px', borderRadius: '14px', backgroundColor: '#191B1F' }}>
                <div>
                  <div style={{ fontSize: '11px', color: '#909299' }}>Đã tích lũy</div>
                  <div style={{ fontSize: '14px', fontWeight: 900, color: '#85D397' }}>{formatVND(g.currentAmount)}</div>
                </div>
                <div>
                  <div style={{ fontSize: '11px', color: '#909299' }}>Mục tiêu</div>
                  <div style={{ fontSize: '14px', fontWeight: 900, color: '#E2E2E6' }}>{formatVND(g.targetAmount)}</div>
                </div>
              </div>

              <div style={{ fontSize: '11px', color: '#909299', borderTop: '1px solid #282B31', paddingTop: '8px' }}>
                Cần tích lũy khoảng <strong style={{ color: '#E2E2E6' }}>{formatVND(monthlyRequired)}/tháng</strong> để đạt đúng hạn.
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
            backgroundColor: 'rgba(0,0,0,0.7)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
            padding: '20px',
          }}
        >
          <div className="m3-card-dark" style={{ width: '100%', maxWidth: '440px', padding: '24px' }}>
            <h2 style={{ fontSize: '18px', fontWeight: 800, color: '#E2E2E6', marginBottom: '16px' }}>Thêm Mục Tiêu Mới</h2>
            <form onSubmit={handleCreateGoal} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div className="m3-form-group">
                <label className="m3-form-label">Tên mục tiêu</label>
                <input
                  type="text"
                  required
                  placeholder="VD: Mua nhà căn hộ, Quỹ hưu trí..."
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="m3-input"
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div className="m3-form-group">
                  <label className="m3-form-label">Phân loại</label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value as GoalCategory)}
                    className="m3-select"
                  >
                    <option value="HOUSE">Mua nhà</option>
                    <option value="EDUCATION">Học phí</option>
                    <option value="RETIREMENT">Hưu trí</option>
                    <option value="CAR">Mua xe</option>
                    <option value="EMERGENCY">Dự phòng</option>
                    <option value="OTHER">Mục tiêu khác</option>
                  </select>
                </div>

                <div className="m3-form-group">
                  <label className="m3-form-label">Hạn hoàn thành</label>
                  <input
                    type="date"
                    required
                    value={targetDate}
                    onChange={(e) => setTargetDate(e.target.value)}
                    className="m3-input"
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div className="m3-form-group">
                  <label className="m3-form-label">Mục tiêu (VND)</label>
                  <input
                    type="number"
                    required
                    value={targetAmount}
                    onChange={(e) => setTargetAmount(e.target.value)}
                    className="m3-input"
                  />
                </div>

                <div className="m3-form-group">
                  <label className="m3-form-label">Đã có (VND)</label>
                  <input
                    type="number"
                    value={currentAmount}
                    onChange={(e) => setCurrentAmount(e.target.value)}
                    className="m3-input"
                  />
                </div>
              </div>

              <div className="m3-form-group">
                <label className="m3-form-label">Ghi chú</label>
                <input
                  type="text"
                  placeholder="Ghi chú chi tiết..."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="m3-input"
                />
              </div>

              <div style={{ display: 'flex', gap: '12px', marginTop: '12px' }}>
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
