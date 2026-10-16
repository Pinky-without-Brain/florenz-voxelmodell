# Referenzmaße – Loggia del Bigallo (W5c)

Projekt-ID `loggia_del_bigallo`. Maßstab 1:2 (**Blöcke = 2 · m**). Stand 16.10.2026. Stufen: A (belegt), B (abgeleitet), C (Entwurf, begründet). Entwurf: [`BAUTEIL_KATALOG.md`](BAUTEIL_KATALOG.md).

## 1. Rahmen und OSM

| Größe | Wert | Quelle |
|---|---|---|
| OSM-Objekt | Way **w166821304** „Loggia del Bigallo“ (wikidata Q2705376, `building:levels` 3, Höhe 23 Blöcke aus den Ebenen), **429 Zellen**, Viereck 34,6 × 12,5 Blöcke (≈ 17 × 6 m), um ≈ 4° gedreht | `data/stadt/gebaeude.json` |
| Lage | Mitte ≈ (−275 \| 79), Ecke Piazza San Giovanni (Nordkante, 34,6) / Via dei Calzaiuoli (Ostkante, 12,5); Süd- und Westkante grenzen an Nachbarhäuser | OSM, Straßenabgleich |
| **Rahmen `BG`** | Ursprung (−292,5 \| 74) = Nordwestecke, **θ = −4,14°**; u entlang der Nordkante (0..33,6), w nach Süden (0..12,8) | Kante 0 des Umrisses |
| Gelände | Straßen und Plätze ringsum 64, im Süden bis 65 | `tools/city/ground_stadt.js` |
| **`bodenY`** | **64** (Straßenhöhe vor den Bögen); Dachfirst Lage 22 (≈ 11 m, passt zu den 23 Blöcken der Daten) | Entwurf, B |

## 2. Inhalt (Literatur gegen Modell)

| Merkmal | Modell | Literatur | Bewertung |
|---|---|---|---|
| Bauzeit | ältester Kern 1321; Oratorium und Loggia 1352–1360; Brand 1442, Obergeschoss erneuert (Fresken um 1444) | it.wikipedia „Loggia del Bigallo“ | A |
| Architekt | traditionell Alberto Arnoldi zugeschrieben (nicht dokumentiert) | it.wikipedia | A |
| Arkaden | **drei Arkaden zur Piazza San Giovanni**, **eine Öffnung zur Via dei Calzaiuoli**; historisch zwei der drei zugemauert (1698), 1865 wieder geöffnet | it.wikipedia | A (Modell: alle vier offen, vereinfacht) |
| Marmor | dritte Arkade mit mehrfarbigem Marmor (Propheten, Engel, Tugenden, Verkündigung), 1353–58 Ambrogio di Renzo zugeschrieben; Gitter von Francesco Petrucci (1358, 1698 entfernt) | it.wikipedia | A (Muster C) |
| Tabernakel | drei Tabernakel von 1425: Madonna mit Kind, San Pietro Martire, Santa Lucia; Lünette mit Madonna (Arnoldi, 1361) über der mittleren Arkade | it.wikipedia | A |
| Wappen | rotes Kreuz der Misericordia (Initialen FM), kombiniertes Bigallo-Misericordia-Wappen am Palazzo | it.wikipedia | A |
| Obergeschoss | **drei Bifore an der Piazza-Front, eine an der Via dei Calzaiuoli** | it.wikipedia | A |
| Museum | drei Säle: Saal 1 Kruzifix des Maestro del Bigallo (1235–1255), Fresken der Werkstatt Nardo di Cione; Saal 2 Triptychon von Bernardo Daddi (1333); Saal 3 Fresko Misericordia Domini (um 1350) mit einer der ältesten Stadtansichten von Florenz, umgeben von 18 Männern und 18 Frauen | it.wikipedia | A |
| Zugang zum Museum | über den Eingang des angrenzenden Palazzo; die Treppe ist in den Quellen nicht beschrieben | it.wikipedia | C (Treppe in der Halle frei gewählt) |
| Maße in Metern | nennt keine geprüfte Quelle (en.wikipedia lieferte 404) | – | fehlt |

## 3. Entwurfswerte (Stufe C, Begründung: keine Maße in den Quellen)
Erdgeschoss Luft Lage 1..8, Obergeschossboden Lage 9, Obergeschoss Luft 10..17, Decke 18, Walmdach bis 22. Wände Nord und Ost 3 dick (Fassaden), Süd und West 2 dick. Halle u < 9,4, Trennwand 9,4..11,6, Loggia ab u 11,6 (drei Joche, Rundbögen 4,6 breit bei u 15,8 / 22,3 / 28,8, östlicher Bogen 5 breit), Trennwand der Säle bei u 22,5..24,7, Türen 3 × 5. Die Aufteilung in Halle (Palazzo) und Loggia innerhalb eines OSM-Umrisses ist ein Entwurf; ob der Umriss auch den angrenzenden Palazzo umfasst, ist nicht belegt.
