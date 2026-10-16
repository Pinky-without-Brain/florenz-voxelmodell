# Referenzmaße – Badia Fiorentina (V3 D3, Wahrzeichen-Welle 3)

Projekt-ID `badia_fiorentina`. Maßstab 1:2 (**Blöcke = 2 · m**), Weltkoordinaten des Stadtmodells. Stand 15.10.2026.
Stufen: **A** mehrere Quellen übereinstimmend oder amtliche Quelle, **B** eine Quelle oder aus OSM/DGM gemessen, **C** Schätzung (Proportion). Entwurf: [`BAUTEIL_KATALOG.md`](BAUTEIL_KATALOG.md).

## 1. Rahmen und OSM

| Größe | Wert | Quelle |
|---|---|---|
| OSM-Objekt | Way **w249686037** „Badia Fiorentina“ (`building=church`), **2.682 Zellen**, achsparallel | `data/stadt/gebaeude.json` |
| Campanile | Way **w249686038** (`man_made=tower`, `tower:type=bell_tower`, **`height=70 m`**), 154 Zellen, Sechseck | `gebaeude.json`; bisher im Quartier Signoria |
| Kreuzgang | r5441462 (`building=cloister`, Chiostro degli Aranci) – nicht Teil dieses Projekts | `gebaeude.json` |
| **Rahmen `BF`** | achsparallel, **θ = 0°**, Ursprung (77 \| 580): u = x − 77 (Westen → Osten, Via del Proconsolo), w = z − 580 (Norden → Süden) | Polygon achsparallel |
| Gelände | `groundTopY` 63–67 (63: 130, 64: 641, 65: 749, **66: 953**, 67: 224 Zellen); Via Dante Alighieri vor dem Nordportal 66, Via del Proconsolo 63 | `tools/city/ground_stadt.js` |
| **`bodenY`** | **66** (bündig mit der Via Dante) | Entwurf, B |

### Polygon im Rahmen `BF` (gemessen, u \| w in Blöcken)
- **Saal** u 0..67 × w −13..13; **Nordarm** u 22..67 × w −27..−13; **Presbyterium** u 18..66 × w 13..24.
- **Campanile** an der Nordwestecke, x 91,5..105 × z 551,5..567 (13,5 × 15,5 Blöcke).

## 2. Maße (Literatur gegen OSM)

| Maß | Modell | Literatur | Bewertung |
|---|---|---|---|
| Umbau | Saal mit Armen, Altar im Süden | Matteo Segaloni **1627–31**, griechisches Kreuz, Altar nach Süden zum Arno verlegt ([it.wikipedia](https://it.wikipedia.org/wiki/Badia_Fiorentina)) | A |
| Gotische Orientierung | vier blinde Monoforen an der Ostwand | Arnolfo di Cambio **1285**: Apsis zur Via del Proconsolo; vier große, heute blinde Monoforen (it.wikipedia) | A |
| Decke | geschnitzte Kassettendecke | Felice Gamberai „entro il **1631**“, verdeckt die gotischen Binder (it.wikipedia) | A |
| Presbyterium | Chorgestühl, Deckenfresko | Chorgestühl Francesco und Marco Del Tasso (16. Jh.), Fresken G. D. Ferretti **1734** (it.wikipedia) | A |
| Campanile | sechseckig, Spitze Lage 140 = **70 m** | „circa **70 metri**“, sechseckig auf quadratischem Sockel, **1310–1330** (it.wikipedia); OSM `height=70 m` | A |
| Turmkürzung | | 1307 als Strafe unter die halbe Höhe gekürzt (it.wikipedia) | A |
| Portale | Nordportal zur Via Dante | Portale von Benedetto da Rovezzano zur Via Dante und Via del Proconsolo, Vestibül mit Loggia (it.wikipedia) | A; das Vestibül liegt außerhalb des OSM-Umrisses |

## 3. Entwurfswerte ohne Beleg (Stufe C)
- Saal: Decke Lage 38, Traufe 44, First 50; Nordarm Decke 30, Dach 36; Presbyterium Decke 34, Dach 40.
- Bögen zu den Armen: Scheitel Lage 29 (Nord) und 33 (Süd).
- Campanile: Sockel bis Lage 48, Glockengeschosse 52..62 (Monoforen), 66..80 (Biforen), 84..100 (Triforen), Spitze ab Lage 104.
