# Bauteilkatalog – Loggia del Grano (Welle 8c)

Maße und Quellen: [`REFERENZMASSE.md`](REFERENZMASSE.md). Rahmen LG (θ 33,69°), Lagen yr = Y − 61. Bauplan `projects/loggia_del_grano/model/_lg.js` (Zellen im Speicher mit `tools/wahrzeichen/zellplan.js`), Ausstattung `_lg_ausstattung.js`. Content der Standardmodule: `node tools/diag/w8c_inhalt.js loggia_del_grano`. Stufen: A belegt, B Literatur oder begründet, C Entwurf.

## 1. Module und Bauteile

| Modul | Titel | Bauteile |
|---|---|---|
| 0 | Fundament und Boden | `fundament` (entfällt, Gelände eben), `boden` |
| 1 | Pfeiler und Arkaden | `pfeiler`, `arkadenwand` |
| 2 | Obergeschosse, Fenster, Gesims | `obergeschosse`, `fenster`, `gesims` |
| 3 | Geschossböden und Treppen | `geschossboeden`, `treppe` |
| 4 | Dach | `dach`, `dachfenster` |
| 5 | Licht | `licht` |
| 6 | Ausstattung | `wappen`, `tafeln`, `getreidebaenke`, `staio`, `buehne`, `sitzreihen` |

## 2. Zonen und Wände
- **Arkadenseiten** (Kanten 1, 0, 2; Mauer 3 dick): Stirnseite drei Joche (je 12,6), Seiten zwei Joche (je 13,9); Eckpfeiler aus Pietra-forte-Rustika (3,2 breit), Zwischenpfeiler aus Pietra serena mit Kämpfer aus Marmor auf Lage 5; Rundbögen bis zum Boden offen (Ansatz Lage 5, Scheitel bis Lage 10), alle Bogenzellen `arkade`.
- **Rückwand** (Kante 3, Südwest): geschlossen, innen Putz; trägt die Wappen.
- **Gebälk** Lage 11 (außen Marmor), zugleich Boden des Mezzanins (Holz).
- **Mezzanin** (Lage 12–14): Rechteckfenster 2 × 2 in der Achse jedes Jochs; Band auf Lage 15.
- **Obergeschoss** (Lage 16–23): große Bogenfenster (5 breit, Scheitel Lage 23) in der Achse jedes Jochs, Glas durch die ganze Mauerdicke; Decke auf Lage 24.
- **Gesims** Lage 25 (Marmor) und 26 (Pietra serena) auf der Außenlage; **Dachgeschoss** bis Lage 27; **Satteldach** (First entlang u, Lage 30) massiv ausgefüllt, kein Dachboden; Ochsenaugen (Glas, 3 Blöcke) in den Giebelwänden.

## 3. Begehbarkeit
- **Zugang:** Alle sieben Bögen sind bis zum Boden offen (`arkade`); die Halle ist ein einziger Raum.
- **Treppen:** zwei gerade Läufe aus Treppenblöcken, 3 breit, Stützblock unter jeder Stufe: 11 Stufen Halle → Mezzanin (Rückseite, Westteil), 4 Stufen Mezzanin → Obergeschoss (Osten), Böden darüber ausgespart (Kopffreiheit 3). Plätze per Suche in Weltachsen.
- **Licht:** Seelaternen im Boden der Halle, des Mezzanins und des Obergeschosses (Raster 12).
- **Dichtheit:** Mauern, Böden und das massive Dach geschlossen; Bögen deklariert, Fenster verglast.

## 4. Ausstattung (Modul 6)
Alles vereinfacht in vollen Blöcken.

| Bauteil | Titel | Lage | Stufe | Inhalt und Quelle |
|---|---|---|---|---|
| `wappen` | Wappen | Rückwand innen, Lage 3–6, fünf Schilde | Existenz A, Farben C | Popolo, Stadt, Parte Guelfa, Staio, Türme der Capitani di Torre (it.wikipedia) |
| `tafeln` | Gedenktafeln | Rückwand innen, Lage 8–9 | Existenz A | zwei Marmortafeln mit Goldrand |
| `getreidebaenke` | Getreidebänke | Halle | Zweck A, Möbel C | drei Holztische 4 × 1, eine Lage hoch |
| `staio` | Staio | Mitte der Halle | Symbol A, Block C | Bronzeblock 3 × 3, eine Lage hoch |
| `buehne` | Bühne | Obergeschoss, Rückwand | Nutzung A, Lage C | Holzbühne, eine Lage hoch |
| `sitzreihen` | Sitzreihen | Obergeschoss | C | vier Bankreihen mit Mittelgang |

## 5. Abweichungen und Auslassungen
- Die im Auftrag genannte **Aufstockung 1690** steht nicht in der Quelle; belegt ist 1868 (Umbau zum Theater). 1690 betrifft den Verlust der Speicherfunktion.
- **Uhr** und **Medici-Wappen** über dem Eingang sind in der Quelle nicht belegt und nicht gebaut; die Wappen der Rückwand sind belegt.
- Die zentrale **Giebelgaube** fehlt (OSM-Höhe 30 erlaubt sie nicht), ebenso die Gitter vor den Bögen.
- Stützen: Quelle nennt toskanische Säulen; im Modell Pfeiler.
- Mezzanin und Obergeschoss sind je ein Raum (Raumaufteilung nicht belegt).
