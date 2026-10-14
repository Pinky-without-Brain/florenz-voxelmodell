# Standard „Begehbar und ausgestaltet“ (ab 13.10.2026, verbindlich für alle Projekte)

Der Nutzer spielt das Modell in Minecraft (Bedrock, Spielfigur 1,8 Blöcke hoch, 0,6 breit, Stufe 1 Block mit Springen bzw. Auto-Sprung). Deshalb müssen alle Gebäude **vollständig begehbar** sein. **Wahrzeichen** bekommen zusätzlich einen **ausgestalteten Innenraum**.

## 1. Begehbarkeit (alle Gebäude: Wahrzeichen, Quartierhäuser, Dom)
1. **Zugang:** Jedes Gebäude hat mindestens eine Tür von der Straße oder vom Platz aus. Eine Tür ist mindestens 2 breit × 3 hoch (lichte Öffnung, Boden = Gehfläche). Auf Plätze und Straßen öffnen nur echte Türen, Tore oder Portale.
2. **Räume:** Jedes Geschoss hat einen geschlossenen Boden. Lichte Raumhöhe ≥ 3 Blöcke. Jeder Raum ist über Türöffnungen (≥ 2 × 3) erreichbar. Es gibt keine eingeschlossenen Lufträume ohne Zugang. Massive Bereiche sind erlaubt, z. B. Mauerkerne, nicht aber leere Kammern ohne Zugang.
3. **Treppen:** Jedes Geschoss ist über Treppen erreichbar, ebenso Dachterrassen, Loggien, Wehrgänge, Türme und Kuppelumgänge.
   - Gebaut wird mit **echten Treppenblöcken** (Wunsch des Nutzers), nicht mit vollen Blöcken als Stufen.
   - Je Lauf steigt jede Stufe um 1 Block pro 1 Block Lauflänge. Breite ≥ 2.
   - Treppenblöcke haben eine **Ausrichtung** (Aufstieg nach Nord, Ost, Süd oder West). Sie werden im Material ihrer Umgebung gebaut, zum Beispiel Steinziegel-, Tuffziegel-, Quarz-, Andesit- oder Schwarzeichenholztreppe.
   - Über jeder Stufe mindestens 3 Blöcke Luft.
   - Formen: gerade Läufe oder Podesttreppen. In engen Türmen eine Wendeltreppe als umlaufende Stufenspirale um einen Kern, mit Podesten (volle Blöcke) an den Ecken.
   - Die Decke darüber hat ein Treppenloch.
   - **Stufen außen** (Portale, Kirchenstufen, Sockel) werden ebenfalls als Treppenblöcke gebaut.
4. **Dichtheit:** Die Außenhülle hat keine Lücken außer gewollten Öffnungen (Tür, Tor, Fenster, Loggia, Arkade, Schießscharte).
   - **Fenster sind mit Glas gefüllt**, außer bei ausdrücklich offenen Loggien und Arkaden.
   - **Dünne Schichten in gedrehten Rahmen** (eine Zelle stark, z. B. Glas oder Brüstung) müssen **flächenverbunden** sein, ohne Diagonallücken. Entweder Dicke ≥ 2 Zellen in Weltkoordinaten oder Lücken mit `vaults.connectEdges` bzw. einem Abstandsband schließen.
   - Prüfung siehe §3.
5. **Licht:** Minecraft-Innenräume sind ohne Lichtquelle dunkel. Jeder Raum mit mehr als 30 Bodenzellen bekommt Lichtquellen der Rolle `licht` (Seelaterne), höchstens 12 Blöcke voneinander entfernt: Leuchter an der Decke, in Wandnischen oder versteckt im Boden unter Teppichmustern.

## 2. Ausgestaltung der Innenräume (Wahrzeichen)
Je Wahrzeichen die **historisch wichtigen Räume** nach Quellen, mit Stufe A/B/C, vereinfacht in vollen Blöcken:

- **Boden:** Muster aus Marmor oder Cotto. Rollen `marmor_*`, `pflaster`, `dachziegel` als Cotto.
- **Wände:** Fresken oder Gemälde als farbige Felder (`fresko`-Farben, mindestens 3 × 2), Bilderrahmen `gold` oder `holz`, Wandpilaster, Sockelzonen.
- **Decken:** Kassetten (`holz`/`gold`) oder Gewölbe mit Bemalung (`fresko`).
- **Ausstattung:**
  - Altäre, Kanzeln und Chorgestühl (`holz`)
  - Tische und Bänke (`holz`)
  - Statuen als vereinfachte Blockfiguren
  - Brunnen, Kamine, Thron oder Podest
  - Vitrinen (Glas über einem Sockel)
- **Museen** (Uffizien, Pitti): Galerieräume mit Bildern in Augenhöhe (Unterkante der Bilder 1 bis 2 Blöcke über der Gehfläche) und Statuen in den Gängen.

Jeder ausgestaltete Raum ist ein eigenes Bauteil mit Content-Text: was er zeigt, Quelle, „vereinfacht“.

## 3. Prüfregeln (neu)
- **R13 Begehbarkeit** für `wahrzeichen` und `quartier`:
  - Flutfüllung über **stehbare Zellen**: Luft an y und y+1 und y+2, fester Block an y−1.
  - Schritte: horizontal 4er-Nachbarschaft; Höhe +1 (nur wenn Kopffreiheit) oder −1 bis −3 (Fallen).
  - Start: alle stehbaren Zellen direkt vor dem Gebäude auf Straßenniveau, also außerhalb der Maske an der Außenkante.
  - Bericht je Projekt: Anteil der erreichbaren stehbaren Innenzellen, nicht erreichbare Räume (Zusammenhangskomponenten ≥ 20 Zellen) mit Lage und Bauteil darunter.
  - **Fehler:** nicht erreichbare Komponente ≥ 20 Zellen, außer sie ist als `unzugaenglich` deklariert (Begründung Pflicht, z. B. Dachboden ohne Bedeutung).
- **R14 Dichtheit** für `wahrzeichen`:
  - Flutfüllung der **Luft** innerhalb der Maske, von außen her, je Geschoss.
  - Die Hülle ist undicht, wenn Außenluft durch eine Zelle der Außenwandbänder eindringt, die kein deklariertes Öffnungsbauteil ist.
  - Öffnungen deklariert das Modul mit `ctx.oeffnung(zellen, art)`, wobei `art` ∈ `tuer`, `tor`, `fenster_offen`, `arkade`, `loggia`, `scharte` ist.
  - Bericht mit Beispielzellen.

## 4. Bestehende Projekte
- **Dom, Domplatz-Ring, Loggia, Orsanmichele, Palazzo Vecchio, Uffizien:** nachrüsten nach §1 und §2.
- **Dom:** Die Regel „bit-identisch“ ist damit aufgehoben. Der Nutzer will das neue Ziel.
- **Häuser (Quartiergenerator):** Haustür, Treppenhaus, Böden je Geschoss, Licht. Einfache Ausstattung: Tische und Betten aus Holz, ein Laden im EG, wenn die Akte `eg.art = laden` hat. **Umgesetzt in B4, siehe §6.**
- Die Bauanleitung bleibt gültig: Innenausbau sind eigene Bauteile und Bauschritte nach dem Rohbau.

## 5. Werkzeuge (B0, seit 13.10.2026)
- **Treppenblöcke in der Palette:** Typname `<basis>@<richtung>[_oben]`, z. B. `stone_brick_stairs@n` (Aufstieg nach Norden = −z; `o` = +x, `s` = +z, `w` = −x; `_oben` = umgedreht). 20 Materialien, Rolle `treppe`. API in `tools/spec/palette.js`: `treppeFuerRolle(rolle)` -> Basisname, `treppe(rolle, richtung, oben?)` -> Typname, `isTreppe(typ)`, `treppeInfo(typ)`. Terrakotta/Dachziegel hat keine Treppe, Ersatz ist `brick_stairs`; für Pietra serena gibt es keine Treppe aus glattem Stein, Ersatz ist `stone_stairs`.
- **Bibliothek** `tools/wahrzeichen/treppe.js`: `geradeTreppe`, `podestTreppe`, `wendeltreppe`, `treppenloch(lauf, kopf = 3)`, `kopffreiheit(bloecke, istFrei)`. Höhenregel: Stufe k steht in Zelle `start.y + k`, der obere Boden ist massiv in Zelle `start.y + n − 1` (Stehzelle `start.y + n`). Breite nach rechts vom Aufstieg aus. In gedrehten Rahmen wird die Richtung auf die nächste Weltachse gerundet (`rahmen`-Option); Treppen laufen achsparallel in Weltkoordinaten.
- **Licht:** `tools/wahrzeichen/licht.js`, `lichtRaster(bodenZellen, { abstand: 12, hoehe })` -> Seelaternen-Positionen (`hoehe` = Deckeneinbau y + hoehe, ohne `hoehe` Bodeneinbau y − 1).
- **Öffnungen deklarieren:** `ctx.oeffnung(zellen, art)` (`tuer|tor|fenster_offen|arkade|loggia|scharte|relief`; Luftzellen; `relief` = Rustika-Fuge, gewollte Außenluft in der Außenlage, seit W7), `ctx.unzugaenglich(zellen, begruendung)`, `ctx.grundriss(spalten)` (Hausgrundriss für R13, nur Quartier). Gespeichert in `world.oeffnungen`, `world.unzugaenglich`, `world.grundrisse`.
- **Schalter:** `"begehbarkeit": "pflicht"` in `project.json` macht R13/R14 zu Fehlern; ohne das Feld sind es Warnungen mit Kennzahlen. Der Bericht steht in `build/report_<id>.json` unter `begehbarkeit`.
- **Bestand:** `20_Stadtmodell_Florenz/BEGEHBARKEIT_BESTAND.md`; Werkzeug `node tools/diag/begehbarkeit_bestand.js [projekt-id ...] [--csv ordner]`.
- **Webapp:** `ChunkMesher` zeichnet Treppen als echte Treppenform (11 Flächen je Block, Rauminhalt 0,75), `voxel-renderer.js` baut für jeden Treppentyp eine eigene Instanz-Geometrie. **Minecraft (Bedrock):** `weirdo_direction` o/w/s/n = 0/1/2/3, `upside_down_bit` für `_oben`; die Steintreppe heißt `normal_stone_stairs`, `stone_stairs` ist die Bruchsteintreppe.

## 6. Quartierhäuser (B4, seit 14.10.2026)
Der Hausgenerator baut jedes Haus begehbar; `domplatz_ring` steht auf `"begehbarkeit": "pflicht"`.
- **Haustür** (`tools/city/fassade.js`): Hat die Hauptfassade kein offenes Portal, kommt eine Tür von 2 × 4 (schräge Wände 4 breit) dazu, bei Ladenbögen als Ladentür im mittleren Bogen. Über der Tür bleibt die Wand im Erdgeschoss geschlossen. Häuser ohne Hauptfassade bekommen die Tür an der längsten Straßenkante ab 3 Blöcken.
- **Türdurchbruch** (`haus.js`, `tuerDurchbruch`): Trifft die Tür in schrägen Wänden die innere Wandlage nur über Eck, werden die Wandzellen auf dem kürzesten Weg zum Innenraum in Türhöhe geöffnet.
- **Eingangsstufen** (`haus.js`, `eingangsStufen`): Liegt die Straße d = 2..6 Blöcke unter dem Hausboden, führen d Treppenblöcke (`polished_tuff_stairs`) in der Türlaibung nach innen hinauf. Alles bleibt innerhalb der Parzelle (keine Konflikte mit dem Stadtgrund).
- **Innenausbau** (`tools/city/innen.js`, eigenes Bauteil `<haus>_innen` nach dem Rohbau): Ebenen = Geschosse, niedrige Geschosse (h < 5, Mezzanin) gehören zur Ebene darunter. Je Ebene ein Boden (Cotto, `terracotta`) in der obersten Reihe des Geschosses darunter. Ein Treppenhaus je Innenbereich (Komponente ab 20 Zellen): Podesttreppen (Breite 2, Podest 2 tief) übereinander, Teilung n1/n2 je Lauf per Suche so, dass die Kopffreiheit (3) frei bleibt; Auflager unter jeder Stufe (R3). Holztreppen in Bürgerhäusern, Steintreppen in Palazzi und Kirchen. Beim Flachdach führt die Treppe auf die Terrasse.
- **Licht:** Seelaternen im Boden jeder Ebene, höchstens 12 Blöcke Abstand (`lichtRaster`). **Ausstattung:** Tisch mit zwei Stühlen (Treppenblöcke), Betten (weiße/rote Keramik) in den Obergeschossen, Ladentheke bei `bottega_arcata`.
- **Bewusst unzugänglich** (deklariert): Mauerkronen von Teilwänden zum Nachbarhaus; Hinterhäuser ohne Straßenfront (2 Häuser im Domplatz-Ring).
- **Grenze:** 6 sehr schmale oder schräge Kleinhäuser (Innenbreite < 4) haben keinen Platz für ein Treppenhaus der Breite 2; sie bleiben ein hoher Raum ohne Obergeschossböden (R13 erfüllt).
- **Messung Domplatz-Ring:** 2.370.843 Blöcke (vorher 1.803.412), 98,7 % der 766.284 Raumzellen erreichbar, 0 nicht erreichbare Komponenten. Tests: `tools/test/city_innen.test.js`.

## 7. Dom (B5, seit 14.10.2026)
`duomo` steht auf `"begehbarkeit": "pflicht"` (Feld `json` im Registry-Eintrag `tools/spec/projects.js`). R13: 0 nicht erreichbare Komponenten, R14: 0 Lücken. 908.560 Blöcke.
- **Zugänge:** drei Westportale bis zum Fußboden offen (Bronzeflügel offen, Lünette bleibt), Seitenportale Nord/Süd offen, alle vier Sakristeitüren offen (auch die beiden früheren Blendnischen im Westen), Baptisterium Nord- und Südportal offen (die Paradiespforte im Osten bleibt geschlossen), Campanile-Tür offen. Außenstufen aus Marmortreppen vor allen Eingängen (`0/aussenstufen`, Sagrato vor der Westfassade).
- **Krypta:** gerade Steintreppe im südlichen Seitenschiff der Krypta (`9/krypta_treppe`, oberste Stufe und Treppenloch in `0/krypta_abgang`), Kopffreiheit 4 über dem Treppenloch, weil R13 beim Hinabgehen eine Zelle mehr verlangt. Stufe zum Presbyterium.
- **Campanile:** die umlaufende Treppe besteht jetzt aus Treppenblöcken (steigende Tritte), Start neben der Tür, Treppenlöcher in jeder Decke so groß, dass über jeder Stufe 3 Luft bleiben.
- **Bewusst unzugänglich** (deklariert, mit Begründung): Hohlkerne des Schalenmauerwerks (A1) in Vierung, Tribünen, Exedra-Sockeln, Tambour und Baptisterium; Dachräume über den Gewölben (Seitenschiffe, Mittelschiff, Tribünen, Kapellen, Sakristeien, Baptisterium); Laibungen von Rosette, Ochsenaugen, Glockenbögen; Mauerkronen (Chorschranke, Arkadenwand); Blindexedren; Grabungsgrube der Krypta; **Kuppelzwischenraum und Laterne (Kuppelaufstieg wird auf Wunsch des Nutzers nicht modelliert).**
- **Dichtheit:** Ostabschluss der Seitenschiffe (`1/ostgiebel_seitenschiffe`) und der Kapellendächer (`3/kapellendach_abschluss`) über den niedrigeren Eckbauten, Baptisteriumslaterne zwischen den Säulen verglast, Laternenkegel massiv, Glas der Obergaden-Rundfenster in der Außenlage. Offene, nur überdeckte Außenbereiche als `loggia` deklariert (unter Kranzgesims, Gebälk, Kugel; Mauerkrone der Arkadenwand).
- **Licht:** Seelaternen im Fußboden auf dem 10er-Raster (Langhaus, Vierung, Tribünen, Campanile, Baptisterium), in der Krypta auf einem 8er-Raster, je Campanile-Geschoss vier Lichter in der Decke.
- **Prüfregeln geschärft (gilt für alle Projekte):** R14 zählt als Außenluft nur Luft, die mit dem Rand des Prüfrasters verbunden ist (versiegelte Hohlräume außerhalb der Maske sind keine Außenluft). Beim Dom ist die Maske der Grundriss aus Modul 0, um 4 Zellen eingezogen (Reliefnischen der äußeren Wandlagen sind keine Lecks). Der R14-Bericht nennt je Lücke eine angrenzende Außenluftzelle (`aussen`).


## 8. Ponte Vecchio (W6, seit 14.10.2026)
`ponte_vecchio` ist von Anfang an mit `"begehbarkeit": "pflicht"` gebaut. R13: 98,4 % der 16.028 Raumzellen erreichbar, 0 nicht erreichbare Komponenten; R14: 0 Lücken. 169.366 Blöcke, 9 Module. Test: `tools/test/ponte_vecchio.test.js`.
- **Gedrehter Rahmen (θ = 116,6°):** Wände sind mindestens 2 Zellen dick (1 Zelle dicke Wände hängen im gedrehten Raster nur über Kanten zusammen, R3). Türen, die das Innere nur über Eck treffen, werden auf dem kürzesten 4er-Weg durch das Wandband mitgeöffnet (Ladentüren `TUER_DURCHBRUCH`, Turmtor `turmTor`, Korridor `Gangdurchbruch` in `model/_pv.js`).
- **Läden:** 42 Läden mit offener Tür (2 × 5) zur Fahrbahn, Zwischenboden Lage 8..9; 17 Läden mit Wendeltreppe (Radius 2) zum Obergeschoss, die übrigen erreichen das Obergeschoss über Türen in den Trennwänden (Erd- und Obergeschoss). Loggia (Ost) mit mitlaufender Treppe hinauf zum Korridor.
- **Corridoio Vasariano:** Gang Lage 16..22, durchgehend 4-seitig zusammenhängend. Nördlich des Turms ist der Korridorumriss aus den Stadtdaten zu schmal für einen Gang (d8 ≤ 2); dort greift der Gang auf 80 Zellen der angrenzenden Ostläden aus (Anbau, Ladendecke = Gangboden). Am Turm ruht der Gang auf Konsolen; darunter bleibt ein gepflasterter Durchgang auf Fahrbahnhöhe (`4/durchgang_turm`). Die Schnitte zu den Uffizien (x = −529) und zum Palazzo Pitti (z = 1311) sind als `tor` deklariert.
- **Torre dei Mannelli:** Tor in der Westwand zum Durchgang, Wendeltreppe (Radius 3) aus Treppenblöcken bis auf die Dachterrasse, Ausstieg als `tuer` deklariert, Decken je 14 Lagen.
- **Bewusst unzugänglich:** Sockel und Büste des Cellini-Brunnens. Luft unter den Bögen und unter dem Korridor über der Fahrbahn ist als `arkade` deklariert.
- **Licht:** 112 Seelaternen in den Decken (Abstand ≤ 10) in Läden, Loggia, Gang und Turm.

## 9. Palazzo Pitti (W7, seit 14.10.2026)
`palazzo_pitti` ist mit `"begehbarkeit": "pflicht"` gebaut. R13: 94,2 % der Raumzellen erreichbar, 0 nicht erreichbare Komponenten; R14: 0 Lücken. 1.249.338 Blöcke (Module 0–7). Test: `tools/test/palazzo_pitti.test.js`.
- **Aushub:** Im Footprint trägt der Stadtgrund den Hang bis Y 82 ab; der Boden-Provider des Projekts (`projects/palazzo_pitti/spec/ground.js`) bildet das ab (Gelände in der Maske höchstens `bodenY − 1`), sonst läge das Erdgeschoss für R13 im Berg.
- **Raumplan** (`model/_raum.js`, vor den Wänden berechnet): Spinnwand, Trennwände je Geschoss und Appartamenti-Wände mit Türen 3 × 5 nach Katalog; zerfällt ein Geschoss trotzdem in getrennte Raumgruppen, öffnet ein automatischer Durchgang den kürzesten Weg durch innere Wände (nie durch Außen- oder Hofhaut, höchstens 30 Zellen) und verbreitert ihn auf 3 Zellen. Ergebnis: jedes Geschoss ist eine Raumgruppe (Test).
- **Treppen:** fünf Podesttreppen (13 + 12 Stufen, Breite 3; West und Ost je EG → PN und PN → OG, Nebenbau EG → PN) und zwei gerade Flügeltreppen (22 Stufen) auf die Dachterrassen mit Brüstung, achsparallel in den gedrehten Räumen gesucht (`sucheTreppe`), Auflager unter jeder Stufe, Treppenlöcher in den Decken; Ausstieg im Terrassendach als `tuer` deklariert.
- **Außenstufen:** Wo der Platz vor Arkaden, Portal und Korridortor tiefer liegt als Y 83, führen bis zu drei Treppenblöcke außerhalb der Maske hinauf (Luftraum 3); der Stadtgrund gleicht den Vorplatz später ohnehin auf Y 83 an.
- **Bauplan mit Stützpass** (`bauplan` in `model/_pi.js`): Fenster, Rahmen und Laibungen gehören zum Wandbauteil ihres Geschosses (lagenweise gebaut); hängt eine Zelle über einer Luftöffnung im gedrehten Raster nur über Ecken, wird die Luftzelle darunter geschlossen. Wandbauteile sind so geschnitten (nach Kanten), dass jede Lage eines Bauteils in einem Bauschritt liegt und jedes Fenster genau einem Bauteil gehört. Glas reicht von der Außenkante 3 Zellen tief; die innere Laibung (Fensterbank über Kopfhöhe) ist als `unzugaenglich` deklariert, Rustika-Fugen als `relief`, Hofnischen als `loggia`.
- **Dach** massiv von der obersten Decke bis zur Dachfläche (kein Dachraum ohne Zugang). Fenster nur an der Maskenkante; Wände über niedrigeren Bauteilen (Hauptbau über den Flügeln) bleiben blind.
- **Offen:** Modul 8 (ausgestaltete Räume) und Modul 9 (Corridoio Oltrarno bis zum Ostflügel).
