# Referenzmaße – San Lorenzo mit Cappelle Medicee (V3 D3, Wahrzeichen-Welle 3)

Projekt-ID `san_lorenzo` (deckt die geplanten Wahrzeichen `san_lorenzo` und `cappelle_medicee` ab). Maßstab 1:2 (**Blöcke = 2 · m**). Stand 14.10.2026.
Stufen: **A** mehrere Quellen, **B** eine Quelle oder OSM/DGM gemessen, **C** Schätzung (Proportion). Entwurf: [`BAUTEIL_KATALOG.md`](BAUTEIL_KATALOG.md).

## 1. Rahmen und OSM

| Größe | Wert | Quelle |
|---|---|---|
| Kirche | Way **w599900778** „Basilica di San Lorenzo“, 14.218 Zellen, Teile: Sagrestia Nuova (w599900772), Sagrestia Vecchia (w599900777), Kuppelkreis der Alten Sakristei (w673454442), Vierung (w673454443), Hauptbau (w673454455) | `data/stadt/gebaeude.json` |
| Cappella dei Principi | Way **w24883267**, 5.661 Zellen, Teile: Achteck (w673454449), Laterne (w673454438) | `gebaeude.json` |
| **Rahmen `SL`** | Ursprung (**−388,5 \| −366,25**) = Mitte der Fassade (Osten, Piazza San Lorenzo), **θ = 192,8°**: u nach Westen zum Chor, w > 0 Norden | gefittet: Nordwand (−478 \| −419) → (−381,5 \| −397): 12,8° (+180°) |
| Mittelachse | w = −2,5 (OSM-Hauptbau w −15..10 bei der Fassade) | Messung |
| Gelände | Kirche 61–67 (häufig 66), Piazza vor der Fassade 65–66; Cappella dei Principi 61–62 | `ground_stadt.js` |
| **`bodenY`** | **67** (eine Stufe über der Piazza); Krypta-Boden Y 61 (Straßenniveau im Westen) | Entwurf |

Polygon im Rahmen (u \| w, Blöcke): Langhaus u 0..≈100 × w −32..31,5; Vierung u 112..138 × w −15..10 (26 × 26 = 13 m); Querarme bis w −50,5 / 52,8; Chor u 138..157 × w −16..10; Alte Sakristei u 131..158 × w −76..−38 (Kuppelkreis Mitte (144,4 \| −54,5), Ø ≈ 25); Neue Sakristei u 128..160 × w 35..75; Achteck der Cappella dei Principi Mitte (201 \| −2,3), Apothem außen 34,5; Laterne Ø ≈ 20 um (200,7 \| −2,5).

## 2. Maße

| Maß | Modell | Literatur | Bewertung |
|---|---|---|---|
| Modul | Joch 15,6 Blöcke, Vierung 26 | „campata quadrata di 11 braccia fiorentine“ ≈ 6,4 m (Suchzusammenfassung, mehrere Lernseiten); Braccio 0,5836 m | Vierung = 2 Module (13 m) passt zu OSM. Langhausjoche aus OSM-Länge / 7 = 7,8 m (C). |
| Joche | 7 | Lernseiten (Suchzusammenfassung) | B |
| Gesamtmaß | Langhaus 56 m × 31,5 m (OSM) | Plan 1418 „110 × 65 braccia“ (64 × 38 m) (Art Bulletin, Zusammenfassung) | OSM gewinnt. B |
| Säulen | korinthisch mit Kämpferaufsatz (Pulvino), glatte Schäfte | it.wikipedia, Lernseiten | A |
| Decke | Mittelschiff flache Kassettendecke mit goldenen Rosetten auf weißem Grund; Seitenschiffe Hängekuppeln | it.wikipedia | A |
| Fassade | rohe Bruchsteinfront („pietra grezza a vista“), drei Rundbogenportale; Michelangelos Marmorfassade nie gebaut | it.wikipedia | A |
| Seitenkapellen | sieben auf der rechten Seite | it.wikipedia | B |
| Alte Sakristei | Würfel mit Schirmkuppel aus 12 Segmenten | it.wikipedia | A |
| **Cappella dei Principi** | Achteck innen **56 Blöcke = 28 m**, Laterne bis Lage 112 = **Y 179 = 59 m über Gelände 61** | „ambiente ottagonale … largo 28 metri“, „altezza di 59 metri“ ([it.wikipedia Cappella dei Principi](https://it.wikipedia.org/wiki/Cappella_dei_Principi)) | A |
| Campanile | seit V5b gebaut (Modul 9): 54 m = Oberkante Lage 104 über Gelände 63, Lage **neben der Neuen Sakristei am Nordende des Querhauses**, Rechteck u 114..128 × w 51..67 | 54 m, Ruggieri 1740–41 (it.wikipedia, gonews.it); Lage „accanto alla Sagrestia Nuova, all’estremità destra del transetto“ (it.wikipedia) | Höhe A, Lage B/C |

## 3. Entwurfswerte (Stufe C)
Säulen Lage 1..14, Kapitell 15, Kämpfer 16, Bögen ab 17; Kassettendecke Lage 42 (21 m); Traufe 46, First 54; Seitenschiff-Hängekuppeln Lage 19..24, Pultdach 32→27; Vierung: Bögen Kämpfer 27, Pendentifs 39..47, Tambour 48..57, Kuppel bis 72, Laterne bis 80; Sakristeien Würfel bis Lage 24/26 mit Halbkugel; Cappella dei Principi: Wände bis Lage 50, Tambour bis 66, Kuppel bis 104.
