#!/usr/bin/env python3
"""
List where the research disagrees with the PUBLIC conversion tree
(src/lib/conversione-tree.ts). Read-only report for the reviewing lawyer:
the public tree is not changed from the PRO branch.

Ordered by severity: reversed outcomes first, then outcomes to soften,
missing pairs, and finally right outcomes with wrong or incomplete text.

Run:  python3 scripts/pro-questionario/report-discrepanze.py
Out:  docs/pro-questionario/discrepanze-albero-pubblico.md
"""
import json
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
SRC = ROOT / 'docs/pro-questionario/ricerca/conversione'
OUT = ROOT / 'docs/pro-questionario/discrepanze-albero-pubblico.md'

CLASSI = [
    ('ribaltato', '1. Esito ribaltato', 'L’albero pubblico dice il contrario di quanto risulta dalle fonti.'),
    ('sfumare', '2. Esito da correggere', 'L’esito non è opposto ma va cambiato (es. «possibile» → «incerto», «incerta» → «non possibile»).'),
    ('mancante', '3. Coppie assenti o «in lavorazione»', 'Conversioni che l’albero non gestisce.'),
    ('testo', '4. Esito giusto, testo da correggere', 'Requisiti, procedura, durata o norme citate nel nodo sono sbagliati o incompleti.'),
]


def classe(albero: str, verificato: str) -> str:
    a = (albero or '').lower()
    v = verificato.lower()
    if any(x in a for x in ('non presente', 'altro tipo', 'in costruzione', 'lavorazione', 'altro (')):
        return 'mancante'
    neg_a = a.startswith('non') or 'non possibile' in a
    pos_a = not neg_a and a.startswith('possibile')
    if pos_a and v == 'non_possibile' or neg_a and v == 'possibile':
        return 'ribaltato'
    if pos_a and v in ('possibile', 'condizionato') or neg_a and v == 'non_possibile':
        return 'testo'
    return 'sfumare'


voci = {k: [] for k, _, _ in CLASSI}
punti = []
for f in sorted(SRC.glob('*.json')):
    d = json.loads(f.read_text())
    for c in d['conversioni']:
        if c.get('discrepanza'):
            voci[classe(str(c.get('esito_albero', '')), c['esito_verificato'])].append((f.name, c))
    punti += [(d['gruppo'], p) for p in d.get('punti_da_validare') or []]

righe = [
    '# Discrepanze tra le ricerche PRO e l\'albero pubblico «Conversione»',
    '',
    'Generato da `scripts/pro-questionario/report-discrepanze.py` dai file in',
    '`docs/pro-questionario/ricerca/conversione/`. Da validare prima di correggere',
    'l\'albero pubblico (`src/lib/conversione-tree.ts`).',
    '',
    '| Gravità | Voci |',
    '|---|---|',
    *[f'| {t} | {len(voci[k])} |' for k, t, _ in CLASSI],
    f'| Punti da validare (in fondo) | {len(punti)} |',
    '',
]
for k, titolo, spiega in CLASSI:
    righe += [f'## {titolo} ({len(voci[k])})', '', spiega, '']
    for nome, c in voci[k]:
        righe += [
            f'### {c["da"]} → {c["a"]}',
            '',
            f'- Albero: **{c.get("esito_albero", "?")}** (nodo `{c.get("nodo_albero", "?")}`)',
            f'- Ricerca: **{c["esito_verificato"]}** ({nome})',
            f'- {c["discrepanza"]}',
            '',
        ]
righe += [f'## 5. Punti da validare ({len(punti)})', '', 'Affermazioni su cui le fonti sono incerte o in contrasto.', '']
gruppo = None
for g, p in punti:
    if g != gruppo:
        righe += ['', f'**{g}**', '']
        gruppo = g
    righe.append(f'- {p}')
OUT.write_text('\n'.join(righe) + '\n')
print({k: len(v) for k, v in voci.items()}, 'punti', len(punti))
