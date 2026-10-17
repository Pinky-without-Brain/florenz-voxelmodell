# Bauteilkatalog – Palazzo Corsini al Parione (Welle 8a)

Maße und Quellen: [`REFERENZMASSE.md`](REFERENZMASSE.md). Rahmen CP (θ −149,13°), Lagen yr = Y − 59. Bauplan `tools/wahrzeichen/palazzo.js` (mit `entlangGlatt`), Einstellungen `projects/palazzo_corsini_parione/model/_cp.js`, Raumplan, Treppen, Terrasse und Ausstattung `model/_raeume.js`. Stufen: A belegt, B Literatur oder begründet, C Entwurf.

## 1. Module und Bauteile

| Modul | Titel | Bauteile |
|---|---|---|
| 0 | Fundament, Boden und Hof | `fundament`, `boden`, `hof`, `treppe` |
| 1 | Fassaden | `aussenwand`, `fenster`, `kranzgesims` |
| 2 | Hof | `hofarkaden`, `hofwaende`, `hoffenster`, `innenwaende`, `trennwaende` |
| 3 | Böden und Decke | `geschossboeden`, `decke`, `innenwaende_og`, `trennwaende_og` |
| 4 | Flachdach als Terrasse | `dach` |
| 5 | Licht | `licht` |
| 6 | Ausgestaltete Räume, Treppe, Galerie und Terrasse | `vestibolo`, `cortile`, `treppenhaus`, `scalone`, `statuen_scalone`, `galleria`, `salone_del_trono`, `sala_da_ballo`, `grotta`, `portal`, `terrasse`, `licht_ausstattung` |

## 2. Zonen und Wände
- **Geschosse** (Lagen): EG 0..12, Piano nobile 12..22, 2. OG 22..30 (Traufe Y 89); flaches Dach aus Pflaster auf Lage 31 (Y 90); Balustrade bis Lage 33, Statuen bis Lage 37 (höchster Block Y 96). Gesimse aus Pietra serena auf Lage 12, 22 und 30.
- **Außenwände** zwei Blöcke dick: gelber Putz, Mittelteil (u 83..113) in hellem Sand, Lisenen aus Pietra serena (ein Block pro 12 Blöcke), Sockel aus Pietra serena; innen Putz.
- **Fenster**: Rundbogen, Raster 12, Breite 4; Sohlen 3 / 3 / 2, Höhen 5 / 5 / 4.
- **Haupthof** (Loch 0, 45 × 56): Hofwand mit Rundbogenarkaden im EG (Joch 5, Kämpfer 7), dahinter Galerie (3 Blöcke) und Innenwand mit je einer Tür pro Seite in allen Geschossen (am Lungarno in der Portalachse). **Lichthöfe** (Löcher 1 bis 3, 401 / 123 / 200 Zellen): geschlossene Hofwand mit Türen im Raster 20, Fenster in den Obergeschossen.
- **Öffnungen**: ein Portal zum Lungarno (7 × 7, bis zum Boden offen, in der Achse des Haupthofs); die Luke der Terrassentreppe ist als `loggia` deklariert (offen zum Himmel).
- **Terrasse**: Flachdach über allen Flügeln; Balustrade (2 Blöcke, abwechselnd Quarzsäule und Marmor) am Außenrand und an allen Hofrändern, Statuen (Säule 4 Blöcke hoch, goldener Kopf, keine Überhänge) alle 12 Blöcke an der Lungarno-Front, dazwischen Vasen aus Terrakotta (2 Blöcke).

## 3. Begehbarkeit
- **Zugang**: Portal am Lungarno (Gelände 58..59); R13 beginnt auf den Zellen davor.
- **Raumteilung** (neun Trennwandlinien, Türen 3 × 5, alle drei Geschosse): Vorderräume West | Vestibül | Ost am Lungarno (Wände bei u 89 und 107), Westflügel in vier Räume (Wände bei w 13,5, u 14 und u 48), südlicher Trakt (Wand bei w 63), Ostflügel (Grotte | Salone | Sala da Ballo, Wände bei w 13,5 und 63), Dreieck im Süden (Wand bei w 91).
- **Treppen**: Treppe Ferris (Modul 6, `scalone`, 12 Stufen, Kragsteine) vom EG ins Piano nobile; Treppe auf die Terrasse (Modul 6, `terrasse`, 9 Stufen, Kragsteine) vom 2. OG zum Flachdach; Wendeltreppe aus Pietra serena (Kern 3 × 3) im Westteil durch alle Geschosse.
- **Unzugänglich** (deklariert): keine (das Flachdach hat keinen Dachraum).
- **Licht**: Seelaternen im Boden jedes Raums im Raster 12 (Teil `licht`, bei Ausstattung `licht_ausstattung`); die Terrasse bleibt ohne Licht (im Freien).

## 4. Ausgestaltete Innenräume (Modul 6)
Alles vereinfacht in vollen Blöcken; Lage der Räume Stufe C.

| Bauteil | Raum | Lage im Grundriss | Stufe | Inhalt und Quelle |
|---|---|---|---|---|
| `vestibolo` | Vestibül | EG hinter dem Portal (u 90,2..105,8, w 2..9) | Existenz A, Lage C | Schachboden Pietra serena/Marmor, Wandfelder. Quelle: it.wikipedia, Palazzo Corsini al Parione |
| `cortile` | Haupthof | Loch 0 | Hof A, Pflaster C | Wegekreuz aus Pietra serena, Schachmuster. Quelle: it.wikipedia |
| `treppenhaus` | Treppenhaus links vom Hof | EG und Piano nobile (u 49,2..68,6, w 14,6..62,4) | Existenz A, Lage C | Schachboden, Wandfelder in Weiß und Gelb. Quelle: it.wikipedia |
| `scalone` | Treppe Ferris | Treppenhaus (Start u 55, w 20, Aufstieg in Weltrichtung n) | Existenz A, Lauf C | **Zwölf Treppenblöcke** (zwei breit) mit **Kragstein** unter jeder Stufe, Treppenloch (Kopffreiheit 3). Quelle: it.wikipedia |
| `statuen_scalone` | Statuen im Treppenhaus | Fuß und oberer Absatz der Treppe | Existenz A, Zahl C | zwei weiße Blockfiguren auf Sockeln, Clemens XII. mit goldener Krone auf dem oberen Absatz. Quelle: it.wikipedia |
| `galleria` | Galleria Corsini | Piano nobile, Flügel am Lungarno (u −9..75, w 2,4..13,3) | Existenz A, Lage C | Boden Rot/Marmor, Bildfelder in fünf Farben mit Goldrahmen, Kassettendecke. Quelle: it.wikipedia |
| `salone_del_trono` | Salone del Trono | Piano nobile, Ostflügel (u 128..158, w 14,6..62,4) | Existenz A, Lage C | Boden Rot/Marmor, Wandfelder Rot/Gelb, Deckenfresko als Ringe, Podest mit Thron, drei Statuen. Quelle: it.wikipedia |
| `sala_da_ballo` | Sala da Ballo | Piano nobile, südlicher Trakt (u 128..168, w 64,6..90) | Existenz A, Lage C | Holz-Cotto-Boden, Wandfelder Weiß/Hellblau, Gewölbebild in Ringen mit zwei Lagen. Quelle: it.wikipedia |
| `grotta` | Künstliche Grotte | EG, Ostflügel am Lungarno (u 128..158, w 2,4..13,3) | Existenz A, Lage C | Bruchsteinwände, Tropfsteine an der Decke. Quelle: it.wikipedia (1692–1698) |
| `portal` | Portal mit Wappen | Fassade bei u 98 | Existenz A, Form C | Säulen links und rechts, Wappenschild über dem Bogen. Quelle: it.wikipedia |
| `terrasse` | Terrasse mit Balustrade und Statuen | Dach | Existenz A, Zahl C | siehe §2; Treppe vom 2. OG hinauf. Quelle: it.wikipedia |
| `licht_ausstattung` | Licht in den Räumen | alle ausgestalteten Räume | – | Regel §1.5 |

## 5. Abweichungen und Nichtgebautes
- **Hof** (OSM): Der Umriss hat vier Höfe; der Haupthof (Loch 0) erhält Arkaden, die drei kleineren sind Lichthöfe ohne Arkaden. Die Quelle nennt nur „einen zentralen Innenhof“.
- **Dach:** Das Flachdach über dem gesamten Palast ist eine Vereinfachung; belegt ist nur die Terrasse mit Balustrade, Statuen und Vasen (Lage und Ausdehnung nicht genannt). Die Statuen stehen als Säulen auf der Balustrade am Lungarno, ihre Zahl ist nicht belegt.
- **Fassade:** gerade statt mit zurückgesetztem Mittelteil; die Asymmetrie (fehlender linker Flügel) ergibt sich aus dem OSM-Umriss.
- **Treppen:** Die gerade Treppe ersetzt den monumentalen Aufgang; die Wendeltreppe Silvanis ist nicht nachgebildet. Die Treppe auf die Terrasse ist Entwurf (die Quelle nennt den Zugang nicht).
- **Räume:** Die Existenz von Galleria, Salone, Sala da Ballo und Grotte ist belegt, ihre Lage nicht (Stufe C); die Loggetta des Piano nobile (Fresken 1650–1653) und die Fresken der übrigen Säle sind nicht gebaut; die Galerie des Salone mit antiken Statuen ist durch drei Figuren an der Wand angedeutet.
- **Balustrade im Hof** auf Höhe des Piano nobile: belegt, nicht gebaut.
- Option `entlangGlatt` in `tools/wahrzeichen/palazzo.js` (Außennormale aus dem Umkreis 3) gesetzt, weil der Rahmen bei θ = −149° diagonal zum Blockraster liegt.
- **Stolperfalle:** Ein Raumteil, dessen Boden mit `K.boden` gesetzt wird, zählt danach als Geschossboden; trug die Treppe denselben Teilnamen (`scalone`), ersetzte die Bodenmusterung die obersten zwei Stufenblöcke. Treppe und Treppenhaus haben deshalb eigene Teile (`scalone`, `treppenhaus`).
