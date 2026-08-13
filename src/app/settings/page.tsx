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
  const [searchQuery, setSearchQuery] = useState('');

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
      {/* 1. Pixel Settings Search Bar (From Screenshot 1) */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
          padding: '12px 18px',
          borderRadius: '28px',
          backgroundColor: '#202328',
        }}
      >
        <span className="material-symbols-outlined" style={{ fontSize: '20px', color: '#909299' }}>
          search
        </span>
        <input
          type="text"
          placeholder="Tìm chế độ cài đặt"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          style={{
            background: 'none',
            border: 'none',
            outline: 'none',
            color: '#E2E2E6',
            fontSize: '14px',
            fontWeight: 600,
            width: '100%',
          }}
        />
      </div>

      {/* 2. User Account Card (From Screenshot 1 Top Item) */}
      <div
        className="m3-card-dark"
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '14px',
          padding: '16px',
        }}
      >
        <div
          style={{
            width: '46px',
            height: '46px',
            borderRadius: '50%',
            overflow: 'hidden',
            border: '2px solid #282B31',
          }}
        >
          <img
            src={user.avatarUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100'}
            alt={user.name}
            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
          />
        </div>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: '15px', fontWeight: 800, color: '#E2E2E6' }}>{user.name}</div>
          <div style={{ fontSize: '11px', color: '#909299' }}>{user.email} • Google Account</div>
        </div>
      </div>

      {/* 3. Grouped Settings Section: Account & Display (Screenshot 1 Style) */}
      <div className="m3-card-dark" style={{ padding: '8px 12px' }}>
        <form onSubmit={handleSaveProfile} style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {/* Item 1: Name */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '14px', padding: '10px 4px' }}>
            <div className="m3-icon-badge-blue">
              <span className="material-symbols-outlined">person</span>
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: '14px', fontWeight: 800, color: '#E2E2E6' }}>Họ và tên</div>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                style={{
                  width: '100%',
                  marginTop: '4px',
                  background: '#191B1F',
                  border: '1px solid #282B31',
                  borderRadius: '10px',
                  padding: '8px 12px',
                  color: '#E2E2E6',
                  fontSize: '13px',
                }}
              />
            </div>
          </div>

          <div style={{ height: '1px', backgroundColor: '#282B31' }} />

          {/* Item 2: Currency */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '14px', padding: '10px 4px' }}>
            <div className="m3-icon-badge-cyan">
              <span className="material-symbols-outlined">payments</span>
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: '14px', fontWeight: 800, color: '#E2E2E6' }}>Đơn vị tiền tệ</div>
              <select
                value={currency}
                onChange={(e) => setCurrency(e.target.value as Currency)}
                style={{
                  width: '100%',
                  marginTop: '4px',
                  background: '#191B1F',
                  border: '1px solid #282B31',
                  borderRadius: '10px',
                  padding: '8px 12px',
                  color: '#E2E2E6',
                  fontSize: '13px',
                }}
              >
                <option value="VND">VNĐ - Việt Nam Đồng</option>
                <option value="USD">USD - Đô la Mỹ</option>
              </select>
            </div>
          </div>

          <div style={{ height: '1px', backgroundColor: '#282B31' }} />

          {/* Item 3: Date Format */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '14px', padding: '10px 4px' }}>
            <div className="m3-icon-badge-purple">
              <span className="material-symbols-outlined">calendar_today</span>
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: '14px', fontWeight: 800, color: '#E2E2E6' }}>Định dạng ngày</div>
              <select
                value={dateFormat}
                onChange={(e) => setDateFormat(e.target.value as DateFormat)}
                style={{
                  width: '100%',
                  marginTop: '4px',
                  background: '#191B1F',
                  border: '1px solid #282B31',
                  borderRadius: '10px',
                  padding: '8px 12px',
                  color: '#E2E2E6',
                  fontSize: '13px',
                }}
              >
                <option value="DD/MM/YYYY">DD/MM/YYYY (25/12/2026)</option>
                <option value="YYYY-MM-DD">YYYY-MM-DD (2026-12-25)</option>
              </select>
            </div>
          </div>

          <div style={{ padding: '8px 0' }}>
            <button
              type="submit"
              className="m3-pill-btn-primary"
              style={{ width: '100%' }}
            >
              Lưu Cài Đặt
            </button>
          </div>
        </form>
      </div>

      {/* 4. Grouped Settings Section: Data & Reset (Screenshot 1 Style) */}
      <div className="m3-card-dark" style={{ padding: '8px 12px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px', padding: '10px 4px' }}>
          <div className="m3-icon-badge-pink">
            <span className="material-symbols-outlined">restart_alt</span>
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: '14px', fontWeight: 800, color: '#FFB4AB' }}>Khôi phục dữ liệu mẫu</div>
            <div style={{ fontSize: '11px', color: '#909299' }}>Nạp lại bộ dữ liệu thử nghiệm chuẩn</div>
          </div>
          <button
            onClick={() => {
              if (confirm('Khôi phục dữ liệu mẫu sẽ thay thế toàn bộ giao dịch hiện tại. Tiếp tục?')) {
                resetToSampleData();
                alert('Đã khôi phục dữ liệu mẫu thành công!');
              }
            }}
            className="m3-pill-btn"
            style={{ padding: '8px 14px', fontSize: '11px', color: '#FFB4AB', backgroundColor: '#3B2123' }}
          >
            Khôi phục
          </button>
        </div>
      </div>
    </div>
  );
}
