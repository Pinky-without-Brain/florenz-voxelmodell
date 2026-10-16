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
| 6 | Ausstattung (V5b) | `lippi_tafel`, `giugni_grabmal`, `ugo_grabmal`, `cantoria_vasari`, `orgel_zeffirini`, `hochaltar_aufbau`, `chorgestuehl_lehnen`, `chorgestuehl_sitze`, `kassettendecke` |

## 2. Begehbarkeit
Nordportal zur Via Dante; Saal, Nordarm und Presbyterium offen; Dachräume unzugänglich; Campanile innen hohl und als unzugänglich deklariert (einschließlich der Glockenöffnungen); Licht im Raster 12.

## 3. Ausstattung (V5b)
**Quellen:** it.wikipedia (Badia Fiorentina). Alle Teile sind vereinfacht in vollen Blöcken („Vereinfacht, nicht nach Vorbild“ steht im Content jedes Bauteils); Orte nach der Beschreibung, Maße und Farben Stufe C. Rahmen BF achsparallel: Weltzelle x = 77 + u, z = 580 + w. Gemessene Räume: Saal innen u 3..64 × w −10..10, Nordarm innen u 30..52 × w −25..−17 (Nordportal u 48..52), Presbyterium innen u 20..64 × w 13..21.

| Bauteil | Ort im Modell | Quelle, Stufe |
|---|---|---|
| `lippi_tafel` | Ostwand des Nordarms (u 52), links hinter dem Nordportal, Rahmen 7 × 6, Unterkante Lage 2 | Filippino Lippi, Erscheinung der Madonna vor dem hl. Bernhard, 1482 bis 1486: „subito a sinistra dopo l’ingresso“ (A für Werk und Jahr, B für den Ort) |
| `giugni_grabmal` | Nordwand des Nordarms westlich des Portals (u 39..46) | Mino da Fiesole, Grabmal Bernardo Giugni († 1456), um 1466 bis 1469: „vicino all’ingresso“ (B), Wand und Aussehen C |
| `ugo_grabmal` | Ostwand des Saals unter der Cantoria des linken Querarms (u 63..64, w −4..4) | Mino da Fiesole, Grabmal Ugo II. von Tuszien, 1469 bis 1481: „sotto la cantoria del braccio sinistro“ (A/B) |
| `cantoria_vasari` | Empore über dem Ugo-Grabmal (Boden Lage 11) mit Vasaris Assunta (Goldrahmen, 7 × 6) | Giorgio Vasari, Assunta e santi, 1568, in der Cantoria der linken Wand (A/B) |
| `orgel_zeffirini` | Westwand des Saals, Empore des rechten Querarms (u 3..5), elf Pfeifenreihen | Orgel Onofrio Zeffirini 1558, restauriert 1979 bis 1981 (A/B) |
| `hochaltar_aufbau` | Presbyterium: Predella u 38..46 × w 14..19 mit Stufe aus Treppenblöcken, Kruzifix und zwei Leuchtern auf der Mensa aus Modul 2 | Altar 1627 bis 1631 nach Süden gedreht (A); das Giotto-Polyptychon hängt in den Uffizien und ist nicht Teil des Modells |
| `chorgestuehl_lehnen`, `chorgestuehl_sitze` | an allen Wänden des Presbyteriums: Rückwand Lage 2 bis 4 mit goldenem Fries, Sitze als Treppenblöcke (hohe Seite zur Wand) | Chorgestühl Francesco und Marco Del Tasso, 16. Jh. (A) |
| `kassettendecke` | hängende Rippen (Abstand 4) und goldene Rosetten in den Feldern unter der Saaldecke (Lage 37) | Kassettendecke Felice Gamberai bis 1631 (A) |

**Nicht modelliert:** Chiostro degli Aranci (Bernardo Rossellino 1432 bis 1438, OSM r5441462) – liegt nicht in der Maske des Projekts; Cappella di San Mauro (Meucci 1717), zweite Orgel von 1717.

**Begehbarkeit:** Vor jedem Kunstwerk freier Stehbereich (Test); Cantoria und Orgelbühne sowie die Oberkante des Chorgestühls sind als unzugänglich deklariert; R13 und R14 unverändert 0.
