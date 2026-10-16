# Bauteilkatalog – Palazzo Antinori (Welle 7a)

Maße und Quellen: [`REFERENZMASSE.md`](REFERENZMASSE.md). Rahmen AN (θ −179,63°), Lagen yr = Y − 63. Bauplan `tools/wahrzeichen/palazzo.js`, Einstellungen `projects/palazzo_antinori/model/_an.js`, Raumplan und Ausstattung `model/_raeume.js`. Stufen: A belegt, B Literatur oder begründet, C Entwurf.

## 1. Module und Bauteile

| Modul | Titel | Bauteile |
|---|---|---|
| 0 | Fundament, Boden und Hof | `fundament`, `boden`, `hof`, `treppe` |
| 1 | Fassaden | `aussenwand`, `fenster`, `kranzgesims` |
| 2 | Hof | `hofarkaden`, `hofwaende`, `hoffenster`, `innenwaende`, `trennwaende` |
| 3 | Böden und Decke | `geschossboeden`, `decke`, `innenwaende_og`, `trennwaende_og` |
| 4 | Dach | `dach` |
| 5 | Licht | `licht` |
| 6 | Ausgestaltete Räume, Hof und Stallungen | `androne`, `cantinetta`, `hof_antinori`, `pozzo`, `sala_cassettoni_ovest`, `sala_cassettoni_est`, `scuderie`, `treppe_stalltor`, `stemma`, `licht_ausstattung` |

## 2. Zonen und Wände
- **Geschosse** (Lagen): EG 0..8, Piano nobile 8..16, 2. OG 16..23 (Traufe Y 86); Walmdach bis Lage 27 (höchster Block Y 90). Gesimse und Kranzgesims aus Marmor.
- **Gelände und Sockel**: `bodenY` 63; vorne (Gelände 62..64) steht das Haus bündig, rückseitig und an der Via del Trebbio (61, im Nordwesten bis 58) sichtbar auf bis zu vier Blöcken Fundament aus Bruchstein.
- **Außenwände** zwei Blöcke dick: im EG abwechselnd Rustika und glatte Pietra forte (glatte Bugnato), darüber Pietra forte; innen Putz.
- **Fenster**: Raster 9,6 (acht Achsen an der Fassade), Breite 4, Rundbögen; Sohlen 2 / 2 / 2, Höhen 3 / 5 / 4.
- **Hof** (Loch 0, 16 × 13): Hofwand mit Rundbogenarkaden im EG (Joch 4, Kämpfer 6), dahinter Galerie (3 Blöcke) und Innenwand mit je einer Tür (3 breit) pro Hofseite; die Tür der Fassadenseite liegt in der Achse des Portals.
- **Öffnungen**: Portal (5 × 7) in der Fassadenmitte (u 38,5), Stalltor (6 × 7) an der Via delle Belle Donne, beide bis zum Boden offen.

## 3. Begehbarkeit
- **Zugang**: Portal an der Piazza degli Antinori (Pflaster 64, eine Stufe nach unten) und Stalltor an der Via delle Belle Donne (Pflaster 61, **zwei Treppenblöcke** hinauf, Teil `treppe_stalltor`); R13 beginnt auf den Zellen davor.
- **Raumteilung**: drei Trennwandlinien (2 Blöcke stark, Türen 3 × 5) in allen drei Geschossen: Cantinetta | Durchgang | Ostraum vorne, dahinter eine Wand zu den Seitenflügeln (Türen bei u 10 und 62). Die übrigen Flügel, das Band im Norden und der Westblock sind große Säle.
- **Treppe**: Wendeltreppe aus Pietra serena (Kern 3 × 3) im Westflügel durch alle drei Geschosse.
- **Unzugänglich** (deklariert): Dachraum unter dem Walmdach.
- **Licht**: Seelaternen im Boden jedes Raums im Raster 12 (Teil `licht`, bei Ausstattung `licht_ausstattung`).

## 4. Ausgestaltete Innenräume (Modul 6)
Alles vereinfacht in vollen Blöcken; Lage der Räume Stufe C.

| Bauteil | Raum | Lage im Grundriss | Stufe | Inhalt und Quelle |
|---|---|---|---|---|
| `androne` | Durchgang zum Hof | EG, Portalachse (u 36..41, w 0..24) | Plan A, Maße C | Schachboden aus Pietra serena und Marmor, Wandfelder. Quelle: it.wikipedia, Palazzo Antinori |
| `cantinetta` | Cantinetta Antinori | EG, Vorderraum West (u −3..34, w 0..24) | Nutzung A, Lage C | Schachboden Cotto/Holz, helle Wände, sechs Tische mit Bänken (eine Lage hoch). Quelle: it.wikipedia (seit 1957) |
| `hof_antinori` | Hofpflaster | Hof (Loch 0) | Hof A, Pflaster C | Wegekreuz aus Pietra serena, Schachmuster |
| `pozzo` | Ziehbrunnen | Hofmitte (u 35,2, w 37,3) | Existenz A, Form C | Becken (Radius 2,6) mit Wasser und Mittelsäule. Quelle: it.wikipedia |
| `sala_cassettoni_ovest` | Saal mit bemalter Kassettendecke | Piano nobile, Westflügel (u −12..20, w 25..50) | Existenz A, Lage C | Cottoboden, helle Wandfelder, Kassettendecke in Holz mit blau bemalten Feldern und Goldmitten, Tafel. Quelle: it.wikipedia |
| `sala_cassettoni_est` | Saal mit bemalter Kassettendecke | Piano nobile, Ostflügel (u 50..75, w 25..48) | Existenz A, Lage C | wie West, rot bemalte Felder. Quelle: it.wikipedia |
| `scuderie` | Stallungen und Remisen | EG, früheres Haus an der Via delle Belle Donne (u 108..128, w 1..45) | Existenz A, Lage C | Pflaster im Schachmuster, Boxentrennwände und Krippen aus Holz (eine Lage hoch). Quelle: it.wikipedia (wohl 18. Jahrhundert) |
| `treppe_stalltor` | Stufen vor dem Stalltor | außen vor dem Stalltor (Luftraum 2) | C | Zwei Treppenblöcke aus Pietra serena, sieben Blöcke breit, Kragstein unter der oberen Stufe |
| `stemma` | Wappen über dem Portal | Fassadenmitte, Piano nobile (u 36..41) | Existenz A, Farben C | Goldgerahmter Schild als Farbfeld. Quelle: it.wikipedia |
| `licht_ausstattung` | Licht in den Räumen | alle ausgestalteten Räume | – | Regel §1.5 |

## 5. Abweichungen und Nichtgebautes
- Garten (Nymphäum, Zinnenmauer, Loggetta), Loggia im 2. Geschoss, Kreuzgewölbe, Konsolen: nicht gebaut; der Garten liegt nicht im OSM-Umriss.
- Arkaden auf vier Hofseiten statt drei.
- Weinklappe (buchetta) am Vicolo del Trebbio: nicht gebaut.
- Material der Fassade: Typologie (Pietra forte); die Quelle nennt nur die glatte Bugnato.
- Zellenzahl 6.489 statt der Planzahl 6.519 (Maske des Modells).
