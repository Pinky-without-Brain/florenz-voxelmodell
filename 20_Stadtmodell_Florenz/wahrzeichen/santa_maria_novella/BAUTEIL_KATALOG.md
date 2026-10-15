# Bauteilkatalog – Santa Maria Novella (V3 D3)

Maße: [`REFERENZMASSE.md`](REFERENZMASSE.md). Rahmen SMN (θ −90°), Lagen yr = Y − 61. Ein Bauplan in `projects/santa_maria_novella/model/_smn.js`.

## 0. Zonen
`fassade` u < 3 · `mittel` |w| < 13 · `seite` bis zur Außenwand · `quer` Querarme (auch die Ansätze ab u 119/131) · `vierung` u 140..175, |w| < 13 · `chor` u ≥ 175, w −14..19 · `kapelle` · `campanile`.
Gewölbe: Kreuzrippengewölbe als Vereinigung zweier Spitztonnen (Höhe = Kämpfer + H · max(√(1−|du|/hu), √(1−|dw|/hw))), Rippen und Gurtbögen aus Glattem Stein.

## 1. Module

| Modul | Titel | Bauteile |
|---|---|---|
| 0 | Fundament und Boden | `fundament`, `boden` |
| 1 | Fassade | `fassade_kern` (Portale), `fassade_unten`, `fassade_oben`, `rosette` |
| 2 | Pfeiler und Arkaden | `pfeiler`, `arkaden`, `obergaden`, `obergaden_fenster` |
| 3 | Wände, Querhaus, Chor | `seitenwaende`, `querhaus_waende`, `querhaus_nordwand`, `kapellenwaende`, `chor`, `fenster` |
| 4 | Gewölbe und Dächer | `gewoelbe`, `daecher`, `schildwaende` |
| 5 | Campanile | `campanile_schaft`, `campanile_treppe`, `glockenstube`, `turmspitze` |
| 6 | Ausstattung | `hochaltar`, `kruzifix` (Giotto, an einer Aufhängung unter dem Gewölbe), `licht` |

## 2. Begehbarkeit
Drei Fassadenportale; Tür vom westlichen Querarm in den Campanile; Wendeltreppe (Weltachsen, Kern 3 × 3, Ring 2 breit – der Rahmen ist achsparallel) bis zur Glockenstube; Dachräume über den Gewölben und Turmspitze unzugänglich deklariert; Licht ≤ 12.
