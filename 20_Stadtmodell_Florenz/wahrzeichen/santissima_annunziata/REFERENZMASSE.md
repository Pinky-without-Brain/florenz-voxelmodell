# Referenzmaße – Basilica della Santissima Annunziata (V3 D3, Wahrzeichen-Welle 3)

Projekt-ID `santissima_annunziata`. Maßstab 1:2 (**Blöcke = 2 · m**), Weltkoordinaten des Stadtmodells. Stand 15.10.2026.
Stufen: **A** mehrere Quellen übereinstimmend oder amtliche Quelle, **B** eine Quelle oder aus OSM/DGM gemessen, **C** Schätzung (Proportion). Entwurf: [`BAUTEIL_KATALOG.md`](BAUTEIL_KATALOG.md).

## 1. Rahmen und OSM

| Größe | Wert | Quelle |
|---|---|---|
| OSM-Objekt | Way **w234428743** „Basilica della Santissima Annunziata“ (`building=church`), **12.377 Zellen**, ohne Teile | `data/stadt/gebaeude.json` |
| Kloster | r4086115 und weitere – nicht Teil dieses Projekts | `gebaeude.json` |
| **Rahmen `SA`** | Ursprung (**621,5 \| −820**) = Mitte der Portikusfront, **θ = −48,5°**; **u** von der Piazza (Südwesten) zur Tribuna (Nordosten), **w** quer, w > 0 Südosten | gefittet an der rechten Langseite (−47,9°) und der Front (senkrecht, 40,8°) |
| Gelände | `groundTopY` im Footprint 66–69 (66: 1.256, 67: 4.413, **68: 5.105**, 69: 1.619 Zellen); Piazza vor dem Portikus 66 | `tools/city/ground_stadt.js` |
| **`bodenY`** | **67** (eine Stufe über der Piazza) | Entwurf, B |

### Polygon im Rahmen `SA` (gemessen, u \| w in Blöcken)
- **Vorbau** (Portikus und Chiostrino) u 0..21 × w −38,3..38,6; ab u 21 links bis w −13 (u 21..47).
- **Schiff mit Kapellen** u 47..116 × w −24..40; u 116..137,5 links nur bis w −13,8.
- **Tribuna** u 138..192 × w −30..36,5, dahinter ein Vorsprung u 192..203 × w −5..14.

## 2. Maße (Literatur gegen OSM)

| Maß | Modell | Literatur | Bewertung |
|---|---|---|---|
| Portikus | 7 Bögen über 77 Blöcke Front | Giovanni Battista Caccini, vollendet **1601**; Bögen auf gleicher Höhe wie die Loggien des Platzes ([it.wikipedia](https://it.wikipedia.org/wiki/Basilica_della_Santissima_Annunziata)) | Daten A, Bogenzahl C (nach Fotos) |
| Chiostrino dei Voti | offener Hof mit Bogengängen, u 7..47 | Michelozzo ab **1447**, schlanke korinthische Säulen; Fresken von Andrea del Sarto, Pontormo, Rosso Fiorentino (it.wikipedia) | A |
| Schiff | einschiffig, **8 Kapellen links, 9 rechts** | Kapitelüberschriften der Kapellen (it.wikipedia) | A |
| Schiffdecke | flache Holzdecke | **1664** nach Volterrano, mit der Himmelfahrt (it.wikipedia) | A |
| Tempietto | 4 Säulen, **10,5 Blöcke = 5,25 m** | „quattro colonne … alte **5,25 m**“, Michelozzo/Pagno di Lapo **1447–48**, Bekrönung 1674 (it.wikipedia) | A |
| Tribuna | rund, Innenradius 20 Blöcke (20 m Durchmesser), 9 Kapellen | Michelozzo, Grundstein **18.10.1444**, Alberti, geweiht **1477**; Kuppelfresko Volterrano **1680–83** (it.wikipedia) | Daten A, Maße C (aus dem OSM-Umriss u 138..192 abgeleitet) |
| Glocken | Glockengiebel („campanile a vela“) mit **5 Öffnungen** auf dem hinteren Tambour, Plattform Lage 42, Giebelwand bis Lage 57 (Modul 7, V5b) | „campanile a vela“ mit 5 Öffnungen „sul tamburo posteriore“; Glocken 1872 von der Gießerei Moreni, Florenz (it.wikipedia) | Zahl A, Form und Maße C |

## 3. Entwurfswerte ohne Beleg (Stufe C)
- Portikus Bogenscheitel Lage 17, Decke 18, Dach 20; Chiostrino Bögen bis Lage 10, Decke 13, Pultdach 14..16.
- Schiff innen |w − 4| < 13 (13 m), Decke Lage 40, First 54; Kapellen Decke 22, Pultdach 34 → 28.
- Tribuna: Kapellen Decke 21, Tambour bis Lage 42 mit Fenstern 36..42, Kuppel innen bis 62, außen bis 64,5; Laterne bis Lage 82.
