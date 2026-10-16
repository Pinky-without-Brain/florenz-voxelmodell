# Bauteilkatalog – Loggia dei Servi di Maria (Welle 7b)

Maße und Quellen: [`REFERENZMASSE.md`](REFERENZMASSE.md). Rahmen LS (θ 132,03°), Lagen yr = Y − 69. Bauplan `tools/wahrzeichen/palazzo.js` (Option `portikus`), Einstellungen `projects/loggia_dei_servi/model/_ls.js`, Raumplan und Ausstattung `model/_raeume.js`. Stufen: A belegt, B Literatur oder begründet, C Entwurf.

## 1. Module und Bauteile

| Modul | Titel | Bauteile |
|---|---|---|
| 0 | Fundament, Boden und Hof | `fundament`, `boden`, `treppe` |
| 1 | Fassaden | `aussenwand`, `portikus`, `fenster`, `kranzgesims` |
| 2 | Hof und Innenwände | `hofwaende`, `hoffenster`, `loggiawand`, `trennwaende` |
| 3 | Böden und Decke | `geschossboeden`, `decke`, `trennwaende_og` |
| 4 | Dach | `dach` |
| 5 | Licht | `licht` |
| 6 | Hotel, Oratorium und Gedenktafel | `hotelzimmer`, `hotel_empfang`, `oratorium`, `gedenktafel_1613`, `lichthoefe`, `licht_ausstattung` |

## 2. Zonen und Wände
- **Geschosse** (Lagen): Portikus/EG 0..12, Obergeschoss 12..23 (Traufe Y 92); Walmdach bis Lage 28 (höchster Block Y 97). Gesims aus Pietra serena auf Lage 12, Kranzgesims Lage 22–23.
- **Portikus** (Bauteil `portikus`): neun Rundbögen auf Säulen aus Pietra serena, Joch 11, Mitten bei u 11, 22 … 99, Tiefe 9, Kämpfer Lage 7; die Bögen reichen bis zum Boden (deklarierte Öffnung `arkade`). Der Portikusboden ist Pietra serena.
- **Außenwände** zwei Blöcke dick: Fassade der Loggia (w < 1,5) mit Sockel aus Pietra serena und Putz, sonst Putz mit Bändern aus Pietra forte und Terrakotta; im Obergeschoss ein Fenster über jedem Bogen (Raster 11).
- **Rückwand der Loggia** (`loggiawand`, Pietra serena, nur EG) mit Türen 3 × 7 in der Achse jedes zweiten Bogens (u 11, 33, 55, 77, 99).
- **Lichthöfe**: sechs Löcher des OSM-Umrisses (Hof 0..5), zu klein für Arkaden (< 150 Zellen); Türen in den Hofwänden im Raster 20, Boden Schachmuster.

## 3. Begehbarkeit
- **Zugang**: neun Bögen der Loggia, alle bis zum Boden offen (je 9 breit, 7 hoch). R13 beginnt auf den Zellen davor an der Piazza.
- **Raumteilung**: zwei Längswände (u-Achse bei w 21,5 und 28,5, Türen 3,4 × 5) bilden einen Flur; fünf Vorderzimmer an der Loggia, vier Hinterzimmer (Hinterhaus) mit Lichthöfen, die Empfangshalle um die Treppe, ein Oratorium und ein Querflügel (Tür bei u 110). Alle Wände laufen durch beide Geschosse.
- **Treppe**: Wendeltreppe aus Pietra serena (Kern 3 × 3) in der Empfangshalle (u 71, w 44) durch beide Geschosse, Treppenloch im Obergeschossboden.
- **Unzugänglich** (deklariert): Dachraum über der obersten Decke.
- **Licht**: Seelaternen im Boden jedes Raums im Raster 12.

## 4. Ausgestaltete Innenräume (Modul 6)
Alles vereinfacht in vollen Blöcken; Lage der Räume Stufe C.

| Bauteil | Raum | Lage im Grundriss | Stufe | Inhalt und Quelle |
|---|---|---|---|---|
| `hotelzimmer` | Hotelzimmer | Vorder- und Hinterzimmer beider Geschosse | Nutzung A, Aufteilung C | Bett aus Holz mit rot-weißer Decke (eine Lage hoch), im Hinterhaus ein kleiner Tisch. Quelle: it.wikipedia (Hotel Loggiato dei Serviti) |
| `hotel_empfang` | Empfangshalle | EG, Hinterhaus (u 67..88, w 30..56) | C | Schachboden aus Cotto und Marmor, Wandfelder Weiß und Gelb mit Pilastern, Empfangstresen, Wendeltreppe und ein Lichthof |
| `oratorium` | Oratorium der Bruderschaft | EG, Südwestecke des Hinterhauses (u 90..109, w 30..56) | Existenz A, Lage C | Boden Rot-Weiß, Wandfelder Weiß und Blau mit Goldrahmen, Altar aus Pietra serena, Altarbild als Farbfeld, drei Bankreihen. Quelle: it.wikipedia (Oratorium der Confraternita di San Girolamo e San Francesco Poverino, Werke u. a. von Landi und Verrocchio) |
| `gedenktafel_1613` | Gedenktafel von 1613 | Rückwand der Loggia (u 62..70) | Existenz A, Lage C | Farbfeld mit Goldrahmen: Tafel der Otto gegen Spiele, Müll und Versammlungen. Quelle: it.wikipedia |
| `lichthoefe` | Lichthöfe | die sechs OSM-Löcher | Zahl B, Boden C | Schachmuster aus Pflaster und Marmor |
| `licht_ausstattung` | Licht in den Räumen | alle ausgestalteten Räume | Regel §1.5 | Seelaternen im Boden |

## 5. Abweichungen und Auslassungen
- **Zahl der Bögen**: die Quelle nennt keine Gesamtzahl; gebaut sind neun in Anlehnung an die Innocenti (Joch 11 statt 14 wegen der kürzeren Fassade von 109 Blöcken).
- **Peducci mit den verschlungenen S der Serviten**, Gewölbe der Loggia und Details des Obergeschosses: keine Maße, nicht gebaut; die Loggia hat eine flache Decke.
- **Zentrale Corte**: it.wikipedia nennt einen zentralen Hof, OSM zeigt nur sechs kleine Löcher; gebaut sind diese als Lichthöfe.
- **Hotelzimmer** und **Empfangshalle** sind Entwurf (Stufe C), belegt ist nur die Hotelnutzung.
- **Querflügel** an der Südwestecke (u > 110): Zimmer ohne eigene Ausstattung, Zugang nur durch das Haus.
- **Oratorium**: Existenz im Haus belegt, Lage und Größe nicht; das Gemälde ist ein Farbfeld.
