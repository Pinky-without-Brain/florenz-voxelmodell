# Referenzmaße – Biblioteca Nazionale Centrale di Firenze (W8b)

Projekt-ID `biblioteca_nazionale`. Maßstab 1:2 (**Blöcke = 2 · m**). Stand 17.10.2026. Stufen: A (belegt), B (abgeleitet), C (Entwurf, begründet). Entwurf: [`BAUTEIL_KATALOG.md`](BAUTEIL_KATALOG.md).

## 1. Rahmen und OSM

| Größe | Wert | Quelle |
|---|---|---|
| OSM-Objekt | Way **w102979687** „Biblioteca Nazionale Centrale di Firenze“ (`amenity=library`, addr Piazza dei Cavalleggeri 1, wikidata Q460907, wikipedia it:Biblioteca Nazionale Centrale di Firenze), **20.985 Zellen** (Auftrag nannte 21.009; abzüglich 5 Zellen, die `cappella_pazzi` belegt), keine Löcher, keine `building:part` | `data/stadt/gebaeude.json` |
| Lage | Mitte ≈ (873 \| 1303), Isolato I0683; zwischen Santa Croce, Arno und Corso dei Tintori; Nachbar `cappella_pazzi` (Konvent, keine gemeinsame Zelle) | OSM, `flaechen.json` |
| **Rahmen** | Ursprung (735 \| 1242), **θ = 8°** (lange Kanten 7,5° bis 8,5°): u von der Tribuna im Westen nach Osten (5..283), w vom Corso dei Tintori im Norden zum Fluss im Süden (−10..92) | an den Polygonkanten gemessen |
| Umriss im Rahmen | Westflügel u 5..65 × w −2..68 mit rundem Westende (Tribuna, u 5..19); Mitteltrakt u 66..213 × w 7..78, an der Flussseite zwischen u 133 und 213 bis w 92 vorspringend; Ostflügel u 213..283 × w 3,5..81,5; kleiner Vorsprung im Norden bei u 154..193 bis w −10 | OSM |
| Gelände | 59..63, meist 59/60 innen; Piazza und Lungarno im Süden 62 (= +1 gegenüber `bodenY`), Ostseite 62..64, Nordseite 60..61 | `tools/city/ground_stadt.js` |
| **`bodenY`** | **61** (Mittel zwischen Innenniveau 59/60 und Straßenniveau 62..63; keine Außenstufe über 2) | B |
| Höhe | OSM schätzt 30 Blöcke (`schaetzung`); Modell 35 Lagen (13 + 12 + 10), Türme bis Lage 58 | C |

## 2. Inhalt (Literatur gegen Modell)

| Merkmal | Modell | Literatur | Bewertung |
|---|---|---|---|
| Baumeister, Zeit | Cesare Bazzani, Baubeginn 1911, Tribüne Dante und Galileo 1929, Einweihung 30.10.1935; zweiter Flügel 1962 (Vincenzo/Velio Mazzei) | it.wikipedia | A |
| Gelände | rund 10.000 m² der früheren Kaserne der Cavalleggeri zwischen Santa Croce, Arno und Corso dei Tintori | it.wikipedia | A |
| Stil | eklektisch mit Einflüssen des Liberty; Innenräume klassizierend mit Bögen, Säulen und monumentaler Treppe | it.wikipedia | A |
| Fassade | **Türme** mit den Statuen von Dante und Galileo („le orecchie dell'architetto“); ein geplanter Platz zum Arno, eine Attika und drei von sechs geplanten Magazinen wurden nie gebaut | it.wikipedia | A (Höhen C) |
| Grundriss | zwei sich kreuzende Achsen und große **Verteilerhalle**: die eine parallel zum Fluss (Büros, Zeitschriften, Lesesäle, Kataloge), die andere vom Portikus zu den **Magazinen** im Rücken | it.wikipedia | A (Lage der Räume C) |
| Lesesaal | rechteckig, **Arkaden auf Säulen mit ionischen Kapitellen** | it.wikipedia | A |
| Eingänge | Haupteingang **Portikus an der Piazza dei Cavalleggeri 1**; monumentale **Tribüne** an der Ecke Corso dei Tintori und Via Antonio Magliabechi; Hausnummer 2 in einem Rücksprung | it.wikipedia | A |
| Block 1962 | vier Geschosse über der Erde, Verkleidung aus Pietra-forte-Platten | it.wikipedia | A (Zuordnung zum Ostflügel C) |
| Magazine | Regallänge insgesamt 138 km (2024), über 1,5 km Zuwachs im Jahr | it.wikipedia | A (Zahl der Magazingeschosse C) |
| Hochwasser 1966 | Innenräume bis 6 m überflutet | it.wikipedia | A (nicht gebaut) |
| Fassadenmaterial, Fensterform, Portikus-Joche, Raumaufteilung, Treppe, Galileo-Saal | nicht beschrieben (ein „Galileo-Saal“ ist in der Quelle nicht belegt; die Tribüne ist Dante und Galileo gewidmet) | – | fehlt (Entwurf C) |

## 3. Entwurfswerte (Stufe C, Begründung: keine Maße in den Quellen)
- **Geschosse** (Lagen, `yr = Y − 61`): Erdgeschoss 0..13, Piano 1 13..25, Piano 2 25..35; Traufe Lage 35; Walmdach 3 Lagen.
- **Portikus:** fünf Joche zu 8 Blöcken zwischen den Türmen (u 153..193), Tiefe 10, Scheitel der Bögen Lage 9; Rückwand mit zwei Türen.
- **Türme:** Rechtecke u 133,3..152,6 und u 194..213,6, w 70..94 über den Ecken der Flussfront; Wände 2 Blöcke dick bis Lage 58, innen hohl (ohne Zugang), Abschlussplatte, darauf Sockel (Radius 2) und Marmorfigur (6 Lagen).
- **Raumplan:** Querwände bei u 20, 70, 133, 213,4, Längswände bei w 34 (Westflügel) und w 35 (Mitteltrakt), Türen 3,4 × 5. Verteilerhalle u 134..212 × w 36..80 mit Wendeltreppe (u 173, w 58) und vier Säulen; Magazine im nördlichen Mitteltrakt und im Ostflügel (Doppelregale bis zur Decke, Querwege alle 20 Blöcke).
