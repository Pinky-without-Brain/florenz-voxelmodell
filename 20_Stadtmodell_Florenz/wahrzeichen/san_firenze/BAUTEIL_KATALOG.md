# Bauteilkatalog – Complesso di San Firenze (Welle 6c)

Maße und Quellen: [`REFERENZMASSE.md`](REFERENZMASSE.md). Rahmen SF (θ −75,2°), Lagen yr = Y − 62. Ein Projekt, drei Baukörper: der **Palast** (Hauptmaske r4084510) über `tools/wahrzeichen/palazzo.js` (`projects/san_firenze/model/_sf.js`, Raumplan `_raeume.js`), **Kirche** und **Oratorium** als Zusatzmasken (`kirche`, `oratorium`, jeweils `abzugHaupt`) mit eigenem Bauplan `model/_kb.js`, Ausstattung in `_kb_ausstattung.js`. Vorbild für die Aufteilung: San Marco (Konvent mit `palazzo.js`, Basilika mit eigenem Plan). Stufen: A belegt, B Literatur oder begründet, C Entwurf.

## 1. Module und Bauteile

| Modul | Titel | Bauteile |
|---|---|---|
| 0 | Fundament, Boden und Hof | `fundament` (entfällt, Gelände ≤ Y 61), `boden`, `hof`, `treppe` |
| 1 | Fassaden | `aussenwand`, `fenster`, `kranzgesims` |
| 2 | Höfe | `hofarkaden`, `hofwaende`, `hoffenster`, `innenwaende`, `trennwaende` |
| 3 | Böden und Decke | `geschossboeden`, `decke`, `innenwaende_og`, `trennwaende_og` |
| 4 | Dach | `dach` |
| 5 | Licht | `licht` |
| 6 | Kirche San Filippo Neri | `k_boden`, `k_fassade`, `k_fassade_fenster`, `k_waende`, `k_fenster`, `k_gewoelbe`, `k_dach` |
| 7 | Oratorium | `o_boden`, `o_fassade`, `o_fassade_fenster`, `o_waende`, `o_fenster`, `o_treppe`, `o_empore`, `o_saeulen`, `o_bruestung`, `o_decke`, `o_dach` |
| 8 | Licht in Kirche und Oratorium | `k_licht`, `o_licht` |
| 9 | Ausstattung der Kirche | `k_deckenfresko`, `k_apsisfresko`, `k_hochaltar`, `k_altarbilder`, `k_sakramentskapelle` |
| 10 | Ausstattung des Oratoriums | `o_deckenfresko`, `o_wandbilder`, `o_engel` |
| 11 | Ausgestaltete Innenräume des Palastes | `eingangshalle`, `hof_san_firenze`, `licht_ausstattung` |

## 2. Zonen und Wände

**Palast** (Lagen): EG 0..9, 1. OG 9..17, 2. OG 17..24, 3. OG 24..30 (Traufe Y 92); Walmdach bis Lage 36 (Y 98), hohl und `unzugaenglich`. Außenwand zwei Blöcke dick in Sandfarbe, Sockel der Fassade zur Piazza San Firenze aus Pietra forte, Gesimse und Kranz aus Pietra serena. **Fenster** im Raster 9; wo Kirche oder Oratorium bis auf zwei Blöcke anliegen, gibt es keine Fenster (`fenster.aus`, neu in `palazzo.js`). Großer Hof (Loch 0) mit Rundbogenarkaden (Joch 6,5, Kämpfer 6) und Galerie; Lichthof (Loch 1) mit Türen.

**Kirche** (Spaltenmodell, Zonen aus Rahmenkoordinaten): `fassade` (w < 2,5), `nave` (u 84,3..99,3), `band` (Arkadenwände, 2 dick, u 82,3..84,3 und 99,3..101,3, sechs Rundbögen), `kap` (drei Kapellen je Seite, 5 tief) mit `kdiv` (Trennwände w 21..23 und 41..43), `presb` (w 60..70), `apsis` (Halbkreis R 7,5 bis w 77,5), `sakr` (Sakramentskapelle, Kuppel) mit `sband` (Wand mit Durchgang zur Kapelle Süd 3), `masse` (massiv). Außenwände zwei dick bis zur Dachhaut; über den Kapellen Fenster im Obergaden (Lage 21..24). Dachhaut Lage 30 (First) bis 24, Kapellen 16..20, Apsis 24..28, Sakramentskapelle 26 flach; unter den Dächern massives Mauerwerk bis zum Gewölbe, das als Fläche an der Unterseite sichtbar bleibt (Ansatz Lage 14, Scheitel 23).

**Oratorium**: `fassade` (w < 2,5, Portal 7 × 10, zwei Rundbogenfenster, Gesims, flacher Giebel), `vest` (Vestibül w 2,5..11), `vwand` (Trennwand mit Tür 6 × 5 und zwei Durchgängen zu den Emporen), `saal` (w 13..56). Decke Lage 17, Dach Lage 20..23. Emporenplatte Lage 8 im Vestibül, an den Längsseiten (u < 8,5 und u ≥ 25) und an der Rückseite (w ≥ 50), Marmorsäulen (Lage 1..7) am Rand im Abstand 6, Holzbrüstung Lage 9.

## 3. Begehbarkeit
- **Zugang**: Palast von der Piazza San Firenze (8 × 11) und vom Borgo de' Greci (7 × 10), Kirche (7 × 11) und Oratorium (7 × 10) von der Piazza. Alle Tore bis zum Boden offen (`tor`).
- **Palast**: zehn Trennwandlinien (Türen 3 × 5) teilen Vorderbau (Westhalle | Eingangshalle | Osthalle), Nordflügel, Westflügel, Ostblock und Südflügel; die Wendeltreppe im Westflügel erschließt alle vier Geschosse. Dachraum unzugänglich.
- **Kirche**: Portal → Mittelschiff → Presbyterium (eine Stufe) → Apsis; Rundbögen zu den Kapellen; Durchgang (6 × 8) von der südlichen Kapelle 3 zur Sakramentskapelle.
- **Oratorium**: Portal → Vestibül → Saal (Tür 6 × 5); gerade Treppe aus acht Treppenblöcken (Breite 3, Auflager unter jeder Stufe, Kopffreiheit 3) im Vestibül auf die Empore, von dort Durchgänge (Lage 9..13) zu den Seiten- und der Rückempore.
- **Licht**: Seelaternen im Boden (Raster 12), je Raum getrennt: Palast Teil `licht` bzw. `licht_ausstattung`, Kirche `k_licht`, Oratorium `o_licht` (Boden und Emporen).

## 4. Ausgestaltete Innenräume (Module 9, 10, 11)
Alles vereinfacht in vollen Blöcken; Lage und Größe Stufe C, soweit nicht anders angegeben.

| Bauteil | Titel | Lage im Grundriss | Stufe | Inhalt und Quelle |
|---|---|---|---|---|
| `k_deckenfresko` | Kassettengewölbe mit Deckenbild | Gewölbe über Mittelschiff und Presbyterium | Existenz A, Form C | Kassetten (Holzrippen, goldene Rosetten), ovales Mittelbild. Sagrestani 1715, „Gloria di san Filippo Neri“ (it.wikipedia, Chiesa di San Filippo Neri) |
| `k_apsisfresko` | Halbkuppel der Apsis | Apsis (w 70..77,5) | Existenz A, Farben C | goldener Strahlenkranz, bunte Gestalten; Lapi, „Dreifaltigkeit mit Aposteln und florentinischen Heiligen“ |
| `k_hochaltar` | Hochaltar und Statuen | Presbyterium (u 87..97, w 62..70) | Existenz A, Lage C | Stufe, Altartisch, Tabernakel, zwei Statuen auf Sockeln; Hochaltar Del Rosso, Statuen Carità und Purezza Fortini |
| `k_altarbilder` | Seitenaltäre mit sechs Altarbildern | je drei Kapellen nördlich und südlich | Existenz A, Zuordnung C | goldgerahmte Farbfelder in den Rückwänden, Altartische (eine Lage); Pinzani, Gherardini, Puglieschi, Bonechi, Redi, Gabbiani |
| `k_sakramentskapelle` | Sakramentskapelle | Anbau u 56..75 × w 44..62 | Existenz A, Lage B | Kuppelfarbfläche mit acht Rippen, Altar mit Madonnina (Maratta), Grabplatte Pietro Bini; Del Rosso 1776, Sabatelli |
| `o_deckenfresko` | Deckenfresko des Oratoriums | Saaldecke | Existenz A, Form C | Himmelsfeld mit Jungfrau, Goldrand; Traballesi 1775, „Assunzione della Vergine“ |
| `o_wandbilder` | Wandbilder über den Emporen | beide Längswände und Rückwand, Lage 10..15 | Existenz A, Szenen C | goldgerahmte Farbfelder; Ferri, Geschichten des heiligen Filippo Neri |
| `o_engel` | Engel an der Empore | Rückempore, beide Enden | Existenz A, Lage C | zwei weiße Engel; Filippo Burci |
| `eingangshalle` | Eingangshalle des Palastes | Erdgeschoss, mittlere Halle (u 51..64) | C | Schachboden mit Mittelstreifen, Wandfelder, Kassettendecke |
| `hof_san_firenze` | Großer Hof | Loch 0 | Hof B, Ausstattung C | Schachpflaster mit Kreuz aus Pietra serena |
| `licht_ausstattung` | Licht in den Sälen | Palasträume mit Ausstattung | Regel §1.5 | Seelaternen im Boden |

## 5. Abweichungen und Auslassungen
- **Hauptmaske**: Der Auftrag nennt eine Hauptmaske aus allen drei OSM-Objekten; das Projekt führt den Palast als Hauptmaske und Kirche und Oratorium als Zusatzmasken (wie San Marco), damit `palazzo.js` nur den Palast plant. Alle drei IDs stehen in `data/stadt/vorrang.json`.
- **Kirche**: Zahl und Lage der Kapellen sind aus den sechs Altarbildern geschlossen; Sakristei, Orgel, Bänke und die Seitenaltäre Montautis als eigene Anlage fehlen (keine Quelle zur Lage). Das Gewölbe ist ein Segmentbogen, das Dach massiv gefüllt.
- **Oratorium**: Die Gerichtseinbauten fehlen; Grundriss, Emporen und Treppe sind Entwurf auf dem OSM-Umriss.
- **Palast**: Räume und Haupttreppe des Konvents sind nicht überliefert; die Aufteilung dient der Begehbarkeit. Fassadenschmuck fehlt.
- **Übergänge** (w306156984, w306156999, `building=bridge`) bleiben Häuser im Quartier.
