# Referenzmaße – Cappella de’ Pazzi und Kreuzgänge von Santa Croce (W6b, Wahrzeichen-Welle 6)

Projekt-ID `cappella_pazzi`. Maßstab 1:2 (**Blöcke = 2 · m**). Stand 16.10.2026.
Stufen: **A** mehrere Quellen, **B** eine Quelle oder OSM gemessen, **C** Schätzung (Proportion, begründet). Entwurf: [`BAUTEIL_KATALOG.md`](BAUTEIL_KATALOG.md).
Quellen (gelesen am 16.10.2026): it.wikipedia „Cappella dei Pazzi“ und „Basilica di Santa Croce (Firenze)“, en.wikipedia „Basilica of Santa Croce, Florence“ und „Crucifix (Cimabue, Santa Croce)“. Die Seiten nennen **fast keine Maße in Metern** (Ausnahmen: Modul 20 Braccia ≈ 11,66 m der Kapelle, Kreuz Cimabues 448 × 390 cm, Kirche 115,43 × 38,23 m); alle Grundrissmaße stammen deshalb aus OSM. Die Seite „Museo dell’Opera di Santa Croce“ (it.wikipedia) war über das Abrufwerkzeug nur bis zum Abschnitt Museo lesbar; die Raumaufteilung des Museums steht darin nicht.

## 1. Rahmen und OSM

| Größe | Wert | Quelle |
|---|---|---|
| Kapelle | Way **w307539790** „Cappella de’ Pazzi“, 1.625 Zellen (nach Abzug einer Zelle, die schon zum Konvent gehört, 1.624) | `data/stadt/gebaeude.json` |
| Konvent | Relation **r10782536** (in OSM ohne Namen), 26.181 Zellen (nach Abzug einer Zelle des Campanile von `santa_croce`: 26.180), **zwei Löcher** | `gebaeude.json` |
| Gesamt | 27.804 Zellen (der Auftrag nennt 27.789: gezählt wurde dort mit anderer Randregel) | gemessen |
| **Rahmen** | derselbe wie `santa_croce`: Ursprung (**873,25 \| 975**), **θ = 28,4°**; u nach Ost-Südost entlang dem Langhaus, w nach Süd-Südwest. Kanten der Kapelle 28° bis 31°, des Konvents 27° bis 30° (mod 90°) | gemessen (`Maske.kanten`) |
| Gelände | Kapelle 61 (alle 1.625 Zellen), Konvent 59 bis 64 (15.427 Zellen auf 61, 3.950 auf 62, 2.594 auf 60), Primo Chiostro davor 61 bis 62 | `ground_stadt.js` |
| **`bodenY`** | **61** (Boden von Kapelle und Konvent bündig mit dem Primo Chiostro; Gelände im Umriss bis Y 60 abgetragen). Der Auftrag schlug 62 vor; 61 ist das Niveau der Mehrheit der Zellen (15.427 von 26.181) und des Hofes vor dem Portikus, so führen alle Portale ohne Stufe hinein | Entwurf |
| Masken | Hauptmaske = Konvent (palazzo.js, Löcher als Höfe, abzüglich `santa_croce`); Zusatzmaske `kapelle` = Cappella de’ Pazzi | `project.json` |
| Vorrang | r10782536, w307539790 → `cappella_pazzi`; aus `quartier_tintori` gelöst (Hausakten gelöscht) | `vorrang.json` |

Abweichung vom Auftrag: Die Kapelle steht als Zusatzmaske `kapelle`, nicht in `gebaeude` der Hauptmaske, weil `palazzo.js` die gesamte Hauptmaske als Konvent baut; die Gebäude der `masken` zählen für den Webindex ebenfalls zum Projekt.

### Nachbarn (gemessen)
- Basilika `santa_croce` (w777563049, Rahmen θ 28,4°, Ursprung (873,25 | 975), bodenY 64): **keine gemeinsame Zelle** (Test); der Campanile w662908308 hatte eine Zelle (1052 | 1136) in der Konventmaske, sie wird über `hauptGrenzen.abzugProjekte: ["santa_croce"]` abgezogen. Ein Durchgang zwischen den Projekten ist nicht gebaut.
- Die Kapelle berührt den Konvent auf 46 Zellen (Süd- und Ostseite) und die Biblioteca Nazionale (w102979687, 144 Kontaktzellen am Konvent). Beide bleiben Häuser.
- Der Streifen **w307539769** (2.998 Zellen, u 0..210 × w 41..56) zwischen Basilika und Primo Chiostro bleibt Haus (nördlicher Umgang des Primo Chiostro, Lage Stufe C).

## 2. Teile und Löcher des Umrisses (im Rahmen, u \| w in Blöcken)

| Teil | Lage und Größe | Deutung | Stufe |
|---|---|---|---|
| Kapelle | Hauptkörper u 135,5..174,5 × w 61,5..98,5 (**39 × 37 Blöcke = 19,5 × 18,5 m**), dazu Scarsella u 175..188 × w 76..86 (13 × 10) | Portikus im Westen, Saal, Scarsella im Osten | B (OSM) |
| Westarm | u −5..10 × w 53..98 (16 × 45 Blöcke = 8 × 22,5 m) | Cenacolo (Refektorium) | Lage C |
| Südwestblock | u −12..78 × w 100..134 | drei Museumshallen | Lage C |
| Loch 1 | u 79..139 × w 170..244 (**60 × 74 Blöcke = 30 × 37 m**, 4.335 Zellen) | **Secondo Chiostro** (1453, quadratischer Plan, Brunnen; hier 30 × 37 m) | Deutung B |
| Loch 0 | u 218..278 × w 113..128 (60 × 15 Blöcke = 30 × 7,5 m, 857 Zellen) | schmaler Innenhof im Ostflügel; Funktion in keiner Quelle genannt | Deutung C |
| Primo Chiostro | **kein Loch**: freie Fläche des Stadtgrunds (P-förmig) zwischen Westarm, Südwestblock, Kapelle und dem Streifen w307539769: Rechteck u 12..135 × w 59..98 plus Quadrat u 81..135 × w 98..131 | seit W7c als Zusatzmaske `primo_chiostro` gebaut (3 Rechtecke im Rahmen, 6.569 Zellen; gemessen: freie Fläche 7.177 Zellen, Arm u 11..135 × w 57..97, Hof u 79..140 × w 98..129) | B (it.wikipedia: P-Plan nach dem Abriss des Inquisitionspalasts; ursprünglich zwei Höfe, ein rechteckiger vor der Kapelle und ein quadratischer) |

Der Zugang zum Konvent führt historisch über das Tor an der Piazza Santa Croce rechts der Fassade in den Primo Chiostro (Auftrag); im Polygon liegt diese Stelle bei u −5..12 × w 44..56, zwischen Westarm und der Basilika. Das Tor selbst ist freie Fläche (Stadtgrund), nicht Teil des Projekts.

## 3. Maße und Befunde

| Maß | Modell | Literatur | Stufe |
|---|---|---|---|
| Bauzeit der Kapelle | Baubeginn 1442; Kuppel und Gewölbe 1459/60 fertig; Portikus 1461 (Inschrift); Ausstattung kurz vor der Pazzi-Verschwörung 1478 | it.wikipedia Cappella dei Pazzi | A |
| Portikus | sechs korinthische Säulen, Mittelbogen in der Attika, Kassetten-Tonnengewölbe mit kleiner Kuppel über dem Bogen, glasierte Terrakotten Luca della Robbias, Tondo des Hl. Andreas über der Tür | it.wikipedia | B |
| Modul | 20 Braccia ≈ 11,66 m = **23 Blöcke**: Breite der Mitte, Höhe der Innenwände, Durchmesser der Kuppel | it.wikipedia | B |
| Flügel und Scarsella | jeder Seitenflügel und die Scarsella ein Fünftel der Würfelseite (≈ 2,33 m, 4,7 Blöcke); im Modell Flügel 5 Blöcke, Scarsella 6 innen (OSM-Breite 10 außen) | it.wikipedia | B / OSM |
| Innenraum | Pietra-serena-Bank rundum, korinthische Pilaster aus Pietra serena, weißer Putz, zwölf Apostel-Medaillons (Luca della Robbia), vier Evangelisten-Tondi in den Pendentifs, Altar ohne Altarbild, Scarsella einige Stufen erhöht, Fenster der Apsis von Baldovinetti, Sternenhimmel (4. Juli 1442) | it.wikipedia | B |
| Kuppel | Schirmkuppel auf Pendentifs, zwölf Segmente mit je einem Okulus im Tambour, dünne erhabene Rippen, Licht aus Laterne und Tambourfenstern; außen niedriger zylindrischer Tambour mit Kegel und leichter Laterne; Datum 11. Oktober 1459 auf dem Tambour | it.wikipedia | B |
| Höhen im Modell | Säulen Lage 13, Gebälk 14..15, Attika bis 21, Würfel bis 23, Tambour 24..28, Schirmkuppel Kämpfer 28, Scheitel 32, Laterne bis 46 (**23 m**) | keine Höhe in den Quellen | C |
| Würfelform | Pendentifs aus der Kugel durch die Würfelecken (Radius 16,3), Kreis mit Radius 11,5 in Lage 23; Schirmkuppel statt Halbkugel (Stich 4 Blöcke) | Proportion „Würfel mit Halbkugel“ it.wikipedia; Stich C | B / C |
| Kreuzgänge | Primo Chiostro (14. Jh.) rechts der Fassade, führt zur Kapelle, nach dem Abriss des Inquisitionspalasts P-förmig, Bandinellis „Gottvater“, Henry Moores „Warrior“; Gräbergalerie an der Nordseite | it.wikipedia, en.wikipedia | B |
| Secondo Chiostro | 1453, quadratischer Plan mit Brunnen, ganz aus Pietra serena, Rundbögen tragen eine Loggia im Obergeschoss, Zwickel mit Graffito und erhabenen Wappen-Rundmedaillons; Brunelleschi zugeschrieben, wahrscheinlicher Bernardo Rossellino; Biblioteca Nazionale oben an der Süd- und Ostseite | it.wikipedia Basilica | B |
| Cenacolo | Taddeo Gaddi, Albero della Vita mit Ultima Cena (1333) an der Westwand; Donatellos San Ludovico di Tolosa (1423/24, vergoldete Bronze); Cimabues Kruzifix (448 × 390 cm, um 1265, Tempera auf Holz, seit der Flut 1966 im Museum); Domenico Veneziano „Hll. Johannes und Franziskus“; Museum seit 2. November 1900 im ehemaligen Refektorium, 1959 neu eröffnet | it.wikipedia, en.wikipedia | A / B |
| Museum | Orcagnas Fragmente (Triumph des Todes, Jüngstes Gericht, Teil der Hölle, 1566 unter Putz, später gefunden), Vasaris Ultima Cena (restauriert, zur 50. Wiederkehr der Flut wieder aufgestellt) | it.wikipedia | B |
| Lage der Räume | Die Quellen nennen Räume, keinen Grundriss: Lage im Gebäude ist **Stufe C** (gewählt nach der Form der OSM-Flügel) | – | C |

## 4. Entwurfswerte (Stufe C)
- Konvent: Erdgeschoss Lage 0..10 (5 m), Obergeschoss 10..19, Walmdach bis 6 Lagen; Arkaden des Secondo Chiostro mit Kämpfer Lage 6, Joch 7 (3,5 m), Umgang 5 tief; Fenster alle 9 Blöcke.
- Kapelle: Portikus innen 9 tief (4,5 m), Front mit sechs Säulen bei w 65,5 / 70,7 / 75,5 / 84,5 / 89,3 / 94,5 (mittleres Joch weiter), Säulen 2 × 2 Blöcke, Höhe 13; Portal der Eingangswand 6 breit, Rechteck 7 hoch mit Rundbogen bis Lage 10; Flügeldecke Lage 13, Dach Lage 17; Würfeldach 24; Scarsella-Öffnung 5 breit.
