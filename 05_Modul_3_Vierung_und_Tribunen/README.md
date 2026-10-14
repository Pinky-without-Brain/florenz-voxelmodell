# 🍀 Modul 3: Vierung & Die drei Tribunen

<!-- STATISTIK:START -->
**Statistik (generiert):** 348.730 Blöcke in 224 Bauschritten, Y 65 bis 148, X -54 bis 96, Z -96 bis 96.
Schrittgröße: kleinster 1.056, mittlerer 1.557, größter 2.092 Blöcke.

Zur vollständigen Bauanleitung mit Teilelisten: [BAUANLEITUNG_MODUL_3.md](BAUANLEITUNG_MODUL_3.md)
<!-- STATISTIK:END -->

## Bautüte 3: Das Achteck unter der Kuppel, drei Tribunen mit je fünf Kapellen und die Sakristeien

Das östliche Ende von Santa Maria del Fiore unterscheidet sich von fast allen anderen Kathedralen Europas: Statt eines einfachen Chores breitet sich um die zentrale Vierung ein dreiblättriges Kleeblatt (*Trikonchos*) aus! Drei gewaltige Tribunen mit insgesamt 15 Kapellen bilden die Basis für die spätere Kuppel.

> 🌐 Die ausführliche Anleitung steht in [BAUANLEITUNG_MODUL_3.md](BAUANLEITUNG_MODUL_3.md). Die interaktive 3D-Ansicht öffnest du unter [webapp/index.html](../webapp/index.html).

---

## 🗺️ Maße (Maßstab 1:2, 1 Block = 0,5 m)

| Eigenschaft | Wert in Blöcken | Vorbild |
| :--- | :--- | :--- |
| **Vierung innen** | Achteck, Halbmaß 45 über die Flächen | 45 m Innenmaß |
| **Vierung außen** | Halbmaß 54 | 54 m, Tambourmaß |
| **Wandstärke** | 9 Blöcke | 4,25–4,5 m |
| **Oberkante der Vierungsbögen** | Y 148 | 42 m, Basis des Tambours |
| **Tribunen** | Nord, Ost, Süd; Außenkontur halbes Achteck mit Apothem 37 um den Mittelpunkt 59 | Scheitel bei 96 (OSM: 95–97) |
| **Innenraum der Tribune** | Apothem 19 | öffnet die Achteckseite der Vierung |
| **Kapellen** | 5 je Tribune, 15 insgesamt | Radialkapellen |
| **Dach der Kapellen** | Y 104 | 20 m (Annahme) |
| **Dach der Tribunen** | Y 130 | 33 m (Annahme) |
| **Tribune morte** | 4 an den Diagonalseiten des Tambours | Exedren, siehe Modul 4 |

---

## 📋 Bauteile in Bau-Reihenfolge

1. `vierung_wand`, `vierung_gesims`, `sakristei_tueren`: Die Wand des Achtecks mit den vier großen Bögen, das Kämpfergesims und die Sakristeitüren.
2. Nordtribune: `tribune_nord_mauern`, `tribune_nord_gewoelbe`, `tribune_nord_obergaden`, `tribune_nord_daecher`.
3. Osttribune: `tribune_ost_mauern`, `tribune_ost_gewoelbe`, `tribune_ost_obergaden`, `tribune_ost_daecher`.
4. Südtribune: `tribune_sued_mauern`, `tribune_sued_gewoelbe`, `tribune_sued_obergaden`, `tribune_sued_daecher`.
5. `eckbauten`: Eckbauten und Sakristeien.
6. `exedra_sockel`: Sockel für die „tribune morte“.

Blockzahlen, Schrittnummern und Teilelisten stehen in der [Bauanleitung](BAUANLEITUNG_MODUL_3.md).

---

## 🎨 Wusstest du schon? – Geschichten aus Florenz
> **Brunelleschis Geheimtrick: Schwere Steine gegen den Kuppeldruck!**
> An den vier schrägen Ecken des Doms stehen vier wunderschöne weiße Marmortempelchen mit Muschelnischen (die sogenannten *Exedren*).
> Die meisten Menschen denken, das sei nur hübsche Dekoration. Doch Filippo Brunelleschi dachte wie ein Physiker:
> Er wusste, dass die spätere Riesenkuppel ein unglaubliches Gewicht nach außen drücken würde.
> Die Exedren sind tonnenschwere Gewichte, die genau an den Schwachstellen von oben auf die Mauern drücken,
> damit die Wände unter dem Kuppeldruck nicht wie eine Eierschale nach außen platzen!
