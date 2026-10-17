# Referenzmaße – Forte di Belvedere (Welle 8c)

Projekt-ID `forte_belvedere`. Maßstab 1:2 (**Blöcke = 2 · m**). Stand 17.10.2026. Stufen: **A** belegt (Quelle genannt), **B** aus OSM begründet, **C** Entwurf. Bauteile: [`BAUTEIL_KATALOG.md`](BAUTEIL_KATALOG.md). Bauplan als Zellen im Speicher (`projects/forte_belvedere/model/_fb.js`, Palazzina `_fb_pal.js`, `tools/wahrzeichen/zellplan.js`), Gelände wie `palazzo_pitti` (`spec/ground.js`: Abtrag bis `bodenY − 1`).

## 1. Rahmen und OSM

| Größe | Wert | Quelle |
|---|---|---|
| OSM-Objekt | Way **w24879633** „Forte di Belvedere“ (`building=fort`, `historic=fort`, Wikidata Q72786), **61.185 Zellen**, kein Loch, `hoeheBl` 30 (Schätzung) | `data/stadt/gebaeude.json` |
| Gebäude im Umriss | **w160800063** (4.946 Zellen, `building:levels` 2, Höhe 17) = **Palazzina del Belvedere** (Lage in der Mitte, Quelle: it.wikipedia „im Zentrum der Anlage“); **w398240863** (2.575 Zellen, 4 Ebenen, Osten) und **w398240882** (67 Zellen, rund) ohne belegte Funktion. Alle vier IDs stehen in `gebaeude` und `vorrang.json`, die Hausakten sind gelöscht | OSM; it.wikipedia |
| Umriss | sternförmig, Nord–Süd 400 Blöcke lang (z 2044..2440), Ost–West 305 (x −616..−311), 45 Eckpunkte; Spitzen bei (−615 \| 2093), (−355 \| 2044), (−421 \| 2440), (−310 \| 2317) | OSM; it.wikipedia „pianta stellare con due fronti bastionati (nord e sud) e due tanagliati (est e ovest)“ (A) |
| **Rahmen `FB`** | achsparallel (θ 0°) mit Ursprung (−464 \| 2242); die Palazzina hat einen eigenen Rahmen `PL` (θ 2,5°, Ursprung (−501 \| 2251,5)) | B |
| Gelände | 180 (533 Zellen) bis 191 (52), Mehrheit 183–187; im Süden und Osten (Y 188–191) höher als in der Mitte, im Norden (Y 180–184) tiefer | `tools/city/ground_stadt.js` |
| **`bodenY`** | **185** (häufigster Wert, zugleich Höhe der Palazzina); höheres Gelände trägt der Stadtgrund bis Y 184 ab (`spec/ground.js`), tieferes füllt das Projekt bis Y 184 auf | B |
| Umgebung | Tor im Südosten Richtung Via di San Leonardo / Largo Edoardo Speranza / Costa San Giorgio (Y 181–183 vor dem Wall); im Westen und Norden der Giardino di Boboli | `flaechen.json` |

## 2. Maße (Literatur gegen Modell)

| Merkmal | Modell | Literatur oder OSM | Bewertung |
|---|---|---|---|
| Architekt, Bau | Bernardo Buontalenti (mit Don Giovanni de' Medici und Alessandro Pieroni), Bau 1590–1595 (der Text nennt 1590–1591 für die Befestigungen) | it.wikipedia „Forte Belvedere“ | A |
| Palazzina | Bartolomeo Ammannati zugeschrieben, 1560er Jahre; weiß, **drei Geschosse**, im Erdgeschoss **zwei durchgehende Logge** in der Mitte der Längsseiten, Fenster auf den Randachsen, nach oben kleiner; Uhr an der Nordfassade (18. Jh.); obere Geschosse nur über eine enge Treppe in der Mauer | it.wikipedia | A |
| Zugang | Portal auf der **Ostseite** zwischen zwei Bastionen der Kurtine, Medici-Wappen darüber; steile Rampe mit Gradoni und Tonnengewölbe | it.wikipedia | A |
| Terrassen | teils mit Rasen belegt | it.wikipedia | A |
| Brunnen | in den Fels gegrabener Schacht von der Palazzina aus zu einer Schatzkammer (nicht gebaut) | it.wikipedia | A |
| Fläche | 52.846 Quadratbraccia (Fantozzi 1843); Umfang 1.242 Braccia; OSM 61.185 Zellen = 15.296 m² | it.wikipedia; OSM | B |
| Plateau, Wälle | Hofebene Y 185 (Lage 0), Wallkrone Lage 5, Brüstung Lage 6–7, Wallstärke 7 Blöcke; keine Quelle nennt Höhen (nur ca. 10 m Fallhöhe von den Bastionen) | OSM-Gelände, Entwurf | C |
| Bastionen | an den spitzen Ecken des Umrisses (Winkel ≤ 105°, beide Kanten ≥ 18 Blöcke) Plattformen bis zur Wallkrone, Radius 15 | OSM-Umriss, Entwurf | B / C |
| Palazzina im Modell | Umriss OSM (≈ 68 × 73 Blöcke), Geschosse 0 / 5 / 10, Decke 15, Walmdach bis 18 (OSM-Höhe 17 für zwei Ebenen) | OSM; Geschosszahl A | B / C |

## 3. Entwurfswerte (Stufe C)
Plateauhöhe 185; Wallstärke und -höhe; Radius der Plattformen; Lage des Tores (an der Südostkurtine bei x −352; die Quelle nennt nur „Ostseite“); Zahl und Lage der Stufen zur Wallkrone (20); Grundriss der Palazzina innen (Halle und sechs Räume), Fenster- und Bogenraster; Kies- und Rasenfelder.

## 4. Nicht gebaut
Kasematten und Zisterne (nicht belegt), die Schatzkammer unter der Palazzina, Tonnengewölbe der Rampe, Schießscharten und Zinnen, die Rampen des 19. Jh. zum Giardino di Boboli (der gedeckte Gang im Norden), die beiden weiteren OSM-Gebäude im Umriss (w398240863, w398240882: Funktion nicht belegt, deshalb Hofebene), die Verbindung zum Corridoio Vasariano.
