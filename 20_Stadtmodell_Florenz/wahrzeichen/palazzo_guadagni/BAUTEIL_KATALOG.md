# Bauteilkatalog – Palazzo Guadagni (Welle 8a)

Maße und Quellen: [`REFERENZMASSE.md`](REFERENZMASSE.md). Rahmen GD (θ −47,76°), Lagen yr = Y − 61. Bauplan `tools/wahrzeichen/palazzo.js`, Einstellungen `projects/palazzo_guadagni/model/_gd.js`, Raumplan, Dachloggia und Ausstattung `model/_raeume.js`. Stufen: A belegt, B Literatur oder begründet, C Entwurf.

## 1. Module und Bauteile

| Modul | Titel | Bauteile |
|---|---|---|
| 0 | Fundament, Boden und Treppe | `fundament`, `boden`, `treppe` |
| 1 | Fassaden | `aussenwand`, `fenster`, `kranzgesims` |
| 2 | Trennwände | `trennwaende` |
| 3 | Böden und Decke | `geschossboeden`, `decke`, `trennwaende_og` |
| 4 | Dach | `dach` |
| 5 | Licht | `licht` |
| 6 | Ausgestaltete Räume, Treppe und Dachloggia | `androne`, `treppenhaus`, `scalone`, `hofhalle`, `wandbrunnen`, `sala_piano_nobile`, `dachloggia`, `panca`, `licht_ausstattung` |

## 2. Zonen und Wände
- **Geschosse** (Lagen): EG 0..8, 1. OG 8..15, 2. OG 15..22, Dachloggia 22..30 (Traufe Y 91); Walmdach bis Lage 34 (höchster Block Y 95). Gesimse aus Pietra serena auf Lage 8, 15, 22.
- **Außenwände** zwei Blöcke dick: EG glatte Pietra forte mit Eckpilastern aus Rustika (erste und letzte vier Blöcke der Fassade), 1. und 2. OG Rustika mit glatter Lage jede vierte, Loggiageschoss glatte Pietra forte; innen Putz.
- **Fenster**: Rundbogen, Raster 10, Breite 4, fünf Achsen; Sohlen 3 / 2 / 2, Höhen 3 / 4 / 4; keine Fenster im Loggiageschoss.
- **Dachloggia**: In der Fassade zur Piazza (u 3,5..47,5) und in der Westwand (w 3,5..30) sind im Joch 5 Öffnungen von 3 Blöcken Breite frei (deklariert als `loggia`), von 3 bis 6 Blöcken über dem Loggiaboden; darunter eine Brüstung von 2 Blöcken, darüber Architrav und Kranzgesims, dazwischen Pfeiler (2 breit).
- **Öffnungen**: ein Portal zur Piazza Santo Spirito (7 × 7, bis zum Boden offen, in der mittleren Fensterachse).
- **Kein Hof**: Der OSM-Umriss hat kein Loch; die Hofhalle ist ein überdachter Raum.

## 3. Begehbarkeit
- **Zugang**: Portal an der Fassade; R13 beginnt auf den Zellen davor (Gelände Y 60..61).
- **Raumteilung** (sechs Trennwandlinien, Türen 3 × 5, alle vier Geschosse): Westraum | Torweg | Ostraum an der Fassade; dahinter Treppenhaus, Hofhalle und Ostraum hinten; schmaler Flügel durch eine Tür vom Treppenhaus.
- **Treppen**: Treppe aus Pietra serena (Modul 6, `scalone`, acht Stufen, Kragsteine) vom EG ins 1. OG; Wendeltreppe aus Pietra serena (Kern 3 × 3) im Ostraum durch alle Geschosse bis in die Loggia.
- **Unzugänglich** (deklariert): Dachraum über der obersten Decke.
- **Licht**: Seelaternen im Boden jedes Raums im Raster 12 (Teil `licht`, bei Ausstattung `licht_ausstattung`).

## 4. Ausgestaltete Innenräume (Modul 6)
Alles vereinfacht in vollen Blöcken; Lage der Räume Stufe C.

| Bauteil | Raum | Lage im Grundriss | Stufe | Inhalt und Quelle |
|---|---|---|---|---|
| `androne` | Torweg | EG hinter dem Portal (u 20,6..30,4, w 0,5..18,4) | Existenz A, Lage C | Schachboden Pietra serena/Pflaster, Wandfelder zwischen Lisenen, Decke mit Diagonalrippen (Kreuzgewölbe angedeutet). Quelle: it.wikipedia, Palazzo Guadagni |
| `treppenhaus` | Treppenhaus | EG und 1. OG links (u −12..18,4, w 20,6..33,4) | Existenz A, Lage C | Pflaster im Schachmuster, Wandfelder zwischen Pilastern. Quelle: it.wikipedia |
| `scalone` | Treppe aus Pietra serena | Treppenhaus, links | Existenz A, Lauf C | **Acht Treppenblöcke** (zwei breit) mit **Kragstein** unter jeder Stufe, Treppenloch darüber (Kopffreiheit 3). Quelle: it.wikipedia |
| `hofhalle` | Hofhalle | EG (u 20,6..40,4, w 20,6..29,4) | Hof A, Lage und Überdachung C | Pflaster mit Wegekreuz aus Pietra serena, Wandfelder. Quelle: it.wikipedia |
| `wandbrunnen` | Wandbrunnen mit Einhorn | Rückwand der Hofhalle (u 27..34, w 26..29) | Existenz A, Maße C | Becken (1 Block hoch) mit Wasser, Sockel und weiße Einhornfigur mit goldenem Horn. Quelle: it.wikipedia |
| `sala_piano_nobile` | Saal im Piano nobile | 1. OG über der Hofhalle | Wappen A, Raum C | Schachboden Cotto/Marmor, Wandfelder mit Schildern (geteiltes Wappen), Kassettendecke, Tafel. Quelle: it.wikipedia |
| `dachloggia` | Dachloggia | oberstes Geschoss | Existenz A, Joche C | Cottoboden im Schachmuster, Balkendecke. Quelle: it.wikipedia |
| `panca` | Sockelbank (panca di via) | Fassade, außen | Existenz A, Form C | Pietra serena, eine Lage hoch, am Portal unterbrochen; nur auf Straßenzellen ohne fremde Gebäude (`tools/wahrzeichen/strasse.js`). Quelle: it.wikipedia |
| `licht_ausstattung` | Licht in den Räumen | alle ausgestalteten Räume | – | Regel §1.5 |

## 5. Abweichungen und Nichtgebautes
- Sgraffito: belegt, aber an der Fassade zerstört; deshalb nicht gebaut (die Planung nannte „Graffito-Fassade“ ohne diesen Befund).
- Hof: im OSM-Umriss nicht ausgespart; Torweg, Hofhalle und Wandbrunnen stehen deshalb in einer überdachten Halle (Lage C). Zugemauerte Loggia, Barockbögen und Kapitelle sind nicht gebaut.
- Dachloggia: Joche, Brüstung und Öffnungshöhe sind Entwurf; die Säulen sind Pfeiler aus Wandblöcken, die weit vorspringende Traufe fehlt.
- EG-Fenster sind kleine Rundbogenfenster statt quadratischer Fenster (ein Fenstertyp je Palast).
- Außenbauteile an der Fassade (Lumiera, Pferdering, Wappen, Eisengitter, Holzportal) nicht gebaut: nur Bauteile auf Straßenzellen ohne fremde Gebäude sind zulässig, Fassadenanbauten haben keinen Beleg zur Lage.
- Zuschreibung (Cronaca oder Baccio d'Agnolo) ist in der Quelle nicht gesichert; das Modell trifft dazu keine Aussage.
