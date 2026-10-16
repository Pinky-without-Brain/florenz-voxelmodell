# Referenzmaße – Grotta del Buontalenti (V5c)

Projekt-ID `grotta_buontalenti`. Maßstab 1:2 (**Blöcke = 2 · m**). Stand 16.10.2026. Stufen A (belegt), B (abgeleitet), C (Entwurf). Entwurf: [`BAUTEIL_KATALOG.md`](BAUTEIL_KATALOG.md).

## 1. Rahmen und OSM

| Größe | Wert | Quelle |
|---|---|---|
| OSM-Objekt | Way **w473825750** „Grotta del Buontalenti“ (wikidata Q3117120), **497 Zellen**, davon 55 vom Corridoio Oltrarno (Pitti, Modul 9) belegt, Modellmaske **442 Zellen**; Parallelogramm mit abgeschnittener Westecke (`hauptGrenzen.abzugProjekte`) | `data/stadt/gebaeude.json` |
| Lage | Mitte ≈ (−775 \| 1560), Boboli-Garten am Hang | OSM |
| **Rahmen `GB`** | Ursprung (−769,5 \| 1544), **θ = 59,7°**; u entlang der Fassadenkante (0..18), w ins Gebäude (0..≈ 22) | Kante F–G des Umrisses |
| Gelände | vor der Fassade 76, hinten 77, im Westen bis 70 (`tools/city/ground_stadt.js`) | gemessen |
| **`bodenY`** | **76** (Boden = Gelände vor der Fassade); im Umriss trägt `spec/ground.js` den Hang bis Y 75 ab | Entwurf, B |

## 2. Inhalt (Literatur gegen Modell)

| Merkmal | Modell | Literatur | Bewertung |
|---|---|---|---|
| Baugeschichte | Vasari begann den unteren Teil der Fassade, Buontalenti baute **1583–1593** für Francesco I. de' Medici | it.wikipedia „Grotta del Buontalenti“ | A |
| Fassade | weiter Eingang zwischen zwei Säulen, darüber schwammartiger Tropfstein; seitlich Nischen mit Ceres und Apollo (Bandinelli); Medici-Wappen im Giebelfeld | it.wikipedia | A |
| Kammer 1 | größter Raum, bemaltes Gewölbe wie eine Pergola (Bernardino Poccetti) mit zentralem Oculus; in den Ecken Kopien der vier „Gefangenen“ Michelangelos (Originale bis 1924 hier, heute Galleria dell'Accademia) | it.wikipedia | A |
| Kammer 2 | kleiner, Fresken mit Muschel- und Tropfsteinschmuck; „Paris entführt Helena“ von Vincenzo de' Rossi (1560) | it.wikipedia | A |
| Kammer 3 | als Grotte gestaltet, gemalter Himmel mit Vögeln; Giambolognas „Venus“ über einem Marmorbecken, in das vier Satyrn Wasser spritzten | it.wikipedia | A |
| Maße | in den Quellen nicht angegeben; Umriss aus OSM, Höhen frei | – | C |

## 3. Entwurfswerte (Stufe C)
Fassadenwand 3 Blöcke dick bis Lage 11 (Kranzgesims 12, Giebel bis 15), Eingang 5 × 7; Kammern w 3..8 / 10..13,5 / 15,5..≈ 21, Trennwände 2 dick mit Durchgängen 5 × 7; Tonnengewölbe Kämpfer Lage 5, Krone Lage 10; Dachplatte Lage 12; Oculus Radius ≈ 2 in Kammer 1. Figuren sind Blockfiguren 3–7 Blöcke hoch. Alle Gestaltung vereinfacht, nicht nach Vorbild.
