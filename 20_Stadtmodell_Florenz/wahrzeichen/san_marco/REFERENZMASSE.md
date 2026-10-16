# Referenzmaße – San Marco (Basilika und Konvent mit Museum) (W5a, Wahrzeichen-Welle 5)

Projekt-ID `san_marco`. Maßstab 1:2 (**Blöcke = 2 · m**). Stand 16.10.2026.
Stufen: **A** mehrere Quellen, **B** eine Quelle oder OSM gemessen, **C** Schätzung (Proportion, begründet). Entwurf: [`BAUTEIL_KATALOG.md`](BAUTEIL_KATALOG.md).
Quellen (gelesen am 16.10.2026): it.wikipedia „Basilica di San Marco (Firenze)“ und „Museo nazionale di San Marco“, en.wikipedia „San Marco, Florence“, de.wikipedia „San Marco (Florenz)“. Die Seiten nennen **kaum Maße in Metern**; alle Grundrissmaße stammen deshalb aus OSM.

## 1. Rahmen und OSM

| Größe | Wert | Quelle |
|---|---|---|
| Basilika | Way **w225706552** „Basilica di San Marco“, 3.906 Zellen (nach Abzug des Konvents 3.896) | `data/stadt/gebaeude.json` |
| Ex-Konvent | Relation **r1575764** „Ex convento di San Marco“, 23.759 Zellen, **sechs Höfe** (Löcher) | `gebaeude.json` |
| Campanile | `building:part` **w599900776** (Teil der Basilika, `tower:type = bell_tower`), 74 Zellen, ≈ 8,4 × 9,2 Blöcke, an der Ostseite des Presbyteriums | OSM-Rohdaten `data/osm/gebaeude_2026-10-12.json`, Teil in `gebaeude.json` |
| **Rahmen `SM`** | Ursprung (**260 \| −1148,5**) = Westecke der Kirchenfassade an der Piazza San Marco, **θ = −61,78°**: u von der Fassade nach NNO zur Apsis, w quer nach OSO (zum Konvent) | gefittet: Fassadenkante (296,5 \| −1128,5) → (260 \| −1148,5) und Konventskanten 27,6° bis 28,7° (Kanten stehen im Rahmen auf ±0,5° orthogonal) |
| Gelände | Kirche 68 bis 70 (2.181 Zellen auf 68), Konvent 66 bis 71 (17.335 Zellen auf 68), Straßen ringsum 67 bis 70 | `ground_stadt.js` |
| **`bodenY`** | **68** (Boden der Kirche und des Erdgeschosses; Gelände im Umriss bis Y 67 abgetragen) | Entwurf |
| Maske | Hauptmaske = Konvent (palazzo.js, Höfe als Löcher); Zusatzmaske `basilika` = Kirche abzüglich Konvent; Campanile liegt innerhalb der Kirchenmaske | `project.json` |
| Vorrang | w225706552, r1575764 → `san_marco`; aus `quartier_san_marco` gelöst (Hausakten gelöscht). Casino mediceo (r4086116 u. a.) bleibt Quartiersbau | `vorrang.json` |

Polygon im Rahmen (u \| w, Blöcke): Kirche u 0..105,4 × w 0..42; Langhaus u 0..70 voll breit (w 0..42), danach Presbyterium u 70..96 × w 7..38 und Apsis u 96..105 × w 14..34 (Vieleck). Konvent u −0,5..233 × w −27..121; Chiostro di Sant’Antonino = Loch 5 (u 27..65 × w 51..92,5, **38 × 41 Blöcke = 19 × 20,5 m**), Chiostro di San Domenico = Loch 3 (u 119..175 × w 2..60, **56 × 58 Blöcke = 28 × 29 m**), vier kleine Lichthöfe (Löcher 0, 1, 2, 4).

## 2. Maße und Befunde

| Maß | Modell | Literatur | Stufe |
|---|---|---|---|
| Schiffe | einschiffiger Saal mit Seitenkapellen; links drei Altäre und die Cappella Salviati, rechts vier | it.wikipedia | B |
| Außenmaß Kirche | 105 × 42 Blöcke = 52,5 × 21 m, Langhaus 35 m lang | OSM | B |
| Joche | vier Joche zu 15,5 Blöcken (7,75 m) | Zahl der Altäre je Seite (it.wikipedia); Breite aus OSM-Länge | C |
| Mittelschiff | w 12..31 = 19 Blöcke (9,5 m) breit, Kassettendecke auf Lage 30 (15 m), First Lage 44 (22 m) | Breite C (Außenmaß minus Kapellen), Höhe C | C |
| Decke | geschnitzte Holzdecke ab 1679 (Pier Francesco Silvani), Mittelbild Assunzione von G. A. Pucci 1725 | it.wikipedia | B |
| Fassade | klassizistisch 1777 bis 1778 (Giovan Battista Paladini, nach de.wikipedia Gioacchino Pronti 1777 bis 1780): drei Ordnungen mit Pilastern, ein Portal, darüber ein Fenster | it.wikipedia, de.wikipedia | A (Aufbau), Höhe C |
| Presbyterium und Kuppel | Kuppel nach Entwurf von Angelo Ferri vor 1712 erhöht, Fresko Alessandro Gherardini 1717; Fresken der Wände Ignace Parrocel; Apsis von Michelozzo neu gebaut | it.wikipedia | B |
| Hochaltar | Kruzifix Fra Angelicos (1425 bis 1428) | it.wikipedia | B |
| Cappella di Sant’Antonino (Salviati) | links im Langhaus, Giambologna ab etwa 1580 (in der Krypta begonnen), Fresken Allori, Bronzereliefs 1581 bis 1587, vollendet Mai 1589, eigener Außenzugang | it.wikipedia, en.wikipedia | A |
| Campanile | Baccio d’Agnolo 1512; Grundfläche im Modell 11 × 11 (OSM-Teil 74 Zellen, zu klein für die Wendeltreppe), Höhe **35 m (Lage 70)** | it.wikipedia (nur Bauherr und Jahr); Lage OSM | Lage B, Höhe und Größe C |
| Bauzeit des Konvents | Umbau durch Michelozzo 1439 bis 1444, Weihe in der Epiphanienacht 1443; Kreuzgänge, Kapitelsaal, Dormitorium um 1440/41, südliches Dormitorium über der Piazza 1442, Rest 1452 | en.wikipedia; Kreuzgänge vor 1440 it.wikipedia | B |
| Chiostro di Sant’Antonino | vier Portiken, Kreuzgewölbe auf schlanken Säulen; **28 Lünetten** Fra Angelicos, je **3,80 m** Durchmesser (= 7,6 Blöcke, im Modell 7); Kreuzigung mit dem hl. Dominikus in der Nordwestecke; **Zypresse im Hof** (Vorgabe des Projektauftrags) | it.wikipedia, de.wikipedia | A (Lünetten), B |
| Räume im Erdgeschoss | Sala dell’Ospizio (Tafelbilder Fra Angelicos), Sala del Capitolo (Kreuzigung 1442, Holzkruzifix 1496), Refettorio grande (Sogliani 1536), Refettorio piccolo (Ghirlandaio 1486), Foresteria (Fra Bartolomeo), Sala del Lavabo | it.wikipedia | B |
| Chiostro di San Domenico | gehört weiter den Brüdern, nicht öffentlich; im Modell schlichter Hof | it.wikipedia | B |
| Obergeschoss | Treppe, davor die Verkündigung (um 1442); **44 Zellen** an drei Gängen (zwei Gänge mit Zellen auf beiden Seiten, der dritte zur Piazza nur auf der Nordseite), Fresken um 1442 bis 1445; Zellen Savonarolas (drei verbundene Zellen des Priors) | it.wikipedia | B |
| Biblioteca di Michelozzo | **45 m** (90 Blöcke) lang, drei Schiffe, zwei Reihen schlanker ionischer Säulen, Kreuzgewölbe in den Seitenschiffen, Tonne im Mittelschiff, 1441 bis 1444 | it.wikipedia, de.wikipedia | A |
| Lage der Räume | Die Quellen nennen Räume, keinen Grundriss: Lage im Gebäude ist **Stufe C** (gewählt nach der Form der OSM-Flügel) | – | C |

## 3. Entwurfswerte (Stufe C)
- Geschosse des Konvents: Erdgeschoss Lage 0..12 (6 m), Obergeschoss 12..23, Walmdach bis 6 Lagen; Kreuzgangarkaden mit Kämpfer Lage 8, Joch 6,5; Fenster alle 9 Blöcke.
- Kirche: Kapellen (Tiefe 8, Decke Lage 15, Cappella Salviati 21), Obergaden-Fenster Lage 22..27, Triumphbogen Scheitel 28, Kuppel: Tambour Lage 31..38, Kalotte bis 49, Laterne bis 57; Campanile Schaft bis 49, Glockenstube 50..60, Pyramide bis 70.
- Bibliothek: Säulen Lage 1..7, Bögen bis Lage 10 (Geschosshöhe begrenzt die Raumhöhe auf 10 Lagen).
- Zellen etwa 5 × 6 Blöcke (2,5 × 3 m) – kleiner als in der Wirklichkeit, damit 44 Zellen in die Flügel passen.
