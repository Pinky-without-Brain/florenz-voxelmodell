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

## 6. Wahrzeichen (gemessen, Integration 17.10.2026)

Alle zehn Projekte stehen auf `"begehbarkeit": "pflicht"`: R13 0 nicht erreichbare Komponenten, R14 0 Lücken; der nicht erreichbare Rest sind deklarierte Dach-, Kuppel- und Turmhohlräume.

| Projekt | Paket | `bodenY` | Zellen | Blöcke | Module | R13 erreichbar | Tests |
|---|---|---:|---:|---:|---:|---:|---:|
| `palazzo_guadagni` | W8a | 61 | 2.371 | 37.427 | 7 | 89,2 % | 8 |
| `palazzo_lenzi` | W8a | 55 | 3.386 | 47.901 | 7 | 85,7 % | 7 |
| `palazzo_mozzi` | W8a | 66 | 7.079 | 92.416 | 7 | 85,6 % | 7 |
| `palazzo_corsini_parione` | W8a | 59 | 17.406 | 199.822 | 7 | 99,9 % (mit Terrasse) | 8 |
| `tempio_maggiore` | W8b | 66 | 6.224 | 97.749 | 7 | 85,2 % | 6 |
| `palazzo_della_crocetta` | W8b | 68 | 18.168 | 240.152 | 7 | 87,2 % | 6 |
| `biblioteca_nazionale` | W8b | 61 | 20.985 (5 Randzellen des Primo Chiostro abgezogen) | 271.131 | 8 | 76,7 % | 7 |
| `forte_belvedere` | W8c | 185 | 61.200 (+ Palazzina w160800063 4.946, w398240863, w398240882) | 190.786 | 8 | 100 % | 7 |
| `loggia_del_grano` | W8c | 61 | 1.053 | 16.327 | 7 | 100 % | 6 |
| `torre_alberti` | W8c | 61 | 553 | 13.405 | 6 | 98,2 % | 6 |

Summe der zehn Projekte: **1.207.116 Blöcke**. Aus den Quartieren gelöst (13 Hausakten): `quartier_ognissanti` (2), `quartier_maggio`, `quartier_san_niccolo`, `quartier_colonna` (2), `quartier_tintori`, `quartier_costa_san_giorgio` (4: Forte, Palazzina und zwei Nebengebäude), `quartier_lungarni`, `quartier_santa_croce`. `vorrang.json`: 84 IDs.

Werkzeuge: `tools/wahrzeichen/palazzo.js` Option `entlangGlatt` (Außennormale aus dem Umkreis 3; schräge Rahmen zerrissen Fenster und Portalbögen), `tools/wahrzeichen/strasse.js` mit `aufStrasseFuer(projektDir)` (Bank-Filter aus §21 als Bibliothek), `tools/wahrzeichen/campanile.js` Option `ohneGlocken`; Content-Erzeuger `tools/diag/w8a_inhalt.js`, `w8b_inhalt.js`, `w8c_inhalt.js`. Erfahrungen: `BEGEHBARKEIT.md` §24–§26.

Abweichungen vom Plan (§1/§3): Forte-Plateau auf Y 185 (Gelände an den Wällen 189–191 enthält vermutlich die Mauerhöhen des DGM); Tor an der Südostkurtine statt an der Ostspitze; Tempio als Spaltenmodell (kein Palazzo-Plan), Kupfer als `marmor_gruen`, Travertin/Pomato als `putz_sand`/`putz_rosa`; Biblioteca `bodenY` 61 statt 59/60 (Lungarno 62); Loggia del Grano: Obergeschoss 1868 (nicht 1690), keine Uhr (nicht belegt); Guadagni ohne Hofloch im OSM-Umriss, daher überdachte Halle; Crocetta 22 + 1 Achsen statt 24.

## 7. Hausakten-Recherche R2 (gemessen)

| Paket | Quartiere (Akten) | recherchiert |
|---|---|---:|
| R2a Zentrum und Norden | strozzi 28, san_marco 15, signoria 15, tornabuoni 11, san_lorenzo 8, prato 4, palazzuolo 4, porta_al_prato 3, mercato_centrale 3, indipendenza 2 | **93** |
| R2b Osten und Oltrarno | pergola 20, conce 10, proconsolo 10, sant_ambrogio 8, ghibellina 6, campuccio 4, guicciardini 4, san_frediano 3, carmine 3, santo_spirito 3, porta_san_frediano 2, petrarca 2, collina 1, romana 1 | **77** |

Zusammen **170 neue recherchierte Akten**, insgesamt jetzt **315** (`quelle: recherche:<it.wikipedia>`, Sicherheit 0,6–0,85, `notiz`). Quellenlisten je Quartier `projects/<quartier>/docs/QUELLEN_HAUSAKTEN.md`. 24 Quartiere neu gebaut, R11 0 Fehler. Verbleibende benannte typologische Akten (rund 140) sind überwiegend Namen ohne Wikipedia-Artikel, Begriffsklärungen, moderne Zweckbauten (Bahnhof, Kongresszentrum, Ämter) oder Villini. Schema-Grenzen (unverändert): höchstens 15 Achsen, kein Kuppel- oder Rundbau-Dach, keine Spitzbögen, keine Sichtziegel, keine Eisen-Glas-Hallen, `extras` nur dokumentarisch.

## 8. Offene Punkte
- **Stufe C bei Höhen und Raumlagen**; Forte-Kasematten, Zisterne, Schießscharten nicht gebaut (nicht belegt); Türme der Biblioteca und des Mozzi hohl und unzugänglich.
- **Nicht gebaut (außerhalb des Umrisses oder ohne Lage):** Gärten (Antinori, Crocetta, Tempio, Bardini am Mozzi), Loggien in den Obergeschossen (Spini Feroni, Bartolini Salimbeni, Antinori), zurückgesetzter Mittelteil der Corsini-Fassade, Giebelgaube der Loggia del Grano.
- **Kandidaten für Welle 9** (gemessen, §1 und Agentenvorschläge): Palazzo Pucci r4107740 (14.219), Palazzo della Gherardesca r1586356 (12.597), Teatro Verdi r1598978 (10.761), Teatro della Pergola r4103318 (18.498), Palazzo della Borsa r1602101 (9.558), Casino Mediceo r4086116 (19.560), Seminario Maggiore/Konvent Cestello r4088641 (17.179), Santa Maria Maddalena dei Pazzi w303278550 (4.533), Palazzo Tornabuoni r1593628 (11.784), Ospedale di San Paolo r6593382 (9.703), Granaio dell'Abbondanza r1632267 (9.768), Mercato Centrale w480015428 (23.164, Eisen-Glas), Ex Spedale di San Matteo/Accademia r1583912 (40.913), Pia Casa Montedomini r1607712 (58.186), Monastero SS. Concezione r1615373 (44.941), Sant'Orsola r1580100, Santa Caterina r4086388, Palazzo Capponi alle Rovinate r4095207, Palazzo Torrigiani Del Nero r4095222, Banca d'Italia w306984404, Palazzo Caccini w306486037, Rospigliosi Pallavicini r4088630, Bardi-Guicciardini r4096737, Portinari-Salviati r4107742.
- Integration: Besitzraster 42 Projekte, Stadtgrund neu, `--cross` __CROSS__, Tests __TESTS__, Export __EXPORT__.
