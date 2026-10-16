# Referenzmaße – Santa Felicita (W5b, Wahrzeichen-Welle 5)

Projekt-ID `santa_felicita`. Maßstab 1:2 (**Blöcke = 2 · m**), Weltkoordinaten des Stadtmodells. Stand 16.10.2026.
Stufen: **A** mehrere Quellen übereinstimmend oder amtliche Quelle, **B** eine Quelle oder aus OSM/DGM gemessen, **C** Schätzung (Proportion). Entwurf: [`BAUTEIL_KATALOG.md`](BAUTEIL_KATALOG.md).

## 1. Rahmen und OSM

| Größe | Wert | Quelle |
|---|---|---|
| OSM-Objekt | Way **w159394659** „Chiesa di Santa Felicita“ (`building=church`, `building:levels=3`, `wikipedia=it:Chiesa di Santa Felicita (Firenze)`), 2.739 Zellen im Umriss, **2.462 Zellen** nach Abzug des Korridors | `data/stadt/gebaeude.json` |
| Korridor | Der Corridoio Vasariano (`palazzo_pitti`, Modul 9, Maske `korridor`) belegt **277 Zellen** des Umrisses: den Streifen u 0..8,8 über die ganze Fassadenbreite (der Portikus) | Schnitt der Masken, Test |
| Campanile | Way **w119180019** „Torre dei Fifanti“ (`man_made=tower`, `tower:type=bell_tower`, `wikipedia=it:Torre dei Fifanti`), **190 Zellen**, bisher im Quartier Costa San Giorgio; steht östlich hinter der Cappella maggiore | OSM; it.wikipedia „Torre dei Fifanti“ nennt ihn den Glockenturm der Kirche |
| **Rahmen `SF`** | θ = **48,6°**, Ursprung (−682 \| 1375): u von der Fassade (Nordwesten, Piazza Santa Felicita) nach Südosten zum Chor, w quer, w > 0 nach Südwesten (rechts beim Eintreten). Der Umriss ist in diesem Rahmen achsparallel | gemessen an den Polygonkanten |
| Gelände | `groundTopY` 64 vor der Fassade, 66 bei Lage u 10..50, steigt hinter der Kirche auf 82 (Hang zum Boboli); im Umriss trägt `spec/ground.js` bis Y 65 ab | `tools/city/ground_stadt.js` |
| **`bodenY`** | **66** (Fußboden Y 66, Stehhöhe Y 67; bündig mit dem Pflaster des Portikus) | Entwurf, B |

### Polygon im Rahmen `SF` (gemessen, u \| w in Blöcken)
- **Körper** u 9,2..66 × w −1,6..32,5 (Schiff mit Kapellen und Querhaus), davor der Portikus u 0..9,2 (Korridormaske).
- **Cappella maggiore** u 66..92 × w 3,5..26.
- **Torre dei Fifanti** u 91,9..104,8 × w 7,2..22,0.

## 2. Maße (Literatur gegen OSM)

| Maß | Modell | Literatur | Bewertung |
|---|---|---|---|
| Baugeschichte | Ruggieri-Bau mit Tonne | Neubau 1736 bis 1739 durch Ferdinando Ruggieri, Schiff aus einem Raum; erhalten nur die zwei Kapellen an der Eingangswand und der Chor des 17. Jh. ([it.wikipedia](https://it.wikipedia.org/wiki/Chiesa_di_Santa_Felicita_(Firenze)), [en.wikipedia](https://en.wikipedia.org/wiki/Santa_Felicita,_Florence)) | A |
| Grundriss | Schiff, drei Kapellen je Seite, Querhaus, quadratische Cappella maggiore | lateinisches Kreuz, ein Schiff mit Tonne und Stichkappen, drei Kapellen je Seite, Querhaus mit Kuppel ohne Laterne und Tambour, quadratische Hauptkapelle mit Segelgewölbe (Cigoli, um 1610 bis 1620) (it.wikipedia) | A (Typ), C (Maße) |
| Fassade | Giebelfassade über dem Portikus | Giebelfassade („a capanna“), davor ein Portikus mit drei Rundbogenjochen auf quadratischen Pfeilern; der Gang des Corridoio Vasariano läuft darüber; ein Portal mittig, daneben Monofore für die Kapellen; zwei niedrige Bogenfenster oben (it.wikipedia) | A |
| Palco der Medici | Loge an der Eingangswand | „palco del Granduca“ über den Kapellen Canigiani und Barbadori-Capponi an der Eingangswand, mit dem Korridor verbunden, im 18. Jh. verändert (it.wikipedia); ein großes vergittertes Fenster ließ die Medici die Messe ungesehen hören (en.wikipedia) | A |
| Cappella Capponi | erste Kapelle rechts | ursprünglich Cappella Barbadori von Brunelleschi (1419 bis 1423), 1525 von Lodovico Capponi gekauft, Pontormo 1525 bis 1528; Kreuzabnahme an der rechten Wand nahe dem Eingang, Verkündigung daneben ([it.wikipedia](https://it.wikipedia.org/wiki/Chiesa_di_Santa_Felicita_(Firenze)), en.wikipedia, museionline) | A (Werk), B (Ort) |
| Cappella Canigiani | erste Kapelle links | gegenüber der Capponi-Kapelle, Fresken Bernardino Poccetti 1589 bis 1590 (en.wikipedia) | A/B |
| Bilder | Farbfelder an Wänden | Ciseri, Martyrium der Makkabäer (1863), dritte Kapelle rechts; Tosini, Begegnung von Anna und Joachim, Ende des rechten Querarms; Franceschini, Himmelfahrt (1677), Ende des linken Querarms (en.wikipedia) | A/B |
| Chor | Segelgewölbe mit Fresko | Entwurf Cigoli für die Guicciardini, Gewölbe um 1620 von Cinganelli, Altarbild Francesco Brina zugeschrieben (1587) (en.wikipedia) | A/B |
| Campanile | quadratischer Turm, zwei Monofore je Seite, flaches Pyramidendach | Torre dei Fifanti, 13. Jh., zum Glockenturm umgearbeitet; Glockenstube mit vier Paaren hoher schmaler Monofore (zwei je Seite), untere Hälfte mit Ziegeln zur Brüstung gefüllt, Mauerwerk mit Gerüstlöchern und Schießscharten, flaches Pyramidendach (it.wikipedia „Torre dei Fifanti“) | A (Beschreibung), C (Höhe) |
| Sakristei | **nicht gebaut** | 1473 gestiftet von Giovanni di Antonio Canigiani, Kubus unter Kuppel mit Apsis im Osten (it.wikipedia); die Lage ist im Umriss nicht erkennbar, keine Erfindung ohne Beleg | – |

## 3. Entwurfswerte ohne Beleg (Stufe C)
- Schiff: Breite 16, Pfeilerwand 2 dick (|w − 15,5| 8..10), Kapellen innen 10 × 5 (|w − 15,5| 10..15), Joch 12, Kämpfer Lage 20, Scheitel Lage 28, First Lage 36, Traufe Lage 29. OSM: `building:levels=3`, Höhe 23 Blöcke (Standard), deutlich niedriger als der Entwurf; beide Angaben ohne Beleg, die Proportion folgt dem Gang (Boden Y 78) über dem Portikus.
- Kapellen: Decke Lage 15, Pultdach 22 bis 17. Querarme: Decke 20, Dach 27 bis 23. Vierung: Kuppelansatz Lage 24, Scheitel 31, Walmdach bis 38. Cappella maggiore: Segelgewölbe 22 bis 29, Satteldach bis 38.
- Fassade: First Lage 40 (Y 106), Gebälk bei Lage 22/23 über dem Gang (Gangdecke Lage 21), Portal 8 breit, Scheitel Lage 12.
- Campanile: Schaft bis Lage 27, Glockenstube Lage 28 bis 36 (Brüstung Lage 28 bis 30), Pyramide Lage 37 bis 42; Höhe 21 m ohne Beleg (OSM schätzt 30 Blöcke, keine Quelle nennt eine Höhe). Anzahl und Größe der Glocken sind nicht belegt (vier Glocken im Modell).
- Zugang zum Turm: Tür 3 × 4 aus dem Chor (Stufe C); das Gelände steigt hinter der Kirche auf Y 73 bis 82, eine Tür ins Freie läge im Hang.
- Palco: Plattform 3 tief, 13 breit, Boden Lage 12 (Gangboden Y 78 des Corridoio).
