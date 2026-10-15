# Bauteilkatalog – Badia Fiorentina (V3 D3)

Maße: [`REFERENZMASSE.md`](REFERENZMASSE.md). Rahmen BF (θ 0°), Lagen yr = Y − 66. Ein Bauplan in `projects/badia_fiorentina/model/_bf.js`.

## 0. Zonen
`saal` w −13..13 · `nord` w < −13 · `sued` w ≥ 13 · `campanile` (Maske w249686038, Sechseck). Außenwände d8 ≤ 2.

## 1. Module

| Modul | Titel | Bauteile |
|---|---|---|
| 0 | Fundament und Boden | `fundament`, `boden` |
| 1 | Außenwände | `aussenwaende` (Nordportal, blinde Monoforen), `fenster` |
| 2 | Bögen und Ausstattung | `boegen`, `chorgestuehl`, `hochaltar` |
| 3 | Decken und Dächer | `decken`, `daecher`, `schildwaende` |
| 4 | Campanile | `turmschaft`, `glockengeschosse`, `turmspitze` |
| 5 | Licht | `licht` |

## 2. Begehbarkeit
Nordportal zur Via Dante; Saal, Nordarm und Presbyterium offen; Dachräume unzugänglich; Campanile innen hohl und als unzugänglich deklariert (einschließlich der Glockenöffnungen); Licht im Raster 12.
