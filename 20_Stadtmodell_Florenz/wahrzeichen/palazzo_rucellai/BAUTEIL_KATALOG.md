# Bauteilkatalog – Palazzo Rucellai (V3 D4)

Maße: [`REFERENZMASSE.md`](REFERENZMASSE.md). Rahmen PR (θ −13,5°), Lagen yr = Y − 60. Bauplan `tools/wahrzeichen/palazzo.js`, Einstellungen `projects/palazzo_rucellai/model/_pr.js` (Material der Fassade: Pilaster, Quader, Sitzbank).

| Modul | Titel | Bauteile |
|---|---|---|
| 0 | Fundament, Boden und Hof | `fundament`, `boden`, `hof`, `treppe` |
| 1 | Fassaden | `aussenwand`, `fenster`, `kranzgesims` |
| 2 | Hof | `hofarkaden`, `hofwaende`, `hoffenster`, `innenwaende` |
| 3 | Böden und Decke | `geschossboeden`, `decke` |
| 4 | Dach | `dach` |
| 5 | Licht | `licht` |
| 6 | Ausgestaltete Innenräume | `sala_prima`, `sala_seconda`, `sala_terza`, `hof_rucellai`, `licht_ausstattung` |

Begehbarkeit: zwei Portale, Hofarkaden, Innentüren, Wendeltreppe durch alle Geschosse; Dachraum unzugänglich.

<!-- V5a-Anfang -->
## Ausgestaltete Innenräume (V5a)

Geschosse: EG Lage 0..20, Piano nobile 20..37, 2. OG 37..52 (Rahmen PR, θ −13,5°). Bauplan und Raumteilung: `tools/wahrzeichen/palazzo.js` (`cfg.raeume`), Raumplan und Ausstattung: `projects/palazzo_rucellai/model/_raeume.js`, Werkzeug `tools/wahrzeichen/palazzo_raum.js`. Modul 6 (nach dem Licht in Modul 5). Alles vereinfacht, nicht nach Vorbild; Stufen: A belegt, B Literatur oder begründet, C Entwurf.

**Raumteilung.** Vier Trennwandlinien (Türen 3 × 5): zwei Querwände und eine Längswand teilen den Fassadenblock in je drei Vorder- und Hintersäle, eine Wand trennt im Ostflügel das Treppenhaus vom Nordteil. Hofgalerie, Portale und Wendeltreppe bleiben frei. Jedes Geschoss bleibt eine zusammenhängende Raumgruppe (Test `tools/test/palazzi.test.js`).

| Bauteil | Titel | Lage im Grundriss | Stufe | Inhalt und Quelle |
|---|---|---|---|---|
| `sala_prima` | Erster Saal | Piano nobile, Fassadensaal West (u 4..20, w −20..−3) | Inhalt C, Lage C | Saal im Piano nobile an der Fassade: Boden im Schachmuster aus Terrakotta und Marmor, Wandfelder in Gelb und Weiß mit Pilastern und Holzsockel, Kassettendecke aus dunkler Eiche und Gold, Kamin an der Hinterwand, Tisch und Bänke. Der Palast entstand um 1446 bis 1451 nach Plänen Leon Battista Albertis (Quelle: it.wikipedia, Palazzo Rucellai). |
| `sala_seconda` | Zweiter Saal | Piano nobile, Fassadensaal Mitte (u 20..36, w −20..−3) | Inhalt C, Lage C | Saal im Piano nobile an der Fassade: Boden im Schachmuster aus Terrakotta und Marmor, Wandfelder in Hellblau und Weiß mit Pilastern und Holzsockel, Kassettendecke aus dunkler Eiche und Gold, Kamin an der Hinterwand, Tisch und Bänke. Bernardo Rossellino führte den Bau aus (Quelle: it.wikipedia, Palazzo Rucellai). |
| `sala_terza` | Dritter Saal | Piano nobile, Fassadensaal Ost (u 36..52, w −20..−3) | Inhalt C, Lage C | Saal im Piano nobile an der Fassade: Boden im Schachmuster aus Terrakotta und Marmor, Wandfelder in Grün und Weiß mit Pilastern und Holzsockel, Kassettendecke aus dunkler Eiche und Gold, Kamin an der Hinterwand, Tisch und Bänke. Die Fassade zeigt dorisch, ionisch und korinthisch übereinander (Quelle: it.wikipedia, Palazzo Rucellai). |
| `hof_rucellai` | Hof | Hof (u 12..25, w −65..−44) | C | Hofpflaster im Schachmuster, ein Brunnenbecken mit Mittelsäule und vier Kübel mit Bäumchen an den Ecken. Der Hof des Palazzo Rucellai ist von Arkaden umgeben (Quelle: it.wikipedia, Palazzo Rucellai). |
| `licht_ausstattung` | Licht in den Sälen | alle ausgestalteten Räume | Regel §1.5 | Seelaternen im Boden der ausgestalteten Räume, höchstens 12 Blöcke voneinander entfernt. In Minecraft sind Innenräume ohne Lichtquelle dunkel. |

**Begehbarkeit und Licht.** Die drei Fassadensäle bilden eine Enfilade (Türen in den Querwänden); die Kamine stehen neben den Türen der Hinterwand. Jeder Raum bekommt Seelaternen im Boden (Raster 12, je Raum getrennt); Lichter neben Ausstattungszellen gehören zum Teil `licht_ausstattung` im Ausstattungsmodul. R13: 0 nicht erreichbare Komponenten, R14: 0 Lücken.

<!-- V5a-Ende -->
