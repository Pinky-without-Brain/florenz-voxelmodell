# Bauteilkatalog – Loggia del Bigallo (W5c)

Maße: [`REFERENZMASSE.md`](REFERENZMASSE.md). Rahmen `BG` (θ −4,14°), Lagen `yr = Y − 64`. Bauplan `projects/loggia_del_bigallo/model/_bg.js` (ein Plan als Zellen im Speicher, Hilfswerkzeug `tools/wahrzeichen/zellplan.js`), Module m0–m5 sind Teillisten; Ausstattung in `_bg_raeume.js`. Projekt `type: "wahrzeichen"`, `"begehbarkeit": "pflicht"`, Rollen der Palette, Blockzahl 5.948 (±5 %).

| Modul | Titel | Bauteile (Bau-Reihenfolge) | Inhalt, Stufe |
|---|---|---|---|
| 0 | Boden | `boden` | Pflaster in der Halle, Marmor-Schachbrett (`marmor_weiss`, `pietra_serena`, `marmor_rot`) in der Loggia – C |
| 1 | Fassade | `fassade_eg`, `fassade_og` | Nord- und Ostwand 3 dick; vier Rundbögen (`arkade`), Straßentür (`tuer`), Inkrustation aus `marmor_weiss` und `marmor_gruen`, Archivolten aus `marmor_rot`/`marmor_weiss`; Obergeschoss `pietra_forte`, Bifore mit `marmor_saeule` und Glas in allen Lagen, Marmorbänder – A |
| 2 | Mauern, Trennwände, Decken | `aussenwaende`, `trennwaende`, `geschossboden`, `obere_decke` | Süd/West 2 dick (`pietra_forte`, innen `putz_weiss`), Trennwände mit Türen 3 × 5, Böden Cotto/`holz`, Decke – C |
| 3 | Treppe, Dach, Loggia | `treppe`, `dach`, `rippengewoelbe`, `tabernakel_statuen`, `wappen_misericordia` | Podesttreppe (`stone_stairs`, 5 + 4 Stufen, Breite 2) mit Kragsteinen; Walmdach `dachziegel`; Rippenkreuze mit goldenem Schlussstein; drei Nischen mit Statuen, Giebel, Lünette; Wappen mit rotem Kreuz – A/C |
| 4 | Licht | `licht` | Seelaternen im Boden, je Raum Abstand ≤ 9 – C |
| 5 | Museum und Halle | `saal_1`, `saal_2`, `saal_3`, `eingangshalle` | siehe unten |

## Ausgestaltete Innenräume (W5c)
Wandfelder ersetzen Zellen der inneren Wandlage (Rollen `fresko`, `gold`, `holz`), Vitrinen sind Pietra-serena-Sockel mit Glashaube. Quelle jeweils it.wikipedia „Loggia del Bigallo“; die Muster sind **vereinfacht, nicht nach Vorbild**.
- **Saal 1**: Holzsockel, drei goldgerahmte Freskenfelder (Werkstatt Nardo di Cione), Tafelkreuz (Maestro del Bigallo) – A (Inhalt), C (Muster).
- **Saal 2**: Triptychon von Bernardo Daddi (Mittelbild 4 × 6, Seitentafeln 3 × 5 in Goldrahmen), zwei Vitrinen – A/C.
- **Saal 3**: Fresko Misericordia Domini als Feld 7 × 5 (Madonna mit Schutzmantel, Stadt mit Türmen, Reihe mit 18 Männern links und 18 Frauen rechts), Vitrine – A/C. Bilderunterkante 2 Blöcke über dem Boden (Standard §2).
- **Eingangshalle**: Steinbank, Kassentisch – C.
- **Loggia**: Rippengewölbe, drei Tabernakel (Madonna mit Kind, San Pietro Martire, Santa Lucia) in Nischen der Rückwand, Lünette mit der Madonna – A.

## Begehbarkeit und Dichtheit
Zugang über die Straßentür der Halle (3 × 5) und über die vier Bögen der Loggia (offen, `arkade`); Türen zwischen Halle und Loggia und zwischen den Sälen 3 × 5; Treppe mit Kopffreiheit ≥ 3 vom Erdgeschoss in Saal 1, Treppenloch nur über dem oberen Lauf; Böden je Geschoss; Licht ≤ 12 Blöcke; Fenster verglast; Dach massiv. R13: 0 nicht erreichbare Komponenten, R14: 0 Lücken.
