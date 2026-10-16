# Referenzmaße – Ognissanti (W5b, Wahrzeichen-Welle 5)

Projekt-ID `ognissanti`. Maßstab 1:2 (**Blöcke = 2 · m**), Weltkoordinaten des Stadtmodells. Stand 16.10.2026.
Stufen: **A** mehrere Quellen übereinstimmend oder amtliche Quelle, **B** eine Quelle oder aus OSM/DGM gemessen, **C** Schätzung (Proportion). Entwurf: [`BAUTEIL_KATALOG.md`](BAUTEIL_KATALOG.md).

## 1. Rahmen und OSM

| Größe | Wert | Quelle |
|---|---|---|
| OSM-Objekt | Way **w167273908** „Ognissanti“ (`building=church`, `wikidata=Q2778991`, `wikipedia=it:Chiesa di Ognissanti (Firenze)`), Fläche 7.279,5 Blöcke, **7.287 Zellen**, bisher im Quartier Palazzuolo | `data/stadt/gebaeude.json` |
| Teile | 14 `building:part`, im Rahmen OG alle achsparallel (Tabelle unten); der Umriss enthält also die **Kirche und den Konvent** | OSM, `teile` des Gebäudes |
| Campanile | Teil **w478272187** (`man_made=tower`, `tower:type=bell_tower`), 140 Zellen, 11 × 13 Blöcke; liegt (Rahmen OG) bei u 60,8..71,8 × w 30,3..43,8 an der Südostwand des Schiffs | OSM; Mitte (−1724 \| 161) |
| **Rahmen `OG`** | θ = **−46,9°**, Ursprung (−1796 \| 184,5): u von der Fassade (Südwesten, Piazza d'Ognissanti) nach Nordosten zur Apsis, w quer, w > 0 nach Südosten (rechts beim Eintreten) | gemessen an den Polygonkanten |
| Gelände | `groundTopY` 54 bis 58 (55: 1.930, 56: 2.598, 57: 2.269 Zellen), Piazza vor der Fassade 55; im Umriss trägt `spec/ground.js` bis Y 55 ab | `tools/city/ground_stadt.js` |
| **`bodenY`** | **56** (Fußboden Y 56, Stehhöhe Y 57; eine Stufe über der Piazza) | Entwurf, B |

### Teile des Umrisses im Rahmen `OG` (gemessen, u \| w in Blöcken)
| Kürzel | OSM-Teil | u | w | Zellen | Deutung im Modell | Stufe |
|---|---|---|---|---:|---|---|
| g | w730876795 | −4,6..1 | 0..32,8 | 150 | Fassadenstreifen, gehört zum Raum des Schiffs | B |
| k | w730876802 | 0..86,5 | 0..31 | 2.733 | Schiff mit Vierung und Presbyterium, einschiffig | B |
| j | w730876799 | 46,8..69,4 | −26,4..0 | 524 | linkes Querhaus (Giottos Kruzifix, Saio-Kapelle) | C |
| e | w730876793 | 68,4..86,3 | −27,3..0 | 442 | Sakristei (Tür vom Presbyterium) | C |
| n | w730876806 | 71,8..98 | 30..44 | 346 | Kapelle im rechten Querhaus (S. Pietro d'Alcantara, Botticellis Grab) | C |
| h, i | w730876796, w730876798 | 86,5..99 | 5..30 | 283 | Chor hinter dem Hochaltar und Nebenraum | C |
| m | w730876805 | −5..60,8 | 31..46 | 833 | Cenacolo-Trakt an der Borgo Ognissanti (Refektorium) | B/C |
| f, c, l, d, b | w730876794, 790, 804, 791, 789 | 54..124 | −1..76 | 1.830 | Konventstrakte | C |
| a | w478272187 | 60,8..71,8 | 30,3..43,8 | 140 | Campanile | B |

## 2. Maße und Befunde (Literatur gegen OSM)

| Maß | Modell | Literatur | Bewertung |
|---|---|---|---|
| Baugeschichte | Fassade 1637, Umbau 1627 | Franziskanerkirche, ab den 1250er Jahren; barocker Umbau um 1627 (Bartolomeo Pettirossi); Fassade 1637 nach Entwürfen von Matteo Nigetti, 1872 restauriert, in Travertin von Rapolano ([it.wikipedia](https://it.wikipedia.org/wiki/Chiesa_di_Ognissanti_(Firenze)), [en.wikipedia](https://en.wikipedia.org/wiki/Ognissanti,_Florence)) | A |
| Schiffsmaß | Schiff 86 × 31 Blöcke (43 × 15,5 m), lichte Breite 28 | it.wikipedia nennt **95 × 14 m**. Die Breite 14 m passt zum Innenmaß; die Länge 95 m deckt sich **nicht** mit dem OSM-Umriss (Schiff 43 m, mit Chor 50 m). OSM ist maßgeblich | B (Breite), Länge Widerspruch |
| Altäre | je Seite sechs | sechs Altäre an jeder Seite des Schiffs (it.wikipedia) | A |
| Querhaus | links Giottos Kruzifix und Saio-Kapelle, rechts Kapelle S. Pietro d'Alcantara mit der Grabplatte Botticellis | it.wikipedia, en.wikipedia | A (Ort), C (Raumform) |
| Chor | hinter dem Hochaltar, zwei geschnitzte Holztüren | it.wikipedia | A |
| Lünette | Krönung der Jungfrau, Terrakotta | Benedetto Buglioni (um 1510), nicht Della Robbia ([it.wikipedia](https://it.wikipedia.org/wiki/Chiesa_di_Ognissanti_(Firenze)), en.wikipedia: „once thought Della Robbia“) | A |
| Campanile | Turm links der Fassade, 13./14. Jh., drei Glocken von 1756 (die größte 620 kg) und eine kleine von 1690 | it.wikipedia; en.wikipedia „links der Fassade“. **Widerspruch zur Lage:** In OSM liegt der Turm südöstlich am Schiff, also beim Eintreten rechts. OSM ist maßgeblich | A (Glocken), B (Lage), C (Höhe) |
| Gemälde im Schiff | Botticelli (Augustinus) rechts, Ghirlandaio (Hieronymus) gegenüber | beide 1480; Augustinus an der rechten Schiffswand über dem Beichtstuhl nach dem dritten Altar, Hieronymus auf der gegenüberliegenden Wand nach dem Kruzifix-Altar (it.wikipedia) | A |
| Vespucci-Kapelle | zweiter Altar rechts | Ghirlandaio (und David), Madonna della Misericordia, um 1472 bis 1475 (it.wikipedia) | A |
| Kruzifix Giottos | linkes Querhaus | um 1310 bis 1315; nach der Restaurierung von 2010 dorthin versetzt (it.wikipedia) | A |
| Hochaltar | Pietra dura | Entwurf Jacopo Ligorio; Deckenmalerei „sotto in su“ von 1770 (en.wikipedia) | A |
| Sakristei | Tür vom Presbyterium | Holzkruzifix von Veit Stoß über der Sakristeitür (en.wikipedia) | A (Werk), C (Ort) |
| Cenacolo | 16 × 8 Blöcke | Ghirlandaio, 1480, Fresko **400 × 810 cm**, im Refektorium zwischen den beiden Kreuzgängen, an der dem Eingang gegenüberliegenden Wand (zwei Lünetten), echte Fenster in der Flucht der gemalten, Sinopia an der linken Wand, zwei Fresken von Giuseppe Romei (17. Jh.) in den Nischen; Eingang Borgo Ognissanti 42 ([it.wikipedia](https://it.wikipedia.org/wiki/Cenacolo_di_Ognissanti)) | A (Maße, Raum), C (Wand) |
| Kreuzgänge | **nicht gebaut** | Chiostro Grande (Ligozzi, Giovanni da San Giovanni: Storie di san Francesco) und Chiostro Minore (it.wikipedia). Der OSM-Umriss hat **keine Löcher**: die Höfe sind nicht zu erkennen und werden nicht erfunden | – |

## 3. Entwurfswerte ohne Beleg (Stufe C)
- Schiff: Tonne Kämpfer Lage 20, Scheitel 28 (flache Halbellipse), First 38, Traufe 30; Querhaus Scheitel 28, First 36; Fassade Mitte Lage 44, Seiten 34.
- Sakristei, Kapelle, Chor, Nebenräume: Decken Lage 20 bis 24, Dächer 26 bis 31.
- Konvent: Erdgeschoss lichte Höhe 12 (6 m), Obergeschoss 11 (5,5 m), Trakte mit Satteldach (First Lage 33). Wendeltreppen 5 × 5 in vier Trakten (m, f, c, d).
- Campanile: gegenüber dem OSM-Teil um **einen Block je Seite aufgeweitet** (u 59,8..72,8 × w 29,3..44,8), damit die Wendeltreppe 5 × 5 in den im Raster um 47° gedrehten Turm passt; Höhe 30 m (Lage 60), Glockenstube Lage 44..54, Pyramide 55..60 (keine Höhenangabe in den Quellen).
- Positionen der Altäre: Mittenabstand 7,2 Blöcke (sechs je Seite).
- Türen zwischen den Trakten sind gesetzt, die Verbindung zur Kirche (Chortüren, Sakristei) nach Quelle.
