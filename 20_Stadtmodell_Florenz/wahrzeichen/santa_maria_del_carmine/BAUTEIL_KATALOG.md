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
