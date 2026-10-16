# Referenzmaße – Palazzo Davanzati (W5c)

Projekt-ID `palazzo_davanzati`. Maßstab 1:2 (**Blöcke = 2 · m**). Stand 16.10.2026. Stufen: A (belegt), B (abgeleitet), C (Entwurf, begründet). Entwurf: [`BAUTEIL_KATALOG.md`](BAUTEIL_KATALOG.md).

## 1. Rahmen und OSM

| Größe | Wert | Quelle |
|---|---|---|
| OSM-Objekt | Way **w307153268** „Palazzo Davanzati“ (wikidata Q657629), **2.056 Zellen**, Viereck mit keilförmig auslaufendem Südteil, kein Hof im Umriss; Höhe in den Stadtdaten nur Schätzung (30 Blöcke) | `data/stadt/gebaeude.json` |
| Lage | Mitte ≈ (−631 \| 706), Via Porta Rossa; die Fassade liegt an der **Nordkante** (35,5 Blöcke ≈ 17,7 m lang), alle anderen Seiten grenzen an Nachbarhäuser | gemessen (Straßenabgleich der Kanten) |
| **Rahmen** | achsparallel (θ = 0): `iu = x + 659` nach Osten, `iw = z − 669` nach Süden, Fassade bei `iw 0`; Hauptblock `iu 1..36`, `iw 0..43`, Anbau-Keil `iw 44..63` | Entwurf |
| Gelände | 63 im Westen, 64 im Osten der Fassade | `tools/city/ground_stadt.js` |
| **`bodenY`** | **63** (Boden = Straße vor der Mitte der Fassade); der Stadtgrund wird im Umriss auf 62 abgetragen | Entwurf, B |
| Höhe | Dachfirst Lage 52 über dem Boden ≈ **26 m** | C, siehe 3. |

## 2. Inhalt (Literatur gegen Modell)

| Merkmal | Modell | Literatur | Bewertung |
|---|---|---|---|
| Bauzeit, Bauherr | Mitte 14. Jahrhundert, Familie Davizzi (Wollzunft); 1516 Bartolini, ab 1578 Davanzati; 1956 Museo dell'Antica Casa Fiorentina | it.wikipedia, en.wikipedia „Palazzo Davanzati“ | A |
| Geschosse | Erdgeschoss, drei Obergeschosse, Altana; Kellergeschoss mit Zisterne (nicht modelliert) | it.wikipedia; limen.org (Davizzi Davanzati) | A |
| Fassade | schmal und hoch; Erdgeschoss mit Bugnato aus Sandstein und **drei großen Bögen**; darüber **fünf Achsen** mit Fenstern mit flachen Rundbögen, Marcapiano-Gesimse | it.wikipedia; catalogo.beniculturali.it; limen.org | A |
| Altana | Loggia des 16. Jahrhunderts anstelle der Zinnenkrone, auf **vier Säulen und zwei Pilastern**, weit vorspringendes Dach; Wappen der Davanzati (16. Jh., manieristisch) | it.wikipedia; en.wikipedia | A |
| Eisenteile | Fackel- und Fahnenhalter (Erri, Staffe in R-Form) an der Fassade | it.wikipedia; limen.org | A (als Kupferblöcke) |
| Hof | Portikus an **zwei Seiten**, Bögen, Gewölbe, achteckige Pfeiler; Brunnen mit Seilrolle, die Wasser in alle Geschosse hebt; Zisterne darunter | it.wikipedia; en.wikipedia; limen.org | A |
| Treppe | steile Steintreppe auf der linken Seite des Hofs, von Strebebögen und Konsolen gestützt, oben aus Holz | it.wikipedia; limen.org | A |
| Räume | Sala Madornale (großer Saal, fünf Fenster), Sala dei Pappagalli, Studiolo, Sala dei Pavoni (1. Stock); Camera della Castellana di Vergy (2. Stock); Camera delle Impannate, Schlafzimmer und Küche (oberstes Geschoss) | it.wikipedia; en.wikipedia | A |
| Fresken | Papageien-Wirkteppich (spätes 14. Jh.); Pfauen und Wappen verbündeter Familien; Freskenzyklus der Dame von Vergy (um 1350) | it.wikipedia; en.wikipedia | A |
| Küche | ganz oben wegen Hitze und Brandgefahr; Kamin, Blasebalg, Bratspieße, Brotknetmaschine | en.wikipedia | A |
| Maße in Metern | Höhe, Tiefe, Raumgrößen nennt keine der geprüften Quellen | – | fehlt |

## 3. Entwurfswerte (Stufe C, Begründung: keine Maße in den Quellen)
Geschossböden bei Lage 0 / 11 / 21 / 31 / 41 (Erdgeschoss 10, Obergeschosse je 9 lichte Höhe), Altana lichte Höhe 5 (Lagen 42–46), Decke 47, Dach 48 bis 52; Fassadenwand 3 dick, übrige Wände 2 dick; Bögen 7 breit (Scheitel Lage 7, außen Lage 5), Fenster 3 × 5; Hof 12 × 14 mit Portikus Nord und Ost; Treppe in vier Läufen 11 + 10 + 10 + 10 Stufen (Breite 2); sechs Räume im Ring um den Hof, Türen 3 × 5. Der Keil im Süden ist ein eingeschossiger Anbau (Remise), dessen Zweck nicht belegt ist. Die Höhe von ≈ 26 m entspricht einem Turmhaus mit vier Ebenen und Dachloggia und ist nicht gemessen.
