# Wahrzeichen Welle 8 und Hausakten-Recherche R2 – Übersicht (Plan 17.10.2026)

Nutzerentscheidung vom 17.10.2026 („mach weiter“, Verfahren wie Welle 7): Welle 8 (zehn Wahrzeichen) und die Recherche der verbleibenden benannten Hausakten laufen **parallel** in disjunkten Quartieren. Vorgänger: [`UEBERSICHT_WELLE7.md`](UEBERSICHT_WELLE7.md). Regeln: Welle 6 §3 und Welle 7 §3 gelten unverändert. Erfahrungen: [`../BEGEHBARKEIT.md`](../BEGEHBARKEIT.md) §24–§26.

Ausgangslage (`origin/main` 7fc41b48 nach Welle 7): 86 Projekte, 105,26 Mio Projektblöcke; 308 Hausakten mit OSM-Namen noch `typologie`, 145 recherchiert.

## 1. Wahrzeichen (gemessen aus `data/stadt/gebaeude.json` und `tools/city/ground_stadt.js`)

| Projekt-ID | OSM | Name | Zellen | Löcher | `groundTopY` (häufigste) | Mitte (x \| z) | bisher in | Paket |
|---|---|---|---:|---:|---|---|---|---|
| `palazzo_corsini_parione` | r4103612 | Palazzo Corsini al Parione (Barock 1656–1737, Terrasse mit Statuen zum Lungarno) | 17.406 | 4 | 58–60 (59) | (−1222 \| 617) | `quartier_ognissanti` | W8a |
| `palazzo_guadagni` | w306798512 | Palazzo Guadagni (Cronaca um 1505, Dachloggia, Piazza Santo Spirito) | 2.371 | 0 | 60–61 (61) | (−1521 \| 1597) | `quartier_maggio` | W8a |
| `palazzo_lenzi` | w307320369 | Palazzo Lenzi (Graffito-Fassade, Piazza Ognissanti, Institut français) | 3.386 | 0 | 55–57 (55) | (−1877 \| 193) | `quartier_ognissanti` | W8a |
| `palazzo_mozzi` | r4095220 | Palazzo dei Mozzi (13. Jh., Palazzo-Festung am Ponte alle Grazie, Hanglage) | 7.079 | 1 | 65–92 (68) | (213 \| 1930) | `quartier_san_niccolo` | W8a |
| `tempio_maggiore` | w102979678 (7 `building:part`) | Tempio Maggiore Israelitico (1874–82, neumaurisch, Kupferkuppel) | 6.219 | 0 | 65–67 (66) | (1510 \| 53) | `quartier_colonna` | W8b |
| `palazzo_della_crocetta` | r19738392 (1 `building:part`) | Palazzo della Crocetta (Parigi 1619–51, 24 Achsen, Museo Archeologico) | 18.168 | 1 | 63–71 (68) | (863 \| −700) | `quartier_colonna` | W8b |
| `biblioteca_nazionale` | w102979687 | Biblioteca Nazionale Centrale (Bazzani 1911–35, Arnofront, zwei Türme) | 21.009 | 0 | 59–63 (59/60) | (873 \| 1303) | `quartier_tintori` | W8b |
| `forte_belvedere` | w24879633 | Forte di Belvedere (Buontalenti 1590–95, Bastionen, Palazzina) | 61.200 | 0 | 180–191 (185) | (−464 \| 2242) | `quartier_costa_san_giorgio` | W8c |
| `loggia_del_grano` | w307129126 | Loggia del Grano (Parigi 1619, offene Arkaden, Kornmarkt) | 1.053 | 0 | 61 | (22 \| 1019) | `quartier_lungarni` | W8c |
| `torre_alberti` | w307106612 | Torre degli Alberti (Turm mit Eck-Loggetta, Via de' Benci) | 553 | 0 | 61 | (479 \| 1143) | `quartier_santa_croce` | W8c |

Für Welle 9 vorgemerkt (gemessen, noch Häuser): Palazzo Pucci r4107740 (14.219, 4 Höfe), Palazzo della Gherardesca r1586356 (12.597), Teatro Verdi r1598978 (10.761), Palazzo della Borsa r1602101 (9.558), Casino Mediceo r4086116 (19.560), Seminario Maggiore/Konvent von Cestello r4088641 (17.179), Santa Maria Maddalena dei Pazzi w303278550 (4.533), Palazzo Capponi alle Rovinate r4095207, Palazzo Torrigiani Del Nero r4095222.

## 2. Pakete

| Paket | Projekte | Bauplan-Vorbilder | BEGEHBARKEIT |
|---|---|---|---|
| **W8a Oltrarno und Lungarni** | `palazzo_corsini_parione`, `palazzo_guadagni`, `palazzo_lenzi`, `palazzo_mozzi` | `palazzo.js` mit `raeume` (Gondi, Spini Feroni, Arcivescovile), Davanzati (Altana/Dachloggia), Antinori (Hanglage) | §24 |
| **W8b Norden und Osten** | `tempio_maggiore`, `palazzo_della_crocetta`, `biblioteca_nazionale` | Santo Spirito/Cestello (Kuppel), San Firenze (Teile aus `building:part`), `palazzo.js` (Crocetta, Biblioteca) | §25 |
| **W8c Hügel und Santa Croce** | `forte_belvedere`, `loggia_del_grano`, `torre_alberti` | Stadtgrund-Gelände (Hang), Bargello (Zinnen, Turm), Loggia del Pesce/Mercato Nuovo (offene Hallen), Arte della Lana (Turmhaus) | §26 |
| **R2a Hausakten Zentrum und Norden** | `strozzi` 30, `san_marco` 22, `signoria` 17, `tornabuoni` 11, `san_lorenzo` 9, `porta_al_prato` 9, `prato` 8, `indipendenza` 7, `mercato_centrale` 7, `palazzuolo` 6, `domplatz_ring` 1, `brunelleschi` 1 | `HAUSAKTE_SCHEMA.md`, recherchierte Akten (145) | – |
| **R2b Hausakten Osten und Oltrarno** | `pergola` 25, `proconsolo` 11, `conce` 10, `ghibellina` 9, `sant_ambrogio` 9, `campuccio` 7, `porta_san_frediano` 6, `san_frediano` 6, `collina` 5, `petrarca` 5, `guicciardini` 4, `borgo_albizi` 3, `carmine` 3, `santo_spirito` 3, `romana` 2 | wie R2a | – |

W8 fasst nur `ognissanti`, `maggio`, `san_niccolo`, `colonna`, `tintori`, `costa_san_giorgio`, `lungarni`, `santa_croce` an; R2 keines davon. Alle fünf Pakete sind quartierweise disjunkt.

## 3. Besonderheiten der Welle
- **Forte di Belvedere:** Der OSM-Umriss ist die gesamte Festung (Sternform mit Bastionen) auf dem Hügel bei Y 180–191. Zu bauen: Wälle aus Pietra forte mit begehbarer Wallkrone und Brüstung, Bastionen, Innenfläche als Kiesplatz auf einer Terrassenhöhe, Palazzina di Belvedere (Buontalenti, dreigeschossig mit Loggia) in der Mitte (Lage aus Quellen oder Stufe C), Zugang über das Tor zur Costa San Giorgio und die Rampe; alles Begehbare oben frei (R14: offene Flächen dürfen, Räume der Palazzina dicht). Keine Zelle teilen mit `palazzo_pitti`/Boboli-Projekten (prüfen). Gelände im Umriss nach Bedarf abtragen/auffüllen (`spec/ground.js`).
- **Tempio Maggiore:** Zentralbau mit Kupferkuppel auf Tambour, zwei Ecktürme, zweifarbiges Steinmauerwerk (Travertin und Pomato) – Palette: helle und rote Steinrollen; Innenraum mit Emporen (Matroneum), Aron ha-Kodesch, Bima. Quellen: it.wikipedia „Tempio Maggiore Israelitico di Firenze“.
- **Biblioteca Nazionale:** Arnofassade mit zwei Türmen, Lesesäle, Magazintrakte Stufe C; der Umriss grenzt an den Konvent von `cappella_pazzi` (144 Kontaktzellen) – keine gemeinsamen Zellen, keine Tür.
- **Palazzo dei Mozzi:** Hang von 65 bis 92; Hauptfassade an der Piazza de' Mozzi (unten), Garten Bardini oberhalb liegt außerhalb.

## 4. Regeln der Hausakten-Recherche R2
Wie Welle 7 §3 (nur benannte typologische Akten in den zugeteilten Quartieren, it.wikipedia/Wikidata, Felder nach Schema, `quelle: recherche:<url>`, Sicherheit 0,6–0,8, `notiz`, Quartier neu bauen, Quellenliste `QUELLEN_HAUSAKTEN.md` ergänzen, ein Commit je Quartier). Ziel je Paket mindestens 50 Akten; die zehn Gebäude aus §1 sind tabu (sie werden Wahrzeichen).

## 5. Integration
Wie Welle 7 §4: Pakete nach `claude/welle8` mergen → `besitz.js` (neue Projekte, alle geänderten Quartiere) → Stadtgrund → `webindex.js` → `--all --cross --no-emit` (R9-Abweichungen der Quartiere danach durch Neubau beheben) → Tests → Export → Statistik → Abschnitte 6–8 hier, Übergabe → PR (Merge nur mit Freigabe des Nutzers).

## 6. Wahrzeichen (gemessen) – nach der Integration

## 7. Hausakten-Recherche (gemessen) – nach der Integration

## 8. Offene Punkte – nach der Integration
