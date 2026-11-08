'use client';

import { useEffect } from 'react';

import { authClient } from '@/lib/auth-client';
import { useUiStore } from '@/store/ui-store';

/**
 * Keeps the Zustand mode store in sync with the device state.
 *
 * The inline pre-paint script in the locale layout sets data-mode="pro"
 * on <html> (from localStorage / the sos_mode cookie shared with
 * sospermesso.it), but nothing read it back into the store after the
 * ModeToggle was removed: PRO never activated in the app, so HeaderAccount
 * and ProCard never rendered. Mounted once in the layout, this component
 * (1) syncs the store from the attribute and (2) switches the device to
 * PRO whenever a session exists — an account means an operator.
 */
export function ModeSync() {
  const initFromDevice = useUiStore((s) => s.initFromDevice);
  const setMode = useUiStore((s) => s.setMode);
  const mode = useUiStore((s) => s.mode);
  const { data: session } = authClient.useSession();

  useEffect(() => {
    initFromDevice();
  }, [initFromDevice]);

  useEffect(() => {
    if (session && mode !== 'pro') setMode('pro');
  }, [session, mode, setMode]);

  return null;
}
