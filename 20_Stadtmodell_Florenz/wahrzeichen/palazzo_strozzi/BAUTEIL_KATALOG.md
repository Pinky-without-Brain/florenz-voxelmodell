# Bauteilkatalog – Palazzo Strozzi (V3 D4)

Maße: [`REFERENZMASSE.md`](REFERENZMASSE.md). Rahmen PS (θ −2°), Lagen yr = Y − 64. Bauplan: `tools/wahrzeichen/palazzo.js`, Einstellungen in `projects/palazzo_strozzi/model/_ps.js`.

## 1. Module

| Modul | Titel | Bauteile |
|---|---|---|
| 0 | Fundament, Boden und Hof | `fundament`, `boden`, `hof`, `treppe` (Wendeltreppe) |
| 1 | Fassaden | `aussenwand` (Rustika, drei Portale), `fenster`, `kranzgesims` |
| 2 | Hof | `hofarkaden`, `hofwaende`, `hoffenster`, `innenwaende` |
| 3 | Böden und Decke | `geschossboeden`, `decke` |
| 4 | Dach | `dach` (Walm) |
| 5 | Licht | `licht` |
| 6 | Ausgestaltete Innenräume | `ausstellung_nord`, `ausstellung_sued`, `ausstellung_west`, `ausstellung_ost`, `hof_cronaca`, `panca_laternen`, `licht_ausstattung` |

## 2. Begehbarkeit
Drei Portale (`tor`), Hofarkaden (`arkade`), Türen in der Innenwand; eine Wendeltreppe erschließt alle Geschosse; Dachraum unzugänglich; Licht im Raster 12 je Geschoss.

<!-- V5a-Anfang -->
## Ausgestaltete Innenräume (V5a)

Geschosse: EG Lage 0..24, Piano nobile 24..44, 2. OG 44..62 (Rahmen PS, θ −2°). Bauplan und Raumteilung: `tools/wahrzeichen/palazzo.js` (`cfg.raeume`), Raumplan und Ausstattung: `projects/palazzo_strozzi/model/_raeume.js`, Werkzeug `tools/wahrzeichen/palazzo_raum.js`. Modul 6 (nach dem Licht in Modul 5). Alles vereinfacht, nicht nach Vorbild; Stufen: A belegt, B Literatur oder begründet, C Entwurf.

**Raumteilung.** Acht Trennwandlinien (Türen 3 × 5) trennen die vier Eckräume von den Flügeln: Nordwest (mit der Wendeltreppe), Nord, Nordost, West, Ost, Südwest, Süd, Südost in allen Geschossen. Hofgalerie und Portale bleiben frei. Jedes Geschoss bleibt eine zusammenhängende Raumgruppe (Test `tools/test/palazzi.test.js`).

| Bauteil | Titel | Lage im Grundriss | Stufe | Inhalt und Quelle |
|---|---|---|---|---|
| `ausstellung_nord` | Ausstellungssaal Nord | Piano nobile, Nordflügel (u 34..80, w 3..28) | Inhalt B, Lage C | Ausstellungssaal im Piano nobile (Nordflügel): Boden im Schachmuster aus dunkler Eiche und Polierstein, weiße Wände mit farbigen Bildfeldern in Augenhöhe (Unterkante 2 Blöcke über dem Boden), zwei freistehende Stellwände mit Bildern und eine Sitzbank in der Mitte. Das Piano nobile des Palazzo Strozzi dient heute der Fondazione Palazzo Strozzi für Wechselausstellungen (Quelle: it.wikipedia, Palazzo Strozzi). |
| `ausstellung_sued` | Ausstellungssaal Süd | Piano nobile, Südflügel (u 34..80, w 62..88) | Inhalt B, Lage C | Ausstellungssaal im Piano nobile (Südflügel): Boden im Schachmuster aus dunkler Eiche und Polierstein, weiße Wände mit farbigen Bildfeldern in Augenhöhe (Unterkante 2 Blöcke über dem Boden), zwei freistehende Stellwände mit Bildern und eine Sitzbank in der Mitte. Die Fondazione zeigt Kunst vom Mittelalter bis zur Gegenwart (Quelle: it.wikipedia, Palazzo Strozzi). |
| `ausstellung_west` | Ausstellungssaal West | Piano nobile, Westflügel (u 3..33, w 28..61) | Inhalt B, Lage C | Ausstellungssaal im Piano nobile (Westflügel): Boden im Schachmuster aus dunkler Eiche und Polierstein, weiße Wände mit farbigen Bildfeldern in Augenhöhe (Unterkante 2 Blöcke über dem Boden), zwei freistehende Stellwände mit Bildern und eine Sitzbank in der Mitte. Benedetto da Maiano begann den Bau 1489; Il Cronaca vollendete Hof und Kranzgesims (Quelle: it.wikipedia, Palazzo Strozzi). |
| `ausstellung_ost` | Ausstellungssaal Ost | Piano nobile, Ostflügel (u 81..114, w 28..61) | Inhalt B, Lage C | Ausstellungssaal im Piano nobile (Ostflügel): Boden im Schachmuster aus dunkler Eiche und Polierstein, weiße Wände mit farbigen Bildfeldern in Augenhöhe (Unterkante 2 Blöcke über dem Boden), zwei freistehende Stellwände mit Bildern und eine Sitzbank in der Mitte. Der Palast wurde bis 1538 gebaut (Quelle: it.wikipedia, Palazzo Strozzi). |
| `hof_cronaca` | Hof nach Cronaca | Hof (u 41..71, w 36..52) | Hof A, Ausstattung C | Hofpflaster mit Wegekreuz aus Pietra serena und Schachmuster, vier Kübel mit Bäumchen an den Ecken und zwei Laternenpfosten aus Bronze in der Mitte. Der Hof mit Arkaden und korinthischen Säulen geht auf Il Cronaca zurück (Quelle: it.wikipedia, Palazzo Strozzi). |
| `panca_laternen` | Steinbank und Laternenhalter | Straßenfassaden außen (Luftraum 2), Laternen an Ecken und Portalen | Panca und Laternen A, Lage B | Eine Steinbank (panca) aus Pietra serena zieht sich an den Straßenfassaden entlang, an den Portalen unterbrochen; an den Ecken und neben den Portalen hängen Halter aus Bronze mit Laternen. Die schmiedeeisernen Laternen und Fackelhalter an der Fassade schuf Niccolò Grosso, genannt il Caparra (Quelle: it.wikipedia, Palazzo Strozzi). |
| `licht_ausstattung` | Licht in den Sälen | alle ausgestalteten Räume | Regel §1.5 | Seelaternen im Boden der ausgestalteten Säle, höchstens 12 Blöcke voneinander entfernt. In Minecraft sind Innenräume ohne Lichtquelle dunkel. |

**Begehbarkeit und Licht.** Die Steinbank liegt eine Lage hoch auf dem Straßenpflaster (kein Konflikt mit dem Stadtgrund), an den drei Portalen ist sie unterbrochen. Der Hof ist jetzt über die Arkaden erreichbar (Arkadenöffnungen gehen durch beide Lagen der Hofwand). Jeder Raum bekommt Seelaternen im Boden (Raster 12, je Raum getrennt); Lichter neben Ausstattungszellen gehören zum Teil `licht_ausstattung` im Ausstattungsmodul. R13: 0 nicht erreichbare Komponenten, R14: 0 Lücken.

<!-- V5a-Ende -->
