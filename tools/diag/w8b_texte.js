'use strict';
// Texte der Standardmodule 0..5 der Wahrzeichen der Welle 8b (gelesen von tools/diag/w8b_inhalt.js).
// Quellenangaben nur dort, wo eine geprüfte Quelle die Aussage trägt; sonst Hinweis auf Stufe C.

module.exports = {
  biblioteca_nazionale: {
    kuerzel: 'bn', bodenY: 61, geschosse: [13, 12, 10], ausstattungModul: 7,
    module: {
      0: { titel: 'Fundament, Boden und Treppe', icon: '🧱', teile: ['fundament', 'boden', 'treppe'] },
      1: { titel: 'Fassaden und Portikus', icon: '🏛️', teile: ['aussenwand', 'portikus', 'fenster', 'kranzgesims'] },
      2: { titel: 'Rückwand des Portikus und Innenwände', icon: '🏛️', teile: ['loggiawand', 'trennwaende'] },
      3: { titel: 'Böden und Decke', icon: '🪵', teile: ['geschossboeden', 'decke', 'trennwaende_og'] },
      4: { titel: 'Dach', icon: '🏠', teile: ['dach'] },
      5: { titel: 'Türme mit den Statuen', icon: '🗼', teile: ['turm', 'turm_statuen'] },
      6: { titel: 'Licht', icon: '✨', teile: ['licht'] }
    },
    zusatzTeile: {
      turm: { title: 'Türme', description: 'Zwei Türme an den Ecken der Flussfront steigen über der Traufe (Y 96) bis Y 119; die Wände sind zwei Blöcke dick, mit Gesimsbändern aus Pietra forte, oben schließt eine Platte aus Pietra serena ab. Innen sind die Türme hohl und nicht zugänglich.', tip: 'Baue die Wände lagenweise, die Abschlussplatte zuletzt.', caution: 'Der Schaft ist innen hohl; die Platte schließt ihn dicht ab.' },
      turm_statuen: { title: 'Statuen von Dante und Galileo', description: 'Auf den Platten der beiden Türme stehen auf runden Sockeln aus Pietra serena zwei Marmorfiguren: der Westturm trägt Dante, der Ostturm Galileo.', tip: 'Sockel zuerst, dann der Rumpf, zuletzt der Kopf.', caution: 'Die Figuren sind Blockfiguren ohne Gesichtszüge; die Zuordnung von Dante zum Westturm ist Stufe C.' }
    },
    untertitel: { 0: 'Fundament, Boden und Treppe', 1: 'Außenwände, Portikus, Fenster und Kranzgesims', 2: 'Rückwand des Portikus und Trennwände', 3: 'Geschossböden und oberste Decke', 4: 'Walmdach', 5: 'Türme mit den Statuen von Dante und Galileo', 6: 'Beleuchtung' },
    bodenZusatz: '; unter dem Portikus liegt Pietra serena',
    hofTitel: 'Höfe', hofText: 'Es gibt keinen Hof',
    treppeOrt: 'in der Verteilerhalle',
    aussenText: 'Putz in der Farbe von Travertin mit Bändern aus Pietra forte, im Erdgeschoss der Fronten Rustika (Sockel), Gesimse aus Pietra serena; zur Flussseite ein Säulenportikus zwischen den beiden Türmen, am Westende ein Portal der Tribuna.',
    portikusText: 'Fünf Rundbögen auf Säulen aus Pietra serena öffnen den Portikus an der Piazza dei Cavalleggeri; die Bögen reichen bis zum Boden, darüber trägt ein Gesims das Obergeschoss.',
    portikusCaution: 'Die Zahl und Breite der Bögen ist Stufe C, die Quelle nennt nur den Portikus.',
    fensterText: 'Hohe Fenster im Raster von 10 Blöcken: im Erdgeschoss von Y 63 bis 71, im Piano 1 von Y 76 bis 84, im Piano 2 etwas niedriger (Y 88 bis 94).',
    loggiawandText: 'Die Rückwand schließt den Portikus nach hinten ab; zwei Türen führen in die Verteilerhalle.',
    trennText: 'Querwände trennen im Erdgeschoss die Tribuna, den Westflügel, den Mitteltrakt mit der Verteilerhalle und den Ostflügel; Längswände trennen Büros von Lesesälen und die Magazine von der Halle; jede Wand hat Türen von 3 Blöcken Breite und 5 Höhe.',
    trennOgText: 'Die Trennwände setzen sich im Piano 1 und Piano 2 fort: Lesesäle im Westflügel, Magazine im Mitteltrakt und Ostflügel; jede Wand hat Türen von 3 Blöcken Breite und 5 Höhe.',
    dachText: 'Ein flaches Walmdach aus Dachziegeln steigt von der Traufe (Y 96) bis Y 100; der Dachraum darunter ist unzugänglich.',
    fakten: {
      fundament: 'Die Bibliothek entstand ab 1911 nach dem Entwurf von Cesare Bazzani auf dem Gelände der Kaserne der Cavalleggeri und wurde am 30. Oktober 1935 eingeweiht (Quelle: it.wikipedia, Biblioteca nazionale centrale di Firenze).',
      aussenwand: 'Der Stil ist eklektisch mit Einflüssen des Liberty; die Fassade zum Fluss trägt zwei Türme (Quelle: it.wikipedia, Biblioteca nazionale centrale di Firenze).',
      portikus: 'Der Haupteingang ist ein Portikus an der Piazza dei Cavalleggeri 1 (Quelle: it.wikipedia, Biblioteca nazionale centrale di Firenze).',
      treppe: 'Eine monumentale Treppe gehört zur Innenausstattung; hier steht eine Wendeltreppe (Quelle: it.wikipedia, Biblioteca nazionale centrale di Firenze).',
      dach: 'Eine Aufstockung (Attika), ein geplanter Platz am Arno und drei von sechs geplanten Magazinen wurden nie gebaut (Quelle: it.wikipedia, Biblioteca nazionale centrale di Firenze).'
    }
  },
  palazzo_della_crocetta: {
    kuerzel: 'cr', bodenY: 68, geschosse: [12, 12, 9], ausstattungModul: 6,
    untertitel: { 0: 'Fundament, Boden, Cortile und Treppe', 1: 'Außenwände, Fenster und Kranzgesims', 2: 'Hofwände und Innenwände', 3: 'Geschossböden und oberste Decke', 4: 'Walmdach', 5: 'Beleuchtung' },
    bodenZusatz: '',
    hofTitel: 'Cortile dei Fiorentini', hofText: 'Der Cortile dei Fiorentini im Ostflügel bleibt offen',
    treppeOrt: 'im Westflügel',
    aussenText: 'glatte Putzfassaden in hellem Gelb mit Gesimsen aus Pietra serena zwischen den drei hohen Geschossen, das Erdgeschoss der Fronten mit Sockel aus Rustika; an der Via della Colonna das Portal im Ostflügel mit zwei Säulen, an der Via Gino Capponi ein zweiter Eingang.',
    fensterText: 'Rechteckige Fenster im Raster von 8,6 Blöcken, so dass auf den beiden Fronten zur Via della Colonna 22 Fensterachsen und die Portalachse entstehen (die Quelle nennt 24 Achsen): im Erdgeschoss und im ersten Obergeschoss von Y 70 bis 77 bzw. Y 82 bis 89, im obersten Geschoss kleiner (Y 94 bis 99).',
    hofwaendeText: 'Die Wände um den Cortile dei Fiorentini steigen bis Y 101, verputzt, mit Gesimsen auf Höhe der Geschossböden; drei Türen im Erdgeschoss führen vom Hof in die Gebäude.',
    trennText: 'Trennwände teilen im Erdgeschoss den Vorderflügel in Säle, den Westflügel in drei Räume und fassen die Androne im Ostflügel ein; jede Wand hat Türen von 3 Blöcken Breite und 5 Höhe.',
    trennOgText: 'Die Trennwände setzen sich in den beiden Obergeschossen fort: Säle der Ägyptischen Sammlung im Ostflügel, die Sala della Chimera im Westflügel und die Säle der etruskischen, griechischen und römischen Sammlung im Vorderflügel; jede Wand hat Türen von 3 Blöcken Breite und 5 Höhe.',
    dachText: 'Ein flaches Walmdach aus Dachziegeln steigt von der Traufe (Y 101) bis Y 105; der Dachraum darunter ist unzugänglich.',
    fakten: {
      fundament: 'Der Palast wurde ab 1619 nach einem Entwurf von Giulio Parigi für Maria Maddalena de\' Medici gebaut, die Bauzeit wird mit 1619 bis 1651 angegeben (Quelle: it.wikipedia, Palazzo della Crocetta).',
      aussenwand: 'Die Front an der Via della Colonna hat 24 Achsen über drei hohen Geschossen; Paolo Comotto fügte 1865 bis 1871 zwei Säulen am Haupteingang hinzu (Quelle: it.wikipedia, Palazzo della Crocetta).',
      fenster: 'Der Grundriss ist U-förmig und bezieht einige Häuser an der Via della Pergola ein; der Garten liegt zwischen den Flügeln und gehört nicht zum Umriss (Quelle: it.wikipedia, Palazzo della Crocetta).',
      hofwaende: 'Der Hof „Cortile dei Fiorentini“ ist in OpenStreetMap als eigene Teilfläche erfasst; seine Gestaltung ist Stufe C.',
      geschossboeden: 'Das zweite Obergeschoss wurde dem Museum 1925 hinzugefügt (Quelle: it.wikipedia, Palazzo della Crocetta).',
      dach: 'Emilio De Fabris restaurierte den Palast um 1883 bis 1884, Bruno Pacciani leitete 1984 bis 1988 eine große Restaurierung (Quelle: it.wikipedia, Palazzo della Crocetta).'
    }
  }
};
