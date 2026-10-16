# Bauteilkatalog – Santissima Annunziata (V3 D3)

Maße: [`REFERENZMASSE.md`](REFERENZMASSE.md). Rahmen SA (θ −48,5°), Lagen yr = Y − 67. Ein Bauplan in `projects/santissima_annunziata/model/_sa.js`.

## 0. Zonen
`portikus` u < 7 · `chiostrino` u 7..47 (offener Hof u 15..39, w −5..30) · `seitenraum` u 7..21, w < −13 · `schiff` |w − 4| < 13 · `kapelle` · `tribuna` r < 20 um (165 \| 3,5) · `kranz` Tambourring r < 22,5 und Kapellenkranz r < 28 (ohne den Sektor zum Schiff) · `neben` übrige Flächen der Tribuna.

## 1. Module

| Modul | Titel | Bauteile |
|---|---|---|
| 0 | Fundament und Boden | `fundament`, `boden` |
| 1 | Portikus und Chiostrino | `portikus`, `chiostrino` (Bogengänge mit Fresken), `seitenraum` |
| 2 | Kapellen und Tempietto | `innenfassade`, `kapellenpfeiler`, `kapellendecken`, `altaere`, `hochwand`, `tempietto` |
| 3 | Wände und Nebenräume | `aussenwaende`, `fenster`, `nebenraeume` |
| 4 | Tribuna | `kranz`, `triumphbogen`, `tambour`, `kuppel`, `laterne` |
| 5 | Decke und Dächer | `decke`, `daecher`, `schildwaende` |
| 6 | Ausstattung | `hochaltar`, `licht` |

## 2. Begehbarkeit
Sieben Portikusbögen (`tor`), Tür ins Chiostrino, Bogengänge zum offenen Hof (`arkade`), Hauptportal ins Schiff, Tür in den Seitenraum; Kapellen und Tribuna offen; Dachräume, Hohlraum über dem Seitenraum, Bekrönung des Tempietto und Nebenräume der Tribuna unzugänglich deklariert; Licht im Raster 12.

## 3. Glockengiebel (V5b)
**Quellen:** it.wikipedia (Basilica della Santissima Annunziata): „campanile a vela“ mit **5 Öffnungen**, „sul tamburo posteriore“; die Glocken goss 1872 die Gießerei Moreni in Florenz. Der Artikel nennt weder Höhe noch Baumeister noch Zugang; einen freistehenden Campanile gibt es nicht. Im Modell deshalb **kein Turm, sondern ein Glockengiebel** (Stufe C für Maße und Form).

**Lage:** Auf der Rückseite der Tribuna (Phi = 0°, Gegenseite zum Schiff). Der Glockengiebel steht als Wand (3 Blöcke dick, r 25..28, 17 Blöcke breit) auf einer **Plattform in Lage 42** (Oberkante des Tambours) hinter dem Kuppelfuß; darunter füllt ein massiver Sockel den Raum über den Kapellen- und Nebenraumdächern. Kein OSM-Gebäude betroffen (alles innerhalb der Hauptmaske, kein Quartierhaus, keine `vorrang.json`-Änderung).

**Zugang (Stufe C):** Der Vorsprung hinter der Tribuna (u 192..203, w −4..15, im Modell ein Nebenraum) wird zum **Treppenturm** (7 × 7 Blöcke in Weltachsen, Wendeltreppe 5 × 5 aus Treppenblöcken, Kern und Eckpodeste Vollblöcke, Lage 0 bis 42). Ein Durchgang (2 breit, 4 hoch, kürzester 4er-Weg) führt aus der hintersten Kapelle der Tribuna durch die Kapellenwand zum Fuß der Treppe und ersetzt dort den Altar; die Treppe endet offen auf der Plattform (Öffnung als `loggia` deklariert).

| Modul | Titel | Bauteile |
|---|---|---|
| 7 | Glockengiebel | `campanile_sockel`, `campanile_schaft` (Treppenturm), `campanile_treppe`, `campanile_plattform`, `glockengiebel`, `glockenjoch`, `glocken`, `campanile_licht` |

**Aufbau** (Parameter `GIEBEL` in `_sa.js`): Giebelwand aus Steinziegeln vom Plattformboden (Lage 43) bis zur gestuften Krone (Lage 53 an den Rändern, 57 in der Mitte); **fünf Rundbogenöffnungen** (2,4 Blöcke breit, Abstand 3,4) ab Lage 45 mit Kämpfer auf Lage 50; in jeder Öffnung ein Balken aus Schwarzeichenholz in Lage 49 und darunter eine Glocke (Kupferblock, 3 Lagen); Giebelkrone und Plattform aus Glattem Stein; Licht: Seelaternen in der Mauerschale des Treppenturms alle 8 Lagen und zwei im Plattformboden.

**Begehbarkeit:** Plattform und Fuß des Giebels über die Treppe erreichbar (Test), Kopffreiheit 3; Dachräume wie bisher unzugänglich deklariert, `nebenraeume` ohne den Treppenturm.
