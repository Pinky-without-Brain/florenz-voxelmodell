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
node tools/city/besitz.js                     # Besitzraster des Stadtgrunds neu (nach Änderungen an der Unterkante eines Projekts!)
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
| `stadtgrund` | Stadtgrund (Kacheln, unabhängige Module) | 1.240.083 (21 von 195 Kacheln) | – (keine Innenräume) | S0 + S1 (14.10.) |

Alle 8 Projekte: Build OK, `--cross` 0 Konflikte (28 Paare), 418 Tests grün (2 übersprungen).

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

## 5. Nächste Schritte (Priorität)
1. ~~Welle 2 Infrastruktur~~ (W5), ~~Ponte Vecchio~~ (W6), ~~Stadtgrund S0 + S1 Teil 1~~.
2. **Stadtgrund Kern:** `aktiv` in `projects/stadtgrund/project.json` schrittweise auf den Kern erweitern (Stand: 21 Kacheln um die gebauten Projekte, 1,24 Mio Blöcke, Webdaten 3,2 MB; Achtung: die Stadtansicht der Webapp lädt alle gebauten Projekte als Voxel, derzeit ≈ 6 Mio Blöcke) (131 Kacheln mit ≥ 30 % Gebäuden; Liste messen: Gebäudeanteil je Kachel aus `gebaeude.json`), je Erweiterung Build + `--cross`; Laufzeit ≈ 1 s je Kachel, Webdaten ≈ 170 KB je Kachel (Repo-Größe beachten). Danach Rand (S2).
3. **Palazzo Pitti** (Katalog `20_Stadtmodell_Florenz/wahrzeichen/palazzo_pitti`), gleich mit Begehbarkeit „pflicht“. Der Korridor des Ponte Vecchio endet am Schnitt z = 1311 (als `tor` deklariert) und muss dort anschließen.
4. Statistikseite `20_Stadtmodell_Florenz/STATISTIK.html` aktualisieren (Blockzahlen Dom/Domplatz-Ring geändert, Ponte Vecchio neu).

## 6. Bekannte Punkte
- 6 Quartierhäuser (schmal/schräg, Innenbreite < 4) ohne Obergeschossböden (siehe BEGEHBARKEIT §6).
- Dom: Kuppelaufstieg bewusst weggelassen (Nutzerwunsch). Baptisterium hat im Modell keine Emporen (ein hoher Raum).
- `UEBERGABE_V2.md` nennt noch 909.019 Dom-Blöcke (historischer Stand V2).
- Quartiere: R14 (Dichtheit) wird für Häuser nicht geprüft.
- Ponte Vecchio: Modul 7 (Cellini-Brunnen) hat nur 127 Blöcke (R2-Warnung, ein Schritt).
- Inhalte der Hausakten sind überwiegend typologisch (`quelle: typologie`); Bildindex A5 steht aus.
