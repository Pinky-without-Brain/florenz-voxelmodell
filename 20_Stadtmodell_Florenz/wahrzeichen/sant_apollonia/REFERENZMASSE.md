# Referenzmaße – Ex monastero di Sant'Apollonia (Welle 7b)

Projekt-ID `sant_apollonia`. Maßstab 1:2 (**Blöcke = 2 · m**). Stand 16.10.2026. Stufen: **A** belegt (Quelle genannt), **B** Literatur, Arbeitsauftrag oder aus OSM begründet, **C** Entwurf. Bauteile: [`BAUTEIL_KATALOG.md`](BAUTEIL_KATALOG.md). Bauplan: `tools/wahrzeichen/palazzo.js`, Einstellungen `projects/sant_apollonia/model/_sa.js`.

## 1. Rahmen und OSM

| Größe | Wert | Quelle |
|---|---|---|
| OSM-Objekt | Relation **r6818342** „Ex monastero di Sant'Apollonia“, `building=religious`, `historic=building`, Wikidata Q28668281, Wikipedia `it:Complesso di Sant'Apollonia`, ein `building:part` (w661810593 „La Polveriera Spazio Comune“, 2.243 Blöcke²); **17.126 Zellen**, **vier Löcher** (141, 127, 723, 582 Zellen) | `data/stadt/gebaeude.json`, `tools/wahrzeichen/maske.js` |
| Mensa | Way **w1239428647** „Mensa universitaria di Sant'Apollonia“ (`amenity=fast_food`, 3.515 Zellen) liegt **vollständig innerhalb der Konventfläche** (Überlappung 3.515 von 3.515 Zellen, Test), im Hinterblock an der Via Santa Reparata. Es ist **nicht** das Refektorium; die Fläche ist deshalb keine zweite Maske, die ID steht nur in `gebaeude` (und in `vorrang.json`), damit das Haus aus dem Quartier verschwindet. Die Union ändert die Maske nicht. | Maskenschnitt |
| Umriss | U-Form: Vorderblock an der Via XXVII Aprile (117,5 Blöcke, Tiefe 50), Mittelstreifen an der Via San Gallo (u 75..119, w 51..120), Hinterblock (u 0..119, w 120..195) | gemessen an den Polygonkanten |
| **Rahmen `SA`** | Ursprung (−96,5 \| −1252) an der Westecke der Kante zur Via XXVII Aprile, θ = **28,75°**: u entlang dieser Fassade (West → Ost, 0..117), w von ihr ins Gebäude (0..195); die Via San Gallo liegt bei u ≈ 118, die Via Santa Reparata bei u ≈ 0 | Polygonkante 16, A |
| Löcher | Hof 0: u 70,5..80,8 × w 5,5..19,4 (141); Hof 1: u 23..35,8 × w 4,3..14,1 (127); Hof 2: u 45,4..86,7 × w 167..185,1 (723); Hof 3: u 16,4..39,3 × w 152,3..185,3 (582) | gemessen |
| Gelände | 61 (82 Zellen), 62 (369), 63 (798), 64 (1.061), 65 (3.064), **66 (10.429)**, 67 (1.313), 68 (10); in der Maske auf höchstens Y 65 abgetragen | `tools/city/ground_stadt.js` |
| Gelände außen | Via XXVII Aprile 66, Via San Gallo 65 (Kirchenportal: eine Stufe), Via Santa Reparata 64–65 (Mensa: eine Stufe) | Streifen vor den Kanten |
| **`bodenY`** | **66**: Der Eingang des Museums an der Via XXVII Aprile (Cenacolo, Via XXVII Aprile 1) liegt bei Gelände 66, also stufenlos | B |

## 2. Maße (Literatur gegen OSM)

| Maß | Modell | Literatur oder OSM | Bewertung |
|---|---|---|---|
| Höhe bis zur Traufe | 30 Blöcke (15 m) | OSM `hoeheBl` 30 (Standardschätzung, keine Messung) | C |
| Geschosse | EG 18 (hohes Refektorium), Obergeschoss 12 | Summe OSM; das Refektorium braucht Platz für Abendmahl (9 Blöcke) und die drei Szenen darüber | C |
| Gründung | Kloster der Camaldulenserinnen 1339 von Piero di Ser Mino gegründet; 1440/41 Aufnahme der Abtei Santa Maria a Mantignano und des Hospitals San Pietro a Porta Pinti; nach 1440 ließ Äbtissin Cecilia Donati Kreuzgang und Cenacolo erweitern | [it.wikipedia](https://it.wikipedia.org/wiki/Complesso_di_Sant%27Apollonia) | A |
| Geschichte | 1808 aufgehoben, 1824 wiederhergestellt, ab 1863 militärisch genutzt (Gaetano Baccani gestaltete die Nonnenräume um), 1866 Staatsbesitz; Teil des Klosters für die Via XXVII Aprile abgerissen; 1901 Nationaldenkmal | it.wikipedia | A |
| Cenacolo | großer rechteckiger Saal mit Kassettendecke und einer Fensterreihe an der rechten Wand; Abendmahl auf der ganzen Westwand (Castagno, Juni bis Herbst 1447, Fresko 1445–50); darüber, von zwei Fenstern unterbrochen, von links Auferstehung, Kreuzigung, Grablegung; Museum seit 1891, Eingang Via XXVII Aprile 1 | [it.wikipedia](https://it.wikipedia.org/wiki/Cenacolo_di_Sant%27Apollonia) | A |
| Abendmahl | Farbfeld 19 × 9 Blöcke (9,75 × 4,5 m), Lage Westwand des Refektoriums | Maß aus dem Arbeitsauftrag; die Seite nennt keine Maße | B |
| Lage des Refektoriums | Osten des Vorderblocks (u 90..118, w 2..29), Fensterreihe an der Straße (rechte Wand beim Blick nach Westen = Nordseite), Eingang zur Via XXVII Aprile bei u 106 | der Eingang des Museums liegt an der Via XXVII Aprile 1, an der Ecke zur Via San Gallo (Straßenlinien aus `flaechen.json`) | B / C |
| Kreuzgänge | drei belegt: „della Badessa“ (ab 1442, zwei Geschosse, ionische Kolonnade, seit 2010 in Restaurierung), „del Silenzio“, „del Noviziato“; die vier Löcher des OSM-Umrisses sind alle gebaut (Hof 2, der größte, als Chiostro della Badessa; die Zuordnung der anderen ist nicht belegt) | it.wikipedia | A / C |
| Lünette | einzige vor Ort erhaltene Lünette des Kreuzgangs von Vincenzo Meucci 1735–37 (die Lünette Castagnos ist im Museum) | it.wikipedia | A (Existenz), C (Lage) |
| Kirche | einschiffig, Nonnenchor auf Säulen, hölzerne Kassettendecke mit dem Wappen des Klosters, Apsis mit Fresken Bernardino Poccettis, Portal an der Via San Gallo (früher Michelangelo, heute Dosio zugeschrieben), heute Tagungssaal | it.wikipedia | A |
| Lage der Kirche | im Mittelstreifen an der Via San Gallo (Schiff u 90..117, w 77..95); die Lage entlang der Straße ist nicht belegt | Portal an der Via San Gallo (A), Position (C) | C |
| Mensa | im Kreuzgang an der Via Santa Reparata; Räume zum Teil für das Verteidigungsministerium, zum Teil an die Universität vermietet (Toscana Film Commission) | it.wikipedia | A / C |
| Portale | Museum 5 breit, 9 hoch (u 106); Kirche 6 × 10 (w 86 an der Via San Gallo); Mensa 5 × 9 (w 133 an der Via Santa Reparata) | Lagen B / C | B / C |

## 3. Entwurfswerte (Stufe C)
Fensterraster 9, Breite 3, EG Sohle 6 / Höhe 8, OG Sohle 3 / Höhe 6; Walmdach 4 Lagen; Wendeltreppe im hinteren Flügel des Vorderblocks (u 43, w 37); Kreuzgänge: Joch 6, Kämpfer 7, Tiefe 3 (Löcher 0 bis 3); Trennwände (Türen 3,4 × 5) für das Refektorium, die Kirche mit Sakristei, den Südflügel des Vorderblocks und den Nordflügel des Hinterblocks.

## 4. Nicht gebaut
Nonnenchor auf Säulen und Fenster der Kirche, die beiden Fenster im Fresko (gemalt, nicht verglast), Lünette Castagnos, ionische Kolonnade und Obergeschoss-Loggia des Chiostro della Badessa (Rundbogenarkaden und Fenster statt), Umbau durch Baccani, die „Polveriera“ als eigener Bauteil (nur im OSM-Part), Gesichter und Gesten im Abendmahl.
