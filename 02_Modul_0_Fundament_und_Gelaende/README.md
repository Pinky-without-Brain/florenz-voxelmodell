# 🏛️ Modul 0: Fundament, Böden und Krypta-Grube

<!-- STATISTIK:START -->
**Statistik (generiert):** 46.661 Blöcke in 27 Bauschritten, Y 56 bis 64, X -347 bis 96, Z -96 bis 96.
Schrittgröße: kleinster 841, mittlerer 1.728, größter 2.060 Blöcke.

Zur vollständigen Bauanleitung mit Teilelisten: [BAUANLEITUNG_MODUL_0.md](BAUANLEITUNG_MODUL_0.md)
<!-- STATISTIK:END -->

## Bautüte 0: Grube, Marmorböden und der Grundriss des ganzen Domplatzes

Bevor ein einziger Stein in den Himmel von Florenz wachsen kann, brauchen wir ein präzises Fundament. Wie die mittelalterlichen Bauleute beginnen wir mit dem Grundriss: Wir heben die Grube für die Krypta der Vorgängerkirche *Santa Reparata* aus und legen die Marmorböden aller Gebäude, die auf dem Domplatz entstehen.

---

## 🗺️ Maße (Maßstab 1:2, 1 Block = 0,5 m)

Alle Maße stammen aus [`tools/spec/dimensions.js`](../tools/spec/dimensions.js) und sind in [`REFERENZMASSE.md`](../00_Projektplan_und_Konzept/REFERENZMASSE.md) belegt.

| Eigenschaft | Wert | Vorbild |
| :--- | :--- | :--- |
| **Fußboden** | Oberkante Y 64, Laufniveau Y 65 | Pflaster der Piazza del Duomo |
| **Unterkante Fundament** | Y 56 | Fundamentplatte unter der Krypta |
| **Krypta-Fußboden** | Y 57 | 3,5 m unter dem Domboden |
| **Nullpunkt (0, 64, 0)** | Mitte der Vierung unter der Kuppel | Standort des Hauptaltars |
| **Westfassade** | Außenfläche bei X −216 | −108 m im Lageplan |
| **Ostapsis** | Scheitel der Osttribune bei X +96 | 48 m östlich der Kuppelmitte |
| **Nord- und Südtribune** | Scheitel bei Z −96 und Z +96 | je 48 m von der Längsachse |
| **Langhaus** | X −216 bis −55, Außenflucht Z ±44 | 38 m Innenbreite |
| **Campanile** | Mitte (−200, 65), Halbmaß 14 | Giottos Turm, 14,45 m Seite |
| **Baptisterium** | Mitte (−307, 0), Scarsella bis X −347 | 58 Blöcke vor der Fassade |

```text
                          NORDEN (-Z)
                        [Nordtribune]
                         Z -96 bis -54
                               |
 WESTEN (-X)                   |                         OSTEN (+X)
 [Baptisterium] [Fassade] [Langhaus] ------- [Vierung] --- [Osttribune]
 X -347..-273    X -216   X -212..-55         X ±54        X 54..96
                  |                              |
              [Campanile]                  [Südtribune]
           (-200, 65), Halbmaß 14           Z 54 bis 96
                          SÜDEN (+Z)
```

---

## 📋 Bauteile in Bau-Reihenfolge

1. `krypta_grube`: Aushub der Krypta Santa Reparata mit Boden und Ringmauer.
2. `boden_langhaus`: Kosmatenboden des Langhauses, auch über der Krypta.
3. `boden_vierung`: Konzentrische Achteckbänder mit Rosette unter der Kuppel.
4. `boden_tribune_nord`, `boden_tribune_ost`, `boden_tribune_sued`: Strahlenmuster der drei Tribunen.
5. `boden_campanile`: Schachbrettboden des Glockenturms.
6. `boden_baptisterium`: Kreisbandmuster des Baptisteriums samt Scarsella.

Die genauen Blockzahlen, Schrittnummern und Teilelisten stehen in der [Bauanleitung](BAUANLEITUNG_MODUL_0.md). Sie wird aus dem Modell erzeugt und ist deshalb immer aktuell.

---

## 🎨 Wusstest du schon? – Geheimnisse aus Florenz
> **Die Kirche in der Kirche (Santa Reparata):**
> Bevor der Dom gebaut wurde, stand an genau dieser Stelle die alte, viel kleinere Kathedrale *Santa Reparata*.
> Weil die Florentiner aber während der über 100 Jahre dauernden Bauzeit nicht auf ihre Gottesdienste
> verzichten wollten, bauten sie die neue Riesenkathedrale einfach wie eine Schale **um die alte Kirche herum**!
> Die Menschen beteten noch in Santa Reparata, während über ihren Köpfen bereits die riesigen Außenmauern
> von Santa Maria del Fiore in den Himmel wuchsen. Erst als die Mauern fast fertig waren, riss man die alte Kirche ab!
