# Referenzmaße – Palazzo Lenzi (Welle 8a)

Projekt-ID `palazzo_lenzi`. Maßstab 1:2 (**Blöcke = 2 · m**). Stand 17.10.2026. Stufen: **A** belegt (Quelle genannt), **B** Literatur oder aus OSM begründet, **C** Entwurf. Bauteile: [`BAUTEIL_KATALOG.md`](BAUTEIL_KATALOG.md). Bauplan: `tools/wahrzeichen/palazzo.js`, Einstellungen `projects/palazzo_lenzi/model/_ln.js`, Raumplan, Loggetta und Ausstattung `model/_raeume.js`.

## 1. Rahmen und OSM

| Größe | Wert | Quelle |
|---|---|---|
| OSM-Objekt | Way **w307320369** „Palazzo Lenzi“, `building=yes`, `historic=building`, Wikidata Q3890335, `hoeheBl` 30 (Schätzung), **3.390 Zellen** der Maske (Fläche 3.384 Blöcke²), **kein Loch** | `data/stadt/gebaeude.json`, `Maske.ausGebaeude` |
| Umriss | Hauptblock 69 × 42 Blöcke, dahinter ein Flügel (u 43..69, w 42..67) entlang der Via Montebello; die Kanten sind lang (68,6 zur Piazza, 66,9 zur Via Montebello, 40 zum Borgo Ognissanti) und treffen im rechten Winkel | gemessen an den Polygonkanten |
| **Rahmen `LN`** | Ursprung (−1829 \| 182) am Nordostende der Fassade zur Piazza d'Ognissanti, θ = **133,82°** entlang der OSM-Kante 0: u entlang der Fassade (0..69), w von der Fassade ins Haus (0..67) | Polygonkante 0, A |
| Anschlüsse | Kante 0 zur **Piazza d'Ognissanti**, Kante 9 (u = 0) zum **Borgo Ognissanti**, Kante 1 (u = 69) zur **Via Montebello**; übrige Kanten zu Nachbarhäusern | Randanalyse (Name der Fläche am Kantenmittelpunkt) |
| Gelände | 55 (1.864 Zellen), 56 (1.429), 57 (97); in der Maske auf höchstens Y 54 abgetragen | `tools/city/ground_stadt.js` |
| **`bodenY`** | **55**: Piazza und Borgo liegen bei 55 bis 56, die Via Montebello bei 57 (nur Nebenseite ohne Portal) | B |

## 2. Maße (Literatur gegen OSM)

| Maß | Modell | Literatur oder OSM | Bewertung |
|---|---|---|---|
| Höhe bis zur Traufe | 30 Blöcke (15 m) | OSM-Schätzung `hoeheBl` 30 | C |
| Geschosse | drei zu je 10 Blöcken | drei Stockwerke (it.wikipedia, Palazzo Lenzi); Einzelhöhen C | A / C |
| Bauzeit, Architekt | 15. Jahrhundert, Baubeginn unbekannt (etwa 1470 angesetzt); Vasari nannte Brunelleschi (wohl Irrtum), heute wird Michelozzo vermutet | it.wikipedia | A (Zuschreibung ungeklärt) |
| Portale | fünf große Portale zur Piazza, im EG nur das zentrale original; Modell: fünf Portale 6 breit, 8 hoch im Achsabstand 13,7 | it.wikipedia; Maße C | A / C |
| Seitenportal | sekundäres Portal zum Borgo Ognissanti mit den Wappen der Buini und der Strozzi; Modell: 5 breit, 7 hoch bei w = 30 | it.wikipedia; Lage C | A / C |
| Fenster | zwei Reihen einfacher Rundbogenfenster in den Obergeschossen; Modell Breite 4, Sohle 3, Höhe 5 über den Portalachsen | it.wikipedia; Maße C | A / C |
| Graffito | Graffiti ersetzen Gesimse, Marcapiano und gemalte Säulchen; die heutigen aus dem 19. Jahrhundert (1887 freigelegt und von Baldancoli weitgehend erneuert), wohl nach alten Vorlagen; Modell: Bänder an den Geschossgrenzen und Säulchen zwischen den Achsen als helle und dunkle Putzblöcke | it.wikipedia; Muster C | A / C |
| Loggetta | im obersten Geschoss, vermutlich nach alten Ansichten; Modell: drei Öffnungen (3 breit, 5 hoch) über dem mittleren Portal | it.wikipedia; Lage und Zahl C | A / C |
| Wappen | Lenzi-Wappen an der Ecke zwischen Piazza und Borgo; Buini und Strozzi am Seitenportal | it.wikipedia; Farben nicht belegt | A / C |
| Innenräume | Ausstellungssaal mit Gewölben (Kapitelle vielleicht neoquattrocentesk); Bibliothek mit der Stanza dell'Alcova (Stuck, Bogen mit den Wappen der Buini und Frescobaldi, Hochzeit 1705); Theater im ersten Stock; Assunzione des 18. Jh. (mögliche Privatkapelle) | it.wikipedia; Lage C | A / C |
| Nutzung, Geschichte | seit 1647 Buini, 1765 Quaratesi, 1885 Restaurierung Del Moro, 1908/1912 Umbau für das Institut Français; heute Institut Français und Libreria Francese, Konsulat | it.wikipedia | A |
| Hof, Dach, Bossenwerk | von der Quelle nicht erwähnt; der OSM-Umriss hat keinen Hof | it.wikipedia; OSM | A |

## 3. Entwurfswerte (Stufe C)
Fensterraster 13,7 in fünf Achsen (Versatz 0: Achsen bei u 6,85 / 20,55 / 34,25 / 47,95 / 61,65); Portale 6 × 8; Walmdach 3 Lagen; Loggetta mit drei Öffnungen im Abstand 5 über dem mittleren Portal; sieben Trennwandlinien (Türen 3 × 5); Wendeltreppe im zweiten Vorderraum; Putzfarben: Grau im EG, Sand in den Obergeschossen, Graffito-Bänder und Säulchen in Weiß und dunklem Stein.

## 4. Nicht gebaut
Assunzione und die mögliche Privatkapelle (Lage unbekannt), Gewölbekapitelle, Gesimse, Vorsprünge des Borgo-Trakts (im 19. Jahrhundert rekonstruiert), Bibliotheksbestand und Libreria Francese, Lenzi-Wappen mit belegten Farben, Dach und Hof (nicht belegt), Treppenhäuser (Quelle nennt sie nicht).
