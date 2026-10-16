'use strict';
// Texte der Standardmodule 0..5 der Wahrzeichen der Welle 7b (gelesen von tools/diag/w7b_inhalt.js).
// Quellenangaben nur dort, wo eine geprüfte Quelle die Aussage trägt; sonst Hinweis auf Stufe C.

module.exports = {
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
