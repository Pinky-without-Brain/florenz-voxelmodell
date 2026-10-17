# Bauteilkatalog – Ex monastero di Sant'Apollonia (Welle 7b)

Maße und Quellen: [`REFERENZMASSE.md`](REFERENZMASSE.md). Rahmen SA (θ 28,75°), Lagen yr = Y − 66. Bauplan `tools/wahrzeichen/palazzo.js`, Einstellungen `projects/sant_apollonia/model/_sa.js`, Raumplan und Ausstattung `model/_raeume.js`. Stufen: A belegt, B Literatur oder begründet, C Entwurf.

## 1. Module und Bauteile

| Modul | Titel | Bauteile |
|---|---|---|
| 0 | Fundament, Boden, Kreuzgänge und Treppe | `fundament`, `boden`, `hof`, `treppe` |
| 1 | Fassaden | `aussenwand`, `fenster`, `kranzgesims` |
| 2 | Hof und Innenwände | `hofarkaden`, `hofwaende`, `hoffenster`, `innenwaende`, `trennwaende` |
| 3 | Böden und Decke | `geschossboeden`, `decke`, `innenwaende_og`, `trennwaende_og` |
| 4 | Dach | `dach` |
| 5 | Licht | `licht` |
| 6 | Cenacolo, Kreuzgänge, Kirche und Mensa | `cenacolo`, `abendmahl`, `cenacolo_oben`, `chiostro_badessa`, `meucci_lunette`, `kirche`, `kirche_apsis`, `mensa`, `licht_ausstattung` |

## 2. Zonen und Wände
- **Geschosse** (Lagen): EG 0..18, Obergeschoss 18..30 (Traufe Y 96); Walmdach bis Lage 34 (höchster Block Y 101). Gesims aus Pietra serena auf Lage 18, Kranzgesims Lage 29–30.
- **Außenwände** zwei Blöcke dick: weißer Putz mit ockerfarbenen Bändern (alle 9 Lagen) und Sockel aus Bruchstein; Fensterraster 9, Breite 3 (EG Sohle 6, Höhe 8; OG Sohle 3, Höhe 6).
- **Kreuzgänge** (alle vier Löcher): Rundbogenarkaden (Joch 6, Kämpfer 7) mit Umgang (Tiefe 3) und Innenwand; Höfe 0, 1 und 3 mit Rasen, Hof 2 (größter, als Chiostro della Badessa) gepflastert.
- **Portale** (deklarierte `tor`, in lokalen Koordinaten geschnitten): Museum Via XXVII Aprile (u 106, 5 × 9), Kirche Via San Gallo (w 86, 6 × 10), Mensa Via Santa Reparata (w 133, 5 × 9). Die Fenster sind an den Portalen ausgelassen (`fensterAus`).

## 3. Begehbarkeit
- **Zugang**: drei Portale; Museum stufenlos (Gelände 66), Kirche und Mensa eine Stufe (Gelände 65).
- **Raumteilung** (alle Geschosse): Refektorium (u 90,7..118, w 2..29) mit Westwand bei u 89,5 und Südwand bei w 29,5 (Tür bei u 104); Südflügel des Vorderblocks in drei Räume (Wände bei u 30 und 60, Türen bei w 40); Kirche (w 77..95) mit Nord- und Südwand (Türen bei u 112 und 104) und Westwand bei u 89 (Tür bei w 86 zur Sakristei); Nordflügel des Hinterblocks in vier Räume (Wände bei u 30, 60, 90, Türen bei w 133, Mensa im ersten). Die Innenwände um die Höfe haben Türen im Raster 14, so erreicht jeder Raum den Umgang.
- **Treppe**: Wendeltreppe aus Pietra serena (Kern 3 × 3) im Südflügel des Vorderblocks (u 43, w 37), Treppenloch im Obergeschossboden. Die Obergeschosse sind über offene Flächen und Türen zusammenhängend.
- **Unzugänglich** (deklariert): Dachraum über der obersten Decke.
- **Licht**: Seelaternen im Boden jedes Raums im Raster 12.

## 4. Ausgestaltete Innenräume (Modul 6)
Alles vereinfacht in vollen Blöcken; Lage der Räume Stufe C.

| Bauteil | Raum | Lage im Grundriss | Stufe | Inhalt und Quelle |
|---|---|---|---|---|
| `cenacolo` | Cenacolo (Refektorium) | EG, Osten des Vorderblocks (u 91..118, w 2..29) | Existenz A, Lage B/C | Schachboden Cotto und Marmor, Wandfelder Weiß und Gelb mit Holzrahmen und Pilastern, Kassettendecke (Holz, Gold), zwei lange Tische (eine Lage hoch). Quelle: it.wikipedia, Cenacolo di Sant'Apollonia |
| `abendmahl` | Abendmahl von Andrea del Castagno | Westwand des Cenacolo (u 89,7..90,8, w 5..25, Lage 3..11) | Existenz A, Maß B (9,75 × 4,5 m) | Farbfeld 19 × 9: Marmortafeln Rot/Orange, Tisch mit weißem Tuch, 13 Gestalten, Christus in Weiß mit goldenem Heiligenschein, Goldrahmen. Quelle: it.wikipedia (Castagno 1447) |
| `cenacolo_oben` | Auferstehung, Kreuzigung, Grablegung | über dem Abendmahl (Lage 13..17) | Existenz A, Darstellung C | drei Farbfelder von links nach rechts, zwei hellblaue Streifen für die Fenster, Goldrahmen oben und unten. Quelle: it.wikipedia |
| `chiostro_badessa` | Chiostro della Badessa | Hof 2 (u 45..87, w 167..185) | Existenz A, Zuordnung C | Pflaster im Schachmuster mit Wegekreuz aus Pietra serena. Quelle: it.wikipedia, Complesso di Sant'Apollonia |
| `meucci_lunette` | Lünette von Vincenzo Meucci | Nordseite des Hofs 2, Hofwand über den Arkaden (Lage 11..17) | Existenz A, Lage C | halbrundes Farbfeld mit Goldrand. Quelle: it.wikipedia (Meucci 1735–37) |
| `kirche` | Ehemalige Klosterkirche | EG, Mittelstreifen (u 90..117, w 77..95) | Existenz A, Lage C | Marmorboden mit Mittelstreifen, Wandfelder, Kassettendecke aus Holz und Gold, Altartisch, vier Bankreihen, Portal zur Via San Gallo. Quelle: it.wikipedia |
| `kirche_apsis` | Apsis mit Fresken Poccettis | Westwand der Kirche (Lage 3..13) | Existenz A, Bildprogramm C | Farbfeld 14 × 11 mit Goldrahmen. Quelle: it.wikipedia |
| `mensa` | Mensa im Kreuzgang | EG, Nordflügel des Hinterblocks (u 2..29, w 121..145) | Existenz A, Lage C | Pflaster-Marmor-Schachboden, Wandfelder, fünf lange Tische (eine Lage hoch). Quelle: it.wikipedia |
| `licht_ausstattung` | Licht in den Sälen | alle ausgestalteten Räume | Regel §1.5 | Seelaternen im Boden |

## 5. Abweichungen und Auslassungen
- **Mensa ≠ Refektorium**: w1239428647 („Mensa universitaria“) liegt vollständig in der Konventfläche, im Hinterblock an der Via Santa Reparata, nicht dort, wo das Cenacolo steht (Eingang Via XXVII Aprile 1); es entsteht keine Zusatzmaske. Das Cenacolo ist ein Raum des Konvents.
- **Lage des Refektoriums** im Osten des Vorderblocks ist aus dem Eingang des Museums und der Straßenlinie abgeleitet (Stufe C); die Fensterreihe liegt in der Straßenwand (rechte Wand beim Blick auf das Abendmahl).
- **Fenster im Fresko**: die beiden Fenster, die das obere Register unterbrechen, sind als hellblaue Streifen gemalt (nicht verglast; die Wand liegt zwischen Räumen).
- **Gesichter, Gesten, Anordnung der Apostel** im Abendmahl: nicht nachgebildet; die Hintergrundfarben (Marmortafeln) sind eine Vereinfachung.
- **Kirche**: Lage entlang der Via San Gallo, Größe und Portalmaße sind nicht belegt (Stufe C); Nonnenchor auf Säulen und Fenster nicht gebaut.
- **Chiostro della Badessa**: Zuordnung zum größten Hof ist Stufe C; ionische Kolonnade und zweites Geschoss als Rundbogenarkaden und Fenster ersetzt. Die Namen der anderen Höfe (del Silenzio, del Noviziato) sind keinem Loch zugeordnet.
- **Umbau durch Baccani**, Räume der Universität und des Ministeriums: ohne Beleg zu Lage und Gestalt nicht gebaut; „La Polveriera“ (OSM-Part) bleibt Teil der Hülle.
- **Übrige Trakte** sind Konventhallen ohne Ausstattung (Stufe C).
