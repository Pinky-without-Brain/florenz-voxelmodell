# Referenzmaße – Palazzo del Bargello (V3 D4, Wahrzeichen-Welle 4)

Projekt-ID `bargello`. Maßstab 1:2 (**Blöcke = 2 · m**). Stand 15.10.2026. Stufen A/B/C wie in den übrigen Referenzmaßen. Entwurf: [`BAUTEIL_KATALOG.md`](BAUTEIL_KATALOG.md). Bauplan: `tools/wahrzeichen/palazzo.js`.

## 1. Rahmen und OSM

| Größe | Wert | Quelle |
|---|---|---|
| OSM-Objekt | Relation **r1461750** (Palazzo del Bargello), **8.378 Zellen**, zwei Höfe (Löcher); Teile w361442657 (Westflügel) und **w361442658 „Torre Volognana“ (`height=57 m`)** | `data/stadt/gebaeude.json` |
| **Rahmen `BA`** | achsparallel, θ = 0°, Ursprung (153,5 \| 560): u = x − 153,5, w = z − 560 | Südseite achsparallel |
| Umriss | u 0..137 × w 0..83; großer Hof u 40..86 × w 24,5..63,5, kleiner Hof u 105..118 × w 28,5..51 | gemessen |
| Gelände | 62–64 (**63: 4.285**, 64: 3.581) | `tools/city/ground_stadt.js` |
| **`bodenY`** | **64** | Entwurf, B |

## 2. Maße (Literatur gegen OSM)

| Maß | Modell | Literatur | Bewertung |
|---|---|---|---|
| Turm | Spitze Lage 114 = **57 m** | OSM `height=57 m` | B |
| Bau | Block mit Zinnen und Hof | ab **1255** als Palazzo del Popolo; Hoftreppe Neri di Fioravante **1345**; Museum seit **1865** ([it.wikipedia](https://it.wikipedia.org/wiki/Palazzo_del_Bargello)) | A |
| Geschosse | 3 (20 + 18 + 16 Lagen) | – | C |

## 3. Entwurfswerte (Stufe C)
Fensterraster 14, Biforen 3 breit; Zinnen 4 Lagen über der Traufe; Hofarkaden nur im großen Hof (Joch 8, Kämpfer 12); die Freitreppe des Hofs ist durch die innere Wendeltreppe ersetzt.
