# 📐 Content-Format der Bauschritte & Bauhilfen

Dieses Dokument beschreibt, wie die Texte der Bauanleitung (V2) geschrieben werden, und enthält ein paar Form-Schablonen für Achtecke und Rundfenster. Die Zahlen der Bauanleitung (Blöcke, Teilelisten, Y-Bereiche) schreibst du **nie** von Hand. Sie kommen aus dem Modell.

---

## 🧩 So entsteht eine Bauanleitung

```text
tools/model/mN_*.js          Geometrie: ctx.part('id') je Bauteil, in Bau-Reihenfolge
content/steps_de/modul_N.json  Texte je Bauteil (diese Datei schreibst du)
tools/steps/planner.js       teilt Bauteile in Bauschritte (höchstens 2.500 Blöcke)
tools/emit/docs.js           erzeugt BAUANLEITUNG_MODUL_N.md, Statistik und Blockpalette
node tools/build.js          führt alles aus und prüft es (Regeln R1 bis R10)
```

Die Bauanleitungen sind vollständig generiert (Kommentar in der ersten Zeile) und werden von der Prüfregel R9 mit dem Modell abgeglichen. Handarbeit an diesen Dateien geht beim nächsten Build verloren.

---

## 📝 Das Content-Format `content/steps_de/modul_N.json`

Je Modul gibt es eine JSON-Datei. Sie enthält Titel und Untertitel des Moduls und einen Text-Block je Bauteil. Der Schlüssel ist die Bauteil-ID aus dem Modellcode (`ctx.part('kuppel_ring_01')`).

```json
{
  "module": 5,
  "title": "Brunelleschis Doppelkuppel",
  "subtitle": "Bautüte 5: Die achteckige Doppelkuppel aus Ziegeln mit Rippen, Ringketten und Jüngstem Gericht",
  "icon": "🏛️",
  "parts": {
    "kuppel_ring_01": {
      "title": "Kuppelring 1: Der Fuß der Kuppel",
      "description": "Du beginnst die Kuppel mit dem ersten Band …",
      "tip": "Lege zuerst die Lage Y 173 komplett und vergleiche sie mit dem Tambour darunter …",
      "caution": "Kein Block der untersten Lage darf über den Rand des Tambours hinausragen …",
      "fact": "Im Jahr 1418 schrieb die Dombauhütte von Florenz einen Wettbewerb für die Kuppel aus …"
    }
  }
}
```

| Feld | Bedeutung | Erscheint in der Bauanleitung als |
| :--- | :--- | :--- |
| `module` | Modulnummer 0 bis 9 | Dateiname und Schrittnummer (Schritt N.k) |
| `title`, `subtitle` | Überschrift und Untertitel des Moduls | Titel der Bauanleitung |
| `icon` | Symbol des Moduls | Webapp |
| `parts.<id>.title` | Titel des Bauteils | Titel des Schritts und Spalte „Titel“ der Bauteil-Liste |
| `parts.<id>.description` | Was du baust und wie (Du-Form, Y-Werte und Maße nennen) | Abschnitt „Beschreibung“ |
| `parts.<id>.tip` | Ein praktischer Tipp zum Bauen | Abschnitt „Tipp“ |
| `parts.<id>.caution` | Ein typischer Baufehler, den du vermeiden sollst | Abschnitt „Achtung“ |
| `parts.<id>.fact` | Ein geschichtlicher Fakt zum Bauteil | Abschnitt „Fakt“ |

### Regeln für die Texte
- **Du-Form und kindgerecht:** kurze Sätze, ein Gedanke je Satz, Fachwörter beim ersten Mal erklären.
- **Maße sind Blockmaße im Maßstab 1:2:** Y-Werte, Halbmaße und Koordinaten müssen zum Modell passen (Fußboden Y 64, Laufniveau Y 65, Ursprung in der Kuppelmitte).
- **Keine Blockzahlen und keine Teilelisten im Text.** Sie kommen automatisch.
- **Jedes Bauteil hat Titel, Beschreibung, Tipp, Achtung und Fakt.** Fehlt etwas, warnt der Build (kein Fehler); als Titel erscheint dann die Bauteil-ID.
- **Ein Bauteil ergibt einen oder mehrere Schritte.** Der Planer hängt bei mehreren Schritten ` – Teil i/n (Y y0–y1)` an den Titel. Werden kleine Schritte zusammengelegt, verbindet er die Titel mit ` & `. Alle Schritte eines Bauteils teilen sich dieselben Texte; schreibe sie deshalb so, dass sie für jeden Teil passen.
- **Reihenfolge:** Sie ergibt sich aus der Registrierung im Modellcode, nicht aus der JSON-Datei.

---

## 📦 Aufbau eines Schritts in der Bauanleitung

Der Generator erzeugt für jeden Schritt denselben Abschnitt:

```markdown
### Schritt 1.7 – Titel des Schritts

- **Y-Bereich:** 68 bis 74
- **Blöcke:** 1.834
- **Bauteile:** `pfeiler`

**Teileliste**

| Block | Typ | Anzahl |
| :--- | :--- | ---: |
| Glatter Stein | `smooth_stone` | 1.200 |
| Steinziegel | `stone_bricks` | 634 |

**Beschreibung** … **Tipp** … **Achtung** … **Fakt** …
```

Vor den Schritten stehen eine Übersichtstabelle (Blöcke, Schritte, Ausdehnung, kleinster, mittlerer und größter Schritt), die Gesamt-Stückliste des Moduls und die Liste der Bauteile in Bau-Reihenfolge.

---

## ⚪ Schablone für Achtecke (Tambour und Kuppel)

Die Vierung, der Tambour und die Kuppel sind regelmäßige Achtecke mit den Flächen auf den Achsen. Ein Achteck wird über den **Apothem** `a` (Abstand von der Mitte zur Fläche) angegeben:

- Eine Zelle `(dx, dz)` liegt im Achteck, wenn `max(|dx|, |dz|, (|dx| + |dz|) / √2) ≤ a` gilt.
- Vier Seiten liegen auf den Achsen (Nord, Süd, Ost, West), vier stehen diagonal. Auf den Diagonalen steigt die Kante in 45°-Stufen, ein Block nach außen und ein Block zur Seite.
- Maße im Modell: Innenmaß der Vierung Halbmaß 45, Außenmaß des Tambours Halbmaß 54. Beide Werte stehen in `tools/spec/dimensions.js`.

---

## 🔘 Schablone für Ochsenaugen (Tambour-Fenster)

Die acht runden Fenster des Tambours sitzen mittig in den acht Wandflächen, ihre Mitte liegt auf Y 163. Eine Zelle gehört zum Glas, wenn `u² + v² ≤ 20` gilt (`u` Abstand von der Mitte in der Wandfläche, `v` Abstand von der Mitte in der Höhe). Das ergibt 9 × 9 Zellen:

```text
Draufsicht auf die Wandfläche (G = Glas, . = Wand):

. . G G G G G . .
. G G G G G G G .
G G G G G G G G G
G G G G G G G G G
G G G G G G G G G
G G G G G G G G G
G G G G G G G G G
. G G G G G G G .
. . G G G G G . .

Mit Rahmenring (Q = Marmor):

. . Q Q Q Q Q Q Q . .
. Q Q G G G G G Q Q .
Q Q G G G G G G G Q Q
Q G G G G G G G G G Q
Q G G G G G G G G G Q
Q G G G G G G G G G Q
Q G G G G G G G G G Q
Q G G G G G G G G G Q
Q Q G G G G G G G Q Q
. Q Q G G G G G Q Q .
. . Q Q Q Q Q Q Q . .
```

---

## 🧭 Himmelsrichtungen & Orientierung

Halte beim Bauen die F3-Taste (oder die Kompassanzeige) im Blick:
- **Westen (`-X`):** Westfassade, Campanile und Baptisterium
- **Osten (`+X`):** Hauptaltar und Ostapsis
- **Norden (`-Z`):** linke Seite der Kathedrale
- **Süden (`+Z`):** rechte Seite und Campanile (Glockenturm)
- **Ursprung (0, 64, 0):** Mitte der Vierung unter der Kuppel
