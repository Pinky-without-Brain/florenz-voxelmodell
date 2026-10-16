# Bauteilkatalog – Ognissanti (W5b)

Maße: [`REFERENZMASSE.md`](REFERENZMASSE.md). Rahmen OG (θ −46,9°, Ursprung (−1796 | 184,5)), Lagen yr = Y − 56. Ein Bauplan in `projects/ognissanti/model/_og.js`, Treppen und Turm über `tools/wahrzeichen/treppe.js` und `campanile.js`.

## 0. Zonen und Wände
Die Maske ist der OSM-Umriss w167273908 (7.287 Zellen). Jede Zelle gehört dem Teil (Kürzel k, j, e, n, h, i, b, d, c, l, f, m, g) mit dem nächsten Rechteck des Rahmens OG (Tabelle in REFERENZMASSE §1); die Teile bilden **Räume** (g gehört zu k). Der Campanile ist die Zusatzmaske `campanile` (Rechteck u 59,8..72,8 × w 29,3..44,8), seine Zellen gehören dem Turm.

**Wandzelle** = `dOut ≤ 2` (zwei Zellen vom Außenrand der ganzen Maske) oder `dPart ≤ 1` (eine Zelle von der Grenze zu einem anderen Raum): Außenwände sind zwei Zellen, Innenwände zwischen zwei Räumen je eine Zelle pro Seite (zusammen zwei bis drei im gedrehten Raster). Türen und Bögen sind Rechtecke im Rahmen, aus denen die Wandzellen als Luft herausgenommen werden (`ctx.oeffnung`).

## 1. Module

| Modul | Titel | Bauteile |
|---|---|---|
| 0 | Fundament und Boden | `fundament`, `boden` |
| 1 | Fassade, Wände, Fenster, Bögen | `fassade`, `aussenwaende`, `konvent_waende`, `fenster`, `querhaus_bogen` |
| 2 | Konvent: Treppen und Decken | `konvent_treppen`, `konvent_decken` |
| 3 | Gewölbe und Dächer | `gewoelbe`, `daecher`, `schildwaende` |
| 4 | Campanile | `campanile_treppe`, `campanile_schaft`, `glockenstube`, `glocken`, `glockenjoch`, `campanile_spitze`, `campanile_licht` |
| 5 | Licht | `licht` |
| 6 | Ausstattung der Kirche | `lunette_buglioni`, `seitenaltaere`, `beichtstuhl`, `vespucci_misericordia`, `botticelli_augustinus`, `ghirlandaio_hieronymus`, `giotto_kruzifix`, `saio_reliquiar`, `botticelli_grabplatte`, `hochaltar_ligorio`, `apsis_fresko`, `veit_stoss_kruzifix` |
| 7 | Cenacolo und Konvent | `cenacolo_fresko`, `cenacolo_sinopia`, `romei_fresken` |

Reihenfolge: Rohbau (0 bis 4), Licht, Ausstattung; die Farbfelder ersetzen Zellen der Wandlage oder des Gewölbes (kein zusätzlicher Block).

## 2. Begehbarkeit
- **Zugang:** Portal in der Fassade (Rundbogen 7 breit, 11 hoch) und Tür 3,6 × 7 des Cenacolo-Trakts an der Borgo Ognissanti; beide als `tor` bzw. `tuer` deklariert.
- **Kirche:** Schiff, linkes Querhaus (Bogen 16 breit), Sakristei (Tür 4 × 8), Kapelle des rechten Querhauses (Bogen 11 breit), Chor (zwei Türen 3 × 8 links und rechts vom Hochaltar). Der Turm ist über eine Tür 2 × 4 im Schiff erreichbar.
- **Konvent:** Trakte m, f, c, l, d, b, i und e sind über Türen 3 × 6 miteinander verbunden (m–f–c–l, c–n, h–d, h–b, h–i, i–n). Im Trakt m trennt eine Wand mit Durchgang 4 × 7 den Cenacolo-Saal vom Treppenraum. Vier Trakte (m, f, c, d) haben ein Obergeschoss, erreichbar über je eine **Wendeltreppe 5 × 5** aus Treppenblöcken mit Kopffreiheit 3; die Trakte l, b, i und e bleiben einstöckig.
- **Campanile:** Wendeltreppe bis zum Boden der Glockenstube; Joch, Glockenstube und Pyramidendach nach `campanile.js`.
- **Bewusst unzugänglich** (deklariert): Dachräume über Gewölben und Decken, Hohlraum unter dem Turmhelm, Oberseite des Glockenjochs.
- **Licht:** Seelaternen im Boden im Raster 12 (Erd- und Obergeschoss), im Turm alle 8 Lagen in der inneren Mauerschale.

## 3. Ausgestaltete Innenräume
**Quellen:** it.wikipedia „Chiesa di Ognissanti (Firenze)“, en.wikipedia „Ognissanti, Florence“, it.wikipedia „Cenacolo di Ognissanti“. Alle Bilder sind **Farbfelder** (Goldrahmen, mindestens drei Farben) in der Wandlage; jeder Content-Eintrag nennt Quelle, Stufe und „Vereinfacht, nicht nach Vorbild“.

| Bauteil | Ort im Modell | Quelle, Stufe |
|---|---|---|
| `lunette_buglioni` | Fassade, Halbkreis 10 breit über dem Portal (Lage 13..17) | Buglioni, Krönung der Jungfrau (A) |
| `seitenaltaere` | zwölf Altäre 5 × 2 × 3 an den Schiffswänden, Mittenabstand 7,2 | sechs je Seite (A), Maße C |
| `vespucci_misericordia` | rechte Schiffswand am zweiten Altar (u 8..17), Feld 9 × 10 | Ghirlandaio, Misericordia, um 1472 (A) |
| `botticelli_augustinus`, `beichtstuhl` | rechte Schiffswand u 20..28, nach dem dritten Altar, Feld 6 × 5 über niedrigem Beichtstuhl | Botticelli, um 1480 (A) |
| `ghirlandaio_hieronymus` | linke Schiffswand gegenüber, Feld 6 × 5 | Ghirlandaio 1480 (A) |
| `giotto_kruzifix` | Stirnwand des linken Querhauses (u 54..62), Feld 7 × 10 | Giotto, um 1310 (A) |
| `saio_reliquiar` | Vitrine im linken Querhaus (u 64..67) | Gewand des hl. Franziskus 1571 bis 2000 hier (A, historisch) |
| `botticelli_grabplatte` | Boden der Kapelle des rechten Querhauses, Scheibe Ø 5 | rundes Stein-Grab (A) |
| `hochaltar_ligorio` | vor der Chorwand (u 82..85), Altartisch mit Aufbau | Ligorio, Pietra dura (A) |
| `apsis_fresko` | Gewölbe über dem Presbyterium, Oval | „sotto in su“, 1770 (A) |
| `veit_stoss_kruzifix` | Wand über der Sakristeitür (u 76..80), 3 × 5 | Veit Stoß (A) |
| `cenacolo_fresko` | Langwand des Cenacolo-Saals zur Kirche (u 14..30), **16 × 8** Blöcke | Ghirlandaio 1480, 400 × 810 cm (A) |
| `cenacolo_sinopia` | Trennwand des Saals, 6 × 4 | Sinopia an der linken Wand (A) |
| `romei_fresken` | Saalwand neben dem Cenacolo, zwei Felder 4 × 4 | Romei, 17. Jh. (A) |

**Nicht modelliert:** die Kreuzgänge (der Umriss hat keine Löcher), die Fresken des Chiostro Grande, Giottos Maestà (Uffizi), die Taufkapelle und weitere Kapellen und Gräber, das Sakristei-Innere.

## 4. Abweichungen
- Widerspruch it.wikipedia „95 × 14 m“ gegen OSM (Schiff 43 m): OSM maßgeblich, Länge nicht übernommen.
- Lünette: Buglioni statt Della Robbia (en.wikipedia und it.wikipedia).
- Campanile: en.wikipedia „links der Fassade“, OSM-Teil beim Eintreten rechts; OSM maßgeblich. Turmmaske um einen Block je Seite aufgeweitet (Wendeltreppe 5 × 5, Raster-Drehung 47°).
- Die Zuordnung der OSM-Teile zu Raumfunktionen (Querhaus, Sakristei, Kapelle, Chor, Konvent) ist Stufe C; die Kirche ist in den Quellen als einschiffig mit tiefem Querhaus beschrieben, der Umriss zeigt aber nur im Nordwesten einen ausladenden Anbau.
