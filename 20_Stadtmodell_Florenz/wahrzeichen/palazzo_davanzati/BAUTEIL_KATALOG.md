# Bauteilkatalog – Palazzo Davanzati (W5c)

Maße: [`REFERENZMASSE.md`](REFERENZMASSE.md). Rahmen achsparallel (`iu = x + 659`, `iw = z − 669`), Lagen `yr = Y − 63`. Bauplan `projects/palazzo_davanzati/model/_pd.js` (ein Plan als Zellen im Speicher, Hilfswerkzeug `tools/wahrzeichen/zellplan.js`), Module m0–m6 sind Teillisten; Räume in `_pd_felder.js`. Projekt `type: "wahrzeichen"`, `"begehbarkeit": "pflicht"`, Rollen der Palette, Blockzahl 35.851 (±5 %).

| Modul | Titel | Bauteile (Bau-Reihenfolge) | Inhalt, Stufe |
|---|---|---|---|
| 0 | Erdgeschossboden | `boden` | Pflaster über den ganzen Umriss, Schachbrett in der Androne, Hof mit Rauten – C |
| 1 | Fassade | `fassade_eg`, `wappen`, `fassade_og`, `ferri` | Bugnato (`pietra_forte_rustika`), drei Bögen 7 breit (`tor`), Pietra-serena-Rahmen; Putz (`putz_sand`), 3 × 5 Fensterachsen (Glas in allen 3 Lagen), Marcapiano; Wappen aus `gold`/`fresko`; Halter aus `bronze` – A |
| 2 | Mauern und Geschossböden | `aussenwaende`, `hofwaende`, `innenwaende`, `boden_1` bis `boden_4`, `anbau_dach` | Mauern 2 dick, innen `putz_weiss`; Hofwand mit Portikus (Nord, Ost; `loggia`), Hoffenster, Türen 3 × 5; sechs Räume im Ring; Böden Cotto (`dachziegel`) – A/C |
| 3 | Hof, Treppe, Altana, Dach | `brunnen`, `hoftreppe`, `altana`, `dach` | Ziehbrunnen mit `wasser`, `holz`, `bronze`; vier Läufe (`stone_stairs`, `dark_oak_stairs`) mit Kragsteinen, vier Plattformen; Altana auf sechs Stützen (`loggia`), Holzdecke; massives Dach aus `dachziegel`, Vorsprung mit Konsolen – A/C |
| 4 | Licht | `licht` | Seelaternen im Boden, je Raum Abstand ≤ 9 – C |
| 5 | Piano nobile | `sala_madornale`, `sala_pappagalli`, `studiolo`, `sala_pavoni` | siehe unten |
| 6 | Obere Räume | `camera_castellana`, `camera_impannate`, `kueche`, `altana_ausstattung`, `androne` | siehe unten |

## Ausgestaltete Innenräume (W5c)
Alle Räume sind eigene Bauteile mit Content; Wandfelder ersetzen Zellen der inneren Wandlage (Rolle `fresko`, Rahmen `gold`, Sockel `holz`), Möbel sind volle Blöcke und Treppenblöcke. Quelle jeweils it.wikipedia / en.wikipedia „Palazzo Davanzati“; die Muster sind **vereinfacht, nicht nach Vorbild**.
- **Sala Madornale** (1. Stock, Straßenseite, 5 Fenster): Holzsockel, Wappenfries über den Fenstern, gefelderte Teppichfelder an den Schmalwänden, Deckenbalken, Tafel 13 × 2 mit Stühlen, Kamin – A (Raum, Fenster), C (Möblierung).
- **Sala dei Pappagalli**: Rautenfelder mit Papageien (Rot, Gelb, Weiß, Blau auf Grün) – A (Motiv), C (Muster).
- **Studiolo**: Täfelung, Bildtafeln (Scheggia), Schreibtisch, Bücherwand – A/C.
- **Sala dei Pavoni** (Schlafzimmer): Pfauen an der Rückwand, geometrischer Wirkteppich, Wappenfries, Bett – A (Motiv), C.
- **Camera della Castellana di Vergy** (2. Stock): Bildfries (Fünf-Block-Band mit 6 × 3 Bildfeldern: Burg, Ritter, Dame), Bett, Truhe, Desco-da-parto-Tafel – A (Zyklus um 1350), C (Szenen).
- **Camera delle Impannate** und **Küche** (3. Stock): gemalte Draperie, Bett; Küche mit Herd, Rauchfang, Tisch, Teigtrog, Regalen mit Kupfergerät – A/C.
- **Altana**: Bänke, Pflanzkübel, zwei Wappenfelder – C.
- **Androne**: Steinbänke – C.

## Begehbarkeit und Dichtheit
Zugang über drei Tore (7 × 5 bis 7); Innentüren 3 × 5; Treppe vom Hof durch alle Geschosse bis in die Altana mit Kopffreiheit ≥ 3 (Läufe in zwei Spuren, Plattformen im Wechsel Süd/Nord, Türen zu den Räumen an den Plattformen); Böden je Geschoss; Licht ≤ 12 Blöcke; Fenster verglast. Der Hof ist offen: seine Wandöffnungen und die Luft unter den Plattformen sind als `loggia` deklariert, die Torbögen als `tor`, die Bögen der Altana als `loggia`. Dachflächen sind massiv (kein Dachraum ohne Zugang). R13: 0 nicht erreichbare Komponenten, R14: 0 Lücken.
