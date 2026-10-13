# Bauteil-Katalog – Palazzo Pitti (`palazzo_pitti`, V3 D2)

Verbindlich für die Umsetzung. Maße und Herkunft: [`REFERENZMASSE.md`](REFERENZMASSE.md). Pipeline: [`tools/ARCHITEKTUR.md`](../../../tools/ARCHITEKTUR.md) (§0, §3, §10). Palette: `tools/spec/palette.js` (**Rollen**). Blockzahlen ±30 %. Projekt `type: "wahrzeichen"`, Moduldateien `projects/palazzo_pitti/model/m0_*.js` … `m9_*.js`. Bauteile stehen in Bau-Reihenfolge. Rahmenfunktionen und Masken aus `tools/wahrzeichen/` (Welle 1).

## 0. Allgemeine Regeln

### 0.1 Projektfelder (`project.json`)
```json
{ "id": "palazzo_pitti", "title": "Palazzo Pitti", "type": "wahrzeichen",
  "gebaeude": ["r1637338"],
  "bodenY": 83,
  "rahmen": { "ox": -1226, "oz": 1864.5, "thetaDeg": -33.1 },
  "masken": {
    "korridor": { "gebaeude": ["w1344547176", "w1394832037", "w1394832038", "w1394832039", "w1394832040",
                               "w1394832041", "w1394832042", "w1394832043"],
                  "xMax": -529, "abzugHaupt": true, "abzugProjekte": ["ponte_vecchio", "uffizi"],
                  "abzugAlle": true, "gelaendeBis": "frei" }
  },
  "luftraum": 3 }
```
`abzugAlle` und `gelaendeBis` sind neue Felder (W0-Erweiterung, Übersicht Welle 2 §6). Der Korridor-Abzug nimmt die Zellen von `ponte_vecchio` (Brücke, Läden, Turm, Korridor bis z ≤ 1311) und `uffizi` (`M_COR`, x ≥ −528) weg; übrig bleiben die Oltrarno-Zellen ab z ≥ 1312 (**8.742 Zellen**) und die eine Zelle, die der Palast selbst belegt, entfällt (`abzugHaupt`).

### 0.2 Rahmen `PI`
- Ursprung `O = (−1226 | 1864,5)`, **θ = −33,1°** (von +x nach +z), cosθ = 0,8377, sinθ = −0,5461.
- `x = O.x + u·cosθ − w·sinθ`, `z = O.z + u·sinθ + w·cosθ`; Rückabbildung `u = (x−O.x)·cosθ + (z−O.z)·sinθ`, `w = −(x−O.x)·sinθ + (z−O.z)·cosθ`. Rasterung durch Rückabbildung der Zellmitte, halboffene Intervalle.
- **u** entlang der Hauptfassade nach Nordost, **w nach innen** (Südost); die Piazza liegt bei **w < 0**. Spiegelachse der Hauptfassade u = 172,75 (kein `symmetry`-Flag: schräge Fassade, R8 nicht anwendbar).
- **Höhe:** `y_rel = Y − bodenY`, **`bodenY = 83`**, Plattenoberkante Y 83, Lage 1 = Y 84. Gesimsoberkante Lage 76 = Y 159.

### 0.3 Maske, Zonen und Wandbänder
`M_PI` = Zellen von r1637338 (43.956 Zellen, Rand zählt innen, die drei Löcher ausgespart; **Höfe zählen als innen** für R12 und gehören dem Projekt, Hofböden Modul 0). **Jedes Bauteil wird mit `M_PI` (bzw. den Höfen, wo ausdrücklich genannt) geschnitten.**

| Zone | Definition (stetige u, w; erste Übereinstimmung) | Zellen | Höhe |
|---|---|---|---|
| **F** Ali (Seitenflügel) | w < 0 oder u < 0 oder u ≥ 345,5 | 10.127 | 22 Lagen |
| **W** Westlicher Nebenbau | 0 ≤ u < 60, w ≥ 50 | 2.291 | 50 Lagen |
| **H** Hauptkörper | alle übrigen (Mittelbau, Hof-Flügel, Rückbau) | 31.538 | 76 Lagen |
| **FA** Fassadenstreifen | 0 ≤ u < 345,5, 0 ≤ w < t(y) (Teil von H) | 1.559 / 1.213 | – |

Abstandsfelder aus `Maske`: `d8(x,z)` (Randzelle = 1, Löcher zählen als innen) und `dLoch(i,x,z)` (Loch i, erste Zelle im Material = 1). Wandband außen `{d8 ≤ t}`, Wandband am Hof `{dLoch ≤ t}`.
**Wandstärke `t(y_rel)`:** 1..25 → **5**; 26..74 → **4**; Gesims 75..76 → 4; Flügel Lage 1..20 → 5. Wände sind massiv, Öffnungen gehen durch die volle Dicke, **Glas in der Mittelebene** (`d = 3` im EG, `d = 2` darüber), Rahmen in `d = 1`.

### 0.4 Höhenraster (Lagen)
| Zone | Lagen | Inhalt |
|---|---|---|
| H, Erdgeschoss | 1..25 | Decke Lage 24..25 |
| H, 1. Obergeschoss (Piano nobile) | 26..50 | Decke Lage 49..50 |
| H, 2. Obergeschoss | 51..74 | Decke Lage 73..74 |
| H, Kranzgesims | 75..76 | Auskragung bis 2 (Luftraum) |
| H, Dach | 77.. | Walmdach, höchstens 6 über Lage 77 |
| W (2 Geschosse) | 1..25, 26..50 | Decke 24..25 und 49..50, Dach ab 51 |
| F (1 Geschoss) | 1..20 | Wand; Dach/Decke Lage 21..22 |
Summe H: 25 + 25 + 24 + 2 = **76** = 38 m.

### 0.5 Rollen
`pietra_forte_bruch` (Fundament), `pflaster` (Hofboden), `pietra_serena` (Innenböden, Decken, Treppen, Innenwände), `pietra_forte_rustika` (alle sichtbaren Außen- und Hofflächen: **Bugnato**), `pietra_forte` (Fensterrahmen, Portal, Bogenringe, Gesims, Pfeiler), `glas_fenster`, `holz` (Portaltür), `fresko` (Wappenfarben), `dachziegel`, `putz_sand` (Innenwände, Unterbau Korridor), `marmor_weiss` (optional). **Keine Palettenwünsche.** Gitter, Zäune und Stufen entfallen (nur volle Blöcke); die Freitreppe ist als Block-Sockel (Terrasse) gelöst.

### 0.6 Rustika (Bugnato)
Quader **8 breit × 4 Lagen** im Verband (Versatz 4 je Quaderlage). **Fugen als Relief 1 tief:** In der Außenlage (`d = 1`) bleibt die oberste Lage jedes Quaders (Lage ≡ 0 mod 4 in y_rel) und die erste Zelle jedes Quaders (Stoßfuge) **leer**. Fugenzellen gehören **keinem** Bauteil (Aussparung), Fenster, Portale und Gesims gewinnen. Das spart ≈ 12 % der Außenlage und macht die Fassade lesbar. Bossen am Hof „a canali“: wie Fassade, aber Lagerfugen alle 2 Lagen.

### 0.7 Luftraum (R12)
`luftraum = 3`. Außerhalb der Maske sind nur erlaubt: **Kranzgesims und Konsolen** der Außenkanten (Lage 75..76, bis 2 Zellen), **Kniefenster-Konsolen** (Lage 4..5, 1 Zelle) und das **Korridor-Anschlussstück** (Modul 9, bis 3 Zellen Abstand von der Maske, Y 79..90). Alles andere bleibt in `M_PI` (bzw. `korridor`).

### 0.8 Gelände, Piazza und Stadtgrund (Säulenregel)
- **Säulenregel:** In Spalten von `M_PI` baut der Stadtgrund höchstens bis `Y = min(groundTopY, 82)`. Der Palast belegt `Y ≥ min(groundTopY + 1, 83)`.
- **Aushub:** 21.023 Footprint-Zellen haben `groundTopY ≥ 84` (bis 121; vor allem Westteil und Rückseite, siehe Referenzmaße §1). Dort ist das Gelände **im Footprint abgetragen** (Stadtgrund endet bei Y 82); der Palast steht mit Bodenplatte Y 83 vor dem Hang. An den Rück- und Westkanten entsteht eine Stützwand des Stadtgrunds bis zu 38 Blöcke hoch (Außenspalten reichen bis Y 82 herab). **Das ist gewollt** (Palast an den Boboli-Hang gebaut) und eine **offene Frage** (Referenzmaße §6.3).
- **Fundament:** Zellen mit `groundTopY < 82`: 13.835 Blöcke von `groundTopY + 1` bis Y 82 (Modul 0), außen sichtbar als Sockel mit Rustika bis `d8 ≤ 2`.
- **Piazza dei Pitti** (Stadtgrund, w787858333): Platz steigt zum Palast an, `groundTopY` Y 66 (w = −200) → **83** (w = 0), 8,5 %. **Glättung:** Der Stadtgrund legt die Pflasterfläche in einem Band von **6 Blöcken** vor jeder Kante der Maske (Fassade und Flügel, wo `|groundTopY − 83| ≤ 3`) auf **Y 83** (`pflaster` bündig mit der Plattenoberkante) und führt sie über weitere 6 Blöcke in den natürlichen Verlauf zurück. Die Flügel stehen an ihren Außenseiten bis zu 12 Blöcke über dem Platz (Sockel bis Y 71): sichtbarer Rustika-Sockel.
- **Boboli:** `gruen` südöstlich und südwestlich der Maske; Stadtgrund (Rasen). Keine Modellierung im Projekt. Eine **Grotta del Buontalenti** (w473825750) ist Option für Welle 3.

### 0.10 Begehbarkeit und Ausgestaltung (Standard [`../../BEGEHBARKEIT.md`](../../BEGEHBARKEIT.md))
Verbindlich ab 13.10.2026. Der Pitti ist ein Museumsschloss; die Bauteile der Module 7 und 8 machen ihn vollständig begehbar und die historisch wichtigen Räume erkennbar.
- **Zugänge:** Hauptportal (9 × 15) in der Mitte, **Hof-Tor** (9 × 12) zum Ammannati-Hof, die sechs Arkaden je Flügel (`arkade`), das Korridor-Tor des Ostflügels (7 × 7). Türen und Tore sind **Luft** (nicht `holz` in der Öffnung) und werden mit `ctx.oeffnung` deklariert.
- **Räume:** je Geschoss geschlossener Boden (Plattenoberkante Lage 0, 25, 50), lichte Höhe EG 23, PN 23, OG 22; **jeder Raum über Türen ≥ 2 × 3 erreichbar** (Türen 3 × 5 in allen Trennwänden, Enfilade); keine leeren Kammern ohne Zugang (massive Bereiche sind erlaubt, Wandkerne bleiben massiv).
- **Treppen:** **echte Treppenblöcke** mit Aufstiegsrichtung (`tools/wahrzeichen/treppe.js`: `geradeTreppe`, `podestTreppe`, `wendeltreppe`), Material der Umgebung (`pietra_serena`/`pietra_forte`-Treppen, Holzstufen in den Appartamenti); **Palette-Erweiterung** Rolle → Treppentyp mit Ausrichtung. Über jeder Stufe ≥ 3 Luft, Breite ≥ 2, Stufe 1 Block je 1 Block Lauf; Treppenlöcher sind Aussparungen der Decken.
- **Dichtheit:** alle Fenster mit `glas_fenster`; Hofarkaden (Blendarkaden, Tiefe 2) sind Nischen mit geschlossener Rückwand; offene Teile nur Portal, Hof-Tor, Flügelarkaden, Dachterrassen der Flügel. Dünne Schichten (Glas 1 Zelle) im gedrehten Rahmen **flächenverbunden** (Glasebene mit Dicke ≥ 2 in Weltkoordinaten oder `vaults.connectEdges`).
- **Licht:** Rolle `licht` in jedem Raum mit mehr als 30 Bodenzellen, Abstand ≤ 12 (Modul 7 Teil 6).
- **Start R13:** stehbare Zellen auf dem Platz vor Fassade und Flügeln (außerhalb der Maske) und im Hof über das Hof-Tor; Dach: Dachterrassen der Flügel über `ali_treppen`; der Korridor (Modul 9) ist über das Tor des Ostflügels und über die Gangzellen an der Schnittebene z = 1312 erreichbar. Nicht begehbar und als `unzugaenglich` deklariert (Begründung: Walmdach, keine Nutzung): Dach des Hauptkörpers.

### 0.9 Überlappungsfreiheit (K0)
Wie `uffizi`/`palazzo_vecchio`: Jede Zelle genau einem Bauteil; Rangfolge Detail (Fenster, Portal, Gesims, Konsole, Wappen, Bogenring) vor allgemeinem Bauteil (Wand, Decke, Dach), sonst zuerst gebaut. Die Tabellen führen **lässt aus**. Verbindlich:
- Wände lassen die **Fugenzellen** (§0.6), Fenster, Portale, Arkaden aus.
- Decken lassen Treppenlöcher, Wandzellen (`d8 ≤ t`) und Hofbänder aus.
- Das Dach lässt Hofzellen (Löcher) und Kranzgesimszellen aus.
- Gesims (Lage 75..76) gehört Modul 1 (Fassade) bzw. 3/4 (Hof, Seiten); die Wände enden bei Lage 74.

---

## 1. Modul 0 – Fundament, Aushub und Boden (≈ 66 k)

| # | Bauteil-ID | Geometrie | Material | lässt aus |
|---|---|---|---|---|
| 1 | `fundament` | Zellen von `M_PI` (und Höfe) mit `groundTopY < 82`: Y von `groundTopY + 1` bis **82**; Außenband `d8 ≤ 2` (sichtbarer Sockel) | `pietra_forte_bruch`, Außenband `pietra_forte_rustika` | – |
| 2 | `bodenplatte` | **Y 83** auf allen Zellen von `M_PI` und der drei Höfe (Hofböden); Wandband `d8 ≤ 5` `pietra_forte_bruch`; Höfe `pflaster`; Innenraum `pietra_serena` | `pietra_forte_bruch`, `pflaster`, `pietra_serena` | – |

Blöcke: Fundament 13,8 k, Platte 52,0 k (43.956 + 8.024 Hofzellen) ≈ **66 k**.
Prüfung: Wo `groundTopY ≥ 83`, steht die Platte im Gelände (R3 Standardregel); Aushub bleibt Sache des Stadtgrunds.

## 2. Modul 1 – Hauptfassade (≈ 72 k)

Zone **FA**, 21 Achsen, **Achsmitten** u = 8, 25, 41, 58, 74, 91, 107, 123, 140, 156, **173**, 189, 206, 222, 239, 255, 272, 288, 304, 321, 337 (Parameter `PITTI_AXES = 21` oben in der Moduldatei, Offene Frage 1). Wandband `w < t(y)`: Lage 1..25 `w < 5`, 26..74 `w < 4`.

| # | Bauteil-ID | Geometrie | Material | lässt aus |
|---|---|---|---|---|
| 1 | `fassade_eg` | FA, Lage 1..25, `w < 5` | `pietra_forte_rustika` | Fenster/Portal (Teile 5, 6), Fugen (§0.6), Kniefenster |
| 2 | `fassade_pn` | FA, Lage 26..50, `w < 4` | `pietra_forte_rustika` | Fenster, Fugen |
| 3 | `fassade_og` | FA, Lage 51..74, `w < 4` | `pietra_forte_rustika` | Fenster, Fugen |
| 4 | `fassade_gesims` | FA, Lage 75..76, `w < 4` plus **Kranzgesims** 2 Zellen auskragend (`w = −1..−2`, Lage 76), Konsolen (`w = −1`, Lage 75) jede 4. Zelle | `pietra_forte` | – |
| 5 | `fenster_fassade` | je Achse und Geschoss ein Fenster **7 breit**: Rechteck 9 hoch plus **Rundbogen** (Halbkreis r = 3,5, Höhe 4), gesamt 13: EG Lage 6..18, PN 31..43, OG 56..68; Rahmen `d = 1` 1 breit, Archivolte 1 (Rahmen auch um den Bogen), Glas in `d = 3` (EG) bzw. 2 | `pietra_forte` (Rahmen), `glas_fenster` | – |
| 6 | `hauptportal` | Achse k = 10 (u 173): **Rundbogenportal 9 breit × 15 hoch** (Lage 1..15: 11 gerade + 4 Bogen), Laibung 2 `pietra_forte`, Archivolte 2; **Öffnung frei (Luft), `ctx.oeffnung(…, 'tor')`**; die geöffneten Torflügel sind je 1 × 9 `holz` an den Laibungen; **keine Außenstufen** (Platz vor dem Portal bündig auf Y 83, Stadtgrund §8) | `pietra_forte`, `holz` | – |
| 7 | `kniefenster` | Achsen k = 7 und k = 13 im EG: wie `fenster_fassade`, aber Lage 4..16 (tiefer gesetzt) mit **Konsolen** (2 × `w = −1`, Lage 4..5, unterhalb der Bank bei u = Achse ± 3) | `pietra_forte` | `fassade_eg`, `fenster_fassade` |

Blöcke: 98,4 k (Wand roh) + 2,4 k (Gesims) − 23,0 k (Fenster, 63 · ≈ 370) − 0,7 k (Portal) − 9 k (Fugen) + 2,9 k (Rahmen, Glas, Portal, Konsolen) ≈ **72 k**.
Prüfung: 21 · 3 = 63 Fenster minus Portal und zwei Kniefenster ersetzen EG-Fenster; Fugenzellen nie in Rahmen.

## 3. Modul 2 – Seitenflügel (Ali, ≈ 66 k)

Zone **F**. Zwei Flügel: **West** u −44,6..1,1 (Außenkanten u ≈ −34, Ausbuchtung u −44,6..−34 bei w −78..−65) und **Ost** u 342,9..376,3, beide w −96.. bis zur Fassadenlinie (West bis w 86, Ost bis w 51 als Teil der Seiten). Wandband `d8 ≤ 5`, Lage 1..20. Ein Geschoss (Höhe 22 mit Dach).

| # | Bauteil-ID | Geometrie | Material | lässt aus |
|---|---|---|---|---|
| 1 | `ali_waende` | Wandband `d8 ≤ 5`, Lage 1..20 (alle Außenkanten der Flügel einschließlich der Innenseiten zur Piazza) | `pietra_forte_rustika` | Arkaden, Fenster, Tor (Korridor), Fugen |
| 2 | `ali_arkaden` | **Arkaden** an den Innenseiten zur Piazza (West: Kante u ≈ 0..1,1, w −96..−4; Ost: u ≈ 343..345, w −96..−4): **6 Rundbögen** 9 breit, Mitten w = −8, −24, −40, −56, −72, −88, Kämpfer Lage 8, Scheitel Lage 12 (Archivolte 1 bis Lage 13), durch die volle Dicke 5; Pfeiler 7 breit dazwischen | `pietra_forte` (Archivolte), Wand bleibt `pietra_forte_rustika` | `ali_waende` |
| 3 | `ali_fenster` | übrige Außenkanten: Fenster 5 breit × 9 hoch (Lage 5..13, Teilung 16, Rand 8), Glas in `d = 3` | `glas_fenster`, `pietra_forte` | – |
| 4 | `ali_tor_korridor` | **Ostflügel**, Ostwand (u = 376, **w −31..−25**, 7 breit): Öffnung 7 × 7 (Lage 1..7) für den Korridor (Modul 9 Teil 4) mit Laibung 1; Boden des Gangs Y 83 | `pietra_forte` (Laibung) | `ali_waende` |

Blöcke: Wände 83,3 k (4.167 Randzellen · 20), abzüglich Arkaden 7,2 k (2 · 6 · 9 · 12 · 5 + Bögen), Fenster 4,5 k, Fugen 6,5 k, plus Rahmen 1,0 k ≈ **66 k**. Decke/Dach der Flügel: Modul 5 (Dach `dach_ali`).
Prüfung: Flügeltiefe 96 = 6 · 16 ✓; Höhe 20 + 2 = 22 Lagen = 11 m.

## 4. Modul 3 – Ammannati-Hof und Lichthöfe (≈ 185 k)

Löcher **L2** (Ammannati-Hof, u 135..206 × w 50..150, 7.021 Zellen), **L1** (u 64..83 × w 35..66, 573 Zellen), **L0** (u 251..271 × w 42,5..65, 430 Zellen). Wandband `dLoch ≤ t(y)` (5 / 4). Bänder vor Modul 4: Hofbänder gewinnen gegen die Außenbänder an Zellen mit gleichem Abstand.

| # | Bauteil-ID | Geometrie | Material | lässt aus |
|---|---|---|---|---|
| 1 | `hof_waende_eg` | L2, L1, L0: Band `dLoch ≤ 5`, Lage 1..25 | `pietra_forte_rustika` | Blendarkaden, Fenster, Fugen („a canali“: Lagerfuge alle 2 Lagen) |
| 2 | `hof_waende_og` | Band `dLoch ≤ 4`, Lage 26..74 | `pietra_forte_rustika` | Fenster, Fugen |
| 3 | `hof_blendarkaden` | L2, an **drei Seiten** (Südwest u = 135, Nordost u = 206 und Rückseite w = 150; die Vorderseite w = 50 ist die Rückwand des Hauptbaus und trägt Fenster): Rundbögen 9 breit × 13 hoch (Kämpfer Lage 9, Scheitel 13), **Tiefe 2** (`dLoch 1..2`), Teilung 16, Rückwand `dLoch 3..5` bleibt; insgesamt 17 Achsen | `pietra_forte` (Archivolte, Pfeiler 7 breit) | `hof_waende_eg` |
| 4 | `hof_fenster` | L2 Vorderseite und alle Hofkanten in PN und OG: Fenster 7 × 13 wie Fassade (Lage 31..43 und 56..68), Teilung 16, Glas in `d = 2`; L0 und L1: kleine Fenster 3 × 5 (Lage 7..11, 32..36, 57..61), Teilung 8 | `glas_fenster`, `pietra_forte` | – |
| 5 | `hof_gesims` | Lage 75..76 am Hofband (`dLoch ≤ 4`), keine Auskragung (Hof offen) | `pietra_forte` | – |
| 6 | `hof_nische_rueck` | Rückseite des Ammannati-Hofes (w = 148..150): zentrale **Nische** 9 breit × 12 hoch × 3 tief (Lage 1..12, `dLoch` 1..3), Brunnenbecken 7 × 3 davor (Lage 1..2): Platzhalter für Grotte/Fontana del Carciofo | `pietra_forte`, `marmor_weiss` | `hof_waende_eg`, `hof_blendarkaden` |

Blöcke: Wand 234,3 k − Arkaden 4,0 k − Fenster 22 k − Fugen 30 k + Rahmen 3,5 k + Gesims 5,8 k + Nische 0,3 k ≈ **185 k**.
Prüfung: Hofkante L2: drei Arkadenseiten 71 + 100 + 100 = 271 Blöcke, 17 Achsen · 16 = 272 ≈ 271 ✓.

## 5. Modul 4 – Seiten, Rückseiten und westlicher Nebenbau (≈ 250 k)

Zonen **H** (außerhalb von FA) und **W**: Wandband `d8 ≤ t(y)`; FA, F und Hofbänder gehören anderen Teilen. Fenster **an allen Außenkanten der Kanten ≥ 24 Länge** im Kantenrahmen `K_i` (`u` von A nach B, `w` nach innen): Teilung `P = L_i / round(L_i/16,45)`, Rand ≥ 8, EG Fenster Lage 6..18 (Kniefenster nur an der Hauptfassade), PN 31..43, OG 56..68 (Zone W: nur EG und PN).

| # | Bauteil-ID | Geometrie | Material | lässt aus |
|---|---|---|---|---|
| 1 | `aussen_waende_eg` | H (ohne FA) und W: Wandband `d8 ≤ 5`, Lage 1..25 | `pietra_forte_rustika` | Fenster, Fugen |
| 2 | `aussen_waende_og` | H und W: `d8 ≤ 4`, Lage 26..74 (W bis 50) | `pietra_forte_rustika` | Fenster, Fugen |
| 3 | `aussen_fenster` | wie `fenster_fassade` auf allen Kanten (Fenster 7 × 13, Rahmen 1, Glas); an den Rückseiten (Gartenseite) zusätzlich je Geschoss zwei **große Türfenster** 9 × 15 auf den Terrassen (nur wo `groundTopY` die Zelle des Fensters nicht überragt) | `pietra_forte`, `glas_fenster` | – |
| 4 | `aussen_gesims` | Lage 75..76 (W: 51..52) an `d8 ≤ 4`, Kranzgesims bis 2 Zellen auskragend (Luftraum), Konsolen Lage 75 jede 4. Zelle | `pietra_forte` | – |
| 5 | `nebenbau_west` | Zone W: Wände Lage 1..50 (zwei Geschosse), Fenster Teilung 16, Gesims Lage 49..50 | wie 1–4 | – |

Blöcke: Wand 297,5 k − Fenster 30 k − Fugen 25 k + Gesims 8 k − Reserve (Hang, gerade Kanten) ≈ **250 k**.

## 6. Modul 5 – Dächer (≈ 94 k)

| # | Bauteil-ID | Geometrie | Material | lässt aus |
|---|---|---|---|---|
| 1 | `dach_haupt` | Zone H und W: **Walmdach** über dem Chamfer-Abstandsfeld `d8`/`dLoch`: Traufe Lage 77 (W: 51); Höhe `y_dach = Traufe + min(6, ⌊0,4 · (d − 1)⌋)`, 2 Lagen stark; wie `tools/city/haus.js`; Löcher (Höfe) bleiben offen; Kranzgesims nicht überdeckt | `dachziegel` | Höfe, Gesims |
| 2 | `dach_ali` | Zone F: **flaches Dach** Lage 21..22 auf allen Zellen (Dach und Decke in einem) | `dachziegel` | – |

Blöcke: Haupt 74 k (33,8 k Zellen · 2 · 1,1), Ali 20 k ≈ **94 k**.

## 7. Modul 6 – Decken (≈ 143 k)

| # | Bauteil-ID | Geometrie | Material | lässt aus |
|---|---|---|---|---|
| 1 | `decke_eg` | Lage 24..25 auf H und W (`d8 > 5`, `dLoch > 5`), Auflager auf den Wänden | `pietra_serena` | Treppenlöcher (Modul 7 Teil 7 und 8), Höfe, Wandbänder; Lampenzellen (Modul 7 Teil 11 liegen unter der Decke) |
| 2 | `decke_pn` | Lage 49..50 auf H (`d8 > 4`, `dLoch > 4`); auf W Dachplatte-Auflager | `pietra_serena` | Treppenlöcher |
| 3 | `decke_og` | Lage 73..74 auf H (`d8 > 4`, `dLoch > 4`) | `pietra_serena` | Treppenlöcher |

Blöcke: EG 44,2 k + 3,7 k (W), PN 47,8 k + 3,9 k (W), OG 47,8 k, abzüglich Treppenlöcher 4 k ≈ **143 k**.

## 8. Modul 7 – Raumteilung, Treppen, Zugänge, Licht (Pflicht, ≈ 96 k)

Der Mittelbau wird in Raumreihen geteilt. **Raster der Trennlinien** (Achsengrenzen `u_n = 16,452 · n`): n = 4 (65,8), 7 (115,2), 9 (148,1), 10 (164,5), 12 (197,4), 13 (213,9), 15 (246,8), 16 (263,2), 18 (296,1), 19 (312,6). **Vorderreihe** `V`: w 5..25 (Tiefe 21, 10,5 m), **Rückreihe** `Rr`: w 28..48; dazwischen die Spinnwand (w 26..27). Treppenräume: West u 3..26, Ost u 327..343. Alle Wände 2 dick; **jede Wand erhält Türen 3 × 5** (Boden = Gehfläche des Geschosses), in der Raummitte der Wand (Enfilade: gleiche u-Lage in aufeinander folgenden Räumen).

| # | Bauteil-ID | Geometrie | Material | lässt aus |
|---|---|---|---|---|
| 1 | `spinnwand_haupt` | Längsmittelwand (Pflicht, w 26..27), u 6..340, Lage 1..74; **Türen 3 × 5 (Lage 1..5, 26..30, 51..55)** in jedem Raum der Vorderreihe (Mitte) und ein **Portal 7 × 9** im EG bei u 173 (Durchgang Vestibül → Hof) | `putz_sand` | Decken, Türen, Treppenlöcher |
| 2 | `trennwaende_eg` | EG (Lage 1..23) bei `n ∈ {4, 7, 9, 12, 15, 18}` in V und Rr (jeweils u_n bis u_n + 1, 2 dick); Vestibül und Durchgang u 148..197 (Hauptportal-Achse) bleiben ungeteilt; Türen 3 × 5 | `putz_sand` | Türen, Treppenlöcher |
| 3 | `trennwaende_pn` | PN (Lage 26..48) bei `n ∈ {4, 7, 10, 13, 16, 19}` in V und Rr, dazu Treppenraumwände bei u 26 und u 327; Türen 3 × 5 (Lage 26..30) | `putz_sand` | Türen, Treppenlöcher |
| 4 | `trennwaende_og` | OG (Lage 51..72) wie PN | `putz_sand` | Türen, Treppenlöcher |
| 5 | `appartamenti_waende` | PN, Westblock hinter dem Hof: Wände 2 dick bei w 83 und w 115 über u 95..133 (drei Räume: w 52..82, 84..114, 116..148), Türen 3 × 5 in der Enfilade (u 114, Mitte), Zugang vom Hof-Treppenraum (Teil 8); Lage 26..48 | `putz_sand` | Türen |
| 6 | `hof_tor` | **Hof-Tor** im Hofband w 50..55 bei u 173: Durchgang 9 breit × 12 hoch (Lage 1..12: 8 gerade + Bogen 4), durch die volle Dicke; Laibung 1; `ctx.oeffnung(…, 'tor')` | `pietra_forte` (Laibung) | `hof_waende_eg` (Zellen), `hof_blendarkaden` |
| 7 | `treppen_haupt` | **Podesttreppen** `podestTreppe`, Breite 4, Lauf 1 (13 Stufen, Aufstieg nach +w), Podest 4 × 4 (Höhe +13), Lauf 2 (12 Stufen, Aufstieg nach −w), Kopffreiheit ≥ 3, Bounding-Box u0..u0+7, w 6..22: **S1** EG → PN (u0 = 318, Ost), **S2** PN → OG (u0 = 332, Ost), **S3** EG → PN (u0 = 6, West), **S4** PN → OG (u0 = 16, West); Treppenlöcher in `decke_eg` (S1, S3) und `decke_pn` (S2, S4) über den oberen Stufen | `pietra_serena`-Treppenblöcke, Podeste `pietra_serena` | Decken (Loch) |
| 8 | `treppe_hof_appartamenti` | `geradeTreppe` 4 breit, 25 Stufen (Lage 0 → 25), im Hof entlang der Westwand L2 (u 136..139, w 60..84, Aufstieg nach +w), Austritt in die Appartamenti (Tür 3 × 5 in der Hofwand, PN); Podest 4 × 4 | `pietra_serena` | `hof_waende_*` (Tür), Decke Hofband |
| 9 | `ali_treppen` | je Flügel eine `geradeTreppe` 4 breit, **22 Stufen** (Lage 0 → 22 = Dachterrasse), West: u −28..−25, w −90..−69, Ost: u 350..353, w −90..−69, Aufstieg nach +w; Treppenloch 4 × 4 im Flügeldach (Lage 21..22); Tür 3 × 5 von der Arkadenhalle | `pietra_forte`-Treppenblöcke | `dach_ali` (Loch) |
| 10 | `ali_bruestung` | Dachterrasse der Flügel: Brüstung 2 hoch (Lage 23..24) 1 breit auf `d8 = 1` | `pietra_forte` | `dach_ali` |
| 11 | `raum_licht` | **Lichtquellen** `licht` (Seelaterne): Raster ≤ 10 × 10 in jedem Raum bei Lage 23 (EG), 48 (PN), 72 (OG), Hof-Arkaden alle 8, Flügel alle 10, Vestibül 4; Abstand zu jeder Raumzelle ≤ 12 | `licht` | – |

Blöcke: Spinnwand 49 k, Trennwände EG/PN/OG 3 · 14 k = 42 k, Appartamenti 3 k, Türen −2,4 k, Treppen (4 Podesttreppen ≈ 4 · 120, Hof 100, Flügel 2 · 88) 0,8 k, Brüstung 2 k, Licht 0,7 k ≈ **96 k**. Die Treppenlöcher in den Decken (Modul 6) entsprechen S1/S3 (EG-Decke) bzw. S2/S4 (PN-Decke).
Prüfungen: **R13** von Platz und Hof aus alle Räume erreichbar; **R14** Dichtheit der Hülle (Fenster Glas, Portal und Arkaden deklariert).

## 9. Modul 8 – Ausgestaltete Innenräume (≈ 1 k)

Jeder Raum ist ein **eigenes Bauteil mit Content-Text** (was er zeigt, Quelle, „vereinfacht, nicht nach Vorbild“). Materialwechsel (Boden, Wandfelder, Decken) ersetzen Zellen der Rohbauteile (`decke_*`, `trennwaende_*`, `spinnwand_haupt`, Bodenplatte) und erzeugen **keine** zusätzlichen Blöcke; zusätzliche Blöcke sind nur Möbel, Podeste und Statuen. K0: das Rohbauteil lässt die ersetzten Zellen aus.
Allgemein: **Boden** Muster aus `marmor_weiss`/`marmor_rot`/`pflaster`, Raster 4 × 4 (Schach) in Lage 0/25/50; **Gemäldefelder** 6 × 4 (Rahmen `gold`, Feld 4 × 2 `fresko`), **Unterkante 2 über der Gehfläche**, in zwei Reihen (Lage +2..+5 und +8..+11), Abstand 8, an allen Wandflächen ohne Fenster und Türen (die Palatina hängt „wandfüllend“, nach [en](https://en.wikipedia.org/wiki/Palatine_Gallery)); **Sockelzone** Lage +1..+3 `holz`; **Decke**: Felder `fresko` auf der untersten Deckenlage (Lage 49 im PN) bzw. Kassetten `gold`/`holz`.

| # | Bauteil-ID | Lage und Inhalt | Quelle, Stufe |
|---|---|---|---|
| 1 | `sala_bianca` | PN, V, u 26..65,8 (Weißer Saal, ehemals Ballsaal): weiße Wände (`marmor_weiss`-Pilaster 2 × 1 alle 8, Wandfelder `putz_weiss`), weiße Stuckdecke (Lage 49 `marmor_weiss`), Boden Schach `marmor_weiss`/`pietra_serena`, Kronleuchter als Lichtkreuz (Seelaternen). Nutzung heute Wechselausstellungen | [en Palatine Gallery](https://en.wikipedia.org/wiki/Palatine_Gallery): „White Hall“; B (Name, Weiß), C (Lage im Raster) |
| 2 | `sala_di_venere` | PN, V, u 65,8..115,2: Reihe der **Planetensäle** (Reihenfolge Venus, Apollo, Mars, Jupiter, Saturn), Gemäldefelder dicht, Decke Fresko (Pietro da Cortona, begonnen 1641 am Venus-Saal) blau/gold | [en](https://en.wikipedia.org/wiki/Palatine_Gallery): fünf Räume an der Front, Cortona; B/C |
| 3 | `sala_di_apollo` | PN, V, u 115,2..164,5 | wie 2 |
| 4 | `sala_di_marte` | PN, V, u 164,5..213,9 (Mitte hinter dem Portal): Decke **„Triumph der Medici“** (Cortona-Gewölbefresko, `fresko` Rot/Blau/Gold, Gewölbekappe Lage 46..48) | [en](https://en.wikipedia.org/wiki/Palatine_Gallery): „Room of Mars: vault fresco by Pietro da Cortona“; B |
| 5 | `sala_di_giove` | PN, V, u 213,9..263,2: **Thronsaal der Medici** mit Thronpodest 5 × 3 × 1 `marmor_rot` und Thron 3 × 1 × 3 `holz` mit Rückenlehne `gold` | [en](https://en.wikipedia.org/wiki/Palatine_Gallery): „Jupiter (the Medici Throne room)“; B |
| 6 | `sala_di_saturno` | PN, V, u 263,2..312,6 | wie 2 |
| 7 | `sala_della_stufa` | PN, V, u 312,6..327: kleiner Saal mit Cortona-Bildern „Vier Zeitalter“ (Gold, Silber, Bronze, Eisen als vier Wandfelder 8 × 5 in `gelb`, `weiss`, `braun`, `schwarz`) | [en](https://en.wikipedia.org/wiki/Palatine_Gallery): 1637/1641; B (Inhalt), C (Lage) |
| 8 | `galerie_hintere_raeume` | PN, Rr (w 28..48), sieben Räume zu je 3 Achsen (u 0..345 in n-Gruppen 4/3/3/3/3/3/2): **Sala dell'Iliade, di Prometeo, di Ulisse, della Giustizia, di Psiche, dell'Arca, di Poccetti**; Decken je Fresko-Feld in eigener Farbe (Ulisse 1815 Martellini, Prometeo Collignon, Psiche Collignon, Giustizia Fedi, Arca Ademollo 1816, Poccetti/Rosselli); je Raum 2 Bänke `holz` (3 × 1 × 1) in der Mitte | [en](https://en.wikipedia.org/wiki/Palatine_Gallery) (Raumnamen, Freskanten); B (Namen), C (Lage, Reihenfolge) |
| 9 | `appartamenti_reali` | PN, Westblock hinter dem Hof (u 95..133, w 52..148): **Sala Verde**, **Sala del Trono**, **Sala Blu**; Savoyer Empire-Ausstattung: Wandfelder `fresko` grün bzw. blau 12 × 8, Spiegel (Glasfelder) zwischen Pilastern, Kassettendecke `gold`/`holz`, Thron (Sala del Trono) wie 5; 14 Räume laut Quelle, drei modelliert | [en](https://en.wikipedia.org/wiki/Palatine_Gallery): 14 Räume, Green/Blue Room, Throne room; B (Namen), C (Zahl) |
| 10 | `scalone_ammannati` | Treppenraum Ost (u 327..343), Aufwärts-Pomp: Wände mit Pilastern (`pietra_serena`, 1 × 2 alle 4), Boden `pflaster`; Treppen S1/S2 (Modul 7). Quelle nennt Ammannatis monumentale Treppe 1558–70 zum Piano nobile | [en](https://en.wikipedia.org/wiki/Palazzo_Pitti), [Palatine Gallery](https://en.wikipedia.org/wiki/Palatine_Gallery); B (Existenz), C (Lage) |
| 11 | `vestibuel_eg` | EG, u 148..197 (Hauptportal-Achse): Vestibül und Durchgang zum Hof, Boden Schach `marmor_rot`/`marmor_weiss`, vier Pfeilerpaare `pietra_forte_rustika` 3 × 3, Wappen (Teil 12) | C |
| 12 | `wappen_portal` | Medici-Wappenschild 3 × 3 über dem Hauptportal in `d = 1` (Lage 17..19), `fresko` Rot und Gold | B |
| 13 | `og_galerie_moderna` | OG: schlichte Raumfolge (Trennwände `trennwaende_og`), Gemäldefelder in einer Reihe, Boden `pflaster`; die Galleria d'arte moderna lag im zweiten Obergeschoss | [it](https://it.wikipedia.org/wiki/Palazzo_Pitti); B (Lage), C (Räume) |

Blöcke: Möbel (Bänke 7 · 2 · 3 = 42, Throne 2 · 25, Podeste 2 · 15, Lichtkreuze, Pfeilerpaare 8 · 27) ≈ **1 k** zusätzlich; Wandpilaster der Sala Bianca und des Scalone ersetzen Wandzellen. Der Content-Text je Raum nennt Quelle und „vereinfacht“.

## 10. Modul 9 – Corridoio Vasariano, Oltrarno bis Pitti (≈ 115 k)

Maske `korridor` (**8.742 Zellen**; Zellen von w1344547176 und w1394832037..43 abzüglich `ponte_vecchio`, `uffizi`, Pitti-Hauptmaske). **Der Vorrang ist nötig, auch wenn das Modul später gebaut wird** (sonst entstehen aus den `building=yes`-Teilstücken 30 Blöcke hohe Quartierwürfel). Anschluss im Norden: Schnitt z = 1311/1312 (siehe `ponte_vecchio/BAUTEIL_KATALOG.md` §9). Gangquerschnitt: Wände **2**, Gang **7 × 7**, Boden 2, Decke 2.

**Gangboden:** `Y_f(c)` = Oberkante des Bodens (am Nordschnitt 78). `Y_f = max(78, G(c) + 3)`, `G(c)` = größte `groundTopY` in der 7 × 7-Umgebung, danach **monoton nicht fallend** entlang des Korridors, höchstens +1 je 40 Zellen Weg und **begrenzt auf 83** (Endwert am Palast; Gang dort Y 84..90 = Lage 1..7 des Flügels). Terrain (`groundTopY` 63..82, Median 70) liegt unter dem Gangboden; die Differenz überbrückt der Unterbau. Querschnitt wie am Nordschnitt, aber Wände 2: **Boden `Y_f − 1 .. Y_f`**, Gang `Y_f + 1 .. Y_f + 7`, Decke `Y_f + 8 .. Y_f + 9`.

| # | Bauteil-ID | Geometrie | Material | lässt aus |
|---|---|---|---|---|
| 1 | `korridor_unterbau` | Zellen der Maske **ohne Straßenfläche** (Stadtgrund-Straßenspalten: Via dei Bardi, Piazza di Santa Felicita) und ohne die abgehobenen Teilstücke (w1394832042 über Straße): **massiver Mauerkern** von `groundTopY + 1` bis `Y_f − 2` (keine leere Kammer ohne Zugang), Außenband `d8_K ≤ 2` als sichtbare Hauswand | `mauerwerk` (Kern), `putz_sand` (Band), Sockel (Lage ≤ 8 über Gelände) `pietra_forte_rustika` | – |
| 2 | `korridor_boden` | `Y_f − 1 .. Y_f` auf allen Zellen der Maske | `pietra_serena` | – |
| 3 | `korridor_waende` | Wandband `d8_K ≤ 2`, `Y_f + 1 .. Y_f + 7`; kleine Fenster 2 × 3 im Abstand 8 (`Y_f + 3 .. Y_f + 5`), Glas in `d8_K = 2`, Rahmen 1; **Santa Felicita:** über dem Portikus der Kirche (w159394659, 277 gemeinsame Zellen) ein **Balkonfenster** 7 × 5 zum Kirchenschiff (`Y_f + 2 .. Y_f + 6`) | `pietra_forte`, `glas_fenster` | Fenster |
| 4 | `korridor_anschluss` | **Anschlussstück** (Luftraum 3) zwischen Korridormaske (u 379,1) und Ostwand des Ostflügels (u 376,2): Zellen im Rahmen `PI` u 376,2..379,5, w −32,2..−22,5; Boden/Wände/Decke wie Gang, Boden Y 82..83, Gang Y 84..90; Öffnung im Palast: `ali_tor_korridor` (Modul 2, w −31..−25) | `pietra_serena`, `pietra_forte` | – |
| 5 | `korridor_decke` | `Y_f + 8 .. Y_f + 9` auf allen Zellen | `pietra_forte` | – |
| 6 | `korridor_bilder_olt` | Bilderfelder wie `ponte_vecchio` Modul 8 Teil 4 (6 × 4, Unterkante `Y_f + 3`, Abstand 10, beide Wände, ausgespart ±6 um Fenster); Thema: Gemälde des 17./18. Jh. und Skulpturen ([it](https://it.wikipedia.org/wiki/Corridoio_vasariano)); vereinfacht | `gold`, `fresko` | `korridor_waende` |
| 7 | `korridor_licht_olt` | Lichtquellen `licht` auf der Mittellinie bei `Y_f + 7`, alle 10 Zellen (≈ 60), im Anschlussstück 2 | `licht` | – |

Der Gang ist **durchgehend begehbar** vom Nordschnitt (z = 1312) bis zum Tor des Ostflügels; Fenster zum Boboli und zu den Straßen sind verglast (Glas in `d8_K = 2`); der Unterbau ist massiv, jede Zelle des Gangs über Stufen des Bodens erreichbar (Rampe: Bodenhöhe steigt um 1 je ≥ 40 Zellen, der Höhenwechsel wird als **Treppenblock** (3 breit, Aufstieg Richtung Palast) gebaut, nicht als voller Block).

Blöcke: Gang-Wände 23,3 k, Boden und Decke 35,0 k, Unterbau **56,3 k** (Mauerkern), Anschluss 0,3 k, Licht 0,1 k ≈ **115 k**.
Interface-Ende: Die Stirn im Norden ist offen (kein Abschlussblock am Schnitt z = 1311/1312); am Palast schließt das Tor 7 × 7 (Y 84..90) an den Ostflügel an.
Optional (Welle 3): **Grotta del Buontalenti** (w473825750, 499 Zellen, Mitte (−775 \| 1560)) als Modul 10 oder eigenes Projekt; Boboli bleibt Stadtgrund.

## 11. Schnittstellen

- **Stadtgrund:** Säulenregel §0.8, Aushub 21.023 Zellen, Glättung des Vorplatzes auf Y 83 (6 Blöcke), Platzneigung 8,5 %, Rasen im Boboli.
- **`ponte_vecchio`:** Korridor-Schnitt z = 1311/1312 (Gang 7 × 7, Wände 2, Boden Y 77..78, Decke Y 86..87), danach Rampe auf Y 83.
- **Quartiere:** r1637338 und w1394832037..43 stehen in `vorrang.json` (Übersicht Welle 2 §2); nicht in einem Quartier. w118131726 (Palazzo Pitti-Mannelli) bleibt Quartier. Santa Felicita (w159394659) verliert die 277 Zellen des Korridors.
- **Nachbarn mit Überlappung:** w1394832037 (1 Zelle mit dem Palast, der Palast gewinnt); sonst keine.

## 12. Blockzahlen (Richtwert)

| Modul | Blöcke |
|---|---|
| 0 Fundament, Boden | 66 k |
| 1 Hauptfassade | 72 k |
| 2 Seitenflügel | 66 k |
| 3 Ammannati-Hof, Lichthöfe | 185 k |
| 4 Seiten, Rückseiten, Nebenbau | 250 k |
| 5 Dächer | 94 k |
| 6 Decken | 143 k |
| 7 Raumteilung, Treppen, Zugänge, Licht (Pflicht) | 96 k |
| 8 Ausgestaltete Innenräume | 1 k |
| **Summe Modul 0–8** | **≈ 0,97 Mio** (0,75–1,25 Mio) |
| 9 Korridor Oltrarno (massiver Unterbau) | 115 k |
| **Summe mit Modul 9** | **≈ 1,09 Mio** |

≈ 500 Bauschritte. Die Wandbänder sind aus den Maskenabständen nachgerechnet (Zellen · Höhe), nicht aus Faustwerten: Wand 724 k roh, Decken 159 k, Platte 52 k, Dach 88 k, Fundament 14 k (≈ 1,04 Mio roh) vor Abzug von Öffnungen (≈ 0,09 Mio) und Fugen (≈ 0,07 Mio) und vor Zuschlag für Rahmen und Gesims. Ein Zuschlag von 10 % gegen die in Welle 1 beobachtete Unterschätzung ist enthalten. Hebel zum Senken: Wandstärke durchweg 4 (−10 %). Die Spinnwand ist jetzt Pflicht (Raumteilung). Innenwände sind nach dem Begehbarkeits-Standard eigene Bauteile **nach** dem Rohbau.

## 13. Prüfliste
- Hauptfassade: 21 Achsen, Mitte bei u 173; Höhe 76 Lagen (Y 159); Portal 9 × 15 in der Mitte; Kniefenster bei k = 7 und 13.
- Flügel 96 tief, 22 Lagen, je 6 Arkaden; Tor für den Korridor 7 × 7 an der Ostwand bei w −31..−25.
- Hof L2 35,5 × 50 m, drei Blendarkadenseiten (17 Achsen).
- **Begehbarkeit (R13/R14):** Hauptportal, Hof-Tor, Flügelarkaden offen und deklariert; jede Trennwand mit Tür 3 × 5; vier Podesttreppen (25 Stufen) EG → PN → OG, Hoftreppe, Flügeltreppen (22 Stufen) auf die Dachterrassen; Treppenlöcher in den Decken; Licht ≤ 12; Fenster verglast; keine leere Kammer (Korridor-Unterbau massiv); Räume: Sala Bianca, fünf Planetensäle, Thronsaal, sieben hintere Galerieräume, drei Appartamenti, Vestibül.
- Alle Teile ohne Zellkonflikt (K0), nur Luftraum nach §0.7; R12 mit `luftraum 3`.
- Stadtgrund endet in der Spalte bei `min(groundTopY, 82)`; Platte Y 83; `--cross` mit Stadtgrund, `ponte_vecchio`, Quartieren: 0 Konflikte.
