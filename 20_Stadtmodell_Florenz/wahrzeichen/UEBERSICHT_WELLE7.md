# Wahrzeichen Welle 7 und Hausakten-Recherche R1 – Übersicht (Plan 16.10.2026, abends)

Nutzerentscheidung vom 16.10.2026: Welle 7 (weitere Wahrzeichen) und die Recherche benannter Hausakten laufen **parallel**. Vorgänger: [`UEBERSICHT_WELLE6.md`](UEBERSICHT_WELLE6.md). Vorgehen je Wahrzeichen wie [`UEBERSICHT_WELLE3.md`](UEBERSICHT_WELLE3.md) §3, Zellregeln [`UEBERSICHT_WELLE2.md`](UEBERSICHT_WELLE2.md) §3, Regeln der Welle 6 ([`UEBERSICHT_WELLE6.md`](UEBERSICHT_WELLE6.md) §3) gelten unverändert. Erfahrungen: [`../BEGEHBARKEIT.md`](../BEGEHBARKEIT.md) §21–§23 (W7a–c); Hausakten: [`../HAUSAKTE_SCHEMA.md`](../HAUSAKTE_SCHEMA.md).

Ausgangslage (`origin/main` ca2a49c4 nach Welle 6): 76 Projekte; 464 Hausakten mit OSM-Namen, davon 447 `typologie`.

## 1. Wahrzeichen (gemessen aus `data/stadt/gebaeude.json` und `tools/city/ground_stadt.js`)

| Projekt-ID | OSM | Name | Zellen | Löcher | `groundTopY` (häufigste) | Mitte (x \| z) | bisher in | Paket |
|---|---|---|---:|---:|---|---|---|---|
| `palazzo_spini_feroni` | r4101722 | Palazzo Spini Feroni | 4.392 | 1 | 61–63 (61) | (−925 \| 786) | `quartier_tornabuoni` | W7a |
| `palazzo_antinori` | r1610588 | Palazzo Antinori | 6.519 | 1 | 58–64 (62) | (−965 \| 86) | `quartier_strozzi` | W7a |
| `palazzo_gondi` | r4084512 | Palazzo Gondi | 4.018 | 2 | 62–65 (63/64) | (66 \| 765) | `quartier_signoria` | W7a |
| `palazzo_bartolini_salimbeni` | r4101721 | Palazzo Bartolini Salimbeni | 2.676 | 1 | 61–63 (62) | (−841 \| 676) | `quartier_tornabuoni` | W7a |
| `sant_apollonia` | r6818342 (Konvent, 4 Höfe), ggf. w1239428647 (Mensa universitaria, 3.506 Zellen, Lage des Cenacolo prüfen) | Ex monastero di Sant'Apollonia (Cenacolo Andrea del Castagno) | 17.115 (+ 3.506) | 4 | 61–68 (66) | (−96 \| −1140) | `quartier_san_marco` | W7b |
| `loggia_dei_servi` | r7021619 | Loggia dei Servi di Maria (Piazza SS. Annunziata, Gegenstück der Innocenti) | 6.435 | 6 | 67–70 (69) | (511 \| −810) | `quartier_san_marco` | W7b |
| `palazzo_nonfinito` | r4098970 | Palazzo Nonfinito (Buontalenti, Museo di Antropologia) | 9.243 | 2 | 64–68 (67) | (220 \| 300) | `quartier_pergola` | W7b |
| `palazzo_arte_della_lana` | w95537272 | Palazzo dell'Arte della Lana (Brücke zu Orsanmichele) | 1.983 | 0 | 65–67 (66) | (−364 \| 540) | `quartier_strozzi` | W7c |
| `museo_opera_duomo` | w456578419 | Museo dell'Opera del Duomo | 14.058 | 0 | 63–67 (65) | (177 \| −54) | `domplatz_ring` | W7c |
| `santa_margherita_cerchi` | w307545799 | Santa Margherita de' Cerchi („Dantes Kirche“) | 441 | 0 | 65–66 (66) | (50 \| 410) | `quartier_proconsolo` | W7c |
| `cappella_pazzi` (Erweiterung) | Primo Chiostro: freie Stadtgrund-Fläche zwischen Basilika (w777563049, Nord), Kapelle (w307539790, Ost) und Konvent (r10782536, Süd/West) | Primo Chiostro von Santa Croce | – | – | 61 | ≈ (930 \| 1105) | Stadtgrund | W7c |

## 2. Pakete

| Paket | Projekte | Bauplan-Vorbilder | BEGEHBARKEIT |
|---|---|---|---|
| **W7a Tornabuoni und Signoria** | `palazzo_spini_feroni`, `palazzo_antinori`, `palazzo_gondi`, `palazzo_bartolini_salimbeni` | `tools/wahrzeichen/palazzo.js` mit `raeume` (Bargello, Strozzi, Arcivescovile W6c) | §21 |
| **W7b Norden** | `sant_apollonia`, `loggia_dei_servi`, `palazzo_nonfinito` | San Marco (Konvent über `palazzo.js`, Cenacolo als Saal), Innocenti (`portikus`), Nonfinito über `palazzo.js` | §22 |
| **W7c Dom und Santa Croce** | `palazzo_arte_della_lana`, `museo_opera_duomo`, `santa_margherita_cerchi`, Primo Chiostro in `cappella_pazzi` | Bargello (Turmhaus mit `extra`), Loggia del Bigallo (`zellplan.js`), Ognissanti (kleine Kirche), `cappella_pazzi` (Konvent, `masken`) | §23 |
| **R1a Hausakten Osten und Norden** | Quartiere `colonna`, `santa_croce`, `tintori`, `san_lorenzo`, `ghibellina`, `borgo_albizi`, `brunelleschi`, `sant_ambrogio`, `conce`, `lungarni` | `HAUSAKTE_SCHEMA.md`, recherchierte Akten in `projects/domplatz_ring/hausakten/` (17 Stück, `quelle: recherche`) | – |
| **R1b Hausakten Oltrarno und Westen** | Quartiere `maggio`, `costa_san_giorgio`, `san_niccolo`, `santo_spirito`, `carmine`, `campuccio`, `guicciardini`, `san_frediano`, `ognissanti`, `prato`, `palazzuolo` | wie R1a | – |

Die Pakete W7a–c und R1a/b berühren **disjunkte Quartiere**; R1 fasst die Quartiere `tornabuoni`, `strozzi`, `signoria`, `san_marco`, `pergola`, `domplatz_ring`, `proconsolo` nicht an.

## 3. Regeln für die Hausakten-Recherche (R1)
1. Nur Akten mit OSM-Namen und `quelle: typologie` in den zugeteilten Quartieren; Reihenfolge nach Bedeutung (Palazzi und Kirchen an Plätzen und Hauptstraßen zuerst), Ziel je Paket **mindestens 40 Akten**.
2. Quelle: it.wikipedia (Artikel zum Gebäude oder zur Straße), Wikidata; keine Google-Dienste. Keine Zahl ohne Beleg: belegt sind typischerweise Epoche, Architekt, Geschosszahl, Achsen, Material (Rustika, Putz, Pietra forte), Besonderheiten (Loggia, Sporti, Wappen, Altana, Kniefenster). Was die Quelle nicht nennt, bleibt die bisherige Annahme.
3. Felder nach `HAUSAKTE_SCHEMA.md` §3: `typ`, `epoche`, `geschosse` (Summe ≈ `hoeheBl` ± 2 aus `gebaeude.json`, sonst R11), `fassade.*`, `dach`, `quelle: "recherche:<url>"`, `sicherheit` 0,6–0,8, `notiz` (was belegt, was Annahme ist), `name` behalten. Nachbarschaftsregel (§4.2) beachten.
4. Keine Akte löschen oder umbenennen, keine `project.json` der Quartiere ändern, keine Wahrzeichen anlegen (Kandidaten mit Wahrzeichen-Niveau nur in einem Abschnitt „Vorschläge für Welle 8“ im Bericht nennen).
5. Je Quartier nach den Änderungen `node tools/build.js --project <quartier>` (R11 prüft die Akten; Ergebnis OK) und `node --test tools/test/city_quartier.test.js tools/test/city_akte.test.js` (falls vorhanden); erzeugte `webapp/data/<quartier>/*` und `projects/<quartier>/docs/*` mitcommitten. Ein Commit je Quartier.
6. Bildnachweise/Quellenliste je Quartier in `projects/<quartier>/docs/QUELLEN_HAUSAKTEN.md` (Tabelle: OSM-ID, Name, Quelle, was übernommen).

## 4. Integration
`worktree-agent-*` nach `claude/welle7` mergen (Konflikte: `vorrang.json`, `BEGEHBARKEIT.md`, `wahrzeichen.test.js`; `quartier_strozzi` wird von W7a und W7c angefasst → nach dem Merge neu bauen) → `besitz.js` für neue Projekte und alle geänderten Quartiere (auch R1-Quartiere, falls sich Unterkanten ändern) → Stadtgrund → `webindex.js` → `--cross` → Tests → Export → Statistik → Abschnitte 5–7 hier, Übergabe → PR (Merge nur mit Freigabe des Nutzers).

## 5. Wahrzeichen (gemessen) – nach der Integration

## 6. Hausakten-Recherche (gemessen) – nach der Integration

## 7. Offene Punkte – nach der Integration
