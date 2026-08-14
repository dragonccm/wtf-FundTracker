'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAppStore } from '@/lib/store/appStore';
import { Currency, DateFormat } from '@/types';

export default function SettingsPage() {
  const router = useRouter();
  const { user, updateProfile, clearFinancialData, logout } = useAppStore();
  const [name, setName] = useState(user.name);
  const [avatarUrl, setAvatarUrl] = useState(user.avatarUrl || '');
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    setName(user.name);
    setAvatarUrl(user.avatarUrl || '');
  }, [user.name, user.avatarUrl]);

  const saveProfile = (event: React.FormEvent) => {
    event.preventDefault();
    updateProfile({ name: name.trim(), avatarUrl: avatarUrl.trim() });
    setSaved(true);
    window.setTimeout(() => setSaved(false), 1600);
  };

  const clearAllFinancialData = () => {
    if (!window.confirm('Xóa toàn bộ quỹ, giao dịch, mục tiêu và danh mục của tài khoản?')) return;
    clearFinancialData();
  };

  const signOut = () => {
    logout();
    router.replace('/login');
  };

  return (
    <div className="journal-page">
      <div className="journal-page-header">
        <div>
          <span className="journal-eyebrow">Tài khoản</span>
          <h1 className="journal-page-title">Cài đặt</h1>
        </div>
      </div>

      <form className="journal-card journal-form" style={{ padding: 20 }} onSubmit={saveProfile}>
        <div style={{ display: 'flex', gap: 14, alignItems: 'center' }}>
          {avatarUrl ? (
            <img src={avatarUrl} alt="" className="journal-avatar" style={{ width: 54, height: 54 }} />
          ) : (
            <span className="journal-fund-mark" style={{ width: 54, height: 54, borderRadius: 20 }}>
              <span className="material-symbols-outlined">person</span>
            </span>
          )}
          <div style={{ minWidth: 0 }}>
            <strong style={{ display: 'block' }}>{user.name}</strong>
            <small style={{ color: 'var(--journal-muted)' }}>{user.email}</small>
          </div>
        </div>

        <div className="journal-field">
          <label htmlFor="profile-name">Tên hiển thị</label>
          <input id="profile-name" value={name} onChange={(event) => setName(event.target.value)} required />
        </div>
        <div className="journal-field">
          <label htmlFor="avatar-url">Ảnh đại diện (URL)</label>
          <input id="avatar-url" type="url" value={avatarUrl} onChange={(event) => setAvatarUrl(event.target.value)} placeholder="https://…" />
        </div>
        <button className="journal-primary-button" type="submit">{saved ? 'Đã lưu' : 'Lưu hồ sơ'}</button>
      </form>

      <section className="journal-list">
        <label className="journal-list-item">
          <span className="journal-fund-mark"><span className="material-symbols-outlined">payments</span></span>
          <span>
            <strong style={{ display: 'block', fontSize: 14 }}>Tiền tệ</strong>
            <small style={{ color: 'var(--journal-muted)' }}>Đơn vị hiển thị</small>
          </span>
          <select
            aria-label="Tiền tệ"
            value={user.currency}
            onChange={(event) => updateProfile({ currency: event.target.value as Currency })}
            style={{ border: 0, background: 'transparent', fontWeight: 500, color: 'var(--journal-primary)' }}
          >
            <option value="VND">VND</option>
            <option value="USD">USD</option>
          </select>
        </label>
        <label className="journal-list-item">
          <span className="journal-fund-mark"><span className="material-symbols-outlined">calendar_today</span></span>
          <span>
            <strong style={{ display: 'block', fontSize: 14 }}>Định dạng ngày</strong>
            <small style={{ color: 'var(--journal-muted)' }}>Cách hiển thị ngày</small>
          </span>
          <select
            aria-label="Định dạng ngày"
            value={user.dateFormat}
            onChange={(event) => updateProfile({ dateFormat: event.target.value as DateFormat })}
            style={{ border: 0, background: 'transparent', fontWeight: 500, color: 'var(--journal-primary)' }}
          >
            <option value="DD/MM/YYYY">DD/MM</option>
            <option value="YYYY-MM-DD">ISO</option>
          </select>
        </label>
        <Link href="/import-export" className="journal-list-item">
          <span className="journal-fund-mark"><span className="material-symbols-outlined">swap_vert</span></span>
          <span>
            <strong style={{ display: 'block', fontSize: 14 }}>Sao lưu dữ liệu</strong>
            <small style={{ color: 'var(--journal-muted)' }}>Excel và CSV</small>
          </span>
          <span className="material-symbols-outlined" style={{ color: 'var(--journal-muted)' }}>chevron_right</span>
        </Link>
      </section>

      <section className="journal-list">
        <button type="button" className="journal-list-item" onClick={clearAllFinancialData} style={{ width: '100%', border: 0, background: 'transparent', textAlign: 'left', cursor: 'pointer' }}>
          <span className="journal-fund-mark" style={{ background: '#ffdad6', color: '#690005' }}>
            <span className="material-symbols-outlined">delete_sweep</span>
          </span>
          <span>
            <strong style={{ display: 'block', fontSize: 14 }}>Xóa dữ liệu tài chính</strong>
            <small style={{ color: 'var(--journal-muted)' }}>Giữ lại tài khoản</small>
          </span>
          <span className="material-symbols-outlined" style={{ color: 'var(--journal-muted)' }}>chevron_right</span>
        </button>
        <button type="button" className="journal-list-item" onClick={signOut} style={{ width: '100%', border: 0, background: 'transparent', textAlign: 'left', cursor: 'pointer' }}>
          <span className="journal-fund-mark"><span className="material-symbols-outlined">logout</span></span>
          <strong style={{ color: 'var(--journal-danger)' }}>Đăng xuất</strong>
          <span />
        </button>
      </section>
    </div>
  );
}
