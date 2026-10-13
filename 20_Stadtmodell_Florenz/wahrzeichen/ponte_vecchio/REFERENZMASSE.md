# Referenzmaße – Ponte Vecchio mit Corridoio Vasariano (V3 D2, Wahrzeichen-Welle 2)

Projekt-ID `ponte_vecchio`. Maßstab 1:2 (**Blöcke = 2 · m**), Weltkoordinaten des Stadtmodells (`tools/spec/frame.js`). Stand 13.10.2026.
Stufen: **A** mehrere Quellen übereinstimmend, **B** eine Quelle oder aus OSM/DGM gemessen, **C** Schätzung. Entwurf: [`BAUTEIL_KATALOG.md`](BAUTEIL_KATALOG.md). Anschluss im Norden: [`../uffizi/BAUTEIL_KATALOG.md`](../uffizi/BAUTEIL_KATALOG.md) §9.2 Teil 8.
Veröffentlichte Maße gibt es nur für Gesamtlänge, Breite, Spannweiten und Stich der Brücke. Läden, Korridor, Turm und alle Höhen über der Fahrbahn sind **aus OSM gemessen (B)** oder **geschätzt (C)**.

## 1. Rahmen

| Größe | Wert | Quelle |
|---|---|---|
| OSM-Objekte | **r5342094** (`man_made=bridge`, „Ponte Vecchio“, 9.667 Zellen, Ring mit 60 Punkten; steht in `flaechen.json` → `bruecken`, **nicht** in `gebaeude.json`); **w24999532** (Fahrbahnlinie, `highway=pedestrian`, `bridge`, 8 m gepuffert, nur Verlauf); **r2302812** (`building=retail`, `levels 4`, 6.104 Zellen, drei Ringe mit 20/13/19 Punkten = Ladenzeilen); **w306692132** „Torre dei Mannelli“ (`wikidata=Q1092486`, 349 Zellen); **w1344547176** „Corridoio Vasariano“ (`building=no`; hier der Anteil x ≤ −529 und z ≤ 1311); **w1394832044** (`building=yes`, `levels 3`, `min_level 2`, 494 Zellen: Korridor über die Via dei Bardi) | `data/stadt/flaechen.json`, `gebaeude.json` |
| Maske `M_PV` | (r5342094 ∪ r2302812 ∪ Korridor x ≤ −529, z ≤ 1311 ∪ w1394832044 ∪ w306692132) **abzüglich** der Zellen, die `uffizi` besitzt (`M_COR`, x ≥ −528: 97 Zellen von r2302812/r5342094). Gemessen **10.844 Zellen**: Brücke 9.570, Läden außerhalb der Brücke 260, Korridor außerhalb 1.154, Turm 348 | gemessen |
| Gelände | Nordufer (Lungarno) `groundTopY` 63–64, Uferböschung 61 → 52 auf u −2..8; **Wasserspiegel Y 50** (7.988 Maskenspalten über Wasser, Median); Südufer 51 → 60 (u 177..209), Straßen am Südende 63–64; Turm 60–64 | `tools/geo/gelaende.js` |
| **Fahrbahnplatte `bodenY`** | **63** (Oberkante Fahrbahn und Ladenboden = Lungarno-Niveau, siehe Uffizien: „Straße 63, Korridorboden Y 78 = 63 + 15“) | Entwurf, B |
| **Rahmen `PB`** | Ursprung (−539 \| 1058) (Mitte der Nordkante der Fahrbahnlinie), **θ = 116,6°** (gegen die Modell-x-Achse). **u** läuft über die Brücke von Nord (Lungarno) nach Süd (Oltrarno), **w** zeigt nach **West = stromab** (w > 0), die Ostseite (stromauf, Korridorseite) hat w < 0. cosθ = −0,4478, sinθ = 0,8942 | gefittet: gewichtetes Mittel der langen Kanten von r5342094/r2302812 (115,4°–118,7°, Summe > 600 Blöcke), Fahrbahnlinie 116,57°, Korridorkante (−519,5 \| 1070) → (−604,5 \| 1239,5) 116,6° |
| Fließrichtung | Der Arno fließt hier nach West (−x); die Uffizien liegen stromauf (Ost) der Brücke, Ponte Santa Trinita stromab | Lage der Objekte |
| Schnitt zu `uffizi` | Ebene **x = −528 / −529**: `uffizi` baut x ≥ −528, `ponte_vecchio` x ≤ −529. Querschnitt identisch: Platte Y 77..78, Wände Y 79..85, Decke Y 86..87 | `uffizi/BAUTEIL_KATALOG.md` §9.2 Teil 8 |
| Schnitt zu `palazzo_pitti` | Korridor-Abschnitt endet bei **z = 1311 / 1312** (Ende von w1394832044, Via dei Bardi); ab z ≥ 1312 gehört der Korridor `palazzo_pitti` (Modul 9) | Entwurf |

Lage des Rahmens: u 0 = Nordkante der Fahrbahnlinie; die Maske reicht von u −5,4 bis u 272,8 (Korridor am Südende), w von −36,4 bis 35,3.

## 2. Abgleich Literatur gegen OSM (Abweichung > 3 % begründet)

| Maß | OSM/DGM | Literatur | Abw. | Bewertung |
|---|---|---|---|---|
| Länge der Brücke | Maske der Fahrbahn u −2..209 = **211 Blöcke = 105,5 m** (einschließlich Rampen und Widerlager); **Wasserbreite am Schnitt u 6..176: 171 Blöcke = 85,5 m** (Mittel aus w = −40..40) | **95 m** ([de](https://de.wikipedia.org/wiki/Ponte_Vecchio), [it](https://it.wikipedia.org/wiki/Ponte_Vecchio)) | Wasser −10 %, Maske +11 % | OSM gewinnt für den Grundriss. 95 m liegen zwischen Wasserbreite und Maske (Länge zwischen den Widerlager-Außenflächen). Stufe B. |
| Spannweiten | – | **27 / 30 / 27 m** ([en](https://en.wikipedia.org/wiki/Ponte_Vecchio), [de](https://de.wikipedia.org/wiki/Ponte_Vecchio), [it](https://it.wikipedia.org/wiki/Ponte_Vecchio): nur Hauptbogen 30 m; [Structurae](https://structurae.net/en/structures/ponte-vecchio)) | – | Stufe A. **Summe 84 m + zwei Pfeiler passt nicht in 85,5 m Wasserbreite.** Modell: Spannweiten **49 / 54 / 49 Blöcke (24,5 / 27 / 24,5 m)** und Pfeiler 9 Blöcke, Summe 170. Das erhält das Verhältnis 0,9 : 1 : 0,9 der Literatur und füllt die OSM-Wasserbreite. Stufe C (abgeleitet). Offene Frage 1. |
| Stich der Bögen | – | **3,9–4,4 m** ([Structurae](https://structurae.net/en/structures/ponte-vecchio)); 3,5–4,4 m, Verhältnis Spannweite : Stich = 5 : 1 ([en](https://en.wikipedia.org/wiki/Ponte_Vecchio)); 6,5 : 1 ([it](https://it.wikipedia.org/wiki/Ponte_Vecchio)); lichte Höhe 4,40 m ([de](https://de.wikipedia.org/wiki/Ponte_Vecchio)) | – | Stufe B (Quellen streuen). Modell **Stich 8 Blöcke = 4,0 m** für alle drei Bögen (Verhältnis 54 : 8 = 6,75 : 1 am Hauptbogen). |
| Breite der Brücke | Maske **45 Blöcke = 22,5 m** (w −22..+22, im Norden bis +35, im Süden bis −36) | **20 m „ohne Anbauten“** ([de](https://de.wikipedia.org/wiki/Ponte_Vecchio)); 32 m ([Structurae](https://structurae.net/en/structures/ponte-vecchio), „Fahrbahnbreite“, vermutlich einschließlich der Auskragungen); Vasari: 8 + 16 + 8 = **32 braccia** = 18,7 m (de; 1 braccio fiorentino = 583 mm, [en.wikipedia Braccio](https://en.wikipedia.org/wiki/Braccio)) | Maske +12 % gegen 20 m | Die Maske enthält die Auskragungen (sporti). Tragkörper 39 Blöcke (19,5 m, Stufe A/B), je ≈ 3 Blöcke Auskragung beidseits. |
| Läden, Tiefe | Ostzeile 13, Westzeile 16 Blöcke (inklusive Auskragung) | 8 braccia = **4,66 m** (de) | – | Tiefe im Tragkörper ≈ 10 Blöcke Ost / 13 West, davon Wände 2 + 2; Rest Auskragung. Stufe B. |
| Fahrbahn zwischen den Zeilen | Lücke zwischen den Ladenzeilen **15–16 Blöcke = 7,8 m** (Fahrbahnlinie ±7,6) | 16 braccia = 9,3 m (Vasari, de: der Straßenraum sei 42 cm breiter als Vasaris Angabe) | −16 % | OSM gewinnt (die Zeilenmasken schließen die Auskragung ein). Stufe B. |
| Brückenmitte | Westzeile **unterbrochen bei u ≈ 82..121** (39 Blöcke = 19,5 m); Ostzeile durchgehend (Korridor darüber) | de: „Randbebauung am Scheitel unterbrochen; **Ostseite Loggia mit drei Arkaden, Westseite Freifläche mit Cellini-Statue**“; en: Büste „in der Mitte der Ostseite“; it: drei große Fenster in der Mitte, 1860 als Zugang zu einer provisorischen Terrasse geöffnet | en gegen de | **OSM und de gelten** (OSM zeigt die Lücke im Westen). Offene Frage 3. Stufe B. |
| Korridorseite | Korridormaske liegt auf der **Ostzeile** (w −22..−10) | de: „über der östlichen Ladenzeile“; en/it: Fenster „zum Ponte Santa Trinita“ (West) | – | Ostzeile (OSM + de). Die drei großen Fenster liegen in der **Westwand des Gangs** über der westlichen Freifläche (Blick nach Santa Trinita). Stufe B/C. Offene Frage 2. |
| Korridor, Gang | Maske der Ostzeile 12–13 Blöcke breit; Oltrarno-Streifen 10–11 Blöcke (horizontal gemessen 12) | it.wikipedia: Bypass am Torre dei Mannelli auf **Konsolen (beccatelli)**, ca. 760 m Gesamtlänge ([it](https://it.wikipedia.org/wiki/Corridoio_vasariano)); keine Gangmaße in den Quellen | – | Gang **7 breit × 7 hoch** (Planwert der Uffizien-Spezifikation, C). |
| Torre dei Mannelli | Grundriss 349 Zellen (≈ 18 × 20 Blöcke), OSM-Höhe 30 (Pauschale 15 m, unbrauchbar) | Korridor „an der **Westseite** des Turms durch Steinkonsolen“ befestigt ([en](https://en.wikipedia.org/wiki/Vasari_Corridor)); Konsolen aus Pietra serena, Wand aus „filaretto“ mit Gerüstlöchern, oberste Etage mit großem Raum ([it](https://it.wikipedia.org/wiki/Torre_dei_Mannelli)); Lage an der SO-Ecke der Brücke ([en](https://en.wikipedia.org/wiki/Ponte_Vecchio)) | – | Höhe **28 m = 56 Lagen** (C: florentinischer Geschlechterturm, vier Stockwerke und Zinnenkranz; keine Quelle nennt eine Höhe). |
| Cellini-Büste | – | Raffaello Romanelli, 1900/01, Bronze auf Brunnen ([en](https://en.wikipedia.org/wiki/Ponte_Vecchio), [it](https://it.wikipedia.org/wiki/Ponte_Vecchio)) | – | Stufe A (Existenz), Maße C. |
| Laden-Zahl | 3.033 (Ost) / 2.974 Zellen (West) Zeilenfläche; bei Teilung 8 Blöcke je Laden ca. 25 + 20 | it.wikipedia nummeriert Läden 1r..55r (vier Blöcke, keine Summe) | – | Teilung 8 Blöcke (4 m) Stufe C. |
| Baudaten | – | 996 erstmals, 1117 Hochwasser, 1333 zerstört (zwei Mittelpfeiler überlebt), **1345** Neubau; 1442 Metzger, 1565 Korridor, 1593 Goldschmiede; Retrobotteghe ab 17. Jh. ([en](https://en.wikipedia.org/wiki/Ponte_Vecchio)) | – | Stufe A. |
| Material | – | Pfeiler aus großen Quadern Pietra forte mit Mörtelkern ([Smarthistory](https://smarthistory.org/ponte-vecchio-florence), über die Suchzusammenfassung) | – | Stufe B. Segmentbögen „closed spandrel“ ([en](https://en.wikipedia.org/wiki/Ponte_Vecchio)). |

## 3. Hauptmaße im Modell (Y absolut, `y_rel = Y − 63`)

| Maß | m | Blöcke / Lagen | Quelle | Stufe |
|---|---|---|---|---|
| Wasserspiegel (Stadtgrund) | 0 | Y **50** (y_rel −13) | DGM | B |
| Flussbett Oberkante (Stadtgrund, Kies) | −1,0 | Y 48 (y_rel −15) | Stadtgrund-Spezifikation (Wassertiefe 2 Lagen) | C |
| Pfeilerfuß | – | Y **47** (y_rel −16); die Pfeilerspalten bleiben im Stadtgrund frei (Aussparung) | Entwurf | C |
| Kämpferlinie (Bogenansatz) | +0,5 | Y **51** (y_rel −12) | folgt aus Fahrbahn − Scheiteldicke − Stich | C |
| Stich | 4,0 | 8 | Structurae, de, en | B |
| Scheitel Laibung Hauptbogen | – | Y 59 (y_rel −4); Seitenbögen ebenso (Stich 8) | folgt | C |
| Gewölbering (Laibung bis Extrados) | 1,0 | 2 Lagen | geschätzt | C |
| Fahrbahnoberkante / Ladenboden | 6,5 über Wasser | Y **63** (y_rel 0) | OSM-Ufer 63–64 | B |
| Laden Erdgeschoss, Licht | 3,5 | Lagen 1..7 | geschätzt | C |
| Zwischendecke (Holzbalken) | 1,0 | Lagen 8..9 | geschätzt | C |
| Obergeschoss/Lager, Licht | 2,0 | Lagen 10..13 | geschätzt | C |
| Decke Ostzeile = **Korridorboden** (2 dick) | – | Lagen 14..15 = Y 77..78 (Oberkante **Y 78**) | Uffizien-Katalog (Lungarno Y 78 = 63 + 15) | B |
| Korridorgang | 3,5 | Lagen 16..22 = Y 79..85 | Uffizien-Katalog | C |
| Korridordecke | 1,0 | Lagen 23..24 = Y 86..87 | Uffizien-Katalog | C |
| Dach Westzeile | – | ab Lage 16, Walmdach (Anstieg 0,4 je Block, höchstens 3 Lagen) | geschätzt | C |
| Torre dei Mannelli | 28 | Lagen 1..56 (Y 64..119), Zinnen/Dach Lagen 57..60 | s. §2 | C |
| Cellini-Brunnen mit Büste | ≈ 4 | Lagen 1..8 | s. §2 | C |

## 4. Konsistenzprüfung
- Spannweiten und Pfeiler: 49 + 9 + 54 + 9 + 49 = **170** = Wasserbreite u 6..175 ✓ (OSM-Wasser u 6..176 bei w = 0, am Fahrbahnrand 6..175).
- Stich: Hauptbogen 54 : 8 = 6,75, Seitenbögen 49 : 8 = 6,1 (Quellen 5 : 1 bis 6,5 : 1) ✓.
- Höhen: Y 63 − Y 51 = 12 = Stich 8 + Gewölbering 2 + Füllung 2 ✓ (Scheitel Laibung Y 59, Extrados Y 60, Füllung Y 61..62, Belag Y 63).
- Ladenhöhe: 7 + 2 + 4 + 2 = **15** Lagen bis Oberkante Korridorboden (Y 78) ✓ = Uffizien-Wert 63 + 15.
- Korridor: Boden 14..15, Gang 16..22 (7), Decke 23..24 = Y 77..87 ✓ = Uffizien §9.2 Teil 8 (Platte 77..78, Wände 79..85, Decke 86..87).
- Breite: Zeile Ost 13 (w −22..−10) + Fahrbahn 16 (w −9..6) + Zeile West 16 (w 7..22) = **45** = Maskenbreite ✓.
- Tragkörper 39 (w −19..19) + 3 Auskragung Ost (w −22..−20) + 3 Auskragung West (w 20..22) = 45 ✓.
- Läden Teilung: 205 / 8 ≈ 25 Läden Ost; West 2 Abschnitte (u 0..81 und u 122..205) ≈ 10 + 10.
- Mannelli: Höhe 56 Lagen; Korridorboden Y 78 = Lage 15: der Gang läuft in Höhe des 1. bis 2. Turmgeschosses an der Westseite vorbei ✓.

## 5. Rundung
Meter · 2, kaufmännisch gerundet; Spannweiten auf die OSM-Wasserbreite gelegt (Summe 170); Höhen ganzzahlig, Summen geprüft; Bögen mit gerader Spannweite haben eine Spiegelachse zwischen zwei Zellen (u-Mitte der Hauptöffnung bei 90,5).

## 6. Annahmen und offene Punkte
1. **Spannweiten** (OSM-Wasserbreite 85,5 m gegen Literatur 27/30/27 m + Pfeiler ≈ 93 m): im Katalog gilt OSM, Spannweiten skaliert (49/54/49). Ein Foto-Abgleich (A5) kann die Pfeilerlage klären.
2. **Korridorseite und Fensterlage**: Ostzeile (OSM, de) gegen „Fenster nach Santa Trinita“ (en, it). Modell: Gang auf der Ostzeile, große Fenster in der Westwand des Gangs.
3. **Cellini-Büste** West (de, OSM-Lücke) gegen Ost (en).
4. Läden: Raster 8 Blöcke, Tür 6 × 6, Fenster 2 × 3 sind Planwerte. Zählung der Läden (it: 1r..55r) nicht geprüft.
5. **Auskragungen (sporti)** ruhen auf Konsolen aus `holz_sporto`; Quellen: „aufgesetzte Holzstützen“ ab 1442 ([Suchzusammenfassung](https://en.wikipedia.org/wiki/Ponte_Vecchio)). Maße C.
6. Torre dei Mannelli: Höhe 28 m (C) gegen OSM-Pauschale 15 m. Die Gangbreite am Turm (4–5 Zellen, OSM) ergibt dort einen schmalen Gang (3 breit) – C.
7. Weiterführung des Korridors nach Pitti (z ≥ 1312) steht im Katalog `palazzo_pitti` Modul 9.
8. Der Stadtgrund lässt die Pfeilerspalten frei (Aussparung, Katalog §0.6), baut aber Wasser und Bett unter den Bögen.

## 6a. Innenräume (Standard Begehbarkeit)
| Aussage | Quelle | Stufe |
|---|---|---|
| Läden: Metzger ab 1442, ab 1593 Goldschmiede und Juweliere; Retrobotteghe auf Konsolen | [en](https://en.wikipedia.org/wiki/Ponte_Vecchio) | A |
| Korridor: betritt die Uffizien im obersten Geschoss, Autoritratti-Sammlung („la più ricca al mondo“), Gemälde des 17./18. Jh., drei große Fenster in der Mitte der Brücke (1860 Zugang zu einer provisorischen Terrasse), 2016 geschlossen, **21.12.2024 wiedereröffnet**, rund 760 m | [it](https://it.wikipedia.org/wiki/Corridoio_vasariano) | B |
| Laden-Einrichtung (Tresen, Regal, Vitrine), Ladentreppen, Loggia-Treppe zum Gang, Turm-Wendeltreppe, Lichtraster | Entwurf nach [`../../BEGEHBARKEIT.md`](../../BEGEHBARKEIT.md) | C |
| Gangbreite 7, Höhe 7, Wände 3 (Brücke) bzw. 2 | Uffizien-Planwert | C |

## 7. Quellen
- [Ponte Vecchio – English Wikipedia](https://en.wikipedia.org/wiki/Ponte_Vecchio) (Spannweiten, Stich, Läden, Cellini, Korridor, Torre dei Mannelli)
- [Ponte Vecchio – Deutsch](https://de.wikipedia.org/wiki/Ponte_Vecchio) (95 m, 20 m, Vasaris braccia, Brückenmitte, Korridor über Ostzeile)
- [Ponte Vecchio – Italiano](https://it.wikipedia.org/wiki/Ponte_Vecchio) (Länge, Breite, retrobotteghe auf Konsolen, Fenster)
- [Corridoio vasariano – Italiano](https://it.wikipedia.org/wiki/Corridoio_vasariano) (Verlauf, beccatelli, Via de' Bardi, 760 m)
- [Vasari Corridor – English](https://en.wikipedia.org/wiki/Vasari_Corridor) (Fenster, Turm-Westseite, Pitti)
- [Torre dei Mannelli – Italiano](https://it.wikipedia.org/wiki/Torre_dei_Mannelli) (Konsolen, Material)
- [Structurae: Ponte Vecchio](https://structurae.net/en/structures/ponte-vecchio) (Spannweiten, Stich, Breite)
- [Smarthistory: Ponte Vecchio](https://smarthistory.org/ponte-vecchio-florence) (Pfeiler, Vorköpfe; über Suchzusammenfassung)
- [Braccio – English Wikipedia](https://en.wikipedia.org/wiki/Braccio) (583 mm)
- OpenStreetMap-Mitwirkende (ODbL), `data/stadt/flaechen.json`, `gebaeude.json`; DGM Comune di Firenze 2017 (CC BY 4.0)
