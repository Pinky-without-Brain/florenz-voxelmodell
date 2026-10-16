# Bauteilkatalog – Palazzo Spini Feroni (Welle 7a)

Maße und Quellen: [`REFERENZMASSE.md`](REFERENZMASSE.md). Rahmen SF (θ 122,43°), Lagen yr = Y − 61. Bauplan `tools/wahrzeichen/palazzo.js`, Einstellungen `projects/palazzo_spini_feroni/model/_sf.js`, Raumplan und Ausstattung `model/_raeume.js`. Stufen: A belegt, B Literatur oder begründet, C Entwurf.

## 1. Module und Bauteile

| Modul | Titel | Bauteile |
|---|---|---|
| 0 | Fundament, Boden und Hof | `fundament`, `boden`, `hof`, `treppe` |
| 1 | Fassaden | `aussenwand`, `fenster`, `kranzgesims` |
| 2 | Hof | `hofwaende`, `hoffenster`, `trennwaende` |
| 3 | Böden und Decke | `geschossboeden`, `decke`, `trennwaende_og` |
| 4 | Dach und Zinnen | `dach`, `zinnen` |
| 5 | Licht | `licht` |
| 6 | Ausgestaltete Räume, Museum und Hof | `androne`, `cappella_poccetti`, `sala_del_pace`, `museo_ferragamo`, `hof_spini`, `panca`, `licht_ausstattung` |

## 2. Zonen und Wände
- **Geschosse** (Lagen): EG 0..11, Piano nobile 11..21, 2. OG 21..30 (Traufe Y 91); Walmdach und Zinnenkranz bis Lage 35 (höchster Block Y 96). Gesimse aus Pietra forte auf Lage 11, 21, 30.
- **Außenwände** zwei Blöcke dick: unverputzter Pietra-forte-Bruchstein außen, jede vierte Lage behauene Pietra forte; innen Putz.
- **Fenster**: Raster 9, Breite 4, Rundbögen, Biforien (Mittelsäule) im Piano nobile und im 2. OG; Sohlen 3 / 3 / 2, Höhen 5 / 5 / 4.
- **Hof** (Loch 0, 19 × 17): keine Arkaden (nicht belegt). Hofwand zwei Blöcke dick mit Fenstern in den Obergeschossen; vier Türen (3 × 5) vom Erdgeschoss in den Hof. Die Hofwände tragen in den Geschossen oberhalb das Fensterraster der Straßenseite.
- **Öffnungen**: drei Portale (7 × 9) am Borgo Santi Apostoli (zwei) und an der Piazza di Santa Trinita (eines), alle bis zum Boden offen.

## 3. Begehbarkeit
- **Zugang**: drei Portale; R13 beginnt auf den Zellen davor (Gelände Y 61..63).
- **Raumteilung**: acht Trennwandlinien (2 Blöcke stark, Türen 3 × 5) trennen in allen drei Geschossen Vorderräume am Borgo, Androne, Westflügel Nord und Süd, Südtrakt, Ostraum am Hof und Ostflügel.
- **Treppe**: Wendeltreppe aus Pietra serena (Kern 3 × 3) im Ostflügel durch alle drei Geschosse.
- **Unzugänglich** (deklariert): Dachraum unter dem Walmdach; der Zinnenkranz ist nicht begehbar vorgesehen.
- **Licht**: Seelaternen im Boden jedes Raums im Raster 12 (Teil `licht`, bei Ausstattung `licht_ausstattung`).

## 4. Ausgestaltete Innenräume (Modul 6)
Alles vereinfacht in vollen Blöcken; Lage der Räume Stufe C.

| Bauteil | Raum | Lage im Grundriss | Stufe | Inhalt und Quelle |
|---|---|---|---|---|
| `androne` | Androne | EG, hinter dem mittleren Portal (u 30..46, w 0..10) | Existenz A, Lage C | Schachboden aus Pietra serena und Marmor, Wappenschilde in Wandfeldern, Hochrelief (Marmorfeld mit Goldrand) in der Westwand, Tür in den Hof. Quelle: it.wikipedia, Palazzo Spini Feroni (Piamontini 1705) |
| `cappella_poccetti` | Cappella privata | Piano nobile, Westflügel Nord (u −6..26, w 12..31) | Existenz A, Lage C | Cottoboden, Figurenfries (Himmel, Wiese, Gewänder) an den Außen- und Trennwänden, Altar mit Kreuz, sechs Bänke. Quelle: it.wikipedia (Poccetti 1609–1612) |
| `sala_del_pace` | Saal mit Fresken | Piano nobile, Südtrakt (u 27..64, w 33..52) | Existenz A, Lage C | Cottoboden, Wandfelder in Hellblau, Gelb, Weiß mit Goldrahmen, Deckenfresko, Tafel. Quelle: it.wikipedia (Ranieri del Pace) |
| `museo_ferragamo` | Museo Salvatore Ferragamo | EG, Ostflügel (u 65..110, w 23..52) | Existenz A, Lage C | Schachboden Schwarz-Weiß, weiße Wände mit bunten Bildfeldern, neun Vitrinen (Sockel und Glashaube). Quelle: it.wikipedia (seit 1995, im Untergeschoss) |
| `hof_spini` | Hof | Hof (Loch 0) | Hof B, Pflaster C | Wegekreuz aus Pietra serena, Schachmuster aus Pflaster und Marmor |
| `panca` | Steinbank (panca di via) | Fassaden außen, wo das Gelände tiefer liegt als Y 62 | Existenz A, Höhe C | Bank aus Pietra serena, eine Lage hoch, an den Portalen unterbrochen. Quelle: it.wikipedia |
| `licht_ausstattung` | Licht in den Räumen | alle ausgestalteten Räume | – | Regel §1.5 |

## 5. Abweichungen und Nichtgebautes
- Museum im Erdgeschoss statt im Untergeschoss (siehe REFERENZMASSE §4).
- Ballatoio auf Konsolen, Loggia im Erdgeschoss, Stuckaturen: nicht gebaut; keine Arkaden im Hof (nicht belegt).
- Biforien: die Quelle nennt Rundbogenfenster; die Mittelsäulen sind Typologie (Stufe C).
- Durchgang zum Arno (Volta): abgegangen, liegt nicht im Umriss.
- Zellenzahl 4.390 statt der Planzahl 4.392 (Maske des Modells).
