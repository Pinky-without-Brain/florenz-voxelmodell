# Bauteilkatalog – Santa Maria Maggiore (W6a)

Projekt `santa_maria_maggiore`, Bauplan `projects/santa_maria_maggiore/model/_mm.js` (Ausstattung `_mm_ausstattung.js`, gemeinsame Hilfen `tools/wahrzeichen/kirche.js`). Maße: [`REFERENZMASSE.md`](REFERENZMASSE.md). Lagen yr = Y − 63.

## 0. Zonen und Wände
Zonen im Rahmen `MM` (Stufe B für die Umrisslinien, sonst C):

| Zone | u \| w | Inhalt |
|---|---|---|
| Fassade | u < 2,2 | Wand mit Hauptportal (7 breit), Südportal (4 breit), Giebel |
| Campanile-Stumpf | u 0..12, w 7..20 | massiv bis Lage 40, Schlitzreihen, Berta |
| Mittelschiff | u 2,2..33, w 20..35 | drei Joche, Kreuzgewölbe Lage 28..36 |
| Pfeilerreihen | w 18..20 und 35..37 | Spitzbogenarkaden (8 × 16), Obergaden mit Fenstern |
| Seitenschiffe | w < 18 (Norden) und ≥ 37 (Süden) | Kreuzgewölbe Lage 15..22, Fenster, Altäre; bis zum flachen Ostabschluss (Kapellen) |
| Presbyterium | u 33..46, w 20..35 | quadratisch, 2 Lagen erhöht, zwei Stufen aus Treppenblöcken |
| Chor | u 46..59,6 | gleiches Gewölbe, Ostfenster, Orgel |

Außenwand = zwei Zellen vom Rand der Maske (`d8 ≤ 2`). Der Nordrand des Umrisses ist schräg (Via dei Cerretani); das nördliche Seitenschiff wird nach Osten breiter.

## 1. Module
| Modul | Titel | Bauteile |
|---|---|---|
| 0 | Fundament, Boden und Podest | fundament, boden, podest, stufen, boden_presbyterium |
| 1 | Fassade und Wände | fassade, seitenwaende, fenster, arkaden, obergaden, obergaden_fenster |
| 2 | Kreuzgewölbe und Dächer | kreuzgewoelbe, schildwaende, dach_seitenschiffe, dach_mittelschiff |
| 3 | Stumpf des Campanile | campanile_stumpf, berta_kopf |
| 4 | Licht | licht |
| 5 | Ausstattung | siehe §3 |

## 2. Begehbarkeit
- Hauptportal (`tor`, 7 Blöcke breit, spitzbogig bis 13) zur Piazza di Santa Maria Maggiore und ein Südportal (4 Blöcke) ins südliche Seitenschiff, beide bis zum Boden offen; ein Nordportal (4 × 6) zur Via dei Cerretani.
- Seitenschiffe über die Arkaden, Presbyterium über zwei Stufen aus Treppenblöcken (Pietra serena, Aufstieg nach Osten) und die Podestplatte; Chor und die flach geschlossenen Seitenkapellen am Ende der Seitenschiffe offen.
- Dachräume über den Gewölben sind `unzugaenglich` deklariert. Der Campanile-Stumpf ist massiv (Inneres unbekannt), kein Hohlraum.

## 3. Ausgestaltete Innenräume
Alle Bilder sind Farbfelder in der Wandlage (Goldrahmen); alles vereinfacht, nicht nach Vorbild. Rechts = Süden (w > 27,5).

| Bauteil | Inhalt | Quelle | Stufe |
|---|---|---|---|
| seitenaltaere | neun Altäre mit Kniebank | it.wikipedia | B |
| panciatichi_pugliani | erste Kapelle rechts: Kommunion der Maria Magdalena | it.wikipedia | A |
| orlandini_santa_rita | zweite Kapelle rechts: Santa Rita | it.wikipedia | A |
| carnesecchi_dandini, carnesecchi_poccetti, carnesecchi_caccini | vierte Kapelle rechts: Dandini, Poccetti, Caccini | it.wikipedia, en.wikipedia | A |
| boni_rosselli | Kapelle Boni (Lage unsicher) | it.wikipedia | B/C |
| carnesecchi_marinari | zweite Kapelle links (1406): Altarbild Marinari | it.wikipedia | A |
| orlandini_volterrano | letzte Kapelle links: Wagen des Elija im Gewölbe | it.wikipedia | A |
| coppo_madonna | Kapelle links vom Chor: Madonna-Relief nach Coppo di Marcovaldo | it.wikipedia, en.wikipedia | A/B |
| brunetto_latini | Grab und Sarkophag in derselben Kapelle | it.wikipedia, en.wikipedia | A/B |
| cantoria | marmorne Cantoria über dem Portal (Brüstung) | it.wikipedia | A |
| hochaltar | neugotischer Steinaltar | it.wikipedia | A |
| cione_fresken | Fresken von Jacopo di Cione im Presbyterium | it.wikipedia | A |
| spinello_fragment | Fragment von Spinello Aretino | en.wikipedia | A |
| orgel_mascioni | Orgel hinter dem Hochaltar | it.wikipedia | A |
| berta_kopf | Kopf der Berta am Campanile-Stumpf (Modul 3) | it.wikipedia, en.wikipedia | A |
| kirchenbaenke | Bänke im Mittelschiff | – | C |

## 4. Abweichungen
- **Campanile**: Nur der Stumpf ist gebaut (die Glockenstube wurde 1630 abgetragen); Lage am Nordende der Fassade, Höhe und das massive Innere sind Stufe C, der Glockengiebel an der Rückseite (Standort der versetzten Glocken) fehlt.
- **Kreuzgang** hinter der Kirche liegt außerhalb des Umrisses und ist nicht Teil des Projekts.
- **Drei Apsidialkapellen**: im Modell enden die beiden Seitenschiffe und das Mittelschiff flach an der Ostwand (die Seitenschiffe als Kapellen, ohne eigene Apsis); das Presbyterium ist zugleich Mittelschiff-Ende, die „Apsis“ ist als flacher Chor gebaut.
- **Madonna der Portallünette** (Kopie nach dem pisanischen Marmorrelief), Seitenbilder der Cappella Orlandini del Beccuto, verlorene Werke (Botticelli, Masolino und Masaccio, Uccello) und die Bildhauerarbeiten der Seitenkapellen sind nicht dargestellt.
- **Zahl der Seitenkapellen** je Seite ist aus der Aufzählung der Quelle abgeleitet; die Reihenfolge links ist unsicher (Stufe C).
