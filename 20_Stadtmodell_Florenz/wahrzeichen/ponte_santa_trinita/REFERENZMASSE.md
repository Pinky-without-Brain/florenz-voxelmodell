# Referenzmaße – Ponte Santa Trinita (V3 D4, Wahrzeichen-Welle 4)

Projekt-ID `ponte_santa_trinita`. Maßstab 1:2 (**Blöcke = 2 · m**). Stand 15.10.2026. Stufen A/B/C wie in den übrigen Referenzmaßen. Entwurf: [`BAUTEIL_KATALOG.md`](BAUTEIL_KATALOG.md). Bauplan: `tools/wahrzeichen/bruecke.js`.

## 1. Rahmen und OSM (alle Werte aus der Maske gemessen, `geometrie()` in `tools/wahrzeichen/bruecke.js`)

| Größe | Wert | Quelle |
|---|---|---|
| OSM-Objekt | Fläche **w167367668** (`man_made=bridge`) in `flaechen.json` → `bruecken`; `project.json`: `"gebaeude": []`, `"flaechen": ["w167367668"]` | `data/stadt/flaechen.json` |
| **Rahmen** | Ursprung (−1010 | 839), **θ = 112°**; u über die Brücke, w quer | gefittet an der Achse |
| Länge | u -1..200 = **100,5 m** | gemessen |
| Breite (Median) | **21.5 Blöcke** = 10,8 m | gemessen |
| Wasserspiegel W | **Y 50** (Median des Geländes in der Brückenmitte) | `tools/city/ground_stadt.js` |
| Flussbereich | u 3..198 | Gelände ≤ W + 1 |
| Pfeiler (Vorköpfe) | u 59..70, u 133..144 | Umriss breiter als Median + 2 |
| Bögen | u 3..59, u 70..133, u 144..198 | zwischen Ufer und Pfeilern |
| Fahrbahn an den Enden | Y 64 / Y 65 (Straße hinter dem Brückenende) | Gelände |

## 2. Literatur

Bartolomeo Ammannati **1567–1570**, drei Bögen mit elliptischem Profil (umgekehrte Kettenlinie), **108 m** lang, **11 m** breit; gesprengt 3.8.1944, wieder eröffnet **1958**; Statuen der Jahreszeiten **1608** ([it.wikipedia](https://it.wikipedia.org/wiki/Ponte_Santa_Trinita)). Zahl der Bögen im Modell = Zahl aus dem OSM-Umriss; sie stimmt mit der Literatur überein.

## 3. Entwurfswerte (Stufe C)
ellipse, Kämpfer W + 3, Scheitelstärke 2, Überhöhung 2, Statuen an den Ecken; Brüstung 2 Blöcke mit Deckstein aus Pietra serena, Laternen alle 12 Blöcke.
