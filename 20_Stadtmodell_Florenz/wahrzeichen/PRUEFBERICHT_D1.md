# Prüfbericht D1 – Wahrzeichen Welle 1 (Signoria)

Prüfung der Spezifikationen `UEBERSICHT.md`, `PIAZZA_STADTGRUND.md` und der vier Ordner. **Die Korrekturen hier gehen den Katalogen vor.** Wenn ein Bau-Agent einen Widerspruch findet, der hier nicht geregelt ist, wendet er K0 an und meldet ihn.

## Entscheidungen zu den offenen Fragen (UEBERSICHT §6)
| Nr. | Frage | Entscheidung |
|---|---|---|
| 1 | Breite des Piazzale (OSM 13 m gegen Literatur 18 m) | **OSM gilt.** Wird mit dem Bildindex (A5) überprüft. |
| 2 | Turmhöhe des PV | **94 m** (188 Lagen). |
| 3 | Höhe von Orsanmichele | **40 m** (80 Lagen). |
| 4 | Bogenzahl und Straßenseiten von Orsanmichele | wie im Katalog (3/2). |
| 5 | Fensterachsen und Portal des PV | `PV_AXES = 9`, Portal bei u = 55, als **Parameter oben in der Moduldatei**, damit sich beides nach einer Fotoprüfung leicht ändern lässt. |
| 6 | Lage des Salone, Funktion der Höfe | wie im Katalog. |
| 7 | Tribuna-Oktogon | OSM-Grundriss, Höhen wie im Katalog (Stufe C). |
| 8 | Höhen und Querschnitt des Korridors | wie im Katalog. |
| 9 | Westseite der Loggia | geschlossen, wie im Katalog. |
| 10 | Wahrzeichen-Vorrang im Quartiergenerator | wird in **W0** umgesetzt (Vorrangmasken in `parzellen.js`). |
| 11 | Stadtgrund | **eigenes Projekt in einer späteren Phase.** Bis dahin baut kein Projekt Gelände. Die Wahrzeichen bauen Fundament und Platte wie im Katalog; in Säulen mit `groundTopY ≥ bodenY` steht die Platte im Gelände (R3: Bodenkontakt nach der Standardregel). |
| 12 | Optionen | **Alle bauen** (Statuen, `innenwaende_a`, `spinnwand_fluegel`, Orsanmichele-Bogen). Statuen erhalten im Content den Hinweis „vereinfachte Blockfigur“. Neptunbrunnen und Reiterstandbild gehören zum Stadtgrund und entfallen vorerst. |

## Korrekturen
- **K0 Überlappungen (alle Projekte).** R1 verlangt, dass jede Zelle genau einem Bauteil gehört. Vergeben zwei Bauteile dieselbe Zelle, gilt die Rangfolge:
  1. Das **Detail** gewinnt: Öffnung, Rahmen, Ornament, Gesims, Wappen, Treppenloch.
  2. Das **allgemeine** Bauteil (Wand, Decke, Platte) lässt die Zelle aus.
  3. Bei zwei gleichrangigen Bauteilen gewinnt das zuerst gebaute. Das spätere lässt die Zelle aus.

  Beispiele (verbindlich):
  - **Loggia:** `frontwand_ueber_bogen` Lage 14..24, `fries` und `medaillons` Lage 25..27.
  - **Orsanmichele:**
    - `og2_wand` Lage 52..69 ohne Fenster und Wappen
    - Wappen OG2 Lage 68..69
    - `arkadenfries` Lage 70..73
    - `kranzgesims` Lage 74
    - `decke_og2` Lage 74 nur `d ≥ 4`
    - Decken lassen Treppenlöcher aus
  - **Uffizien:** `gurtgesimse` lassen die Giebelzellen von `nobile_wand` aus. Decken lassen Treppenlöcher und den Tribuna-Raum aus.
- **K1 PV Rustika.** Die ganze Fassade des Arnolfo-Blocks (Zone A, alle Außenkanten, y_rel 1..49) ist aus Pietra-forte-Rustika: `og1_wand_west`, `og2_wand_west` und `og_wand_nord_sued_a` bekommen die Rolle `pietra_forte_rustika` statt `pietra_forte`. Ballatoio, Zinnen und Turm bleiben `pietra_forte`.
- **K2 PV Turm im Palast.**
  - `turm_unterbau` wandert aus Modul 9 als **erstes Bauteil in Modul 4**, damit der Schaft auf einem früher gebauten Auflager steht.
  - Es besitzt in y_rel 1..62 alle Zellen des Turmwandbandes (`d8_T ≤ 4`), außer den Zellen, die die Außenwände sowie Ballatoio und Zinnen (Module 1–3) schon belegen.
  - Alle Decken (Modul 9) und das Dach `dach_arnolfo` lassen das **ganze Turmpolygon** aus. Der Turmhohlraum bleibt von y_rel 1 bis 143 leer.
- **K3 PV Treppe.** `treppen_michelozzo` entfällt (6 breit passt nicht in den 3 breiten Hofgang).
- **K4 PV Salone.** `salone_waende`, `salone_decke` und `dach_salone` belegen nur Zellen außerhalb der Außenwandbänder (`d8 > t(y)`). Die Außenwand gewinnt.
- **K5 Loggia.** „`medici_loewen` … (Lage 68)“ meint **Y 68** (Lage 1).
- **K6 Statuen.** Alle Statuen sind optionale Bauteile im jeweils letzten Modul. Content-Text: „vereinfachte Blockfigur, nicht nach Vorbild“.
- **K7 Luftraum.** Zellen außerhalb der OSM-Maske sind nur in den Fällen erlaubt, die der jeweilige Katalog in §0.5/§0.6 nennt. W0 liefert dafür eine Prüfung (R12).
- **K8 Uffizien-Korridor.** Zellen von w1344547176 innerhalb `M_UF` gehören den Modulen 0–7 (keine eigenen Korridorbauteile dort). `M_COR` gilt nur für Modul 8.

## Reihenfolge
1. **W0 Infrastruktur:**
   - gemeinsame Bibliothek `tools/wahrzeichen/` (Rahmen, Masken, Abstandsfelder, Kantenrahmen)
   - `project.json`-Felder
   - Vorrangmasken im Quartiergenerator
   - R12 Luftraum
2. **W1–W4 Bau** (parallel, je ein Agent pro Wahrzeichen):
   - W1 Orsanmichele
   - W2 Loggia
   - W3 Palazzo Vecchio
   - W4 Uffizien mit Korridor
3. **Abnahme:**
   - `--cross` über `duomo`, `domplatz_ring` und die vier Wahrzeichen
   - Sichtprüfung in der Webapp
