# Programmplan „Stadtmodell Florenz – Centro storico“ (V3)

**Stand:** 12. Oktober 2026 · **Rollen:** wie bisher. Opus übernimmt Design, Planung und Prüfung; Sonnet-Agenten mit mittlerem Aufwand setzen nach Spezifikation um, jeweils in einer eigenen git-Arbeitskopie.
**Entscheidungen des Nutzers:**
- Ganzes historisches Zentrum
- Jedes Haus einzeln
- Eine gemeinsame Welt (Ursprung Kuppelmitte, Maßstab 1:2)
- Wichtige Bauten in Modulbauweise
- Webapp wird angepasst

---

## 1. Größenordnung (gemessen aus OpenStreetMap, Stand 12.10.2026)

| Kennzahl | Wert |
|---|---|
| Untersuchungsgebiet | lat 43,7615–43,7795, lon 11,2380–11,2670 (Santa Maria Novella bis Santa Croce, San Lorenzo bis Boboli) |
| Ausdehnung | ca. **5.000 × 4.200 Blöcke** (2,5 × 2,1 km) |
| Gebäude | **6.446 Umrisse + 661 Multipolygone**, davon 371 benannt, 924 mit Höhen- oder Geschossangabe |
| Grundfläche bebaut | ca. 6,1 Mio Blockfelder |
| Geschätztes Volumen | **ca. 45–70 Mio Blöcke**: Fassaden und Wände ca. 30–50 Mio, Dächer ca. 7 Mio, Straßen und Plätze ca. 10 Mio; Innenräume nur bei Wahrzeichen |
| Geschätzte Bauschritte | **ca. 25.000–35.000** bei höchstens 2.100 Blöcken je Schritt |

Zum Vergleich: Der Dom-Komplex hat 909.000 Blöcke. Das Zentrum ist etwa **60-mal größer**.

## 2. Was „jedes Haus einzeln“ realistisch bedeutet
6.400 Häuser lassen sich nicht einzeln von Hand entwerfen. Ehrlich machbar ist Folgendes, und genau das wird gebaut:
- **Jedes Haus bekommt eine eigene Hausakte** (JSON). Sie enthält Bautyp, Geschosse, Fensterachsen, Sockel und Rustika, Portal, Ladenzone, Gesimse, Dachüberstand, Altana bzw. Loggia, Putzfarbe, Fenstertyp und Besonderheiten. Die Fassade entsteht aus dieser Akte. Kein Haus gleicht dem anderen, weil jede Akte eigene Werte hat.
- Die Akten füllen Agenten **Block für Block (Isolato für Isolato)** aus. Grundlage sind OSM-Daten (Höhe, Name, Nutzung, Denkmalstatus), die Lage an Straße bzw. Platz und florentinische Bautypologie.
- **Grenze:** Ohne Fassadenfotos sind das *plausible, individuelle* Häuser, keine fotogetreuen Kopien. Die **371 benannten Palazzi** werden zusätzlich gezielt recherchiert (Geschosse, Achsen, Rustika, Wappen). Die rund 30 **Wahrzeichen** werden wie der Dom als eigene Projekte in Modulbauweise entworfen.

## 3. Weltaufbau
- **Koordinaten:** wie beim Dom, also Ursprung Kuppelmitte, X entlang der Domachse (−1,36° gegen Ost), Z nach Süden, 1 Block = 0,5 m. Der Bereich wächst auf ca. **x −2.800..+2.300, z −2.200..+2.000**.
- **Gelände:** Florenz ist nicht eben. Der Arno liegt einige Meter unter den Straßen, Oltrarno und Boboli steigen um bis zu ca. 60–70 m an. Deshalb kommt ein **Geländemodell aus offenen Höhendaten** (DGM) dazu. Der Domplatz bleibt bei Y 64. Höchster Punkt unter Y 319 (wird in Phase A geprüft).
- **Eigentum statt Kollision:** Jede Zelle gehört genau einem Projekt. Grundlage ist ein **Parzellenraster** aus den OSM-Umrissen. Brandwände zwischen Nachbarhäusern baut genau eines der beiden Häuser, nach einer festen Regel.
- **Projekte bauen einzeln** (Speicher: 50 Mio Zellen passen nicht in ein Grid). Projektübergreifend geprüft werden Parzellen-Eigentum, Anschlusshöhen an Straßen und Gelände sowie die Auflager an Brücken.

## 4. Projektstruktur

| Art | Beispiele | Bauweise |
|---|---|---|
| **Wahrzeichen** (ca. 30) | Palazzo Vecchio, **Uffizien + Corridoio Vasariano**, Loggia dei Lanzi, Orsanmichele, Ponte Vecchio, Palazzo Pitti, San Lorenzo + Cappelle Medicee, Palazzo Medici Riccardi, Santa Croce, Santa Maria Novella, Bargello, Badia, Palazzo Strozzi, Palazzo Rucellai, Santissima Annunziata + Ospedale degli Innocenti, Santo Spirito, Carmine, Santa Trinita, Mercato Nuovo, die Arnobrücken, Arcone di Piazza della Repubblica | Modulbauweise wie beim Dom: Katalog, Module, Bauteile, Schritte |
| **Quartiere** (ca. 30–40) | „Domplatz-Ring“, „Via dei Calzaiuoli“, „Santa Croce Ost“ … | je Isolato ein Modul, je Haus ein Bauteil aus seiner Hausakte |
| **Stadtgrund** | Gelände, Straßen, Plätze, Arno, Ufermauern, Gärten (Boboli) | je Stadtteil ein Modul |

Der Dom bleibt das Projekt `duomo`, mit unveränderten Daten.

## 5. Phasen

| Phase | Inhalt | Wer |
|---|---|---|
| **A – Grundlagen** | Pipeline auf mehrere Projekte umbauen (`projects/<id>/…`) und den Koordinatenbereich erweitern. Projekt-Registry, Parzellenraster, projektübergreifende Prüfregeln. Stadtdaten aufbereiten: Gebäude, Straßen, Plätze, Wasser, Grün, Höhen. Geländemodell (DGM, Quelle recherchieren und belegen). Palette erweitern: Putzfarben, Pietra forte und serena, Wasser, Grün, Holzläden. | Opus (Design, Daten, Quellen) + 2–3 Agenten |
| **B – Webapp V3** | Projektwahl über einen **Stadtplan**: Quartiere und Wahrzeichen anklickbar, Status farbig. Laden je Projekt bei Bedarf. **Chunk-Meshing** mit zusammengefassten Flächen statt einem Würfel je Block. Detailstufen: nicht geladene Bereiche als OSM-Baukörper, ferne Projekte vereinfacht. Gesamtansicht der Stadt. Tastatur, Stückliste und Bauschritte wie gehabt. | 2 Agenten |
| **C – Hausgenerator + Pilot** | Schema der Hausakte, Fassaden-Generator für die florentinischen Typen (Palazzo, Casa-torre, Reihenhaus mit Bottega, Kirche klein, Loggia), Brandwand-Regel. **Pilot: der Rest des Domplatzes**, also der Ring aus 158 Gebäuden. Darin: Palazzo dei Canonici, Loggia del Bigallo, Misericordia, Museo dell'Opera, Palazzo Arcivescovile, Casa Ghiberti … Die bedeutenden davon als kleine Modulprojekte. | Opus + Agenten |
| **D – Wahrzeichen** | in Wellen: (1) Piazza della Signoria: Palazzo Vecchio, Loggia dei Lanzi, Uffizien, Orsanmichele. (2) Arno: Ponte Vecchio + Corridoio, Pitti. (3) Kirchen: San Lorenzo, Santa Croce, Santa Maria Novella, Santo Spirito … (4) Palazzi und Weitere | Agenten, Abnahme durch Opus |
| **E – Quartiere** | Hausakten je Isolato füllen und bauen, Welle für Welle über die Stadt | Agenten |
| **F – Abschluss** | Generierte Doku je Projekt, Stadt-Übergabe | Agent + Opus |
| **G – Minecraft-Export** (später, vom Nutzer vorgemerkt) | Export **einzelner Gebäude bzw. Projekte** als `.schem` (WorldEdit/FAWE) bzw. `.litematic`, sowie der **Gesamtwelt** als fertige Minecraft-Welt (Anvil-Regionsdateien `.mca`, Weltkoordinaten = Modellkoordinaten). Die Grundlage ist schon gelegt: alle Blöcke tragen Minecraft-IDs, und die Daten sind nach Projekten und Chunks gegliedert. Damit der Export später einfach wird, werden in Phase A die Chunk-Grenzen (16 × 16) und die Weltkoordinaten so festgelegt, dass Projektdaten ohne Umrechnung in Regionen geschrieben werden können. | Agent + Opus |

**Aufwand:** Das ist ein Vielfaches des Dom-Projekts und dauert viele Sitzungen. Jede Phase endet mit einem lauffähigen, geprüften Zwischenstand. Der Domplatz-Ring (Phase C) ist das erste sichtbare Ergebnis.

## 6. Risiken
| Risiko | Gegenmaßnahme |
|---|---|
| Webapp bei 50 Mio Blöcken | Chunk-Meshing, Laden nach Projekt, Detailstufen (Phase B vor den großen Wellen) |
| Speicher im Build | Projekte bauen einzeln; projektübergreifend wird nur über 2D-Raster und Randstreifen geprüft |
| Geländedaten ungenau | Höhen an Platz- und Straßenpunkten glätten, Gebäude bekommen eine ebene Sockellage, Anschlüsse werden geprüft |
| Gleichförmige Häuser | Hausakten-Prüfung: Kennzahlen zur Vielfalt je Straße, Nachbarn dürfen nicht identisch sein |
| OSM-Lücken (Höhen fehlen bei 85 %) | Geschosszahl aus Typ, Lage und Nachbarschaft ableiten; benannte Palazzi recherchieren |
