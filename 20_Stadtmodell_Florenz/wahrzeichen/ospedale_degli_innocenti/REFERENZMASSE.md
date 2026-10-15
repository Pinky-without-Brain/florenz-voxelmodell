# Referenzmaße – Spedale degli Innocenti (V3 D4, Wahrzeichen-Welle 4)

Projekt-ID `ospedale_degli_innocenti`. Maßstab 1:2 (**Blöcke = 2 · m**). Stand 15.10.2026. Stufen A/B/C wie in den übrigen Referenzmaßen. Entwurf: [`BAUTEIL_KATALOG.md`](BAUTEIL_KATALOG.md). Bauplan: `tools/wahrzeichen/palazzo.js`.

## 1. Rahmen und OSM

| Größe | Wert | Quelle |
|---|---|---|
| OSM-Objekt | Relation **r7085758** „Spedale degli Innocenti“, **23.183 Zellen**, vier Löcher; Teil w674051052 „Chiostro delle Donne“ | `data/stadt/gebaeude.json` |
| **Rahmen `OI`** | Ursprung (657,5 \| −772) = Nordende der Loggia, **θ = 37,2°**; u von der Piazza ins Gebäude, w entlang der Loggia nach Süden | Front gerade (w 0..139,9 bei u 0) |
| Loggia | Front **139,9 Blöcke = 70 m** | gemessen |
| Höfe | Loch 3: Chiostro degli Uomini (u 39..71 × w 40..70), Loch 2 im Chiostro delle Donne, zwei kleine Lichthöfe | gemessen |
| Gelände | 63–68, Piazza vor der Loggia 66 | `tools/city/ground_stadt.js` |
| **`bodenY`** | **66** (bündig mit der Piazza; die Stufen vor der Loggia sind nicht modelliert) | Entwurf, B |

## 2. Maße (Literatur gegen OSM)

| Maß | Modell | Literatur | Bewertung |
|---|---|---|---|
| Loggia | **9 Bögen** à 14 Blöcke (7 m) zwischen w 7 und 133 | Brunelleschi ab **1419**, neun Bögen, korinthische Säulen aus Pietra serena; Medaillons Andrea della Robbia **1487** ([it.wikipedia](https://it.wikipedia.org/wiki/Spedale_degli_Innocenti)) | Zahl A, Jochmaß B (aus der OSM-Front) |
| Geschosse | Loggia + Obergeschoss (20 + 14 Lagen) | – | C |
| Fenster | eins über jedem Bogen | it.wikipedia | A |

## 3. Entwurfswerte (Stufe C)
Bogenkämpfer Lage 13, Scheitel 19; Loggia 11 Blöcke tief, Rückwand mit Türen; Hofarkaden im Chiostro degli Uomini (Joch 6, Kämpfer 9, Loggia 4); Walmdach 5 Lagen.
