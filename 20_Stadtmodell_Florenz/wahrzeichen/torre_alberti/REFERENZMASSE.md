# Referenzmaße – Torre degli Alberti (Welle 8c)

Projekt-ID `torre_alberti`. Maßstab 1:2 (**Blöcke = 2 · m**). Stand 17.10.2026. Stufen: **A** belegt (Quelle genannt), **B** aus OSM begründet, **C** Entwurf. Bauteile: [`BAUTEIL_KATALOG.md`](BAUTEIL_KATALOG.md). Bauplan als Zellen im Speicher (`projects/torre_alberti/model/_ta.js`, `tools/wahrzeichen/zellplan.js`), Vorbild Arte della Lana (Turmhaus) und Loggia del Bigallo (Zellplan).

## 1. Rahmen und OSM

| Größe | Wert | Quelle |
|---|---|---|
| OSM-Objekt | Way **w307106612** „Torre degli Alberti“ (`building=yes`, `building:levels` 5, Wikidata Q649367), **560 Zellen**, kein Loch, `hoeheBl` 37 (aus den Ebenen) | `data/stadt/gebaeude.json` |
| Umriss | unregelmäßiges Sechseck (Kanten 8,5 / 21 / 6,5 / 22 / 12,2 / 26,2 Blöcke), im Wesentlichen ein Trapez von rund 30 × 28 Blöcken; die Quelle nennt die „trapezförmige Anlage, ungewöhnlich für die mittelalterliche Architektur von Florenz“ | OSM; it.wikipedia „Torre degli Alberti“ (A) |
| **Rahmen `TA`** | Ursprung (469 \| 1158,5) = Westecke der Südkante, **θ = −17,2°** entlang der Südkante; u nach Osten (−3..28), w nach Norden negativ (−28..0) | Polygonkante 3, B |
| Gelände | überall 61 (560 Zellen), eben | `tools/city/ground_stadt.js` |
| **`bodenY`** | **61** | B |
| Umgebung | Südkante am **Borgo Santa Croce**; im Norden, Osten und Westen keine benannte Straßenfläche in `flaechen.json` (Via de' Benci liegt als Fußweg in der Nähe, die Ecke Via de' Benci / Borgo Santa Croce nennt die Quelle) | Randanalyse, it.wikipedia (A) |

## 2. Maße (Literatur gegen Modell)

| Merkmal | Modell | Literatur oder OSM | Bewertung |
|---|---|---|---|
| Bau | Ende des 13. Jh. durch Alberto, Lapo und Neri degli Alberti; in der Nähe der zweiten Stadtmauer (1172–1175) | it.wikipedia | A |
| Lage | Via de' Benci 10, Ecke Borgo Santa Croce | it.wikipedia | A |
| Höhe, Geschosse | 37 Blöcke, fünf Geschosse zu je 7 Lagen (Böden bei 0, 7, 14, 21, 28), Terrassenboden Lage 35, Brüstung 36 und 37; die Quelle nennt keine Höhe | OSM (`building:levels` 5, Höhe 37) | B |
| Mauerwerk | sichtbares Mauerwerk aus Pietra forte (der Putz wurde 1938 entfernt); Mauerdicke 3 Blöcke | it.wikipedia (A), Dicke C | A / C |
| Kappung | Der Turm zeigt Spuren der Kappung („scapitozzatura“); im oberen Teil ein Terrässchen aus dem 19. Jh. Im Modell: Terrasse mit Brüstung und Zinnenzähnen auf der OSM-Höhe | it.wikipedia; Zinnen C | A / C |
| Fenster | nur kleine Fenster, Umrisse älterer Einzelfenster zugemauert; im Modell je Geschoss 2 × 3 Blöcke, Abstand 7,5 | it.wikipedia (A), Raster C | A / C |
| Eingang | alte Tür auf der Seite des Borgo Santa Croce zugemauert | it.wikipedia | A |
| Loggetta | Anfang 15. Jh., Kapitelle mit dem Wappen der Alberti (Ketten); im Modell Eckloggetta im obersten Geschoss an der östlichen Ecke (Joch 5, Bogen 4 breit, Reichweite 11) | it.wikipedia (A), Lage und Form C | A / C |
| Erdgeschoss | Caffè delle Colonnine, heute ein anderes Lokal | it.wikipedia | A |
| Besitz | Alberti bis zum Aussterben des florentinischen Zweigs 1836, danach Mori Ubaldini Alberti; Denkmal seit 1914; Restaurierung 1938, Sicherung 1983–2000 | it.wikipedia | A |

## 3. Entwurfswerte (Stufe C)
Mauerdicke 3; Geschosshöhe 7; Zahl und Lage der Fenster; Position der Eingangstür (Südkante bei u 10–14,5, beim Borgo Santa Croce; die alte zugemauerte Tür liegt bei u ≈ 20,5); Lage der Loggetta (östliche Ecke der Kanten 1 und 2); fünf Treppenläufe im Wechsel; Einrichtung des Cafés.

## 4. Nicht gebaut
Die genaue Gestalt der Loggetta (Dach, Brüstungsform), die Umrisse der zugemauerten Monoforen, Möbel in den Obergeschossen (nicht überliefert), die Rauchfänge.
