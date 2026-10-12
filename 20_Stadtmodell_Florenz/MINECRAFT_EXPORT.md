# Minecraft-Export (Phase G1, vorgezogen)

Ziel: Das Stadtmodell wird als **Java-Edition-Welt** ausgegeben. Jede Änderung am Modell schreibt die Welt automatisch neu. Der Nutzer lädt sie einmal und sieht danach immer den aktuellen Stand.

## Rahmen
- **Plattform:** Minecraft **Java Edition**. Lokal installiert sind 1.20.x bis 26.x. Wir schreiben das Chunk-Format von **1.21.4** (DataVersion 4189). Neuere Versionen rüsten die Chunks beim Laden automatisch auf.
  - Verwendete Blöcke wie `tuff_bricks` und `polished_tuff` gibt es ab 1.20.3.
- **Koordinaten:** Modellkoordinaten sind Weltkoordinaten. Es gibt keine Umrechnung.
  - Modell-y = Minecraft-y; Minecraft erlaubt −64..319.
  - Modell-x/z = Minecraft-x/z.
- **Keine fremden Bibliotheken.** NBT-Writer und -Reader, Region-Dateien (`.mca`, zlib) und Paletten-Bitpacking schreiben wir selbst in Node (CommonJS).
- **Formatdetails:** Lesen ist erlaubt auf minecraft.wiki (Seiten „Chunk format“, „Region file format“, „NBT format“, „Java Edition level format“, „Superflat“), aber keine Downloads.

## Inhalt der Welt
1. **Alle gebauten Projekte** (Registry, `--all`): dieselben Zellen und Blocktypen wie im Build, als Grid je Projekt. Konflikte gibt es laut `--cross` keine.
2. **Gelände** aus `tools/geo/gelaende.js` (`groundTopY`) über die ganze Weltfläche x −3104..1695, z −1488..2671:
   - Bedrock auf y −64, darüber `stone` bis `groundTopY − 3`, dann `dirt`, Oberfläche nach `data/stadt/flaechen.json`:
     - Straßen und Plätze → Rolle `pflaster`
     - Grün → `grass_block`
     - Wasser (Arno) → `water` bis Wasserspiegel, darunter Sand oder Kies
     - sonst `grass_block`
   - **In Säulen mit Projektblöcken** reicht das Gelände höchstens bis `(min y des Projekts in dieser Säule) − 1`. Projektblöcke gewinnen immer.
3. **Platzhalter-Häuser** (Option, Vorgabe an): alle Gebäude aus `data/stadt/gebaeude.json`, die zu keinem gebauten Projekt gehören.
   - Form: einfache **hohle** Prismen auf `bodenY` bis `bodenY + hoeheBl`.
   - Wände 1 Block in einer Putzfarbe per Hash aus der ID (Rollen `putz_*`), flaches Dach `dachziegel`.
   - Nie in Zellen eines Projekts oder eines Vorrang-Wahrzeichens (`data/stadt/vorrang.json`).
4. **level.dat:**
   - Welt „Florenz Voxelmodell“, Kreativmodus, Cheats an.
   - Ewiger Mittag, kein Wetter, keine Mobs.
   - Generator Superflat ohne Schichten (Leere), Biom `plains`.
   - Spawn auf der Piazza del Duomo vor der Westfassade, auf Bodenhöhe.

## Blockzustände
`oak_leaves` mit `persistent=true` (sonst zerfällt das Laub). Säulen und Stämme mit `axis=y`. `water` mit `level=0`. Alle anderen Blöcke ohne Eigenschaften. Unbekannte Typen sind ein Fehler.

## Ausgabe und Aktualisierung
- **Befehl:** `node tools/minecraft/export.js [--ziel <Ordner>] [--ohne-platzhalter] [--alles-neu]`.
- **Zielordner:** aus `minecraft.local.json` im Repo-Wurzelordner, z. B. `{ "welt": "C:/Users/<name>/AppData/Roaming/.minecraft/saves/Florenz Voxelmodell" }`.
  - Die Datei ist **gitignored**, weil sie nur im Hauptordner liegt.
  - Worktrees der Agenten haben sie nicht und exportieren deshalb nie in die echte Welt.
  - Ohne Konfiguration und ohne `--ziel` lautet das Ziel `build/minecraft/Florenz Voxelmodell/`.
- **Inkrementell:** Je Region (32 × 32 Chunks) wird ein Inhalts-Hash in `<Ziel>/florenz_export.json` gespeichert. Nur geänderte Regionen werden neu geschrieben, und zwar über eine temporäre Datei mit anschließendem Umbenennen.
- **Schutz:**
  - Ist die Welt in Minecraft geöffnet, also `session.lock` gesperrt oder nicht exklusiv zu öffnen, bricht der Export mit einem klaren Hinweis ab: „Welt in Minecraft schließen (zum Titelbildschirm) und erneut starten.“
  - `level.dat` und `playerdata/` werden nur beim ersten Export oder mit `--alles-neu` geschrieben. So bleiben Spielerposition und Inventar erhalten.
- **Automatik:** `tools/build.js` ruft nach jedem erfolgreichen Build (`--project`, `--all`, Standard-Dombuild) den Export auf, **nur wenn `minecraft.local.json` existiert**. Mit `--ohne-minecraft` lässt sich das abschalten. Ist die Welt geöffnet, gibt es nur eine Warnung; der Build bleibt grün.
- **Hinweis für Spieler:** Eigene Änderungen im Spiel werden beim nächsten Export in geänderten Regionen überschrieben.

## Prüfung (ohne Minecraft)
- Eigener Leser (`tools/minecraft/lesen.js`) liest die erzeugten `.mca` zurück.
- Tests:
  - NBT-Rundlauf
  - Bitpacking (Palettengrößen 1, 2, 16, 17, 300)
  - Stichproben: Projektblöcke an bekannten Koordinaten, z. B. die Turmspitze des Palazzo Vecchio auf Y 256 und der Laternenknauf des Doms
  - Gelände unter Projekten
  - Inkrementeller Lauf schreibt 0 Regionen, wenn sich nichts geändert hat
  - Abbruch bei gesperrtem `session.lock`
- Ausgabe: Laufzeit, Größe, Anzahl der Regionen und Blöcke.

## Anleitung für den Nutzer
`20_Stadtmodell_Florenz/MINECRAFT_ANLEITUNG.md` (deutsch, für Laien): Launcher, Version wählen, Welt öffnen, Teleport-Befehle zu den Wahrzeichen, Hinweise zum Aktualisieren und Schließen, Sichtweite und Leistung.
