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
- **Häuser (Quartiergenerator):** Haustür, Treppenhaus, Böden je Geschoss, Licht. Einfache Ausstattung: Tische und Betten aus Holz, ein Laden im EG, wenn die Akte `eg.art = laden` hat.
- Die Bauanleitung bleibt gültig: Innenausbau sind eigene Bauteile und Bauschritte nach dem Rohbau.

## 5. Werkzeuge (B0, seit 13.10.2026)
- **Treppenblöcke in der Palette:** Typname `<basis>@<richtung>[_oben]`, z. B. `stone_brick_stairs@n` (Aufstieg nach Norden = −z; `o` = +x, `s` = +z, `w` = −x; `_oben` = umgedreht). 20 Materialien, Rolle `treppe`. API in `tools/spec/palette.js`: `treppeFuerRolle(rolle)` -> Basisname, `treppe(rolle, richtung, oben?)` -> Typname, `isTreppe(typ)`, `treppeInfo(typ)`. Terrakotta/Dachziegel hat keine Treppe, Ersatz ist `brick_stairs`; für Pietra serena gibt es keine Treppe aus glattem Stein, Ersatz ist `stone_stairs`.
- **Bibliothek** `tools/wahrzeichen/treppe.js`: `geradeTreppe`, `podestTreppe`, `wendeltreppe`, `treppenloch(lauf, kopf = 3)`, `kopffreiheit(bloecke, istFrei)`. Höhenregel: Stufe k steht in Zelle `start.y + k`, der obere Boden ist massiv in Zelle `start.y + n − 1` (Stehzelle `start.y + n`). Breite nach rechts vom Aufstieg aus. In gedrehten Rahmen wird die Richtung auf die nächste Weltachse gerundet (`rahmen`-Option); Treppen laufen achsparallel in Weltkoordinaten.
- **Licht:** `tools/wahrzeichen/licht.js`, `lichtRaster(bodenZellen, { abstand: 12, hoehe })` -> Seelaternen-Positionen (`hoehe` = Deckeneinbau y + hoehe, ohne `hoehe` Bodeneinbau y − 1).
- **Öffnungen deklarieren:** `ctx.oeffnung(zellen, art)` (`tuer|tor|fenster_offen|arkade|loggia|scharte`; Luftzellen), `ctx.unzugaenglich(zellen, begruendung)`, `ctx.grundriss(spalten)` (Hausgrundriss für R13, nur Quartier). Gespeichert in `world.oeffnungen`, `world.unzugaenglich`, `world.grundrisse`.
- **Schalter:** `"begehbarkeit": "pflicht"` in `project.json` macht R13/R14 zu Fehlern; ohne das Feld sind es Warnungen mit Kennzahlen. Der Bericht steht in `build/report_<id>.json` unter `begehbarkeit`.
- **Bestand:** `20_Stadtmodell_Florenz/BEGEHBARKEIT_BESTAND.md`; Werkzeug `node tools/diag/begehbarkeit_bestand.js [projekt-id ...] [--csv ordner]`.
- **Webapp:** `ChunkMesher` zeichnet Treppen als echte Treppenform (11 Flächen je Block, Rauminhalt 0,75), `voxel-renderer.js` baut für jeden Treppentyp eine eigene Instanz-Geometrie. **Minecraft (Bedrock):** `weirdo_direction` o/w/s/n = 0/1/2/3, `upside_down_bit` für `_oben`; die Steintreppe heißt `normal_stone_stairs`, `stone_stairs` ist die Bruchsteintreppe.
