'use strict';
// Angaben für tools/diag/w8a_inhalt.js (Module 0..5 der Palazzi der Welle 8a). Fakten stammen aus den im Katalog genannten Quellen.
const T = (title, description, tip, caution, fact) => ({ title, description, tip, caution, fact });
module.exports = {
  palazzo_guadagni: {
    bodenY: 61, traufe: 30, quelle: 'it.wikipedia, Palazzo Guadagni', loggiaBoden: false,
    ohne: ['hof', 'hofarkaden', 'hofwaende', 'hoffenster', 'innenwaende', 'innenwaende_og'],
    hofText: '',
    modul2: { title: 'Trennwände', subtitle: 'Bautüte 2: Trennwände des Erdgeschosses', icon: '🧱' },
    modul0: { title: 'Fundament, Boden und Treppe', subtitle: 'Bautüte 0: Fundament, Boden auf Y 61 und Wendeltreppe' },
    fassadeTitel: 'Außenwände mit Eckbugnen, Rundbogenfenster, Kranzgesims',
    aussenText: 'Die Außenwände sind zwei Blöcke dick: im Erdgeschoss glatte Pietra forte mit kräftigen Eckpilastern aus Rustika (Bugnato), im ersten und zweiten Obergeschoss Bugnen aus Pietra forte (jede vierte Lage glatt), im obersten Geschoss glatte Pietra forte; innen Putz.',
    aussenTip: 'Die Eckpilaster sind in den ersten vier Blöcken beider Fassadenenden Rustika.',
    fensterText: 'Rundbogenfenster mit Glas im Raster 10 in fünf Achsen (das Portal liegt in der mittleren), im Erdgeschoss klein, in den beiden Obergeschossen höher; das oberste Geschoss ist die offene Loggia (Rechtecköffnungen, Brüstung zwei Blöcke hoch, Joch 5).',
    kranzText: 'Das Kranzgesims aus Pietra serena schließt die Fassade bei Y 91 ab; darüber das Walmdach.',
    arkadenText: '', trennText: 'Trennwände teilen den Palast im Erdgeschoss in Westraum, Torweg und Ostraum an der Piazza, dahinter Treppenhaus, Hofhalle und Ostraum und den Flügel; jede Wand hat eine Tür von 3 Blöcken Breite und 5 Höhe.',
    dachTitel: 'Walmdach', dachTeilTitel: 'Walmdach', dachText: 'Ein Walmdach aus Dachziegeln deckt das Haus bis zu drei Lagen über der Traufe; darunter liegt der Dachraum.',
    fakt: {
      fundament: 'Der Palast entstand etwa 1502–1506 für den Seidenhändler Rinieri di Bernardo Dei; als Architekt wird Cronaca oder Baccio d\'Agnolo angenommen',
      boden: 'Das Portal zur Piazza ist rundbogig und von Bugnen und quadratischen Fenstern gerahmt',
      treppe: 'Die Treppe auf der linken Seite besteht aus Pietra serena und gilt als ursprünglich',
      aussenwand: 'Das Erdgeschoss ist glatte Pietra forte mit kräftigen Eckpilastern in Bugnato',
      fenster: 'Im ersten und zweiten Obergeschoss öffnen sich Rundbogenfenster mit erhabenen und flachen Bugnen',
      kranzgesims: 'Unter der weit vorspringenden Traufe liegt die Dachloggia',
      geschossboeden: 'Der Palast hat vier Geschosse',
      decke: 'Das oberste Geschoss ist eine große Loggia mit architravierten Säulen',
      dach: 'Die Loggia liegt unter einer weit vorspringenden Traufe; das Vordach ist hier nicht ausgeformt'
    }
  },
  palazzo_lenzi: {
    bodenY: 55, traufe: 30, quelle: 'it.wikipedia, Palazzo Lenzi', loggiaBoden: false,
    ohne: ['hof', 'hofarkaden', 'hofwaende', 'hoffenster', 'innenwaende', 'innenwaende_og'],
    hofText: '',
    modul2: { title: 'Trennwände', subtitle: 'Bautüte 2: Trennwände des Erdgeschosses', icon: '🧱' },
    modul0: { title: 'Fundament, Boden und Treppe', subtitle: 'Bautüte 0: Fundament, Boden auf Y 55 und Wendeltreppe' },
    fassadeTitel: 'Außenwände mit Graffito-Fassade, Portale, Rundbogenfenster',
    aussenText: 'Die Außenwände sind zwei Blöcke dick und verputzt: Die Piazza-Fassade trägt in den Obergeschossen Graffito aus hellem und dunklem Putz (Bänder an den Geschossgrenzen, gemalte Säulchen zwischen den Fensterachsen), die übrigen Seiten und das Erdgeschoss sind schlichter Putz; fünf Portale öffnen sich zur Piazza, ein sechstes zum Borgo Ognissanti.',
    aussenTip: 'Die Bänder liegen in der untersten und obersten Lage jedes Geschosses, die Säulchen alle 13,7 Blöcke.',
    fensterText: 'Einfache Rundbogenfenster mit Glas in zwei Reihen (erstes und zweites Obergeschoss), Raster 13,7 in fünf Achsen über den fünf Portalen.',
    kranzText: 'Das Kranzgesims aus Pietra serena schließt die Fassade bei Y 85 ab; darüber das Walmdach.',
    arkadenText: '', trennText: 'Trennwände teilen den Palast im Erdgeschoss in fünf Vorderräume hinter den Portalen, den Ausstellungssaal, den Raum daneben und den Flügel zur Via Montebello; jede Wand hat eine Tür von 3 Blöcken Breite und 5 Höhe.',
    dachTitel: 'Walmdach', dachTeilTitel: 'Walmdach', dachText: 'Ein Walmdach aus Dachziegeln deckt das Haus bis zu drei Lagen über der Traufe; darunter liegt der Dachraum.',
    fakt: {
      fundament: 'Der Baubeginn ist nicht bekannt und wird ungefähr um 1470 angesetzt; die Infobox nennt das 15. Jahrhundert',
      boden: 'Von den fünf großen Portalen zur Piazza ist im Erdgeschoss nur das zentrale ursprünglich',
      treppe: 'Der Palast hat drei Stockwerke; die Lage der Treppen nennt die Quelle nicht',
      aussenwand: 'Die Graffiti ersetzen Gesimse, Marcapiano und gemalte Säulchen; die heutigen stammen wahrscheinlich aus dem 19. Jahrhundert und folgen vermutlich alten Vorlagen',
      fenster: 'Die Obergeschosse haben zwei Fensterreihen mit einfachen Rundbogenfenstern',
      kranzgesims: 'Im obersten Geschoss sitzt eine Loggetta, die vermutlich auf alte Ansichten zurückgeht',
      geschossboeden: 'Im ersten Stock gibt es ein Theater',
      decke: 'Der Palast hat drei Stockwerke',
      dach: 'Die Fassade wurde 1950 und 1965 restauriert'
    }
  }
};
