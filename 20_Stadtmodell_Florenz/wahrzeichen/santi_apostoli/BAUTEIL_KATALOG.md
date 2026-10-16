# Bauteilkatalog – Santi Apostoli (W6a)

Projekt `santi_apostoli`, Bauplan `projects/santi_apostoli/model/_sa.js` (Ausstattung `_sa_ausstattung.js`, gemeinsame Hilfen `tools/wahrzeichen/kirche.js`). Maße: [`REFERENZMASSE.md`](REFERENZMASSE.md). Lagen yr = Y − 59.

## 0. Zonen und Wände
Zonen im Rahmen `SA` (Stufe B für die Umrisslinien, sonst C):

| Zone | u \| w | Inhalt |
|---|---|---|
| Fassade | u < 2,2 | Wand mit Portal (5 × 7) und Lünette, Giebel über dem Mittelschiff |
| Mittelschiff | u 2,2..34,8, w 7,6..13,4 | offenes Holzdach, Traufe Lage 14, First Lage 20 |
| Säulenreihen | w 6,2..7,6 und 13,4..14,8 | je sechs Rundbögen auf Säulen aus grünem Marmor |
| Seitenschiffe | w < 6,2 (links, Norden) und ≥ 14,8 (rechts, Süden) | flache Holzdecke Lage 11, Fenster, Kapellenaltäre |
| Kapelle Süd | u 24,5..35,5, w ≥ 20,8 | Ausbuchtung des Umrisses, Decke Lage 10, Bogen aus dem Seitenschiff |
| Triumphwand | u 34,8..36,8 | Rundbogen (10 breit) zum Chor |
| Chor mit Apsis | u ≥ 36,8 | Putzdecke Lage 15, halbrunder Abschluss aus dem Umriss |

Außenwand = zwei Zellen vom Rand der Maske (`d8 ≤ 2`). Der Chor liegt gegenüber dem Langhaus um etwa 5 Blöcke nach Süden versetzt; die Triumphwand deckt die ganze Breite.

## 1. Module
| Modul | Titel | Bauteile |
|---|---|---|
| 0 | Fundament und Boden | fundament, boden |
| 1 | Fassade, Wände und Säulen | fassade, lunette_taube, seitenwaende, fenster, arkaden, saeulen, kapitelle, triumphbogen |
| 2 | Holzdach, Decken und Dächer | holzdecke, decken, schildwaende, dach |
| 3 | Licht | licht |
| 4 | Ausstattung | siehe §3 |

## 2. Begehbarkeit
- Portal (`tor`, 5 Blöcke breit, 7 hoch, bis zum Boden offen) zur Piazza del Limbo; die Piazza liegt eine Stufe unter dem Fußboden.
- Seitenschiffe über die Rundbögen (3 × 8), Kapelle im Süden über den größeren Bogen, Chor über den Triumphbogen.
- Der Zwischenraum zwischen Decke und Dachhaut ist `unzugaenglich` deklariert.

## 3. Ausgestaltete Innenräume
Alle Bilder sind Farbfelder in der Wandlage (Goldrahmen); alles vereinfacht, nicht nach Vorbild. Rechts = Süden (w > 10,5).

| Bauteil | Inhalt | Quelle | Stufe |
|---|---|---|---|
| seitenaltaere | acht Altäre mit goldenem Aufsatz | it.wikipedia | B |
| martin_gamberucci | erste Kapelle rechts: Almosen des Martin | it.wikipedia | B |
| delbene_roncalli, delbene_grabmal | zweite und dritte Kapelle rechts: Roncalli, Grabmal Piero Del Bene | it.wikipedia | A |
| altoviti_vasari | vierte Kapelle rechts: Vasari, Immacolata | it.wikipedia | A |
| altoviti_ammannati | Grabmal Bindo Altoviti mit der Caritas | it.wikipedia, en.wikipedia | A |
| schiavo_madonna, gabbiani_franz, fei_michael, maso_triptychon | Kapellen links: Kopie nach Schiavo, Gabbiani, Fei, Maso da San Friano | it.wikipedia, en.wikipedia | A / B |
| pazzi_feuersteine | Nische mit den Feuersteinen der Pazzi | it.wikipedia, en.wikipedia | A |
| altoviti_rovezzano | Grabmal Antonio und Oddone Altoviti | it.wikipedia | A |
| chor_altar, polyptychon | moderner Altar, Polyptychon von Jacopo di Cione und Gerini | it.wikipedia | A |
| della_robbia_tabernakel | Tabernakel in glasierter Terrakotta links der Apsis | it.wikipedia | A |
| kenotaph_altoviti | Kenotaph des Antonio Altoviti (Dosio, Caccini) | it.wikipedia | A |
| schiavo_sinopia | Sinopia über dem Portal (Gegenfassade) | it.wikipedia | A |
| weihwasserbecken | Becken von Rovezzano | it.wikipedia | A |
| lunette_taube | Taube in der Lünette des Portals (Modul 1) | it.wikipedia | A |
| kirchenbaenke | Bänke im Mittelschiff | – | C |

## 4. Abweichungen
- **Campanile**: Ein kleiner Glockenturm von Baccio d’Agnolo (16. Jh.) ist in it.wikipedia und en.wikipedia genannt, aber ohne Lage, Maße oder Gestalt; er ist nicht gebaut (keine Erfindung ohne Beleg).
- **Obergadenfenster**, die Kreuz- oder Chorgewölbe und ein Querhaus fehlen: die Quellen nennen keine; der Chor ist flach gedeckt, die Apsis folgt dem Rund des Umrisses ohne Halbkuppel.
- **Anzahl der Joche** (sechs) und die Schiffbreiten sind Stufe C; der Umriss ist nur 20 Blöcke (10 m) breit, deshalb sind Seitenschiffe nur 4 Blöcke breit.
- **Madonna della Neve** (Jacopo di Cione, vorletzte Kapelle rechts) und das Stuckrelief des Paulus gegenüber dem Grabmal Del Bene sind nicht dargestellt; ebenso die Grabplatten im Boden, die Orcagna-Pfingsten (heute in der Accademia) und die Tür zur Sakristei, über der der Kenotaph hängt.
- **Platte an der Fassade** (Gründung 800) fehlt; die Fassade ist als Bruchsteinwand mit Portalrahmen aus Pietra serena gebaut.
