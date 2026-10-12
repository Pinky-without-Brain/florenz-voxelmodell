# Minecraft-Export (Phase G1, vorgezogen) – Bedrock Edition

Ziel: Das Stadtmodell wird als Welt für die **Bedrock Edition** (Minecraft for Windows) ausgegeben. Jede Änderung am Modell schreibt die Welt automatisch neu. Der Nutzer öffnet sie in Minecraft und sieht immer den aktuellen Stand.

## Rahmen
- **Plattform:** Minecraft for Windows (Bedrock). Lokal installiert: **1.26.45** (`lastOpenedWithVersion [1,26,45,1,0]`, `StorageVersion 10`, `NetworkVersion 613`).
- **Weltordner:** neuer GDK-Speicherort, Unterordner `minecraftWorlds/<ordnername>/` in
  `%APPDATA%/Minecraft Bedrock/Users/<nutzer-id>/games/com.mojang/minecraftWorlds/`.
  - Lokal: `C:/Users/tomkl/AppData/Roaming/Minecraft Bedrock/Users/11899460932169831656/games/com.mojang/minecraftWorlds/`.
  - Ordnername **`florenz_voxelmodell`**, Weltname in `levelname.txt`: „Florenz Voxelmodell“.
- **Fremde Welten sind tabu:** Die vorhandenen Welten (Auenland, Moria, Narnia …) werden **nie** beschrieben. Lesen ist nur auf **Kopien** im Scratchpad erlaubt, zum Testen des Lesers und zum Abgleich von Blocknamen und Feldern von `level.dat`.
- **Weltformat:**
  - Ordner `db/` ist eine **LevelDB** in Mojangs Variante: Tabellenblöcke unkomprimiert (Typ 0) oder zlib-raw (Typ 4), Prüfsummen crc32c.
  - Dazu gehören `level.dat` (8-Byte-Kopf plus **Little-Endian-NBT**), `levelname.txt` und optional `world_icon.jpeg`.
- **Keine fremden Bibliotheken.** Wir schreiben selbst in Node (CommonJS):
  - LevelDB-Writer und -Reader (Tabellen, MANIFEST/VersionEdit, CURRENT, Log-Format)
  - crc32c
  - LE-NBT
  - Bedrock-Subchunk-Format (Version 9, Paletten-Bitpacking ohne Wortüberlauf, Palette als LE-NBT `{name, states, version}`)
  - Data3D (Höhenkarte und Biom-Paletten)
- **Formatdetails:**
  - Lesen ist erlaubt auf minecraft.wiki: „Bedrock Edition level format“, „…/LevelDB“, „…/SubChunk format“, „Bedrock Edition data values“, „level.dat“ und die Blockseiten (Bedrock-ID, Blockzustände).
  - Ebenso die Formatbeschreibungen von LevelDB (table format, log format, MANIFEST) auf github.com/google/leveldb (`doc/*.md`).
  - Keine Downloads von Programmen oder Paketen.
- **Koordinaten:** Modellkoordinaten sind Weltkoordinaten (1 Block = 0,5 m).
  - Modell-y = Minecraft-y; die Overworld erlaubt −64..319.
  - Modell-x/z = Minecraft-x/z.
  - Chunk-Schlüssel: x, z als int32 LE plus Tag-Byte (Overworld ohne Dimension).

## Inhalt der Welt
1. **Alle gebauten Projekte** (Registry): dieselben Zellen und Blocktypen wie im Build.
2. **Gelände** aus `tools/geo/gelaende.js` (`groundTopY`) über die ganze Weltfläche x −3104..1695, z −1488..2671:
   - Bedrock auf y −64, darüber Stein bis `groundTopY − 3`, dann Erde, Oberfläche nach `data/stadt/flaechen.json`:
     - Straßen und Plätze → Rolle `pflaster`
     - Grün → Gras
     - Wasser (Arno) → Wasser bis zum Wasserspiegel, darunter Kies
     - sonst Gras
   - In Säulen mit Projektblöcken reicht das Gelände höchstens bis `(min y des Projekts in der Säule) − 1`. Projektblöcke gewinnen.
3. **Platzhalter-Häuser** (Option, Vorgabe an): alle Gebäude aus `data/stadt/gebaeude.json`, die zu keinem gebauten Projekt gehören.
   - Form: **hohle** Prismen auf `bodenY` bis `bodenY + hoeheBl`.
   - Wände 1 Block in einer Putzfarbe per Hash aus der ID (Rollen `putz_*`), flaches Dach `dachziegel`.
   - Nie in Zellen eines Projekts oder eines Vorrang-Wahrzeichens (`data/stadt/vorrang.json`).
4. **level.dat:**
   - Vorlage: Feldliste und Typen aus einer **Kopie** einer vorhandenen lokalen Welt ableiten (118 Felder).
   - Kreativmodus, Cheats an.
   - Ewiger Mittag (`dodaylightcycle` aus), kein Wetter, keine Mobs.
   - Flachwelt **ohne Schichten** (Leere), Biom Ebene.
   - Spawn auf der Piazza del Duomo vor der Westfassade, auf Bodenhöhe.
   - Versionsfelder passend zu 1.26.45.

## Blocknamen
`tools/minecraft/bedrock_bloecke.js`: Tabelle **Palette-Typ → Bedrock-Name und -Zustände** für alle Typen aus `tools/spec/palette.js` (inklusive `alsoRoles`) sowie die Geländeblöcke.

- **Vorsicht, die Bedrock-Namen weichen von Java ab.** Beispiele (jeweils im Wiki prüfen):
  - `end_stone_bricks` → `end_bricks`
  - `sea_lantern` → `seaLantern`
  - `bricks` → `brick_block`
  - `chiseled_quartz` → `chiseled_quartz_block`
  - Säulen und Stämme mit `pillar_axis: "y"`
  - Laub mit `persistent_bit: true`
  - Wasser mit `liquid_depth: 0`
- **Abgleich:** Die Namen werden zusätzlich mit den Palettennamen verglichen, die in den Kopien der lokalen Welten vorkommen. Ein Test listet alle Typen, die dort nicht gefunden wurden; die Liste geht in den Bericht.
- **Blockzustands-Version:** Das Feld `version` in der Palette muss zu 1.26 passen. Ältere Zustände rüstet das Spiel beim Laden selbst auf.
- **Unbekannte Typen** sind ein Fehler.

## Ausgabe und Aktualisierung
- **Befehl:** `node tools/minecraft/export.js [--ziel <Weltordner>] [--ohne-platzhalter]`.
- **Zielordner:** aus `minecraft.local.json` im Repo-Wurzelordner: `{ "welt": "<…>/minecraftWorlds/florenz_voxelmodell" }`.
  - Die Datei ist gitignored. Worktrees der Agenten haben sie nicht und exportieren deshalb nie in die echte Welt.
  - Ohne Konfiguration und ohne `--ziel` geht die Ausgabe nach `build/minecraft/florenz_voxelmodell/`.
- **Neu schreiben:** Der Export baut `db/` in einem temporären Ordner komplett neu und tauscht ihn danach aus.
  - Vorher liest er aus der vorhandenen `db/` den Spielerdatensatz (`~local_player`, auch aus `.log`-Dateien) und übernimmt ihn. So bleiben Position und Inventar erhalten.
  - `level.dat` bleibt, wenn vorhanden. Aktualisiert werden nur die Versionsfelder und `LastPlayed`.
- **Schutz:** Ist die Welt geöffnet (`db/LOCK` nicht exklusiv zu öffnen), bricht der Export mit dem Hinweis ab: „Welt in Minecraft verlassen und Export erneut starten.“
- **Automatik:** `tools/build.js` ruft nach jedem erfolgreichen Build den Export auf, aber **nur wenn `minecraft.local.json` existiert**.
  - `--ohne-minecraft` schaltet das ab.
  - Ist die Welt geöffnet, gibt es nur eine Warnung; der Build bleibt grün.
- **Laufzeit:** Ziel unter 2 Minuten für die ganze Welt. Laufzeit, Größe von `db/`, Chunks und Blöcke ausgeben.
- **Hinweis für Spieler:** Eigene Änderungen im Spiel gehen beim nächsten Export verloren, nur der Spieler selbst bleibt.

## Prüfung (ohne Minecraft)
- Eigener Leser (`tools/minecraft/lesen.js`). Tests:
  - LE-NBT im Rundlauf
  - crc32c-Testvektoren
  - LevelDB:
    - Rundlauf mit eigenen Tabellen
    - **Lesen einer Kopie einer echten lokalen Welt**, inklusive zlib-raw-Blöcken und Log
  - Subchunk-Bitpacking (Palettengrößen 1, 2, 16, 17, 300)
  - Stichproben aus der erzeugten Welt:
    - Turmspitze des Palazzo Vecchio auf Y 256
    - Laternenknauf des Doms
    - Gelände unter einem Projekt
  - Spielerdatensatz bleibt beim zweiten Export erhalten
  - Abbruch bei gesperrter `db/LOCK`

## Anleitung für den Nutzer
`20_Stadtmodell_Florenz/MINECRAFT_ANLEITUNG.md` (deutsch, für Laien):
- Minecraft for Windows starten, die Welt „Florenz Voxelmodell“ in der Weltenliste finden
- Teleport-Befehle zu den Wahrzeichen (`/tp @s x y z`)
- Aktualisieren: Welt verlassen, die Weltenliste lädt den neuen Stand
- Sichtweite und Leistung
- Hinweise zur Sicherung
