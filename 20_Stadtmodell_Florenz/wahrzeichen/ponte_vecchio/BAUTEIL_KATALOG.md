# Bauteil-Katalog – Ponte Vecchio mit Corridoio Vasariano (`ponte_vecchio`, V3 D2)

Verbindlich für die Umsetzung. Maße und Herkunft: [`REFERENZMASSE.md`](REFERENZMASSE.md). Pipeline: [`tools/ARCHITEKTUR.md`](../../../tools/ARCHITEKTUR.md) (§0, §3, §10). Palette: `tools/spec/palette.js` (**Rollen**). Blockzahlen ±30 %. Projekt `type: "wahrzeichen"`, Moduldateien `projects/ponte_vecchio/model/m0_*.js` … `m7_*.js`. Bauteile stehen in Bau-Reihenfolge.
Querschnitt und Höhen am Nordschnitt sind identisch mit [`../uffizi/BAUTEIL_KATALOG.md`](../uffizi/BAUTEIL_KATALOG.md) §9.2 Teil 8.

## 0. Allgemeine Regeln

### 0.1 Projektfelder (`project.json`)
```json
{ "id": "ponte_vecchio", "title": "Ponte Vecchio und Corridoio Vasariano", "type": "wahrzeichen",
  "gebaeude": ["r2302812"],
  "bodenY": 63,
  "rahmen": { "ox": -539, "oz": 1058, "thetaDeg": 116.6 },
  "masken": {
    "bruecke":  { "flaechen": ["r5342094"], "xMax": -529, "abzugProjekte": ["uffizi"], "abzugAlle": true },
    "turm":     { "gebaeude": ["w306692132"] },
    "korridor": { "gebaeude": ["w1344547176", "w1394832044"], "xMax": -529, "zMax": 1311.5,
                  "abzugProjekte": ["uffizi"], "abzugAlle": true, "gelaendeBis": "boden" }
  },
  "luftraum": 0 }
```
Neu gegenüber `tools/ARCHITEKTUR.md` §10 (Anforderungen an W0, Übersicht Welle 2 §6): **`flaechen`** (OSM-IDs aus `flaechen.json` → `bruecken`, weil r5342094 kein Gebäude ist), **`zMax`/`zMin`**, **`abzugAlle`** (Abzug der Haupt- **und** Zusatzmasken der genannten Projekte) und **`gelaendeBis`** (`"boden"` = Stadtgrund baut höchstens bis `bodenY − 1`; `"frei"` = bis `groundTopY`; Vorgabe Hauptmaske `"boden"`, Zusatzmasken `"frei"`; hier alle `"boden"`). `luftraum` 0: **kein Bauteil verlässt die Maske** (§0.5).

### 0.2 Rahmen `PB`
- Ursprung `O = (−539 | 1058)`, **θ = 116,6°** (von +x nach +z), cosθ = −0,4478, sinθ = 0,8942.
- `x = O.x + u·cosθ − w·sinθ`, `z = O.z + u·sinθ + w·cosθ`; Rückabbildung `u = (x−O.x)·cosθ + (z−O.z)·sinθ`, `w = −(x−O.x)·sinθ + (z−O.z)·cosθ`. Rasterung durch Rückabbildung der Zellmitte, Intervalle halboffen `[a, b)`. **Zellmitte-Höhe:** die Ganzzahl Y ist die Zellmitte.
- **u** von Nord (Lungarno) nach Süd (Oltrarno), **w > 0 nach West (stromab)**, **w < 0 nach Ost (stromauf, Korridorseite)**. Nord/Süd-Widerlager: u < 6 und u ≥ 176; Wasser u 6..175.
- **Höhe:** `y_rel = Y − bodenY`, **`bodenY = 63`**: Fahrbahn und Ladenboden liegen auf **Y 63** (Lage 0); Lage 1 = Y 64. Unterhalb liegen negative `y_rel` (Pfeilerfuß Y 47 = −16).

### 0.3 Masken und Zonen
`M_PV` = `bruecke` ∪ `laeden` (Hauptmaske r2302812, x ≤ −529) ∪ `turm` ∪ `korridor` abzüglich der Zellen von `uffizi` (`M_COR`, x ≥ −528: 97 Zellen). **10.844 Zellen** (Referenzmaße §1). **Jedes Bauteil wird mit `M_PV` geschnitten.**

| Zone | Definition (stetige u, w; erste Übereinstimmung gilt) | Inhalt |
|---|---|---|
| `Z_T` Turm | Zellen von w306692132 | Torre dei Mannelli (gewinnt die eine Zelle, die r2302812 teilt) |
| `Z_K` Korridor | Zellen der Maske `korridor` (Abstandsfeld `d8_K` aus der **ungeschnittenen** Korridormaske inklusive x ≥ −528, damit am Schnitt keine Stirnwand entsteht) | Gang |
| `R_E` Ostzeile | Zellen von r2302812 mit w < −9,5 | Läden Ost (3.033 Zellen) |
| `R_W` Westzeile | Zellen von r2302812 mit w > 6,5 | Läden West (2.974 Zellen; Lücke bei u 82..121) |
| `Z_N` Nordwiderlager | Zellen der Brückenmaske mit u < 6 | Widerlager, Rampe |
| `Z_S` Südwiderlager | Brückenmaske mit u ≥ 176 | Widerlager, Rampe |
| `Z_B` Brücke | Brückenmaske mit 6 ≤ u < 176; **Tragkörper** −19,5 ≤ w < 19,5, **Auskragung** (sporti) sonst | Bögen, Pfeiler |
| `Z_F` Fahrbahn | alle übrigen Zellen der Brückenmaske (−9,5 ≤ w ≤ 6,5) | Pflaster |

Pfeiler: `P1` u ∈ [55, 64), `P2` u ∈ [118, 127). Bögen: `B_N` u ∈ [6, 55) (Spannweite 49), `B_M` u ∈ [64, 118) (54), `B_S` u ∈ [127, 176) (49), Mittelpunkte `u_c = a + S/2`.
**Laibung** (Kreissegment, Stich 8): ρ = (S²/4 + 8²)/16, `y_i(u) = 51 + √(ρ² − (u − u_c)²) − (ρ − 8)`. Eine Zelle (Y, u) gehört zum Gewölbekörper, wenn `Y ≥ y_i(u)` (Zellmitte auf oder über der Laibung) und `Y ≤ 62` ist.

### 0.4 Rollen
`pietra_forte_rustika` (Stirnflächen der Brücke), `pietra_forte` (Gewölbering, Pfeiler, Korridorwände, Turm), `mauerwerk` (Hinterfüllung), `pietra_serena` (Böden, Konsolen am Turm, Pfeiler der Loggia, Fensterrahmen), `pflaster` (Fahrbahn), `pietra_forte_bruch` (Fundamentfüllung, falls nötig), `putz_ocker`/`putz_gelb`/`putz_terrakotta`/`putz_sand` (Läden, Farbe je Laden), `holz` (Zwischendecken), `holz_sporto` (Auskragungen, Konsolen der sporti), `fensterladen` (Ladentüren und Läden), `glas_fenster`, `dachziegel`, `marmor_weiss` (Cellini-Brunnen), `bronze` (Büste), `wasser` (Brunnen). **Keine Palettenwünsche.** Zäune, Gitter und Stufen entfallen (nur volle Blöcke); die Liebesschlösser-Geländer der Büste gibt es nicht.

### 0.5 Luftraum (R12)
`luftraum = 0`. Kragende Teile (sporti, Vorköpfe) liegen **innerhalb** der Maske (die Maske umfasst die Auskragung, Referenzmaße §2). Zellen außerhalb der Maske werden verworfen. Ausdrücklich erlaubte Ausnahmen: keine.

### 0.6 Gelände, Wasser und Stadtgrund (Säulenregel)
- **Stadtgrund** baut in Spalten von `M_PV` (Land) höchstens bis `Y = min(groundTopY, 62)`. Die Fahrbahn auf Y 63 ersetzt Gelände mit `groundTopY` 63..64 (841 Maskenzellen am Nordufer und am Südende). Das Projekt belegt nirgends Zellen mit `Y ≤ groundTopY` außer in den Pfeilerspalten.
- **Wasser und Bett** unter den Bögen baut der **Stadtgrund** (Wasser Y 49..50, Kies Y 48; Wasserspiegel Y 50 aus dem DGM). Das Projekt beginnt **über** Y 50 (Kämpfer Y 51), mit Ausnahme der **Pfeilerspalten**.
- **Aussparung (Pfeilerspalten):** Alle Spalten von `M_PV` mit u ∈ [55, 64) oder [118, 127) bleiben im Stadtgrund **leer** (kein Wasser, kein Bett). Das Projekt baut dort `pfeiler` und `vorkoepfe` ab **Y 47** (Bett Y 48 liegt dazwischen). Die Liste steht als Rechtecke im Rahmen `PB` in `data/stadt/aussparung.json` (Übersicht Welle 2 §3). 2 · 9 · 45 = 810 Spalten abzüglich Randzellen außerhalb der Maske.
- **Geländekontakt (R3):** Standardregel `y ≤ groundTopY` → Kontakt. Widerlagerfüllung beginnt bei `groundTopY + 1`. Pfeiler stehen bei Y 47 ≤ 50 auf „Gelände“.
- Südende: Fahrbahn Y 63 und Gelände 58–60 bei u 205..209; der Stadtgrund glättet die Straße hinter u 209 von 63 auf den natürlichen Verlauf (Anschluss an Via de' Bardi, Schwellenband 6 Blöcke).

### 0.7 Überlappungsfreiheit (K0, aus dem Prüfbericht D1)
Jede Zelle gehört genau einem Bauteil. Rangfolge: **Detail gewinnt** (Öffnung, Fenster, Tür, Konsole, Gesims), das **allgemeine** Bauteil (Wand, Decke, Füllung) lässt die Zelle aus; bei gleichrangigen Bauteilen gewinnt das zuerst gebaute. Die Tabellen führen deshalb die Spalte **lässt aus**. Verbindlich:
- Gewölbekörper: `stirnwaende` vor `gewoelbe_ringe` vor `fuellung`; jedes lässt die Zellen der vorigen aus.
- Läden: Wände lassen Türen, Fenster, Loggia-Öffnungen aus; Decken lassen Treppenloch (keines) und die Korridorzellen (ab Lage 16) aus; die Zwischendecke lässt die Ladenwände aus.
- Korridor: Wände lassen Fenster aus; Decke lässt nichts aus.
- Turm: `turm_waende` lässt Fenster aus; Decken lassen die Wandzellen (`d8_T ≤ 3`) aus.

### 0.8 Begehbarkeit und Ausgestaltung (Standard [`../../BEGEHBARKEIT.md`](../../BEGEHBARKEIT.md))
Verbindlich ab 13.10.2026; die Teile sind in den Modulen 2–5 und im neuen **Modul 8** verteilt.
- **Zugänge:** Jeder Laden hat eine **offene Tür 2 × 5** (lichte Öffnung, Boden Y 63) von der Fahrbahn; die Loggia ist offen (`arkade`); der Turm hat ein Tor 3 × 5 zur Straße; der Korridor ist begehbar durchgehend von Nord- bis Südschnitt und über die **Loggia-Treppe** (Modul 8) auch von der Brücke erreichbar (historisch nicht belegt, Spielzugang, Stufe C). Türen sind **Luft** (kein `holz`-Block in der Öffnung); Flügel und Laibung sind seitliche Blöcke. Alle Türen werden mit `ctx.oeffnung(zellen, 'tuer')` deklariert, Loggia-Bögen mit `'arkade'`.
- **Böden und Höhen:** Laden EG lichte Höhe 7, Laden-OG 4, Gang 7, Turmgeschosse 12 (je ≥ 3). Jedes Geschoss hat geschlossenen Boden.
- **Treppen:** **echte Treppenblöcke** mit Aufstiegsrichtung, Bibliothek `tools/wahrzeichen/treppe.js` (`geradeTreppe`, `podestTreppe`, `wendeltreppe`; liefern Blöcke und Treppenloch-Zellen). Treppenblöcke erhalten das Material ihrer Umgebung (Holztreppe `holz`, Steintreppe `pietra_serena`/`pietra_forte`); **Palette-Erweiterung nötig:** Rolle → Treppentyp mit Ausrichtung (z. B. `holz` → Schwarzeichenholztreppe, `pietra_forte` → Andesittreppe, `pietra_serena` → Steintreppe). Über jeder Stufe ≥ 3 Luft; Breite ≥ 2; die Decke darüber bekommt ein Treppenloch (`lässt aus` in der Tabelle).
- **Dichtheit:** alle Fenster mit `glas_fenster`; dünne Schichten (Glas 1 Zelle) im gedrehten Rahmen werden zellweise **flächenverbunden** gesetzt (Glas in einer Mittelebene mit Dicke ≥ 2 in Weltkoordinaten oder mit `vaults.connectEdges` geschlossen). Offene Teile: Loggia, Terrasse (kein Dach), Türen.
- **Licht:** Räume mit mehr als 30 Bodenzellen erhalten Lichtquellen der Rolle `licht`, Abstand ≤ 12 (Modul 8 Teil 5).
- **R13/R14:** Startzellen der Flutfüllung (R13) sind die stehbaren Zellen vor den Türen auf der Fahrbahn und, für den Korridor, die Gangzellen an den Schnittebenen (Anschlussstart `x = −529` und `z = 1311`).

---

## 1. Modul 0 – Gründung (≈ 28 k)

| # | Bauteil-ID | Geometrie | Material | lässt aus |
|---|---|---|---|---|
| 1 | `pfeiler` | `P1`, `P2`; Tragkörper −19,5 ≤ w < 19,5; **Y 47..62** (y_rel −16..−1) | `pietra_forte` (Stirnlagen w < −17,5 und w ≥ 17,5 `pietra_forte_rustika`) | – |
| 2 | `vorkoepfe` | je Pfeiler beidseitig ein dreieckiger Vorkopf (Spitze nach außen): Reihe w = ∓20: u ∈ [a+1, b−1] (7), w = ∓21: [a+2, b−2] (5), w = ∓22: [a+3, b−3] (3); **Y 47..56** (y_rel −16..−7); mit `M_PV` geschnitten | `pietra_forte_rustika` | `pfeiler` |
| 3 | `widerlager_nord` | `Z_N` (alle Zellen der Maske mit u < 6): Füllung von `groundTopY + 1` bis **Y 62** (nur wo `groundTopY < 62`; Uferböschung 61 → 54) | `mauerwerk`, Stirnlagen (die äußeren 2 Zellen zur Böschung hin, d.h. Zellen mit Außenabstand ≤ 2 zur Maskenkante) `pietra_forte_rustika` | – |
| 4 | `widerlager_sued` | `Z_S` (u ≥ 176): von `groundTopY + 1` bis Y 62 (Böschung 51 → 60; **14,2 k**, Rampe) | wie Nord | – |

Blöcke: Pfeiler 11,4 k, Vorköpfe 0,6 k, Nord 1,5 k, Süd 14,2 k ≈ **27,7 k**.
Prüfung: Pfeilerhöhe 16 Lagen (Y 47..62); je Pfeiler 9 × 39 × 16 = 5.616 (Rand abgezogen: 5.7 k gemessen für zwei).

## 2. Modul 1 – Gewölbe, Fahrbahn und Auskragungen (≈ 46 k)

| # | Bauteil-ID | Geometrie | Material | lässt aus |
|---|---|---|---|---|
| 1 | `stirnwaende` | über den Bögen (`B_N`, `B_M`, `B_S`): die Randspalten w < −17,5 und w ≥ 17,5 des Tragkörpers, alle Zellen des Gewölbekörpers (`Y ≥ y_i(u)`, `Y ≤ 62`) | `pietra_forte_rustika` (Quader im Verband, Läufer 4 lang, Lagen 2 hoch) | – |
| 2 | `gewoelbe_ringe` | Tragkörper (|w| < 17,5), Zellen `y_i(u) ≤ Y < y_i(u) + 2`; Scheitel Y 59..60 (Haupt- und Seitenbögen), Kämpfer Y 51 | `pietra_forte` | `stirnwaende` |
| 3 | `fuellung` | Tragkörper (|w| < 17,5), Zellen von `y_i(u) + 2` bis Y 62 (geschlossene Zwickel, Spandrillen) | `mauerwerk` | `gewoelbe_ringe` |
| 4 | `fahrbahn` | **Y 63** auf allen Zellen von `Z_N`, `Z_B`, `Z_S`, `Z_F`, `R_E`, `R_W` (Brücke ∪ Läden): `Z_F` und die Lücke der Westzeile (u 82..121, Terrasse) `pflaster`; Zellen unter den Läden (`R_E`, `R_W`) `pietra_serena`; Zellen der Auskragung (|w| ≥ 19,5) `holz_sporto` | `pflaster`, `pietra_serena`, `holz_sporto` | `turm_*`, `Z_K` außerhalb der Läden (die Korridorzellen jenseits der Läden haben ihren Boden in Modul 4) |
| 5 | `konsolen_sporti` | unter jeder Auskragung (Zellen der Maske mit w < −19,5 oder ≥ 19,5 über Wasser, u 6..175; und über den Widerlagern, wo die Platte frei überragt): je 4 Zellen in u (Perioden u ≡ 0,1 mod 4): Konsolblöcke bei w = ∓20, Y 61..62 und w = ∓21, Y 62; bei Auskragung 3 zusätzlich w = ∓21, Y 61 | `holz_sporto` | `fahrbahn` (Y 63 bleibt Platte) |

Gewölbekörper über den Bögen: Ring 10,6 k, Füllung 21,9 k, Stirn 3,4 k; Fahrbahn 9,8 k; Konsolen 0,7 k ≈ **46,4 k**.
Prüfung: Scheitel Laibung Y 59 (Hauptbogen und Seitenbögen: Stich 8 über Kämpfer 51), Extrados Y 60, Fahrbahn Y 63.

## 3. Modul 2 – Läden Ost mit Loggia (≈ 25 k)

Zone `R_E` (u ≥ −2, 3.033 Zellen). **Wandband** `d8_E ≤ 2` (Chebyshev-Abstand zum Rand von `R_E`), Lagen y_rel 1..13. Farbe je Laden: `putz_ocker | putz_gelb | putz_terrakotta | putz_sand` nach Hash `(⌊u/8⌋ + 3·Seite) mod 4` (deterministisch).

| # | Bauteil-ID | Geometrie | Material | lässt aus |
|---|---|---|---|---|
| 1 | `laeden_ost_waende` | Wandband `d8_E ≤ 2`, y 1..13 (Vorderfront zur Fahrbahn bei w ≈ −10, Rückfront zum Fluss, Seitenwände, Stirn im Süden) | Putz je Laden | Öffnungen (Teile 4, 5, 6), Zellen von `Z_T`, Loggia (Teil 3) |
| 2 | `laeden_ost_trennwaende` | Querwand 1 dick bei u ≡ 0 (mod 8), über den Innenraum (`d8_E > 2`), y 1..13 | `putz_sand` | Türen (kleine Öffnung 3 × 5 in jeder Trennwand, y 1..5), Loggia |
| 3 | `laden_ost_loggia` | **Loggia** u 83..121 (39 Blöcke) auf `R_E`: statt Läden ein offener Saal; Rückfront (Fluss) und Vorderfront (Fahrbahn) je **drei Rundbögen** Spannweite 9, Mittelpunkte u = 89,5 / 102,5 / 115,5, Kämpfer y 8, Scheitel y 12; Pfeiler 4 breit zwischen den Bögen; Saal frei y 1..13, **ohne Zwischendecke** | `pietra_serena` (Pfeiler, Bogenring 1), Wand `putz_sand` | `laeden_ost_waende` (Wandband dort), `laeden_ost_trennwaende` |
| 4 | `laden_tueren_ost` | je Laden eine Öffnung **6 breit × 6 hoch** (y 1..6) in der Vorderfront (Mitte des Ladens, Raster 8): von links `fensterladen` 1, Schaufenster `glas_fenster` 1, **offene Tür 2 breit × 5 hoch (Luft, y 1..5)**, Schaufenster 1, `fensterladen` 1; über der Tür Oberlicht Glas (y 6); Glas in `d8_E = 2`; Tür als `ctx.oeffnung(…, 'tuer')` | `fensterladen`, `glas_fenster` | – |
| 5 | `laden_fenster_ost` | Obergeschoss: Fenster 2 × 3 (y 10..12) über jeder Tür (Vorderfront) und je Laden eines in der Rückfront (Fluss), Glas `glas_fenster` in `d8_E = 2`, Rahmen 1 | `glas_fenster`, `pietra_serena` | – |
| 6 | `laeden_ost_zwischendecke` | y 8..9 über `d8_E > 2` (Innenraum), ohne Loggia | `holz` | `laeden_ost_trennwaende`, `laden_ost_loggia`, **Treppenlöcher** der Ladentreppen (Modul 8 Teil 2) |
| 7 | `laeden_ost_decke` | **Lagen 14..15 (Y 77..78) auf allen Zellen von `R_E`** (Boden des Korridors; für Zellen außerhalb der Wandbänder `d8_E` zugleich Dach des Ladens) | `pietra_serena` | `Z_T`, **Treppenloch der Loggia-Treppe** (Modul 8 Teil 3) |

Blöcke: Wände 16,0 k, Trennwände 3,0 k, Zwischendecke 3,6 k, Decke 6,1 k, abzüglich Öffnungen 2,7 k und Loggia-Entfall 1,5 k ≈ **24,5 k**.
Prüfung: Boden Y 63 + 15 = Oberkante Korridorboden **Y 78** = Uffizien-Wert; Zeilenbreite 13 = 3 + 7 + 3 (Korridor).

## 4. Modul 3 – Läden West, Terrasse (≈ 25 k)

Zone `R_W` (w > 6,5; 2.974 Zellen): zwei Abschnitte u 0..81 und u 122..205. Wandband `d8_W ≤ 2`, y 1..13.

| # | Bauteil-ID | Geometrie | Material | lässt aus |
|---|---|---|---|---|
| 1 | `laeden_west_waende` | Wandband `d8_W ≤ 2`, y 1..13 | Putz je Laden (Farbwahl wie Ost, Seite 1) | Tür/Fenster (Teile 3, 4) |
| 2 | `laeden_west_trennwaende` | Querwand 1 dick bei u ≡ 4 (mod 8), y 1..13, Tür 3 × 5 | `putz_sand` | Türen |
| 3 | `laden_tueren_west` | wie Ost (`laden_tueren_ost`: Läden 1 / Glas 1 / **offene Tür 2 × 5** / Glas 1 / Läden 1, Oberlicht), in der Vorderfront bei w ≈ 7 | `fensterladen`, `glas_fenster` | – |
| 4 | `laden_fenster_west` | wie Ost | `glas_fenster`, `pietra_serena` | – |
| 5 | `laeden_west_zwischendecke` | y 8..9 über Innenraum | `holz` | Trennwände, Treppenlöcher der Ladentreppen (Modul 8 Teil 2) |
| 6 | `laeden_west_decke` | y 14..15 über `R_W` | `pietra_serena` | – |
| 7 | `terrasse_bruestung` | **westliche Freifläche** u 82..121: Brüstung 2 hoch (y 1..2) 1 breit entlang der Maskenkante (w = größter in der Lücke), unterbrochen auf 9 Blöcken (Mitte, Blick) und durch den Cellini-Brunnen (Modul 7) | `pietra_forte` | – |

Blöcke: Wände 14,3 k, Trennwände 2,6 k, Zwischendecke 3,8 k, Decke 5,9 k, abzüglich Öffnungen 1,5 k, plus Brüstung 0,1 k ≈ **25,2 k** (Dach: Modul 6).

## 5. Modul 4 – Corridoio Vasariano auf Brücke und Oltrarno-Ufer (≈ 21 k)

Zone `Z_K` (3.067 Zellen: 2.399 auf Läden/Brücke, 668 außerhalb, davon **497 Zellen von w1394832044 über die Via dei Bardi**). Wandstärke `t_w`: **3** auf den Läden/der Brücke (Zeile 13 breit = 3 + 7 + 3), **2** außerhalb (Streifen 10–11 breit); **1** am Turm (Streifen ≤ 6 breit, Gang 3). Das ist die Regel „Maximum von `d8_K` im 9 × 9-Fenster ≤ 3 → `t_w` = 1“. Wandband = `d8_K ≤ t_w`; **Gang** = alle übrigen Zellen. Höhen: Boden y 14..15, Gang y 16..22, Decke y 23..24 (Y 77..87).

| # | Bauteil-ID | Geometrie | Material | lässt aus |
|---|---|---|---|---|
| 1 | `korridor_boden_frei` | y 14..15 auf Zellen von `Z_K`, die **nicht** in `R_E`/`Z_B` liegen (die Läden haben ihren Boden selbst, Modul 2 Teil 7), ohne `Z_T` | `pietra_serena` | – |
| 2 | `korridor_unterbau` | nur Zellen von `Z_K` ohne `R_E`, ohne Brückenzellen, ohne `Z_T` und **ohne Straßenfläche** (Stadtgrund-Straßenspalte: Via dei Bardi bleibt offen): alle Zellen von `groundTopY + 1` bis **Y 76** (y_rel 13) **massiv** (Mauerkern, keine leere Kammer ohne Zugang), Außenband `d8_K ≤ 2` als sichtbare Hauswand; unter w1394832044 (174 Zellen ohne Straße) ebenso | `mauerwerk` (Kern), `putz_sand` (Außenband), `pietra_forte` (Auflager Bardi) | `korridor_boden_frei` (Y 77) |
| 3 | `korridor_waende` | Wandband `d8_K ≤ t_w`, **y 16..22** (Y 79..85) | `pietra_forte` | `korridor_fenster_klein`, `korridor_fenster_gross`, `Z_T` |
| 4 | `korridor_fenster_klein` | Fenster 2 breit × 3 hoch (y 18..20), Abstand 8 in u entlang beider Längswände (nur wo `t_w ≥ 2`), Glas in `d8_K = 2`, Rahmen 1 | `glas_fenster`, `pietra_forte` | – |
| 5 | `korridor_fenster_gross` | **drei große Fenster** in der **Westwand** des Gangs über der Westfreifläche: Mitten u = 89,5 / 102,5 / 115,5, 9 breit × 5 hoch (y 17..21), durch die volle Wanddicke 3, Rahmen 1; Glas `glas_fenster` in `d8_K = 2` | `glas_fenster`, `pietra_serena` | – |
| 6 | `korridor_decke` | y 23..24 auf allen Zellen von `Z_K` (Dach des Gangs, Decke über Wänden und Gang) | `pietra_forte` | – |

Blöcke: Boden frei 1,3 k, Unterbau 3,3 k (davon Bardi 2,3 k), Wände 13,4 k, Fenster −1,6 k, Decke 6,1 k, Boden auf Läden zählt in Modul 2 ≈ **22,5 k**.
Querschnitt am Nordschnitt (x = −528/−529): Boden Y 77..78, Wände Y 79..85 (3 dick), Gang 7 breit, Decke Y 86..87 ✓. **Das Modul baut keine Stirnwand** am Schnitt (das Abstandsfeld stammt aus der ungeschnittenen Maske). Die Zellen von w1344547176 innerhalb von `M_UF` gehören `uffizi` (K8 aus dem Prüfbericht), Überlappung mit r2302812: 97 Zellen bei x ≥ −528 liegen bei `uffizi`.

## 6. Modul 5 – Torre dei Mannelli (≈ 19 k)

Zone `Z_T` (348 Zellen, ≈ 18 × 20, Lage u 209,7–227,6, w −29,2..−9,5). Höhe **Lage 1..56** (Y 64..119), Wandband `d8_T ≤ 3`.

| # | Bauteil-ID | Geometrie | Material | lässt aus |
|---|---|---|---|---|
| 1 | `turm_waende` | Wandband `d8_T ≤ 3` (237 Zellen), y 1..56; Sockelzone y 1..8 `pietra_forte_rustika` | `pietra_forte` | Fenster, Zellen der Konsolen (liegen im Korridor, nicht im Turm) |
| 2 | `turm_fenster` | Fenster 2 × 4 (y 6..9, 20..23, 34..37, 48..51) im Abstand 8 entlang jeder Außenkante (Rand 3), Glas in `d8_T = 2`; oberstes Geschoss (y 48..51) Doppelfenster 3 breit (Panoramaraum) | `glas_fenster`, Rahmen `pietra_serena` | – |
| 3 | `turm_decken` | Decken y 14..15, 28..29, 42..43 auf `d8_T > 3` (111 Zellen), Abschluss y 55..56 | `pietra_serena` | Wandband |
| 4 | `turm_konsolen` | **Beccatelli:** an der Turm-Westwand im Korridorstreifen: Zellen von `Z_K` im Chebyshev-Abstand 1 zur Turmmaske, y 12..13, jede 2. Zelle in Längsrichtung (Schachbrett), Abstand 2: zusätzlich y 12 | `pietra_serena` | `korridor_unterbau`, `korridor_boden_frei` |
| 5 | `turm_zinnen` | y 57..59: Zinnen auf `d8_T = 1`, je 2 Zellen Zahn / 2 Lücke | `pietra_forte` | – |
| 6 | `turm_dach` | flaches Dach y 57..58 auf `d8_T > 1` (Terrasse, Panoramahalle) | `dachziegel` | `turm_zinnen` |
| 7 | `turm_tor` | **Tor 3 breit × 5 hoch** (Lage 1..5) in der Südostwand zur Straße (Mitte der Kante, Zelle mit Straßenspalte davor), Laibung 1; `ctx.oeffnung(…, 'tor')` | `pietra_forte` (Laibung) | `turm_waende` |
| 8 | `turm_wendeltreppe` | **Wendeltreppe** im Turminneren (Hohlraum `d8_T > 3`, ≈ 11 × 10): Kern 1 × 1 `pietra_forte`, Stufenspirale r = 3, Treppenblöcke `pietra_serena`, Podeste (volle Blöcke) an den vier Ecken, **56 Stufen** von Lage 0 bis Lage 56 (Dachterrasse), Geschosspodeste bei Lage 15, 29, 43; Treppenlöcher in `turm_decken` | `pietra_serena` (Treppenblöcke) | `turm_decken` (Loch) |

Blöcke: Wände 13,3 k (237 × 56), Decken 0,9 k, Dach/Zinnen 1,4 k, Konsolen 0,1 k, Fenster −0,6 k ≈ **15,2 k**; mit Zuschlag Korridor-Umgehung (Wand 1) ≈ **19 k** inklusive Anteile von Modul 4.
Der Korridor **berührt** die Turmwand (Westseite) und liegt in Höhe der Lagen 14..24 (Y 77..87); die Flächenkontakte zwischen Gangboden und Turmwand sichern R3.

## 7. Modul 6 – Dächer (≈ 4,5 k)

| # | Bauteil-ID | Geometrie | Material | lässt aus |
|---|---|---|---|---|
| 1 | `dach_west` | Walmdach über `R_W` ab y 16 (auf der Decke y 14..15): Anstieg 0,4 je Block ins Gebäude, **höchstens 3**, 2 Lagen stark; Traufe bündig mit der Zeilenkante | `dachziegel` | – |
| 2 | `dach_ost_sued` | Ostzeile außerhalb des Korridors (Zellen von `R_E` ohne `Z_K`, Südcluster, 279 Zellen bei u 180..205, w < −22): Walmdach wie West | `dachziegel` | `Z_K` |
| 3 | `dach_loggia` | Dach der Loggia: flach, y 14..15 gehört `laeden_ost_decke`; **kein** eigenes Teil | – | – |

Blöcke ≈ **4,5 k** (West 3,8 k, Südcluster 0,6 k, Reserve 0,1 k).

## 8. Modul 7 – Cellini-Brunnen (optional, ≈ 0,15 k)

Lage: Westfreifläche, Mitte `(u, w) = (102, 13)`.

| # | Bauteil-ID | Geometrie | Material |
|---|---|---|---|
| 1 | `cellini_brunnen` | Becken 7 × 7, Rand 1 breit y 1..2; Wasser y 1 innen 5 × 5; Sockel 3 × 3, y 1..5 | `marmor_weiss`, `wasser` |
| 2 | `cellini_buste` | Büste 2 × 2 × 3, y 6..8 auf dem Sockel | `bronze` |

**Vereinfachte Blockfigur, nicht nach Vorbild.** Content-Hinweis wie Welle 1 (K6).

## 8a. Modul 8 – Innenräume und Begehbarkeit (≈ 2 k)

Nach dem Rohbau (Module 0–6) gebaut; jeder ausgestaltete Raum ist ein eigenes Bauteil mit Content-Text (was er zeigt, Quelle, „vereinfacht, nicht nach Vorbild“). Treppen über `tools/wahrzeichen/treppe.js`, Treppenlöcher sind Aussparungen der Decken (Tabellen oben).

| # | Bauteil-ID | Geometrie | Material | lässt aus |
|---|---|---|---|---|
| 1 | `laden_einrichtung` | je Laden (≈ 45; Ost und West): **Tresen** 3 × 1 × 1 (Lage 1) zwei Zellen hinter der Tür quer, **Regal** 4 breit × 1 tief × 3 hoch (Lage 1..3) an der Rückwand, in zwei von drei Läden eine **Goldschmied-Vitrine** (Sockel 2 × 1 × 1 `marmor_weiss` Lage 1, Glas 2 × 1 × 1 Lage 2). Läden schlicht, Goldschmiede und Juweliere seit 1593 ([en](https://en.wikipedia.org/wiki/Ponte_Vecchio)). Freihalten: Zellen 2 breit × 3 tief vor der Tür | `holz`, `marmor_weiss`, `glas_fenster` | Tür-Freiraum, Treppenzellen |
| 2 | `laden_treppen` | **in jedem Laden eine Treppe** EG → OG (Boden OG Oberkante Lage 9): `geradeTreppe`, 3 breit, 9 Stufen, Aufstieg längs der Seitenwand nach hinten (quer zur Tür), Kopffreiheit ≥ 3; Treppenloch 3 × 3 in der Zwischendecke über den oberen Stufen; im OG schlichter Lagerraum (lichte Höhe 4) | `holz` (Treppenblöcke Schwarzeichenholz) | Zwischendecke (Loch) |
| 3 | `loggia_treppe_korridor` | **Treppe von der Loggia in den Korridor** (Spielzugang, nicht belegt): `geradeTreppe`, 3 breit (w −18..−16), **15 Stufen** von Lage 0 (u 84) bis Lage 15 = Gangboden (u 98), Aufstieg nach +u; Treppenloch in `laeden_ost_decke` (Lage 14..15) über den oberen Stufen, Kopffreiheit ≥ 3; Handlauf entfällt | `pietra_serena` (Treppenblöcke) | `laeden_ost_decke` (Loch) |
| 4 | `korridor_bilder` | **Sammlung im Gang:** Bilderfelder 6 × 4 (Rahmen 1 `gold`, Feld 4 × 2 `fresko`, Farbe nach `h(u)` aus Rot, Blau, Gelb, Grün, Braun) auf beiden Innenwänden, **Unterkante Lage 18** (2 über der Gehfläche Lage 16), Abstand 10 in u, ausgespart ±6 um Fenster. Inhalt: die berühmte Autoritratti-Sammlung, „die reichste der Welt“, und Gemälde des 17./18. Jh. ([it](https://it.wikipedia.org/wiki/Corridoio_vasariano)); vereinfacht. Die Bilder liegen in der innersten Wandlage (`d8_K = t_w`) | `gold`, `fresko` | `korridor_waende` (Zellen ersetzt), Fenster |
| 5 | `raum_licht` | Lichtquellen der Rolle `licht` (Seelaterne): Gang **jede 10 Zellen** auf der Mittellinie bei Lage 22 (Gang 7 hoch, Lage 23 beginnt die Decke), Läden 2 je Laden bei Lage 7 (unter der Zwischendecke), Loggia 6, Turm je Geschoss 2; Abstand zu jeder Raumzelle ≤ 12 | `licht` | – |
| 6 | `turm_einrichtung` | Torre dei Mannelli: EG Wachstube (Tisch 3 × 2 × 1, Bänke `holz`), oberstes Geschoss „Panoramasaal“ (Tisch, 4 Bänke); Fenster der Panoramaebene mit Glas, Tür des Turms nur im EG | `holz` | Treppenzellen |

Blöcke: Einrichtung 0,5 k, Ladentreppen 1,2 k (45 · 27), Loggia-Treppe 0,05 k, Licht 0,15 k, Turm 0,1 k ≈ **2 k**. Die Bilder und Böden sind Materialwechsel, kein Blockzuwachs.

Wichtige Prüfungen: **R13** Flutfüllung von der Fahrbahn: alle Läden (Tür 2 × 5), Ladengeschosse (Treppen), Loggia, Gang (Loggia-Treppe und Anschlussstart an den Schnitten), Turm (Tor, Wendeltreppe) erreichbar; **R14** Dichtheit: Ladenfronten und Rückfronten mit Glas, die Westwand des Gangs mit den drei großen Fenstern verglast.

## 9. Schnittstellen

### Zu `uffizi` (Norden)
Schnittebene **x = −528 / −529**. `uffizi` Modul 8 Teil 8 gibt den Querschnitt vor; dieses Projekt setzt ihn mit `korridor_*` und `laeden_ost_decke` fort. Die Brückenmaske `bruecke` zieht die 97 Zellen (x ≥ −528) von `M_COR` ab; die 17 Zellen von r2302811 mit x ≤ −529 (Ecke bei u ≈ −1, w ≈ −10) liegen in `korridor` und gehören diesem Projekt.

### Zu `palazzo_pitti` (Süden)
Schnitt bei **z = 1311 / 1312**: Dieses Projekt endet mit w1394832044 (Via-dei-Bardi-Bogen). Querschnitt am Schnitt: Gang 7 breit, Wände 2 (Streifen ≈ 11 breit), Boden Y 77..78, Decke Y 86..87. `palazzo_pitti` Modul 9 baut ab z ≥ 1312 weiter (Zellen von w1344547176 und w1394832037..43 abzüglich dieser Maske). Keine Stirnwand an diesem Schnitt.

### Zum Stadtgrund
Säulenregel §0.6; Pfeilerspalten ausgespart; Wasser und Bett unter den Bögen vom Stadtgrund; Ufermauern (Lungarno) und Brüstung am Nordufer liegen außerhalb von `M_PV` (die Widerlager reichen bis zur Böschung); Schwellenglättung am Nordende (Lungarno Y 63) und Südende (Y 63).

### Zu Quartieren
Die Quartiere nehmen r2302812, w306692132, w1394832044 (und r5342094 ist kein Gebäude) nicht auf. Überlappungen von `M_PV` mit anderen OSM-Gebäuden (gemessen, **25 Zellen**): r2302811 (17, Lungarno-Arkade mit `uffizi`-ID; die Zellen x ≤ −529 gehören diesem Projekt), w1394832043 (7, Korridorteil mit `palazzo_pitti`-ID; diese Zellen liegen bei z ≤ 1311 und gehören diesem Projekt), w462322705 (1, Wohnhaus, verliert die Zelle). Der Vorrang gilt zellweise (Übersicht Welle 2 §3).

## 10. Blockzahlen (Richtwert)

| Modul | Blöcke |
|---|---|
| 0 Gründung (Pfeiler, Widerlager) | 28 k |
| 1 Gewölbe, Fahrbahn, Auskragungen | 46 k |
| 2 Läden Ost mit Loggia | 25 k |
| 3 Läden West, Terrasse | 25 k |
| 4 Korridor (Brücke, Oltrarno-Anteil) | 22 k |
| 5 Torre dei Mannelli | 15 k (mit Anteilen 19 k) |
| 6 Dächer | 4,5 k |
| 7 Cellini-Brunnen (optional) | 0,15 k |
| 8 Innenräume, Treppen, Licht (Begehbarkeit) | 2 k |
| Mehr durch massiven Unterbau (Mauerkern statt hohler Kammer) | in Modul 4 enthalten (+0,0 k, hier nur 2,9 k Unterbau) |
| **Summe** | **≈ 172 k** (130–230 k) |

≈ 90 Bauschritte. Höchste Einzelteile: `fuellung` 21,9 k, `widerlager_sued` 14,2 k, `pfeiler` 11,4 k, `gewoelbe_ringe` 10,6 k (je mehrere Schritte nach Y-Lagen). Die Schätzung wurde aus den realen Masken nachgerechnet (Wandbänder aus `d8`, Umfang × Dicke × Höhe), nicht aus Faustwerten; in Welle 1 lagen die Bauwerte 15–25 % über der Spezifikation, hier ist ein Zuschlag von 10–15 % eingerechnet.

## 11. Prüfliste
- Maske 10.844 Zellen; kein Bauteil außerhalb (R12 = 0).
- Spannweiten 49 + 9 + 54 + 9 + 49 = 170; Pfeilerfuß Y 47; Kämpfer Y 51; Scheitel Laibung Y 59; Fahrbahn Y 63.
- Korridorboden Y 78, Gang Y 79..85, Decke Y 86..87; **Nordschnitt identisch** mit `uffizi` (Wanddicke 3 / Gang 7).
- Läden: Zeile Ost 13 breit, Westzeile Lücke bei u 82..121 (Terrasse), Loggia Ost mit drei Arkaden.
- Turm Lagen 1..56; Korridor berührt die Turm-Westwand; Konsolen unter y 14.
- Alle Teile ohne Zellkonflikt (K0), `--cross` mit `uffizi`, `palazzo_pitti`, Stadtgrund: 0 Konflikte.
- **Begehbarkeit (R13/R14):** jede Ladentür 2 × 5 offen, in jedem Laden eine Treppe EG → OG, Loggia-Treppe 15 Stufen zum Gang, Gang durchgehend begehbar (Boden Y 78, Gang Y 79..85), Turmtor 3 × 5 und Wendeltreppe 56 Stufen; Fenster verglast; Licht ≤ 12; keine leere Kammer ohne Zugang (Unterbau massiv).
