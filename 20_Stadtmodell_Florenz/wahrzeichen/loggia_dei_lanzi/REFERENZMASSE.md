# Referenzmaße – Loggia dei Lanzi (V3 D1, Wahrzeichen-Welle 1)

Projekt-ID `loggia_dei_lanzi`, Maßstab 1:2 (**Blöcke = 2 · m**), Weltkoordinaten des Stadtmodells (`tools/spec/frame.js`). Stand 12.10.2026. Stufen: **A** mehrere Quellen, **B** eine Quelle oder aus OSM gemessen, **C** Schätzung. Entwurf: [`BAUTEIL_KATALOG.md`](BAUTEIL_KATALOG.md).
Online ist für die Loggia **kein einziges Längenmaß** veröffentlicht (gelesen: en/it/de Wikipedia, italia.it, Google Arts & Culture, Reiseseiten). Alle Maße sind deshalb **aus dem OSM-Grundriss gemessen (B)** oder **geschätzt (C)**.

## 1. Rahmen

| Größe | Wert | Quelle |
|---|---|---|
| OSM-Objekt | Way **w43284457** „Loggia dei Lanzi“ (`building=yes`, `historic=monument`, `wikidata=Q839746`), 2.080 Zellen = 520 m², Umfang 211 Blöcke, Isolato I0394 | `data/stadt/gebaeude.json` |
| Gelände | `groundTopY` 66 (1.788 Zellen), 67 (292) | `tools/geo/gelaende.js` |
| **Bodenplatte `bodenY`** | **67** (die Loggia steht auf einem niedrigen Podest über dem Platz, Platz 66–67; 1 Lage Stufe zum Platz) | Entwurf |
| **Rahmen `LL`** | Ursprung (−199 \| 865), **θ = +21,5°** (gegen die Modell-x-Achse), u entlang der Front (nach Ost), w nach hinten (Südsüdwest). Fassadenrichtung der Front = **+21,5°**, Seitenwände 111,5° | OSM-Kanten: Front 21,5°, Rückwand 21,8°, Ostseite 110,3° |
| Front | Außenkante w ≈ 0 (u −39,1..38,8) blickt nach NNO auf die Piazza | OSM (Platzpolygon w23298643 grenzt exakt an diese Kante) |

## 2. Abgleich Literatur gegen OSM

| Maß | OSM | Literatur | Bewertung |
|---|---|---|---|
| Front | 77,9 Blöcke = **38,9 m** (Kante (−235,5 \| 851) → (−163 \| 879,5)) | keine Zahl | Stufe B |
| Tiefe | 24,5–28 Blöcke = **12,3–14 m** (Ostteil 24,8, Westteil 27,8–28,1) | keine Zahl | Stufe B. Der Sprung von 3 Blöcken bei u ≈ 16 stammt vom Uffizien-Nordende (gemeinsame Kante, siehe `uffizi`). |
| Joche | 3 Bögen zur Piazza, 1 Bogen an der Ostseite | [en](https://en.wikipedia.org/wiki/Loggia_dei_Lanzi): drei sehr hohe, weite Bögen zur Piazza und „an der Ostseite zu den Uffizien“; [it](https://it.wikipedia.org/wiki/Loggia_dei_Lanzi): tre arcate | Stufe A |
| Pfeiler | Bündelpfeiler mit Halbsäulen und korinthischen Kapitellen | en | Stufe B |
| Gewölbe | Kreuzgewölbe mit Konsolen (it: „peducci“); en nennt halbkreisförmige Elemente (Antonio di Puccio Pucci) | en/it | Stufe B |
| Rundbögen | Rundbögen („antizipieren die Renaissance“) | it | Stufe B |
| Fries | vier Medaillons der Kardinaltugenden von Agnolo Gaddi (1383–86) unter der Brüstung | en, it | Stufe B |
| Terrasse | Buontalenti baute 1583 eine Terrasse auf das Dach | [it](https://it.wikipedia.org/wiki/Loggia_dei_Lanzi) | Stufe B |
| Bauzeit | 1376–1382, Benci di Cione und Simone di Francesco Talenti | en, it, de | Stufe A |
| Perseus (Cellini) | 3,20 m **mit Sockel** | it | Stufe B (nur für optionale Statue) |

Raster aus den OSM-Maßen: Front 78 Zellen (u −39..38) = **4 Pfeiler à 6 + 3 Bögen à 18** (4 · 6 + 3 · 18 = 78 ✓, ganzzahlig). Pfeilerbreite 3,0 m, Bogenweite 9,0 m (**C**: nicht belegt; die Zahlen folgen aus der ganzzahligen Teilung der gemessenen Front).

## 3. Hauptmaße im Modell (Lagen über der Bodenplatte, 1 Lage = 0,5 m)

| Maß | m | Blöcke | Stufe |
|---|---|---|---|
| Front 78 × Tiefe 25 (Ost) bzw. 28 (West) | 39 × 12,5 / 14 | 78 × 25 / 28 | B |
| Pfeilersockel | 1,0 | 2 (Lage 1..2) | C |
| Pfeilerschaft | 4,5 | 9 (Lage 3..11) | C |
| Kapitell | 1,0 | 2 (Lage 12..13), Kämpfer = Lage 13 | C |
| Bogenöffnung Front: Halbweite 9, Scheitel Laibung Lage 22 (= Kämpfer 13 + 9) | 9 über Kämpfer | Scheitel 22 | C |
| Archivolte | 1,0 | 2 (Scheitel Außenkante Lage 24) | C |
| Fries mit Medaillons | 1,5 | 3 (Lage 25..27) | B (Medaillons) / C (Höhe) |
| Terrassenplatte mit Kranzgesims | 1,0 | 2 (Lage 28..29) | B / C |
| Brüstung | 1,5 | 3 (Lage 30..32) | C |
| **Gesamthöhe** | **16,0** | **32** | C |
| Seitenbogen Ost: Spannweite 16, Halbweite 8, Kämpfer 13, Scheitel 21 | 8 / 10,5 | 16 / 21 | C |
| Wandstärke Front über den Bögen / Rückwand / Seitenwand | 1,5 | 3 | C |
| Kreuzgewölbe: 3 Joche à 24 × 18, Kämpfer 13, Scheitel (Laibung) 22, Dicke 2 | 12 × 9 | 24 × 18 | C |

## 4. Konsistenzprüfung

- Höhe: 2 (Sockel, Lage 1..2) + 9 (Schaft, 3..11) + 2 (Kapitell, 12..13) + 11 (Bogenzone bis Archivolte, 14..24) + 3 (Fries, 25..27) + 2 (Terrassenplatte, 28..29) + 3 (Brüstung, 30..32) = **32 Lagen** = 16,0 m ✓.
- Front: 6 + 18 + 6 + 18 + 6 + 18 + 6 = 78 ✓.
- Seitenbogen: Tiefe 25 − Frontpfeiler 6 − Rückwand 3 = **16** ✓ (lichte Weite).
- Gewölbe: Scheitel 22 + Dicke 2 = Extrados 24 < Terrassenplatte ab Lage 28 ✓.
- Die Westverbreiterung der Tiefe um 3 Blöcke (u < 16) wird als massive Rückwandverstärkung (w 25..27) gebaut, damit die Maske vollständig belegt ist.

## 5. Rundung
Länge = 2 · m, danach auf das Raster 6/18 gelegt. Bogenweiten sind gerade (Mittel zwischen zwei Zellen, Spiegelachse bei u = −0,5), Höhen ganzzahlig, Summe 32. Die Gewölbe-Laibung ergibt sich aus Kämpfer + Halbweite.

## 6. Annahmen und offene Punkte
1. Alle Höhen und Bogenweiten sind C. Real ist der Eindruck „sehr hohe, weite Bögen“ (en); ein Bogenscheitel bei 11 m ist plausibel, aber nicht belegt.
2. Die **Westseite** hat nach dem Auftrag nur einen Bogen an der Ostseite. Für die West- (Platz-)Seite ist in keiner gelesenen Quelle ein Bogen belegt: **geschlossen** modelliert.
3. Die Statuen (Perseus, Raub der Sabinerinnen, Herkules und Nessus, Raub der Polyxena, Menelaos mit Patroklos, sechs Frauenfiguren, Medici-Löwen) sind **optionale vereinfachte Blockfiguren** (Modul 6/7 im Katalog). Die Platzierung folgt en/it („Perseus im linken Bogen, Sabinerinnen rechts“); die Zuordnung links = Ost-Bogen ergibt sich aus dem Blick von der Piazza.
4. Medaillons: vier, gesetzt über den vier Pfeilern (Lage nicht belegt).

## 7. Quellen
- [Loggia dei Lanzi – English Wikipedia](https://en.wikipedia.org/wiki/Loggia_dei_Lanzi)
- [Loggia dei Lanzi – Italiano](https://it.wikipedia.org/wiki/Loggia_dei_Lanzi)
- [Loggia dei Lanzi – Deutsch](https://de.wikipedia.org/wiki/Loggia_dei_Lanzi)
- [italia.it: Loggia della Signoria](https://www.italia.it/it/toscana/firenze/loggia-della-signoria) (nur qualitative Beschreibung)
- OpenStreetMap-Mitwirkende (ODbL), `data/stadt/gebaeude.json`, `flaechen.json`; DGM Comune di Firenze 2017 (CC BY 4.0)
