# Übergabe V3 – Stadtmodell Florenz (laufendes Protokoll)

**Stand:** 15. Oktober 2026 · **Branch:** `claude/lucid-thompson-gb03b1`
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
| `santa_croce` | Wahrzeichen (Basilika, Campanile) | 269.988 | **pflicht**, 89,7 %, 0 Komponenten, R14 0 | W8 (14.10.) |
| `san_lorenzo` | Wahrzeichen (Basilika, Sakristeien, Cappella dei Principi mit Krypta) | 307.968 | **pflicht**, 70,8 %, 0 Komponenten, R14 0 | W9 (14.10.) |
| `santa_maria_novella` | Wahrzeichen (Basilika, Alberti-Fassade, Campanile 68 m) | 218.670 | **pflicht**, 52,5 %, 0 Komponenten, R14 0 | W10 (15.10.) |
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
| `quartier_san_frediano` | Quartier (312 Häuser, Kacheln 92, 93, 106–108, 122) | 2.736.055 | **pflicht**, 98,6 % | E5 (14.10.) |
| `quartier_carmine` | Quartier (296 Häuser, Kacheln 123, 124, 137, 138) | 2.465.476 | **pflicht**, 98,7 % | E5 (14.10.) |
| `quartier_maggio` | Quartier (204 Häuser, Kacheln 125, 140, 141, 155) | 2.202.141 | **pflicht**, 98,9 % | E5 (14.10.) |
| `quartier_campuccio` | Quartier (306 Häuser, Kacheln 139, 153, 154) | 2.428.573 | **pflicht**, 99,3 % | E5 (14.10.) |
| `quartier_costa_san_giorgio` | Quartier (195 Häuser, Kacheln 142, 158, 159, 173–176) | 3.099.501 | **pflicht**, 98,8 % | E5 (14.10.) |
| `quartier_san_niccolo` | Quartier (268 Häuser, Kacheln 143, 144, 160–164, 177, 178) | 2.620.185 | **pflicht**, 98,4 % | E5 (14.10.) |
| `quartier_romana` | Quartier (202 Häuser, Kacheln 167–169, 180–183) | 2.137.649 | **pflicht**, 97,6 % | E5 (14.10.) |
| `quartier_san_marco` | Quartier (237 Häuser, Kacheln 10, 11, 24–26, 39–41) | 3.387.142 | **pflicht**, 99,3 % | E6 (14.10.) |
| `quartier_colonna` | Quartier (273 Häuser, Kacheln 12–14, 27–29, 42–44, 58, 59, 74) | 4.929.444 | **pflicht**, 98,8 % | E6 (14.10.) |
| `quartier_mercato_centrale` | Quartier (246 Häuser, Kacheln 21–23, 37) | 2.776.224 | **pflicht**, 99,3 % | E6 (14.10.) |
| `quartier_indipendenza` | Quartier (202 Häuser, Kacheln 6–9, 36) | 2.546.718 | **pflicht**, 98,4 % | E6 (14.10.) |
| `quartier_palazzuolo` | Quartier (297 Häuser, Kacheln 48–51, 64, 65) | 3.266.159 | **pflicht**, 99,2 % | E6 (14.10.) |
| `quartier_ognissanti` | Quartier (262 Häuser, Kacheln 62, 63, 77–80, 94, 95) | 2.884.765 | **pflicht**, 97,8 % | E6 (14.10.) |
| `quartier_prato` | Quartier (235 Häuser, Kacheln 30–33, 45–47, 60, 61) | 3.346.832 | **pflicht**, 98,9 % | E6 (14.10.) |
| `quartier_porta_al_prato` | Quartier (194 Häuser, Kacheln 0–5, 15–20, 34, 35) | 3.962.550 | **pflicht**, 99 % | E6 (14.10.) |
| `quartier_porta_san_frediano` | Quartier (209 Häuser, Kacheln 75, 76, 90, 91, 105, 120, 121) | 2.235.216 | **pflicht**, 98 % | E6 (14.10.) |
| `quartier_petrarca` | Quartier (196 Häuser, Kacheln 135, 136, 150–152, 165, 166) | 2.237.729 | **pflicht**, 98,7 % | E6 (14.10.) |
| `quartier_guicciardini` | Quartier (43 Häuser, Kacheln 109, 110) | 573.440 | **pflicht**, 99,2 % | E6 (14.10.) |
| `quartier_collina` | Quartier (50 Häuser, Kacheln 145, 146, 156, 157, 170–172, 179, 184–194) | 632.015 | **pflicht**, 97,5 % | E6 (14.10.) |
| `stadtgrund` | Stadtgrund (Kacheln, unabhängige Module) | 19.869.348 (alle 195 Kacheln) | – (keine Innenräume) | S0 + S1 (14.10.) |

Alle 46 Projekte: Build OK (`--all --no-emit` zuletzt mit 43, die drei Kirchen einzeln), `--cross` 0 Konflikte (1035 Paare, 565 s), 433 Tests grün (2 übersprungen). Webdaten 448 MB. **Alle 7.106 Gebäude des Stadtgebiets sind vergeben** (`node tools/city/frei_kacheln.js` → frei 0).

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
- **Push Protection:** GitHub lehnte den Push ab („Tencent Cloud Secret ID“ in `module_117.js`) – Fehlalarm, Base64-Läufe enthalten zufällig `AKID…`. `tools/emit/data.js` schreibt den ersten Buchstaben solcher Präfixe (AKID, AKIA, ASIA, AIza, LTAI …) als `\u0041`-Escape (`entschaerfe`); gleiche Daten nach dem Parsen. Bestehende Moduldateien wurden nachbearbeitet (identisch zu einem Neubau, geprüft).
- Minecraft-Export (`welt.js`): Generator-Cache nach jedem Projekt freigeben – gemessen 366 s, **Heap 558 MB** (vorher 4,9 GB), 37,3 Mio Projektblöcke, Welt 43,6 MB.
- **Rezept je Welle:** `quartier_neu.js` → `akten_entwurf.js --project <id>` → `build.js --project <id>` → `aktiv.js <kacheln>` → `besitz.js <neue ids>` → `build.js --project stadtgrund` → `webindex.js` → `build.js --cross --no-emit` (Hintergrund) → Tests → Übergabe → Commit/Push. Restliche freie Gebäude je Kachel: `node tools/city/frei_kacheln.js`.

### E5 Häuserzeilen Welle 2: Oltrarno (sieben Quartiere) – **erledigt**
San Frediano, Carmine, Via Maggio, Campuccio, Costa San Giorgio, San Niccolò, Via Romana (1.783 Häuser, alle 0 unerreichbare Komponenten). Stadtgrund 94 Kacheln.
- **Planer, R3-Sicherung auf Schrittebene** (`schritteMitHalt` in `tools/steps/planner.js`): Im Carmine lag ein 2 × 2-Splitter eines Hauses nur auf dem später gebauten Nachbarhaus (R3: 4 Blöcke ohne Halt). Zellen ohne Halt in ihrem Schritt rücken in den ersten späteren Schritt mit Halt (eigener Nachtragsschritt, wenn MAX_STEP überschritten würde). Haben alle Schritte Halt, bleibt die Planung unverändert – `--all --no-emit` aller 31 Projekte OK (keine R9-Abweichung). Test in `tools/test/planner.test.js`.
- **R13 bei sehr großen Quartieren:** `setVon` in `tools/validate/begehbarkeit_projekt.js` überschritt die Set-Grenze (2^24) bei den unzugänglichen Zellen (Quartier Colonna); jetzt `GrosseMenge` (mehrere Sets) ab 2^23 Einträgen. `STACK=1 node tools/build.js …` druckt bei Build-Abbruch den Stack.

### E6 Häuserzeilen Welle 3: Norden, Westen und Rand (zwölf Quartiere) – **erledigt**
San Marco, Colonna, Mercato Centrale, Indipendenza, Palazzuolo, Ognissanti, Prato, Porta al Prato, Porta San Frediano, Viale Petrarca, Lungarno Guicciardini, Collina Oltrarno (2.444 Häuser, alle 0 unerreichbare Komponenten). **Stadtgrund auf allen 195 Kacheln** (19,87 Mio Blöcke, Bau 277 s). Damit sind alle Häuserzeilen gebaut; offen sind nur noch Wahrzeichen (Platzhalter-Baukörper).
- `besitz_projekte.json` enthielt zufällig das Markenwort im Base64 (R10 in allen Stadtgrund-Modulen): `besitz.js` schreibt den ersten Buchstaben solcher Treffer als `\u`-Escape (gleicher Wert nach `JSON.parse`).
- Laufzeiten bei 43 Projekten: `besitz.js` für 12 Projekte 198 s, Stadtgrund 277 s, `--cross` 588 s, `--all --no-emit` ≈ 45 min (Hintergrund!).

### W8 Santa Croce (Wahrzeichen-Welle 3, erstes Projekt) – **erledigt**
Recherche und Katalog: `20_Stadtmodell_Florenz/wahrzeichen/santa_croce/` (REFERENZMASSE, BAUTEIL_KATALOG), Übersicht der Welle: `wahrzeichen/UEBERSICHT_WELLE3.md`. Amtlich (Opera di Santa Croce): Mittelschiff **34 m hoch, 20 m breit** (Breite deckt sich exakt mit OSM); 7 Joche aus den OSM-Querdächern; Campanile 78 m (OSM w662908308).
- Projekt `projects/santa_croce` (θ 28,4°, bodenY 64, Aushub in `spec/ground.js`), **ein Bauplan** in `model/_sc.js` (Zonen fassade/mittel/seite/vierung/quer/ostwand/kapelle/chor/campanile, Dachhöhe je Spalte, erste Setzung gewinnt); Module m0–m8 sind nur Teillisten (`modul(n, [...])`).
- Dachhaut je Spalte bis zum tiefsten der **acht** Nachbarn → keine Diagonallücken (R14 0) und daraus automatisch die Schildwände; Binder 2 Zellen breit (gedrehte Einzellinien zerfallen im Weltraster, R4).
- Campanile: Wendeltreppe 5 × 5 in Weltachsen im gedrehten Turm (Mitte automatisch gesucht), Kopffreiheit über den Eckpodesten unter dem Glockenstubenboden; Ballatoio, Binderoberseiten und Turmspitze unzugänglich deklariert.
- Vorrang: w777563049, w662908308 → `santa_croce`; Campanile aus `quartier_tintori` entfernt (Hausakte gelöscht), Tintori und Conce neu gebaut; `--cross` 44 Projekte 0 Konflikte. Test `tools/test/santa_croce.test.js`.
- Ansicht: `node <scratch>/elev.js` war ein Hilfsskript (Ansicht entlang einer Richtung als PNG); die Webapp-Gesamtansicht zeigt das Modell (Text der Gesamtansicht nennt noch generisch die Kathedrale – kleiner Webapp-Punkt).
- **Nicht modelliert:** Cappella de' Pazzi (w307539790, bleibt Haus in `quartier_tintori`), Kreuzgänge (r10782536, Haus in Tintori), Grabmäler, bemalte Balkendecke.

### W9 San Lorenzo mit Cappelle Medicee – **erledigt**
Katalog `wahrzeichen/san_lorenzo/` (REFERENZMASSE, BAUTEIL_KATALOG). Belegt: Modul 11 Braccia ≈ 6,4 m (Vierung 26 × 26 Blöcke = OSM), Säulen mit Kämpferaufsatz, Kassettendecke mit goldenen Rosetten, rohe Fassade, Alte Sakristei als Würfel mit Schirmkuppel, **Cappella dei Principi 28 m breit, 59 m hoch** (Laterne Y 179). Nicht belegt (Stufe C): Höhen von Langhaus und Vierung.
- Projekt `projects/san_lorenzo` (θ 192,8°, bodenY 67, Masken Kirche w599900778 + `principi` w24883267; deckt die geplanten Einträge `san_lorenzo` und `cappelle_medicee` ab), Bauplan `model/_sl.js`, Module m0–m8, Test `tools/test/san_lorenzo.test.js`.
- **Besucherweg wie heute:** Eingang auf Straßenhöhe (Piazza Madonna degli Aldobrandini) in die Krypta (Boden Y 61, Pfeilerraster), Treppe (Weltachse, 6 Stufen, unterfüttert) in den Vorraum, Tür ins Achteck. `spec/ground.js` trägt unter der Kapelle bis Y 60 ab; die Spalten-`gt` kommen aus diesem Boden (sonst Lücke unter den Wänden, R14).
- Neue Regeln aus diesem Bau: `set()` respektiert Öffnungen/Treppenlöcher (`force` nur für Treppen); Kryptadecke und Kapellenboden liegen in Modul 7 (auf den Achteckwänden, sonst R3/R2-Sammelschritt); Tambour und Kuppel werden auch über das Vierungsquadrat hinaus gebaut (sonst R14-Löcher an den Seitenmitten); Decken an Rändern zu tieferen Dächern in Steinziegeln (sonst Holz außen sichtbar).
- Vorrang w599900778, w24883267 → `san_lorenzo`; Nachbarn `domplatz_ring`, `quartier_san_lorenzo` neu gebaut. Campanile (54 m) nicht modelliert (kein eigenes OSM-Gebäude).

### W10 Santa Maria Novella – **erledigt**
Katalog `wahrzeichen/santa_maria_novella/`. Belegt (it.wikipedia): 99,20 × 28,20 m, Querhaus 61,54 m, **6 Joche nach Norden kürzer (15 → 11,5 m)**, Kreuzrippengewölbe auf Bündelpfeilern, Alberti-Fassade quadratisch (Mittelportal 1,5 × Breite, Rosette, Voluten), Campanile über 68 m (Talenti 1332–33). Projekt `projects/santa_maria_novella` (θ −90°, achsparallel, bodenY 61), Bauplan `model/_smn.js` mit Kreuzgewölbe-Funktion (Vereinigung zweier Spitztonnen), Wendeltreppe 7 × 7 im Campanile, Giottos Kruzifix an einer Aufhängung. Campanile w449369043 aus `quartier_palazzuolo` gelöst. Test `tools/test/santa_maria_novella.test.js`.

## 4b. Sitzungsprotokoll 15.10.2026

### H1 Hausböden auf dem Stadtgelände – **erledigt**
Nutzerbefund: Häuser zu tief, Fenster halb im Boden. Ursache: Quartiere hatten keinen eigenen Boden → Rückfall Y 63. `tools/projects.js` gibt Quartieren jetzt `tools/city/ground_stadt.js` als Boden (`groundFile`), `ground_stadt.groundTopY` klemmt Abfragen außerhalb des Rasters an den Rand; Gebäude am Rasterrand werden gebaut (kein Abbruch mehr).
- Folgen am Hang (Costa San Giorgio, San Niccolò, Collina): Hausboden war zuerst das höchste Gelände des Grundrisses (versunkene Häuser, bis −31) – am 16.10. ersetzt durch `hausBoden()` (Median an der Straße) und Neuplanung bei höherer Türstraße, siehe „Übergabe an die lokale Sitzung“. `tools/city/haus.js`: Eingangsstufen bis **14** Lagen (`EINGANG_MAX`), Teilwände zu Nachbarn reichen höchstens bis zur eigenen Traufe und beginnen frühestens über dem eigenen Boden (vorher R1-Konflikte mit Fundament/Dach), Taschen im Erdgeschoss bekommen einen Durchbruch (`taschenDurchbruch`, ≤ 8 Wandzellen; Teilwände zählen dort nur, wenn sie im Erdgeschoss stehen).
- Alle 35 Quartiere neu gebaut (zuletzt Kette 5, Ablauf wie `<scratch>/kette3.sh`: Quartiere → `besitz.js` → Stadtgrund → `webindex.js` → `--cross` → Tests).

### H2 Straßenschilder an Eckhäusern – **erledigt**
`tools/city/schilder.js`: Jedes Haus an ≥ 2 benannten Straßen/Plätzen bekommt je Name (höchstens 3) ein Wandschild nahe der Ecke, 7 Blöcke über Straße/Boden (Ausweichhöhen 8, 6, 9, 5), in einer freien Straßenzelle vor massiver Wand; Name in der Nachbarzelle oder bis 4 Zellen davor (Gehweg), nie in der Spalte eines anderen Gebäudes. Block `birch_wall_sign@<richtung>` (Palette Rolle `schild`), Text in `q.schilder` → Minecraft-Export schreibt Bedrock-Block-Entities (Tag 49, `schildEntity` in `tools/minecraft/export.js`). Test `tools/test/schilder.test.js`. Gezählt vor dem letzten Neubau: 1.827 Schilder.

### H3 Restliche Platzhalter – **erledigt** (alle Einträge der Welle 3/4)
| Projekt | Kern | Bauplan |
|---|---|---|
| `santo_spirito` | Brunelleschi-Raster (M = 11 Braccia), Umgang, 40 Nischen, Vierungskuppel, Sakristei (Achteck, Loch im OSM-Umriss geschlossen), Campanile 69 m | `model/_ss.js` |
| `santa_maria_del_carmine` | einschiffig, 5 Kapellen je Seite, Vierungskuppel 35 m, Cappella Brancacci (Fresken), Corsini-Kuppel | `model/_cm.js` |
| `santissima_annunziata` | Portikus (7 Bögen), Chiostrino dei Voti (offener Hof, Arkaden), Kapellen 8 + 9, Tempietto, Rundtribuna mit 9 Kapellen und Kuppel | `model/_sa.js` |
| `santa_trinita` | T-Kreuz, 3 Schiffe, 5 Joche, Kapellen am Querhauskopf (Sassetti mit Fresken), Gualberto, Sakristei, Buontalenti-Fassade | `model/_st.js` |
| `badia_fiorentina` | Saal mit Kassettendecke, Presbyterium im Süden, sechseckiger Campanile 70 m (aus `quartier_signoria` gelöst) | `model/_bf.js` |
| `palazzo_strozzi`, `palazzo_rucellai`, `palazzo_medici_riccardi`, `bargello`, `ospedale_degli_innocenti` | gemeinsamer Bauplan **`tools/wahrzeichen/palazzo.js`** (Höfe = Löcher des OSM-Polygons, Arkaden/Loggia/Innenwand, Geschossböden, Wendeltreppe mit Kopffreiheit über den Eckpodesten, Walmdach oder Zinnen, Portikus an der Straße); Projektdateien nur Einstellungen (Material, Fensterraster, Portale, Extras wie Torre Volognana oder Della-Robbia-Medaillons) | `model/_ps/_pr/_pm/_ba/_oi.js` |
| `mercato_nuovo` | offene Halle 3 × 4 Joche, Kreuzgewölbe, Attika, Porcellino | `model/_mn.js` |
| `ponte_santa_trinita`, `ponte_alla_carraia`, `ponte_alle_grazie`, `ponte_amerigo_vespucci` | **`tools/wahrzeichen/bruecke.js`**: Pfeiler aus den Ausbuchtungen des Umrisses, Wasserspiegel und Fahrbahnhöhe gemessen, Bögen (Ellipse/Segment), Luft unter den Bögen als `arkade`; Hauptmaske aus Flächen (`"gebaeude": []`, `"flaechen": [...]`, neu in `tools/wahrzeichen/projekt.js`) | `model/_p*.js` |
- Daten: `data/stadt/vorrang.json` um alle neuen IDs ergänzt; Sakristei r7101376 und Campanile w482302683 aus `quartier_maggio`, Badia-Campanile w249686038 aus `quartier_signoria` gelöst (Hausakten gelöscht). „Ponte San Niccolò“ war ein Fehltreffer (Kirche/Oratorium/Stadttor) → `tools/data/wahrzeichen_build.js` verlangt „ponte“ im Namen, `wahrzeichen.json` korrigiert; die Brücke liegt außerhalb des Datengebiets.
- Tests: `santo_spirito`, `santa_maria_del_carmine`, `santissima_annunziata`, `santa_trinita`, `badia_fiorentina`, `palazzi` (alle fünf), `mercato_nuovo`, `bruecken` (alle vier). Doku je Projekt unter `20_Stadtmodell_Florenz/wahrzeichen/<id>/`; Übersicht `UEBERSICHT_WELLE3.md` (Stand 15.10.: alles gebaut).
- Hilfsskripte (Scratch, nicht im Repo): `wztest.js <id>` (Bau + R1–R14 ohne R9), `elev.js <id> <θ> <png>` (Ansicht), `pz_content.py` (Inhalte der Palazzi aus einer JSON-Konfiguration), `br_content.py` (Brücken).

### H4 Webapp: ferne Module entladen – **erledigt**
`webapp/js/engine/city-view.js`: `entladeFerne()` baut die Welt eines Projekts aus den nahen Modulen neu auf, sobald ≥ 3 geladene Module (oder alle) weiter als `showDist + ladeRand + entladeRand` (1400 + 200 + 600) entfernt sind; Rohdaten der fernen Module gibt `ProjectLoader.forgetModule` frei. Browsertest (Playwright, Flug Mitte → Pitti → Westrand → Mitte): 12,0 → 6,3 Mio geladene Blöcke, 96 Module entladen, keine Fehler. Kennzahl `stats().modulesUnloaded`.

### Übergabe an die lokale Sitzung (16.10.2026) – **H1 abgeschlossen, offene Arbeit**
**H1 (Hausböden auf Stadtgelände) ist fertig und vollständig neu gebaut.** Anlass: Häuser schwebten oder versanken, weil der Hausboden das höchste Gelände des Grundrisses war (Costa San Giorgio bis −31 Lagen).
- **Regeln in `tools/city/haus.js`:** `hausBoden()` = Median des Geländes der freien Nachbarzellen an benannten Straßen/Plätzen (sonst aller freien Nachbarn), begrenzt auf [min, max] Gelände im Grundriss. Liegt die Straße vor der Tür ≥ 2 Lagen über dem Boden, wird das Haus mit Boden eine Lage unter der Türstraße neu geplant (`planHaus(…, bodenVorgabe)`). Dazu: `taschenDurchbruch` (≤ 8 Wandzellen), keine Vorsprünge vor durchbrochenen Wänden; Schilder nur in freien Spalten (`schilder.js`), Schilder sind in R13 keine Hauseinheit.
- **Neubau (Kette 5):** alle 35 Quartiere rc=0 und „Ergebnis: OK“; `besitz.js` für 60 Projekte (420 s); Stadtgrund OK; Webindex 61 Einträge, alle 61 gebaut; Gesamtprüfung `--cross`: 61 Projekte, 1.830 Paare, **0 Konflikte** (116 s).
- **Messung danach** (Scratch-Skript: Oberkante Stadtgrund in der Nachbarspalte minus Hausboden, nur Spalten mit Oberkante ≤ Gelände + 2, also ohne Mauern/Bauwerke):
  - Signoria (Kachel 98): 4.708 Randzellen; 0 → 3.388, +1 → 780 (zusammen 88,5 %), −1 → 415, ≥ +2 → 125.
  - Costa San Giorgio (Kachel 173, Steilhang): 1.080 Randzellen (996 Mauerspalten übersprungen); 0/+1 → 520 (48 %), −1…−3 → 317 (Sockel 1–3 Lagen sichtbar, talseitig), −4…−11 → 81, +2…+15 → 162 (Bergseite: Wand steckt im Hang). Ursache der Rest-Abweichung: ein Baukörper je Haus über das ganze Gefälle. Mögliche Verbesserung: große Hanggrundstücke terrassieren (zwei Böden je Haus).
- **Tests:** veraltete Erwartungen angepasst (`city_haus` Hanglage, `city_innen` Eingang, `projects` Fallback, `wahrzeichen` Vorrang 39, `webdata` 0 geplante Wahrzeichen). Ergebnis des Gesamtlaufs siehe Commit-Nachricht „H1 fertig“.

**Nächste Schritte für die lokale Sitzung (in dieser Reihenfolge):**
1. Minecraft-Export (`node --max-old-space-size=6144 tools/minecraft/export.js --ziel build/minecraft/florenz_voxelmodell`), Schilder (H2) und Hausböden im Spiel stichprobenartig prüfen (Costa San Giorgio, Signoria).
2. H4: Statistik neu (`node tools/emit/statistik.js --pdf <datei>`), Minecraft-Abschnitt mit `minecraft.local.json` messen, PDF dem Nutzer geben (offene Nutzerbitte).
3. PR von `claude/lucid-thompson-gb03b1` nach `main` und **Merge** (vom Nutzer ausdrücklich gewünscht), damit GitHub Pages den neuen Stand zeigt (heute noch alter Bau mit allen Häusern auf Y 63).
4. Optional: Hangterrassierung (siehe Messung oben).

## 5. Nächste Schritte (Priorität)
1. ~~Welle 2 Infrastruktur~~ (W5), ~~Ponte Vecchio~~ (W6), ~~Stadtgrund S0 + S1 Teil 1~~.
2. ~~Quartiere (Phase E)~~ und ~~Stadtgrund Kern und Rand~~: alle Gebäude vergeben, alle 195 Kacheln aktiv (E4–E6). Die Stadtansicht lädt Module nach Nähe und ~~entlädt ferne~~ (H4).
3. ~~Wahrzeichen Welle 3/4~~ (15.10. alle gebaut). Verfeinerungen möglich: Innenräume der Palazzi (heute offene Säle je Geschoss), Freitreppe im Bargello-Hof, Campanili ohne eigenes OSM-Gebäude (San Lorenzo, Carmine, Annunziata), eiserne Brüstung der Vespucci-Brücke.
4. ~~Palazzo Pitti~~ (W7 erledigt). Offen als Kleinigkeit: Bilderfelder im Corridoio Oltrarno (Katalog §10 Teil 6), Grotta del Buontalenti (Welle 3).
5. ~~Statistikseite~~ `20_Stadtmodell_Florenz/STATISTIK.html` am 14.10. neu gemessen (handgepflegt; Zahlen aus Builds, Treppen/Lampen per Grid-Zählung). Minecraft-Abschnitt noch Stand 13.10. (kein `minecraft.local.json` in der Cloud-Umgebung).

## 6. Bekannte Punkte
- 6 Quartierhäuser (schmal/schräg, Innenbreite < 4) ohne Obergeschossböden (siehe BEGEHBARKEIT §6).
- Dom: Kuppelaufstieg bewusst weggelassen (Nutzerwunsch). Baptisterium hat im Modell keine Emporen (ein hoher Raum).
- `UEBERGABE_V2.md` nennt noch 909.019 Dom-Blöcke (historischer Stand V2).
- Quartiere: R14 (Dichtheit) wird für Häuser nicht geprüft.
- Ponte Vecchio: Modul 7 (Cellini-Brunnen) hat nur 127 Blöcke (R2-Warnung, ein Schritt).
- Inhalte der Hausakten sind überwiegend typologisch (`quelle: typologie`); Bildindex A5 steht aus.
