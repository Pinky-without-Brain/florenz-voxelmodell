# Bauteilkatalog – Torre degli Alberti (Welle 8c)

Maße und Quellen: [`REFERENZMASSE.md`](REFERENZMASSE.md). Rahmen TA (θ −17,2°), Lagen yr = Y − 61. Bauplan `projects/torre_alberti/model/_ta.js` (Zellen im Speicher mit `tools/wahrzeichen/zellplan.js`), Ausstattung `_ta_ausstattung.js`. Content der Standardmodule: `node tools/diag/w8c_inhalt.js torre_alberti` (Texte in `tools/diag/w8c_texte.js`). Stufen: A belegt, B Literatur oder begründet, C Entwurf.

## 1. Module und Bauteile

| Modul | Titel | Bauteile |
|---|---|---|
| 0 | Fundament und Boden | `fundament` (entfällt, Gelände eben), `boden` |
| 1 | Mauern, Fenster, Loggetta | `aussenwand`, `fenster`, `loggetta` |
| 2 | Geschossböden und Treppen | `geschossboeden`, `treppe` |
| 3 | Terrasse und Zinnen | `terrasse`, `zinnen` |
| 4 | Licht | `licht` |
| 5 | Ausstattung | `cafe_tresen`, `cafe_tische`, `colonnine`, `kapitelle`, `porta_murata` |

## 2. Zonen und Wände
- **Mauer** (Chebyshev-Abstand `d8` ≤ 3): außen Pietra forte mit eingestreuten Bruchsteinen, Kern Mauerwerk, innerste Lage weißer Putz; Lage 1 bis 35.
- **Geschosse:** Böden (Holz) in Lage 7, 14, 21, 28; Lichte Höhe 6; **Terrasse** (Pflaster) auf Lage 35; **Brüstung** `d8` ≤ 2 auf Lage 36, außen Zinnenzähne auf Lage 37.
- **Fenster:** 2 × 3 Blöcke auf den Lagen 3–5 jedes Geschosses, Raster 7,5 entlang jeder Kante, Glas durch alle drei Mauerlagen.
- **Eckloggetta** (Geschoss 5, Lage 29–34): beide Kanten an der östlichen Ecke öffnen sich auf 11 Blöcke in Rundbögen (Joch 5, Bogen 4 breit, Scheitel Lage 34) mit Pfeilern aus Pietra serena; Brüstung Lage 29–30 aus Marmor; alle Bogenzellen als `loggia` deklariert.

## 3. Begehbarkeit
- **Zugang:** Tür (4 × 5, `tuer`) in der Südmauer am Borgo Santa Croce, ebenerdig (Gelände 61, Boden Y 61).
- **Treppen:** fünf gerade Läufe aus je sieben Treppenblöcken (2 breit, 14 Blöcke), Stützblock unter jeder Stufe; abwechselnd Platz A (West, Weltzellen x 472–473) und Platz B (Ost, x 481–482). Die Böden sind über den Läufen ausgespart (Kopffreiheit 3); der oberste Lauf führt durch die Terrassenplatte, das Loch ist als `tuer` deklariert.
- **Licht:** Seelaternen im Boden jedes Geschosses (Raster 12).
- **Dichtheit:** Mauern, Böden, Terrassenplatte geschlossen; Tür, Loggetta und Terrassenaustieg deklariert.

## 4. Ausstattung (Modul 5)
Alles vereinfacht in vollen Blöcken.

| Bauteil | Titel | Lage | Stufe | Inhalt und Quelle |
|---|---|---|---|---|
| `cafe_tresen` | Tresen | Erdgeschoss, Nordteil | Existenz A (Caffè delle Colonnine), Form C | sieben Holzblöcke, eine Lage hoch |
| `cafe_tische` | Tische | Erdgeschoss | C | zwei Tische 2 × 2, eine Lage hoch |
| `colonnine` | Colonnine | Erdgeschoss, Lage 1–6 | Name A, Zahl C | vier Marmorsäulen tragen die Decke |
| `kapitelle` | Kapitelle mit Albertiketten | Loggetta, Lage 33 | Existenz A, Form C | goldene Blöcke an den Pfeilerköpfen |
| `porta_murata` | Zugemauerte Tür | Südmauer, Außenlage, u ≈ 20,5 | Existenz A, Lage C | Rundbogenumriss aus Pietra serena |

## 5. Abweichungen und Auslassungen
- Die Quelle nennt weder Höhe noch Geschossaufteilung; beides folgt OSM (`building:levels` 5, Höhe 37).
- Die **Zinnen** sind eine Zutat; belegt ist nur das Terrässchen des 19. Jh. und die Kappung.
- Die Lage der **Loggetta** an der Ostecke und der **Eingangstür** am Borgo Santa Croce ist Stufe C; die Quelle sagt nur, dass die alte Tür dort zugemauert ist und dass die Loggetta aus dem frühen 15. Jh. stammt.
- Die **Obergeschosse** sind unmöbliert (keine Quelle); die Zugemauerten Monoforen sind nicht gebaut.
