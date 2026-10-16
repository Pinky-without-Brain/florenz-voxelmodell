# Bauteilkatalog – Santa Felicita (W5b)

Maße: [`REFERENZMASSE.md`](REFERENZMASSE.md). Rahmen SF (θ 48,6°, Ursprung (−682 | 1375)), Lagen yr = Y − 66. Ein Bauplan in `projects/santa_felicita/model/_sf.js`, Portikus-Geometrie gemeinsam mit dem Palazzo Pitti in `model/_portikus.js`.

## 0. Zonen und Rahmen
| Zone | Bereich (u \| w) | Inhalt |
|---|---|---|
| `fassade` | u < 11,2 | Fassadenwand (2 dick) ab u 9,2 mit Portal, Monoforen, Balkonfenster |
| `schiff` | 11,2 ≤ u < 47,2, \|w − 15,5\| < 8 | Tonne, Boden Schachbrett |
| `arkade` | \|w − 15,5\| 8..10 | Pfeilerwand mit Rundbögen (Joch 12), darüber Obergaden |
| `kapelle` | \|w − 15,5\| ≥ 10, u < 47,2 | drei Kapellen je Seite, Trennwand 2 dick |
| `vierung`, `arm` | 47,2 ≤ u < 64,1 | Vierung mit Kuppel, zwei Querarme |
| `endwand` | 64,1 ≤ u < 66,1 | Wand mit Triumphbogen |
| `chor` | u ≥ 66,1 | Cappella maggiore, Segelgewölbe |
| `campanile` | Maske w119180019 | Torre dei Fifanti |

Außenwände d8 ≤ 2 der Hauptmaske (nach Abzug des Korridors). Der **Portikus** (u 0..9,2) ist nicht Teil der Kirchenmaske, sondern des Korridors (siehe §4).

## 1. Module

| Modul | Titel | Bauteile |
|---|---|---|
| 0 | Fundament und Boden | `fundament`, `boden` |
| 1 | Fassade und Außenwände | `fassade`, `aussenwaende`, `fenster` |
| 2 | Pfeilerwände und Bögen | `arkaden`, `kapellenwaende`, `triumphbogen` |
| 3 | Gewölbe und Dächer | `gewoelbe`, `daecher`, `schildwaende` |
| 4 | Campanile | `campanile_treppe`, `campanile_schaft`, `glockenstube`, `glocken`, `glockenjoch`, `campanile_spitze`, `campanile_licht` |
| 5 | Licht | `licht` |
| 6 | Ausstattung | `capponi_kreuzabnahme`, `capponi_verkuendigung`, `capponi_altar`, `canigiani_fresken`, `ciseri_makkabaeer`, `tosini_begegnung`, `franceschini_himmelfahrt`, `hochaltar_cigoli`, `chorgewoelbe_fresko`, `palco_medici` |

Reihenfolge: Rohbau (Module 0 bis 4), dann Licht, dann Ausstattung; die Ausstattung ersetzt Zellen der inneren Wandlage (Farbfelder) oder setzt Neues in freie Zellen (Altäre, Loge).

## 2. Begehbarkeit
- **Zugang:** Hauptportal (Rundbogen 8 breit, Scheitel Lage 12) in der Fassade, als `tor` deklariert; davor der Portikus (Pitti), sein Pflaster liegt auf Y 66. Es gibt keine weiteren Türen ins Freie (Hang hinter der Kirche).
- **Räume:** Schiff, sechs Kapellen (Rundbogen von 9 Blöcken je Joch), Vierung, beide Querarme, Cappella maggiore sind eine Raumgruppe. Der Turm ist über eine Tür 3 × 4 im Chor erreichbar.
- **Treppen:** Campanile mit Wendeltreppe 5 × 5 aus Treppenblöcken (`tools/wahrzeichen/campanile.js`), Kopffreiheit 3 auch über den Podesten, bis zum Boden der Glockenstube; kein Aufstieg zur Palco-Loge (siehe unten).
- **Bewusst unzugänglich** (deklariert): Dachräume über den Gewölben und Decken (`daecher`), die **Loge der Medici** (Zugang nur vom Corridoio Vasariano, dem Projekt Palazzo Pitti), Turmspitze und Hohlraum über der Glockenstube, Oberseite des Glockenjochs.
- **Licht:** Seelaternen im Boden im Raster 12, im Turm alle 8 Lagen in der inneren Mauerschale.
- **Dichtheit:** Fenster verglast, Dächer mit Schildwänden, R14 0 Lücken.

## 3. Ausgestaltete Innenräume
**Quellen:** it.wikipedia „Chiesa di Santa Felicita (Firenze)“, en.wikipedia „Santa Felicita, Florence“, it.wikipedia „Torre dei Fifanti“. Alle Bilder sind **Farbfelder** (Goldrahmen, mindestens drei Farben) in der inneren Wandlage, Unterkante Y 69. Jeder Content-Eintrag nennt Quelle, Stufe und „Vereinfacht, nicht nach Vorbild“.

| Bauteil | Ort im Modell | Quelle, Stufe |
|---|---|---|
| `capponi_kreuzabnahme` | Altarwand der ersten Kapelle rechts (u 11,8..20,6, Wandebene w 30,5), 9 × 9 | Pontormo, Kreuzabnahme 1525 bis 1528: „sulla destra vicino all’ingresso“ (A für Werk, B für Ort) |
| `capponi_verkuendigung` | Eingangswand derselben Kapelle (u 10,6, w 26..32), zwei Felder 3 × 7 | Pontormo, Verkündigung, „accanto“ (B) |
| `capponi_altar` | Mensa vor der Kreuzabnahme, 6 × 1 × 3 | Lage abgeleitet (C) |
| `canigiani_fresken` | Altarwand der ersten Kapelle links (w 0,5), 8 breit | Poccetti 1589 bis 1590, gegenüber der Capponi-Kapelle (A/B) |
| `ciseri_makkabaeer` | dritte Kapelle rechts, 8 × 8 | Ciseri, Martyrium der Makkabäer 1863 (A) |
| `tosini_begegnung` | Ende des rechten Querarms (w 29,3) | Tosini (A/B) |
| `franceschini_himmelfahrt` | Ende des linken Querarms (w 0,5) | Franceschini 1677 (A/B) |
| `hochaltar_cigoli` | Ostwand der Cappella maggiore, Altarbild 8 × 7 und Altartisch | Cigoli (Kapelle), Brina zugeschrieben (Altarbild 1587) (A/B) |
| `chorgewoelbe_fresko` | Segelgewölbe, Felder in Hellblau, Blau, Gelb, Orange | Cinganelli um 1620 (A/B) |
| `palco_medici` | Eingangswand: Plattform u 11,2..14,2 × |w − 16,3| ≤ 6,5 (13 breit)\|w − 16,3\| ≤ 6,5, Boden Lage 12, Brüstung, Konsolen | „palco del Granduca“ über den Kapellen Canigiani und Barbadori-Capponi (A); Balkonfenster 13 × 5 (Y 80 bis 84) in Kirche **und** Korridor verglast |

**Nicht modelliert:** Pontormos Tondi der Evangelisten in den Pendentifs der Cappella Capponi, die Sakristei (Canigiani 1473, Lage im Umriss nicht erkennbar), der Kapitelsaal mit Gerini-Fresken von 1387 (liegt außerhalb des OSM-Umrisses), die Säule von Santa Felicita auf der Piazza.

## 4. Schnittstelle zum Corridoio Vasariano (Palazzo Pitti, Modul 9)
- Maske der Kirche = Umriss abzüglich der Pitti-Maske (`hauptGrenzen.abzugProjekte: ["palazzo_pitti"]`, `abzugAlle`): 277 Zellen entfallen.
- Historisch läuft der Gang über dem **offenen Portikus** (Vasari 1564/65, drei Rundbogenjoche auf quadratischen Pfeilern). `m9_korridor.js` spart deshalb die drei Joche unter dem Gang aus (Luft von Y 67 bis zum Bogenscheitel als `arkade` deklariert, Pflaster aus Pietra serena auf Y 66, Pfeiler 3 breit, Bogenzwickel massiv bis Y 76). Gang, Gangboden (Y 77..78) und Wände bleiben unverändert.
- Das **Balkonfenster** (13 × 5, Y 80 bis 84) liegt in der Gangwand zum Schiff (Pitti) und in der Fassadenwand (Santa Felicita), beide mit Glas gefüllt; dahinter liegt die Loge.
- Die Geometrie (Rahmen SF, Joche, Fenster) steht nur in `projects/santa_felicita/model/_portikus.js`; Pitti und Kirche lesen sie von dort.
- Wirkung: Pitti hat 1.379.757 Blöcke (vorher 1.381.031), R13 0 Komponenten, R14 0 Lücken.
