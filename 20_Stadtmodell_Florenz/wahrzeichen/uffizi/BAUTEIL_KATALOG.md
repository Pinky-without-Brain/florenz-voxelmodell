# Bauteil-Katalog – Uffizien und Corridoio Vasariano (`uffizi`, V3 D1)

Verbindlich für die Umsetzung. Maße und Herkunft: [`REFERENZMASSE.md`](REFERENZMASSE.md). Pipeline: [`tools/ARCHITEKTUR.md`](../../../tools/ARCHITEKTUR.md) (§0, §3, §10). Palette: `tools/spec/palette.js` (**Rollen**). Blockzahlen ±30 %. Projekt `type: "wahrzeichen"`, `projects/uffizi/model/m0_*.js` … `m9_*.js`. Bauteile in Bau-Reihenfolge.

## 0. Allgemeine Regeln

### 0.1 Rahmen `UF`
- Ursprung `O = (−170 | 907)`, **θ = +17,4°** (von +x nach +z), cosθ = 0,9542, sinθ = 0,2990.
- `x = O.x + u·cosθ − w·sinθ`, `z = O.z + u·sinθ + w·cosθ`; Rückabbildung `u = (x−O.x)·cosθ + (z−O.z)·sinθ`, `w = −(x−O.x)·sinθ + (z−O.z)·cosθ`. Rasterung durch Rückabbildung der Zellmitte, Intervalle halboffen.
- u quer zu den Flügeln (nach Ost), **w entlang der Flügel nach Süd** (zum Arno). **Fassadenrichtung der Flügel = 107,4° gegen die Modell-x-Achse**, Querkanten 17,4°. Das Gebäude ist 18,8° gegen die Domachse verdreht.
- **Piazzale-Flächen:** West-Fassade **FW** bei u = 0 (w 0..276, Fassadennormale +u); Ost-Fassade **FE** bei `u_E(w) = 24,94 + 0,0103·w` (w −4..276, Normale −u). Der Platz (Stadtgrund) liegt dazwischen, **nicht** in der Maske.
- **Südbau** (Arno-Riegel): w 276..300, u −26..80 (Nordfläche **FSN** bei w ≈ 276, Arno-Fassade **FSR** bei w ≈ 299,5).
- **Maske `M_UF`** = Zellen von w477279033 (36.275 Zellen, Rand zählt innen). **Jedes Bauteil der Module 0–7 wird mit `M_UF` geschnitten.** Modul 8 hat eine eigene Maske `M_COR` (§9).
- **Zonen** (erste Übereinstimmung): `R_S` Südbau (w ≥ 276, u −26..80), `R_W` Westflügel (u ∈ [−40, 0), w 0..276), `R_E` Ostflügel (u ∈ [u_E(w), u_E(w)+40), w −9..276), `R_X` Nebenbaukörper (alles übrige in `M_UF`, **Traufe 44**, Wandrollen siehe Modul 5).
- **Höhe:** `y_rel = Y − bodenY`, **`bodenY = 65`**; Plattenoberkante Y 65, Lage 1 = Y 66.

### 0.2 Höhenraster (Lagen)
| Zone | Lagen | Inhalt |
|---|---|---|
| Portikus | 1..14 | Gebälk Lage 13..14, Decke Lage 14 |
| Mezzanin | 15..20 | Decke Lage 20 |
| Piano nobile | 21..36 | Decke Lage 36 (Y 101) |
| Dachloggia | 37..49 | Gebälk und Kranzgesims 50..51 (Traufe) |
Summe 14 + 6 + 16 + 15 = **51**. Nebenbaukörper `R_X`: Decken bei 14, 20, 36, Traufe 44.

### 0.3 Fassadenmodul (gilt für FW, FE und die Arno-Fassade FSR)
Modul **24** Zellen entlang w, mit Beginn bei `s_k = 12 + 24·k` (k = 0..10). Nordende w 0..11 (bzw. −4..11 am Ostflügel) = massive Stirnwand (Eckpfeiler). Innerhalb des Moduls (w relativ zu `s_k`):

| w-Bereich | Element |
|---|---|
| 0..4 | **Pfeiler** (5 breit) mit Nische |
| 5..9 | Öffnung 1 (Mitte `s_k+7`) |
| 10..11 | **Säule** (2 × 2) |
| 12..16 | Öffnung 2 (Mitte `s_k+14`) |
| 17..18 | Säule |
| 19..23 | Öffnung 3 (Mitte `s_k+21`) |

Der Südbau schließt die Reihe (w 276 ist die erste Zelle des Südbaus). Die Öffnungsmitten tragen im Mezzanin je ein Fenster, im Piano nobile je ein Fenster, in der Dachloggia je eine Öffnung (3 je Modul, nach den Quellen). In der Tiefe `t` (Zellen von der Fassadenebene nach innen, Fassadenebene = Zelle `t = 1`: auf FW ist `t = −u`, auf FE `t = u − u_E(w) + 1`) gelten: Pfeiler und Säulen `t` 1..3 (Säulen 2 × 2: `t` 1..2), Gebälk `t` 1..3, Hallen-Hohlraum (Portikus) `t` 4..10, Rückwand `t` 11..14 (4 dick).

### 0.4 Rollen
`pietra_forte_bruch` (Fundament), `pflaster` (Portikusboden), `pietra_serena` (Pfeiler, Säulen, Gebälk, Fensterrahmen, Giebel, Gesims, Treppen), `putz_sand` (Wandfelder), `pietra_forte` (Rückseiten-Sockel, Korridor), `marmor_weiss` (Statuen), `marmor_ornament` (Kapitelle), `glas_fenster`, `dachziegel`, `holz` (Türen), `fensterladen` (optional). **Keine zwingenden Palettenwünsche.** Optional wünschenswert: ein dunkleres Grau für Pietra serena (nur Gestaltung).

### 0.5 Luftraum außerhalb der Maske
Nur das **Kranzgesims** (Lage 50..51, bis 1 Zelle über FW/FE hinaus über den Platz) und die **Korridorbrücke** (Modul 8, eigene Maske).

### 0.6 Gelände
Säulenregel: Terrain bis Y 64, Bau ab Y 65 (Übersicht §3). Liegt `groundTopY` < 64 (6.297 Zellen, Südende und Westrand), füllt Modul 0 das Fundament von `groundTopY`+1 bis 64 (`pietra_forte_bruch`, höchstens 5 Lagen). Zellen mit `groundTopY` 66..67 (7.552) werden im Footprint ab Y 65 abgetragen. Der Platz (Stadtgrund) hat Y 65 (Norden 66, Arno-Ende 63): **Schwelle des Portikus Y 65 = Platzniveau**, ±1 Lage Anschlussversatz an den Platzenden.

---

## 1. Modul 0 – Fundament und Boden (≈ 46 k)

| # | Bauteil-ID | Geometrie | Material |
|---|---|---|---|
| 1 | `fundament` | `M_UF`, Y von `groundTopY`+1 bis 64 (wo `groundTopY` < 64) | `pietra_forte_bruch` |
| 2 | `bodenplatte` | Y 65, ganz `M_UF`; Portikusboden (`t` 1..10 an FW/FE/FSN) `pflaster`, sonst `pietra_serena` | `pflaster`, `pietra_serena` |

## 2. Modul 1 – Portikus (Erdgeschoss der Piazzale-Fassaden) (≈ 55 k)

Lagen 1..14, Zonen `R_W` (FW), `R_E` (FE), plus die Stirnflächen. Aufbau nach §0.3.

| # | Bauteil-ID | Geometrie | Material |
|---|---|---|---|
| 1 | `portikus_pfeiler` | Pfeiler 5 breit × 3 tief (`t` 1..3), Lage 1..12 (22 Pfeiler plus 2 Endpfeiler). **Nische** 3 breit × 7 hoch × 1 tief, Lage 4..10, in der Pfeilerfläche (`t = 1`) | `pietra_serena` |
| 2 | `portikus_saeulen` | Säulen 2 × 2 (`t` 1..2) Lage 1..10, Kapitell Lage 11..12 `marmor_ornament` (2 × 2 × 2) | `pietra_serena`, Kapitell `marmor_ornament` |
| 3 | `portikus_gebaelk` | Architrav/Fries/Kranz durchgehend `t` 1..3, Lage 13..14, über alle Modulöffnungen und Pfeiler | `pietra_serena` |
| 4 | `portikus_rueckwand` | `t` 11..14, Lage 1..14; je Öffnung eine **Tür** (3 breit × 8 hoch) auf Öffnung 2 jedes Moduls (die Öffnungen 1 und 3: Fenster 3 × 3 in Lage 6..8); Türen `holz` in `t = 12`, Laibung massiv | `putz_sand`, `holz`, `glas_fenster` |
| 5 | `portikus_decke` | Platte Lage 14, `t` 4..10 (über dem Hohlraum), Auflager Rückwand und Gebälk | `pietra_serena` |
| 6 | `stirnwaende` | Nord- und Südende der Flügel: massive Wand w 0..11 (bzw. −4..11), `t` 1..14, Lage 1..14 mit Eckpilaster | `pietra_serena` |

Spiegelsymmetrie FW/FE (Spiegelachse = Mitte des Platzes), aber **kein** `symmetry`-Flag (schräge Fassaden, R8 nicht anwendbar).

## 3. Modul 2 – Mezzanin und Piano nobile (≈ 39 k)

Lagen 15..36, Zonen `R_W`, `R_E`, Wand `t` 1..4 bündig mit dem Gebälk.

| # | Bauteil-ID | Geometrie | Material |
|---|---|---|---|
| 1 | `mezzanin_wand` | Lage 15..20, `t` 1..4, Wandfeld; **Fenster 3 × 2** in Lage 17..18 über jeder Öffnungsmitte (33 je Flügel), Rahmen 1 `pietra_serena`, Glas `glas_fenster` in `t = 3` | `putz_sand`, `pietra_serena` |
| 2 | `nobile_wand` | Lage 21..36, `t` 1..4; **Fenster** an jeder Öffnungsmitte: Außenmaß 5 breit (Mitte ± 2) × 11 hoch (Lage 23..33), Rahmen 1 Zelle, Licht 3 × 8 (Lage 24..31), Glas in `t = 3`; **Giebel** Lage 34..35 über jedem Fenster: abwechselnd Dreieck (Lage 34 breit 5, 35 breit 3, 36 breit 1) und Segmentgiebel (Lage 34..35 breit 5, Mittelzelle 35 frei); die Giebellage 36 ist zugleich Gesimsband | `putz_sand`, `pietra_serena` |
| 3 | `gurtgesimse` | Bänder Lage 19..20 und 35..36 über die ganze Fassade, `t` 1..2 | `pietra_serena` |

## 4. Modul 3 – Dachloggia und Kranzgesims (≈ 29 k)

Lagen 37..51, Zonen `R_W`, `R_E`.

| # | Bauteil-ID | Geometrie | Material |
|---|---|---|---|
| 1 | `loggia_pfeiler_saeulen` | gleicher Rhythmus wie Modul 1 (Pfeiler 5, Säulen 2 × 2), Lage 37..47, Kapitell Lage 48..49 (`marmor_ornament`), ohne Nischen | `pietra_serena` |
| 2 | `loggia_verglasung` | Öffnungen (je 5 breit, Lage 37..47) verglast: Glas `glas_fenster` in `t = 3`, durchgehend (heutige Verglasung) | `glas_fenster` |
| 3 | `loggia_rueckwand` | `t` 11..14, Lage 37..49; Öffnungen 3 × 8 mittig in jedem Joch | `putz_sand` |
| 4 | `kranzgesims` | Lage 50..51: Gebälk `t` 1..3, Kranzgesims auskragend **+1** (Luftraum über dem Platz), Konsolen jede 2. Zelle auf Lage 50 | `pietra_serena` |

## 5. Modul 4 – Südbau mit Serliana und Arno-Fassade (≈ 35 k)

Zone `R_S`, Lage 1..51, alle Geschosse in einem Modul.

| # | Bauteil-ID | Geometrie | Material |
|---|---|---|---|
| 1 | `suedbau_waende` | Wandband `t` 4 (Chebyshev, an den Außenkanten FSR, West- und Ostende), Lage 1..51 mit den Gurtgesimsen von Modul 2 an FSR; FSR: EG geschlossen (`putz_sand`, 3 Türen 3 × 8 an u −10, 20, 50), Mezzanin/Piano-nobile-Fenster im 7er-Raster (3 je Modul), Dachloggia wie Modul 3 | `putz_sand`, `pietra_serena` |
| 2 | `serliana` | Nordfläche FSN, **u 0..27, w 276..278**, Lage 1..20: Aufbau 2 (Pfeiler) / 4 (Seitenöffnung) / 2 (Säule) / 12 (Mittelbogen) / 2 (Säule) / 4 (Seitenöffnung) / 2 (Pfeiler). Seitenöffnungen Lage 1..12 mit Sturz Lage 13..14; Mittelbogen **Rundbogen** Spannweite 12, Kämpfer Lage 12, Scheitel 18, Archivolte 1 (bis Lage 19), Gebälk Lage 13..14 durch den Bogen unterbrochen, Lage 19..20 Fries; hinter den Seitenöffnungen **Nischen** (Wand bei w 282) | `pietra_serena`, Säulen `pietra_serena` |
| 3 | `durchgang_arno` | Durchgang u 8..19 (12 breit), **w 279..297**: Tonne Spannweite 12, Kämpfer Lage 12, Scheitel 18, Dicke 2, Seitenwände `t` 4; an FSR Bogenöffnung gleichen Profils (w 298..300) zum Lungarno | `pietra_serena`, Wände `putz_sand` |
| 4 | `verone_arno` | Dachloggia Süd: Lage 37..49 gleich Modul 3, aber mit großen Fenstern (5 × 9) auf FSR | `glas_fenster`, `pietra_serena` |

## 6. Modul 5 – Rückseiten und Nebenbaukörper (≈ 100 k)

Zone `R_X` und alle Außenkanten, die weder Piazzale-Fassade noch FSR/FSN sind (Westseite Via Lambertesca/Via dei Georgofili, Ostseite, Nordenden, Südwestspitze). Wand `t` 4, Lage 1..44 (`R_X`) bzw. 1..51 (`R_W`/`R_E`/`R_S`-Rückseiten, Wand bis Traufe 51).

| # | Bauteil-ID | Geometrie | Material |
|---|---|---|---|
| 1 | `rueckseiten_sockel` | Außenband `t` 4, Lage 1..8 (Sockelzone) | `pietra_forte` |
| 2 | `rueckseiten_wand` | Außenband `t` 4, Lage 9..44 (Nebenbau) bzw. 9..49 (Flügel-Rückseite); Fenster 3 × 5 im Abstand 8 in den Lagen 10..14, 22..26, 38..42; Rahmen `pietra_serena`, Glas `glas_fenster` in `t = 2`; **Eckquader** 3 × 3 abwechselnd Läufer/Binder an den Hausecken (Eckzellen des Maskenrands mit Innenwinkel < 135°) | `putz_sand`, `pietra_serena` |
| 3 | `rueckseiten_gesims` | Lage 44 (Nebenbau) bzw. 50..51 (Flügel): Gesims `d8 = 1` | `pietra_serena` |
| 4 | `loggia_anschluss` | Nordende Westflügel: Außenwand `t` 4 entlang der Kante 28 (Loggia-Rückwand) und 27/29, Lage 1..51, **Doppelwand** mit der Loggia (Loggia-Rückwand dahinter) | `putz_sand`, `pietra_serena` |
| 5 | `ostnord_front` | Nordfläche des Ostflügels (Kanten 38–41, im Rahmen `UF` w −9..−5, u 24..82), Lage 1..51, Wand `t` 4 mit Fenstern im Modulraster, **Korridortür** (Modul 8) auf Kante 41 (siehe §9) | `putz_sand`, `pietra_serena` |

## 7. Modul 6 – Dächer und Tribuna (≈ 83 k)

| # | Bauteil-ID | Geometrie | Material |
|---|---|---|---|
| 1 | `dach_fluegel` | Zonen `R_W`, `R_E`, `R_S`: flaches Walmdach, Traufe Lage 52 (über dem Gesims) bei `d8 = 5`, Anstieg 0,4 je Block, **höchstens 6**, 2 Lagen stark (Dachrampe wie `tools/city/haus.js`) | `dachziegel` |
| 2 | `dach_nebenbau` | Zone `R_X`: Traufe Lage 45, Anstieg 0,4 je Block, höchstens 8 | `dachziegel` |
| 3 | `tribuna_tambour` | **Tribuna** (Oktogon des OSM-Teils w673458435, 847 Zellen, Mitte (−176 \| 1120), im Rahmen `UF` u 57,8, w 205,4, Umkreisradius 17): Tambour Lage 52..58, Wand `d8 ≤ 3` des Oktogons, 8 Fenster (3 × 4, Lage 54..57) je Seite, Glas `glas_fenster` | `putz_sand`, `pietra_serena` |
| 4 | `tribuna_kuppel` | Flache Kuppel über dem Oktogon: Kämpfer Lage 59, Scheitel Lage 67, Dicke 2 (`vaults.cloisterVault` über das Oktogon, riseX = 8) | `dachziegel` |
| 5 | `tribuna_laterne` | Laterne (OSM-Teil w673458443, 51 Zellen, Mitte (−176,5 \| 1120)): Lage 68..76, Wand 1, vier Öffnungen 2 × 4, Dach Lage 77..78 | `pietra_serena`, `dachziegel` |

Die Maße der Tribuna-Aufbauten (Höhen) sind **geschätzt**; die Grundrisse stammen aus OSM, die Deutung ist offen (siehe Referenzmaße §6.4). Im Dach `dach_fluegel` wird das Oktogon ausgespart.

## 8. Modul 7 – Decken, Innenwände, Treppen (≈ 166 k)

| # | Bauteil-ID | Geometrie | Material |
|---|---|---|---|
| 1 | `decke_14` | Platte Lage 14 über dem Innenraum (`t` ≥ 15 bzw. `d8 > 4` bei `R_X`/`R_S`), ohne Portikus (liegt in Modul 1) | `pietra_serena` |
| 2 | `decke_20` | Lage 20, gleiche Fläche | `pietra_serena` |
| 3 | `decke_36` | Lage 36 (Oberkante Y 101: **Korridor-Fußboden**), gleiche Fläche, ohne Tribuna-Hohlraum (Oktogon-Innenraum Lage 37..51 bleibt als Raum) | `pietra_serena` |
| 4 | `decke_traufe` | Lage 51 (`R_W`/`R_E`/`R_S`) bzw. 44 (`R_X`), Auflager der Dächer, gleiche Fläche | `pietra_serena` |
| 5 | `spinnwand_fluegel` | Längsmittelwand je Flügel, 2 dick, parallel zur Fassade bei `t` 27..28, Lage 1..49, mit Türen 3 × 8 im Abstand 24 | `putz_sand` |
| 6 | `treppen` | 4 gerade Treppen 6 breit (je 1 Stufe 1 hoch / 1 tief): in den Nord- und Südenden beider Flügel, Lage 1 → 36 (36 Stufen) | `pietra_serena` |
| 7 | `korridor_treppe` | Treppe zum Cavalcavia in der Südwestspitze, siehe Modul 8 Teil 3 | – |

Die Platten lassen Treppenlöcher aus (Teil 6) und die Korridor-Kernzone (Modul 8).

## 9. Modul 8 – Corridoio Vasariano (diesseits des Arno, ≈ 35 k)

### 9.1 Maske `M_COR`
`M_COR` = (Zellen von w328477211) ∪ (Zellen von r2302811) ∪ (Zellen von w1344547176), jeweils mit **x ≥ −528**, **abzüglich** der Zellen von `M_PV` (Palazzo Vecchio), `M_UF`, `M_LL`, `M_OM`. Messung: **2.943 Zellen** (Brücke 225, Lungarno 2.654, Anschluss 64). Zellen von w1344547176 **innerhalb** der Uffizien gehören `M_UF` (Modul 7: Boden Lage 36 als Korridor-Fußboden im Ostflügel, Dachloggia als Gang). **Quartiere nehmen diese IDs nicht auf.**

### 9.2 Teile

| # | Bauteil-ID | Geometrie | Material |
|---|---|---|---|
| 1 | `bruecke_bogen` | Brücke über die **Via della Ninna** (Maske w328477211, Fünfeck (−91,5 \| 908,5), (−84,5 \| 912), (−90,5 \| 927), (−103 \| 921,5), (−97 \| 906,5); lokal 16,2 × 13,7): Tragbogen unter dem Boden, **Halbkreis Spannweite 16, Kämpfer Lage 26 (Y 91), Scheitel Lage 34 (Y 99)**, Dicke 2, Breite = Maske; Spandrillen bis Lage 35 (Y 100) | `pietra_serena` |
| 2 | `bruecke_korridor` | Boden Lage 35..36 (**Oberkante Y 101**), Wände 3 dick an den beiden Seitenkanten ((−97 \| 906,5)→(−103 \| 921,5) und (−84,5 \| 912)→(−90,5 \| 927)), lichter Gang **7 breit × 7 hoch (Lage 37..43, Y 102..108)**, Decke Lage 44..45; kleine Fenster 2 × 3 im Abstand 8 (Lage 39..41) | `pietra_forte`, Boden `pietra_serena` |
| 3 | `treppe_cavalcavia` | Treppe in der **Südwestspitze** der Uffizien (im Rahmen `UF` u −96..−68, w 262..269): 23 Stufen (1 hoch × 1 tief, 7 breit) von Lage 36 (Y 101) bei u = −68 abwärts nach −u bis Lage 13 (Y 78) bei u = −90; Wände 2 dick, Decke bis Lage 44 | `pietra_serena` |
| 4 | `austritt_arno` | Tür aus der Uffizien-Südwestfläche (Kante 1: (−346 \| 1135) → (−335 \| 1140), Länge 12,1; Öffnung 7 breit bei t 2,5..9,5, **Lage 14..20, Y 79..85**) auf den Lungarno-Streifen; Laibung 1 `pietra_serena` | – |
| 5 | `lungarno_arkade` | Streifen im Rahmen `LG` (O (−350 \| 1141,5), θ 206,8°; Querkoordinate v = Abstand von der Nordkante nach Süd). **Zwei Arkadenreihen** (Nord v 0..2 an den Häusern, Süd v W−3..W−1 am Fluss; W = örtliche Streifenbreite 11–13): Pfeiler 3 × 3 im Abstand 12 (u_L = 6 + 12 k), vom Gelände bis Y 72; Halbkreisbögen Spannweite 9, Kämpfer Y 72, Scheitel Y 76,5, Archivolte 1; Spandrillen bis Y 76. Hohlraum dazwischen (Straße) | `pietra_serena`, Pfeiler `pietra_forte` |
| 6 | `lungarno_boden` | Platte Y 77..78 (Oberkante **Y 78**) über die ganze Streifenmaske | `pietra_serena` |
| 7 | `lungarno_korridor` | Wände 3 dick (v 0..2 und v W−3..W−1), lichter Gang 7 × 7 (Y 79..85), Decke Y 86..87; kleine Fenster 2 × 3 im Abstand 8 auf der Flussseite (Y 81..83), Glas `glas_fenster` | `pietra_forte`, `glas_fenster` |
| 8 | `schnitt_ponte_vecchio` | **Schnittlinie x = −528**: die Zellen mit x ≥ −528 gehören `uffizi`, die mit x ≤ −529 dem Projekt `ponte_vecchio`. Der Querschnitt bei x = −528/−529 ist **gleich**: Platte Y 77..78, Wände Y 79..85 (3 dick an beiden Seiten), Gang frei, Decke Y 86..87. Das Modul baut **keine** Stirnwand. | – |

Die Platten und Wände der Teile 6 und 7 liegen auf den Arkaden (Teil 5) auf (R3). Die Pfeiler haben Geländekontakt über `groundTopY` (50..66, Böschung): Pfeiler füllen von `groundTopY`+1 bis Y 72. Die Zellen von Teil 6/7 bleiben außerhalb von `M_UF`, `M_PV`.

## 10. Modul 9 – Statuen in den Nischen (optional, ≈ 0,5 k)

22 Statuen (je ein Standbild in den 22 Pfeilernischen der Piazzale-Fassaden; die Originale sind Standbilder berühmter Toskaner, großteils 19. Jh.). **Vereinfacht, nicht nach Vorbild:** Fuß 2 × 1 × 1, Körper 2 × 1 × 3, Kopf 1 × 1 × 1 (Höhe 5 = 2,5 m), `marmor_weiss`, in der Nische (Lage 4..10) auf der Sockelbank Lage 4.

## 11. Schnittstellen

### Zu `palazzo_vecchio` (Corridoio-Brücke)
Bauteile 1 und 2 (§9.2) sitzen zwischen den Polygonkanten: **PV-Kante E14–E15** (Polylinie (−84,5 \| 912) → (−91,5 \| 908,5) → (−97 \| 906,5), Länge 13,7) und **Uffizien-Kante 41** ((−103 \| 921,5) → (−90,5 \| 927), Länge 13,7). Öffnung in beiden Wänden 7 breit (Kantenabschnitt t 3,35..10,35), **Y 102..108**; Brücken-Boden Oberkante **Y 101**. PV baut die Öffnung (`og_korridor_durchgang`), `uffizi` Modul 5 Teil 5 die Gegenöffnung; keine Zelle wird doppelt belegt (Brücke liegt außerhalb beider Masken).

### Zur Loggia dei Lanzi
Gemeinsame Kante (−193,5 \| 894) → (−171,5 \| 902,5) (Länge 23,6; Uffizien-Kante 28). **Keine gemeinsame Zelle** (gemessen: 0). Die Uffizien bauen ihre Nordwand (`loggia_anschluss`) direkt an die Loggia-Rückwand; die Loggia hat bei Überlappung Vorrang (kleinere OSM-ID).

### Zum Terrain und Platz (Stadtgrund)
Säulenregel (Übersicht §3). Der Piazzale (Polygon zwischen den Flügeln) und die Plätze gehören dem Stadtgrund; **die Uffizien überbauen den Piazzale nicht** (nur das Kranzgesims +1). Anschlusshöhe Platz 65 (Nord 66, Süd 63).

### Zu OSM-Nachbarn und Quartieren
Das Polygon w477279033 überlappt folgende Gebäude in **14 Zellen** (diese Zellen gehören den Uffizien, wo dessen ID nicht größer ist; die Übersicht legt allgemein **Wahrzeichen-Vorrang** fest): r2302811 (2), w477279045 (1), w157937048 Torre dei Pulci (4), w114815080 (3), w518531723 (1), w307129124 Castello d'Altafronte (1), r1603607 (2). Nachbarn im Abstand ≤ 2: dieselben plus w114769411 Palazzo dei Veliti und w328477211 (Brücke, gehört `uffizi`).

### Zum Projekt `ponte_vecchio`
Schnittlinie x = −528, Querschnitt Y 77..87 (Teil 8). Das Gebäude r2302812 (Ponte-Vecchio-Läden, retail) überlappt `M_COR` in **97 Zellen** bei x ≥ −528; dort hat `M_COR` Vorrang, das Projekt `ponte_vecchio` schließt diese Zellen aus.

---

## 12. Blockzahlen (Richtwert)

| Modul | Blöcke |
|---|---|
| 0 Fundament, Boden | 46 k |
| 1 Portikus | 55 k |
| 2 Mezzanin, Piano nobile | 39 k |
| 3 Dachloggia, Gesims | 29 k |
| 4 Südbau, Serliana | 35 k |
| 5 Rückseiten, Nebenbauten | 100 k |
| 6 Dächer, Tribuna | 83 k |
| 7 Decken, Innenwände | 166 k |
| 8 Corridoio Vasariano | 35 k |
| 9 Statuen (optional) | 0,5 k |
| **Summe** | **≈ 590 k** (410–770 k) |

≈ 280 Bauschritte; ohne `spinnwand_fluegel` ≈ −55 k.

## 13. Prüfliste
- Traufe Lage 51 = Y 116; Piano-nobile-Decke Y 101; Korridorgang Y 102..108.
- 11 Module je Flügel (22 Pfeiler mit Nische) plus Serliana (28 Zellen).
- Brücke: Boden Y 101, beide Kanten 13,7 lang, Wandöffnungen Y 102..108.
- Lungarno: Boden Y 78, Dach Y 87; Schnitt x = −528.
- Zellen der Module 0–7 nur in `M_UF`; Modul 8 nur in `M_COR`.
