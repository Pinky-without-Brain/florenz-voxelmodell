# Referenzmaße – Santa Margherita de' Cerchi (W7c)

Projekt-ID `santa_margherita_cerchi`. Maßstab 1:2 (**Blöcke = 2 · m**). Stand 16.10.2026. Stufen: A (belegt), B (abgeleitet), C (Entwurf, begründet). Entwurf: [`BAUTEIL_KATALOG.md`](BAUTEIL_KATALOG.md).

## 1. Rahmen und OSM

| Größe | Wert | Quelle |
|---|---|---|
| OSM-Objekt | Way **w307545799** „Santa Margherita dei Cerchi“ (alt_name „Chiesa di Dante“, wikidata Q3673185, `building=church`), **451 Zellen** (Auftrag nannte 441): Rechteck 25 × 18 Zellen plus eine Zelle an der Südostecke | `data/stadt/gebaeude.json` |
| Lage | Mitte ≈ (51 \| 410), Via Santa Margherita im Westen (Straße x 35..38); Norden, Osten und Süden grenzen an Nachbarhäuser | OSM, `flaechen.json` |
| **Rahmen** | Ursprung (39 \| 401), **θ = 0°**: iu = x − 39 nach Osten (Fassade im Westen, Apsis im Osten), iw = z − 401 nach Süden | achsparalleler Umriss |
| Gelände | 65 im Osten, 66 im Westen und an der Straße | `tools/city/ground_stadt.js` |
| **`bodenY`** | **66** (Straßenhöhe vor dem Portal, kein Absatz) | B |
| Höhe | OSM schätzt 30 Blöcke (`schaetzung`); Modell: Firstlage 17 über dem Boden | C |

## 2. Inhalt (Literatur gegen Modell)

| Merkmal | Modell | Literatur | Bewertung |
|---|---|---|---|
| Alter | seit 1032 erwähnt | it.wikipedia „Chiesa di Santa Margherita dei Cerchi“ | A (Erwähnung, kein Baujahr) |
| Fassade | Giebelfassade aus Quadersteinen, Rundbogenportal, zwei geschrägte Okuli (einer in der Portalachse, einer links), Vordach darüber | it.wikipedia | A (Vordach nicht gebaut) |
| Raum | einschiffig, zwei steinerne Seitenaltäre; quadratische Apsis mit leicht gesenktem, freskiertem Tonnengewölbe | it.wikipedia | A |
| Hochaltar | Stein, Mensa vorn auf kleinen Säulen; Altarbild Neri di Bicci „Madonna in trono con le sante Lucia, Margherita, Agnese e Caterina d'Alessandria“; Predellen: rechts Domenico di Michelino (Leben der hl. Margherita), links Stefano d'Antonio di Vanni | it.wikipedia | A (Farben C) |
| Seitenaltar rechts | Francesco Mati, „Invenzione della Croce“, Lünette „Maddalena“, um 1620–1625 | it.wikipedia | A |
| Gemälde | präraffaelitisch inspiriertes Bild einer englischen Malerin rechts nach dem Eingang (Dante und Beatrice) | it.wikipedia | A |
| Gräber | Folco Portinari sicher hier bestattet; Grabplatte der Monna Tessa heute in Santa Maria Nuova; die „presunta lapide“ Beatrices; Tafel für den Gründer Enrico Michelassi am Presbyterium | it.wikipedia | A (Inschriften unbekannt) |
| Stil | romanisch (Quelle), mehrfach umgebaut | it.wikipedia | A |
| Maße in Metern, Schiffsdecke, Kapellen, Glockenturm | nicht beschrieben | – | fehlt |

## 3. Entwurfswerte (Stufe C, Begründung: keine Maße in den Quellen)
Schiff iu 3..15 × iw 2..15 (13 × 14), Luft Lage 1..11, flache Decke Lage 12; Querwand iu 16..17 mit Rundbogen (8 breit, Scheitel Lage 9); Apsis iu 18..22 × iw 5..12 (5 × 8), Gewölbe Lage 8..10; Fassade 3 dick, übrige Wände 2 dick; Portal iw 7..10, Lage 1..7; Satteldach mit First entlang u (Lage 17), Traufe Lage 13.
