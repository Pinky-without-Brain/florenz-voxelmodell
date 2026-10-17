# Bauteilkatalog – Santa Margherita de' Cerchi (W7c)

Maße: [`REFERENZMASSE.md`](REFERENZMASSE.md). Rahmen θ 0° (iu nach Osten, iw nach Süden), Lagen `yr = Y − 66`. Bauplan `projects/santa_margherita_cerchi/model/_sm.js` (Zellen im Speicher, `tools/wahrzeichen/zellplan.js`), Ausstattung in `_sm_raeume.js`. Projekt `type: "wahrzeichen"`, `"begehbarkeit": "pflicht"`, 4.602 Blöcke, 6 Module.

| Modul | Titel | Bauteile (Bau-Reihenfolge) | Inhalt, Stufe |
|---|---|---|---|
| 0 | Fundament, Boden | `fundament`, `boden` | Bruchstein bei tiefem Gelände; Cotto mit Pietra-serena-Streifen im Schiff, Schachbrett in der Apsis – C |
| 1 | Fassade | `fassade` | Westwand 3 dick, Quader aus `pietra_forte`/`pietra_forte_rustika`, Rundbogenportal 4 × 7 (`tuer`, bis zum Boden offen) mit `pietra_serena`-Rahmen, zwei Okuli aus `glas_fenster` durch alle Lagen – A |
| 2 | Mauern, Decke, Apsis | `aussenwaende`, `decke`, `gewoelbe_apsis` | Wände 2 dick mit Putz innen, Querwand mit Triumphbogen, Schiffsdecke mit Holzbalken, gesenktes Tonnengewölbe der Apsis (`fresko` hellblau), massive Füllung – A/C |
| 3 | Dach | `dach` | Satteldach `dachziegel`, Raum zwischen Decke und Dachhaut massiv (kein Dachboden) – C |
| 4 | Licht | `licht` | Seelaternen im Boden, Schiff und Apsis getrennt, Abstand ≤ 9 – C |
| 5 | Ausstattung | `hochaltar`, `seitenaltaere`, `wandbilder`, `gedenktafeln`, `wappen` | siehe unten |

## Ausgestaltete Innenräume
Wandfelder ersetzen Zellen der inneren Wandlage (Rollen `fresko`, `gold`), Altartische sind eine Lage hohe Pietra-serena-Reihen. Quelle jeweils it.wikipedia; die Bilder sind **vereinfacht, nicht nach Vorbild**; Bilderunterkante 2 bis 3 Blöcke über dem Boden.
- **Hochaltar** (Ostwand der Apsis): Mensa mit zwei Säulchen, Altarbild Neri di Bicci als Feld 6 × 7, zwei Predellen – A.
- **Seitenaltäre:** Süd mit Altarbild „Invenzione della Croce“ (Mati) und Lünette; Nord ohne belegtes Bild, nur Rahmung (Pilaster, Gebälk) – A.
- **Wandbild Dante und Beatrice** (Südwand rechts nach dem Eingang) – A.
- **Gedenktafeln:** angebliche Grabplatte Beatrices (Nordwand), Tafel Enrico Michelassi (Querwand) – A (Inschriften unbekannt).
- **Wappen** neben dem Portal (Steintafeln im Goldrahmen) – Lage und Gestalt C.

## Begehbarkeit und Dichtheit
Zugang über das Portal (4 breit, bis zum Boden offen, Straße und Boden beide auf Y 66); Triumphbogen 8 breit; Licht ≤ 12 Blöcke; Fenster verglast; Dach massiv. R13: 100 % der 250 Raumzellen erreichbar, 0 nicht erreichbare Komponenten; R14: 0 Lücken.

## Abweichungen (nicht gebaut oder frei ergänzt)
- **Kassettendecke:** nicht belegt (Quelle schweigt zur Schiffsdecke); flache Putzdecke mit Balken (C).
- **Portinari-Grabmal und Wappen der Portinari:** in der Quelle nicht als Monument beschrieben, nicht gebaut. Gebaut ist nur die „angebliche Grabplatte“.
- **Vordach über dem Portal, Glockenturm, Kapellen:** nicht gebaut (Vordach belegt, aber ohne Maße; Rest nicht belegt).
- **Fenster der Seitenwände:** keine, Norden, Süden und Osten grenzen an Nachbarhäuser; Licht kommt von den Okuli und den Seelaternen.
- **Linker Seitenaltar:** kein belegtes Bild, deshalb leer.
- **Bänke und Gestühl:** nicht belegt, nicht gebaut.
