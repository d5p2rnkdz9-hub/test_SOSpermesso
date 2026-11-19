#!/usr/bin/env python3
"""
Merge the research files of the PRO "Conversione" module into one table.

Input:  docs/pro-questionario/ricerca/conversione/*.json  (one file per group,
        written by the research agents; kept as the audit trail, including
        punti_da_validare for the reviewing lawyer)
Output: src/lib/pro-questionario/dati/conversione-esiti.json
        { "<da>__<a>": { ...research entry..., "fonte_ricerca": "A-lavoro.json" } }

The agents named permits freely ("lavoro_subordinato / lavoro_autonomo",
"studio -> attesa_occupazione (permesso per ricerca lavoro ...)"), so every
name goes through CANON. A pair covered by more than one file keeps the entry
of the file that owns the target (UE → F, famiglia → C/D), see PRIORITA.

Run:  python3 scripts/pro-questionario/build-conversione.py
"""
import json
import re
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
SRC = ROOT / 'docs/pro-questionario/ricerca/conversione'
DECISIONI = ROOT / 'docs/pro-questionario/decisioni/conversione.json'
OUT = ROOT / 'src/lib/pro-questionario/dati/conversione-esiti.json'

# raw token (after stripping parentheses) -> canonical keys
CANON = {
    'lavoro_subordinato': ['lavoro_subordinato'],
    'lavoro_autonomo': ['lavoro_autonomo'],
    'lavoro': ['lavoro_subordinato', 'lavoro_autonomo'],
    'lavoro_subordinato_o_autonomo': ['lavoro_subordinato', 'lavoro_autonomo'],
    'lavoro_subordinato_autonomo': ['lavoro_subordinato', 'lavoro_autonomo'],
    'asilo_rifugiato': ['asilo'],
    'lavoro_stagionale': ['lavoro_stagionale'],
    'attesa_occupazione': ['attesa_occupazione'],
    'studio': ['studio'],
    'famiglia': ['famiglia'],
    'famiglia_di_cittadino_ue_o_italiano': ['famiglia_ue_ita'],
    'ue_lungo_periodo': ['ue_lungo_periodo'],
    'permesso_ue_lungo_periodo': ['ue_lungo_periodo'],
    'esigenze_sanitarie_o_di_cura': ['cure_mediche'],
    'integrazione_prosieguo_amministrativo': ['prosieguo'],
    'sfruttamento_lavorativo_art18ter': ['sfruttamento'],
    'violenza_domestica_art18bis': ['violenza_domestica'],
    'residenza_elettiva': ['residenza_elettiva'],
    'carta_blu_ue': ['carta_blu'],
    'ricerca_scientifica': ['ricerca_scientifica'],
    'attivita_sportiva': ['sport_artistico'],
    'lavoro_artistico': ['sport_artistico'],
    'attivita_sportiva_lavoro_artistico': ['sport_artistico'],
    'motivi_religiosi': ['religiosi'],
    'acquisto_cittadinanza_o_apolidia': ['cittadinanza_apolidia'],
    'acquisto_cittadinanza_apolide': ['cittadinanza_apolidia'],
    'altro_permesso_generico': ['altro'],
    'altro_generico': ['altro'],
    'asilo': ['asilo'],
    'status_di_rifugiato': ['asilo'],
    'rifugiato': ['asilo'],
    'protezione_sussidiaria': ['sussidiaria'],
    'sussidiaria': ['sussidiaria'],
    'protezione_internazionale': ['asilo', 'sussidiaria'],
    'protezione_speciale': ['protezione_speciale'],
    'richiesta_asilo': ['richiesta_asilo'],
    'calamita': ['calamita'],
    "calamita'": ['calamita'],
    'cure_mediche': ['cure_mediche'],
    'minore_eta': ['minore_eta'],
    'assistenza_minori': ['assistenza_minori'],
    'assistenza_minori_art31': ['assistenza_minori'],
    'protezione_sociale': ['protezione_sociale'],
    'protezione_sociale_art18': ['protezione_sociale'],
    'sfruttamento': ['sfruttamento'],
    'sfruttamento_art22_c12quater': ['sfruttamento'],
    'sfruttamento_art18ter': ['sfruttamento'],
    'altri_permessi_non_convertibili_in_lavoro': [],
    'qualunque_permesso_valido': ['*'],
    'qualunque_permesso': ['*'],
    'qualsiasi': ['*'],
}

FONTI = [
    'lavoro_subordinato', 'lavoro_autonomo', 'lavoro_stagionale', 'attesa_occupazione',
    'studio', 'ricerca_scientifica', 'sport_artistico', 'religiosi', 'famiglia',
    'asilo', 'sussidiaria', 'protezione_speciale', 'richiesta_asilo', 'calamita', 'cure_mediche',
    'minore_eta', 'assistenza_minori', 'protezione_sociale', 'sfruttamento', 'violenza_domestica',
    'residenza_elettiva', 'cittadinanza_apolidia', 'altro',
]

PROTEZIONE = {'asilo', 'sussidiaria', 'protezione_speciale', 'richiesta_asilo', 'calamita', 'cure_mediche'}

# For a target, which research file wins when two cover the same pair.
PRIORITA = {'ue_lungo_periodo': ['F-'], 'famiglia': ['C-'], 'famiglia_ue_ita': ['C-']}


def tokens(raw: str) -> list[str]:
    raw = re.sub(r'\(.*?\)', '', raw).strip().lower()
    out: list[str] = []
    for part in re.split(r'\s*/\s*|\s+o\s+', raw):
        part = part.strip().strip("'").replace(' ', '_')
        if not part:
            continue
        if part not in CANON:
            return []  # unknown: reported by the caller
        out += CANON[part]
    return out or []


def scaduto_key(da: str, a: str) -> str | None:
    """Expired-permit entries form their own shared branch."""
    d = da.lower()
    if 'scadut' not in d and 'nessun titolo' not in d:
        return None
    oltre = 'oltre' in d or 'nessun titolo' in d or ('pi' in d and 'anno' in d and 'meno' not in d)
    fascia = 'oltre' if oltre else 'breve'
    if 'famiglia' in a:
        return f'scaduto_{fascia}__famiglia'
    if 'ue_lungo' in a:
        return f'scaduto_{fascia}__ue_lungo_periodo'
    return f'scaduto_{fascia}__altro'


# Accents written as apostrophes (Normattiva style) → real accents, outside quotes.
ACCENTI = {'a': 'à', 'e': 'è', 'i': 'ì', 'o': 'ò', 'u': 'ù'}


def accenti(s: str) -> str:
    # 'parola' in single quotes → «parola», so its closing quote is not read as an accent
    s = re.sub(r"(?:(?<=[\s(\[:])|^)'(\w[^'\n]{0,80}?)'(?=[\s.,;:)?!\]]|$)", r'«\1»', s)
    s = re.sub(r"\b(perch|poich|affinch|bench|finch|sicch|purch|n)e'(?=[\s.,;:)?!]|$)",
               lambda m: m.group(1) + 'é', s)
    s = re.sub(r"([aeiouAEIOU])'(?=[\s.,;:)?!\]]|$)", lambda m: ACCENTI.get(m.group(1), m.group(1).lower() and {'E': 'È', 'A': 'À'}.get(m.group(1), m.group(1) + "'")) if m.group(1).islower() else {'E': 'È', 'A': 'À'}.get(m.group(1), m.group(1) + "'"), s)
    return re.sub(r"\bpò\b", "po'", s)


# Comments the researchers addressed to us about the public tree: not for the PRO reader.
META = re.compile(r"albero|questionario|\bnod[oi] (?:c_|pubblic|condivis|lavoro|minore)|\bc_[a-z_]+|\bbrief\b|nel PRO\b", re.I)
RESTANO_INTERNI = {'discrepanza', 'nodo_albero', 'esito_albero', 'fonte_ricerca'}


def senza_meta(testo: str) -> str:
    frasi = re.split(r'(?<=[.;])\s+(?=[A-ZÈÀ(«])', testo)
    tenute = [f for f in frasi if not META.search(f)]
    return ' '.join(tenute).strip()


def pulisci(v, chiave=''):
    if isinstance(v, str):
        if chiave == 'citazione' or chiave in RESTANO_INTERNI:
            return v
        return senza_meta(accenti(v))
    if isinstance(v, list) and chiave == 'casi_limite':
        return [pulisci(x, chiave) for x in v if not META.search(x.get('titolo', ''))]
    if isinstance(v, list):
        return [pulisci(x, chiave) for x in v]
    if isinstance(v, dict):
        return {k: pulisci(x, k) for k, x in v.items()}
    return v


def main() -> int:
    tabella: dict[str, dict] = {}
    ignote: list[str] = []
    for f in sorted(SRC.glob('*.json')):
        dati = json.loads(f.read_text())
        extra = {k: v for k, v in dati.items() if k not in ('conversioni', 'punti_da_validare', 'gruppo', 'regime')}
        if extra.get('requisiti_comuni'):
            tabella['_ue_requisiti_comuni'] = pulisci({**extra['requisiti_comuni'], 'fonte_ricerca': f.name})
        for c in dati['conversioni']:
            entry = pulisci({**c, 'fonte_ricerca': f.name})
            sk = scaduto_key(c['da'], c['a'])
            if sk:
                keys = [sk]
            else:
                da, a = tokens(c['da']), tokens(c['a'])
                if not da or not a:
                    ignote.append(f'{f.name}: {c["da"]} -> {c["a"]}')
                    continue
                keys = [f'{x}__{y}' for x in da for y in a if x != y]
            for k in keys:
                prev = tabella.get(k)
                if prev:
                    pref = PRIORITA.get(k.split('__')[1], [])
                    if k.split('__')[0] in PROTEZIONE and k.endswith('__famiglia'):
                        pref = ['D-']  # per-permit entries with the Patto regime beat C's category ones
                    if any(prev['fonte_ricerca'].startswith(p) for p in pref) and not any(
                        f.name.startswith(p) for p in pref
                    ):
                        continue
                    if not pref:  # same priority: keep the more specific (non-generic) one
                        continue
                tabella[k] = entry
    # Generic "any permit → famiglia" fills the sources without their own entry.
    for gen in ('*__famiglia', '*__famiglia_ue_ita'):
        if gen in tabella:
            for fonte in FONTI:
                a = gen.split('__')[1]
                if fonte != a:
                    tabella.setdefault(f'{fonte}__{a}', tabella[gen])
    # Editorial decisions override the research (verdict) and put practice notes first.
    for k, dec in json.loads(DECISIONI.read_text()).items():
        if k.startswith('_'):
            continue
        if k not in tabella:
            ignote.append(f'decisione senza voce: {k}')
            continue
        voce = dict(tabella[k])
        voce['esito_verificato'] = dec.get('esito_verificato', voce['esito_verificato'])
        if dec.get('prassi'):
            voce['sintesi'] = dec['prassi'] + ' ' + voce['sintesi']
        voce['decisione_redazione'] = dec.get('decisa_il')
        tabella[k] = voce
    OUT.parent.mkdir(parents=True, exist_ok=True)
    OUT.write_text(json.dumps(dict(sorted(tabella.items())), ensure_ascii=False, indent=1) + '\n')
    print(f'{len(tabella)} voci → {OUT.relative_to(ROOT)}')
    for i in ignote:
        print('  non mappata:', i)
    return 0


if __name__ == '__main__':
    sys.exit(main())
