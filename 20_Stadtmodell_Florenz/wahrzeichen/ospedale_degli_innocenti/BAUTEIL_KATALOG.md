# Bauteilkatalog – Spedale degli Innocenti (V3 D4)

Maße: [`REFERENZMASSE.md`](REFERENZMASSE.md). Rahmen OI (θ 37,2°), Lagen yr = Y − 66. Bauplan `tools/wahrzeichen/palazzo.js` (Portikus), Einstellungen und Medaillons in `projects/ospedale_degli_innocenti/model/_oi.js`.

| Modul | Titel | Bauteile |
|---|---|---|
| 0 | Fundament, Boden, Höfe | `fundament`, `boden`, `hof`, `treppe` |
| 1 | Fassaden und Loggia | `aussenwand`, `portikus` (9 Bögen, Medaillons), `fenster`, `kranzgesims` |
| 2 | Hof | `hofarkaden`, `hofwaende`, `hoffenster`, `innenwaende`, `loggiawand` |
| 3 | Böden und Decke | `geschossboeden`, `decke` |
| 4 | Dach | `dach` |
| 5 | Licht | `licht` |
| 6 | Ausgestaltete Innenräume | `ruota`, `chiostro_uomini`, `chiostro_donne`, `museo_tafelbilder`, `museo_ghirlandaio`, `museo_robbia`, `licht_ausstattung` |

Begehbarkeit: Loggia offen (`arkade`), Türen in der Rückwand, Hofarkaden, Türen zu den Lichthöfen, Wendeltreppe; Dachraum unzugänglich.

<!-- V5a-Anfang -->
## Ausgestaltete Innenräume (V5a)

Geschosse: EG Lage 0..20, 1. OG 20..34 (Rahmen OI, θ 37,2°). Bauplan und Raumteilung: `tools/wahrzeichen/palazzo.js` (`cfg.raeume`), Raumplan und Ausstattung: `projects/ospedale_degli_innocenti/model/_raeume.js`, Werkzeug `tools/wahrzeichen/palazzo_raum.js`. Modul 6 (nach dem Licht in Modul 5). Alles vereinfacht, nicht nach Vorbild; Stufen: A belegt, B Literatur oder begründet, C Entwurf.

**Raumteilung.** Elf Trennwandlinien (Türen 3 × 5): vier Querwände gliedern die Räume hinter der Loggia in fünf Säle (je einer mit Tür in der Loggiawand), Längswände trennen Loggiaflügel, Nord- und Südhalle, drei Wände gliedern die Ostmasse. Über der Loggia laufen die Wände im 1. OG durch (dort liegen Säle). Jedes Geschoss bleibt eine zusammenhängende Raumgruppe (Test `tools/test/palazzi.test.js`).

| Bauteil | Titel | Lage im Grundriss | Stufe | Inhalt und Quelle |
|---|---|---|---|---|
| `ruota` | Ruota | Loggiawand, Nordende (u 11..12, w 8..12) | Inhalt A, Lage B | Das Findelrad als Fensternische in der Loggiawand: runder Rahmen aus Pietra serena, Speichen und Nabe aus Bronze, dahinter dunkles Glas. Die Nische ist dicht, es führt keine Öffnung ins Haus. In der Ruota, einem drehbaren Fach in der Wand, konnten Neugeborene anonym abgegeben werden (Quelle: it.wikipedia, Spedale degli Innocenti). |
| `chiostro_uomini` | Chiostro degli Uomini | Chiostro degli Uomini (Loch 3: u 40..71, w 40..70) | Hof A, Ausstattung C | Hofpflaster mit Wegekreuz und Mittelrondell aus Pietra serena, ein Brunnenbecken in der Mitte, über den Pfeilern der Arkaden runde Lünettenfelder in Blau und Weiß mit Goldrand. Der Chiostro degli Uomini ist der größere der beiden Kreuzgänge des Findelhauses (Quelle: it.wikipedia, Spedale degli Innocenti). |
| `chiostro_donne` | Chiostro delle Donne | Chiostro delle Donne (Loch 2: u 31..92, w 109..120) | Hof A, Ausstattung C | Langgestreckter Hof mit Rasen, Kieswegen, einem Brunnenbecken mit Mittelsäule und vier Bäumen. Der Chiostro delle Donne diente den Frauen des Findelhauses (Quelle: it.wikipedia, Spedale degli Innocenti). |
| `museo_tafelbilder` | Museo, Saal der Tafelbilder | 1. OG über der Loggia (u 0..30, w 29..56) | Inhalt B, Lage C | Saal im 1. Obergeschoss über der Loggia: Schachbrettboden, Wandfelder in Gelb, Orange, Blau und Rot mit Goldrahmen in Augenhöhe, Kassettendecke, zwei Vitrinen. Das Museo degli Innocenti zeigt Tafelbilder, darunter Werke von Botticelli und Piero di Cosimo (Quelle: it.wikipedia, Spedale degli Innocenti). |
| `museo_ghirlandaio` | Museo, Saal der Anbetung | 1. OG über der Loggia (u 0..30, w 57..84) | Inhalt A, Lage C | Saal mit dem großen Bild der Anbetung der Könige als Farbfeld (10 Blöcke breit, 10 hoch) in der Fassadenwand: blauer Himmel, grüne Wiese, Gestalten in bunten Gewändern, Goldrahmen. Domenico Ghirlandaio malte die Anbetung der Könige 1488 für die Kirche des Findelhauses (Quelle: it.wikipedia, Spedale degli Innocenti). |
| `museo_robbia` | Museo, Saal der Terrakotten | 1. OG über der Loggia (u 0..30, w 85..112) | Inhalt B, Lage C | Saal mit blau-weißen Wandfeldern nach Art der glasierten Terrakotten, Holzrahmen, Schachbrettboden, Kassettendecke und zwei Vitrinen. Andrea della Robbia schuf 1487 die Wickelkinder-Medaillons an der Loggia (Quelle: it.wikipedia, Spedale degli Innocenti). |
| `licht_ausstattung` | Licht in den Sälen | alle ausgestalteten Räume | Regel §1.5 | Seelaternen im Boden der ausgestalteten Räume, höchstens 12 Blöcke voneinander entfernt. In Minecraft sind Innenräume ohne Lichtquelle dunkel. |

**Begehbarkeit und Licht.** Die Ruota ist eine dichte Fensternische (Rahmen, Speichen, dunkles Glas) in der Rückwand der Loggia, keine Öffnung. Die Höfe sind über die Arkaden und Türen erreichbar. Jeder Raum bekommt Seelaternen im Boden (Raster 12, je Raum getrennt); Lichter neben Ausstattungszellen gehören zum Teil `licht_ausstattung` im Ausstattungsmodul. R13: 0 nicht erreichbare Komponenten, R14: 0 Lücken.

<!-- V5a-Ende -->
