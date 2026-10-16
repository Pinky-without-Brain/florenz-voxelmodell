# Referenzmaße – Palazzo Arcivescovile (Welle 6c)

Projekt-ID `palazzo_arcivescovile`. Maßstab 1:2 (**Blöcke = 2 · m**). Stand 16.10.2026. Stufen: **A** belegt (Quelle genannt), **B** Literatur oder aus OSM begründet, **C** Entwurf. Bauteile: [`BAUTEIL_KATALOG.md`](BAUTEIL_KATALOG.md). Bauplan: `tools/wahrzeichen/palazzo.js`, Einstellungen `projects/palazzo_arcivescovile/model/_aa.js`.

## 1. Rahmen und OSM

| Größe | Wert | Quelle |
|---|---|---|
| OSM-Objekt | Relation **r1592495** „Palazzo Arcivescovile“, `building=yes`, `building:levels=5`, `historic=building`, Wikidata Q3889554, **7.432 Zellen** (Fläche 7.428 Blöcke²), ein Loch (Hof) | `data/stadt/gebaeude.json` |
| Umriss | unregelmäßiges Viereck: Ostkante (Fassade) 116 Blöcke, Nordkante 72, Westkante 121, Südkante 63 (schräg) | gemessen an den Polygonkanten |
| **Rahmen `AA`** | Ursprung (−399 \| −54,5) am Nordende der Ostkante, θ = **93,7°** entlang der Fassade: u von Nord nach Süd (0..127), w von der Fassade nach Westen (0..71) | Polygonkante, A |
| Hof (Loch 0) | 525 Zellen, u 47,9..82,6 × w 31,8..49,0 | gemessen |
| Gelände | 63 (2.043 Zellen), **64 (5.015)**, 65 (374); in der Maske auf höchstens Y 63 abgetragen | `tools/city/ground_stadt.js` |
| **`bodenY`** | **64** | häufigster Wert, B |
| Anschlüsse | Ostkante zur **Piazza San Giovanni**, Nordkante zur Via dei Cerretani, Westkante zur **Piazza dell'Olio**; keine Nachbarhäuser mit Kontakt (freistehend im Isolato) | Randanalyse der Kanten |

## 2. Maße (Literatur gegen OSM)

| Maß | Modell | Literatur oder OSM | Bewertung |
|---|---|---|---|
| Höhe bis zur Traufe | 37 Blöcke (18,5 m) | OSM `building:levels=5`, `hoeheBl` 37 | B |
| Geschosse | EG 10, Piano nobile 11, zwei Mezzanin-Geschosse 8 + 8 | Fassade mit „zwei hohen Geschossen, jeweils mit Mezzanin“ ([it.wikipedia](https://it.wikipedia.org/wiki/Palazzo_Arcivescovile_(Firenze))); die Höhen sind C, die Summe folgt OSM | B / C |
| Fassade | Giovanni Antonio Dosio, Bauzeit 1573–1584; 1893–95 nach dem Vorbild Dosios neu aufgebaut und um drei Achsen erweitert | it.wikipedia | A |
| Fensterachsen | 13 Achsen auf 116 Blöcken (Abstand 8,9) | Zahl nicht belegt, Hausakte schätzte 9 | C |
| Portale | zwei Eingangsportale an der Fassade (Achse 5 und 8, 6 breit, 9 hoch) | „beide Eingangsportale“ mit dem Namen Bausas auf den Architraven (it.wikipedia); Lage C | A / C |
| Kutschentor | Westwand (Piazza dell'Olio), 6 breit, 8 hoch | „Tor für Kutschen“ 1677, Wappen der Nerli (it.wikipedia); Lage C | A / C |
| Hof | Rundbogenarkaden (Joch 6, Kämpfer 7) auf drei Seiten und Galerie darüber; rechteckig, Hof 35 × 17 Blöcke | it.wikipedia: Arkaden auf dorischen Säulen und Pilastern, oben ionische Loggia, zwei Serliana an den Schmalseiten, Hof Dosio zugeschrieben, umgebaut von Bernardino Ciurini; Maße nicht angegeben, Hof aus OSM | A / B |
| Kirche San Salvatore al Vescovo | Schiff 19 × 25 Blöcke über zwei Geschosse, Tonnengewölbe (Scheitel Lage 20), in der Südwesthälfte | in die Rückseite des Palasts zur **Piazza dell'Olio** eingefügt, **Zugang über den Innenhof**, einschiffig mit hohem Tonnengewölbe (1737 abgeschlossen, Ciurini), Fresken Meucci, Ferretti, Anderlini (it.wikipedia, Chiesa di San Salvatore al Vescovo); Grundriss und Größe nicht belegt | A (Existenz, Lage, Zugang) / C (Maße) |
| Sala dell'Udienza | 49 × 25 Blöcke im Piano nobile | 1615–1620 umgestaltet, Fresken Nicodemo Ferruccis, Bischofsbildnisse auf den Pendentifs (it.wikipedia); Lage C | A / C |
| Salone | 37 × 25 im Piano nobile | Fresken Vincenzo Meuccis verloren (it.wikipedia); Lage C | A / C |

## 3. Entwurfswerte (Stufe C)
Fensterraster 8,9 mit Breite 3; Sohlen je Geschoss 4 / 3 / 2 / 2, Höhen 4 / 6 / 4 / 3; Walmdach 4 Lagen; Wendeltreppe im Nordflügel; Trennwandlinien (Türen 3 × 5). Die Fenster tragen weder die Giebel (abwechselnd dreieckig und bogenförmig) noch den Namen Alessandros de' Medici.

## 4. Nicht gebaut
Palasttreppe im Hof (an drei Seiten von Arkaden überdeckt), Serliana an den Schmalseiten, ionische Loggia über den Arkaden (Fenster stattdessen), Giebel über den Fenstern des Piano nobile, Türme der Visdomini (12. Jh., abgegangen), Bibliothek und weitere Kapellen (nicht belegt).
