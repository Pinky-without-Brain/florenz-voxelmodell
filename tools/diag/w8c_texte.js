'use strict';
// Texte der Welle 8c (Standardmodule; die Ausstattung steht als INHALT in model/_*_ausstattung.js).
const T = (title, description, tip, caution, fact) => ({ title, description, tip, caution, fact });
const QT = '(Quelle: it.wikipedia, Torre degli Alberti)';

module.exports = {
  torre_alberti: {
    ausstattung: '_ta_ausstattung.js',
    module: [
      { titel: 'Fundament und Boden', untertitel: 'Fundament und Boden auf Y 61', icon: '🧱', teile: ['fundament', 'boden'] },
      { titel: 'Mauern, Fenster, Loggetta', untertitel: 'Mauern aus Pietra forte, Fenster und Eckloggetta', icon: '🏰', teile: ['aussenwand', 'fenster', 'loggetta'] },
      { titel: 'Geschossböden und Treppen', untertitel: 'Fünf Geschosse mit Holzböden und Treppen', icon: '🪜', teile: ['geschossboeden', 'treppe'] },
      { titel: 'Terrasse und Zinnen', untertitel: 'Terrasse mit Brüstung und Zinnen', icon: '🏯', teile: ['terrasse', 'zinnen'] },
      { titel: 'Licht', untertitel: 'Seelaternen im Boden aller Geschosse', icon: '💡', teile: ['licht'] },
      { titel: 'Ausstattung', untertitel: 'Café, Kapitelle und zugemauerte Tür', icon: '🪑', teile: ['cafe_tresen', 'cafe_tische', 'colonnine', 'kapitelle', 'porta_murata'] }
    ],
    teile: {
      fundament: T('Fundament', 'Wo das Gelände unter dem Turm tiefer liegt als Y 60, füllst du mit Bruchstein bis Y 60 auf.', 'Arbeite Spalte für Spalte.', 'Das Gelände unter dem Turm liegt überall bei Y 61 und wird auf Y 60 abgetragen; es entsteht meist kein Fundament.', 'Der Turm steht nahe dem Verlauf der zweiten Stadtmauer von 1172 bis 1175 ' + QT + '.'),
      boden: T('Boden', 'Auf Y 61 liegt der Boden des Erdgeschosses: unter den Mauern Pietra forte, im Raum ein Schachbrett aus Pietra serena und Pflaster (zwei Blöcke je Feld).', 'Ein Feld ist zwei Blöcke groß.', 'Die Lichtfelder setzt Bautüte 4.', 'Der Turm wurde am Ende des 13. Jahrhunderts von Alberto, Lapo und Neri degli Alberti gebaut ' + QT + '.'),
      aussenwand: T('Mauern', 'Drei Blöcke dicke Mauern: außen Pietra forte mit eingestreuten Bruchsteinen, innen Mauerwerk und weißer Putz. Der Turm ist 37 Blöcke hoch (OSM) und fünf Geschosse zu je sieben Lagen. In der Südmauer liegt die Tür (4 × 5, offen).', 'Baue Lage für Lage rund um den Grundriss.', 'Die Höhe 37 und die Geschosseinteilung stammen aus den OSM-Angaben, die Mauerdicke ist Stufe C.', 'Das Mauerwerk liegt offen, weil der Putz bei der Wiederherstellung 1938 entfernt wurde ' + QT + '.'),
      fenster: T('Fenster', 'Je Geschoss kleine Fenster (2 breit, 3 hoch) mit Glas in allen Mauerlagen, im Abstand von 7,5 Blöcken entlang der Kanten.', 'Die Fenster ersetzen Mauerblöcke.', 'Zahl und Lage sind Stufe C.', 'Die Fassaden zeigen nur kleine Fenster und die zugemauerten Umrisse älterer Einzelfenster ' + QT + '.'),
      loggetta: T('Eckloggetta', 'Im obersten Geschoss öffnen sich beide Mauern an der östlichen Ecke in Rundbögen (Joch fünf Blöcke, Bogen vier breit) mit Pfeilern aus Pietra serena und einer Marmorbrüstung.', 'Die Bögen sind bis zur Brüstung offen.', 'Welche Ecke die Loggetta trägt, ist Stufe C; die Bogenform ist vereinfacht.', 'Die Loggetta stammt vom Anfang des 15. Jahrhunderts ' + QT + '.'),
      geschossboeden: T('Geschossböden', 'In Lage 7, 14, 21 und 28 liegt je ein Holzboden über dem ganzen Innenraum, ausgespart nur über den Treppen.', 'Lasse die Zellen über der Treppe frei.', 'Das Treppenloch ist vier Blöcke breit und so lang wie der Lauf.', 'Der Turm hat nach OSM fünf Geschosse ' + QT + '.'),
      treppe: T('Treppen', 'Fünf gerade Läufe aus je 14 Treppenblöcken (zwei breit, sieben Stufen), im Wechsel an der Westseite und an der Ostseite des Raums, mit je einem Stützblock unter jeder Stufe. Der letzte Lauf führt auf die Terrasse.', 'Beginne jeden Lauf auf dem Boden des Geschosses.', 'Lage und Zahl der Läufe sind Stufe C.', 'Die Treppen sind nicht überliefert; sie machen den Turm begehbar ' + QT + '.'),
      terrasse: T('Terrasse', 'Auf Lage 35 liegt die Terrasse aus Pflaster, begehbar über die oberste Treppe; die Randzellen sind Pietra serena.', 'Die Terrasse ist unüberdeckt.', 'Die Terrasse ist nach der Quelle ein Zusatz des 19. Jahrhunderts, im Modell steht sie auf der Turmhöhe der OSM.', 'Das Terrässchen im oberen Teil ist eine Hinzufügung des 19. Jahrhunderts ' + QT + '.'),
      zinnen: T('Brüstung und Zinnen', 'Eine zwei Blöcke dicke Brüstung (zwei Lagen hoch) umschließt die Terrasse, außen mit Zinnenzähnen auf Lage 37.', 'Setze die Zähne im Abstand von zwei Blöcken.', 'Der Turm ist laut Quelle gekappt; die Zinnen sind eine Zutat des Modells (Stufe C).', 'Der Turm zeigt deutliche Spuren der Kappung ' + QT + '.'),
      licht: T('Licht', 'Seelaternen im Boden jedes Geschosses, so verteilt, dass jede Stelle höchstens 12 Blöcke von einer Lampe entfernt ist.', 'Die Lampen ersetzen Bodenblöcke.', 'Die Lampen sind unauffällig, aber hell.', 'Ein Turm ohne Licht wäre im Spiel dunkel.')
    }
  }
};
