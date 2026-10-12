# Bauteil-Katalog – Orsanmichele (`orsanmichele`, V3 D1)

Verbindlich für die Umsetzung. Maße und Herkunft: [`REFERENZMASSE.md`](REFERENZMASSE.md). Pipeline: [`tools/ARCHITEKTUR.md`](../../../tools/ARCHITEKTUR.md) (§0, §3, §10). Palette: `tools/spec/palette.js` (**Rollen**). Blockzahlen ±30 %.
Projekt `type: "wahrzeichen"`, Moduldateien `projects/orsanmichele/model/m0_*.js` … `m9_*.js`. Bauteile stehen in Bau-Reihenfolge.

## 0. Allgemeine Regeln

### 0.1 Rahmen `OM`
- Ursprung `O = (−298 | 542)`, **θ = +1,0°** (gemessen von +x nach +z).
- `x = O.x + u·cosθ − w·sinθ`, `z = O.z + u·sinθ + w·cosθ` (cosθ = 0,99985, sinθ = 0,01745).
- Rückabbildung: `u = (x−O.x)·cosθ + (z−O.z)·sinθ`, `w = −(x−O.x)·sinθ + (z−O.z)·cosθ`. Rasterung per Rückabbildung der Zellmitte, Intervalle halboffen.
- **Fassadenrichtung:** Lange Seiten (Nord, Süd) = +1,0° gegen die Modell-x-Achse, kurze Seiten (West, Ost) = 91,0°. Das Gebäude ist praktisch an der Domachse (−1,36° gegen Ost im Weltrahmen, x des Modells) ausgerichtet.
- Nominalraster: **u −34..34** (69 Zellen), **w −24..23** (48 Zellen); Mittelachsen u = 0 und w = −0,5.
- **Maske `M_OM`** = Zellen des OSM-Polygons w442508011 (3.303 Zellen, Rand zählt innen). **Jedes Bauteil wird mit `M_OM` geschnitten.** OSM gewinnt. Ausnahme: Luftraum §0.5.
- **Seiten:** N = w −24 (Außenzelle), S = w 23, W = u −34, E = u 34. Tiefe von der Außenkante: `d` = Zellen von außen (`d = 1` Außenzelle): N `d = w + 25`, S `d = 24 − w`, W `d = u + 35`, E `d = 35 − u`.
- **Höhe:** `y_rel = Y − bodenY`, **`bodenY = 68`**; Plattenoberkante Y 68, Lage 1 = Y 69. Höhe in m = `y_rel`/2.

### 0.2 Raster der Seiten (aus Referenzmaßen)
Lange Seiten (entlang u, 4 Pfeiler und 3 Bogenfelder):

| Element | u-Bereich (Zellen) | Mitte |
|---|---|---|
| Pfeiler P0 | −34..−29 | −31,5 |
| Bogenfeld A0 | −28..−14 | −21 |
| Pfeiler P1 | −13..−8 | −10,5 |
| Bogenfeld A1 | −7..7 | 0 |
| Pfeiler P2 | 8..13 | 10,5 |
| Bogenfeld A2 | 14..28 | 21 |
| Pfeiler P3 | 29..34 | 31,5 |

Kurze Seiten (entlang w, 3 Pfeiler und 2 Bogenfelder): Pfeiler Q0 w −24..−19 (Mitte −21,5), Bogenfeld B0 w −18..−4 (Mitte −11), Pfeiler Q1 w −3..2 (−0,5), Bogenfeld B1 w 3..17 (10), Pfeiler Q2 w 18..23 (20,5).
**Eckpfeiler** (6 × 6) gehören zugleich zu zwei Seiten und tragen **je Seite eine Nische**. Insgesamt 10 Pfeiler: 4 Ecken, 4 an den langen Seiten (P1, P2 nord und süd), 2 an den kurzen (Q1 ost und west).

### 0.3 Mauerdicken
EG: Pfeiler bis `d ≤ 6` (massiv); Bogenfelder: **Rücksprung 2** (Zellen `d ≤ 2` im Bogenfeld bleiben, soweit unter dem Bogen, Luft), Füllwand `d` 3..6 (4 dick). Obergeschosse: Wand `d ≤ 3` (3 dick), bündig mit den Pfeilerflächen. Wände massiv, Öffnungen durch die volle Dicke, Glas in der Mittelebene (EG `d = 4`, OG `d = 2`), Rahmen in der Außenlage.

### 0.4 Rollen
`pietra_forte_bruch` (Fundament), `pflaster` (Böden), `pietra_forte` (Pfeiler, Füllwände, glatte Obergeschosse: Pietraforte-Verkleidung laut it.wikipedia), `marmor_weiss` (Bogenringe, Tabernakelrahmen, Fensterrahmen, Mittelstützen), `marmor_ornament` (Wappenschilde, Dreipässe, Kapitelle, Tabernakelbaldachine), `marmor_saeule` (Tabernakelsäulchen), `pietra_serena` (Innenpfeiler, Gewölbe, Gesims), `holz` (Türen), `glas_fenster`, `dachziegel`, `bronze` (Statuen, optional), `fresko` (Farben der Wappen), `mauerwerk` (Hinterfüllung). **Keine Palettenwünsche.**

### 0.5 Luftraum außerhalb der Maske
Nur das **Kranzgesims** (`s` ≤ 2 Zellen, y_rel 70..74) und die **Dachtraufe** (y_rel 75, `s` ≤ 2) dürfen über die Maske hinaus (über Straße). Sonst nichts. Abstand zu den Nachbarn: Orsanmichele steht frei; der nächste Nachbar w1394931261 (Verbindungsbogen) gehört zu diesem Projekt (Modul 8).

### 0.6 Gelände
Säulenregel: Terrain bis Y 67, Bau ab Y 68 (Übersicht §3). `groundTopY` 67 (819 Zellen): keine Fundamentlage nötig. `groundTopY` 69 (115 Zellen): Gelände im Footprint ab Y 68 abgetragen. Anschlusshöhe zur Straße: Straße 66–68, Schwelle Y 68/69, also 0–2 Lagen (sichtbare Sockelstufe).

---

## 1. Modul 0 – Fundament und Boden (≈ 3,5 k)

| # | Bauteil-ID | Geometrie | Material |
|---|---|---|---|
| 1 | `fundament` | Zellen von `M_OM`, Y von `groundTopY`+1 bis 67, wo `groundTopY` < 67 (nur wenige Randzellen) | `pietra_forte_bruch` |
| 2 | `bodenplatte` | Y 68, ganz `M_OM`; Innenraum `d ≥ 7` Pflaster-Raster 3 × 3 abwechselnd `pflaster` / `pietra_serena` | `pflaster`, `pietra_serena` |
| 3 | `sockel_stufe` | Y 69..70 (Lage 1..2) an den **Pfeilern** (Sockel 6 breit), Außenlage `d ≤ 2` | `pietra_serena` |

## 2. Modul 1 – Erdgeschoss: Pfeiler mit Tabernakeln (≈ 9 k)

Lagen y_rel 3..26 (Lage 1..2 sind der Sockel). Pfeiler massiv bis `d ≤ 6`.

| # | Bauteil-ID | Geometrie | Material |
|---|---|---|---|
| 1 | `pfeiler_eck` | 4 Eckpfeiler 6 × 6 (u, w jeweils −34..−29 bzw. 29..34; w −24..−19 bzw. 18..23), y 3..26 | `pietra_forte` |
| 2 | `pfeiler_lang` | P1 und P2 an N und S: u −13..−8 bzw. 8..13, `d ≤ 6`, y 3..26 | `pietra_forte` |
| 3 | `pfeiler_kurz` | Q1 an E und W: w −3..2, `d ≤ 6`, y 3..26 | `pietra_forte` |
| 4 | `tabernakel` | **14 Tabernakel**, je eins pro Pfeilerfläche (N: 4 bei u −31,5/−10,5/10,5/31,5; S: 4 gleich; W: 3 bei w −21,5/−0,5/20,5; E: 3 gleich). Je Tabernakel: Nische 3 breit × 9 hoch × 1 tief (y 8..16), Sockelbank y 7 (5 breit), seitliche Säulchen 1 × 1 (y 8..16, je 1 neben der Nische), Baldachin y 17..19 (5 breit, Dreiecksgiebel: y 17 breit 5, 18 breit 3, 19 breit 1) | Rahmen `marmor_weiss`, Säulchen `marmor_saeule`, Giebel/Wappen `marmor_ornament` |

Die Nischen sind Aussparungen in den Pfeilern (Teile 1–3 lassen die Nischenzellen aus, Teil 4 setzt Rahmen und Baldachin). Keine Symmetrieflagge (die Mitte liegt bei w = −0,5 und `symmetry` kennt nur ganzzahlige Mittelpunkte; R8 nicht beantragen).

## 3. Modul 2 – Erdgeschoss: zugemauerte Bogenfelder mit Maßwerk (≈ 10 k)

10 Bogenfelder: lange Seiten A0, A1, A2 an N und S (6), kurze Seiten B0, B1 an W und E (4). Für jedes Feld gilt die lokale Koordinate `a` = Abstand von der Feldmitte in Zellen (a −7..+7).

**Spitzbogenprofil:** Halbweite 7,5, Kämpfer y_rel 13, Scheitel 22. Zweimittel-Spitzbogen mit Radius ρ = 9,15; die Laibung liegt bei `y_in(a) = 13 + √(ρ² − (|a| + 1,65)²)` für `|a| ≤ 7,5` (0 am Rand, 9 in der Mitte). **Bogenring** (Archivolte): 2 Zellen über `y_in`, `d ≤ 2`, bis Lage 24; darüber bis Lage 26 Spandrille (`d ≤ 2`).

| # | Bauteil-ID | Geometrie | Material |
|---|---|---|---|
| 1 | `fuellwand_sockel` | Füllwand `d` 3..6 im Feld, y 3..11 (unter den Lichten); lässt die Türzellen (Teil 6) aus | `pietra_forte` |
| 2 | `fuellwand_masswerk` | Füllwand `d` 3..6, y 12 bis unter die Laibung `y_in(a)`: **dreiteiliges Maßwerkfenster** (Trifora): Lichten bei `a` −5..−3, −1..1, 3..5, y 12..18 (7 hoch), Glas `glas_fenster` in `d = 4`. Pfosten `a = ±2` `marmor_weiss`, Laibungen `a` ±6..±7 `pietra_forte`. Über den Lichten Bogenfüllung bis zur Laibung `pietra_forte`; in der Mitte (`a` −1..1) ein Vierpass (Kreuz 3 × 3) `marmor_ornament` bei y 20..22, soweit y ≤ `y_in(0)` − 1 | `pietra_forte`, `marmor_weiss`, `glas_fenster`, `marmor_ornament` |
| 3 | `spandrillen` | Zellen `d ≤ 2` im Feld (a −7..7), y 14..26, die weder Luft unter dem Bogen noch Archivolte sind | `pietra_forte` |
| 4 | `bogenringe` | 10 Archivolten wie oben, `d` 1..2, y 13..24 (liegen auf den Pfeilern, Modul 1) | `marmor_weiss` |
| 5 | `statuetten_konsolen` | an jedem Bogenansatz (Kämpfer y 13, Zellen `a = ±7`, `d = 1`) ein Konsolblock 1 × 1 (Statuettenträger) | `marmor_ornament` |
| 6 | `tueren` | zwei Türen **(Lage nicht belegt, Schätzung)**: Nord, Bogenfeld A1 (u 0, 5 breit × 10 hoch, y 3..12) und Ost, Bogenfeld B1 (w 10, 5 breit). Öffnung durch `d` 3..6, Tür `holz` in `d = 5`, Laibung 1 `marmor_weiss` | `holz`, `marmor_weiss` |

Die Füllwand und die Archivolten schließen an die Pfeiler (Modul 1) an (R3). **Die Tabelle gibt die Registrierungs- und Bau-Reihenfolge an.** Teile dürfen keine Zelle gemeinsam belegen; Teil 1 und 2 lassen die Zellen von Teil 6 und die Fensterlichten aus.

## 4. Modul 3 – 1. Obergeschoss (≈ 15 k)

Wand `d ≤ 3`, y_rel 27..51, bündig mit den Pfeilerflächen. Decke Lage 51 gehört Modul 7.

| # | Bauteil-ID | Geometrie | Material |
|---|---|---|---|
| 1 | `og1_wand` | Außenring `d ≤ 3`, y 27..49; Lage 50..51 als Gesims `d ≤ 3` plus Lage 51 | `pietra_forte` |
| 2 | `og1_biforien` | Fenster über jedem Bogenfeld (Achsen: lange Seiten u = −21, 0, 21; kurze w = −11, 10): Außenmaß 7 breit × 12 hoch, y 33..44. Zwei Lichten je 2 breit (a −3..−2 und 2..3), Mittelstütze 1 (a = 0), Rahmen 1 `marmor_weiss`, Glas `glas_fenster` in `d = 2`. | `marmor_weiss` |
| 3 | `og1_wappen` | Wappenschild 2 × 2 über jedem Fenster, y 46..47, Farben abwechselnd (rot, weiß, blau, gelb: Volk, Republik, Zünfte) | `fresko` |
| 4 | `og1_marcapiano` | Lage y_rel 27 (Fußgesims) Außenlage `d = 1`, `s` 0 | `marmor_weiss` |

Teil 1 lässt die Zellen der Fenster (Teil 2) und der Wappen (Teil 3) aus; die Reihenfolge der Tabelle gilt, Teile dürfen keine Zelle gemeinsam belegen.

## 5. Modul 4 – 2. Obergeschoss und Arkadenfries (≈ 14 k)

y_rel 52..74. Wand `d ≤ 3`.

| # | Bauteil-ID | Geometrie | Material |
|---|---|---|---|
| 1 | `og2_wand` | Außenring `d ≤ 3`, y 52..69 | `pietra_forte` |
| 2 | `og2_biforien` | wie `og1_biforien`, aber 10 hoch, y 58..67; Wappen y 69..70 (2 × 2 darüber, dann Wand bis 69: Wappen liegen in `d = 1`) | `marmor_weiss`, `fresko` |
| 3 | `arkadenfries` | y 70..74, Außenring `d ≤ 3`: **Konsolen** alle 6 Zellen (u bzw. w ≡ 0 mod 6 bezogen auf die Pfeilermitte), Lagen 70..71 Vorsprung 1, 72..74 Vorsprung 2 (Luftraum §0.5); dazwischen **Dreipassbogen** (Rundbogen 4 breit, Kämpfer y 72, Scheitel 74, Wand dahinter `d` 3 voll). | `pietra_forte`, Dreipass `marmor_ornament` |
| 4 | `kranzgesims` | y_rel 74, Platte `s` 0..2 über den Konsolen | `pietra_serena` |

## 6. Modul 5 – Dach (≈ 9,5 k)

| # | Bauteil-ID | Geometrie | Material |
|---|---|---|---|
| 1 | `dach` | Walmdach: Traufe y_rel 75 bei `d = 1` (plus Vorsprung 2, §0.5), Anstieg 0,4 je Block ins Gebäude, **höchstens 6** (Plateau y_rel 80, ca. 40 × 20 Zellen), 2 Lagen stark | `dachziegel` |
| 2 | `dachkamm` | Kamm Lage 80, 2 breit entlang der Mittelachse u | `dachziegel` |

## 7. Modul 6 – Innenraum Erdgeschoss (≈ 9 k)

Innenraum (EG) `d ≥ 7`: u −27..27, w −17..16 (55 × 34). Zwei **Schiffe** (Nordschiff w −17..−1, Südschiff w 0..16 beidseits der Mittelreihe), je **3 Joche** (u −27..−10, −9..9, 10..27).

| # | Bauteil-ID | Geometrie | Material |
|---|---|---|---|
| 1 | `innenpfeiler` | zwei freistehende Pfeiler 4 × 4 an u = ±9 (u −11..−8 und 8..11), w −2..1; y 3..13 Schaft, Kapitell y 12..13 | `pietra_serena`, Kapitell `marmor_ornament` |
| 2 | `wandvorlagen` | Halbpfeiler 2 × 2 an den Wänden bei u = ±9 (N und S, `d` 7..8) und bei w = −0,5 (W und E), y 3..13 | `pietra_serena` |
| 3 | `kreuzgewoelbe` | **6 Kreuzgewölbe** (3 Joche × 2 Schiffe): Kämpfer y 14, Scheitel (Laibung) y 22, Dicke 2 (Extrados bis y 24). Gewölbefeld je Joch/Schiff: Länge 18 (u), Breite 16,5 (w). `vaults.groinVault` mit riseX = riseZ = 8 (Fläche: Laibung = max der beiden Tonnen). Gurtbögen 2 breit über den Pfeilerachsen. Verwende `vaults.connectEdges`. | `pietra_serena` |
| 4 | `decke_eg` | Platte y 25..26 über dem Innenraum, Auflager auf Wänden und Pfeilern, Zellen `d ≥ 7` | `pietra_serena` |

## 8. Modul 7 – Obergeschosse innen (≈ 8 k)

| # | Bauteil-ID | Geometrie | Material |
|---|---|---|---|
| 1 | `decke_og1` | Platte y 51 über `d ≥ 4` (innerhalb Wand OG 3) | `pietra_serena` |
| 2 | `decke_og2` | Platte y 74 über `d ≥ 4` | `pietra_serena` |
| 3 | `treppe` | Treppe im Nordwesteck (u −27..−22, w −17..−12): gerade Treppe 6 breit, je 1 Stufe 1 hoch / 1 tief, y 26 → 51 (25 Stufen, zwei Läufe mit Podest) | `pietra_serena` |

## 9. Modul 8 – Verbindungsbogen zum Palazzo dell'Arte della Lana (optional, ≈ 0,9 k)

Way **w1394931261** (OSM, 52 Zellen, `min_level 2`), Westseite, im Rahmen `OM` u −43,4..−34,3, w 5,1..13,2. Eigene Maske `M_BR` = Zellen dieses Polygons (gehört **diesem** Projekt, nicht einem Quartier).

| # | Bauteil-ID | Geometrie | Material |
|---|---|---|---|
| 1 | `pontile` | Boden y 26 (Oberkante = Boden 1. OG, Anschluss an die Westwand), Wände 2 dick y 27..34, Decke y 35..36, Durchgang 5 × 7 (w 6..11) in der Westwand von Modul 3 | `pietra_forte`, Boden `pietra_serena` |
| 2 | `pontile_tuer` | Türöffnung 5 × 7 in der Westwand OG (Zellen `d ≤ 3`, w 6..11, y 27..33); Modul 3 lässt sie aus, **falls** Modul 8 gebaut wird | Laibung `marmor_weiss` |

Die Öffnung (Teil 2) ist nur dann zu schneiden, wenn das Projekt Modul 8 enthält. Ohne Modul 8 bleibt die Wand geschlossen.

## 10. Modul 9 – Statuen und Orcagna (optional, ≈ 0,5 k)

| # | Bauteil-ID | Geometrie | Material |
|---|---|---|---|
| 1 | `statuen` | 14 vereinfachte Blockfiguren in den Nischen (**vereinfacht, nicht nach Vorbild**): Fuß 2 × 1 × 1 (y 8), Körper 2 × 1 × 3 (y 9..11), Kopf 1 × 1 × 1 (y 12); Höhe 5 = 2,5 m (Spanne der Originale 2,03–2,73 m) | `bronze` |

Der Orcagna-Tabernakel im Inneren (1352–59) entfällt.

## 11. Schnittstellen

- **Gelände / Stadtgrund:** Säulenregel (Terrain bis Y 67, Bau ab Y 68), Übersicht §3. Keine gemeinsamen Zellen mit Platz und Straße: Orsanmichele hat keine Überlappung mit Nachbar-Polygonen (gemessen: 0 Zellen) und keine Randberührung.
- **Nachbarn:** Der einzige OSM-Nachbar im Abstand ≤ 2 ist w1394931261 (siehe Modul 8). Orsanmichele steht allseitig frei an Straßen (Via dei Calzaiuoli, dei Lamberti, Orsanmichele, dell'Arte della Lana).
- **Zu anderen Wahrzeichen:** keine Schnittstelle (Abstand zur Loggia dei Lanzi über 280 Blöcke).

## 12. Blockzahlen

| Modul | Blöcke |
|---|---|
| 0 Fundament, Boden | 3,5 k |
| 1 Pfeiler und Tabernakel | 9 k |
| 2 Bogenfelder | 10 k |
| 3 1. OG | 15 k |
| 4 2. OG und Fries | 14 k |
| 5 Dach | 9,5 k |
| 6 Innenraum EG | 9 k |
| 7 Decken, Treppe | 8 k |
| 8 Verbindungsbogen (optional) | 0,9 k |
| 9 Statuen (optional) | 0,5 k |
| **Summe** | **≈ 80 k** (60–105 k) |

≈ 40 Bauschritte.

## 13. Prüfliste
- Dachfirst Y 148 (Lage 80), Traufe Y 143 (Lage 75), Gesimsoberkante Y 142 (Lage 74).
- Tabernakel: 14, davon 4 / 4 (N, S) und 3 / 3 (W, E).
- Außenmaße 69 × 48 gegen OSM-Polygon: alle Zellen in `M_OM`.
- Gewölbescheitel Y 90 (Lage 22) < Deckenunterkante Y 93 (Lage 25).
