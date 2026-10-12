# Referenzmaße – Uffizien und Corridoio Vasariano (V3 D1, Wahrzeichen-Welle 1)

Projekt-ID `uffizi` (enthält den Corridoio Vasariano bis zum Ponte Vecchio als Modul 8). Maßstab 1:2 (**Blöcke = 2 · m**), Weltkoordinaten des Stadtmodells (`tools/spec/frame.js`). Stand 12.10.2026.
Stufen: **A** mehrere Quellen übereinstimmend, **B** eine Quelle oder aus OSM gemessen, **C** Schätzung. Entwurf: [`BAUTEIL_KATALOG.md`](BAUTEIL_KATALOG.md).
Veröffentlichte Maße gibt es nur für den **Platz** (Länge, Breite) und die **Traufhöhe** (eine wissenschaftliche Quelle, nur über eine Suchzusammenfassung gelesen). Die Wikipedia-Seiten (en, it, de), die offizielle Uffizien-Seite und die Seiten zum Korridor nennen keine Längen. Alles Weitere ist **aus OSM gemessen (B)** oder **geschätzt (C)**.

## 1. Rahmen

| Größe | Wert | Quelle |
|---|---|---|
| OSM-Objekt Uffizien | Way **w477279033** „Galleria degli Uffizi“ (`building=yes`, `levels=4`, `wikidata=Q51252`), 36.259 Zellen = 9.065 m², Umfang 1.613 Blöcke; Teile w673458435 (Oktogon, 847 Zellen) und w673458443 (kleines Oktogon, 51 Zellen) | `data/stadt/gebaeude.json` |
| OSM-Objekt Corridoio | Way **w1344547176** „Corridoio Vasariano“ (`building=no`), 18.661 Zellen, reicht bis zum Palazzo Pitti (x −926); davon 8.273 Zellen innerhalb der Uffizien | `gebaeude.json` |
| Korridorbauten (OSM `building=bridge`) | **w328477211** (Brücke über die Via della Ninna, 223 Zellen, `levels 4`, `min_level 3`), **r2302811** (Lungarno degli Archibusieri, 2.569 Zellen, `levels 3`, `min_level 2`) | `gebaeude.json` |
| Gelände | Uffizien: `groundTopY` 59..67, Median 65 (15.210 Zellen auf 65, 7.216 auf 64, 7.032 auf 66); Piazzale 65 → Arno-Ende 63; Lungarno-Streifen 50..66 (Uferböschung, Fluss) | `tools/geo/gelaende.js` |
| **Bodenplatte `bodenY`** | **65** (Piazzale-Niveau, Median) | Entwurf |
| **Rahmen `UF`** | Ursprung (−170 \| 907), **θ = +17,4°** (gegen die Modell-x-Achse). u quer (Ost), w entlang der Flügel nach Süd (zum Arno). Fassadenrichtung der Flügel: **107,4°** gegen die x-Achse (= 17,4° gegen die z-Achse), Querkanten 17,4°. | Mittel der langen Kanten 31–32 (107,5°/107,3°), 35–36 (−73,3°/−73,1°) |
| Korridor-Rahmen `LG` | Ursprung (−350 \| 1141,5), θ = **206,8°** (Streifenrichtung zum Ponte Vecchio), Querkoordinate v nach Süd (Fluss) | OSM-Nordkante des Streifens |

## 2. Abgleich Literatur gegen OSM

Messung im Rahmen `UF`: Westflügel, Fassade zum Piazzale bei **u = 0,0** (w 0..276,1, drei Eckpunkte exakt); Ostflügel, Fassade bei u = 24,9 (w = −4,1) bis 27,8 (w = 275,8) (Aufweitung 2,9 Blöcke); Südbau-Nordfläche w ≈ 276,1; Arno-Fassade w ≈ 299,5–300,0.

| Maß | OSM | Literatur | Abw. | Bewertung |
|---|---|---|---|---|
| Länge des Platzes | w −4..−9 bis 276: **280–285 Blöcke = 140–142,5 m** | **ca. 144 m** (Corsani/Romby, Univ. Florenz, [PDF](https://www.edizionicaracol.it/wordpress/wp-content/uploads/2023/07/16.-corsani.pdf), über Suchzusammenfassung; PDF selbst nicht lesbar) | −1…−3 % | in Toleranz. Stufe B. |
| Länge der Flügelfassaden | 276 Blöcke = **138 m** (Westflügel) | – | – | Stufe B. |
| **Breite des Platzes** | 24,9–27,8 Blöcke = **12,5–13,9 m** (senkrecht) | **ca. 18 m** (Corsani/Romby, ebenda) | **−23 … −31 %** | **ungeklärt.** OSM-Kanten verlaufen auf 276 Blöcken Länge exakt gerade; die Lesart „OSM-Rand = Fassadenwand, Literatur = Maß einschließlich Portikusvorsprüngen“ würde die Differenz in die falsche Richtung erklären. Entscheidung: **OSM gewinnt für den Umriss** (Regel), Differenz als offene Frage 1. |
| **Traufhöhe** | – | „poco meno di 26 m“ ([Corsani/Romby](https://www.edizionicaracol.it/wordpress/wp-content/uploads/2023/07/16.-corsani.pdf)) | – | **25,5 m = 51 Blöcke** gewählt (−2 %). Stufe B. |
| Geschosse | `levels 4` | Modul aus Portikus, Mezzanin, Piano nobile, Loggia ([uffizi.it](https://www.uffizi.it/en/artworks/ll-palazzo-degli-uffizi), [it.wikipedia](https://it.wikipedia.org/wiki/Galleria_degli_Uffizi)) | 0 | Stufe A. |
| Modul der Fassade | – | „Portikus mit **drei Interkolumnien, getrennt durch zwei Säulen**, zwischen Pfeilern mit Nischen; im Mezzanin drei Öffnungen, im 1. OG drei Fenster je Modul“ (it.wikipedia, uffizi.it) | – | Stufe A (Aufbau). Modulbreite 12 m (24 Blöcke) ist **C**. |
| Ordnung | dorisch (uffizi.it); Serliana am Arno-Ende (Suchzusammenfassung der Corsani-Studie) | | | Stufe B. |
| Baudaten | 1560 Beginn, 1581 Vollendung ([en](https://en.wikipedia.org/wiki/Uffizi)) | | | A |
| Corridoio, Länge | – | ca. 760 m ([it.wikipedia](https://it.wikipedia.org/wiki/Corridoio_vasariano)); ca. 1 km ([en](https://en.wikipedia.org/wiki/Vasari_Corridor)) | 30 % Differenz | nicht modellrelevant (nur dieser Teil). |
| Corridoio, Verlauf | Streifen auf dem Lungarno 196 Blöcke = **98 m**, Breite 12–13 Blöcke = 6–6,5 m | Verlauf: Palazzo Vecchio 2. OG, Via della Ninna (Überbrücken), über das Dach von San Pier Scheraggio, Uffizien-Obergeschoss, Treppe zum Cavalcavia am Lungarno degli Archibusieri, Arkaden am Arno, Ponte Vecchio, Torre dei Mannelli auf Konsolen ([it.wikipedia](https://it.wikipedia.org/wiki/Corridoio_vasariano)) | – | Stufe B. Die OSM-Breite 6 m enthält die Arkade; der innere Gang ist schmaler (C: 3,5 m). |
| Korridor, Höhe über Straße | OSM Lungarno: `min_level 2`, `levels 3` | – | – | zwei Ebenen frei, also Boden ≈ 15 Blöcke (7,5 m) über Straße 63: **Boden Oberkante Y 78**. Stufe C (Pauschale 3,75 m je Ebene aus `gebaeude.json`). |

## 3. Hauptmaße im Modell (Lagen über der Bodenplatte, 1 Lage = 0,5 m)

| Maß | m | Lagen / Blöcke | Quelle | Stufe |
|---|---|---|---|---|
| Portikus bis Oberkante Gebälk | 7,0 | 14 (Lage 1..14) | geschätzt | C |
| Mezzanin (Zwischengeschoss) | 3,0 | 6 (15..20) | geschätzt | C |
| Piano nobile | 8,0 | 16 (21..36) | geschätzt | C |
| Dachloggia (oberes Geschoss) mit Gebälk und Kranzgesims | 7,5 | 15 (37..51) | geschätzt | C |
| **Traufe** | **25,5** | **51** | Corsani (< 26 m) | B |
| Piano-nobile-Boden = Dachloggia-Boden Oberkante | 18,0 | 36 (Y 101) | folgt aus Summe; identisch mit PV-2.-OG-Boden | C |
| Nebenbaukörper (Rückseiten) Traufe | 22,0 | 44 | geschätzt | C |
| Modulbreite (Pfeiler 5, Öffnung 5, Säule 2, Öffnung 5, Säule 2, Öffnung 5) | 12,0 | 24 | Aufbau belegt, Breite C | C |
| Portikustiefe / Rückwand / Vasari-Streifen | 5 / 2 / 20 | 10 / 4 / 40 | geschätzt | C |
| Serliana: Mittelbogen Spannweite / Kämpfer / Scheitel | 6 / 6 / 9 | 12 / 12 / 18 | Serliana belegt (Maße C) | B / C |
| Tribuna-Oktogon (OSM) | 16 m Durchmesser (Umkreisradius 17 Blöcke) | Teil w673458435; Laterne w673458443 Umkreisradius 4 | OSM | B (Maß) / C (Höhen) |
| Korridor: Boden Oberkante / lichte Höhe / Dach | Y 101 (Brücke, Uffizien) bzw. Y 78 (Lungarno) / 3,5 / 1 | Lichtmaß 7 × 7 Blöcke | C |
| Brücke über die Via della Ninna | 8,1 m lang × 6,9 m breit | 16,2 × 13,7 | OSM | B |

## 4. Konsistenzprüfung
- Uffizien: 14 + 6 + 16 + 15 = **51 Lagen** = 25,5 m ✓. Piano-nobile-Decke bei Lage 36 = Y 101.
- Palazzo Vecchio, 2.-OG-Boden: Y 68 + 33 = Y 101 ✓ (Korridorbrücke ohne Stufe).
- Lungarno: Boden Y 78 = Straße 63 + 15; Dach Y 87 = Straße + 24 ≈ 22,5 (OSM `levels 3` · 7,5) ✓.
- Modul: 5 + 5 + 2 + 5 + 2 + 5 = 24 ✓; elf Module = 264, Nordende 12 → 276 ✓.
- Serliana: 2 + 4 + 2 + 12 + 2 + 4 + 2 = 28 ≥ Platzbreite am Südende (27,7) ✓.
- Brücke: Kante PV 13,7 und Kante Uffizien 13,7 gleich lang ✓, Seitenkanten je 16,2 ✓.

## 5. Rundung
Meter · 2, kaufmännisch gerundet; Höhen ganzzahlig gewählt und auf Summe 51 gelegt; Modulbreiten ganzzahlig; Bogenöffnungen mit ungerader Weite haben eine Mittelzelle, mit gerader Weite eine Spiegelachse zwischen zwei Zellen.

## 6. Annahmen und offene Punkte
1. **Breite des Piazzale** (OSM 13 m, Literatur 18 m): im Katalog gilt OSM.
2. Modulbreite 12 m, Portikustiefe, Mauerdicken und Geschosshöhen sind Planwerte.
3. Aus dem OSM-Polygon folgen Flügeltiefen von 33 m (Westflügel u −43..0, Ostflügel u 25..92) und bis 65 Blöcke im Südwesten. Das Polygon umfasst den ganzen Komplex (inklusive älterer Gebäude). Der Vasari-Streifen wird mit **20 m Tiefe** angenommen, der Rest als Nebenbaukörper (Traufe 22 m).
4. Das Tribuna-Oktogon (16 m Durchmesser) ist größer als die historische Tribuna (nach Wissen des Bearbeiters etwa 6 m); die Deutung bleibt offen.
5. Der Korridor-Innenraum im Obergeschoss der Flügel wird als Teil der Dachloggia modelliert, nicht getrennt.
6. Statuen in den Nischen sind optional und vereinfacht.

## 7. Quellen
- [Uffizi – English Wikipedia](https://en.wikipedia.org/wiki/Uffizi) (Daten)
- [Galleria degli Uffizi – Italiano](https://it.wikipedia.org/wiki/Galleria_degli_Uffizi) (Modul, drei Interkolumnien)
- [Uffizien offiziell: Il palazzo degli Uffizi](https://www.uffizi.it/en/artworks/ll-palazzo-degli-uffizi) (dorische Ordnung, Modul)
- Corsani, Romby: Studie (Univ. Florenz), [PDF](https://www.edizionicaracol.it/wordpress/wp-content/uploads/2023/07/16.-corsani.pdf), nur über Suchzusammenfassung
- [Corridoio vasariano – Italiano](https://it.wikipedia.org/wiki/Corridoio_vasariano) (Verlauf, 760 m)
- [Vasari Corridor – English](https://en.wikipedia.org/wiki/Vasari_Corridor) (Route)
- OpenStreetMap-Mitwirkende (ODbL), `data/stadt/gebaeude.json`; DGM Comune di Firenze 2017 (CC BY 4.0)
