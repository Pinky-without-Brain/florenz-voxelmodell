# Neuaufbau-Plan: Santa Maria del Fiore (Version 2)

**Stand:** 12. Oktober 2026 · **Rollen:** Claude Opus = Design, Planung, Prüfung · Sonnet-Agenten (mittlerer Aufwand) = Umsetzung nach Arbeitspaket-Spezifikation

---

## 1. Warum neu aufsetzen?

Die Probleme von Version 1 sind strukturell und nicht nur Einzelfehler:

| Problem | Befund in V1 | Ursache |
|---|---|---|
| **Uneinheitlicher Maßstab** | Langhaus-Grundriss im Maßstab ~1:2,19 (Länge 331, Breite 86 Blöcke), aber Kuppel nur 84 Blöcke breit (wäre 120) und 90 Blöcke hoch. Langhausgewölbe endet bei Y=124 (wären ~Y=158), Tambour ab Y=120. Die Proportionen von Kuppel zu Kirche stimmen nicht. | Keine zentrale Maßtabelle; jedes Modul hat eigene Zahlen. |
| **Übergabe stimmt nicht mit den Daten überein** | Vierungspfeiler sind 5×5 statt der dokumentierten 12×12. 20 Schritte sind > 2.500 Blöcke. Mindestens 1.146 Blöcke hängen frei. | Prüfungen sind pro Modul handgeschrieben und decken nicht alle Regeln ab. |
| **Einmal-Skripte und Flicken** | 20+ Skripte wie `build_*_perfect.js`, `fix_*.js`, `patch_*.js` und `sync_*.js`. Unklar, welches Skript welchen Stand erzeugt hat. | Keine durchgängige Pipeline. |
| **Datenmenge** | 42 MB an JS-Daten (jeder Block als JSON-Objekt) | Kein kompaktes Format |
| **Dokumentation läuft auseinander** | Schrittzahlen und Blockzahlen in den MD-Dateien und im README sind veraltet. | Die Doku wird von Hand gepflegt statt aus den Daten erzeugt. |
| **Modul 9 schwebt** | Die Freskoblöcke stehen frei im Kuppelraum. | Das Fresko ist als eigener Baukörper modelliert statt als Oberfläche der Innenschale. |

**Fazit:** Ja, ein Neuaufbau mit einer einzigen Quelle für alle Maße, einer Pipeline und automatischen Prüfungen ist besser als weiteres Flicken. Erhalten bleiben das Webapp-Gerüst (UI, Renderer und Texturen funktionieren), die Blockpalette, die historischen Texte und die Ordnerstruktur der Module.

---

## 2. Zielarchitektur

```
tools/                          ← NEU: Node-Pipeline, keine externen Abhängigkeiten
  spec/
    dimensions.js               ← EINZIGE Maßtabelle (reale Meter → Blöcke, ein Maßstab)
    interfaces.js               ← Schnittstellenverträge zwischen Modulen (Footprints, Höhen)
    palette.js                  ← erlaubte Blocktypen pro Bauteil
  geom/                         ← Geometrie-Bibliothek (rein, deterministisch, getestet)
    grid.js                     ← VoxelGrid mit Eigentümer-Prüfung (jeder Voxel genau 1×)
    shapes.js                   ← box, ring, octagon, polygonFill, cylinder, sphere
    arches.js                   ← Rundbogen, Spitzbogen, Kleeblatt, Oculus
    vaults.js                   ← Kreuzrippengewölbe, Halbkuppel (Konche)
    dome.js                     ← Achteckige Klostergewölbe-Kuppel, Spitzbogenprofil (quinto acuto)
    patterns.js                 ← Inkrustation, Kosmaten, Fischgrät (Materialfunktionen)
  model/
    m0_fundament.js … m9_innenraum.js   ← je Modul: Bauteile mit Tags {modul, bauteil, phase}
    world.js                    ← setzt alles in EIN VoxelGrid zusammen
  steps/
    planner.js                  ← Bauteile → Bauschritte (Reihenfolge + Aufteilung 1.200–2.100)
  validate/
    *.js                        ← alle Regeln aus Abschnitt 3, ein Bericht
  emit/
    data.js                     ← kompakte Webapp-Daten (Base64-gepackt, weiterhin file://-fähig)
    docs.js                     ← BAUANLEITUNG_MODUL_X.md + README-Statistiken aus den Daten
    schem.js                    ← (später) .schem/.litematic-Export
  build.js                      ← ein Befehl: model → steps → validate → emit
  test/                         ← Unit-Tests der Geometrie (node:test)
content/
  steps_de/modul_X.json         ← Titel, Beschreibung, Tipp, Fakt je Bauteil/Schritt (Text getrennt von Geometrie)
webapp/                         ← bleibt, Datenschicht wird ersetzt
_archiv_v1/                     ← alte scratch-Skripte, alte Daten, alte Screenshots (verschoben, nicht gelöscht)
```

**Grundprinzip:** Maße stehen nur in `dimensions.js`. Daraus entsteht die Geometrie, aus der Geometrie entstehen die Schritte, aus den Schritten die Daten und die Doku. Nichts wird von Hand nachgetragen. `node tools/build.js` erzeugt immer den vollständigen und geprüften Stand.

---

## 3. Invarianten (maschinell geprüft, Build schlägt bei Verletzung fehl)

| # | Regel | Formale Definition |
|---|---|---|
| R1 | Eindeutigkeit | Jede Koordinate gehört genau einem Bauteil. Ein zweites Setzen wirft einen Fehler im Grid, nicht erst im Audit. |
| R2 | Schrittgröße | Jeder Schritt hat ≤ 2.500 Blöcke, Ziel 1.200–2.100. Unter 300 nur beim letzten Schritt eines Bauteils, und nur mit Begründung im Content. |
| R3 | Baubarkeit | Jeder Block in Schritt *n* berührt über eine Fläche einen Block aus Schritt ≤ *n* oder liegt auf der Bodenplatte. Prüfung pro Schritt in Bau-Reihenfolge (zusammenhängende Komponenten). |
| R4 | Statik light | Keine Komponente ohne Verbindung nach unten zum Fundament (Flood-Fill über Flächenkontakt). Ausnahmen nur über eine Whitelist in `interfaces.js`. |
| R5 | Schnittstellen | Die Oberseite von Modul A deckt die Unterseite von Modul B gemäß Vertrag ab. Das ergibt 0 Überhang, 0 Lücke. |
| R6 | Höhenlimit | Alle Y-Werte liegen in 60 ≤ Y ≤ 319. |
| R7 | Palette | Nur Blocktypen aus `palette.js` mit deutschem Namen in `block-types.js`. |
| R8 | Symmetrie | Wo gefordert (Kuppel, Tambour, Laterne, Baptisterium), wird 4- bzw. 8-fache Symmetrie geprüft. |
| R9 | Doku-Synchronität | Die Zahlen in den MD-Dateien sind ausschließlich generiert. Ein Diff-Check vergleicht sie mit dem Build. |
| R10 | Wortregel | Ein Grep-Check über alle Ausgaben stellt sicher, dass das gesperrte Markenwort nicht vorkommt. |

---

## 4. Phasen und Arbeitspakete

Legende: **[O]** = Opus selbst · **[S]** = Sonnet-Agent (mittlerer Aufwand), danach Review durch Opus · ∥ = parallelisierbar

### Phase 0 – Absicherung (½ Tag)
- **0.1 [O]** `git init` und Commit des V1-Stands, damit alles zurückgerollt werden kann.
- **0.2 [S]** V1-Artefakte (`scratch/`, `webapp/*.js`-Prüfskripte, `module_*_steps.js` und Screenshots) nach `_archiv_v1/` verschieben. Die Webapp lädt bis zur Phase 5 weiter aus dem Archiv.

### Phase 1 – Referenzmaße und Design-Spezifikation [O]
- **1.1** Reale Hauptmaße mit Quellen recherchieren: Länge, Breiten, Gewölbehöhen, Tambour, Kuppel (innen/außen, Schalenabstand, Spitzbogenprofil), Laterne, Campanile, Baptisterium und die Lage zueinander.
- **1.2** Maßstab festlegen (siehe Entscheidung E1) und `dimensions.js` schreiben, alle Werte in ganzen Blöcken.
- **1.3** Schnittstellenverträge `interfaces.js` definieren, etwa die Oberkante des Vierungsoktogons gleich der Unterkante des Tambours, Footprint-Polygone, Kuppelauge, Laternensockel.
- **1.4** Bauteil-Katalog je Modul mit Reihenfolge und Materialien erstellen. Daraus entstehen die AP-Spezifikationen für Phase 3.
- **Abnahme:** Eine Maßzeichnung (SVG: Grundriss und Längsschnitt) wird aus `dimensions.js` erzeugt und vom Nutzer freigegeben.

### Phase 2 – Fundament der Pipeline
- **2.1 [S]** `geom/grid.js`, `shapes.js` und Unit-Tests (Eigentümer-Prüfung, Bounding Box, Iteration).
- **2.2 [S] ∥** `arches.js` und `vaults.js` mit Tests für Symmetrie und Dichtheit, also ohne Lücken in Bogenlaibungen.
- **2.3 [S] ∥** `dome.js`: Klostergewölbe mit Doppelschale, Rippen, Spitzbogenprofil und Auge. Tests: geschlossene Schalen und 8-fache Symmetrie.
- **2.4 [S]** `validate/*` (R1–R10) und `steps/planner.js` mit synthetischen Testmodellen.
- **2.5 [S]** `emit/data.js` sowie den Datenlader in der Webapp (Base64-entpacken). Die Webapp zeigt ein Testmodell an.
- **Abnahme [O]:** Alle Tests sind grün. Ich prüfe den Code auf Determinismus und darauf, dass keine Maße außerhalb von `dimensions.js` stehen.

### Phase 3 – Modelle der Module (je Modul ein AP, Review nach jedem)
Reihenfolge nach Abhängigkeit. Innerhalb einer Zeile parallel:
1. **M0** Fundament und Bodenplatte
2. **M1** Langhaus ∥ **M3** Vierung und Tribunen, gegen `interfaces.js`
3. **M2** Westfassade ∥ **M4** Tambour
4. **M5** Doppelkuppel. Das Fresko ist hier eine Materialfunktion auf der Innenschale (siehe E3).
5. **M6** Laterne ∥ **M7** Campanile ∥ **M8** Baptisterium
6. **M9** Innenraum: Krypta, Chorschranke, Uccello-Uhr als Wandmaterial, Ausstattung

Jedes AP liefert `model/mX_*.js` und `content/steps_de/modul_X.json`. Der Build ist grün für alle Module bis X.
**Review [O] je Modul:** Validator-Bericht, Screenshots aus 4 festen Kameras im Browser, Stichproben-Schnitte (Y-Schnitt als PNG) und Vergleich mit der Maßzeichnung.

### Phase 4 – Bauschritt-Feinschliff [O]+[S]
- Reihenfolge didaktisch prüfen (von unten nach oben, Bauteil für Bauteil) und Schritte mit < 300 oder > 2.100 Blöcken nacharbeiten.
- Kamera-Hinweise für jeden Schritt automatisch aus der Bounding Box berechnen.

### Phase 5 – Webapp-Umstellung [S]
- Die Datenschicht auf die neuen Daten umstellen. UI, Steuerung, Kamerasperre, Basis-Module und Gesamtansicht bleiben.
- Piazza-Gebäude in `voxel-renderer.js` an neue Maße anpassen, mit Abständen aus `dimensions.js` statt fester Zahlen.
- Ladezeit und Speicher bei Gesamtansicht messen. Ziel: < 3 s.

### Phase 6 – Dokumentation [S]
- `emit/docs.js` erzeugt alle `BAUANLEITUNG_MODUL_X.md`, Statistik-Blöcke in den READMEs und eine neue Übergabedatei.
- Die historischen Texte aus V1 werden übernommen und an die neuen Maße angepasst.

### Phase 7 – Abschlussprüfung [O]
- Vollständiger Build, alle Invarianten grün, Sichtprüfung aller Module und Übergänge sowie ein Testlauf im Browser.
- Optional: `.schem`-Export (E5).

---

## 5. Arbeitsweise mit den Agenten

1. **Ein AP = ein Agent = ein klar abgegrenztes Dateiset.** Kein Agent ändert `dimensions.js` oder `interfaces.js`. Wenn ein Agent dort eine Änderung braucht, meldet er das als Befund.
2. **Jede AP-Spezifikation enthält:** Ziel, zu erstellende Dateien, exakte Maße als Referenz auf `dimensions.js`-Schlüssel, Materialien, Bauteil-Reihenfolge, Abnahmebefehle (`node tools/build.js --module X`, `node --test tools/test`) und Verbote (keine Maße hartkodieren, keine Daten von Hand ändern, das gesperrte Wort nicht verwenden).
3. **Agenten berichten:** geänderte Dateien, Validator-Ausgabe im Wortlaut, offene Fragen. Sie melden keine „100 % perfekt"-Behauptungen ohne Ausgabe.
4. **Review durch Opus:** Ich lasse den Build selbst laufen und verlasse mich nicht auf den Bericht. Ich prüfe Screenshots und Code-Stichproben. Bei Mängeln gebe ich das AP mit konkreter Mängelliste zurück an denselben Agenten.
5. **Nach jedem abgenommenen AP:** git-Commit.

---

## 6. Entscheidungen für den Nutzer

**Getroffen am 12.10.2026:** E1 = **1:2 einheitlich** · E3 = **Fresko/Uhr als Oberflächenmaterial** · E4 = **alle Module gemeinsam** (Phase 3 läuft vollständig nach der Abhängigkeitsreihenfolge durch, ohne Zwischenstopp nach M6) · Phase 0 = **git + Archivierung freigegeben**. E2 und E5 gelten wie empfohlen, bis der Nutzer anders entscheidet.

| # | Frage | Empfehlung |
|---|---|---|
| E1 | **Maßstab** | **1:2 (1 Block = 50 cm), einheitlich in allen Achsen.** Kreuz bei ca. Y≈293, Kuppel ca. 110 Blöcke breit, Langhausgewölbe ca. Y≈150. Alternative: 1:2,19 wie bisher (Kreuz Y=315), aber dann wirklich in allen Achsen. Das ergibt krumme Umrechnungen und nur 5 Blöcke Reserve. |
| E2 | **Webapp** | UI und Renderer behalten, nur die Datenschicht ersetzen. Ein UI-Neubau bringt wenig. |
| E3 | **Fresko und Uhr** | Als Material auf der Innenschale bzw. der Westwand, also keine eigenen schwebenden Blöcke. M9 enthält dann nur Krypta und Ausstattung. |
| E4 | **Umfang und Reihenfolge** | Zuerst die Kathedrale M0–M6 vollständig und abgenommen, danach M7–M9. |
| E5 | **Export** | `.schem`-Export für WorldEdit am Ende als eigenes AP, falls gewünscht. |

**Erwartung:** Bei einheitlichem Maßstab wird das Modell deutlich größer als die 444.000 Blöcke von V1, vor allem durch die korrekt große Kuppel und das höhere Langhaus. Das ergibt grob 600.000–900.000 Blöcke und 350–550 Schritte. Die genaue Zahl steht nach Phase 1 fest.

---

## 7. Risiken

| Risiko | Gegenmaßnahme |
|---|---|
| Kuppelgeometrie (Doppelschale im Voxelraster) erzeugt Lücken | Eigenes AP mit Dichtheitstests, Review von Y-Schnitten |
| Schritte werden zu kleinteilig oder unlogisch | Planner gruppiert nach Bauteil vor Höhe; Opus prüft die Reihenfolge in Phase 4 |
| Webapp wird bei ~900k Blöcken langsam | InstancedMesh je Material ist vorhanden; zusätzlich verdeckte Innenblöcke ausblenden (Face-Culling) |
| Agenten weichen von der Spezifikation ab | Harte Validatoren im Build und Review durch Opus vor jedem Commit |
