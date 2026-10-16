# Bauteilkatalog – San Marco (W5a)

Maße: [`REFERENZMASSE.md`](REFERENZMASSE.md). Rahmen SM (θ −61,78°, Ursprung 260 | −1148,5), `bodenY` 68, Lagen yr = Y − 68. Zwei Bauplaene: Konvent über `tools/wahrzeichen/palazzo.js` (`projects/san_marco/model/_sm.js`, Räume `_raeume.js`, `_ausstattung.js`, `_ausstattung_og.js`, Malerei `_malerei.js`) und Basilika mit Campanile in einem eigenen Bauplan `model/_kirche.js` (Ausstattung `_kirche_ausstattung.js`). Erste Setzung gewinnt; Öffnungen (Portale, Türen, Treppenlöcher) werden vor den Wänden freigehalten („lässt aus“: jedes Bauteil lässt die Zellen aus, die ein früher gelistetes Bauteil oder eine Öffnung belegt).

Neu in `palazzo.js` (rückwärtskompatibel): `treppe: false` (keine Wendeltreppe, eigene Treppen über `extra.vorher`) und `innenwandTuer(c, s, v)` (Türen der Innenwand je Geschoss).

## 1. Module

| Modul | Titel | Bauteile | Lässt aus |
|---|---|---|---|
| 0 | Fundament, Boden, Höfe, Treppe | `fundament`, `boden`, `hof`, `treppe` (Podesttreppe 6 + 6 Stufen, Breite 3, Unterbau massiv) | Treppenloch |
| 1 | Außenwände | `aussenwand` (zwei Portale 7 × 10), `fenster`, `kranzgesims` | Portale |
| 2 | Kreuzgang, Innenwände | `hofarkaden`, `hofwaende`, `hoffenster`, `innenwaende`, `trennwaende` (EG) | Türen, Arkaden |
| 3 | Böden und Decke | `geschossboeden`, `decke`, `innenwaende_og`, `trennwaende_og` | Treppenloch, Türen |
| 4 | Dach | `dach` (Walm, massiv) | – |
| 5 | Licht | `licht` (Konvent) | – |
| 6 | Ausgestaltete Räume des Konvents | `kreuzgang_antonino`, `lunetten`, `kreuzigung_hof`, `ospizio`, `foresteria`, `kapitelsaal`, `refettorio_piccolo`, `refettorio_grande`, `kreuzgang_domenico`, `verkuendigung`, `zellen_nord`, `zellen_west`, `zellen_sued`, `savonarola`, `biblioteca`, `licht_ausstattung` | Wandzellen werden ersetzt |
| 7 | Kirche: Rohbau | `fundament`, `boden`, `fassade`, `fassade_fenster`, `seitenwaende`, `seitenmassen`, `fenster`, `arkaden`, `obergaden`, `obergaden_fenster`, `kapellen_trennwaende`, `triumphbogen` | Portal, Tür zum Kreuzgang |
| 8 | Kirche: Decken, Kuppel, Dach | `kassettendecke`, `gewoelbe`, `tambour`, `kuppel`, `laterne`, `schildwaende`, `dach_langhaus`, `dach_seiten` | – |
| 9 | Campanile | `campanile_schaft`, `campanile_treppe`, `glockenstube`, `glockenjoch`, `glocken`, `campanile_spitze`, `campanile_licht` | Tür aus dem Chor |
| 10 | Kirche: Licht und Ausstattung | `licht`, `seitenaltaere`, `cappella_antonino`, `hochaltar`, `chorgestuehl`, `kanzel`, `kirchenbaenke`, `praesbyterium_fresken` | – |

## 2. Zonen der Kirche (Rahmen SM)
`fassade` u < 2 · `kap_w`/`kap_o` (Kapellen, w < 10 bzw. 33..42, vier Joche zu 15,5) · `wand_w`/`wand_o` (Kapellenlinien w 10..12 und 31..33 mit Bögen von 11 Breite, Kämpfer Lage 7) · `mittel` (w 12..31) · `triumph` u 64..66 · `presb` (u 66..86, w 11..32, Kuppel Mittelpunkt (76 | 21,5), Radius 8 / 10) · `chor` (u 86..96, w 9..26) · `apsis` (u ≥ 96) · `turm` (u 85..96, w 26..37) · `masse` (massive Bereiche neben Presbyterium und Chor).

## 3. Begehbarkeit
- **Zugänge:** Konvent: Museumsportal (w 56) und Seitentor (w −13) an der Piazza (7 × 10, `tor`); Kirche: Hauptportal 8 Blöcke breit; Verbindung Kirche und Kreuzgang durch eine Tür (3 × 5) in der rechten Kapelle, über beide Mauern.
- **Konvent:** jedes Geschoss ist eine zusammenhängende Raumgruppe; Treppe im Eingangsflügel führt ins Dormitorium; Zellen, Savonarola-Räume und Bibliothek haben Türen ≥ 2 × 5 (Zelltüren 2,6 breit).
- **Kirche:** Campanile über Wendeltreppe 5 × 5 (Kopffreiheit 3 auch über den Eckpodesten) bis zur Glockenstube; Tür aus dem Chor.
- **Unzugänglich (deklariert):** Dachräume über Decken und Gewölben, Hohlräume im Turm unter dem Helm und über dem Joch, Oberseite des Baldachins der Cappella di Sant’Antonino, Luft unter der Zypressenkrone (offene Hofluft).
- **Licht:** Seelaternen im Boden aller Räume, Raster 12 (Konvent je Raum, Kirche im ganzen Schiff), im Turm alle 8 Lagen.

## 4. Nicht modelliert
Sala del Lavabo, Cappella Serragli (Sakrament), Krypta der Cappella di Sant’Antonino, abgerissener Tramezzo, Orgel, Gewölbe der Kreuzgänge (flache Decke), Gewölbe der Bibliothek als Rippen unter der flachen Decke angedeutet, Chiostro di San Domenico ohne Arkaden.

## 5. Ausgestaltete Innenräume
Modul 6 (Konvent) und Modul 10 (Kirche). Alles **vereinfacht, nicht nach Vorbild**; Stufen: A mehrere Quellen, B eine Quelle, C Annahme. Die Lage der Räume im Grundriss ist durchweg Stufe C (Koordinaten im Rahmen SM).

| Bauteil | Titel | Lage im Grundriss | Stufe | Inhalt und Quelle |
|---|---|---|---|---|
| `kreuzgang_antonino` | Chiostro di Sant’Antonino, Hof | Loch 5 (u 27..65, w 51..92) | B | Wegekreuz aus Kies, Plattform, Zypresse 15 Blöcke (Vorgabe); it.wikipedia Museo |
| `lunetten` | Lünetten | Wand hinter der Loggia | A | Halbscheiben Ø 7 über den Türen, 28 im Original, Ø 3,8 m; de.wikipedia |
| `kreuzigung_hof` | Kreuzigung mit hl. Dominikus | Westwand der Loggia (u 49..64) | B | Feld 14 × 9; it.wikipedia Museo (Nordwestecke) |
| `ospizio` | Sala dell’Ospizio | Eingangsflügel, w 67..96 | Inhalt B | Tafelbilder Fra Angelicos (Strozzi-Kreuzabnahme, Annalena-Altar, Jüngstes Gericht, San-Marco-Altar), drei Wandfelder und zwei Stellwände; it.wikipedia Museo |
| `foresteria` | Foresteria | Eingangsflügel, w 97..118 | Inhalt B | Fra Bartolomeo; it.wikipedia Museo |
| `kapitelsaal` | Sala del Capitolo | Ostflügel, u 30..57 | Inhalt A | Kreuzigung 1442 (22 × 9), Holzkruzifix Baccio da Montelupo 1496, Bänke; it.wikipedia Museo |
| `refettorio_piccolo` | Refettorio piccolo | Ostflügel, u 59..75 | Inhalt B | Abendmahl Ghirlandaios 1486 (9 × 9), Tafeln; it.wikipedia Museo |
| `refettorio_grande` | Refettorio grande | Nordflügel, u 76..103, w 41..102 | Inhalt B | Sogliani 1536 (zwei Felder), drei Tafeln, Lesekanzel; it.wikipedia Museo |
| `kreuzgang_domenico` | Chiostro di San Domenico | Loch 3 (u 119..175, w 2..60) | B | schlicht: Rasen, Wege, Brunnen, vier Bäume; it.wikipedia Museo |
| `verkuendigung` | Verkündigung | Treppenhalle, 5 Blöcke hinter dem Treppenaustritt | Inhalt B | freie Bildwand 11 × 9; um 1442, it.wikipedia Museo |
| `zellen_nord` / `zellen_west` / `zellen_sued` | Zellen der Mönche | Nordflügel (16), Westflügel (18), Südflügel (7) | Inhalt B | zusammen 41 Zellen, je Bett, Pult, Freskofeld; it.wikipedia Museo (44 Zellen an drei Gängen) |
| `savonarola` | Zellen Savonarolas | Ostflügel OG, u 30..70 | Inhalt B | drei verbundene Räume des Priors, Marmorfigur, Stellwand; it.wikipedia Museo |
| `biblioteca` | Biblioteca di Michelozzo | Nordflügel OG, u 181..204, w 10..100 | Inhalt A | 90 Blöcke lang, 30 Säulen, Gurtbögen, Pulte; it.wikipedia, de.wikipedia |
| `seitenaltaere` | Seitenaltäre | sechs Kapellen | Inhalt B | Altar, Kreuz, Kniebank, Bilder; it.wikipedia Basilica |
| `cappella_antonino` | Cappella di Sant’Antonino | Langhaus links, zweites Joch | Inhalt A | Giambologna, Allori, Bronzereliefs; it.wikipedia, en.wikipedia |
| `hochaltar` | Hochaltar | vor der Apsis | Inhalt B | Kruzifix Fra Angelicos; it.wikipedia Basilica |
| `chorgestuehl` | Chorgestühl | Apsis | C | Eichenholz |
| `kanzel` | Kanzel | Mittelschiff links | C | Pfeiler und Kasten |
| `kirchenbaenke` | Kirchenbänke | Mittelschiff | C | zwei Reihen |
| `praesbyterium_fresken` | Fresken im Presbyterium | Presbyterium | Inhalt B | Parrocel; it.wikipedia Basilica |
