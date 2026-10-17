# Referenzmaße – Palazzo Corsini al Parione (Welle 8a)

Projekt-ID `palazzo_corsini_parione`. Maßstab 1:2 (**Blöcke = 2 · m**). Stand 17.10.2026. Stufen: **A** belegt (Quelle genannt), **B** Literatur oder aus OSM begründet, **C** Entwurf. Bauteile: [`BAUTEIL_KATALOG.md`](BAUTEIL_KATALOG.md). Bauplan: `tools/wahrzeichen/palazzo.js` (Option `entlangGlatt`), Einstellungen `projects/palazzo_corsini_parione/model/_cp.js`, Raumplan, Treppen, Terrasse und Ausstattung `model/_raeume.js`.

## 1. Rahmen und OSM

| Größe | Wert | Quelle |
|---|---|---|
| OSM-Objekt | Relation **r4103612** „Palazzo Corsini al Parione“, `building=yes`, `historic=building`, Wikidata Q1228199, `hoeheBl` 30 (Schätzung), **17.425 Zellen** der Maske (Fläche 17.412,5 Blöcke²), **vier Löcher** | `data/stadt/gebaeude.json`, `Maske.ausGebaeude` |
| Umriss | rechteckiger Hauptblock 168 × 90 Blöcke, im Süden ein spitz zulaufendes Dreieck bis w 152 (Grundstück zwischen Via del Parione, Via del Parioncino und Lungarno); sieben kurze Kanten im Nordwesten | gemessen an den Polygonkanten |
| **Rahmen `CP`** | Ursprung (−1197,5 \| 694,5) am Ostende der Fassade zum Lungarno Corsini, θ = **−149,13°** entlang der OSM-Kante 8 (158 Blöcke): u entlang des Flusses (−9..168), w von der Fassade ins Haus (0..152) | Polygonkante 8, A |
| **Haupthof** (Loch 0) | 2.450 Zellen, u 75,7..120,4 × w 15,1..71,6 (45 × 56 Blöcke), in der Achse des Portals (u 98) | gemessen |
| Lichthöfe | Loch 1: 401 Zellen (u 40,2..55,2 × w 85,5..112,4); Loch 2: 123 Zellen (u 7,4..19,4 × w 83,2..93,3); Loch 3: 200 Zellen (u 29,1..39,9 × w 35,0..53,1) | gemessen |
| Gelände | 58 (4.199 Zellen), **59 (12.995)**, 60 (230), 61 (1); in der Maske auf höchstens Y 58 abgetragen | `tools/city/ground_stadt.js` |
| **`bodenY`** | **59**: Das Gelände entlang der Fassade liegt bei 58 bis 59 (Lungarno 58 im Osten, 59 im Westen), Portal ohne mehr als einen Block Höhenunterschied | B |
| Anschlüsse | Kante 8 zum **Lungarno Corsini**, Kante 6 zur **Via del Parioncino** (Gelände 60), Kante 4 und 5 zur **Via del Parione** (59), übrige Kanten zu Nachbarn | Randanalyse (Name der Fläche am Kantenmittelpunkt) |

## 2. Maße (Literatur gegen OSM)

| Maß | Modell | Literatur oder OSM | Bewertung |
|---|---|---|---|
| Höhe bis zur Traufe | 30 Blöcke (15 m) | OSM-Schätzung `hoeheBl` 30 | C |
| Geschosse | EG 12, Piano nobile 10, 2. OG 8 | Erdgeschoss mit Grotte, Piano nobile mit Loggetta, erster Stock mit Galleria (it.wikipedia); Einzelhöhen C | A / C |
| Bauherr, Bauzeit | Bartolomeo Corsini, Baubeginn 1656; Flussflügel 1687, Fassade 1690, Abschluss 1737 (nicht alles verwirklicht); Architekten Alfonso Parigi d. J., Ferdinando Tacca, Pierfrancesco Silvani (1679–81), ab 1685 Antonio Maria Ferri (Großteil des heutigen Baus) | it.wikipedia | A |
| Grundriss | U-Form (Silvani): drei Flügel um einen zentralen Hof; der rechte Flügel doppelt so breit wie der linke (Plan unvollendet); OSM zeigt vier Höfe, der größte ist der Haupthof | it.wikipedia; OSM | A / B |
| Fassade Lungarno | asymmetrisch (linker Flügel zur Ponte alla Carraia fehlt), Mittelteil zurückgesetzt; Modell: gerade Front mit gelbem Putz, Lisenen aus Pietra serena im Raster 12, hellerer Mittelteil (u 83..113) | it.wikipedia; Putzfarbe und Raster C | A / C |
| Portal | Portal mit geschnitztem Corsini-Wappen und seitlichen Säulen; Modell: 7 breit, 7 hoch bei u 98, Säulen aus Quarz und Wappenschild | it.wikipedia; Maße C | A / C |
| Fenster | in der Quelle nicht beschrieben; Modell: Rundbogenfenster Raster 12, Breite 4, Sohle 3 / 3 / 2, Höhe 5 / 5 / 4 | C | C |
| Terrasse | Terrasse auf dem Dach (18. Jh.) mit Steinbalustrade, Statuen und Terrakotta-Vasen; Modell: Flachdach über allen Flügeln als Pflaster auf Lage 31, Balustrade 2 Blöcke hoch am Außen- und Hofrand, Statuen (Säule 4 hoch, goldener Kopf) alle 12 Blöcke am Lungarno, Vasen dazwischen | it.wikipedia; Zahl und Form C | A / C |
| Hof | Balustrade auf Höhe des Piano nobile; Arkaden sind nicht beschrieben, Modell: Arkaden im EG (Joch 5, Galerie 3 tief) wie im gemeinsamen Bauplan | it.wikipedia; Arkaden C | A / C |
| Treppen | Wendeltreppe (Silvani oder Gherardo Silvani), monumentaler Aufgang von Ferri mit neoklassizistischen Statuen, oben Statue Clemens’ XII. (Monaldi, 1737); Modell: gerade Treppe, 12 Stufen, links vom Hof, mit Statuen | it.wikipedia; Lage und Lauf C | A / C |
| Galleria Corsini | im ersten Stock; Werke von Lippi, Bellini, Signorelli, Pontormo, Caravaggio, Rosa, Giordano; nur nach Vereinbarung zugänglich; Modell: Galerie im Flügel am Lungarno (u −9..75) mit Bildfeldern | it.wikipedia; Lage C | A / C |
| Salone del Trono | Deckenfresko Apoteosi di Casa Corsini (Gabbiani, um 1696), Galerie mit antiken Statuen; Modell: Saal im Ostflügel (u 128..158), Ringe als Deckenbild, Podest, Thron, drei Statuen | it.wikipedia; Lage C | A / C |
| Sala da Ballo | Gewölbe von Alessandro Gherardini; Modell: Saal im südlichen Trakt (u 128..168, w 65..90) | it.wikipedia; Lage C | A / C |
| Künstliche Grotte | im Erdgeschoss, 1692–1698; Modell: Raum im Ostflügel am Lungarno mit Bruchsteinwänden und Tropfsteinen | it.wikipedia; Lage C | A / C |
| Loggetta, Fresken | Loggetta im Piano nobile mit Fresken von 1650–1653; weitere Säle 1692–1700 von Gabbiani, Ulivelli, Dandini u. a. ausgemalt | it.wikipedia | A (nicht gebaut) |
| Garten | der Palast hat keinen belegten Garten; der frühere Park gehörte zum Casino del Parione | it.wikipedia | A |

## 3. Entwurfswerte (Stufe C)
Fensterraster 12 (Versatz 8: Achse bei u 98 im Portal); Flachdach als Terrasse; neun Trennwandlinien (Türen 3 × 5); Wendeltreppe im Westteil (u 22, w 25); Treppe Ferris (12 Stufen) im Treppenhaus links vom Hof (u 55, w 20); Treppe auf die Terrasse (9 Stufen) im Piano-nobile-Flügel am Lungarno (u 70, w 7); Hof-Innenwand mit je einer Tür pro Seite (am Lungarno in der Portalachse); Lichthöfe mit Türen im Raster 20. Außennormale mit `entlangGlatt` (θ = −149° liegt diagonal zum Blockraster).

## 4. Nicht gebaut
Zurückgesetzter Mittelteil der Fassade (der Umriss ist gerade), Balustrade auf Höhe des Piano nobile im Hof, Loggetta mit Fresken von 1650–1653, einzelne Gemälde der Galleria und Fresken der übrigen Säle, Wendeltreppe Silvanis in der Form (die Wendeltreppe des Bauplans ist ein Entwurf), Wappen als Schnitzwerk, Garten (nicht belegt), Sammlung Corsini.
