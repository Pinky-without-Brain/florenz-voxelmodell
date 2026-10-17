# Referenzmaße – Palazzo Gondi (Welle 7a)

Projekt-ID `palazzo_gondi`. Maßstab 1:2 (**Blöcke = 2 · m**). Stand 16.10.2026. Stufen: **A** belegt (Quelle genannt), **B** Literatur oder aus OSM begründet, **C** Entwurf. Bauteile: [`BAUTEIL_KATALOG.md`](BAUTEIL_KATALOG.md). Bauplan: `tools/wahrzeichen/palazzo.js`, Einstellungen `projects/palazzo_gondi/model/_gn.js`, Raumplan `model/_raeume.js`.

## 1. Rahmen und OSM

| Größe | Wert | Quelle |
|---|---|---|
| OSM-Objekt | Relation **r4084512** „Palazzo Gondi“, `building=apartments`, `building:levels=3`, `historic=building`, Wikidata Q1083014, **3.997 Zellen** der Maske (Fläche 4.004,5 Blöcke²), zwei Löcher | `data/stadt/gebaeude.json`, `Maske.ausGebaeude` |
| Umriss | unregelmäßiges Siebeneck: Ostkante 74,5 Blöcke (Piazza San Firenze), Südkante 68,7 (schräg, Via dei Gondi), Westkante 45,5, kurze Abknickungen im Nordwesten, Nordkante 36 + 20 | gemessen an den Polygonkanten |
| **Rahmen `GN`** | Ursprung (89 \| 729) am Nordende der Ostkante, θ = **80,73°** entlang der Fassade: u von Nord nach Süd (−5..74), w von der Fassade nach Westen (0..64) | Polygonkante 0, A |
| Hof (Loch 0) | 83 Zellen, u 24,8..32,5 × w 24,6..35,6 (8 × 11 Blöcke) | gemessen |
| Lichthof (Loch 1) | 10 Zellen, u 4,1..5,7 × w 39,3..43,4 | gemessen |
| Gelände | 62 (115 Zellen), 63 (1.988), **64 (1.790)**, 65 (104); in der Maske auf höchstens Y 62 abgetragen | `tools/city/ground_stadt.js` |
| **`bodenY`** | **63**: Das Gelände an Piazza und Via dei Gondi liegt zwischen 62 und 64 (Abweichung −1 bis +1 gegenüber `bodenY`), die Portale sind ohne mehr als eine Stufe erreichbar | B |
| Anschlüsse | Ostkante zur **Piazza San Firenze** (u 25..71), Südkante zur **Via dei Gondi** (w 1..36), übrige Kanten zu Fußwegen und Nachbarhäusern | Randanalyse (`tools/diag/_strassen_w7a.js`) |

## 2. Maße (Literatur gegen OSM)

| Maß | Modell | Literatur oder OSM | Bewertung |
|---|---|---|---|
| Höhe bis zur Traufe | 23 Blöcke (11,5 m) | OSM `building:levels=3`, `hoeheBl` 23 | B |
| Geschosse | EG 9, Piano nobile 7, 2. OG 7 | drei Geschosse (it.wikipedia, Palazzo Gondi); Höhen C, Summe folgt OSM | A / C |
| Baukörper | kubisch um einen zentralen Innenhof | it.wikipedia | A |
| Entwurf, Bauzeit | Giuliano da Sangallo, Entwurf 1490 für Giuliano di Lionardo Gondi; um 1501 bewohnbar, unvollendet; Fertigstellung 1874 | it.wikipedia (die Infobox nennt 1490–1498, der Text Baubeginn 1489) | A |
| Fassade | Bugnato aus Pietra forte, nach oben abnehmend: Kissenquader im EG, flache Bugne im 1. Obergeschoss, glatte Wand im obersten | it.wikipedia | A |
| Rustika im Modell | EG: Rustika mit Pietra-forte-Fuge jede 3. Lage; 1. OG: jede 4. Lage; 2. OG: glatte Pietra forte, jede 6. Lage Rustika | Abstufung A, Fugenraster C | A / C |
| Portale | drei bogenförmig gerahmte Portale im EG (Modell: an der Piazza San Firenze, 7 breit, 8 hoch, Abstand 20 Blöcke) | it.wikipedia nennt drei Portale und kleine quadratische EG-Fenster; Lage und Maß C | A / C |
| Fenster | Rundbogenfenster über Gesimsen; Fenster des 2. Geschosses etwas höher; Raster 10 Blöcke, Breite 4; Biforium (Mittelsäule) in den Obergeschossen | it.wikipedia (Rundbogen, höheres 2. Geschoss); Raster und Biforien C | A / C |
| Dachgesims | Kranzgesims mit Konsolen (Modell: Gesims ohne Konsolen) | it.wikipedia | A |
| Hof | Arkaden mit korinthischen Säulen auf allen vier Seiten (3 bzw. 2 Arkaden je Seite); Hof 8 × 11 Blöcke aus OSM | it.wikipedia; Hofmaße aus OSM | A / B |
| Brunnen | zentral, doppelte Schale, 1652, gespeist aus dem Boboli-Garten | it.wikipedia | A |
| Treppe | monumentale Treppe Sangallos an der Nordseite für die oberen Geschosse; Wangen mit Tier- und Pflanzenmotiven (Originale im Victoria and Albert Museum), Balustraden mit gedrehten Kanneluren | it.wikipedia; Lauflänge und Lage im Nordflügel C | A / C |
| Vestibül | Reliefs in Pietra serena | it.wikipedia | A |
| Großer Saal | elf Ahnenporträts, monumentaler Steinkamin Sangallos (1501–05) mit Figuren des Herkules und des Samson | it.wikipedia; Größe und Lage C | A / C |
| Alkoven | 1710, Stuck von Giovanni Battista Ciceri, Deckenfresken von Matteo Bonechi, Quadraturen von Lorenzo Del Moro | it.wikipedia | A |
| Weitere Räume | Korridor, Sala dei Paesaggi, Sala di Giove ed Ebe | it.wikipedia nennt die Namen, nicht die Lage | A / C |
| Altana | Altana mit Säulen auf dem Dach, in Achse mit dem zweiten Portal | it.wikipedia | A (nicht gebaut) |
| Via-dei-Gondi-Fassade | Giuseppe Poggi, fünf Achsen, drei Portale, dreieckige Terrasse im Piano nobile; zweite Treppenrampe vom Wagendurchgang | it.wikipedia | A (nicht gebaut) |

## 3. Entwurfswerte (Stufe C)
Fensterraster 10 mit Breite 4 (Fenster in der Achse der Portale, Versatz 23,7); Sohlen je Geschoss 3 / 2 / 2, Höhen 3 / 3 / 4; Walmdach 4 Lagen; Hof-Arkaden Joch 4 mit Kämpfer 6 und Galerie 3 Blöcke tief; sieben Trennwandlinien (Türen 3 × 5); Wendeltreppe im Südwestraum, Hoftreppe (neun Stufen, zwei Blöcke breit) im Nordflügel.

## 4. Nicht gebaut
Altana auf dem Dach, Fassade Poggis an der Via dei Gondi (Portale und Terrasse), zweite Treppenrampe vom Wagendurchgang, Wangenmotive und gedrehte Balustraden der Hoftreppe, strahlenförmige Fensterprofile und Kreuzsteine, Konsolen am Dachgesims, korinthische Kapitelle (die Hofsäulen folgen dem gemeinsamen Palazzo-Bauplan). Die Planzahl 4.018 Zellen im Planungsdokument stammt aus einer anderen Zählweise; die Maske des Modells hat 3.997 Zellen.
