# Bauteilkatalog – Museo dell'Opera del Duomo (W7c)

Maße: [`REFERENZMASSE.md`](REFERENZMASSE.md). Rahmen `MO` (θ 33,7°), Lagen `yr = Y − 65`. Bauplan `tools/wahrzeichen/palazzo.js` (ohne Hof; Einstellungen in `projects/museo_opera_duomo/model/_mo.js`), Raumplan und Ausstattung in `_raeume.js`. Projekt `type: "wahrzeichen"`, `"begehbarkeit": "pflicht"`, 140.223 Blöcke (±5 %), 7 Module.

| Modul | Titel | Bauteile (Bau-Reihenfolge) | Inhalt, Stufe |
|---|---|---|---|
| 0 | Fundament, Boden, Treppe | `fundament`, `boden`, `treppe` | Bruchstein bei tiefem Gelände; Schachbrett aus `putz_rosa` und `marmor_weiss`; Wendeltreppe aus Pietra-serena-Treppenblöcken durch drei Geschosse – C |
| 1 | Außenwände, Fenster | `aussenwand`, `fenster`, `kranzgesims` | Putz in Ocker (`putz_ocker`), Sockel `pietra_forte`, Gesims `pietra_serena`; zwei Portale (`tor`, 7 × 10); Rechteckfenster nur zur Piazza (Glas in der Mittelebene) – C (Hausakte) |
| 2 | Innenwände | `trennwaende` | vier Trennwandlinien, Türen 4,5 × 5 – C |
| 3 | Böden, Decke | `geschossboeden`, `decke`, `trennwaende_og` | Böden Holz/Terrakotta mit Treppenloch (kein Boden über der Sala del Paradiso), oberste Decke, Trennwände der Obergeschosse – C |
| 4 | Dach | `dach` | Walmdach `dachziegel` (Coppi), Raum darunter `unzugaenglich` – C (Hausakte) |
| 5 | Licht | `licht` | Seelaternen im Boden, Raster 12 je Raum – C |
| 6 | Ausstattung | `eingangshalle`, `galleria_sculture`, `tribuna_pieta`, `sala_maddalena`, `korridor_marmor`, `sala_paradiso`, `sala_navate`, `galleria_campanile`, `galleria_cupola`, `sala_cantorie`, `sala_silberaltar`, `fassadenentwuerfe`, `galerie_modelle`, `aussichtsraum`, `saal_giotto`, `saal_paramente`, `licht_ausstattung` | siehe unten |

## Ausgestaltete Innenräume (W7c)
Boden, Decke, Sockel und Figuren sind eigene Bauteile je Saal. **Wandfelder** (Fresko-, Gold- und Holzfelder der Wände, Bilder) bleiben im Bauteil ihrer Wand (`trennwaende`, `trennwaende_og`, `aussenwand`), damit die Restzellen der Wand im selben Bauschritt Halt haben (R3, Lehre dieses Projekts; `kitApi.ersetze` in `_raeume.js`). Bilder sind Farbfelder, ihre Unterkante liegt 2 Blöcke über dem Boden. Quelle jeweils it.wikipedia; **vereinfacht, nicht nach Vorbild**; die Lage der Säle ist Stufe C.
- **Erdgeschoss:** Eingang mit Namensmarken und der Gruppe Ticciati auf Stufensockel (`eingangshalle`); Galleria delle Sculture mit vier Figuren; Tribuna der Pietà (zweistufiger Sockel, vier Blockfiguren); Saal der Maddalena (Holzfigur, Holzkruzifix, Goldoktagon mit acht Vitrinen); Korridor mit fünf Marmorblöcken; **Sala del Paradiso** über zwei Geschosse: Schachbrettboden, Kassettendecke auf Lage 16, Replik der Arnolfo-Fassade als Wandfeld 48 × 14 an der Nordwand (drei Portale, Rosette, Statuennischen, Giebel; auf Hallenhöhe verkürzt), drei Bronzeportale an der Nordostwand (Felder 10 × 11), davor drei Statuengruppen, Marmorfragmente der abgerissenen Fassade – A (Inhalt), C (Maße).
- **1. Obergeschoss:** Sala delle Navate (Tafeln auf Goldgrund); Galleria del Campanile (Reliefs, vier Statuen); Galleria della Kuppel (Kuppelmodell aus Ziegel mit Laterne, zwei Vitrinen); Sala delle Cantorie (zwei Reliefbänder, Figur); Saal des Silberaltars (Altar, Aufsatz, Kreuz, Stickereienband); Entwürfe der Domfassade (drei Stellwände) – A/C.
- **2. Obergeschoss:** Galerie der Fassadenmodelle (vier Holzmodelle); Aussichtsraum (drei Bänke); Saal mit Giottos Madonna; Saal der Paramente (drei Vitrinen, Gemäldefeld) – A/C.

## Begehbarkeit und Dichtheit
Zugang über zwei Portale zur Piazza (7 breit, 10 hoch, bis zum Boden offen, Piazza und Boden beide auf Y 65); Wendeltreppe mit Kopffreiheit 3 durch alle drei Geschosse; Türen 4,5 × 5; im 1. OG gibt es keine Türen in die Halle (Boden fehlt); Licht ≤ 12 Blöcke; Fenster verglast; Dach massiv bis auf den als `unzugaenglich` deklarierten Dachraum. R13: 77,5 % der 42.116 Raumzellen erreichbar (der Rest ist der Dachraum), 0 nicht erreichbare Komponenten; R14: 0 Lücken.

## Abweichungen (nicht gebaut oder frei ergänzt)
- **Fassade, Hof, Portale:** Die Quelle beschreibt weder Fassade noch heutigen Hof; die im Auftrag genannte klassizistische Fassade ist nicht belegt und nicht gebaut (Putz in Ocker nach Hausakte). Einen Hof gibt es nicht.
- **Sala del Paradiso:** In Wirklichkeit höher und zu den oberen Geschossen offen; im Modell zwei Geschosse hoch (Decke auf Lage 17), die Öffnung der Galerie im 2. Stock zur Halle fehlt; die Fassadenreplik ist auf Hallenhöhe verkürzt (Feld 48 × 14 statt 1:1).
- **28 Säle:** 16 sind gebaut; das Teatro degli Intrepidi und der alte Opera-Sitz sind nicht getrennt.
- **Michelangelos David im Hof (um 1500), Bar, Atelier, Terrasse:** nicht belegt für den heutigen Bau, nicht gebaut.
- **Sala dei Nomi, Treppenlünette mit den Domportal-Mosaiken, Silberaltar im Detail, 27 Stickereien einzeln:** nur als Farbfelder oder Blockgruppen angedeutet.
- **Lage der Räume:** frei gewählt (Stufe C), die Reihenfolge der Quelle gilt nur ungefähr.
