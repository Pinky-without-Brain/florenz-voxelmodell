# Bauteilkatalog – Palazzo Medici Riccardi (V3 D4)

Maße: [`REFERENZMASSE.md`](REFERENZMASSE.md). Rahmen PM (θ 24°), Lagen yr = Y − 65. Bauplan `tools/wahrzeichen/palazzo.js`, Einstellungen `projects/palazzo_medici_riccardi/model/_pm.js`.

| Modul | Titel | Bauteile |
|---|---|---|
| 0 | Fundament, Boden, Höfe | `fundament`, `boden`, `hof` (zwei Höfe gepflastert, Garten mit Rasen), `treppe` |
| 1 | Fassaden | `aussenwand`, `fenster`, `kranzgesims` |
| 2 | Hof | `hofarkaden` (Höfe 0 und 1), `hofwaende` (mit Türen zum Garten), `hoffenster`, `innenwaende` |
| 3 | Böden und Decke | `geschossboeden`, `decke` |
| 4 | Dach | `dach` |
| 5 | Licht | `licht` |
| 6 | Ausgestaltete Innenräume | `cappella_dei_magi`, `galleria_luca_giordano`, `michelozzo_hof`, `medaillons`, `garten_medici`, `licht_ausstattung` |

Begehbarkeit: zwei Portale, Arkaden zu beiden Höfen, Türen zum Garten, Wendeltreppe; Dachraum unzugänglich.

<!-- V5a-Anfang -->
## Ausgestaltete Innenräume (V5a)

Geschosse: EG Lage 0..22, Piano nobile 22..40, 2. OG 40..56 (Rahmen PM, θ 24°). Bauplan und Raumteilung: `tools/wahrzeichen/palazzo.js` (`cfg.raeume`), Raumplan und Ausstattung: `projects/palazzo_medici_riccardi/model/_raeume.js`, Werkzeug `tools/wahrzeichen/palazzo_raum.js`. Modul 6 (nach dem Licht in Modul 5). Alles vereinfacht, nicht nach Vorbild; Stufen: A belegt, B Literatur oder begründet, C Entwurf.

**Raumteilung.** Zehn Trennwandlinien (Türen 3 × 5): im Via-Cavour-Flügel Nord | Kapelle | Süd, im Südflügel die Galerie (drei Wände), der Nordblock in vier Räume, die Westmasse in zwei Teile. Höfe, Galerien, Portale und Wendeltreppe bleiben frei. Jedes Geschoss bleibt eine zusammenhängende Raumgruppe (Test `tools/test/palazzi.test.js`).

| Bauteil | Titel | Lage im Grundriss | Stufe | Inhalt und Quelle |
|---|---|---|---|---|
| `cappella_dei_magi` | Cappella dei Magi | Piano nobile, Via-Cavour-Flügel (u −22..−3, w −52..−32) | Inhalt A, Lage C | Kapelle im Piano nobile am Via-Cavour-Flügel: Wandfelder ringsum mit dem Zug der Heiligen Drei Könige (Himmel, Hügel, Figuren in Rot, Blau, Weiß und Gelb mit goldenen Kronen), Boden mit goldener Mitte und Marmorringen, Kassettendecke aus Eiche und Gold, Altar mit Kreuz und Altarbild, zwei Bankreihen. Benozzo Gozzoli malte den Zug der Heiligen Drei Könige um 1459 bis 1461 für Piero de' Medici (Quelle: it.wikipedia, Palazzo Medici Riccardi). |
| `galleria_luca_giordano` | Galleria di Luca Giordano | Piano nobile, Südflügel (u −97..−62, w −16,5..−3) | Inhalt A, Lage C | Langer Saal im Südflügel: Schachboden aus Marmor und Granit, Spiegelfelder aus weißem Glas und blaue Felder zwischen goldenen Pilastern, Deckenfresko in Blau mit goldener Sonne, Wolken und Gestalten, zwei Statuen. Luca Giordano malte ab 1682 die Apotheose der Medici an die Decke der Galerie (Quelle: it.wikipedia, Palazzo Medici Riccardi). |
| `michelozzo_hof` | Michelozzos Hof | Michelozzos Hof (Loch 1: u −53..−34, w −51..−31) | Hof A, Ausstattung B | Hofpflaster mit Wegekreuz und Mittelrondell aus Pietra serena; in der Mitte die Orpheus-Statue als Blockfigur auf einem hohen Sockel (Marmor, erhobener Arm). Im Hof steht der Orpheus von Baccio Bandinelli (Quelle: it.wikipedia, Palazzo Medici Riccardi). |
| `medaillons` | Medaillons über den Arkaden | Hofwände von Loch 1 über den Arkadenpfeilern, Lage 14..20 | Schmuck B | Über jedem Pfeiler der Arkaden von Michelozzos Hof sitzt ein rundes Medaillon: weiße Scheibe mit goldenem Rand und buntem Mittelpunkt. Die Medaillons im Hof gehen auf Entwürfe nach Donatello zurück (Quelle: it.wikipedia, Palazzo Medici Riccardi). |
| `garten_medici` | Garten | Garten (Loch 2: u −113..−76, w −83..−18) | Garten A, Ausstattung C | Kieswege im Kreuz und als Ring um ein Brunnenbecken, Brunnensäule in der Mitte, vier Statuen auf Sockeln an den Wegenden und sechs Bäume auf dem Rasen. Der Palast besitzt einen Garten hinter den Höfen (Quelle: it.wikipedia, Palazzo Medici Riccardi). |
| `licht_ausstattung` | Licht in den Sälen | alle ausgestalteten Räume | Regel §1.5 | Seelaternen im Boden der ausgestalteten Räume, höchstens 12 Blöcke voneinander entfernt. In Minecraft sind Innenräume ohne Lichtquelle dunkel. |

**Begehbarkeit und Licht.** Die Türen zum Garten und zu den Lichthöfen gehen jetzt durch beide Lagen der Hofwand; die Luft unter Baumkronen und Statuenarmen im Freien ist als offene Luft (`fenster_offen`) deklariert. Jeder Raum bekommt Seelaternen im Boden (Raster 12, je Raum getrennt); Lichter neben Ausstattungszellen gehören zum Teil `licht_ausstattung` im Ausstattungsmodul. R13: 0 nicht erreichbare Komponenten, R14: 0 Lücken.

<!-- V5a-Ende -->
