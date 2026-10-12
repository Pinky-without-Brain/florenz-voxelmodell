# Referenzmaße V2 (Maßstab 1:2, 1 Block = 0,5 m)

Maßgeblich ist [`tools/spec/dimensions.js`](../tools/spec/dimensions.js). Diese Datei dokumentiert die Herkunft der Werte.
**Höhe:** Y = 64 + 2·h[m] · **Grundriss:** Blöcke = 2·m · **Ursprung:** Kuppelmitte.

## Lageplan (aus OpenStreetMap-Grundrissen, Stand 12.10.2026)
Die Gebäudeumrisse wurden in ein lokales System gedreht, mit der Langhausachse als X (Drehung −1,36° gegen Ost) und der Kuppelmitte als Ursprung. Die Genauigkeit liegt bei etwa ±1 m, also etwa ±2 Blöcke.

| Objekt | Meter (X / Z) | Blöcke |
|---|---|---|
| Außenfläche Westfassade | X −108 | −216 |
| Langhaus, Außenflucht | Z −22,9 … +21,3 | ±44 |
| Ostapsis, Scheitel | X +47,3 | +95 → Tribunenschema +96 |
| Tribune Nord (Außenumriss) | Seitenwände X ±18,5, Scheitelfläche Z −48,5 | halbes Achteck, Apothem 37, Mitte 59 |
| Nord-/Südtribune, Scheitel | Z ±48,5 | ±96 |
| Tambour, Außen über die Flächen | ±26,6 | ±54 (Literatur 54,8 m) |
| Campanile, Mitte / Seite | (−100,2; +32,4) / 14,2 | (−200; +65) / 29 |
| Baptisterium, Mitte | (−153,6; +0,4) | (−307; 0), auf der Achse |
| Abstand Baptisterium–Fassade | ca. 27 m | 58 Blöcke |
| Palazzo dei Canonici, Museo dell'Opera, Loggia del Bigallo | siehe `PIAZZA` | |

## Höhen und Hauptmaße

| Maß | Wert | Quelle |
|---|---|---|
| Gesamtlänge | 153–156 m | Wikipedia; OSM 155,5 m |
| Breite Langhaus | 38 m innen | mehrere Quellen |
| Gewölbe Mittelschiff | 43–45 m → gewählt 43 m (Y 150) | Wikipedia (Liste höchster Kirchenschiffe), Italyscapes |
| Arkaden/Gewölbe Seitenschiffe | 23 m (Y 110) | OSWA, K-State |
| Vier quadratische Joche | 4 × 19 m | K-State, Wikipedia |
| Kuppelansatz | ca. 54 m (Y 172) | Museo Galileo / IMSS |
| Kuppel innen über die Flächen | 45 m (Lit. 45,5 m) | Museo Omero, IMSS |
| Tambourwand | 4,25 m | Literatur |
| Kuppelprofil | Radius = 4/5 Durchmesser ("quinto acuto") | IMSS |
| Innenschale / Zwischenraum / Außenschale | 2,25 m / 1,2 m / 0,6–0,8 m | mehrere Quellen, uneinheitlich |
| Boden bis Laternenbasis | ca. 90–91 m (Y 246) | Wikipedia; aus dem Profil berechnet: Scheitel 90 m ✓ |
| Laterne inkl. Kugel und Kreuz | ca. 22 m | IMSS |
| Gesamthöhe bis Kreuz | 114,5 m (Y 293) | Wikipedia, OSM |
| Campanile | 84,7 m Höhe, 14,45 m Seite | Wikipedia |
| Baptisterium | 25,6 m innen; Höhe 35–45 m, uneinheitlich | Opera del Duomo, Wikipedia |

## Korrekturen nach der ersten Maßzeichnung
- **Langhausdach:** Mit First 48 m und Tambourbasis 42 m hätte das Dach die westlichen Ochsenaugen verdeckt. Jetzt liegt die Traufe bei 42 m (Y 148) und der First bei 46 m (Y 156); die Ochsenaugen sitzen mit Mitte Y 163 und Unterkante Y 158 darüber. Der Gewölbescheitel Y 150 liegt unter dem First.
- **Tribunen:** Die erste Fassung (Radius 33 um Mitte 63) war breiter als die Achteckseite der Vierung. Neu ist der Außenumriss aus OSM abgeleitet (halbes Achteck, Apothem 37, Mitte 59, Scheitel 96). Der Innenraum (Apothem 19) öffnet genau die Achteckseite der Vierung (Halbmaß 45·tan 22,5° = 18,6).

## Annahmen (in `dimensions.js` mit ANNAHME markiert)
Für folgende Werte gibt es keine verlässliche Quelle. Sie sind Plausibilitätswerte und sollen in der Maßzeichnung geprüft werden: Fassadenhöhe 50 m, Dachfirst des Langhauses 48 m, Kapellen- und Tribunendächer 20 m bzw. 33 m, Höhe des Tambours (Basis 42 m), Durchmesser der Ochsenaugen, Maße des Laternentempels, Baptisterium-Höhen.

## Konsistenzprüfung
- Kuppelprofil: Halbmaß über die Ecken = 45 / cos 22,5° = 48,7 → D = 97,4 → Scheitel = 0,742·D = 72 Blöcke über dem Ansatz Y 172. Das ergibt **Y 244**, also 90 m. Das passt zur Literatur.
- Schalenaufbau am Fuß: 45 + 4 + 2 + 2 = 53 ≤ 54 (Tambour außen). Es bleibt 1 Block Gesims.
- Campanile-Nordseite Z 51 und Langhaus-Außenflucht Z 44 ergeben einen Abstand von 7 Blöcken (3,5 m, real 3,8 m). Die Westseite des Campanile liegt bei X −214, die Fassade bei −216.
- Das höchste Bauteil liegt bei Y 293 und damit 26 Blöcke unter der Bauhöhengrenze.

## Quellen
- [Florence Cathedral – Wikipedia](https://en.wikipedia.org/wiki/Florence_Cathedral)
- [Museo Galileo/IMSS – The Dome of Santa Maria del Fiore](https://brunelleschi.imss.fi.it/itineraries/place/TheDomeOfSantaMariaFiore.html)
- [Museo Galileo/IMSS – The dome structure](https://brunelleschi.imss.fi.it/itineraries/multimedia/TheDomeStructure.html)
- [Museo Omero – Dome of Florence Cathedral](https://museoomero.it/en/opere/dome-of-florence-cathedral/)
- [Italyscapes – Cathedral guide](https://www.italyscapes.com/places/tuscany/florence/churches/cathedral-santa-maria-del-fiore/)
- [K-State – Santa Maria del Fiore](https://are-cns.k-state.edu//cns110/node/47)
- [OSWA – In the Pipeline (PDF)](https://www.oswa.org.au/sup/articles/20190501%20In%20the%20Pipeline%20A4%20May%20Florence%20Cathedral.pdf)
- [Giotto's Campanile – Wikipedia](https://en.wikipedia.org/wiki/Giotto%27s_Campanile)
- [Florence Baptistery – Wikipedia](https://en.wikipedia.org/wiki/Florence_Baptistery)
- [Opera di Santa Maria del Fiore – Baptistery](https://duomo.firenze.it/en/discover/baptistry)
- OpenStreetMap-Mitwirkende (ODbL), Overpass-Abfrage der Gebäude und Gebäudeteile um Piazza del Duomo
