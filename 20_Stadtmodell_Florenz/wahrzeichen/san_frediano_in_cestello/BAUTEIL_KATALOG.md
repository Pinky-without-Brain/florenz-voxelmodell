# Bauteilkatalog – San Frediano in Cestello (W6a)

Projekt `san_frediano_in_cestello`, Bauplan `projects/san_frediano_in_cestello/model/_cf.js` (Ausstattung `_cf_ausstattung.js`, gemeinsame Hilfen `tools/wahrzeichen/kirche.js`). Maße: [`REFERENZMASSE.md`](REFERENZMASSE.md). Lagen yr = Y − 58.

## 0. Zonen und Wände
Der Umriss ist im Rahmen `CF` ein Rechteck. Zonen (Stufe C außer Lage der OSM-Teile):

| Zone | u \| w | Inhalt |
|---|---|---|
| Fassade | u < 2,2 | Wand, Portal, Fenster, Giebel |
| Schiff (`mittel`) | u 2,2..45,6, w 11,6..41,8 | Tonnengewölbe Lage 24..31 |
| Kapellenlinien | w 9,6..11,6 und 41,8..43,8 | Wandband mit vier Rundbögen je Seite |
| Kapellen | w < 9,6 / w ≥ 43,8, u 2,2..40,3 | acht Kapellen, Decke Lage 14, Trennwände an den Jochgrenzen |
| Vierung | u 45,6..75,6, w 11,6..41,8 | Pendentif-Ecken (Decke Lage 31), Tambour, Kuppel |
| Querhausarme | u 45,6..75,6, w < 9,6 / ≥ 43,8 | Decke Lage 22; Bögen zur Vierung |
| Presbyterium, Chor | u 75,6..106,6, w 12,6..41,8 | Decke Lage 20..26 |
| Nebenräume | u 79,2..106,6, w < 10,6 und u ≥ 94 w ≥ 43,8 | Decke Lage 11; je eine Tür vom Presbyterium bzw. Chor |
| Campanile | u 82..94, w 41,8..52,8 | Schaft mit Wendeltreppe, Glockenstube |
| Mauermassen | Zwischenräume | massives Mauerwerk |

Außenwand = zwei Zellen vom Rand der Maske (`d8 ≤ 2`).

## 1. Module
| Modul | Titel | Bauteile |
|---|---|---|
| 0 | Fundament und Boden | fundament, boden |
| 1 | Fassade, Wände und Arkaden | fassade, fassade_fenster, seitenwaende, fenster, seitenmassen, arkaden, obergaden, obergaden_fenster, querhausbogen, kapellen_trennwaende |
| 2 | Gewölbe, Kuppel und Dächer | tonnengewoelbe, gewoelbe, tambour, tambour_fenster, kuppel, laterne, schildwaende, dach_langhaus, dach_seiten |
| 3 | Campanile | campanile_treppe, campanile_schaft, glockenstube, glockenjoch, glocken, campanile_spitze, campanile_licht |
| 4 | Licht | licht |
| 5 | Ausstattung | siehe §3 |

## 2. Begehbarkeit
- Portal (`tor`, 9,6 Blöcke breit, bis zum Boden) zur Seite des Arno; Türen 3 × 5 vom Presbyterium in den linken Nebenraum und vom Chor in den rechten.
- Kapellen über Rundbögen (7,5 × 10) erreichbar, Querhausarme über die weiten Bögen, Presbyterium und Chor offen zur Vierung.
- Campanile: Tür 2 × 4 vom Presbyterium in den Turm (Westwand), Wendeltreppe 5 × 5 aus Treppenblöcken bis zur Glockenstube; Bogenöffnungen als `fenster_offen`.
- Dachräume, Hohlräume unter dem Turmhelm und die Oberseite des Glockenjochs sind `unzugaenglich` deklariert.
- Kuppel, Tambour und Laterne sind massiv, kein Hohlraum.

## 3. Ausgestaltete Innenräume
Alle Bilder sind Farbfelder in der Wandlage (Goldrahmen); alles vereinfacht, nicht nach Vorbild.

| Bauteil | Inhalt | Quelle | Stufe |
|---|---|---|---|
| seitenaltaere | acht Kapellenaltäre mit Kniebank | it.wikipedia (Kapellen) | B |
| maddalena_sagrestani | Estasi della Santa, erste Kapelle rechts | it.wikipedia | A |
| maddalena_gewoelbe_bonechi | Gewölbefresko Bonechis | it.wikipedia | A |
| gherardini_nativita, gherardini_gewoelbe | dritte Kapelle rechts: Natività della Vergine, Gewölbefresken | it.wikipedia | A |
| franchi_taufe | zweite Kapelle links: Battesimo di Cristo | it.wikipedia | A |
| bernardo_dandini | dritte Kapelle links: Fresken Dandinis auf den Trennwänden, Holzmadonna | it.wikipedia, en.wikipedia | A |
| anastasio_ciabilli | letzte Kapelle links | it.wikipedia | B |
| curradi_madonna, sellaio_kreuzigung | Querhausbilder rechts und links | it.wikipedia, en.wikipedia | A |
| hochaltar_piamontini | Hochaltar mit Paliotto | it.wikipedia | A |
| orgel_tronci | Orgelprospekt (Aufstellungsort Stufe C) | it.wikipedia | A / C |
| pendentifs_tugenden | Tugenden in den vier Ecken (Bonechi) | it.wikipedia | A |
| kuppelfresko_gabbiani | Gloria der Magdalena in der Kuppel | it.wikipedia, en.wikipedia | A |
| chorgestuehl, kirchenbaenke, nebenraeume | Möbel (eine Lage hoch) | – | C |

## 4. Abweichungen
- **Kuppel als Halbkugel** mit Laterne; die Form der Laterne ist nicht belegt.
- **Campanile**: Existenz belegt (Ferri 1689, en.wikipedia), Lage, Höhe, Glocken (vier) und Helm sind Stufe C.
- **Vier Kapellen je Seite** aus der Nennung der „ultima“ links abgeleitet; Anzahl rechts ungeprüft.
- Die Fassade ist als einfache gegliederte Putzfläche gebaut; keine Quelle beschreibt ihre Gliederung.
- Kein Konvent: OSM begrenzt den Umriss auf die Kirche, die Klosteranlage (Kreuzgänge, Refektorium mit Poccetti) liegt außerhalb und bleibt Quartierhaus bzw. Seminario Maggiore (nicht Teil des Projekts).
- Marmor-Hauptaltar und Chorgestühl sind frei gestaltet, die Quellen nennen kein Gestühl.
