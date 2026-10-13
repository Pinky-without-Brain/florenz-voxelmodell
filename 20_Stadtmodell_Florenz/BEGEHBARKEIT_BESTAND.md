# Begehbarkeit und Dichtheit: Bestandsaufnahme (B0, Stand 13.10.2026)

Grundlage: `20_Stadtmodell_Florenz/BEGEHBARKEIT.md` (Standard) und die neuen Prüfregeln R13 (Begehbarkeit) und R14 (Dichtheit) aus `tools/validate/`. Die Zahlen stammen aus `node tools/diag/begehbarkeit_bestand.js` (baut jedes Projekt ohne Emit, führt R13/R14 aus und sucht zusätzlich Diagonalrisse). Nichts wurde repariert; die Folge-Pakete rüsten nach. Alle Projekte stehen in `project.json` noch ohne `"begehbarkeit": "pflicht"`, R13/R14 laufen deshalb als Warnungen.

Maschinenlesbare Einzelheiten: `build/report_<id>.json` (Feld `begehbarkeit`), `BEGEHBARKEIT_BESTAND_RISSE.csv` (alle Diagonalrisse der Wahrzeichen: Projekt, Bauteil, Zelle, Y-Bereich, lokale Koordinaten u/w) und `BEGEHBARKEIT_BESTAND_LECKS.csv` (alle Lücken der Hülle nach R14 mit Bauteil, Ausdehnung, Beispielzelle).

## 1. Wie gemessen wurde

- **Stehbare Zelle:** Luft an y, y+1, y+2 und fester Block an y−1. Treppenblöcke zählen als fester Untergrund. Wasser trägt nicht.
- **Schritte (4er-Nachbarschaft):** gleiche Höhe; +1 mit Sprung (Luft an y+3 der Startzelle) oder frei auf einen Treppenblock (nicht von dessen hoher Seite); −1 bis −3 (Fallen).
- **Start:** stehbare Zellen außerhalb des Gebäudes auf Geländeniveau (`groundTopY + 1`) sowie alle stehbaren Zellen im 1 Zelle breiten Außenring der Rasterbox (Rand 3 Zellen um das Projekt).
- **Innenzellen** = stehbare Zellen in Gebäudesäulen **mit festem Block darüber** (Raum). Unüberdeckte stehbare Zellen (Dachflächen, Terrassen, Wehrgänge) werden getrennt gezählt und sind in R13 kein Fehler. Als Gebäudesäulen gelten: bei Wahrzeichen mit Maskenfeldern die Maske samt Höfen, bei Quartierhäusern der Grundriss des Hauses (`ctx.grundriss`, Metadaten aus `quartier.js`), sonst (Dom) Säulen mit festen Zellen mindestens 4 über dem Gelände.
- **Nicht erreichbare Komponente:** Zusammenhang der nicht erreichten Raumzellen (4er-Nachbarschaft, Höhenunterschied ≤ 3) ab 20 Zellen; ab 50 % deklarierte `unzugaenglich`-Zellen entfällt der Fehler (bisher deklariert kein Projekt etwas).
- **R14 Dichtheit:** Luftflut von außen (Luft außerhalb der Gebäudesäulen oder oberhalb der höchsten festen Zelle der Säule) in die Innenluft, durch deklarierte Öffnungen gesperrt (`ctx.oeffnung`; bisher deklariert kein Projekt etwas, also zählen auch Türen, Tore und offene Loggien als Lücken). Eingedrungen wird in der **18er-Nachbarschaft** (Flächen- und Kantennachbarn): Eine Wand, die nur über Kanten zusammenhängt, ist undicht. Eine Lücke ist ein 26er-Zusammenhang von Eintrittszellen; **diagonal** heißt, dass die Lücke nur in der 18er-, nicht in der 6er-Flutung durchlässt (reine Kantenritze).
- **Diagonalrisse** (zusätzlich, nur für diese Aufnahme): feste Zellen A = (x, y, z) und B = (x+1, y, z±1), deren beide gemeinsame Nachbarzellen leer sind. Eine Rissspalte ist dasselbe Paar über aufeinanderfolgende y.
- Offene Fenster ohne Glas, Türen und Arkaden erscheinen in R14 als Lücken, solange sie nicht deklariert sind. Die Klasse in der CSV („Öffnung“ oder „Spalt oder Loch“) ist eine Heuristik aus der Form der Lücke.

## 2. Übersicht

| Projekt | Blöcke | Raumzellen | erreichbar | nicht erreichbare Komponenten (≥ 20) | R14-Lücken (Löcher / diagonal) | Diagonalrisse (Bauteile / Spalten) |
| :--- | ---: | ---: | ---: | ---: | ---: | ---: |
| `duomo` | 909.019 | 79.624 | 1,6 % | 324 | 119 (119 / 0) | 28 / 534 |
| `domplatz_ring` | 1.803.412 | 217.394 | 53,8 % | 83 | nicht geprüft (Quartier) | 176 / 4933 |
| `loggia_dei_lanzi` | 28.139 | 2.837 | 43,8 % | 3 | 52 (52 / 0) | 3 / 32 |
| `orsanmichele` | 80.967 | 10.867 | 3,3 % | 17 | 101 (99 / 2) | 10 / 105 |
| `palazzo_vecchio` | 564.011 | 76.282 | 22,3 % | 26 | 380 (377 / 3) | 17 / 70 |
| `uffizi` | 679.479 | 130.691 | 21,2 % | 15 | 843 (819 / 24) | 21 / 465 |

Laufzeit der Prüfung je Projekt: Dom 6 s, Domplatz-Ring 14 s (202 Häuser einzeln), Palazzo Vecchio 3 s, Uffizien 6 s, Loggia und Orsanmichele unter 1 s.

**Hauptbefunde über alle Projekte:**

1. **Zugang fehlt:** Dom, Uffizien und Orsanmichele sind von außen nicht betretbar, Palazzo Vecchio und Loggia nur im offenen Erdgeschoss, bei 53 von 202 Quartierhäusern fehlt der Zugang ganz. Türen fehlen oder sind geschlossen (Uffizien: Holzschicht), Sockel und Plätze haben keine Freitreppe.
2. **Obergeschosse sind nicht erreichbar** (Palazzo Vecchio: alle; Orsanmichele: alle). Die vorhandenen Treppen sind Vollblock-Stufen (Uffizien `7/treppen`, Dom `7/treppe_*`), noch keine Treppenblöcke; die Quartierhäuser haben keine Geschosse mit Treppen.
3. **Dicht ist nirgends:** Die Hülle hat Fensteröffnungen ohne Glas, Arkaden, Portale und echte Spalten (Tabellen unten).
4. **Diagonalrisse** gibt es in allen gedrehten Rahmen. Ursache siehe Abschnitt 4.

## 3. Dom (`duomo`, 909.019 Blöcke, Rahmen nicht gedreht)

Erreichbar: 1,6 % (1.289 von 79.624 Raumzellen). Das Langhaus ist **nicht betretbar**.

Die Westfassade hat einen massiven Sockel (`2/sockel`, Y 65 bis 72 über die ganze Breite), die Portale (`2/portalzone`) beginnen erst bei Y 73. Es gibt keine Treppe vom Platz zu den Portalen. Alle Böden von Langhaus, Vierung, Tribünen, Baptisterium und Campanile liegen auf Y 65 und sind damit abgeschnitten. Die größten Komponenten:

| Nr. | Zellen | Lage | Boden (Bauteil, Stichprobe) |
| ---: | ---: | :--- | :--- |
| 1 | 23.830 | x -212..90, y 65..67, z -90..90 | `0/boden_langhaus` (147), `0/boden_vierung` (97), `0/boden_tribune_ost` (20) |
| 2 | 5.218 | x -212..-55, y 133..150, z -17..17 | `1/mittelschiff_gewoelbe` (307) |
| 3 | 2.701 | x -212..-47, y 105..111, z -38..-22 | `1/seitenschiff_gewoelbe` (299), `3/eckbauten` (2) |
| 4 | 2.701 | x -212..-47, y 105..111, z 22..38 | `1/seitenschiff_gewoelbe` (299), `3/eckbauten` (2) |
| 5 | 2.368 | x -344..-279, y 65..65, z -28..28 | `0/boden_baptisterium` (339) |
| 6 | 1.668 | x -52..52, y 138..142, z -52..52 | `3/vierung_wand` (334) |
| 7 | 1.668 | x -52..52, y 151..151, z -52..52 | `4/tambour_ring` (334) |
| 8 | 1.647 | x -200..-142, y 58..60, z -17..17 | `9/krypta_boden` (293), `9/krypta_mauern` (34), `9/brunelleschi_grab` (3) |
| 9 | 1.582 | x -204..-136, y 57..57, z -27..27 | `0/krypta_grube` (317) |
| 10 | 976 | x -331..-283, y 109..118, z -24..24 | `8/innenkuppel` (326) |
| 11 | 956 | x -338..-276, y 90..90, z -31..31 | `8/sockel_und_untergeschoss` (319) |
| 12 | 956 | x -338..-276, y 102..106, z -31..31 | `8/obergeschoss` (319) |
| … | | 312 weitere Komponenten ab 20 Zellen, dazu 599 kleinere | |

Mehrere dieser Komponenten sind **Räume über den Gewölben** (Mittelschiff-, Seitenschiff-, Tribünengewölbe, Tambourring, Innenkuppel) und kommen als `unzugaenglich` mit Begründung („Dachraum ohne Bedeutung“) oder als Gangnetz mit Treppe in Frage. Die Krypta (`9/krypta_boden`, `0/krypta_grube`) hat keinen Abgang.

Hülle: 119 Lücken, alle echte Löcher, keine reine Diagonalritze. Der Dom hat keine Maske; als Gebäudesäulen gelten Säulen mit festen Zellen ab Gelände + 4. Dachvorsprünge und Kranzgesimse können dadurch einzelne Lücken vortäuschen, die Zahlen sind für den Dom nur ein Anhalt. Die größten:

| Bauteil | Lücken | davon nur diagonal | Zellen | größte Lücke | Beispielzellen |
| :--- | ---: | ---: | ---: | ---: | :--- |
| `7/bruestung_und_fialen` | 52 | 0 | 112 | 4 | (-215,227,52) (-215,227,78) |
| `2/nischenzone` | 12 | 0 | 144 | 12 | (-216,104,-38) (-216,104,-33) |
| `7/kranz_konsolenfries` | 8 | 0 | 8 | 1 | (-215,223,53) (-215,223,77) |
| `3/tribune_nord_mauern` | 5 | 0 | 285 | 75 | (-27,78,-84) (25,78,-86) |
| `3/tribune_sued_mauern` | 5 | 0 | 285 | 75 | (-27,78,84) (25,78,85) |
| `3/tribune_ost_mauern` | 5 | 0 | 285 | 75 | (84,78,-27) (84,78,26) |
| `3/tribune_nord_obergaden` | 5 | 0 | 221 | 55 | (-19,116,-75) (15,116,-78) |
| `3/tribune_sued_obergaden` | 5 | 0 | 221 | 55 | (-19,116,74) (15,116,78) |
| `3/tribune_ost_obergaden` | 5 | 0 | 221 | 55 | (74,116,-19) (74,116,19) |
| `2/portalzone` | 3 | 0 | 522 | 262 | (-216,73,-6) (-216,73,-33) |
| … | 14 | | | | 12 weitere Bauteile, siehe CSV |

Auffällig: `3/tribune_{nord,sued,ost}_mauern` und `_obergaden` haben je 5 Lücken (Fenster ohne Glas und Türen zwischen Tribünen und Querhaus), `2/portalzone` 3 große Öffnungen (die Portale), `7/bruestung_und_fialen` 52 kleine Lücken in der Campanile-Brüstung (Zinnenlücken, gewollt offen).

Diagonalrisse: 28 Bauteile, 534 Rissspalten (der Dom ist nicht gedreht; die Risse stammen aus runden und achteckigen Schalen: Baptisterium, Tribünen, Kuppeln). Größte Bauteile:

| Bauteil | Rissspalten | größte Höhe | Y-Bereich | Lauflänge w (Rahmen) | Abstand der Risse (Median) |
| :--- | ---: | ---: | :--- | :--- | ---: |
| `8/sockel_und_untergeschoss` | 124 | 10 | 67..83 | – | – |
| `8/innenkuppel` | 96 | 1 | 109..122 | – | – |
| `8/obergeschoss` | 52 | 8 | 96..103 | – | – |
| `3/vierung_wand` | 38 | 2 | 95..114 | – | – |
| `8/attika` | 28 | 1 | 109..109 | – | – |
| `3/tribune_ost_gewoelbe` | 22 | 1 | 111..111 | – | – |
| `3/tribune_nord_obergaden` | 21 | 7 | 111..121 | – | – |
| `3/tribune_sued_obergaden` | 21 | 7 | 111..121 | – | – |

## 4. Uffizien (`uffizi`, 679.479 Blöcke, Rahmen 17,4°) – genaue Untersuchung

Erreichbar: 21,2 % (27.769 von 130.691 Raumzellen). Der gesamte Innenraum aller drei Geschosse bildet **eine** Komponente von 82.309 Zellen (Boden: `7/decke_14`, `7/decke_20`, `7/decke_36`); die vier Flügeltreppen (`7/treppen`) verbinden die Geschosse, aber es gibt keinen Zugang von außen: Die Tür der Portikus-Rückwand ist eine Holzschicht (`portikus_rueckwand`, Material `holz`, t = 12) und damit geschlossen. Es gibt keinen offenen Zugang. Weitere 14 Komponenten: der Dachraum unter den Flügeldächern (`7/decke_traufe`, Y 110 bis 119, fünf Teile mit 1.600 bis 4.400 Zellen), die drei Geschosse des Tribuna-Turms (x −189..−163, z 1107..1133; Boden `0/bodenplatte`, `7/decke_20`, `7/decke_36`, je rund 500 Zellen), Reste auf `7/decke_14` und die Tribuna-Kuppel (`6/tribuna_tambour`, `6/tribuna_kuppel`).

| Nr. | Zellen | Lage | Boden (Bauteil, Stichprobe) |
| ---: | ---: | :--- | :--- |
| 1 | 82.309 | x -528..-84, y 66..106, z 900..1212 | `7/decke_20` (94), `7/decke_36` (80), `7/decke_14` (74) |
| 2 | 4.423 | x -189..-112, y 117..119, z 926..1109 | `7/decke_traufe` (316) |
| 3 | 3.279 | x -286..-214, y 117..117, z 995..1175 | `7/decke_traufe` (328) |
| 4 | 3.083 | x -187..-97, y 110..110, z 933..1191 | `7/decke_traufe` (309) |
| 5 | 1.660 | x -327..-261, y 110..110, z 1061..1149 | `7/decke_traufe` (332) |
| 6 | 1.581 | x -214..-173, y 117..119, z 1121..1197 | `7/decke_traufe` (315), `6/tribuna_tambour` (2) |
| 7 | 541 | x -189..-163, y 102..102, z 1107..1133 | `7/decke_36` (490), `7/spinnwand_fluegel` (51) |
| 8 | 496 | x -189..-163, y 66..66, z 1107..1133 | `0/bodenplatte` (496) |
| 9 | 496 | x -189..-163, y 86..86, z 1107..1133 | `7/decke_20` (490), `7/spinnwand_fluegel` (6) |
| 10 | 442 | x -232..-208, y 80..80, z 926..958 | `7/decke_14` (442) |
| … | | 5 weitere Komponenten ab 20 Zellen, dazu 778 kleinere | |

### 4.1 „Im Mittelgang fehlen einige Wände“ – Befund

Die Meldung bestätigt sich. Die Wände entlang der Piazzale-Fronten und der Dachgalerie sind einzellig dünne Schichten im um 17,4° gedrehten Rahmen. Eine einzellige Schicht im gedrehten Raster hängt nur über Kanten zusammen: Eine 4er-verbundene Linie unter dem Winkel θ braucht eine Dicke von mindestens cos θ + sin θ (17,4°: 1,29 Zellen; Loggia 21,5°: 1,33; Palazzo Vecchio 79,8°: 1,17); die Schichten im Modell sind „eine Zelle des gedrehten Rasters“ dick, also 1,0. An den Stufen der Linie (alle 1 / tan 17,4° ≈ 3,2 Zellen) berühren sich zwei Wandzellen nur an einer Kante, und durch die Ritze sieht und leuchtet man hindurch. Dort fehlt in der Wand auf der ganzen Höhe der Schicht ein Stück.

Gesamt: **465 Rissspalten in 21 Bauteilen** (2.296 Zellpaare). Alle Koordinaten stehen in `BEGEHBARKEIT_BESTAND_RISSE.csv` (Zeilen mit Projekt `uffizi`, sortiert nach w). Die Bauteile mit den meisten Rissen:

| Bauteil | Rissspalten | größte Höhe | Y-Bereich | Lauflänge w (Rahmen) | Abstand der Risse (Median) |
| :--- | ---: | ---: | :--- | :--- | ---: |
| `6/dach_fluegel` | 152 | 5 | 110..122 | 0.5 bis 278.5 | 2,5 |
| `3/loggia_verglasung` | 68 | 11 | 102..112 | 17.7 bis 275.7 | 3,2 |
| `1/portikus_rueckwand` | 54 | 13 | 66..78 | 14 bis 274.9 | 5,0 |
| `2/mezzanin_wand` | 36 | 4 | 80..83 | 19.8 bis 275.8 | 7,3 |
| `2/nobile_wand` | 35 | 8 | 89..96 | 19.8 bis 275.1 | 7,3 |
| `6/tribuna_kuppel` | 24 | 3 | 124..126 | 189.5 bis 220 | 1,6 |
| `7/treppen` | 21 | 13 | 66..78 | 15.2 bis 262.6 | 3,2 |
| `6/tribuna_tambour` | 12 | 4 | 114..122 | 190.5 bis 218.9 | 4,2 |
| `1/portikus_pfeiler` | 9 | 7 | 69..75 | 132.1 bis 256.2 | 20,2 |
| `4/durchgang_arno` | 9 | 2 | 80..81 | 280.4 bis 294 | 1,8 |
| `6/tribuna_laterne` | 8 | 9 | 133..141 | 202.5 bis 207.6 | 1,3 |
| `7/decke_traufe` | 8 | 1 | 116..116 | 106.2 bis 136.6 | 3,2 |

- **`3/loggia_verglasung`** (Glaswand der Dachloggia, t = 3, 1 Zelle): 68 Rissspalten, jede 11 Zellen hoch (Y 102 bis 112), im Abstand von **3,2 Zellen in w** – genau die Stufenlänge 1 / tan 17,4°. Die Loggia hat also über ihre ganze Länge (w 18 bis 276, beide Flügel) alle 3 Zellen eine Glaslücke von 1 Zelle Breite. Das ist der auffälligste Fall.
- **`1/portikus_rueckwand`** (Rückwand des Portikus, t 11 bis 14): 54 Spalten bis 13 Zellen hoch (Y 66 bis 78), Abstand 5 Zellen, in den Wandstücken zwischen den Öffnungen.
- **`2/mezzanin_wand`, `2/nobile_wand`** (Fassadenwand t 1 bis 4): 36 und 35 Spalten (Y 80 bis 83 bzw. 89 bis 96, die Wandstücke unter und über den Fensterbändern), Abstand 7 Zellen.
- **`7/treppen`**: 21 Spalten innerhalb der Stufenblöcke (Vollblock-Stufen im Rahmen, Abstand 3,2): die Stufen sind im Raster versetzt, nicht Treppenblöcke.
- **`6/dach_fluegel`** (152 Spalten) und `6/tribuna_*`: Schalen von Dächern und der Tribuna-Kuppel, ebenfalls kantenverbunden.
- `5/rueckseiten_wand` (6), `4/durchgang_arno` (9), `4/serliana` (2), `4/suedbau_waende` (3): einzelne Risse an Ecken und Schrägkanten der Maske.

**Ursache im Code:** Die Schichten entstehen als `t = floor(Abstand) + 1` im Rahmen UF (`projects/uffizi/model/_plan.js`, `_p_fassade.js`): Jede Spalte der Maske bekommt aus ihrem Mittelpunkt im gedrehten Rahmen eine Schicht-Nummer; die Zellmenge einer Nummer ist ein Band der Dicke 1 im gedrehten Raster. In Weltkoordinaten ist das eine Bresenham-Linie, also 8-verbunden. Die Wände mit 2 Zellen (t 1 bis 4 in `nobile_wand` mit Rahmenzellen, Pfeiler) sind davon nur an den einzelligen Stellen betroffen (Glas t = 3, Putzwand t = 12).

**Mittelwand der Flügel (`7/spinnwand_fluegel`):** Sie ist 2 Zellen stark und kommt in der Rissliste nicht vor (flächenverbunden). Sie fehlt dort, wo die Maske schmaler als 28 Zellen ist: West-Flügel w 12 bis 38 und 64 bis 91 (dort steht an der Außenkante u = −26 die Rückseitenwand `5/rueckseiten_wand`), und im Ost-Flügel bei der Tribuna (w 189 bis 192 und 218 bis 221, dort übernehmen die Wände von `6/tribuna_tambour`). Das sind Maskenformen, keine Fehlstellen. Die Türen (3 je Modul, 3 breit, gewollt offen) sind nicht deklariert. Die fehlenden Wände im Gang sind also die Ritzen der einzelligen Schichten (oben).

### 4.2 Lücken der Hülle (R14)

843 Lücken (819 Löcher, 24 nur diagonal). Der Großteil sind **Fensteröffnungen ohne Glas** (Fenster 3 × 3 in der Portikus-Rückwand, Licht 3 × 8 der Piano-nobile-Wand, Mezzanin 3 × 2), die Arkaden des Portikus, die Loggia-Pfeilerstellung und die Lungarno-Arkade des Corridoio. Dazu die echten Ritzen (Abschnitt 4.1). Nach Bauteil:

| Bauteil | Lücken | davon nur diagonal | Zellen | größte Lücke | Beispielzellen |
| :--- | ---: | ---: | ---: | ---: | :--- |
| `5/rueckseiten_wand` | 283 | 0 | 5.626 | 49 | (-145,67,910) (-344,75,1132) |
| `6/dach_fluegel` | 140 | 0 | 419 | 7 | (-289,113,1157) (-284,117,1141) |
| `2/nobile_wand` | 67 | 0 | 4.994 | 569 | (-160,66,959) (-253,86,1171) |
| `2/mezzanin_wand` | 58 | 0 | 427 | 8 | (-253,82,1168) (-251,82,1162) |
| `3/loggia_pfeiler_saeulen` | 52 | 0 | 4.277 | 91 | (-251,102,1162) (-246,102,1146) |
| `4/suedbau_waende` | 36 | 0 | 708 | 45 | (-187,103,1214) (-282,89,1186) |
| `1/portikus_pfeiler` | 35 | 0 | 1.854 | 84 | (-249,66,1156) (-220,69,1159) |
| `8/lungarno_arkade` | 33 | 0 | 6.965 | 590 | (-528,51,1085) (-528,63,1058) |
| `1/portikus_saeulen` | 32 | 0 | 2.406 | 84 | (-251,66,1162) (-246,66,1146) |
| `8/lungarno_korridor` | 27 | 0 | 368 | 149 | (-528,81,1057) (-343,81,1153) |
| `6/tribuna_kuppel` | 24 | 24 | 72 | 3 | (-191,124,1119) (-191,124,1123) |
| `4/verone_arno` | 12 | 0 | 720 | 63 | (-279,103,1186) (-266,103,1190) |
| `5/ostnord_front` | 12 | 0 | 230 | 32 | (-142,89,907) (-134,89,910) |
| `6/tribuna_laterne` | 6 | 0 | 78 | 22 | (-180,135,1119) (-175,133,1122) |
| … | 26 | | | | 10 weitere Bauteile, siehe CSV |

Zu den 24 reinen Diagonalritzen: alle in `6/tribuna_kuppel` (Tribuna-Kuppel, 72 Zellen, Y 124 bis 126) – die Kuppelschale hat Kantenkontakte statt Flächenkontakt (vgl. ARCHITEKTUR §9 „Hohlschalen aus Mengendifferenzen“).

## 5. Palazzo Vecchio (`palazzo_vecchio`, 564.011 Blöcke, Rahmen −79,8°)

Erreichbar: 22,3 % (17.045 von 76.282). Die erreichbaren Zellen liegen im Erdgeschoss. Nicht erreichbar sind **alle Obergeschosse**: Die Deckenplatten `9/decke_eg` (Y 85 bis 88), `9/decke_og1` (Y 102 bis 105), `9/decke_og2` und `9/decke_dach` (Y 118 bis 125) und `9/salone_decke` tragen Räume ohne Treppe.

| Nr. | Zellen | Lage | Boden (Bauteil, Stichprobe) |
| ---: | ---: | :--- | :--- |
| 1 | 8.199 | x -42..96, y 118..120, z 811..965 | `9/decke_og2` (287), `2/og_wand_mittelbauten` (15), `8/dachgeschoss_mittelbauten` (2) |
| 2 | 7.999 | x -40..96, y 85..88, z 811..964 | `9/decke_eg` (259), `2/og_wand_mittelbauten` (16), `6/dogana_pfeiler` (16) |
| 3 | 7.999 | x -40..96, y 102..105, z 811..964 | `9/decke_og1` (287), `2/og_wand_mittelbauten` (16), `6/dogana_obergeschosse` (5) |
| 4 | 6.389 | x -142..-44, y 118..120, z 803..917 | `9/decke_og2` (284), `6/lichthoefe` (7), `2/og2_wand_west` (5) |
| 5 | 4.579 | x -58..3, y 85..85, z 815..924 | `9/decke_eg` (298), `6/dogana_pfeiler` (8) |
| 6 | 4.572 | x -141..-44, y 102..105, z 811..916 | `9/decke_og1` (298), `6/michelozzo_obergeschosse` (4), `2/og_wand_mittelbauten` (2) |
| 7 | 4.534 | x -141..-44, y 85..88, z 811..916 | `9/decke_eg` (271), `6/michelozzo_arkade` (18), `1/eg_wand_mittelbauten` (5) |
| 8 | 4.278 | x -3..86, y 125..125, z 822..955 | `9/decke_dach` (306) |
| 9 | 3.430 | x -52..-3, y 125..125, z 814..925 | `9/salone_decke` (302), `9/salone_waende` (10) |
| 10 | 1.058 | x -123..-84, y 125..125, z 815..871 | `9/decke_dach` (353) |
| … | | 16 weitere Komponenten ab 20 Zellen, dazu 559 kleinere | |

Hülle: 380 Lücken (377 Löcher, 3 diagonal), vor allem Fenster und Arkaden der Mittelbauten:

| Bauteil | Lücken | davon nur diagonal | Zellen | größte Lücke | Beispielzellen |
| :--- | ---: | ---: | ---: | ---: | :--- |
| `2/og_wand_mittelbauten` | 88 | 2 | 2.198 | 35 | (-11,88,945) (-11,105,945) |
| `1/eg_wand_mittelbauten` | 45 | 1 | 921 | 136 | (77,69,876) (-11,75,945) |
| `8/dachgeschoss_mittelbauten` | 42 | 0 | 321 | 9 | (-78,120,914) (-70,120,917) |
| `2/og_wand_nord_sued_a` | 38 | 0 | 840 | 48 | (-140,89,889) (-140,106,889) |
| `6/dogana_obergeschosse` | 26 | 0 | 912 | 48 | (18,88,902) (18,105,902) |
| `6/lichthoefe` | 24 | 0 | 228 | 12 | (-76,77,886) (-76,93,886) |
| `6/michelozzo_obergeschosse` | 20 | 0 | 752 | 40 | (-123,88,871) (-123,105,871) |
| `2/og1_wand_west` | 17 | 0 | 336 | 32 | (-142,89,863) (-144,89,873) |
| `2/og2_wand_west` | 17 | 0 | 294 | 28 | (-142,106,863) (-144,106,873) |
| `6/dogana_pfeiler` | 14 | 0 | 1.598 | 137 | (7,69,894) (26,69,903) |
| … | 49 | | | | 14 weitere Bauteile, siehe CSV |

**Diagonalrisse:** 70 Rissspalten in 17 Bauteilen (316 Zellpaare), deutlich weniger als in den Uffizien, weil −79,8° nahe an einer Achse liegt (cos + sin = 1,17: die Stufen der einzelligen Schichten sind seltener und kleiner). Die Wand- und Dachbauteile mit den meisten Rissen:

| Bauteil | Rissspalten | größte Höhe | Y-Bereich | Lauflänge w (Rahmen) | Abstand der Risse (Median) |
| :--- | ---: | ---: | :--- | :--- | ---: |
| `7/dach_arnolfo` | 12 | 1 | 126..129 | 16 bis 47.7 | 2,0 |
| `2/og_wand_nord_sued_a` | 8 | 8 | 89..112 | 8.9 bis 38.9 | 16,3 |
| `2/og1_wand_west` | 7 | 8 | 89..96 | 0 bis 4.5 | 0,8 |
| `2/og2_wand_west` | 7 | 7 | 106..112 | 0 bis 4.5 | 0,8 |
| `2/og_wand_mittelbauten` | 6 | 7 | 85..116 | 114.7 bis 220.5 | 105,8 |
| `3/ballatoio_boden` | 6 | 1 | 124..124 | -1.6 bis 45 | 12,8 |
| `9/innenwaende_a` | 6 | 8 | 69..112 | 28 bis 48 | 17,3 |
| `5/turm_ballatoio` | 5 | 1 | 228..228 | -3 bis 7.1 | 1,2 |
| `4/schaft_105_144` | 4 | 6 | 180..203 | 3.5 bis 9.6 | 6,1 |
| `5/glockenstube` | 2 | 2 | 226..227 | 3.5 bis 9.6 | 6,1 |

Betroffen sind die einzelligen Innen- und Zwischenwände (`2/og_wand_nord_sued_a`, `2/og1_wand_west`, `2/og2_wand_west`, `9/innenwaende_a`, `2/og_wand_mittelbauten`) bis 8 Zellen hoch, der Arnolfo-Turmschaft (`4/schaft_105_144`, `5/glockenstube`) und das Dach (`7/dach_arnolfo`). Alle Zellen mit Rahmenkoordinaten stehen in der CSV.

## 6. Loggia dei Lanzi (`loggia_dei_lanzi`, 28.139 Blöcke, Rahmen 21,5°)

Erreichbar: 43,8 % (1.244 von 2.837). Die Loggia ist eine offene Halle (Arkaden), der Boden ist von der Piazza aus betretbar. Nicht erreicht sind die Räume über den Kreuzgewölben (`4/kreuzgewoelbe_*`, 1.369 Zellen, Y 86 bis 92, unter dem Dach), ein Absatz auf Y 70 an der Seitenwand (`2/seitenwand_pfeilerverbindung`, 48 Zellen) und Zellen auf dem Sockel der Perseus-Gruppe (`6/sockel_perseus`, 21 Zellen).

| Nr. | Zellen | Lage | Boden (Bauteil, Stichprobe) |
| ---: | ---: | :--- | :--- |
| 1 | 1.369 | x -240..-167, y 86..92, z 855..898 | `4/kreuzgewoelbe_ost` (105), `4/kreuzgewoelbe_west` (105), `4/kreuzgewoelbe_mitte` (102) |
| 2 | 48 | x -173..-166, y 70..70, z 885..899 | `2/seitenwand_pfeilerverbindung` (39), `1/pilaster_rueckwand` (9) |
| 3 | 21 | x -184..-179, y 70..75, z 884..888 | `6/sockel_perseus` (16), `7/perseus` (5) |

Hülle: 52 Lücken. Die Loggia ist **gewollt offen**: Die 4 Frontpfeiler-Zwischenräume (`1/pfeiler_front`, 1.252 Zellen) und die Archivolten (`3/archivolten_front`, 435 Zellen) sind die Arkaden und müssten als `loggia`/`arkade` deklariert werden; die 47 Lücken der Brüstung (`5/brustung`, bis 12 Zellen) sind Balustradenlücken.

**Diagonalrisse:** 32 Rissspalten in 3 Bauteilen. `5/brustung` (26 Spalten, 2 Zellen hoch, Y 97 bis 98, Abstand 2,8 Zellen: die einzellige Balustrade ist kantenverbunden) und `2/rueckwand` / `2/sockel_waende` (je 3 Spalten an einer Stufe bei w ≈ 22,1, Y 68 bis 74, 2 bis 5 Zellen hoch).

| Bauteil | Rissspalten | größte Höhe | Y-Bereich | Lauflänge w (Rahmen) | Abstand der Risse (Median) |
| :--- | ---: | ---: | :--- | :--- | ---: |
| `5/brustung` | 26 | 2 | 97..98 | 0.5 bis 27.5 | 2,8 |
| `2/sockel_waende` | 3 | 2 | 68..69 | 22.1 bis 22.2 | – |
| `2/rueckwand` | 3 | 5 | 70..74 | 22.1 bis 22.2 | – |

## 7. Orsanmichele (`orsanmichele`, 80.967 Blöcke)

Erreichbar: 3,3 % (361 von 10.867). Das Erdgeschoss ist nicht betretbar: Die Arkadenöffnungen (`2/bogenringe`, 14 breit, Y 69 bis 89) sind unten durch eine 2 Zellen hohe Sockelfüllung (`2/fuellwand_sockel`, Y 69 bis 70; Stichprobe an x −298, z 518 bis 521) verschlossen, und der Boden (`0/bodenplatte`, Y 68) liegt über dem Gelände (Y 66 bis 69 am Rand) ohne Stufen. Die drei großen Komponenten sind die Böden der Geschosse darüber (`7/decke_og1`, `6/decke_eg`, `7/decke_og2`) mit dem Treppenturm (`7/treppe`, ohne Zugang) und das Erdgeschoss selbst (1.978 Zellen).

| Nr. | Zellen | Lage | Boden (Bauteil, Stichprobe) |
| ---: | ---: | :--- | :--- |
| 1 | 5.221 | x -336..-267, y 95..120, z 520..563 | `7/decke_og1` (151), `6/decke_eg` (140), `7/treppe` (6) |
| 2 | 1.978 | x -326..-269, y 69..71, z 523..559 | `0/bodenplatte` (320), `Gelände` (9), `2/fuellwand_sockel` (1) |
| 3 | 1.670 | x -324..-272, y 143..143, z 526..557 | `7/decke_og2` (334) |
| 4 | 133 | x -330..-312, y 84..90, z 544..563 | `2/fuellwand_masswerk` (108), `6/kreuzgewoelbe` (25) |
| 5 | 133 | x -284..-266, y 84..90, z 546..563 | `2/fuellwand_masswerk` (108), `6/kreuzgewoelbe` (25) |
| 6 | 129 | x -330..-312, y 84..90, z 520..537 | `2/fuellwand_masswerk` (104), `6/kreuzgewoelbe` (25) |
| 7 | 128 | x -284..-266, y 84..90, z 521..539 | `2/fuellwand_masswerk` (108), `6/kreuzgewoelbe` (20) |
| 8 | 100 | x -312..-303, y 87..90, z 537..546 | `6/kreuzgewoelbe` (100) |
| … | | 9 weitere Komponenten ab 20 Zellen, dazu 169 kleinere | |

Hülle: 101 Lücken (99 Löcher, 2 diagonal): Arkadenfries (38 kleine Öffnungen), Biforien der Obergeschosse (je 18, ohne Glas), Bogenringe und Pfeilerzwischenräume.

| Bauteil | Lücken | davon nur diagonal | Zellen | größte Lücke | Beispielzellen |
| :--- | ---: | ---: | ---: | ---: | :--- |
| `4/arkadenfries` | 38 | 0 | 224 | 8 | (-288,140,565) (-332,140,519) |
| `3/og1_biforien` | 18 | 0 | 360 | 20 | (-332,102,528) (-332,102,531) |
| `4/og2_biforien` | 18 | 0 | 288 | 16 | (-332,127,528) (-332,127,531) |
| `2/bogenringe` | 9 | 0 | 2.410 | 300 | (-305,69,518) (-326,69,565) |
| `1/pfeiler_eck` | 7 | 0 | 126 | 18 | (-332,76,519) (-332,76,560) |
| `8/pontile` | 3 | 2 | 903 | 889 | (-341,67,549) (-334,95,548) |
| `1/pfeiler_lang` | 3 | 0 | 54 | 18 | (-310,76,518) (-310,76,565) |
| `1/tabernakel` | 2 | 0 | 40 | 22 | (-288,76,565) (-330,76,565) |
| … | 3 | | | | 2 weitere Bauteile, siehe CSV |

**Diagonalrisse:** 105 Rissspalten in 10 Bauteilen; die Mehrzahl in `2/fuellwand_masswerk` (45 Spalten, bis 5 Zellen hoch) und `2/bogenringe` (39 Spalten): die gebogenen einzelligen Maßwerk- und Bogenschichten.

| Bauteil | Rissspalten | größte Höhe | Y-Bereich | Lauflänge w (Rahmen) | Abstand der Risse (Median) |
| :--- | ---: | ---: | :--- | :--- | ---: |
| `2/fuellwand_masswerk` | 45 | 5 | 82..89 | -21.7 bis 21.3 | 2,0 |
| `2/bogenringe` | 39 | 2 | 84..89 | -23 bis 22.5 | 2,0 |
| `6/kreuzgewoelbe` | 9 | 2 | 84..88 | -17.5 bis 17.5 | 11,0 |
| `8/pontile` | 4 | 8 | 95..102 | 5.6 bis 8.7 | 2,1 |
| `1/pfeiler_eck` | 2 | 1 | 86..87 | -18.5 bis 17.5 | 36,0 |
| `1/pfeiler_lang` | 2 | 1 | 88..88 | -18.9 bis 18.1 | 37,0 |

## 8. Domplatz-Ring (`domplatz_ring`, Quartier, 202 Häuser, 1.803.412 Blöcke)

Je Haus einzeln geprüft (Grundriss aus der Parzellenregel). Erreichbar: 53,8 % (117.044 von 217.394 Raumzellen). **83 von 202 Häusern** haben mindestens eine nicht erreichbare Komponente ab 20 Zellen, davon 53 Häuser ohne jede erreichbare Zelle (keine Tür vom Platz). Die Häuser haben noch keine Geschossböden, Treppen und Haustüren (BEGEHBARKEIT.md §4: Nachrüstung offen); die Dachräume zählen nicht (unüberdeckte Flächen: 243.635 Zellen, davon 51.240 unerreicht).

Die größten Häuser mit Problemen (Auszug, alle 83 in `build/report_domplatz_ring.json`, Feld `begehbarkeit.haeuser.liste`):

| Haus | Raumzellen | erreichbar | größte unerreichte Komponente (Zellen, Lage) |
| :--- | ---: | ---: | :--- |
| Modul 18, Haus w456578419 | 13.363 | 0 % | 13.289, x 103..253, y 68..71, z -133..26 |
| Modul 7, Haus r7069013 | 9.086 | 0 % | 8.796, x -212..-66, y 67..70, z -301..-188 |
| Modul 4, Haus r4101357 | 5.584 | 0 % | 5.478, x -301..-212, y 67..70, z -365..-228 |
| Modul 1, Haus w112725476 | 4.881 | 0 % | 4.432, x -382..-347, y 68..68, z 222..351 |
| Modul 16, Haus w491889282 | 4.373 | 0 % | 4.347, x 23..117, y 69..69, z 211..285 |
| Modul 2, Haus w491923439 | 2.898 | 0,1 % | 2.752, x -339..-264, y 68..68, z 146..201 |
| Modul 0, Haus r7270591 | 2.790 | 0 % | 2.713, x -448..-377, y 66..66, z -188..-109 |
| Modul 4, Haus w307153247 | 2.622 | 0 % | 2.487, x -333..-274, y 67..70, z -310..-246 |
| Modul 8, Haus r1594403 | 2.522 | 0 % | 2.350, x -177..-112, y 67..67, z 119..168 |
| Modul 18, Haus r6748307 | 1.932 | 0 % | 1.914, x 179..240, y 68..71, z -160..-96 |

R14 gilt nur für Wahrzeichen. Zur Information die Diagonalrisse der Häuser: 4933 Rissspalten in 176 Häusern (9.837 Zellpaare) (die Häuser folgen den schrägen OSM-Grundrissen; die Ursache je Bauteil ist hier nicht untersucht). Das Nachrüst-Paket der Häuser sollte `node tools/diag/begehbarkeit_bestand.js domplatz_ring` als Kontrolle verwenden.

## 9. Empfehlungen für die Nachrüstung

1. **Gedrehte Rahmen:** Alle einzelligen Wandschichten (Glas, Putzwände, Brüstungen, Maßwerkfüllungen, Dächer) auf Dicke ≥ 2 Zellen in Weltkoordinaten bringen oder die Kantenpaare mit `vaults.connectEdges` bzw. einem Abstandsband von mindestens cos θ + sin θ schließen. Die Prüfung ist bereits da: `node tools/diag/begehbarkeit_bestand.js <projekt>` meldet Risse, R14 meldet Diagonallücken der Hülle.
2. **Zugang:** Türen sind Öffnungen (nicht Holzblöcke) mit `ctx.oeffnung(..., 'tuer')`; Sockel und Plätze bekommen Außentreppen (`treppe.geradeTreppe`, Breite ≥ 2). Dom: Freitreppe vor die Portale ab Y 73. Uffizien: Tür in der Portikus-Rückwand (t = 12) öffnen. Palazzo Vecchio und Orsanmichele: Eingangsstufen (Boden Y 68, Gelände in der Maske Y 61 bis 69 bzw. 66 bis 69).
3. **Geschosse:** Decken mit Treppenloch (`treppe.treppenloch(lauf)` von der Decke abziehen) und Treppenblöcke statt Vollblock-Stufen (Uffizien `7/treppen`, Dom `7/treppe_*`).
4. **Dachräume** über Gewölben und unter Dächern mit Begründung als `ctx.unzugaenglich` deklarieren oder erschließen (Dom: Mittelschiff-, Seitenschiff- und Tribünengewölbe, Tambourring; Loggia: Raum über den Kreuzgewölben; Uffizien: `7/decke_traufe`).
5. **Öffnungen deklarieren:** Fenster mit Glas füllen (Rolle `glas_fenster`), Tore, Arkaden und Loggien als `tor`, `arkade`, `loggia`, Zinnen und Schlitze als `scharte` deklarieren; erst danach `"begehbarkeit": "pflicht"` setzen.

## 10. Grenzen dieser Aufnahme

- Der Dom hat keine Maske; seine Säulen-Ersatzregel kann Gesimse und Vorsprünge als „Gebäude“ zählen (R14 meldet dann Eintritte unter Vorsprüngen).
- Die Klassifizierung „Öffnung“ oder „Spalt“ in der Lecks-CSV ist eine Heuristik aus der Form der Lücke.
- Stehbare Flächen ohne Dach darüber (Terrassen, Wehrgänge, Dachflächen) sind nur gezählt, nicht bewertet; sie fehlen in R13, bis die Nachrüstung entscheidet, welche begehbar sein müssen.
- R14 prüft die Luft von außen nach innen innerhalb der Gebäudesäulen; ein Dach mit Loch über einem Raum ist ebenfalls eine Lücke (Säule mit freiem Himmel).
