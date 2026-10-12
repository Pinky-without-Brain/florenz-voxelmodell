# Übergabe V2 – Santa Maria del Fiore als Voxel-Architekturmodell

**Stand:** 12. Oktober 2026 · **Status:** alle 10 Module fertig, alle Prüfregeln grün
**Vorgänger:** V1 liegt unverändert in `_archiv_v1/`, mit der alten Übergabe `UEBERGABE_CLAUDE_V1.md`.

---

## 1. Grundregeln
1. Das Markenwort des bekannten dänischen Klemmbaustein-Herstellers kommt nirgends vor. Prüfregel R10 bricht den Build ab, wenn doch. Zulässig sind Meisterbau, Bauanleitung, Bauschritt, Baustein, Bautüte, Architekturmodell.
2. **Keine Zahl wird behauptet, ohne dass sie gemessen ist.** Alle Kennzahlen unten stammen aus `node tools/build.js`. Die Statistikbereiche der Bauanleitungen und READMEs werden generiert, und R9 prüft sie.
3. Maße stehen nur in `tools/spec/dimensions.js` (Maßstab **1:2, 1 Block = 0,5 m**, in allen Achsen).
4. **Arbeitsweise:** Design, Planung und Prüfung macht Opus; programmiert wird von Sonnet-Agenten mit mittlerem Aufwand nach Arbeitspaket-Spezifikation, jeweils in einer eigenen git-Arbeitskopie.

## 2. Ein Befehl für alles
```
node tools/build.js              # Modell bauen → Bauschritte → Prüfungen R1–R10 → Webapp-Daten → Doku
node tools/build.js --no-emit    # nur prüfen
node --test "tools/test/**/*.test.js"
```
Webapp: `webapp/index.html` über einen lokalen Server öffnen (`.claude/launch.json`, „projekt-server“, Port 8765).

## 3. Kennzahlen (gemessen)

| Modul | Inhalt | Blöcke | Schritte | min/Ø/max je Schritt |
|---|---|---:|---:|---|
| 0 | Fundament, Böden, Krypta-Grube | 46.661 | 27 | 841 / 1.728 / 2.060 |
| 1 | Langhaus & Seitenschiffe | 174.461 | 109 | 328 / 1.601 / 2.030 |
| 2 | Westfassade mit Uccello-Uhr | 24.677 | 15 | 1.252 / 1.645 / 1.892 |
| 3 | Vierung, 3 Tribunen, Sakristeien | 349.479 | 222 | 1.111 / 1.574 / 2.092 |
| 4 | Tambour, Ochsenaugen, tribune morte | 55.400 | 36 | 576 / 1.539 / 2.100 |
| 5 | Doppelkuppel mit Fresko | 112.856 | 77 | 872 / 1.466 / 2.052 |
| 6 | Laterne, Kugel, Kreuz | 6.885 | 5 | 649 / 1.377 / 1.904 |
| 7 | Campanile di Giotto | 69.550 | 44 | 352 / 1.581 / 2.016 |
| 8 | Baptisterium San Giovanni | 62.641 | 43 | 594 / 1.457 / 2.070 |
| 9 | Krypta Santa Reparata, Chor, Altar | 6.409 | 4 | 1.256 / 1.602 / 1.798 |
| **Σ** | | **909.019** | **582** | max 2.100 (Grenze 2.500) |

Prüfregeln (Definitionen in `tools/ARCHITEKTUR.md` §7), alle **0 Fehler, 0 Warnungen**:
- R1 Eindeutigkeit
- R2 Schrittgröße
- R3 Baubarkeit (jeder Block schließt beim Bauen an Gesetztes oder das Gelände an)
- R4 Zusammenhang
- R5 Schnittstellen, Hoheitsgebiete und Auflager
- R6 Höhengrenzen
- R7 Palette
- R8 Symmetrie
- R9 Doku stimmt mit Modell überein
- R10 Wortregel

Tests: 177 grün. Gesamtbuild ca. 5 s. Gesamtansicht in der Webapp ca. 0,6 s, dabei werden etwa 511 k sichtbare von 909 k Blöcken gerendert.

## 4. Wo steht was
| Thema | Datei |
|---|---|
| Plan, Phasen, Entscheidungen | `00_Projektplan_und_Konzept/NEUAUFBAU_PLAN.md` |
| Reale Maße und Quellen | `00_Projektplan_und_Konzept/REFERENZMASSE.md`, `MASSZEICHNUNG.svg` (erzeugt von `tools/emit/drawing.js`) |
| Bauteile je Modul (Spezifikation) | `00_Projektplan_und_Konzept/BAUTEIL_KATALOG.md` |
| Pipeline-Vertrag, Prüfregeln, Fallstricke | `tools/ARCHITEKTUR.md` |
| Maße, Palette, Schnittstellen | `tools/spec/dimensions.js`, `palette.js`, `interfaces.js` |
| Geometrie (Grid, Bögen, Gewölbe, Dächer, Kuppel, Muster) | `tools/geom/*.js` |
| Module | `tools/model/m0_…` bis `m9_…` |
| Texte je Bauteil | `content/steps_de/modul_N.json` |
| Bauanleitungen (generiert) | `NN_Modul_N_*/BAUANLEITUNG_MODUL_N.md` |
| Umgebung (158 Gebäude aus OpenStreetMap, ODbL) | `tools/spec/site_osm.json` → `webapp/js/data/v2/site.js` |

## 5. Bekannte Punkte und mögliche nächste Schritte
- **Buntglas:** Im Renderer ist es als halbtransparent eingestellt (Opacity 0,55). Im Screenshot ist der Effekt nicht eindeutig zu sehen; gegebenenfalls die Deckkraft senken.
- **Gesims-Vorsprung:** Das Kranzgesims der Seitenschiffe (M1) springt bis |z| = 45 vor, die Außenflucht in `dimensions.js` liegt bei 44. Das ist gewollt, Katalog A3.
- **Ungeprüfte Fakten:** Mehrere historische Angaben in den Content-Dateien haben die Agenten aus eigenem Wissen geschrieben und als zu prüfen markiert, etwa Details zu Passaglia/Cassioli, Michelozzo, den Ketten und der Ziegelzahl. Vor einer Veröffentlichung gegenlesen.
- **Wählbare Annahmen** (in `dimensions.js` mit ANNAHME markiert): Fassadenhöhe, Dächer, Tambourbasis, Maße des Laternentempels, Höhen des Baptisteriums.
- **Optional:** `.schem`/`.litematic`-Export (E5 im Plan); Treppen im Kuppelzwischenraum (Katalog M5, optional); Treppe im Campanile mit echten Stufenblöcken (bisher nur volle Blöcke).
