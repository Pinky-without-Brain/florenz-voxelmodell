# Bauteil-Katalog – Loggia dei Lanzi (`loggia_dei_lanzi`, V3 D1)

Verbindlich für die Umsetzung. Maße und Herkunft: [`REFERENZMASSE.md`](REFERENZMASSE.md). Pipeline: [`tools/ARCHITEKTUR.md`](../../../tools/ARCHITEKTUR.md) (§0, §3, §10). Palette: `tools/spec/palette.js` (**Rollen**). Blockzahlen ±30 %. Projekt `type: "wahrzeichen"`, `projects/loggia_dei_lanzi/model/m0_*.js` … `m7_*.js`. Bauteile in Bau-Reihenfolge.

## 0. Allgemeine Regeln

### 0.1 Rahmen `LL`
- Ursprung `O = (−199 | 865)`, **θ = +21,5°** (von +x nach +z).
- `x = O.x + u·cosθ − w·sinθ`, `z = O.z + u·sinθ + w·cosθ` (cosθ = 0,9304, sinθ = 0,3665).
- Rückabbildung: `u = (x−O.x)·cosθ + (z−O.z)·sinθ`, `w = −(x−O.x)·sinθ + (z−O.z)·cosθ`. Rasterung durch Rückabbildung der Zellmitte, Intervalle halboffen.
- **Fassadenrichtung:** Front (Piazza-Seite) = **+21,5° gegen die Modell-x-Achse** (Blick nach NNO, Normale (0,37 | −0,93)); Seitenwände 111,5°. Die Loggia ist 22,9° gegen die Domachse (−1,36°) verdreht.
- Nominal: **u −39..38** (78 Zellen, Spiegelachse u = −0,5), **w 0..24** (Ostteil, u ≥ 16) bzw. **w 0..27** (Westteil, u ≤ 15).
- **Maske `M_LL`** = Zellen des OSM-Polygons w43284457 (2.080 Zellen, Rand zählt innen). **Jedes Bauteil wird mit `M_LL` geschnitten** (OSM gewinnt; die Westwand ist in der Maske etwa 1 Zelle schmaler, weil die Kante 2,5° schief steht). Luftraum außerhalb der Maske: **keiner**.
- **Höhe:** `y_rel = Y − bodenY`, **`bodenY = 67`**; Plattenoberkante Y 67, Lage 1 = Y 68. Höhe in m = `y_rel`/2.

### 0.2 Raster der Front (u-Zellen)
| Element | u-Bereich | Mitte |
|---|---|---|
| Pfeiler P0 | −39..−34 | −36,5 |
| Bogen A0 (West) | −33..−16 | −24,5 |
| Pfeiler P1 | −15..−10 | −12,5 |
| Bogen A1 (Mitte) | −9..8 | −0,5 |
| Pfeiler P2 | 9..14 | 11,5 |
| Bogen A2 (Ost) | 15..32 | 23,5 |
| Pfeiler P3 | 33..38 | 35,5 |

Frontpfeiler liegen bei **w 0..5**. Rückwand: w 22..24 (3 dick), im Westteil (u ≤ 15) zusätzlich Verstärkung **w 25..27**. Vom Platz aus gesehen ist links = Ost (+u). Dort steht der Perseus (Quelle: „im linken Bogen“).

### 0.3 Rollen
`pietra_forte_bruch` (Fundament), `pflaster` (Boden), `pietra_forte` (Wände, Pfeilerkerne), `pietra_serena` (Bögen, Gewölbe, Sockel, Gesims), `marmor_weiss` (Halbsäulen, Brüstung, Skulpturen), `marmor_ornament` (Kapitelle, Medaillonrahmen), `fresko` (Medaillongrund: blaue Keramik), `gold` (Sterne), `bronze` (Perseus, optional), `holz` entfällt. **Keine Palettenwünsche.**

### 0.4 Gelände
Säulenregel: Terrain bis Y 66, Bau ab Y 67 (Übersicht §3). `groundTopY` 66 (1.788 Zellen): Platte Y 67 liegt direkt auf (1 Lage über Platzniveau = Stufe); `groundTopY` 67 (292 Zellen): Gelände im Footprint ab Y 67 abgetragen. Kein Fundament nötig (kein Y mit `groundTopY` < 66).

---

## 1. Modul 0 – Boden (≈ 2,3 k)

| # | Bauteil-ID | Geometrie | Material |
|---|---|---|---|
| 1 | `bodenplatte` | Y 67, ganz `M_LL`; Muster: Raster 6 × 6 abwechselnd `pflaster` / `pietra_serena` (Schachbrett, bezogen auf u, w) | `pflaster`, `pietra_serena` |
| 2 | `podest_front` | Lage 1 (Y 68) entlang der Front: Zellen `w 0..1`, über die Bogenöffnungen A0..A2 (die Schwelle = zweite Stufe) | `pietra_serena` |

## 2. Modul 1 – Pfeiler mit Halbsäulen (≈ 3 k)

| # | Bauteil-ID | Geometrie | Material |
|---|---|---|---|
| 1 | `sockel_pfeiler` | je Frontpfeiler (P0..P3, w 0..5) Lage 1..2: 6 × 6 voll | `pietra_serena` |
| 2 | `pfeiler_front` | Schaft Lage 3..11: 6 × 6 ohne die vier Eckzellen (Fase) in `pietra_forte`; dazu **Halbsäulen** `marmor_weiss` (2 breit × 1 vorspringend, wenn die Maske es zulässt) auf den beiden Bogenseiten (±u) und zur Hallenseite (+w, bei w 6); die Frontseite bleibt in der Fassadenebene (w 0), weil darüber die Maske endet | `pietra_forte`, Halbsäulen `marmor_weiss` |
| 3 | `kapitelle_front` | Lage 12..13: 6 × 6, Fase wie oben, beide Lagen 6 × 6 voll | `marmor_ornament` |
| 4 | `pilaster_rueckwand` | Wandvorlagen 6 breit × 3 tief an der Innenseite der Rückwand, **w 19..21**, bei den Pfeiler-u-Bereichen (−39..−34, −15..−10, 9..14, 33..38), Lage 3..13 (Schaft `pietra_forte`, Sockel Lage 1..2 `pietra_serena`, Kapitell Lage 12..13 `marmor_ornament`) | wie oben |

Symmetrie: spiegelsymmetrisch in u um −0,5 (nicht beantragbar; R8 kennt nur ganzzahlige Mittelpunkte). Teil 1 und 2 werden an den Frontpfeilern **vor** den Wänden gebaut.

## 3. Modul 2 – Wände (≈ 14 k)

| # | Bauteil-ID | Geometrie | Material |
|---|---|---|---|
| 1 | `rueckwand` | **w 22..24**, u −39..38 (maskengeschnitten), Lage 3..29; im Westteil (u ≤ 15) zusätzlich **w 25..27**, Lage 3..29. Schlitze für Pilaster: Zellen der Pilaster (Modul 1 Teil 4) liegen davor (w 19..21), nicht in der Wand. Östliches Ende: die Wand schließt bündig mit der Ostwand | `pietra_forte` |
| 2 | `wand_west` | u −39..−37, **w 6..21**, Lage 3..29, maskengeschnitten; geschlossen (Annahme C) | `pietra_forte` |
| 3 | `wand_ost` | u 36..38, w 6..21, Lage 3..29; **Seitenbogen** als Öffnung: lichte Weite w 6..21 (16 Zellen), unten rechteckig bis Lage 13, darüber Halbkreis um (w 13,5; Lage 13), Radius 8 → Scheitel Lage 21. Öffnungszellen: Luft | `pietra_forte` |
| 4 | `frontwand_ueber_bogen` | Front: **w 0..2**, Lage 14..27 über den drei Bögen und zwischen den Pfeilern; Bogenöffnung (Luft): u-Mitte ± 9, Halbkreis Radius 9 um Lage 13, Scheitel Lage 22 (Zellen mit (u−u_m)² + (y−13)² ≤ 81 und y ≥ 13 sind Luft, für y 3..12 ist die ganze Bogenbreite Luft); die Zellen der Archivolte (Modul 3) bleiben frei für Teil 1 dort | `pietra_forte` |
| 5 | `seitenwand_pfeilerverbindung` | Fuß der Ostwand: Lage 1..2 Sockel `pietra_serena` w 6..21, u 36..38 (Schwelle des Seitenbogens) | `pietra_serena` |

## 4. Modul 3 – Bögen und Archivolten (≈ 1,5 k)

| # | Bauteil-ID | Geometrie | Material |
|---|---|---|---|
| 1 | `archivolten_front` | je Bogen Ring zwischen Radius 9,5 und 11,5 um (u_m; Lage 13) mit y ≥ 13, w 0..2 (Front) und w 3..5 als Gurt (innen), Scheitel Außenkante Lage 24 | `pietra_serena` |
| 2 | `archivolte_ost` | Seitenbogen: Ring Radius 8,5 bis 10,5 um (w 13,5; Lage 13), u 36..38 | `pietra_serena` |
| 3 | `schlusssteine` | je Bogen ein Schlussstein im Scheitel, 2 breit × 2 hoch (über Archivolte, Lage 23..24), Front | `marmor_ornament` |

Die Archivolten liegen auf Kapitellen bzw. Wänden auf (R3). Wand-Teile aus Modul 2 lassen die Archivoltenzellen aus.

## 5. Modul 4 – Gewölbe (≈ 2,7 k)

| # | Bauteil-ID | Geometrie | Material |
|---|---|---|---|
| 1 | `kreuzgewoelbe_west` | Joch A0: u −36,5..−12,5 (Pfeilermitten), w 3..21; Kämpfer Lage 13, Scheitel Laibung Lage 22, Dicke 2 (Extrados 24). Laibung = max der beiden Tonnen: Tonne 1 (Achse w, Spannweite 24, Halbweite 12, Steigung 9), Tonne 2 (Achse u, Spannweite 18, Halbweite 9, Steigung 9). `vaults.groinVault` mit riseX = riseZ = 9. Gurtbogen 2 breit über den Pfeilerachsen. | `pietra_serena` |
| 2 | `kreuzgewoelbe_mitte` | Joch A1: u −12,5..11,5 | `pietra_serena` |
| 3 | `kreuzgewoelbe_ost` | Joch A2: u 11,5..35,5 | `pietra_serena` |
| 4 | `konsolen_peducci` | 8 Konsolsteine 2 × 2 × 2 in Lage 11..12 an den Gewölbeansätzen der Rückwandpilaster (Zellen w 19..20) | `marmor_ornament` |

`vaults.connectEdges` anwenden (Kanten-Kontakt). Die Gewölbe ruhen auf den Pfeilern/Kapitellen, Frontwand und Rückwand (R3). Die Gewölbe sind in der Reihenfolge Wand → Gewölbe zu bauen.

## 6. Modul 5 – Fries, Terrasse, Brüstung (≈ 5,5 k)

| # | Bauteil-ID | Geometrie | Material |
|---|---|---|---|
| 1 | `fries` | Front Lage 25..27, w 0..2, u −39..38 (über den Archivolten, soweit frei) | `pietra_forte` |
| 2 | `medaillons` | **4 Medaillons** (Tugenden), je 3 × 3 Zellen Lage 25..27 an der Außenfläche (w 0), Mitte bei den Pfeilern u = −36,5, −12,5, 11,5, 35,5: Rahmen 8 Ringzellen `marmor_ornament`, Mittelzelle `gold`; Hintergrund unter dem Rahmen blau (`fresko`, blaue Keramik) in der Ebene w 1 | `marmor_ornament`, `fresko`, `gold` |
| 3 | `terrasse` | Lage 28..29: Platte über ganz `M_LL` (w 0..27 maskiert); Auflager auf Wänden, Pfeilern und Fries (die Gewölbe liegen darunter, Hohlraum bis Lage 27 bleibt) | `pietra_serena` |
| 4 | `brustung` | Lage 30..32: Ring `d8 = 1` entlang der Außenkante (Front, Westseite, Ostseite, Rückseite westlich u < 16); Lage 30..31 **Balusterraster**: jede zweite Zelle fehlt, Lage 32 durchgehend (Handlauf) | `marmor_weiss` |
| 5 | `dachaustritt` | Zelle w 20..22, u −2..1, Lage 30..33: kleine Aufbauhaube für den Zugang (optional) | `pietra_forte` |

## 7. Modul 6 – Sockel für Statuen (optional, ≈ 0,25 k)

**Optional und vereinfacht.** Sockel (`marmor_weiss`) mit Maßen und Lage im Rahmen `LL` (alle Statuen stehen auf der Bodenplatte, Lage 1 = Y 68):

| Sockel-ID | u | w | Breite × Tiefe × Höhe |
|---|---|---|---|
| `sockel_perseus` | 21..25 | 10..14 | 5 × 5 × 2 (Perseus 3,2 m mit Sockel laut it) |
| `sockel_sabinerinnen` | −27..−22 | 11..16 | 6 × 6 × 4 |
| `sockel_herkules` | −7..−4 | 12..15 | 4 × 4 × 2 |
| `sockel_polyxena` | 3..6 | 12..15 | 4 × 4 × 2 |
| `sockel_menelaos` | −32..−29 | 15..18 | 4 × 4 × 2 |
| `sockel_ruckwand_1..6` | u = −29, −21, −5, 3, 19, 27 (je 2 breit), w 19..20 | – | 2 × 2 × 2 |

## 8. Modul 7 – Statuen (optional, ≈ 0,4 k)

**Alles optional, vereinfachte Blockfiguren, nicht nach Vorbild.** Lagen ab Oberkante Sockel.

| Teil | Figur | Maße | Material |
|---|---|---|---|
| `perseus` | Körper 2 × 2 × 4, Kopf 1 × 1 × 1, abgesetzter Arm mit Medusenkopf 1 × 1 × 1 seitlich auf Höhe 3 | 5 hoch (2,5 m) | `bronze` |
| `sabinerinnen` | dreistufige Gruppe: 4 × 4 × 4, darüber 2 × 2 × 3, 1 × 1 × 2 (spiralförmige Gruppe, Höhe 9 ≈ 4,5 m) | 9 hoch | `marmor_weiss` |
| `herkules_nessus`, `polyxena`, `menelaos_patroklos` | Gruppe 3 × 3 × 4, darüber 2 × 2 × 3 | 7 hoch | `marmor_weiss` |
| `rueckwand_figuren` (6) | Figur 2 × 2 × 5 | 5 hoch | `marmor_weiss` |
| `medici_loewen` (2) | Löwe 3 × 2 × 2 an den Zellen u −8 / 7, w 7..9 (Lage 68; der rechte ist römisch, der linke von Vacca; hier gleich) | 2 hoch | `marmor_weiss` |

Die Zuordnung der Positionen folgt en/it nur teilweise (Perseus im linken Bogen, Sabinerinnen rechts, Löwen an der Treppe, sechs Frauen an der Rückwand); die anderen Positionen sind geschätzt.

## 9. Schnittstellen

### Zur Piazza (Stadtgrund)
Die Front liegt **auf** der Platzkante: Das Platzpolygon w23298643 grenzt an Front und Westseite. In der Maske gibt es keine gemeinsame Zelle (0 Überlappung gemessen). **Vorrang:** `M_LL` gehört dem Wahrzeichen (Übersicht §3).

### Zu den Uffizien (`uffizi`)
Gemeinsame Polygonkante `(−193,5 | 894) → (−171,5 | 902,5)` (Länge 23,6; Loggia-Kante 3, Uffizien-Kante 28), im Rahmen `LL` die Strecke **u 15,7..39,3 bei w ≈ 25** (Rückwand Ostteil). **Zellregel:** Die Loggia belegt alle Zellen ihrer Maske (die Randzellen liegen auf ganzzahligen Punkten der Kante nicht; Messung: 0 gemeinsame Zellen). Die Uffizien bauen ihre Nordwand **an** diese Kante: die erste Uffizien-Zelle liegt direkt hinter der Rückwand der Loggia. Die Rückwand (w 22..24) ist also eine **Doppelwand** (Loggia + Uffizien-Wand). Die Loggia hat Vorrang bei Überlappung (kleinere OSM-ID: 43.284.457 < 477.279.033). Der Seitenbogen Ost (w 6..21, u 36..38) öffnet auf das Freie zwischen Loggia und Palazzo Vecchio, **nicht** in die Uffizien (diese beginnen bei w ≥ 25).
Der Eingang des Piazzale degli Uffizi liegt östlich der Loggia (im Uffizien-Rahmen bei u 0..25, w −9 … 0) und bleibt frei.

### Zu OSM-Nachbarn (Quartier)
Überlappung mit w114815080 („building=government“, 5.923 Zellen, Palazzo/Archiv westlich der Uffizien): **10 Zellen** im Rückwandbereich der Loggia. Diese gehören dem **Wahrzeichen** (Vorrang, ID-Regel stimmt: 43,28 Mio < 114,8 Mio). Das Quartier muss diese Zellen ausschließen (Übersicht §3).

### Zum Palazzo Vecchio
Kein gemeinsamer Rand, Abstand 18 Blöcke (Piazza).

## 10. Blockzahlen

| Modul | Blöcke |
|---|---|
| 0 Boden | 2,3 k |
| 1 Pfeiler | 3 k |
| 2 Wände | 14 k |
| 3 Bögen | 1,5 k |
| 4 Gewölbe | 2,7 k |
| 5 Fries, Terrasse, Brüstung | 5,5 k |
| 6, 7 Sockel und Statuen (optional) | 0,65 k |
| **Summe** | **≈ 30 k** (22–38 k) |

≈ 15 Bauschritte.

## 11. Prüfliste
- Brüstungsoberkante Y 99 (Lage 32), Terrassenplatte Y 95..96.
- Bogenscheitel Front Laibung Y 89 (Lage 22), Seitenbogen Y 88 (Lage 21).
- 3 Frontbögen + 1 Seitenbogen, 4 Pfeiler, 4 Medaillons.
- Alle Zellen in `M_LL`, Zellen der Archivolten nur von Modul 3.
