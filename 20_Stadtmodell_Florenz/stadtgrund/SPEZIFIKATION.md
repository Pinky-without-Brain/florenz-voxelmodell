# Stadtgrund – Spezifikation (Projekt `stadtgrund`, V3 D2)

Gelände, Straßen, Plätze, Grün, Arno, Ufermauern und Mauern der **ganzen Welt** als **ein** Projekt `type: "stadtgrund"`, konfliktfrei mit allen anderen Projekten (`--cross`). Spezifikation, **kein Modellcode**. Plan: [`../STADTMODELL_PLAN.md`](../STADTMODELL_PLAN.md) §4, Pipeline: [`../../tools/ARCHITEKTUR.md`](../../tools/ARCHITEKTUR.md) §10, Vorbild Welle 1: [`../wahrzeichen/PIAZZA_STADTGRUND.md`](../wahrzeichen/PIAZZA_STADTGRUND.md) (hier verallgemeinert und in einigen Punkten berichtigt). Gemessen am 13.10.2026 mit Skripten im Scratchpad (nicht im Repository) aus `data/stadt/*.json`, `tools/geo/gelaende.js` und den gebauten Projekten.
Stufen: **A** mehrere Quellen, **B** eine Quelle oder gemessen, **C** Schätzung.

## 0. Entscheidungen im Überblick

| Frage | Entscheidung | Abschnitt |
|---|---|---|
| Modulgliederung | **195 Kachel-Module**, Kachel 320 × 320 Spalten (20 × 20 Chunks), Raster 15 × 13 deckt die Welt 4800 × 4160 **genau** ab; Modulnummer `n = j·15 + i` (0..194), Modulgrenze 511 gewahrt; „Stadtteil“ nur im Titel | §2 |
| Pipeline | Das Projekt braucht **unabhängige Module** (jedes Modul eigenes Grid) und eine Kachel-Erzeugung; ohne diese Erweiterung (Anforderung **S0**) lässt es sich nicht bauen | §2.3 |
| Tiefe | **Haut**: oberste Geländezelle plus **Böschungsrand** bis zum niedrigsten Nachbarn, **keine** Tiefenfüllung. Gesamt **≈ 15,7 Mio Blöcke** (statt 0,9 Mrd bei Vollgelände) | §4 |
| Säulenregel | je Spalte `tMax = min(groundTopY, minY des Besitzers − 1)`; Besitzer aus Dom-Spaltenliste, Wahrzeichen-Masken (mit `gelaendeBis`), globalem Parzellenraster der Häuser; **0 Konflikte** gegen die fünf gebauten Wahrzeichen und den Dom gemessen | §3 |
| Brücken | Brückenflächen bleiben bei den Brücken-Projekten; Wasser und Bett baut der Stadtgrund auch unter Brücken, ausgenommen **Pfeilerspalten** (`aussparung.json`) | §3.4 |
| Oberflächen | nur Palettenrollen; Straßen `pflaster`, Hauptstraßen `pietra_forte`, Gehwege `pietra_serena`, Plätze `pflaster` mit Plattenmuster, Wasser 2 Lagen + Bett | §5 |
| Glättung | Pflaster in 6 Blöcken vor Wahrzeichen-Schwellen auf `bodenY` (PV 68, Loggia 67, Uffizien 65, Orsanmichele 68, Ponte Vecchio 63, Pitti 83) | §8 |
| Monumente | Neptunbrunnen (−136 \| 790), Reiterstandbild (−136 \| 742); Koordinaten-Unstimmigkeit geklärt | §7.3 |
| Begehbarkeit (BEGEHBARKEIT.md) | Gefällebegrenzung ≤ 1 auf begehbaren Flächen (Rampen), Außenstufen als **Treppenblöcke**, Mauer- und Brüstungslücken an Wegen; Uferabgänge in OSM nicht belegt (Option S4) | §8a |

## 1. Messbasis (Welt, Gelände, Flächen)

| Größe | Wert | Quelle |
|---|---|---|
| Welt | x −3104..1695, z −1488..2671, **4800 × 4160 = 19.968.000 Spalten**, `groundTopY` 32..203 (Mittel 73,0) | `data/stadt/gelaende.json` |
| Besessene Spalten (alle Polygone aus `gebaeude.json`, Union, plus Dom-Spalten außerhalb der OSM-Polygone) | **8.610.315** (43 %); die Dom-Spaltenliste hat 39.371 Spalten | gemessen |
| **Freie Spalten `U`** (Stadtgrund) | **11.357.685** (57 %) | gemessen |
| Klassen in `U` (Priorität Wasser > Platz > Straße > Grün > Rest) | Wasser 1.068.822; Platz 525.571; Straße 2.948.059 (Linien gepuffert, Mehrfachabdeckung 1,36); Grün 2.227.859; Rest 4.587.374 (Isolato-Höfe 2.144.069, offenes Gelände 2.443.305) | gemessen |
| Vollgelände (Vergleich) | bis Y 0 für alle Spalten **1,46 Mrd**, nur freie Spalten **0,89 Mrd** Blöcke, bis Y 32 **0,82 Mrd** | gemessen |
| Arno | Wasserspiegel (DGM, Median je Wasserspalte) **Y 50** im Zentrum, 51–52 stromauf (x > 280), 41 weit stromab (x < −2100); Anstieg 41 → 50 zwischen x ≈ −2010 und −1950 (Wehr, vermutlich Pescaia di Santa Rosa); an Brücken enthält das DGM **Brückendecks** (Y 53–67) | gemessen, B |
| Ufer | 15.363 Landspalten grenzen an Wasser; Ufer-Band (≤ 10 vom Wasser) 157.514 Spalten, davon steil (Δ ≥ 2 zum 4er-Nachbarn) 7.242; **Kronenspalten** 6.174 | gemessen |
| Steile Spalten gesamt (Δ ≥ 2 zum Nachbarn) | 98.308 | gemessen |
| Mauern (`flaechen.mauern`) | 332 Linien: `city_wall` 11 (Dicke 4, 5.976 Blöcke lang), `wall` 321 (Dicke 1, 24.125 Blöcke); keine Höhenangaben (ein Eintrag `height 0,5`) | `flaechen.json`, `data/osm/mauern_*.json` |
| Kachelraster | 15 × 13 Kacheln zu 320; Gebäudeanteil je Kachel 0–81 %; Kacheln mit ≥ 30 % Gebäuden: 131 | gemessen |

## 2. Projekt und Module

### 2.1 `project.json`
```json
{ "id": "stadtgrund", "title": "Stadtgrund Florenz", "type": "stadtgrund", "generator": "stadtgrund",
  "unabhaengig": true,
  "kacheln": { "x0": -3104, "z0": -1488, "groesse": 320, "spalten": 15, "zeilen": 13 },
  "wasser": { "lagen": 2, "bett": 1, "fenster": 31 },
  "glaettung": { "band": 6, "ruecklauf": 6, "maxDelta": 3 },
  "mauern": { "stadt": 16, "garten": 5 },
  "baeume": false }
```
Der Generator `tools/city/stadtgrund.js` (wie `tools/city/quartier.js`, **keine** Moduldateien `mN_*.js`) erzeugt Module und Bauteile.

### 2.2 Module (Kacheln)
- **Kachel (i, j)** deckt `x ∈ [−3104 + 320 i, −3104 + 320 (i+1) − 1]` und `z ∈ [−1488 + 320 j, −1488 + 320 (j+1) − 1]`; **Modulnummer `n = j · 15 + i`**, 0 ≤ n ≤ 194 (von Nordwest nach Südost, Zeilen von Nord nach Süd). Jede Spalte gehört genau einer Kachel (R1). Kachelgrenzen liegen auf Chunk-Grenzen (320 = 20 · 16, Vorgabe des späteren Minecraft-Exports).
- **Titel:** `Kachel <i>/<j> – <größter benannter Platz oder Wahrzeichen der Kachel, sonst häufigste benannte Straße>`; „Stadtteil“ ist nur Beschriftung, nicht Gliederung. Der Plan nennt „ein Modul je Stadtteil“: Florenz hat im Zentrum etwa zehn Stadtteile (≈ 1,5 Mio Blöcke je Modul, ≈ 700 Schritte); das ist für Grid, Prüfung und Bauanleitung zu groß.
- **Größe:** Blöcke je Kachel **min 23.686 (Modul 84), p10 32.051, Median 63.898, p90 129.750, max 274.170 (Modul 94)**, Summe der Basis (ohne Mauern, Brüstung, Bäume) **15.269.697**. Schritte je Modul (Ziel 1.900 je Schritt): Median ≈ 34, p90 ≈ 68, max ≈ 145; gesamt ≈ **8.300 Schritte** (Plan nannte 25–35 k für die ganze Stadt, davon Straßen/Plätze ≈ 10 Mio Blöcke).
- Wahrzeichen-Kacheln: Dom **69** (i9, j4), Orsanmichele **98**, Uffizien **113/114**, Piazza della Signoria **114**, Ponte Vecchio **112/113/127/128**, Palazzo Pitti **140/141/155/156**, Boboli 156/157.
- **Größte Kacheln** (Hang und Ufer, viele Böschungsränder): 94, 145, 77, 146, 60, 111 (je > 220 k); **kleinste:** 84, 115, 97, 154, 80, 85 (< 29 k).

### 2.3 Pipeline-Anforderung S0 (Voraussetzung)
Ein Grid ist eine JS-`Map` (Obergrenze 2^24 = 16.777.216 Einträge) und höchstens **4096 Tags** (Modul/Bauteil); 15,7 Mio Blöcke passen weder in ein Grid noch in den Speicher der Prüfungen (R3/R4 legen je Block weitere Mengen an). Deshalb:
1. **`unabhaengig: true`**: `--modules n,m` baut **nur** die genannten Module (nicht alle kleineren), jedes in einem eigenen Grid; `--all`/`--project stadtgrund` baut die Module der Reihe nach (je Modul ein Grid, Statistik und `build/report_stadtgrund.json` aggregiert, Emit je Modul nach `webapp/data/stadtgrund/module_N.js`).
2. **R3/R4 je Modul** mit dem Boden-Provider `ground.js` des Projekts (`tools/city/ground_stadt.js`, Standardregel `y ≤ groundTopY` = Kontakt). Alle Stadtgrund-Zellen liegen bei `y ≤ groundTopY` (außer Glättungsanhebung ≤ 3, Mauern, Brüstung) und haben damit Geländekontakt (R4: eine Komponente je Modul genügt, sofern Kontakt).
3. **`--cross`**: `x_projects.js` baut Stadtgrund-Module nacheinander und behält je Modul nur das 2D-Raster (Säule → min/max y); die zellweise Zweitprüfung läuft nur für Säulen mit überlappendem y-Bereich zu anderen Projekten (nach Konstruktion: 0 Überlappungen).
4. **Besitzraster** `tools/city/besitz.js` (§3): liefert für jede Spalte `{art, tMax}`; Eingaben: `data/stadt/gebaeude.json`, `vorrang.json`, `aussparung.json`, `data/stadt/besitz_duomo.json`, `project.json` der Wahrzeichen (`bodenY`, `gelaendeBis`), `tools/city/parzellen.js`.
5. Fallback, falls S0 abgelehnt wird: **16 Teilprojekte** `stadtgrund_a`…`stadtgrund_p` (je ≈ 1 Mio Blöcke, ≈ 12 Kacheln, jedes mit eigener `project.json`, `type: "stadtgrund"`, gleiche Regeln). Das passt in ein Grid (Map-Grenze 16,7 Mio, Prüfspeicher ≈ 1–2 GB je Projekt); Nachteil: Cross-Prüfung (Projektpaare) und Webapp-Gliederung vervielfachen sich. **Empfehlung: S0.**

### 2.4 Reihenfolge
S1 Kern (131 Kacheln mit ≥ 30 % Gebäuden, ≈ 6,9 Mio) → S2 Rand (64 Kacheln, ≈ 8,4 Mio; Hänge, Boboli, Ufer) → S3 optional (Bäume ≈ 1,0–2,5 Mio, Mauern ≈ 0,41 Mio gehören zu S1/S2). Innerhalb S1 zuerst die Kacheln der Wahrzeichen (98, 113, 114, 69, 127, 128, 156).

## 3. Besitz und Säulenregel (exakt)

### 3.1 Prinzip
Jede Zelle gehört genau einem Projekt. Der Stadtgrund belegt in einer Spalte `c = (x, z)` nur Zellen **bis einschließlich `tMax(c)`**; Besitzer anderer Projekte beginnen darüber. **`tMax(c) = min(groundTopY(c), minY(Besitzer, c) − 1)`**. Die Regel ist unabhängig davon, ob der Besitzer schon gebaut ist (Gebäude- und Wahrzeichenmasken sind in den Daten vorhanden).
Prüfreihenfolge der Besitzer je Spalte: (1) Aussparung, (2) Dom, (3) Wahrzeichen-Masken, (4) Häuser, (5) frei.

### 3.2 Besitzer und `tMax`
| Besitzer | Datenquelle | `minY(c) − 1` bzw. `tMax` |
|---|---|---|
| **Dom** | `data/stadt/besitz_duomo.json` (einmal aus dem Dom-Build erzeugt: 39.371 Spalten mit `minY`; Krypta und Ringmauer tragen `minY` 56, Böden 64, Kuppelbereich höher) | `min(groundTopY, minY − 1)`; im Krypta-Bereich 55 |
| `palazzo_vecchio` (Hauptmaske r1461712 inkl. Höfe) | `ladeMasken(...).haupt`, `innen()` | `min(groundTopY, 67)` |
| `loggia_dei_lanzi` (w43284457) | ebenso | `min(groundTopY, 66)` |
| `uffizi` Hauptmaske `M_UF` (w477279033) | ebenso | `min(groundTopY, 64)` |
| `uffizi` Korridormaske `M_COR` (x ≥ −528) | `gelaendeBis: "frei"` | `groundTopY` (Pfeiler, Brücke und Treppe beginnen über dem Gelände) |
| `orsanmichele` Haupt (w442508011) | ebenso | `min(groundTopY, 67)` |
| `orsanmichele` Bogen `bogen` (w1394931261, Boden ab Lage 26) | `frei` | `groundTopY` |
| `ponte_vecchio` (alle Masken, Katalog §0.1) | `gelaendeBis: "boden"` | `min(groundTopY, 62)` (Fahrbahn Y 63; Wasserspalten: Sonderregel §3.4) |
| `palazzo_pitti` Haupt (r1637338 inkl. Höfe) | ebenso | `min(groundTopY, 82)` |
| `palazzo_pitti` Korridor | `frei` | `groundTopY` |
| **Häuser** (Quartiere, auch noch nicht gebaute) | globales Parzellenraster: `tools/city/parzellen.js` über **alle** Gebäude aus `gebaeude.json`, `vorrang.json` zuerst, kleinere ID gewinnt; `bodenH` = **maximale `groundTopY` über die Zellen der Parzelle des Hauses** (genau wie `tools/city/haus.js` `plan.boden`) | `min(groundTopY, bodenH − 1)`; wo `groundTopY < bodenH` also `groundTopY`, wo `groundTopY = bodenH` ein Block darunter |
| frei | – | `groundTopY` (mit Glättung §8) |

**Gemessen:** Wendet man die Regel auf die gebauten Projekte an (Spalten mit `minY ≤ tMax` wären Konflikte), ergeben `palazzo_vecchio` (26.990 Spalten), `loggia_dei_lanzi` (2.080), `uffizi` (39.687), `orsanmichele` (3.837) und `duomo` (39.371) **0 Konflikte**. `domplatz_ring` (257.345 Spalten): `minY − groundTopY ≥ 0` überall (nie darunter), 87.781 Spalten mit `minY = groundTopY` (Bodenplatte auf der obersten Geländezelle): die Regel `bodenH − 1` schließt sie aus.
**Rückfall**, falls das globale Parzellenraster zu aufwendig wird: `tMax = groundTopY − 1` in **allen** Haus-Spalten (ebenfalls konfliktfrei) **und** Änderung des Hausgenerators (Q2): Fundament von `groundTopY` (inklusive) bis `boden − 1`; sonst bleibt unter Hängen eine 1 Block hohe Lücke an den Hausfüßen.

### 3.3 Mantel (Böschungsrand unter fremden Spalten)
In Spalten mit Besitzer baut der Stadtgrund **nur den Mantel**: Zellen `y ∈ (m(c), tMax(c)]`, wobei `m(c)` das **Minimum der Unterkanten der vier Nachbarn** ist (Unterkante eines Nachbarn: sein `tMax`-Wert, bei Wasserspalten `W − 2`, bei Aussparungsspalten `W − 2`). Damit liegt neben jeder tieferen Nachbarspalte keine offene Gelände-Flanke frei (Hänge unter Häusern, Rückseite des Pitti-Aushubs, Kellerkanten). Innenspalten ohne tieferen Nachbarn bekommen **nichts**. Mantel gesamt **491.106 Blöcke**.

### 3.4 Wasser, Brücken, Aussparung
- **Wasserspalten** (OSM-Wasserpolygone) sind **nie** „besessen“: Der Stadtgrund baut Wasser und Bett überall, auch unter Brückenmasken (die Wahrzeichen-Brücken beginnen über Y 50) und unter Häusern, die über Wasser stehen (4.729 Zellen Überlappung; Häuser beginnen bei `groundTopY + 1`).
- **Ausnahme Pfeilerspalten:** `data/stadt/aussparung.json` (§3.5) nennt Spalten, in denen ein Brücken-Wahrzeichen Pfeiler oder Widerlager **unter** dem Wasserspiegel baut. Dort baut der Stadtgrund **gar nichts** (kein Wasser, kein Bett). Das Projekt der Brücke beginnt dort bei Bettunterkante (`ponte_vecchio`: Y 47).
- **Brückenflächen** (`flaechen.bruecken` und `strassen` mit `bruecke: true`) bleiben bei den Brücken-Projekten: Der Stadtgrund **ignoriert** diese Polygone bei der Oberflächenwahl (Wasser bleibt Wasser, Land bleibt Land). Bis eine Brücke gebaut ist, fließt der Arno unter ihrem Polygon einfach durch.
- **Brückenköpfe/Widerlager** im Gelände (Ufer, Rampen) baut die Brücke von `groundTopY + 1` an; Stadtgrund endet bei `tMax`.

### 3.5 `data/stadt/aussparung.json`
```json
{ "quelle": "20_Stadtmodell_Florenz/wahrzeichen/UEBERSICHT_WELLE2.md §3",
  "bruecken": {
    "ponte_vecchio": { "rahmen": { "ox": -539, "oz": 1058, "thetaDeg": 116.6 },
      "rechtecke": [ { "u": [55, 64], "w": [-23, 23] }, { "u": [118, 127], "w": [-23, 23] } ],
      "gilt": "Spalten der Projektmaske M_PV innerhalb eines Rechtecks (u halboffen, Rückabbildung der Zellmitte)" } } }
```
Jede weitere Arnobrücke ergänzt einen Eintrag (Santa Trinita, Grazie, Carraia, Vespucci …).

### 3.6 Weitere Regeln
- **Q1 (Anforderung an die Quartiere):** Vorsprünge und Gesimse von Häusern (Sohlbänke, Konsolen, Marcapiano, Dachüberstand) auf **freien** Spalten dürfen nur Zellen **über `groundTopY`** (bzw. über dem Stadtgrund-`t_eff`, Glättung) belegen; `Kontext.beanspruche` verwirft andere. Der Stadtgrund liegt sonst unter ihnen; der `--cross`-Test fängt Verstöße.
- **Luftraum** der Wahrzeichen (Kranzgesimse, Ballatoio, Konsolen) liegt über Y 100; der Stadtgrund hat dort nichts. Der einzige Luftraum auf Geländehöhe sind die Kniefenster-Konsolen des Pitti (Y 87..88, 1 Zelle außerhalb der Maske); der Stadtgrund endet dort in der Spalte bei Y ≤ 83 (glatt).
- **Reihenfolge der Zellvergabe** innerhalb des Stadtgrunds (Prinzip K0): Oberfläche vor Böschung; Monumente liegen **über** der Oberfläche (Lage ≥ 1), keine Doppelbelegung.

## 4. Tiefe des Geländes (Haut)

**Entscheidung:** Der Stadtgrund baut je freier Landspalte genau die Zellen `y ∈ [bot(c), t(c)]` mit **`t(c)`** = effektive Oberkante (`groundTopY`, ggf. geglättet §8) und **`bot(c) = min(t(c), min der Nachbar-Unterkanten)`** (Nachbar-Unterkante: `t` bei Land, `t − 2` bei Wasser, `tMax` bei besessenen Spalten). Das ist die Oberflächenzelle plus ein **Böschungsrand** bis zur Höhe des tiefsten 4er-Nachbarn. Keine Fundamentfüllung, kein Gelände bis Y 0; unter der Haut gilt „Fundamentannahme Fels“ (R6: Provider `minY 0`).
**Begründung (Blockzahl):**
| Variante | Blöcke |
|---|---|
| Vollgelände bis Y 0, nur freie Spalten | 0,89 Mrd |
| Haut 3 Lagen dick | 34,1 Mio |
| Haut 2 Lagen | 22,8 Mio |
| **Haut 1 Lage + Böschungsrand (gewählt), Wasser 3 Lagen** | **15,3 Mio** (Land 11,54 Mio, Wasser und Bett 3,24 Mio, Mantel 0,49 Mio) |
| nur die Oberflächenzelle, ohne Böschungsrand | 11,4 Mio (hätte Durchsicht an Hängen und Ufern) |
Die Haut ist von oben und von der Seite dicht (keine Durchsicht), weil jede Nachbarflanke bis zum Nachbarn herunterreicht. **Zielbereich: 15–17 Mio Blöcke** mit Mauern und Brüstung; **Bäume optional +1,0–2,5 Mio.** Anderes Tiefenmodell (zusätzliche Skalenstufe „Fels“ unter Hängen) wäre erst bei Schnittansichten nötig. Hebel zum Reduzieren: Randkacheln (64 Kacheln, ≈ 8,4 Mio) mit 1 Lage Haut ohne Mantel/Skirt unter Gebäudelosen Hängen: −0,3 Mio; Gesamtwelt ohne Boboli: −1 Mio.

## 5. Oberflächen je Flächenart

Quellen der Flächen: `flaechen.json` (Polygone; Zellmitte im Polygon nach `tools/city/poly.js`, Rand innen). Die Spaltenzahlen der Tabelle stammen aus einer Scanline-Rasterung ohne die äußerste Zeile und Spalte der Welt (Abweichung zu `poly.contains` < 0,1 %). Priorität je freier Spalte: **Wasser > Platz > Straße > Grün > Rest**; innerhalb der Straßen: **Treppe (`steps`) > Hauptstraße (`primary`, `primary_link`, `busway`) > übrige Straßen > Gehweg (`footway`, `path`, `cycleway`, `track`)**. Brückenpolygone werden ignoriert (§3.4). Alle Rollen aus `tools/spec/palette.js`; **Zufälle sind deterministisch**: `h(x, z) = (Math.imul(x, 73856093) ^ Math.imul(z, 19349663)) >>> 0` (nur auf Koordinaten, nicht auf Zellschlüsseln).

| Fläche | Spalten (U) | Oberfläche (Lage `t`) | Rolle | Teil-ID |
|---|---|---|---|---|
| Straße (Fußgängerzone, Wohnstraße, Service, Gasse) | 1.861.285 | glatte Fläche | **`pflaster`** (Pietra-forte-Pflaster der Altstadt, Annahme des Plans; Stufe C) | `strassen_pflaster` |
| Hauptstraße (Fahrbahn) | 132.492 | glatt | `pietra_forte` (Asphalt-Ersatz, dunkler als Pflaster; Palettenwunsch: ein echtes Dunkelgrau, optional) | `strassen_fahrbahn` |
| Gehweg/Bürgersteig (nur wo kein anderer Straßentyp liegt) | 650.647 | glatt | `pietra_serena` | `gehwege` |
| Treppe | 12.322 | folgt dem Gelände (Stufen entstehen durch Höhenwechsel der Haut) | `pietra_serena` | `stufen` |
| Platz | 525.571 | Plattenmuster §6 | `pflaster` + 12 % `pietra_serena`; Randband `pietra_forte` | `plaetze_pflaster`, `plaetze_rand` |
| Hof/unkartiert im Isolato | 2.144.221 | glatt | `pflaster` (Cortile) | `hof_pflaster` |
| Grün (Park, Wiese, Garten) | 2.205.597 (+ 20.542 steil) | Rasen; steil (Δ ≥ 2) `gelaende_fels` | `gruen_rasen` / `gelaende_fels` | `rasen` |
| Wege im Grün | 286.625 | Kies | `gruen_weg` | `gruen_wege` |
| offenes Gelände | 2.392.661 (+ 40.973 steil) | Rasen / Fels | `gruen_rasen` / `gelaende_fels` | `rasen` |
| Böschung/Skirt/Mantel (alle Zellen unter der Oberfläche) | 1,75 Mio | – | `gelaende_fels`; im Uferband (Wasserabstand ≤ 10) `pietra_forte` | `boeschung` |
| Wasser | 1.068.222 | 2 Lagen `wasser` | `wasser` | `arno_wasser` |
| Flussbett | 1.068.222 | 1 Lage | `gruen_weg` (Kies) | `arno_bett` |

Unter Gebäuden gibt es keine Oberfläche (nur Mantel). Hofböden der Häuser (Zellen in `loecher` der Gebäudepolygone) sind **frei** und gehören dem Stadtgrund (`hof_pflaster`); Wahrzeichen-Höfe gehören dem Wahrzeichen (Hofboden Modul 0).
Palettenwünsche (nicht zwingend): ein dunkles Grau für Asphalt (`kontrast_dunkel` existiert, polierter Tiefenschiefer, aber zu dunkel für ganze Straßen), ein heller Kalkstein für `pietra_serena`.

## 6. Plätze (Muster, verallgemeinert aus `PIAZZA_STADTGRUND.md`)

- **Fläche:** Platzpolygon aus `flaechen.plaetze` (44 Polygone), Spalten frei und nicht Brücke; Verkehrsflächen unter dem Platz gehören dem Platz.
- **Raster:** Platten **8 × 4** (4 m × 2 m, Stufe C), **im Verband** (jede zweite Reihe um 4 versetzt). Rahmen `P` je Platz: **Wahrzeichenplätze** erhalten den Rahmen des maßgebenden Wahrzeichens: Piazza della Signoria Rahmen `PV` (Ursprung (−146,5 \| 887), θ −79,8°), Piazzale degli Uffizi Rahmen `UF` ((−170 \| 907), 17,4°), Piazza dei Pitti Rahmen `PI` ((−1226 \| 1864,5), −33,1°), Domplatz der Domachse (θ −1,36°, Ursprung Kuppelmitte). **Alle anderen Plätze:** θ_p = Richtung der langen Kanten, bestimmt als längengewichtetes Mittel von `4·θ_Kante` über alle Kanten (mod 90°), Ursprung = Minimum von (u, w) über den Platzzellen.
- **Muster:** Plattenindex `(⌊(u + 4·(r mod 2))/8⌋, r)` mit `r = ⌊w/4⌋`; Rolle `pietra_serena` wenn `h(Plattenindex) mod 100 < 12`, sonst `pflaster`. Das Muster ist **nicht belegt** (Stufe C); das Pflaster selbst ist belegt (1385 erstmals, [en.wikipedia](https://en.wikipedia.org/wiki/Piazza_della_Signoria)).
- **Randband:** 2 Zellen `pietra_forte` vor den Fronten von `palazzo_vecchio`, `loggia_dei_lanzi`, `palazzo_pitti` (Zellen im Abstand ≤ 2 von der Maske).
- **Piazza della Signoria** (w23298643): 32.257 Zellen, Median `groundTopY` 67 (66–69), Anhebung vor dem Palast auf 68 (§8). 21 Randzellen gehören dem Palast.

## 7. Arno

### 7.1 Wasserspiegel und Bett
- **Wasserspiegel `W(c)`** für Fluss- und Wasserspalten: Median der `groundTopY` über die Wasserspalten desselben Polygons im Fenster 31 × 31 (Chebyshev 15); Ausreißer (> Median + 2: Brückendecks im DGM) werden auf den Median gesetzt. Teiche (`pond`, Bacino del Nettuno, Brunnenbecken) erhalten den Median ihres Polygons (Y 131–184 auf den Hängen). Ergebnis im Zentrum **Y 50**, stromauf 51–52, stromab 41.
- **Zellen je Wasserspalte:** `W − 2` **Bett** (`gruen_weg`, Kies), `W − 1` und `W` **Wasser**. Wassertiefe 1 m (Stufe C: normale Niedrigwassertiefe der Arno im Zentrum 1–2 m; keine Quelle gefunden). Unter dem Bett gilt Fels. Die Landspalten am Ufer reichen mit ihrer Böschung bis `W − 2` hinunter (Unterkante Wasserspalte).
- **Wehre (Pescaie):** Keine eigenen Bauteile. Der DGM-Anstieg des Wasserspiegels zwischen x ≈ −2010 und −1950 (41 → 50, 9 Stufen auf ≈ 60 Blöcken) bleibt als Stufenfolge erhalten (Pescaia di Santa Rosa, Lage nicht geprüft). Die Pescaia di San Niccolò liegt vermutlich außerhalb des Rasters (Ponte San Niccolò bei Modell x ≈ 2060). Stufe C.

### 7.2 Ufermauer (Lungarni) und Brüstung
- **Ufermauer:** Alle Zellen der Böschung (`boeschung`, §5) in Spalten mit Wasserabstand ≤ 10 (Chebyshev) und Gefälle ≥ 1 zum Nachbarn → `pietra_forte`; die Oberfläche der Landspalten im Uferband mit Gefälle ≥ 2 ebenfalls `pietra_forte` (Mauerkrone und Bermen). Das DGM löst die Mauern des 19. Jh. als Rampe 65 → 50 über 6–8 Spalten auf (Quelle: Messung); das genügt für die Darstellung.
- **Brüstung (Lungarno-Parapet):** Kronenspalte `c`: freie Landspalte mit Wasserabstand ≤ 12, `t(c) ≥ W + 5` und einem 4er-Nachbarn, der näher am Wasser liegt und `t(n) ≤ t(c) − 2` hat. Dort **2 Zellen** `pietra_serena` auf `t(c) + 1 .. t(c) + 2` (Teil `ufer_bruestung`). **Ausgespart:** Spalten im Abstand ≤ 1 von Brücken-/Wahrzeichenmasken und Aussparung. Etwa **6.200 Spalten ≈ 12 k Blöcke** (Stufe C für 1 m Höhe, kein Gitter möglich).
- **Lungarno-Straßen** sind normale Straßenspalten (`pflaster`); Lungarno degli Archibusieri liegt in der Uffizien-Korridormaske (besessen).

## 7.3 Monumente der Piazza della Signoria (aus `PIAZZA_STADTGRUND.md`, berichtigt)

| Objekt | Koordinate | Modell (x \| z), Mittelzelle | Quelle | Stufe |
|---|---|---|---|---|
| **Neptunbrunnen** (Ammannati, 1559–75) | OSM-Weg **w159395911** „Fontana del Nettuno“: 43,7695839 N, 11,2559883 E | **(−136 \| 790)** (Rundung von (−136,5 \| 789,5)) | [Nominatim/OSM](https://nominatim.openstreetmap.org/search?q=Fontana+del+Nettuno+Firenze&format=json), Gegenprobe [en.wikipedia](https://en.wikipedia.org/wiki/Fountain_of_Neptune,_Florence): 43,76958 N, 11,25608 E = (−121,7 \| 790,1) | B |
| **Reiterstandbild Cosimos I.** (Giambologna, 1594) | [it.wikipedia](https://it.wikipedia.org/wiki/Monumento_equestre_a_Cosimo_I): 43°46′11,28″ N, 11°15′21,6″ E = (−135,7 \| 741,5); [en.wikipedia](https://en.wikipedia.org/wiki/Equestrian_Monument_of_Cosimo_I): 43,76981 N, 11,25605 E = (−127,7 \| 739,0) | **(−136 \| 742)** (it, der OSM-gestützten Verschiebung des Neptunbrunnens folgend) | it/en Wikipedia; kein OSM-Objekt gefunden | C (± 4 m zwischen den Quellen, ± 10 m absolut) |

**Berichtigung der Welle 1:** Der Neptunbrunnen stand dort bei (−122,5 \| 790,6) (en.wikipedia); OSM liefert (−136,5 \| 789,5), 15 Blöcke (7,5 m) weiter westlich, direkt an der Nordwestecke des Palazzo Vecchio (Palastecke bei x −146,5; Mindestabstand Mitte → Maske 9 Blöcke). **Die Wikipedia-Koordinaten zeigen eine systematische Ostverschiebung von ≈ 7 m** (am Neptun mit OSM belegt), daher gilt auch beim Reiterstandbild der westlichere it-Wert. Die in Welle 1 genannte **Unstimmigkeit von 30 m** (Beschreibung „vor der Nordecke“, ≈ 60 Blöcke nördlich der Palastecke) ist **keine**: die Palastecke liegt bei z 798,5, das Standbild bei z 742 (57 Blöcke = 28,5 m nördlich), beide Wikipedia-Ausgaben und Wikidata stimmen innerhalb 4 m überein; „vor der Nordecke“ war eine lose Formulierung. Es gilt die Koordinate.
Beide Standorte liegen in `M_PZ` (Platz), `groundTopY` 68 (Becken 229 Zellen alle 68), 0 Zellen in der Palastmaske.

**Neptunbrunnen** (`nettuno_brunnen`, vereinfachte Blockform, Stufe C): Achteck, Apothem **8** (229 Zellen; `rho = max(|dx|, |dz|, (|dx|+|dz|)/√2) ≤ 8`), Mitte (−136 \| 790). Beckenrand: Zellen mit `6 < rho ≤ 8` (100 Zellen), Lage +1..+2 `marmor_weiss`; Wasser: `rho ≤ 6` (129 Zellen), Lage +1 `wasser` (Beckenboden = Platzpflaster Lage 0); Sockel 3 × 3, Lage +1..+6 `marmor_weiss`; Figur „Neptun“: Körper 3 × 2 × 5 (Lage +7..+11), Kopf 1 × 1 × 1 (+12), Dreizack 1 × 1 × 4 (seitlich, Lage +7..+10); acht Randfiguren (Satyrn) je 1 × 1 × 2 auf dem Rand `bronze` (optional). **≈ 0,43 k Blöcke** (Welle 1 nannte 0,9 k, zu hoch).
**Reiterstandbild** (`cosimo_reiter`, Stufe C): Rahmen `PV` (Längsachse in u), Plinthe 6 × 12, Lage +1 `pietra_serena`; Sockel 4 × 10, Lage +2..+6 `marmor_weiss`; Pferd: vier Beine je 1 × 1 × 2 (Lage +7..+8), Körper 7 × 3 × 4 (Lage +9..+12), Hals und Kopf 2 × 2 × 4 (Lage +11..+14), `bronze`; Reiter 2 × 2 × 4 (Lage +13..+16) `bronze`. Gesamthöhe 16 Lagen = 8 m. **≈ 0,40 k Blöcke** (Plinthe 72, Sockel 200, Pferd 108, Reiter 16). **Vereinfachte Blockfigur, nicht nach Vorbild** (Content-Hinweis).
Nicht modelliert: Arengario (liegt im DGM), Herkules und Cacus, David-Kopie, Marzocco, Judith, Savonarola-Platte, Palazzo Uguccioni, Tribunale della Mercanzia (Quartier).

## 8. Glättung an Wahrzeichen-Schwellen

**Regel:** Für jedes Wahrzeichen mit `bodenY` und jede freie Platz- oder Straßenspalte `c` im Chebyshev-Abstand `d ≤ 12` von der Wahrzeichenmaske (`alle`) gilt, falls `|groundTopY(c) − bodenY| ≤ 3` (maxDelta) und die Spalte nicht Wasser ist:
- `d ≤ 6`: **`t(c) = bodenY`** (Pflaster bündig mit der Plattenoberkante, Anhebung nur bis `bodenY`);
- `6 < d ≤ 12`: `t(c) = round(bodenY + (groundTopY − bodenY) · (d − 6)/6)` (Rücklauf in den natürlichen Verlauf).
Die Anhebung geschieht **vor** der Böschungsrandberechnung (§4). Absenkungen (`groundTopY > bodenY`) kommen nur bis `d ≤ 6` vor und folgen derselben Formel (Platz fällt ab).

| Wahrzeichen | `bodenY` | Platz-Niveau davor | Wirkung |
|---|---|---|---|
| `palazzo_vecchio` | 68 | 66–69 (Median 67) | **Pflaster an der Fassade auf 68** (Befund der Welle 1); 6 Blöcke Breite |
| `loggia_dei_lanzi` | 67 | 66–67 | 1 Lage Stufe gewollt (Plattenhöhe 67): keine Anhebung nötig (`d ≤ 6` ergibt 67) |
| `uffizi` | 65 | 65 (Nord 66, Süd 63) | bündig; Piazzale-Enden ±1 |
| `orsanmichele` | 68 | 66–68 | Anhebung bis 2 Lagen; Sockel 1–2 Lagen sichtbar |
| `ponte_vecchio` | 63 | Lungarno 63–64 | Nord- und Südende der Fahrbahn auf 63 |
| `palazzo_pitti` | 83 | Fassade 81–83 | Vorplatz 6 Blöcke auf 83, Platzneigung (8,5 % bis w = −200) sonst unverändert |

## 8a. Begehbarkeit im Freien (Standard [`../BEGEHBARKEIT.md`](../BEGEHBARKEIT.md))
Spielfigur 1,8 hoch, Stufe 1 Block (Auto-Sprung), Fallen bis 3 erlaubt. Gemessen auf den **3.471.059 begehbaren Spalten** (freie Straßen-, Platz-, Weg-, Treppen-, Hofspalten ohne Wasser): benachbarte Paare mit Höhenunterschied 1: **296.440**, 2: **12.278**, ≥ 3: **3.376**.
1. **Gefällebegrenzung (Rampen):** Vor der Böschungsberechnung (§4) werden begehbare Nachbarspalten mit `|Δt| ≥ 2` iterativ angenähert (höhere −1, niedrigere +1, je Spalte höchstens ±3 insgesamt, nicht im Glättungsband der Wahrzeichen, nicht über Mauern und Brüstungen hinweg) bis `|Δt| ≤ 1`. Das macht aus den 12.278 Paaren mit Δ = 2 durchgehende Rampen aus Stufen zu 1 Block; Paare mit Δ ≥ 3 (3.376, echte Stützmauern) bleiben als Barriere (Gehweg endet an der Mauer, Umweg über Treppe).
2. **Außenstufen als Treppenblöcke:** An jedem Übergang Δ = 1 zwischen begehbaren Spalten wird die **Oberflächenzelle der höheren Spalte** ein **Treppenblock** (Material nach Rolle der Fläche: `pflaster` → Polierter-Tuff-Treppe, `pietra_serena` → Steintreppe, `pietra_forte` → Andesittreppe), **Aufstieg von der niedrigeren zur höheren Spalte** (Ausrichtung N/O/S/W; bei zwei tieferen Nachbarn in verschiedenen Richtungen oder bei Ecken bleibt es ein voller Block, Auto-Sprung genügt). Voreinstellung `treppenblock: "stufen"`: Spalten innerhalb `steps`-Polygonen (**12.322**) und alle Übergänge auf **Plätzen** und in **Fußgängerstraßen**; Option `"alle"`: bis 296.440 Ersatzzellen. Ersatz heißt **kein Blockzuwachs**. Stufen der Wahrzeichen (Portale, Sockel) bauen deren Projekte; der Stadtgrund liefert nur die glatte Anschlusshöhe (§8). Bauteil `stufen` enthält die Treppenblöcke (Teil 7 der Liste).
3. **Gehwege durchgehend begehbar:** `gehwege` und Straßenflächen liegen nebeneinander mit Δ ≤ 1 (Punkt 1); Mauern, Brüstung, Bäume, Brunnenbecken entfallen in Straßen-, Weg-, Platz- und Treppenspalten (Tore und Durchlässe), die Stadtmauer hat Lücken, wo ein Straßenpolygon sie kreuzt (Stadttore, Porta San Niccolò, Porta Romana); Brüstung nicht auf Spalten mit Weg oder Treppe zum Ufer.
4. **Uferabgänge:** In den OSM-Daten ist **kein** `steps`-Polygon im Umkreis von 12 Blöcken um Wasser belegt (gemessen: 0). Die Lungarni sind daher oben durch die Ufermauer mit Brüstung geschlossen; der Arno ist vom Land aus nicht zu betreten. **Option S4** (Empfehlung: bauen, Stufe C): **Abgänge** dort, wo ein `footway`/`path`-Polygon höchstens 2 Blöcke vom Wasser endet: Rampe aus Treppenblöcken (Gefälle 1 : 1, Breite 3) vom Lungarno bis `W + 1` (Wasserlinie), Brüstung dort unterbrochen; Anzahl vor dem Bau messen.
5. **Türschwellen:** Vor jeder deklarierten Tür/Tor eines Wahrzeichens liegt die Oberfläche auf `bodenY` (Glättung §8), sodass keine Stufe > 1 bleibt.
6. **Dichtheit/Licht:** Der Stadtgrund hat keine Innenräume; Lichtquellen entfallen (Platz- und Straßenbeleuchtung nicht vorgesehen).
7. **Palette-Erweiterung:** Treppenblöcke brauchen je Rolle einen Treppentyp mit Ausrichtung (`pflaster`, `pietra_serena`, `pietra_forte`, `mauerwerk`, `holz` …); siehe Pipeline-Aufgabe der Begehbarkeit.

## 9. Mauern (`flaechen.mauern`)

| Typ | Spalten (frei) | Höhe | Rolle | Teil-ID |
|---|---|---|---|---|
| `city_wall` (Dicke 4; Forte di Belvedere, Stadtmauern des Oltrarno) | 18.413 (Spalten im Abstand ≤ 2,0 von der Linie) | **16 Lagen (8 m)**, Stufe C (keine Höhenangabe; ca. Festungsmauern) | `pietra_forte_bruch` | `mauern_stadt` |
| `wall` (Dicke 1, Garten- und Grundstücksmauern) | 22.456 (Linie, 4-verbunden) | **5 Lagen (2,5 m)**, Stufe C | `mauerwerk` (Krone `pietra_serena`) | `mauern_garten` |

Mauerzellen liegen auf `t(c) + 1 .. t(c) + h` (Hanglage: Höhe ab Oberfläche je Spalte). Mauern auf Hauspolygonen (besessen) und im Wasser entfallen. Zusammen **≈ 0,41 Mio Blöcke** (295 k + 112 k). Optional ausblendbar (Gestaltung): `wall` ohne Quelle für die Höhe.

## 10. Bäume (optional, S3)
Park- und Gartenpolygone (`gruen`: `park` 1.444.720, `garden` 498.678 freie Spalten; `grass` ohne Bäume). Raster 9 × 9 (Spalte `x mod 9 = 0`, `z mod 9 = 0` plus Versatz `h mod 3 − 1`), nur in Spalten ohne Weg und im Abstand ≥ 3 zu Gebäuden und Straßen. **Vereinfachter Baum:** Stamm 3 Lagen `gruen_stamm`, Krone 5 × 5 × 2 und 3 × 3 × 1 `gruen_baum` (**≈ 62 Blöcke**, nicht nach Vorbild). Anzahl bei Raster 9: **≈ 24.000 Bäume ≈ 1,5 Mio Blöcke** (Raster 7: 2,5 Mio; Raster 11: 1,0 Mio). Teil `baeume`; Standard `baeume: false`, weil Bäume den Blockumfang um 10 % erhöhen und die Sicht auf Fassaden verstellen.

## 11. Bauteile je Kachel-Modul (Reihenfolge)

Jede Kachel registriert (soweit nicht leer) in dieser Reihenfolge; Bauteil-IDs snake_case, eindeutig je Modul (**≤ 18 Teile × 195 Module = 3.510 Tags**, auch in einem Grid unter 4096):

| # | Bauteil-ID | Zellen |
|---|---|---|
| 1 | `boeschung` | alle Zellen unter der Oberfläche (Haut-Rand, Mantel) |
| 2 | `arno_bett` | Bett (Kies) |
| 3 | `arno_wasser` | Wasser 2 Lagen |
| 4 | `strassen_pflaster` | Oberfläche der übrigen Straßen |
| 5 | `strassen_fahrbahn` | Hauptstraßen |
| 6 | `gehwege` | Gehwege |
| 7 | `stufen` | **Treppenblöcke** (Treppenflächen, Übergänge auf Plätzen und Fußgängerstraßen, §8a) |
| 8 | `plaetze_pflaster` | Platzmuster |
| 9 | `plaetze_rand` | Randband an Wahrzeichenfronten |
| 10 | `hof_pflaster` | Höfe und unkartierte Isolato-Flächen |
| 11 | `rasen` | Rasen und offenes Gelände (inkl. steil: `gelaende_fels`) |
| 12 | `gruen_wege` | Kieswege im Grün |
| 13 | `ufer_bruestung` | Brüstung auf der Ufermauer |
| 14 | `mauern_stadt` | Stadtmauer |
| 15 | `mauern_garten` | Gartenmauern |
| 16 | `nettuno_brunnen`, `cosimo_reiter` | nur Modul 114 |
| 17 | `baeume` | optional |

Die Oberfläche und die Zellen darunter gehören verschiedenen Bauteilen (K0). Reihenfolge: Böschung zuerst (Auflager), dann Oberflächen, dann Aufbauten (R3: Aufbauten stehen auf der Oberfläche).

## 12. Blockzahlen (Richtwert)

| Posten | Blöcke |
|---|---|
| Land (Oberfläche + Böschungsrand) | 11,54 Mio |
| Wasser und Bett (3 Zellen je Wasserspalte, 1,07 Mio Spalten) | 3,24 Mio |
| Mantel unter fremden Spalten | 0,49 Mio |
| Mauern (Stadt 0,295 Mio, Garten 0,112 Mio) | 0,41 Mio |
| Brüstung | 0,012 Mio |
| Monumente | 0,001 Mio |
| **Summe (ohne Bäume)** | **≈ 15,7 Mio** (15,2–17 Mio) |
| Bäume (optional, Raster 9) | +1,5 Mio |
| Gefällebegrenzung und Treppenblöcke (§8a) | ±1 % (Ersatz, kein Zuwachs) |

Je Kachel siehe §2.2 (min 23,7 k, Median 63,9 k, max 274,2 k). ≈ **8.300 Bauschritte**. Wie in Welle 1 sind Böschungen und Hänge die größte Unsicherheit (+10–25 %); die Spaltenzahlen sind gemessen, nicht geschätzt.

## 13. Schnittstellen
- **Wahrzeichen und Quartiere:** Säulenregel §3 (Tabelle), `gelaendeBis` je Maske (W0-Erweiterung, Übersicht Welle 2 §6), Q1 für Vorsprünge.
- **Dom:** Spalten aus `besitz_duomo.json`; Domplatz (Platz-Polygon) baut der Stadtgrund bis `groundTopY` (Y 63–65), der Dom beginnt bei Y 56 bzw. 64.
- **Brücken:** `aussparung.json`, Ignorieren der Brückenpolygone, Wasser und Bett durchgehend.
- **`ground.js`:** `tools/city/ground_stadt.js` (re-exportiert), `minY 0`, `maxY 511`.
- **Webapp:** je Modul `webapp/data/stadtgrund/module_N.js`, Kachelraster als Stadtplan-Ebene.

## 14. Prüfliste
- 195 Module, `n = j·15 + i`, Summe der Basis **15.269.697** (±1 %), Spalten je Kachel ≤ 102.400.
- `--cross` gegen `duomo`, die fünf Wahrzeichen und `domplatz_ring`: **0 Zellkonflikte**; Spalten, in denen Besitzer und Stadtgrund einander im y-Bereich überlappen, nur an Böschungen (Warnung).
- Wasserspiegel Y 50 am Ponte Vecchio, 41 stromab bei x = −3000, Bett `W − 2`; Pfeilerspalten Ponte Vecchio leer.
- Pflaster an der PV-Fassade Y 68, Pitti-Vorplatz Y 83, Loggia 67, Uffizien 65.
- Platz Signoria: 8 × 4 Platten im Verband, 12 % `pietra_serena`; Neptunbrunnen 229 Zellen Achteck, Reiterstandbild bei (−136 \| 742).
- Kein Gitter, keine Stufenblöcke, keine Zäune; nur Rollen der Palette.

## 15. Offene Fragen und Empfehlungen
1. **Umfang 15,7 Mio Blöcke / 8.300 Schritte.** Empfehlung: Kern zuerst (S1, 6,9 Mio), Rand (S2) nach Sichtprüfung; Bäume nur auf Wunsch.
2. **Pipeline S0.** Empfehlung: umsetzen (kleine, klar abgegrenzte Änderungen in `tools/build.js`, `tools/model/world.js`, `tools/validate/x_projects.js`); Fallback 16 Teilprojekte.
3. **Wassertiefe 1 m / Wehre.** Empfehlung: so lassen; erst bei Sichtprüfung der Arno-Ränder nachbessern.
4. **Mauerhöhen** (8 m Stadtmauer, 2,5 m Gartenmauer) ohne Quelle. Empfehlung: bauen, Content-Hinweis „geschätzt“.
5. **Straßenmaterial** (Pietra-forte-Pflaster auch auf Hauptstraßen?). Empfehlung: Hauptstraßen `pietra_forte` und Palettenwunsch „dunkles Grau“ nach Sichtprüfung entscheiden.
6. **Hang unter dem Pitti** (Aushub 21.023 Zellen, Stützwand bis 38 Blöcke). Empfehlung: akzeptieren (Referenzmaße Pitti §6.3).
