# Referenzmaße – Palazzo Rucellai (V3 D4, Wahrzeichen-Welle 4)

Projekt-ID `palazzo_rucellai`. Maßstab 1:2 (**Blöcke = 2 · m**). Stand 15.10.2026. Stufen A/B/C wie in den übrigen Referenzmaßen. Entwurf: [`BAUTEIL_KATALOG.md`](BAUTEIL_KATALOG.md). Bauplan: `tools/wahrzeichen/palazzo.js`.

## 1. Rahmen und OSM

| Größe | Wert | Quelle |
|---|---|---|
| OSM-Objekt | Relation **r4103996** „Palazzo Rucellai“, **3.487 Zellen**, ein Hof (Loch) | `data/stadt/gebaeude.json` |
| **Rahmen `PR`** | Ursprung (−1204,5 \| 459) = Westecke der Fassade, **θ = −13,5°**; u entlang der Fassade nach Osten, w < 0 ins Gebäude | gefittet an der Fassadenkante (53,5 Blöcke) |
| Umriss | Fassade u 0..53,5 (**26,8 m**), Tiefe bis w −77; Hof u 12..25 × w −65..−44 | gemessen |
| Gegenüber | Loggia Rucellai (w307295758) bei u 63..74, w 10..44 – eigenes Gebäude, nicht Teil des Projekts | `gebaeude.json` |
| Gelände | 59–60 (59: 2.049, 60: 1.440); Straße vor der Fassade 59 | `tools/city/ground_stadt.js` |
| **`bodenY`** | **60** | Entwurf, B |

## 2. Maße (Literatur gegen OSM)

| Maß | Modell | Literatur | Bewertung |
|---|---|---|---|
| Fassade | 7 Achsen, 3 Pilasterordnungen, Biforen, 2 Portale | Leon Battista Alberti, um **1446–51**, Ausführung Bernardo Rossellino; dorisch–ionisch–korinthisch ([it.wikipedia](https://it.wikipedia.org/wiki/Palazzo_Rucellai)) | A |
| Geschosse | 3 (Lagen 20 + 17 + 15, Traufe 26 m) | drei Geschosse (it.wikipedia) | Zahl A, Höhen C |

## 3. Entwurfswerte (Stufe C)
Achse 7,64 Blöcke, Pilaster 2 Blöcke breit; Erdgeschossfenster Lage 10..14, Biforen 23..33 und 40..49; Sitzbank Lage 1..2; Hof mit Arkaden (Joch 6, Kämpfer 9, Loggia 3 tief); Walmdach 5 Lagen.
