'use strict';
// Ausstattung von Santa Margherita de' Cerchi: Hochaltar mit Altarbild und Predellen (Modul 5), Seitenaltäre, Wandbilder,
// Gedenktafeln, Wappen. Alles vereinfacht in vollen Blöcken (Rollen der Palette), Bilder als Farbfelder in der Wandlage.
const kirche = require('../../../tools/wahrzeichen/kirche.js');

function ausstatten(api) {
  const { P, T, FR, Y, X, Zz } = api;
  const tafel = (o) => kirche.malerei.tafel(o);

  // setzt/ersetzt eine Zelle (iu, iw, yr); Fenster und Luft bleiben unberührt
  const put = (teil, iu, iw, yr, t) => {
    const e = P.get(X(iu), Y(yr), Zz(iw));
    if (!e || e.t === T.fenster) return false;
    return P.ersetze(X(iu), Y(yr), Zz(iw), t, teil);
  };
  const frei = (teil, iu, iw, yr, t) => (P.hat(X(iu), Y(yr), Zz(iw)) ? false : P.set(X(iu), Y(yr), Zz(iw), t, teil));
  // Farbfeld in einer Wandebene: fix = Koordinate der Ebene, achse 'iu'|'iw' = Laufrichtung, a0 = Start, B Breite, H Höhe, j0 = erste Lage
  const feld = (teil, ebene, fix, a0, B, H, j0, fn) => {
    for (let q = 0; q < B; q++) for (let jj = 0; jj < H; jj++) {
      const t = fn(q, jj, B, H);
      if (t == null) continue;
      if (ebene === 'iu') put(teil, fix, a0 + q, j0 + jj, t); else put(teil, a0 + q, fix, j0 + jj, t);
    }
  };

  // ---- Hochaltar: Mensa mit Säulchen, Altarbild (Madonna in Thron mit vier Heiligen, Neri di Bicci) und zwei Predellen
  {
    const teil = 'hochaltar';
    for (let iw = 6; iw <= 11; iw++) frei(teil, 22, iw, 1, T.serena);
    frei(teil, 21, 6, 1, T.saeule); frei(teil, 21, 11, 1, T.saeule);
    feld(teil, 'iu', 23, 6, 6, 7, 3, tafel({ himmel: 'hellblau', boden: 'braun', gewand: ['blau', 'rot', 'weiss', 'gruen'], motiv: 'gruppe' }));
    feld(teil, 'iu', 23, 6, 3, 1, 2, (q) => [FR('gruen'), FR('gelb'), FR('braun')][q]);       // Predella links (Nordseite): Stefano d'Antonio di Vanni
    feld(teil, 'iu', 23, 9, 3, 1, 2, (q) => [FR('orange'), FR('rot'), FR('weiss')][q]);       // Predella rechts (Südseite): Domenico di Michelino, Szenen der Heiligen
  }
  // ---- Seitenaltäre (zwei aus Stein): Süd = Altarbild Invenzione della Croce mit Lünette der Maddalena (Mati), Nord = Altar ohne belegtes Bild
  {
    const teil = 'seitenaltaere';
    for (let iu = 9; iu <= 13; iu++) { frei(teil, iu, 15, 1, T.serena); frei(teil, iu, 2, 1, T.serena); }
    for (const iw of [16, 1]) for (const iu of [8, 14]) for (let yr = 1; yr <= 8; yr++) put(teil, iu, iw, yr, T.saeule);   // Pilaster
    for (const iw of [16, 1]) for (let iu = 8; iu <= 14; iu++) put(teil, iu, iw, 9, T.serena);                              // Gebälk
    feld(teil, 'iw', 16, 9, 5, 6, 3, tafel({ himmel: 'hellblau', boden: 'braun', gewand: ['rot', 'weiss'], motiv: 'kreuz' }));
    feld(teil, 'iw', 16, 10, 3, 1, 10, (q, j, B) => (q === 0 || q === B - 1 ? T.gold : FR('rot')));                           // Lünette der Maddalena (vereinfacht)
  }
  // ---- Wandbilder: Dante und Beatrice (präraffaelitisch, 19./20. Jh.) rechts nach dem Eingang, Südwand
  {
    const teil = 'wandbilder';
    feld(teil, 'iw', 16, 4, 4, 5, 3, tafel({ himmel: 'gruen', boden: 'braun', gewand: ['rot', 'weiss', 'blau'], motiv: 'gruppe' }));
  }
  // ---- Gedenktafeln: angebliche Grabplatte Beatrices (Nordwand), Tafel für den Gründer Enrico Michelassi am Presbyterium
  {
    const teil = 'gedenktafeln';
    feld(teil, 'iw', 1, 4, 4, 3, 2, (q, j, B, H) => (q === 0 || q === B - 1 || j === 0 || j === H - 1 ? T.gold : T.alt));
    feld(teil, 'iu', 16, 3, 2, 2, 4, (q, j) => (j === 1 ? T.gold : T.alt));
  }
  // ---- Wappen neben dem Portal (Gestalt in der Quelle nicht beschrieben: Stufe C, Steintafeln im Goldrahmen)
  {
    const teil = 'wappen';
    for (const iw0 of [4, 12]) feld(teil, 'iu', 0, iw0, 2, 2, 6, (q, j) => ((q + j) === 0 || (q + j) === 2 ? T.gold : T.alt));
  }
}

module.exports = { ausstatten };
