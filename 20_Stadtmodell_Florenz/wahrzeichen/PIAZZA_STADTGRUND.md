# Piazza della Signoria – Oberfläche (Entscheidung und Spezifikation, V3 D1)

> **Stand D2:** Verallgemeinert und berichtigt durch [`../stadtgrund/SPEZIFIKATION.md`](../stadtgrund/SPEZIFIKATION.md) §6–§8. Berichtigt dort: Neptunbrunnen bei (−136 \| 790) (OSM) statt (−122,5 \| 790,6), Reiterstandbild bei (−136 \| 742); die „Unstimmigkeit von 30 m“ ist keine; Blockzahlen 0,43 k und 0,40 k.

## Entscheidung
Die **Platzoberfläche gehört nicht in ein Wahrzeichen-Projekt, sondern in das Projekt `stadtgrund`** (Typ `stadtgrund`, ein Modul je Stadtteil laut `STADTMODELL_PLAN.md` §4), dort in das Modul **„Signoria“** (Platz, anschließende Straßen). Gründe:
1. Der Platz ist eine zusammenhängende OSM-Fläche (Way **w23298643**, `leisure/place=square`, 32.257 Zellen = 8.064 m²), die sich über vier Wahrzeichen und zahlreiche Straßen hinaus fortsetzt. Eigentum je Zelle: ein Projekt.
2. Das Pflaster muss mit Gelände (`groundTopY`), Straßen und Piazzale degli Uffizi **eine** Höhenfläche bilden. Das leistet nur der Stadtgrund.
3. Die Wahrzeichen sind Bauten mit eigenem Sockel. Sie brauchen den Platz nur als Anschluss (Schwelle Y 68/69 bzw. 67).
Die **optionalen Monumente** (Neptunbrunnen, Reiterstandbild) stehen als Bauteile im Modul „Signoria“ des Stadtgrunds, weil ihr Standort außerhalb jedes Wahrzeichen-Polygons liegt.

## Rahmen
- Maske `M_PZ`: Zellen von w23298643 (Außenring 38 Punkte, keine Löcher), **abzüglich** aller Zellen, die einem Wahrzeichen oder Quartierhaus gehören (Vorrang siehe `UEBERSICHT.md` §3). Gemessen: Überlappung mit dem Palazzo Vecchio **21 Randzellen**, mit Loggia, Uffizien, Orsanmichele **0**.
- Gelände: `groundTopY` 66 (1.830 Zellen), 67 (18.062), 68 (11.181), 69 (1.184); Median 67. Der Plan nennt „Piazza ≈ Y 67“.
- Die oberste Bodenlage jeder Zelle (`y = groundTopY`) wird mit der Pflasterrolle belegt. Darunter steht das Gelände (Rolle `gelaende_fels`/`gruen_erde` je nach Stadtgrund-Regel, hier nicht festgelegt).

## Pflaster (Oberfläche, nur Rollen der Palette)
- Hauptfeld: Rolle `pflaster` (polished_tuff).
- Muster: Platten 8 × 4 Zellen (4 m × 2 m, geschätzt), **im Verband** (jede 2. Reihe um 4 Zellen versetzt); jede Platte erhält `pietra_serena` (statt `pflaster`) mit einer Wahrscheinlichkeit von 12 % (deterministischer Hash aus Plattenindex), sonst `pflaster`.
- Rasterrichtung: **entlang der Palazzo-Vecchio-Fassade**, also im Rahmen `PV` (θ = −79,8°, Ursprung (−146,5 \| 887)); Plattenlänge in u, Plattenbreite in w. Das passt zur Fassadenflucht; die Streifen biegen an der Grenze zum Piazzale degli Uffizi nicht um (der Piazzale hat sein eigenes Raster im Rahmen `UF`).
- Randband: 2 Zellen `pietra_forte` entlang der Wahrzeichenfronten (Palazzo Vecchio, Loggia): Zellen im Abstand ≤ 2 von einer Maskenkante eines Wahrzeichens.
- Das Pflaster ist belegt (1385 erstmals gepflastert, 1980er neu, Steinoberfläche; [en.wikipedia](https://en.wikipedia.org/wiki/Piazza_della_Signoria)), aber **das Muster ist nicht belegt** (Stufe C).

## Optionale Monumente (vereinfachte Blockformen, als solche zu markieren)
Standorte aus den Wikipedia-Koordinaten (Genauigkeit ± 10 m = ± 20 Blöcke; Stufe C). Umrechnung mit `frame.js`:

| Objekt | Koordinate (WGS84) | Modell (x \| z) | Quelle |
|---|---|---|---|
| Neptunbrunnen (Ammannati, 1559–74/75) | 43,76958 N, 11,25608 E | (−122,5 \| 790,6) | [en.wikipedia](https://en.wikipedia.org/wiki/Fountain_of_Neptune,_Florence): nahe der Nordwestecke des Palazzo Vecchio |
| Reiterstandbild Cosimos I. (Giambologna, 1594) | 43,76981 N, 11,25605 E | (−127,7 \| 739,0) | [en.wikipedia](https://en.wikipedia.org/wiki/Equestrian_Monument_of_Cosimo_I): vor der Nordecke des Palazzo, nördlichste der Statuen |

Beide Standorte liegen innerhalb `M_PZ`. Der Neptunbrunnen liegt etwa 8 Blöcke nördlich der Nordkante des Palazzo Vecchio, die Reiterstatue etwa 60 Blöcke nördlich der Palastecke. **Die Quelle für die Reiterstatue (Wikipedia-Koordinate) widerspricht der Beschreibung „vor der Nordecke“ um etwa 30 m; offene Frage (Übersicht).**

**Neptunbrunnen** (Bauteil `nettuno_brunnen`, Stufe C für alle Maße):
- Becken: Achteck, Apothem 8 (4 m), Mitte (−122,5 \| 790,6) (Zellmitte (−122 \| 791)). Beckenrand 2 dick, 2 hoch (Lage +1..+2) `marmor_weiss`, Wasser Lage +1 innen `wasser`.
- Sockel: Block 3 × 3, Lage +1..+6, `marmor_weiss`.
- Figur „Neptun“ (Koloss): Körper 3 × 2 × 5 (Lage +7..+11), Kopf 1 × 1 × 1, Dreizack 1 × 1 × 4 seitlich, `marmor_weiss`.
- Randfiguren (Bronzesatyrn, Nymphen): 8 Blöcke 1 × 1 × 2 auf dem Beckenrand `bronze` (optional).
- Platte und Beckenboden: Lage 0 `pflaster`, ersetzt die Pflasterfläche im Beckenbereich.
- ≈ 0,9 k Blöcke.

**Reiterstandbild** (Bauteil `cosimo_reiter`, Stufe C):
- Sockel 4 × 10 (Längsachse im Rahmen `PV` entlang u), 5 hoch, `marmor_weiss`, Plinthe Lage +1 `pietra_serena` 6 × 12.
- Pferd: Körper 7 × 3 × 4 (Lage +6..+9), Beine 4 × 1 × 1 × 2, Kopf/Hals 2 × 2 × 4, `bronze`; Reiter 2 × 2 × 4 auf dem Rücken. Gesamthöhe ≈ 10.
- ≈ 0,5 k Blöcke.

Nicht modelliert: Arengario (liegt im DGM), Herkules und Cacus, David-Kopie, Marzocco, Judith, Savonarola-Gedenkplatte (Bronzeplatte im Pflaster, ein Mittelblock `bronze` optional bei (−117 \| 787), ungenau), Palazzo Uguccioni (Quartier), Tribunale della Mercanzia (Quartier).

## Anschlüsse
- **Palazzo Vecchio:** Platz und Fassade berühren sich entlang der Kanten E17–E20 (West) und E0–E1 (Nord). Pflaster geht bis zur Maskenkante des Palazzo. Schwelle Y 68 (Platte) / Gehfläche Y 69, Pflaster Y 66..69 (Median 67): Anschlussversatz 0–2 Lagen. Das ist **ein Befund des Stadtgrunds**: Er soll die Pflasterhöhe an der Fassade auf **68** anheben (Glättung entlang des Palastes, 6 m Breite), damit die Schwelle bündig ist.
- **Loggia:** Front-Kante (−235,5 \| 851) → (−163 \| 879,5), Plattenhöhe 67, Platz 66–67: 1 Lage Stufe, gewollt.
- **Piazzale degli Uffizi:** Straßenfläche zwischen den Flügeln (Stadtgrund, Rahmen `UF`), Höhe 65.
- **Orsanmichele:** nicht angrenzend.
