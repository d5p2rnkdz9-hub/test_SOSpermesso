'use client';

/** Campo trappola: invisibile alle persone, i bot lo riempiono. Se è pieno il link non si chiede. */
export function CampoTrappola({ valore, cambia }: { valore: string; cambia: (v: string) => void }) {
  return (
    <div aria-hidden="true" style={{ position: 'absolute', left: '-10000px', width: 1, height: 1, overflow: 'hidden' }}>
      <label>
        Sito web
        <input type="text" name="sito_web" tabIndex={-1} autoComplete="off" value={valore} onChange={(e) => cambia(e.target.value)} />
      </label>
    </div>
  );
}
