# Wahrzeichen Welle 6 – Übersicht (Plan 16.10.2026)

Nutzerwunsch vom 16.10.2026: die bedeutendsten Gebäude, die noch als typologische Häuser in den Quartieren stehen, werden eigene Wahrzeichen-Projekte mit Begehbarkeit „pflicht“ (R13: 0 nicht erreichbare Komponenten, R14: 0 Lücken). Vorgänger: [`UEBERSICHT_WELLE5.md`](UEBERSICHT_WELLE5.md). Vorgehen je Wahrzeichen wie in [`UEBERSICHT_WELLE3.md`](UEBERSICHT_WELLE3.md) §3; Zellregeln zwischen den Projekten wie in [`UEBERSICHT_WELLE2.md`](UEBERSICHT_WELLE2.md) §3. Erfahrungen je Paket in [`../BEGEHBARKEIT.md`](../BEGEHBARKEIT.md) §18–§20.

Ausgangslage (gemessen am 16.10.2026, `origin/main` 6a17a3ab): 7.053 Hausakten, davon 7.036 `typologie`; 476 Akten tragen einen OSM-Namen. Die zehn Gebäude unten sind daraus gewählt (Bedeutung, Lage, Quellenlage).

## 1. Kandidaten (gemessen aus `data/stadt/gebaeude.json` und `tools/city/ground_stadt.js`)

| Projekt-ID | OSM | Name | Zellen | Löcher | `groundTopY` (häufigste) | Mitte (x \| z) | bisher in | Paket |
|---|---|---|---:|---:|---|---|---|---|
| `san_frediano_in_cestello` | w118416085 (Hauptmaske; schließt w673464782 ein, 4.090 Zellen, 2 + 4 `building:part`) | Chiesa di San Frediano in Cestello | 5.602 | 0 | 56–61 (58) | (−2061 \| 749) | `quartier_san_frediano` (zwei Akten: w118416085, w673464782) | W6a |
| `santa_maria_maggiore` | w234429579 | Chiesa di Santa Maria Maggiore | 2.576 | 0 | 62–65 (63/64) | (−633 \| −21) | `quartier_san_lorenzo` | W6a |
| `san_gaetano` | w234429578 | Chiesa dei Santi Michele e Gaetano | 4.976 | 0 | 62–66 (64/65) | (−825 \| 176) | `quartier_strozzi` | W6a |
| `santi_apostoli` | w451785463 | Chiesa dei Santi Apostoli | 1.121 | 0 | 58–61 (60) | (−752 \| 887) | `quartier_lungarni` | W6a |
| `cappella_pazzi` | w307539790 (Kapelle, 1.630) + r10782536 (Konvent mit den beiden Kreuzgängen, ohne Namen in OSM, 26.159) | Cappella de' Pazzi und Kreuzgänge von Santa Croce | 27.789 | 2 (Kreuzgänge) | 59–64 (61) | (946 \| 1149) | `quartier_tintori` (zwei Akten) | W6b |
| `santo_stefano_al_ponte` | w253942619 | Chiesa di Santo Stefano al Ponte | 3.462 | 0 | 62–66 (64) | (−401 \| 1008) | `quartier_costa_san_giorgio` | W6b |
| `san_firenze` | r4084510 (Palazzo, 9.664, 2 Höfe) + w361442655 (Chiesa di San Filippo Neri, 2.983) + w307129115 (Sala della Musica, ehem. Oratorium, 1.948) | Complesso di San Firenze | 14.595 | 2 | 61–65 (62) | (229 \| 798) | `quartier_proconsolo` (drei Akten) | W6c |
| `palazzo_arcivescovile` | r1592495 | Palazzo Arcivescovile | 7.435 | 1 (Hof) | 62–65 (64) | (−435 \| 7) | `quartier_san_lorenzo` | W6c |
| `loggia_del_pesce` | w204145494 (`building=roof`) | Loggia del Pesce | 780 | 0 | 63–64 (64) | (1291 \| 363) | `quartier_sant_ambrogio` | W6c |

Nachbarn, die **nicht** Teil der Projekte werden (bleiben Häuser): Seminario Maggiore Arcivescovile r4088641 (an Cestello, 102 Kontaktzellen), Biblioteca Nazionale w102979687 (am Konvent von Santa Croce, 144 Kontaktzellen), w307539769 (2.998 Zellen, am Konvent). Die Kreuzgänge berühren die Basilika (`santa_croce`, w777563049) auf 24 Zellen und die Cappella de' Pazzi auf 46 Zellen; Schnittmengen 0.

## 2. Pakete (drei Sonnet-Agenten parallel, je eigener Worktree, Zweig `w6-*` von `claude/welle6`)

| Paket | Worktree | Projekte | Bauplan-Vorbilder | BEGEHBARKEIT |
|---|---|---|---|---|
| **W6a Kirchen** | `w6-kirchen` | `san_frediano_in_cestello`, `santa_maria_maggiore`, `san_gaetano`, `santi_apostoli` | Ognissanti (`_og.js`: Teile aus `building:part`, Wandzellen über `dOut`/`dPart`), Santo Spirito (`_ss.js`: Vierungskuppel), Santa Croce (`_sc.js`: Zonen, Dachhaut je Spalte), `tools/wahrzeichen/campanile.js` | §18 |
| **W6b Santa Croce und Arno** | `w6-santacroce` | `cappella_pazzi`, `santo_stefano_al_ponte` | San Marco (Konvent über `tools/wahrzeichen/palazzo.js` mit Höfen als Kreuzgänge, Kirche/Kapelle mit eigenem Plan), Santa Felicita (Nachbarprojekt ohne gemeinsame Zellen) | §19 |
| **W6c Palazzi und Loggia** | `w6-palazzi` | `san_firenze`, `palazzo_arcivescovile`, `loggia_del_pesce` | Bargello/Innocenti (`palazzo.js` mit `extra`, `raeume`), Loggia del Bigallo (`_bg.js`, offene Arkaden, `zellplan.js`), Mercato Nuovo (`_mn.js`, offene Halle) | §20 |

## 3. Regeln der Welle (verbindlich für die Pakete)
1. Je Projekt: Recherche → `wahrzeichen/<id>/REFERENZMASSE.md` (Stufen A/B/C, keine Zahl ohne Quelle; OSM ist bei Widersprüchen maßgeblich) und `BAUTEIL_KATALOG.md`; Projekt `projects/<id>/` (`type: wahrzeichen`, `rahmen`, `bodenY`, `begehbarkeit: pflicht`, `luftraum` nach Bedarf), Bauplan `model/_<kürzel>.js` mit Modulen als Teillisten, `spec/ground.js` (Gelände in den Masken bis `bodenY − 1` abtragen), `content/modul_*.json`, Test `tools/test/<id>.test.js` (Zellenzahl der Maske, Portal offen, R13 0 Komponenten, R14 0 Lücken, Erreichbarkeit benannter Räume).
2. Aus dem Quartier lösen: Hausakte(n) löschen, OSM-ID(s) aus `projects/<quartier>/project.json` entfernen, `data/stadt/vorrang.json` ergänzen, Quartier neu bauen (`node tools/build.js --project <quartier>`), Quartier-Test weiter grün.
3. Standard „Begehbar und ausgestaltet“ (`BEGEHBARKEIT.md` §1): Türen ≥ 2 × 3 (Portale breiter), Böden je Geschoss, echte Treppenblöcke mit Kopffreiheit 3, Fenster verglast, Licht ≤ 12 Blöcke, Bilder als Farbfelder in der Wandlage, Möbel mit Oberseite ≤ 1 Block hoch oder als `unzugaenglich` deklariert.
4. Nicht anfassen (macht die Integration): `data/stadt/besitz_projekte.json`, Stadtgrund (`projects/stadtgrund/**`, `webapp/data/stadtgrund/**`), `webapp/data/projekte.js`, `20_Stadtmodell_Florenz/STATISTIK.html`, `UEBERGABE_V3.md`, diese Übersicht. Kein `besitz.js`, kein Stadtgrund-Bau, kein Minecraft-Export in den Paketen.
5. Keine Erfindung ohne Beleg (Campanile der Carmine, V5b): Was keine geprüfte Quelle nennt, wird nicht gebaut und im Katalog unter „Abweichungen“ vermerkt.

## 4. Integration (nach den Paketen)
`w6-*` nach `claude/welle6` mergen (Konflikte erwartet nur in `vorrang.json` und `BEGEHBARKEIT.md`) → `node tools/city/besitz.js <neue und geänderte Projekte>` → `node tools/build.js --project stadtgrund` → `node tools/emit/webindex.js` → `node tools/build.js --all --cross --no-emit` (Hintergrund) → Tests → Minecraft-Export in den Build-Ordner → Statistik → Abschnitte 5 und 6 hier, Übergabe → PR nach `main` (Merge nur mit Freigabe des Nutzers).

## 5. Projekte (gemessen, Integration 16.10.2026 abends)

Alle neun Projekte stehen auf `"begehbarkeit": "pflicht"`: R13 0 nicht erreichbare Komponenten, R14 0 Lücken. Der nicht erreichbare Rest der Raumzellen sind deklarierte Dach- und Gewölberäume.

| Projekt | Paket | `bodenY` | Rahmen (ox \| oz; θ) | Zellen | Blöcke | Module | R13 erreichbar | Tests |
|---|---|---:|---|---:|---:|---:|---:|---:|
| `san_frediano_in_cestello` | W6a | 58 | (−2020 \| 706,5; 107,2°) | 5.610 | 60.865 | 6 | 60,3 % | 6 |
| `san_gaetano` | W6a | 64 | (−774 \| 193; 179,04°) | 4.970 | 59.847 | 6 | 65,2 % | 6 |
| `santa_maria_maggiore` | W6a | 63 | (−663,5 \| −45; 0°) | 2.604 | 31.434 | 6 | 57,1 % | 7 |
| `santi_apostoli` | W6a | 59 | (−774 \| 866; 20°) | 1.127 | 10.683 | 5 | 94,5 % | 5 |
| `cappella_pazzi` | W6b | 61 | (873,25 \| 975; 28,4°, wie `santa_croce`) | 26.180 + 1.624 (Maske `kapelle`) | 219.672 | 10 | 80,0 % | 6 |
| `santo_stefano_al_ponte` | W6b | 64 | (−435 \| 974; 23,1°) | 3.460 | 41.111 | 5 | 98,2 % | 6 |
| `san_firenze` | W6c | 62 | (137,5 \| 821; −75,2°) | 9.668 + 2.981 (`kirche`) + 1.947 (`oratorium`) | 188.910 | 12 | 90,6 % | 7 |
| `palazzo_arcivescovile` | W6c | 64 | (−399 \| −54,5; 93,7°) | 7.432 | 98.847 | 7 | 85,4 % | 6 |
| `loggia_del_pesce` | W6c | 64 | (1258,5 \| 358; −2,24°) | 769 | 5.726 | 6 | 100 % | 6 |

Summe der neun Projekte: **717.095 Blöcke**. Aus den Quartieren gelöst (Hausakten gelöscht, Quartiere neu gebaut): `quartier_san_frediano` (2), `quartier_strozzi`, `quartier_san_lorenzo` (2, von W6a und W6c; nach dem Merge erneut gebaut), `quartier_lungarni`, `quartier_tintori` (2), `quartier_costa_san_giorgio`, `quartier_proconsolo` (3), `quartier_sant_ambrogio`. `vorrang.json`: 60 IDs. Besitzraster für 17 Projekte neu (78 s), Stadtgrund neu (20,8 min, OK), Projektindex 76 Einträge. Projektübergreifende Prüfung und Gesamttests: siehe `UEBERGABE_V3.md`, Abschnitt W6.

Neue oder erweiterte Werkzeuge: `tools/wahrzeichen/kirche.js` (W6a, Hilfsfunktionen für Kirchenpläne, additiv); `tools/wahrzeichen/palazzo.js` Option `fenster.aus(c)` (W6c, Fenster je Zelle unterdrücken). Erfahrungen: `BEGEHBARKEIT.md` §18–§20.

Abweichungen vom Plan (§1/§2): San Firenze führt den Palast als Hauptmaske, Kirche und Oratorium als Zusatzmasken (sonst baut `palazzo.js` alles als Palast); bei `cappella_pazzi` ist die Kapelle Zusatzmaske aus demselben Grund. Der Primo Chiostro von Santa Croce ist in OSM kein Polygonloch, sondern freie Fläche des Stadtgrunds und deshalb nicht gebaut (Portale und Kapelle öffnen sich darauf). Santo Stefano: Treppe von Buontalenti (1574), nicht Tacca.

## 6. Offene Punkte
- **Stufe C bei allen Höhen:** Keine der Quellen nennt Gebäudehöhen; alle Höhen sind Proportionsschätzungen. Raumaufteilungen in den Konventen (San Firenze, Santa Croce) dienen der Begehbarkeit.
- **Campanili:** Cestello und San Gaetano Lage und Höhe Stufe C; Santa Maria Maggiore nur Stumpf (Glockenstube 1630 abgetragen, belegt); Santi Apostoli: Turm von Baccio d'Agnolo belegt, aber ohne Lage und Maße, nicht gebaut; Santo Stefano: kein Beleg, nicht gebaut.
- **Nicht gebaut (belegt, aber ohne Lage oder außerhalb des Umrisses):** Konvent von Cestello (Seminario Maggiore bleibt Haus), Kreuzgang hinter Santa Maria Maggiore, Freitreppe vor San Gaetano, Krypta und Kreuzgang von Santo Stefano, Primo Chiostro von Santa Croce (Stadtgrund-Fläche; mögliche Erweiterung: Arkaden als Flächenmaske), Palasttreppe, Serliana und Loggia des Arcivescovile, Sakristei und Orgel von San Filippo Neri, Medaillons und Zuganker der Loggia del Pesce.
- **Fassadenschmuck** (Statuen San Gaetano, Fensterbekrönungen Arcivescovile, Graffiti am Secondo Chiostro) fehlt.
- Loggia del Pesce ist 14 Lagen hoch statt der OSM-Schätzung 10 (Gewölbe und Walmdach brauchen die Höhe).
