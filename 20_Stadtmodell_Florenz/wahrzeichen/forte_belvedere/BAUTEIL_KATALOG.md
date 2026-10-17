# Bauteilkatalog – Forte di Belvedere (Welle 8c)

Maße und Quellen: [`REFERENZMASSE.md`](REFERENZMASSE.md). Rahmen FB (θ 0°), Lagen yr = Y − 185. Bauplan `projects/forte_belvedere/model/_fb.js` (Festung) und `_fb_pal.js` (Palazzina), Zellen im Speicher mit `tools/wahrzeichen/zellplan.js`; Ausstattung `_fb_ausstattung.js`. Content der Standardmodule: `node tools/diag/w8c_inhalt.js forte_belvedere` (Texte in `tools/diag/w8c_texte_forte.js`). Stufen: A belegt, B Literatur oder begründet, C Entwurf.

## 1. Module und Bauteile

| Modul | Titel | Bauteile |
|---|---|---|
| 0 | Gelände und Hoffläche | `fundament` (Auffüllung bis Y 184 im Norden), `hofflaeche` |
| 1 | Wälle | `waelle` |
| 2 | Bastionen und Brüstung | `plattformen`, `brustwehr` |
| 3 | Tor und Rampe | `torweg` |
| 4 | Stufen zur Wallkrone | `wallstufen` |
| 5 | Palazzina del Belvedere | `pal_boden`, `pal_fassade`, `pal_fenster`, `pal_geschosse`, `pal_trennwaende`, `pal_treppe`, `pal_dach` |
| 6 | Licht | `licht` |
| 7 | Ausstattung | `torwappen`, `uhr`, `pozzo` |

## 2. Zonen und Wände
- **Gelände:** In der Maske trägt der Stadtgrund (`spec/ground.js`) das Gelände höchstens bis Y 184 ab; wo es tiefer liegt, setzt `fundament` Bruchstein von `groundTopY + 1` bis Y 184. Hoffläche auf Lage 0.
- **Wall** (Zone `wall`, Chebyshev-Abstand zum Umriss `d8` ≤ 7): Kern aus Bruchstein, Verkleidung der äußeren zwei Lagen und der Hofseite aus Pietra forte (einzelne Bruchsteine eingestreut); Absatz (Pietra serena) am Außenrand auf Lage 4; **Wallkrone** (Pflaster, `d8` 4–7, vier Blöcke breit) auf Lage 5; **Brüstung** (`d8` 2–3, zwei Blöcke dick) auf Lage 6–7. Es gibt keinen Überhang.
- **Bastionen:** Spitzen des Umrisses mit Winkel ≤ 105° und beiden Kanten ≥ 18 Blöcken (sechs); Fläche innerhalb von 15 Blöcken ist massiv bis Lage 5 (Pflaster oben, Rand zum Hof Pietra forte).
- **Hof:** Pflasterstreifen (7 breit) vom Tor zur Palazzina und Pflaster (6 Blöcke Rand) um die Palazzina, Kies (`gruen_weg`) am Wallfuß und in Feldern, Rasen in Feldern von 14 Blöcken.
- **Tor:** 7 Blöcke breit, Tunnel durch die ganze Wallstärke (lichte Höhe 4, Decke ist die Wallkrone), bis zum Boden offen (alle Tunnelzellen als `tor` deklariert); eine Treppenstufe gleicht das Gelände vor dem Tor an (Y 186).
- **Palazzina** (Rahmen PL, Umriss OSM): Mauern 3 dick, Sockel Pietra forte (Lage 1–2), weißer Putz, Gesimsbänder (Marmor) auf Lage 5, 10, 15; Geschosse 0 / 5 / 10, Decke 15, Walmdach bis Lage 18 (massiv); in jeder Längsseite drei Rundbögen (5 breit, 3–4 hoch, `arkade`) in die Halle; Fenster 3 / 3 / 2 breit im Abstand von 7.

## 3. Begehbarkeit
- **Zugang:** Tor in der Südostkurtine (Gelände davor Y 186); Tunnel → Hoffläche → Palazzina (Bögen an beiden Enden der Halle) und 20 Treppen auf die Wallkrone.
- **Stufen zur Wallkrone:** 20 gerade Läufe aus Treppenblöcken (3 breit, 5 Stufen, Stützmauerwerk darunter) an der Hofseite des Walls, Auswahl nach größtem Abstand (mindestens 38 Blöcke); Kopffreiheit 3.
- **Palazzina:** eine Halle (24 × 68) und sechs Räume je Geschoss, Trennwände 2 dick, Türen 3 × 3; zwei Läufe zu je fünf Stufen (2 breit) im Nordwestraum (Geschosse 0 → 1 → 2), Treppenlöcher in den Böden, Kragstein unter jeder Stufe.
- **Licht:** eine Seelaterne im Torweg, im Raster 12 in der Halle und den Räumen der Palazzina (je Raum gruppiert).
- **Dichtheit:** Wallkrone und Hof sind unüberdeckt (R13 zählt nur überdeckte Räume); Torweg und Bögen deklariert; die Palazzina hat nur diese Öffnungen und Fenster mit Glas.

## 4. Ausstattung (Modul 7)
Alles vereinfacht in vollen Blöcken.

| Bauteil | Titel | Lage | Stufe | Inhalt und Quelle |
|---|---|---|---|---|
| `torwappen` | Medici-Wappen | Brüstung über dem Tor, Lage 6–7, 5 breit | Existenz A, Form C | goldener Rahmen, rote und weiße Felder |
| `uhr` | Uhr | Nordfassade der Palazzina, Außenlage, Durchmesser 5 | Existenz A, Lage C | goldener Rand, dunkle Zeigerachsen |
| `pozzo` | Schachbrunnen | Halle der Palazzina | Existenz A, Lage C | 3 × 3 Kranz aus Pietra forte, Bronzedeckel |

## 5. Abweichungen und Auslassungen
- **Höhen:** keine Quelle nennt Höhen; Wallkrone Lage 5 und Palazzina bis Lage 18 sind Entwurf (OSM: 17 für zwei Ebenen, die Quelle nennt drei Geschosse).
- **Plateau flach:** Die Terrassen der Festung sind zu einer Ebene auf Y 185 zusammengefasst; die Höhenunterschiede des Geländes (Y 180–191) bleiben außen.
- **Tor:** Die Quelle legt das Portal auf die Ostseite; im Modell liegt es an der südöstlichen Kurtine (x −352), weil am Ostzipfel keine Hoffläche hinter dem Wall liegt. Die Rampe mit Tonnengewölbe ist zu einem flachen Tunnel mit einer Stufe vereinfacht.
- **Palazzina:** Die Quelle nennt zwei Logge an den Längsseiten, im Modell ist es eine durchgehende Halle mit je drei Bögen an beiden Enden; die enge Treppe „in der Mauer“ liegt in einem Raum.
- **Nicht gebaut:** Kasematten, Zisterne, Schatzkammer, Schießscharten, Zinnen, gedeckter Gang zum Giardino di Boboli. Die zwei weiteren OSM-Gebäude im Umriss bleiben Hoffläche.
