# Referenzmaße – Basilica di Santa Maria del Carmine (V3 D3, Wahrzeichen-Welle 3)

Projekt-ID `santa_maria_del_carmine`. Maßstab 1:2 (**Blöcke = 2 · m**), Weltkoordinaten des Stadtmodells. Stand 15.10.2026.
Stufen: **A** mehrere Quellen übereinstimmend oder amtliche Quelle, **B** eine Quelle oder aus OSM/DGM gemessen, **C** Schätzung (Proportion). Entwurf: [`BAUTEIL_KATALOG.md`](BAUTEIL_KATALOG.md).

## 1. Rahmen und OSM

| Größe | Wert | Quelle |
|---|---|---|
| OSM-Objekt | Way **w118425485** „Basilica di Santa Maria del Carmine“ (`building=basilica`), **10.347 Zellen**; Teil w675876434 (Achteck der Vierung) | `data/stadt/gebaeude.json` |
| Kloster | r1632337 (`building=monastery`) – nicht Teil dieses Projekts (Quartier Carmine) | `gebaeude.json` |
| Campanile | in den OSM-Daten nicht als eigenes Gebäude erfasst – im Modell nicht gebaut | `gebaeude.json` |
| **Rahmen `CM`** | Ursprung (**−2055,5 \| 1133,75**) = Mitte der Fassadenlinie, **θ = 101,5°**; **u** von der Fassade (Norden) zum Chor (Süden), **w** quer, w > 0 Westen (Cappella Brancacci), w < 0 Osten (Cappella Corsini) | gefittet an den Langseiten (101,2° und 101,9°) |
| Gelände | `groundTopY` im Footprint 58–61 (58: 3.561, **59: 5.772**, 60: 815, 61: 199 Zellen); Vorplatz vor dem Portal 60 | `tools/city/ground_stadt.js` |
| **`bodenY`** | **60** (bündig mit dem Vorplatz) | Entwurf, B |

### Polygon im Rahmen `CM` (gemessen, u \| w in Blöcken)
- **Langhaus** u 0..97,3 × w −21,8..21,4 (außen 43 Blöcke = 21,5 m).
- **Querhaus** u 97..163: Ostarm bis w −33,7 (u 97..105,6) und −64,2 (u 105,6..150,4, Cappella Corsini u 120,8..150,4 ab w −44,5), Westarm u 111,9..162,2 bis w 42.
- **Achteck der Vierung** (w675876434) u 118,1..153,6 × w −18,3..17,2, Mitte (135,8 \| −0,5).
- **Chor** u 162..180,9 × w −14,2..12.

## 2. Maße (Literatur gegen OSM)

| Maß | OSM / Modell | Literatur | Bewertung |
|---|---|---|---|
| Grundriss | einschiffig, lateinisches Kreuz | „navata unica con pianta a croce latina“ ([it.wikipedia](https://it.wikipedia.org/wiki/Basilica_di_Santa_Maria_del_Carmine_(Firenze))) | A |
| Länge | außen u 0..180,6 = 90,3 m; innen ≈ 88 m | „m. **82x15**“ (it.wikipedia) | +7 %; OSM gewinnt (Polygon), die Literaturzahl misst vermutlich ohne Chor. B |
| Breite Schiff | innen |w| < 15 = **30 Blöcke = 15 m** | **15 m** (it.wikipedia) | A |
| Kuppel | Vierungskuppel innen bis Lage 68, außen bis Lage 70 = **35 m** | „altezza della cupola di **35**“ (it.wikipedia) | A |
| Kapellen | **5** flache Kapellen je Seite, 4,5 Blöcke tief | „cinque cappelle laterali poco profonde per lato“ (it.wikipedia) | A (Zahl), Tiefe C |
| Cappella Brancacci | Kopf des rechten Querarms | Fresken von Masolino, Masaccio, Filippino Lippi; vom Brand 1771 verschont (it.wikipedia) | A |
| Cappella Corsini | Kopf des linken Querarms, eigene Kuppel | Pier Francesco Silvani **1675–1683**; Kuppelfresko Luca Giordano **1682**, Stuck Foggini (it.wikipedia) | A |
| Brand und Neubau | | Brand **Januar 1771**; Giuseppe Ruggieri († 1772), dann Giulio Mannaioni; Ausmalung Giuseppe Romei ab **1774**, Quadratur Domenico Stagi (it.wikipedia) | A |
| Chorkuppel | oval | „cupola ellittica“ mit der Entrückung des Elias (Romei) (it.wikipedia) | A (Form) |
| Fassade | rohes Mauerwerk | „alta e grezza mole in pietrame e laterizio“, unvollendet (it.wikipedia) | A |

## 3. Entwurfswerte ohne Beleg (Stufe C)
- Tonne des Schiffs Kämpfer Lage 34, Scheitel 42 (21 m); Dach First 54, Traufe 46; Kapellendecken Lage 22.
- Querhaus flache Decke Lage 40, Dach First 52; Cappella Brancacci Decke 26, Dach 32; Corsini-Kuppel ab Lage 36 (Radius innen 8, außen 9,5).
- Vierung: Pfeiler und Bögen bis Lage 40 (Bogenscheitel 35), Tambour bis 53 mit Fenstern 45..50, Kuppel innen Radius 15, außen 17,5; Laterne bis Lage 78.
- Chor: ovale Kuppel 36..44, Dach 50; Fassade Mitte bis Lage 58, Rundfenster auf Lage 36, Hauptportal 10, Seitentüren 7 Lagen hoch.
