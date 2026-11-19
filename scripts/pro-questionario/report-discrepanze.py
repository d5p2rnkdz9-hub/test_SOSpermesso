#!/usr/bin/env python3
"""
List where the research disagrees with the PUBLIC conversion tree
(src/lib/conversione-tree.ts, branch main). Read-only report for the lawyer:
the public tree is not changed from this branch.

Run:  python3 scripts/pro-questionario/report-discrepanze.py
Out:  docs/pro-questionario/discrepanze-albero-pubblico.md
"""
import json
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
SRC = ROOT / 'docs/pro-questionario/ricerca/conversione'
OUT = ROOT / 'docs/pro-questionario/discrepanze-albero-pubblico.md'

righe = [
    '# Discrepanze tra le ricerche PRO e l\'albero pubblico "Conversione"',
    '',
    'Generato da `scripts/pro-questionario/report-discrepanze.py` dai file in',
    '`docs/pro-questionario/ricerca/conversione/`. Da validare con un avvocato prima di',
    'correggere l\'albero pubblico (`src/lib/conversione-tree.ts`, ramo `main`).',
    '',
]
tot = 0
for f in sorted(SRC.glob('*.json')):
    d = json.loads(f.read_text())
    voci = [c for c in d['conversioni'] if c.get('discrepanza')]
    righe += [f'## {d["gruppo"]} ({f.name})', '']
    for c in voci:
        tot += 1
        righe += [
            f'### {c["da"]} → {c["a"]}',
            '',
            f'- Nodo: `{c.get("nodo_albero", "?")}`, esito nell\'albero: {c.get("esito_albero", "?")}',
            f'- Esito secondo la ricerca: **{c["esito_verificato"]}**',
            f'- {c["discrepanza"]}',
            '',
        ]
    punti = d.get('punti_da_validare') or []
    if punti:
        righe += ['**Punti da validare**', ''] + [f'- {p}' for p in punti] + ['']
OUT.write_text('\n'.join(righe))
print(f'{tot} discrepanze → {OUT.relative_to(ROOT)}')
