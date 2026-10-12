# Referenzmaße – Orsanmichele (V3 D1, Wahrzeichen-Welle 1)

Projekt-ID `orsanmichele`, Maßstab 1:2 (1 Block = 0,5 m, **Blöcke = 2 · m**), Weltkoordinaten des Stadtmodells (Ursprung Kuppelmitte, x entlang der Domachse −1,36° gegen Ost, z nach Süden; `tools/spec/frame.js`). Stand 12.10.2026.
Stufen: **A** mehrere Quellen übereinstimmend, **B** eine Quelle oder aus OSM gemessen/abgeleitet, **C** Schätzung. Entwurf: [`BAUTEIL_KATALOG.md`](BAUTEIL_KATALOG.md).

## 1. Rahmen

| Größe | Wert | Quelle |
|---|---|---|
| OSM-Objekt | Way **w442508011** „Chiesa di Orsanmichele“ (`building=church`, `building:levels=3`, `wikidata=Q860816`), Isolato I0467, 3.303 Zellen = 826 m² | `data/stadt/gebaeude.json` |
| Zugehörig | Way **w1394931261** (52 Zellen, `building=yes`, `min_level=2`): Verbindungsbogen zum Palazzo dell'Arte della Lana, Westseite (**optional**, Modul 8) | `gebaeude.json` |
| Gelände unter dem Bau | `groundTopY` 67 (819 Zellen), 68 (2.369), 69 (115); außen entlang der Kanten 66–68 | `tools/geo/gelaende.js` |
| **Bodenplatte `bodenY`** | **68** (Mehrheit der Zellen; 115 Zellen mit 69 werden im Footprint abgetragen) | Entwurf |
| **Rahmen `OM`** | Ursprung (−298 \| 542), **θ = +1,0°** (gegen die Modell-x-Achse), Achsen u (Ost) und w (Süd), Gleichungen im Katalog §0 | aus den OSM-Kanten gefittet: alle 11 Eckpunkte liegen auf \|u\| 34,1–34,6 bzw. \|w\| 23,6–24,1 |
| Fassadenrichtung | Lange Seiten (Nord/Süd) 1,0° gegen die Modell-x-Achse, kurze Seiten 91,0° | OSM-Kanten: Nord 0,84°, Süd 1,2°, West/Ost ≈ ±0,6–2° |

## 2. Abgleich Literatur gegen OSM (Abweichung > 3 % begründet)

| Maß | OSM | Literatur | Abw. | Bewertung |
|---|---|---|---|---|
| Grundriss lang | **69,1 Blöcke = 34,5 m** | 32,4 m ([en](https://en.wikipedia.org/wiki/Orsanmichele), [de](https://de.wikipedia.org/wiki/Orsanmichele)) | +6,6 % | OSM gewinnt. Die Literatur meint vermutlich die Mauerflucht, OSM die Außenkante der Pfeiler mit Tabernakeln. Mit 2 Blöcken (1 m) Pfeilervorsprung je Seite stimmen beide Werte (65 + 4 = 69). |
| Grundriss kurz | **48,0 Blöcke = 24,0 m** | 22,1 m (en/de) | +8,6 % | wie oben (45 + 4 = 49 ≈ 48). |
| Raster | 4 · 6 + 3 · 15 = **69**; 3 · 6 + 2 · 15 = **48** | – | 0 | Das Raster Pfeiler 6 / Bogenfeld 15 Blöcke (3 m / 7,5 m) passt **exakt** zu beiden OSM-Seiten und zu den **14 Tabernakeln** (siehe §3). Stufe B (abgeleitet). |
| Höhe | – (OSM `levels` 3; `hoeheBl` 23 stammt aus der Pauschale und ist **unbrauchbar**) | **40 m** (en, de), drei „annähernd gleiche“ Geschosse; Archilovers: drei Ebenen je ca. 12 m, 30 × 20 m (grobe Beschreibung eines Büros) | 40 m gegen ≈ 36 m: 10 % | **40 m = 80 Lagen** gewählt (zwei Wikipedia-Ausgaben, übereinstimmend; Quelle möglicherweise identisch). Stufe B. Offene Frage 1. |
| Fläche | 826 m² | 716 m² (de: 32,4 × 22,1) | +15 % | Folge der Maßdifferenz oben (Pfeilerprojektion). |

## 3. Hauptmaße im Modell

Höhe in m = Lagen / 2 (Lage 1 = erste Lage über der Bodenplatte).

| Maß | m | Blöcke | Quelle | Stufe |
|---|---|---|---|---|
| Grundriss (Außenkante Pfeiler) | 34,5 × 24,0 | 69 × 48 | OSM | B |
| Pfeilerbreite | 3,0 | 6 | abgeleitet aus Raster | B |
| Bogenfeld (lichte Weite) | 7,5 | 15 | abgeleitet | B |
| Pfeilervorsprung vor der Mauerflucht (Rücksprung der Bogenfelder) | 1,0 | 2 | abgeleitet aus Lit.-/OSM-Differenz | B |
| Bogenfelder je Seite | 3 an den langen, 2 an den kurzen Seiten | – | abgeleitet: 4 Pfeiler je lange, 3 je kurze Seite; 4+4+3+3 = **14 Tabernakel** ([en](https://en.wikipedia.org/wiki/Orsanmichele): 14 Nischen; [it](https://it.wikipedia.org/wiki/Orsanmichele) Tabelle: 14 Tabernakel) | B |
| Erdgeschoss | 13,0 | 26 (Lage 1..26) | Höhe aus Gesamthöhe aufgeteilt | C |
| 1. Obergeschoss | 12,5 | 25 (27..51) | „obere Geschosse niedriger“ ([de](https://de.wikipedia.org/wiki/Orsanmichele)) | C |
| 2. Obergeschoss einschließlich Arkadenfries | 11,5 | 23 (52..74) | dito | C |
| Dach (flaches Walmdach) | 3,0 | 6 (75..80) | geschätzt | C |
| **Gesamthöhe bis Dachfirst** | **40,0** | **80** | en, de | B |
| Wandstärke EG-Füllwand / Obergeschosse | 2,0 / 1,5 | 4 / 3 | nicht belegt | C |
| Spitzbogen im EG: Halbweite / Kämpfer / Scheitel | 3,75 / 6,5 / 11,0 | 7,5 / 13 / 22 | Spitzbogen belegt (Wikipedia-Quellen), Höhen geschätzt | B / C |
| Nische/Tabernakel (Breite × Höhe) | 1,5 × 4,5 | 3 × 9 | Statuenhöhen 203–273 cm ([it](https://it.wikipedia.org/wiki/Orsanmichele)) | B / C |
| Verbindungsbogen zum Palazzo dell'Arte della Lana | 4,5 × 4 | 9,1 × 8,1 (OSM), Höhe ab Lage 26 | OSM `min_level 2`; Buontalenti 1569 ([it](https://it.wikipedia.org/wiki/Orsanmichele)) | B |

Belegte Fakten ohne Maß: Das EG war ab 1290 offene Getreideloggia, 1304 durch Brand zerstört, 1337 Neubau mit drei Geschossen, die Arkaden wurden um 1360–67 zugemauert, Maßwerk um 1420; Orcagna-Tabernakel 1352–59 (innen, nicht modelliert) ([en](https://en.wikipedia.org/wiki/Orsanmichele), [it](https://it.wikipedia.org/wiki/Orsanmichele)). Die oberen Geschosse haben glatte Pietraforte-Verkleidung mit großen Marmor-Biforien und Wappen; den Abschluss bildet ein **Fries aus Dreipassbögen auf Konsolen** (it). Das Erdgeschoss hat große gotische Trifore mit Maßwerk, Statuetten am Bogenansatz und die Statuennischen auf den Pfeilern (it).

Seitenzuordnung der Tabernakel laut it.wikipedia: Via dell'Arte della Lana 3, Via dei Lamberti 4, Via dei Calzaiuoli 3, Via Orsanmichele 4. Das Modell nutzt nur die Anzahlen 4 / 4 / 3 / 3 und legt die **4er-Seiten auf Nord und Süd** (lange Seiten laut OSM). Die Zuordnung der Straßennamen zu den Himmelsrichtungen ist **ungeklärt** (offene Frage 2); sie ändert die Geometrie nicht.

## 4. Konsistenzprüfung

- Geschosse: 26 + 25 + 23 + 6 = **80 Lagen** = 40,0 m ✓.
- Raster lang: 4 · 6 + 3 · 15 = 69 ✓; kurz: 3 · 6 + 2 · 15 = 48 ✓.
- Tabernakel: 2 · 4 + 2 · 3 = 14 ✓ (Quelle: 14).
- Spitzbogen: ρ = (7,5² + 9²)/(2 · 7,5) = 9,15, Scheitel 13 + 9 = 22 < 26 (Decke) ✓, Archivolte (2) bis Lage 24.
- 1. OG Boden Lage 26 = Oberkante des Verbindungsbogens (OSM `min_level 2`: zwei Ebenen darunter frei) ✓.

## 5. Rundung

Länge in Blöcken = 2 · m, danach auf das Raster 6/15 gelegt (Summe muss die OSM-Außenmaße ergeben). Höhen: ganzzahlig gewählt, Summe 80. Bogenweiten ungerade (Mittelzelle als Achse), Pfeilerbreiten gerade.

## 6. Annahmen und offene Punkte

1. Aufteilung 26/25/23/6 und alle Wandstärken sind Planwerte (C).
2. Bogenzahl 3/2 ist abgeleitet, aus keiner Quelle gezählt.
3. Lage und Zahl der Türen sind nicht belegt (Modell: zwei Türen, Katalog Modul 2).
4. Die Orcagna-Tabernakel, Maestà und Innenausstattung werden nicht modelliert.
5. Die Brücke zum Palazzo dell'Arte della Lana (Treppe abgerissen, nach it.wikipedia) ist optional.

## 7. Quellen

- [Orsanmichele – English Wikipedia](https://en.wikipedia.org/wiki/Orsanmichele) (32,4 × 22,1 m, 40 m, 14 Nischen)
- [Orsanmichele – Deutsch](https://de.wikipedia.org/wiki/Orsanmichele) (716 m², 40 m)
- [Orsanmichele – Italiano](https://it.wikipedia.org/wiki/Orsanmichele) (Tabernakel je Straße, Bauphasen, Brücke, Statuenhöhen)
- [Archilovers: Chiesa e Museo di Orsanmichele](https://www.archilovers.com/projects/324847/orsanmichele.html) (grobe Maße, nur Gegenprobe)
- OpenStreetMap-Mitwirkende (ODbL), `data/stadt/gebaeude.json`; DGM Comune di Firenze 2017 (CC BY 4.0)
