'use client';

import React, { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAppStore } from '@/lib/store/appStore';
import { useToast } from '@/components/feedback/ToastProvider';
import { Currency, DateFormat } from '@/types';

const MAX_AVATAR_FILE_SIZE = 5 * 1024 * 1024;
const MAX_AVATAR_DATA_URL_LENGTH = 750_000;
const SUPPORTED_AVATAR_TYPES = new Set(['image/jpeg', 'image/png', 'image/webp']);

async function prepareAvatar(file: File) {
  const source = URL.createObjectURL(file);
  try {
    const image = await new Promise<HTMLImageElement>((resolve, reject) => {
      const preview = new Image();
      preview.onload = () => resolve(preview);
      preview.onerror = () => reject(new Error('Không thể đọc ảnh này.'));
      preview.src = source;
    });
    const scale = Math.min(1, 512 / Math.max(image.naturalWidth, image.naturalHeight));
    const canvas = document.createElement('canvas');
    canvas.width = Math.max(1, Math.round(image.naturalWidth * scale));
    canvas.height = Math.max(1, Math.round(image.naturalHeight * scale));
    const context = canvas.getContext('2d');
    if (!context) throw new Error('Không thể xử lý ảnh này.');
    context.drawImage(image, 0, 0, canvas.width, canvas.height);
    return canvas.toDataURL('image/jpeg', 0.86);
  } finally {
    URL.revokeObjectURL(source);
  }
}

export default function SettingsPage() {
  const router = useRouter();
  const { user, updateProfile, clearFinancialData, logout } = useAppStore();
  const { showToast } = useToast();
  const avatarInputRef = useRef<HTMLInputElement>(null);
  const [name, setName] = useState(user.name);
  const [avatarUrl, setAvatarUrl] = useState(user.avatarUrl || '');
  const [saved, setSaved] = useState(false);
  const [isPreparingAvatar, setIsPreparingAvatar] = useState(false);

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

  const handleAvatarSelection = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    event.target.value = '';
    if (!file) return;
    if (!SUPPORTED_AVATAR_TYPES.has(file.type)) {
      showToast('error', 'Chỉ hỗ trợ ảnh JPG, PNG hoặc WebP.');
      return;
    }
    if (file.size > MAX_AVATAR_FILE_SIZE) {
      showToast('error', 'Ảnh tối đa 5 MB. Vui lòng chọn ảnh nhỏ hơn.');
      return;
    }

    setIsPreparingAvatar(true);
    try {
      const dataUrl = await prepareAvatar(file);
      if (dataUrl.length > MAX_AVATAR_DATA_URL_LENGTH) {
        throw new Error('Ảnh sau khi tối ưu vẫn quá lớn. Vui lòng chọn ảnh khác.');
      }
      setAvatarUrl(dataUrl);
      updateProfile({ avatarUrl: dataUrl });
      showToast('success', 'Đã thay ảnh đại diện và đang lưu lên tài khoản.');
    } catch (error) {
      showToast('error', error instanceof Error ? error.message : 'Không thể tải ảnh đại diện.');
    } finally {
      setIsPreparingAvatar(false);
    }
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
          <div className="journal-avatar-editor">
            {avatarUrl ? (
              <img src={avatarUrl} alt="" className="journal-avatar" />
            ) : (
              <span className="journal-avatar-placeholder">
                <span className="material-symbols-outlined">person</span>
              </span>
            )}
            <button
              className="journal-avatar-add"
              type="button"
              onClick={() => avatarInputRef.current?.click()}
              aria-label="Tải ảnh đại diện từ máy"
              disabled={isPreparingAvatar}
            >
              <span className="material-symbols-outlined">{isPreparingAvatar ? 'progress_activity' : 'add'}</span>
            </button>
            <input ref={avatarInputRef} className="journal-visually-hidden" type="file" accept="image/jpeg,image/png,image/webp" onChange={handleAvatarSelection} />
          </div>
          <div style={{ minWidth: 0 }}>
            <strong style={{ display: 'block' }}>{user.name}</strong>
            <small style={{ color: 'var(--journal-muted)' }}>{user.email}</small>
            <small className="journal-avatar-help">Nhấn dấu + để tải ảnh từ máy</small>
          </div>
        </div>

        <div className="journal-field">
          <label htmlFor="profile-name">Tên hiển thị</label>
          <input id="profile-name" value={name} onChange={(event) => setName(event.target.value)} required />
        </div>
        <button className="journal-primary-button" type="submit">{saved ? 'Đã lưu' : 'Lưu hồ sơ'}</button>
      </form>

      <section className="journal-list">
        <div className="journal-list-item">
          <span className="journal-fund-mark"><span className="material-symbols-outlined">payments</span></span>
          <span>
            <strong style={{ display: 'block', fontSize: 14 }}>Tiền tệ</strong>
            <small style={{ color: 'var(--journal-muted)' }}>Đơn vị chuẩn hóa</small>
          </span>
          <span style={{ fontWeight: 600, color: 'var(--journal-primary)', fontSize: 14 }}>
            VND (Việt Nam)
          </span>
        </div>
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
