# Referenzmaße – Ponte alle Grazie (V3 D4, Wahrzeichen-Welle 4)

Projekt-ID `ponte_alle_grazie`. Maßstab 1:2 (**Blöcke = 2 · m**). Stand 15.10.2026. Stufen A/B/C wie in den übrigen Referenzmaßen. Entwurf: [`BAUTEIL_KATALOG.md`](BAUTEIL_KATALOG.md). Bauplan: `tools/wahrzeichen/bruecke.js`.

## 1. Rahmen und OSM (alle Werte aus der Maske gemessen, `geometrie()` in `tools/wahrzeichen/bruecke.js`)

| Größe | Wert | Quelle |
|---|---|---|
| OSM-Objekt | Fläche **w167368139** (`man_made=bridge`) in `flaechen.json` → `bruecken`; `project.json`: `"gebaeude": []`, `"flaechen": ["w167368139"]` | `data/stadt/flaechen.json` |
| **Rahmen** | Ursprung (361 | 1398), **θ = 106,6°**; u über die Brücke, w quer | gefittet an der Achse |
| Länge | u -1..281 = **141,0 m** | gemessen |
| Breite (Median) | **30.4 Blöcke** = 15,2 m | gemessen |
| Wasserspiegel W | **Y 51** (Median des Geländes in der Brückenmitte) | `tools/city/ground_stadt.js` |
| Flussbereich | u 1..271 | Gelände ≤ W + 1 |
| Pfeiler (Vorköpfe) | u 53..56, u 116..120, u 176..179, u 236..238 | Umriss breiter als Median + 2 |
| Bögen | u 1..53, u 56..116, u 120..176, u 179..236, u 238..271 | zwischen Ufer und Pfeilern |
| Fahrbahn an den Enden | Y 67 / Y 69 (Straße hinter dem Brückenende) | Gelände |

## 2. Literatur

ursprünglich Rubaconte (neun Bögen); heute **5 Felder**, **150 m** lang, **14,5 m** breit; Michelucci, Detti, Gizdulich, Santi, Melucci; eingeweiht **24.2.1957** ([it.wikipedia](https://it.wikipedia.org/wiki/Ponte_alle_Grazie)). Zahl der Bögen im Modell = Zahl aus dem OSM-Umriss; sie stimmt mit der Literatur überein.

## 3. Entwurfswerte (Stufe C)
segment, Kämpfer W + 2, Scheitelstärke 2; Brüstung 2 Blöcke mit Deckstein aus Pietra serena, Laternen alle 12 Blöcke.
