# Typeform "Conversione" Decision Tree - Complete Analysis

Source: `SOS-permesso-CONVERS--oc9jhdkJ.json`
Typeform ID: `oc9jhdkJ`
Title: Conversione permesso di soggiorno (Italian residence permit conversion quiz)

---

## 1. FIELD INVENTORY (47 fields)

### Field Types Summary
| Type | Count | Purpose |
|------|-------|---------|
| statement | 24 | Welcome screen (1) + Outcome/result screens (23) |
| multiple_choice | 16 | Decision questions |
| yes_no | 3 | Binary questions |
| rating | 1 | Feedback (1-5 stars) |
| short_text | 2 | Feedback free text |
| email | 1 | Email capture |

### Functional Categories
- **1 welcome statement** (F1)
- **14 question fields** (F2-F7, F14-F16, F18-F19, F24-F26, F31, F34-F36)
- **22 outcome/result statements** (F8-F13, F17, F20-F23, F27-F30, F32-F33, F37-F42)
- **1 orphan statement** (F38 - unreachable cittadinanza page)
- **5 feedback/exit fields** (F43-F47)
- **2 thankyou screens**

---

## 2. ALL FIELDS - COMPLETE DETAILS

### F1 - Welcome Statement
- **id:** `Dc9doCmzTJv3`
- **ref:** `a8a1f718-a501-45a7-8c61-3fbac6c72db0`
- **type:** statement
- **title:** Ciao! Con poche facili domande scoprirai se puoi CONVERTIRE il tuo permesso di soggiorno in un altro.
- **description:** Privacy policy (no personal data collected; written in masculine for simplicity; legal advice disclaimer)
- **button:** Continua
- **attachment:** Image (typeform branded)

### F2 - MAIN BRANCHING: Quale permesso VORRESTI?
- **id:** `V1lZEnHFBuQ5`
- **ref:** `7277ef22-2779-4e16-a3b7-a02d2da022dc`
- **type:** multiple_choice
- **title:** CONVERSIONE: quale permesso di soggiorno *VORRESTI*?
- **choices (7):**

| # | Label | Ref | Leads to |
|---|-------|-----|----------|
| 1 | Attesa occupazione (ricerca lavoro) | `7f593187-60aa-4acc-a571-7edd8c4a3a54` | F14 (CHECK 0 Attesa Occ) |
| 2 | Famiglia (motivi famigliari) | `c4c186e9-e9d5-4da5-ac2f-67ec0466abfe` | F31 (Check 1 Famiglia) |
| 3 | Lavoro autonomo | `04609f8d-b633-4b44-a2fa-9e435d213eab` | F3 (CHECK 0 Lavoro) |
| 4 | Lavoro subordinato | `c020d29c-aa50-4f15-80da-f3a602db603c` | F3 (CHECK 0 Lavoro) |
| 5 | Permesso UE lungo periodo (Carta di soggiorno) | `43ff8e1c-4da4-445d-9566-3ee5f06455c1` | F34 (CHECK 0 Carta) |
| 6 | Studio | `fd0710e5-0451-4e73-ae1b-57d4f490ab36` | F24 (CHECK 0 Studio) |
| 7 | ALTRO | `e617e086-8edf-448a-a0da-e8ca4b6e98d3` | F42 (Complicata) |

---

### BRANCH A: CONVERSIONE IN LAVORO (F3-F13)

#### F3 - CHECK 0: Permesso ancora valido?
- **id:** `ERJQEfVUzf0R`
- **ref:** `834f4a82-5c45-48d9-b1ee-1be0a74b15ba`
- **type:** multiple_choice
- **choices:** Ancora valido -> F4 | Scaduto -> F41 (scaduto generico)

#### F4 - CHECK 1: Quale permesso HAI adesso? (9 options)
- **id:** `V4Pb7HECilIz`
- **ref:** `8073837f-96c2-4a8b-8ce6-14fbce2be320`
- **type:** multiple_choice
- **choices:**

| Label | Leads to |
|-------|----------|
| Assistenza minori (Art. 31) | F8 (Lavoro POSSIBILE) - default |
| Attesa occupazione/ricerca lavoro | F8 (Lavoro POSSIBILE) - default |
| Famiglia | F8 (Lavoro POSSIBILE) - default |
| Protezione sussidiaria | F8 (Lavoro POSSIBILE) - default |
| Studio | F6 (VERIFICARE studi) |
| Minore eta | F13 (Minore eta lavoro - delicata) |
| Protezione speciale | F10 (Speciale lavoro - complicata) |
| Lavoro stagionale | F8 (Lavoro POSSIBILE) - default |
| Altro permesso | F5 (CHECK 2 Lavoro) |

#### F5 - CHECK 2: Quale altro permesso? (12 options)
- **id:** `CNpHuDeQNn1B`
- **ref:** `16c3cc7a-9a99-4bde-a877-6d8f57047bb7`
- **type:** multiple_choice
- **choices:**

| Label | Leads to |
|-------|----------|
| Calamita naturale | F12 (Calamita lavoro) |
| Cure mediche | F11 (Cure mediche lavoro) |
| Richiesta asilo (permesso giallo) | F9 (Lavoro IMPOSSIBILE) |
| Attivita sportiva | F8 (Lavoro POSSIBILE) - default |
| Acquisto cittadinanza/apolide | F8 (Lavoro POSSIBILE) - default |
| Residenza elettiva | F8 (Lavoro POSSIBILE) - default |
| Lavoro artistico | F8 (Lavoro POSSIBILE) - default |
| Motivi religiosi | F8 (Lavoro POSSIBILE) - default |
| Ricerca scientifica (art. 27ter) | F8 (Lavoro POSSIBILE) - default |
| Sfruttamento lavorativo (Art. 22 co. 12quater) | F8 (Lavoro POSSIBILE) - default |
| Protezione sociale (Art. 18) | F8 (Lavoro POSSIBILE) - default |
| Ho un altro permesso | F9 (Lavoro IMPOSSIBILE) |

#### F6 - VERIFICARE: Hai finito il percorso di studi? (Lavoro branch)
- **id:** `A3d2JvB9nqRp`
- **ref:** `14ba0773-0882-4a33-b145-b78d3dbed706`
- **type:** yes_no
- **Yes** -> F7 (titolo di studio) | **No** -> F9 (Lavoro IMPOSSIBILE)

#### F7 - Qual e il tuo titolo di studio? (Lavoro branch)
- **id:** `Zxo9Uhqzpb3j`
- **ref:** `98136f77-dd3e-4b56-a267-ac3584a10e9f`
- **type:** multiple_choice
- **choices (8):** Laurea triennale, Laurea specialistica, Diploma di specializzazione, Dottorato di ricerca, Master I livello, Master II livello, Attestato/diploma perfezionamento, Altro/non ho titolo
- **"Altro/non ho titolo"** -> F9 (IMPOSSIBILE) | **All others** -> F8 (POSSIBILE)

#### F8 - OUTCOME: Conversione in Lavoro POSSIBILE
- **id:** `lLPmz7rMxjZN`
- **ref:** `97ee0685-be94-4b45-afee-9bad7e6137ec`
- **type:** statement
- **Certainty:** High (legge chiara)
- **Content:** Instructions for postal kit submission with required documents for subordinato vs autonomo

#### F9 - OUTCOME: Conversione in Lavoro IMPOSSIBILE
- **id:** `mVyRKSFoGkdB`
- **ref:** `667e9776-bd7a-41b1-bbdb-7198f831956c`
- **type:** statement

#### F10 - OUTCOME: Conversione Speciale -> Lavoro (complicata)
- **id:** `RvNuwil3HudD`
- **ref:** `5d2a7945-99d1-4076-8f67-6e5eb497210c`
- **type:** statement
- **Content:** If domanda protezione before 10 March 2023, may be possible. Need legal specialist.

#### F11 - OUTCOME: Cure Mediche -> Lavoro
- **id:** `aWYwt979vD2X`
- **ref:** `774dbbec-899b-4328-8c25-0df3c6d8b733`
- **type:** statement
- **Content:** DL 50/2023 changed rules. No longer possible. Exception if domanda before March 2024. Need lawyer.

#### F12 - OUTCOME: Calamita -> Lavoro
- **id:** `vQZMiXwgcynY`
- **ref:** `edf48bf9-2a17-4c7b-9216-aacadf8ecfe0`
- **type:** statement
- **Content:** No longer possible. Exception if domanda before 6 May 2023. Need lawyer.

#### F13 - OUTCOME: Minore eta -> Lavoro (delicata)
- **id:** `fV2ulfeRaNkf`
- **ref:** `9508b733-bf34-49a0-ba35-7f8cc6f216c6`
- **type:** statement
- **Content:** Possible but may need Direzione Generale opinion. Depends on time in Italy and social services project.

---

### BRANCH B: CONVERSIONE IN ATTESA OCCUPAZIONE (F14-F23)

#### F14 - CHECK 0: Permesso ancora valido?
- **id:** `mssZAKISzMcC`
- **ref:** `60a4b593-d60b-4f12-8bba-3bc504c9b59b`
- **type:** multiple_choice
- **choices:** Ancora valido -> F15 | Scaduto -> F41 (scaduto generico)

#### F15 - CHECK 1: Quale permesso hai? (11 options)
- **id:** `XgFkYKlIXZ0l`
- **ref:** `3484e91d-b141-40c5-8dc8-fa68c3c248dc`
- **type:** multiple_choice
- **choices:**

| Label | Leads to |
|-------|----------|
| Famiglia | F23 (Incerta) |
| Assistenza minori (Art. 31) | F23 (Incerta) |
| Lavoro subordinato | F20 (Possibile) |
| Lavoro autonomo | F20 (Possibile) |
| Studio | F18 (VERIFICARE studi -> F20 Possibile) |
| Minore eta | F17 (Minore eta att occ - particolare) |
| Asilo (status di rifugiato) | F22 (Asilo/Sussidiaria - non ha senso) |
| Protezione sussidiaria | F22 (Asilo/Sussidiaria - non ha senso) |
| Protezione speciale | F21 (IMPOSSIBILE) - default |
| Richiesta asilo (permesso giallo) | F21 (IMPOSSIBILE) - default |
| Il mio permesso non e nell'elenco | F16 (CHECK 2) |

#### F16 - CHECK 2: Quale permesso? (9 options)
- **id:** `fKgxkgNZ2tQj`
- **ref:** `99aae149-412a-47cc-ade9-98f714f1d75a`
- **type:** multiple_choice
- **choices:**

| Label | Leads to |
|-------|----------|
| Attivita sportiva | F20 (Possibile) |
| Lavoro artistico | F20 (Possibile) |
| Calamita naturale | F21 (IMPOSSIBILE) - default |
| Residenza elettiva | F23 (Incerta) |
| Acquisto cittadinanza/apolide | F23 (Incerta) |
| Motivi religiosi | F20 (Possibile) |
| Ricerca scientifica (art.27ter) | F20 (Possibile) |
| Sfruttamento lavorativo (22 co. 12quater) | F20 (Possibile) |
| Altro permesso | F23 (Incerta) |

#### F17 - OUTCOME: Minore eta -> Attesa Occupazione (particolare)
- **id:** `OpE7xqoPjUn2`
- **ref:** `da1c1407-6c1f-4b14-9647-cb24b900e50b`
- **type:** statement
- **Content:** Possible but may need Direzione Generale opinion. Contact social services + legal expert.

#### F18 - VERIFICARE: Hai finito studi? (Attesa Occ branch)
- **id:** `slbOQekby2QU`
- **ref:** `9abdcd6d-31f5-441c-84b8-a029750103af`
- **type:** yes_no
- **NOTE:** Has NO logic rules - falls through to F19 regardless of answer

#### F19 - Titolo di studio? (Attesa Occ branch)
- **id:** `HTHGFqkahbIs`
- **ref:** `8115ea0b-e393-444a-8eaf-194e080a40ce`
- **type:** multiple_choice (8 choices, same as F7)
- **NOTE:** Has NO logic rules - falls through to F20 (POSSIBILE) regardless

#### F20 - OUTCOME: Attesa Occupazione POSSIBILE
- **id:** `Lz0m6ZXeJVwD`
- **ref:** `6dd0be60-2af8-402c-b4af-e913b78afd4d`
- **type:** statement
- **Content:** Can request even without previous work experience. Needs: Centro per l'Impiego document, passport, housing proof.

#### F21 - OUTCOME: Attesa Occupazione IMPOSSIBILE
- **id:** `1bSBQIj2kr7x`
- **ref:** `883060c6-bcd2-4bd5-a5a4-2c52835a3be5`
- **type:** statement

#### F22 - OUTCOME: Asilo/Sussidiaria -> Attesa Occ (non ha senso)
- **id:** `fsksseqyKL17`
- **ref:** `77a4413b-49e2-442b-9e16-fb50ccfd8c91`
- **type:** statement
- **Content:** Asilo/protezione sussidiaria gives stronger protection than attesa occupazione. Generally questure don't accept this conversion.

#### F23 - OUTCOME: Attesa Occupazione INCERTA
- **id:** `jvTw2rZZfO75`
- **ref:** `0bfe9022-d7bd-4c68-945a-f694c3551eb8`
- **type:** statement
- **Content:** Probably NOT possible, but questure interpret rules differently. Need legal advice.

---

### BRANCH C: CONVERSIONE IN STUDIO (F24-F30)

#### F24 - CHECK 0: Permesso ancora valido?
- **id:** `mYvDHGI5VBic`
- **ref:** `6723c406-a411-4306-9eb0-e015e4d09b59`
- **type:** multiple_choice
- **choices:** Ancora valido -> F25 | Scaduto -> F41 (scaduto generico)

#### F25 - CHECK 1: Quale permesso hai? (11 options)
- **id:** `5erGNKtC4aB7`
- **ref:** `ce9e0600-f003-4789-b235-e18b2c3e0205`
- **type:** multiple_choice
- **choices:**

| Label | Leads to |
|-------|----------|
| Motivi religiosi | F27 (Possibile) |
| Famiglia | F27 (Possibile) |
| Protezione sussidiaria | F27 (Possibile) |
| Asilo Politico | F27 (Possibile) |
| Calamita naturale | F27 (Possibile) |
| Lavoro autonomo | F27 (Possibile) |
| Lavoro subordinato | F27 (Possibile) |
| Richiesta Asilo | F28 (IMPOSSIBILE) |
| Protezione speciale | F30 (Speciale studio - complicata) |
| Minore eta | F29 (Minore eta studio - particolare) |
| Ho un altro permesso | F26 (CHECK 2) |

#### F26 - CHECK 2: Quale altro permesso? (7 options)
- **id:** `QO67O0uTFGpX`
- **ref:** `07fda9df-c43c-41d9-94ee-55740ec0d5c8`
- **type:** multiple_choice
- **choices:**

| Label | Leads to |
|-------|----------|
| Attesa occupazione | F42 (Complicata) - default |
| Assistenza minori | F42 (Complicata) - default |
| Attivita sportiva | F42 (Complicata) - default |
| Lavoro artistico | F42 (Complicata) - default |
| Acquisto cittadinanza/apolidia | F42 (Complicata) - default |
| Ricerca Scientifica | F42 (Complicata) - default |
| Ho un altro permesso | F28 (IMPOSSIBILE) |

#### F27 - OUTCOME: Conversione Studio POSSIBILE
- **id:** `Rjcr8tOOotq5`
- **ref:** `b00750d0-f04d-4f23-9b13-ffd93c9b2b96`
- **type:** statement
- **Certainty:** High (legge chiara)
- **Content:** Instructions for postal kit submission

#### F28 - OUTCOME: Conversione Studio IMPOSSIBILE
- **id:** `jxYDCL0YTHnj`
- **ref:** `53e51321-5801-4af3-9d8d-5f0d2c509ceb`
- **type:** statement

#### F29 - OUTCOME: Minore eta -> Studio (particolare)
- **id:** `rGUWwlCM4TpI`
- **ref:** `4edeadf5-abcb-44ac-ad97-e89bec0327e2`
- **type:** statement
- **Content:** Possible but may need Direzione Generale opinion.

#### F30 - OUTCOME: Protezione Speciale -> Studio (complicata)
- **id:** `p8ShXJ1pY3Vi`
- **ref:** `f6d779f7-cde1-4d08-9a12-25734f3edf41`
- **type:** statement
- **Content:** If domanda before 10 March 2023, may be possible. Need specialist.

---

### BRANCH D: CONVERSIONE IN FAMIGLIA (F31-F33)

#### F31 - Check 1: Permesso scaduto?
- **id:** `huRircwNCh6D`
- **ref:** `ca10c547-2f19-47c5-8f4e-5b981075217f`
- **type:** multiple_choice
- **choices (3):**

| Label | Leads to |
|-------|----------|
| E' ancora valido | F32 (Possibile) |
| E' scaduto da meno di un anno | F32 (Possibile) |
| E' scaduto da piu di un anno | F33 (Oltre l'anno) |

#### F32 - OUTCOME: Conversione Famiglia POSSIBILE
- **id:** `7bwdRdEibqEc`
- **ref:** `9dab2b49-f55d-48b3-83d5-f9f8e90900c5`
- **type:** statement
- **Content:** Possible if family member has PdS and you are: spouse, minor child, disabled adult child, or dependent parent. Also if family member is Italian/EU citizen.

#### F33 - OUTCOME: Conversione Famiglia OLTRE L'ANNO
- **id:** `1GsLL54zQD5g`
- **ref:** `0e73e179-a42a-4d51-adc1-85ba0b0bf3ad`
- **type:** statement
- **Content:** Could be problematic, depends on situation. Need legal advice.

---

### BRANCH E: CONVERSIONE IN CARTA DI SOGGIORNO UE (F34-F40)

#### F34 - CHECK 0: Permesso ancora valido?
- **id:** `RTQb66Iqkw1k`
- **ref:** `1ec517fd-8060-4d89-8d7d-21ff3b9f2d09`
- **type:** multiple_choice
- **choices:** Ancora valido -> F35 | Scaduto -> F41 (scaduto generico)

#### F35 - CHECK 1: Quale permesso hai? (10 options)
- **id:** `ApE1Nel3isZJ`
- **ref:** `26855427-e733-4d10-b47e-b48103a2f28f`
- **type:** multiple_choice
- **choices:**

| Label | Leads to |
|-------|----------|
| Famiglia | F37 (Possibile + requisiti) - default |
| Lavoro subordinato | F37 (Possibile + requisiti) - default |
| Lavoro autonomo | F37 (Possibile + requisiti) - default |
| Residenza Elettiva | F37 (Possibile + requisiti) - default |
| Protezione sussidiaria | F37 (Possibile + requisiti) - default |
| Asilo politico | F37 (Possibile + requisiti) - default |
| Attivita sportiva | F37 (Possibile + requisiti) - default |
| Lavoro artistico | F37 (Possibile + requisiti) - default |
| Protezione speciale | F37 (Possibile + requisiti) - default |
| Ho un altro permesso | F36 (CHECK 2) |

#### F36 - Check 2: Quale altro permesso? (7 options)
- **id:** `ZEgQ2SmJo5G6`
- **ref:** `3a5d476d-a56c-4d88-b42b-95c65f4d29a2`
- **type:** multiple_choice
- **choices:**

| Label | Leads to |
|-------|----------|
| Attesa occupazione | F42 (Complicata) |
| Calamita naturale | F42 (Complicata) |
| Minore eta | F42 (Complicata) |
| Richiesta asilo | F40 (IMPOSSIBILE) |
| Studio | F40 (IMPOSSIBILE) |
| Assistenza minori | F39 (Assistenza minori -> Carta) |
| Ho un altro permesso | F40 (IMPOSSIBILE) |

#### F37 - OUTCOME: Carta di Soggiorno POSSIBILE + Requisiti
- **id:** `0wcVtID9SG8d`
- **ref:** `5dd0ae35-93fb-4f20-a8e7-8501db50a7f0`
- **type:** statement
- **Content:** Requirements: 5 years consecutive legal residence, sufficient income, language test

#### F38 - ORPHAN: Cittadinanza italiana (UNREACHABLE)
- **id:** `g5g9zs5BGohn`
- **ref:** `37324ebc-4ca1-4d0d-9565-44e2226235a2`
- **type:** statement
- **Content:** If born in Italy with continuous residence, can request citizenship after 18 (before 19).
- **NOTE:** No field jumps to F38. It is unreachable in the current tree.

#### F39 - OUTCOME: Assistenza Minori -> Carta (possibile)
- **id:** `Mr7MTJsbabG2`
- **ref:** `37324ebc-4ca1-4d0d-9565-44e2226235a2`
- **type:** statement
- **Content:** Possible. Requirements: 5 years, income, housing, language test A2, no criminal record.

#### F40 - OUTCOME: Carta di Soggiorno IMPOSSIBILE
- **id:** `RdsW15nYWWCL`
- **ref:** `e94c0230-9ca5-4f71-9c0e-f6dad935c323`
- **type:** statement

---

### SHARED OUTCOMES (F41-F42)

#### F41 - OUTCOME: Permesso Scaduto (generico)
- **id:** `oV1XQfwVbnS9`
- **ref:** `0ca5c09e-bcc3-4a34-9e76-c91a32a60d1f`
- **type:** statement
- **Content:** Can still try but recommend legal advice. Link to free legal services.
- **Used by:** Lavoro branch (F3 Scaduto), Attesa Occ (F14 Scaduto), Studio (F24 Scaduto), Carta (F34 Scaduto)

#### F42 - OUTCOME: Situazione Complicata (generico)
- **id:** `hld1gVk3rHqV`
- **ref:** `291046e5-920d-4a05-935e-e968c52fa3df`
- **type:** statement
- **Content:** Complicated situation, prefer in-person consultation. Link to free legal services.
- **Used by:** F2 "ALTRO", F26 default (Studio CHECK 2), F36 various (Carta CHECK 2)

---

### FEEDBACK SECTION (F43-F47)

#### F43 - Rating (1-5 stars)
- **type:** rating
- **Logic:** If rating < 5 -> F44 (more feedback) | Else -> Thankyou screen

#### F44 - Yes/No: Domanda senza risposta?
- **type:** yes_no
- **Logic:** Yes -> F46 (describe problem) | No -> F45 (improvements)

#### F45 - Free text: Cosa possiamo migliorare?
- **type:** short_text -> Thankyou screen

#### F46 - Free text: Dicci il tuo problema
- **type:** short_text -> F47 (email)

#### F47 - Email capture (feature not ready)
- **type:** email
- **Title:** "Stiamo ancora tracciando la rotta migliore..." (leave email for notification)

---

## 3. THANKYOU SCREENS (2)

### Screen 1: Main Exit
- **id:** `kl5EBBzxouU5`
- **ref:** `bd0e0297-d544-4d27-87a0-e553dda3257a`
- **title:** Bene, speriamo di esserti stati utili!
- **description:** Links to restart quiz or return to sospermesso.it homepage
- **show_button:** false

### Screen 2: Default Typeform
- **id:** `DefaultTyScreen`
- **ref:** `default_tys`
- **title:** Grazie per aver completato questo typeform
- **show_button:** true (Create a typeform CTA)

---

## 4. COMPLETE LOGIC RULES (43 rules)

### Decision Rules (14 branching rules)

| Rule | Source Field | Condition | Destination |
|------|-------------|-----------|-------------|
| R14 | F2 (Quale vuoi?) | Lavoro autonomo OR Lavoro subordinato | F3 (CHECK 0 Lavoro) |
| R14 | F2 | Attesa occupazione | F14 (CHECK 0 Att Occ) |
| R14 | F2 | Studio | F24 (CHECK 0 Studio) |
| R14 | F2 | Famiglia | F31 (Check 1 Famiglia) |
| R14 | F2 | Carta di soggiorno UE | F34 (CHECK 0 Carta) |
| R14 | F2 | ELSE (ALTRO) | F42 (Complicata) |
| R10 | F3 (CHECK 0 Lavoro) | Ancora valido | F4 |
| R10 | F3 | ELSE (Scaduto) | F41 |
| R17 | F4 (CHECK 1 Lavoro) | Studio | F6 (VERIFICARE) |
| R17 | F4 | Minore eta | F13 |
| R17 | F4 | Protezione speciale | F10 |
| R17 | F4 | Altro permesso | F5 (CHECK 2) |
| R17 | F4 | ELSE (all others) | F8 (POSSIBILE) |
| R5 | F5 (CHECK 2 Lavoro) | Richiesta asilo | F9 (IMPOSSIBILE) |
| R5 | F5 | Cure mediche | F11 |
| R5 | F5 | Ho un altro permesso | F9 (IMPOSSIBILE) |
| R5 | F5 | Calamita naturale | F12 |
| R5 | F5 | ELSE | F8 (POSSIBILE) |
| R1 | F6 (VERIFICARE lavoro) | Yes | F7 |
| R1 | F6 | ELSE (No) | F9 (IMPOSSIBILE) |
| R2 | F7 (Titolo studio lavoro) | Altro/non ho titolo | F9 (IMPOSSIBILE) |
| R2 | F7 | ELSE | F8 (POSSIBILE) |
| R11 | F14 (CHECK 0 Att Occ) | Ancora valido | F15 |
| R11 | F14 | ELSE (Scaduto) | F41 |
| R18 | F15 (CHECK 1 Att Occ) | Il mio permesso non e nell'elenco | F16 (CHECK 2) |
| R18 | F15 | Lavoro sub/autonomo | F20 (POSSIBILE) |
| R18 | F15 | Studio | F18 (VERIFICARE) |
| R18 | F15 | Asilo/Prot. sussidiaria | F22 (Non ha senso) |
| R18 | F15 | Minore eta | F17 |
| R18 | F15 | Assistenza minori/Famiglia | F23 (INCERTA) |
| R18 | F15 | ELSE (Prot. speciale, Richiesta asilo) | F21 (IMPOSSIBILE) |
| R6 | F16 (CHECK 2 Att Occ) | Sportiva/Artistico/Religioso/Ricerca/Sfruttamento | F20 (POSSIBILE) |
| R6 | F16 | Residenza elettiva/Cittadinanza/Altro | F23 (INCERTA) |
| R6 | F16 | ELSE (Calamita) | F21 (IMPOSSIBILE) |
| R12 | F24 (CHECK 0 Studio) | Ancora valido | F25 |
| R12 | F24 | ELSE (Scaduto) | F41 |
| R16 | F25 (CHECK 1 Studio) | Religiosi/Famiglia/Sussidiaria/Asilo Pol./Calamita/Lav. aut./Lav. sub. | F27 (POSSIBILE) |
| R16 | F25 | Richiesta Asilo | F28 (IMPOSSIBILE) |
| R16 | F25 | Protezione speciale | F30 |
| R16 | F25 | Minore eta | F29 |
| R16 | F25 | Ho un altro permesso | F26 (CHECK 2) |
| R7 | F26 (CHECK 2 Studio) | Ho un altro permesso | F28 (IMPOSSIBILE) |
| R7 | F26 | ELSE | F42 (Complicata) |
| R15 | F31 (Check 1 Famiglia) | Valido OR Scaduto < 1 anno | F32 (POSSIBILE) |
| R15 | F31 | ELSE (Scaduto > 1 anno) | F33 (Oltre l'anno) |
| R13 | F34 (CHECK 0 Carta) | Ancora valido | F35 |
| R13 | F34 | ELSE (Scaduto) | F41 |
| R8 | F35 (CHECK 1 Carta) | Ho un altro permesso | F36 (CHECK 2) |
| R8 | F35 | ELSE (all others) | F37 (POSSIBILE) |
| R9 | F36 (Check 2 Carta) | Richiesta asilo/Studio/Altro | F40 (IMPOSSIBILE) |
| R9 | F36 | Attesa occ/Calamita/Minore eta | F42 (Complicata) |
| R9 | F36 | Assistenza minori | F39 |

### Routing Rules (29 outcome -> feedback routing)
All 22 outcome statements + F41 + F42 route to F43 (rating) via ALWAYS condition.
F43 routes to F44 (if rating < 5) or Thankyou screen.
F44 routes to F46 (Yes) or F45 (No).
F45 routes to Thankyou screen.
F46 routes to F47 (email capture).

---

## 5. COMPLETE PATH MAP (37 unique paths to outcomes)

### Branch A: Conversione in LAVORO (Paths 1-12)

```
PATH 1:  F2[Lavoro aut./sub.] -> F3[Valido] -> F4[Studio] -> F6[Si] -> F7[Altro/nessun titolo]
         => F9: IMPOSSIBILE

PATH 2:  F2[Lavoro aut./sub.] -> F3[Valido] -> F4[Studio] -> F6[Si] -> F7[Any degree]
         => F8: POSSIBILE

PATH 3:  F2[Lavoro aut./sub.] -> F3[Valido] -> F4[Studio] -> F6[No]
         => F9: IMPOSSIBILE

PATH 4:  F2[Lavoro aut./sub.] -> F3[Valido] -> F4[Minore eta]
         => F13: MINORE ETA (delicata, serve parere DG)

PATH 5:  F2[Lavoro aut./sub.] -> F3[Valido] -> F4[Protezione speciale]
         => F10: SPECIALE (complicata, dipende da data domanda)

PATH 6:  F2[Lavoro aut./sub.] -> F3[Valido] -> F4[Altro] -> F5[Richiesta asilo]
         => F9: IMPOSSIBILE

PATH 7:  F2[Lavoro aut./sub.] -> F3[Valido] -> F4[Altro] -> F5[Cure mediche]
         => F11: CURE MEDICHE (DL 50/2023, eccezioni possibili)

PATH 8:  F2[Lavoro aut./sub.] -> F3[Valido] -> F4[Altro] -> F5[Ho un altro permesso]
         => F9: IMPOSSIBILE

PATH 9:  F2[Lavoro aut./sub.] -> F3[Valido] -> F4[Altro] -> F5[Calamita naturale]
         => F12: CALAMITA (non piu possibile, eccezione pre-6 maggio 2023)

PATH 10: F2[Lavoro aut./sub.] -> F3[Valido] -> F4[Altro] -> F5[Any other]
         => F8: POSSIBILE

PATH 11: F2[Lavoro aut./sub.] -> F3[Valido] -> F4[Ass.minori/Att.occ/Famiglia/Prot.suss/Stagionale]
         => F8: POSSIBILE

PATH 12: F2[Lavoro aut./sub.] -> F3[Scaduto]
         => F41: SCADUTO (consiglio legale)
```

### Branch B: Conversione in ATTESA OCCUPAZIONE (Paths 13-22)

```
PATH 13: F2[Attesa occ] -> F14[Valido] -> F15[Non in elenco] -> F16[Sportiva/Artist/Relig/Ricerca/Sfrutt]
         => F20: POSSIBILE

PATH 14: F2[Attesa occ] -> F14[Valido] -> F15[Non in elenco] -> F16[Res.elett/Cittad/Altro]
         => F23: INCERTA (questure diverse)

PATH 15: F2[Attesa occ] -> F14[Valido] -> F15[Non in elenco] -> F16[Calamita]
         => F21: IMPOSSIBILE

PATH 16: F2[Attesa occ] -> F14[Valido] -> F15[Lavoro sub/autonomo]
         => F20: POSSIBILE

PATH 17: F2[Attesa occ] -> F14[Valido] -> F15[Studio] -> F18 -> F19
         => F20: POSSIBILE (NOTE: F18-F19 have no logic, always fall through)

PATH 18: F2[Attesa occ] -> F14[Valido] -> F15[Asilo/Prot.sussidiaria]
         => F22: NON HA SENSO (protezione piu forte)

PATH 19: F2[Attesa occ] -> F14[Valido] -> F15[Minore eta]
         => F17: MINORE ETA (particolare, serve parere DG)

PATH 20: F2[Attesa occ] -> F14[Valido] -> F15[Ass.minori/Famiglia]
         => F23: INCERTA

PATH 21: F2[Attesa occ] -> F14[Valido] -> F15[Prot.speciale/Rich.asilo]
         => F21: IMPOSSIBILE

PATH 22: F2[Attesa occ] -> F14[Scaduto]
         => F41: SCADUTO (consiglio legale)
```

### Branch C: Conversione in STUDIO (Paths 23-29)

```
PATH 23: F2[Studio] -> F24[Valido] -> F25[Relig/Famiglia/Suss/Asilo/Calam/Lav.aut/Lav.sub]
         => F27: POSSIBILE

PATH 24: F2[Studio] -> F24[Valido] -> F25[Richiesta Asilo]
         => F28: IMPOSSIBILE

PATH 25: F2[Studio] -> F24[Valido] -> F25[Protezione speciale]
         => F30: SPECIALE (complicata, dipende da data domanda)

PATH 26: F2[Studio] -> F24[Valido] -> F25[Minore eta]
         => F29: MINORE ETA (particolare)

PATH 27: F2[Studio] -> F24[Valido] -> F25[Altro] -> F26[Altro]
         => F28: IMPOSSIBILE

PATH 28: F2[Studio] -> F24[Valido] -> F25[Altro] -> F26[Any other]
         => F42: COMPLICATA

PATH 29: F2[Studio] -> F24[Scaduto]
         => F41: SCADUTO (consiglio legale)
```

### Branch D: Conversione in FAMIGLIA (Paths 30-31)

```
PATH 30: F2[Famiglia] -> F31[Valido OR Scaduto < 1 anno]
         => F32: POSSIBILE

PATH 31: F2[Famiglia] -> F31[Scaduto > 1 anno]
         => F33: OLTRE L'ANNO (serve parere legale)
```

### Branch E: Conversione in CARTA DI SOGGIORNO UE (Paths 32-36)

```
PATH 32: F2[Carta] -> F34[Valido] -> F35[Altro] -> F36[Rich.asilo/Studio/Altro]
         => F40: IMPOSSIBILE

PATH 33: F2[Carta] -> F34[Valido] -> F35[Altro] -> F36[Att.occ/Calamita/Minore]
         => F42: COMPLICATA

PATH 34: F2[Carta] -> F34[Valido] -> F35[Altro] -> F36[Assistenza minori]
         => F39: ASSISTENZA MINORI -> CARTA (possibile con requisiti)

PATH 35: F2[Carta] -> F34[Valido] -> F35[Any other permit]
         => F37: POSSIBILE + REQUISITI (5 anni, reddito, lingua)

PATH 36: F2[Carta] -> F34[Scaduto]
         => F41: SCADUTO (consiglio legale)
```

### Branch F: ALTRO (Path 37)

```
PATH 37: F2[ALTRO]
         => F42: COMPLICATA (consiglio legale in persona)
```

---

## 6. UNIQUE OUTCOME SUMMARY (22 reachable outcomes)

| ID | Short Name | Type | Lawyer Needed? |
|----|-----------|------|----------------|
| F8 | Lavoro POSSIBILE | Positive | No |
| F9 | Lavoro IMPOSSIBILE | Negative | No |
| F10 | Prot. Speciale -> Lavoro | Uncertain | Yes |
| F11 | Cure Mediche -> Lavoro | Uncertain | Yes |
| F12 | Calamita -> Lavoro | Uncertain | Yes |
| F13 | Minore Eta -> Lavoro | Uncertain | Yes |
| F17 | Minore Eta -> Att. Occ | Uncertain | Yes |
| F20 | Attesa Occ POSSIBILE | Positive | No |
| F21 | Attesa Occ IMPOSSIBILE | Negative | No |
| F22 | Asilo -> Att. Occ (non ha senso) | Advisory | No |
| F23 | Attesa Occ INCERTA | Uncertain | Yes |
| F27 | Studio POSSIBILE | Positive | No |
| F28 | Studio IMPOSSIBILE | Negative | No |
| F29 | Minore Eta -> Studio | Uncertain | Yes |
| F30 | Prot. Speciale -> Studio | Uncertain | Yes |
| F32 | Famiglia POSSIBILE | Positive | No |
| F33 | Famiglia Oltre l'Anno | Uncertain | Yes |
| F37 | Carta POSSIBILE + Requisiti | Positive | No |
| F39 | Ass. Minori -> Carta | Positive | Partial |
| F40 | Carta IMPOSSIBILE | Negative | No |
| F41 | Permesso Scaduto (generico) | Uncertain | Yes |
| F42 | Situazione Complicata (generico) | Uncertain | Yes |

**Note:** F38 (Cittadinanza italiana) is an orphan node - unreachable in the current tree.

---

## 7. ANOMALIES AND NOTES

1. **F18-F19 have NO logic rules** - They are duplicates of F6-F7 (VERIFICARE studi) for the Attesa Occupazione branch, but unlike F6-F7 which have Yes/No branching, F18-F19 simply fall through to F20 (POSSIBILE) regardless of answer. This appears to be a Typeform authoring oversight - the questions are asked but the answers are ignored.

2. **F38 is unreachable** - The Cittadinanza italiana outcome is in the field array but no logic or fall-through reaches it. It was likely part of an earlier version.

3. **Duplicate question patterns** - Each of the 5 main branches (Lavoro, Attesa Occ, Studio, Famiglia, Carta) follows a similar CHECK 0 -> CHECK 1 -> CHECK 2 pattern, with the CHECK 0 always being "Is your permit still valid?"

4. **Two "VERIFICARE studi" questions exist** - F6 (for Lavoro branch, WITH logic) and F18 (for Attesa Occ branch, WITHOUT logic).

5. **F2 "ALTRO" choice** maps to `e617e086-...` and goes directly to F42 (complicata) as a catch-all.

6. **Feedback flow** - All outcomes route to F43 (rating). If rating < 5, user gets asked for more feedback (F44-F47). If rating >= 5, goes to thankyou screen.
