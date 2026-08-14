'use client';

import React, { useState } from 'react';
import { useAppStore } from '@/lib/store/appStore';
import { Currency, DateFormat } from '@/types';
import Link from 'next/link';

export default function SettingsPage() {
  const { user, updateProfile, resetToSampleData, logout } = useAppStore();

  const [searchQuery, setSearchQuery] = useState('');
  const [activeModal, setActiveModal] = useState<string | null>(null);

  // Form states
  const [name, setName] = useState(user.name);
  const [email, setEmail] = useState(user.email);
  const [currency, setCurrency] = useState<Currency>(user.currency);
  const [dateFormat, setDateFormat] = useState<DateFormat>(user.dateFormat);
  const [enableNotifications, setEnableNotifications] = useState(true);
  const [enableBiometric, setEnableBiometric] = useState(false);

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    updateProfile({
      name,
      email,
      currency,
      dateFormat,
    });
    setActiveModal(null);
    alert('Đã cập nhật cài đặt thành công!');
  };

  const handleResetData = () => {
    if (confirm('CẢNH BÁO: Tất cả dữ liệu giao dịch của bạn sẽ được khôi phục về trạng thái mẫu ban đầu. Bạn có chắc chắn không?')) {
      resetToSampleData();
      setActiveModal(null);
      alert('Đã khôi phục dữ liệu mẫu thành công!');
    }
  };

  const handleLogout = () => {
    if (confirm('Bạn có chắc chắn muốn đăng xuất khỏi tài khoản?')) {
      logout();
      window.location.href = '/login';
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
      {/* 1. Pixel Native Search Pill (Exact match to Screenshot 2) */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
          padding: '0 20px',
          height: '52px',
          borderRadius: '28px',
          backgroundColor: 'var(--md-sys-color-surface-container)',
          border: 'none',
        }}
      >
        <span className="material-symbols-outlined" style={{ fontSize: '22px', color: 'var(--md-sys-color-on-surface)' }}>
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
            color: 'var(--md-sys-color-on-surface)',
            fontSize: '15px',
            fontWeight: 600,
            width: '100%',
          }}
        />
        {searchQuery && (
          <button
            type="button"
            onClick={() => setSearchQuery('')}
            style={{
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              color: 'var(--md-sys-color-on-surface-variant)',
              display: 'flex',
              alignItems: 'center',
            }}
          >
            <span className="material-symbols-outlined" style={{ fontSize: '20px' }}>close</span>
          </button>
        )}
      </div>

      {/* 2. Pixel Google Profile Card (Exact match to Screenshot 2) */}
      <div
        onClick={() => setActiveModal('PROFILE')}
        className="pixel-grouped-card"
        style={{ padding: '16px 18px', cursor: 'pointer' }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div
            style={{
              width: '46px',
              height: '46px',
              borderRadius: '50%',
              overflow: 'hidden',
              flexShrink: 0,
              border: '1.5px solid var(--md-sys-color-outline-variant)',
            }}
          >
            <img
              src={user.avatarUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120'}
              alt={user.name}
              style={{ width: '100%', height: '100%', objectFit: 'cover' }}
            />
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: '16px', fontWeight: 800, color: 'var(--md-sys-color-on-surface)', lineHeight: 1.3 }}>
              {user.name}
            </div>
            <div style={{ fontSize: '12px', color: 'var(--md-sys-color-on-surface-variant)', marginTop: '2px' }}>
              Các lựa chọn ưu tiên và dịch vụ của Google
            </div>
          </div>
          <span className="material-symbols-outlined" style={{ color: 'var(--md-sys-color-outline)', fontSize: '20px' }}>
            chevron_right
          </span>
        </div>
      </div>

      {/* 3. Grouped Settings Section 1 (Connections & Currency) */}
      <div className="pixel-grouped-card">
        {/* Item: Tiền tệ & Tỷ giá */}
        <div onClick={() => setActiveModal('CURRENCY')} className="pixel-settings-item">
          <div className="pixel-circle-icon pixel-icon-cyan">
            <span className="material-symbols-outlined" style={{ fontSize: '22px' }}>payments</span>
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: '15px', fontWeight: 800, color: 'var(--md-sys-color-on-surface)' }}>
              Đơn vị tiền tệ chính
            </div>
            <div style={{ fontSize: '12px', color: 'var(--md-sys-color-on-surface-variant)', marginTop: '2px' }}>
              Đang chọn: {currency} (Đồng Việt Nam)
            </div>
          </div>
        </div>

        {/* Item: Định dạng ngày */}
        <div onClick={() => setActiveModal('DATE_FORMAT')} className="pixel-settings-item">
          <div className="pixel-circle-icon pixel-icon-blue">
            <span className="material-symbols-outlined" style={{ fontSize: '22px' }}>calendar_today</span>
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: '15px', fontWeight: 800, color: 'var(--md-sys-color-on-surface)' }}>
              Định dạng ngày & Vùng
            </div>
            <div style={{ fontSize: '12px', color: 'var(--md-sys-color-on-surface-variant)', marginTop: '2px' }}>
              {dateFormat === 'DD/MM/YYYY' ? 'DD/MM/YYYY (Việt Nam)' : 'YYYY-MM-DD (Quốc tế)'}
            </div>
          </div>
        </div>
      </div>

      {/* 4. Grouped Settings Section 2 (Apps, Notifications & Privacy) */}
      <div className="pixel-grouped-card">
        {/* Item: Ứng dụng & Dữ liệu quỹ */}
        <Link href="/funds" style={{ textDecoration: 'none' }} className="pixel-settings-item">
          <div className="pixel-circle-icon pixel-icon-purple">
            <span className="material-symbols-outlined" style={{ fontSize: '22px' }}>apps</span>
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: '15px', fontWeight: 800, color: 'var(--md-sys-color-on-surface)' }}>
              Dữ liệu quỹ đầu tư
            </div>
            <div style={{ fontSize: '12px', color: 'var(--md-sys-color-on-surface-variant)', marginTop: '2px' }}>
              Tra cứu NAV, biểu đồ tăng trưởng lịch sử
            </div>
          </div>
          <span className="material-symbols-outlined" style={{ color: 'var(--md-sys-color-outline)', fontSize: '20px' }}>
            chevron_right
          </span>
        </Link>

        {/* Item: Thông báo & Cảnh báo */}
        <div
          onClick={() => setEnableNotifications(!enableNotifications)}
          className="pixel-settings-item"
        >
          <div className="pixel-circle-icon pixel-icon-pink">
            <span className="material-symbols-outlined" style={{ fontSize: '22px' }}>notifications</span>
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: '15px', fontWeight: 800, color: 'var(--md-sys-color-on-surface)' }}>
              Thông báo & Nhắc nhở
            </div>
            <div style={{ fontSize: '12px', color: 'var(--md-sys-color-on-surface-variant)', marginTop: '2px' }}>
              {enableNotifications ? 'Đang bật • Nhận cảnh báo NAV & biến động thị trường' : 'Đã tắt'}
            </div>
          </div>
          <input
            type="checkbox"
            checked={enableNotifications}
            onChange={() => {}}
            style={{ width: '18px', height: '18px', accentColor: 'var(--md-sys-color-primary)' }}
          />
        </div>

        {/* Item: Âm thanh & Xúc giác */}
        <div onClick={() => setActiveModal('SOUND')} className="pixel-settings-item">
          <div className="pixel-circle-icon pixel-icon-rose">
            <span className="material-symbols-outlined" style={{ fontSize: '22px' }}>volume_up</span>
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: '15px', fontWeight: 800, color: 'var(--md-sys-color-on-surface)' }}>
              Âm thanh và rung
            </div>
            <div style={{ fontSize: '12px', color: 'var(--md-sys-color-on-surface-variant)', marginTop: '2px' }}>
              Phản hồi xúc giác khi bấm nút, âm báo giao dịch
            </div>
          </div>
        </div>

        {/* Item: Chế độ an toàn / Sinh trắc học */}
        <div
          onClick={() => setEnableBiometric(!enableBiometric)}
          className="pixel-settings-item"
        >
          <div className="pixel-circle-icon pixel-icon-orange">
            <span className="material-symbols-outlined" style={{ fontSize: '22px' }}>fingerprint</span>
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: '15px', fontWeight: 800, color: 'var(--md-sys-color-on-surface)' }}>
              Bảo mật sinh trắc học
            </div>
            <div style={{ fontSize: '12px', color: 'var(--md-sys-color-on-surface-variant)', marginTop: '2px' }}>
              Khóa ứng dụng bằng vân tay / Face ID
            </div>
          </div>
          <input
            type="checkbox"
            checked={enableBiometric}
            onChange={() => {}}
            style={{ width: '18px', height: '18px', accentColor: 'var(--md-sys-color-primary)' }}
          />
        </div>
      </div>

      {/* 5. Grouped Settings Section 3 (System & Account Management) */}
      <div className="pixel-grouped-card">
        {/* Item: Khôi phục dữ liệu mẫu */}
        <div onClick={handleResetData} className="pixel-settings-item">
          <div className="pixel-circle-icon pixel-icon-yellow">
            <span className="material-symbols-outlined" style={{ fontSize: '22px' }}>restart_alt</span>
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: '15px', fontWeight: 800, color: 'var(--md-sys-color-on-surface)' }}>
              Khôi phục dữ liệu mẫu
            </div>
            <div style={{ fontSize: '12px', color: 'var(--md-sys-color-on-surface-variant)', marginTop: '2px' }}>
              Đặt lại danh mục, quỹ và lịch sử giao dịch gốc
            </div>
          </div>
        </div>

        {/* Item: Đăng xuất tài khoản */}
        <div onClick={handleLogout} className="pixel-settings-item">
          <div className="pixel-circle-icon pixel-icon-gray">
            <span className="material-symbols-outlined" style={{ fontSize: '22px' }}>logout</span>
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: '15px', fontWeight: 800, color: '#BA1A1A' }}>
              Đăng xuất tài khoản
            </div>
            <div style={{ fontSize: '12px', color: 'var(--md-sys-color-on-surface-variant)', marginTop: '2px' }}>
              Đăng xuất khỏi Google và trở về trang đăng nhập
            </div>
          </div>
        </div>
      </div>

      {/* MODAL: PROFILE EDIT */}
      {activeModal === 'PROFILE' && (
        <div
          onClick={() => setActiveModal(null)}
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0,0,0,0.4)',
            zIndex: 200,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '20px',
          }}
        >
          <div onClick={(e) => e.stopPropagation()} className="m3-card-elevated" style={{ width: '100%', maxWidth: '400px' }}>
            <h3 style={{ fontSize: '18px', fontWeight: 800, color: 'var(--md-sys-color-on-surface)', marginBottom: '16px' }}>
              Hồ Sơ Tài Khoản
            </h3>
            <form onSubmit={handleSaveProfile} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div className="m3-form-group">
                <label className="m3-form-label">Họ và tên</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="m3-input"
                />
              </div>
              <div className="m3-form-group">
                <label className="m3-form-label">Email Google</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="m3-input"
                />
              </div>
              <div style={{ display: 'flex', gap: '10px', marginTop: '10px' }}>
                <button type="button" onClick={() => setActiveModal(null)} className="m3-pill-btn" style={{ flex: 1 }}>
                  Hủy
                </button>
                <button type="submit" className="m3-pill-btn-primary" style={{ flex: 1 }}>
                  Lưu
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: CURRENCY */}
      {activeModal === 'CURRENCY' && (
        <div
          onClick={() => setActiveModal(null)}
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0,0,0,0.4)',
            zIndex: 200,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '20px',
          }}
        >
          <div onClick={(e) => e.stopPropagation()} className="m3-card-elevated" style={{ width: '100%', maxWidth: '380px' }}>
            <h3 style={{ fontSize: '18px', fontWeight: 800, color: 'var(--md-sys-color-on-surface)', marginBottom: '16px' }}>
              Chọn Đơn Vị Tiền Tệ
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {(['VND', 'USD'] as Currency[]).map((c) => (
                <div
                  key={c}
                  onClick={() => {
                    setCurrency(c);
                    updateProfile({ currency: c });
                    setActiveModal(null);
                  }}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '14px 16px',
                    borderRadius: '16px',
                    backgroundColor: currency === c ? 'var(--md-sys-color-secondary-container)' : 'var(--md-sys-color-surface-container)',
                    cursor: 'pointer',
                  }}
                >
                  <span style={{ fontSize: '15px', fontWeight: 800, color: 'var(--md-sys-color-on-surface)' }}>
                    {c === 'VND' ? 'VND (Đồng Việt Nam)' : 'USD (Đô la Mỹ)'}
                  </span>
                  {currency === c && (
                    <span className="material-symbols-outlined" style={{ color: 'var(--md-sys-color-primary)', fontWeight: 900 }}>
                      check
                    </span>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
