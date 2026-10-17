# Referenzmaße – Palazzo Nonfinito (Welle 7b)

Projekt-ID `palazzo_nonfinito`. Maßstab 1:2 (**Blöcke = 2 · m**). Stand 16.10.2026. Stufen: **A** belegt (Quelle genannt), **B** Literatur oder aus OSM begründet, **C** Entwurf. Bauteile: [`BAUTEIL_KATALOG.md`](BAUTEIL_KATALOG.md). Bauplan: `tools/wahrzeichen/palazzo.js`, Einstellungen `projects/palazzo_nonfinito/model/_nf.js`.

## 1. Rahmen und OSM

| Größe | Wert | Quelle |
|---|---|---|
| OSM-Objekt | Relation **r4098970** „Palazzo Nonfinito“, `building=yes`, `building:levels=3`, `historic=building`, Wikidata Q3361314, **9.249 Zellen** (Fläche 9.236,5 Blöcke²), **zwei Löcher** (99 und 736 Zellen) | `data/stadt/gebaeude.json`, `tools/wahrzeichen/maske.js` |
| Umriss | fast achsparalleles Rechteck 105 × 97 mit einem Anbau im Südosten; Westkante (Via del Proconsolo) 96,7 Blöcke, Südkante (Borgo degli Albizi) 105,1 | gemessen an den Polygonkanten |
| **Rahmen `NF`** | Ursprung (169,5 \| 354,5) an der Südwestecke (Kreuzung Proconsolo/Albizi), θ = **−93,26°** entlang der Westfassade: u von Süd nach Nord (0..97), w von der Via del Proconsolo nach Osten (0..110); die Albizi-Fassade liegt bei u 0 | Polygonkante 1, A |
| Hof Cigolis (Loch 1) | 736 Zellen, u 31..71 × w 47..65 | gemessen |
| Lichthof (Loch 0) | 99 Zellen, u 30..42 × w 81..90 (ohne Arkaden) | gemessen |
| Gelände | 64 (36 Zellen), 65 (1.518), 66 (2.463), **67 (4.725)**, 68 (507); in der Maske auf höchstens Y 65 abgetragen | `tools/city/ground_stadt.js` |
| Gelände außen | Via del Proconsolo 64–65, Borgo degli Albizi steigt von 65 (Ecke) auf 67 (Portal und Osten) | `ground_stadt.js`, Streifen vor den Fassaden |
| **`bodenY`** | **66** (Vorgabe war 67): Das Portal am Borgo degli Albizi liegt bei Gelände 67, das an der Via del Proconsolo bei 65; 66 ist der Kompromiss, beide Eingänge sind höchstens eine Stufe (springbar) vom Fußboden entfernt | begründet, B |

## 2. Maße (Literatur gegen OSM)

| Maß | Modell | Literatur oder OSM | Bewertung |
|---|---|---|---|
| Höhe bis zur Traufe | 23 Blöcke (11,5 m) | OSM `building:levels=3`, `hoeheBl` 23 | B |
| Geschosse | EG 10, Piano nobile 13 | die Quelle nennt zwei ausgeführte Geschosse; beide Entwürfe sahen zwei weitere vor, die nie gebaut wurden ([it.wikipedia](https://it.wikipedia.org/wiki/Palazzo_Nonfinito)); Höhen C, Summe OSM | A / C |
| Bauzeit, Baumeister | Bau ab Juli 1593 durch Bernardo Buontalenti mit Matteo Nigetti (Erdgeschoss, Portal am Borgo degli Albizi, Kniefenster); 1600 Weggang Buontalentis (Streit mit den Strozzi über die Treppe); 1600–1612 Vincenzo Scamozzi (Entwurf), Giovanni Battista Caccini (Leitung); Hof um 1604 von Cigoli; ab 1612 Nigetti | it.wikipedia | A |
| Erdgeschoss | glatte Rustika, monumentale Eckpilaster, große Kniefenster auf Konsolen mit Gittern und Giebeln (dreieckig, gebrochen, eingerollt) | it.wikipedia | A |
| Via del Proconsolo | sechs symmetrische Kniefenster links und rechts des großen Bogenportals (Caccini, mit Balkon und Strozzi-Wappen 1614), Piano nobile mit Pilastern der Kolossalordnung | it.wikipedia | A |
| Borgo degli Albizi | vier große Kniefenster um ein Mittelportal, Inschrift von 1607 | it.wikipedia | A |
| Fensterachsen | Abstand 13,5 Blöcke (Portal in der Mitte bei u 49 bzw. w 49), Sohle Lage 2, Höhe 7 (Piano nobile Sohle 4, Höhe 7) | Raster aus Achsenzahl und Kantenlänge | C |
| Portale | Via del Proconsolo 7 breit, 9 hoch; Borgo degli Albizi 6 breit, 9 hoch | Lage Mitte A, Maße C | A / C |
| Hof | zwei Seiten 1604 nach Cigoli, zwei Seiten 1865–66 vom Ingenieur Nasi; Serlianen auf toskanischen Säulen; Statue Perseus tötet den Drachen von Giovanni Battista Lorenzi in einer Nische | it.wikipedia | A |
| Treppe | rechts vom Atrium, Tonnengewölbe, drei ellbogenförmige Läufe, von Santi di Tito gebaut | it.wikipedia | A |
| Halle im Erdgeschoss | großer rechteckiger Raum mit Spiegelgewölbe und drei Türen zu zwei weiteren Räumen | it.wikipedia | A |
| Museo di Antropologia e Etnologia | gegründet von Paolo Mantegazza, Gebäude 1919 an die Universität, Einzug 1924, Eröffnung 1932; erweitert von Aldobrandino Mochi, Nello Puccioni u. a.; Decken des Piano nobile aus der Zeit von Florenz als Hauptstadt mit Wappen Savoyens und der Stadt | it.wikipedia; Räume und Vitrinen nicht belegt | A / C |

## 3. Entwurfswerte (Stufe C)
Fensterraster 13,5, Breite 3; Walmdach 3 Lagen; Wendeltreppe im Treppenhaus rechts vom Atrium (u 76, w 32); Trennwände (Türen 3,4 × 5) im Erdgeschoss (Atrium mit je zwei Räumen, Vestibül im Westflügel) und im Piano nobile (fünf Säle im Nordflügel); Ringtüren der Innenwand im Raster 14 (Achsen u 35, 49, 63 und w 49, 63, 77).

## 4. Nicht gebaut
Konsolen, Gitter und Giebel der Kniefenster (nur Rahmen aus Pietra serena in der Wandebene), Balkon über dem Portal an der Via del Proconsolo, Spiegelgewölbe der Halle (Kassettendecke statt), die dreiläufige Treppe unter Tonnengewölben (Wendeltreppe statt), Serlianen (Rundbögen statt), Nische des Perseus (freie Statue), Drache, die beiden nie gebauten Obergeschosse (Walmdach über dem Piano nobile), Ausstellungsstücke des Museums.
