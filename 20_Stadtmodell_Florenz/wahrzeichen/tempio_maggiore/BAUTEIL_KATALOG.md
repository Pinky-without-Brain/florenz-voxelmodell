# Bauteilkatalog – Tempio Maggiore Israelitico (W8b)

Maße: [`REFERENZMASSE.md`](REFERENZMASSE.md). Rahmen θ 32° (u nach Ostsüdost, w nach rechts), Lagen `yr = Y − 66`. Bauplan `projects/tempio_maggiore/model/_tm.js` (Spaltenmodell: je Maskenzelle eine Spalte aus Luft, Hohlraum und Festem), `_tm_plan.js` (Module, Türme, Licht), `_tm_ausstattung.js`. Projekt `type: "wahrzeichen"`, `"begehbarkeit": "pflicht"`, 97.749 Blöcke, 7 Module, 6.224 Zellen.

## 1. Räume (aus den OSM-Teilen)
Jede Zelle gehört einem Raum: `vorhalle` (u < 10), `halle_w` (Westarm), `halle_c` (Mittelquadrat mit Kuppel), `nord`, `sued`, `chor` (Ostarm und Apsis), `annex` (Nebenräume in den Ecken), zwei Ecktürme. Wandzelle = zwei Zellen vom Außenrand oder eine Zelle von der Grenze zu einem anderen Raum; Türen, Bögen und Fenster sind Rechtecke bzw. Bogenfunktionen im Rahmen.

## 2. Module und Bauteile

| Modul | Titel | Bauteile (Bau-Reihenfolge) | Inhalt, Stufe |
|---|---|---|---|
| 0 | Fundament und Boden | `fundament`, `boden` | Bruchstein bei tiefem Gelände; Marmorschachbrett 3 × 3, Stern aus schwarzem und gelbem Marmor unter der Kuppel – A (Stern) / C |
| 1 | Außenwände, Fassade und Ecktürme | `aussenwaende`, `fassade`, `mauerkern`, `fenster`, `campanile_schaft`, `campanile_treppe`, `glockenstube`, `campanile_spitze`, `turm_empore` | Streifen aus `putz_sand` (Travertin) und `putz_rosa` (Pomato) alle 2 Lagen – A/C; Fassade mit drei Hufeisenportalen (Keilsteine im Wechsel) und Ajimez-Paaren – A; zwei Türme mit Wendeltreppe 5 × 5, offener Laterne und grüner Kuppel mit Goldspitze – A/C; Holzboden Lage 12 im Turm als Zugang zur Empore |
| 2 | Wandmalerei und Emporen | `wandmalerei`, `empore` | Arabesken in `fresko` rot/blau mit Gold – A (Muster C); Frauenempore auf Arkaden (Boden Lage 12, Pfeiler alle 6 Blöcke, Brüstung 2 hoch) – A (Maße C) |
| 3 | Gewölbe, Pendentifs und Dächer | `gewoelbe`, `pendentifs`, `deckenmalerei`, `daecher` | flache Decken und massive Füllung bis zur Dachhaut, Pendentifs als Kugelflächen, blaue Sterndecken, Terrakotta-Dach – C |
| 4 | Tambour und Kupferkuppel | `tambour`, `tambour_fenster`, `kuppelschale`, `kuppel_fresko`, `kuppel_aussen`, `laterne` | Tambour Lage 42..53 mit 16 Buntglasfenstern; Innenschale Halbkugel (Scheitel Lage 68 = 34 m); Außenschale als spitzer Halbellipsoid aus `marmor_gruen` (Scheitel 85, Spitze 94 = 47 m); Hohlraum dazwischen `unzugaenglich` – A (Höhen) / C (Profil) |
| 5 | Licht | `licht`, `campanile_licht` | Seelaternen im Boden (Erdgeschoss und Empore), Abstand ≤ 12 – Spielregel |
| 6 | Ausstattung | `gitter`, `aron`, `bima`, `ner_tamid`, `baenke`, `oratorium`, `leuchter` | siehe unten |

**Palette.** Es gibt keinen Typ „oxidiertes Kupfer“. Für die grüne Kupferhaut dient `dark_prismarine` (Rolle `marmor_gruen`), für den Travertin `end_stone_bricks` (`putz_sand`), für den rosa Pomato `pink_terracotta` (`putz_rosa`). Die Palette bleibt unverändert.

## 3. Ausgestaltete Innenräume
Alles vereinfacht in vollen Blöcken, Möbel höchstens einen Block hoch; Mosaike sind Farbfelder in der Wandlage (Typwechsel, das Bauteil `wandmalerei` bleibt).
- **Aron ha-Kodesh** (Apsis, Ostende): Mosaikfeld 7 × 11 in Goldrahmen mit blauen, roten, weißen und goldenen Feldern, zwei weiße Säulen, Sturz aus Ornamentmarmor, darüber die Gesetzestafeln (Gold, 3 hoch) – A (it.wikipedia), Maße C. Es sind **keine Inschriften und keine Beschädigungen** der Türen dargestellt.
- **Ewiges Licht:** ein Goldblock und eine Seelaterne unter dem Sturz – A.
- **Bima:** Plattform aus Holz (1 hoch) mit Treppenblöcken an der Westkante und einem Pult; **Gitter** (2 hoch, 4 Blöcke Durchgang) zwischen Bima und Hauptraum – A (Lage der Bima in der Apsis: Jewish Heritage Europe), Maße C.
- **Bankreihen** im Westarm, mittlerer Gang 8 Blöcke – C (Anordnung nicht belegt).
- **Oratorium Margulies** im Südarm („rechtes Seitenschiff“): zwei Toraschreine (Farbfelder) an der Südwand, Plattformen, zwei Bankreihen – A (Existenz), C (Lage und Maße).
- **Leuchter** auf der Emporenbrüstung: Goldblöcke je zweite Arkade (vereinfacht für die siebenarmigen Kandelaber) – A/C.
- **Stern im Boden, Deckensterne, Kuppelmalerei:** frei entworfen im Stil der Quelle – C.

## 4. Begehbarkeit und Dichtheit
Zugang über die drei Portale (7 breit, bis zum Boden offen, Deklaration `tor`); Hufeisentüren zwischen Vorhalle und Hauptraum; große Bögen zu Chor, Nord- und Südarm; Empore über Wendeltreppen in beiden Ecktürmen (Tür vom Vorraum am Boden, Tür auf Lage 13..16 zur Empore); Türen zu den vier Nebenräumen. Licht ≤ 12 Blöcke; alle Fenster verglast; Dächer massiv, Hohlraum der Doppelkuppel und Turmhauben `unzugaenglich`. R13: 85,2 % der 7.055 Raumzellen erreichbar, 0 nicht erreichbare Komponenten; R14: 0 Lücken.

## Abweichungen (nicht gebaut oder frei ergänzt)
- **Grüne Kupferhaut:** `dark_prismarine` ist der nächstliegende Typ der Palette (bläulich-dunkelgrün), kein echtes Patinagrün.
- **Garten, Eisentor von Pasquale Franci, Schule und Gedenktafel mit 248 Namen:** liegen außerhalb des Umrisses, nicht gebaut.
- **Inschriften, Davidstern-Ornamente, Beschädigungen der Aron-Türen (Bajonettspuren):** nicht gebaut (keine Erfindung ohne Beleg; respektvolle Darstellung nur der belegten Einrichtung).
- **Matronei:** als gerade Empore auf drei Seiten mit Brüstung (nicht auf zwei Geschossen mit Biforien); Gitterform und Kandelaber vereinfacht.
- **Zwiebelkuppeln der Türme:** als gestufte Kuppeln der Bibliothek `campanile.js` gebaut, nicht mit Zwiebelprofil.
- **Hufeisen der Bögen:** nur die Portale und Türen sind Hufeisenbögen; die großen Innenbögen sind Rundbögen.
- **Raumaufteilung der Nebenräume und der Türme:** nicht belegt, Entwurf C.
- **Mosaiken außer am Aron:** nicht gebaut; Wandflächen tragen das vereinfachte Arabeskenmuster.
