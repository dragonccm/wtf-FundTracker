'use client';

import { useEffect } from 'react';

export default function MaterialLoader() {
  useEffect(() => {
    // Safe dynamic load to avoid ChunkLoadError
    if (typeof window !== 'undefined') {
      try {
        Promise.all([
          import('@material/web/button/filled-button.js').catch(() => {}),
          import('@material/web/button/outlined-button.js').catch(() => {}),
          import('@material/web/button/text-button.js').catch(() => {}),
          import('@material/web/iconbutton/icon-button.js').catch(() => {}),
          import('@material/web/textfield/outlined-text-field.js').catch(() => {}),
          import('@material/web/dialog/dialog.js').catch(() => {}),
          import('@material/web/chips/chip-set.js').catch(() => {}),
          import('@material/web/chips/filter-chip.js').catch(() => {}),
          import('@material/web/chips/assist-chip.js').catch(() => {}),
          import('@material/web/fab/fab.js').catch(() => {}),
        ]).catch(() => {});
      } catch (e) {
        // Silently catch dynamic import errors
      }
    }
  }, []);

  return null;
}
