'use client';

import React, { useState } from 'react';
import { useAppStore } from '@/lib/store/appStore';
import { Currency, DateFormat } from '@/types';
import M3SearchBar from '@/components/search/M3SearchBar';

export default function SettingsPage() {
  const { user, updateProfile, resetToSampleData } = useAppStore();

  const [name, setName] = useState(user.name);
  const [email, setEmail] = useState(user.email);
  const [currency, setCurrency] = useState<Currency>(user.currency);
  const [dateFormat, setDateFormat] = useState<DateFormat>(user.dateFormat);

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    updateProfile({
      name,
      email,
      currency,
      dateFormat,
    });
    alert('Đã cập nhật cài đặt thành công!');
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      {/* 1. M3 Search Bar */}
      <M3SearchBar placeholder="Tìm kiếm cài đặt, quỹ, giao dịch..." />

      {/* 2. User Account Card */}
      <div
        className="m3-card"
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '14px',
          padding: '16px',
        }}
      >
        <div
          style={{
            width: '48px',
            height: '48px',
            borderRadius: '50%',
            overflow: 'hidden',
            border: '2px solid var(--md-sys-color-outline-variant)',
          }}
        >
          <img
            src={user.avatarUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100'}
            alt={user.name}
            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
          />
        </div>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: '16px', fontWeight: 900, color: 'var(--md-sys-color-on-surface)' }}>{user.name}</div>
          <div style={{ fontSize: '12px', color: 'var(--md-sys-color-on-surface-variant)' }}>{user.email} • Google Account</div>
        </div>
      </div>

      {/* 3. Grouped Settings Section: Account & Display */}
      <div className="m3-card" style={{ padding: '16px' }}>
        <form onSubmit={handleSaveProfile} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          {/* Item 1: Name */}
          <div className="m3-form-group">
            <label className="m3-form-label">Họ và tên</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="m3-input"
            />
          </div>

          {/* Item 2: Email */}
          <div className="m3-form-group">
            <label className="m3-form-label">Email tài khoản</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="m3-input"
            />
          </div>

          {/* Item 3: Currency */}
          <div className="m3-form-group">
            <label className="m3-form-label">Đơn vị tiền tệ chính</label>
            <div className="m3-segmented-control">
              {(['VND', 'USD'] as Currency[]).map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => setCurrency(c)}
                  className={`m3-segment-btn ${currency === c ? 'active' : ''}`}
                >
                  {c}
                </button>
              ))}
            </div>
          </div>

          {/* Item 4: Date Format */}
          <div className="m3-form-group">
            <label className="m3-form-label">Định dạng ngày</label>
            <select
              value={dateFormat}
              onChange={(e) => setDateFormat(e.target.value as DateFormat)}
              className="m3-select"
            >
              <option value="DD/MM/YYYY">DD/MM/YYYY (Việt Nam)</option>
              <option value="YYYY-MM-DD">YYYY-MM-DD (Quốc tế)</option>
            </select>
          </div>

          <button
            type="submit"
            className="m3-pill-btn-primary"
            style={{ width: '100%', marginTop: '6px' }}
          >
            Lưu Thay Đổi Cài Đặt
          </button>
        </form>
      </div>

      {/* 4. Danger Zone: Reset Data */}
      <div className="m3-card" style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
        <h3 style={{ fontSize: '15px', fontWeight: 900, color: '#BA1A1A' }}>
          Quản Trị Dữ Liệu
        </h3>
        <p style={{ fontSize: '12px', color: 'var(--md-sys-color-on-surface-variant)' }}>
          Khôi phục toàn bộ giao dịch, danh mục và mục tiêu về dữ liệu mẫu mặc định ban đầu.
        </p>

        <button
          type="button"
          onClick={() => {
            if (confirm('CẢNH BÁO: Tất cả giao dịch và thiết lập cá nhân của bạn sẽ bị xóa và thay thế bằng dữ liệu mẫu. Bạn có chắc chắn muốn khôi phục?')) {
              resetToSampleData();
              alert('Đã khôi phục dữ liệu mẫu thành công!');
            }
          }}
          className="m3-pill-btn-danger"
          style={{ width: '100%' }}
        >
          <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>restart_alt</span>
          Khôi Phục Dữ Liệu Mẫu
        </button>
      </div>
    </div>
  );
}
