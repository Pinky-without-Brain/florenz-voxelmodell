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
  },
  palazzo_mozzi: {
    bodenY: 66, traufe: 30, quelle: 'it.wikipedia, Palazzo dei Mozzi', loggiaBoden: false,
    ohne: ['hofarkaden', 'innenwaende', 'innenwaende_og'],
    hofText: 'Der Hof (21 × 20 Blöcke) bleibt offen; sein Boden aus Pflaster, Marmor und Pietra serena liegt auf Y 66. Vier Türen aus dem Erdgeschoss führen hinein.',
    hofwaendeText: 'Die Hofwände steigen von Y 66 bis Y 96, verputzt, mit Gesimsen auf Höhe der Geschossböden und Fenstern in den Obergeschossen; im Erdgeschoss öffnen vier Türen den Hof.',
    modul2: { title: 'Hofwände und Trennwände', subtitle: 'Bautüte 2: Hofwände, Hoffenster und Trennwände des Erdgeschosses', icon: '🧱' },
    fassadeTitel: 'Außenwände aus kleinen behauenen Quadern, sieben Fornici, Rundbogenfenster',
    aussenText: 'Die Außenwände sind zwei Blöcke dick: Im Erdgeschoss Rustika (kleine behauene Quader, bozze squadrate) aus Pietra forte, in den Obergeschossen Bruchstein mit glatten Lagen (jede vierte Lage Pietra forte); innen Putz. Im Erdgeschoss öffnen sich sieben Rundbogenportale (Fornici) zur Piazza dei Mozzi.',
    aussenTip: 'Jede vierte Lage ist glatte Pietra forte, dazwischen Rustika oder Bruchstein.',
    fensterText: 'Rundbogenfenster mit Glas im Raster 10 über den sieben Portalachsen, in den beiden Obergeschossen; das Erdgeschoss hat keine Fenster, nur die Fornici.',
    kranzText: 'Das Kranzgesims aus Pietra serena bei Y 96 schließt die Fassade ab; darüber das Walmdach. Die guelfischen Zinnen sind nicht gebaut (im 19. Jahrhundert entfernt).',
    arkadenText: '', trennText: 'Trennwände teilen den Palast im Erdgeschoss in die drei Vorderräume hinter den Fornici, West-, Saal- und Ostteil, das Geviert um den Hof, den Rückblock und den Ausläufer; jede Wand hat eine Tür von 3 Blöcken Breite und 5 Höhe.',
    dachTitel: 'Walmdach und Turm', dachTeilTitel: 'Walmdach', dachText: 'Ein Walmdach aus Dachziegeln deckt das Haus bis zu vier Lagen über der Traufe; darunter liegt der Dachraum.',
    dachExtra: { turm: T('Turm', 'Über der Fassadenmitte steht ein Turm von 12 × 12 Blöcken bis Y 112: zwei Blöcke dicke Wände aus Bruchstein und Pietra forte, innen hohl, oben mit einer Platte aus Pietra serena geschlossen.', 'Erst die Wandschale, dann die Platte.', 'Der Schaft hat keinen Zugang; Maße und Lage des Turms sind Entwurf, Zinnen sind nicht gebaut.', 'Im Zentrum der Fassade steht ein hoher Turm; seine guelfischen Zinnen wurden im 19. Jahrhundert entfernt (Quelle: it.wikipedia, Palazzo dei Mozzi).') },
    fakt: {
      fundament: 'Der Palast entstand 1266–1273 durch die Vereinigung mehrerer mittelalterlicher Häuser und Türme für die Familie Mozzi; hinter ihm steigt ein steiler Hanggarten an',
      boden: 'Die Fassade zur Piazza ist eine lange, strenge Front mit einer ununterbrochenen Reihe von Bögen im Erdgeschoss',
      hof: 'Zum Hof enthält die Quelle keine Angaben; sein Umriss stammt aus OpenStreetMap',
      treppe: 'Der Palast verbindet Merkmale der Turmbauten und der großen öffentlichen Paläste der Zeit, etwa des Bargello',
      aussenwand: 'Die Fassade wird mit kleinen, behauenen Quadern (piccole bozze squadrate) beschrieben',
      fenster: 'Die Erdgeschossfenster waren im 16. und 17. Jahrhundert als Kniefenster ausgeführt und wurden später entfernt',
      kranzgesims: 'Der Stil wird als Übergang zwischen später Duecento- und früher Trecento-Architektur eingeordnet',
      hofwaende: 'Zum Hof enthält die Quelle keine Angaben; sein Umriss stammt aus OpenStreetMap',
      hoffenster: 'Die Fenster des Hofs folgen hier dem Raster der Fassade',
      geschossboeden: 'Im ersten Stock liegt der große Saal mit Wandmalereien von 1778',
      decke: 'Ende des 18. und Anfang des 19. Jahrhunderts baute Gasparo Maria Paoletti den Palast um',
      dach: 'Im 19. und 20. Jahrhundert wurden barocke Elemente entfernt, um einen mittelalterlichen Eindruck herzustellen'
    }
  }
};
