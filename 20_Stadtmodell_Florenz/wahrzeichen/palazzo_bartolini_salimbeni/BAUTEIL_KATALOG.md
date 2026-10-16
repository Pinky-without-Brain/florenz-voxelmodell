# Bauteilkatalog – Palazzo Bartolini Salimbeni (Welle 7a)

Maße und Quellen: [`REFERENZMASSE.md`](REFERENZMASSE.md). Rahmen BS (θ 96,87°), Lagen yr = Y − 62. Bauplan `tools/wahrzeichen/palazzo.js`, Einstellungen `projects/palazzo_bartolini_salimbeni/model/_bs.js`, Raumplan und Ausstattung `model/_raeume.js`. Stufen: A belegt, B Literatur oder begründet, C Entwurf.

## 1. Module und Bauteile

| Modul | Titel | Bauteile |
|---|---|---|
| 0 | Fundament, Boden und Hof | `fundament`, `boden`, `hof`, `treppe` |
| 1 | Fassaden | `aussenwand`, `fenster`, `kranzgesims` |
| 2 | Hof | `hofarkaden`, `hofwaende`, `hoffenster`, `innenwaende`, `trennwaende` |
| 3 | Böden und Decke | `geschossboeden`, `decke`, `innenwaende_og`, `trennwaende_og` |
| 4 | Dach | `dach` |
| 5 | Licht | `licht` |
| 6 | Ausgestaltete Räume, Hof und Fassadenschmuck | `passaggio`, `hof_bartolini`, `sgraffito`, `sala_cassettoni`, `collezione_casamonti`, `inschriften`, `fries_mohn`, `fenster_kreuz`, `licht_ausstattung` |

## 2. Zonen und Wände
- **Geschosse** (Lagen): EG 0..11, Piano nobile 11..21, 2. OG 21..30 (Traufe Y 92); Walmdach bis Lage 34 (höchster Block Y 96). Gesimse und Kranzgesims aus Marmor.
- **Außenwände** zwei Blöcke dick: zur Piazza Pietra forte (mit Pietra serena jede vierte Lage), zur Via Porta Rossa und Via delle Terme Pietra serena (mit Pietra forte jede vierte Lage), rustizierte Ecken aus Rustika; innen Putz.
- **Fenster**: Raster 10, Breite 4, Rundbögen mit Mittelpfosten in allen Geschossen; der Querriegel (Teil `fenster_kreuz`, Modul 6) macht daraus Kreuzfenster; Sohlen 3 / 3 / 2, Höhen 5 / 5 / 4.
- **Hof** (Loch 0, 8 × 10): Hofwand mit Rundbogenarkaden im EG (Joch 4, Kämpfer 6), dahinter Galerie (3 Blöcke) und Innenwand mit einer Tür (3 breit) je Hofseite in allen Geschossen.
- **Öffnungen**: zwei Portale (7 × 9), Piazza di Santa Trinita (in der Hofachse) und Via Porta Rossa, bis zum Boden offen.

## 3. Begehbarkeit
- **Zugang**: zwei Portale; R13 beginnt auf den Zellen davor (Gelände Y 61..63).
- **Raumteilung**: sechs Trennwandlinien (2 Blöcke stark, Türen 3 × 5) in allen drei Geschossen: Nordostraum | Durchgang | Südostraum an der Piazza; Nord- und Südflügel am Hof; Westflügel Nord und Süd.
- **Treppe**: Wendeltreppe aus Pietra serena (Kern 3 × 3) im Westflügel Süd durch alle drei Geschosse.
- **Unzugänglich** (deklariert): Dachraum unter dem Walmdach.
- **Licht**: Seelaternen im Boden jedes Raums im Raster 12 (Teil `licht`, bei Ausstattung `licht_ausstattung`).

## 4. Ausgestaltete Innenräume und Fassadenschmuck (Modul 6)
Alles vereinfacht in vollen Blöcken; Lage der Räume Stufe C.

| Bauteil | Raum | Lage im Grundriss | Stufe | Inhalt und Quelle |
|---|---|---|---|---|
| `passaggio` | Durchgang zum Hof | EG, Hofachse (u 16..22, w 0..19) | Existenz A, Maße C | Schachboden aus Pietra serena und Marmor, Wandfelder mit Pilastern, nach den Seiten abgesenkte Decke als angedeutetes Tonnengewölbe. Quelle: it.wikipedia, Palazzo Bartolini Salimbeni |
| `hof_bartolini` | Hofpflaster | Hof (Loch 0) | Hof A, Pflaster C | Schachmuster aus Pflaster und Marmor |
| `sgraffito` | Sgraffito im Hof | Hofwände des Piano nobile und des 2. OG | Existenz A, Muster C | Dunkle Blöcke auf hellem Putz (einfarbig), zufällig verteilt. Quelle: it.wikipedia (Feltrini zugeschrieben) |
| `sala_cassettoni` | Saal mit Kassettendecke | Piano nobile, Westflügel Nord (u 1..24, w 46..72) | Existenz A, Lage C | Cottoboden, Wandfelder, Holzkassettendecke mit roten Mohnköpfen in den Kassettenmitten. Quelle: it.wikipedia |
| `collezione_casamonti` | Sammlung Casamonti | Piano nobile, Westflügel Süd (u 26..40, w 46..72) | Nutzung A, Lage C | Schachboden Weiß-Schwarz, Bildfelder an den Wänden, zwei Stellwände. Quelle: it.wikipedia (seit 2018) |
| `inschriften` | Inschriftenbänder und Kartuschen | über beiden Portalen (Lage 10), Querriegel jedes zweiten Fensters | Existenz A, Schrift C | Gold-weiße Bänder als Platzhalter für „Carpere promptius quam imitari“ und „Per non dormire“, Goldblöcke als Kartuschen. Quelle: it.wikipedia |
| `fries_mohn` | Fries mit Mohnblüten | alle Straßenfassaden, Lage 28 | Existenz A, Muster C | Rot-grünes Band (Mohnblüte, Knospe, Mohnblüte). Quelle: it.wikipedia |
| `fenster_kreuz` | Kreuzfenster | alle Fenster | Existenz A | Querriegel aus Pietra serena auf 55 % der Fensterhöhe (zusammen mit dem Mittelpfosten ein Kreuz). Quelle: it.wikipedia |
| `licht_ausstattung` | Licht in den Räumen | alle ausgestalteten Räume | – | Regel §1.5 |

## 5. Abweichungen und Nichtgebautes
- Säulenportal, Giebel und Architrave, Nischen im 1. Geschoss: nicht gebaut.
- Hof mit Arkaden auf vier Seiten (Wirklichkeit: drei Seiten mit Portikus); Loggia des 1. Geschosses, zweite Loggia und Schwibbogen: nicht gebaut.
- Gewölbe des Durchgangs nur angedeutet; Malereien nicht belegt und nicht gebaut.
- Zellenzahl 2.673 statt der Planzahl 2.676 (Maske des Modells).
