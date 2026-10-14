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
```
Hinweis: Nach Modelländerungen meldet `--no-emit` R9-Fehler (Doku veraltet). Ein Lauf **mit** Emit schreibt die Doku neu; Ergebnis dann OK. Ohne `minecraft.local.json` wird keine Minecraft-Welt geschrieben (`--ohne-minecraft` erzwingt das).

## 3. Projektstand (gemessen)

| Projekt | Typ | Blöcke | Begehbarkeit | Stand |
|---|---|---:|---|---|
| `duomo` | Wahrzeichen (Dom, Campanile, Baptisterium) | 909.019 | nicht nachgerüstet (1,6 % erreichbar) | **nächstes Paket B5** |
| `domplatz_ring` | Quartier (202 Häuser) | 2.370.843 | **pflicht**, 98,7 %, 0 Komponenten | B4 erledigt (14.10.) |
| `uffizi` | Wahrzeichen | 736.705 | pflicht | B1 erledigt |
| `palazzo_vecchio` | Wahrzeichen | 567.730 | pflicht | B2 erledigt |
| `orsanmichele` | Wahrzeichen | 88.949 | pflicht | B3 erledigt |
| `loggia_dei_lanzi` | Wahrzeichen | 34.034 | pflicht | B3 erledigt |

Alle Projekte: Build OK, `--cross` 0 Konflikte, 400 Tests grün (2 übersprungen).

## 4. Sitzungsprotokoll 14.10.2026

### B4 Quartierhäuser begehbar – **erledigt**
- Neu `tools/city/innen.js` (Ebenen, Treppenhaus-Suche mit Präfixsummen und Tiefensuche über die Stufenteilung, Böden, Licht, Möbel, Deklarationen `unzugaenglich`).
- `tools/city/fassade.js`: `hatTuer`, `tuerEinsetzen`, Haustür in jeder Hauptfassade, Sturz über der Tür.
- `tools/city/haus.js`: Türzellen, `tuerDurchbruch`, `eingangsStufen`, `plan.innen`; Rohbau spart Lichter, Eingangsstufen und Dachloch aus.
- `tools/city/quartier.js`: Bauteil `<id>_innen` je Haus, Content-Text dazu; `tools/validate/begehbarkeit_projekt.js` fasst `<id>` und `<id>_innen` zu einer R13-Einheit zusammen.
- `tools/city/material.js`: Rollen `holz`, `licht`, `bett_kissen`, `bett_decke`.
- `projects/domplatz_ring/project.json`: `"begehbarkeit": "pflicht"`.
- Doku: `BEGEHBARKEIT.md` §6. Tests: `tools/test/city_innen.test.js` (7 Tests), angepasst `city_haus`, `city_quartier`, `city_poly`.

## 5. Nächste Schritte (Priorität)
1. **B5 Dom begehbar** (`duomo`, Module in `tools/model/m0..m9`): Freitreppe/Portale der Westfassade (Sockel `2/sockel` Y 65–72 massiv, Portale ab Y 73), Zugänge zu Langhaus, Tribünen, Baptisterium, Campanile; Krypta-Abgang; Räume über Gewölben als `unzugaenglich` oder mit Gangnetz; Kuppelumgänge und Laterne mit Treppen aus Treppenblöcken; Fenster verglasen; Licht. Danach `"begehbarkeit": "pflicht"` in der Registry (`tools/spec/projects.js` hat kein project.json → Feld dort oder in `begehbarkeit_projekt` ergänzen). Bestand: `BEGEHBARKEIT_BESTAND.md` §3.
2. **Welle 2 Infrastruktur** (Spezifikation fertig: `wahrzeichen/UEBERSICHT_WELLE2.md` §6): W0-Erweiterungen in `project.json` (`flaechen`-Maskenquelle, `zMin/zMax`, `abzugAlle`, `gelaendeBis`), Vorrang-IDs, `data/stadt/aussparung.json`.
3. **Stadtgrund** (S0 + Generator, Spezifikation `stadtgrund/SPEZIFIKATION.md`), Kern zuerst.
4. **Ponte Vecchio**, dann **Palazzo Pitti** (Kataloge in `wahrzeichen/ponte_vecchio`, `wahrzeichen/palazzo_pitti`).
5. Statistikseite `20_Stadtmodell_Florenz/STATISTIK.html` aktualisieren, wenn sich Blockzahlen ändern.

## 6. Bekannte Punkte
- 6 Quartierhäuser (schmal/schräg, Innenbreite < 4) ohne Obergeschossböden (siehe BEGEHBARKEIT §6).
- Quartiere: R14 (Dichtheit) wird für Häuser nicht geprüft.
- Inhalte der Hausakten sind überwiegend typologisch (`quelle: typologie`); Bildindex A5 steht aus.
