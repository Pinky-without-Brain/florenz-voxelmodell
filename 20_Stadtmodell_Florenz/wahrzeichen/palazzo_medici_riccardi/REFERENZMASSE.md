# Referenzmaße – Palazzo Medici Riccardi (V3 D4, Wahrzeichen-Welle 4)

Projekt-ID `palazzo_medici_riccardi`. Maßstab 1:2 (**Blöcke = 2 · m**). Stand 15.10.2026. Stufen A/B/C wie in den übrigen Referenzmaßen. Entwurf: [`BAUTEIL_KATALOG.md`](BAUTEIL_KATALOG.md). Bauplan: `tools/wahrzeichen/palazzo.js`.

## 1. Rahmen und OSM

| Größe | Wert | Quelle |
|---|---|---|
| OSM-Objekt | Relation **r1379977** „Palazzo Medici Riccardi“ (`building:levels=3`), **15.283 Zellen**, drei Löcher | `data/stadt/gebaeude.json` |
| Löcher | 0: Riccardi-Hof (u −52..−19, w −99..−84), 1: Michelozzos Hof (u −53..−34, w −51..−31), 2: Garten (u −114..−75, w −84..−18) | gemessen |
| **Rahmen `PM`** | Ursprung (−196,5 \| −379) = Ecke Via Cavour / Via de' Gori, **θ = 24°**; u < 0 von der Via Cavour ins Gebäude, w < 0 von der Via de' Gori nach Norden | gefittet an der Front zur Via Cavour |
| Gelände | 61–65 (64: 5.163, **65: 8.925**); Via Cavour 64 | `tools/city/ground_stadt.js` |
| **`bodenY`** | **65** | Entwurf, B |

## 2. Maße (Literatur gegen OSM)

| Maß | Modell | Literatur | Bewertung |
|---|---|---|---|
| Bau | 3 Geschosse, abgestufte Rustika, Kranzgesims | Michelozzo ab **1444** für Cosimo il Vecchio; Riccardi ab **1659** ([it.wikipedia](https://it.wikipedia.org/wiki/Palazzo_Medici_Riccardi)) | A |
| Hof | Rundbogenarkaden | Michelozzos Hof (it.wikipedia) | A; im OSM-Loch kleiner (10 × 10 m) als das Original, OSM gewinnt |
| Höhen | Geschosse 22 + 18 + 16 Lagen, Traufe 28 m | – | C |

## 3. Entwurfswerte (Stufe C)
Fensterraster 10, Biforen 4 breit; Hofarkaden Joch 7, Kämpfer 11, Loggia 5; Garten mit Rasen und Türen; Walmdach 6 Lagen.
