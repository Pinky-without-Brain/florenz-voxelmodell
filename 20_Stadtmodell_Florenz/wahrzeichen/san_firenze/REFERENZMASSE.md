# Referenzmaße – Complesso di San Firenze (Welle 6c)

Projekt-ID `san_firenze`. Maßstab 1:2 (**Blöcke = 2 · m**). Stand 16.10.2026. Stufen: **A** belegt (Quelle genannt), **B** Literatur oder aus OSM begründet, **C** Entwurf. Bauteile: [`BAUTEIL_KATALOG.md`](BAUTEIL_KATALOG.md). Bauplan: Palast `tools/wahrzeichen/palazzo.js` (`projects/san_firenze/model/_sf.js`), Kirche und Oratorium `model/_kb.js`.

## 1. Rahmen und OSM

| Größe | Wert | Quelle |
|---|---|---|
| OSM-Objekte | **r4084510** „Complesso di San Firenze“ (Palast/ehem. Tribunale, 9.668 Zellen, zwei Höfe, `building:levels=4`, Wikidata Q2990427), **w361442655** „Chiesa di San Filippo Neri“ (`building=church`, 2.981 Zellen, zwei `building:part`), **w307129115** „Sala della Musica“ (`amenity=theatre`, `building:levels=3`, `roof:shape=many`, 1.947 Zellen) | `data/stadt/gebaeude.json` |
| Gesamtmaske | 14.596 Zellen (Aufgabenstellung 14.595; Rasterung der Ränder, Zusatzmasken abzüglich Palast) | `ladeMasken` |
| **Rahmen `SF`** | Ursprung (137,5 \| 821) an der Südwestecke des Oratoriums, θ = **−75,2°**: u entlang der Fassadenlinie zur Piazza San Firenze von Süd nach Nord (0..108), w von der Fassade nach Osten (0..154) | an den Polygonkanten gemessen (die drei Fassaden liegen auf einer Geraden, w = 0 ± 1), A |
| Anordnung | Oratorium u 0..34 × w 0..58; Palast-Vorderbau u 34..75 × w 0..44, dahinter Flügel und Ostblock bis w 154; Kirche u 75,4..108,2 × w 0..81 mit Anbau u 56..75 × w 44..62 | gemessen |
| Höfe (Palast) | Loch 0: 1.604 Zellen, u 27..58 × w 75..127; Loch 1: 108 Zellen, u 71..86 × w 87..96 (Lichthof) | gemessen |
| Gelände | 61 (3.172 Zellen), **62 (6.466)**, 63 (2.516), 64 (1.915), 65 (527); in den Masken auf höchstens Y 61 abgetragen (Zusatzmasken `gelaendeBis: boden`) | `tools/city/ground_stadt.js` |
| **`bodenY`** | **62** | häufigster Wert, B |
| Straßen | Westseite Piazza San Firenze, Südseite Borgo de' Greci (Oratorium und Palast), Ostseite Via Filippina, Nordseite Via dell'Anguillara | Randanalyse der Kanten |
| Nachbarn (bleiben Häuser) | w306156984, w306156999 (`building=bridge`, `building:min_level=2`, Übergänge über die Straßen) | OSM |

## 2. Maße (Literatur gegen OSM)

| Maß | Modell | Literatur oder OSM | Bewertung |
|---|---|---|---|
| Geschichte | 1640 Gelände von Urban VIII. an die Filippini; 1645 Pietro da Cortona (Entwurf nicht ausgeführt); 1667 Pier Francesco Silvani (Kirche); 1715 Fassade von Ferdinando Ruggieri, Innendekoration Gioacchino Fortini; 1745–49 Konvent von Giovanni Filippo Ciocchi mit Zanobi Del Rosso; 1772–75 neues Oratorium von Del Rosso | [it.wikipedia „Complesso di San Firenze“](https://it.wikipedia.org/wiki/Complesso_di_San_Firenze) | A |
| Nutzung | Gerichte bis 2012, seit Juli 2017 Franco Zeffirelli International Centre for the Performing Arts | it.wikipedia | A |
| Palast | 4 Geschosse (9 + 8 + 7 + 6 = 30 Blöcke), Walmdach 5 Lagen | OSM `building:levels=4`, Höhe 30 | B (Summe), C (Verteilung) |
| Kirche | einschiffig, Fassade 33 Blöcke breit, Gebäude 81 Blöcke tief; Mittelschiff 15 breit, Scheitel des Tonnengewölbes Lage 23 (11,5 m), First Lage 30, Fassadenspitze Lage 33 | Fassade aus Pietra forte nach dem Vorbild von San Gaetano ([it.wikipedia „Chiesa di San Filippo Neri“](https://it.wikipedia.org/wiki/Chiesa_di_San_Filippo_Neri_(Firenze))); Umriss aus OSM; Höhen nach OSM `hoeheBl` 30 (Schätzung) | A / B / C |
| Kapellen | je drei nördlich und südlich des Mittelschiffs, 5 Blöcke tief | sechs Altarbilder (Pinzani, Gherardini, Puglieschi, Bonechi, Redi, Gabbiani) und zwei Seitenaltäre von Antonio Montauti (it.wikipedia); Zahl der Kapellen aus den Altarbildern geschlossen | B / C |
| Presbyterium und Apsis | Presbyterium w 60..70, Apsis (Halbkuppel) bis w 77,5 | Apsis mit Fresko von Niccolò Lapi, Hochaltar Zanobi Del Rosso (it.wikipedia) | A / C |
| Sakramentskapelle | Anbau u 56..75 × w 44..62 mit Kuppel (Radius 6,8) | Del Rosso 1776, Grab Pietro Bini, Madonnina von Carlo Maratta, Kuppelfresken von Luigi Sabatelli (it.wikipedia); Lage nach dem Umriss von OSM (`building:part` w675886591) | A / B |
| Deckenbild Kirche | Mittelbild im Kassettengewölbe | Giovanni Camillo Sagrestani, „Gloria di san Filippo Neri“, 1715 | A |
| Oratorium | Saal 29,5 × 43 Blöcke, Vestibül 8,5 tief, Decke Lage 17, First Lage 23; Emporen (Platte Lage 8) an beiden Längsseiten, an der Rückseite und im Vestibül auf ionischen Säulen | Galerien auf ionischen Säulen; Decke „Assunzione della Vergine“ (Giuliano Traballesi 1775); Engel an der Empore (Filippo Burci); Geschichten des heiligen Filippo Neri (Gesualdo Francesco Ferri); früher Gerichtssaal (it.wikipedia); Höhe nach OSM (3 Geschosse, 23 Blöcke) | A / B / C |
| Portale | Palast: Piazza San Firenze (8 × 11) und Borgo de' Greci (7 × 10); Kirche 7 × 11; Oratorium 7 × 10 | Lage der Palastportale C | A / C |
| Statuen am Kirchenportal | zwei Figuren (Fede, Speranza) beiderseits des Portals | Gioacchino Fortini 1715 | A |
| Wappen | Serragli-Wappen mit zwei Engeln mit Trompeten im Giebel der Kirche | it.wikipedia (Kopie von Pompilio Ticciati) | A, Farben C |

## 3. Entwurfswerte (Stufe C)
Fensterraster des Palasts 9 (Breite 3); Raumaufteilung des Palasts mit zehn Trennwandlinien; Lage der Wendeltreppe im Westflügel; Maße der Kapellen und der Treppe im Oratorium (acht Stufen, Breite 3); Anordnung der Altarbilder; Gewölbeform (Segmentbogen, Stich 9).

## 4. Nicht gebaut
Kirche: Sakristei, Orgel, Seitenaltäre von Montauti als eigene Bauteile (nur die sechs Altarbilder und Altartische), Bänke (nicht belegt). Oratorium: Gerichtseinbauten. Palast: Haupttreppe und alle Innenräume des Konvents (keine Quelle), Fassadenschmuck.
