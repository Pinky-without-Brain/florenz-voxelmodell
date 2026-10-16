# Bauteilkatalog – Palazzo dell'Arte della Lana (W7c)

Maße: [`REFERENZMASSE.md`](REFERENZMASSE.md). Rahmen `AL` (θ −5,5°), Lagen `yr = Y − 66`. Bauplan `tools/wahrzeichen/palazzo.js` (ohne Hof; Einstellungen in `projects/palazzo_arte_della_lana/model/_al.js`), Raumplan und Ausstattung in `_raeume.js`. Projekt `type: "wahrzeichen"`, `"begehbarkeit": "pflicht"`, 32.269 Blöcke (±5 %), 7 Module.

| Modul | Titel | Bauteile (Bau-Reihenfolge) | Inhalt, Stufe |
|---|---|---|---|
| 0 | Fundament, Boden, Treppe | `fundament`, `boden`, `treppe` | Bruchstein bei tiefem Gelände; Schachbrett aus `putz_rosa` und `marmor_weiss`; Wendeltreppe aus Pietra-serena-Treppenblöcken durch alle fünf Geschosse – C |
| 1 | Außenwände, Fenster | `aussenwand`, `fenster`, `kranzgesims`, `bruecke_tuer` | Quader aus `pietra_forte` mit rustizierter Lage jede dritte Zeile, innen Putz; gewölbte Fenster (3 breit, Abstand 8), ab dem 1. OG Biphore mit Mittelsäule, Glas in der Mittelebene; Gesims aus `pietra_serena`; Portale (`tor`, 5 × 8) – A/C |
| 2 | Innenwände | `innenwaende`, `trennwaende` | vier Trennwandlinien mit Türen 3 × 5 – C |
| 3 | Böden, Decke | `geschossboeden`, `decke`, `innenwaende_og`, `trennwaende_og` | Böden Holz/Terrakotta mit Treppenloch, oberste Decke, Trennwände der Obergeschosse – C |
| 4 | Dach, Zinnen | `dach`, `zinnen` | Dachterrasse (Pflaster, Raum darunter massiv), Zinnenkranz (hoch/niedrig im Wechsel) – A (Zinnen), C |
| 5 | Licht | `licht` | Seelaternen im Boden, Raster 12 je Raum – C |
| 6 | Ausstattung | `sala_udienze`, `bibliothek`, `lesesaal`, `sala_dantesca`, `brueckensaal`, `madonna_della_tromba`, `wappen_agnus_dei`, `licht_ausstattung` | siehe unten |

## Ausgestaltete Innenräume (W7c)
Wandfelder ersetzen Zellen der inneren Wandlage (Rollen `fresko`, `gold`, `holz`), Tische sind einen Block hoch. Quelle jeweils it.wikipedia „Palazzo dell'Arte della Lana“; **vereinfacht, nicht nach Vorbild**; die Lage der Räume im Grundriss ist Stufe C.
- **Sala delle Udienze** (EG, Westhalle Süd, Via Calimala): Schachbrettboden, Wandfelder, Kreuzgewölbe mit Rippen aus `holz` und blauen Feldern (Tugenden, Evangelisten), Madonna auf dem Thron zwischen Engeln und Heiligen (Feld 10 × 6, Ostwand), Investitur / Giostra um 1340 (Feld 8 × 5, Südwand = rechte Wand), zwei Richtertische – A (Inhalt), C (Muster, Lage).
- **Bibliothek der Società Dantesca** (1. OG, Westhalle Nord, Treppenaufgang): Bücherwände mit farbigen Rücken, Dachstuhl mit Balken und roten und gelben Feldern, Lünette mit thronender Madonna zwischen Engeln (6 × 4), Wappenfries Florentiner Institutionen, zwei Lesetische – A/C.
- **Lesesaal** (2. OG): Bücherwände, Kassettendecke, zwei Tische – C.
- **Sala della Società Dantesca** (3. OG, Ostsaal Mitte): Wandfelder mit Wappenschilden, Kassettendecke, Sitzungstisch – C (nur der Besitz seit 1903 ist belegt).
- **Brückensaal** (4. OG, Ostsaal Mitte, Boden Y 94): Holzboden, Kassettendecke, Nische mit **geschlossenem Türblatt** in der Ostwand – A (Brücke), C.
- **Fassade:** Tabernakel der Madonna della Tromba an der Nordwestecke (Lage 9..15, 5 × 7), Agnus-Dei-Wappen (4 × 4) und Inschriftenband an beiden Fassaden – A (Existenz), C (Lage, Muster).

## Brücke zu Orsanmichele (Anschlussstück)
Die Brücke (Way w1394931261) gehört zum Projekt `orsanmichele` (Modul 8); ihre Maske teilt keine Zelle mit diesem Projekt (`--cross` prüfen). Orsanmichele öffnet an der Westseite der Brücke nichts (die Wand `d ≤ 2` steht, `ende` ist leer), daher endet die Tür im Palazzo blind: Nische in der Ostwand (Lage 29..32, Zellen z 550..553, x −343 Nische, x −342 Türblatt aus `holz`), gerahmt von `pietra_serena` mit Sturz; der Boden der Ebene (Y 94) und die Raumhöhe passen zur Brücke. Eine Öffnung zur Brücke entstünde erst, wenn Orsanmichele sein Westende öffnet.

## Begehbarkeit und Dichtheit
Zugang über zwei Portale (5 × 8, bis zum Boden offen); Treppe mit Kopffreiheit 3 durch alle Geschosse; Türen 3 × 5; Licht ≤ 12 Blöcke; Fenster verglast; Dach massiv. R13: 100 % der 7.199 Raumzellen erreichbar, 0 nicht erreichbare Komponenten; R14: 0 Lücken.

## Abweichungen (nicht gebaut oder frei ergänzt)
- **Compagnoni:** Der Auftrag nannte das Turmhaus der Compagnoni; die Quelle nennt die Compiobbesi. Keine bauliche Folge.
- **Loggetta (Via Orsanmichele, Bifore, Stadtwappen, Lampen), Scalone Buontalentis, Loggia an der Via Calimala (nach 1900), doppelte Loggia an der Via de' Lamberti (1921):** belegt, aber ohne Lage und Maße; nicht gebaut. Der Baukörper ist ein einheitlicher Block.
- **Keller mit Jagdszenen, Tabernakel im Laden Nr. 20 (Jacopo del Casentino):** nicht gebaut (Keller unter Gelände; Laden ohne Raumplan).
- **Spitzbögen, Gerüstlöcher, Konsolen einzeln:** nicht darstellbar; Fenster rundbogig, Konsolen als Gesims.
- **Dachterrasse:** nicht zugänglich (kein Treppenhaus bis zum Dach, Stufe C).
- **Geschossaufteilung:** drei Hauptgeschosse mit Mezzaninen (Quelle) sind zu fünf gleich hohen Ebenen zusammengefasst (OSM `building:levels` 5).
