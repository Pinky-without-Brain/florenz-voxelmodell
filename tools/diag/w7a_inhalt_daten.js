'use strict';
// Angaben für tools/diag/w7a_inhalt.js (Module 0..5 der Palazzi der Welle 7a). Fakten stammen aus den im Katalog genannten Quellen.
const T = (title, description, tip, caution, fact) => ({ title, description, tip, caution, fact });
module.exports = {
  palazzo_gondi: {
    bodenY: 63, traufe: 23, quelle: 'it.wikipedia, Palazzo Gondi', loggiaBoden: true,
    hofText: 'Der Hof bleibt offen; sein Boden aus Pflaster und Pietra serena liegt auf Y 63, in der Mitte steht der Brunnen.',
    fassadeTitel: 'Außenwände mit abgestufter Rustika, Biforien, Kranzgesims',
    aussenText: 'Die Außenwände sind zwei Blöcke dick: Im Erdgeschoss Rustika aus Pietra forte mit kräftigen Fugen, im ersten Obergeschoss flachere Rustika, im obersten Geschoss glatte Pietra-forte-Wand (abgestufte Rustika, bugnato).',
    aussenTip: 'Die Fugenlagen (Pietra forte) liegen im Erdgeschoss in jeder dritten Lage, im ersten Obergeschoss in jeder vierten.',
    fensterText: 'Rundbogenfenster mit Glas: im Erdgeschoss klein, in den Obergeschossen höher und mit einer Mittelsäule als Biforium (zweigeteiltes Fenster); drei Portale zur Piazza San Firenze.',
    kranzText: 'Das Kranzgesims aus Pietra serena schließt die Fassade bei Y 86 ab.',
    arkadenText: 'Im Erdgeschoss umgeben Rundbögen auf Säulen aus Pietra serena den Hof (vier Blöcke Joch); dahinter liegt eine Galerie.',
    trennText: 'Trennwände teilen den Ring im Erdgeschoss in Vestibül, Nordostraum, Südostraum, Treppenhaus, Südflügel und die beiden Westräume; jede Wand hat eine Tür von 3 Blöcken Breite und 5 Höhe.',
    dachTitel: 'Walmdach', dachTeilTitel: 'Walmdach', dachText: 'Ein Walmdach aus Dachziegeln deckt das Haus bis zu vier Lagen über der Traufe; darunter liegt der Dachraum.',
    fakt: {
      fundament: 'Giuliano da Sangallo entwarf den Palast 1490 für Giuliano di Lionardo Gondi; um 1501 war er bewohnbar, aber noch unvollendet',
      boden: 'Der Palast ist ein kubischer Baukörper um einen zentralen Innenhof',
      hof: 'Der zentrale Brunnen mit doppelter Schale stammt von 1652',
      treppe: 'Sangallos monumentale Treppe liegt an der Nordseite des Hofs; die Wendeltreppe hier ergänzt den Zugang zum obersten Geschoss',
      aussenwand: 'Die Fassade zeigt Bugnato aus Pietra forte, nach oben abnehmend: Kissenquader im Erdgeschoss, flache Bugne im ersten Stock, glatte Wand oben',
      fenster: 'Die Fenster des zweiten Geschosses sind etwas höher ausgeführt, als optische Korrektur',
      kranzgesims: 'Das Dachgesims trägt Konsolen',
      hofarkaden: 'Der Hof hat auf allen vier Seiten Arkaden mit korinthischen Säulen, je Seite drei beziehungsweise zwei Arkaden',
      hofwaende: 'Der Palast ist ein kubischer Baukörper um einen zentralen Innenhof',
      hoffenster: 'Zwischen den Fenstern der Fassade sitzen Kreuzsteine mit zwei langen und zwei kurzen Armen',
      innenwaende: 'Poggi fügte eine zweite Treppenrampe hinzu, die vom Wagendurchgang zum Piano nobile führt',
      geschossboeden: 'Der Palast hat drei Geschosse',
      decke: 'Die Fertigstellung des Palasts wird mit 1874 angegeben',
      innenwaende_og: 'Im Piano nobile liegen Vestibül, Korridor, großer Saal und weitere Säle',
      dach: 'Auf dem Dach steht eine Altana mit Säulen in Achse mit dem zweiten Portal; sie ist hier nicht gebaut'
    }
  },
  palazzo_spini_feroni: {
    bodenY: 61, traufe: 30, quelle: 'it.wikipedia, Palazzo Spini Feroni', loggiaBoden: false, ohne: ['hofarkaden', 'innenwaende', 'innenwaende_og'],
    hofText: 'Der Hof bleibt offen; sein Boden aus Pflaster, Marmor und Pietra serena liegt auf Y 61. Vier Türen aus dem Erdgeschoss führen hinein.',
    fassadeTitel: 'Außenwände aus Pietra forte, Fenster, Kranzgesims',
    aussenText: 'Die Außenwände sind zwei Blöcke dick und bestehen außen aus unverputztem Pietra-forte-Bruchstein mit Bändern aus behauener Pietra forte (jede vierte Lage); innen Putz.',
    aussenTip: 'Jede vierte Lage ist behauene Pietra forte, dazwischen Bruchstein.',
    fensterText: 'Rundbogenfenster mit Glas im Raster 9; in den beiden Obergeschossen mit einer Mittelsäule als Biforium; die Portale liegen in Fensterachsen.',
    kranzText: 'Das Kranzgesims aus Pietra forte bei Y 91 trägt in der Wirklichkeit ein Ballatoio auf Konsolen; hier ein glattes Gesims, darüber der Zinnenkranz.',
    arkadenText: '', trennText: 'Trennwände teilen den Palast im Erdgeschoss in die Vorderräume am Borgo Santi Apostoli, den Androne, die Flügel und den Ostflügel; jede Wand hat eine Tür von 3 Blöcken Breite und 5 Höhe.',
    dachTitel: 'Dach und Zinnen', dachTeilTitel: 'Walmdach', dachText: 'Ein flaches Walmdach aus Dachziegeln deckt das Haus bis zu vier Lagen über der Traufe; darunter liegt der Dachraum (ohne Zugang).',
    dachExtra: { zinnen: T('Zinnenkranz', 'Auf der Außenkante der Traufe steht ein Kranz aus Zinnen (Pietra forte), vier Lagen hoch, abwechselnd Zinne und Lücke.', 'Zwei Blöcke Zinne, zwei Blöcke Lücke.', 'Der Kranz ist nicht begehbar; dahinter liegt das Dach.', 'Ein Kranz guelfischer Zinnen gibt dem Palast das Aussehen einer Festung (Quelle: it.wikipedia, Palazzo Spini Feroni).') },
    fakt: {
      fundament: 'Der Bau begann 1289 für den Kaufmann und Politiker Geri Spini',
      boden: 'Im Erdgeschoss liegt eine Loggia, in der heute Schaufenster stehen',
      hof: 'Der Palast steht in gotischem Stil mit unverputzter Steinfassade',
      treppe: 'Der Palast hat drei Geschosse, bekrönt von einem Ballatoio auf Konsolen',
      aussenwand: 'Die Fassade aus Pietra forte ist nicht verputzt',
      fenster: 'Die Rundbogenfenster sitzen an Gesimsbändern; bei der Wiederherstellung im 19. Jahrhundert wurden die Mezzaninfenster geschlossen',
      kranzgesims: 'Das Ballatoio auf Konsolen schließt die drei Geschosse ab',
      hofwaende: 'Der Hof ist in der Quelle nicht beschrieben; sein Umriss stammt aus OpenStreetMap',
      hoffenster: 'Die Fenster des Hofs folgen hier dem Raster der Straßenfassaden',
      geschossboeden: 'Die Privatkapelle mit Fresken von Poccetti wurde in den Palast versetzt, als eine ältere Kapelle abgerissen wurde',
      decke: 'Die Stuckaturen von Foggini und Merlini entstanden unter der Familie Feroni',
      dach: 'Ein Kranz guelfischer Zinnen gibt dem Palast das Aussehen einer Festung'
    }
  },
  palazzo_bartolini_salimbeni: {
    bodenY: 62, traufe: 30, quelle: 'it.wikipedia, Palazzo Bartolini Salimbeni', loggiaBoden: true,
    hofText: 'Der Hof bleibt offen; sein Boden aus Pflaster und Marmor liegt auf Y 62. Ein Durchgang führt von der Piazza hinein.',
    fassadeTitel: 'Außenwände mit Rustikaecken, Kreuzfenster, Kranzgesims',
    aussenText: 'Die Außenwände sind zwei Blöcke dick: zur Piazza di Santa Trinita Pietra forte, zur Via Porta Rossa und Via delle Terme Pietra serena mit Bändern aus Pietra forte; die Ecken sind mit Rustika verstärkt.',
    aussenTip: 'Jede vierte Lage wechselt den Stein.',
    fensterText: 'Rechteckähnliche Fenster mit Glas und Mittelpfosten im Raster 10; der Querriegel kommt in Modul 6 dazu und macht daraus Kreuzfenster. Zwei Portale: an der Piazza und an der Via Porta Rossa.',
    kranzText: 'Das Kranzgesims aus Marmor bei Y 92 springt vor; der Fries mit den Mohnblüten kommt in Modul 6.',
    arkadenText: 'Im Erdgeschoss umgeben Rundbögen auf Säulen aus Pietra serena den Hof (vier Blöcke Joch); dahinter liegt eine Galerie.',
    trennText: 'Trennwände teilen den Ring im Erdgeschoss in Durchgang, Nordost- und Südostraum, Nord- und Südflügel und die beiden Westräume; jede Wand hat eine Tür von 3 Blöcken Breite und 5 Höhe.',
    dachTitel: 'Walmdach', dachTeilTitel: 'Walmdach', dachText: 'Ein flaches Walmdach aus Dachziegeln deckt das Haus bis zu drei Lagen über der Traufe; darunter liegt der Dachraum.',
    fakt: {
      fundament: "Baccio d'Agnolo baute den Palast 1520 bis 1523 für Giovanni Bartolini",
      boden: 'Der Palast steht an der Piazza di Santa Trinita, an der Ecke von Via Porta Rossa und Via delle Terme',
      hof: 'Den Hof erreicht man durch einen tonnengewölbten Durchgang',
      treppe: 'Der Palast gilt als erste Florentiner Residenz im römischen Stil (alla romana)',
      aussenwand: 'Die Fassade ist zur Piazza aus Pietra forte, zur Via Porta Rossa aus Pietra serena und Pietra bigia',
      fenster: 'Die Fenster sind durch kreuzförmige Steinglieder in vier Felder geteilt',
      kranzgesims: 'Ein vorspringendes Kranzgesims mit klassischen Zahnschnitten und ein Fries mit drei Mohnblüten krönen die Fassade',
      hofarkaden: 'Der Hof hat einen Portikus an drei Seiten mit Säulen und Rundbögen; eine Seite und ein Joch wurden später geschlossen',
      hofwaende: 'Der Hof trägt einfarbigen Sgraffito-Schmuck und Grotesken',
      hoffenster: 'Im ersten Obergeschoss öffnet sich eine Loggia mit drei Bögen und hölzerner Kassettendecke; sie ist hier nicht gebaut',
      innenwaende: 'Der Hof ist über einen tonnengewölbten Durchgang erreichbar',
      geschossboeden: 'Der Palast hat drei Geschosse',
      decke: 'Hölzerne Kassettendecken mit Mohnkopf-Emblemen gehören zu den bemerkenswerten Teilen der Ausstattung',
      innenwaende_og: '1838/39 baute Giuseppe Martelli den Palast zum Hotel du Nord um',
      dach: '1961/62 restaurierte Piero Sanpaolesi die Fassade'
    }
  }
};
