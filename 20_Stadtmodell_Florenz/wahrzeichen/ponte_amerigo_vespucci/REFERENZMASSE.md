# Referenzmaße – Ponte Amerigo Vespucci (V3 D4, Wahrzeichen-Welle 4)

Projekt-ID `ponte_amerigo_vespucci`. Maßstab 1:2 (**Blöcke = 2 · m**). Stand 15.10.2026. Stufen A/B/C wie in den übrigen Referenzmaßen. Entwurf: [`BAUTEIL_KATALOG.md`](BAUTEIL_KATALOG.md). Bauplan: `tools/wahrzeichen/bruecke.js`.

## 1. Rahmen und OSM (alle Werte aus der Maske gemessen, `geometrie()` in `tools/wahrzeichen/bruecke.js`)

| Größe | Wert | Quelle |
|---|---|---|
| OSM-Objekt | Fläche **w168134458** (`man_made=bridge`) in `flaechen.json` → `bruecken`; `project.json`: `"gebaeude": []`, `"flaechen": ["w168134458"]` | `data/stadt/flaechen.json` |
| **Rahmen** | Ursprung (−2155 | 180), **θ = 121,3°**; u über die Brücke, w quer | gefittet an der Achse |
| Länge | u -2..324 = **163,0 m** | gemessen |
| Breite (Median) | **43.0 Blöcke** = 21,5 m | gemessen |
| Wasserspiegel W | **Y 41** (Median des Geländes in der Brückenmitte) | `tools/city/ground_stadt.js` |
| Flussbereich | u 15..301 | Gelände ≤ W + 1 |
| Pfeiler (Vorköpfe) | u 100..109, u 215..224 | Umriss breiter als Median + 2 |
| Bögen | u 15..100, u 109..215, u 224..301 | zwischen Ufer und Pfeilern |
| Fahrbahn an den Enden | Y 59 / Y 59 (Straße hinter dem Brückenende) | Gelände |

## 2. Literatur

**1955–1957**, G. G. Gori, E. Gori, E. Nelli, Ingenieur Riccardo Morandi; **3 Felder**, **163 m** lang, bis **22,5 m** breit; Pfeiler mit Pietra forte verkleidet, Fahrbahn Porphyr ([it.wikipedia](https://it.wikipedia.org/wiki/Ponte_Amerigo_Vespucci)). Zahl der Bögen im Modell = Zahl aus dem OSM-Umriss; sie stimmt mit der Literatur überein.

## 3. Entwurfswerte (Stufe C)
segment, Kämpfer W + 2, Scheitelstärke 2 (die eiserne Brüstung des Originals ist als Steinbrüstung vereinfacht); Brüstung 2 Blöcke mit Deckstein aus Pietra serena, Laternen alle 12 Blöcke.
