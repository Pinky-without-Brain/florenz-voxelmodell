# Bauteilkatalog – Santo Spirito (V3 D3)

Maße: [`REFERENZMASSE.md`](REFERENZMASSE.md). Rahmen SS (θ −63,5°), Lagen yr = Y − 64. Ein Bauplan in `projects/santo_spirito/model/_ss.js`.

## 0. Zonen
`fassade` u < 3 · `schiff` Hauptschiffe des Kreuzes (Langhaus |wc| < M, Querarme |u − 136| < M, Chor bis u 174,5) · `vierung` · `umgang` 1 M rund um das Kreuz · `aussen` (Kapellennischen und Außenwand) · `sakristei` (Maske r7101376 ohne Campanile, Loch geschlossen) · `campanile`.
wc = w + 4,4 ist der Abstand zur Achse. Erste Setzung gewinnt; Öffnungen (Portale, Türen, Glockenstube) werden vor allen Wänden freigehalten.

## 1. Module

| Modul | Titel | Bauteile |
|---|---|---|
| 0 | Fundament und Boden | `fundament`, `boden` |
| 1 | Fassade | `fassade` (drei Portale), `fassade_okulus` |
| 2 | Säulen und Arkaden | `vierungspfeiler`, `saeulen`, `arkaden`, `obergaden`, `obergaden_fenster` |
| 3 | Außenwände | `aussenwaende` (Nischen), `fenster` |
| 4 | Vierung und Kuppel | `vierungsboegen`, `pendentifs`, `tambour`, `kuppel`, `laterne` |
| 5 | Decken und Dächer | `kassettendecke`, `gewoelbe` (Hängekuppeln des Umgangs), `daecher`, `schildwaende` |
| 6 | Sakristei | `sakristei` (Vorraum, Achteck, Zwickel hinter dem Achteck massiv), `sakristei_kuppel` |
| 7 | Campanile | `campanile_schaft`, `campanile_treppe`, `glockenstube`, `turmspitze` |
| 8 | Ausstattung | `hochaltar`, `licht` |

## 2. Begehbarkeit
Drei Fassadenportale; Tür vom westlichen Umgang (u 58..62) in den Sakristei-Vorraum, Tür Vorraum → Achteck, Tür Vorraum → Campanile (u 94..98); Wendeltreppe bis zur Glockenstube; Dachräume über Decke und Hängekuppeln sowie die Turmspitze unzugänglich deklariert; Licht im Raster 12.
