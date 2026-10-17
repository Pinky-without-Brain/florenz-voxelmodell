# Bauteilkatalog – Biblioteca Nazionale Centrale (W8b)

Maße: [`REFERENZMASSE.md`](REFERENZMASSE.md). Rahmen θ 8° (u von der Tribuna nach Osten, w vom Corso dei Tintori zum Fluss), Lagen `yr = Y − 61`. Bauplan `tools/wahrzeichen/palazzo.js` mit den Einstellungen in `projects/biblioteca_nazionale/model/_bn.js`, Raumplan, Türme und Ausstattung in `_raeume.js`. Projekt `type: "wahrzeichen"`, `"begehbarkeit": "pflicht"`, 271.131 Blöcke, 8 Module, 20.985 Zellen. Der Content der Module 0..6 entsteht mit `node tools/diag/w8b_inhalt.js biblioteca_nazionale` (Texte in `tools/diag/w8b_texte.js`), Modul 7 aus `INHALT` in `_raeume.js`.

## 1. Module und Bauteile

| Modul | Titel | Bauteile (Bau-Reihenfolge) | Inhalt, Stufe |
|---|---|---|---|
| 0 | Fundament, Boden und Treppe | `fundament`, `boden`, `treppe` | Bruchstein bei tiefem Gelände, Boden aus Terrakotta/Marmor, Pietra serena unter dem Portikus, Wendeltreppe (Kern 3 × 3) in der Verteilerhalle durch alle Geschosse – C |
| 1 | Fassaden und Portikus | `aussenwand`, `portikus`, `fenster`, `kranzgesims` | Travertin-Putz mit Pietra-forte-Bändern, Rustika im Erdgeschoss der Fronten, Gesimse aus Pietra serena; **Portikus** aus fünf Rundbögen auf Säulen an der Flussfront – A (Joche C); Fenster im Raster 10, bogenförmig; Portal der Tribuna (6 × 9) – A (Lage C) |
| 2 | Portikuswand und Innenwände | `loggiawand`, `trennwaende` | Rückwand des Portikus mit zwei Türen, Querwände und Längswände im Erdgeschoss – C |
| 3 | Böden und Decke | `geschossboeden`, `decke`, `trennwaende_og` | Böden aus Holz und Terrakotta mit Treppenloch, oberste Decke, Trennwände der Obergeschosse – C |
| 4 | Dach | `dach` | Walmdach 3 Lagen, Dachraum `unzugaenglich` – C |
| 5 | Türme mit den Statuen | `turm`, `turm_statuen` | zwei Türme über den Ecken der Flussfront bis Lage 58 (Schaft hohl, `unzugaenglich`), Abschlussplatte, Sockel und Marmorfigur (Dante im Westturm, Galileo im Ostturm) – A (Türme mit Statuen), C (Höhen, Zuordnung) |
| 6 | Licht | `licht` | Seelaternen im Boden jedes Raums, Abstand ≤ 12 |
| 7 | Tribuna, Verteilerhalle, Lesesäle und Magazine | `tribuna`, `verteilerhalle`, `katalogsaal`, `zeitschriftensaal`, `sala_lettura`, `sala_consultazione`, `lesesaal_oben`, `magazin_nord`, `magazin_ost`, `verwaltung`, `licht_ausstattung` | siehe unten |

## 2. Ausgestaltete Innenräume
Alles vereinfacht, nicht nach Vorbild; Wandfelder bleiben im Bauteil ihrer Wand (Lehre W7c), Böden, Decken und Möbel gehören den Teilen der Räume. Lage der Räume Stufe C.
- **Tribuna Dante e Galileo** (Westende, Erdgeschoss): runder Saal mit rotem und goldenem Kreis im Marmorboden, Wandfelder in Weiß und Blau mit Goldrahmen, Kassettendecke, zwei Marmorfiguren auf Sockeln – A (Tribüne), C (Gestaltung).
- **Verteilerhalle** (Kreuzung der Achsen): Marmorboden mit Kreis um die Wendeltreppe, vier Säulen, Wandfelder, Kassettendecke – A (Halle, Säulen, Treppe), C (Maße; die monumentale Treppe ist eine Wendeltreppe).
- **Katalogsaal, Zeitschriftensaal, Verwaltung** (Erdgeschoss Westflügel): Schachböden, Wandfelder, Kassettendecken, Reihen von Tischen und Katalogkästen (eine Lage hoch) – A (Funktionen an der Flussachse), C (Lage).
- **Sala di lettura** (Piano 1, Westflügel): rechteckig, zwei Reihen weißer Säulen mit Architrav (Gebälk statt Bögen), Lesetische – A (Arkaden auf Säulen), C (Maße).
- **Sala di consultazione** (Piano 1) und **Lesesaal im Piano 2:** weitere Lesesäle mit Tischreihen – C.
- **Magazine** (Mitteltrakt hinten und Ostflügel, drei Geschosse): Doppelregale (Holz, braune und rote Bücherreihen) vom Boden bis zur Decke, Querwege alle 20 Blöcke, Gang an der Wand – A (Magazine im Rücken, Regallänge), C (Verteilung); Regale reichen bis zur Decke, die Räume darüber sind kein Stehraum.

## 3. Begehbarkeit und Dichtheit
Zugang über den Portikus (fünf Bögen bis zum Boden offen, `arkade`; Rückwand mit zwei Türen) und über das Portal der Tribuna (`tor`); Wendeltreppe mit Kopffreiheit 3 durch alle Geschosse; Trennwand-Türen 3,4 × 5; Fenster verglast; Licht ≤ 12 Blöcke; Dachraum und Turmschäfte `unzugaenglich`. Die Türme sind nicht zugänglich (wie die Torre Volognana des Bargello), die Statuen stehen auf den Abschlussplatten außerhalb der Hülle. R13: 76,7 % der 66.063 Raumzellen erreichbar, 0 nicht erreichbare Komponenten; R14: 0 Lücken.

## Abweichungen (nicht gebaut oder frei ergänzt)
- **„Galileo-Saal“ / „Sala Galileiana“:** in der Quelle nicht belegt; die Tribuna ist Dante und Galileo gewidmet und steht an seiner Stelle.
- **Monumentale Treppe:** Wendeltreppe statt der Prunktreppe (nicht beschrieben).
- **Lesesaalarkaden:** Säulenreihen mit Gebälk statt Bögen, Kapitelle nicht ionisch ausgebildet.
- **Türme:** innen hohl und nicht begehbar; Höhe und Aussehen Stufe C; Dante und Galileo sind Blockfiguren ohne Gesichtszüge.
- **Fassaden:** Material und Farbe frei (Quelle nennt nur die Pietra-forte-Platten des Blocks von 1962).
- **Attika, Platz zum Arno, drei Magazine:** nie gebaut, nicht dargestellt.
- **Block von 1962:** keine eigene Fassade aus Pietra-forte-Platten; der Ostflügel trägt dieselbe Fassade wie der Rest.
- **Hausnummer 2 / Rücksprung, Hochwasserspuren 1966, Außengelände:** nicht gebaut.
