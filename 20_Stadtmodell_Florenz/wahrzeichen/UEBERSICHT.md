# Wahrzeichen Welle 1 (Piazza della Signoria) – Übersicht (V3 D1)

Spezifikation, **kein Modellcode**. Je Wahrzeichen ein Ordner mit `REFERENZMASSE.md` (Maße und Quellen) und `BAUTEIL_KATALOG.md` (Module, Bauteile, Schnittstellen). Plan: `../STADTMODELL_PLAN.md` §4/Phase D. Pipeline: `tools/ARCHITEKTUR.md` §10. Alle vier Projekte sind `type: "wahrzeichen"`.

## 1. Die Projekte

| Projekt | OSM | Grundfläche | Rahmen (Drehung gegen Modell-x) | `bodenY` | Höhe | Module | Blöcke (Richtwert) |
|---|---|---|---|---|---|---|---|
| [`palazzo_vecchio`](palazzo_vecchio/BAUTEIL_KATALOG.md) | Relation **r1461712** (Teile w361442652, w361442653 Turm, w361442654, w361442647) | 24.104 Zellen | **−79,8°** (Westfassade, Ursprung (−146,5 \| 887)) | 68 | Palast 31 m, **Turm 94 m (188 Lagen, Y 256)** | 10 | **≈ 470 k** (350–620 k) |
| [`loggia_dei_lanzi`](loggia_dei_lanzi/BAUTEIL_KATALOG.md) | Way **w43284457** | 2.080 | **+21,5°** (Front, Ursprung (−199 \| 865)) | 67 | 16 m | 8 (davon 2 optional) | **≈ 30 k** (22–38 k) |
| [`uffizi`](uffizi/BAUTEIL_KATALOG.md) (mit Corridoio Vasariano) | Way **w477279033** (Teile w673458435, w673458443) + Korridor: Ways **w328477211**, Relation **r2302811**, Way **w1344547176** (nur x ≥ −528) | 36.275 + 2.943 | **+17,4°** (Flügel 107,4°, Ursprung (−170 \| 907)); Korridor 206,8° | 65 | Traufe 25,5 m | 10 (Statuen optional) | **≈ 590 k** (410–770 k) |
| [`orsanmichele`](orsanmichele/BAUTEIL_KATALOG.md) | Way **w442508011** (+ w1394931261 Bogen optional) | 3.303 (+ 52) | **+1,0°** (Ursprung (−298 \| 542)) | 68 | 40 m (80 Lagen) | 10 (2 optional) | **≈ 80 k** (60–105 k) |
| **Summe** | | | | | | | **≈ 1,17 Mio** (≈ 560 Bauschritte) |

Die Piazza-Oberfläche ist **kein** Wahrzeichen-Projekt: siehe [`PIAZZA_STADTGRUND.md`](PIAZZA_STADTGRUND.md) (Entscheidung: Projekt `stadtgrund`, Modul „Signoria“, mit optionalem Neptunbrunnen und Reiterstandbild).

## 2. Quartier-Ausschluss (tools/city)
Der Quartiergenerator baut gewöhnliche Häuser. Folgende OSM-Objekte dürfen in **keinem** Quartier-Projekt stehen (alle in Isolato I0394, Orsanmichele in I0467):

| ID | Name | Besitzer |
|---|---|---|
| r1461712 | Palazzo Vecchio | `palazzo_vecchio` |
| w43284457 | Loggia dei Lanzi | `loggia_dei_lanzi` |
| w477279033 | Galleria degli Uffizi | `uffizi` |
| w1344547176 | Corridoio Vasariano (`building=no`, ganzer Verlauf bis Pitti) | `uffizi` (x ≥ −528), danach `ponte_vecchio`/Pitti (Welle 2) |
| w328477211 | Brücke über die Via della Ninna (Korridor) | `uffizi` |
| r2302811 | Lungarno degli Archibusieri (Korridorarkade, `building=bridge`) | `uffizi` |
| w442508011 | Chiesa di Orsanmichele | `orsanmichele` |
| w1394931261 | Verbindungsbogen zum Palazzo dell'Arte della Lana | `orsanmichele` (optionales Modul 8) |

Weitere Objekte in der Nähe **bleiben Quartier** (nicht Teil dieser Wahrzeichen): w114815080 (Regierungsbau westlich der Uffizien), w477279045, w157937048 Torre dei Pulci, w518531723, w307129124 Castello d'Altafronte, w114769411 Palazzo dei Veliti, r1603607. Sie überlappen die Wahrzeichen teilweise (§3).

## 3. Zellregeln zwischen den Projekten (Ziel: 0 Konflikte im `--cross`-Test)

**Grundlage:** Zelle = ganzzahlige (x, z), Rand zählt zum Polygon (`tools/city/poly.js`). Jede Zelle gehört genau einem Projekt.

1. **Wahrzeichen-Vorrang.** Zellen der Wahrzeichen-Masken (Polygone aus §2, Korridor `M_COR`) gehören dem Wahrzeichen. Quartier und Stadtgrund bauen dort **nicht**. *Bisher* löst `tools/city/parzellen.js` Überlappungen mit „kleinere ID gewinnt“. Dann würden **10 Zellen** der Uffizien an Quartierhäuser fallen (w114815080: 3, w157937048: 4, w307129124: 1, r1603607: 2). Die Quartier-Parzellenregel muss deshalb die Wahrzeichen-Polygone **ausschließen** (Vorschlag: Feld `ausgeschlossen: [IDs]` in `project.json` der Quartiere, oder `parzellen.js` bekommt die Liste aus §2). Die Loggia gewinnt auch nach der ID-Regel (10 Zellen mit w114815080).
2. **Säulenregel (Gelände).** In jeder Säule (x, z) einer Wahrzeichen-Maske baut der Stadtgrund das Terrain höchstens bis Y = `bodenY − 1`, das Wahrzeichen belegt ab Y = `min(groundTopY+1, bodenY)`. Wo `groundTopY ≥ bodenY` ist, wird das Gelände im Footprint abgetragen (kein Doppelbelegen). Das Fundament baut das Wahrzeichen von `groundTopY+1` bis `bodenY−1`. Konstanten: PV 68, Loggia 67, Uffizien 65, Orsanmichele 68.
3. **Platz und Straßen** (Stadtgrund) überlappen den Palazzo Vecchio in **21 Randzellen**; diese gehören dem Palast. Alle anderen Wahrzeichen: 0 Überlappung mit der Piazza-Fläche.
4. **Wahrzeichen untereinander:** Die vier Masken (Palazzo Vecchio, Loggia, Uffizien, Orsanmichele) überlappen sich in **0 Zellen** (gemessen). Die Korridormaske `M_COR` ist durch Abzug der übrigen Masken disjunkt.
5. **Kanten mit Gegenstück:**
   - **Loggia ↔ Uffizien:** gemeinsame Polygonkante (−193,5 \| 894) → (−171,5 \| 902,5), Länge 23,6 (Loggia-Kante 3, Uffizien-Kante 28). Keine gemeinsame Zelle. Doppelwand: Loggia-Rückwand (Loggia, Lagen Y 70..96) und Uffizien-Wand (Uffizien, Y 66..116) liegen Zelle an Zelle.
   - **Palazzo Vecchio ↔ Corridoio ↔ Uffizien:** Brücke (Maske w328477211, 225 Zellen, Fünfeck (−91,5 \| 908,5), (−84,5 \| 912), (−90,5 \| 927), (−103 \| 921,5), (−97 \| 906,5)) gehört `uffizi` Modul 8. PV-Kante E14–E15 und Uffizien-Kante 41 haben je **Öffnung 7 × 7 bei Y 102..108** (Kantenabschnitt 3,35..10,35 von 13,7). Brückenboden **Oberkante Y 101** (PV: Decke 1. OG = Y 101; Uffizien: Decke Lage 36 = Y 101).
   - **Uffizien ↔ Ponte Vecchio** (Welle 2): Schnittlinie **x = −528**, identischer Querschnitt Y 77..87. Das Gebäude r2302812 überlappt `M_COR` in 97 Zellen (Korridor-Vorrang).
   - **Orsanmichele:** keine Nachbarwahrzeichen, Verbindungsbogen w1394931261 gehört dem Projekt.
6. **Luftraum:** Außerhalb der Maske ragen nur hinein: Ballatoio PV (≤ 3 Zellen, Y 118..130), Turm-Ballatoio PV (3 Zellen, Y 213..228), Kranzgesims Uffizien (+1, Y 115..116), Kranzgesims und Dachtraufe Orsanmichele (≤ 2, Y 138..143), Korridorbrücke (eigene Maske). Der Stadtgrund hat in diesen Höhen nichts.

## 4. Gemeinsame Koordinatenkonvention der Kataloge
Jedes Wahrzeichen hat einen lokalen Rahmen: `x = Ox + u·cosθ − w·sinθ`, `z = Oz + u·sinθ + w·cosθ` (θ von +x nach +z, z nach Süd, y nach oben). **Rasterung durch Rückabbildung der Zellmitte** (stetige u, w, halboffene Intervalle). **Jedes Bauteil wird mit der OSM-Maske geschnitten.** Höhen als `y_rel = Y − bodenY`.

## 5. Palette
Nur vorhandene Rollen: `pietra_forte`, `pietra_forte_rustika`, `pietra_forte_bruch`, `pietra_serena`, `putz_sand`, `pflaster`, `marmor_weiss`/`_ornament`/`_saeule`, `dachziegel` (der Auftrag schrieb „dach“; die Palette heißt `dachziegel`), `holz`, `bronze`, `gold`, `glas_fenster`, `fresko`, `wasser`, `fensterladen`. **Keine zwingenden Palettenwünsche.** Optional: ein dunkleres Grau für Pietra serena. Gitter, Zäune und Stufen sind nicht möglich (nur volle Blöcke); Ringhiera und Eisengitter entfallen.

## 6. Offene Fragen (Entscheidung des Nutzers nötig)
1. **Breite des Piazzale degli Uffizi:** OSM 12,5–13,9 m, Literatur (Corsani/Romby, nur über Suchzusammenfassung) 18 m (−23…−31 %). Die Katalogwerte folgen OSM. Soll auf 18 m verbreitert werden (Flügelflächen anpassen)? Das ändert die Polygongrenze und widerspricht der Regel „OSM gewinnt“.
2. **Turmhöhe PV:** 94 m (fünf Quellen) gegen „84,62 m“ (nur Zusammenfassung zu Bartoli, nicht geprüft). Gewählt 94 m.
3. **Orsanmichele-Höhe:** 40 m (en, de) gegen ≈ 36 m (Archilovers, 3 × 12 m). Gewählt 40 m.
4. **Bogenzahl Orsanmichele** (3/2) und **Zuordnung der Straßennamen zu den Himmelsrichtungen** sind abgeleitet.
5. **Zählung der Fensterachsen** am Palazzo Vecchio (9 abgeleitet aus 18 Konsolbögen, Alternative 7) und Lage des Hauptportals: nur Fotos (Commons) klären das.
6. **Lage des Salone dei Cinquecento** im Ostblock des Palastes (Maß belegt, Lage geschätzt) und **Funktion der PV-Höfe** (Löcher 0..3).
7. **Tribuna-Oktogon** der Uffizien: OSM 16 m Durchmesser, die historische Tribuna ist kleiner; Deutung offen (Dachaufbau?).
8. **Korridor-Höhe und Querschnitt** (Gang 7 × 7 Blöcke, Boden Y 78 auf dem Lungarno, Y 101 in den Uffizien) sind Planwerte; die Höhenstufe von 23 Blöcken wird in der Südwestspitze der Uffizien durch eine Treppe überwunden (Annahme).
9. **Loggia:** Westseite geschlossen (nur ein Seitenbogen Ost belegt), Pfeiler/Bogenmaße (6/18 Blöcke) aus der gemessenen Front abgeleitet.
10. **Wahrzeichen-Vorrang im Quartiergenerator** (§3 Punkt 1) braucht eine Änderung an `tools/city/parzellen.js` oder den `project.json` der Quartiere; ohne sie entstehen 10 Zellkonflikte an den Uffizien.
11. **Stadtgrund:** Es gibt das Projekt noch nicht. Es muss die Säulenregel (§3 Punkt 2) und das Platz-Pflaster (PIAZZA_STADTGRUND) umsetzen. Die **Pflasterhöhe an der PV-Fassade** soll auf 68 geglättet werden.
12. **Optionen** (je nach Umfang streichbar): Statuen (Loggia, Uffizien, Orsanmichele), Innenwände PV (`innenwaende_a`, −20 k), `spinnwand_fluegel` Uffizien (−55 k), Verbindungsbogen Orsanmichele, Neptunbrunnen und Reiterstandbild.

## 7. Reihenfolge der Umsetzung (Vorschlag)
1. Orsanmichele und Loggia (klein, unabhängig).
2. Palazzo Vecchio (Module 0–5, dann 6–9).
3. Uffizien (0–7), danach Modul 8 (Korridor) gemeinsam mit der PV-Öffnung.
4. `--cross`-Test über alle vier Projekte plus Stadtgrund-Stub.
