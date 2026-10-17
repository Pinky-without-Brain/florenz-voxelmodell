# Bauteilkatalog – Palazzo della Crocetta (W8b)

Maße: [`REFERENZMASSE.md`](REFERENZMASSE.md). Rahmen θ 33,6° (u entlang der Via Laura, w zur Via della Colonna), Lagen `yr = Y − 68`. Bauplan `tools/wahrzeichen/palazzo.js` mit den Einstellungen in `projects/palazzo_della_crocetta/model/_cr.js`, Raumplan und Ausstattung in `_raeume.js`. Projekt `type: "wahrzeichen"`, `"begehbarkeit": "pflicht"`, 240.152 Blöcke, 7 Module, 18.194 Zellen. Der Content der Module 0..5 entsteht mit `node tools/diag/w8b_inhalt.js palazzo_della_crocetta` (Texte in `tools/diag/w8b_texte.js`), Modul 6 aus `INHALT` in `_raeume.js`.

## 1. Module und Bauteile

| Modul | Titel | Bauteile (Bau-Reihenfolge) | Inhalt, Stufe |
|---|---|---|---|
| 0 | Fundament, Boden, Cortile und Treppe | `fundament`, `boden`, `treppe` | Bruchstein bei tiefem Gelände, Boden aus Terrakotta und Marmor im Schachmuster, Wendeltreppe aus Treppenblöcken (Kern 3 × 3) im Westflügel durch alle drei Geschosse – C |
| 1 | Außenwände, Fenster, Kranzgesims | `aussenwand`, `fenster`, `kranzgesims` | helle Putzfassade (`putz_gelb`), Rustika im Erdgeschoss der Fronten, Gesimse aus Pietra serena, Fenster rechteckig im Raster 8,6 (22 Achsen plus Portalachse auf den Fronten zur Via della Colonna) – A/C; Portal Via della Colonna (9 breit, 11 hoch) mit zwei Säulen – A; Portal Via Gino Capponi (6 × 9) – C |
| 2 | Hofwände und Innenwände | `hofwaende`, `hoffenster`, `innenwaende`, `trennwaende` | Wände um den Cortile (drei Türen im Erdgeschoss), Querwände des Vorderflügels, Wände des Westflügels, Androne – C |
| 3 | Böden und Decke | `geschossboeden`, `decke`, `trennwaende_og` | Böden aus Holz und Terrakotta mit Treppenloch, oberste Decke, Trennwände der Obergeschosse – C |
| 4 | Dach | `dach` | Walmdach 3 Lagen, Dachraum `unzugaenglich` – C |
| 5 | Licht | `licht` | Seelaternen im Boden jedes Raums, Abstand ≤ 12 |
| 6 | Museumssäle, Cortile und Portal | `androne`, `salone_nicchio`, `cortile`, `museo_egizio`, `sala_chimera`, `corridoio_maddalena`, `museo_etrusco`, `galleria_idolino`, `licht_ausstattung` | siehe unten |

## 2. Ausgestaltete Innenräume
Alles vereinfacht, nicht nach Vorbild; Vitrinen sind eine Lage hohe Glasblöcke, Wandfelder bleiben im Bauteil ihrer Wand (Lehre W7c, `kitApi.ersetze`), Böden, Decken und Möbel gehören den Teilen der Räume. Lage der Räume Stufe C.
- **Androne** (Erdgeschoss Ostflügel, zwischen zwei Wänden hinter dem Portal): Schachboden, Wandfelder in Weiß und Gelb, Kassettendecke aus Pietra serena – C.
- **Salone del Nicchio** (Erdgeschoss Westflügel neben dem Eingang an der Via Gino Capponi): Cotto-Marmor-Boden, Kassettendecke mit Gold – A (Name und Nachbarschaft zum Eingang: it.wikipedia „Museo archeologico nazionale“).
- **Cortile dei Fiorentini:** Pflaster im Schachmuster mit Mittelstreifen aus Pietra serena, Statue auf Sockel – A (Hof), C (Gestaltung).
- **Ägyptische Sammlung** (Piano 1, Ostflügel, drei Säle): Vitrinenreihen aus Glas, Streitwagen aus Holz – A (Sammlung auf dem 1. Stock), C (Lage).
- **Sala della Chimera** (Piano 1, Westflügel): Chimäre (Bronzeblock-Tier auf Sockel), Arringatore (erhobener Arm), Minerva von Arezzo; Decke als bemalter Himmel für Tarchianis Fresken – A (Objekte, Fresken), C (Lage).
- **Corridoio di Maria Maddalena** (Piano 1, zwei Säle im Vorderflügel): Vitrinen für die Kameen – A (Name), C (Lage; der echte Korridor ist ein erhöhter Gang und nicht gebaut).
- **Etruskische, griechische und römische Sammlungen** (Piano 2, fünf Säle im Vorderflügel): Vitrinen, Vitrine mit Vaso François, Kouros (Apollo Milani) – A (Objekte), C (Lage).
- **Galleria dell'Idolino** (Piano 2, am westlichen Ende der Galerie): Idolino von Pesaro auf Sockel – A.
- **Portalsäulen:** zwei Säulen mit Kapitell neben dem Portal an der Via della Colonna – A (Comotto), Maße C (Teil von `aussenwand`).

## 3. Begehbarkeit und Dichtheit
Zugang über die Portale an der Via della Colonna und an der Via Gino Capponi (bis zum Boden offen, `tor`); drei Türen vom Cortile in die Flügel; Wendeltreppe mit Kopffreiheit 3 durch alle Geschosse; Trennwand-Türen 3,4 × 5; Fenster verglast; Licht ≤ 12 Blöcke; Dachraum `unzugaenglich`. R13: 87,2 % der 47.716 Raumzellen erreichbar, 0 nicht erreichbare Komponenten; R14: 0 Lücken.

## Abweichungen (nicht gebaut oder frei ergänzt)
- **Garten** (1621, Zitrushain, etruskische Gräber): liegt zwischen den Flügeln außerhalb des Umrisses, nicht gebaut.
- **Erhöhter Korridor zur Santissima Annunziata:** nicht gebaut (liegt außerhalb und ist größtenteils abgerissen).
- **Achsen:** Die Quelle nennt 24 Achsen; das Modell hat 22 Fensterachsen plus Portalachse auf den Fronten.
- **Fassade:** Material, Farbe, Rustika und Gesimse sind Entwurf (Quelle schweigt); die Fensterform ist rechteckig.
- **Treppen:** eine Wendeltreppe statt der Haupttreppen des Palastes (nicht beschrieben).
- **Topografisches Museum, Münzkabinett, Restaurierungswerkstätten, Eingang der Piazza SS. Annunziata 9:** nicht gebaut (Lage nicht belegt; die Piazza grenzt nicht an den Umriss).
- **Mezzanin-Geschoss und Dachterrasse:** nicht belegt, nicht gebaut.
