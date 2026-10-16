# Bauteilkatalog – Palazzo del Bargello (V3 D4)

Maße: [`REFERENZMASSE.md`](REFERENZMASSE.md). Rahmen BA (θ 0°), Lagen yr = Y − 64. Bauplan `tools/wahrzeichen/palazzo.js`, Einstellungen und Turm in `projects/bargello/model/_ba.js`.

| Modul | Titel | Bauteile |
|---|---|---|
| 0 | Fundament, Boden, Höfe | `fundament`, `boden`, `hof`, `treppe` |
| 1 | Fassaden | `aussenwand`, `fenster`, `kranzgesims` |
| 2 | Hof | `hofarkaden`, `hofwaende`, `hoffenster`, `innenwaende` |
| 3 | Böden und Decke | `geschossboeden`, `decke` |
| 4 | Dach und Zinnen | `dach`, `zinnen` |
| 5 | Torre Volognana | `turm` (Schaft hohl, unzugänglich) |
| 6 | Licht | `licht` |
| 7 | Ausgestaltete Innenräume | `freitreppe`, `verone`, `hof_wappen`, `hofbrunnen`, `michelangelo_saal`, `salone_di_donatello`, `cappella_del_podesta`, `licht_ausstattung` |

<!-- V5a-Anfang -->
## Ausgestaltete Innenräume (V5a)

Geschosse: EG Lage 0..20, 1. OG 20..38, 2. OG 38..54 (Rahmen BA, achsparallel). Bauplan und Raumteilung: `tools/wahrzeichen/palazzo.js` (`cfg.raeume`), Raumplan und Ausstattung: `projects/bargello/model/_raeume.js`, Werkzeug `tools/wahrzeichen/palazzo_raum.js`. Modul 7 (nach dem Licht in Modul 6). Alles vereinfacht, nicht nach Vorbild; Stufen: A belegt, B Literatur oder begründet, C Entwurf.

**Raumteilung.** Neun Trennwandlinien (2 Zellen stark, Türen 3 × 5) teilen den Ring in allen drei Geschossen: Westflügel (Nord- und Südhälfte), Nordflügel in drei Säle, Ostflügel in Nord-, Mittel- und Südraum, Südflügel in drei Räume. Hofgalerie, Portale und die Wendeltreppe bleiben frei. Jedes Geschoss bleibt eine zusammenhängende Raumgruppe (Test `tools/test/palazzi.test.js`).

| Bauteil | Titel | Lage im Grundriss | Stufe | Inhalt und Quelle |
|---|---|---|---|---|
| `freitreppe` | Freitreppe im Hof | Hof, Nordseite, Aufstieg nach Westen (lokal u 83 → 64, w 29..31) | Existenz A, Lage und Länge C | Zwanzig Treppenblöcke aus Pietra serena steigen entlang der Nordarkade des Hofs zur Verone; darunter ein massiver Unterbau, an der offenen Seite eine Brüstung. Die Außentreppe führt zur Verone, der offenen Loggia im ersten Obergeschoss (Quelle: it.wikipedia, Palazzo del Bargello; Neri di Fioravante, 14. Jahrhundert). |
| `verone` | Verone | Hofwand Nord, 1. OG (u 56..64, w 24..32) | Existenz A, Lage C | Offene, überdachte Loggia am oberen Ende der Treppe: Plattform in der Höhe des ersten Obergeschosses, drei Säulen, niedrige Brüstung und Terrakottadach; ein Tor in der Hofwand führt in die Galerie. Die Verone ist die Loggia, zu der die Hoftreppe emporsteigt (Quelle: it.wikipedia, Palazzo del Bargello). |
| `hof_wappen` | Wappen der Podestà | Hofwände des 1. und 2. OG | Schmuck B, Farben C | An den Hofwänden des ersten und zweiten Obergeschosses hängen farbige Schilde zwischen den Fenstern: Schildhaupt in Gold, Feld in Rot, Blau, Grün, Gelb, Orange oder Braun. Die Wände des Bargello-Hofs sind mit den Wappen der Podestà und Richter geschmückt (Quelle: it.wikipedia, Palazzo del Bargello). |
| `hofbrunnen` | Brunnen im Hof | Hofmitte (u 62,5, w 46) | C | Rundes Becken aus Pietra serena in der Mitte des Hofs, Wasser im Becken und eine kurze Mittelsäule. Im Hof steht ein Brunnen (pozzo); Form und Lage sind hier Stufe C (Quelle: it.wikipedia, Palazzo del Bargello). |
| `michelangelo_saal` | Michelangelo-Saal | EG, Westflügel Nord (u 5..35, w 4..50) | Inhalt A, Lage C | Saal im Erdgeschoss des Westflügels: Schachbrettboden aus Marmor und rotem Granit, Wandfelder mit Pilastern, Holz-Kassettendecke, Bacchus als Blockfigur, Brutus-Büste auf hohem Sockel, Tondo Pitti als Marmorscheibe in der Westwand, vier Vitrinen. Das Museum zeigt Michelangelos Bacchus, den Brutus und den Tondo Pitti (Quelle: it.wikipedia, Museo nazionale del Bargello). |
| `salone_di_donatello` | Salone di Donatello | 1. OG, Ostflügel Nord (u 94..136, w 9..31) | Inhalt A, Lage C | Großer Saal im ersten Obergeschoss des Ostflügels: Boden aus Terrakotta und Marmor, Wandfelder mit Wappenschilden, Holz-Kassettendecke, zwei Davids (Bronze und Marmor), der heilige Georg und der Marzocco-Löwe auf Sockeln. Der Salone del Consiglio Generale zeigt heute Donatellos Davids, den heiligen Georg und den Marzocco (Quelle: it.wikipedia, Palazzo del Bargello). |
| `cappella_del_podesta` | Cappella del Podestà | 1. OG, Nordflügel West (u 36..66, w 3..18) | Inhalt A, Lage C | Kapelle der Maddalena im ersten Obergeschoss des Nordflügels: Wandfelder mit Figurenfries in Hellblau, Grün und Rot (Fresken der Giotto-Schule), blaue Decke mit goldenen Sternen, Altar mit goldenem Kreuz und drei Bankreihen. Die Kapelle der Maddalena trägt Fresken aus dem Umkreis Giottos mit Paradies und Hölle (Quelle: it.wikipedia, Palazzo del Bargello). |
| `licht_ausstattung` | Licht in den Sälen | alle ausgestalteten Räume | Regel §1.5 | Seelaternen im Boden der ausgestalteten Räume, höchstens 12 Blöcke voneinander entfernt. In Minecraft sind Innenräume ohne Lichtquelle dunkel. |

**Begehbarkeit und Licht.** Die Freitreppe besteht aus 20 Treppenblöcken (Breite 3, soweit der Hof reicht) auf massivem Unterbau, Kopffreiheit 3; die Verone ist eine offene, überdachte Loggia (deklarierte Öffnung `loggia`), ihr Tor (4 × 6) führt in die Galerie des 1. OG. Ohne die Wendeltreppe ist der ganze 1. OG über die Freitreppe erreichbar (Test). Jeder Raum bekommt Seelaternen im Boden (Raster 12, je Raum getrennt); Lichter neben Ausstattungszellen gehören zum Teil `licht_ausstattung` im Ausstattungsmodul. R13: 0 nicht erreichbare Komponenten, R14: 0 Lücken.

<!-- V5a-Ende -->
