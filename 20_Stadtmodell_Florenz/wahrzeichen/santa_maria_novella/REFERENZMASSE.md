# Referenzmaße – Basilica di Santa Maria Novella (V3 D3, Wahrzeichen-Welle 3)

Projekt-ID `santa_maria_novella`. Maßstab 1:2 (**Blöcke = 2 · m**). Stand 14.10.2026. Stufen A/B/C wie in den anderen Katalogen. Entwurf: [`BAUTEIL_KATALOG.md`](BAUTEIL_KATALOG.md).

## 1. Rahmen und OSM

| Größe | Wert | Quelle |
|---|---|---|
| Kirche | Way **w449369047**, 15.473 Zellen | `data/stadt/gebaeude.json` |
| Campanile | Way **w449369043** (`man_made=tower`, `tower:type=bell_tower`), 174 Zellen; vorher Haus in `quartier_palazzuolo` | `gebaeude.json` |
| **Rahmen `SMN`** | Ursprung (**−1226,9 \| −214,5**) = Mitte der Fassade (Süden, Piazza Santa Maria Novella), **θ = −90°**: u = −(z + 214,5) nach Norden zum Chor, w = x + 1226,9 (w > 0 Osten) | OSM-Kanten achsparallel |
| Gelände | 57–60, Piazza vor der Fassade 60 | `ground_stadt.js` |
| **`bodenY`** | **61** (eine Stufe über der Piazza) | Entwurf |

Polygon im Rahmen (u \| w): Langhaus u 0..119/131 × w −33,6..33,9; Querhaus bis w −52,6 (West, ab u 119) und 69,9 (Ost, ab u 131,5) bis u ≈ 175; Chorkapellen u 175..206: Cappella Tornabuoni w −14..19, seitliche Kapellen bis w −41 / 46; Campanile u 153,5..168 × w −51,6..−38,6 (in der Nische des Westarms).

## 2. Maße

| Maß | Modell | Literatur | Bewertung |
|---|---|---|---|
| Länge | u 0..206 = 103 m außen | **99,20 m** ([it.wikipedia](https://it.wikipedia.org/wiki/Basilica_di_Santa_Maria_Novella)) | innen passt. A |
| Breite | außen 67,5 Blöcke = 33,8 m, innen 60 = 30 m | **28,20 m** | +6 %; OSM gewinnt (Mauern 1,5 m). B |
| Querhaus | w −52,6..69,9 = **61,3 m** | **61,54 m** | A |
| Joche | **6**, nach Norden kürzer: Länge im Verhältnis 15 : 11,5 m verteilt auf u 3..140 | „sei campate … circa 15 m verso la facciata e 11,50 m verso l'altare“ (it.wikipedia) | Verhältnis A, absolute Länge aus OSM (B) |
| Gewölbe | Kreuzrippengewölbe, Spitzbögen, Bündelpfeiler | it.wikipedia, Lernseiten | A |
| Fassade | **quadratisch** (Breite = Höhe = 67 Blöcke), Mittelportal 1,5 × Breite hoch, Rosette (1365–67), Voluten, Rucellai-Segel im Fries, Sonnenscheibe im Giebel; weißer und grüner Marmor; Alberti, vollendet 1470 | it.wikipedia | A (Proportionen) |
| Campanile | 14,5 × 13 Blöcke, Spitze Lage 136 = Y 197 (**68 m**) | „oltre 68 metri“, Jacopo Talenti 1332–33, Triforen, gotische Spitze (it.wikipedia) | A |

## 3. Entwurfswerte (Stufe C)
Mittelschiff |w| < 9 bis zu den Pfeilern (|w| 9..13), Seitenschiffe bis |w| 30; Arkaden Kämpfer 24, Scheitel 40; Gewölbe Mittelschiff 44..54 (27 m), Seitenschiffe 26..42; Dach Mittelschiff First 64, Traufe 56; Pultdächer 50 → 45; Okuli im Obergaden auf Lage 52; Chor Gewölbe bis 50; Glockenstube Lage 104..116.
