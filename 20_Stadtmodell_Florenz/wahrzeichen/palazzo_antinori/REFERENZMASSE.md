# Referenzmaße – Palazzo Antinori (Welle 7a)

Projekt-ID `palazzo_antinori`. Maßstab 1:2 (**Blöcke = 2 · m**). Stand 16.10.2026. Stufen: **A** belegt (Quelle genannt), **B** Literatur oder aus OSM begründet, **C** Entwurf. Bauteile: [`BAUTEIL_KATALOG.md`](BAUTEIL_KATALOG.md). Bauplan: `tools/wahrzeichen/palazzo.js`, Einstellungen `projects/palazzo_antinori/model/_an.js`, Raumplan `model/_raeume.js`.

## 1. Rahmen und OSM

| Größe | Wert | Quelle |
|---|---|---|
| OSM-Objekt | Relation **r1610588** „Palazzo Antinori“, `building=yes`, `building:levels=3`, `historic=building`, Wikidata Q3889546, **6.489 Zellen** (Fläche 6.501,5 Blöcke²), ein Loch (Hof) | `data/stadt/gebaeude.json` |
| Umriss | zehn Kanten; Hauptblock an der Piazza/Via degli Antinori (Fassade 77 Blöcke), im Westen ein zweiter Block (früheres Haus der Via delle Belle Donne), beide verbunden durch ein Band an der Nordseite (Via del Trebbio); zwischen ihnen eine Aussparung (u 77..106, w 0..50) | gemessen an den Polygonkanten |
| **Rahmen `AN`** | Ursprung (−905 \| 125) am Ostende der Südkante (Kante 4, 77,0 Blöcke, Fassade zur Piazza degli Antinori), θ = **−179,63°**: u entlang der Fassade nach Westen (−13..133), w von der Fassade nach Norden (0..76) | Polygonkante 4, A |
| Hof (Loch 0) | 189 Zellen, u 27,2..43,2 × w 30,8..43,8 (16 × 13 Blöcke); der Garten liegt nach der Quelle hinter dem Hof und gehört nicht zum OSM-Umriss | gemessen |
| Gelände | 58 (11), 59 (97), 60 (182), 61 (1.784), **62 (2.526)**, 63 (1.715), 64 (174); in der Maske auf höchstens Y 62 abgetragen | `tools/city/ground_stadt.js` |
| **`bodenY`** | **63**: Die Fassade steht an einer von Osten (64) nach Westen (62) abfallenden Straße; am Portal liegt das Pflaster bei 64, also einen Block über dem Hausboden (kein Aufstieg nötig, nur eine Stufe nach unten). Rückseitig fällt das Gelände bis 58; dort steht der Palast auf einem sichtbaren Fundament (bis zu vier Blöcke). Die Via delle Belle Donne liegt bei 61, das Stalltor bekommt zwei Stufen | B |
| Anschlüsse | Südkante zur **Piazza/Via degli Antinori** (Gelände 62..64), Nordkanten zur **Via del Trebbio** (61), Westkante zur **Via delle Belle Donne** (61), kurze Ostkante zur Piazza degli Antinori (62) | Randanalyse (`tools/diag/_kanten_w7a.js`) |

## 2. Maße (Literatur gegen OSM)

| Maß | Modell | Literatur oder OSM | Bewertung |
|---|---|---|---|
| Höhe bis zur Traufe | 23 Blöcke (11,5 m) | OSM `building:levels=3`, `hoeheBl` 23 | B |
| Geschosse | EG 8, Piano nobile 8, 2. OG 7 | drei Geschosse (it.wikipedia, Palazzo Antinori); Höhen C, Summe folgt OSM | A / C |
| Bauzeit, Architekt | traditionell 1461–1469, Giuliano da Maiano zugeschrieben; neuere Studie: Beginn 1463, Pause 1466–69, Vollendung 1472; Auftraggeber traditionell Giovanni Boni | it.wikipedia | A |
| Plan | wie der Palazzo Medici in der Via Larga: Achse Portal, Hof, Garten | it.wikipedia | A |
| Fassade | glatte Bugnato im EG, zwei Geschosse mit Rundbogenfenstern, stark vorspringendes Kranzgesims, schlichtes Portal, Steinwappen in der Mitte; Rückfassade Baccio d'Agnolo zugeschrieben | it.wikipedia | A |
| Fassade im Modell | 77 Blöcke, acht Fensterachsen (Raster 9,6), Portal 5 × 7 in der Mitte, Wappen darüber; Rustika mit glatter Lage im EG, darüber Pietra forte | Achsenzahl, Raster und Material C (die Quelle nennt kein Material) | A / C |
| Hof | Portikus an drei Seiten mit Rundbögen und Kreuzgewölben, Säulen aus Pietra serena mit Kompositkapitellen, Loggia im zweiten Geschoss, verzierter Brunnen | it.wikipedia | A |
| Hof im Modell | Arkaden auf vier Seiten (Joch 4, Kämpfer 6), Ziehbrunnen, keine Loggia | vereinfacht | C |
| Garten | schon 1584 mit Zinnenmauer, Gartentür ähnlich der des Palazzo Bartolini Salimbeni, Beete, Nymphäum des 18. Jahrhunderts mit Venusstatue in einer Nische, zugemauerte Loggetta im Norden | it.wikipedia; liegt nicht im Umriss | A (nicht gebaut) |
| Piano nobile | große bemalte Holzkassettendecken auf Konsolen | it.wikipedia | A |
| Früheres Haus | Via delle Belle Donne Nr. 16, wohl im 18. Jahrhundert zu Stallungen und Remisen umgebaut | it.wikipedia | A / C (Lage im Westblock) |
| Nutzung, Geschichte | 1920 von den Antinori verkauft; vor 1939 Giuseppe Paladini (zugemauerte Fenster wieder geöffnet, Hof freigelegt); 1960er Emilio Dori (British Institute); Fassade Anfang der 1980er unter Roberto Monsani restauriert; Cantinetta Antinori im EG seit 1957, Weinklappe (buchetta) am Vicolo del Trebbio | it.wikipedia | A |

## 3. Entwurfswerte (Stufe C)
Fensterraster 9,6 mit Breite 4 (Versatz 28,9), Sohlen 2 / 2 / 2, Höhen 3 / 5 / 4; Walmdach 4 Lagen; drei Trennwandlinien (Türen 3 × 5); Wendeltreppe im Westflügel; Stalltor (6 × 7) an der Via delle Belle Donne mit zwei Stufen.

## 4. Nicht gebaut und Abweichungen
Garten mit Nymphäum und Zinnenmauer (außerhalb des Umrisses), Loggia im 2. Geschoss des Hofs, Kreuzgewölbe der Portiken, Konsolen der Kassettendecken, Weinklappe am Vicolo del Trebbio, Rückfassade nach Baccio d'Agnolo (Form unbelegt). **Der Hof hat im Modell Arkaden auf vier Seiten** (Wirklichkeit: drei). Die Zellenzahl (6.489) weicht von der Planzahl 6.519 ab; maßgeblich ist die Maske des Modells.
