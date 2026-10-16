'use strict';
// Ausgestaltete Räume des Konvents San Marco (Modul 6): Erdgeschoss, Kreuzgänge, Obergeschoss. Lage der Räume Stufe C.
const { kit, typen, schach, hash, mod } = require('../../../tools/wahrzeichen/palazzo_raum.js');
const WZ = require('../../../tools/wahrzeichen');
const M = require('./_malerei.js');

const FR = M.FR;

/** Wanddarstellung als Feld: Zellen der Wand im lokalen Rechteck r, Spalten q = floor(Lage - start) in 0..B-1, Zeilen j0..j0+H-1. */
function feld(K, teil, s, r, achse, start, B, H, j0, fn) {
  return K.flaeche(teil, s, r, j0, j0 + H - 1, (c, jj) => {
    if (c.d8 === 1) return null;                                   // Außenschale bleibt unbemalt
    const q = Math.floor((achse === 'u' ? c.u : c.w) - start);
    if (q < 0 || q >= B) return null;
    return fn(q, jj, B, H);
  });
}

/** Zypresse im Kreuzgang: Stamm 2, danach Kegel mit Radius 2 bis 0; Luft unter der Krone ist offene Hofluft (R14: als Öffnung deklariert). */
function zypresse(api, K, teil, u, w, hoehe) {
  const { x, z } = K.zelle(u, w), { Y, BASIS, set, hat } = api;
  const stamm = WZ.typ('gruen_stamm'), laub = WZ.typ('gruen_baum');
  for (let j = 1; j <= 2; j++) set(x, Y(BASIS[0] + j), z, stamm, teil);
  for (let j = 3; j <= hoehe; j++) {
    const r = j <= 6 ? 2 : j <= hoehe - 4 ? 1.4 : j < hoehe ? 1 : 0;
    for (let dx = -2; dx <= 2; dx++) for (let dz = -2; dz <= 2; dz++) {
      if (Math.hypot(dx, dz) > r + 0.2) continue;
      set(x + dx, Y(BASIS[0] + j), z + dz, laub, teil);
    }
  }
  for (let dx = -2; dx <= 2; dx++) for (let dz = -2; dz <= 2; dz++) {
    let top = 0;
    for (let j = 1; j <= hoehe; j++) if (hat(x + dx, Y(BASIS[0] + j), z + dz)) top = j;
    for (let j = 1; j < top; j++) if (!hat(x + dx, Y(BASIS[0] + j), z + dz)) api.oeffnung('fenster_offen', teil, x + dx, Y(BASIS[0] + j), z + dz);
  }
}

function ausstattenEG(api, K, t) {
  const { D, Y } = api;

  // ------------------------------------------------------------ Kreuzgang Sant Antonino (Loch 5): Wege, Zypresse, Lünetten
  {
    const cu = 46.5, cw = 72;
    K.hofboden('kreuzgang_antonino', { u0: 27, u1: 66, w0: 51, w1: 93 }, (c) => {
      if (Math.hypot(c.u - cu, c.w - cw) < 3.2) return t.serena;                        // Plattform um die Zypresse
      if (Math.abs(c.u - cu) < 1.6 || Math.abs(c.w - cw) < 1.6) return t.kies;           // Wegekreuz
      return null;
    });
    zypresse(api, K, 'kreuzgang_antonino', cu, cw, 15);
    // Lünetten über den Türen der Kreuzgangwand (28 Stück im Original, Durchmesser 3,8 m): Halbscheiben Durchmesser 7, Gold am Rand
    for (const c of D.haupt) {
      if (!api.istInnenwand(c) || c.d8 <= 2) continue;
      let along;
      if (c.u < 28 && c.w > 40 && c.w < 102) along = c.w; else if (c.u > 65 && c.w > 40 && c.w < 102) along = c.w; else if (c.w > 92 && c.u >= 26 && c.u <= 66) along = c.u; else continue;
      const dt = mod(along, 7) - 3.5, k = Math.floor(along / 7);
      for (let yr = 7; yr <= 11; yr++) {
        const d = Math.hypot(dt, yr - 6.5);
        if (d > 3.5) continue;
        api.ersetze(c.x, Y(yr), c.z, d > 2.6 ? t.gold : [FR('hellblau'), FR('rot'), FR('gruen'), FR('gelb')][hash(k, yr >> 1, 4) % 4], 'lunetten');
      }
    }
    // Kreuzigung mit dem hl. Dominikus an der Westwand (Nordwestecke, Fra Angelico), auf der Kirchenmauer
    feld(K, 'kreuzigung_hof', 0, { u0: 49, u1: 63.5, w0: 43, w1: 46 }, 'u', 49.5, 14, 9, 2, M.kreuzigung);
  }

  // ------------------------------------------------------------ Sala dell Ospizio (Eingangsflügel Mitte): Tafelbilder Fra Angelicos
  {
    const zs = K.steh(0, { u0: 3, u1: 17, w0: 67.6, w1: 95.3 });
    K.boden('ospizio', 0, zs, (c) => schach(c, 4, t.weiss, t.serena));
    [69.2, 78.2, 87.2].forEach((w0, i) => feld(K, 'ospizio', 0, { u0: 0, u1: 3.5, w0: w0 - 0.5, w1: w0 + 6.5 }, 'w', w0, 6, 7, 2, M.tafel(i)));
    K.stellwand('ospizio', 0, 'w', 73, 6, 14, { farben: ['rot', 'blau', 'gelb', 'gruen'], wand: t.putz });
    K.stellwand('ospizio', 0, 'w', 85.5, 6, 14, { farben: ['blau', 'weiss', 'orange', 'rot'], wand: t.putz });
  }

  // ------------------------------------------------------------ Foresteria (Eingangsflügel Ost): Tafeln Fra Bartolomeos
  {
    const zs = K.steh(0, { u0: 3, u1: 17, w0: 97.6, w1: 118 });
    K.boden('foresteria', 0, zs, (c) => schach(c, 3, t.terrakotta, t.weiss));
    feld(K, 'foresteria', 0, { u0: 0, u1: 3.5, w0: 104.7, w1: 111.7 }, 'w', 105.2, 6, 7, 2, M.tafel(3));
    K.stellwand('foresteria', 0, 'w', 108, 6, 14, { farben: ['gruen', 'rot', 'blau'], wand: t.putz });
  }

  // ------------------------------------------------------------ Sala del Capitolo (Ostflügel): Kreuzigung Fra Angelicos, Kruzifix, Sitzbänke
  {
    const zs = K.steh(0, { u0: 30.5, u1: 57.3, w0: 104, w1: 118 });
    K.boden('kapitelsaal', 0, zs, (c) => schach(c, 3, t.cotto, t.weiss));
    feld(K, 'kapitelsaal', 0, { u0: 33, u1: 55.5, w0: 117.7, w1: 120.6 }, 'u', 33, 22, 9, 2, M.kreuzigung);
    for (const [u0, u1] of [[31.2, 32.6], [55.2, 56.6]]) for (const [w0, w1] of [[105, 109.4], [113, 117.4]]) K.quader('kapitelsaal', 0, { u0, u1, w0, w1 }, 1, 1, t.holz);   // Bänke
    K.quader('kapitelsaal', 0, { u0: 41, u1: 47, w0: 111, w1: 113 }, 1, 1, t.dunkel);       // Podest des Kruzifixes
    K.quader('kapitelsaal', 0, { u0: 43.6, u1: 44.6, w0: 111.6, w1: 112.6 }, 2, 7, t.holz);  // Kruzifix (Baccio da Montelupo): Stamm
    K.quader('kapitelsaal', 0, { u0: 41.6, u1: 46.4, w0: 111.6, w1: 112.6 }, 6, 6, t.holz);  // Querbalken
  }

  // ------------------------------------------------------------ Refettorio piccolo (Ostflügel Nord): Abendmahl Ghirlandaios, Tafeln
  {
    const zs = K.steh(0, { u0: 59.5, u1: 75.3, w0: 104, w1: 118 });
    K.boden('refettorio_piccolo', 0, zs, (c) => schach(c, 3, t.terrakotta, t.serena));
    feld(K, 'refettorio_piccolo', 0, { u0: 75.2, u1: 77.8, w0: 108, w1: 118 }, 'w', 108.6, 9, 9, 2, M.abendmahl);
    for (const w0 of [109, 114]) { K.quader('refettorio_piccolo', 0, { u0: 62, u1: 72, w0, w1: w0 + 2 }, 1, 1, t.holz); K.quader('refettorio_piccolo', 0, { u0: 62, u1: 72, w0: w0 + 2.4, w1: w0 + 3.4 }, 1, 1, t.holz); }
  }

  // ------------------------------------------------------------ Refettorio grande (Nordflügel): Speisung der Dominikaner von Sogliani, lange Tafeln
  {
    const zs = K.steh(0, { u0: 76, u1: 103.2, w0: 40.5, w1: 102.3 });
    K.boden('refettorio_grande', 0, zs, (c) => schach(c, 4, t.cotto, t.weiss));
    feld(K, 'refettorio_grande', 0, { u0: 103.2, u1: 105.7, w0: 41, w1: 67 }, 'w', 42, 24, 9, 2, M.speisung);
    feld(K, 'refettorio_grande', 0, { u0: 103.2, u1: 105.7, w0: 72, w1: 103 }, 'w', 73, 29, 9, 2, M.speisung);
    for (const u0 of [81, 89, 97]) {
      K.quader('refettorio_grande', 0, { u0, u1: u0 + 2.4, w0: 46, w1: 96 }, 1, 1, t.holz);                 // Tafel
      K.quader('refettorio_grande', 0, { u0: u0 - 1.6, u1: u0 - 0.4, w0: 46, w1: 96 }, 1, 1, t.holz);        // Bank
    }
    K.quader('refettorio_grande', 0, { u0: 100.8, u1: 102.8, w0: 46, w1: 50 }, 1, 2, t.holz);               // Lesekanzel
  }

  // ------------------------------------------------------------ Kreuzgang San Domenico (Loch 3): schlichter Hof mit Brunnen und Bäumen
  {
    const cu = 147.5, cw = 31;
    K.hofboden('kreuzgang_domenico', { u0: 116, u1: 178, w0: 1, w1: 62 }, (c) => {
      if (Math.abs(c.u - cu) < 1.6 || Math.abs(c.w - cw) < 1.6) return t.kies;
      if (Math.hypot(c.u - cu, c.w - cw) < 7.5 && Math.hypot(c.u - cu, c.w - cw) > 5.5) return t.kies;
      return null;
    });
    K.brunnen('kreuzgang_domenico', 0, cu, cw, 4.5, { saeule: 4 });
    for (const [du, dw] of [[-14, -14], [14, -14], [-14, 14], [14, 14]]) K.baum('kreuzgang_domenico', 0, cu + du, cw + dw, 5);
  }
}

function ausstatten(api) {
  const K = kit(api);
  const t = typen();
  ausstattenEG(api, K, t);
  require('./_ausstattung_og.js').ausstattenOG(api, K, t, feld);
}

module.exports = { ausstatten, feld, zypresse };
