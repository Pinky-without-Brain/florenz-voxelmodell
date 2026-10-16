# Referenzmaße – Museo dell'Opera del Duomo (W7c)

Projekt-ID `museo_opera_duomo`. Maßstab 1:2 (**Blöcke = 2 · m**). Stand 16.10.2026. Stufen: A (belegt), B (abgeleitet), C (Entwurf, begründet). Entwurf: [`BAUTEIL_KATALOG.md`](BAUTEIL_KATALOG.md).

## 1. Rahmen und OSM

| Größe | Wert | Quelle |
|---|---|---|
| OSM-Objekt | Way **w456578419** „Museo dell'Opera del Duomo“ (`building:levels` 3, Höhe 23 Blöcke aus den Ebenen, wikidata Q1200696, `tourism=museum`), **14.051 Zellen** (Auftrag nannte 14.058), keine Löcher, unregelmäßiger Umriss aus 34 Kanten (Hauptrichtungen 33,7° und 121,5°) | `data/stadt/gebaeude.json` |
| Lage | Mitte ≈ (177 \| −54), östlich der Domapsis; die Südwestkante (rund 100 Blöcke lang, Kanten 11 bis 17) grenzt an die **Piazza del Duomo** (Plätze `flaechen.json`), die übrigen Seiten an Nachbarhäuser | OSM |
| **Rahmen `MO`** | Ursprung (158 \| −153), **θ = 33,7°**; u 1..131 nach Ostsüdost, w 0..162 nach Südsüdwest. Hauptblock u 3..125 × w 19..105 (Nordteil), daran ein Westvorsprung (w 17..25) und der „Schwanz“ zur Piazza (w 105..162, u 12..110) | Kanten 25, 29, 32 des Umrisses |
| Gelände | 63 (36 Zellen), 64 (1.076), 65 (7.543), 66 (4.611), 67 (785); die Piazza vor der Front liegt auf 65 | `tools/city/ground_stadt.js` |
| **`bodenY`** | **65** (Mehrheit der Zellen und Höhe der Piazza, Eingänge ohne Stufe; höheres Gelände im Umriss wird bis Y 64 abgetragen) | B |
| Geschosse | EG 9, 1. OG („nobile“) 8, 2. OG 6 Blöcke = 23 (Hausakte `domplatz_ring/hausakten/w456578419.json`, OSM: 3 Ebenen) | OSM, Hausakte (C) |

## 2. Inhalt (Literatur gegen Modell)

| Merkmal | Modell | Literatur | Bewertung |
|---|---|---|---|
| Lage | Piazza del Duomo 9, Nordostseite des Platzes | it.wikipedia „Museo dell'Opera del Duomo (Firenze)“ | A |
| Geschichte | Gebäude der Opera del Duomo ab 1296 (Republik gegründet, von der Arte della Lana beaufsichtigt); Brunelleschi lagerte hier Holz für die Kuppel; um 1500 entstand im Hof Michelangelos David; Museum seit **3. Mai 1891**; 1998–2000 um ein Drittel erweitert (Zangheri, Palterer); **2012–2015** Erweiterung nach Adolfo Natalini mit Guicciardini & Magni um die Räume des **Teatro degli Intrepidi** (1779). Das im Auftrag genannte Neueröffnungsdatum 2015 ist in der Quelle nur als Zeitraum 2012–2015 belegt | it.wikipedia | A |
| Fläche | 6.000 m² Ausstellungsfläche auf **drei Ebenen**, **28 Säle**, über 700 Werke | it.wikipedia | A (Modell: 16 Säle, 14.051 Zellen Grundfläche) |
| Fassade, Hof | Die Quelle beschreibt weder die Fassade noch einen heutigen Hof; die im Auftrag genannte klassizistische Fassade ist nicht belegt. Hausakte: Putz in Ocker, Rechteckfenster in Pietra serena, Walmdach (Annahme) | it.wikipedia, Hausakte | C |
| Erdgeschoss | Statuengruppe „Gloria di San Giovanni Battista“ (Ticciati, 1732), „Corridoio dei nomi“; Galleria delle Sculture (Fragmente der Porta della Mandorla: Tino di Camaino, Donatello, Nanni di Banco); **Sala del Paradiso**: drei Bronzeportale des Baptisteriums (Pisano, Ghiberti Nord, Ghiberti „Paradies“), darüber Gruppen von Rustici, Sansovino, Danti, gegenüber die **1:1-Replik der Domfassade des Arnolfo** und Fragmente der 1587 abgerissenen Fassade; Saal 8 mit Donatellos Maddalena penitente, Holzkruzifix, achteckiger Kapelle mit Reliquiaren; Tribuna mit **Michelangelos Pietà Bandini** (1547–1555); Korridor mit Marmorfragmenten (Taufbecken, 1577 entfernt) | it.wikipedia (Raumfolge „aus dem Kontext erschlossen“) | A (Lage C) |
| 1. Stock | Treppe mit Lünette für die Domportal-Mosaike; Galleria del Campanile (Pisano, Luca della Robbia, Donatellos Abacuc „Zuccone“, Geremia, Profeta pensieroso, Sacrificio di Isacco); Saal 15 mit Kuppel- und Laternenmodellen, Totenmaske Brunelleschis, Werkzeugen; Sala delle Navate (Trecento-Werke); Nebenraum mit den **Cantorie** von Donatello und Luca della Robbia, Creazione di Eva; achteckiger Raum mit **Altare argenteo di San Giovanni** (1367–1483), Kreuz von Pollaiolo und Betti (1457–59), 27 Stickereien; fünf Säle mit Entwürfen für die neugotische Domfassade | it.wikipedia | A (Lage C) |
| 2. Stock | Galerie mit Holzmodellen für die Domfassade (Buontalenti, Giambologna, Dosio u. a.), eine Seite öffnet sich zur Sala del Paradiso; Aussichtsraum mit Blick auf die Kuppel; zwei Säle mit Gemälden des 16. Jahrhunderts, Paramenten und Giottos „Madonna di San Giorgio alla Costa“ | it.wikipedia | A (Lage C) |
| Bar, Atelier, Terrasse | in der Quelle nicht belegt (nur Panorama- und Belvedere-Fenster) | it.wikipedia | – nicht gebaut |
| Maße einzelner Säle, Höhe der Fassadenreplik | nennt die Quelle nicht | – | fehlt |

## 3. Entwurfswerte (Stufe C, Begründung: keine Maße in den Quellen)
Drei Geschosse mit den Höhen 9, 8 und 6 Blöcken (Böden auf Lage 0, 9, 17; oberste Decke Lage 23; Walmdach bis Lage 27). Außenwand 2 dick, Fenster nur an der Piazza-Seite alle 11 Blöcke (3 breit), Portale (7 × 10) bei (37 \| 123) und (68 \| 147). Raumraster: Trennwandlinien bei u 45 und 88, w 62 und 105; Türen 4,5 × 5. Die **Sala del Paradiso** (u 45..140, w 105..170) ist zwei Geschosse hoch (der Boden des 1. OG entfällt, Decke auf Lage 17); der Wendeltreppen-Kern (Radius 3) steht bei (106 \| 82) und verbindet alle drei Ebenen.
