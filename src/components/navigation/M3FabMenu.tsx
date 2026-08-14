'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';

interface M3FabMenuProps {
  onOpenAddTx: () => void;
  onOpenCreatePortfolio: () => void;
}

export default function M3FabMenu({ onOpenAddTx, onOpenCreatePortfolio }: M3FabMenuProps) {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      {/* Dim Overlay when FAB Speed Dial is Open */}
      {isOpen && (
        <div
          onClick={() => setIsOpen(false)}
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.3)',
            zIndex: 140,
            backdropFilter: 'blur(2px)',
          }}
        />
      )}

      {/* Speed Dial Container (Mẫu 10) */}
      <div className="m3-fab-speed-dial">
        {/* Main Trigger FAB Button */}
        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          style={{
            width: '56px',
            height: '56px',
            borderRadius: '16px',
            backgroundColor: isOpen ? 'var(--md-sys-color-secondary)' : 'var(--md-sys-color-primary)',
            color: 'var(--md-sys-color-on-primary)',
            border: 'none',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: 'var(--md-sys-elevation-3)',
            cursor: 'pointer',
            transition: 'all 0.25s cubic-bezier(0.2, 0, 0, 1)',
            transform: isOpen ? 'rotate(45deg)' : 'rotate(0deg)',
          }}
        >
          <span className="material-symbols-outlined" style={{ fontSize: '26px' }}>
            add
          </span>
        </button>

        {/* Speed Dial Action Items (Stacking above FAB with staggered pop animation) */}
        {isOpen && (
          <>
            {/* Action 1: Add Transaction */}
            <button
              type="button"
              onClick={() => {
                setIsOpen(false);
                onOpenAddTx();
              }}
              className="m3-fab-speed-item"
              style={{ animationDelay: '0.08s' }}
            >
              <span>Thêm Giao Dịch Mua/Bán</span>
              <span className="material-symbols-outlined" style={{ fontSize: '20px', color: 'var(--md-sys-color-primary)' }}>
                receipt_long
              </span>
            </button>

            {/* Action 2: Create Financial Goal */}
            <button
              type="button"
              onClick={() => {
                setIsOpen(false);
                router.push('/goals');
              }}
              className="m3-fab-speed-item"
              style={{ animationDelay: '0.04s' }}
            >
              <span>Tạo Mục Tiêu Tài Chính</span>
              <span className="material-symbols-outlined" style={{ fontSize: '20px', color: 'var(--md-sys-color-tertiary)' }}>
                flag
              </span>
            </button>

            {/* Action 3: Create Portfolio */}
            <button
              type="button"
              onClick={() => {
                setIsOpen(false);
                onOpenCreatePortfolio();
              }}
              className="m3-fab-speed-item"
              style={{ animationDelay: '0.01s' }}
            >
              <span>Tạo Danh Mục Mới</span>
              <span className="material-symbols-outlined" style={{ fontSize: '20px', color: 'var(--md-sys-color-secondary)' }}>
                create_new_folder
              </span>
            </button>
          </>
        )}
      </div>
    </>
  );
}
