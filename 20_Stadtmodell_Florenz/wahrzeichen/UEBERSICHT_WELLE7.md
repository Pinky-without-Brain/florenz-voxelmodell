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

## 5. Wahrzeichen (gemessen, Integration 16./17.10.2026)

Alle elf Projekte stehen auf `"begehbarkeit": "pflicht"`: R13 0 nicht erreichbare Komponenten, R14 0 Lücken; der nicht erreichbare Rest sind deklarierte Dachräume.

| Projekt | Paket | `bodenY` | Zellen | Blöcke | Module | R13 erreichbar | Tests |
|---|---|---:|---:|---:|---:|---:|---:|
| `palazzo_gondi` | W7a | 63 | 3.997 | 43.278 | 7 | 84,6 % | 7 |
| `palazzo_spini_feroni` | W7a | 61 | 4.390 | 62.154 | 7 | 89,8 % | 6 |
| `palazzo_bartolini_salimbeni` | W7a | 62 | 2.673 | 37.069 | 7 | 87,9 % | 6 |
| `palazzo_antinori` | W7a | 63 | 6.489 | 69.492 | 7 | 86,3 % | 6 |
| `loggia_dei_servi` | W7b | 69 | 6.435 | 74.956 | 7 | 84,3 % | 7 |
| `palazzo_nonfinito` | W7b | 66 | 9.243 | 82.024 | 7 | 76,5 % | 7 |
| `sant_apollonia` | W7b | 66 | 17.115 + 3.515 (Mensa w1239428647, Teil der Hauptmaske) | 188.410 | 7 | 77,5 % | 7 |
| `santa_margherita_cerchi` | W7c | 66 | 451 | 4.602 | 6 | 100 % | 4 |
| `palazzo_arte_della_lana` | W7c | 66 | 2.000 | 32.269 | 7 | 100 % | 4 |
| `museo_opera_duomo` | W7c | 65 | 14.051 | 140.223 | 7 | 77,5 % | 5 |
| `cappella_pazzi` (Erweiterung Primo Chiostro) | W7c | 61 | + 6.569 (Maske `primo_chiostro`, drei Rechtecke) | 231.846 (+ 12.174) | 13 (+ 3) | 80,6 % | 9 (+ 3) |

Summe der zehn neuen Projekte: **734.477 Blöcke**, mit dem Primo Chiostro 746.651 neue Blöcke. Aus den Quartieren gelöst (14 Hausakten): `quartier_signoria`, `quartier_tornabuoni` (2), `quartier_strozzi` (2, von W7a und W7c; nach dem Merge erneut gebaut), `quartier_san_marco` (3), `quartier_pergola`, `quartier_proconsolo`, `domplatz_ring`. `vorrang.json`: 71 IDs.

Werkzeuge: `tools/wahrzeichen/palazzo.js` – `portikus.entlang` steuert jetzt auch die Achse der Bogenreihe (W7b, abwärtskompatibel; Bargello und Innocenti unverändert gebaut); neue Content-Erzeuger `tools/diag/w7a_inhalt.js`, `w7b_inhalt.js`. Erfahrungen: `BEGEHBARKEIT.md` §21–§23 und §19 (Primo Chiostro). Lehre W7c: Wandfelder, die in einem späteren Modul Zellen einer Trennwand ersetzen, lassen Restzellen ohne Halt (R3); Wandzellen bleiben im Bauteil ihrer Wand (`kitApi.ersetze`).

Abweichungen vom Plan (§1): Die Mensa w1239428647 ist nicht das Refektorium (das Cenacolo liegt am Museumseingang Via XXVII Aprile), sie gehört als zweite ID zur Hauptmaske. Der Palazzo dell'Arte della Lana gehörte den Compiobbesi (nicht Compagnoni); Orsanmichele hat am Brückenende keine Öffnung, daher endet die Brücke am Palazzo mit einer blinden Tür. Das Museo dell'Opera hat keine klassizistische Fassade (nicht belegt) und keinen Hof. Primo Chiostro: Zugang über die Konventportale, das Piazza-Tor liegt in w307539769.

## 6. Hausakten-Recherche R1 (gemessen)

| Paket | Quartiere | recherchierte Akten | Beispiele |
|---|---|---:|---|
| R1a Osten und Norden | santa_croce 18, tintori 12, colonna 9, san_lorenzo 8, brunelleschi 6, borgo_albizi 5, lungarni 4, sant_ambrogio 4, ghibellina 3, conce 2 | **71** | Palazzo Salviati-Quaratesi (Rustika, Filaretto, Altana), Palazzo Bardi-Tempi (Kniefenster, Konsolgesims), Palazzo Ginori (1516–20, Altana mit Loggetta) |
| R1b Oltrarno und Westen | maggio 19, san_niccolo 9, ognissanti 8, costa_san_giorgio 6, santo_spirito 3, carmine 3, campuccio 3, guicciardini 3, prato 2, palazzuolo 2 (san_frediano 0) | **58** | Palazzo di Bianca Cappello (Graffito-Fassade, Kniefenster), Palazzo Serristori (sieben Kniefenster, roter Putz), Palazzo Capponi alle Rovinate (Bossenwerk, Monoforen) |

Zusammen **129 neue recherchierte Akten**, insgesamt jetzt **146** (`quelle: recherche:<it.wikipedia>`, Sicherheit 0,6–0,8, `notiz` mit Belegtem und Annahmen). Quellenlisten je Quartier: `projects/<quartier>/docs/QUELLEN_HAUSAKTEN.md`. Alle 20 Quartiere neu gebaut, R11 0 Fehler, R13 0 nicht erreichbare Komponenten. Grenzen des Schemas: höchstens 15 Achsen (Palazzo della Crocetta hat 24), kein Kuppeldach und keine gestreifte Steinfassade (Tempio Maggiore), `extras` werden nur gespeichert, nicht gebaut. Nebenbei entfernt: verwaiste Akte w482302683 (Santo-Spirito-Campanile) in `quartier_maggio`.

## 7. Offene Punkte
- **Stufe C bei Höhen und Raumlagen**; Jochzahl der Loggia dei Servi (neun) und die Lage der Kirche von Sant'Apollonia sind Schätzungen.
- **Nicht gebaut (belegt, aber ohne Lage oder außerhalb des Umrisses):** Garten des Palazzo Antinori, Durchgang zum Arno am Spini Feroni, Loggien in den Obergeschossen (Spini Feroni, Bartolini Salimbeni, Antinori), Poggi-Fassade des Gondi, dreiläufige Treppe und Serlianen des Nonfinito, Nonnenchor von Sant'Apollonia, Loggetta und Scalone der Arte della Lana, 12 der 28 Säle des Museo dell'Opera, Portinari-Grabmal in Santa Margherita.
- **Hausakten:** 318 benannte Akten bleiben typologisch (ohne brauchbare Quelle oder noch nicht bearbeitet, darunter alle sechs in `quartier_san_frediano`); die Quartiere der Wellen 6/7 (`tornabuoni`, `strozzi`, `signoria`, `san_marco`, `pergola`, `domplatz_ring`, `proconsolo`) waren für R1 gesperrt.
- **Kandidaten für Welle 8** (aus R1a/R1b): Palazzo della Crocetta (24 Achsen, 18.173 Zellen), Teatro Verdi, Palazzo Pucci, Palazzo della Gherardesca, Tempio Maggiore (Kuppel), Biblioteca Nazionale, Stazione Leopolda, Santa Maria Maddalena dei Pazzi, Palazzo della Borsa, Loggia del Grano, Torre degli Alberti, Palazzo Corsini al Parione, Palazzo Guadagni, Palazzo dei Mozzi, Palazzo Torrigiani Del Nero, Palazzo Capponi alle Rovinate, Palazzo Lenzi, Palazzo Venturi Ginori, Forte di Belvedere (61.186 Zellen).
- Integration: Besitzraster 38 Projekte, Stadtgrund neu, `--cross` __CROSS__, Tests __TESTS__, Export __EXPORT__.
