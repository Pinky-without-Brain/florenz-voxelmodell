'use strict';
// Texte der Standardmodule 0..5 der Wahrzeichen der Welle 7b (gelesen von tools/diag/w7b_inhalt.js).
// Quellenangaben nur dort, wo eine geprüfte Quelle die Aussage trägt; sonst Hinweis auf Stufe C.

module.exports = {
  sant_apollonia: {
    kuerzel: 'sa', bodenY: 66, geschosse: [18, 12], ausstattungModul: 6,
    untertitel: { 0: 'Fundament, Boden, Kreuzgänge und Treppe', 1: 'Außenwände, Fenster und Kranzgesims', 2: 'Kreuzgangarkaden, Hofwände und Innenwände', 3: 'Geschossböden und oberste Decke', 4: 'Walmdach', 5: 'Beleuchtung' },
    bodenZusatz: '; unter den Arkaden der Kreuzgänge liegt Pietra serena',
    hofTitel: 'Kreuzgänge', hofText: 'Die vier Kreuzgänge bleiben offen, drei mit Rasen und der große Chiostro della Badessa gepflastert',
    treppeOrt: 'im hinteren Flügel des Vorderblocks',
    aussenText: 'schlichte weiße Putzfassaden mit Sockel aus Bruchstein und ockerfarbenen Bändern, zur Via XXVII Aprile das Portal des Museums, an der Via San Gallo das Kirchenportal und an der Via Santa Reparata der Eingang der Mensa.',
    fensterText: 'Im Erdgeschoss sitzen hohe Fenster (Y 72 bis 80), im Obergeschoss etwas niedrigere (Y 87 bis 93); sie folgen einem festen Raster von 9 Blöcken entlang jeder Wand. Die Fensterreihe an der Straße gehört zum Refektorium.',
    hofarkadenText: 'Im Erdgeschoss umgeben Rundbögen auf Säulen aus Pietra serena die vier Kreuzgänge; dahinter liegt ein Umgang.',
    hofwaendeText: 'Über den Arkaden steigen die Hofwände bis Y 96, verputzt, mit Gesimsen auf Höhe der Geschossböden.',
    innenwaendeText: 'Zwischen Umgang und Räumen steht eine Innenwand mit Türen im Abstand von 14 Blöcken.',
    trennText: 'Trennwände bilden das Refektorium mit dem Abendmahl, die Kirche mit der Sakristei und Räume im Vorder- und Hinterblock; jede Wand hat Türen von 3 Blöcken Breite und 5 Höhe.',
    trennOgText: 'Im Obergeschoss setzen sich die Wände fort: Räume über dem Refektorium und der Kirche; jede Wand hat Türen von 3 Blöcken Breite und 5 Höhe.',
    dachText: 'Ein Walmdach aus Dachziegeln steigt von der Traufe (Y 96) bis Y 101; der Dachraum darunter ist unzugänglich.',
    fakten: {
      fundament: 'Das Kloster der Camaldulenserinnen wurde 1339 von Piero di Ser Mino gegründet (Quelle: it.wikipedia, Complesso di Sant\'Apollonia).',
      aussenwand: 'Ein Teil des Klosters wurde abgerissen, um die Via XXVII Aprile zu öffnen; 1863 wurde es militärisch genutzt, 1866 kam es in Staatsbesitz (Quelle: it.wikipedia, Complesso di Sant\'Apollonia).',
      hofarkaden: 'Der Kreuzgang der Äbtissin wurde 1442 begonnen; zwei kleinere Kreuzgänge heißen del Silenzio und del Noviziato (Quelle: it.wikipedia, Complesso di Sant\'Apollonia).',
      treppe: 'Die Treppe ist eine Annahme, die Quelle beschreibt keine Treppen (Stufe C).',
      dach: 'Das Kloster wurde 1808 aufgehoben, 1824 wiederhergestellt und steht seit 1901 auf der Liste der nationalen Kunstdenkmäler (Quelle: it.wikipedia, Complesso di Sant\'Apollonia).'
    }
  },
  palazzo_nonfinito: {
    kuerzel: 'nf', bodenY: 66, geschosse: [10, 13], ausstattungModul: 6,
    untertitel: { 0: 'Fundament, Boden, Hof und Treppe', 1: 'Außenwände, Kniefenster und Kranzgesims', 2: 'Hofarkaden, Hofwände und Innenwände', 3: 'Geschossböden und oberste Decke', 4: 'Walmdach', 5: 'Beleuchtung' },
    bodenZusatz: '; unter den Hofarkaden liegt Pietra serena',
    hofTitel: 'Höfe', hofText: 'Der Hof Cigolis und der kleine Lichthof im Süden bleiben offen',
    treppeOrt: 'im Treppenhaus rechts vom Atrium',
    aussenText: 'zur Via del Proconsolo und zum Borgo degli Albizi das Erdgeschoss mit glatter Rustika und Kniefenstern in Rahmen aus Pietra serena, darüber im Piano nobile verputzte Wände mit Pilastern aus Pietra serena zwischen den Fenstern; die Eckpilaster sind aus Pietra serena. Zwei Portale führen hinein.',
    fensterText: 'Im Erdgeschoss sitzen die Kniefenster, tief angesetzt (Y 68 bis 75), im Piano nobile hohe Fenster (Y 80 bis 87); an der Via del Proconsolo links und rechts des Portals je drei, am Borgo degli Albizi je zwei.',
    hofarkadenText: 'Im Erdgeschoss umgeben Rundbögen auf Säulen aus Pietra serena den Hof Cigolis; dahinter liegt ein Umgang.',
    hofwaendeText: 'Über den Arkaden steigen die Hofwände bis Y 89, verputzt, mit Gesimsen auf Höhe der Geschossböden.',
    innenwaendeText: 'Zwischen Umgang und Räumen steht im Erdgeschoss eine Innenwand mit Türen im Abstand von 14 Blöcken.',
    trennText: 'Trennwände bilden im Erdgeschoss das Atrium mit je zwei Räumen daneben und im Westflügel ein Vestibül; jede Wand hat Türen von 3 Blöcken Breite und 5 Höhe.',
    trennOgText: 'Im Piano nobile teilen Trennwände den Nordflügel in fünf Säle; jede Wand hat Türen von 3 Blöcken Breite und 5 Höhe.',
    dachText: 'Ein flaches Walmdach aus Dachziegeln steigt von der Traufe (Y 89) bis Y 93; der Dachraum darunter ist unzugänglich.',
    fakten: {
      aussenwand: 'Buontalenti begann im Juli 1593 mit dem Erdgeschoss, dem Portal am Borgo degli Albizi und den Kniefenstern auf großen Konsolen (Quelle: it.wikipedia, Palazzo Nonfinito).',
      fenster: 'Die Kniefenster tragen Gitter und Giebel, teils dreieckig, teils gebrochen und eingerollt (Quelle: it.wikipedia, Palazzo Nonfinito).',
      kranzgesims: 'Scamozzi und Caccini führten den Bau von 1600 bis 1612 weiter, ihnen werden das hohe Portal an der Via del Proconsolo und das Piano nobile mit ionischen Pilastern in Kolossalordnung zugeschrieben (Quelle: it.wikipedia, Palazzo Nonfinito).',
      hofarkaden: 'Der Hof hat Serlianen nach venezianischem Vorbild auf toskanischen Säulen; zwei Seiten stammen von Cigoli um 1604 (Quelle: it.wikipedia, Palazzo Nonfinito).',
      dach: 'Der Palast blieb unvollendet; Buontalentis und Scamozzis Entwurf sahen zwei weitere Geschosse vor (Quelle: it.wikipedia, Palazzo Nonfinito).'
    }
  },
  loggia_dei_servi: {
    kuerzel: 'ls', bodenY: 69, geschosse: [12, 11], ausstattungModul: 6,
    untertitel: { 0: 'Fundament, Boden und Treppe', 1: 'Außenwände, Portikus, Fenster und Kranzgesims', 2: 'Rückwand der Loggia, Höfe und Innenwände', 3: 'Geschossböden und oberste Decke', 4: 'Walmdach', 5: 'Beleuchtung' },
    hofText: 'Die sechs kleinen Lichthöfe im Hinterhaus bleiben nach oben offen',
    treppeOrt: 'in der Empfangshalle des Hinterhauses',
    aussenText: 'zur Piazza Santissima Annunziata die Loggia aus neun Rundbögen auf Säulen aus Pietra serena mit Wand und Fenstern darüber, an den anderen Seiten Putz mit Bruchsteinbändern.',
    portikusText: 'Neun Rundbögen auf Säulen aus Pietra serena öffnen die Loggia zur Piazza; die Bögen reichen bis zum Boden, darüber trägt ein Gesims das Obergeschoss.',
    portikusCaution: 'Die Zahl der Bögen ist Stufe C, die Quelle nennt keine Gesamtzahl.',
    fensterText: 'Im Obergeschoss sitzt über jedem Bogen ein hohes Fenster; an den übrigen Wänden folgen Fenster demselben Raster.',
    hofwaendeText: 'Die Wände um die sechs Lichthöfe steigen bis zum Dach, verputzt, mit Türen im Erdgeschoss.',
    loggiawandText: 'Die Rückwand der Loggia schließt den Portikus nach hinten ab; in der Achse jedes zweiten Bogens führt eine Tür in die Vorderzimmer.',
    trennText: 'Trennwände teilen das Erdgeschoss in Vorderzimmer an der Loggia, einen Flur, Hinterzimmer, die Empfangshalle und das Oratorium; jede Wand hat Türen von 3 Blöcken Breite und 5 Höhe.',
    trennOgText: 'Im Obergeschoss setzen sich die Wände fort: Zimmer über der Loggia und im Hinterhaus; jede Wand hat Türen von 3 Blöcken Breite und 5 Höhe.',
    dachText: 'Ein Walmdach aus Dachziegeln steigt von der Traufe (Y 92) bis Y 97; der Dachraum darunter ist unzugänglich.',
    fakten: {
      aussenwand: 'Der Loggiato entstand 1516 bis 1525 nach Antonio da Sangallo dem Älteren und Baccio d\'Agnolo, Baccio war nur bis 1519 auf der Baustelle (Quelle: it.wikipedia, Loggiato dei Servi di Maria).',
      portikus: 'Der Portikus soll die Piazza vereinheitlichen und sich am gegenüberliegenden Spedale degli Innocenti Brunelleschis orientieren (Quelle: it.wikipedia, Loggiato dei Servi di Maria).',
      fenster: 'Das Obergeschoss war bis 1574 fertig, die gesamte Anlage erst 1720 (Quelle: it.wikipedia, Loggiato dei Servi di Maria).',
      loggiawand: 'Unter der Loggia hängt eine Tafel von 1613, die Spiele, Abfälle und Versammlungen verbietet (Quelle: it.wikipedia, Loggiato dei Servi di Maria).',
      hofwaende: 'Die Häuser sind um einen zentralen Hof angeordnet; im Umriss in OpenStreetMap sind sechs kleine Höfe eingetragen (Quelle: it.wikipedia, Loggiato dei Servi di Maria; OpenStreetMap).',
      dach: 'Das Gebäude steht seit 1901 auf der Liste der nationalen Kunstdenkmäler (Quelle: it.wikipedia, Loggiato dei Servi di Maria).'
    }
  }
};
