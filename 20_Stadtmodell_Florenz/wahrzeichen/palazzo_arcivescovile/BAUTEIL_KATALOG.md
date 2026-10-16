# Bauteilkatalog – Palazzo Arcivescovile (Welle 6c)

Maße und Quellen: [`REFERENZMASSE.md`](REFERENZMASSE.md). Rahmen AA (θ 93,7°), Lagen yr = Y − 64. Bauplan `tools/wahrzeichen/palazzo.js`, Einstellungen `projects/palazzo_arcivescovile/model/_aa.js`, Raumplan und Ausstattung `model/_raeume.js`. Stufen: A belegt, B Literatur oder begründet, C Entwurf.

## 1. Module und Bauteile

| Modul | Titel | Bauteile |
|---|---|---|
| 0 | Fundament, Boden und Hof | `fundament`, `boden`, `hof`, `treppe` |
| 1 | Fassaden | `aussenwand`, `fenster`, `kranzgesims` |
| 2 | Hof | `hofarkaden`, `hofwaende`, `hoffenster`, `innenwaende`, `trennwaende` |
| 3 | Böden und Decke | `geschossboeden`, `decke`, `innenwaende_og`, `trennwaende_og` |
| 4 | Dach | `dach` |
| 5 | Licht | `licht` |
| 6 | Ausgestaltete Innenräume | `sala_udienza`, `salone`, `treppenhaus`, `chiesa_san_salvatore`, `chiesa_gewoelbe`, `hof_erzbischof`, `wappen_fassade`, `licht_ausstattung` |

## 2. Zonen und Wände
- **Geschosse** (Lagen): EG 0..10, Piano nobile 10..21, Mezzanin 21..29, Mezzanin 29..37 (Traufe Y 101); Walmdach bis Lage 41 (Y 105 … höchster Block 106). Gesimse aus Marmor auf Lage 10, 21, 29, Kranzgesims Lage 36–37.
- **Außenwände** zwei Blöcke dick: Fassade zur Piazza San Giovanni (w < 2,5) mit Sockel aus Pietra serena und Bändern aus Pietra forte im EG, sonst ockerfarbener Putz; die anderen Seiten Putz.
- **Hof**: Hofwand mit Rundbogenarkaden im EG, dahinter Galerie (3 Blöcke), Innenwand mit Türen (Raster 14); in den Obergeschossen Hoffenster im Raster der Fassade.
- **Öffnungen**: zwei Portale zur Piazza San Giovanni (6 × 9), Kutschentor und Kirchenportal in der schrägen Westwand (Schnitt im Rahmen, `TORE_WEST`: Die Zellen der schrägen Wand liegen nicht auf dem Raster der Fassade, deshalb nicht über `cfg.portale`).

## 3. Begehbarkeit
- **Zugang**: vier Tore von Platz und Straße (zwei Hauptportale, Kutschentor, Kirchenportal), alle bis zum Boden offen. R13 beginnt auf den Zellen davor.
- **Raumteilung**: neun Trennwandlinien (2 Blöcke stark, Türen 3 × 5) trennen in allen Geschossen Salone, Sala dell'Udienza, Südsaal, Treppenhaus, Westflügel Nord und Süd, Südflügel und Kirche. Die Türen der Hofinnenwand (Raster 14) führen in die Räume; zur Kirche öffnet sich im EG eine 5 Blöcke breite Tür vom Hof, zum Kutschentor eine 6 Blöcke breite.
- **Treppe**: Wendeltreppe aus Pietra serena (Kern 3 × 3) im Treppenhaus des Nordflügels, durch alle vier Geschosse, Treppenlöcher in den Böden.
- **Kirche**: Der Boden des Piano nobile entfällt über dem Schiff (`vorher` in `_raeume.js`), das Tonnengewölbe ist massiv bis unter den Boden des 2. Mezzanins.
- **Unzugänglich** (deklariert): Dachraum über der obersten Decke.
- **Licht**: Seelaternen im Boden jedes Raums im Raster 12 (Teil `licht`, bei Ausstattung `licht_ausstattung`).

## 4. Ausgestaltete Innenräume (Modul 6)
Alles vereinfacht in vollen Blöcken; Lage der Räume Stufe C.

| Bauteil | Raum | Lage im Grundriss | Stufe | Inhalt und Quelle |
|---|---|---|---|---|
| `sala_udienza` | Sala dell'Udienza | Piano nobile, Fassadenmitte (u 39..88, w 2..28) | Existenz A, Lage C | Schachboden, Wandfelder in Gelb und Weiß mit Goldrahmen und Pilastern, Himmelsfeld mit vier Rundbildern (Bischofsbildnisse auf den Pendentifs), Thronpodest, Tisch. Quelle: it.wikipedia, Palazzo Arcivescovile (Ferrucci 1615–20) |
| `salone` | Salone | Piano nobile, Nordende (u 0..37, w 2..28) | Existenz A, Lage C | Schachboden, leere Wandfelder (die Fresken Meuccis sind verloren), Kassettendecke, Tisch. Quelle: it.wikipedia |
| `treppenhaus` | Treppenhaus | EG und Piano nobile, Nordflügel (u 0..38, w 29..55) | Existenz A (Ausstattung 1736–38), Lage C | Pflaster im Schachmuster, Wandfelder zwischen Pilastern aus Pietra serena um die Wendeltreppe. Quelle: it.wikipedia |
| `chiesa_san_salvatore` | Kirche San Salvatore al Vescovo | EG und Piano nobile, Südwestecke zur Piazza dell'Olio (u 90..110, w 37..63) | Existenz, Lage, Zugang A; Maße C | Marmorboden mit Mittelstreifen, Wandfelder, Presbyterium mit Hochaltar, Altarbild (Anbetung der Hirten, Ferretti 1738) als Farbfeld, zehn Bänke aus Holz (eine Lage hoch), Portal und drei Blendarkaden auf Halbsäulen in Weiß und Grün an der Fassade zur Piazza dell'Olio. Quelle: it.wikipedia, Chiesa di San Salvatore al Vescovo |
| `chiesa_gewoelbe` | Tonnengewölbe | über dem Schiff (Lage 13..20) | Existenz A, Form C | Segmentbogen über 19 Blöcke Spannweite, Farbfläche in Himmelsblau, Weiß und Gelb mit Goldrippen (Himmelfahrt Christi, Meucci). Quelle: it.wikipedia |
| `hof_erzbischof` | Hof | Hof (u 44..87, w 29..53) | Hof A, Pflaster C | Schachmuster aus Pflaster und Marmor mit zwei Mittelstreifen aus Pietra serena |
| `wappen_fassade` | Wappen an der Fassade | Piano nobile, Fassade (u 7..11 und u 105..110) | Existenz A, Lage B, Farben C | Zwei Wappenschilde als Farbfelder: Medici mit Triregno an der Ecke zur Via de' Cerretani, Erzbischof Bausa (1895) am anderen Ende. Quelle: it.wikipedia |
| `licht_ausstattung` | Licht in den Sälen | alle ausgestalteten Räume | Regel §1.5 | Seelaternen im Boden |

## 5. Abweichungen und Auslassungen
- **Palasttreppe** im Hof (an drei Seiten von Arkaden überdeckt) und **Serliana** an den Schmalseiten: nicht gebaut, die Wendeltreppe im Nordflügel erschließt die Geschosse.
- **Ionische Loggia** über den Hofarkaden: durch Fenster der Hofwand ersetzt.
- **Fensterbekrönungen** (abwechselnd dreieckige und bogenförmige Giebel) und die Namenszüge Alessandros de' Medici: nicht gebaut.
- **Chorkuppel** der Kirche (Ferretti, Verklärung) und die Seitenaltäre: nicht gebaut, da Anzahl und Lage nicht belegt sind; die Himmelfahrt Christi am Gewölbe ist nur als Farbfläche angedeutet.
- **Mezzanin-Geschosse** sind ganze Geschosse zu 8 Blöcken; die tatsächlichen Höhen sind nicht belegt, die Summe (37) folgt OSM.
- **Bibliothek** und weitere Kapellen: keine Quelle zur Lage, deshalb nicht gebaut.
