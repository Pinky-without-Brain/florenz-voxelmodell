# Bauteilkatalog – Santa Trinita (V3 D3)

Maße: [`REFERENZMASSE.md`](REFERENZMASSE.md). Rahmen ST (θ 209°), Lagen yr = Y − 61. Ein Bauplan in `projects/santa_trinita/model/_st.js`.

## 0. Zonen
`fassade` u < 3 · `schiff` |w + 2,5| < 8,5 · `seite` bis 17 · `kapelle` dahinter · `quer` u 61..79 · `gualberto` w > 30 · `sakristei` w < −28 · Kopf ab u 79: `chor` w −8,5..3,5, `sassetti` w ≥ 10, sonst `kopfkapelle`.

## 1. Module

| Modul | Titel | Bauteile |
|---|---|---|
| 0 | Fundament und Boden | `fundament`, `boden` |
| 1 | Fassade | `fassade` (drei Portale, Relief, Statue, Rundfenster) |
| 2 | Schiffe und Kapellen | `pfeiler`, `arkaden`, `obergaden`, `kapellen`, `altaere` |
| 3 | Wände und Kapellen am Querhaus | `aussenwaende`, `fenster`, `kopfkapellen`, `sassetti`, `gualberto`, `sakristei` |
| 4 | Gewölbe und Dächer | `gewoelbe`, `daecher`, `schildwaende` |
| 5 | Ausstattung | `hochaltar`, `licht` |

## 2. Begehbarkeit
Drei Portale; alle Kapellen offen (Bögen), Sakristei durch eine Tür; Dachräume unzugänglich deklariert; Licht im Raster 12.
