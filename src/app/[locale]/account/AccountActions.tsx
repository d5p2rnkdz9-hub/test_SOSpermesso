'use client';

import { useState } from 'react';

import { useRouter } from '@/i18n/navigation';
import { authClient } from '@/lib/auth-client';

export function AccountActions({ locale }: { locale: string }) {
  const router = useRouter();
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [busy, setBusy] = useState(false);

  async function signOut() {
    setBusy(true);
    await authClient.signOut();
    router.push('/');
    router.refresh();
  }

  async function deleteAccount() {
    setBusy(true);
    const { error } = await authClient.deleteUser({ callbackURL: `/${locale}` });
    if (error) {
      setBusy(false);
      return;
    }
    router.push('/');
    router.refresh();
  }

  return (
    <div className="mt-6 flex flex-col gap-3">
      <button
        type="button"
        onClick={signOut}
        disabled={busy}
        className="rounded-md border-2 border-foreground bg-card px-4 py-2.5 font-bold text-foreground shadow-[3px_3px_0_hsl(var(--foreground))] disabled:opacity-60"
      >
        Esci
      </button>

      {confirmDelete ? (
        <div className="rounded-md border-2 border-destructive p-4 text-sm">
          <p className="font-semibold text-foreground">
            Eliminare l&apos;account? Email e dati di accesso vengono cancellati subito.
          </p>
          <div className="mt-3 flex gap-2">
            <button
              type="button"
              onClick={deleteAccount}
              disabled={busy}
              className="rounded-md bg-destructive px-3 py-1.5 font-bold text-white disabled:opacity-60"
            >
              Sì, elimina
            </button>
            <button
              type="button"
              onClick={() => setConfirmDelete(false)}
              className="rounded-md border border-foreground px-3 py-1.5 font-semibold"
            >
              Annulla
            </button>
          </div>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => setConfirmDelete(true)}
          className="text-sm text-muted-foreground underline"
        >
          Elimina il mio account
        </button>
      )}
    </div>
  );
}
