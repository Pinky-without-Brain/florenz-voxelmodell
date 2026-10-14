# Pipeline-Vertrag V2 (verbindlich für alle Arbeitspakete)

Dieses Dokument legt Schnittstellen fest. Wer davon abweichen muss, meldet das als Befund, statt es eigenmächtig zu ändern.
Eigentümer: Design (Claude Opus). Kontext: `00_Projektplan_und_Konzept/NEUAUFBAU_PLAN.md`.

## 0. Regeln für alle Agenten
- Node.js 24, CommonJS, `'use strict'`, **keine externen Abhängigkeiten**, kein `package.json`.
- Tests: `node:test` + `node:assert/strict` unter `tools/test/*.test.js`. Ausführen mit **`node --test "tools/test/**/*.test.js"`**.
- Ändere nur die Dateien deines Arbeitspakets. **Nie ändern:** `tools/spec/*`, `tools/ARCHITEKTUR.md`, `_archiv_v1/**`.
- **Keine Maße hartkodieren.** Alle Maße kommen aus `tools/spec/dimensions.js`. Lokale Ableitungen sind nur als benannte Konstanten mit Herleitung im Kommentar erlaubt.
- Das Markenwort des dänischen Klemmbaustein-Herstellers (beginnt mit „L“, endet auf „go“) darf in keiner Datei vorkommen. Muss Code danach suchen, wird das Muster aus Zeichencodes zusammengesetzt.
- Kommentare kurz und auf Deutsch, Bezeichner auf Englisch, nutzersichtbare Texte auf Deutsch.
- Keine git-Befehle, die etwas verändern.
- Abschlussbericht: geänderte Dateien, Befehle mit **wörtlicher** Ausgabe (gekürzt auf das Wesentliche), Abweichungen, offene Fragen. Behaupte nichts ohne Beleg.

## 1. Koordinaten und Konventionen
- Blockzellen sind ganzzahlige `(x, y, z)`. Koordinatenbereich (V3): x und z −4096..4095, y 0..511 (Details in §10). +X zeigt nach Osten (Chor), +Z nach Süden, Y nach oben. Der Ursprung liegt in der Kuppelmitte. Der Fußboden ist Y 64, das Laufniveau Y 65.
- Halbmaße sind **inklusive Zellen**: `half = 44` bedeutet die Zellen −44..+44.
- Achtecke: Apothem `a`, Flächen auf den Achsen. Prädikat `shapes.inOctagon(dx, dz, a)`. Kontinuierliche Achteck-Norm: `rho(x, z) = max(|x|, |z|, (|x| + |z|)/√2)`.
- Nur volle Blöcke. Erlaubte Typen: `tools/spec/palette.js`.
- **Palette (V3):** Ein Typ hat eine Primärrolle (`role`) und optional weitere Rollen (`alsoRoles: [...]`). Exporte: `PALETTE`, `TYPES`, `ROLES` (alle Rollen in Reihenfolge), `rolesOf(type)` und `typesForRole(role)` (Typen mit `role` oder `alsoRoles`, in Palettenreihenfolge). Neue Typen werden nur am Ende angehängt, damit die Modulpaletten des Doms unverändert bleiben. Neue Rollen: `putz_ocker|gelb|rosa|sand|weiss|grau|terrakotta` (gelbe/orange Keramik tragen `putz_ocker`/`putz_terrakotta` als `alsoRoles`), `pietra_forte_rustika`, `pietra_forte_bruch`, `pflaster`, `gelaende_fels`, `holz_sporto`, `fensterladen`, `glas_fenster`, `gruen_rasen|erde|weg|baum|stamm`, `wasser` (`transparent: true`). Die Blockpalette in den Docs listet einen Typ unter seiner Primärrolle und vermerkt `auch: …` für `alsoRoles`. Der Webapp-Renderer zeichnet `water` und alle `*_stained_glass` halbtransparent.

## 2. Bausteine der Pipeline
```
tools/geom/grid.js      VoxelGrid (AP 2.1, fertig)
tools/geom/shapes.js    Grundformen (AP 2.1, fertig)
tools/geom/arches.js    Bögen, Wandansichten mit Öffnungen (AP 2.2)
tools/geom/vaults.js    Kreuzgewölbe, Klostergewölbe, Halbkuppeln (AP 2.2)
tools/geom/patterns.js  Materialfunktionen: Inkrustation, Kosmaten, Fischgrät (AP 2.2)
tools/geom/dome.js      Achteckige Doppelkuppel (AP 2.3)
tools/model/world.js    lädt die Module, baut ein Grid, sammelt die Bauteile (AP 2.4)
tools/model/mN_*.js     ein Modul je Datei (Phase 3)
tools/steps/planner.js  Bauteile → Bauschritte (AP 2.4)
tools/validate/*.js     Regeln R1–R12 (AP 2.4, V3)
tools/emit/data.js      Webapp-Daten (AP 2.5)
tools/emit/drawing.js   Maßzeichnung (fertig)
tools/build.js          Gesamtablauf (AP 2.4)
content/steps_de/modul_N.json   Texte je Bauteil (Phase 3)
```

## 3. Modul-Schnittstelle
Jede Datei `tools/model/mN_<slug>.js` (N = 0..9) exportiert:
```js
module.exports = {
  module: 3,
  build(ctx) {
    const w = ctx.part('vierungspfeiler', { symmetry: { order: 4, cx: 0, cz: 0 } });
    w.fill(ctx.shapes.box(...), 'stone_bricks');
  }
};
```
`ctx` (bereitgestellt von `world.js`):
| Feld | Bedeutung |
|---|---|
| `ctx.dims` | `require('tools/spec/dimensions.js')` |
| `ctx.palette` | `require('tools/spec/palette.js')` |
| `ctx.interfaces` | `require('tools/spec/interfaces.js')` |
| `ctx.shapes`, `ctx.arches`, `ctx.vaults`, `ctx.dome`, `ctx.patterns` | Geometrie-Bibliotheken |
| `ctx.part(id, opts?)` | Registriert ein **Bauteil** und gibt einen Writer zurück (Tag `{module, part: id}`). `id` in snake_case, eindeutig je Modul. Die **Reihenfolge der Registrierung ist die Bau-Reihenfolge**. `opts.symmetry = {order: 4|8, cx, cz}` (optional) aktiviert die Prüfung R8. |
| `ctx.grid.has(x,y,z)` | Nur lesend, **nur** für Prüfungen. Keine Ausweichlogik gegen andere Module. |

Writer-Methoden (aus `grid.js`, ergänzt durch AP 2.4):
- `set(x,y,z,type)` und `fill(cells, material)` werfen bei jeder belegten Zelle (R1).
- `fillUnion(cells, material)` überspringt Zellen, die bereits **demselben Modul** gehören, und wirft bei Zellen eines anderen Moduls. Damit lassen sich überlappende Formen innerhalb eines Moduls vereinigen. Rückgabe: Anzahl neu gesetzter Zellen.

Module werden in der Reihenfolge 0..9 in **ein** Grid gebaut. Was ein Modul nicht belegen darf (Krypta-Hohlraum, Öffnungen für spätere Module), ergibt sich aus `dimensions.js` und `interfaces.js`, nicht aus dem Grid-Zustand.

## 4. Bauschritte (Planner)
- Eingabe: Grid und Bauteil-Liste je Modul in Registrierungsreihenfolge.
- Grenzen: **MAX 2.500** Blöcke je Schritt (hart), Ziel 1.200–2.100, MIN 300 (weich).
- Algorithmus je Bauteil:
  1. Blöcke sortiert nach (y, x, z).
  2. Ist das Bauteil ≤ 2.100, ergibt es einen Schritt.
  3. Sonst `n = ceil(total / 2100)` und Ziel `t = total / n`. Ganze Y-Lagen werden gesammelt, bis die nächste Lage den Schritt über `min(2100, 1.15·t)` brächte. Dann wird geschnitten.
  4. Eine einzelne Lage mit mehr als 2.100 Blöcken wird nach X-Bereichen geteilt, zusammenhängend und aufsteigend.
- Danach folgt ein Zusammenlegen: Aufeinanderfolgende Schritte desselben Moduls mit < 300 Blöcken werden mit dem Nachfolger zusammengelegt, ersatzweise mit dem Vorgänger, sofern die Summe ≤ 2.100 bleibt.
- Schritt-Objekt:
```js
{ module, stepNumber /*1..n je Modul*/, parts: ['id', ...], partIndex /*i*/, partCount /*n*/,
  yRange: [y0, y1], count, title, description, tip, caution, fact,
  cameraHint: { eye: [x,y,z], target: [x,y,z] }, cells /*Array von gepackten Keys*/ }
```
- Titel: Er kommt aus dem Content. Bei `n > 1` wird ` – Teil i/n (Y y0–y1)` angehängt. Bei zusammengelegten Schritten werden die Titel mit ` & ` verbunden.
- Kamera: `target` ist die Mitte der Bounding Box. `d = max(Ausdehnung)·1.2 + 30`, `eye = target + [0.8d, 0.6d, 0.8d]`.

## 5. Content (`content/steps_de/modul_N.json`)
```json
{ "module": 3, "title": "Vierung & Tribunen", "subtitle": "Bautüte 3: …", "icon": "⛪",
  "parts": { "vierungspfeiler": { "title": "…", "description": "…", "tip": "…", "caution": "…", "fact": "…" } } }
```
Fehlender Content ist eine **Warnung** (der Titel wird dann die Bauteil-ID), kein Fehler.

## 6. Webapp-Daten (`emit/data.js`)
- Ausgabe nach `webapp/js/data/v2/module_N.js`, eine Datei je Modul, weiterhin per `<script>` ladbar (file://-fähig):
```js
window.MODULE_DATA_V2 = window.MODULE_DATA_V2 || {};
window.MODULE_DATA_V2[N] = { module, title, subtitle, icon, palette: ['stone_bricks', ...],
  steps: [ { stepNumber, title, description, tip, caution, fact, cameraHint, count, yRange, runs: '<base64>' } ] };
```
- `runs` sind Little-Endian-`Int16`-Quintupel `[x, y, z0, len, typeIndex]`: eine Lauflänge entlang +Z von `z0` bis `z0 + len − 1`, alle mit demselben Typ. Die Läufe sind nach (y, x, z0) sortiert. Die Summe aller `len` ergibt `count`.
- Exportierte Funktion: `emitModuleData({ moduleMeta, steps, grid, outDir }) → { file, bytes }`.
- Der Loader `webapp/js/data/v2-loader.js` dekodiert in das bisherige Format: `window.MODULE_N_DATA = [{ stepNumber, title, …, blocks: [{x, y, z, type}] }]`. Der übrige UI-Code bleibt dadurch unverändert.

## 7. Prüfregeln (Build schlägt bei Fehlern fehl)
| Regel | Prüfung |
|---|---|
| R1 | Konflikte werfen im Grid. Der Build fängt sie ab und meldet sie als Fehler. |
| R2 | Jeder Schritt ≤ 2.500 (Fehler). Schritte < 300 sind eine Warnung. |
| R3 | **Baubarkeit:** Schritte werden global in Reihenfolge Modul 0..9, Schritt 1..n gesetzt. Jeder Block eines Schritts muss über eine Kette von Flächenkontakten innerhalb des Schritts einen Block erreichen, der eine Fläche mit einem bereits gesetzten Block (frühere Schritte) teilt oder **Geländekontakt** hat. Ausgegeben werden die Anzahl verletzender Blöcke und bis zu 5 Beispiele je Schritt. **Geländekontakt** (Funktion `hasGroundContact(x,y,z)` in `tools/validate/ground.js`): (a) `y == LEVELS.foundationBottomY`, oder (b) `y == LEVELS.floorY` und die Zelle `(x, y−1, z)` liegt **nicht** in einem `RESERVED`-Volumen aus `interfaces.js`. Das Gelände reicht also bis Y 63, außer in der ausgehobenen Krypta. |
| R4 | Das Gesamtmodell ist über Flächenkontakte eine einzige, mit dem Gelände verbundene Komponente. |
| R5 | Schnittstellen aus `interfaces.js` (siehe dort), z. B. Auflager-Prüfungen: Jeder Block von Modul B auf Ebene y hat einen Block von Modul A auf y−1. |
| R6 | `LEVELS.foundationBottomY ≤ y ≤ LEVELS.maxY`. |
| R7 | Jeder Typ steht in `palette.js` **und** in `webapp/js/data/block-types.js`. |
| R8 | Bauteile mit `symmetry` sind unter der D4-Untergruppe (order 4: Spiegelungen an X und Z; order 8: volle D4) **inklusive Blocktyp** invariant. |
| R9 | Die von `emit/docs.js` erzeugten Zahlen stimmen mit dem Build überein (ab Phase 6). |
| R10 | Grep auf das Markenwort über `tools/`, `content/`, `webapp/` und alle `*.md`. |
| R12 | **Luftraum** (nur `type: wahrzeichen` mit Maskenfeldern, §10 „Wahrzeichen-Projekte (W0)“): Jede Zelle liegt in der Vereinigung der Projektmasken (Hauptmaske und `masken`; Zellen der Höfe/Löcher zählen als innen) oder ihre Säule hat `dAussen ≤ luftraum` (Vorgabe 0). Fehler je Bauteil mit Anzahl und bis zu 5 Beispielzellen. |

Bericht: Konsolenzusammenfassung und `build/report.json` (Schritte je Modul, Blöcke, min/max Schrittgröße, Verletzungen je Regel). Der Ordner `build/` steht in `.gitignore`.

## 8. Kommandozeile
`node tools/build.js [--modules 0,1,3] [--no-emit] [--strict]`
- Ohne `--modules` werden alle vorhandenen Moduldateien gebaut. Mit `--modules` nur die genannten; dabei werden die Abhängigkeiten, also alle kleineren Modulnummern, mitgebaut, aber nur die genannten emittiert.
- `--strict` macht aus Warnungen Fehler.
- Exit-Code 1 bei jedem Fehler.

## 9. Bekannte Fallstricke (aus den abgenommenen Modulen)
- **Hohlschalen aus Mengendifferenzen** (z. B. `inSphere(r) \ inSphere(r−1)`, Kreis- oder Achteckringe mit Neigung) sind oft nur über Kanten verbunden. R3 verlangt Flächenkontakt. Lösung: `vaults.connectEdges(cells)` auf die Zellmenge anwenden oder einen Abstandsbereich mit Breite ≥ 1,5 verwenden.
- **Kreuzgewölbe:** `vaults.groinVault` (Laibung = max) mit `riseX`/`riseZ` verwenden. Für flache Bögen (Steighöhe < Halbweite) `arches.profileForRise` bzw. `archOpeningRise` nutzen. Die Formel aus A5 gilt nur für Spitzbögen.
- **Bauteil-Reihenfolge:** Was auf etwas aufliegt, kommt danach (Gewölbe nach Wänden, Brüstung nach Boden, Treppenabschnitte je Geschoss). Treppen und Decken mit Löchern stehen ohne Symmetrie-Flag in eigenen Bauteilen.
- **Auflager auf Modul 0:** Bauteile, die über ihren Boden-Footprint hinausragen (Vorsprünge, Gesimse), dürfen auf Y 65 nicht über den Boden von M0 hinausgehen (R5 „auf Boden“). Vorsprünge beginnen deshalb ab Y 66.

## 10. Projekte (V3)
Die Pipeline baut mehrere Projekte, jedes mit eigenem Grid. Der Dom ist das Projekt `duomo` und bleibt bit-identisch (gleiche Blöcke, Schritte, Webapp-Daten und Doku).

**Koordinatenbereich.** x und z −4096..4095, y 0..511. Packung `key = ((x + 4096) * 8192 + (z + 4096)) * 512 + y`, also Schlüssel < 2^35, exakt in Double. **Keine Bit-Operatoren auf Schlüsseln.** Zerlegen mit `unpackKey`, `xOfKey`, `yOfKey`, `zOfKey` aus `tools/geom/grid.js`. Nachbarn: ±1 in y, ±512 in z, ±4194304 in x. Die Webapp (`webapp/`) bleibt in A1 unverändert (Phase B).

**Registry.** `tools/spec/projects.js` exportiert `PROJECTS` (nur Projekte mit Sonderpfaden, heute `duomo` mit `docs: 'legacy-duomo'`). `tools/projects.js` (`loadRegistry`, `getProject`, `loadSpecs`) ergänzt automatisch jeden Ordner `projects/<id>/` mit gültiger `project.json`. Fehlerhafte Ordner werden als Problem gemeldet (`--all` schlägt dann fehl).

**Verzeichniskonvention neuer Projekte.**
```
projects/<id>/project.json        { id, title, type: 'wahrzeichen'|'quartier'|'stadtgrund', ... }  id = Ordnername
projects/<id>/model/mN_*.js       Module wie §3 (N = 0..9)
projects/<id>/content/modul_N.json   Texte wie §5
projects/<id>/spec/interfaces.js  optional (SUPPORTS/OWNERSHIP/RESERVED); Vorgabe: leer
projects/<id>/spec/ground.js      optional (Boden-Provider); Vorgabe: groundTopY = 63
projects/<id>/docs/               erzeugt: BAUANLEITUNG_MODUL_N.md und README.md (Statistik)
webapp/data/<id>/module_N.js      erzeugt: window.PROJECT_DATA_V3[id][N] (Format wie §6)
```
`ctx` der Module enthält zusätzlich `ctx.project` (id, title, type und weitere Felder aus project.json) und `ctx.frame` (`tools/spec/frame.js`). `ctx.interfaces` stammt aus dem Projekt. R10 prüft zusätzlich `projects/`, `data/` (ohne `data/osm/`) und `20_Stadtmodell_Florenz/`; erzeugte Daten unter `webapp/data/` werden übersprungen.

**Boden-Provider (R3, R4, R6).** `ctx.ground` = `{ hasGroundContact(x,y,z), minY, maxY }`, gebaut von `tools/validate/ground.js` (`makeProvider`) aus dem Boden-Modul des Projekts. Das Modul exportiert entweder `hasGroundContact(x,y,z)` (Dom: `tools/spec/ground_duomo.js`, exakt die V2-Logik) oder die Standardschnittstelle `groundTopY(x,z)` (optional `isHollow(x,y,z)` für Aushub, `minY`/`maxY`). Standardregel: Kontakt, wenn `y == groundTopY(x,z) + 1`, oder wenn `y ≤ groundTopY(x,z)` und die Zelle `(x, y−1, z)` im Geländesinne nicht leer ist (nicht ausgehoben; unter y = 0 gilt Fels). Ohne `ground.js`: `groundTopY = 63`. R6 nutzt `minY..maxY` (Vorgabe `LEVELS.foundationBottomY..maxY`). Das echte Gelände liefern später A2/A4.

**Befehle.**
- `node tools/build.js` baut nur `duomo` (wie V2), Bericht `build/report.json` und `build/report_duomo.json`.
- `--project <id>` baut ein Projekt, `--all` alle registrierten nacheinander, je mit eigenem Grid und `build/report_<id>.json`. `--modules` gilt innerhalb des Projekts. Der Bericht enthält `resources` (Dauer, Heap, Spitzen-RSS).
- `--cross` (`tools/validate/x_projects.js`, `checkCrossProject(ids)`) baut jedes Projekt, behält nur ein 2D-Raster (Säule x,z -> min/max y) und baut bei Säulen mit überlappendem y-Bereich beide Projekte erneut, beschränkt auf diese Säulen, für die zellweise Prüfung. Doppelt belegte Zellen sind Fehler (Exit 1); überlappende y-Bereiche ohne Zellkonflikt eine Warnung. `--cross --project a,b` prüft nur diese Projekte; `--cross --all` baut zuerst alle.
- Tests nutzen `main(argv, { root, projectsRoot, entries })` und die Fixtures unter `tools/test/fixtures/projects/`.

### Quartier-Projekte (C1)
Ein Quartier ist ein Projekt mit `project.json` `{ id, title, type: "quartier", generator: "quartier", gebaeude: [IDs] }` (optional `daten`: Ordner mit `gebaeude.json`/`flaechen.json`, relativ zum Projektordner; Vorgabe `data/stadt/`). Es hat **keine** Moduldateien `mN_*.js`; `tools/city/quartier.js` erzeugt Module und Bauteile.
- **Module und Bauteile.** Die Gebäude werden nach `isolato` (aus `gebaeude.json`) gruppiert, die Isolati nach ID sortiert: Modul 0..K−1, Titel „Isolato <id> – <häufigste Straße>“. Jedes Haus ist ein Bauteil mit der Gebäude-ID als Bauteil-ID (`ctx.part('w123…')`), im Modul in aufsteigender ID-Reihenfolge (Zahl, dann Buchstabe: `compareIds`). Modulnummern gehen bis **511** (`MAX_MODULE` in `grid.js`; `--modules` bis 511, `module_N.js`/`BAUANLEITUNG_MODUL_N.md` mit beliebig vielen Ziffern). Grenze: höchstens 4096 Tags (Modul/Bauteil) je Grid, also rund 4000 Häuser je Quartier.
- **Content** entsteht aus der Akte (kein Handtext): Titel = Akte-`name` (sonst Gebäudename) oder „<Typbezeichnung> an <nächste benannte Straße/Platz>“, sonst „Haus <id>“; Beschreibung aus Typ, Epoche, Geschossen, Putzfarbe, Quelle und „geschätzt“ (`sicherheit` < 0,5) bzw. „belegt“.
- **Parzellenregel.** `tools/city/parzellen.js` rastert alle Gebäude des Projekts und ihre direkten Nachbarn (Abstand ≤ 3 Blöcke) aus `gebaeude.json`: Zellmitte = Koordinate, jede Zelle gehört genau einem Gebäude; beanspruchen zwei Grundrisse eine Zelle, gewinnt die kleinere ID. Die Brandwand (1 Block) baut also das Haus mit der kleineren ID; das größere Haus lässt diese Zellen aus und setzt nur dort eine Teilwand, wo es höher oder tiefer gegründet ist als der gebaute kleinere Nachbar. Unbebaute Nachbarn gelten als Außenraum.
- **Sockel.** `bodenY = max groundTopY` über den Grundriss; Bodenplatte (Pflaster) auf `bodenY`, darunter Fundament (Pietra-forte-Bruch) von `groundTopY+1` bis `bodenY−1` auf jeder Grundrisszelle, damit R3 auf Hängen gilt. Wände beginnen bei `bodenY+1`, die Traufe liegt bei `bodenY + Σ Geschosshöhen`. Der Boden-Provider `tools/city/ground_stadt.js` (gecachter `groundTopY` aus `tools/geo/gelaende.js`, `minY 0`, `maxY 511`, `inRaster`) wird vom `spec/ground.js` des Quartiers nur re-exportiert. Gebäude, deren Hüllrechteck das Geländeraster verlässt, werden mit einer Fehlermeldung abgelehnt (LOAD-Fehler, Build schlägt fehl).
- **Generator** `tools/city/haus.js` (`planHaus`, `bauHaus`) und `tools/city/fassade.js` (C2b, `layoutKante`, `zelle`): Wandlage 1 = Grundrisszellen mit einem offenen Nachbarn in der 8er-Nachbarschaft (flächenverbunden, auch bei schrägen Kanten); an Straßenkanten kommt eine zweite Lage hinzu (2 Blöcke). `fassade.js` legt je Straßenkante Achsen (Abstand 5–9, mittig, 2 Blöcke Rand) und Öffnungen in (u, v) fest (Fenster mit Stein- oder Stuckrahmen, Läden, Rund-/Korbbogen, Biforie, Tabernakel, Oculus, Ladenbogen, Portal mit Keilsteinring, Kniefenster, Loggia), dazu Bugnato im Verband mit zurückgesetzten Fugen, Marcapiano und Eckquader; eine Zelle der Lage 1 mit vollständiger Lage 2 dahinter (`hinten`) darf zurückspringen, ohne die Hülle zu öffnen. Vorsprünge (Sohlbänke, Konsolen, Marcapiano) und das Gesims (gestufte Konsolen mit überstehendem Dach) liegen auf freien Zellen vor der Wand (nie auf Parzellen anderer Häuser, einmal je Zelle im Projekt über `kontext.beanspruche`); Dach über dem Chamfer-Abstandsfeld zum Rand (Anstieg 0,4 je Block, höchstens 10 Blöcke) mit Firstkamm, optionalen Kaminen und der Altana, Flachdach als Terrasse mit Brüstung. Rollen → Blocktypen in `tools/city/material.js`; die Fassadenregeln stehen in `20_Stadtmodell_Florenz/HAUSAKTE_SCHEMA.md` §7.
- **Hausakten** liegen unter `projects/<id>/hausakten/<gebaeude-id>.json`. `node tools/city/akten_entwurf.js --project <id>` schreibt fehlende Entwurfs-Akten (`quelle: typologie`, `sicherheit` ≤ 0,4) und überschreibt nie.
- **R11 Hausakten** (`tools/validate/r11_hausakten.js`, nur für Quartiere): Schema (`tools/city/akte.js`), Geschosshöhensumme gegen `hoeheBl` (±2), Akte je Gebäude, Nachbarschaftsregel (angrenzende Häuser unterscheiden sich in mindestens 2 von Putzfarbe, Achsen, Fenstertyp, Gesimsart, EG-Art; Ausnahme gleiches `ensemble`), Vielfalt-Kennzahl je Isolato als Info (`report_<id>.json`, Feld `info`).

### Wahrzeichen-Projekte (W0)
Ein Wahrzeichen ist ein Projekt `type: "wahrzeichen"` mit Moduldateien `projects/<id>/model/mN_*.js`; Geometrie wird mit der Bibliothek `tools/wahrzeichen/` gebaut. `project.json`:
```json
{ "id": "palazzo_vecchio", "title": "Palazzo Vecchio", "type": "wahrzeichen",
  "gebaeude": ["r1461712"],
  "bodenY": 68,
  "rahmen": { "ox": -146.5, "oz": 887.0, "thetaDeg": -79.8 },
  "masken": { "korridor": { "gebaeude": ["w328477211", "r2302811", "w1344547176"], "xMin": -528,
              "abzugProjekte": ["palazzo_vecchio", "loggia_dei_lanzi", "orsanmichele"], "abzugHaupt": true } },
  "luftraum": 3 }
```
- `gebaeude` (Pflicht, nichtleer): OSM-IDs der Hauptmaske. Der Feldname bleibt `gebaeude`, weil `webindex`/City-View damit die LOD-Prismen ausblenden und den „geplant“-Platzhalter unterdrücken; die Gebäude der `masken` zählen dort ebenfalls zum Projekt.
- `bodenY` (Pflicht, Zahl), `rahmen` (Pflicht, `ox`, `oz`, `thetaDeg` als Zahlen). `luftraum` (Zahl ≥ 0, Vorgabe 0): größtes `dAussen` für Zellen außerhalb aller Masken (R12).
- `masken` (optional): Zusatzmasken `{ gebaeude, xMin?, xMax?, abzugHaupt?, abzugProjekte? }`. Abgezogen werden die Hauptmaske (`abzugHaupt`) und die Hauptmasken der genannten Projekte (deren `project.json`-`gebaeude`, solange es sie nicht gibt: ihre Einträge in `data/stadt/vorrang.json`).
- **Welle 2 (W5, 14.10.2026):** Zusatzmasken können statt (oder zusätzlich zu) `gebaeude` auch `flaechen` (OSM-IDs aus `flaechen.json`, z. B. Brücken) haben; dazu `zMin`/`zMax`, `abzugAlle` (von `abzugProjekte` wird die Gesamtmaske samt Zusatzmasken abgezogen, nicht nur die Hauptgebäude) und `gelaendeBis` (`boden` = Stadtgrund baut höchstens bis `bodenY − 1`, `frei` = bis `groundTopY`; Vorgabe `boden` für die Hauptmaske, `frei` für Zusatzmasken, Projektfeld `gelaendeBis` für die Hauptmaske). `hauptGrenzen: { xMin, xMax, zMin, zMax, abzugProjekte, abzugAlle }` beschneidet die Hauptmaske. `ladeMasken` liefert zusätzlich `gelaendeBis` je Maske. Aussparungen des Stadtgrunds (Brückenpfeiler) stehen in `data/stadt/aussparung.json` (`ladeAussparung()` in `projekt.js`). Der Minecraft-Export behandelt Vorrang-IDs nur als belegt, wenn ihr Projekt gebaut ist (sonst Platzhalter-Haus).
- `daten` (optional, relativ zum Projektordner): Ordner mit `gebaeude.json` statt `data/stadt/` (Tests). `ohneMaske: true` schaltet die Pflichtfelder und R12 ab (nur einfache Test-Wahrzeichen).
- Die Registry (`tools/projects.js`) meldet fehlende oder falsche Felder als Problem (`pruefeFelder` in `tools/wahrzeichen/projekt.js`).

**Bibliothek** `require('<repo>/tools/wahrzeichen')` (`index.js` bündelt alles):
- `rahmen.js`: `makeRahmen({ ox, oz, thetaDeg })` -> `{ toWorld(u, w) -> {x, z}, toLocal(x, z) -> {u, w}, cos, sin }` mit `x = ox + u·cosθ − w·sinθ`, `z = oz + u·sinθ + w·cosθ` (Rückabbildung wie in den Katalogen).
- `maske.js`: `Maske` über ganzzahlige Zellen (Schlüssel `poly.ck`). `Maske.ausGebaeude(ids, { daten?, xMin?, xMax?, abzug?: Maske[] })` (Außenring minus Löcher, Rand innen; `daten`: Ordner mit `gebaeude.json`, `{gebaeude}` oder Array; Vorgabe `data/stadt`), `Maske.vonZellen([[x, z]])`. Abfragen: `has(x, z)`, `innen(x, z)` (Maske oder Hof), `cells` (sortiert x, dann z), `size`, `bbox`, `union(...)`, `minus(...)`, `dilate(k)`, `erode(k)`, `lokal(rahmen, (u, w, x, z) => bool)`.
  Abstandsfelder (Chebyshev, vorberechnet): `d8(x, z)` (Randzelle = 1, Löcher zählen als innen, 0 außerhalb der Maske), `loecher()` und `dLoch(i, x, z)` (Loch i in Reihenfolge der Polygonlöcher, erste Zelle außerhalb = 1), `dAussen(x, z)` (außerhalb der Maske, 1 = angrenzend, bis 32, danach `Infinity`).
  Kanten: `kanten()` -> `[{ i, a, b, L, rahmen }]` der Außenringe (Index wie `poly.edges`, nullbasiert), `rahmen` mit Ursprung `a`, u entlang a->b, **w nach innen**; bei gegenläufigem Ring (Linkssystem) ist der Rahmen gespiegelt (`rahmenAusBasis`), `toWorld`/`toLocal` gelten unverändert. `naechsteKante(x, z)` -> Index (Gleichstand: kleinster).
- `rollen.js`: `typ(rolle)` (erster Palettentyp, wirft bei unbekannter Rolle), `fresko(farbe)` (`rot, weiss, blau, hellblau, gelb, orange, gruen, braun, schwarz`).
- `boden.js`: Provider von `tools/city/ground_stadt.js` (`groundTopY`, `inRaster`, `minY`, `maxY`) und `fundamentZellen(maske, bodenY)` -> `[[x, y, z]]` von `groundTopY+1` bis `bodenY−1`.
- `projekt.js`: `ladeMasken(projectJson, { dir?, root?, projectsRoot? })` -> `{ id, haupt, masken: {name: Maske}, alle, luftraum, bodenY, rahmen }`; `wahrzeichenVorrang(root)` -> Map OSM-ID -> Projekt-ID aus `data/stadt/vorrang.json`; `pruefeFelder(json)`.
- Moduldateien eines Wahrzeichens laden die Bibliothek mit `require('../../../tools/wahrzeichen')` und die eigene `project.json` über `ladeMasken(JSON.parse(...), { dir })`.

**Wahrzeichen-Vorrang im Quartiergenerator.** `data/stadt/vorrang.json` (`{ quelle, ids: { "<osm-id>": "<projekt>" } }`) listet die Gebäude der Wahrzeichen (Quelle: `20_Stadtmodell_Florenz/wahrzeichen/UEBERSICHT.md` §2). `quartier.js` übergibt die Polygone aller dort gelisteten Gebäude im Nachbarschaftsumkreis (Abstand ≤ 3) an `Parzellen` (`vorrang: [{ id, polygon, projekt }]`). Diese werden zuerst gerastert: Ihre Zellen gehören `"WZ:<projekt>"` (`owner()`, `istVorrang()`, `vorrangZellen()`), kein Haus belegt sie. Für Fassade, Adjazenz und Brandwand zählt die Zelle wie ein gebautes Nachbarhaus mit kleinerer ID (keine Fenster dorthin, kein Gesims darauf; `Kontext.beanspruche` vergibt sie nie). Steht eine Vorrang-ID in `gebaeude` eines Quartiers, ist das ein LOAD-Fehler. Ein Datenordner (`daten`) ohne eigene `vorrang.json` hat keinen Vorrang.

### Datenkorrekturen (C3)
`data/stadt/korrekturen.json` (`{ "hoehen": { "<id>": { "hoeheBl", "quelle", "notiz" } } }`) überschreibt die OSM-Höhe oder Schätzung einzelner Gebäude. `tools/data/gebaeude_build.js` wendet sie nach der Schätzung an (`hoeheQuelle: "korrektur"`, zusätzlich `korrekturQuelle`); unbekannte IDs sind ein Fehler. Danach `node tools/data/build_stadtdaten.js`, `node tools/emit/stadtbasis.js` und die Akten des betroffenen Projekts anpassen (R11: Geschosssumme ±2).

### Minecraft-Export (G1, für Entwickler)
Spezifikation: `20_Stadtmodell_Florenz/MINECRAFT_EXPORT.md`; Anleitung für Nutzer: `20_Stadtmodell_Florenz/MINECRAFT_ANLEITUNG.md`. Code unter `tools/minecraft/`, keine Fremdbibliotheken.
- `nbt_le.js` (Little-Endian-NBT), `crc32c.js`, `leveldb.js` (Reader für Tabellen/MANIFEST/Log, Writer für Tabellen auf Level 3 mit zlib-raw-Blöcken, MANIFEST, CURRENT), `bedrock_chunk.js` (Subchunk v9, Data3D, Schlüssel), `bedrock_bloecke.js` (Palette-Typ -> Bedrock-Name und -Zustände), `leveldat.js` + `level_vorlage.json` (level.dat), `welt.js` (Gelände, Flächen, Platzhalter-Häuser, Projektblöcke je Chunk), `export.js` (Ablauf, Kommandozeile), `lesen.js` (Leser für Tests).
- Befehle: `node tools/minecraft/export.js [--ziel <Weltordner>] [--ohne-platzhalter]` (rund 70 s, Spitzen-RSS rund 1,1 GB). `node tools/build.js` ruft den Export nach erfolgreichem Bau selbst auf, **nur über die Kommandozeile** und **nur wenn `minecraft.local.json` im Repo-Wurzelordner liegt**; `--ohne-minecraft` schaltet ab. Tests (`main()` mit `env`) exportieren nie.
- `minecraft.local.json` (gitignored): `{ "welt": "C:/Users/<nutzer>/AppData/Roaming/Minecraft Bedrock/Users/<id>/games/com.mojang/minecraftWorlds/florenz_voxelmodell" }`. Ohne Datei und ohne `--ziel` geht die Ausgabe nach `build/minecraft/florenz_voxelmodell/`.
- Ablauf: alle Projekte der Registry bauen (nur `buildWorld`, ohne Planer/Prüfung/Emit), Zellen je Chunk bündeln, Gelände (Säulenregel: höchstens bis min(Projekt-y)−1), Flächen aus `flaechen.json` (Pflaster, Wasser mit Kies, Brückendecks auf Uferhöhe), Platzhalter-Häuser (hohl, Putzfarbe per Hash, Dach `dachziegel`, nie auf Projekt- oder Vorrangspalten), dann Chunks in Schlüsselreihenfolge in `db.neu/` schreiben und gegen `db/` tauschen. Spielerdaten (`~local_player`, `player_*`) und eine vorhandene `level.dat` bleiben erhalten.
- Schutz: Ist `db/LOCK` nicht zu öffnen (Minecraft hält sie) oder lässt sich `db/` nicht umbenennen, bricht der Export mit „Welt in Minecraft verlassen und Export erneut starten.“ ab; im Build nur Warnung.
- Tests: `tools/test/minecraft.test.js`. Der Test „Weltkopie lesen“ nutzt eine Kopie einer echten lokalen Welt außerhalb des Repos (Umgebungsvariable `BEDROCK_WELTKOPIE`, sonst übersprungen). Die Minecraft-Welten des Nutzers werden nie beschrieben.
