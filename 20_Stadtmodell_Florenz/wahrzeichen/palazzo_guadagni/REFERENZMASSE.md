# Referenzmaße – Palazzo Guadagni (Welle 8a)

Projekt-ID `palazzo_guadagni`. Maßstab 1:2 (**Blöcke = 2 · m**). Stand 17.10.2026. Stufen: **A** belegt (Quelle genannt), **B** Literatur oder aus OSM begründet, **C** Entwurf. Bauteile: [`BAUTEIL_KATALOG.md`](BAUTEIL_KATALOG.md). Bauplan: `tools/wahrzeichen/palazzo.js`, Einstellungen `projects/palazzo_guadagni/model/_gd.js`, Raumplan und Dachloggia `model/_raeume.js`.

## 1. Rahmen und OSM

| Größe | Wert | Quelle |
|---|---|---|
| OSM-Objekt | Way **w306798512** „Palazzo Guadagni“, `building=yes`, `historic=yes`, Wikidata Q3890275, `hoeheBl` 30 (Schätzung), **2.372 Zellen** der Maske (Fläche 2.373,5 Blöcke²), **kein Loch** | `data/stadt/gebaeude.json`, `Maske.ausGebaeude` |
| Umriss | Neuneck: Hauptblock mit zwei langen Kanten von 51 Blöcken (Piazza und Via Mazzetta, im Winkel von 77°), schräge Ostkante 32 Blöcke zum Nachbarn, dahinter ein schmalerer Flügel (u −11..20, w 34..54) | gemessen an den Polygonkanten |
| **Rahmen `GD`** | Ursprung (−1550,5 \| 1595) am Südende der Fassade zur Piazza Santo Spirito, θ = **−47,76°** entlang der OSM-Kante 1: u entlang der Fassade (0..51), w von der Fassade ins Haus (0..54) | Polygonkante 1, A |
| Hof | im OSM-Umriss **nicht** ausgespart (Lochzahl 0) | gemessen |
| Gelände | 60 (110 Zellen), **61** (2.262 Zellen); in der Maske auf Y 60 abgetragen | `tools/city/ground_stadt.js` |
| **`bodenY`** | **61**: Das Gelände rund um den Palast liegt bei 60 bis 61, Portal und Piazza ohne mehr als eine Stufe | B |
| Anschlüsse | Fassade (w 0, u 0..51) zur **Piazza Santo Spirito** (im Straßenpolygon `Piazza di Santo Spirito`), westliche Schrägkante zur **Via Mazzetta**; die Straßenpolygone sind dort lückenhaft (Fußwege) | Randanalyse (`tools/diag/_strassen_w7a.js`), Position der Piazza-Polygone im Rahmen |

## 2. Maße (Literatur gegen OSM)

| Maß | Modell | Literatur oder OSM | Bewertung |
|---|---|---|---|
| Höhe bis zur Traufe | 30 Blöcke (15 m) | OSM-Schätzung `hoeheBl` 30 (keine Quelle nennt eine Höhe) | C |
| Geschosse | EG 8, 1. OG 7, 2. OG 7, Dachloggia 8 | vier Geschosse (it.wikipedia, Palazzo Guadagni); Einzelhöhen C, Summe folgt der OSM-Schätzung | A / C |
| Entwurf, Bauzeit | Cronaca (Simone del Pollaiolo, wahrscheinlicher) oder Baccio d'Agnolo, etwa 1502–1506, Bauherr Rinieri di Bernardo Dei (Seidenhändler) | it.wikipedia | A (Zuschreibung unsicher) |
| Fassade EG | glatte Pietra forte mit kräftigen Eckpilastern in Bugnato; Eckpilaster im Modell 4 Blöcke breit aus Rustika | it.wikipedia; Breite C | A / C |
| Fassade 1. und 2. OG | Rundbogenfenster mit erhabenen und flachen Bugnen; Modell: Rustika mit glatter Lage jede vierte | it.wikipedia; Lagenraster C | A / C |
| Portal | rundbogig, von Bugnen und quadratischen Fenstern gerahmt; Modell 7 Blöcke breit, 7 hoch, in der mittleren von fünf Achsen | it.wikipedia; Maße und Achsenzahl C | A / C |
| Fenster | Rundbogenfenster, Raster 10, Breite 4; im EG klein (Sohle 3, Höhe 3), in den Obergeschossen Sohle 2, Höhe 4 | Rundbogen A; Maße C | A / C |
| Dachloggia | großes Geschoss mit architravierten Säulen unter weit vorspringender Traufe; Modell: Rechtecköffnungen Joch 5, Brüstung 2 Blöcke, Öffnung 4 hoch, an Fassade und Westseite | it.wikipedia (Zahl der Bögen/Joche nicht genannt); Joch und Maße C | A / C |
| Sgraffito | ausgedehnte Graffito-Dekoration (Jugendwerk Andrea del Sartos zugeschrieben), schon früher stark verändert, bei einem Eingriff an der Fassade vollständig zerstört (die Quelle nennt 1968) | it.wikipedia | A (nicht gebaut: zerstört) |
| Hof | Torweg mit Kreuzgewölbe auf Lisenen und Säulen; Reste einer zugemauerten Loggia, zwei gedrückte Barockbögen auf Renaissance-Säulen; Wandbrunnen mit Muschelbecken und Einhorn-Nische (Wasser aus dem Boboli-Garten) | it.wikipedia; Lage C | A / C |
| Treppe | Treppe links aus Pietra serena, als ursprünglich geltend | it.wikipedia; Lauf und Länge C | A / C |
| Innen | geteiltes Wappen der Guadagni und der Dufour Berte | it.wikipedia | A |
| Außen | Lumiera an der Ecke und Pferdering an der Via Mazzetta (Werkstatt des Caparra), Panca di via mit gezahnter Basis, Wappen der Dei und der Guadagni, gusseiserner Wappenschild am Borgo Tegolaio, Holzportal mit Rosetten, Eisengitter mit Lilien | it.wikipedia | A |
| Nachbarhaus Nr. 9 | wurde um zwei Stockwerke aufgestockt, um die Traufhöhe des Palastes zu erreichen | it.wikipedia | A (gehört nicht zum Projekt) |

## 3. Entwurfswerte (Stufe C)
Fensterraster 10 (Versatz 0,5: Achsen bei u 5,5 / 15,5 / 25,5 / 35,5 / 45,5, Portal in der mittleren); Walmdach 3 Lagen; Loggia Joch 5, Öffnungen 3 breit und 4 hoch ab 3 Blöcken über dem Geschossboden; sechs Trennwandlinien (Türen 3 × 5); Wendeltreppe im Ostraum an der Fassade, Treppe aus Pietra serena (acht Stufen, zwei breit) im Treppenhaus.

## 4. Nicht gebaut
Sgraffito (zerstört), Holzportal mit Rosetten und Eisengitter, Wappen der Dei und der Guadagni an der Fassade, Lumiera, Pferdering, gusseiserner Wappenschild (Außenbauteile auf der Fassade), weit vorspringende Traufe der Loggia, Säulen der Loggia als Rundformen (Pfeiler aus Wandblöcken), Kapitelle mit Delfinen, Voluten und Muscheln, zugemauerte Hofloggia und Barockbögen (der Hof liegt im OSM-Umriss nicht als Loch vor und ist als überdachte Halle gebaut), Mezzanin, Nachbarhaus Nr. 9. Die gezahnte Basis der Straßenbank ist glatt.
