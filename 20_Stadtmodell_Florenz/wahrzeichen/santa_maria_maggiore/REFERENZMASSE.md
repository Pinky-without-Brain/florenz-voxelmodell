# Referenzmaße – Santa Maria Maggiore (W6a, Wahrzeichen-Welle 6)

Projekt-ID `santa_maria_maggiore`. Maßstab 1:2 (**Blöcke = 2 · m**), Weltkoordinaten des Stadtmodells. Stand 16.10.2026.
Stufen: **A** mehrere Quellen übereinstimmend oder amtliche Quelle, **B** eine Quelle oder aus OSM/DGM gemessen, **C** Schätzung (Proportion). Entwurf: [`BAUTEIL_KATALOG.md`](BAUTEIL_KATALOG.md).

## 1. Rahmen und OSM

| Größe | Wert | Quelle |
|---|---|---|
| OSM-Objekt | Way **w234429579** „Chiesa di Santa Maria Maggiore“ (`building=church`, `wikidata=Q116950564`, `wikipedia=it:Chiesa di Santa Maria Maggiore (Firenze)`), Fläche 2.583 Blöcke, **2.604 Zellen** (Rand innen), keine `building:part`, bisher im Quartier San Lorenzo | `data/stadt/gebaeude.json` |
| **Rahmen `MM`** | θ = **0°**, Ursprung (−663,5 \| −45): u von der Fassade (u = 0, Westkante an der Piazza di Santa Maria Maggiore) nach **Osten** zur Rückwand (u ≈ 60), w quer, w > 0 nach Süden = **rechts** beim Eintreten. Fassadenkante x = −663,5 von z −37,5 bis 2,5 (w 7,5..47,5); Nordkante schräg von (−663,5 \| −37,5) nach (−604,5 \| −45) (Via dei Cerretani) | gemessen an den Polygonkanten; Piazza, Via dei Cerretani, Vicolo und Via dei Conti aus `data/stadt/flaechen.json` |
| Umriss im Rahmen | u 0..60, w 1..47 (an der Fassade 8..47, am Ostende 1..47); Fassade 40 Blöcke = 20 m breit, Länge 60 Blöcke = 30 m | gemessen, B |
| Gelände | `groundTopY` 62 bis 65 (62: 107, 63: 1.217, 64: 1.157, 65: 123 Zellen); an der Piazza 63 | `tools/city/ground_stadt.js` |
| **`bodenY`** | **63** (Fußboden Y 63, Stehhöhe Y 64; gleiche Höhe wie die Piazza) | Entwurf, B |

## 2. Maße und Befunde (Literatur gegen OSM)

| Befund | Quelle | Stufe |
|---|---|---|
| **Drei Schiffe zu je drei Jochen**, Kreuzgewölbe, Spitzbögen auf quadratischen Pfeilern | it.wikipedia „Chiesa di Santa Maria Maggiore (Firenze)“; en.wikipedia (ein Schiff mit zwei Seitenschiffen, Spitzbögen, Kreuzgewölbe) | A |
| Quadratisches Presbyterium, **einige Stufen erhöht**, endet in einer Apsis; **drei Apsidialkapellen mit flachem Abschluss** (zisterziensisches Merkmal des gotischen Umbaus im 13. Jh.) | it.wikipedia | A |
| Schlichtes Äußeres: Steinverkleidung, Portale mit Dreiecksgiebeln; mittleres gotisches Portal mit spitzer Lünette und Wimperg (innen Kopie einer Marmor-Madonna des 14. Jh.); Portal an der Via dei Cerretani mit leerem gebrochenem Giebel; Marmorfassade von Alfonso Parigi d. Ä. nie gebaut | it.wikipedia | A |
| **Romanischer Campanile** in der Fassade erhalten; auf jeder Seite zwei Reihen rundbogiger Einzelfenster mit Backsteinschmuck; der obere Teil mit der Glockenstube **ab 20. März 1630 abgetragen**, Glocken in einen Glockengiebel an der Rückseite versetzt | it.wikipedia; en.wikipedia (Turm verkürzt, aber romanisch) | A |
| **Berta**: Frauenkopf, angeblich von einem römischen Grabmal, an der Via dei Cerretani | it.wikipedia; en.wikipedia (Roman head, „la Berta“) | A |
| Seitenschiffe mit barocken Fresken und Stuck reich ausgestattet, Mittelschiff vergleichsweise schlicht | it.wikipedia | A |
| Gegenfassade 1595/96 erneuert, mit Pietra serena verkleidet, darüber marmorne Cantoria; Orgelgehäuse teilweise erhalten | it.wikipedia | A |
| Presbyterium: hoher neugotischer Steinaltar; dahinter Orgel Mascioni Opus 893 (1967); Fresken von Jacopo di Cione (Geschichten des Herodes, Kindermord, um 1395 bis 1400) | it.wikipedia | A |
| Kapellen rechts: Panciatichi (1370; Pugliani, Kommunion der Magdalena 1636), Orlandini del Beccuto (Primo Conti, Santa Rita 1949; Vannini, Giusti), vierte Carnesecchi (Zanobi: Poccetti-Fries, Statuen Caccini, Dandini, Stigmatisation); links: Boni (Rosselli 1634, Lage unklar), zweite Carnesecchi (1406; Marinari 1672 bis 1674; Triptychon von Masolino und Masaccio um 1423 zerstreut; Uccello-Verkündigung verloren), letzte Orlandini (1642; Volterrano, Wagen des Elija) | it.wikipedia; en.wikipedia | A / B |
| Kapelle links vom Chor (Carnesecchi, 1449): Madonna-Reliquiar (Relief, Coppo di Marcovaldo zugeschrieben, 13. Jh., vielleicht byzantinisch 12. Jh.), Grabmal des Brunetto Latini (Inschrift 1751), Sarkophag im Stil des Tino di Camaino | it.wikipedia; en.wikipedia | A / B |
| Gherardo Silvani gestaltete das Innere im frühen 17. Jh. um (möglicherweise nach Buontalenti) | it.wikipedia; en.wikipedia | B |
| Fußboden nach dem Hochwasser vollständig erneuert; Presbyterium vor 1916 radikal restauriert | it.wikipedia | A |
| Keine Maße (Längen, Breiten, Höhen) in it.wikipedia oder en.wikipedia | it.wikipedia, en.wikipedia | – |

## 3. Entwurfswerte ohne Beleg (Stufe C)
Alle Höhen (Gewölbeansatz Lage 28 und 15, Scheitel 36 und 22, Dach-First Lage 44, Fassade bis 46, Stumpf bis 40, Podest 2), Breite der Schiffe (15 und je 8 bis 17 Blöcke), Pfeilerreihen (2 dick), Lage der Joche (10,3 Blöcke, Presbyterium und Chor 13), Portale (Maße), Lage und Größe des Campanile-Stumpfs (12 × 13 am Nordende der Fassade), Fenster, Bodenmuster, Altarmaße, Farben und Motive der Bilder, Bänke.
