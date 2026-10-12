# 📐 Meisterbauer-Bauschritt-Vorlagen & Bauhilfen

Dieses Dokument enthält die standardisierte Vorlage für alle Bauschritte der Minecraft-Anleitung sowie praktische Rechen- und Formschablonen für Kreise, Bögen und Achtecke.

---

## 🧩 Das Standard-Layout eines Bauschritts

Jeder Bauschritt in unseren Anleitungen folgt exakt diesem 6-teiligen didaktischen Aufbau:

```markdown
---

## 🧱 Bauschritt [Modul].[Schrittnummer]: [Titel des Bauschritts]
*Beispiel: Bauschritt 1.04: Errichtung der östlichen Arkadenpfeiler*

> 📍 **Bereich:** [Bauteil, z. B. Langhaus Nordwand]  
> 📏 **Höhenebene:** Y = [Start] bis Y = [Ende]  
> 🔄 **Bautyp:** [Neubau / Erweiterung / Symmetrisch spiegeln]

---

### 1. 📦 Teileliste (Bautüte für diesen Schritt)
*Sammle zuerst alle Blöcke in deinem Inventar, bevor du anfängst!*

| Symbol | Block-Name | Menge | Funktion in diesem Schritt |
| :---: | :--- | :---: | :--- |
| ⬜ | Glatter Quarzblock | 16x | Äußere Säulenverkleidung |
| 🟩 | Dunkler Prismarin | 8x | Geometrischer Schmuckstreifen |
| 🪨 | Steinziegel | 12x | Tragender Innenkern |
| 🪜 | Quarztreppe | 4x | Fußkapitell der Säule |

---

### 2. 🗺️ Schichtplan / Grundriss-Raster (Draufsicht)
*Legende: `Q` = Quarz, `P` = Prismarin, `S` = Steinziegel, `.` = Freiluft/Bereits gebaut*

```text
       Norden (-Z)
         01 02 03 04
     01  .  Q  Q  .
West 02  Q  P  P  Q   Ost (+X)
(-X) 03  Q  S  S  Q
     04  .  Q  Q  .
       Süden (+Z)
```

---

### 3. 🔨 Schritt-für-Schritt Bauanleitung
1. **Schritt 1:** Setze auf der Koordinate `(X: -45, Y: 68, Z: 12)` die vier Steinziegel (`S`) im Quadrat `2x2`. Das ist der stabile Kern.
2. **Schritt 2:** Ummantele den Kern mit den Quarzblöcken (`Q`) wie im Schichtplan gezeigt.
3. **Schritt 3:** Setze die zwei Prismarinblöcke (`P`) an die Nordseite für das toskanische Farbmuster.
4. **Schritt 4:** Platziere an den vier Außenecken jeweils eine Quarztreppe mit der Stufe nach außen zeigend.

---

### 4. 💡 Baumeister-Tipp von Filippo Brunelleschi
> *"Achte darauf, dass die Treppen richtig herum platziert werden! Wenn du dich hockst (Sneak-Taste),*
> *kannst du Blöcke an Treppen platzieren, ohne versehentlich das Menü zu öffnen oder herunterzufallen."*

---

### 5. ⚠️ Achtung: Baufehler vermeiden!
> 🚨 **Vorsicht:** *Dieser Pfeiler muss exakt 14 Blöcke Abstand zum westlichen Nachbarpfeiler haben.*
> *Zähle vor dem Weiterbau die Bodenblöcke nach!*

---

### 6. 🎨 Wusstest du schon? – Geschichten aus Florenz
> **Die Zunft der Wollweber (Arte della Lana):**
> Wer hat den Dom eigentlich bezahlt? Nicht nur die Kirche! Die reichste Handwerkerzunft von Florenz,
> die Wollweber, bezahlte einen Großteil der Bauarbeiten. Sie waren so stolz auf ihre Stadt, dass sie
> wollten, dass jeder Reisende schon aus 30 Kilometern Entfernung den Dom sehen konnte!
```

---

## ⚪ Schablonen für Achtecke (Tambour & Kuppel)

Die Kathedrale basiert auf einem gigantischen Achteck (Oktogon). Da Minecraft aus eckigen Blöcken besteht, müssen wir Achtecke durch abgestufte Blockfolgen erzeugen.

### Das 120-Block-Oktogon (Kuppel-Außenwand)
Ein symmetrisches Achteck besteht aus:
- 4 geraden Seiten (Nord, Süd, Ost, West)
- 4 diagonalen Seiten (Nord-Ost, Nord-West, Süd-Ost, Süd-West)

**Bauformel für ein Segment (Kantenlänge ~50 Blöcke):**
- Gerade Segmente: `35 Blöcke geradeaus`
- Diagonaler Übergang: `1-1-1-1-2-2-2-3-3-2-2-2-1-1-1-1` im 45°-Winkel gestuft.

---

## 🔘 Schablonen für Ochsenaugen-Fenster (Oculi)

Die berühmten runden Fenster im Tambour der Kathedrale (Durchmesser 11 Blöcke):

```text
Ebene (Draufsicht für ein vertikales Rundfenster 11x11 Blöcke):

Zeile 11:         [Q][Q][Q]
Zeile 10:      [Q][G][G][G][Q]
Zeile 09:    [Q][G][G][G][G][G][Q]
Zeile 08:   [Q][G][G][G][G][G][G][G][Q]
Zeile 07:   [Q][G][G][G][G][G][G][G][Q]
Zeile 06:  [Q][G][G][G][G][G][G][G][G][G][Q]   <- Mitte (Durchmesser 11)
Zeile 05:   [Q][G][G][G][G][G][G][G][Q]
Zeile 04:   [Q][G][G][G][G][G][G][G][Q]
Zeile 03:    [Q][G][G][G][G][G][Q]
Zeile 02:      [Q][G][G][G][Q]
Zeile 01:         [Q][Q][Q]

Legende: [Q] = Glatter Quarz (Rahmen), [G] = Farbiges Buntglas
```

---

## 🧭 Himmelsrichtungen & Orientierungs-Kompass

Halte beim Bauen immer die F3-Taste (oder die Kompassanzeige) im Blick:
- **Westen (`-X`):** Haupteingang / Fassade
- **Osten (`+X`):** Altar & Ostapsis
- **Norden (`-Z`):** Linke Seite der Kathedrale
- **Süden (`+Z`):** Rechte Seite & Campanile (Glockenturm)
