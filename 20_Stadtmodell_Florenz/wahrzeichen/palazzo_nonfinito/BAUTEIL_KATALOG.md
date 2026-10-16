# Bauteilkatalog – Palazzo Nonfinito (Welle 7b)

Maße und Quellen: [`REFERENZMASSE.md`](REFERENZMASSE.md). Rahmen NF (θ −93,26°), Lagen yr = Y − 66. Bauplan `tools/wahrzeichen/palazzo.js`, Einstellungen `projects/palazzo_nonfinito/model/_nf.js`, Raumplan und Ausstattung `model/_raeume.js`. Stufen: A belegt, B Literatur oder begründet, C Entwurf.

## 1. Module und Bauteile

| Modul | Titel | Bauteile |
|---|---|---|
| 0 | Fundament, Boden und Hof | `fundament`, `boden`, `hof`, `treppe` |
| 1 | Fassaden | `aussenwand`, `fenster`, `kranzgesims` |
| 2 | Hof | `hofarkaden`, `hofwaende`, `hoffenster`, `innenwaende`, `trennwaende` |
| 3 | Böden und Decke | `geschossboeden`, `decke`, `innenwaende_og`, `trennwaende_og` |
| 4 | Dach | `dach` |
| 5 | Licht | `licht` |
| 6 | Atrium, Hof und Museum | `androne`, `treppenhaus`, `hof_cigoli`, `perseus`, `museum_nord`, `museum_west`, `museum_ost`, `fassadenschmuck`, `licht_ausstattung` |

## 2. Zonen und Wände
- **Geschosse** (Lagen): EG 0..10, Piano nobile 10..23 (Traufe Y 89); Walmdach bis Lage 27 (höchster Block Y 93). Gesims aus Pietra serena auf Lage 10, Kranzgesims Lage 22–23.
- **Außenwände** zwei Blöcke dick: Erdgeschoss der beiden Fassaden in Rustika (Pietra forte), Eckpilaster aus Pietra serena; Piano nobile an der Via del Proconsolo verputzt (Ocker) mit Pilastern aus Pietra serena zwischen den Fenstern, am Borgo degli Albizi verputzt; übrige Seiten Putz mit Pietra-forte-Bändern.
- **Kniefenster**: 6 an der Via del Proconsolo (3 + 3 um das Portal, Raster 13,5), 4 am Borgo degli Albizi (2 + 2), Sohle Lage 2, Höhe 7, verglast; Rahmen (Sohlbank, Gewände, Sturz) in der Wandebene aus Pietra serena (`nachher` in `_raeume.js`). Piano nobile: hohe Fenster (Sohle 4, Höhe 7) im selben Raster.
- **Hof** Cigolis (Loch 1): Rundbogenarkaden (Joch 6, Kämpfer 7) mit Umgang (Tiefe 3) und Innenwand; kleiner Lichthof (Loch 0) ohne Arkaden mit Türen in den Hofwänden.
- **Portale** (deklarierte `tor`): Via del Proconsolo 7 × 9 (u 49), Borgo degli Albizi 6 × 9 (w 49), beide in lokalen Koordinaten geschnitten.

## 3. Begehbarkeit
- **Zugang**: zwei Portale an den Fassaden. Gelände vor dem Proconsolo-Portal liegt bei 64–65, vor dem Albizi-Portal bei 67; `bodenY` 66 vermittelt (jeweils eine Stufe, siehe REFERENZMASSE §1).
- **Raumteilung**: Erdgeschoss: Atrium (u 41,6..55,4) mit je zwei Räumen daneben, Treppenhaus rechts vom Atrium, Vestibül und Raum im Westflügel, offener Ostflügel; Piano nobile: fünf Säle im Nordflügel, Säle im Westflügel (Vestibül-Etage) und Ostflügel. Die Innenwand um den Hof hat Türen im Raster 14; so erreicht jeder Raum den Umgang.
- **Treppe**: Wendeltreppe aus Pietra serena (Kern 3 × 3) im Treppenhaus (u 76, w 32) durch beide Geschosse, Treppenloch im Boden des Piano nobile.
- **Unzugänglich** (deklariert): Dachraum über der obersten Decke.
- **Licht**: Seelaternen im Boden jedes Raums im Raster 12.

## 4. Ausgestaltete Innenräume (Modul 6)
Alles vereinfacht in vollen Blöcken; Lage der Räume Stufe C.

| Bauteil | Raum | Lage im Grundriss | Stufe | Inhalt und Quelle |
|---|---|---|---|---|
| `androne` | Atrium | EG, Nordflügel hinter dem Proconsolo-Portal (u 42..56, w 2..42) | Existenz A, Lage C | Schachboden, Wandfelder in Weiß und Gelb, Kassettendecke aus Pietra serena. Quelle: it.wikipedia (große Halle mit Spiegelgewölbe, drei Türen) |
| `treppenhaus` | Treppenhaus | EG und Piano nobile, rechts vom Atrium (u 59..98, w 24..42) | Existenz A, Lage B | Pflaster im Schachmuster, Wandfelder zwischen Pilastern um die Wendeltreppe. Quelle: it.wikipedia (Treppe rechts vom Atrium) |
| `hof_cigoli` | Hof | Hof (u 31..71, w 47..65) | Hof A, Pflaster C | Schachmuster aus Pflaster und Marmor, zwei Mittelstreifen aus Pietra serena. Quelle: it.wikipedia (Cigoli 1604, Nasi 1865–66) |
| `perseus` | Perseus im Hof | Hof (u 51, w 61,5) | Existenz A, Lage C | Blockfigur aus Bronze auf Sockel aus Pietra serena, Arme erhoben. Quelle: it.wikipedia (Perseus tötet den Drachen, Lorenzi, 16. Jh.) |
| `museum_nord` | Museumssäle Nordflügel | Piano nobile, Fassade zur Via del Proconsolo (vier Säle, u 2..69) | Nutzung A, Aufteilung C | Cotto-Marmor-Schachboden, Wandfelder, Decke mit Wappen von Savoyen und Stadt, Vitrinen als Glasblöcke. Quelle: it.wikipedia (Decken des Piano nobile aus der Hauptstadtzeit, Museum 1932) |
| `museum_west` | Museumssäle Westflügel | Piano nobile, Seite zum Borgo degli Albizi (u 2..23, w 44..72) | Nutzung A, Aufteilung C | wie Nordflügel |
| `museum_ost` | Museumssaal Ostflügel | Piano nobile, östlich des Hofs (u 77..98, w 44..73) | Nutzung A, Aufteilung C | wie Nordflügel |
| `fassadenschmuck` | Wappen und Inschrift | Piano nobile über den Portalen (u 46..52 bzw. w 45,5..52,5) | Existenz A, Farben C | Farbfelder: Strozzi-Wappen (Gold, Rot, Weiß), Inschrifttafel. Quelle: it.wikipedia (Wappen von 1614, Inschrift von 1607) |
| `licht_ausstattung` | Licht in den Sälen | alle ausgestalteten Räume | Regel §1.5 | Seelaternen im Boden |

## 5. Abweichungen und Auslassungen
- **Treppe**: die belegte Treppe (drei ellbogenförmige Läufe unter Tonnengewölben, Santi di Tito) ist durch eine Wendeltreppe an belegter Lage (rechts vom Atrium) ersetzt.
- **Serlianen** des Hofs: Rundbögen (Palazzo-Bauplan); die venezianisch beeinflusste Form ist nicht gebaut.
- **Kniefenster**: Konsolen, Gitter und Giebel (dreieckig, gebrochen, eingerollt) nicht gebaut; nur die Rahmen in der Wandebene.
- **Balkon** über dem Proconsolo-Portal: nicht gebaut (Vorsprung über Stadtgrund).
- **Spiegelgewölbe** des Atriums: als Kassettendecke angedeutet; die Halle ist hier ein Durchgang zum Hof, die Zahl der Türen folgt dem Raster.
- **Unvollendeter Zustand**: die beiden nie gebauten Obergeschosse fehlen; das Walmdach schließt das Piano nobile ab (Stufe C, in Wirklichkeit unfertiger Abschluss).
- **Museum**: Ausstellungsstücke, Raumnamen und die Lage der Säle sind nicht belegt; die Vitrinen sind leer.
- **Strozzi-Wappen**: Farben frei gewählt.
