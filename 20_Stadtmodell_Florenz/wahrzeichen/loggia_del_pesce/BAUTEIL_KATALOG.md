# Bauteilkatalog – Loggia del Pesce (Welle 6c)

Maße und Quellen: [`REFERENZMASSE.md`](REFERENZMASSE.md). Rahmen LP (θ −2,24°), Lagen yr = Y − 64. Bauplan `projects/loggia_del_pesce/model/_lp.js` (Zellen im Speicher mit `tools/wahrzeichen/zellplan.js`), Schmuck `_lp_ausstattung.js`. Stufen: A belegt, B Literatur oder begründet, C Entwurf.

## 1. Module und Bauteile

| Modul | Titel | Bauteile |
|---|---|---|
| 0 | Fundament und Boden | `fundament` (entfällt, Gelände ≤ Y 63), `boden` |
| 1 | Pfeiler und Arkaden | `pfeiler`, `arkadenwand` |
| 2 | Gebälk und Tondi | `gebaelk`, `tondi` |
| 3 | Gewölbe und Dach | `gewoelbe`, `dach` |
| 4 | Licht | `licht` |
| 5 | Schmuck und Ausstattung | `stemmen`, `kartusche`, `inschrift`, `marktbaenke` |

## 2. Zonen und Wände
- **Lange Seiten** (Zone `lang`, 2 Blöcke dick): neun Joche von je 7,11 Blöcken; Pfeiler 2,2 breit aus Pietra serena auf einem Sockel aus Pietra forte (Lage 1–2), Kämpfer aus Marmor auf Lage 5; zwischen den Pfeilern Rundbögen (Halbbreite 2,46, Ansatz Lage 5, Scheitel Lage 7), darüber die Zwickelwand bis Lage 9.
- **Schmalseiten** (Zone `kurz`, 3 dick): ein Rundbogen (6 breit, Scheitel Lage 8) in der Mitte, daneben massive Wand mit Verkleidung aus Pietra serena.
- **Gebälk** Lage 10 (außen Marmor), **Kranzgesims** Lage 11 (Pietra serena) um die ganze Loggia.
- **Halle** (Zone `halle`, w 2,2..9,8): Kuppelgewölbe je Joch (Ansatz Lage 8, Scheitel Lage 10), darüber massives Mauerwerk bis unter die Dachhaut; **Dach** als Walmdach mit Ziegeln, Dachkante Lage 12, Fläche bis Lage 14; **Überstand** zwei Blöcke außerhalb des Umrisses auf Lage 11.

## 3. Begehbarkeit
- **Zugang**: Alle Bögen sind bis zum Boden offen (`arkade`, 4,9 Blöcke breit, 7 hoch); die Halle ist von allen vier Seiten frei begehbar.
- **Innenraum**: ein durchgehender Raum (64 × 8 Blöcke, lichte Höhe 7..9), drei Marktbänke (eine Lage hoch) in der Mittelachse.
- **Dichtheit**: Pfeiler, Zwickelwände, Gebälk und Dach sind geschlossen; die Bogenöffnungen sind als `arkade` deklariert; kein Hohlraum (Gewölbe und Dachmasse sind massiv).
- **Licht**: vier Seelaternen im Boden der Halle (Raster 12).

## 4. Schmuck und Ausstattung (Module 2 und 5)
Alles vereinfacht in vollen Blöcken.

| Bauteil | Titel | Lage | Stufe | Inhalt und Quelle |
|---|---|---|---|---|
| `tondi` | Tondi mit Fischen | je Langseite acht Felder in den Zwickeln über den Pfeilern, Lage 7..9, äußere Lage | Existenz A, Zahl A, Lage B | 3 × 3, Rand Terrakotta, Mitte ein weißer Block für den Fisch. 16 Tondi laut it.wikipedia, Loggia del Pesce |
| `stemmen` | Eckwappen | Ecken der Langseiten, Lage 5..9 | Existenz A, Farben C | vier goldgerahmte Schilde in Rot und Weiß |
| `kartusche` | Kartusche | Mitte der Nordlangseite über dem fünften Bogen, Lage 8–9 | Existenz A, Lage C | weiße Tafel mit Goldrand (Widmung des Großherzogs) |
| `inschrift` | Inschriftentafel | Ostschmalseite über dem Bogen, Lage 8–9 | Existenz A, Lage C | weiße Tafel mit Goldrand (MDLXVIII) |
| `marktbaenke` | Marktbänke | Mittelachse der Halle | Zweck A, Möbel C | drei Verkaufstische aus weißem Marmor, 3 × 1, eine Lage hoch |

## 5. Abweichungen und Auslassungen
- Die **acht Medaillons je Seite** (Meeres- und Fischereimotive) sind nicht gebaut; nur die 16 Tondi.
- Die **Zuganker** (Eisen) fehlen.
- Die **Höhe** folgt nicht der OSM-Schätzung (10 Blöcke): Das Kranzgesims liegt auf Lage 11, die Dachfläche steigt bis Lage 14, weil Kuppelgewölbe und Walmdach mehr Höhe brauchen.
- Das **Walmdach** ist Stufe C (it.wikipedia nennt nur die Gewölbe).
- Die Loggia ist **nicht am ursprünglichen Ort** (Mercato Vecchio) gebaut, sondern an ihrem heutigen Standort.
