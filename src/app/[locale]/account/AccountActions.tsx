'use client';

import { useState } from 'react';

import { useRouter } from '@/i18n/navigation';
import { authClient } from '@/lib/auth-client';

export function AccountActions({ locale, accountUnico = false }: { locale: string; accountUnico?: boolean }) {
  const router = useRouter();
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [busy, setBusy] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  async function signOut() {
    setBusy(true);
    await authClient.signOut();
    router.push('/');
    router.refresh();
  }

  async function deleteAccount() {
    setBusy(true);
    setDeleteError(null);
    const { error } = await authClient.deleteUser({ callbackURL: `/${locale}` });
    if (error) {
      setBusy(false);
      // Messaggi del server (es. abbonamento ancora attivo, auth.ts); la sessione
      // troppo vecchia per eliminare richiede un nuovo accesso.
      setDeleteError(
        error.code === 'SESSION_EXPIRED'
          ? 'Per sicurezza esci, rientra con un nuovo link e riprova.'
          : error.message || 'Non siamo riusciti a eliminare l’account. Riprova più tardi.',
      );
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
          {accountUnico && (
            <p className="mb-2 text-foreground">
              L&apos;account è unico per SOS Permesso e SOS Flussi: eliminandolo lo elimini su entrambi i siti,
              con le pratiche salvate e l&apos;abbonamento.
            </p>
          )}
          <p className="font-semibold text-foreground">
            Eliminare l&apos;account? Email e dati di accesso vengono cancellati subito.
          </p>
          {deleteError && (
            <p role="alert" className="mt-2 font-semibold text-destructive">
              {deleteError}
            </p>
          )}
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
              onClick={() => {
                setConfirmDelete(false);
                setDeleteError(null);
              }}
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
