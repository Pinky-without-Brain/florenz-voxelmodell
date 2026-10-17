'use strict';
// Texte der Welle 8c (Standardmodule; die Ausstattung steht als INHALT in model/_*_ausstattung.js).
const T = (title, description, tip, caution, fact) => ({ title, description, tip, caution, fact });
const QT = '(Quelle: it.wikipedia, Torre degli Alberti)';
const QG = '(Quelle: it.wikipedia, Loggia del Grano)';

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
  ,loggia_del_grano: {
    ausstattung: '_lg_ausstattung.js',
    module: [
      { titel: 'Fundament und Boden', untertitel: 'Fundament und Boden auf Y 61', icon: '🧱', teile: ['fundament', 'boden'] },
      { titel: 'Pfeiler und Arkaden', untertitel: 'Erdgeschosshalle mit Rundbögen', icon: '🏛️', teile: ['pfeiler', 'arkadenwand'] },
      { titel: 'Obergeschosse, Fenster, Gesims', untertitel: 'Mezzanin, Obergeschoss und Gesims', icon: '🪟', teile: ['obergeschosse', 'fenster', 'gesims'] },
      { titel: 'Geschossböden und Treppen', untertitel: 'Holzböden und zwei Treppen', icon: '🪜', teile: ['geschossboeden', 'treppe'] },
      { titel: 'Dach', untertitel: 'Dachgeschoss und Satteldach', icon: '🏠', teile: ['dach', 'dachfenster'] },
      { titel: 'Licht', untertitel: 'Seelaternen im Boden aller Ebenen', icon: '💡', teile: ['licht'] },
      { titel: 'Ausstattung', untertitel: 'Wappen, Markt und Theater', icon: '🛡️', teile: ['wappen', 'tafeln', 'getreidebaenke', 'staio', 'buehne', 'sitzreihen'] }
    ],
    teile: {
      fundament: T('Fundament', 'Das Gelände liegt unter der Loggia überall bei Y 61 und wird auf Y 60 abgetragen; ein Fundament entsteht nur, wo das Gelände tiefer läge.', 'Arbeite Spalte für Spalte.', 'Hier entfällt das Fundament.', 'Giulio Parigi baute die Loggia ab 1619 im Auftrag von Cosimo II. an der Stelle eines älteren Baus des 14. Jahrhunderts ' + QG + '.'),
      boden: T('Boden', 'Auf Y 61 liegt der Boden der Halle als Schachbrett aus Pietra serena und Pflaster (drei Blöcke je Feld), unter den Mauern Pietra forte.', 'Ein Feld ist drei Blöcke groß.', 'Die Lichtfelder setzt Bautüte 5.', 'Die Loggia war ursprünglich Getreidemarkt und Lager ' + QG + '.'),
      pfeiler: T('Pfeiler', 'Die Stützen der Arkaden: vier bossierte Eckpfeiler aus rustiziertem Pietra forte und dazwischen Stützen aus Pietra serena mit Kämpfer auf Lage 5.', 'Setze zuerst die Eckpfeiler.', 'Die toskanischen Säulen sind als Pfeiler vereinfacht.', 'Die Bögen ruhen auf toskanischen Säulen, an den Ecken stehen Pfeiler mit Bossenwerk ' + QG + '.'),
      arkadenwand: T('Arkaden und Rückwand', 'Drei Rundbögen an der Stirnseite, zwei an jeder Seite (bis zum Boden offen, bis 10 Blöcke hoch), geschlossene Rückwand; darüber das Gebälk auf Lage 11.', 'Die Rückwand bleibt geschlossen.', 'Die Gitter vor den Bögen sind nicht nachgebildet.', 'Die Loggia hat drei Bögen an der Stirnseite und zwei an jeder Seite ' + QG + '.'),
      obergeschosse: T('Mezzanin und Obergeschoss', 'Mauern aus Putz und Mauerwerk: Mezzanin (Lage 12–14), Band auf Lage 15 und Obergeschoss (Lage 16–23) bis zur Decke auf Lage 24.', 'Baue Lage für Lage.', 'Die Höhen sind aus der OSM-Höhe von 30 Blöcken verteilt (Stufe C).', 'Das heutige Obergeschoss entstand erst 1868 bei der Umwandlung in ein Theater ' + QG + '.'),
      fenster: T('Fenster', 'Im Mezzanin rechteckige Fenster (2 × 2) in der Achse jedes Jochs, im Obergeschoss große Bogenfenster (5 breit, bis Lage 23), alle mit Glas durch die Mauerdicke.', 'Die Fenster ersetzen Mauerblöcke.', 'Die Rückseite hat keine Fenster, dort stehen Nachbarhäuser.', 'Das Mezzanin hat rechteckige Fenster, das Obergeschoss große Bogenfenster ' + QG + '.'),
      gesims: T('Gesims', 'Ein Kranzgesims aus Marmor (Lage 25) und Pietra serena (Lage 26) umzieht das Haus.', 'Es liegt auf der Außenlage.', 'Das Gesims ist vereinfacht.', 'Über dem Gebälk folgt das Dachgeschoss ' + QG + '.'),
      geschossboeden: T('Geschossböden', 'Holzböden in Lage 11 und 15 über der ganzen Fläche, ausgespart über den beiden Treppen.', 'Lasse die Treppenlöcher frei.', 'Das Loch hat die Länge des Laufs.', 'Das Haus hat nach OSM vier Ebenen ' + QG + '.'),
      treppe: T('Treppen', 'Zwei gerade Läufe mit Treppenblöcken (3 breit, mit Stützblock unter jeder Stufe): 11 Stufen von der Halle ins Mezzanin, 4 Stufen weiter ins Obergeschoss.', 'Beginne jeden Lauf auf dem Boden der Ebene.', 'Lage der Treppen ist Stufe C.', 'Die Treppen sind nicht überliefert; sie machen die Ebenen begehbar ' + QG + '.'),
      dach: T('Satteldach', 'Decke auf Lage 24, darüber die Dachgeschosswand und ein massives Satteldach, Traufe Lage 27, First Lage 30; ein Dachboden entsteht nicht.', 'Fülle die Fläche und lege Ziegel obenauf.', 'Die zentrale Giebelgaube der Quelle ist nicht gebaut, sie würde die OSM-Höhe überragen.', 'Das Dachgeschoss hat Ochsenaugen und ein Satteldach mit zentraler Giebelgaube ' + QG + '.'),
      dachfenster: T('Ochsenaugen', 'Je ein rundes Fenster (3 Blöcke) in den Giebelwänden der Schmalseiten, mit Glas.', 'Rund um die Mitte bei Lage 28.', 'Die Ochsenaugen der Quelle liegen an der Traufwand; hier sitzen sie in den Giebeln.', 'Das Dachgeschoss ist mit Ochsenaugen versehen ' + QG + '.'),
      licht: T('Licht', 'Seelaternen im Boden der Halle, des Mezzanins und des Obergeschosses, höchstens 12 Blöcke voneinander entfernt.', 'Die Lampen ersetzen Bodenblöcke.', 'Die Lampen sind unauffällig, aber hell.', 'Ohne Licht wären die Räume im Spiel dunkel.')
    }
  }
};
