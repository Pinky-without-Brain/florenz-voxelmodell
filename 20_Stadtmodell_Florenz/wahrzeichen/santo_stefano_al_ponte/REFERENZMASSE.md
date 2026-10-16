# Referenzmaße – Santo Stefano al Ponte (W6b, Wahrzeichen-Welle 6)

Projekt-ID `santo_stefano_al_ponte`. Maßstab 1:2 (**Blöcke = 2 · m**). Stand 16.10.2026.
Stufen: **A** mehrere Quellen, **B** eine Quelle oder OSM gemessen, **C** Schätzung (Proportion, begründet). Entwurf: [`BAUTEIL_KATALOG.md`](BAUTEIL_KATALOG.md).
Quellen (gelesen am 16.10.2026): it.wikipedia „Chiesa di Santo Stefano al Ponte“ und en.wikipedia „Santo Stefano al Ponte“. Beide Seiten nennen **keine Maße der Kirche in Metern**; alle Grundrissmaße stammen aus OSM. Ein Campanile wird in keiner Quelle genannt und ist deshalb nicht gebaut.

## 1. Rahmen und OSM

| Größe | Wert | Quelle |
|---|---|---|
| Kirche | Way **w253942619** „Chiesa di Santo Stefano al Ponte“ (tourism=museum, building=church), 3.460 Zellen (der Auftrag nennt 3.462: andere Randregel) | `data/stadt/gebaeude.json` |
| **Rahmen** | Ursprung (**−435 \| 974**) = Nordwestecke der Fassade, **θ = 23,1°**: u von der Fassade (Piazza Santo Stefano) nach Ost-Südost bis zum Chor, w quer nach Süd-Südwest. Im Rahmen ist der Umriss ein **achsparalleles Rechteck** (alle 15 Ecken auf ±0,5 Blöcke) | gefittet an den Polygonkanten (23,0° bis 23,2°) |
| Umriss im Rahmen (u \| w) | Hauptkörper u 0..81 × w 0..39,5 (**81 × 39,5 Blöcke = 40,5 × 19,75 m**); Chor u 81..94 × w 9,2..29,5 (13 × 20 Blöcke = 6,5 × 10 m) | OSM gemessen |
| Gelände | 62 (13 Zellen), 63 (861), **64 (1.674)**, 65 (809), 66 (103); die Piazza vor der Fassade liegt auf 64 | `ground_stadt.js` |
| **`bodenY`** | **64** (Boden bündig mit der Piazza und dem häufigsten Gelände; Gelände im Umriss bis Y 63 abgetragen) | Entwurf |
| Vorrang | w253942619 → `santo_stefano_al_ponte`; aus `quartier_costa_san_giorgio` gelöst (Hausakte gelöscht). Die fünf angrenzenden Häuser (u. a. Casa dell’Orafo w477279041) bleiben Quartiersbauten | `vorrang.json` |

## 2. Maße und Befunde

| Maß | Modell | Literatur | Stufe |
|---|---|---|---|
| Baugeschichte | 1116 erwähnt; die gotische Form um 1233 (drei Lanzettfenster, Mittelportal); Umbau des Inneren 1631 bis 1641 (it.wikipedia) bzw. 1631 bis 1655 (en.wikipedia) | it.wikipedia, en.wikipedia | A |
| Fassade | unten romanische Reste: Mittelportal mit Lünette und Okulus in weißer und grüner Prato-Inkrustation, zwei kleinere Seitentüren (Hinweis auf ein ehemals dreischiffiges Langhaus), über den Seitentüren zwei Rosetten und zwei Biforien; oben glatteres Mauerwerk mit drei Rundbogenfenstern, einer Mittelnische und einem Giebel mit Bogenfries (archetti) | it.wikipedia | B |
| Schiff | heute **einschiffig**, länger und breiter als das ursprüngliche; sichtbare Dachbinder; der frühgotische Teil reicht bis zum dritten Seitenaltar, der letzte Abschnitt hat ein **etwa zwei Meter höheres** Dach; je **fünf Seitenaltäre** rechts und links | it.wikipedia | B |
| Presbyterium | dreigeteilt: zentrale Tribuna-Kapelle und zwei Seitenkapellen, davon eine **falsche Kapelle**; über der Mitte eine **segmentierte Kuppel mit Tambour und Okuli**; hinter dem Hochaltar ein großer quadratischer **Chor** | it.wikipedia | B |
| Innenraum | barocker Entwurf ohne Rundungen: zwölfeckige Formen, ein siebenseitiges „Halb-Zwölfeck“ statt des Bogens, eckige Nischen; Zuschreibung unsicher (Andrea Arrighetti oder Ferdinando Tacca, Anregungen des Bauherrn Anton Maria Bartolommei) | it.wikipedia | B |
| Treppe | Marmortreppe mit Balustrade von **Bernardo Buontalenti (1574)**, aus Santa Trinita hierher versetzt (spätes 19./frühes 20. Jahrhundert). Der Auftrag nannte Ferdinando Tacca: Tacca schuf nach der Quelle das **Bronze-Paliotto** (1656) | it.wikipedia | B |
| Hochaltar | Marmoraltar von Giambologna (1594) aus Santa Maria Nuova, das hohe Aedikula ist später hinzugefügt | it.wikipedia | B |
| Ausstattung | Chorgestühl aus Nussholz (um 1650, Werkstatt Jacopo Sanis), Stuckfigur des hl. Stephan (um 1650, Giovanni Gonnelli zugeschrieben), toskanische Orgel (17. Jh.), Holzkruzifix 1576 mit Fresko von Niccolò Lapi, Altarbilder u. a. Curradi (Tod der hl. Cäcilie), Kopie nach Cigoli, Confortini (Taufe Christi 1667 auf dem Altar der falschen Kapelle), Rosselli, Santi di Tito, Morosini, Soderini | it.wikipedia, en.wikipedia | A / B |
| Krypta | nur über eine Öffnung im Schiff erreichbar (Lösung der Restaurierungen der 1990er), Pfeiler statt Säulen, niedrige Gewölbe | it.wikipedia | B (nicht gebaut) |
| Hof | im Nachbarbau ein Kreuzgang des 15. Jh. mit Pietra-serena-Biforien, rundem Brunnen und Grabplatten, daneben die Kapelle der Goldschmiede; liegt außerhalb des Umrisses | it.wikipedia | B (nicht gebaut) |
| Nutzung | seit 1981 wieder Gottesdienst, 1986 aufgehoben; heute Konzerte (seit 2016) und interaktive Ausstellungen (seit 2015); früher das Auditorium des Orchestra regionale toscana; Museo Diocesano nebenan | it.wikipedia | B |
| Campanile | in keiner Quelle genannt | – | nicht gebaut |

## 3. Entwurfswerte (Stufe C)
- Höhen: Decke im westlichen Schiff Lage 17 (8,5 m), im östlichen Lage 21 (10,5 m), Satteldach mit First 6 Blöcke über der Traufe; Kapellen und Chor Decke 17; Podium der Tribuna 5 Blöcke (2,5 m) über dem Schiff; Tribuna-Wände bis Lage 22, Tambour 23..26, Kuppelscheitel bis Lage 37.
- Fassade: Giebel bis Lage 32 (Traufe 24), untere Zone bis Lage 20, Portal 7 breit, Rechteck 8 hoch mit Rundbogen bis Lage 11,5.
- Altäre: Mitten bei u 8, 18,6, 29,2, 39,8, 50,4; Fenster bei u 13, 24, 42, 50.
- Tribuna: Breite 11,5 (w 14..25,5), Achteck mit Apothem 5,75; Seitenkapellen w 2..12 und w 27,5..37,5; Endwand u 55..57.
