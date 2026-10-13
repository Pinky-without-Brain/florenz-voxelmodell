# Referenzmaße – Palazzo Pitti (V3 D2, Wahrzeichen-Welle 2)

Projekt-ID `palazzo_pitti`. Maßstab 1:2 (**Blöcke = 2 · m**), Weltkoordinaten des Stadtmodells (`tools/spec/frame.js`). Stand 13.10.2026.
Stufen: **A** mehrere Quellen übereinstimmend, **B** eine Quelle oder aus OSM/DGM gemessen, **C** Schätzung. Entwurf: [`BAUTEIL_KATALOG.md`](BAUTEIL_KATALOG.md).
Veröffentlichte Maße gibt es nur für die **Gesamtlänge** (205 m), die **Fläche** (32.000 m²) und die **Öffnungsreihen** (drei Serien zu sieben). Fassadenlänge, Tiefe, Flügel und Hof sind **aus OSM gemessen (B)**; Höhen, Wandstärken und Geschossaufteilung sind **geschätzt (C)** bzw. aus einer Proportionsregel abgeleitet.

## 1. Rahmen

| Größe | Wert | Quelle |
|---|---|---|
| OSM-Objekt | Relation **r1637338** „Palazzo Pitti“ (`building=yes`, `historic=building`, `wikidata=Q29286`, Isolato I0394), **43.956 Zellen = 10.989 m²**, ein Außenring (40 Punkte) und **drei Löcher** (430, 573 und 7.021 Zellen); Hüllrechteck x −1306,5..−887, z 1579..1954,5; `hoeheBl` 30 ist eine Pauschale und unbrauchbar | `data/stadt/gebaeude.json` |
| **w118131726** | „Palazzo Pitti-Mannelli“ (`wikidata=Q3890683`), 1.453 Zellen, x −1185,5..−1137, z 1125,5..1180: **ein anderes Gebäude** (nicht der Pitti-Palast, 600 Blöcke entfernt, Isolato I0320). **Bleibt Quartier.** | `gebaeude.json`, Prüfung |
| Überlappung | r1637338 überlappt nur **1 Zelle** mit w1394832037 (Korridor); der Palast gewinnt | Messung |
| Gelände | `groundTopY` Fassadenlinie 81–83; Hauptblock 82–86; **Hanglage hinten und im Westen bis 121**; Histogramm im Footprint: ≤ 81: 7.464 Zellen, 82: 5.682, **83: 9.787**, 84: 6.164, ≥ 85: 14.859 (bis 121) | `tools/geo/gelaende.js` |
| **Bodenplatte `bodenY`** | **83** (häufigster Wert; Fassadenniveau; gebaeude.json `bodenY` 83 = Median, deckt sich) | Entwurf, B |
| **Rahmen `PI`** | Ursprung (**−1226 \| 1864,5**) (Westende der Hauptfassade), **θ = −33,1°** (gegen die Modell-x-Achse), cosθ = 0,8377, sinθ = −0,5461. **u** entlang der Fassade nach Nordost, **w nach innen** (Südost, in den Palast); die Piazza liegt bei w < 0 | gefittet: Hauptkante (−1226 \| 1864,5) → (−1084 \| 1773) → (−936,5 \| 1676): −32,8° und −33,3° (Mittel −33,1°); im Rahmen liegen die Ringpunkte rechtwinklig auf u 0 / 345,5 / −44..376 und w 0 / −96 / 51 / 86 / 117 / 153 / 182 |
| Fassadenrichtung | −33,1° gegen die Modell-x-Achse (Fassade zeigt nach Nordwest zur Piazza dei Pitti) | OSM-Kanten |
| Nachbarn | Piazza dei Pitti **w787858333** (Stadtgrund, 39.766 Zellen, `groundTopY` 67..83); Boboli (`gruen` w24267141) südöstlich und südwestlich; Corridoio-Ende (w1344547176) an der Ostseite des Ostflügels | `flaechen.json` |

Polygon im Rahmen `PI` (Auswahl, u | w): Hauptfassade (0 \| 0) → (345,5 \| 0,2); **Westflügel** u −44,6..1,1 × w −96..−22 (Ecken (−31,4 \| −22,3), (−33,5 \| −64,8), (−34,1 \| −95,1), (1,1 \| −96)); **Ostflügel** u 342,9..376,3 × w −96..−3,6; Ost- und Rückseiten: (371,4 \| 51,1) → (281,9 \| 51,9) → (282,6 \| 116,8) → (251,6 \| 153,3) → (205,6 \| 181,8) → (138,9 \| 178,9) → (92,5 \| 151) → (67,4 \| 89,9) → (−32,4 \| 86,3). Löcher: **L0** u 251..271 × w 42,5..65 (430 Zellen), **L1** u 64..83 × w 35..66 (573 Zellen), **L2 (Ammannati-Hof)** u 135..206 × w 50..150 (7.021 Zellen = 1.755 m²).

## 2. Abgleich Literatur gegen OSM (Abweichung > 3 % begründet)

| Maß | OSM | Literatur | Abw. | Bewertung |
|---|---|---|---|---|
| Gesamtlänge der Front einschließlich Flügel | u −44,6..376,3 = **421 Blöcke = 210,5 m** | **205 m** ([Museo Galileo, Brunelleschi-Katalog](https://brunelleschi.imss.fi.it/museum/esim.asp?c=100265), über die Suchzusammenfassung; ein russischer Reiseführer ebenso); 200 m ([lex.dk](https://lex.dk/Palazzo_Pitti)); 250 m (italienische Seite, nicht belegt) | +2,7 % | in Toleranz. Stufe B. |
| Länge des Mittelbaus (Hauptfassade) | u 0..345,5 = **345,5 Blöcke = 172,7 m** | – | – | Stufe B. |
| Fläche / Geschossfläche | 10.989 m² Grundfläche; mal drei Geschosse = **32.967 m²** | **32.000 m²** ([en](https://en.wikipedia.org/wiki/Palazzo_Pitti), [fr](https://fr.wikipedia.org/wiki/Palais_Pitti): „corps de logis“) | +3 % gegen die Geschossfläche | **Gegenprobe bestanden:** Die Literaturzahl passt zur Geschossfläche aus drei Vollgeschossen, nicht zur Grundfläche. Die Wahl dreier Geschosse im Hauptbau (Katalog) ist damit gestützt. Stufe B. |
| Öffnungen der Fassade | 345,5 / 21 = **16,45 Blöcke = 8,2 m** je Achse | **„drei Serien zu sieben Öffnungen“** ([en](https://en.wikipedia.org/wiki/Palazzo_Pitti), [fr](https://fr.wikipedia.org/wiki/Palais_Pitti)), im Gebäude sieben Achsen im Original ([it](https://it.wikipedia.org/wiki/Palazzo_Pitti)) | – | **21 Achsen** (7 + 7 + 7). Achsabstand 8,2 m plausibel. Die Erweiterung 1620–31 „von 7 auf 13 Achsen“ ([de](https://de.wikipedia.org/wiki/Palazzo_Pitti)) ist mit dem heutigen 21er-Bild nicht vereinbar; **offene Frage 1**, Parameter `PITTI_AXES`. Stufe A (21, drei Ausgaben) gegen B (13). |
| Höhe | OSM-Pauschale 15 m (unbrauchbar) | **38 m** (eine Quelle, [italy4.me](https://en.italy4.me/tuscany/florence/palazzo-pitti.html), über die Suchzusammenfassung); „36 m“ ist **nicht belegt** | – | **38 m = 76 Lagen** gewählt. Stufe B/C. **Offene Frage 2** (Zielwert 36–38 m). |
| Geschosse | – | drei Ebenen: Erdgeschoss, Piano nobile, zweites Obergeschoss ([it](https://it.wikipedia.org/wiki/Palazzo_Pitti)) | – | Stufe B. |
| Proportion | – | „verdoppelt man das Modul, erhält man die Höhe der Öffnungen, vervierfacht man es die Geschosshöhe“ ([it](https://it.wikipedia.org/wiki/Palazzo_Pitti)) | – | **Drei gleich hohe Geschosse**, Öffnungshöhe = halbe Geschosshöhe. Modell: Geschoss 25 Lagen, Öffnung 13 Lagen (≈ 52 %). Stufe B. |
| Rustika | – | **Bugnato** aus Pietra forte; Hof „a canali“ ([en](https://en.wikipedia.org/wiki/Palazzo_Pitti), [it](https://it.wikipedia.org/wiki/Palazzo_Pitti), [de](https://de.wikipedia.org/wiki/Palazzo_Pitti)) | – | Stufe A. Rolle `pietra_forte_rustika`. |
| Portale | – | **drei** Eingangsportale im Original; die seitlichen von Ammannati zu Kniefenstern umgebaut ([it](https://it.wikipedia.org/wiki/Palazzo_Pitti), [en-Suchzusammenfassung](https://en.wikipedia.org/wiki/Palazzo_Pitti)) | – | Heute **ein Hauptportal** in der Mittelachse (k = 10) und **zwei Kniefenster** in den Achsen k = 7 und k = 13 (Original-Mittelblock). Stufe B/C (Zuordnung der Achsen aus der Symmetrie). |
| Seitenflügel | Westflügel u −44,6..1 (34 breit), Ostflügel u 343..376 (34 breit); beide **96 Blöcke = 48 m** nach vorn (w −96..) | Giuseppe Ruggieri 1764–83, „einstöckige Arkadenbauten“ ([de](https://de.wikipedia.org/wiki/Palazzo_Pitti)); Rondò delle Carrozze 1764–65 ([Suchzusammenfassung](https://en.wikipedia.org/wiki/Palazzo_Pitti)); „zwei senkrechte Flügel“ ([fr](https://fr.wikipedia.org/wiki/Palais_Pitti)) | – | **ein Geschoss, 11 m = 22 Lagen** (C). Stufe B/C. |
| Ammannati-Hof | **35,5 × 50 m** (L2, 7.021 Zellen) | Ammannati 1558/60–70, gebändertes „Rustica a canali“, auf mehreren Geschossen ([en](https://en.wikipedia.org/wiki/Palazzo_Pitti)) | – | Stufe B (Maß), B (Stil). |
| Gelände | Piazza fällt vom Palast weg: **Y 83 an der Fassade → 66 bei w = −200** (17 Blöcke auf 200 = 8,5 %) | – | – | gemessen (B). |
| Korridor | OSM-Korridor endet bei **u 379,1..379,3, w −32,2..−22,5** an der **Ostseite des Ostflügels** (3 Blöcke Abstand zur Flügelwand u 376,2), `groundTopY` 77–81 | Korridor „betritt den Palast an der Ostseite über dem Boboli“ ([en](https://en.wikipedia.org/wiki/Vasari_Corridor)); „in der Nähe des heutigen Rondò di Bacco“ ([it](https://it.wikipedia.org/wiki/Corridoio_vasariano)) | – | Stufe B. Anschlussstück Katalog Modul 9. |
| Baudaten | – | 1458 Beginn (Luca Pitti), 1472 Tod Pittis, 1549 Medici, 1558–70 Ammannati, 1616 Wettbewerb, 1618/1631 Parigi, 1764–83 Ruggieri, 1919 Staat ([en](https://en.wikipedia.org/wiki/Palazzo_Pitti)) | – | Stufe A. |

## 3. Hauptmaße im Modell (Lagen über der Bodenplatte, 1 Lage = 0,5 m)

| Maß | m | Lagen / Blöcke | Quelle | Stufe |
|---|---|---|---|---|
| Fassadenlänge Mittelbau | 172,7 | u 0..345,5 | OSM | B |
| Achsen | 8,2 m Abstand | **21**, Mitte k = 10 bei u 172,8; Achsen bei u = 16,452 · (k + 0,5) | 3 Ausgaben | A |
| Geschoss (EG, 1. OG, 2. OG) | 12,5 / 12,5 / 12 | 25 / 25 / 24 (Lage 1..25, 26..50, 51..74) | Proportionsregel + Höhe | C |
| Kranzgesims | 1 | Lage 75..76 | geschätzt | C |
| **Traufe/Gesimsoberkante** | **38** | **76** (Y 159) | eine Quelle | B/C |
| Öffnungen (Fenster) | 3,5 breit × 6,5 hoch | 7 × 13 (9 gerade + Rundbogen 4) | Proportionsregel | B/C |
| Hauptportal | 4,5 × 7,5 | 9 × 15 | geschätzt | C |
| Wandstärke EG / Obergeschosse / Flügel | 2,5 / 2,0 / 2,5 | 5 / 4 / 5 | geschätzt (Quader aus Pietra forte) | C |
| Bosse (Rustikaquader) | 4 × 2 | 8 breit × 4 Lagen hoch, Fugentiefe 1 | geschätzt | C |
| Flügel (Ali/Rondò) | Höhe 11 | 22 Lagen, 96 tief, 34 breit | de (einstöckig) | B/C |
| Flügelarkaden | Weite 4,5, Teilung 8 | 9 breit, Scheitel y 12, Teilung 16, 6 je Flügel | geschätzt | C |
| Ammannati-Hof | 35,5 × 50 | u 135..206 × w 50..150 | OSM | B |
| Hof-Blendarkaden | Weite 4,5 | 9 breit, 13 hoch, Tiefe 2, Teilung 16 | geschätzt | C |
| Westlicher Nebenbau (u < 60, w ≥ 50) | 25 | 2 Geschosse = 50 Lagen | geschätzt | C |
| Dach | – | Walmdach, Anstieg 0,4, höchstens 6 über Lage 77 | geschätzt | C |
| Korridor-Gang Oltrarno | 3,5 × 3,5 | 7 × 7, Wände 2 | Uffizien-Planwert | C |
| Gangboden Oltrarno | – | Y 78 → 83 (Rampe, 1 Lage je ≥ 40 Blöcke) | Entwurf | C |

## 4. Konsistenzprüfung
- Achsen: 21 · 16,452 = **345,5** ✓.
- Höhen: 25 + 25 + 24 + 2 = **76** Lagen = 38 m ✓.
- Gesamtlänge: Westflügel-Außenkante u −44,6 bis Ostflügel-Außenkante u 376,3 = 420,9 Blöcke = 210,5 m gegen 205 m (410 Blöcke) ✓ (+2,7 %).
- Geschossfläche: 10.989 m² · 3 = 32.967 ≈ 32.000 m² ✓.
- Flügel: 96 Blöcke = 48 m tief; 6 Arkaden · 16 = 96 ✓.
- Piazza: Gefälle 8,5 %, Anhebung auf 83 an der Fassade im Band 6 Blöcke (Stadtgrund).
- Hofwand: Außenlänge L2 2 · (71 + 100) = 342 Blöcke, Teilung 16 → 21 Arkaden-Achsen an drei Seiten (71 + 100 + 100) / 16 = 17 ✓.

## 5. Rundung
Meter · 2, kaufmännisch gerundet; Fassadenachsen 16,452 auf ganze Zellen gerundet (Achsmitten u = 8, 25, 41, 58, 74, 91, 107, 123, 140, 156, **173**, 189, 206, 222, 239, 255, 272, 288, 304, 321, 337); Spiegelachse bei u = 172,75 (Zwischenwert, Mittelachse k = 10 bei Zelle 173). Fenster mit ungerader Weite (7) haben eine Mittelzelle.

## 6. Annahmen und offene Punkte
1. **Achsenzahl** 21 (drei Wikipedia-Ausgaben) gegen 13 (de, Erweiterung 1620–31).
2. **Höhe** 38 m (eine Suchzusammenfassung); 36 m nicht belegt.
3. **Hanglage:** 21.023 Footprint-Zellen (48 %) haben `groundTopY` ≥ 84 (bis 121). Modell: **eine** Bodenplatte Y 83; das Gelände im Footprint wird **abgetragen** (Säulenregel), der Palast steht vor dem Hang. Variante: zweite Bodenebene für den Westteil (Empfehlung: nein).
4. Westlicher Nebenbau (u < 60, w ≥ 50) ist im OSM-Polygon enthalten, aber nirgends beschrieben; zwei Geschosse (C).
5. Die Flügelhöhe (ein Geschoss) beruht auf einer Beschreibung für die Ruggieri-Bauten; ob die OSM-Flügel (34 × 96) genau diese sind, ist nicht geprüft.
6. Hofnutzung: L0 und L1 sind kleine Lichthöfe (Funktion nicht belegt, wie bei Palazzo Vecchio).
7. **Boboli** (`gruen`) gehört dem Stadtgrund (Rasen); die **Grotta del Buontalenti** (w473825750, 499 Zellen, `groundTopY` Median 76) liegt 260 m nordöstlich im Garten, ist **nicht** Teil dieses Projekts (Option Welle 3).
8. Korridor-Ende: OSM-Lücke von 3 Blöcken zwischen Korridormaske und Flügelwand wird mit einem Anschlussstück (`luftraum` 3) geschlossen.

## 6a. Innenräume (Standard Begehbarkeit, [`../../BEGEHBARKEIT.md`](../../BEGEHBARKEIT.md))
| Aussage | Quelle | Stufe |
|---|---|---|
| Galleria Palatina 28 Räume, Appartamenti Reali 14 Räume (Green Room, Throne room, Blue Room, Medici-Porträts von Sustermans, savoyische Empire-Ausstattung) | [en Palatine Gallery](https://en.wikipedia.org/wiki/Palatine_Gallery), [en Palazzo Pitti](https://en.wikipedia.org/wiki/Palazzo_Pitti) | B |
| Planetensäle an der Front: Venus, Apollo, Mars, Jupiter (Thronsaal der Medici), Saturn; Cortona bis 1647, Ciro Ferri bis 1660er; Sala della Stufa (Cortona, 1637/1641) | [en Palatine Gallery](https://en.wikipedia.org/wiki/Palatine_Gallery) | B |
| Raumnamen und Freskanten: Castagnoli, Arca (Ademollo 1816), Psiche (Collignon), Poccetti, Prometeo (Collignon), Giustizia (Fedi), Ulisse (Martellini 1815), Iliade, Weißer Saal (Ballsaal) | ebenda | B |
| Hängung „wandfüllend“, nicht chronologisch | ebenda | B |
| monumentale Treppe von Ammannati 1558–70 zum Piano nobile | ebenda | B |
| Galleria d'arte moderna im zweiten Obergeschoss | [it](https://it.wikipedia.org/wiki/Palazzo_Pitti) | B |
| Lage der Räume im Raster, Raumtiefen, Treppenboxen, Türen, Licht | Entwurf | C |

## 7. Quellen
- [Palazzo Pitti – English Wikipedia](https://en.wikipedia.org/wiki/Palazzo_Pitti) (32.000 m², Öffnungsserien, Bauphasen)
- [Palazzo Pitti – Italiano](https://it.wikipedia.org/wiki/Palazzo_Pitti) (sieben Achsen, drei Portale, Proportionsregel)
- [Palazzo Pitti – Deutsch](https://de.wikipedia.org/wiki/Palazzo_Pitti) (Erweiterung 7 → 13, einstöckige Arkadenbauten 1764)
- [Palais Pitti – Français](https://fr.wikipedia.org/wiki/Palais_Pitti) (drei Serien zu sieben, 32.000 m²)
- [Museo Galileo: Palazzo Pitti](https://brunelleschi.imss.fi.it/museum/esim.asp?c=100265) (205 m; über die Suchzusammenfassung)
- [italy4.me: Pitti Palace](https://en.italy4.me/tuscany/florence/palazzo-pitti.html) (38 m; über die Suchzusammenfassung)
- [Corridoio vasariano – Italiano](https://it.wikipedia.org/wiki/Corridoio_vasariano), [Vasari Corridor – English](https://en.wikipedia.org/wiki/Vasari_Corridor) (Ende am Pitti)
- OpenStreetMap-Mitwirkende (ODbL), `data/stadt/gebaeude.json`, `flaechen.json`; DGM Comune di Firenze 2017 (CC BY 4.0)
