# Referenzmaße – Palazzo dell'Arte della Lana (W7c)

Projekt-ID `palazzo_arte_della_lana`. Maßstab 1:2 (**Blöcke = 2 · m**). Stand 16.10.2026. Stufen: A (belegt), B (abgeleitet), C (Entwurf, begründet). Entwurf: [`BAUTEIL_KATALOG.md`](BAUTEIL_KATALOG.md).

## 1. Rahmen und OSM

| Größe | Wert | Quelle |
|---|---|---|
| OSM-Objekt | Way **w95537272** „Palazzo dell'Arte della Lana“ (`building=apartments`, `building:levels` 5, Höhe 37 Blöcke aus den Ebenen, wikidata Q3891405, `tourism=museum`), **2.000 Zellen** (Auftrag nannte 1.983), keine Löcher | `data/stadt/gebaeude.json` |
| Lage | Mitte ≈ (−364 \| 540). Nordkante an der **Via Orsanmichele**, Westkante an der **Via Calimala**, Südkante an der **Via dei Lamberti**, Ostkante an der **Via dell'Arte della Lana** (gegenüber Orsanmichele) | `flaechen.json` |
| **Rahmen `AL`** | Ursprung (−387 \| 516,5) = Nordwestecke, **θ = −5,5°**; u nach Osten (0..43), w nach Süden (0..53). Hauptblock u 0..38 × w 0..44, dazu ein Südostteil bis u 42 (w 36..51) | Kanten 3 und 4 des Umrisses |
| Gelände | 65 bis 66 im Westen, 67 im Osten und in der Mitte (25 / 1.195 / 780 Zellen) | `tools/city/ground_stadt.js` |
| **`bodenY`** | **66** (Mehrheit der Zellen, Straßen im Westen 65 bis 66; im Osten liegt die Straße bis 67, der Zugang geht eine Stufe hinab) | B |
| Brücke | Way w1394931261 (Projekt `orsanmichele`, Boden Y 94, Lage 26 dort); der Boden der fünften Ebene des Palazzo liegt ebenfalls auf Y 94 (Lage 28) | `projects/orsanmichele` |

## 2. Inhalt (Literatur gegen Modell)

| Merkmal | Modell | Literatur | Bewertung |
|---|---|---|---|
| Bau | 1308 (zwei lateinische Inschriften) als Sitz der Arte della Lana errichtet, unter Einbeziehung eines älteren Turmhauses der **Compiobbesi** (1284 teilweise abgebrannt). Der Auftrag nannte die „Compagnoni“; die Quelle nennt die Compiobbesi | it.wikipedia „Palazzo dell'Arte della Lana“ | A |
| Aufbau | drei Teile: mittelalterlicher Kern, südlich der **Scalone** von Buontalenti, nördlich der neugotische Teil mit Loggetta und Tabernakel | it.wikipedia | A (Modell: ein Baukörper) |
| Fassade | Quaderverkleidung (*filaretto*), Gesimse und **Zinnen auf Konsolen** (Beccatelli), gewölbte Fenster, Gerüstlöcher; an der Via Calimala drei Achsen, drei Hauptgeschosse mit Mezzaninen | it.wikipedia | A (Material C: Quelle nennt das Gestein nicht eindeutig) |
| Wappen | Agnus Dei und Inschriften von 1308 an beiden Fassaden | it.wikipedia | A |
| Tabernakel | Madonna della Tromba, ursprünglich am Mercato Vecchio, **1917** an der Ecke wieder aufgebaut | it.wikipedia | A (Ecke: Modell Nordwest, C) |
| Loggetta | an der Ecke zur Via Orsanmichele mit Bifore, Stadtwappen und neugotischen Lampen | it.wikipedia | A (nicht gebaut) |
| Brücke | 1569 ließ Cosimo I. nach Entwurf Buontalentis eine Treppe und einen Verbindungsbau über die Via dell'Arte della Lana zu den Obergeschossen von Orsanmichele errichten; die Überdachung wurde 1964–1967 entfernt | it.wikipedia | A |
| Räume | **Sala delle Udienze** (EG, Via Calimala 16–18): Trecento-Fresken (Gewölbe mit Tugenden und Evangelisten, thronende Madonna zwischen Engeln, Heilige; um 1310–1320, Lippo di Benivieni oder Umkreis des Maestro del Crocifisso Corsi), rechte Wand Investitur/Giostra um 1340; **1. Stock**: neomittelalterlicher Treppenaufgang mit bemalten Dachstühlen und Wappen Florentiner Institutionen, Bibliothek der Società Dantesca, Lünette mit thronender Madonna; Keller: Jagdszenen (frühes 15. Jh.) | it.wikipedia | A (Lage der Räume C) |
| Besitz | seit 1890 Stadt Florenz, seit 1903 Società Dantesca Italiana; Restaurierungen 1905, 1921, 1964–67, 1996–98, 2011–12 | it.wikipedia | A |
| Maße in Metern | nennt die Quelle nicht | – | fehlt |

## 3. Entwurfswerte (Stufe C, Begründung: keine Maße in den Quellen)
Fünf Geschosse mit den Höhen 7, 7, 7, 7 und 6 Blöcken (Böden auf Lage 0, 7, 14, 21, 28; Decke Lage 34; Dachterrasse Lage 35; Zinnen bis Lage 37 = OSM-Höhe). Der Boden der fünften Ebene (Lage 28 = Y 94) fällt mit dem Boden der Brücke von Orsanmichele zusammen. Außenwand 2 dick, Fenster alle 8 Blöcke (3 breit), ab dem ersten Obergeschoss als Biphore. Wendeltreppe (Radius 3) in der Westhalle bei (u 9 \| w 19). Trennwände bei u 16 (Westhalle | Ostsäle), w 30 (Westhalle), w 24 und w 44 (Ostsäle). Portale (5 × 8) bei (0 \| 38) an der Via Calimala und bei (35 \| 30) an der Via dell'Arte della Lana.
