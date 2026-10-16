# Bauteilkatalog – San Lorenzo mit Cappelle Medicee (V3 D3)

Maße: [`REFERENZMASSE.md`](REFERENZMASSE.md). Rahmen SL (θ 192,8°), wc = w + 2,5 (Abstand zur Langhausachse). Lagen yr = Y − 67. Ein Bauplan in `projects/san_lorenzo/model/_sl.js` (erste Setzung gewinnt), Module sind Teillisten.

## 0. Zonen
`fassade` u < 3 · `mittel` |wc| < 14 (mit Säulenreihe |wc| 12..14) · `seite` 14..25 · `kapellenlinie` 25..26,5 · `kapelle` bis zur Außenwand · `querkapelle` (u 96..131, |w| > 32,5) · `vierung` u 112..138, |wc| < 13 · `quer` Querarme · `chor` u 138..158, |wc| < 13 · `chorkapelle` · `sak_alt` / `sak_neu` (OSM-Teile) · Principi: `oktogon` (Achteck-Abstand < 28), `oktwand` (28..34,5), `nebenraum`.

## 1. Module

| Modul | Titel | Bauteile |
|---|---|---|
| 0 | Fundament, Böden, Krypta | `fundament`, `krypta`, `krypta_treppe`, `boden` |
| 1 | Fassade | `fassade`, `fassade_okulus` |
| 2 | Säulen und Arkaden | `saeulen`, `arkaden`, `obergaden`, `obergaden_fenster`, `kapellenpfeiler`, `kapellen_trennwaende` |
| 3 | Außenwände | `seitenwaende`, `querhaus_aussen`, `chor_aussen`, `chorwaende`, `querhaus_ostwand`, `fenster` |
| 4 | Vierung und Kuppel | `vierungspfeiler`, `vierungsboegen`, `pendentifs`, `tambour`, `vierungskuppel`, `laterne` |
| 5 | Decken und Dächer | `kassettendecke`, `gewoelbe`, `dach_langhaus`, `dach_querhaus`, `dach_seiten`, `schildwaende` |
| 6 | Sakristeien | `sakristei_alt`, `sakristei_alt_kuppel`, `sakristei_neu`, `sakristei_neu_kuppel` |
| 7 | Cappella dei Principi | `oktogon_wand`, `nebenraeume`, `krypta_decke`, `oktogon_boden`, `tambour_principi`, `kuppel_principi`, `laterne_principi` |
| 8 | Ausstattung | `grabmaeler`, `licht` |

Kryptadecke und Kapellenboden gehören zu Modul 7: sie liegen auf den Achteckwänden (sonst ohne Halt in Modul 0).

## 2. Begehbarkeit
- Kirche: drei Fassadenportale; Sakristeien über Türen aus den Querarmen; Raum hinter der Alten Sakristei über eine Tür aus ihr.
- Cappelle Medicee wie heute: Eingang auf Straßenhöhe im Westen in die **Krypta** (Y 61), Treppe (Weltachse, 6 Stufen) in den Vorraum, Tür ins Achteck; Krypta auch unter dem Achteck (Durchgang in der Achteckwand).
- Unzugänglich deklariert: Dachräume über Decken und Gewölben, vordere Nebenräume der Kapelle, Inneres der Laterne.
- Licht: Seelaternen im Boden von Kirche, Kapelle und Krypta (≤ 12).

## 3. Campanile (V5b)
**Quellen:** it.wikipedia (Basilica di San Lorenzo): „Il campanile (Ferdinando Ruggieri, 1740, 54 m)“ steht „accanto alla Sagrestia Nuova“ am rechten Ende des Querhauses; gonews.it (30.10.2020, Segnung nach der Restaurierung 2017 bis 2020): Bau 1740 bis Juli 1741 nach Ruggieri, nach dessen Tod von seinem Bruder Giuseppe vollendet, Auftraggeberin Anna Maria Luisa de’ Medici, Material Pietra forte, **fünf Glocken** (drei große von Gian Gastone de’ Medici 1740, zwei kleine für die Werktage).

**Lage (Stufe B/C):** OSM führt den Turm nicht als eigenes Gebäude (die als `bell_tower` getaggten Wege liegen nicht bei dieser Kirche). Die Beschreibung „neben der Sagrestia Nuova am rechten Ende des Querhauses“ ergibt im Rahmen SL (u nach Westen, w > 0 Norden) die Lücke zwischen dem Nordende des Querhauses (Nordwand w ≈ 52) und der Ostwand der Neuen Sakristei (u ≈ 129): freier Grund ohne OSM-Gebäude, kein Haus eines Quartiers betroffen (daher kein Eintrag in `vorrang.json`, keine gelöschte Hausakte). Exakte Grundfläche und Wandstärke sind Annahmen (Stufe C): 14 × 16 Blöcke (7 × 8 m), Wände 2 Blöcke dick.

**Maske:** neue Zusatzmaske `campanile` in `project.json` aus einem Rechteck im Rahmen des Projekts (`"rechtecke": [{ "u": [114, 128], "w": [51, 67] }]`, siehe `tools/wahrzeichen/projekt.js`), abzüglich der Hauptmaske, `gelaendeBis: boden`. Gelände dort Y 63 bis 64, Boden des Turms wie der der Kirche (Y 67).

| Modul | Titel | Bauteile |
|---|---|---|
| 9 | Campanile | `campanile_schaft`, `campanile_treppe`, `glockenstube`, `glockenjoch`, `glocken`, `campanile_spitze`, `campanile_licht` |

**Aufbau** (gemeinsamer Bauplan `tools/wahrzeichen/campanile.js`, Parameter `CAMP` in `_sl.js`): Sockel 6 Lagen Tuffziegel, Schaft aus Poliertem Andesit (Pietra forte) mit Gesimsen auf Lage 18, 38, 58 und 77, Fensterschlitze alle 20 Lagen; **Glockenstube Lage 78 bis 92** mit je einer hohen Rundbogenöffnung (6 Blöcke breit) auf jeder Seite, Boden aus Schwarzeichenholz, Gesims oben und unten; **fünf Glocken** (Geschnittener Kupferblock, drei große 2 × 2, zwei kleine 1 × 1) unter einem umlaufenden Joch aus Schwarzeichenholz auf Lage 86, Unterkante der Glocken Lage 82 (Kopffreiheit); gestufter **Kuppelhelm** ab Lage 93 mit Spitze aus Kupferblock, Oberkante **Lage 104 = Y 171 = 54 m** über Gelände 63.

**Begehbarkeit:** Tür (3 breit, 4 hoch) aus der Kapelle am Nordende des Querhauses durch beide Mauern in den Turm; **Wendeltreppe** 5 × 5 in Weltachsen (Treppenblöcke aus Glattem Stein, Kern und Eckpodeste aus Vollblöcken) vom Boden bis zum Stubenboden, Kopffreiheit 3 auch über den Eckpodesten unter dem Stubenboden; Dach- und Helmhohlraum und die Oberseite des Jochs unzugänglich deklariert; Licht: Seelaternen in der inneren Mauerschale alle 8 Lagen auf vier Seiten und in den Ecken der Glockenstube.
