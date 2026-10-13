# Wahrzeichen Welle 2 (Arno: Ponte Vecchio, Palazzo Pitti) und Stadtgrund – Übersicht (V3 D2)

Spezifikation, **kein Modellcode**. Je Wahrzeichen ein Ordner mit `REFERENZMASSE.md` und `BAUTEIL_KATALOG.md`; dazu die Spezifikation des Stadtgrunds. Plan: [`../STADTMODELL_PLAN.md`](../STADTMODELL_PLAN.md) §4/Phase D. Pipeline: [`../../tools/ARCHITEKTUR.md`](../../tools/ARCHITEKTUR.md) §10. Vorgänger: [`UEBERSICHT.md`](UEBERSICHT.md), [`PRUEFBERICHT_D1.md`](PRUEFBERICHT_D1.md) (K0–K8 gelten, K0 ist in den Katalogen als Spalte „lässt aus“ eingearbeitet). Standard [`../BEGEHBARKEIT.md`](../BEGEHBARKEIT.md) (13.10.2026) ist in den Katalogen eingearbeitet.

## 1. Die Projekte

| Projekt | OSM | Grundfläche | Rahmen (Drehung gegen Modell-x) | `bodenY` | Höhe | Module | Blöcke (Richtwert) |
|---|---|---|---|---|---|---|---|
| [`ponte_vecchio`](ponte_vecchio/BAUTEIL_KATALOG.md) (Brücke, Läden, Torre dei Mannelli, Corridoio bis z = 1311) | Brücke **r5342094** (Fläche, nicht in `gebaeude.json`), Läden **r2302812**, Turm **w306692132**, Korridor **w1344547176** (x ≤ −529, z ≤ 1311) und **w1394832044**; Fahrbahnlinie w24999532 (nur Verlauf) | **10.844** Zellen (Brücke 9.570, Läden 260, Korridor 1.154, Turm 348) | **116,6°** (Ursprung (−539 \| 1058); u über die Brücke nach Süd, w > 0 nach West) | **63** (Fahrbahn Y 63; Pfeilerfuß Y 47) | Korridor Y 87 (Lage 24), Turm Lage 56 + Zinnen = Y 122 | 9 (0–8, davon Cellini optional) | **≈ 172 k** (130–230 k), ≈ 90 Schritte |
| [`palazzo_pitti`](palazzo_pitti/BAUTEIL_KATALOG.md) | Relation **r1637338** (+ Korridor Oltrarno: w1344547176 ab z ≥ 1312, w1394832037..43) | **43.956** Zellen (+ **8.742** Korridor) | **−33,1°** (Ursprung (−1226 \| 1864,5); u entlang der Fassade, w ins Gebäude) | **83** (Aushub 21.023 Zellen mit `groundTopY` ≥ 84) | Gesims Lage 76 = Y 159 (38 m), Dach bis ≈ Y 166; Flügel 11 m | 10 (0–9) | **≈ 0,97 Mio** (0,75–1,25 Mio) ohne Modul 9; **≈ 1,09 Mio** mit Korridor Oltrarno (115 k) |
| [`stadtgrund`](../stadtgrund/SPEZIFIKATION.md) (`type: stadtgrund`) | `flaechen.json`, DGM | 11,36 Mio freie Spalten von 19,97 Mio | – (Kachelraster 15 × 13 zu 320) | Gelände (`groundTopY`) | – | **195 Kachel-Module** | **≈ 15,7 Mio** (15,2–17 Mio), ≈ 8.300 Schritte; Bäume +1,5 Mio optional |
| **Summe Wahrzeichen Welle 2** | | | | | | | **≈ 1,26 Mio** (≈ 630 Bauschritte) |

Alle Wahrzeichen halten den Begehbarkeitsstandard: offene Türen ≥ 2 × 3, Boden je Geschoss, echte Treppenblöcke, verglaste Fenster, Licht ≤ 12; Innenräume als eigene Bauteile mit Quellen (Pitti: Sala Bianca, fünf Planetensäle, Thronsaal, sieben Galerieräume, drei Appartamenti Reali, Scalone; Ponte Vecchio: schlichte Läden mit Ladentreppen, begehbarer Korridor mit Bildern und Fenstern zum Arno, Loggia-Treppe, Turm mit Wendeltreppe).

## 2. Vorrang-IDs (`data/stadt/vorrang.json`) und Quartier-Ausschluss

**Einzutragen** (zusätzlich zu den acht Einträgen der Welle 1):

```json
"r2302812":    "ponte_vecchio",
"w306692132":  "ponte_vecchio",
"w1394832044": "ponte_vecchio",
"r1637338":    "palazzo_pitti",
"w1394832037": "palazzo_pitti",
"w1394832038": "palazzo_pitti",
"w1394832039": "palazzo_pitti",
"w1394832040": "palazzo_pitti",
"w1394832041": "palazzo_pitti",
"w1394832042": "palazzo_pitti",
"w1394832043": "palazzo_pitti"
```
Bestehende Einträge, die bleiben: `w1344547176` → `uffizi` (die Bezeichnung ist nur ein Etikett; der Besitz je Zelle ergibt sich aus den Masken: x ≥ −528 `uffizi`, x ≤ −529 `ponte_vecchio` bis z ≤ 1311, danach `palazzo_pitti`), `r2302811` → `uffizi` (17 Zellen mit x ≤ −529 gehören im Korridor `ponte_vecchio`). **`r5342094` ist kein Gebäude** (nur `flaechen.bruecken`) und braucht keinen Eintrag; die Quartiere bauen keine Gebäude dort.

| ID | Name | Besitzer | Anmerkung |
|---|---|---|---|
| r2302812 | Ponte-Vecchio-Läden (`retail`) | `ponte_vecchio` | 97 Zellen bei x ≥ −528 gehören `uffizi` (`M_COR`) |
| w306692132 | Torre dei Mannelli | `ponte_vecchio` | gewinnt die eine Zelle, die r2302812 teilt |
| w1394832044 | Korridor über die Via dei Bardi (`min_level 2`) | `ponte_vecchio` | liegt fast vollständig in w1344547176 |
| r1637338 | Palazzo Pitti | `palazzo_pitti` | |
| w1394832037..43 | Korridorteile im Oltrarno (`building=yes`) | `palazzo_pitti` (Modul 9) | **Eintrag nötig auch ohne Bau von Modul 9**, sonst entstehen 30 Blöcke hohe Quartierwürfel |

Überlappungen mit anderen Gebäuden (gemessen): `ponte_vecchio` 25 Zellen (r2302811 17, w1394832043 7, w462322705 1); `palazzo_pitti` 1 Zelle (w1394832037). Der Korridor Oltrarno nimmt Zellen von **Santa Felicita** w159394659 (277), w491874543 (126), w491874551 (159) und der Grotta w473825750 (55) in Anspruch; diese Häuser verlieren dort die Zellen (Vorrang).
**Nicht** aufnehmen, bleiben Quartier: **w118131726** („Palazzo Pitti-Mannelli“, ein anderes Gebäude), w159394659 Santa Felicita (Welle 3 Kirche), w473825750 Grotta del Buontalenti (Option Welle 3), r6828015, r6847930, r6847931, w115117245, w477279027, w477279030, w477279032 (Häuser an der Brücke), w306692128 Torre dei Rossi-Cerchi, w462322705, w462322714, w462322718.

## 3. Zellregeln zwischen den Projekten (Ziel: 0 Konflikte im `--cross`-Test)

**Grundlage:** Zelle = ganzzahliges (x, y, z); Rand zählt zum Polygon. Jede Zelle gehört genau einem Projekt.

1. **Wahrzeichen-Vorrang.** Zellen der Masken gehören dem Wahrzeichen; Quartiere bauen dort nicht (`vorrang.json`, `tools/city/parzellen.js` zuerst).
2. **Masken sind paarweise disjunkt** (gemessen für die neuen Masken: `ponte_vecchio` 10.844, `palazzo_pitti` 43.956, Korridor Oltrarno 8.742 haben untereinander und gegen die fünf Welle-1-Projekte 0 gemeinsame Zellen). Gelingt durch Abzug: `ponte_vecchio` zieht `uffizi` ab, `palazzo_pitti` Korridor zieht `ponte_vecchio`, `uffizi` und die Pitti-Hauptmaske ab (`abzugProjekte` mit `abzugAlle`, `abzugHaupt`).
3. **Schnitt Uffizien ↔ Ponte Vecchio:** Ebene **x = −528 / −529**: x ≥ −528 `uffizi` Modul 8 (Teil 8), x ≤ −529 `ponte_vecchio`. Identischer Querschnitt **Platte Y 77..78, Wände Y 79..85 (3 dick), Gang 7 breit, Decke Y 86..87**, keine Stirnwand; das Abstandsfeld des Korridors stammt aus der **ungeschnittenen** Maske. Anschlussstart für R13 an der Schnittebene.
4. **Schnitt Ponte Vecchio ↔ Pitti:** Ebene **z = 1311 / 1312** (Ende von w1394832044): z ≤ 1311 `ponte_vecchio`, z ≥ 1312 `palazzo_pitti` Modul 9. Querschnitt am Schnitt: Gang 7 breit, Wände 2, Boden Y 77..78, Decke Y 86..87. Am Pitti-Ende: Anschlussstück (Luftraum 3) und Tor des Ostflügels (7 × 7, w −31..−25, Gang Y 84..90).
5. **Säulenregel (Stadtgrund gegen Besitzer):** In jeder Spalte baut der Stadtgrund höchstens bis **`tMax = min(groundTopY, minY des Besitzers − 1)`**; Details und die Besitzertabelle: [`../stadtgrund/SPEZIFIKATION.md`](../stadtgrund/SPEZIFIKATION.md) §3.

| Projekt | Maske | `bodenY` | Stadtgrund endet bei | `gelaendeBis` |
|---|---|---|---|---|
| `palazzo_vecchio` | Haupt | 68 | `min(groundTopY, 67)` | `boden` |
| `loggia_dei_lanzi` | Haupt | 67 | `min(groundTopY, 66)` | `boden` |
| `uffizi` | Haupt `M_UF` | 65 | `min(groundTopY, 64)` | `boden` |
| `uffizi` | Korridor `M_COR` | – | `groundTopY` | `frei` |
| `orsanmichele` | Haupt; `bogen` | 68 | `min(groundTopY, 67)`; `groundTopY` | `boden`; `frei` |
| `ponte_vecchio` | alle | 63 | `min(groundTopY, 62)`; Wasserspalten: Wasser und Bett (Y 48..50) | `boden` |
| `palazzo_pitti` | Haupt | 83 | `min(groundTopY, 82)` | `boden` |
| `palazzo_pitti` | Korridor | – | `groundTopY` | `frei` |
| Häuser (Quartiere) | Parzelle | `bodenH` | `min(groundTopY, bodenH − 1)` | – |
| `duomo` | Dom-Spaltenliste | – | `min(groundTopY, minY − 1)` | – |
Gemessen: **0 Konflikte** mit den gebauten Projekten (PV, Loggia, Uffizien, Orsanmichele, Dom).
6. **Wasser und Aussparung:** Wasserspalten baut immer der Stadtgrund (Y `W − 2` Bett, `W − 1`, `W` Wasser), auch unter Brücken. **Ausnahme** `data/stadt/aussparung.json`: Pfeilerspalten (`ponte_vecchio`: Rahmen `PB`, u [55, 64) und [118, 127), w [−23, 23]) bleiben im Stadtgrund leer; das Brücken-Projekt baut dort ab Y 47. Jede weitere Arnobrücke ergänzt ihren Eintrag.
7. **Brückenflächen** (`flaechen.bruecken`, `strassen` mit `bruecke: true`) gehören den Brücken-Projekten; der Stadtgrund ignoriert sie.
8. **Glättung an Schwellen:** Pflaster 6 Blöcke vor den Wahrzeichen auf `bodenY` (PV 68, Loggia 67, Uffizien 65, Orsanmichele 68, Ponte Vecchio 63, Pitti 83), Rücklauf über weitere 6 Blöcke.
9. **Q1 (Anforderung an die Quartiere):** Vorsprünge und Gesimse von Häusern auf freien Spalten nur über `groundTopY` (bzw. dem Stadtgrund-`t_eff`). `--cross` fängt Verstöße.
10. **Luftraum** (R12): `ponte_vecchio` 0; `palazzo_pitti` 3 (Kranzgesims, Kniefenster-Konsolen, Korridor-Anschlussstück).
11. **Dom, Quartiere:** unverändert; der Stadtgrund baut den Domplatz bis `groundTopY` (Y 63–65), der Dom beginnt bei Y 56 bzw. 64.
12. **Wahrzeichen untereinander:** keine gemeinsamen Zellen; Kanten mit Gegenstück nur die beiden Korridor-Schnitte (3 und 4).

## 4. Palette und Pipeline-Anforderungen

**Rollen:** nur vorhandene (`pietra_forte`, `pietra_forte_rustika`, `pietra_forte_bruch`, `pietra_serena`, `mauerwerk`, `pflaster`, `putz_*`, `holz`, `holz_sporto`, `fensterladen`, `glas_fenster`, `dachziegel`, `marmor_*`, `bronze`, `gold`, `fresko`, `wasser`, `gruen_*`, `gelaende_fels`, `licht`). **Zwingende Palettenwünsche:** nur **Treppenblöcke** (Rolle → Treppentyp mit Ausrichtung, Begehbarkeitsstandard). Optional: ein dunkles Grau für Asphalt, ein heller Kalkstein für `pietra_serena`.

**Anforderungen an die Pipeline (vor dem Bau):**
- **S0 (Stadtgrund):** unabhängige Module (`unabhaengig: true`, `--modules` ohne kleinere Module, je Modul ein Grid), Kachel-Generator `tools/city/stadtgrund.js`, R3/R4 je Modul, `--cross` streamend. Grund: Map-Grenze 2^24 und 4096 Tags je Grid, 15,7 Mio Blöcke.
- **Besitzraster** `tools/city/besitz.js`, `data/stadt/besitz_duomo.json`, `data/stadt/aussparung.json`.
- **W0-Erweiterungen** für `project.json`: Maskenquelle **`flaechen`** (OSM-IDs aus `flaechen.json`, nötig für r5342094), **`zMin`/`zMax`**, **`abzugAlle`** (Abzug der Haupt- und Zusatzmasken genannter Projekte), **`gelaendeBis`** (`boden` | `frei`).
- **Begehbarkeit:** `tools/wahrzeichen/treppe.js` (`geradeTreppe`, `podestTreppe`, `wendeltreppe` mit Treppenlöchern), `ctx.oeffnung(zellen, art)`, Palette-Treppen, R13/R14.
- **Quartier Q1** (Vorsprünge nur über dem Gelände).

## 5. Offene Fragen und Empfehlungen

| Nr. | Frage | Empfehlung |
|---|---|---|
| 1 | **Spannweiten Ponte Vecchio:** Literatur 27/30/27 m + Pfeiler (≈ 93 m) gegen OSM-/DGM-Wasserbreite 85,5 m | **OSM gilt**; Modell 49/54/49 Blöcke, Pfeiler 9 (Summe 170). Mit dem Bildindex (A5) prüfen. |
| 2 | **Korridorseite und Fensterlage:** Ostzeile (OSM, de) gegen „Fenster zum Ponte Santa Trinita“ (en, it) | Gang auf der **Ostzeile**, die drei großen Fenster in der **Westwand** des Gangs über der Westfreifläche. |
| 3 | **Cellini-Büste:** West (de, OSM-Lücke) gegen Ost (en) | **West**. |
| 4 | **Höhe Pitti:** 38 m (eine Quelle) gegen „36 m“ (nicht belegt) | **38 m**; Parameter oben in der Moduldatei, Prüfung mit Fotos. |
| 5 | **Achsenzahl Pitti:** 21 (drei Wikipedia-Ausgaben, passt zu 8,2 m Achsabstand) gegen 13 (de) | **21** (`PITTI_AXES`). |
| 6 | **Hanglage Pitti:** 21.023 Footprint-Zellen mit `groundTopY` ≥ 84 (bis 121) | **Eine** Bodenplatte Y 83, Gelände im Footprint abgetragen (Stützwand des Stadtgrunds bis 38 Blöcke); keine zweite Bodenebene. |
| 7 | **Korridor Oltrarno** (z ≥ 1312, 8.742 Zellen): Besitzer | **`palazzo_pitti` Modul 9** (115 k, mit massivem Unterbau); Vorrang jetzt eintragen. Alternative eigenes Projekt `corridoio_oltrarno` nur, wenn Pitti-Bau verschoben wird. |
| 8 | **Torre dei Mannelli:** Höhe 28 m (C) gegen OSM-Pauschale 15 m; Gang am Turm nur 3 breit | **28 m**, Gang 3 × 7 (Bypass auf Konsolen), im Content „geschätzt“. |
| 9 | **Stadtgrund-Umfang** 15,7 Mio Blöcke, 8.300 Schritte | **Kern zuerst** (131 Kacheln, 6,9 Mio), Rand danach; Bäume (+1,5 Mio) nur auf Wunsch. |
| 10 | **Pipeline S0** (unabhängige Module) | **Umsetzen**; Fallback 16 Teilprojekte `stadtgrund_a..p`. |
| 11 | **Reiterstandbild-Koordinate** (Welle 1: „30 m Unstimmigkeit“) | **Geklärt:** (−136 \| 742); Neptunbrunnen nach OSM (−136 \| 790). Kein Widerspruch. |
| 12 | **Wassertiefe 1 m, Wehre** | so lassen (Stadtgrund §7); DGM-Stufe bei x ≈ −2010..−1950 bleibt. |
| 13 | **Mauerhöhen** (Stadtmauer 8 m, Gartenmauer 2,5 m) | bauen, im Content „geschätzt“. |
| 14 | **Uferabgänge zum Arno:** in OSM nicht belegt | **Option S4:** Rampen aus Treppenblöcken dort, wo ein Fußweg am Wasser endet; vor dem Bau messen. |
| 15 | **Loggia-Treppe am Ponte Vecchio** (Gang von der Brücke erreichbar, nicht belegt) | **Bauen** (Spielzugang), Content-Hinweis „kein historischer Zugang“. |
| 16 | **Grotta del Buontalenti** (w473825750) | Welle 3 (Option), nicht jetzt. |
| 17 | **Santa Felicita** verliert 277 Zellen an den Korridor | akzeptieren; Kirche in Welle 3 mit dieser Aussparung. |
| 18 | **Planetensäle und Raumlage im Pitti** (Namen belegt, Lage im Raster geschätzt) | bauen mit Stufe C; bei Fotoprüfung (A5) anpassen. |

## 6. Reihenfolge der Umsetzung (Vorschlag)
1. **Infrastruktur:** W0-Erweiterungen (flaechen, zMax, abzugAlle, gelaendeBis), `treppe.js` und Palette-Treppen, `ctx.oeffnung`, Vorrang-IDs und `aussparung.json`.
2. **S0 und Stadtgrund-Generator** mit den Kacheln der Wahrzeichen (69, 98, 112–114, 127, 128, 140, 141, 155, 156); danach Kern, dann Rand.
3. **Ponte Vecchio** (Module 0–6, danach 8; Cellini optional); `--cross` mit `uffizi` und Stadtgrund.
4. **Palazzo Pitti** Module 0–6, dann 7–8, dann 9 (Korridor Oltrarno).
5. **Abnahme:** `--cross` über `duomo`, `domplatz_ring`, die fünf Welle-1-Wahrzeichen, `ponte_vecchio`, `palazzo_pitti`, Stadtgrund; R12–R14; Sichtprüfung in der Webapp.
