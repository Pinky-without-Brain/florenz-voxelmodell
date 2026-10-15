# Referenzmaße – Basilica di Santa Trinita (V3 D3, Wahrzeichen-Welle 3)

Projekt-ID `santa_trinita`. Maßstab 1:2 (**Blöcke = 2 · m**), Weltkoordinaten des Stadtmodells. Stand 15.10.2026.
Stufen: **A** mehrere Quellen übereinstimmend oder amtliche Quelle, **B** eine Quelle oder aus OSM/DGM gemessen, **C** Schätzung (Proportion). Entwurf: [`BAUTEIL_KATALOG.md`](BAUTEIL_KATALOG.md).

## 1. Rahmen und OSM

| Größe | Wert | Quelle |
|---|---|---|
| OSM-Objekt | Way **w478272186** „Basilica di Santa Trinita“ (`building=basilica`), **5.455 Zellen**; Teil w478272182 (60 Zellen, am Chor) | `data/stadt/gebaeude.json` |
| **Rahmen `ST`** | Ursprung (**−939 \| 708**) = Mitte der Fassade, **θ = 209°**; **u** von der Fassade (Osten) zum Chor (Westen), **w** quer, w > 0 Norden | gefittet an den Langseiten (28,8° und 29°, Gegenrichtung) |
| Gelände | `groundTopY` 59–61 (59: 56, **60: 3.242**, 61: 2.158 Zellen); vor der Fassade 61 | `tools/city/ground_stadt.js` |
| **`bodenY`** | **61** (bündig mit der Piazza) | Entwurf, B |

### Polygon im Rahmen `ST` (gemessen, u \| w in Blöcken)
- **Fassade** u 0 × w −25,9..25,5 (51 Blöcke = 25,5 m).
- **Langhaus** u 0..61: links bis w −36,4 (Kapellen), rechts bis w 16,3 (u 16..61; u 0..16 bis 25,5).
- **Querhaus** u 61..79 × w −37..45 (rechts bis 45,6 bei u 60..75).
- **Kopf** u 79..96,7 × w −15,5..10, rechts bis w 29 (u 75..90).

## 2. Maße (Literatur gegen OSM)

| Maß | Modell | Literatur | Bewertung |
|---|---|---|---|
| Grundriss | drei Schiffe, T-Form | „forma a T (croce commissa)“, drei Schiffe, Rechteckpfeiler, Spitzbögen, Kreuzgewölbe ([it.wikipedia](https://it.wikipedia.org/wiki/Basilica_di_Santa_Trinita)) | A |
| Kapellen | links **5**, Kopf: Cappella maggiore + **4**, Gualberto rechts, Sakristei links | „cinque per lato“, vier neben der Cappella maggiore, Gualberto am rechten Querhauskopf, Sakristei (ex Strozzi) links (it.wikipedia) | A; rechts liegt nur die erste Kapelle im OSM-Umriss (B) |
| Apsis | quadratisch, lange Bifora | it.wikipedia | A |
| Fassade | zwei Pilasterordnungen, Giebel mit Rundfenster | Buontalenti **1593–94**, Skulpturen G. B. Caccini (1594) (it.wikipedia) | A (Aufbau), Höhen C |
| Flanken | links Rustika, rechts Putz | it.wikipedia | A |
| Cappella Sassetti | rechts am Querhauskopf | Ghirlandaio **1483–86** (it.wikipedia) | A |
| Cappella Bartolini Salimbeni | 4. Kapelle | Lorenzo Monaco **1420–25** (it.wikipedia) | A (Werk); die Wiki-Angabe „rechtes Schiff“ ist im OSM-Umriss nicht darstellbar, das Modell legt sie in die 4. Kapelle links |
| Bauzeit | | gotischer Umbau ab 1250/58, 1300–30, 1365–ca. 1405 (it.wikipedia) | A |
| Campanile | – | lehnt an einer Seitenwand, ohne eigenes Fundament (it.wikipedia) | nicht in OSM, nicht gebaut |

## 3. Entwurfswerte ohne Beleg (Stufe C)
- Achse w −2,5; Mittelschiff |w + 2,5| < 7,5, Pfeiler 7,5..9,5, Seitenschiffe bis 17.
- Mittelschiff und Querhaus: Kämpfer 30, Scheitel 44, Traufe 48, First 56; Seitenschiffe 20/28, Pultdach 36 → 30; Kapellen Decke 18.
- Chor Gewölbe 26..36, Dach 42; Kopfkapellen Decke 22, Dach 30; Gualberto und Sakristei 24/32.
- Fassade: Gebälk Lage 25/26, Giebel bis 62, Rundfenster auf Lage 46.
