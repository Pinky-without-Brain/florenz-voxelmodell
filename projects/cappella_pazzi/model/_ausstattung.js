'use strict';
// Ausgestaltete Räume des Konvents von Santa Croce (Modul 6): Cenacolo, Museumssäle, Secondo Chiostro, Innenhof. Lage der Räume Stufe C.
const { kit, typen, schach, hash, mod } = require('../../../tools/wahrzeichen/palazzo_raum.js');
const M = require('./_malerei.js');

const FR = M.FR;

/** Wanddarstellung als Feld: Zellen der Wand im lokalen Rechteck r, Spalten q = floor(Lage - start) in 0..B-1, Zeilen j0..j0+H-1. */
function feld(K, teil, s, r, achse, start, B, H, j0, fn, filter) {
  return K.flaeche(teil, s, r, j0, j0 + H - 1, (c, jj) => {
    if (c.d8 === 1) return null;                                   // Außenschale bleibt unbemalt
    if (filter && !filter(c)) return null;
    const q = Math.floor((achse === 'u' ? c.u : c.w) - start);
    if (q < 0 || q >= B) return null;
    return fn(q, jj, B, H);
  });
}

function ausstatten(api) {
  const K = kit(api);
  const t = typen();
  const { D, Y } = api;

  // ------------------------------------------------------------ Cenacolo (Refektorium, Westarm): Gaddi, Cimabue, Donatello, Veneziano
  {
    const zs = K.steh(0, { u0: -9, u1: 12, w0: 55, w1: 97 });
    K.boden('cenacolo', 0, zs, (c) => schach(c, 3, t.cotto, t.serena));
    // Albero della Vita und Ultima Cena an der Westwand (innere Wandlage)
    feld(K, 'gaddi_fresko', 0, { u0: -12, u1: 2.5, w0: 59, w1: 96 }, 'w', 60, 36, 9, 1, M.albero, (c) => c.d8 === 2);
    // Cimabues Kruzifix an der Nordstirnwand (innere Lage)
    feld(K, 'cimabue_kruzifix', 0, { u0: -8, u1: 12, w0: 50, w1: 57.5 }, 'u', -1.5, 8, 9, 1, M.kruzifix, (c) => c.d8 === 2);
    // Veneziano-Tafel an der Ostwand
    feld(K, 'veneziano_tafel', 0, { u0: 2.5, u1: 14, w0: 80, w1: 92 }, 'w', 84.5, 6, 6, 3, M.veneziano, (c) => c.d8 === 2);
    // lange Refektoriumstafel unter dem Fresko (1 Block hoch) und eine Bank an der Ostwand
    K.quader('cenacolo', 0, { u0: -2.2, u1: -0.4, w0: 61, w1: 93 }, 1, 1, t.holz);
    K.quader('cenacolo', 0, { u0: 6.2, u1: 7.8, w0: 64, w1: 73 }, 1, 1, t.holz);
    // San Ludovico di Tolosa (Donatello, 1423/24, vergoldete Bronze) auf einem Sockel
    K.figur('san_ludovico', 0, 5.5, 88, { sockel: 2, sockelTyp: t.serena, beine: 2, rumpf: 2, typ: t.gold, kopf: t.gold, schmuck: t.gold, arme: 'keine' });
  }

  // ------------------------------------------------------------ Sala degli affreschi staccati (Halle A): Orcagna-Fragmente
  {
    const zs = K.steh(0, { u0: -14, u1: 21, w0: 100, w1: 134 });
    K.boden('sala_orcagna', 0, zs, (c) => schach(c, 3, t.weiss, t.serena));
    [105, 114, 123].forEach((w0, i) => feld(K, 'orcagna_fresken', 0, { u0: -20, u1: -3, w0: w0 - 0.5, w1: w0 + 6.5 }, 'w', w0, 6, 8, 2, M.orcagna(i), (c) => c.d8 === 2));
    K.stellwand('sala_orcagna', 0, 'w', 117.5, 2, 16, { farben: ['schwarz', 'rot', 'braun'], wand: t.putz });
  }

  // ------------------------------------------------------------ Sala Vasari (Halle B): Ultima Cena
  {
    const zs = K.steh(0, { u0: 23.2, u1: 51, w0: 100, w1: 134 });
    K.boden('sala_vasari', 0, zs, (c) => schach(c, 4, t.terrakotta, t.weiss));
    feld(K, 'vasari_abendmahl', 0, { u0: 22, u1: 23.4, w0: 105, w1: 123 }, 'w', 106, 16, 7, 2, M.vasari, (c) => c.u >= 22);
    K.quader('sala_vasari', 0, { u0: 36, u1: 38, w0: 106, w1: 120 }, 1, 1, t.dunkel);   // Vitrinenband (Podest)
  }

  // ------------------------------------------------------------ Secondo Chiostro (Loch 1): Wegekreuz, Brunnen, Wappentondi in den Zwickeln
  {
    const cu = 109.2, cw = 206.7;
    K.hofboden('kreuzgang_secondo', { u0: 79, u1: 140, w0: 169, w1: 245 }, (c) => {
      if (Math.hypot(c.u - cu, c.w - cw) < 6) return t.serena;
      if (Math.abs(c.u - cu) < 1.6 || Math.abs(c.w - cw) < 1.6) return t.kies;
      return null;
    });
    K.brunnen('kreuzgang_secondo', 0, cu, cw, 3.5, { saeule: 4 });
    for (const c of D.haupt) {
      if (c.dHof > 2 || !c.grossHof || !c.hofEntlang || c.d8 <= 2) continue;
      const v = c.hofEntlang === 'u' ? c.u : c.w, r = mod(v, 7);
      if (Math.min(r, 7 - r) > 1.3) continue;
      const k = Math.floor((v + 3.5) / 7);
      for (const yr of [8, 9]) api.ersetze(c.x, Y(yr), c.z, (hash(k, yr, 3) % 2) ? FR('rot') : t.weiss, 'hofarkaden');
    }
  }

  // ------------------------------------------------------------ schmaler Innenhof im Ostflügel (Loch 0): Rasen mit Weg
  {
    K.hofboden('cortile_ost', { u0: 218, u1: 279, w0: 112, w1: 128 }, (c) => (Math.abs(c.w - 120.1) < 1.3 ? t.kies : null));
    K.quader('cortile_ost', 0, { u0: 226, u1: 230, w0: 114.4, w1: 115.6 }, 1, 1, t.holz);
    K.quader('cortile_ost', 0, { u0: 260, u1: 264, w0: 124.4, w1: 125.6 }, 1, 1, t.holz);
  }
}

module.exports = { ausstatten, feld };
