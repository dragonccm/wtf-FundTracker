'use client';

import React, { useState } from 'react';
import { useAppStore } from '@/lib/store/appStore';
import { Currency, DateFormat } from '@/types';

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
      {/* Header */}
      <div>
        <h1 style={{ fontSize: '22px', fontWeight: 900, color: '#1F1F1F' }}>Cài Đặt Tài Khoản</h1>
        <p style={{ fontSize: '13px', color: '#74777F', marginTop: '2px' }}>
          Quản lý hồ sơ cá nhân và cấu hình ứng dụng
        </p>
      </div>

      {/* Google Account Profile Card */}
      <div className="m3-card-white">
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px', marginBottom: '16px' }}>
          <div
            style={{
              width: '52px',
              height: '52px',
              borderRadius: '50%',
              overflow: 'hidden',
              border: '2px solid #D3E3FD',
            }}
          >
            <img
              src={user.avatarUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100'}
              alt={user.name}
              style={{ width: '100%', height: '100%', objectFit: 'cover' }}
            />
          </div>
          <div>
            <div style={{ fontSize: '16px', fontWeight: 900, color: '#1F1F1F' }}>{user.name}</div>
            <div style={{ fontSize: '12px', color: '#74777F' }}>{user.email}</div>
          </div>
        </div>

        <form onSubmit={handleSaveProfile} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <div className="m3-form-group">
            <label className="m3-form-label">Họ và tên</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              className="m3-input"
            />
          </div>

          <div className="m3-form-group">
            <label className="m3-form-label">Email tài khoản</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="m3-input"
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
            <div className="m3-form-group">
              <label className="m3-form-label">Tiền tệ mặc định</label>
              <select
                value={currency}
                onChange={(e) => setCurrency(e.target.value as Currency)}
                className="m3-select"
              >
                <option value="VND">VNĐ - Việt Nam Đồng</option>
                <option value="USD">USD - Đô la Mỹ</option>
              </select>
            </div>

            <div className="m3-form-group">
              <label className="m3-form-label">Định dạng ngày</label>
              <select
                value={dateFormat}
                onChange={(e) => setDateFormat(e.target.value as DateFormat)}
                className="m3-select"
              >
                <option value="DD/MM/YYYY">DD/MM/YYYY (25/12/2026)</option>
                <option value="YYYY-MM-DD">YYYY-MM-DD (2026-12-25)</option>
              </select>
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '6px' }}>
            <button
              type="submit"
              className="m3-btn-filled"
            >
              Lưu Thay Đổi
            </button>
          </div>
        </form>
      </div>

      {/* Data Reset Section - M3 Error Tonal */}
      <div className="m3-card-white" style={{ borderColor: '#FFDAD6', backgroundColor: '#FFF8F7' }}>
        <h3 style={{ fontSize: '15px', fontWeight: 900, color: '#B3261E', marginBottom: '4px' }}>
          Quản Lý Dữ Liệu
        </h3>
        <p style={{ fontSize: '12px', color: '#74777F', marginBottom: '12px' }}>
          Khôi phục lại dữ liệu thử nghiệm ban đầu (VESAF, DCBC, SSISCA...).
        </p>

        <button
          onClick={() => {
            if (confirm('Khôi phục dữ liệu mẫu sẽ thay thế toàn bộ giao dịch hiện tại. Tiếp tục?')) {
              resetToSampleData();
              alert('Đã khôi phục dữ liệu mẫu thành công!');
            }
          }}
          className="m3-btn-outlined"
          style={{ borderColor: '#B3261E', color: '#B3261E' }}
        >
          <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>restart_alt</span>
          Khôi Phục Dữ Liệu Mẫu
        </button>
      </div>
    </div>
  );
}
