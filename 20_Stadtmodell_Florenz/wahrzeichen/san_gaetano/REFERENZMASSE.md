# Referenzmaße – Santi Michele e Gaetano (W6a, Wahrzeichen-Welle 6)

Projekt-ID `san_gaetano`. Maßstab 1:2 (**Blöcke = 2 · m**), Weltkoordinaten des Stadtmodells. Stand 16.10.2026.
Stufen: **A** mehrere Quellen übereinstimmend oder amtliche Quelle, **B** eine Quelle oder aus OSM/DGM gemessen, **C** Schätzung (Proportion). Entwurf: [`BAUTEIL_KATALOG.md`](BAUTEIL_KATALOG.md).

## 1. Rahmen und OSM

| Größe | Wert | Quelle |
|---|---|---|
| OSM-Objekt | Way **w234429578** „Chiesa dei Santi Michele e Gaetano“ (`building=church`, `wikidata=Q764060`, `wikipedia=it:Chiesa dei Santi Michele e Gaetano`), Fläche 4.949,5 Blöcke, **4.970 Zellen**, keine `building:part`, bisher im Quartier Strozzi | `data/stadt/gebaeude.json` |
| **Rahmen `SG`** | θ = **179,04°**, Ursprung (−774 \| 193): u von der Fassade (u = 0, Piazza degli Antinori, Osten) nach Westen zur Apsis (u ≈ 102), w quer, w > 0 **rechts** beim Eintreten (Norden). Kante der Fassade (−774,5 \| 163) bis (−774 \| 193) senkrecht zu u | gemessen an den Polygonkanten |
| Umriss im Rahmen | Langhaus u 0..26, w 0..31; Querhaus u 22..52, w −14..51 (südlicher Arm 14 tief, nördlicher 20); hinterer Block u 52..102, w −8..43 | gemessen, B |
| Gelände | `groundTopY` 62 bis 66 (62: 17, 63: 1.393, 64: 1.647, 65: 1.475, 66: 438 Zellen); Piazza vor der Fassade 63, Rückseite 65 bis 66 | `tools/city/ground_stadt.js` |
| **`bodenY`** | **64** (Fußboden Y 64, Stehhöhe Y 65; eine Stufe über der Piazza) | Entwurf, B |

## 2. Maße und Befunde (Literatur gegen OSM)

| Befund | Quelle | Stufe |
|---|---|---|
| Lateinisches Kreuz, **ein** Schiff und ein Querhaus, **drei** Seitenkapellen je Seite, durch Durchgänge verbunden; je eine Kapelle in den Querhausarmen (rechts Natività, links Croce/Sant’Elena) | it.wikipedia „Chiesa dei Santi Michele e Gaetano“ | A |
| Schiff: Tonnengewölbe mit Stichkappen und Gurtbögen; Querhausarme: einfache Tonnengewölbe; große Rundbogenfenster im oberen Schiff | it.wikipedia | A |
| Chor mit quadratischer Basis und Kuppel (1630 vollendet), Fresko von Filippo Maria Galletti, Allegorien in den Pendentifs; Apsis mit Triumphbogen und kleiner Kuppel | it.wikipedia; en.wikipedia (Kuppel nahe dem Chor, Galletti) | A |
| Fassade aus Pietra forte (Gherardo Silvani, nach dem Vorbild von Buontalentis Santa Trinita), zwei Ordnungen mit Doppelpilastern, drei Portale mit Dreiecksgiebeln; 1648 bis 1683 ohne Skulpturen, Schmuck 1688 bis 1693 (Statuen von Permoser und Andreozzi, Rosette mit Medici-Wappen und Putten von Marcellini) | it.wikipedia; en.wikipedia | A |
| Campanile von Bernardo Buontalenti 1604 bis 1618, ersetzt einen älteren Turm; fünf Glocken (je eine pro Öffnung, kleinere fünfte in der Mitte des Gewölbes), seit 1996 elektrisch | it.wikipedia | A |
| Bauzeit 1604 bis 1649 (Weihe 29. August 1649 durch Kardinal Carlo de’ Medici); Nigetti baute bis zum Querhaus und Chor, Silvani ab 1633; Freitreppe auf der Piazza 1701 | it.wikipedia | A |
| Hochaltar: 1649 geweiht, heutiges Aussehen 1675, Balustrade 1669, Entwurf Pierfrancesco Silvani, konkave Rückwand, silbernes Ziborium (Benedetto Petrucci); Marmore Rosso di Francia, Lapislazuli, Verde Greco, Giallo di Siena, Giallo antico; Reliquien der Heiligen Mario und Maria unter dem Altar | it.wikipedia | A |
| Chor: Gestühl aus Nussholz (Werkstatt Jacopo Sani), Bronzekruzifix von Francesco Susini, Kuppelfresko Galletti | it.wikipedia | A / B |
| Orgeln: Gegenfassade Benedetto Tronci 1820 mit Orgel von Antonio Colonna, Chor Mascioni Opus 457 | it.wikipedia | A |
| Kapellen rechts (von der Gegenfassade): Rosso (della Robbia, Vannini), Mazzei (Erzengel Michael, Colonna, Vignali), Martelli (Rosselli 1640, Grabmäler Janssens 1750); links (vom Altar zur Gegenfassade): Ardinghelli (Hugford 1712, Lippi), Franceschi (Pietro da Cortona, Rosselli, Empoli, Colonna), Tornaquinci (San Zanobi, Ciceri, Galletti, Albergotti 1772) | it.wikipedia; en.wikipedia | A |
| Querhaus rechts: Rosselli (Natività, Visitazione 1631), Boschi (Annunciazione 1632); links: Vignali, Bilivert, Pettirossi-Büste; Stirnwände mit Bonsi-Denkmälern | it.wikipedia | A |
| Kanzel aus Holz zwischen zweiter und dritter Kapelle links, darunter Grab der Familie Cardi | it.wikipedia | A |
| Sakristei von der rechten Chorwand erreichbar (1. Hälfte 17. Jh.), Holzschränke des 18. Jh., Deckenfresko von Pier Dandini, Lavabo von Orazio Mochi 1611 | it.wikipedia | A |
| Keine Maße (Längen, Breiten, Höhen) in it.wikipedia oder en.wikipedia | it.wikipedia, en.wikipedia | – |

## 3. Entwurfswerte ohne Beleg (Stufe C)
Alle Höhen (Gewölbe Lage 24..30, Dach-First Lage 38, Fassadengiebel 41, Tambour Lage 27..34, Kuppelscheitel 46, Laterne bis 52, Apsiskuppel bis 31, Campanile bis 56), Breite und Tiefe der Kapellen (8, Wandbänder 2, Mittelschiff 11), Lage und Größe des Chors (24 × 23), der Apsis, der Sakristei und des Nebenraums im hinteren Block, Lage und Größe des Campanile (13 × 13 an der Südseite der Apsis), Bogenmaße, Fenster, Bodenmuster, Maße der Altäre, Farben der Bilder, Gestühl, Bänke.
