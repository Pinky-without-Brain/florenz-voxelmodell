# Referenzmaße – Tempio Maggiore Israelitico (W8b)

Projekt-ID `tempio_maggiore`. Maßstab 1:2 (**Blöcke = 2 · m**). Stand 17.10.2026. Stufen: A (belegt), B (abgeleitet), C (Entwurf, begründet). Entwurf: [`BAUTEIL_KATALOG.md`](BAUTEIL_KATALOG.md).

## 1. Rahmen und OSM

| Größe | Wert | Quelle |
|---|---|---|
| OSM-Objekt | Way **w102979678** „Tempio Maggiore Israelitico - Sinagoga“ (`amenity=place_of_worship`, `religion=jewish`, wikipedia it:Tempio maggiore israelitico di Firenze), **6.224 Zellen** (Auftrag nannte 6.219), keine Löcher, 7 `building:part` | `data/stadt/gebaeude.json` |
| Lage | Mitte ≈ (1510 \| 53), Isolato I0756; um das Gebäude freie Gartenfläche, Straße (Via Farini) im Westen bei u ≈ −20..−9 | OSM, `flaechen.json` |
| **Rahmen** | Ursprung (1483,5 \| 0,5), **θ = 32°**: u nach Ostsüdost (Fassade im Westen, Apsis im Osten, ungefähr Richtung Jerusalem), w nach rechts (Südsüdwest). Die Teilflächen liegen in diesem Rahmen alle achsparallel (Kantenwinkel 30,5° bis 32,6°) | an den Polygonkanten gemessen |
| Gelände | 65 bis 67, meist 66 (3.418 Zellen auf 66, 2.464 auf 65, 342 auf 67) | `tools/city/ground_stadt.js` |
| **`bodenY`** | **66** (häufigstes Gelände, Portale ohne Stufe) | B |
| Umriss im Rahmen | u −2,4..103,2 × w −0,5..62,3 | OSM |

## 2. Teilflächen des Umrisses (im Rahmen, gemessen)

| OSM-Teil | u | w | Zellen | Deutung |
|---|---|---|---:|---|
| w676106036 | 38..74 | 12..48 | 1.276 | Mittelquadrat (Vierung), 36 × 36 |
| w676106030 | 40..74 | 13..47,5 | 912 | Kreis des Tambours, Mitte (56,9 \| 30,3), Radius ≈ 17 |
| w676106033 | 8..39 | 12..49 | 1.097 | Westarm (Hauptraum, 31 lang) |
| w676106031 | 38..74 | 0..12 | 422 | Nordarm |
| w676106027 | 39..75 | 47..62 | 486 | Südarm |
| w676106032 | 74..84,5 | 11..47 | 354 | Ostarm (Chorraum) |
| w676106029 | 83..99 | 13..42 | 357 | Apsis (Vieleck, halbrund) |
| (ohne Teil) | 0..8 / 0..15 | 0..62 | | Vorhalle zwischen den Ecktürmen und die beiden Ecktürme (je rund 17 × 15) |
| (ohne Teil) | 14..38 / 75..103 | 0..12 / 49..62 | | Nebenräume in den vier Ecken |

## 3. Inhalt (Literatur gegen Modell)

| Merkmal | Modell | Literatur | Bewertung |
|---|---|---|---|
| Baumeister, Zeit | Marco Treves mit Mariano Falcini und Vincenzo Micheli, Ingenieur Eugenio Cioni; Grundstein 30.6.1874, Einweihung 24.10.1882 | it.wikipedia | A |
| Stil, Plan | neumaurisch, zentral, Kuppel in der Mitte, zwei Türme an der Fassade; kreuzförmiger Plan wie die Hagia Sophia | it.wikipedia, en.wikipedia | A |
| Verkleidung | weißer Travertin und rosa „pomato“; im Wechsel (alte Fotos: rot und beige) | it.wikipedia, en.wikipedia | A (Streifenhöhe 2 Lagen: C) |
| Kuppel | Kupferblech, grün oxidiert; **Doppelschale: innen 34 m, außen 47 m**; hoher runder Tambour | it.wikipedia | A (Maße), C (Profil) |
| Türme | zwei Ecktürme mit Hufeisenbogen-Laternen und Zwiebelkuppeln | en.wikipedia | A (Höhe C) |
| Haupteingang | **drei Hufeisenbögen**, darüber Ajimez-Fenster (Paare unter einem Bogen mit Mittelsäule) | en.wikipedia | A (Maße C) |
| Innen | Wände mit Arabesken in Rot und Blau (Giovanni Panti), ursprünglich vergoldet; Buntglasfenster; Mosaiken und Fresken | it.wikipedia, en.wikipedia | A (Muster C) |
| Emporen | obere Galerien (Matronei) mit schmiedeeisernen Gittern und siebenarmigen Leuchtern nach Modellen von Francesco Marini | it.wikipedia | A |
| Aron ha-Kodesh | am Ende des Saals in der Apsis, mit Mosaiken bedeckt, Baldachin, Gesetzestafeln darüber, Ewiges Licht davor; Aron und Bima stehen in der halbrunden Apsis, durch ein Gitter vom Gebetsraum getrennt | it.wikipedia; Jewish Heritage Europe | A (Maße C) |
| Oratorium | aschkenasisches Oratorium „Samuel Zvi Margulies“ am rechten Seitenschiff mit zwei Toraschreinen | it.wikipedia | A (Lage C) |
| Boden | Stern aus schwarzem und gelbem Marmor der Bruderschaft Mattir Assurim | it.wikipedia | A (Maße C) |
| Garten | Eisentor von Pasquale Franci, Gedenktafel mit 248 Namen | it.wikipedia | A (liegt außerhalb des Umrisses, nicht gebaut) |
| Raumhöhen, Wandstärken, Arkaden der Empore, Raumaufteilung der Nebenräume | nicht beschrieben | – | fehlt |

## 4. Entwurfswerte (Stufe C, Begründung: keine Maße in den Quellen)
- **Lagen** `yr = Y − 66`. Hauptraum: Luft 1..26, Decke 27, Dach 31. Empore: Boden Lage 12, Brüstung 13..14. Nord- und Südarm: Decke 22, Dach 26; Chor: Decke 23, Dach 27; Nebenräume: Decke 18, Dach 22. Fassade bis Lage 38.
- **Kuppel:** Mitte (56,9 | 30,3); lichter Radius 14,9, Tambourwand 2,1 dick; Pendentifs als Kugel durch die Ecken des lichten Quadrats (Radius ≈ 24), Ansatz Lage 24, Kreis erreicht bei Lage 42; Tambour bis Lage 53 mit 16 Fenstern; Innenkuppel Halbkugel, Scheitel Lage 68 (**34 m**); Außenkuppel spitzer Halbellipsoid (Anstieg 32), Spitze bis Lage 94 (**47 m**).
- **Türme:** Schaft bis Lage 44 (22 m), offene Laterne Lage 45..52, Kuppel und Spitze bis Lage 68 (34 m); Wendeltreppe 5 × 5.
- **Portale:** drei Hufeisenbögen (Mitte w = 20,5 / 31 / 41,5; lichte Breite 7, Scheitel Lage 10), zwei Blöcke tief, bis zum Boden offen.
