# Bauteilkatalog – Santo Stefano al Ponte (W6b)

Maße: [`REFERENZMASSE.md`](REFERENZMASSE.md). Rahmen θ 23,1° (Ursprung −435 | 974), `bodenY` 64, Lagen yr = Y − 64. Bauplan als Zellen im Speicher (`projects/santo_stefano_al_ponte/model/_st.js`, Ausstattung `_st_ausstattung.js`): Die Funktion `zelle(c, yr)` liefert je Spalte und Lage Luft oder ein Bauteil; die fünf Module sind Teillisten. Kein gemeinsames Werkzeug wurde geändert.

## 1. Module

| Modul | Titel | Bauteile | Lässt aus |
|---|---|---|---|
| 0 | Fundament, Boden, Podium | `sa_fundament`, `sa_boden`, `sa_podium` (massiv, Boden aus weißem und grünem Marmor auf Lage 5; Treppenpodest) | – |
| 1 | Fassade und Außenwände | `sa_fassade` (Portal 7 × 8 bis 11, Seitentüren, Inkrustation, Giebel), `sa_fassade_fenster`, `sa_aussenwaende`, `sa_fenster` | Portal, Nische (relief) |
| 2 | Innenwände und Treppe | `sa_innenwaende` (Endwand, Wände von Kapellen, Tribuna und Chor), `sa_treppe` (5 Stufen, Breite 8), `sa_balustrade` | Bogen zur Tribuna, Kapellenöffnungen, Chordurchgang |
| 3 | Decken, Dächer, Kuppel | `sa_decken`, `sa_dach`, `sa_trommel`, `sa_kuppel` | – |
| 4 | Licht und Ausstattung | `sa_licht`, `sa_altaere`, `sa_hochaltar`, `sa_kapelle`, `sa_scheinkapelle`, `sa_chorgestuehl`, `sa_stuckfigur`, `sa_orgel`, `sa_kruzifix` | Wandzellen werden ersetzt |

41.111 Blöcke, 5 Module.

## 2. Zonen (Rahmen, u \| w)
`fassade` (Randlagen der Westkante, u < 4) · `aussen` (Außenwände) · `schiff` (u 2..55, Satteldach, Decke Lage 17 bzw. 21, dazwischen eine Stufenwand u 33..35) · `endwand` (u 55..57) · `kn` (nördliche Kapelle, w 2..12, 15 tief) · `ks` (falsche Kapelle, w 27,5..37,5, 3 tief) · `tw` (Wände w 12..14 und 25,5..27,5) · `trib` (Tribuna u 57..79 × w 14..25,5, Kuppelmitte (67,5 | 19,75)) · `oswand` (u 79..81 mit Durchgang) · `chor` (u ≥ 81). Die Kuppelspalten (Achteckabstand ≤ 7,75) reichen auch in die Mauern `tw`; die Dicke der Fassadenwand folgt dem Abstand zum Rand, nicht der Koordinate u (sonst bleibt hinter dem Portal ein Rest Wand stehen).

## 3. Begehbarkeit
- **Zugang:** Mittelportal der Fassade (7 breit, 8 hoch mit Rundbogen bis 11,5, bis zum Boden offen, `tor`), Boden Y 64 bündig mit der Piazza Santo Stefano; die beiden Seitentüren sind geschlossen (Holzflügel in Pietra-serena-Rahmen), wie in der Quelle als Hinweis auf das frühere dreischiffige Langhaus.
- **Raumfolge:** Schiff → Treppe (5 Treppenblöcke aus Quarz, Breite 8, Kopffreiheit 3) → Tribuna und Hochaltar → Durchgang (7 breit) → Chor; nördliche Kapelle und falsche Kapelle (Nische) vom Schiff aus über Öffnungen 5 × 7 bis 9 auf Schiffshöhe; Seitenaltäre als Wandfelder mit Altartisch (1 Block).
- **Unzugänglich (deklariert):** nichts. Dachräume, Kuppelschalen und Podium sind massiv; die Laterne und der Aufstieg zur Kuppel sind nicht modelliert.
- **Licht:** 15 Seelaternen im Boden (12 im Schiff und in den Kapellen, 3 auf dem Podium), Test: jede Stehzelle höchstens 12,5 Blöcke vom nächsten Licht auf derselben Höhe.

## 4. Nicht modelliert und Abweichungen
- **Campanile:** in keiner Quelle genannt, nicht gebaut.
- **Krypta** (Öffnung im Schiff, Pfeiler, niedrige Gewölbe) und der **Kreuzgang des 15. Jahrhunderts** mit Brunnen, Grabplatten und der Kapelle der Goldschmiede: liegen außerhalb des Umrisses bzw. sind nicht belegt genug für die Lage; nicht gebaut.
- **Treppe:** der Auftrag nannte Ferdinando Tacca; die Quelle nennt Buontalenti (1574, aus Santa Trinita). Tacca schuf das Paliotto (1656). Die Balustrade ist als volle Marmorwange neben den Stufen vereinfacht.
- **Dreigeteiltes Presbyterium:** die Tribuna ist 11,5 Blöcke (5,75 m) breit; die Seitenkapellen sind einfache Räume. Welche der beiden Kapellen die echte ist, ist Stufe C (gewählt: Nord).
- **Barocke Geometrie:** die Kuppel ist ein reines Achteck (Pyramidenschale), der Tambour hat acht Okuli; das „siebenseitige Halb-Zwölfeck“ und die Zwölfecknischen der Quelle sind zu eckigen Aufsätzen aus Pietra serena über den Altarbildern vereinfacht.
- **Fassade:** Inkrustation als Streifen und Ringe aus weißem und grünem Marmor; Giebel mit Bogenfries aus abwechselnden Pietra-serena-Blöcken; Nische als Einschnitt der Außenlage; Rosetten und Biforien im Rahmen der Beschreibung (Lage Stufe C).
- **Schiff:** westlicher und östlicher Teil mit verschiedener Deckenhöhe (Stufe 4 Blöcke) und einer Stufenwand dazwischen; die Seitenaltäre stehen ohne Kapellen vor der Wand.
- Höhen aller Räume sind Stufe C.

## 5. Ausgestaltete Innenräume
Modul 4. Alles **vereinfacht, nicht nach Vorbild**; Stufen: A mehrere Quellen, B eine Quelle, C Annahme. Die Lage der Räume und die Zuordnung der Bilder zu den Altären sind durchweg Stufe C.

| Bauteil | Titel | Lage im Grundriss | Stufe | Inhalt und Quelle |
|---|---|---|---|---|
| `sa_altaere` | Zehn Seitenaltäre | Seitenwände, u 8..50 | Inhalt A | Bild 4 × 8 mit Goldrahmen, Aufsatz aus Pietra serena, Altartisch aus Marmor; fünf je Seite, it.wikipedia |
| `sa_hochaltar` | Hochaltar mit Paliotto | Tribuna, u 72,5..77 | Inhalt A | Marmoraltar (Giambologna 1594), Bronze-Paliotto (Tacca 1656), Aufbau drei Blöcke hoch |
| `sa_kapelle` | echte Seitenkapelle | nördlich der Tribuna | Inhalt B | Altar und Bild an der Ostwand |
| `sa_scheinkapelle` | falsche Kapelle | südlich, Nische 3 tief | Inhalt A | Taufe Christi von Confortini (1667), Feld 7 × 8 |
| `sa_chorgestuehl` | Chorgestühl | Chor, drei Wände | Inhalt A | Nussholz, um 1650, Werkstatt Sanis; Sitz 1, Rücken 2 hoch |
| `sa_stuckfigur` | Stuckfigur des hl. Stephan | Ostwand des Chors | Inhalt B | Blockfigur auf Sockel |
| `sa_orgel` | Orgel | Südwand, u 42,5..48,5 | Inhalt A | toskanisch, 17. Jh., Wandfeld 6 × 9 |
| `sa_kruzifix` | Holzkruzifix | Innenseite der Fassade | Inhalt A | 1576, Fresko von Lapi (Hintergrund) |
| `sa_treppe` | Treppe der Tribuna | vor der Endwand | Inhalt A | Buontalenti 1574, aus Santa Trinita |
