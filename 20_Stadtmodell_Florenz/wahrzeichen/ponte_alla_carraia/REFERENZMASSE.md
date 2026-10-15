# Referenzmaße – Ponte alla Carraia (V3 D4, Wahrzeichen-Welle 4)

Projekt-ID `ponte_alla_carraia`. Maßstab 1:2 (**Blöcke = 2 · m**). Stand 15.10.2026. Stufen A/B/C wie in den übrigen Referenzmaßen. Entwurf: [`BAUTEIL_KATALOG.md`](BAUTEIL_KATALOG.md). Bauplan: `tools/wahrzeichen/bruecke.js`.

## 1. Rahmen und OSM (alle Werte aus der Maske gemessen, `geometrie()` in `tools/wahrzeichen/bruecke.js`)

| Größe | Wert | Quelle |
|---|---|---|
| OSM-Objekt | Fläche **w167595838** (`man_made=bridge`) in `flaechen.json` → `bruecken`; `project.json`: `"gebaeude": []`, `"flaechen": ["w167595838"]` | `data/stadt/flaechen.json` |
| **Rahmen** | Ursprung (−1488 | 594), **θ = 120,3°**; u über die Brücke, w quer | gefittet an der Achse |
| Länge | u -41..227 = **134,0 m** | gemessen |
| Breite (Median) | **27.8 Blöcke** = 13,9 m | gemessen |
| Wasserspiegel W | **Y 50** (Median des Geländes in der Brückenmitte) | `tools/city/ground_stadt.js` |
| Flussbereich | u -35..227 | Gelände ≤ W + 1 |
| Pfeiler (Vorköpfe) | u 1..9, u 57..66, u 123..131, u 180..188 | Umriss breiter als Median + 2 |
| Bögen | u -35..1, u 9..57, u 66..123, u 131..180, u 188..227 | zwischen Ufer und Pfeilern |
| Fahrbahn an den Enden | Y 62 / Y 58 (Straße hinter dem Brückenende) | Gelände |

## 2. Literatur

erste Brücke **1218–1220**; heute **5 Bögen**, **140 m** lang, **14 m** breit; Neubau Ettore Fagiuoli ab **1948** ([it.wikipedia](https://it.wikipedia.org/wiki/Ponte_alla_Carraia)). Zahl der Bögen im Modell = Zahl aus dem OSM-Umriss; sie stimmt mit der Literatur überein.

## 3. Entwurfswerte (Stufe C)
ellipse, Kämpfer W + 2, Scheitelstärke 2, Überhöhung 1; Brüstung 2 Blöcke mit Deckstein aus Pietra serena, Laternen alle 12 Blöcke.
