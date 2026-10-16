# Referenzmaße – San Frediano in Cestello (W6a, Wahrzeichen-Welle 6)

Projekt-ID `san_frediano_in_cestello`. Maßstab 1:2 (**Blöcke = 2 · m**), Weltkoordinaten des Stadtmodells. Stand 16.10.2026.
Stufen: **A** mehrere Quellen übereinstimmend oder amtliche Quelle, **B** eine Quelle oder aus OSM/DGM gemessen, **C** Schätzung (Proportion). Entwurf: [`BAUTEIL_KATALOG.md`](BAUTEIL_KATALOG.md).

## 1. Rahmen und OSM

| Größe | Wert | Quelle |
|---|---|---|
| OSM-Objekte | Way **w118416085** „Chiesa di San Frediano in Cestello“ (`building=church`, `wikidata=Q1071192`, `wikipedia=it:Chiesa di San Frediano in Cestello`), 5.610 Zellen; umschließt vollständig den Way **w673464782** (4.090 Zellen, `building=yes`). Beide Hausakten waren in `quartier_san_frediano` | `data/stadt/gebaeude.json` |
| Hauptmaske | w118416085 allein (16 Punkte, Fläche 5.604,5 Blöcke); w673464782 liegt vollständig darin und wird in `vorrang.json` mit auf das Projekt gelegt | OSM |
| **Rahmen `CF`** | θ = **107,2°**, Ursprung (−2020 \| 706,5): u von der Fassade (u = 0, Arno-Seite) zur Apsis (u ≈ 106,6), w quer, w > 0 **rechts** beim Eintreten (Südwesten). Der Umriss ist im Rahmen ein Rechteck u −0,2..106,6, w 0,5..53,5 | gemessen an den Polygonkanten (Kante (−2020 \| 706,5) bis (−2071 \| 690,5): u = 0) |
| Gelände | `groundTopY` 56 bis 61 (56: 696, 57: 1.437, 58: 2.323, 59: 651, 60: 434, 61: 69 Zellen); an der Fassade 59 bis 61, zur Apsis 56 bis 57 abfallend | `tools/city/ground_stadt.js` |
| **`bodenY`** | **58** (Fußboden Y 58, Stehhöhe Y 59) | Entwurf, B |

### Teile des Umrisses im Rahmen `CF` (gemessen, u \| w in Blöcken)
| OSM-Teil | u | w | Deutung im Modell | Stufe |
|---|---|---|---|---|
| w673464736 | 0,1..40,3 | 0,5..10,4 | Streifen der Seitenkapellen links (vier Kapellen) | B (Lage), C (Zahl der Joche) |
| w673464734 | −0,2..40,1 | 41,0..53,5 | Streifen der Seitenkapellen rechts | B / C |
| (Mittelband) | 0..45,6 | 10,4..41 | Schiff | B |
| w673464756 | 45,6..75,6 | 11,6..41,8 | runder Tambour der Kuppel, Durchmesser ≈ 30, Mitte (60,6 \| 26,7) | A |
| w673464763 | 72,4..79,3 | 0,6..5,8 | kleiner Nebenraum hinter dem Querhaus | B (im Modell: Mauermasse) |
| w673464690 | 79,2..106,4 | 0,6..12,6 | Nebenräume links am Presbyterium | B |
| w673464758 | 81,4..106,6 | 41,8..53,3 | Nebenräume rechts am Presbyterium | B |
| (kein OSM-Teil) | 82..94 | 41,8..52,8 | Campanile (Rechteck im Umriss) | C |

## 2. Maße und Befunde (Literatur gegen OSM)

| Befund | Quelle | Stufe |
|---|---|---|
| Lateinisches Kreuz, **ein** Schiff mit tiefen Seitenkapellen | it.wikipedia „Chiesa di San Frediano in Cestello“ | A |
| Giulio Cerutti (Auftrag 1680) drehte die Achse so, dass Fassade und Eingang zum Arno zeigen; Gherardo Silvani (gestorben 1675) hatte den Neubau zuerst übernommen | it.wikipedia | A |
| Kuppel auf hohem Tambour (cupola a tamburo) mit großen klassizierenden Fenstern, abwechselnd Dreiecks- und Segmentgiebel; Antonio Maria Ferri vollendete sie 1689, Antonio Domenico Gabbiani malte ihr Inneres 1702 bis 1718 (Gloria di Santa Maria Maddalena de’ Pazzi) | it.wikipedia; en.wikipedia (Kuppel 1689) | A |
| Pendentifs: die Tugenden von Matteo Bonechi | it.wikipedia | A |
| Glockenturm: von Ferri 1689 hinzugefügt (en.wikipedia); Lage, Maße und Gestalt in keiner geprüften Quelle | en.wikipedia | B (Existenz), C (Rest) |
| Kapellen: erste rechts Maria Maddalena de’ Pazzi (Sagrestani, Estasi della Santa, 1702; Gewölbe von Bonechi); dritte rechts Gherardini (Natività della Vergine, 1694, mit Gewölbefresken); zweite links Johannes der Täufer (Franchi, Battesimo di Cristo, 1706); dritte links San Bernardo (Dandini, Fresken 1688 bis 1689; Madonna lignea „del sorriso“); letzte links Sant’Anastasio (Ciabilli) | it.wikipedia; en.wikipedia (Madonna 1350, Dandini) | A |
| Rechtes Querhaus: Francesco Curradi, Madonna in gloria e santi; linkes Querhaus: Jacopo del Sellaio, Crocifissione con i santi e il Martirio di San Lorenzo, aus der alten Kirche | it.wikipedia; en.wikipedia | A |
| Hochaltar des 18. Jahrhunderts, Paliotto mit Marmorintarsien von Giuseppe Piamontini (1717) | it.wikipedia | A |
| Orgel: Gehäuse von Antonio und Filippo Tronci, 1768 für die Pieve von Santo Stefano in Campi Bisenzio, seit 1818 hier | it.wikipedia | A |
| Bauzeit 1680 bis 1689 (Ferri ab 1687 auf der Baustelle), Abschluss der Arbeiten 1708 | it.wikipedia | A |
| Keine Maße (Länge, Breite, Höhen) in it.wikipedia oder en.wikipedia | it.wikipedia, en.wikipedia | – |

## 3. Entwurfswerte ohne Beleg (Stufe C)
Alle Höhen (Gewölbe Lage 24..31, Dach-First Lage 43, Tambour Lage 32..43, Kuppelscheitel Lage 59, Laterne bis 66, Campanile bis 58), vier Kapellen je Seite, Breite der Kapellenbögen (7,5), Querhausbögen (17), Wandstärken (2), Lage und Größe des Campanile, Stufen der Fassade, Bodenmuster, Maße der Altäre, Lage der Orgel, Chorgestühl, Bänke, Farben der Bilder.
