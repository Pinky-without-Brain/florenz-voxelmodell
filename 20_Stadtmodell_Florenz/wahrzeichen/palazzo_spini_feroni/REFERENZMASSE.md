# Referenzmaße – Palazzo Spini Feroni (Welle 7a)

Projekt-ID `palazzo_spini_feroni`. Maßstab 1:2 (**Blöcke = 2 · m**). Stand 16.10.2026. Stufen: **A** belegt (Quelle genannt), **B** Literatur oder aus OSM begründet, **C** Entwurf. Bauteile: [`BAUTEIL_KATALOG.md`](BAUTEIL_KATALOG.md). Bauplan: `tools/wahrzeichen/palazzo.js`, Einstellungen `projects/palazzo_spini_feroni/model/_sf.js`, Raumplan `model/_raeume.js`.

## 1. Rahmen und OSM

| Größe | Wert | Quelle |
|---|---|---|
| OSM-Objekt | Relation **r4101722** „Palazzo Spini Feroni“, `building=yes`, `historic=building`, Wikidata Q281532, **4.390 Zellen** (Fläche 4.390,5 Blöcke²), ein Loch (Hof) | `data/stadt/gebaeude.json` |
| Umriss | schmaler, leicht gekrümmter Block von rund 115 Blöcken Länge (14 Polygonkanten) mit einem Ostflügel (u 64..111, w 22..50) | gemessen |
| **Rahmen `SF`** | Ursprung (−875 \| 761,5) am Ostende der Polygonkante 7 (Borgo Santi Apostoli, 56,9 Blöcke), θ = **122,43°**: u entlang der Kante nach Südwesten (−7..111), w von der Kante nach innen (0..53) | Polygonkante 7, A |
| Hof (Loch 0) | 307 Zellen, u 28,6..47,8 × w 12,6..29,5 (19 × 17 Blöcke) | gemessen |
| Gelände | **61 (3.664 Zellen)**, 62 (714), 63 (12); in der Maske auf höchstens Y 60 abgetragen | `tools/city/ground_stadt.js` |
| **`bodenY`** | **61**; das umgebende Gelände liegt 0 bis 2 Blöcke darüber (Treppen- und Sprungstufe an den Portalen genügt) | häufigster Wert, B |
| Anschlüsse | Kante 7 zum **Borgo Santi Apostoli** (mit unbenanntem Fußweg), die Westspitze (u ≈ −6) zur **Piazza di Santa Trinita**; die übrigen Kanten zu unbenannten Straßen (Via Tornabuoni, Lungarno Acciaiuoli sind in den Flächendaten nicht benannt) | Randanalyse (`tools/diag/_kanten_w7a.js`) |

## 2. Maße (Literatur gegen OSM)

| Maß | Modell | Literatur oder OSM | Bewertung |
|---|---|---|---|
| Höhe bis zur Traufe | 30 Blöcke (15 m) | OSM-Schätzung (`hoeheQuelle: schaetzung`, `hoeheBl` 30); die Quelle nennt keine Höhe | C |
| Geschosse | EG 11, Piano nobile 10, 2. OG 9 | drei Geschosse mit Ballatoio auf Konsolen (it.wikipedia, Palazzo Spini Feroni); Höhen C | A / C |
| Bauherr, Bauzeit | Geri Spini, Beginn 1289 (Architekt Arnolfo di Cambio oder Lapo Tedesco, unsicher) | it.wikipedia | A |
| Fassade | gotisch, unverputzte Pietra forte (Modell: Bruchstein mit behauenen Bändern jede 4. Lage) | it.wikipedia | A / C |
| Zinnen | Kranz guelfischer Zinnen, „Festungsaussehen“ (Modell: 4 Lagen hoch, Teilung 2) | it.wikipedia | A / C |
| Ballatoio | Balkon auf Konsolen unter dem Dach (Modell: glattes Gesims, keine Konsolen) | it.wikipedia | A (nicht gebaut) |
| Fenster | Rundbogenfenster auf Gesimsbändern, im 19. Jahrhundert neu geschaffen, Mezzaninfenster geschlossen; Modell: Raster 9, Breite 4, Biforien in den Obergeschossen | it.wikipedia nennt gebogene Fenster; die Biforien sind nach der Typologie des gotischen Palasts ergänzt (die Seite nennt keine Biforien) | A / C |
| Erdgeschoss | Loggia mit heutigen Schaufenstern, Steinbank (panca di via) rund ums Gebäude | it.wikipedia | A |
| Portale | drei Portale (Borgo Santi Apostoli 2×, Piazza di Santa Trinita), 7 breit, 9 hoch; Lage C | Zahl und Lage nicht belegt | C |
| Hof | offener Hof ohne Arkaden (Umriss aus OSM) | Hof in der Quelle nicht beschrieben | B |
| Durchgang zum Arno | „Passaggio a volta“ bis zum Verkauf 1832, mit dem Bogen der Pizzicotti 1824 abgerissen | it.wikipedia; liegt außerhalb des heutigen Umrisses | A (abgegangen) |
| Androne | Wappenschmuck, Hochrelief von Giuseppe Piamontini (1705) | it.wikipedia | A |
| Cappella | Privatkapelle mit Fresken von Bernardino Poccetti (1609–1612), hierher versetzt | it.wikipedia | A / C (Lage) |
| Säle | Fresken des 17. und 18. Jahrhunderts von Ranieri del Pace | it.wikipedia | A / C |
| Museum | Museo Salvatore Ferragamo seit 1995 im Untergeschoss | it.wikipedia | A (Modell: im Erdgeschoss, siehe §4) |

## 3. Entwurfswerte (Stufe C)
Fensterraster 9 mit Breite 4 (Portale in Fensterachsen, Versatz 33,5); Sohlen je Geschoss 3 / 3 / 2, Höhen 5 / 5 / 4; Walmdach 4 Lagen mit Zinnenkranz 4 Lagen; acht Trennwandlinien (Türen 3 × 5); vier Hoftüren im EG; Wendeltreppe im Ostflügel.

## 4. Nicht gebaut und Abweichungen
Ballatoio mit Konsolen, Loggia des Erdgeschosses (die Wand trägt stattdessen Fenster und Portale), Stuckaturen von Foggini und Merlini, Durchgang zum Arno (abgegangen), Untergeschoss. **Das Museum Ferragamo liegt im Modell im Erdgeschoss des Ostflügels**, weil kein Untergeschoss gebaut wird; die Quelle nennt es im Untergeschoss. Die Zahl der Zellen (4.390) weicht von der Planzahl 4.392 ab; maßgeblich ist die Maske des Modells.
