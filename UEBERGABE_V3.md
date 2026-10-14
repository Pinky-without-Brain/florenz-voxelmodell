# Übergabe V3 – Stadtmodell Florenz (laufendes Protokoll)

**Stand:** 14. Oktober 2026 · **Branch:** `claude/lucid-thompson-gb03b1`
**Zweck:** Eine neue Claude-Instanz soll hier nahtlos weiterarbeiten. Dieses Protokoll wird nach jedem abgeschlossenen Arbeitspaket fortgeschrieben (Abschnitt 4 und 5).
**Vorgänger:** `UEBERGABE_V2.md` (Dom, V2), `20_Stadtmodell_Florenz/STADTMODELL_PLAN.md` (Programmplan V3, Phasen A–G).

---

## 1. Grundregeln (unverändert gültig)
1. Das Markenwort des dänischen Klemmbaustein-Herstellers kommt nirgends vor (R10 bricht ab).
2. Keine Zahl ohne Messung: Kennzahlen stammen aus `node tools/build.js`; generierte Statistikbereiche prüft R9.
3. Maßstab 1:2 (1 Block = 0,5 m), Weltursprung Kuppelmitte, X entlang der Domachse, Z nach Süden (`tools/spec/frame.js`).
4. Standard „Begehbar und ausgestaltet“ (`20_Stadtmodell_Florenz/BEGEHBARKEIT.md`) ist verbindlich für alle Projekte: Türen ≥ 2 × 3, Böden je Geschoss, echte Treppenblöcke, Kopffreiheit 3, Fenster verglast, Licht ≤ 12 Blöcke.
5. Minecraft-Ziel ist die **Bedrock Edition** (`tools/minecraft/`, Phase G1 erledigt).
6. Commits auf dem Branch oben, mit den Attributionszeilen des Systems; keine Modellbezeichnung in Commits/Dateien.

## 2. Befehle
```
node tools/build.js --project <id>            # ein Projekt bauen, prüfen (R1–R14), Webdaten + Doku schreiben
node tools/build.js --project <id> --no-emit  # nur prüfen
node tools/build.js --all --cross --no-emit   # alle Projekte + projektübergreifende Prüfung (~75 s)
node --test "tools/test/**/*.test.js"         # alle Tests (~55 s)
node tools/emit/webindex.js                   # Projektindex der Webapp (webapp/data/projekte.js) nach jedem Projekt-Bau
node tools/diag/begehbarkeit_bestand.js <id>  # Begehbarkeits-Bestandsaufnahme eines Projekts
node tools/city/besitz.js [<id> …]            # Besitzraster des Stadtgrunds neu (alle oder nur diese Projekte; nach Änderungen an der Unterkante!)
node tools/city/quartier_neu.js <id> "<Titel>" <kacheln>  # neues Quartier aus allen freien Gebäuden der Kacheln
node tools/city/aktiv.js <kacheln>            # Stadtgrund-Kacheln aktivieren (projects/stadtgrund/project.json)
node tools/build.js --project stadtgrund --modules 113   # genau eine Kachel bauen (unabhängige Module)
```
Hinweis: Nach Modelländerungen meldet `--no-emit` R9-Fehler (Doku veraltet). Ein Lauf **mit** Emit schreibt die Doku neu; Ergebnis dann OK. Ohne `minecraft.local.json` wird keine Minecraft-Welt geschrieben (`--ohne-minecraft` erzwingt das).

## 3. Projektstand (gemessen)

| Projekt | Typ | Blöcke | Begehbarkeit | Stand |
|---|---|---:|---|---|
| `duomo` | Wahrzeichen (Dom, Campanile, Baptisterium) | 908.560 | **pflicht**, 0 Komponenten, R14 0 Lücken | B5 erledigt (14.10.) |
| `domplatz_ring` | Quartier (202 Häuser) | 2.370.822 | **pflicht**, 98,7 %, 0 Komponenten | B4 erledigt (14.10.) |
| `uffizi` | Wahrzeichen | 736.705 | pflicht | B1 erledigt |
| `palazzo_vecchio` | Wahrzeichen | 567.730 | pflicht | B2 erledigt |
| `orsanmichele` | Wahrzeichen | 88.949 | pflicht | B3 erledigt |
| `loggia_dei_lanzi` | Wahrzeichen | 34.034 | pflicht | B3 erledigt |
| `ponte_vecchio` | Wahrzeichen (Brücke, Korridor, Turm) | 169.366 | **pflicht**, 98,4 %, 0 Komponenten, R14 0 | W6 erledigt (14.10.) |
| `palazzo_pitti` | Wahrzeichen (Palast, Corridoio Oltrarno) | 1.381.031 (Module 0–9) | **pflicht**, 94,6 %, 0 Komponenten, R14 0 | W7 erledigt (14.10.) |
| `quartier_signoria` | Quartier (182 Häuser, Isolati der Kacheln 98, 99, 113) | 1.919.119 | **pflicht**, 98,3 %, 0 Komponenten | E1 erledigt (14.10.) |
| `quartier_lungarni` | Quartier (103 Häuser, Kacheln 112, 128, 129) | 983.961 | **pflicht**, 98,9 %, 0 Komponenten | E2 erledigt (14.10.) |
| `quartier_proconsolo` | Quartier (134 Häuser, Kacheln 84, 115) | 1.110.364 | **pflicht**, 99 %, 0 Komponenten | E2 erledigt (14.10.) |
| `quartier_borgo_albizi` | Quartier (111 Häuser, Kacheln 85, 86, 100) | 1.226.015 | **pflicht**, 98,7 % | E3 (14.10.) |
| `quartier_santa_croce` | Quartier (163 Häuser, Kacheln 101, 116) | 1.399.156 | **pflicht**, 98,6 % | E3 (14.10.) |
| `quartier_brunelleschi` | Quartier (79 Häuser, Kachel 55) | 909.321 | **pflicht**, 99,2 % | E3 (14.10.) |
| `quartier_tornabuoni` | Quartier (70 Häuser, Kacheln 97, 111) | 1.028.941 | **pflicht**, 98,4 % | E3 (14.10.) |
| `quartier_santo_spirito` | Quartier (104 Häuser, Kacheln 126, 127) | 921.246 | **pflicht**, 98,2 % | E3 (14.10.) |
| `quartier_san_lorenzo` | Quartier (245 Häuser, Kacheln 38, 52–54, 67, 68) | 2.585.689 | **pflicht**, 99 % | E4 (14.10.) |
| `quartier_pergola` | Quartier (243 Häuser, Kacheln 56, 57, 70–72, 86) | 3.445.911 | **pflicht**, 99,1 % | E4 (14.10.) |
| `quartier_sant_ambrogio` | Quartier (262 Häuser, Kacheln 73, 87–89) | 2.494.509 | **pflicht**, 98,3 % | E4 (14.10.) |
| `quartier_strozzi` | Quartier (257 Häuser, Kacheln 66, 81–84, 96, 98) | 2.967.004 | **pflicht**, 98,7 % | E4 (14.10.) |
| `quartier_ghibellina` | Quartier (288 Häuser, Kacheln 102–104) | 2.181.883 | **pflicht**, 98 % | E4 (14.10.) |
| `quartier_conce` | Quartier (245 Häuser, Kacheln 117–119, 133, 134) | 2.102.284 | **pflicht**, 98,9 % | E4 (14.10.) |
| `quartier_tintori` | Quartier (150 Häuser, Kacheln 130–132, 147–149) | 2.353.284 | **pflicht**, 98,6 % | E4 (14.10.) |
| `stadtgrund` | Stadtgrund (Kacheln, unabhängige Module) | 3.444.340 (54 von 195 Kacheln) | – (keine Innenräume) | S0 + S1 (14.10.) |

Alle 24 Projekte: Build OK, `--cross` 0 Konflikte (276 Paare, 225 s), 422 Tests grün (2 übersprungen). Webdaten 158 MB.

## 4. Sitzungsprotokoll 14.10.2026

### B4 Quartierhäuser begehbar – **erledigt**
- Neu `tools/city/innen.js` (Ebenen, Treppenhaus-Suche mit Präfixsummen und Tiefensuche über die Stufenteilung, Böden, Licht, Möbel, Deklarationen `unzugaenglich`).
- `tools/city/fassade.js`: `hatTuer`, `tuerEinsetzen`, Haustür in jeder Hauptfassade, Sturz über der Tür.
- `tools/city/haus.js`: Türzellen, `tuerDurchbruch`, `eingangsStufen`, `plan.innen`; Rohbau spart Lichter, Eingangsstufen und Dachloch aus.
- `tools/city/quartier.js`: Bauteil `<id>_innen` je Haus, Content-Text dazu; `tools/validate/begehbarkeit_projekt.js` fasst `<id>` und `<id>_innen` zu einer R13-Einheit zusammen.
- `tools/city/material.js`: Rollen `holz`, `licht`, `bett_kissen`, `bett_decke`.
- `projects/domplatz_ring/project.json`: `"begehbarkeit": "pflicht"`.
- Doku: `BEGEHBARKEIT.md` §6. Tests: `tools/test/city_innen.test.js` (7 Tests), angepasst `city_haus`, `city_quartier`, `city_poly`.

### B5 Dom begehbar – **erledigt**
Details: `20_Stadtmodell_Florenz/BEGEHBARKEIT.md` §7. Kurz: alle Portale/Türen offen, Außenstufen, Krypta-Treppe, Campanile-Treppe aus Treppenblöcken, Hohlkerne/Dachräume/Laibungen deklariert, Lecks geschlossen, Licht. **Nutzerentscheidung 14.10.2026: Kuppelaufstieg (Treppen zwischen den Schalen) wird nicht modelliert**, Zwischenraum und Laterne sind als unzugänglich deklariert. Hilfsmodul `tools/model/_luft.js` (Flutfüllung für Deklarationen). R14 geschärft (Außenluft = mit dem Rasterrand verbunden), Bericht mit `aussen`-Beispielzelle. Dom-Maske für R13/R14 = Grundriss aus Modul 0, 4 eingezogen.
Diagnose-Skripte, die sich bewährt haben (nicht im Repo, schnell neu zu schreiben): R13-Komponenten nach Bauteil gruppieren über `laufe(ctx,'r13')` aus `tools/validate/begehbarkeit_projekt.js`; R14-Cluster mit `laufe(ctx,'r14')` (Felder `beispiel`, `aussen`).

### W5 Infrastruktur Welle 2 – **erledigt**
`tools/wahrzeichen/maske.js` (`Maske.ausFlaechen`, `ladeFlaechen`, `zMin/zMax`), `tools/wahrzeichen/projekt.js` (`flaechen`, `abzugAlle`, `gelaendeBis`, `hauptGrenzen`, `ladeAussparung`), `data/stadt/vorrang.json` (+11 IDs Welle 2), `data/stadt/aussparung.json` (Pfeiler Ponte Vecchio, 852 Spalten), Minecraft-Export: Vorrang nur für gebaute Projekte. Test `tools/test/wahrzeichen_w2.test.js`: Ponte-Vecchio-Masken ergeben genau 10.844 Zellen ohne Überlappung mit den Uffizien. Für `project.json` des Ponte Vecchio zusätzlich `"hauptGrenzen": { "xMax": -529 }` setzen (sonst zählen 97 Ladenzellen der Uffizien mit).

### W6 Ponte Vecchio – **erledigt**
Projekt `projects/ponte_vecchio/` (Katalog `20_Stadtmodell_Florenz/wahrzeichen/ponte_vecchio/BAUTEIL_KATALOG.md`), 9 Module: 0 Gründung/Pfeiler, 1 Brücke (Bögen, Fahrbahn), 2/3 Läden Ost/West (gemeinsam `model/_laeden.js`), 4 Corridoio Vasariano, 5 Torre dei Mannelli, 6 Dächer, 7 Cellini-Brunnen, 8 Innenräume. Gemeinsame Geometrie in `model/_pv.js` (Zonen E/W/T/K/B/L, Abstandsfelder dE/dW/dT/dK, Belegungsregister `belegung(ctx)`: zuerst gebaut gewinnt, reservierte Luft bleibt frei). Begehbarkeit „pflicht“: R13 98,4 %, 0 Komponenten, R14 0. Details `BEGEHBARKEIT.md` §8. Test `tools/test/ponte_vecchio.test.js`.
Lehren für gedrehte Rahmen: Wände ≥ 2 dick; Türen mit 4er-Durchbruch; Korridorumrisse aus OSM können zu schmal sein (Anbau auf Nachbarzellen). Diagnose: Draufsicht-Schnitt je y (Skript schnell geschrieben: `world.grid.get(x,y,z)` über x/z-Bereich, Zonen aus `G.zelle(x,z)`), Komponenten des Gangs in 2D zählen.

### S0 + S1 Teil 1 Stadtgrund – **erledigt**
Pipeline für unabhängige Module (`"unabhaengig": true`: je Modul eigenes Grid, Prüfung, Emit; `--modules` baut genau die genannten; Cross und Minecraft-Export modulweise), Generator-Schnittstelle in `tools/model/world.js` (`quartier`, `stadtgrund`), Besitzraster `tools/city/besitz.js` → `data/stadt/besitz_projekte.json`, Generator `tools/city/stadtgrund.js` (Säulenregel, Flächenklassen, Arno mit Wasserspiegel, Böschung/Mantel, Uferband, Glättung an Wahrzeichen, Platzmuster, Randband), Projekt `projects/stadtgrund` mit 7 aktiven Kacheln (69, 98, 112, 113, 114, 127, 128). Doku: ARCHITEKTUR §10 „Stadtgrund und unabhängige Module“, Spezifikation §16 (Umsetzungsstand und Abweichungen). Test `tools/test/stadtgrund.test.js`.
**Wichtig:** Ändert sich die Unterkante eines Projekts, `node tools/city/besitz.js` laufen lassen und den Stadtgrund neu bauen.

### S1 Teil 2 Stadtgrund – **erledigt**
Gefällebegrenzung und Treppenblöcke (§8a), Ufer-Brüstung, Stadt- und Gartenmauern, Neptunbrunnen (Kachel 114) und Reiterstandbild (Kachel **99**, Berichtigung der Spezifikation). `aktiv` jetzt alle 21 Kacheln, die ein gebautes Projekt berühren (52–55, 67–70, 82–85, 98, 99, 112–115, 127–129), dazu Kachel 99 (Reiterstandbild).

### W7a Palazzo Pitti (Module 0–7) – **erledigt**
Projekt `projects/palazzo_pitti/` nach `20_Stadtmodell_Florenz/wahrzeichen/palazzo_pitti/BAUTEIL_KATALOG.md`: Fundament/Platte, Hauptfassade (21 Achsen, Portal), Flügel mit Arkaden, Ammannati-Hof und Lichthöfe, Seiten und Nebenbau, Dächer, Decken, Raumteilung/Treppen/Licht. Gemeinsame Geometrie `model/_pi.js` (Zonen F/W/H mit eigenem Abstandsfeld, Fenster je Kantenrahmen, Rustika-Fugen, `bauplan` mit Stützpass), Raumplan `model/_raum.js`. Eigener Boden-Provider `spec/ground.js` (Aushub). Neue Öffnungsart `relief` (Rustika-Fugen) in `tools/model/world.js`. Details `BEGEHBARKEIT.md` §9. Besitzraster neu erzeugt (8 Projekte).

### W7b Palazzo Pitti, Modul 9 (Corridoio Oltrarno) – **erledigt**
`model/m9_korridor.js`: Gangboden nach Wegabstand vom Schnitt z = 1312 (Y 78, wie Ponte Vecchio) bis zum Ostflügel (Y 83), höchstens +1 je 40 Zellen, Höhenwechsel als Treppenblöcke; Wände 2 dick über das Abstandsfeld Korridor ∪ Palast (die Flügelwand ist die Gangwand, das Korridortor öffnet direkt in den Gang); Gangdurchbruch an diagonalen Engstellen; Unterbau massiv außer über Straßen (Luft als `arkade` deklariert); Schnitt zum Ponte Vecchio als `tor`. Stadtgrund-Kachel 127 danach neu gebaut (Besitzraster).

### W7c Palazzo Pitti, Modul 8 (Innenräume) – **erledigt**
Ausstattung als Reservierungen im Raumplan (`_raum.js`: `RESERVIERT`, `ausstattung(x, y, z)`): Wandfelder (Gold/Fresko) auf der Raumseite der Spinnwand und an den Appartamenti-Wänden, Schachböden, Deckenfresken, Wappen über dem Portal (Lage 19..21, über der Archivolte); die Rohbaumodule 0, 1, 6, 7 lassen diese Zellen aus, Modul 8 setzt sie. Dazu Möbel (Throne in Sala di Giove und Sala del Trono, Bänke, vier Pfeilerpaare im Vestibül). Je Raum ein Bauteil mit Content (Sala Bianca, fünf Planetensäle, Sala della Stufa, hintere Galerieräume, Galleria d'arte moderna, Vestibül, Appartamenti Reali, Wappen).

### E1 Quartier Signoria – **erledigt**
`projects/quartier_signoria/`: alle Isolati mit Schwerpunkt in den Kacheln 98, 99, 113 ohne Wahrzeichen- und Domplatz-Ring-Gebäude (182 Häuser; Badia Fiorentina und Mercato Nuovo herausgenommen, sie sind geplante Wahrzeichen). Akten per `node tools/city/akten_entwurf.js --project quartier_signoria` (Typologie). `tools/city/innen.js`: Innenbereiche ohne Haustür (Grundriss zerfällt an einer Engstelle) werden als unzugänglich deklariert. Danach Besitzraster und Stadtgrund neu.
**Rezept für weitere Quartiere** (seit E2 als Werkzeug `node tools/city/quartier_neu.js <id> "<Titel>" <kacheln>`): Isolati wählen (ohne `vorrang.json`-IDs, ohne Gebäude anderer Quartiere, ohne Gebäude geplanter Wahrzeichen aus `loadLandmarks()` in `tools/emit/stadtbasis.js`), `project.json` mit `generator: "quartier"`, `begehbarkeit: "pflicht"`, Akten entwerfen, bauen, `node tools/city/besitz.js`, Stadtgrund neu bauen, `--all --cross`, `node tools/emit/webindex.js`.

### E2 Quartiere Lungarni und Proconsolo – **erledigt**
Mit dem neuen Werkzeug `tools/city/quartier_neu.js` (Rezept aus E1): `quartier_lungarni` (Kacheln 112, 128, 129; 103 Häuser) und `quartier_proconsolo` (84, 115; 134 Häuser), Akten aus Typologie, Begehbarkeit pflicht. Besitzraster (11 Projekte) und Stadtgrund neu.

### B6 Webapp: Stadtansicht lädt Module nach Nähe – **erledigt**
`tools/emit/webindex.js` schreibt je Modul die Grundriss-Grenzen `b: [x0, z0, x1, z1]`; `ProjectLoader.fillWorldModules(world, id, [n])` füllt einzelne Module; `city-view.js` legt Voxelprojekte nur an und lädt in `ladeNahe()` die Module im Umkreis `showDist + ladeRand` (200) der Kamera nach (höchstens 2 gleichzeitig, nächste zuerst; Chunks an Modulgrenzen werden neu vermascht). Gemessen (Chromium/Swiftshader): Start 2,3 Mio statt ≈ 13 Mio Blöcke, nach Flug zum Pitti 5,4 Mio, keine Seitenfehler. **Offen:** ferne Module wieder entladen (Speicher wächst beim Herumfliegen).
Die Bauanleitungs-Ansicht zeigt die Dom-Kulisse (Hügel, Zypressen, Arno-Fläche) nur noch beim Dom (vorher lagen Uffizien, Ponte Vecchio und Stadtgrund teilweise darunter).

### E3 Fünf weitere Quartiere – **erledigt**
Borgo degli Albizi, Santa Croce, Brunelleschi, Tornabuoni, Santo Spirito (`tools/city/quartier_neu.js`), alle 0 unerreichbare Komponenten. Stadtgrund um die Kacheln 86, 97, 100, 101, 111, 116, 126 erweitert (28 Kacheln). Besitzraster: 16 Projekte. **Planer** (`tools/steps/planner.js`): Zellen ohne Halt rücken mit Bodenprovider in das nächste Stück desselben Bauteils (ARCHITEKTUR §4 Punkt 5; behob ein Gesims an einem großen Haus). 422 Tests grün. Der `--all --cross`-Lauf dauert jetzt deutlich über 10 Minuten (im Hintergrund starten).

### Querschnitt 14.10. abends: Cross-Fix, Speicher, GitHub Pages, Minecraft – **erledigt**
- **Cross-Konflikte zwischen Quartieren (29 Zellen) behoben:** Gesimse/Vorsprünge benachbarter Quartiere lagen in denselben Straßenzellen. `Kontext.beanspruche(x, y, z, id)`: steht im Umkreis 3 ein Gebäude eines *anderen* Projekts mit kleinerer ID, gehört die Zelle diesem; Parzellenraster mit Nachbarn bis 7 Blöcke (`NEIGHBOUR_MARGIN`). Alle 9 Quartiere neu gebaut, `--cross`: **17 Projekte, 0 Konflikte**.
- **Speicher:** Generator-Caches werden nach jedem Projekt in `--all` und `--cross` freigegeben (`vergissGenerator`). `--all --cross` in einem Prozess braucht trotzdem viel; besser getrennt laufen lassen (`--all --no-emit`, dann `--cross --no-emit`, jeweils im Hintergrund).
- **GitHub Pages:** `.github/workflows/pages.yml` veröffentlicht bei jedem Push (main und Arbeitszweig) die Webapp und die Minecraft-Welt als `florenz_voxelmodell.mcworld` (Download-Seite `webapp/minecraft.html`, `stand.json` mit Commit/Zeit/Größe). **Aktiv seit 14.10.2026** (Repo öffentlich, Source „GitHub Actions“): https://pinky-without-brain.github.io/florenz-voxelmodell/ und `…/minecraft.html` (Welt 40 MB, Bau im Runner 163 s). Veröffentlicht wird nur von `main` (Pushes auf den Arbeitszweig bauen, das Deploy lehnt das Environment `github-pages` ab, solange der Zweig dort nicht freigegeben ist) – neuer Stand online nach Merge nach `main` bzw. `run_workflow` auf `main`.
- **Minecraft:** In der Cloud gibt es kein `minecraft.local.json`, der Build-Hook exportiert dort nichts (deshalb war die Welt des Nutzers nicht aktuell). Export direkt: `node --max-old-space-size=8000 tools/minecraft/export.js --ziel build/minecraft/florenz_voxelmodell` – gemessen 280 s, Spitzen-RSS 5,7 GB, 40 MB, 17,5 Mio Projektblöcke. **Regel:** nach jedem Projekt pushen (Pages baut die Welt) bzw. lokal mit `minecraft.local.json` bauen.

### E4 Häuserzeilen Welle 1: sieben Quartiere im Zentrum – **erledigt**
Nutzerwunsch: erst alle leeren Häuserzeilen, danach weitere Wahrzeichen. Vorher 5.918 freie Gebäude in 166 Kacheln.
- `quartier_neu.js` nimmt jetzt **jedes freie Gebäude** der Kacheln (vorher wurden ganze Isolati übersprungen, sobald eines ihrer Gebäude einem anderen Projekt oder einem Wahrzeichen gehörte); ein Isolat kann auf mehrere Projekte verteilt sein (Parzellen sind projektübergreifend dieselben, Überstände regelt `Kontext.beanspruche`).
- Neu: San Lorenzo, Pergola, Sant'Ambrogio, Strozzi, Ghibellina, Conce, Tintori (1.690 Häuser, alle 0 unerreichbare Komponenten, Bau je 43–89 s). Stadtgrund auf 54 Kacheln (`tools/city/aktiv.js`).
- `besitz.js` brach bei den großen Quartieren still ab (Heap) – die Datei blieb alt und `--cross` meldete 18.731 Konflikte Quartier/Stadtgrund-Böschung. Jetzt: Quartiere modulweise, Generator-Cache je Projekt freigeben, **inkrementell** `node tools/city/besitz.js <id> …` (7 Projekte 99 s). Danach 0 Konflikte.
- Minecraft-Export (`welt.js`): Generator-Cache nach jedem Projekt freigeben – gemessen 366 s, **Heap 558 MB** (vorher 4,9 GB), 37,3 Mio Projektblöcke, Welt 43,6 MB.
- **Rezept je Welle:** `quartier_neu.js` → `akten_entwurf.js --project <id>` → `build.js --project <id>` → `aktiv.js <kacheln>` → `besitz.js <neue ids>` → `build.js --project stadtgrund` → `webindex.js` → `build.js --cross --no-emit` (Hintergrund) → Tests → Übergabe → Commit/Push. Restliche freie Gebäude je Kachel: `node tools/city/frei_kacheln.js`.

## 5. Nächste Schritte (Priorität)
1. ~~Welle 2 Infrastruktur~~ (W5), ~~Ponte Vecchio~~ (W6), ~~Stadtgrund S0 + S1 Teil 1~~.
2. **Quartiere (Phase E)** mit `tools/city/quartier_neu.js`; erledigt: Kacheln 52–55/67–70/82–85 teilweise (Domplatz-Ring), 98, 99, 113 (Signoria), 112, 128, 129 (Lungarni), 84, 115 (Proconsolo). Vor jeder neuen Kachel `aktiv` des Stadtgrunds prüfen (Quartier und Stadtgrund gemeinsam). **Achtung Größe:** Webdaten 45 MB, die Stadtansicht lädt alle gebauten Projekte als Voxel (≈ 13 Mio Blöcke) – Laden nach Nähe ist umgesetzt (B6), Entladen ferner Module steht noch aus.
3. **Stadtgrund Kern:** `aktiv` in `projects/stadtgrund/project.json` schrittweise auf den Kern erweitern (Stand: 21 Kacheln um die gebauten Projekte, 1,24 Mio Blöcke, Webdaten 3,2 MB; Achtung: die Stadtansicht der Webapp lädt alle gebauten Projekte als Voxel, derzeit ≈ 6 Mio Blöcke) (131 Kacheln mit ≥ 30 % Gebäuden; Liste messen: Gebäudeanteil je Kachel aus `gebaeude.json`), je Erweiterung Build + `--cross`; Laufzeit ≈ 1 s je Kachel, Webdaten ≈ 170 KB je Kachel (Repo-Größe beachten). Danach Rand (S2).
4. ~~Palazzo Pitti~~ (W7 erledigt). Offen als Kleinigkeit: Bilderfelder im Corridoio Oltrarno (Katalog §10 Teil 6), Grotta del Buontalenti (Welle 3).
5. ~~Statistikseite~~ `20_Stadtmodell_Florenz/STATISTIK.html` am 14.10. neu gemessen (handgepflegt; Zahlen aus Builds, Treppen/Lampen per Grid-Zählung). Minecraft-Abschnitt noch Stand 13.10. (kein `minecraft.local.json` in der Cloud-Umgebung).

## 6. Bekannte Punkte
- 6 Quartierhäuser (schmal/schräg, Innenbreite < 4) ohne Obergeschossböden (siehe BEGEHBARKEIT §6).
- Dom: Kuppelaufstieg bewusst weggelassen (Nutzerwunsch). Baptisterium hat im Modell keine Emporen (ein hoher Raum).
- `UEBERGABE_V2.md` nennt noch 909.019 Dom-Blöcke (historischer Stand V2).
- Quartiere: R14 (Dichtheit) wird für Häuser nicht geprüft.
- Ponte Vecchio: Modul 7 (Cellini-Brunnen) hat nur 127 Blöcke (R2-Warnung, ein Schritt).
- Inhalte der Hausakten sind überwiegend typologisch (`quelle: typologie`); Bildindex A5 steht aus.
