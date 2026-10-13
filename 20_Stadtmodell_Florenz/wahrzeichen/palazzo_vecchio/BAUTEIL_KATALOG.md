# Bauteil-Katalog – Palazzo Vecchio (`palazzo_vecchio`, V3 D1)

Verbindlich für die Umsetzung. Maße und Herkunft: [`REFERENZMASSE.md`](REFERENZMASSE.md). Pipeline-Regeln: [`tools/ARCHITEKTUR.md`](../../../tools/ARCHITEKTUR.md) (§0, §3, §10). Palette: `tools/spec/palette.js` (nur **Rollen**, die Typen wählt `ctx.palette.typesForRole`). Blockzahlen sind Richtwerte ±30 %, größere Abweichungen sind ein Befund.
Bauteile stehen **in Bau-Reihenfolge**, die Bauteil-IDs sind verbindlich. Dies ist ein Projekt `type: "wahrzeichen"` mit den Moduldateien `projects/palazzo_vecchio/model/m0_*.js` … `m9_*.js`.

---

## 0. Allgemeine Regeln

### 0.1 Koordinaten und Rahmen
- **Weltrahmen:** x Ost, z Süd, y oben; Ursprung Kuppelmitte (`frame.js`). Zellmitte = ganzzahlige Koordinate.
- **Maske `M_PV`:** alle ganzzahligen Zellen (x, z), die im OSM-Polygon der Relation **r1461712** liegen (Außenring minus die vier Löcher; Rand zählt innen, `tools/city/poly.js` `contains`). **Jedes Bauteil wird mit `M_PV` geschnitten** (Ausnahme: ausdrücklich erlaubter Luftraum, §0.6). OSM gewinnt für den Grundriss.
- **Fassadenrahmen `PV`** (für alle lokalen Maße dieses Katalogs):
  - Ursprung `O = (−146,5 | 887,0)` (Südecke der Westfassade), Drehwinkel **θ = −79,8°** (gemessen von +x nach +z).
  - `x = O.x + u·cosθ − w·sinθ`, `z = O.z + u·sinθ + w·cosθ` (cosθ = 0,1771, sinθ = −0,9842).
  - Rückabbildung: `u = (x−O.x)·cosθ + (z−O.z)·sinθ`, `w = −(x−O.x)·sinθ + (z−O.z)·cosθ`.
  - **u** läuft entlang der Piazza-Fassade nach Nord (u 0 = Süd, 89,9 = Nord), **w** nach Ost ins Gebäude. Die Fassadenrichtung (Westfassade, Kante E17–E20) liegt bei **−79,8° gegen die Modell-x-Achse**, das sind **10,2° gegen die Modell-z-Achse**, der Palast ist also nicht an der Domachse ausgerichtet.
  - **Rasterung durch Rückabbildung:** Für jede Weltzelle wird (u, w) aus der Zellmitte berechnet und das Prädikat des Bauteils mit **stetigen** u, w ausgewertet (Intervalle halboffen `[a, b)`). So entstehen keine Löcher durch Drehung.
- **Höhe:** `y_rel = Y − bodenY`, **`bodenY = 68`**. Fußbodenplatte auf Y 68, Lage 1 = Y 69. Höhe in m = `y_rel`/2 (Oberkante Lage n liegt n/2 m über der Plattenoberkante).
- **Kantenrahmen `K_i`** (Außenring, Reihenfolge wie `gebaeude.json`, im Uhrzeigersinn auf der Karte): Ursprung = Startpunkt der Kante, `u` entlang A→B, **`w` nach innen = (−dz, dx)/L**. Löcher: `w` zeigt vom Loch weg (ins Mauerwerk).

### 0.2 Zonen (Priorität in dieser Reihenfolge, erste Übereinstimmung gilt)
| Zone | Definition (Weltpolygon, OSM-Teil) | Inhalt | Traufe |
|---|---|---|---|
| **T** Turm | w361442653: (−138,5 \| 842), (−124,5 \| 844,5), (−128,5 \| 866), (−142 \| 863,5); lokal u 23,9–45,7, w 0–14,1 | Turmschaft | – |
| **A** Arnolfo-Block | w361442652: lokal (0 \| 0), (17,3 \| −0,1), (23,9 \| 0,3), (45,7 \| −0,1), (80,7 \| −0,3), (89,9 \| 0,1), (90,5 \| 9,1), (89,1 \| 57,6), (9,4 \| 57,8), (−11,4 \| 57,9), (−10,4 \| 52,2) | Hauptfassade mit Ballatoio | Zinnen 62 |
| **P** Südblock | w361442647: Weltpunkte (−84,5 \| 912), (−91,5 \| 908,5), (−88 \| 888), (−63 \| 895), (−57,5 \| 896,5), (−63 \| 921) | Via della Ninna | 56 |
| **B** Ostblock | w361442654: (−57,5 \| 896,5), (−63 \| 895), (−47,5 \| 809), (−22 \| 809), (−0,5 \| 809), (102,5 \| 820,5), (56 \| 926,5), (22,5 \| 972), (−24,5 \| 936), (−63 \| 921) | Rückbau, Salone | 56 |
| **M** Mittelstreifen | Rest von `M_PV` (Viereck (−74 \| 809,5), (−47,5 \| 809), (−63 \| 895), (−88 \| 888)) mit den Lichthöfen | Zwischenbau | 56 |

### 0.3 Mauerbänder und Dicken
`d8(c)` = Chebyshev-Abstand der Zelle zum nächsten Nicht-Maskenpunkt (Randzelle = 1, flächenverbunden wie im Quartiergenerator). Der **Außenring** ist der Rand von `M_PV` ohne die Löcher; **Lochränder** gehören Modul 6.
Dicke `t(y_rel)`: 1..16 → **5**; 17..49 → **4**; 50..55 → **3**; Turmschaft → 4. Ein Wandband ist `{c : d8(c) ≤ t(y)}`. Wände sind massiv (kein Hohlkern), Öffnungen gehen durch die volle Dicke. Eine Zelle gehört genau einem Bauteil (R1 wirft sonst).
- **Fensterrahmen** liegen in der äußersten Lage (`d8 = 1`), **Glas** in `d8 = 2` (`glas_fenster`), Laibung massiv.
- **Fugen der Rustika (Bugnato):** Quaderlagen 2 Lagen hoch, Läufer 4 Blöcke lang im Verband (Versatz 2 je Lage). Jede Quaderfuge in `y_rel` gerade auf der äußersten Lage `d8 = 1` bleibt Wandmaterial (kein Relief). Ein Relief ist nicht vorgesehen. Die Rolle `pietra_forte_rustika` trägt den Eindruck.

### 0.4 Rollen
`pietra_forte_bruch` (Fundament), `pflaster` (Böden, Hofboden), `pietra_forte_rustika` (EG), `pietra_forte` (Obergeschosse Zone A, Turm, Konsolen, Zinnen), `marmor_weiss` (Fensterrahmen, Portalrahmen, Mittelstützen), `marmor_ornament` (Dreipässe, Wappentafel, Kapitelle), `marmor_saeule` (Säulen), `pietra_serena` (Pfeiler, Gesimse im Hof), `putz_sand` (Putz Zonen M, P, B), `glas_fenster`, `holz` (Portaltür), `dachziegel` (Dächer, Turmdach), `bronze` (Marzocco-Fahne), `fresko` (Stemmi: Farben der Keramikblöcke), `gold` (Kapitellbänder im Michelozzo-Hof). **Keine Palettenwünsche.** Gitter und Zäune (Ringhiera) entfallen, weil es nur volle Blöcke gibt.

### 0.5 Gelände und Sockel
- Terrain und Plattenhöhe: Säulen von `M_PV` gehören dem Projekt ab der Höhe **min(`groundTopY`+1, 68)**. Liegt `groundTopY` ≥ 68 (West und Nordwest, 6.438 Zellen), wird das Gelände **im Footprint bis Y 67 gelassen und ab Y 68 vom Palast ersetzt**. Der Stadtgrund baut in diesen Säulen höchstens bis Y 67, siehe Übersicht §3 (Säulenregel).
- Liegt `groundTopY` < 67, füllt Modul 0 das Fundament von `groundTopY`+1 bis 67 (`pietra_forte_bruch`, innen) und den sichtbaren Sockel außen mit Rustika (2 Zellen, `d8 ≤ 2`). Maximal 6 Lagen (1.503 Zellen mit `groundTopY` 61 im Südosten an der Via dei Leoni).
- **Anschlusshöhen:** Der Palast steht an der Westfassade auf dem Piazza-Niveau (Platzpflaster 67–68), an der Via dei Leoni 6–7 Lagen über der Straße. Das ist **gewollt** und als Sockel sichtbar.

### 0.6 Erlaubter Luftraum außerhalb der Maske (nur diese Fälle)
1. **Ballatoio Zone A:** Auskragung nach außen bis **3 Zellen** (Abstand `d_out ≤ 3` vom Außenring) in `y_rel` 50..62, nur über Straßen/Platz, nicht in die Polygone der Uffizien (Abstand ≥ 14 Blöcke).
2. **Turm-Ballatoio:** Auskragung um 3 Zellen gegenüber dem Turmgrundriss in `y_rel` 145..160, auch über die Piazza.
3. **Korridorbrücke** (gehört `uffizi`).
Alle anderen Teile bleiben in `M_PV`.

### 0.7 Baureihenfolge und Baubarkeit (R3)
Von unten nach oben: Fundament → Boden → Wände → Gesims → Dach. Auskragungen und Bögen kommen nach ihren Auflagern. Jede Wand hat über die Platte Bodenkontakt (Y 68 = `bodenY`, `ground`-Provider `groundTopY`, siehe `spec/ground.js` des Projekts: re-exportiert `tools/city/ground_stadt.js`).

---

## 1. Modul 0 – Fundament, Sockel und Boden (≈ 82 k)

| # | Bauteil-ID | Geometrie | Material |
|---|---|---|---|
| 1 | `fundament` | Zellen von `M_PV` (inkl. Lochsäulen = Hofboden-Unterbau), Y von `groundTopY`+1 bis 67, nur wo `groundTopY` < 67 | `pietra_forte_bruch` |
| 2 | `sockel_rustika` | Band `d8 ≤ 2` des **Außenrings**, Y von `groundTopY`+1 bis 67 (überschreibt Teil 1 in diesen Zellen: Teil 1 lässt sie aus) | `pietra_forte_rustika` |
| 3 | `bodenplatte` | Y 68, alle Zellen von `M_PV` einschließlich der Löcher (Hofböden) | `pflaster`, Wandband `d8 ≤ 5` des Außenrings `pietra_forte_bruch` |

Teil 3 darf nicht in Zellen liegen, die schon Teil 1 oder 2 belegen (andere Y). Symmetrie: keine.

## 2. Modul 1 – Erdgeschoss mit Rustika (≈ 47 k)

Wandband t = 5, Y 69..84 (y_rel 1..16), **nur Außenring**. Die Decke y_rel 16 ist Teil von Modul 9.

| # | Bauteil-ID | Geometrie | Material, Öffnungen |
|---|---|---|---|
| 1 | `eg_wand_west` | Kante E17–E20 (Fassade, u 0–90), Zone A | `pietra_forte_rustika`. **Fensterachsen** u = 5 + 10k, k = 0..8 (Parameter `PV_AXES` = 9): Fenster 3 breit × 6 hoch, y_rel 6..11, Rahmen `pietra_forte`. **Portal** bei u = 55 (ersetzt Fenster k = 5): Öffnung 8 breit × 12 hoch, y_rel 1..12, Marmorrahmen 2 breit `marmor_weiss`, Sturz y_rel 13..14 `marmor_weiss`, Wappentafel 4 × 3 `marmor_ornament` in y_rel 15..17 (das reicht in Modul 2: Teil 2 lässt diese Zellen aus), Tür in `d8 = 3..4` `holz`. |
| 2 | `eg_wand_nord_sued_a` | Zone A, Kanten E0–E1 (Nord, Via dei Gondi) und E16 (Süd, Via della Ninna) | wie 1; Achsen mit Teilung 10 vom Südende der Kante, Rest an den Enden. **Tramontana-Portal** auf E1 bei u_K = 24: 6 × 10 mit Tympanon `marmor_weiss`; **kleine Tür** auf E16 bei u_K = 40 (3 × 6, Via della Ninna). |
| 3 | `eg_wand_mittelbauten` | Zonen M, P, B (Kanten E2–E15) | `pietra_forte_rustika`, Fenster 3 × 5, y_rel 7..11, Achsabstand 8. **Via-dei-Leoni-Portal** (Buontalenti 1549, [it.wikipedia](https://it.wikipedia.org/wiki/Palazzo_Vecchio)) auf Kante E9 bei u_K = 57,9 (Mitte, geschätzt): 8 × 14 mit Keilsteinbogen `pietra_serena` und Wappen `marmor_ornament`. |
| 4 | `eg_dogana_tuer` | Kante E5–E7 Nordseite Zone B bei x = −35 (Dogana-Tür) | 3 × 6 mit Zinnenkrone (Dreiergruppe Zinnen y_rel 14..15) `pietra_serena`. Optional. |

Jede Wandzelle gehört zu genau einem der Teile 1–4 (Zone und Kante entscheiden).

## 3. Modul 2 – Obergeschosse mit Biforien (≈ 73 k)

Wandband t = 4, 1. OG y_rel 17..33 (Decke 33 ist Modul 9), 2. OG 34..49 (Decke 49 ist Modul 9). **Nur Außenring.**

| # | Bauteil-ID | Geometrie | Material, Öffnungen |
|---|---|---|---|
| 1 | `og1_wand_west` | Fassade u 0–90, y_rel 17..33 | `pietra_forte`. **Bifora** an jeder Achse u = 5 + 10k: Außenmaß 7 × 11 (u−3 … u+3, y_rel 20..30). Rahmen 1 Zelle `marmor_weiss`, zwei Lichten je 2 breit, Mittelstütze 1 `marmor_weiss`, Glas `glas_fenster` in `d8 = 2`. **Dreipass:** oberste Zeile jeder Lichte `marmor_ornament`. Gesims **Marcapiano** y_rel 17, 1 Zelle vorspringend (Luftraum: nur in den Maskenzellen, also hier als Wandlage `d8 = 1` farbig `marmor_weiss`). |
| 2 | `og2_wand_west` | Fassade, y_rel 34..49 | wie 1, Bifora y_rel 37..46 (10 hoch), Marcapiano y_rel 34. |
| 3 | `og_wand_nord_sued_a` | Zone A, E0–E1 und E16, y_rel 17..49 | wie 1/2 (Achsen mit Teilung 10, Rest an den Enden). |
| 4 | `og_wand_mittelbauten` | Zonen M, P, B | `putz_sand`; Fenster 3 × 7 Rahmen `pietra_serena`, Achsabstand 8: 1. OG y_rel 20..26, 2. OG y_rel 37..43; Fensterläden `fensterladen` in `d8 = 1` links und rechts jedes Fensters je 1 breit (optional). |
| 5 | `og_korridor_durchgang` | Zone P, Kante E14–E15 (Südwestecke, Weltpunkte (−84,5 \| 912) → (−91,5 \| 908,5) → (−97 \| 906,5)), 7 breit zentriert (Kantenabschnitt t ∈ [3,35 ; 10,35] der 13,7 langen Polylinie), y_rel 34..40 | **Öffnung** (Luft) in den ersten 4 Zellen von innen: Schnittstelle zur Korridorbrücke, siehe §11. |

Bauteil 5 ist eine Aussparung. Sie wird in Teil 3 und 4 als **Ausschluss** (nicht als eigenes Bauteil mit Blöcken) behandelt: die beiden Teile lassen diese Zellen aus. Das Bauteil 5 setzt eine 1 Zelle starke Laibung `marmor_weiss` an den seitlichen Rändern (y_rel 34..41, 2 Zellen breit, `d8 ≤ 4`).

## 4. Modul 3 – Ballatoio und Zinnen (Palastkrone, ≈ 8 k)

Nur Zone A, alle freien Kanten (Westfassade E17–E20, Nord E0–E1, Süd E16) **und** die Ostseite von A (Grenze zu Zone M/P, dort steht die Brüstung über dem Dach der Nachbarn). Das Bauteil wird als Ring um den Rand von A gebaut. **Konsolbogen-Raster p ≈ 5** (Bogenzahl n = rund(L/5), Teilung L/n, Westfassade: n = 18 → p = 4,99).

| # | Bauteil-ID | Geometrie (lokal an der Kante: `u` entlang, `s` = Abstand nach außen von der Wandebene, `s = 0` Wandebene) | Material |
|---|---|---|---|
| 1 | `gesims_marcapiano` | Lage y_rel 49, Vorsprung `s` 0..1 | `pietra_forte` |
| 2 | `konsolen` | y_rel 50..55: Konsolen (1 breit) bei u ≡ 0 (mod p): y 50..51 Vorsprung 1, y 52..55 Vorsprung 3. Zwischen den Konsolen **Rundbogen** (4 breit, Kämpfer y_rel 53, Scheitel 55, Bogen 1 stark), Bogenfeld dahinter in der Wandebene Rückwand (t = 3, `d8 ≤ 3`); **Stemmi** je Bogen: 2 × 2 Zellen in y_rel 51..52 an der Rückwand, abwechselnd `fresko`-Farben rot / weiß / blau / gelb (Wappen: Volk, Lilie, Fiesole-Florenz, Papst, Signoria, Parte Guelfa, Anjou) | `pietra_forte`; Stemmi `fresko` |
| 3 | `ballatoio_boden` | y_rel 56, Platte bis `s` = 3 (über den Konsolen), nach innen bis `d8 ≤ 5`. **Wurflöcher (Caditoie):** 2 × 1 Zellen (`s` 1..2) in der Plattenmitte jedes zweiten Bogens (u ≡ p·(2j+1)/2), durchgehend | `pietra_forte` |
| 4 | `bruestung` | y_rel 57..60, Ring `s` 2..3 (2 dick) | `pietra_forte` |
| 5 | `zinnen_guelfisch` | y_rel 61..62, quadratische Zinnen 3 breit × 2 hoch, Lücken 2 (Teilung 5, auf die Konsolbögen ausgerichtet; Zinne über jedem Bogenmittelpunkt), auf Ring `s` 2..3 | `pietra_forte` |
| 6 | `eckmarzocchi` | vier Eckpunkte des Ballatoio-Rings (Ecken des Rechtecks A): 2 × 2 × 3 Nischenblock mit Löwe: Sockel `pietra_serena` 2 × 2 × 1, Figur `marmor_weiss` 2 × 2 × 2 (Marzocchi in den Ecknischen, [it.wikipedia](https://it.wikipedia.org/wiki/Palazzo_Vecchio)) | optional |

Der Ring umläuft A durchgehend; an der Grenze zu M/P enden Konsolen und Brüstung der Ostseite auf Dachhöhe von M (Y-Ebene y_rel 57, Flachdach). Der Turm (Zone T) unterbricht den Ring **nicht**: Brüstung und Zinnen laufen bündig an der Fassade, ab y_rel 63 setzt Modul 4 an.

## 5. Modul 4 – Turm: Schaft (≈ 30 k)

Zone T (Grundriss 21,8 × 14,1), massive Wand `t = 4` außen (Wandband `d8_T ≤ 4`, bezogen auf das Turmpolygon), Innenraum hohl (Treppenhaus-Hohlraum, keine Stufen). Die Wand in y_rel 1..62 liegt **innerhalb von Zone A** und ist als Innenwand in Modul 9 enthalten (Teil `turm_unterbau` dort). **Dieses Modul beginnt bei y_rel 63.**

| # | Bauteil-ID | Lagen | Geometrie | Material |
|---|---|---|---|---|
| 1 | `schaft_63_104` | y_rel 63..104 | Turmpolygon, Wandband 4, Hohlkern | `pietra_forte` |
| 2 | `schaft_105_144` | y_rel 105..144 | wie 1; **Schlitzfenster** je Seite: 1 × 6 Luftzellen, y_rel 112..117 und 130..135, mittig auf jeder Seite (u-Mitte), Glas entfällt (Luft). | `pietra_forte` |
| 3 | `schaft_abschlussdecke` | y_rel 144 | Deckenplatte über dem Hohlraum (Auflager der Krone) | `pietra_forte` |

Die Westflucht des Schafts liegt in der Fassadenebene (w = 0). Das Aufschwingen „in falso“ der Turmvorderseite (Vorkragung) ([it.wikipedia](https://it.wikipedia.org/wiki/Palazzo_Vecchio)) wird **nicht** modelliert.

## 6. Modul 5 – Turm: Glockenstube und Krone (≈ 5,5 k)

Bezug: Turmpolygon `T` (Mitte lokal u 34,8 / w 7,0, Maße 21,8 × 14,1). `T+k` = Turmpolygon um k Zellen nach außen versetzt (Rechteck um k vergrößert), `T−k` nach innen.

| # | Bauteil-ID | Lagen | Geometrie | Material |
|---|---|---|---|---|
| 1 | `turm_konsolen` | 145..152 | Konsolfries: Ring `T+3` minus `T`. Lagen 145–146 Versatz 1, 147–148 Versatz 2, 149–152 Versatz 3. Konsolpfeiler bei Umlaufteilung 3 (jede 3. Zelle), dazwischen Spitzbogenfelder 2 breit mit Scheitel in Lage 152 (Zellen frei, Rückwand = Schaft). | `pietra_forte` |
| 2 | `turm_ballatoio` | 153..160 | Boden Lage 153 (Platte `T+3`), Brüstung Lagen 154..158 Ring `T+3` minus `T+1` (2 dick), **ghibellinische Zinnen** Lagen 159..160: 3 breit, Teilung 5; in Lage 160 ist die mittlere Zelle jeder Zinne frei (Schwalbenschwanz) | `pietra_forte` |
| 3 | `glockenstube` | 153..160 | Wand `T` (Schaftwand weiter, `t = 4`) mit **vier Spitzbogenöffnungen** (3 breit × 6 hoch, Lagen 154..159, je eine pro Seite mittig), Innenraum hohl (drei Glocken: 3 × `bronze`-Blöcke 2 × 2 × 3 an Lagen 154..156, **optional**) | `pietra_forte` |
| 4 | `edikula` | 161..176 | Aufbau `T−3`: vier Eckpfeiler 2 × 2, Lagen 161..176 `pietra_serena`; Säulenköpfe Lagen 169..170 `marmor_ornament`; **Rundbögen** zwischen den Pfeilern (Kämpfer 171, Scheitel ≈ 175, Laibung 1 stark) auf den Langseiten (~ 11 breit → je 2 Bögen) und Schmalseiten (je 1 Bogen); Boden Lage 161 (Platte `T−3`) | `pietra_serena` |
| 5 | `turmdach` | 177..184 | Walmdach über `T−2`: Anstieg 1 je Lage, bis die Firstlinie erreicht ist (≈ Lage 181), darüber Stange 1 × 1 bis Lage 184 | `dachziegel`, Stange `bronze` |
| 6 | `marzocco_fahne` | 185..188 | Blockfigur: Fuß 2 × 2 Lage 185, Körper 2 × 3 Lagen 186..187, Kopf 1 Zelle Lage 188 (Löwe mit Lilie, **vereinfacht**), auf der Stange | `bronze` (Gold wäre `gold`) |

Alle Aufbauten stehen auf Platten, die an die Wand darunter anschließen (R3). Die Turmspitze (Lage 188 = 94 m) liegt bei Y 256.

## 7. Modul 6 – Innenhöfe (≈ 40 k)

Bänder um die vier **Löcher** des Polygons (`polygon.loecher[0..3]` in `gebaeude.json`). `d_H` = Chebyshev-Abstand zum Loch (Randzelle des Materials = 1).

| Loch | Weltpunkte | lokal (PV) | Funktion |
|---|---|---|---|
| 0 | (44 \| 861), (2 \| 854), (−3,5 \| 885), (24,5 \| 906) | u 11,6–59,3, w 140–183, 1.505 Zellen | Cortile della Dogana, zweiter Hof |
| 1 | (−100 \| 855,5), (−119 \| 853), (−122,5 \| 874), (−105 \| 878,5) | u 15,7–39,2, w 21–40,2, 416 Zellen | **Michelozzo-Hof** |
| 2 | (−76 \| 861,5), (−65,5 \| 863,5), (−64 \| 854), (−74,5 \| 852) | u 37,5–47,2, w 64,7–75,6 | Lichthof |
| 3 | (−79 \| 876,5), (−80 \| 885,5), (−70,5 \| 886,5), (−69 \| 877,5) | u 13,3–23,1, w 64,6–74,7 | Lichthof |

| # | Bauteil-ID | Geometrie | Material |
|---|---|---|---|
| 1 | `michelozzo_arkade` | Loch 1, EG y_rel 1..16, Band `d_H ≤ 7`. **Arkadenwand** `d_H` 1..2 mit Säulen: Säulen 2 × 2 an den Ecken und im Abstand ≈ 8 (je Seite `n = rund(L/8)` Bögen: Nord/Süd 3, Ost/West 2; Teilung L/n). Schaft y_rel 1..8, Kapitell 9..10 `marmor_ornament`, Bandring 7 `gold`. **Bögen:** Scheitel immer y_rel 14, Kämpfer 14 − r (r = (Teilung − 2)/2), Archivolte 1. Spandrillen bis y 16 voll. **Gang** `d_H` 3..5 hohl (hier keine Decke, Kreuzgewölbe entfallen; die Decke y_rel 16 ist Modul 9). **Rückwand** `d_H` 6..7 massiv mit je einer Tür (3 × 8) mittig im Joch, `pietra_forte`. | `marmor_saeule`, Bögen/Archivolten `pietra_serena`, Wand `pietra_forte` |
| 2 | `michelozzo_obergeschosse` | Loch 1, y_rel 17..49, Band `d_H ≤ 3`; Fenster 4 × 8 über jeder Arkadenöffnung (y 20..27 und 37..44), Glas in `d_H = 2`; Gesims y_rel 17 und 34 (`d_H = 1`) | `pietra_forte`, Rahmen `marmor_weiss`, Glas `glas_fenster` |
| 3 | `dogana_pfeiler` | Loch 0, y_rel 1..16, Band `d_H ≤ 8`: Pfeiler 4 × 4 `pietra_serena` im Abstand 12 (n = rund(L/12) je Seite, 13 Joche insgesamt), Bögen mit Scheitel y_rel 14 (r = 4), Spandrillen bis 16; Rückwand `d_H` 7..8 | `pietra_serena`, Wand `pietra_forte` |
| 4 | `dogana_obergeschosse` | Loch 0, y_rel 17..49, Band `d_H ≤ 3`, Fenster 4 × 8 pro Joch | `putz_sand`, Rahmen `pietra_serena`, Glas |
| 5 | `lichthoefe` | Löcher 2 und 3, y_rel 1..49, Band `d_H ≤ 4`, kleine Fenster 2 × 4 im Abstand 8 (y 9..12, 25..28, 41..44), Glas in `d_H = 2` | `putz_sand` |
| 6 | `hoefe_attika` | Löcher 0..3, y_rel 50..56, Band `d_H ≤ 3` (Attika und Dachrand) | `putz_sand`, Gesims y_rel 56 `pietra_serena` |

Die Böden der Höfe (Y 68) gehören Modul 0. Die Hofwände dürfen kein Dach tragen (die Löcher bleiben offen).

## 8. Modul 7 – Dächer (≈ 55 k)

| # | Bauteil-ID | Zone | Geometrie | Material |
|---|---|---|---|---|
| 1 | `dach_arnolfo` | A (ohne T) | verdecktes Walmdach hinter der Brüstung: Traufe y_rel 57 an der Innenkante der Brüstung (`d8 > 3`), Anstieg 0,4 je Block, **höchstens 4** (Oberkante 61 < Zinnen 62) | `dachziegel`, 2 Lagen stark |
| 2 | `terrasse_mittelbauten` | M, P | Flachdach: Platte y_rel 57 über `d8 > 3` (Decke 56 liegt in Modul 9), Brüstung y_rel 58 (1 hoch) am Außenring, **nicht** an Grenzen zu A, B | `pietra_serena` Platte, Brüstung `putz_sand` |
| 3 | `dach_ostblock` | B (ohne Salone-Rechteck) | Walmdach: Traufe y_rel 57, Anstieg 0,4 je Block, höchstens 10 | `dachziegel` |
| 4 | `dach_salone` | Salone-Rechteck (siehe Modul 9) | **Satteldach**, First parallel zur Längsachse (u-Achse), Traufe 57, First 66 (Anstieg 9 über die halbe Breite 26: 0,35 je Block), Giebel an den Schmalseiten | `dachziegel`, 2 Lagen |

Die Dachflächen werden wie in `tools/city/haus.js` über dem Chamfer-Abstandsfeld zum Rand erzeugt und am Turm (Zone T) sowie an den Lochrändern ausgespart.

## 9. Modul 8 – Erweiterungen hinten, Dachgeschosse und Ostfassade (≈ 16 k)

Außenwandband t = 3 der Zonen M, P, B in y_rel 50..56 (Dachgeschoss, Traufe Zone B/M/P = 56) und die Besonderheiten der Rückseite.

| # | Bauteil-ID | Geometrie | Material |
|---|---|---|---|
| 1 | `dachgeschoss_mittelbauten` | Außenband t = 3, Zonen M, P, B, y_rel 50..55, Fenster 2 × 3 im Abstand 8 (y 52..54) | `putz_sand` |
| 2 | `traufgesims_ost` | y_rel 56, `d8 ≤ 3` plus Vorsprung 1 (Luftraum 1 Zelle nur im Maskenrand): hier **Wandlage `d8 = 1` gefärbt** | `pietra_serena` |
| 3 | `salone_giebel` | Giebelwände der Salone-Schmalseiten (Nord- und Südwand des Salone-Rechtecks) von y_rel 57 bis zur Dachkante des Satteldachs, 2 dick | `putz_sand` |
| 4 | `ostbau_strebepfeiler` | Via-dei-Leoni-Fassade (Kante E9): Lisenen 3 breit × 56 hoch im Abstand 16 (an den Ecken beginnend), `d8 ≤ 2`, Vorspringen entfällt | `pietra_forte` |
| 5 | `ostbau_eckquader` | Kanten-Ecken von B (Eckzellen 3 × 3, y_rel 1..56) abwechselnd Läufer/Binder | `pietra_forte_rustika` |

Keine Symmetrie. Teil 4 und 5 überschreiben **nicht** Teile aus Modul 1 und 2: sie liegen in Zellen, die dort ausdrücklich **ausgelassen** sind (die Module 1/2 lassen an B-Kanten die Eckzellen und Lisenenzellen frei).

## 10. Modul 9 – Decken, Innenwände und Salone (≈ 115 k)

| # | Bauteil-ID | Geometrie | Material |
|---|---|---|---|
| 1 | `decke_eg` | y_rel 16: Zellen von `M_PV` mit `d8 > 5` (Innenraum), ohne Löcher und ohne Lochbänder (Modul 6) und ohne Turmhohlraum | `pietra_serena` |
| 2 | `turm_unterbau` | Turmwand y_rel 1..62 (Band 4 auf Turmpolygon, **ohne** die Fassadenzellen, die Modul 1/2 schon belegt), Hohlraum frei, plus Zwischendecken ausgespart | `pietra_forte` |
| 3 | `decke_og1` | y_rel 33: `d8 > 4`, ohne Löcher, ohne Salone-Rechteck | `pietra_serena` |
| 4 | `decke_og2` | y_rel 49: `d8 > 4`, ohne Löcher, ohne Salone-Rechteck | `pietra_serena` |
| 5 | `decke_dach` | y_rel 56: `d8 > 3`, ohne Löcher, ohne Salone-Rechteck (Auflager der Dächer Modul 7) | `pietra_serena` |
| 6 | `salone_waende` | **Salone dei Cinquecento** (Lage geschätzt, Maß belegt): im Fassadenrahmen `PV` Außenrechteck **u −18..94, w 88..140** (112 × 52), Lichtmaß **u −14..90, w 92..136** (104 × 44 = 52 × 22 m), lichte Höhe y_rel 17..52 (36 = 18 m); Wände (4 dick) y_rel 17..56 | `putz_sand`, Rahmenpfeiler `pietra_serena` |
| 7 | `salone_decke` | y_rel 53 über dem Lichtmaß (Kassettendecke vereinfacht: Raster 8 × 8 abwechselnd `holz` / `pietra_serena`) und y_rel 54..56 bis zur Traufe massiv | `holz`, `pietra_serena` |
| 8 | `innenwaende_a` | Querwände in Zone A: je 2 Wände entlang u (Abstand 20) und w (Abstand 24), 2 dick, y_rel 1..49 mit Türen 3 × 8 an den Kreuzungen. Tragende Innenwände sind **optional**; ohne sie ca. −20 k. | `pietra_forte` |
| 9 | `treppen_michelozzo` | gerade Treppe im Michelozzo-Hof-Gang (zum Salone): 33 Stufen (y_rel 1→33), je 1 hoch × 1 tief, 6 breit, entlang der Hofrückwand Nordseite | `pietra_serena` |

Die Salone-Decke liegt in der Decke der oberen Geschosse (Teil 5 spart das Rechteck aus). Der Salone gehört ausschließlich Teil 6/7; die Decken `decke_og1` und `decke_og2` lassen sein Außenrechteck frei. **Die Lage des Salone im Grundriss ist nicht belegt** (Fragen in der Übersicht).

## 11. Schnittstellen

### Mit dem Terrain (Stadtgrund)
Säulenregel §0.5: Terrain bis Y 67, Palast ab Y 68 (Hofböden inklusive). Anschlusshöhen: Piazza-Platz (Stadtgrund, `groundTopY` 67–69) und Westfassade bündig bei Y 68–69.

### Mit der Piazza (Stadtgrund)
Keine gemeinsame Zelle: Die Piazza-Fläche (Polygon w23298643) überlappt `M_PV` in 21 Randzellen; **`M_PV` hat Vorrang** (Übersicht §3). Der Arengario (Plattform vor der Fassade) liegt im DGM, nicht im Modell.

### Mit dem Projekt `uffizi` (Corridoio Vasariano)
- **Brücke** über die Via della Ninna: Zellen des Teils w328477211 (OSM-Brücke, `building=bridge`, `min_level 3`) in der Maske des Korridors; sie gehören **`uffizi` Modul 8**. Das PV baut nur die Wandöffnung.
- **PV-Seite:** Kante E14–E15 (Südwestecke Zone P), Polylinie (−84,5 \| 912) → (−91,5 \| 908,5) → (−97 \| 906,5), Länge 13,7. **Öffnung** 7 breit (Kantenabschnitt t 3,35..10,35) × 7 hoch, **y_rel 34..40** (Y 102..108), Tiefe: die 4 äußeren Zellen der Wandlage; Laibung `marmor_weiss` 1 stark. Brückenboden **Oberkante Y 101** (= Decke 1. OG, Modul 9 `decke_og1`), Gehfläche Y 102.
- **Cell rule:** PV belegt keine Zelle außerhalb von `M_PV` auf Höhe y_rel 34..40 an dieser Kante. Die Brücke beginnt in der ersten Zelle außerhalb der Maske.

### Mit der Loggia dei Lanzi
Kein gemeinsamer Rand (kürzester Abstand PV-Südwestecke (−146,5 \| 887) zur Loggia-Nordostecke (−163 \| 879,5): 18,1 Blöcke, dazwischen Piazza). Keine Regel nötig.

### Mit Nachbargebäuden
Einzig Nachbar im Abstand ≤ 2: w328477211 (die Brücke, gehört `uffizi`). Der Palast steht frei, an allen Seiten Straße oder Platz.

---

## 12. Blockzahlen (Richtwert)

| Modul | Blöcke |
|---|---|
| 0 Fundament, Sockel, Boden | 82 k (Fundament 58 k, Platte 24 k) |
| 1 Erdgeschoss | 47 k |
| 2 Obergeschosse | 73 k |
| 3 Ballatoio, Zinnen | 8 k |
| 4 Turm-Schaft | 30 k |
| 5 Turm-Krone | 5,5 k |
| 6 Innenhöfe | 40 k |
| 7 Dächer | 55 k |
| 8 Erweiterungen hinten | 16 k |
| 9 Decken, Innenwände, Salone | 115 k (ohne `innenwaende_a` ≈ 95 k) |
| **Summe** | **≈ 470 k** (350–620 k) |

Bausch ≈ 470.000 / 2.100 ≈ 225 Schritte.

## 13. Prüfliste für die Abnahme
- Turmoberkante Y 256 (Lage 188), Palast-Zinnenoberkante Y 130 (Lage 62).
- Alle Zellen innerhalb `M_PV` (außer den zwei Luftraumfällen §0.6).
- Summen der Geschosshöhen: 16 + 17 + 16 + 6 + 1 + 4 + 2 = 62 und 62 + 82 + 8 + 8 + 16 + 8 + 4 = 188.
- Öffnung der Korridorbrücke bei Y 102..108, Brückenzelle außen ist **leer** bis zum `uffizi`-Projekt.

## 14. Nachrüstung B2 (13.10.2026): dicht, begehbar, ausgestaltet
Standard: `20_Stadtmodell_Florenz/BEGEHBARKEIT.md`. Code: `projects/palazzo_vecchio/model/pv_plan.js` (Belegungsplan), `pv_innen.js` (Wände, Treppen), `pv_raeume.js` und `pv_raeume2.js` (Räume), `pv_risse.js` (Fugenblöcke). `project.json` trägt `"begehbarkeit": "pflicht"`; R13 und R14 sind Fehlerregeln und bleiben ohne Befund.

**Dichtheit.** Fensterglas liegt bündig in der äußersten Lage (vorher in der zweiten Lage hinter einer offenen Nische). Portale sind offene Durchgänge ohne Türblatt und als `tuer` deklariert (Hauptportal 8 x 12, Tramontana 6 x 10, Via dei Leoni 8 x 14 mit Bogen, kleine Tür 3 x 6, Dogana-Tür 3 x 6); die Korridoröffnung zur Brücke (Y 102..108) ist `tor`, die Arkaden der Höfe `arkade`, Glockenstube und Edikula `loggia`, Schlitzfenster des Turms, Caditoie und Zinnenlücken `scharte`, die Dachluken der Wehrgang- und Terrassentreppen `tuer`. Die Turmwand wird um fünf Randzellen am Rechteck ergänzt, das Turmdach beginnt bündig über der Edikula-Wand (kein Traufüberstand). Das Teil `verbindungsbloecke` schließt am Ende alle Diagonalfugen (rund 500 Zellen).

**Treppen** (nur Treppenblöcke, Breite 3 bis 4, Unterbau massiv): Scalone del Vasari (16 Stufen) im Streifen zwischen Westflügel und Salone, Läufe OG1 -> OG2 und OG2 -> Dachgeschoss, ein zweiter Satz im Ostflügel (der Salone trennt die Obergeschosse), zwei Aufgänge zum Wehrgang beiderseits des Turms, ein Aufgang zur Dachterrasse über dem Mittelbau, die Wendeltreppe im Turm (Doppelwendel mit Podesten und Seelaternen, Eingangstür in der Westwand des Turms, mündet auf den Böden der Glockenstube y_rel 153 und der Edikula y_rel 161) und Außentreppen vor den Portalen, wo das Gelände tiefer liegt (Leoni 6 Stufen).

**Licht.** Seelaternen als Bodeneinbau in der Platte unter jedem Geschoss (EG: Bodenplatte, OG1 bis Dachgeschoss: Geschossplatten), Abstand höchstens 9 (Räume 8, Salone 10), Turmpodeste mit Lampe.

**Unzugänglich (deklariert):** Dachräume zwischen Dachplatte und Walmdach, Fensternischen hinter dem Glas (Sohlbank über Kopfhöhe), Luft über Statuensockeln, Luft um den Globus.

**Innenräume** (Stufe C für die Lage im Grundriss; Bilder als Farbfelder, Figuren als Blockfiguren, alle Texte mit Quelle und "vereinfacht"):
| Raum | Lage im Modell | Begründung |
| :--- | :--- | :--- |
| Salone dei Cinquecento | Rahmen u -14..90, w 92..136, Udienza im Norden | Katalog §10; Salone mit Wandfresken (Schlachten), Kassettendecke mit Mittelbild, Marmorboden, Udienza mit fünf Statuen, 12 Herkules-Statuen, Genius des Sieges |
| Michelozzo-Hof | Loch 1 | Putto-Brunnen, vergoldete Säulenbänder (Fuß, Schaft, Kapitell), Grotesken in der Rückwand, Städtebilder-Fries |
| Sala dei Gigli | OG1, u 56..78, w 28..46 | nördlich der Quartiere im Westflügel, Lilien blau/gold, Judith |
| Studiolo Francesco I. | OG1, u 80..90, w 28..38 | kleiner Raum neben der Sala dei Gigli, Tonnengewölbe |
| Quartiere di Leone X | OG1, u 56..78, w 0..26 | an der Piazza-Seite im ersten Obergeschoss |
| Quartiere degli Elementi | OG2, über Leone X | Allegorien der vier Elemente an der Decke |
| Sala delle Carte Geografiche | OG2, u 56..90, w 28..56 | Schränke mit Landkarten, großer Globus |
| Turm | Glockenstube y_rel 153..160 | drei hängende Glocken in drei Größen, Wendeltreppe, Ausstieg auf das Turm-Ballatoio |

Der Alberghetto (kleine Zelle im Turm) ist nicht gebaut (optional).
