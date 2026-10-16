# Bauteilkatalog – Palazzo Gondi (Welle 7a)

Maße und Quellen: [`REFERENZMASSE.md`](REFERENZMASSE.md). Rahmen GN (θ 80,73°), Lagen yr = Y − 63. Bauplan `tools/wahrzeichen/palazzo.js`, Einstellungen `projects/palazzo_gondi/model/_gn.js`, Raumplan, Hoftreppe und Ausstattung `model/_raeume.js`. Stufen: A belegt, B Literatur oder begründet, C Entwurf.

## 1. Module und Bauteile

| Modul | Titel | Bauteile |
|---|---|---|
| 0 | Fundament, Boden und Hof | `fundament`, `boden`, `hof`, `treppe` |
| 1 | Fassaden | `aussenwand`, `fenster`, `kranzgesims` |
| 2 | Hof | `hofarkaden`, `hofwaende`, `hoffenster`, `innenwaende`, `trennwaende` |
| 3 | Böden und Decke | `geschossboeden`, `decke`, `innenwaende_og`, `trennwaende_og` |
| 4 | Dach | `dach` |
| 5 | Licht | `licht` |
| 6 | Ausgestaltete Räume, Hoftreppe und Hof | `vestibolo`, `treppenhaus`, `scalone`, `cortile`, `hofbrunnen`, `sala_grande`, `kamin_sangallo`, `sala_paesaggi`, `sala_giove_ebe`, `alkoven`, `panca`, `licht_ausstattung` |

## 2. Zonen und Wände
- **Geschosse** (Lagen): EG 0..9, Piano nobile 9..16, 2. OG 16..23 (Traufe Y 86); Walmdach bis Lage 28 (höchster Block Y 91). Gesimse aus Pietra serena auf Lage 9, 16, 23.
- **Außenwände** zwei Blöcke dick: abgestufte Rustika (bugnato) aus Pietra forte, im EG Fugen jede 3. Lage, im 1. OG jede 4. Lage, im 2. OG glatte Pietra forte mit Rustikalagen jede 6. Lage; innen Putz.
- **Fenster**: Raster 10, Breite 4, Rundbögen; Biforien (Mittelsäule) in den Obergeschossen; Sohlen 3 / 2 / 2, Höhen 3 / 3 / 4 (zweites Obergeschoss höher als das erste).
- **Hof** (Loch 0, 8 × 11): Hofwand mit Rundbogenarkaden im EG (Joch 4, Kämpfer 6), dahinter Galerie (3 Blöcke) und Innenwand mit je einer Tür (3 breit) pro Hofseite in allen Geschossen. Der Lichthof (Loch 1, 10 Zellen) bleibt ein kleiner offener Schacht.
- **Öffnungen**: drei Portale zur Piazza San Firenze (7 × 8, in der Achse von Fensterachsen), alle bis zum Boden offen.

## 3. Begehbarkeit
- **Zugang**: drei Portale an der Ostfassade; R13 beginnt auf den Zellen davor (Gelände Y 62..64).
- **Raumteilung**: sieben Trennwandlinien (2 Blöcke stark, Türen 3 × 5) in allen drei Geschossen: Nordostraum | Vestibül | Südostraum an der Fassade; Treppenhaus (Nordflügel) und großer Saal (Südflügel) neben dem Hof; Nordwest- und Südwestraum dahinter. Die Hofinnenwand hat pro Seite eine Tür zum Hof bzw. zur Galerie.
- **Treppen**: Hoftreppe nach Sangallo (Modul 6, `scalone`) vom EG ins Piano nobile; Wendeltreppe aus Pietra serena (Kern 3 × 3) im Südwestraum durch alle drei Geschosse.
- **Unzugänglich** (deklariert): Dachraum über der obersten Decke.
- **Licht**: Seelaternen im Boden jedes Raums im Raster 12 (Teil `licht`, bei Ausstattung `licht_ausstattung`).

## 4. Ausgestaltete Innenräume und Hoftreppe (Modul 6)
Alles vereinfacht in vollen Blöcken; Lage der Räume Stufe C.

| Bauteil | Raum | Lage im Grundriss | Stufe | Inhalt und Quelle |
|---|---|---|---|---|
| `vestibolo` | Vestibül | EG, hinter dem mittleren Portal (u 22..36, w 0..19) | Existenz A, Lage C | Schachboden aus Pietra serena und Marmor, Wandfelder, Fries aus Pietra serena als Platzhalter der Reliefs. Quelle: it.wikipedia, Palazzo Gondi |
| `treppenhaus` | Treppenhaus | EG und Piano nobile, Nordflügel (u −4..19, w 20..42) | Existenz A, Lage C | Pflaster im Schachmuster, Wandfelder mit Pilastern, Kassettendecke im Piano nobile (Füllhörner und Diamanten nur als Goldfelder). Quelle: it.wikipedia |
| `scalone` | Hoftreppe nach Sangallo | Nordflügel, Aufstieg nach Westen (u 5,5, w 23..32) | Existenz A, Lage und Länge C | **Neun Treppenblöcke** (Pietra serena, zwei Blöcke breit) vom EG-Boden zum Boden des Piano nobile, **Kragstein** (Pietra-serena-Block) unter jeder Stufe, Treppenloch im Boden darüber (Kopffreiheit 3). Quelle: it.wikipedia |
| `cortile` | Hof | Hof (Loch 0) | Hof A, Pflaster C | Wegekreuz aus Pietra serena, Schachmuster aus Pflaster und Marmor. Quelle: it.wikipedia |
| `hofbrunnen` | Brunnen mit doppelter Schale | Hofmitte (u 28,65, w 30,1) | Existenz A, Maße C | Becken (Radius 3) mit Wasserfläche, Mittelsäule mit zweiter Schale. Quelle: it.wikipedia (1652) |
| `sala_grande` | Großer Saal | Piano nobile, Südflügel (u 40..70, w 20..42) | Existenz A, Lage C | Schachboden, Wandfelder mit Bildern in Goldrahmen (Raster statt genau elf Porträts), Kassettendecke, Tafel. Quelle: it.wikipedia |
| `kamin_sangallo` | Kamin mit Herkules und Samson | Westwand des großen Saals | Existenz A, Lage C | Kamin (Wangen, Sturz, Rauchfang) und zwei Blockfiguren auf Sockeln daneben. Quelle: it.wikipedia (Kamin 1501–1505) |
| `sala_paesaggi` | Sala dei Paesaggi | Piano nobile, Nordostraum (u −4..21, w 0..19) | Name A, Lage C | Wandfelder in Grün und Hellblau als Landschaften, Goldrahmen, Tafel. Quelle: it.wikipedia |
| `sala_giove_ebe` | Sala di Giove ed Ebe | Piano nobile, Südostraum (u 37..70, w 0..19) | Name A, Lage C | Wandfelder in Blau und Weiß, rundes Götterhimmel-Deckenbild. Quelle: it.wikipedia |
| `alkoven` | Alkoven von 1710 | Piano nobile, Nordwestraum (u −6..34, w 43..62) | Existenz A, Lage C | Stuckwände in Weiß und Gold, Deckenfresko in Rot und Hellblau. Quelle: it.wikipedia |
| `panca` | Sockelbank (panca di via) | Fassade zur Piazza San Firenze, außen | Existenz A, Höhe C | Bank aus Pietra serena, eine Lage hoch auf dem Straßenpflaster, an den Portalen unterbrochen. Quelle: it.wikipedia |
| `licht_ausstattung` | Licht in den Räumen | alle ausgestalteten Räume | – | Regel §1.5 |

## 5. Abweichungen und Nichtgebautes
- Altana auf dem Dach (Säulen, in Achse mit dem zweiten Portal): belegt, nicht gebaut (Dach nicht begehbar vorgesehen).
- Fassade Poggis an der Via dei Gondi (fünf Achsen, drei Portale, dreieckige Terrasse) und seine zweite Treppenrampe: belegt, nicht gebaut; die Südkante des Umrisses ist schräg und trägt nur das Fensterraster.
- Wangen mit Tier- und Pflanzenmotiven und gedrehte Balustraden der Hoftreppe: nicht gebaut (an der offenen Seite keine Brüstung).
- Strahlenförmige Fensterprofile, Kreuzsteine, Konsolen am Dachgesims, korinthische Kapitelle: nicht ausgeformt.
- Ahnenporträts als Wandfelder im Raster (die Zahl elf ist belegt, die Verteilung nicht).
- Die Zahl der Zellen (3.997) weicht von der Planzahl 4.018 ab; maßgeblich ist die Maske des Modells.
