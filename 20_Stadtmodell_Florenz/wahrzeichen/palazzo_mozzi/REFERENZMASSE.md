# Referenzmaße – Palazzo dei Mozzi (Welle 8a)

Projekt-ID `palazzo_mozzi`. Maßstab 1:2 (**Blöcke = 2 · m**). Stand 17.10.2026. Stufen: **A** belegt (Quelle genannt), **B** Literatur oder aus OSM begründet, **C** Entwurf. Bauteile: [`BAUTEIL_KATALOG.md`](BAUTEIL_KATALOG.md). Bauplan: `tools/wahrzeichen/palazzo.js` (Option `entlangGlatt`), Einstellungen `projects/palazzo_mozzi/model/_mz.js`, Raumplan, Turm-Maße und Ausstattung `model/_raeume.js`.

## 1. Rahmen und OSM

| Größe | Wert | Quelle |
|---|---|---|
| OSM-Objekt | Relation **r4095220** „Palazzo dei Mozzi“, `building=yes`, `historic=yes`, Wikidata Q3506938, `hoeheBl` 30 (Schätzung), **7.084 Zellen** der Maske (Fläche 7.077,75 Blöcke²), **ein Loch** (370 Zellen) | `data/stadt/gebaeude.json`, `Maske.ausGebaeude` |
| Umriss | Vorderblock 71 × 52 Blöcke zur Piazza de' Mozzi, Westflügel bis 15 Blöcke über die Flucht hinaus, Rückblock w 76..90, dahinter ein 22 Blöcke breiter diagonaler Ausläufer nach Südosten (w 92..113, u 27..105) – 20 Polygonkanten | gemessen an den Polygonkanten |
| **Rahmen `MZ`** | Ursprung (198,5 \| 1859,5) am Westende der Fassade zur Piazza de' Mozzi, θ = **19,33°** entlang der OSM-Kante 19 (71 Blöcke): u entlang der Fassade, w von der Fassade bergauf ins Haus (0..113) | Polygonkante 19, A |
| Hof (Loch 0) | 370 Zellen, u 26,1..46,8 × w 53,0..73,0 (21 × 20 Blöcke) | gemessen |
| Gelände | 65 (12 Zellen), 66 (450), **67 (1.392), 68 (1.562)**, 69–91 je 100–240, 92 (231): steigt von der Piazza (66–68) auf 92 an der Rückseite | `tools/city/ground_stadt.js` |
| **`bodenY`** | **66**: Entlang der Fassade liegt das Gelände bei 65 bis 67, der Fußboden (Stehfläche Y 67) ist damit höchstens einen Block über oder unter der Piazza; in der Maske wird das Gelände auf Y 65 abgetragen (Hangabtrag bis 26 Blöcke an der Rückseite, `spec/ground.js`) | B |
| Anschlüsse | Kante 19 zur **Piazza dei Mozzi** (Fläche im Straßenpolygon), übrige Kanten zu Nachbarhäusern, Wegen und dem ansteigenden Hang (Gelände 85–92 an der Rückseite) | Randanalyse (Name der Fläche am Kantenmittelpunkt) |

## 2. Maße (Literatur gegen OSM)

| Maß | Modell | Literatur oder OSM | Bewertung |
|---|---|---|---|
| Höhe bis zur Traufe | 30 Blöcke (15 m); Turm bis 46 Blöcke | OSM-Schätzung `hoeheBl` 30; Turmhöhe nicht belegt | C |
| Geschosse | EG 12, 1. OG 9, 2. OG 9 | die Quelle nennt keine Geschosszahl; Summe folgt OSM, Einzelhöhen C | C |
| Bauzeit, Bauherr | 1266–1273, Familie Mozzi; Vereinigung mehrerer mittelalterlicher Häuser und Türme; Palazzo-Festung zwischen Turmbau und großem öffentlichem Palast (Bargello), Übergangsstil später Duecento / früher Trecento | it.wikipedia | A |
| Material | Fassade aus kleinen behauenen Quadern (piccole bozze squadrate); Modell: Rustika im EG, Bruchstein mit glatten Pietra-forte-Lagen (jede vierte) darüber | it.wikipedia; Gesteinsart und Lagenraster C | A / C |
| Fassade EG | ununterbrochene Reihe von Bögen (Fornici) mit vorspringenden Vordächern; Modell: sieben Rundbogenportale 7 breit, 7 hoch im Abstand 10, bis zum Boden offen; Vordächer nicht gebaut | it.wikipedia; Zahl und Maße C | A / C |
| Turm | hoher zentraler Turm mit guelfischen Zinnen (im 19. Jahrhundert entfernt); Modell: Turm 12 × 12 Blöcke über der Fassadenmitte (u 29,5..41,5), Wände 2 dick, bis Lage 46, hohl und oben geschlossen, ohne Zinnen | it.wikipedia; Maße und Lage C | A / C |
| Wappen | großes Wappen der Mozzi mit dem Tolosakreuz über dem Eingang, ohne Farben; Modell: dunkles Schild 5 × 4 mit hellem Kreuz über dem mittleren Fornice | it.wikipedia | A / C |
| Fenster | Erdgeschossfenster im 16./17. Jh. als Kniefenster, später entfernt; für die Obergeschosse nennt die Quelle nichts; Modell: Rundbogenfenster Raster 10, Breite 3, Sohle 2, Höhe 5 über den Portalachsen | it.wikipedia; Obergeschosse C | A / C |
| Großer Saal | im ersten Stock, Wandmalereien von 1778, restauriert; Modell: Saal über der Mitte des Vorderblocks (u 23,6..47,4, w 20,6..51) | it.wikipedia; Lage C | A / C |
| Hof | die Quelle enthält keine Angaben; Umriss aus OSM | OSM | B |
| Hang, Garten | steiler Hanggarten hinter dem Palast, im 16. Jh. erworben (früher Olivenhain), gehört zum Giardino Bardini, steigt bis zur Porta San Giorgio; liegt außerhalb der Maske | it.wikipedia | A (nicht gebaut) |
| Umbauten, Nutzung | Ende 18. / Anfang 19. Jh. unter Gasparo Maria Paoletti; barocke Elemente später entfernt; seit 1913 Bardini (Depot und Ausstellungsraum), 1996 an den Staat, seit 2020 Sitz von Segretariato Regionale und Direzione regionale Musei nazionali Toscana | it.wikipedia | A |
| Geschichte | 1273 tagte Papst Gregor X. im Palast; erster Sitz der Loggia Concordia 1861 | it.wikipedia | A |

## 3. Entwurfswerte (Stufe C)
Fensterraster 10 (Versatz 0,5, Achsen bei u 5,5 … 65,5, mittlere Achse 35,5 unter dem Turm); Walmdach 4 Lagen; sieben Trennwandlinien (Türen 3 × 5); Wendeltreppe im Ostraum der Fassade (u 60, w 11); vier Hoftüren; Turm 12 × 12, Wanddicke 2, oben geschlossen. Außennormale mit der Option `entlangGlatt` aus dem Umkreis 3 (bei θ = 19° gibt die erste Außennachbarzelle an den Stufen der schrägen Kante die falsche Achse und zerreißt Fenster und Bogenschultern).

## 4. Nicht gebaut
Vordächer (tettoie) der Fornici, Kniefenster des Erdgeschosses (entfernt), guelfische Zinnen (entfernt), Giardino Bardini und Hanggarten (außerhalb der Maske), barocke Umbauten, Innenräume außer Halle und Saal (Sitz der Behörden), die Papstversammlung von 1273, Loggia Concordia (kein Ort belegt). Der Hof ist wie im OSM-Umriss gebaut, ohne Ausstattung.
