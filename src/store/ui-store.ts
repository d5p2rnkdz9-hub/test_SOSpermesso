'use client';

import { create } from 'zustand';

/**
 * UI mode store: 'persona' (default, migrant-facing) vs 'sportello'
 * (operator mode for CAF/patronati/legal aid desks).
 *
 * The mode is DEVICE state, not session state: it persists in
 * localStorage ('sos-mode') and is applied pre-paint by an inline
 * script in the locale layout that sets data-mode on <html>.
 * Only the mode flag is persisted — never answers or paths
 * (session persistence was deliberately removed for shared devices).
 */

export type UiMode = 'persona' | 'sportello';

const STORAGE_KEY = 'sos-mode';

function applyModeToDevice(mode: UiMode) {
  if (typeof document === 'undefined') return;

  if (mode === 'sportello') {
    document.documentElement.setAttribute('data-mode', 'sportello');
  } else {
    document.documentElement.removeAttribute('data-mode');
  }

  try {
    localStorage.setItem(STORAGE_KEY, mode);
  } catch {
    // Private browsing / storage disabled: mode still applies for this page view
  }

  // Parallel cookie on .sospermesso.it so the 11ty main site can read the
  // mode without login. The domain attribute is rejected on localhost, so
  // also set a host-only fallback; both fail silently when not applicable.
  const base = `sos_mode=${mode}; path=/; max-age=31536000; SameSite=Lax`;
  document.cookie = base;
  document.cookie = `${base}; domain=.sospermesso.it`;
}

interface UiState {
  mode: UiMode;
  setMode: (mode: UiMode) => void;
  toggleMode: () => void;
  /**
   * Sync the store from the data-mode attribute set by the pre-paint
   * inline script. Called once on mount (ModeToggle). Keeping the
   * attribute as the source of truth avoids a second localStorage read
   * and any SSR/client divergence beyond the initial render.
   */
  initFromDevice: () => void;
}

export const useUiStore = create<UiState>()((set, get) => ({
  mode: 'persona',

  setMode: (mode) => {
    applyModeToDevice(mode);
    set({ mode });
  },

  toggleMode: () => {
    const next = get().mode === 'sportello' ? 'persona' : 'sportello';
    get().setMode(next);
  },

  initFromDevice: () => {
    if (typeof document === 'undefined') return;
    if (document.documentElement.getAttribute('data-mode') === 'sportello') {
      set({ mode: 'sportello' });
    }
  },
}));
