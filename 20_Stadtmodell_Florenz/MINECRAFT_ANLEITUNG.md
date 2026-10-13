# Florenz in Minecraft ansehen

Das Stadtmodell liegt als Minecraft-Welt vor („Florenz Voxelmodell“). Sie brauchen dafür Minecraft for Windows (Bedrock Edition).

## Welt öffnen
1. Minecraft for Windows starten und auf **Spielen** klicken.
2. In der Liste der Welten **Florenz Voxelmodell** auswählen und starten. Falls sie fehlt: Minecraft einmal ganz schließen und neu starten.
3. Sie sind im Kreativmodus und stehen auf der Piazza del Duomo, westlich der Domfassade.

## Steuerung im Kreativmodus
- Gehen: **W A S D**, Springen: **Leertaste**, Blick: Maus.
- **Fliegen:** Leertaste zweimal schnell drücken. Aufwärts: Leertaste halten, abwärts: **Umschalt** halten. Schneller fliegen: **Strg** gedrückt halten.

## Zu den Sehenswürdigkeiten springen
Taste **T** (Chat öffnen), den Befehl eintippen, Enter. Die Orte liegen weit auseinander, deshalb springt man am besten mit diesen Befehlen. Beim Ankommen am besten gleich fliegen (Leertaste doppelt).

| Ort | Befehl |
| --- | --- |
| Start (Piazza del Duomo) | `/tp @s -228 65 0` |
| Dom mit Kuppel (von oben) | `/tp @s 0 310 0` |
| Campanile di Giotto (von oben) | `/tp @s -200 250 64` |
| Palazzo Vecchio | `/tp @s -23 270 884` |
| Loggia dei Lanzi | `/tp @s -204 120 877` |
| Uffizien | `/tp @s -304 160 1056` |
| Orsanmichele | `/tp @s -301 165 542` |

Der Befehl `/tp @s x y z` versetzt Sie an die Stelle (x = Ost-West, y = Höhe, z = Nord-Süd). Ein Block ist einen halben Meter groß. Die Koordinaten oben liegen über den Gebäuden, damit Sie hinunterschauen können; zum Boden kommen Sie durch Hinunterfliegen.

## Wenn sich das Modell ändert
- Jede Änderung am Modell schreibt die Welt neu, sobald das Programm `node tools/build.js` läuft (und die Datei `minecraft.local.json` angelegt ist).
- Dafür muss die Welt in Minecraft **verlassen** sein (Hauptmenü oder Minecraft geschlossen). Danach die Welt wieder öffnen, dann sehen Sie den neuen Stand.
- **Eigene Bauten gehen verloren:** Alles, was Sie in der Welt selbst bauen oder abreißen, wird beim nächsten Schreiben überschrieben. Ihre Spielfigur (Position, Inventar) bleibt erhalten.

## Sichtweite und Leistung
- Die Stadt ist groß (4800 mal 4160 Blöcke, das sind etwa 2,4 mal 2,1 Kilometer in Wirklichkeit). Wenn es ruckelt, in den Einstellungen unter **Video** die **Sichtweite** auf 8 bis 12 Chunks stellen und „Schöne Grafik“ ausschalten.
- Der Dom und die Paläste sind sehr detailliert; in ihrer Nähe ist der Rechner stärker gefordert.
- Die Welt hat ewigen Mittag, kein Wetter und keine Monster.

## Sicherung
Eine Kopie der Welt erhalten Sie so: Welt im Spielmenü bearbeiten (Stift-Symbol neben dem Namen), ganz unten **Welt exportieren**. Es entsteht eine Datei `.mcworld`, die Sie aufbewahren oder weitergeben können (Doppelklick öffnet sie in Minecraft). Auch dieser Stand geht beim nächsten Schreiben der Welt nicht verloren, weil es eine Kopie ist.
