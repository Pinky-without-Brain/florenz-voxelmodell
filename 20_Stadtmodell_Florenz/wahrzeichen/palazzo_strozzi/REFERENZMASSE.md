# Referenzmaße – Palazzo Strozzi (V3 D4, Wahrzeichen-Welle 4)

Projekt-ID `palazzo_strozzi`. Maßstab 1:2 (**Blöcke = 2 · m**), Weltkoordinaten des Stadtmodells. Stand 15.10.2026.
Stufen: **A** mehrere Quellen übereinstimmend oder amtliche Quelle, **B** eine Quelle oder aus OSM/DGM gemessen, **C** Schätzung (Proportion). Entwurf: [`BAUTEIL_KATALOG.md`](BAUTEIL_KATALOG.md). Gemeinsamer Bauplan der Palazzi: `tools/wahrzeichen/palazzo.js`.

## 1. Rahmen und OSM

| Größe | Wert | Quelle |
|---|---|---|
| OSM-Objekt | Relation **r2951949** „Palazzo Strozzi“ (`building:levels=3`), **9.445 Zellen**, ein Hof (Loch) | `data/stadt/gebaeude.json` |
| **Rahmen `PS`** | Ursprung (−881 \| 387,5) = Nordwestecke, **θ = −2°**; u nach Osten (Via Tornabuoni → Piazza Strozzi), w nach Süden | gefittet an der Nordseite |
| Umriss | u 0..114,1 × w 0..87,8 (**57 × 44 m**); Hof u 40,8..71,3 × w 35,4..53 (15 × 9 m) | gemessen |
| Gelände | 63–66 (63: 1.996, **64: 5.263**, 65: 2.164); Straßen ringsum 63–64 | `tools/city/ground_stadt.js` |
| **`bodenY`** | **64** | Entwurf, B |

## 2. Maße (Literatur gegen OSM)

| Maß | Modell | Literatur | Bewertung |
|---|---|---|---|
| Geschosse | 3 (Lagen 24 + 20 + 18) | `building:levels=3`; drei Geschosse mit Biforen in den Obergeschossen ([it.wikipedia](https://it.wikipedia.org/wiki/Palazzo_Strozzi)) | Zahl A, Höhen C |
| Traufe | Lage 62 = **31 m** | Bauhöhe rund 32 m (Reiseführer, nicht amtlich) | C |
| Fassade | Rustika auf allen Seiten, drei Portale | Benedetto da Maiano ab **1489**, Kranzgesims Il Cronaca, Bau bis **1538** (it.wikipedia) | A |

## 3. Entwurfswerte (Stufe C)
Fensterraster 11 Blöcke, Fenster 4 breit; Erdgeschossfenster Lage 12..17, Biforen 28..39 und 48..58; Hofarkaden Joch 7, Kämpfer 9; Loggia 5 tief; Walmdach 6 Lagen.
