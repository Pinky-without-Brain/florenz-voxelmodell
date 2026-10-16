# Referenzmaße – Loggia del Pesce (Welle 6c)

Projekt-ID `loggia_del_pesce`. Maßstab 1:2 (**Blöcke = 2 · m**). Stand 16.10.2026. Stufen: **A** belegt (Quelle genannt), **B** Literatur oder aus OSM begründet, **C** Entwurf. Bauteile: [`BAUTEIL_KATALOG.md`](BAUTEIL_KATALOG.md). Bauplan als Zellen im Speicher (`projects/loggia_del_pesce/model/_lp.js`, `tools/wahrzeichen/zellplan.js`), Vorbilder Loggia del Bigallo und Mercato Nuovo.

## 1. Rahmen und OSM

| Größe | Wert | Quelle |
|---|---|---|
| OSM-Objekt | Way **w204145494** „Loggia del Pesce“, `building=roof`, `historic=building`, Wikidata Q3257910, **769 Zellen** (Fläche 772 Blöcke²), kein Loch, `hoeheBl` 10 (Schätzung) | `data/stadt/gebaeude.json` |
| Umriss | Rechteck 64 × 12 Blöcke (32 × 6 m), freistehend auf der Piazza dei Ciompi | gemessen |
| **Rahmen `LP`** | Ursprung (1258,5 \| 358) an der Nordwestecke, θ = **−2,24°** entlang der nördlichen Langseite: u von West nach Ost (0..64), w nach Süden (0..12) | Polygonkante, A |
| Gelände | 63 (291 Zellen), **64 (478)**; in der Maske auf höchstens Y 63 abgetragen | `tools/city/ground_stadt.js` |
| **`bodenY`** | **64** | häufigster Wert, B |
| Umgebung | alle vier Seiten Piazza dei Ciompi (Fußgängerfläche), im Süden Via Pietrapiana | Randanalyse der Kanten |

## 2. Maße (Literatur gegen OSM)

| Maß | Modell | Literatur oder OSM | Bewertung |
|---|---|---|---|
| Architekt und Bauzeit | Giorgio Vasari im Auftrag von Cosimo I., gebaut 19. August 1568 bis 22. Februar 1569; Inschrift MDLXVIII | [it.wikipedia „Loggia del Pesce“](https://it.wikipedia.org/wiki/Loggia_del_Pesce) | A |
| Ursprungsort | Mercato Vecchio (Westseite), 1699 durch Cosimo III. um einen Bogen je Seite erweitert; ab Mai 1889 im Risanamento abgebaut; **1955** auf der Piazza dei Ciompi wiederaufgebaut (Giulio Cesare Lensi Orlandi Cardini, Cassa di Risparmio) | it.wikipedia | A |
| Bögen | **neun Rundbögen** je Langseite (Pfeiler und Säulen toskanischer Ordnung aus Pietra serena) und **ein Bogen** je Schmalseite (1699), Bogenweite im Modell 4,9 Blöcke (7,1 Blöcke Joch) | it.wikipedia („doppia fila di nove arcate a tutto sesto“) und Aufgabenstellung; Maße aus dem OSM-Umriss | A / C |
| Gewölbe | Kuppelgewölbe („volte a calotta“), Zuganker statt Strebepfeiler | it.wikipedia | A, Form C |
| Tondi | 16 Tondi mit Fischen in den Zwickeln (Terrakotta bzw. Kalk), davon zwölf nach den Abbrucharbeiten ersetzt, vier an den Enden Kopien der Tondi von 1669 | it.wikipedia | A |
| Medaillons, Wappen, Kartusche | acht Medaillons je Seite mit Meeres- und Fischereimotiven, vier Eckwappen, zentrale Kartusche mit dem großherzoglichen Auftrag | it.wikipedia; Medaillons nicht gebaut | A |
| Höhen | Bogenansatz Lage 5, Scheitel Lage 7, Gebälk Lage 10, Kranzgesims Lage 11, Gewölbescheitel Lage 10, Dachkante Lage 12, Dachfläche bis Lage 14 (Walmdach) | OSM Höhe 10 (Schätzung); Verteilung C | C |
| Dach | Walmdach mit Überstand von zwei Blöcken (Lage 11, Luftraum 2) | Aufgabenstellung (Vasari-Loggia mit Walmdach); it.wikipedia nennt das Dach nicht | C |

## 3. Entwurfswerte (Stufe C)
Pfeilerbreite 2,2; Wand der Schmalseiten 3 Blöcke dick; Bogenöffnung der Schmalseiten 6 breit; Dachform; drei Marktbänke (der Zweck als Fischmarkt ist belegt, die Einrichtung nicht).

## 4. Nicht gebaut
Medaillons (acht je Seite), die Zuganker, Details der Terrakotta. Die Loggia steht nicht mehr am ursprünglichen Ort (Mercato Vecchio, 1889 abgerissen); das Modell zeigt sie am heutigen Standort.
