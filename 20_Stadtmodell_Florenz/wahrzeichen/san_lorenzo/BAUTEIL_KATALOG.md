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
