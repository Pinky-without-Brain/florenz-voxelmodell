# Bauteilkatalog – Basilica di Santa Croce (V3 D3)

Maße und Quellen: [`REFERENZMASSE.md`](REFERENZMASSE.md). Rahmen `SC`: Ursprung (873,25 | 975), θ = 28,4°, u zum Chor, w < 0 Norden. Zellen werden durch Rückabbildung der Zellmitte in den Rahmen eingeordnet (`ui = floor(u + 0,5)`, `wi = floor(w + 0,5)`); **jedes Bauteil wird mit der OSM-Maske geschnitten** (OSM gewinnt). Höhen als Lage `yr = Y − 64` (Bodenplatte yr 0, Stehhöhe yr 1). Standard: [`../../BEGEHBARKEIT.md`](../../BEGEHBARKEIT.md).

## 0. Zonen (lib `_sc.js`)

| Zone | Bedingung (u, w, d8 = Abstand zum Maskenrand) |
|---|---|
| `fassade` | u < 2,5 (Marmorvorsatz u −5,5..0 und alte Front 0..2,5) |
| `langhaus` | 2,5 ≤ u < 180 |
| `querhaus` | 180 ≤ u < 209 |
| `kapellen` | u ≥ 209 außerhalb des Chors |
| `chor` | u ≥ 209, −7 ≤ w ≤ 21 (Cappella maggiore, halbes Achteck) |
| `campanile` | Maske w662908308 |

Wände: Außenwand = Maskenzelle mit d8 ≤ 3 (Ausnahme: Fassade). Innere Linien: Pfeilerreihen/Obergaden |w| 20..23 (Langhaus), Querhaus-Ostwand u 209..211 mit Kapellenbögen, Kapellen-Trennwände (2 Blöcke) in den Ostkapellen.

## 1. Module

| Modul | Titel | Bauteile | Inhalt |
|---|---|---|---|
| 0 | Fundament und Boden | `fundament`, `bodenplatte`, `grabplatten` | Fundament bis Y 63, Platte Y 64: Pietra-serena-Raster mit Terrakotta (Grabplatten im Mittelschiff, weißer Marmor) |
| 1 | Außenmauern Langhaus | `seitenwand_nord`, `seitenwand_sued`, `seitenfenster` | Außenwand bis Lage 30, je Joch ein Lanzettfenster (2 breit, Lage 12..26, farbiges Glas), Nordportal im 6. Joch |
| 2 | Pfeiler und Arkaden | `pfeiler`, `arkaden` | 2 × 6 Achteckpfeiler (5 × 5) und Vierungspfeiler, Spitzbögen Lage 24..39 |
| 3 | Obergaden und Ballatoio | `obergaden`, `obergaden_fenster`, `ballatoio` | Wände |w| 20..23 von Lage 40 bis 62, Lanzettfenster Lage 46..60 je Joch; Laufgang Lage 41 auf Konsolen (nach dem Obergaden, er hängt an der Wand) |
| 4 | Querhaus und Ostkapellen | `querhaus_waende`, `kapellen_aussen`, `kapellenwand`, `kapellen_trennwaende`, `querhaus_fenster`, `chor`, `chorfenster` | Querhaus bis Lage 56, Ostwand mit 10 Kapellenbögen (Lage 1..26) und Triumphbogen zum Chor (Lage 1..48), Chor mit hohen Lanzettfenstern |
| 5 | Fassade | `fassade_kern` (mit den Portalöffnungen), `fassade_marmor`, `rosette`, `giebel`, `fialen` | drei Portale (Mittelportal 8 breit bis Lage 16, Seitenportale 4 breit bis Lage 11), Okulus Ø 9, Mittelgiebel Lage 64..76, Stern bis Lage 85, Fialen 45/64/72; Marmor weiß mit grünen Bändern und rosa Feldern |
| 6 | Dächer und Dachstuhl | `dach_mittelschiff`, `dach_seitenschiffe`, `dach_querhaus`, `dach_kapellen`, `dach_chor`, `schildwaende`, `binder` | offene Binder alle 6 Blöcke (Holz), Ziegeldach First Lage 70; Querdächer der Seitenschiffe (Giebel bis Lage 42) |
| 7 | Campanile | `campanile_schaft`, `campanile_treppe`, `glockenstube`, `campanile_spitze` | 12 × 12, Wendeltreppe bis Glockenstube (Lage 120..134, offene Bifore), Spitze bis Lage 156 |
| 8 | Ausstattung | `altaere`, `kanzel`, `hauptaltar`, `licht` | 6 Altäre je Seitenschiff, Kanzel am 3. Pfeiler Süd, Hochaltar im Chor, Licht ≤ 12 |

## 2. Begehbarkeit
- Eingänge: drei Fassadenportale (offen, `tor`/`tuer`), Nordportal im sechsten Joch.
- Ein Innenraum (Langhaus + Querhaus + Kapellen + Chor), Kapellen über offene Spitzbögen.
- Ballatoio: **unzugänglich deklariert** (Wartungsgang, Zugang durch Mauertreppen, die im Modell nicht ausgeführt sind); ebenso die Oberseiten der Binder und der Hohlraum der Turmspitze.
- Dächer: die Dachhaut reicht an jeder Spalte bis auf die Höhe des tiefsten der acht Nachbarn (keine Diagonallücken, R14 0); wo ein höheres Dach an ein tieferes stößt, entstehen daraus Schildwände.
- Der Fassadenmodul liegt vor den Dächern (5 vor 6), weil die Dachschlüsse an der Fassade auf ihr aufliegen.
- Campanile: Tür aus der vierten Südkapelle; Wendeltreppe (5 × 5, Weltachsen – der Turm ist um 28,4° gedreht, die Treppe passt achsparallel in den Innenraum) von Lage 1 bis zur Glockenstube (Lage 120), Kopffreiheit 3 auch über den Eckpodesten.
- Licht: Seelaternen im Boden (Raster ≤ 12), Glockenstube offen.
