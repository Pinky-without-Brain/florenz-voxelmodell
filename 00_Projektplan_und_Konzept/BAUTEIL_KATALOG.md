# Bauteil-Katalog V2 – Spezifikation der Module 0–9

Verbindlich für Phase 3. Maße stehen in [`tools/spec/dimensions.js`](../tools/spec/dimensions.js) (Kurzform **D.** = `CATHEDRAL`, **L.** = `LEVELS`), die Pipeline-Regeln in [`tools/ARCHITEKTUR.md`](../tools/ARCHITEKTUR.md).
Bauteile stehen **in Bau-Reihenfolge**; die Bauteil-IDs sind verbindlich. Die Blockzahlen sind Richtwerte (±30 %). Größere Abweichungen sind ein Befund.

---

## A. Allgemeine Bauregeln (gelten für alle Module)

1. **Schalenmauerwerk:** Wände mit einer Dicke ≥ 7 werden als zwei Schalen mit je 2 Blöcken und hohlem Kern gebaut. Alle 12 Lagen kommt eine volle Binderlage, und die obersten 3 Lagen einer Wand sind voll. Öffnungen (Fenster, Portale) haben massive Laibungen über die volle Dicke. Wände < 7 sind massiv.
2. **Material nach Lage in der Wand:** Die äußerste Zellschicht trägt die Verkleidung (Inkrustation aus Marmor), innen liegt Mauerwerk (`stone_bricks`). Die innerste Schicht zum Innenraum ist `smooth_stone` (Pietra serena), Gesimse und Kapitelle sind `polished_andesite` (Pietra forte).
3. **Gesimse:** Ein Kranzgesims ist eine 1 Block hohe Lage, die 1 Block über die Außenflucht vorspringt. Material `chiseled_quartz` oder `quartz_bricks`. Es steht auf der Wand darunter (R3) und ist damit erlaubt.
4. **Dächer:** Terrakotta (`terracotta`), 1 Block stark, über Säulen dicht (Dichtungsregel wie bei Gewölben). Nötige Helfer liefert `tools/geom/roofs.js` (AP 2.6).
5. **Gewölbe:** `vaults.groinVault` und `vaults.cloisterVault` mit `thickness = 2`. Den Profilfaktor für eine gewünschte Steighöhe `rise` bei Halbweite `w` liefert `f = ((rise / w)² + 1) / 4`.
6. **Symmetrie:** Wo angegeben, wird das Bauteil mit `symmetry` registriert (R8). Asymmetrische Details (z. B. die Tür zur Sakristei) gehören in **eigene** Bauteile ohne Symmetrie-Flag.
7. **Baubarkeit (R3):** Jedes Bauteil wird von unten nach oben geplant. Bögen und Gewölbe müssen im selben oder einem späteren Schritt als ihre Auflager liegen; deshalb steht der Bogen immer nach der Wand bzw. dem Pfeiler.
8. **Bodenkontakt:** Alles, was auf dem Fußboden steht, beginnt bei Y 65 auf dem Boden von Modul 0 (Y 64). Die Prüfung R5 erfolgt über `SUPPORTS`.

---

## Modul 0 – Fundament, Böden und Krypta-Grube (Richtwert 55–65 k)
Grundfläche („Footprint“), wird in `m0` als Funktion `footprint(x, z)` exportiert und von den anderen Modulen nicht benutzt:
- **Langhaus:** X −216..−55, |Z| ≤ 44.
- **Ostkomplex:** |x| ≤ 54, |z| ≤ 54, |x| + |z| ≤ 98 (Vierung mit Ecken und Sakristeien).
- **Tribunen** Nord, Ost und Süd: Achse a ∈ {−z, +x, +z}, Querkoordinate w. Dazu gehört (|w| ≤ 37 und 0 ≤ a ≤ 59) oder (a ≥ 59 und `inOctagon(w, a − 59, 37)`). Konstanten: `centerDist`, `outerApothem`.
- **Campanile:** Quadrat (−200 | 65), Halbmaß 14.
- **Baptisterium:** `inOctagon` um (−307 | 0) mit a = 33, dazu die Scarsella X −347..−340, |Z| ≤ 13.

| # | Bauteil-ID | Inhalt | Material |
|---|---|---|---|
| 1 | `krypta_grube` | Krypta-Aushub (`interfaces.CRYPT`): Boden Y 56 über CRYPT-XZ ±1, Ringmauer 2 dick außerhalb der Box Y 56..63 | `cobblestone`, Kanten `stone_bricks` |
| 2 | `boden_langhaus` | Y 64, Langhaus-Footprint. Innenraum (|z| ≤ 38, x ≥ −212) mit `patterns.cosmati` (cell 8). Wandzonen `stone_bricks`. **Über der Krypta**: dieselbe Lage, sie liegt seitlich auf der Grubenmauer auf. | Kosmaten |
| 3 | `boden_vierung` | Y 64, Ostkomplex ohne Tribunen. Konzentrische Achteckbänder um den Ursprung (Breite 3, Wechsel `smooth_quartz` / `dark_prismarine` / `polished_granite`), Zentrum Rosette | Marmor |
| 4–6 | `boden_tribune_nord`, `_ost`, `_sued` | Y 64, je ein Tribunen-Footprint ohne den Teil im Ostkomplex. Strahlenmuster aus der Tribunenmitte | Marmor |
| 7 | `boden_campanile` | Y 64 | `smooth_quartz` / `dark_prismarine` Schachbrett 3 |
| 8 | `boden_baptisterium` | Y 64, Achteck und Scarsella. Kreisband-Muster (Tierkreis vereinfacht: 12 Sektoren abwechselnd) | Marmor |

Symmetrie: `boden_vierung` order 8; `boden_baptisterium` order 4 nur ohne Scarsella (darum kein Flag).

---

## Modul 1 – Langhaus und Seitenschiffe (Richtwert 110–150 k)
Hoheitsgebiet laut `interfaces.OWNERSHIP` (X −212..−55; das Langhaus stößt bei x = −55 an die Westfläche der Vierung, Außenmaß −54). **Ostabschluss:** Wandvorlagen bzw. Halbpfeiler an der Vierungswand bei x −57..−55 auf den Pfeilerachsen z = ±19; die letzte Arkade spannt von der Pfeilerachse −98 bis zu diesen Halbpfeilern. Alle Bauteile, die im Folgenden „bis −61“ laufen, laufen bis **−55**. Joche: Pfeilerachsen bei `px_k = D.nave.interiorWestX + k·D.nave.bayPitch`, k = 0..4 (−212, −174, −136, −98, −60). Die Achsen k = 0 (Fassade) und k = 4 (Vierung) sind **keine** Pfeiler dieses Moduls. Bei k = 0 steht eine Wandvorlage an der Fassade, bei k = 4 setzt M3 mit seinen Vierungspfeilern an.

| # | Bauteil-ID | Geometrie | Material |
|---|---|---|---|
| 1 | `aussenwand_nord`, 2 `aussenwand_sued` | \|z\| 39..42 (4 dick), X −212..−55, Y 65..`aisleEavesY` (114). Je Joch ein Spitzbogenfenster mittig: Halbweite 3, f 0,8, Unterkante Y 80, Kämpfer Y 98, Glas `white_stained_glass` in der Mittelebene \|z\| = 40. **Portale:** Porta della Mandorla (Nord, Joch 4), Porta dei Canonici (Süd, Joch 3): Halbweite 4, Kämpfer Y 82, f 0,8, Bronzetür `cut_copper` in \|z\| = 41, Laibung und Giebel (Wimperg) in `chiseled_quartz` bis Y 100. Außenschicht \|z\| = 42 mit `patterns.incrustation` (panelW 9, panelH 12). | Inkrustation / Mauerwerk |
| 3 | `wandvorlagen` | Lisenen außen: \|z\| 43..44, 4 breit, an jedem px_k (k = 1..3) und an den Enden (X −212..−209, −64..−61), Y 65..114 | `smooth_quartz`, Kanten `dark_prismarine` |
| 4 | `pfeiler` | Freistehende Bündelpfeiler an (px_k, ±19) für k = 1..3: Kern `inOctagon(·,·,3)`, dazu vier Dienste (1 × 1) auf den Achsen bei Abstand 4. Fuß Y 65..66 als `inOctagon(4)`. Schaft Y 67..96. Kapitell Y 97..98 als `inOctagon(4)`. Halbpfeiler (Wandvorlagen innen) an den Seitenwänden \|z\| 36..38 und an der Fassade x −212..−210. | `smooth_stone`, Kapitell `polished_andesite` |
| 5 | `arkaden` | Längsarkaden zwischen den Pfeilern bzw. Halbpfeilern bei \|z\| 17..21: lichte Halbweite = (Pfeilerabstand − 9)/2 (Pfeilerkern ±4). Spitzbogen mit Kämpfer Y 99, Scheitel Y 110 (≈ aisleVaultY) über f nach Regel A5. Darüber füllt die Wand bis Y 123 auf (die Hochschiffwand). | `smooth_stone`, Keilsteine abwechselnd `smooth_quartz` / `dark_prismarine` |
| 6 | `seitenschiff_gewoelbe` | Kreuzgewölbe je Joch und Seite: x zwischen den Pfeilerkernen, z von 22 bis 38 (bzw. −38..−22), Kämpfer Y 99, Scheitel `aisleVaultY` (110), f je Richtung nach Regel A5. Gurtbögen 2 breit über den Pfeilerachsen. | `smooth_stone` |
| 7 | `hochschiffwand` | \|z\| 18..20 (3 dick), Y 124..`clerestoryTopY` (148), x −212..−61. Je Joch ein Oculus (Rundfenster) mittig im Joch, Zentrum Y 134, r 5, Glas `yellow_stained_glass` / `orange_stained_glass` (Ring), Rahmen `chiseled_quartz` (Ring r 5..6). Außenseite \|z\| = 20 mit Inkrustation. | Inkrustation |
| 8 | `mittelschiff_gewoelbe` | Kreuzgewölbe je Joch: x von px_k + 3 bis px_{k+1} − 3, z −15..15, Kämpfer Y 124, Scheitel `naveVaultY` (150), f nach Regel A5. Gurtbögen 3 breit über den Pfeilerachsen, gleiche Höhe. Der Gewölbescheitel darf Y 150 nicht überschreiten. Die Wand zwischen den Schiffen (Y 99..123) trägt die Kämpfer. | `smooth_stone`, Rippen `polished_andesite` |
| 9 | `gesimse` | Kranzgesims der Seitenschiffe Y 115 (\|z\| 39..45, Vorsprung 1); Kranzgesims der Hochschiffwand Y 149 (\|z\| 18..21) | `quartz_bricks` |
| 10 | `dach_seitenschiffe` | Pultdach je Seite: an der Hochschiffwand-Außenseite (\|z\| = 21) auf Y 123, an der Außenwand (\|z\| = 44) auf Y 116. Linear, dicht | `terracotta` |
| 11 | `dach_mittelschiff` | Satteldach: Traufe Y 150 bei \|z\| = 21, First `roofRidgeY` (156) bei z = 0. Giebel an der Westseite = Fassade (M2); im Osten stößt es an den Tambour (M3/M4). Läuft bis x = −61. | `terracotta` |

Symmetrie: alle Bauteile außer den beiden Portalen (die im jeweiligen Außenwand-Bauteil liegen) sind spiegelsymmetrisch in Z. Registriere `aussenwand_*` ohne Flag. `pfeiler`, `arkaden`, `gewoelbe`, `hochschiffwand` und `dach_*` sind Z-spiegelsymmetrisch. Prüfe das selbst (R8 kennt nur order 4/8, deshalb kein Flag).

---

## Modul 2 – Westfassade (Richtwert 25–35 k)
Hoheitsgebiet X −216..−213, |Z| ≤ 44, Y 65..`facade.peakY` (164). Die Ansicht wird mit `arches.elevation` erzeugt und mit `placeElevation(axis 'z', origin x = −216, depth [0, 3])` platziert, mit Rücksprüngen für Portale und Nischen über mehrere Lagen (depth [0, 1] für Nischen).

Gliederung (u = z, v = y − 65):
| Zone | Y | Inhalt |
|---|---|---|
| Sockel | 65..72 | volle Breite, `polished_granite` mit `dark_prismarine`-Band oben |
| Portalzone | 73..100 | Hauptportal Mitte: Halbweite 6, Kämpfer Y 88, Rundbogen (f 0,5), 2 Blöcke tief rückspringend (x −216..−215 offen). Bronzetür `cut_copper` auf x −214..−213 mit 1 Block Rücksprung. Seitenportale bei z = ±29: Halbweite 4, Kämpfer Y 84. Über jedem Portal ein Wimperg (Dreieck, `chiseled_quartz`) und eine Lünette mit Mosaik (`gold_block` / `blue_terracotta`). |
| Nischenzone | 101..114 | Reihe von 12 Statuennischen (Halbweite 1, Rundbogen, 1 tief), Rahmen `smooth_quartz` |
| Rosenzone | 115..140 | **nur Mittelteil** \|z\| ≤ 21: Rundfenster Zentrum Y 128, r 9, Maßwerk-Speichen `chiseled_quartz` (8 Speichen, Ring r 9..10), Glas `orange_stained_glass` / `yellow_stained_glass`. Seitenteile (\|z\| 22..44) enden mit halben Giebeln (Dreiecke von Y 115 bei \|z\| = 44 bis Y 128 bei \|z\| = 22). |
| Giebel | 141..164 | Dreieck über \|z\| ≤ 21: Basis Y 141, Spitze `peakY` bei z = 0. Mittig ein Tondo (Kreis r 4, `gold_block`/`blue_terracotta`). Krabben (Einzelblöcke) entlang der Kante sind erlaubt. |
| Pfeilervorlagen | 65..150 | 4 vertikale Streifen (\|z\| 20..23 und 40..44), Inkrustation hochkant, oben Fialen (Spitzen 1 × 1) bis Y 150 bzw. 120 |

**Uccello-Uhr** (eigenes Bauteil, E3): An der Innenseite x = −213 wird keine Zelle zusätzlich gesetzt; das Bauteil `facade_innenseite_uhr` ist die **innerste Lage** (x = −213) im Bereich Y 100..118, |z| ≤ 10. Sie wird mit einer Materialfunktion belegt: Zifferblatt-Kreis r 9 um (Y 109, z 0) `white_terracotta`, 24 Stundenmarken `black_concrete` (Winkel k·15°, Radius 7..8), Ring r 9 `blue_terracotta`, ein Zeiger (Stern) `gold_block`. Die Zellen gehören zu M2. Die anderen Bauteile lassen genau diese Zellen aus, damit die Uhr ein eigener Schritt ist.

Reihenfolge der Bauteile: `sockel`, `portalzone`, `nischenzone`, `pfeilervorlagen`, `rosenzone`, `giebel`, `facade_innenseite_uhr`.
Damit die Bau-Reihenfolge stimmt, darf `pfeilervorlagen` erst nach `nischenzone` kommen und nur bis Y 114 reichen, wenn darüber schon Zonen gebaut sind. **Alternative:** Pfeilervorlagen sind Teil der jeweiligen Zonenbauteile. Das ist die empfohlene Variante; dann entfällt das Bauteil `pfeilervorlagen`.

---

## Modul 3 – Vierung, Tribunen, Sakristeien (Richtwert 100–140 k)
### Vierungsachteck (Bauteile 1–4)
- `vierung_wand`: Achteckring a 45..54 (Schalenmauerwerk nach A1), Y 65..`archTopY` (148). Die oberste Lage Y 146..148 ist voll (Auflager des Tambours, **Coverage 1,0**).
- **Vier große Bögen** auf den Achsenseiten (W, N, O, S): Öffnung durch die volle Wanddicke, Halbweite 17 (Seitenhalbmaß 45·tan 22,5° = 18,6 minus 1 Kante), Kämpfer Y 113, Scheitel Y 140, f nach A5. Die Westöffnung ist niedriger, weil das Mittelschiffgewölbe bis Y 150 geht. Sie bekommt dieselbe Bogenform; oberhalb schließt M1 mit Dach und Gewölbe an die Achteckwand an.
- **Diagonalseiten** massiv; NO und SO haben je eine Tür zur Sakristei (Halbweite 2, Kämpfer Y 75, Rundbogen) als eigenes Bauteil `sakristei_tueren` **ohne** Symmetrie.
- `vierung_gesims`: Lage Y 112 innen umlaufend (Kämpfergesims, \|ρ\| 44..45 → 1 Block nach innen vorspringend, nur auf den Diagonalseiten) `polished_andesite`.
- Symmetrie `vierung_wand`: order 8 (Bögen auf allen 4 Achsen, gleiche Form).

### Tribunen (je Nord / Ost / Süd, Bauteile mit Suffix `_nord`, `_ost`, `_sued`)
Lokale Koordinaten: a = Abstand entlang der Tribunenachse vom Ursprung, w = quer dazu. Mittelpunkt c = `centerDist` (59). Konturen:
- außen: (|w| ≤ 37 und 54 ≤ a ≤ 59) oder (a ≥ 59 und `inOctagon(w, a − 59, 37)`);
- innen (Raum): (|w| ≤ 19 und 45 ≤ a ≤ 59) oder (a ≥ 59 und `inOctagon(w, a − 59, 19)`).

| # | Bauteil-ID | Inhalt |
|---|---|---|
| a | `tribune_*_mauern` | Zwischen Innen- und Außenkontur, Y 65..104 (`chapelRoofY`). **5 Radialkapellen** auf den 5 Außenseiten des Halbachtecks: Kapellenraum in jeder Seite, Halbbreite 5 (quer zur Seitennormalen), Tiefe von ρ_lokal 20 bis 31; Öffnung zum Tribunenraum als Spitzbogen (Halbweite 5, Kämpfer Y 84, f 0,8); Kapellengewölbe = Kreuzgewölbe Kämpfer Y 90, Scheitel Y 98. Außenmauer ρ 32..37 (6 dick). Je Kapelle ein schmales Fenster (Halbweite 1, Y 78..92) in der Außenmauer. |
| b | `tribune_*_obergaden` | Wand ρ_lokal 19..25 (auf der Innenkontur), Y 105..130 (`tribuneRoofY`), 5 Rundfenster (r 3, Zentrum Y 118) auf den Außenseiten. |
| c | `tribune_*_gewoelbe` | Halbes Klostergewölbe (`cloisterVault`, sides = Halbebene nach außen) a = 19, Kämpfer Y 102, f so, dass der Scheitel Y 125 ist (Regel A5, w = 19,5). Die gerade Strecke (45 ≤ a ≤ 59) bekommt eine Spitztonne derselben Höhe. |
| d | `tribune_*_daecher` | Kapellendach: Pultdach von Y 110 bei ρ_lokal 26 auf Y 105 bei ρ 37 über den Kapellen. Tribunendach: halbe Achteckpyramide von Y 131 bei ρ 25 auf Y 136 an der Vierungswand (a = 54). |

Symmetrie: jedes Tribunen-Bauteil ist spiegelsymmetrisch zur eigenen Achse. Die drei Tribunen sind identisch (90°-gedreht). Erzeuge **eine** Funktion, die für eine Achsrichtung die Zellen liefert.

### Eckbauten und Exedra-Sockel
| # | Bauteil-ID | Inhalt |
|---|---|---|
| e | `eckbauten` | Ostkomplex-Footprint (|x| ≤ 54, |z| ≤ 54, |x|+|z| ≤ 98) **minus** Vierungsachteck **minus** Tribunen-Außenkonturen **minus** Langhaus-Hoheitsgebiet (x ≤ −61). Wände 4 dick an der Außenflucht, Räume innen hohl; Decke/Flachdach Y 101..104 voll, darauf `terracotta` Y 104. Die NO- und SO-Ecke sind die Sakristeien (Raum Y 65..100 mit Kreuzgewölbe Kämpfer Y 88). |
| f | `exedra_sockel` | Vier massive Sockel unter den „tribune morte“ von M4: Mittelpunkt auf jeder Diagonalen bei ρ = 54, also (±38, ±38) mit x = z·sign. Footprint = Halbkreis r 11 nach außen (`inDisk` und Halbebene: Skalarprodukt mit der Diagonalrichtung ≥ 0). Y 105..148, Schalenmauerwerk. Oberste 3 Lagen voll. |
| g | `sakristei_tueren` | siehe oben |

**Schnittstellen**, die M3 liefern muss: Y 148 ist voll auf dem Ring a 45..54 und auf den Exedra-Sockeln.

---

## Modul 4 – Tambour mit Ochsenaugen und tribune morte (Richtwert 30–45 k)
| # | Bauteil-ID | Inhalt |
|---|---|---|
| 1 | `tambour_ring` | Achteckring a 45..54, Y 149..`drum.springY` (172), Schalenmauerwerk. Oberste 3 Lagen (170..172) voll → Auflager der Kuppel. Außen Inkrustation in Feldern (panelH 8); Eckkanten (Ecken des Achtecks) als 2 Blöcke breite Lisenen `smooth_quartz`. Symmetrie order 8. |
| 2 | `ochsenaugen` | 8 Rundfenster, eines je Fläche, Zentrum Y `oculusCenterY` (163), r = `oculusDiameter`/2 − 1 = 4 (9 Zellen Durchmesser). Durchgang senkrecht zur Fläche durch die volle Wanddicke. Rahmen-Ring (Breite 1) `chiseled_quartz`; Glas in der mittleren Wandschicht (ρ ≈ 49..50): `blue_stained_glass` mit Kreuz aus `yellow_stained_glass` (Ghiberti, Donatello, Uccello, Castagno). Hinweis: Die Ochsenaugen sind **Aussparungen** im Bauteil `tambour_ring`; die Rahmen und Gläser bilden dieses eigene Bauteil, Symmetrie order 8. |
| 3 | `galerie_suedost` | Baccio d'Agnolos unvollendete Galerie („Grillenkäfig“), **nur** auf der SO-Diagonalfläche: Lage Y 168 Konsolen (jede 2. Zelle, Vorsprung 1 → ρ 55), Y 169 Laufboden ρ 55..56, Brüstung Y 170..171 Arkaden (Säulchen jede 3. Zelle) aus `smooth_quartz`. Keine Symmetrie. |
| 4 | `tribune_morte` | 4 Exedren auf den Exedra-Sockeln (M3): halbrunde Wand r 10..11 (2 dick) Y 149..160 mit 5 Muschelnischen (Halbweite 1, 1 tief), gekuppelte Säulen `quartz_pillar` vor den Pfeilern; Halbkuppel `halfDome` r 11, Kämpfer Y 161 (Scheitel ≈ 171); Abdeckung `terracotta`. Symmetrie order 4 (Diagonalen; die D4-Abbildungen der Diagonalpositionen treffen sich gegenseitig, deshalb order 8 prüfen). |
| 5 | `kranzgesims` | Y 173? **Nein:** Y 173 gehört M5. Das Gesims liegt bei Y 171 als 1 Block Vorsprung (ρ 55) über dem ganzen Umfang und wird von Y 170 getragen. Symmetrie order 8. |

---

## Modul 5 – Brunelleschis Doppelkuppel (Richtwert 80–110 k)
Geometrie vollständig aus `dome.doubleDomeLayout(dims)` (AP 2.3). Bauteile sind **Höhenbänder**, wie Brunelleschi in Ringen baute: `kuppel_ring_01` … `kuppel_ring_08`, jeweils 9 Lagen ab Y 173 (das letzte Band bis `yTop`). Jedes Band enthält alle Elemente dieser Höhe:
- **Innenschale:** Material `patterns.herringbone` (`bricks` / `terracotta`). Die **innerste Zelllage** (zur Kuppelmitte) trägt das Fresko (E3): **Vasari/Zuccari, Das Jüngste Gericht**, in 5 Ringzonen nach Höhe (von unten): Hölle (`black_concrete`/`red_terracotta`), Todsünden und Tugenden (`brown_terracotta`/`orange_terracotta`), Seligkeiten/Heilige (`light_blue_terracotta`/`white_terracotta`), Ältestenchor (`yellow_terracotta`/`white_terracotta`), Christus/Engel (`gold_block`/`blue_terracotta`) mit 8-teiliger Gliederung nach `segmentIndex` (Ostsegment: Christus-Thron).
- **Außenschale:** `bricks`; die äußerste Zelllage `terracotta` (Dachziegel).
- **8 Hauptrippen:** Zellen der Außenschale mit `cornerAngleDelta ≤ 3°`, dazu 1 Lage nach außen (ρ + 1) als sichtbare Rippe in `smooth_quartz`. Die Rippe füllt auch den Zwischenraum (verbindet beide Schalen).
- **16 Zwischenrippen:** im Zwischenraum bei `webPosition = ±1/3`, Breite 1, `bricks` (verbinden die Schalen).
- **Ringketten (catene):** alle 12 Lagen eine volle Lage im Zwischenraum (Laufgang) aus `stone_bricks`, die Innen- und Außenschale verbindet.
- **Treppe** im Zwischenraum ist optional (erst nach Abnahme ergänzen).

Danach `schlussring`: Lagen `eyeRingTopY − 5 .. eyeRingTopY` (241..246), ρ von `eyeHalfFlat` (6) bis 14, `smooth_quartz` mit `polished_granite`-Band. Er muss die Schalenoberkanten lückenlos abdecken (R3).
Symmetrie: alle Bänder order 8 **außer** der Fresko-Lage (Ostsegment). Deshalb gibt es kein Flag auf den Bändern; prüfe die 8-fache Symmetrie der Geometrie ohne Material im eigenen Test.

---

## Modul 6 – Laterne, Kugel und Kreuz (Richtwert 4–8 k)
| # | Bauteil-ID | Inhalt |
|---|---|---|
| 1 | `laternen_sockel` | Y 247..249, `inOctagon` a ≤ 14, außer Auge ρ < 4 (Licht- und Lüftungsöffnung). `smooth_quartz`. |
| 2 | `voluten` | 8 Strebepfeiler an den Ecken: radial von ρ 9 bis 14, Y 250..262, 2 breit, Außenkontur als Viertelkreis (Volute), oben an den Tempel angelehnt. `smooth_quartz` mit `chiseled_quartz`-Schnecke. |
| 3 | `tempel` | Achteckiger Tempel a = `lantern.halfFlat` (9): 8 Eckpfeiler (3 × 3) Y 250..270, dazwischen je ein Rundbogenfenster (Halbweite 2, Kämpfer Y 264, Glas `white_stained_glass`), Wand 2 dick. Gebälk Y 271..`templeTopY` (274) voll, a ≤ 10. |
| 4 | `kegeldach` | Achteckpyramide Y 275..283, a von 9 linear auf 1; Kanten `chiseled_quartz`, Flächen `smooth_quartz`. |
| 5 | `kugel_und_kreuz` | Kugel r 3 um (0, 287, 0) (Y 284..290) `gold_block`, steht auf der Kegelspitze. Kreuz: Stamm Y 291..293, Querbalken Y 292 mit z ± 1. `gold_block`. |
Symmetrie: 1–4 order 8, 5 order 4.

---

## Modul 7 – Campanile di Giotto (Richtwert 55–70 k)
Quadrat um (−200 | 65), Halbmaß 14, lokale Koordinaten (u, w). Wände: |u| oder |w| ∈ 10..14 (5 dick, Schalenmauerwerk ab 7 entfällt). Eckpfeiler: Achtecke a 3 um (±12, ±12), Y 65..222, vorspringend bis ±15 (1 Block über die Wandflucht).
| # | Bauteil-ID | Y | Inhalt |
|---|---|---|---|
| 1 | `sockel_reliefs` | 65..100 | 2 Register: Sechseck-Reliefs (Pisano) als `polished_granite`-Felder mit `smooth_quartz`-Rahmen, darüber Rauten-Register `dark_prismarine`. Eingangstür Ostseite (Halbweite 2, Kämpfer Y 72). |
| 2 | `nischengeschoss` | 101..122 | 4 Statuennischen je Seite (Halbweite 1, Kämpfer Y 114, 1 tief) |
| 3 | `biforien_1` | 123..150 | Je Seite ein Biforium: zwei Spitzbögen (Halbweite 2, f 0,8, Kämpfer Y 140) mit Mittelsäule `quartz_pillar`, umfassender Spitzbogen; offen (keine Glasfüllung) |
| 4 | `biforien_2` | 151..178 | wie 3 |
| 5 | `triforien` | 179..221 | Je Seite ein hohes Triforium: drei Bögen (Halbweite 2, Kämpfer Y 208), zwei Säulen, Wimperg darüber |
| 6 | `zwischendecken` | 100, 122, 150, 178 | Innenraum \|u\|,\|w\| ≤ 9 voll, mit Treppenloch 3 × 3 in der NW-Ecke |
| 7 | `treppe` | 65..221 | Innen an den Wänden umlaufend, 1 Stufe pro Block (1 hoch, 1 weiter), Breite 2, volle Blöcke; Podeste an den Ecken; durchstößt die Zwischendecken genau am Treppenloch |
| 8 | `glockenstuhl` | 195..215 | Balken `dark_oak_planks` von Wand zu Wand bei Y 214 (2 Achsen), daran 7 Glocken (Kuppelformen aus `cut_copper`, größte r 3 = Campanone, Rest r 1..2), jede über eine Zelle mit dem Balken verbunden |
| 9 | `kranz_und_terrasse` | 222..233 | Konsolenfries Y 222..224 (Vorsprung 1 → Halbmaß 15), Terrassenboden Y 225, Brüstung Y 226..228 (Halbmaß 15, Maßwerk jede 2. Zelle offen), Eckfialen bis `topY` (233) |
Symmetrie: alles order 4 um (−200, 65), **außer** Tür, Treppe und Glocken.

---

## Modul 8 – Baptisterium San Giovanni (Richtwert 50–70 k)
Achteck um (−307 | 0), Wand a 25..33 (Schalenmauerwerk). Portale: Ost (Paradiespforte), Nord, Süd. Scarsella im Westen.
| # | Bauteil-ID | Y | Inhalt |
|---|---|---|---|
| 1 | `sockel_und_untergeschoss` | 65..90 | Außen: je Fläche 3 Blendarkaden-Felder (Pilaster `dark_prismarine`, Felder `smooth_quartz`). Portalöffnungen auf O/N/S: Halbweite 5, Kämpfer Y 82, Rechteck mit Marmorrahmen 2 breit. |
| 2 | `portale` | 65..82 | Türblätter in der Wandmitte (ρ 29): Ost `gold_block` mit 10 Feldern (Rahmenlinien `cut_copper`), Nord und Süd `cut_copper`. Eigenes Bauteil, ohne Symmetrie. |
| 3 | `obergeschoss` | 91..108 | 3 Fenster je Fläche (Rundbogen, Halbweite 1, Kämpfer Y 102), Pilaster wie unten |
| 4 | `attika` | 109..116 | Streifen `dark_prismarine` / `smooth_quartz` im Wechsel (bands, period 2) |
| 5 | `innenkuppel` | 98..125 | Klostergewölbe a = 25, Kämpfer Y 98, f = 0,5; Innenfläche Mosaik: `gold_block`-Grund mit Ringzonen `blue_terracotta` / `yellow_terracotta`; Auge ρ < 3 offen |
| 6 | `pyramidendach` | 117..126 | Achteckpyramide von a = 33 (Y 117) auf a ≈ 4 (Y 126), `smooth_quartz` mit `dark_prismarine`-Gratlinien; deckt die Kuppel ab |
| 7 | `laterne` | 127..138 | Achteck a 4: 8 Säulen Y 127..133, Gebälk 134, Kegel bis `lanternTopY` (138) |
| 8 | `scarsella` | 65..100 | Rechteck X −347..−334 (schneidet die Westwand des Achtecks; dort gehört die Wand zum Achteck), \|z\| ≤ 13, Wand 3 dick, innen offen zum Baptisterium; Pultdach bis Y 100 |
Symmetrie: 1, 3, 4, 5, 6, 7 order 4 um das Zentrum **ohne** die Portalöffnungen, deshalb kein Flag für 1. Prüfe die D4-Symmetrie der übrigen Bauteile selbst.

---

## Modul 9 – Innenausstattung und Krypta (Richtwert 8–15 k)
| # | Bauteil-ID | Inhalt |
|---|---|---|
| 1 | `krypta_mauern` | Im RESERVED-Volumen: Reste der frühchristlichen Kirche Santa Reparata. Mauerzüge (2 dick) als Grundriss einer kleinen Basilika (Mittelschiff \|z\| ≤ 8, Apsis Osten bei x −140), Y 57..61, `mossy_stone_bricks` / `cobblestone` |
| 2 | `krypta_boden` | Y 57 innerhalb der Mauern: Mosaik `patterns.cosmati` (cell 6) mit `red_terracotta` / `white_terracotta` |
| 3 | `krypta_stuetzen` | 3 × 2 Pfeiler (2 × 2) von Y 57 bis 63, die den Boden (M0, Y 64) unterstützen |
| 4 | `brunelleschi_grab` | Grabplatte 3 × 5 bei Y 57 (eingelassen; ersetzt Boden-Zellen dort) `polished_deepslate` mit `gold_block`-Inschrift (1 Zeile) |
| 5 | `chorschranke` | Achteckige Marmorschranke unter der Kuppel: Ring a 16..17, Y 65..71, `smooth_quartz` mit Reliefbändern `polished_granite`. Eingang West (Halbweite 2). |
| 6 | `hochaltar` | Altarblock 5 × 3 × 2 in der Mitte (Y 65..66), darüber Kruzifix (Y 67..74) `dark_oak_planks` / `gold_block` |
Interface: `krypta_*` bleiben im RESERVED-Volumen; `chorschranke` steht auf M0 (Y 64).

---

## B. Zusätzliche Schnittstellen (werden in `interfaces.js` ergänzt)
- `Exedren auf Sockel`: lower 3, upper 4, y 149, region = die 4 Exedra-Halbkreise, coverage 1,0.
- `Bodenkontakt`: lower 0, upper 1, 2, 3, 7, 8, 9, y = L.walkY (65), coverage 0.
- `Krypta auf Grube`: lower 0, upper 9, y = L.cryptFloorY (57), coverage 0.

## C. Wellen für Phase 3
| Welle | Module | Voraussetzung |
|---|---|---|
| 1 | M0, M1, M3, M7 | AP 2.2–2.6 abgenommen |
| 2 | M2, M4, M8 | Welle 1 abgenommen (Schnittstellen real geprüft) |
| 3 | M5, M6, M9 | M4 abgenommen |
