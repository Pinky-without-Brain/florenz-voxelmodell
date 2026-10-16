# Bauteilkatalog – Santa Maria del Carmine (V3 D3)

Maße: [`REFERENZMASSE.md`](REFERENZMASSE.md). Rahmen CM (θ 101,5°), Lagen yr = Y − 60. Ein Bauplan in `projects/santa_maria_del_carmine/model/_cm.js`.

## 0. Zonen
`fassade` u < 3 · `schiff` u < 97,3, |w| < 15 · `kapelle` Langhaus |w| ≥ 15 · `vierung` Achteck (oktogonaler Abstand < 17,6 um (135,8 \| −0,5)) · `corsini` w < −44,5 · `brancacci` w > 31, |u − 137| < 9,5 · `chor` u ≥ 153,6, |w + 1| < 14 · `quer` übriges Querhaus.
Außenwände: d8 ≤ 2. Erste Setzung gewinnt; Portale werden vor allen Wänden freigehalten.

## 1. Module

| Modul | Titel | Bauteile |
|---|---|---|
| 0 | Fundament und Boden | `fundament`, `boden` |
| 1 | Fassade | `fassade` (Hauptportal, zwei Seitentüren, Rundfenster) |
| 2 | Kapellen des Langhauses | `kapellenpfeiler`, `kapellendecken`, `altaere`, `hochwand` |
| 3 | Wände | `aussenwaende`, `fenster`, `brancacci` (Wände mit Fresken), `corsini` (Bogenwand) |
| 4 | Vierung und Kuppeln | `vierungspfeiler`, `vierungsboegen`, `tambour`, `kuppel`, `laterne`, `corsini_kuppel` |
| 5 | Decken und Dächer | `tonne`, `decken`, `chorkuppel`, `daecher`, `schildwaende` |
| 6 | Ausstattung | `hochaltar`, `licht` |

## 2. Begehbarkeit
Hauptportal und zwei Seitentüren; Kapellen, Querarme, Cappella Brancacci (Bogen), Cappella Corsini (Bogen) und Chor sind vom Schiff aus erreichbar; Dachräume über Tonne, Decken und Chorkuppel unzugänglich deklariert; Licht im Raster 12.

## 3. Campanile (V5b)
**Quellenlage (Stufe C):** Weder it.wikipedia (Basilica di Santa Maria del Carmine), en.wikipedia, de.wikipedia, die Seite des Kulturministeriums (cultura.gov.it) noch firenze-oltrarno.net erwähnen einen Glockenturm, seine Lage, Höhe oder Form; auch die Wikimedia-Commons-Kategorie nennt keinen. **Lage, Höhe und Form sind daher eine Modellannahme**, die im Content (`caution`) und hier ausdrücklich so benannt ist.

**Lage (Stufe C):** Die Kirche ist rundum von Gebäuden (Kloster r1632337 und Häuser des Quartiers Carmine) umgeben; freier Grund liegt nur im **Kreuzgangshof westlich des Langhauses** (Loch im OSM-Relation des Klosters, Zellen ohne Gebäude). Dort steht der Turm als Rechteck u 76..90 × w 31..45 im Rahmen CM (14 × 14 Blöcke = 7 × 7 m), Zusatzmaske `campanile` aus `rechtecke` (siehe `tools/wahrzeichen/projekt.js`), abzüglich der Hauptmaske. Kein Quartierhaus wird berührt (daher kein Eintrag in `vorrang.json`, keine gelöschte Hausakte, `--cross` ohne Konflikte).

**Boden:** Der Hof liegt auf Y 58 bis 59; `spec/ground.js` trägt die Turmmaske auf Y 58 ab, der Turmboden liegt auf **Y 59** (eine Lage unter dem Kirchenboden Y 60), damit die Tür von außen mit höchstens einer Stufe erreichbar ist (`YT(yr) = Y(yr − 1)` in `_cm.js`).

| Modul | Titel | Bauteile |
|---|---|---|
| 7 | Campanile | `campanile_schaft`, `campanile_treppe`, `glockenstube`, `glockenjoch`, `glocken`, `campanile_spitze`, `campanile_licht` |

**Aufbau** (Bauplan `tools/wahrzeichen/campanile.js`, Parameter `CAMP`): Sockel 5 Lagen Bruchstein, Schaft aus Steinziegeln mit Gesimsen (Lage 16, 32, 47), Schlitzfenster alle 16 Lagen; Glockenstube Lage 48 bis 60 mit je zwei schmalen Rundbogenöffnungen (3 Blöcke) auf jeder Seite; vier Glocken (Kupferblock) unter dem Joch auf Lage 56; vierseitiger Pyramidenhelm aus Terrakotta ab Lage 61 mit Kupferspitze, Oberkante Lage 72 = **36 m** (angenommen: höher als das Langhaus, niedriger als Kuppel und Laterne).

**Begehbarkeit:** Tür (3 breit, 4 hoch) in der Nordwand vom Hof; Wendeltreppe 5 × 5 aus Treppenblöcken bis zum Stubenboden, Kopffreiheit 3 auch über den Eckpodesten; Licht in der Mauerschale alle 8 Lagen. Grenze: Der Hof ist vom Straßenraum nur durch das Klostergebäude zugänglich (Quartier Carmine); R13 des Projekts startet an der Maskenkante (Hofseite).
