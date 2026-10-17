# Referenzmaße – Palazzo della Crocetta (W8b)

Projekt-ID `palazzo_della_crocetta`. Maßstab 1:2 (**Blöcke = 2 · m**). Stand 17.10.2026. Stufen: A (belegt), B (abgeleitet), C (Entwurf, begründet). Entwurf: [`BAUTEIL_KATALOG.md`](BAUTEIL_KATALOG.md).

## 1. Rahmen und OSM

| Größe | Wert | Quelle |
|---|---|---|
| OSM-Objekt | Relation **r19738392** „Palazzo della Crocetta“ (`building=government`, wikidata Q16586442, wikipedia it:Palazzo della Crocetta), **18.194 Zellen** (Auftrag nannte 18.168), 1 Loch (Cortile dei Fiorentini, 1.544 Zellen), 1 `building:part` (w1329121874 „Cortile dei Fiorentini“, 1.395 Blöcke Fläche) | `data/stadt/gebaeude.json` |
| Lage | Mitte ≈ (863 \| −700), Isolato I0648; Via Laura (Südwestseite der langen Kante), Via della Colonna (Nordostseite der Flügelenden), Via Gino Capponi (Westseite), Via della Pergola (Ostseite) | OSM, `flaechen.json` |
| **Rahmen** | Ursprung (716,5 \| −848,5), **θ = 33,6°**: u entlang der langen Kante zur Via Laura (West → Ost, 0..413), w von dort zur Via della Colonna (0..83). Alle Kanten liegen im Rahmen achsparallel (Winkel 33,6° ± 3°) | an den Polygonkanten gemessen |
| Umriss im Rahmen | U-förmig: Westflügel u −6..52 × w 0..82, Vorderflügel u 0..293 × w 0..20 (Gartenseite bei w ≈ 19..22), Ostflügel u 293..411 × w 0..83 mit Anbau u 261..293 × w 62..82; Garten dazwischen (u 52..293, w 20..80) liegt **außerhalb** des Umrisses | OSM |
| Hof | Loch u 322..393 × w 6,5..36,5 (Cortile dei Fiorentini) | OSM |
| Gelände | Innen 63..71, meist 68; an den Straßen höchstens ±1 gegenüber 68 (Via Laura 0..+2, Via della Colonna −3..0, an den Portalen 0 bzw. −1) | `tools/city/ground_stadt.js` |
| **`bodenY`** | **68** (häufigstes Gelände; Portal an der Via della Colonna ohne oder mit einer Stufe) | B |
| Höhe | OSM schätzt 30 Blöcke (`schaetzung`); Quelle: „drei hohe Geschosse“; Modell 33 Lagen (12 + 12 + 9) | A/C |

## 2. Inhalt (Literatur gegen Modell)

| Merkmal | Modell | Literatur | Bewertung |
|---|---|---|---|
| Baumeister, Zeit, Bauherrin | Giulio Parigi, begonnen 1619, Bauzeit bis 1651, für Maria Maddalena de' Medici (Schwester Cosimos II.) | it.wikipedia | A |
| Stil | spätmanieristisch | it.wikipedia | A |
| Grundriss | U-förmig, bezieht Häuser an der Via della Pergola ein | it.wikipedia | A |
| Front an der Via della Colonna | **24 Achsen** über **drei hohen Geschossen**, Ecke zur Via Laura, setzt sich in der Gartenmauer fort | it.wikipedia | A (Geschosshöhen C) |
| Haupteingang | Via della Colonna 38; 1865 bis 1871 fügte Paolo Comotto zwei Säulen hinzu; seit 2006 Haupteingang des Museums an der Piazza SS. Annunziata 9 | it.wikipedia | A (Lage im Umriss C) |
| Erhöhter Korridor | Korridor der Maria Maddalena ähnlich dem Vasari-Korridor; 1637 bis auf den Übergang zur Santissima Annunziata abgerissen | it.wikipedia | A (nicht gebaut, liegt außerhalb) |
| Garten | 1621 angelegt, bis 1873 ummauert, seit 1902 öffentlich, etruskische Gräber (Tomba Inghirami); außerhalb des Umrisses | it.wikipedia | A (nicht gebaut) |
| Museum | seit 1880 Museo Archeologico Nazionale; Topografisches Museum 1897 (1966 zerstört); zweites Obergeschoss 1925; Restaurierungen 1883–84 (De Fabris), 1984–88 (Pacciani) | it.wikipedia | A |
| Sammlungen | 1. Obergeschoss Ägyptische Sammlung (Streitwagen 15. Jh. v. Chr., Maat-Relief, Fayum-Porträts), dazu der Saal der Chimera (Fresken Filippo Tarchiani) mit Arringatore; 2. Obergeschoss etruskische, griechische und römische Sammlungen, Idolino-Galerie am Ende der Galerie; Salone del Nicchio neben dem Eingang | it.wikipedia „Museo archeologico nazionale (Firenze)“ | A (Raumlage C) |
| Fassadenmaterial, Gesimse, Fensterform, Portal-Maße, Treppen, Raumaufteilung | nicht beschrieben | – | fehlt (Entwurf C) |

## 3. Entwurfswerte (Stufe C, Begründung: keine Maße in den Quellen)
- **Geschosse** (Lagen, `yr = Y − 68`): Erdgeschoss 0..12, Piano 1 12..24, Piano 2 24..33; Traufe Lage 33; Walmdach 3 Lagen.
- **Fenster:** Raster 8,6 Blöcke (Breite 3) ergibt auf den Fronten zur Via della Colonna im Modell 22 Fensterachsen plus die Portalachse (gemessen im Piano 1: 7 im Westflügel, 15 im Ostflügel); Sohle Lage 2, Höhe 7 (Obergeschoss 5); rechteckig.
- **Portale:** Via della Colonna im Ostflügel bei u 336, 9 breit, 11 hoch, zwei Säulen (glatt, 2,5 breit, 8 hoch) daneben; Via Gino Capponi bei w 26, 6 breit, 9 hoch. Beide bis zum Boden offen.
- **Fassade:** helles Gelb (`putz_gelb`), Gesimse aus Pietra serena, Sockelgeschoss der Fronten aus Rustika.
- **Raumplan:** Vorderflügel in sieben Säle (Querwände bei u 80, 115, 150, 185, 220, 255), Westflügel in drei Räume (Wände bei w 38 und 60), Ostflügel mit Androne (u 353..361) von der Via della Colonna zum Cortile, Wendeltreppe im Westflügel (u 24, w 52) durch alle drei Geschosse.
