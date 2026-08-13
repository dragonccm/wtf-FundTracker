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

  const getCategoryIcon = (cat: GoalCategory) => {
    switch (cat) {
      case 'HOUSE':
        return 'home';
      case 'RETIREMENT':
        return 'elderly';
      case 'EDUCATION':
        return 'school';
      case 'CAR':
        return 'directions_car';
      case 'EMERGENCY':
        return 'medical_services';
      default:
        return 'savings';
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <h1 style={{ fontSize: '22px', fontWeight: 900, color: '#1F1F1F' }}>Mục Tiêu Tài Chính</h1>
          <p style={{ fontSize: '13px', color: '#74777F', marginTop: '2px' }}>
            Đặt mục tiêu mua nhà, hưu trí, học phí cho con và theo dõi tiến độ
          </p>
        </div>

        <button
          onClick={() => setIsAddModalOpen(true)}
          style={{
            padding: '10px 16px',
            borderRadius: '16px',
            backgroundColor: '#0B57D0',
            color: '#FFFFFF',
            border: 'none',
            fontWeight: 800,
            fontSize: '13px',
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            cursor: 'pointer',
          }}
        >
          <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>add_task</span>
          Thêm Mục Tiêu
        </button>
      </div>

      {/* Goal Cards List */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        {goals.map((g) => {
          const completionPct = Math.min(100, (g.currentAmount / g.targetAmount) * 100);
          const remainingAmount = Math.max(0, g.targetAmount - g.currentAmount);

          const today = new Date();
          const target = new Date(g.targetDate);
          const monthsLeft = Math.max(1, (target.getFullYear() - today.getFullYear()) * 12 + (target.getMonth() - today.getMonth()));
          const monthlyRequired = remainingAmount / monthsLeft;

          return (
            <div key={g.id} className="m3-card-white" style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <div
                    style={{
                      width: '42px',
                      height: '42px',
                      borderRadius: '14px',
                      backgroundColor: 'var(--md-sys-color-primary-container)',
                      color: 'var(--md-sys-color-primary)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    <span className="material-symbols-outlined" style={{ fontSize: '22px' }}>
                      {getCategoryIcon(g.category)}
                    </span>
                  </div>
                  <div>
                    <h3 style={{ fontSize: '15px', fontWeight: 800, color: '#1F1F1F' }}>{g.name}</h3>
                    <span style={{ fontSize: '11px', color: '#74777F' }}>
                      Hạn: {g.targetDate} ({monthsLeft} tháng)
                    </span>
                  </div>
                </div>

                <button
                  onClick={() => {
                    if (confirm('Xóa mục tiêu này?')) deleteGoal(g.id);
                  }}
                  style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#74777F' }}
                >
                  <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>delete</span>
                </button>
              </div>

              {/* Progress Bar */}
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', marginBottom: '6px' }}>
                  <span style={{ fontWeight: 600, color: '#74777F' }}>Tiến độ tích lũy</span>
                  <span style={{ fontWeight: 900, color: '#0B57D0' }}>{completionPct.toFixed(1)}%</span>
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
                      width: `${completionPct}%`,
                      backgroundColor: '#0B57D0',
                      borderRadius: '4px',
                    }}
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', padding: '10px 12px', borderRadius: '14px', backgroundColor: '#F7F9FC', border: '1px solid #E1E7F0' }}>
                <div>
                  <div style={{ fontSize: '11px', color: '#74777F' }}>Đã tích lũy</div>
                  <div style={{ fontSize: '14px', fontWeight: 900, color: '#137333' }}>{formatVND(g.currentAmount)}</div>
                </div>
                <div>
                  <div style={{ fontSize: '11px', color: '#74777F' }}>Mục tiêu</div>
                  <div style={{ fontSize: '14px', fontWeight: 900, color: '#1F1F1F' }}>{formatVND(g.targetAmount)}</div>
                </div>
              </div>

              <div style={{ fontSize: '11px', color: '#74777F', borderTop: '1px solid #E1E7F0', paddingTop: '8px' }}>
                Cần tích lũy khoảng <strong style={{ color: '#1F1F1F' }}>{formatVND(monthlyRequired)}/tháng</strong> để đạt đúng hạn.
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
            backgroundColor: 'rgba(0,0,0,0.4)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
            padding: '20px',
          }}
        >
          <div className="m3-card-white" style={{ width: '100%', maxWidth: '440px', padding: '24px' }}>
            <h2 style={{ fontSize: '18px', fontWeight: 800, color: '#0B57D0', marginBottom: '16px' }}>Thêm Mục Tiêu Mới</h2>
            <form onSubmit={handleCreateGoal} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div>
                <label style={{ fontSize: '12px', fontWeight: 700, color: '#74777F' }}>Tên mục tiêu</label>
                <input
                  type="text"
                  required
                  placeholder="VD: Mua nhà căn hộ, Quỹ hưu trí..."
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  style={{ width: '100%', marginTop: '4px', padding: '10px', borderRadius: '10px', border: '1px solid #C4C6D0' }}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={{ fontSize: '12px', fontWeight: 700, color: '#74777F' }}>Phân loại</label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value as GoalCategory)}
                    style={{ width: '100%', marginTop: '4px', padding: '10px', borderRadius: '10px', border: '1px solid #C4C6D0' }}
                  >
                    <option value="HOUSE">Mua nhà</option>
                    <option value="EDUCATION">Học phí</option>
                    <option value="RETIREMENT">Hưu trí</option>
                    <option value="CAR">Mua xe</option>
                    <option value="EMERGENCY">Dự phòng</option>
                    <option value="OTHER">Mục tiêu khác</option>
                  </select>
                </div>

                <div>
                  <label style={{ fontSize: '12px', fontWeight: 700, color: '#74777F' }}>Hạn hoàn thành</label>
                  <input
                    type="date"
                    required
                    value={targetDate}
                    onChange={(e) => setTargetDate(e.target.value)}
                    style={{ width: '100%', marginTop: '4px', padding: '10px', borderRadius: '10px', border: '1px solid #C4C6D0' }}
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={{ fontSize: '12px', fontWeight: 700, color: '#74777F' }}>Mục tiêu (VND)</label>
                  <input
                    type="number"
                    required
                    value={targetAmount}
                    onChange={(e) => setTargetAmount(e.target.value)}
                    style={{ width: '100%', marginTop: '4px', padding: '10px', borderRadius: '10px', border: '1px solid #C4C6D0' }}
                  />
                </div>

                <div>
                  <label style={{ fontSize: '12px', fontWeight: 700, color: '#74777F' }}>Đã có (VND)</label>
                  <input
                    type="number"
                    value={currentAmount}
                    onChange={(e) => setCurrentAmount(e.target.value)}
                    style={{ width: '100%', marginTop: '4px', padding: '10px', borderRadius: '10px', border: '1px solid #C4C6D0' }}
                  />
                </div>
              </div>

              <div>
                <label style={{ fontSize: '12px', fontWeight: 700, color: '#74777F' }}>Ghi chú</label>
                <input
                  type="text"
                  placeholder="Ghi chú chi tiết..."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  style={{ width: '100%', marginTop: '4px', padding: '10px', borderRadius: '10px', border: '1px solid #C4C6D0' }}
                />
              </div>

              <div style={{ display: 'flex', gap: '12px', marginTop: '12px' }}>
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  style={{ flex: 1, padding: '10px', borderRadius: '10px', border: '1px solid #C4C6D0', background: 'none' }}
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  style={{ flex: 1, padding: '10px', borderRadius: '10px', border: 'none', backgroundColor: '#0B57D0', color: '#FFFFFF', fontWeight: 800 }}
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
