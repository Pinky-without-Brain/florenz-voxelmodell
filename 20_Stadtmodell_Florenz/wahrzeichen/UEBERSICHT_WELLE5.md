# Wahrzeichen Welle 5 – Übersicht (16.10.2026)

Nutzerwunsch vom 16.10.2026: San Marco, Ognissanti, Santa Felicita, Palazzo Davanzati, Loggia del Bigallo. Alle fünf standen bis dahin als typologische Häuser in Quartieren; sie sind jetzt eigene Wahrzeichen-Projekte mit Begehbarkeit „pflicht“ (R13: 0 nicht erreichbare Komponenten, R14: 0 Lücken). Vorgänger: [`UEBERSICHT_WELLE3.md`](UEBERSICHT_WELLE3.md) (Wellen 3 und 4). Details je Projekt: `<id>/REFERENZMASSE.md`, `<id>/BAUTEIL_KATALOG.md`, Erfahrungen in [`../BEGEHBARKEIT.md`](../BEGEHBARKEIT.md) §13–§17.

## 1. Projekte (gemessen)

| Projekt | OSM | Fläche (Zellen) | Höhe | `bodenY` | Lage (x \| z) | Blöcke | aus Quartier |
|---|---|---:|---|---:|---|---:|---|
| `san_marco` | w225706552 (Basilika, Campanile-Teil w599900776), r1575764 (Konvent) | 3.896 + 23.776 | Campanile 35 m (C), Kuppel-Laterne 28,5 m, Konvent 14,5 m | 68 | (314 \| −1199), (341 \| −1240) | 284.298 | `quartier_san_marco` |
| `ognissanti` | w167273908 (14 Teile, Campanile-Teil w478272187) | 7.287 | 30 m (C) | 56 | (−1729 \| 153) | 91.222 | `quartier_palazzuolo` |
| `santa_felicita` | w159394659 (ohne 277 Korridorzellen), Torre dei Fifanti w119180019 als Campanile | 2.462 + 190 | 23 levels | 66 | (−659 \| 1425) | 35.764 | `quartier_costa_san_giorgio` |
| `palazzo_davanzati` | w307153268 | 2.056 | First 52 Lagen (C) | 63 | (−631 \| 706) | 35.851 | `quartier_tornabuoni` |
| `loggia_del_bigallo` | w166821304 | 429 | First 22 Lagen | 64 | (−275 \| 79) | 5.948 | `domplatz_ring` |

## 2. Inhalte (Kurzfassung)
- **San Marco:** Konvent über `palazzo.js` (sechs Höfe): Chiostro di Sant'Antonino mit Lünetten und Zypresse, Kapitelsaal (Kreuzigung), großes und kleines Refektorium (Ghirlandaios Abendmahl), Pilgerhospiz; Podesttreppe ins Obergeschoss mit der Verkündigung, 41 Mönchszellen und die Räume Savonarolas, Biblioteca di Michelozzo (dreischiffig, 30 Säulen). Kirche mit eigenem Bauplan: klassizistische Fassade, Saal, Cappella di Sant'Antonino, Presbyterium mit Kuppel, Campanile (Wendeltreppe bis zur Glockenstube).
- **Ognissanti:** Kirche mit Buglioni-Lünette (nicht Della Robbia, Quellen), Botticellis Augustinus und Ghirlandaios Hieronymus, Giottos Kruzifix, Vespucci-Kapelle, Grabplatte Botticellis; Konvent mit vier Trakten und Wendeltreppen, Cenacolo (Ghirlandaio, 16 × 8 Blöcke); Campanile begehbar.
- **Santa Felicita:** offener Portikus unter dem Corridoio Vasariano (`palazzo_pitti` Modul 9 spart drei Joche aus, gemeinsame Geometrie in `projects/santa_felicita/model/_portikus.js`), Balkonfenster des Korridors zum Schiff, Cappella Capponi mit Pontormos Kreuzabnahme und Verkündigung, Medici-Loge (unzugänglich, Zugang nur über den Korridor); Torre dei Fifanti als Glockenturm.
- **Palazzo Davanzati:** Fassade mit drei Bögen, Hof mit Brunnen und Treppe auf Kragsteinen durch alle Geschosse, Sala Madornale, Sala dei Pappagalli, Sala dei Pavoni, Camera della Castellana di Vergy, Küche, begehbare Altana. Eigener Zellplan (`tools/wahrzeichen/zellplan.js`), weil der Umriss kein Hofloch hat.
- **Loggia del Bigallo:** drei Bögen zur Piazza San Giovanni und einer zur Via dei Calzaiuoli (offen, nach it.wikipedia), Marmorinkrustation, Tabernakel mit drei Statuen, Museum im Obergeschoss mit dem Fresko „Madonna della Misericordia“ (älteste Stadtansicht), Podesttreppe (Lage C).

## 3. Neue oder erweiterte Werkzeuge
- `tools/wahrzeichen/palazzo.js`: `treppe: false`, `innenwandTuer(c, s, v)` (W5a).
- `tools/wahrzeichen/campanile.js`: Option `zugang: { u, w }` (W5b).
- `tools/wahrzeichen/zellplan.js`: Bauplan aus Zellen im Speicher (W5c).

## 4. Offene Punkte
- Raumlagen in San Marco, Ognissanti und Davanzati überwiegend Stufe C (Quellen nennen kaum Maße).
- San Marco: Sala del Lavabo, Cappella Serragli, Salviati-Krypta, Tramezzo, Orgel nicht modelliert.
- Ognissanti: Kreuzgänge nicht gebaut (Umriss ohne Löcher); Schiffslänge laut it.wikipedia 95 m gegen 43 m in OSM (OSM gilt).
- Santa Felicita: Sakristei nicht gebaut (Lage im Umriss nicht erkennbar).
