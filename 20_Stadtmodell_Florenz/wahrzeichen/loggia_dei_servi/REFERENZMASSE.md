# Referenzmaße – Loggia dei Servi di Maria (Welle 7b)

Projekt-ID `loggia_dei_servi`. Maßstab 1:2 (**Blöcke = 2 · m**). Stand 16.10.2026. Stufen: **A** belegt (Quelle genannt), **B** Literatur oder aus OSM begründet, **C** Entwurf. Bauteile: [`BAUTEIL_KATALOG.md`](BAUTEIL_KATALOG.md). Bauplan: `tools/wahrzeichen/palazzo.js` (Option `portikus`), Einstellungen `projects/loggia_dei_servi/model/_ls.js`.

## 1. Rahmen und OSM

| Größe | Wert | Quelle |
|---|---|---|
| OSM-Objekt | Relation **r7021619** „Loggia dei Servi di Maria“, `building=apartments`, `building:levels=3`, `roof:levels=1`, Wikidata Q3257905, Wikipedia `it:Loggia dei Servi di Maria`; **6.438 Zellen** (Fläche 6.431 Blöcke²), **sechs Löcher** (16, 25, 18, 35, 25, 18 Zellen) | `data/stadt/gebaeude.json`, `tools/wahrzeichen/maske.js` |
| Umriss | langer Streifen: Fassade zur Piazza 109 Blöcke (Kante 16), Tiefe etwa 55 Blöcke, dazu ein Querflügel (u > 110, w ≤ 14) an der Südwestecke | gemessen an den Polygonkanten |
| **Rahmen `LS`** | Ursprung (566,5 \| −846) am Nordostende der Fassadenkante, θ = **132,03°** entlang der Fassade (u von Nordost nach Südwest, 0..109), w von der Piazza ins Gebäude (0..55, nach Nordwesten) | Polygonkante 16, A |
| Löcher (Lichthöfe) | alle im Streifen w 32..41: u 12..15, 23..28, 46..50, 61..63, 81..84, 94..97 (je 3 bis 5 Blöcke breit) | gemessen |
| Gelände | 67 (721 Zellen), 68 (1.487), **69 (2.439)**, 70 (1.791); in der Maske auf höchstens Y 68 abgetragen | `tools/city/ground_stadt.js` |
| **`bodenY`** | **69** | häufigster Wert, B |
| Nachbarn | gegenüber an der Piazza `ospedale_degli_innocenti` (Portikus, neun Bögen) und `santissima_annunziata` (Portikus Michelozzos); keine gemeinsame Zelle (Test) | Maskenschnitt |

## 2. Maße (Literatur gegen OSM)

| Maß | Modell | Literatur oder OSM | Bewertung |
|---|---|---|---|
| Höhe bis zur Traufe | 23 Blöcke (11,5 m) | OSM `building:levels=3`, `hoeheBl` 23 | B |
| Geschosse | Portikus/EG 12, Obergeschoss 11 | zwei Geschosse (Erdgeschoss mit Loggia, oberes Stockwerk bis 1574 fertig) ([it.wikipedia](https://it.wikipedia.org/wiki/Loggiato_dei_Servi_di_Maria)); Höhen C, Summe OSM | A / C |
| Architekten, Bauzeit | Antonio da Sangallo d. Ä. und Baccio d'Agnolo (Baccio nur bis 1519), Loggiato 1516–1525, Gesamtanlage 1720 | it.wikipedia | A |
| Vorbild | der Portikus soll sich am gegenüberliegenden Spedale degli Innocenti orientieren | it.wikipedia | A |
| Zahl der Bögen | **neun** Rundbögen (Joch 11 Blöcke, Mitten bei u 11, 22 … 99) | die Quelle nennt keine Gesamtzahl (nur acht Häuser mit je anderthalb Jochen, die letzten drei Joche erst bis 1720 geschlossen); neun in Anlehnung an die Innocenti (neun Bögen), Breite 109 aus OSM | C |
| Portikus | Tiefe 9 Blöcke, Kämpfer bei Lage 7, Säulen und Bögen aus Pietra serena, Rückwand mit Türen alle zwei Joche | Bauform nach den Innocenti (it.wikipedia), Maße C | A / C |
| Fenster | ein Fenster über jedem Bogen (Breite 3, Lage 15..21) | Raster aus dem Joch, C | C |
| Höfe | sechs Lichthöfe (OSM-Löcher), alle kleiner als 36 Zellen, ohne Arkaden | it.wikipedia nennt eine zentrale „Corte“ (Hof) ohne Maße; OSM zeigt sechs kleine Löcher | A / B |
| Nutzung | Hotel „Loggiato dei Serviti“ (Familie Budini Gattai seit 1984), davor Pension | it.wikipedia | A |
| Oratorium | Oratorium der Confraternita di San Girolamo e San Francesco Poverino im Haus, Werke u. a. von Gennaro Landi und Andrea del Verrocchio | it.wikipedia; Lage im Haus nicht belegt | A (Existenz) / C (Lage) |
| Gedenktafel | Tafel der Otto von 1613: unter den Loggien keine Spiele, kein Müll, keine Versammlungen, 10 Scudi Strafe | it.wikipedia; Lage an der Rückwand der Loggia C | A / C |

## 3. Entwurfswerte (Stufe C)
Fensterraster 11 mit Breite 3; Sohlen je Geschoss 3 / 3, Höhen 6 / 6; Walmdach 4 Lagen; Wendeltreppe in der Empfangshalle des Hinterhauses (u 71, w 44); zwei Längswände (u-Achse bei w 21,5 und 28,5) mit einem Flur dazwischen, Querwände trennen Vorder- und Hinterzimmer; Türen 3,4 × 5.

## 4. Nicht gebaut
Peducci (Konsolen) mit den verschlungenen S der Serviten (keine Maße und Lage), Gewölbe der Loggia (flache Decke statt Kreuzgewölbe), Rustika- und Fensterdetails des Obergeschosses, die zentrale Corte als großer Hof (OSM zeigt nur sechs kleine Löcher), Verrocchios Werke im Oratorium (nur ein Altarbild als Farbfeld).
