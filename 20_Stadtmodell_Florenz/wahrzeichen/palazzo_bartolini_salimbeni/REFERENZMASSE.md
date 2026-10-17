# Referenzmaße – Palazzo Bartolini Salimbeni (Welle 7a)

Projekt-ID `palazzo_bartolini_salimbeni`. Maßstab 1:2 (**Blöcke = 2 · m**). Stand 16.10.2026. Stufen: **A** belegt (Quelle genannt), **B** Literatur oder aus OSM begründet, **C** Entwurf. Bauteile: [`BAUTEIL_KATALOG.md`](BAUTEIL_KATALOG.md). Bauplan: `tools/wahrzeichen/palazzo.js`, Einstellungen `projects/palazzo_bartolini_salimbeni/model/_bs.js`, Raumplan `model/_raeume.js`.

## 1. Rahmen und OSM

| Größe | Wert | Quelle |
|---|---|---|
| OSM-Objekt | Relation **r4101721** „Palazzo Bartolini Salimbeni“, `building=yes`, `historic=building`, Wikidata Q896608, **2.673 Zellen** (Fläche 2.671 Blöcke²), ein Loch (Hof) | `data/stadt/gebaeude.json` |
| Umriss | fast rechteckiges Viereck: Ostkante (Piazza di Santa Trinita) 41,8 Blöcke, Nordkante (Via Porta Rossa) 71,3, Südkante (Via delle Terme) 70,0, Westkante 36,1 | gemessen an den Polygonkanten |
| **Rahmen `BS`** | Ursprung (−803,5 \| 659) am Nordende der Ostkante, θ = **96,87°** entlang der Piazzafassade: u von Nord nach Süd (0..42), w von der Fassade nach Westen (0..71) | Polygonkante 0, A |
| Hof (Loch 0) | 78 Zellen, u 15,2..22,8 × w 27,0..36,9 (8 × 10 Blöcke), in der Achse des Piazzaportals | gemessen |
| Gelände | 61 (376 Zellen), **62 (1.471)**, 63 (826); in der Maske auf höchstens Y 61 abgetragen | `tools/city/ground_stadt.js` |
| **`bodenY`** | **62**: Das Gelände vor den drei Straßenfronten liegt zwischen 61 und 63 (Abweichung −1 bis +1) | B |
| Anschlüsse | Ostkante zur **Piazza di Santa Trinita**, Nordkante zur **Via Porta Rossa**, Südkante zur **Via delle Terme**, Westkante zu Fußwegen | Randanalyse (`tools/diag/_kanten_w7a.js`) |

## 2. Maße (Literatur gegen OSM)

| Maß | Modell | Literatur oder OSM | Bewertung |
|---|---|---|---|
| Höhe bis zur Traufe | 30 Blöcke (15 m) | OSM-Schätzung (`hoeheQuelle: schaetzung`), die Quelle nennt keine Höhe | C |
| Geschosse | EG 11, Piano nobile 10, 2. OG 9 | drei Geschosse (it.wikipedia, Palazzo Bartolini Salimbeni); Höhen C | A / C |
| Bauherr, Bauzeit | Baccio d'Agnolo 1520–1523 für Giovanni Bartolini (Libro della muraglia); erste Florentiner Residenz „alla romana“ | it.wikipedia | A |
| Fassade | Portal zwischen Säulen; Fenster mit Architrav, Fries und dreieckigen oder runden Giebeln, durch Kreuze in vier Felder geteilt; vorspringende Mauerteile mit Nischen im 1. Geschoss (Statuen entfernt), Rücksprünge im 2.; rustizierte Ecken; vorspringendes Gesims mit Zahnschnitt; Fries mit drei Mohnblüten | it.wikipedia | A |
| Fassade im Modell | Kreuzfenster (Mittelpfosten und Querriegel, vier Scheiben), rustizierte Ecken, Marmorgesims, Mohnfries; **ohne** Giebel, Architrave, Säulenportal und Nischen | vereinfacht | A / C |
| Gestein | Pietra forte zur Piazza, Pietra serena und Pietra bigia zur Via Porta Rossa | it.wikipedia | A |
| Inschriften | über dem Hauptportal „Carpere promptius quam imitari“; „Per non dormire“ (Familienwahlspruch) in Kartuschen auf den Kreuzfenstern und ausgeschrieben an der Tür zur Via Porta Rossa | it.wikipedia | A |
| Fensterraster | 10 Blöcke, Breite 4; Sohlen 3 / 3 / 2, Höhen 5 / 5 / 4 | Raster C | C |
| Portale | zwei: Piazza di Santa Trinita (u 19, in der Hofachse) und Via Porta Rossa (w 29), je 7 breit, 9 hoch | Hauptportal an der Piazza, Tür an der Via Porta Rossa (it.wikipedia); Lage C | A / C |
| Durchgang | tonnengewölbter Durchgang zum Hof | it.wikipedia | A |
| Hof | Portikus an drei Seiten mit Säulen und Rundbögen (eine Seite und ein Joch später geschlossen, die vierte Seite mit Schwibbogen); einfarbiger Sgraffito-Schmuck und Grotesken (Andrea Feltrini zugeschrieben) bis ins zweite Geschoss; Loggia im 1. Geschoss mit drei Bögen und Kassettendecke aus Holz | it.wikipedia; Hofmaße aus OSM | A / B |
| Innenräume | hölzerne Kassettendecken mit Mohnkopf-Emblemen (vielleicht Giuliano d'Agnolo); von der Malerei nur Fragmente erhalten | it.wikipedia | A |
| Nutzung | 1838/39 Hotel du Nord (Giuseppe Martelli); 1863 Pio di Savoia; 1961/62 Restaurierung (Piero Sanpaolesi); ab 1984 Büros der Centrobanca; heute Collezione Roberto Casamonti (seit 2018 öffentlich) | it.wikipedia | A |

## 3. Entwurfswerte (Stufe C)
Hof-Arkaden Joch 4 mit Kämpfer 6 und Galerie 3 Blöcke tief; Walmdach 3 Lagen; sechs Trennwandlinien (Türen 3 × 5); Wendeltreppe im Westflügel Süd; Lage der Räume.

## 4. Nicht gebaut und Abweichungen
Säulenportal, Giebel und Architrave über den Fenstern, Nischen und Mauerrücksprünge, Loggia des 1. Geschosses im Hof (drei Bögen, Kassettendecke), zweite Loggia, Schwibbogen auf der vierten Hofseite, gemalte Ausstattung. **Der Hof hat im Modell Arkaden auf vier Seiten** (Wirklichkeit: drei). Die Zellenzahl (2.673) weicht von der Planzahl 2.676 ab; maßgeblich ist die Maske des Modells. Der Plan nannte die Inschrift „Per non dormire“ als Inschriftenband; in der Quelle steht sie in Kartuschen auf den Fenstern, über dem Portal steht „Carpere promptius quam imitari“ – beide sind als Farbfelder angedeutet.
