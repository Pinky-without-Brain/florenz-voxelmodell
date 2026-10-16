# Bauteilkatalog – Cappella de’ Pazzi und Kreuzgänge von Santa Croce (W6b)

Maße: [`REFERENZMASSE.md`](REFERENZMASSE.md). Rahmen θ 28,4° (Ursprung 873,25 | 975, wie `santa_croce`), `bodenY` 61, Lagen yr = Y − 61. Zwei Bauplaene: der Konvent über `tools/wahrzeichen/palazzo.js` (`projects/cappella_pazzi/model/_pz.js`, Räume `_raeume.js`, Ausstattung `_ausstattung.js`, Malerei `_malerei.js`) und die Cappella de’ Pazzi als eigener Zellplan `model/_kap.js` (Ausstattung `_kap_ausstattung.js`). Erste Setzung gewinnt; Öffnungen (Portale, Türen, Treppenlöcher) werden vor den Wänden freigehalten.
Kein gemeinsames Werkzeug wurde geändert.

## 1. Module

| Modul | Titel | Bauteile | Lässt aus |
|---|---|---|---|
| 0 | Konvent: Fundament, Boden, Höfe, Treppe | `fundament`, `boden`, `hof`, `treppe` (Wendeltreppe aus Treppenblöcken in Halle C) | Treppenloch |
| 1 | Konvent: Außenwände | `aussenwand` (fünf Portale 6 bis 7 × 10), `fenster`, `kranzgesims` | Portale |
| 2 | Konvent: Secondo Chiostro, Innenwände | `hofarkaden` (mit Wappentondi in den Zwickeln), `hofwaende`, `hoffenster`, `innenwaende`, `trennwaende` (EG) | Türen, Arkaden |
| 3 | Konvent: Böden und Decke | `geschossboeden`, `decke`, `innenwaende_og` | Treppenloch, Türen |
| 4 | Konvent: Dach | `dach` (Walm, massiv) | – |
| 5 | Konvent: Licht | `licht` | – |
| 6 | Konvent: Cenacolo, Museumssäle, Höfe | `cenacolo`, `gaddi_fresko`, `cimabue_kruzifix`, `veneziano_tafel`, `san_ludovico`, `sala_orcagna`, `orcagna_fresken`, `sala_vasari`, `vasari_abendmahl`, `kreuzgang_secondo`, `cortile_ost`, `licht_ausstattung` | Wandzellen werden ersetzt |
| 7 | Kapelle: Portikus und Wände | `kap_fundament`, `kap_boden`, `portikus_saeulen`, `portikus_gebaelk`, `kap_aussenwaende`, `kap_fenster` | Portal, Arkaden, Scarsella-Öffnung |
| 8 | Kapelle: Decken, Kuppel, Dach | `kap_decken`, `portikus_decke`, `scarsella_gewoelbe`, `kap_dach`, `kap_pendentifs`, `kap_wuerfeldach`, `kap_tambour`, `kap_kuppel`, `kap_laterne` | – |
| 9 | Kapelle: Licht und Ausstattung | `kap_licht`, `kap_pilaster`, `kap_apostel`, `kap_evangelisten`, `portikus_tondo`, `kap_altar`, `kap_bank` | Wandzellen werden ersetzt |

| 10 | Primo Chiostro: Hof (W7c) | `chiostro_fundament`, `chiostro_boden` (Rasen, Kieswege, Pflaster der Gänge) | – |
| 11 | Primo Chiostro: Arkaden (W7c) | `chiostro_pfeiler` (achteckig, Lage 1..5, Kapitell Lage 5), `chiostro_bogen` (Rundbögen als `arkade`, Zone darüber bis Lage 10), `chiostro_dach` (Lage 11) | Bogenöffnungen |
| 12 | Primo Chiostro: Ausstattung (W7c) | `chiostro_grabplatten`, `chiostro_zypressen`, `chiostro_statuen`, `chiostro_licht` | Bodenzellen werden ersetzt |

231.846 Blöcke, 13 Module (Konvent 202.287 in Modul 0 bis 6, Kapelle 17.385 in Modul 7 bis 9, Primo Chiostro 12.174 in Modul 10 bis 12, W7c). Vor W7c: 219.672 Blöcke, 10 Module.

## 2. Zonen der Kapelle (Rahmen, u \| w)
`front` (Frontebene des Portikus, u < 138,5, zwei Lagen) · `pseite` (Seitenwände des Portikus) · `portico` (Innenraum, u bis 147) · `portalwand` (u 147..149) · `saal` (u 149..172,5, Mittelquadrat 23 × 23 bei u 149,5..172,5 × w 68,5..91,5, Mitte der Kuppel (161 \| 80), Flügel je 5 breit) · `wand` (Außenwände des Saals) · `ostwand` (u 172,5..175) · `sc` (Scarsella, u ≥ 175, Mitte w 81, innen 6 breit) · `sc_wand`.
Spalten bis zwei Zellen neben dem Mittelquadrat reichen bis Lage 24 (Würfelwände über den Flügeldächern); sonst bleiben an den Ecken des Quadrats Lücken zur Außenluft (R14).

## 3. Begehbarkeit
- **Zugänge Konvent** (6 bis 7 breit, 10 hoch, bis zum Boden offen, `tor`): Cenacolo vom Primo Chiostro (u 9,5 \| w 76), Cenacolo von der Westseite (u −4 \| w 76), Museumshalle B vom Primo Chiostro (u 40 \| w 99), Südtrakt vom Primo Chiostro (u 108 \| w 132,5), Osttrakt (u 138 \| w 115). Die Stellen sind Stufe C (Zugang historisch über das Tor rechts der Fassade in den Primo Chiostro, davor Stadtgrund).
- **Raumfolge Erdgeschoss:** Cenacolo (Westarm) → Tür (4 breit) in der Südwand → Halle A → Tür in der Wand u 22 → Halle B → Tür in der Wand u 52 → Halle C mit Wendeltreppe ins Obergeschoss; Südtrakt und Secondo Chiostro über den Umgang mit Türen alle 14 Blöcke (3 breit, 6 hoch); jedes Geschoss ist eine zusammenhängende Raumgruppe.
- **Zugang Kapelle:** Portikus (neun Blöcke tief, 33 breit) offen zwischen sechs Säulen und dem mittleren Bogen (`arkade`); Portal der Eingangswand 6 breit, Rechteck 7 hoch mit Rundbogen bis Lage 10, bis zum Boden offen; Scarsella-Öffnung 5 breit. Boden Y 61 bündig mit dem Primo Chiostro, keine Stufen. **Kein Durchgang** zur Basilika (`santa_croce`) oder zum Konvent.
- **Unzugänglich (deklariert):** Dachraum des Konvents über der obersten Decke (zwei Komponenten, 10.976 Zellen).
- **Licht:** Konvent: 229 Seelaternen im Boden (höchstens 12 Blöcke); Kapelle: 8 Seelaternen im Boden von Portikus, Saal und Scarsella (Test: jede Stehzelle höchstens 12,5 Blöcke vom nächsten Licht).
- **Kein Aufstieg zur Laterne:** wie beim Dom ist der Aufstieg in die Kuppel nicht modelliert; Raum zwischen Schale und Kegel ist massiv gefüllt.

## 4. Nicht modelliert und Abweichungen
- **Primo Chiostro:** kein Loch des Umrisses, sondern freie Fläche des Stadtgrunds. Seit W7c ist er als Zusatzmaske `primo_chiostro` gebaut (Abschnitt 6); die Kapelle öffnet sich auf diese Fläche (Boden Y 61).
- **Loch 0** (30 × 7,5 m) ist in keiner Quelle benannt: Hof mit Rasen, Weg und zwei Bänken, Stufe C.
- **Unbelegte Trakte** des Konvents (Osttrakt, Südtrakt, Nordost­block, Obergeschoss) bleiben offene Hallen („Konventtrakt“, Stufe C) mit Fenstern; dort steht keine Ausstattung.
- Das **Obergeschoss** am Secondo Chiostro hat statt der Loggia eine Fensterwand zum Hof (Quelle: Rundbögen tragen eine Loggia); die Zwickel haben Wappentondi ohne Graffito.
- **Kapelle:** Schirmkuppel flach (Stich 4 Blöcke, Scheitel Lage 32) statt Halbkugel; Schale massiv bis zum Kegel (keine Doppelschale); Flügel flach gedeckt statt mit Tonnen; Portikusdecke eine ebene Kassettendecke mit kleiner Kuppel (Kugelabschnitt) statt Tonnengewölbe; Scarsella als Tonne ohne erhöhte Stufen; Rippen der Kuppel nur innen als Pietra-serena-Linien; Tambourfenster 3 × 3 farbiges Glas.
- Die genaue Höhe der Kapelle ist Stufe C (23 m bis zur Laternenspitze).
- Kein Verbindungsgang zwischen Kapelle und Konvent und keiner zur Basilika (Vorbild Santa Felicita/Pitti).

## 5. Ausgestaltete Innenräume
Modul 6 (Konvent) und Modul 9 (Kapelle). Alles **vereinfacht, nicht nach Vorbild**; Stufen: A mehrere Quellen, B eine Quelle, C Annahme. Die Lage der Räume im Grundriss ist durchweg Stufe C.

| Bauteil | Titel | Lage im Grundriss | Stufe | Inhalt und Quelle |
|---|---|---|---|---|
| `cenacolo` | Cenacolo (Refektorium) | Westarm, u −5..10 × w 55..97 | Inhalt B | Boden Terrakotta und Pietra serena, lange Tafel unter dem Fresko, Bank an der Ostwand; it.wikipedia Basilica (Museo) |
| `gaddi_fresko` | Albero della Vita und Ultima Cena | Westwand, w 60..96 | Inhalt A | Feld 36 × 9: Kreuzesbaum mit zwölf Medaillons auf Blau, Abendmahl darunter; Gaddi 1333, it.wikipedia |
| `cimabue_kruzifix` | Kruzifix Cimabues | Nordstirnwand | Inhalt A | 8 × 9 Blöcke (448 × 390 cm, um 1265); en.wikipedia Crucifix (Cimabue) |
| `veneziano_tafel` | Tafel Domenico Venezianos | Ostwand, w 84..90 | Inhalt B | Feld 6 × 6; en.wikipedia |
| `san_ludovico` | San Ludovico di Tolosa | Ostseite, (5,5 \| 88) | Inhalt A | Blockfigur aus Gold auf Sockel; Donatello 1423/24, it.wikipedia |
| `sala_orcagna` | Sala degli affreschi staccati | Halle A, u −9..21 × w 101..131 | Inhalt B | Boden, Stellwand mit drei Farbfeldern |
| `orcagna_fresken` | Orcagna-Fresken | Westwand der Halle A | Inhalt B | Trionfo della Morte, Giudizio, Inferno (je 6 × 8); it.wikipedia |
| `sala_vasari` | Sala Vasari | Halle B, u 23..51 × w 101..131 | Inhalt B | Boden, Vitrinenband |
| `vasari_abendmahl` | Ultima Cena (Vasari) | Trennwand u 22, w 106..122 | Inhalt B | Feld 16 × 7; it.wikipedia |
| `kreuzgang_secondo` | Secondo Chiostro, Hof | Loch 1 (u 79..139, w 170..244) | B | Wegekreuz aus Kies, Plattform, Brunnen (Becken, Wasser, Säule); it.wikipedia |
| `cortile_ost` | Innenhof im Ostflügel | Loch 0 | C | Rasen, Weg, zwei Bänke |
| `kap_pilaster` | Pilaster und Gesims | Saalwände | B | Pietra serena, Gesims Lage 12; it.wikipedia |
| `kap_apostel` | Zwölf Apostel-Tondi | Saalwände, Höhe 8 | Inhalt A | Durchmesser 5, blau und weiß; Luca della Robbia, it.wikipedia |
| `kap_evangelisten` | Evangelisten-Tondi | Pendentifs | Inhalt B | vier kleine Rundbilder |
| `portikus_tondo` | Tondo des Hl. Andreas | über dem Portal, Portikusseite | Inhalt A | Durchmesser 5; Luca della Robbia, it.wikipedia |
| `portikus_decke` (Typen) | Della-Robbia-Kuppel und Kassetten | Portikusdecke | Inhalt B | Terrakotta in Blau und Weiß, Kassetten Pietra serena und Putz |
| `scarsella_gewoelbe` (Typen) | Sternenhimmel | Gewölbe der Scarsella | Inhalt B | Blau mit goldenen Sternen; 4. Juli 1442, it.wikipedia |
| `kap_altar` | Altar | Scarsella | Inhalt B | 3 × 2, ein Block hoch; kein Altarbild (it.wikipedia) |
| `kap_bank` | Steinbank | rund um den Saal | Inhalt B | Pietra serena, ein Block hoch; it.wikipedia |

## 6. Primo Chiostro (W7c, Zusatzmaske `primo_chiostro`)
Bauplan `projects/cappella_pazzi/model/_pc.js` (Zellen im Speicher, `tools/wahrzeichen/zellplan.js`), Module 10 bis 12. Die Maske besteht aus drei Rechtecken im Rahmen (`rechtecke`, `gelaendeBis: "boden"`, `abzugHaupt`): Westarm u 12,5..134 × w 58..97,5 (Hof des abgerissenen Inquisitionspalasts), Brücke u 80..134 × w 97,5..100 und quadratischer Hof u 80..139 × w 100..128; zusammen **6.569 Zellen**, alle frei von Gebäuden, Straßen und Plätzen (geprüft gegen die freie Zusammenhangskomponente der Stadtdaten: 7.177 Zellen, drei Rasenflächen w673458416, w673458422, w673458434 und ihre Lücken), ohne gemeinsame Zelle mit Konvent, Kapelle, `santa_croce` und den Häusern des Quartiers `tintori`. Der Boden liegt auf Y 61 (wie die Portale von Konvent und Kapelle, ohne Stufe).

| Bauteil | Inhalt | Stufe |
|---|---|---|
| `chiostro_boden` | Rasen, Wegekreuz aus Kies (2 breit: Längsweg im Arm w 77,75, Querweg im Hof u 109,5), Pflaster in den Gängen | C |
| `chiostro_pfeiler`, `chiostro_bogen`, `chiostro_dach` | Arkadengang entlang der Konventwände, 6 Blöcke tief, an sechs Seiten (Nord und Süd im Arm, West im Arm, West, Süd und Ost im Hof; vor der Kapelle bleibt der Hof offen); Pfeiler alle 8 Blöcke, achteckig (Quadrat 2 × 2 ohne Ecken, Pietra serena, Kapitell `marmor_ornament` auf Lage 5), Rundbögen 5,8 breit (Kämpfer Lage 5, Scheitel Lage 7), Wandzone darüber bis Lage 10, flaches Dach Lage 11. Die ganze Luft der Gänge ist als `arkade` deklariert | Existenz A (trecentesker Kreuzgang mit Portikus und Loggia der Nordseite, it.wikipedia), Form C |
| `chiostro_grabplatten` | Schachbrett aus dunklem Stein und Marmor im Nordgang | A (Grabmäler 1964–86 an die Nordseite verlegt), Muster C |
| `chiostro_zypressen` | zehn Zypressen im Westarm, plusförmig, Lage 1..9, ohne Überhang | A (Zahl), Lage C |
| `chiostro_statuen` | Dio Padre (Bandinelli, 1556; weißer Marmor, sitzend auf Thron) und Krieger (Henry Moore; Bronze) auf Sockeln aus Pietra serena | A (Existenz), Lage und Form C |
| `chiostro_licht` | Seelaternen im Pflaster der Gänge, Raster 9 | C |

**Zugang:** Der Primo Chiostro hat keinen Zugang von der Piazza Santa Croce (das Tor rechts der Fassade liegt im Polygon des Streifens w307539769 und im Konvent); er wird über das bestehende Konventportal des Cenacolo erreicht (Portal Westarm u −4 \| w 76, Cenacolo, Portal u 9,5 \| w 76). Alle fünf Konventportale und die Kapelle öffnen sich auf ihn.

**Abweichungen:** Pfeilerform, Bogenform, Dachform (Pultdach im Original, hier flach) und Maße der Gänge nennt keine Quelle (Stufe C). Die Zypressen umgeben nach der Quelle die Statuen in der Nische rechts der Fassade; ob diese Nische zum Kreuzgang gehört, sagt sie nicht (Lage im Modell Stufe C). Brunnen, Loggetta (gehört zum Secondo Chiostro) und Inschriften der Grabmäler sind nicht gebaut. R13: keine nicht erreichbare Komponente, R14: 0 Lücken, Gesamtprojekt 80,6 % der 56.698 Raumzellen erreichbar.
