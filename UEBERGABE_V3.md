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
| `duomo` | Wahrzeichen (Dom, Campanile, Baptisterium) | 908.560 | **pflicht**, 0 Komponenten, R14 0 Lücken | B5 erledigt (14.10.) |
| `domplatz_ring` | Quartier (202 Häuser) | 2.370.822 | **pflicht**, 98,7 %, 0 Komponenten | B4 erledigt (14.10.) |
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

### B5 Dom begehbar – **erledigt**
Details: `20_Stadtmodell_Florenz/BEGEHBARKEIT.md` §7. Kurz: alle Portale/Türen offen, Außenstufen, Krypta-Treppe, Campanile-Treppe aus Treppenblöcken, Hohlkerne/Dachräume/Laibungen deklariert, Lecks geschlossen, Licht. **Nutzerentscheidung 14.10.2026: Kuppelaufstieg (Treppen zwischen den Schalen) wird nicht modelliert**, Zwischenraum und Laterne sind als unzugänglich deklariert. Hilfsmodul `tools/model/_luft.js` (Flutfüllung für Deklarationen). R14 geschärft (Außenluft = mit dem Rasterrand verbunden), Bericht mit `aussen`-Beispielzelle. Dom-Maske für R13/R14 = Grundriss aus Modul 0, 4 eingezogen.
Diagnose-Skripte, die sich bewährt haben (nicht im Repo, schnell neu zu schreiben): R13-Komponenten nach Bauteil gruppieren über `laufe(ctx,'r13')` aus `tools/validate/begehbarkeit_projekt.js`; R14-Cluster mit `laufe(ctx,'r14')` (Felder `beispiel`, `aussen`).

### W5 Infrastruktur Welle 2 – **erledigt**
`tools/wahrzeichen/maske.js` (`Maske.ausFlaechen`, `ladeFlaechen`, `zMin/zMax`), `tools/wahrzeichen/projekt.js` (`flaechen`, `abzugAlle`, `gelaendeBis`, `hauptGrenzen`, `ladeAussparung`), `data/stadt/vorrang.json` (+11 IDs Welle 2), `data/stadt/aussparung.json` (Pfeiler Ponte Vecchio, 852 Spalten), Minecraft-Export: Vorrang nur für gebaute Projekte. Test `tools/test/wahrzeichen_w2.test.js`: Ponte-Vecchio-Masken ergeben genau 10.844 Zellen ohne Überlappung mit den Uffizien. Für `project.json` des Ponte Vecchio zusätzlich `"hauptGrenzen": { "xMax": -529 }` setzen (sonst zählen 97 Ladenzellen der Uffizien mit).

## 5. Nächste Schritte (Priorität)
1. ~~Welle 2 Infrastruktur~~ (W5 erledigt).
2. **Stadtgrund** (S0 + Generator, Spezifikation `20_Stadtmodell_Florenz/stadtgrund/SPEZIFIKATION.md`), Kern zuerst.
3. **Ponte Vecchio**, dann **Palazzo Pitti** (Kataloge in `20_Stadtmodell_Florenz/wahrzeichen/ponte_vecchio`, `.../palazzo_pitti`), jeweils gleich mit Begehbarkeit „pflicht“.
4. Statistikseite `20_Stadtmodell_Florenz/STATISTIK.html` aktualisieren (Blockzahlen Dom/Domplatz-Ring geändert).

## 6. Bekannte Punkte
- 6 Quartierhäuser (schmal/schräg, Innenbreite < 4) ohne Obergeschossböden (siehe BEGEHBARKEIT §6).
- Dom: Kuppelaufstieg bewusst weggelassen (Nutzerwunsch). Baptisterium hat im Modell keine Emporen (ein hoher Raum).
- `UEBERGABE_V2.md` nennt noch 909.019 Dom-Blöcke (historischer Stand V2).
- Quartiere: R14 (Dichtheit) wird für Häuser nicht geprüft.
- Inhalte der Hausakten sind überwiegend typologisch (`quelle: typologie`); Bildindex A5 steht aus.
