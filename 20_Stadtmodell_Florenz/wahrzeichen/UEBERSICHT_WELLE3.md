# Wahrzeichen Welle 3 und 4 – Übersicht und Reihenfolge (V3 D3)

Stand 14.10.2026, nach Abschluss der Häuserzeilen (Phase E: alle 7.106 Gebäude des Stadtgebiets gehören einem Quartier oder sind für ein Wahrzeichen reserviert). Plan: [`../STADTMODELL_PLAN.md`](../STADTMODELL_PLAN.md) Phase D – Welle 3 Kirchen, Welle 4 Palazzi und Weitere. Vorgänger: [`UEBERSICHT.md`](UEBERSICHT.md) (Welle 1), [`UEBERSICHT_WELLE2.md`](UEBERSICHT_WELLE2.md).

Die Gebäude der Liste stehen in `loadLandmarks()` (`tools/emit/stadtbasis.js`) und sind deshalb aus allen Quartieren ausgelassen; bis zu ihrem Bau zeigen Webapp und Minecraft-Welt einen Platzhalter-Baukörper, der Stadtgrund baut im Polygon nur bis `groundTopY − 1`.

## 1. Noch nicht gebaute Wahrzeichen (gemessen aus `data/stadt/gebaeude.json`)

| Projekt (Vorschlag) | OSM | Fläche (Zellen) | Höhe in den Daten | `bodenY` | Lage (x \| z) | Welle |
|---|---|---:|---|---:|---|---|
| `santa_croce` | w777563049 (mit Teilen) | 20.747 | 17 (levels, zu niedrig) | 63 | 979,5 \| 1031 | 3 |
| `san_lorenzo` (+ `cappelle_medicee`) | w599900778, w24883267 | 14.218 + 5.661 | 30 (Schätzung) | 65 / 62 | −483 \| −385,5 | 3 |
| `santa_maria_novella` | w449369047 | 15.473 | 30 (Schätzung) | 59 | −1223 \| −322,5 | 3 |
| `santo_spirito` | w24881563 | 15.875 | 30 (Schätzung) | 63 | −1354,5 \| 1293,5 | 3 |
| `santa_maria_del_carmine` | w118425485 | 10.344 | 30 (Schätzung) | 59 | −2071 \| 1232 | 3 |
| `santissima_annunziata` | w234428743 | 12.377 | 30 (Schätzung) | 68 | 691,5 \| −888,5 | 3 |
| `santa_trinita` | w478272186 | 5.455 | 30 (Schätzung) | 60 | −982,5 \| 689 | 3 |
| `badia_fiorentina` | w249686037 | 2.682 | 30 (Schätzung) | 65 | 113,5 \| 580,5 | 3 |
| `palazzo_medici_riccardi` | r1379977 | 15.283 | 23 (levels) | 65 | −221 \| −474 | 4 |
| `bargello` | r1461750 | 8.378 | 30 (Schätzung) | 63 | 223,5 \| 604 | 4 |
| `palazzo_strozzi` | r2951949 | 9.445 | 23 (levels) | 64 | −822,5 \| 429,5 | 4 |
| `palazzo_rucellai` | r4103996 | 3.487 | 30 (Schätzung) | 59 | −1186,5 \| 417,5 | 4 |
| `ospedale_degli_innocenti` | r7085758 | 23.183 | 30 (Schätzung) | 66 | 686 \| −663 | 4 |
| `mercato_nuovo` | w27590454 | 2.919 | 30 (Schätzung) | 65 | −420 \| 698,5 | 4 |
| Arnobrücken: Santa Trinita, Carraia, Grazie, Vespucci, San Niccolò | Flächen in `flaechen.bruecken` (San Niccolò: w306984416, w599897663, w72915036) | – | – | – | – | 4 |

„Höhe in den Daten“ ist der Wert aus OSM bzw. die Schätzung der Stadtbasis; für die Modelle gelten erst die Maße der jeweiligen `REFERENZMASSE.md`.

## 2. Reihenfolge
1. **Santa Croce** – größte Kirche der Liste, klarer Aufbau (dreischiffige Basilika mit offenem Dachstuhl, T-Querhaus mit Kapellenreihe, Fassade, Campanile); Platz und Quartiere ringsum sind gebaut.
2. **San Lorenzo + Cappelle Medicee** (ein Projekt, zwei Masken; Alte und Neue Sakristei, Fürstenkapelle mit Kuppel).
3. **Santa Maria Novella**, 4. **Santo Spirito**, 5. **Carmine**, 6. **Santissima Annunziata**, 7. **Santa Trinita**, 8. **Badia**.
9. Welle 4: Palazzo Medici Riccardi, Bargello, Strozzi, Rucellai, Innocenti, Mercato Nuovo, Brücken.

## 3. Vorgehen je Wahrzeichen (wie Welle 1/2)
1. Recherche → `wahrzeichen/<id>/REFERENZMASSE.md` (Maße mit Quellen; keine Zahl ohne Beleg) und `BAUTEIL_KATALOG.md` (Rahmen, Module, Bauteile, Innenräume nach `BEGEHBARKEIT.md`).
2. `data/stadt/vorrang.json` um die OSM-IDs ergänzen; die Quartiere enthalten sie bereits nicht (Prüfung: `quartier.js` bricht bei Vorrang-IDs ab).
3. Projekt `projects/<id>/` (`type: wahrzeichen`, `rahmen`, `bodenY`, `begehbarkeit: pflicht`), Modelle `model/m*.js`, Content `content/modul_*.json`, Test in `tools/test/<id>.test.js`.
4. Bauen, `node tools/city/besitz.js <id>`, Stadtgrund neu, `webindex.js`, `--cross`, Tests, Übergabe, Commit/Push.
