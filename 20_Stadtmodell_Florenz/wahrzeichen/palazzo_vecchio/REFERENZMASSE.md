# Referenzmaße – Palazzo Vecchio (V3 D1, Wahrzeichen-Welle 1)

Projekt-ID `palazzo_vecchio`, Maßstab 1:2 (1 Block = 0,5 m, **Blöcke = 2 · m**), Weltkoordinaten des Stadtmodells (Ursprung Kuppelmitte, x entlang der Domachse −1,36° gegen Ost, z nach Süden, y nach oben; Umrechnung `tools/spec/frame.js`).
Stand der Recherche: 12.10.2026. Diese Datei dokumentiert die **Herkunft** der Werte; der Entwurf steht in [`BAUTEIL_KATALOG.md`](BAUTEIL_KATALOG.md).

**Sicherheitsstufen** (Spalte „Stufe“): **A** = in mehreren unabhängigen Quellen übereinstimmend, **B** = eine Quelle oder aus dem OSM-Grundriss gemessen, **C** = Schätzung/Planungswert (Quelle fehlt; im Modell nachprüfen).
Online sind für den Palazzo Vecchio fast nur die Turmhöhe und die Saalmaße veröffentlicht. Fassadenlänge, Geschosshöhen, Hofmaße und Ballatoio-Höhen stehen in keiner der gelesenen Seiten. Sie sind deshalb **aus dem OSM-Grundriss gemessen (B)** oder **geschätzt (C)**.

## 1. Rahmen

| Größe | Wert | Quelle / Herleitung |
|---|---|---|
| OSM-Objekt | Relation **r1461712** „Palazzo Vecchio“ (`building=yes`, `building:levels=5`, `wikidata=Q271928`) | `data/stadt/gebaeude.json`, Isolato I0394 |
| Teile (`building:part`) | w361442652 (Arnolfo-Block, 5.527 Zellen), w361442653 „Torre di Arnolfo“ (`height=94 m`, 305 Zellen), w361442654 (Ostblock, 17.783 Zellen), w361442647 (Südblock, 717 Zellen) | `gebaeude.json` `teile` |
| Grundfläche | 24.104 Zellen = **6.026 m²** (Außenring 688 Blöcke Umfang, vier Höfe: 1.505 / 416 / 103 / 89 Zellen) | OSM |
| Gelände unter dem Bau | `groundTopY` 61..69; West (Piazza) 68–69, Nord 68→65, Ost (Via dei Leoni) 61–62; Mittel 65 | `tools/geo/gelaende.js`, gemessen über alle 24.146 Zellen |
| **Bodenplatte `bodenY`** | **68** (Entwurfsentscheidung: Piazza-Niveau an der Westfassade, 1 Block unter dem DGM-Höchstwert 69; Zellen mit `groundTopY` > 68 werden im Footprint abgetragen, siehe Katalog §0) | Entwurf |
| Laufniveau | Y 69 (= `bodenY` + 1, wie beim Dom Fußboden 64 / Lauf 65) | Konvention V2 |

## 2. Abgleich Literatur gegen OSM-Grundriss (Abweichung > 3 % begründet)

Alle Längen in Blöcken sind im lokalen Rahmen des Katalogs (Fassadenrahmen `PV`, Ursprung Südecke der Westfassade, Drehung −79,8°) gemessen.

| Maß | OSM (Blöcke → m) | Literatur | Abw. | Bewertung |
|---|---|---|---|---|
| **Turmhöhe** | `height=94 m` am Teil w361442653 | 94 m ([en](https://en.wikipedia.org/wiki/Palazzo_Vecchio), [it](https://it.wikipedia.org/wiki/Palazzo_Vecchio), [de](https://de.wikipedia.org/wiki/Palazzo_Vecchio), [Torre di Arnolfo it](https://it.wikipedia.org/wiki/Torre_di_Arnolfo), [museionline](https://www.museionline.info/firenze-musei-e-monumenti/torre-di-arnolfo)); „95 m“ auf Ticketseiten ([1sticket](https://1sticket.com/it/parco/palazzo-vecchio-torre-di-arnolfo-hotel)); „84,62 m“ laut Zusammenfassung einer Suche zu Bartoli (flore.unifi.it, PDF vom Host nicht erreichbar, **nicht selbst geprüft**) | 0 % (94), +1 % (95), −10 % (84,6) | **94 m = 188 Blöcke gewählt**, Stufe A. Die 84,6 m sind ungeklärt (evtl. Höhe über anderem Bezugspunkt); offene Frage 1. |
| Turmgrundriss | 21,8 × 14,1 Blöcke = **10,9 × 7,1 m** (Teil w361442653) | keine Quelle gefunden | – | Stufe B (OSM). Das Rechteck liegt bündig in der Fassadenflucht, Südhälfte der Fassade (u 24–46 von 90). Das deckt sich mit [it.wikipedia](https://it.wikipedia.org/wiki/Palazzo_Vecchio): Turm nicht mittig, nach Süden versetzt. |
| Westfassade (Piazza) | 89,9 Blöcke = **45,0 m** | keine Zahl; [it.wikipedia](https://it.wikipedia.org/wiki/Palazzo_Vecchio): Fassade sei die kürzeste Seite eines Trapezes | – | Plausibel: Außenring hat die Seiten West 45 m, Ost (Via dei Leoni) 57,9 m, Nord ≈ 117 m (über drei Kanten), Süd ≈ 140 m. West ist die kürzeste Seite. Stufe B. |
| Arnolfo-Block | 90 × 58 Blöcke = **45 × 29 m** (Teil w361442652, fast rechtwinklig im Fassadenrahmen) | keine Zahl | – | Stufe B. |
| Michelozzo-Hof (Loch 2) | 23,5 × 19,2 Blöcke = **11,8 × 9,6 m**, 416 Zellen = 104 m² | keine Zahl (Michelozzo 1453, Vasari 1565 umgestaltet; [it.wikipedia](https://it.wikipedia.org/wiki/Palazzo_Vecchio)) | – | Stufe B. Lage: unmittelbar hinter dem Turm (u 16–39, w 21–40). OSM zeichnet die freie Hoffläche; der Arkadengang liegt im Polygon (Katalog Modul 6). |
| Cortile della Dogana / zweiter Hof (Loch 1) | ca. 40 × 38 Blöcke = 20 × 19 m, 1.505 Zellen = 376 m² | keine Zahl; Cronaca baute die Pfeiler des zweiten Hofs ([it.wikipedia](https://it.wikipedia.org/wiki/Palazzo_Vecchio)) | – | Stufe B; Zuordnung des Lochs zu „zweiter Hof“ ist **abgeleitet** (Größe, Lage im Ostblock). |
| Lichthöfe (Löcher 3 und 4) | ca. 10 × 10 Blöcke = 5 × 5 m (103 und 89 Zellen) | keine Quelle | – | Stufe B, Funktion unbekannt (Lichthöfe angenommen). |
| **Salone dei Cinquecento** | – (Innenraum, nicht in OSM) | ca. 52 × 23 × 18 m ([en](https://en.wikipedia.org/wiki/Palazzo_Vecchio), nennt auch 51,61 m Ost-, 53,47 m Westwand, 22,15 m breit); 54 × 22 m ([de](https://de.wikipedia.org/wiki/Palazzo_Vecchio)); ca. 54 × 23 m ([it](https://it.wikipedia.org/wiki/Palazzo_Vecchio)) | Spanne 52–54 m (4 %) | **Lichtmaß 104 × 44 Blöcke = 52 × 22 m** (Mittel der en-Einzelwerte 51,6/53,5, Breite 22,15), Höhe 18 m = 36 Blöcke; Stufe A für das Maß, **C für die Lage** (siehe Katalog Modul 9; passt in den Ostblock: Tiefe 75 m). |
| Studiolo | – | 8,41 × 3,31 m ([de](https://de.wikipedia.org/wiki/Palazzo_Vecchio)) | – | nicht modelliert (Innenausbau). |

## 3. Hauptmaße im Modell (Höhen in Lagen über der Bodenplatte)

Höhe in m = Lagen / 2. `y_rel` = Y − `bodenY`. Lage 1 ist die erste Lage über der Bodenplatte. Die Summe der Teilhöhen steht in §4.

| Maß | m | Lagen / Blöcke | Quelle | Stufe |
|---|---|---|---|---|
| Erdgeschoss, Rustika (Pietraforte-Bugnato) | 8,0 | 16 (y_rel 1..16, Decke in Lage 16) | Rustika belegt ([it.wikipedia](https://it.wikipedia.org/wiki/Palazzo_Vecchio)), Höhe geschätzt | B (Art) / C (Höhe) |
| 1. Obergeschoss, Biforien | 8,5 | 17 (17..33) | drei Hauptgeschosse belegt, Höhe geschätzt | C |
| 2. Obergeschoss, Biforien | 8,0 | 16 (34..49) | dito | C |
| Konsolzone (Beccatelli, Rundbögen, Stemmi) | 3,0 | 6 (50..55) | Konsolen mit Rundbögen und Stemmi belegt (it.wikipedia), Höhe geschätzt | B / C |
| Ballatoio-Boden (auskragend, mit Wurflöchern) | 0,5 | 1 (56) | belegt: Caditoie an einigen Bögen | B |
| Brüstung | 2,0 | 4 (57..60) | geschätzt | C |
| Guelfenzinnen (quadratisch) | 1,0 | 2 (61..62) | Guelfenzinnen belegt (it.wikipedia) | B / C |
| **Palastkörper bis Zinnenoberkante** | **31,0** | **62** | Summe | C |
| Turm: Schaft über dem Palast | 41,0 | 82 (63..144) | Aufteilung nach Silhouette geschätzt | C |
| Turm: Konsolgeschoss (Beccatelli mit Spitzbögen) | 4,0 | 8 (145..152) | „Ballatoio auf Konsolen mit Spitzbögen“ ([museionline](https://www.museionline.info/firenze-musei-e-monumenti/torre-di-arnolfo)) | B / C |
| Turm: Brüstung mit ghibellinischen Zinnen | 4,0 | 8 (153..160) | Schwalbenschwanzzinnen belegt (it.wikipedia, Torre di Arnolfo) | B / C |
| Turm: Edikula mit vier Säulen und Rundbögen | 8,0 | 16 (161..176) | belegt: Edikula mit vier gemauerten Säulen ([it](https://it.wikipedia.org/wiki/Torre_di_Arnolfo)) | B / C |
| Turm: Pyramidendach und Stange | 4,0 | 8 (177..184) | geschätzt | C |
| Turm: Marzocco-Wetterfahne | 2,0 | 4 (185..188) | „mehr als 2 m“ hoch ([it](https://it.wikipedia.org/wiki/Torre_di_Arnolfo)) | B |
| **Gesamthöhe Turm** | **94,0** | **188** | s. §2 | A |
| Traufe Ost-, Mittel- und Südblock (Zonen M, P, B) | 28,0 | 56 | Rückbauten Vasari/Buontalenti, Höhe geschätzt | C |
| Firsthöhe Salone-Dach | 33,0 | 66 | geschätzt | C |
| Mauerdicke EG / OG / Turmschaft | 2,5 / 2,0 / 2,0 | 5 / 4 / 4 | nicht belegt, übliche Stärke | C |

Weitere belegte, aber nicht maßliche Fakten: Grundsteinlegung 24.02.1299, weitgehend fertig 1314 ([de](https://de.wikipedia.org/wiki/Palazzo_Vecchio)); Turm um 1310 auf dem älteren Turm „della Vacca“ ([it](https://it.wikipedia.org/wiki/Palazzo_Vecchio)); Fassade: zwei Reihen neugotischer Marmor-Biforien mit Dreipassbögen, 18. Jh. ersetzt, Portal mit Marmorrahmen von 1528, zwei Termini ([it](https://it.wikipedia.org/wiki/Palazzo_Vecchio)); Stemmi unter den Bögen, „neun Wappen, auf der Fassade zweimal wiederholt“ (it) → **18 Konsolbögen auf der Westfassade**. Das passt zur gemessenen Fassadenlänge: 18 · 5 Blöcke = 90 ≈ 89,9. Dies stützt die Rasterung „Konsolbogen = 5 Blöcke = 2,5 m“.

## 4. Konsistenzprüfung

- Palast: 16 + 17 + 16 + 6 + 1 + 4 + 2 = **62 Lagen** = 31,0 m.
- Turm: 62 (Palastkörper) + 82 + 8 + 8 + 16 + 8 + 4 = **188 Lagen** = 94,0 m ✓.
- Traufe Ostbau: 49 (Geschosse) + 7 (Dachgeschoss) = 56. Gleiche Ebene wie der Ballatoio-Boden des Arnolfo-Blocks.
- Salone: Boden y_rel 17 (Oberkante Decke EG), lichte Höhe 36 (y_rel 17..52), Decke 53, bis Traufe 56 ✓; Firstlage 66 liegt 10 Lagen über der Traufe (Dachrampe 0,4 je Block bis 10, wie `tools/city/haus.js`).
- Korridor: Boden Lage y_rel 33 (Y 101) = Oberkante Decke 1. OG = Boden des 2. OG; gleiche Höhe wie die Uffizien-Dachloggia (Y 101, siehe `uffizi`).
- Flächenprobe Salone (104 × 44 Lichtmaß, Wände 4) → 112 × 52 Außenmaß, Ostblock Tiefe 150 Blöcke ✓.

## 5. Rundungsregeln

- Meter × 2 = Blöcke, **kaufmännisch gerundet** (x,5 → aufwärts) für Längen. **Höhen, die Geschossgrenzen bilden, werden ganzzahlig gewählt**, danach wird die Summe auf den Quellwert gelegt (Turm 94 m exakt).
- Bogenspannweiten und Achsabstände werden auf **gerade** Blockzahlen gerundet (Mittelachse auf Zellmitte), bei Achsrastern auf das nächste Vielfache des Moduls (5 Blöcke Konsolbogen, 10 Blöcke Fensterachse).
- Alle Grundrisswerte stammen aus OSM-Blockkoordinaten (Zellmitte = ganzzahlige Koordinate, Rand zählt innen, wie `tools/city/poly.js`).

## 6. Annahmen (C) und offene Punkte

1. Geschosshöhen und Mauerdicken (siehe §3) sind Planwerte.
2. **Achsenzahl der Biforien** (9 je Reihe an der Westfassade) ist aus den 18 Konsolbögen abgeleitet (2 Bögen je Fenster), nicht aus einer Quelle gezählt. Alternativ 7 Achsen; im Katalog als Parameter `PV_AXES`.
3. Lage des Hauptportals (u = 55) und der Fensterreihen geschätzt.
4. Lage von Salone, Michelozzo-Hof-Arkaden und zweitem Hof im Inneren sind aus OSM-Löchern und Maßen abgeleitet, nicht belegt.
5. Der Arengario (Plattform vor der Fassade) liegt außerhalb des OSM-Polygons und im DGM. Er wird nicht modelliert.

## 7. Quellen

- [Palazzo Vecchio – English Wikipedia](https://en.wikipedia.org/wiki/Palazzo_Vecchio)
- [Palazzo Vecchio – Italiano](https://it.wikipedia.org/wiki/Palazzo_Vecchio)
- [Torre di Arnolfo – Italiano](https://it.wikipedia.org/wiki/Torre_di_Arnolfo)
- [Palazzo Vecchio – Deutsch](https://de.wikipedia.org/wiki/Palazzo_Vecchio)
- [museionline: Torre di Arnolfo](https://www.museionline.info/firenze-musei-e-monumenti/torre-di-arnolfo)
- [1sticket: Palazzo Vecchio e Torre di Arnolfo](https://1sticket.com/it/parco/palazzo-vecchio-torre-di-arnolfo-hotel) (95 m)
- Bartoli (2010), [flore.unifi.it](https://flore.unifi.it/retrieve/e398c37b-4dad-179a-e053-3705fe0a4cff/BARTOLI_def.pdf), nur über Suchzusammenfassung gelesen
- OpenStreetMap-Mitwirkende (ODbL), `data/stadt/gebaeude.json`, `data/stadt/flaechen.json`; DGM Comune di Firenze 2017 (CC BY 4.0) über `tools/geo/gelaende.js`
