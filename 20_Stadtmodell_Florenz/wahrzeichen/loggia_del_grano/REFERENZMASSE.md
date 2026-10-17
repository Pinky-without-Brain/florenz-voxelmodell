# Referenzmaße – Loggia del Grano (Welle 8c)

Projekt-ID `loggia_del_grano`. Maßstab 1:2 (**Blöcke = 2 · m**). Stand 17.10.2026. Stufen: **A** belegt (Quelle genannt), **B** aus OSM begründet, **C** Entwurf. Bauteile: [`BAUTEIL_KATALOG.md`](BAUTEIL_KATALOG.md). Bauplan als Zellen im Speicher (`projects/loggia_del_grano/model/_lg.js`, `tools/wahrzeichen/zellplan.js`), Vorbilder Loggia del Pesce und Mercato Nuovo (offene Halle) sowie Arte della Lana (Geschosse).

## 1. Rahmen und OSM

| Größe | Wert | Quelle |
|---|---|---|
| OSM-Objekt | Way **w307129126** „Loggia del Grano“ (`building=yes`, `historic=building`, `building:levels` 4, Wikidata Q3257907), **1.046 Zellen**, kein Loch, `hoeheBl` 30 (aus den Ebenen) | `data/stadt/gebaeude.json` |
| Umriss | Parallelogramm, im Wesentlichen ein Rechteck von 37,9 × 27,7 Blöcken, um 33,7° gedreht | OSM |
| **Rahmen `LG`** | Ursprung (14,5 \| 997,5) = Nordwestecke der Stirnseite, **θ = 33,69°**; u entlang der Nordkante (0..37,9), w nach Süden (0..27,7) | Polygonkante 1, B |
| Gelände | überall 61 (1.046 Zellen), eben | `tools/city/ground_stadt.js` |
| **`bodenY`** | **61** | B |
| Umgebung | Westseite Via dei Castellani, Ostseite Via del Castello d'Altafronte, Nordseite Fußweg am Platz (Stirnseite mit den drei Bögen), Südseite Nachbarhäuser (Rückwand) | Randanalyse, `flaechen.json` |

## 2. Maße (Literatur gegen Modell)

| Merkmal | Modell | Literatur oder OSM | Bewertung |
|---|---|---|---|
| Architekt, Bau | Giulio Parigi, Baubeginn 1619 für Cosimo II. de' Medici anstelle eines älteren Baus des 14. Jh. | it.wikipedia „Loggia del Grano“ | A |
| Arkaden | drei Rundbögen an der Stirnseite, zwei an jeder Seitenfront; Rückwand geschlossen | it.wikipedia | A |
| Stützen | toskanische Säulen; Eckpfeiler mit Bossenwerk; eine Quelle des 18. Jh. nennt sechs Joche, vier Pfeiler und acht Säulen. Im Modell: Eckpfeiler aus Rustika, dazwischen Pfeiler aus Pietra serena (vereinfacht) | it.wikipedia | A / C |
| Wappen, Tafeln | an der Rückwand der Halle die Wappen des Popolo, der Stadt und der Parte Guelfa, das Zeichen des Staio und zwei Türme der Capitani di Torre; zwei Gedenktafeln | it.wikipedia | A |
| Geschosse | Erdgeschoss mit Loggia, Mezzanin mit rechteckigen Fenstern, Obergeschoss mit großen Bogenfenstern (19. Jh.), Gebälk, Dachgeschoss mit Ochsenaugen, Satteldach mit zentraler Giebelgaube | it.wikipedia | A |
| Obergeschoss | **1868** aufgestockt und zum Theater umgebaut; die Seite nennt **nicht** das im Auftrag erwähnte Jahr 1690 (1690 verlor die Loggia ihre Funktion als Getreidespeicher an das Granaio dell'Abbondanza) | it.wikipedia | A |
| Uhr | die Quelle erwähnt keine Uhr; nicht gebaut | it.wikipedia | – |
| Höhen | Halle Lage 1–10, Boden Mezzanin 11, Mezzanin 12–14, Boden Obergeschoss 15, Obergeschoss 16–23, Decke 24, Gesims 25–26, Traufe 27, First 30 (OSM-Höhe 30) | OSM (4 Ebenen, Höhe 30); Verteilung C | B / C |
| Nutzung | Getreidemarkt und -lager; später Druckerei, Teatro della Loggia (Teatro Salvini), Kino (Ex-Cinema Capitol), ethnischer Markt, Restaurant, Buchhandlung; seit 2022 Café und American Bar | it.wikipedia | A |

## 3. Entwurfswerte (Stufe C)
Mauerdicke 3; Bogenhöhen (Ansatz Lage 5, Scheitel bis Lage 10); Pfeilerbreiten 2,4 und Eckpfeiler 3,2; Fensterformen; Lage und Länge der beiden Treppen (11 und 4 Stufen, 3 breit); Einrichtung (Getreidebänke, Staio, Bühne, Sitzreihen).

## 4. Nicht gebaut
Gitter vor den Bögen, die Uhr (nicht belegt), die zentrale Giebelgaube (würde die OSM-Höhe von 30 überragen), Kreuzgewölbe der Halle, die acht Säulen der Quelle des 18. Jh. als freie Säulen, Details der Wappen.
