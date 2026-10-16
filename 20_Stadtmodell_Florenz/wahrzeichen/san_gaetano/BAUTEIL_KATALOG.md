# Bauteilkatalog – Santi Michele e Gaetano (W6a)

Projekt `san_gaetano`, Bauplan `projects/san_gaetano/model/_sg.js` (Ausstattung `_sg_ausstattung.js`, gemeinsame Hilfen `tools/wahrzeichen/kirche.js`). Maße: [`REFERENZMASSE.md`](REFERENZMASSE.md). Lagen yr = Y − 64.

## 0. Zonen und Wände
Zonen im Rahmen `SG` (Stufe B für die Umrisslinien, sonst C):

| Zone | u \| w | Inhalt |
|---|---|---|
| Fassade | u < 2,5 | Wand mit drei Portalen, Rosette, Giebel |
| Schiff (`mittel`) | u 2,5..25,5, w 10..21 | Tonnengewölbe Lage 24..30 |
| Wandbänder | w 8..10 und 21..23 | je drei Rundbögen zu den Kapellen |
| Kapellen | w < 8 / w ≥ 23, u 2,5..25,5 | sechs Kapellen, Decke Lage 14, Durchgänge in den Trennwänden |
| Querhaus | u 25,5..50 | Vierung w 10..21; Arme w < 8 und ≥ 23 (südlich bis w −14, nördlich bis 51); Bögen in den Wandbändern |
| Rückwand | u 50..52 | Bogen (17 breit) zum Chor |
| Chor | u 52..76, w 4..27 | quadratisch, Decke Lage 26, Kuppel (Tambour Lage 27..34) |
| Triumphbogenwand | u 76..78 | Bogen (15 breit) zur Apsis |
| Apsis | u 78..99, w 7..24 | Decke Lage 22, kleine Kuppel |
| Sakristei | u 52..76, w 29..43 | Decke Lage 12; Tür vom Chor |
| Nebenraum | u 52..76, w < 2 | Decke Lage 12; Tür vom Chor |
| Campanile | u 76..89, w −8..5 | Schaft mit Wendeltreppe, Glockenstube; Tür zur Südseite |
| Mauermassen | Rest | massives Mauerwerk |

Außenwand = zwei Zellen vom Rand der Maske (`d8 ≤ 2`).

## 1. Module
| Modul | Titel | Bauteile |
|---|---|---|
| 0 | Fundament und Boden | fundament, boden |
| 1 | Fassade, Wände und Arkaden | fassade, fassade_fenster, seitenwaende, fenster, seitenmassen, arkaden, obergaden, obergaden_fenster, querhausbogen, triumphbogen, kapellen_trennwaende |
| 2 | Gewölbe, Kuppeln und Dächer | tonnengewoelbe, gewoelbe, tambour, tambour_fenster, kuppel, kuppel_apsis, laterne, schildwaende, dach_langhaus, dach_seiten |
| 3 | Campanile | campanile_treppe, campanile_schaft, glockenstube, glockenjoch, glocken, campanile_spitze, campanile_licht |
| 4 | Licht | licht |
| 5 | Ausstattung | siehe §3 |

## 2. Begehbarkeit
- Drei Portale (`tor`): mittleres 7 Blöcke breit und 12 hoch zum Schiff, zwei seitliche 4 breit und 9 hoch in die ersten Kapellen; alle bis zum Boden offen. Die Piazza liegt eine Stufe tiefer (Y 63).
- Kapellen über Rundbögen (5 × 8) und Durchgänge (4 × 5) in den Trennwänden erreichbar, Querhausarme über Bögen von 21 Blöcken Breite, Chor und Apsis über die Bögen in Rückwand und Triumphbogenwand; Türen 4 × 6 vom Chor in Sakristei und Nebenraum.
- Campanile: Tür 2 × 4 auf der Südseite ins Freie, Wendeltreppe 5 × 5 aus Treppenblöcken bis zur Glockenstube; Bogenöffnungen als `fenster_offen`.
- Dachräume, Hohlräume unter dem Turmhelm und die Oberseite des Glockenjochs sind `unzugaenglich` deklariert.

## 3. Ausgestaltete Innenräume
Alle Bilder sind Farbfelder in der Wandlage (Goldrahmen); alles vereinfacht, nicht nach Vorbild. Positionen der Kapellen: rechts = Norden (w > 15,5), links = Süden.

| Bauteil | Inhalt | Quelle | Stufe |
|---|---|---|---|
| seitenaltaere | sechs Kapellenaltäre mit Kniebank | it.wikipedia | B |
| rosso_della_robbia | Cappella del Rosso: Madonna della Robbia | it.wikipedia | A |
| mazzei_vignali, mazzei_gewoelbe_colonna | Cappella Mazzei: Vignali, Colonna | it.wikipedia | A |
| martelli_rosselli, martelli_grabmaeler | Cappella Martelli: Rosselli 1640, Grabmäler Janssens | it.wikipedia, en.wikipedia | A |
| tornaquinci_zanobi | Cappella Tornaquinci (San Zanobi) | it.wikipedia | A |
| franceschi_cortona, franceschi_gewoelbe_colonna | Cappella Franceschi: Pietro da Cortona, Gewölbe Colonna | it.wikipedia, en.wikipedia | A |
| ardinghelli_hugford, ardinghelli_lippi | Cappella Ardinghelli: Hugford 1712, Lippi | it.wikipedia | A |
| nativita_rosselli, visitazione_rosselli | rechter Querhausarm: Rosselli 1631 | it.wikipedia | A |
| kreuz_vignali, kreuz_bilivert | linker Querhausarm: Vignali, Bilivert | it.wikipedia | A |
| medici_wappen | Wappen des Kardinals Carlo de’ Medici im Gewölbe der Vierung | it.wikipedia | A |
| hochaltar_silvani, hochaltar_rueckwand | Hochaltar mit Ziborium, Balustrade, bunter Marmorrückwand | it.wikipedia | A |
| chorgestuehl, susini_kruzifix | Gestühl aus Nussholz, Bronzekruzifix | it.wikipedia | A / B |
| pendentifs_galletti, kuppelfresko_galletti | Allegorien und Kuppelfresko im Chor | it.wikipedia | A |
| orgel_tronci | Orgelprospekt an der Gegenfassade | it.wikipedia | A |
| weihwasserbecken | zwei Muschelbecken (Pieratti) | en.wikipedia | B |
| kanzel | Holzkanzel links zwischen zweiter und dritter Kapelle | it.wikipedia | A |
| sakristei_ausstattung | Schränke, Lavabo, Deckenfresko | it.wikipedia | A |
| kirchenbaenke | Bänke im Schiff | – | C |

## 4. Abweichungen
- **Skulpturen der Fassade** (Statuen von Permoser und Andreozzi, Putten von Marcellini, Urnen von Malavisti), die 14 Apostel- und Evangelistenstatuen am Gesims des Schiffs, Büsten und Grabmäler im Querhaus, Bildnis der Serafina Pezzuoli und die Kuppel-Statuen sind nicht dargestellt; die Ausstattung beschränkt sich auf Farbfelder und einfache Blockformen.
- **Hinterer Block** des Umrisses (u 52..102, w −8..43, 24,5 × 25,5 m): die Quellen beschreiben nur Chor, Apsis und Sakristei; die Aufteilung des Blocks (Nebenraum, Mauermassen) ist Stufe C, und die Räume des Theatinerhauses sind nicht belegt und bleiben Mauermasse.
- **Kapellen**: Der Umriss ist am Langhaus nur 31 Blöcke (15,5 m) breit; Schiff (11 Blöcke) und Kapellen (je 8) ergeben sich daraus, die Zahl drei je Seite ist belegt.
- **Campanile**: Lage im Umriss, Höhe und Treppe Stufe C; die fünfte, kleine Glocke hängt im Modell in einer Ecke statt in der Mitte des Gewölbes.
- **Chorkuppel** als Halbkugel mit Laterne; die Laterne ist nicht belegt.
- **Freitreppe** auf der Piazza Antinori (1701) liegt außerhalb des Umrisses und fehlt; die Piazza liegt eine Stufe unter dem Fußboden.
