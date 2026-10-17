# Bauteilkatalog – Palazzo Lenzi (Welle 8a)

Maße und Quellen: [`REFERENZMASSE.md`](REFERENZMASSE.md). Rahmen LN (θ 133,82°), Lagen yr = Y − 55. Bauplan `tools/wahrzeichen/palazzo.js`, Einstellungen `projects/palazzo_lenzi/model/_ln.js`, Raumplan, Loggetta und Ausstattung `model/_raeume.js`. Stufen: A belegt, B Literatur oder begründet, C Entwurf.

## 1. Module und Bauteile

| Modul | Titel | Bauteile |
|---|---|---|
| 0 | Fundament, Boden und Treppe | `fundament`, `boden`, `treppe` |
| 1 | Fassaden | `aussenwand`, `fenster`, `kranzgesims` |
| 2 | Trennwände | `trennwaende` |
| 3 | Böden und Decke | `geschossboeden`, `decke`, `trennwaende_og` |
| 4 | Dach | `dach` |
| 5 | Licht | `licht` |
| 6 | Ausgestaltete Räume und Wappen | `vestibolo`, `ausstellungssaal`, `bibliothek`, `stanza_alcova`, `teatro`, `dachloggetta`, `wappen`, `licht_ausstattung` |

## 2. Zonen und Wände
- **Geschosse** (Lagen): EG 0..10, 1. OG 10..20, 2. OG 20..30 (Traufe Y 85); Walmdach bis Lage 34 (höchster Block Y 89). Gesimse aus Pietra serena auf der obersten Lage.
- **Außenwände** zwei Blöcke dick, verputzt: EG grauer Putz, Obergeschosse Sand; **Graffito an der Piazza-Fassade** in den Obergeschossen: Bänder in der untersten und obersten Lage jedes Geschosses (abwechselnd weiß und dunkel im Zwei-Block-Takt), gemalte Säulchen (weiß und dunkel, 1,6 Blöcke breit) zwischen den Fensterachsen, vereinzelte graue Felder.
- **Fenster**: Rundbogen, Raster 13,7, Breite 4; Sohle 3, Höhe 5 im 1. und 2. OG; keine Fenster im EG (dort die Portale).
- **Loggetta**: über dem mittleren Portal drei Rechtecköffnungen (3 breit, 5 hoch, im Abstand 5) ab 3 Blöcken über dem Boden des 2. OG (deklariert als `loggia`), Brüstung 2 Blöcke.
- **Öffnungen**: fünf Portale zur Piazza (6 × 8), ein Seitenportal zum Borgo Ognissanti (5 × 7), alle bis zum Boden offen.
- **Kein Hof**: Der OSM-Umriss hat kein Loch.

## 3. Begehbarkeit
- **Zugang**: fünf Portale an der Piazza (R13 beginnt auf den Zellen davor, Gelände Y 55..56) und das Seitenportal.
- **Raumteilung** (sieben Trennwandlinien, Türen 3 × 5, alle drei Geschosse): fünf Vorderräume hinter den Portalen (vier Wände bei u 13,7 / 27,4 / 41,1 / 54,8), dahinter Ausstellungssaal und Raum daneben (Wand bei u 41,1) und der Flügel zur Via Montebello (Wand bei w 42,5).
- **Treppen**: Wendeltreppe aus Pietra serena (Kern 3 × 3) im zweiten Vorderraum durch alle Geschosse.
- **Unzugänglich** (deklariert): Dachraum über der obersten Decke.
- **Licht**: Seelaternen im Boden jedes Raums im Raster 12 (Teil `licht`, bei Ausstattung `licht_ausstattung`).

## 4. Ausgestaltete Innenräume (Modul 6)
Alles vereinfacht in vollen Blöcken; Lage der Räume Stufe C.

| Bauteil | Raum | Lage im Grundriss | Stufe | Inhalt und Quelle |
|---|---|---|---|---|
| `vestibolo` | Vestibül | EG hinter dem mittleren Portal (u 28,5..40, w 0,5..18,4) | Existenz A, Lage C | Schachboden Pietra serena/Marmor, Wandfelder zwischen Pilastern. Quelle: it.wikipedia, Palazzo Lenzi |
| `ausstellungssaal` | Ausstellungssaal | EG (u 0..40, w 20,6..41) | Existenz A, Lage C | Pflaster-/Marmorboden, Wandfelder, Rippenraster der Gewölbe unter der Decke. Quelle: it.wikipedia |
| `bibliothek` | Bibliothek | 1. OG über dem Ausstellungssaal | Existenz A, Lage C | Regalwände in Braun, Rot, Grün (Farbfelder), Kassettendecke, Lesetisch. Quelle: it.wikipedia |
| `stanza_alcova` | Stanza dell'Alcova | 1. OG (u 42,2..68,8, w 20,6..41) | Existenz A, Lage C | Stuckwände Weiß/Gold, Schilder Rot/Blau, Hellblau/Gold-Decke. Quelle: it.wikipedia |
| `teatro` | Theater | 1. OG im Flügel (u 43..70, w 43,6..67,5) | Existenz A, Form und Lage C | Holzboden, rote Wandfelder, Bühne und fünf Sitzreihen (ein Block hoch). Quelle: it.wikipedia |
| `dachloggetta` | Boden und Decke der Loggetta | 2. OG über dem Vestibül | Existenz A, Lage C | Cottoboden, Balkendecke. Quelle: it.wikipedia |
| `wappen` | Wappen | Ecke zur Piazza, Seitenportal | Existenz A, Farben C | Schilder aus Farbblöcken mit Goldrand. Quelle: it.wikipedia |
| `licht_ausstattung` | Licht in den Räumen | alle ausgestalteten Räume | – | Regel §1.5 |

## 5. Abweichungen und Nichtgebautes
- Das Planungsdokument nennt „Graffito-Fassade zur Piazza Ognissanti“; die Quelle belegt Graffito als Ersatz für Gesimse, Marcapiano und gemalte Säulchen. Das Modell deutet nur Bänder und Säulchen an, keine Ornamente oder Figuren.
- Die fünf Portale zur Piazza sind gleich geformt; belegt ist nur, dass das zentrale ursprünglich ist.
- Loggetta (Lage, Zahl der Öffnungen), Theater, Alkoven und Bibliothek: Lage und Form Stufe C, nur die Existenz ist belegt.
- Assunzione und mögliche Privatkapelle, Gewölbekapitelle: nicht gebaut.
- Die Wappenfarben (Lenzi, Buini, Strozzi, Frescobaldi) sind nicht belegt; die Schilder tragen Platzhalterfarben.
- Gebäudehöhe und Geschosshöhen folgen der OSM-Schätzung.
- Option `entlangGlatt` in `tools/wahrzeichen/palazzo.js` (Außennormale aus dem Umkreis 3) gesetzt, weil der Rahmen bei θ ≈ 134° diagonal zum Blockraster liegt; sonst zerreißen die Stufen der Kante Fenster und Portalbögen.
