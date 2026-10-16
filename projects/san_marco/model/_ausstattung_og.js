'use strict';
// Obergeschoss des Konvents San Marco: Dormitorium mit den Zellen der Mönche, Zellen Savonarolas, Verkündigung an der Treppe,
// Biblioteca di Michelozzo. Lage der Räume Stufe C (Quellen nennen die Räume, nicht ihre Koordinaten).
const { schach, mod } = require('../../../tools/wahrzeichen/palazzo_raum.js');
const WZ = require('../../../tools/wahrzeichen');
const PAL = require('../../../tools/spec/palette.js');
const M = require('./_malerei.js');
const RAUM = require('./_raeume.js');

const FR = M.FR;
const sicher = (n, f) => Math.max(n, f);

/** Lokales Rechteck aus Quer- (cr) und Längsintervall (tr) eines Zellenblocks (ax = Reihungsrichtung). */
const rechteck = (ax, cr, tr) => (ax === 'w' ? { u0: cr[0], u1: cr[1], w0: tr[0], w1: tr[1] } : { u0: tr[0], u1: tr[1], w0: cr[0], w1: cr[1] });

function zellenBloecke(api, K, t, feld) {
  for (const b of RAUM.BLOECKE) {
    const teil = 'zellen_' + b.id, achseT = b.ax;                       // ax: Richtung entlang der Zellenreihe (u oder w)
    for (const z of b.zellen) {
      const [q0, q1] = z.quer, [ta, tb] = z.t, hinten = z.reihe === 'A' ? -1 : 1;     // Rückwand: bei A auf der niedrigeren Seite
      const slab = hinten < 0 ? [q0 - 1.9, q0] : [q1, q1 + 1.9];
      const B = Math.min(6, Math.max(3, Math.floor(tb - ta))), start = z.tm - B / 2;
      feld(K, teil, 1, rechteck(b.ax, slab, [ta - 0.5, tb + 0.5]), achseT, start, B, 5, 2, M.zelle(z.nr));
      const bett = hinten < 0 ? [q0, q0 + 2.6] : [q1 - 2.6, q1], kopf = hinten < 0 ? [q0, q0 + 1.1] : [q1 - 1.1, q1];
      K.quader(teil, 1, rechteck(b.ax, bett, [ta + 0.1, ta + 1.4]), 1, 1, FR('rot'));                  // Bett: Decke
      K.quader(teil, 1, rechteck(b.ax, kopf, [ta + 0.1, ta + 1.4]), 1, 1, t.putz);                     // Kissen
      K.quader(teil, 1, rechteck(b.ax, hinten < 0 ? [q0, q0 + 1.4] : [q1 - 1.4, q1], [tb - 1.4, tb]), 1, 1, t.holz);   // Schreibpult
    }
  }
}

function savonarola(api, K, t, feld) {
  const S = RAUM.SAVO, teil = 'savonarola';
  const ru = (i) => ({ u0: S.raeume[i][0], u1: S.raeume[i][1], w0: S.w[0], w1: S.w[1] });
  S.raeume.forEach((r, i) => {
    const zs = K.steh(1, ru(i));
    K.boden(teil, 1, zs, (c) => schach(c, 3, t.cotto, t.weiss));
    const mitte = (r[0] + r[1]) / 2;
    feld(K, teil, 1, { u0: mitte - 3.5, u1: mitte + 3.5, w0: S.w[1] - 1.6, w1: S.w[1] + 2.6 }, 'u', mitte - 3, 6, 5, 2, M.zelle(40 + i));
  });
  // Raum 1: Studierzimmer des Priors (Schreibtisch, Bücherwand)
  K.quader(teil, 1, { u0: 32, u1: 34, w0: 105, w1: 112 }, 1, 1, t.holz);
  K.quader(teil, 1, { u0: 32, u1: 40.5, w0: 104.4, w1: 105.8 }, 1, 3, t.holz);
  // Raum 2: Schlafzelle (Bett, Betstuhl)
  K.quader(teil, 1, { u0: 46, u1: 48.4, w0: 105, w1: 110 }, 1, 1, FR('rot'));
  K.quader(teil, 1, { u0: 46, u1: 48.4, w0: 105, w1: 106.2 }, 1, 1, t.putz);
  K.quader(teil, 1, { u0: 52, u1: 53.4, w0: 106, w1: 108 }, 1, 2, t.holz);
  // Raum 3: Gedenkraum mit der Statue Savonarolas (Marmor, Mönchskutte), Tafeln Fra Bartolomeos
  K.figur(teil, 1, 63.6, 111, { typ: t.weiss, sockelTyp: t.serena, sockel: 2, arme: 'seitlich', rumpf: 3 });
  K.stellwand(teil, 1, 'w', 106.5, 59, 68, { farben: ['rot', 'blau', 'gelb'], wand: t.putz });
}

function verkuendigung(api, K, t) {
  const I = api.treppeInfo;
  if (!I) return;
  const T = WZ.treppe, { Y, BASIS, set } = api;
  const [gx, gz] = T.DIR[I.g], [qx, qz] = T.DIR[T.RECHTS[I.g]];
  const B = 11, H = 9, d = 5;
  const cx = I.oben.x + gx * d, cz = I.oben.z + gz * d;
  for (let k = 0; k < B; k++) for (let j = 0; j < H; j++) {
    const typ = M.verkuendigung(k, j, B, H);
    set(cx + qx * (k - 5), Y(BASIS[1] + 1 + j), cz + qz * (k - 5), typ, 'verkuendigung');
  }
  for (let k = 0; k < B; k++) set(cx + qx * (k - 5), Y(BASIS[1] + 1), cz + qz * (k - 5), t.serena, 'verkuendigung');   // Sockelleiste
}

function bibliothek(api, K, t, feld) {
  const B = RAUM.BIB, teil = 'biblioteca', { Y, BASIS, set } = api;
  const rect = { u0: B.u[0], u1: B.u[1], w0: B.w[0], w1: B.w[1] };
  const zs = K.steh(1, rect);
  const n = 15, pitch = (B.w[1] - B.w[0]) / n, uc = [188.5, 196.5], um = (uc[0] + uc[1]) / 2;
  K.boden(teil, 1, zs, (c) => (Math.abs(c.u - uc[0]) < 1.1 || Math.abs(c.u - uc[1]) < 1.1 ? t.serena : schach(c, 4, t.cotto, t.terrakotta)));
  // Ionische Säulen in zwei Reihen (Schaft Pietra serena, Kapitell Marmor), Gurtbögen quer über das Mittelschiff
  const J = (j) => Y(BASIS[1] + j);
  const zellenIn = (r) => K.alle.filter((c) => K.imR(c, r));
  for (let k = 0; k < n; k++) {
    const wk = B.w[0] + (k + 0.5) * pitch;
    for (const u of uc) {
      const { x, z } = K.zelle(u, wk);
      set(x, J(1), z, t.weiss, teil);
      for (let j = 2; j <= 5; j++) set(x, J(j), z, t.serena, teil);
      set(x, J(6), z, t.ornament, teil);
      set(x, J(7), z, t.ornament, teil);
    }
    for (const c of zellenIn({ u0: uc[0] - 0.6, u1: uc[1] + 0.6, w0: wk - 0.6, w1: wk + 0.6 })) {
      const du = c.u - um;
      for (let j = 7; j <= 10; j++) if (Math.abs(Math.hypot(du / 4, (j - 7) / 3) - 1) < 0.26) set(c.x, J(j), c.z, t.serena, teil);
    }
    for (const [ua, ub] of [[B.u[0] - 0.3, uc[0] - 0.4], [uc[1] + 0.4, B.u[1] + 0.3]]) {          // Seitenschiffe: flache Gurte
      const mitte = (ua + ub) / 2, hb = (ub - ua) / 2;
      for (const c of zellenIn({ u0: ua, u1: ub, w0: wk - 0.6, w1: wk + 0.6 })) {
        for (let j = 7; j <= 9; j++) if (Math.abs(Math.hypot((c.u - mitte) / hb, (j - 7) / 2.5) - 1) < 0.3) set(c.x, J(j), c.z, t.serena, teil);
      }
    }
  }
  // Decke: Mittelschiff Tonne (blau mit Goldsternen), Seitenschiffe Kreuzgewölbe (Rippen, helles Feld)
  K.decke(teil, 1, zs, (c) => {
    const r = mod(c.w - B.w[0], pitch);
    const rippe = r < 0.9 || r > pitch - 0.9;
    if (Math.abs(c.u - um) < 4) return rippe ? t.serena : (mod(Math.floor(c.w * 0.7) + Math.floor(c.u), 5) === 0 ? t.gold : FR('blau'));
    return rippe ? t.serena : t.putz;
  });
  // Pulte (Treppenblöcke aus Eiche) an den Längswänden, Neigung zum Leser; Platz vor den Türen bleibt frei
  const pult = (u, w, rich) => {
    const { x, z } = K.zelle(u, w);
    set(x, J(1), z, PAL.treppe('holz', WZ.treppe.weltRichtung(rich, K.R)), teil);
  };
  for (let w = B.w[0] + 3; w < B.w[1] - 2; w += 3.2) {
    if (Math.abs(w - 55) < 4.5) continue;                            // Südtür
    pult(B.u[0] + 1.3, w, 'w');                                       // Aufstieg zur Südwand (lokal -u)
    pult(B.u[1] - 1.3, w, 'o');
  }
  K.quader(teil, 1, { u0: um - 1.2, u1: um + 1.2, w0: B.w[0] + 1.5, w1: B.w[1] - 1.5 }, 1, 1, t.holz);   // Lesetisch im Mittelschiff (1 hoch)
  K.quader(teil, 1, { u0: um - 1.2, u1: um + 1.2, w0: 45, w1: 47 }, 1, 1, null);
  // Fensterbilder: je Stirnwand ein Fresko (Hl. Dominikus)
  feld(K, teil, 1, { u0: 186, u1: 199, w0: B.w[0] - 0.5, w1: B.w[0] + 1.2 }, 'u', 186, 13, 7, 3, M.tafel(5));
  feld(K, teil, 1, { u0: 186, u1: 199, w0: B.w[1] - 1.2, w1: B.w[1] + 0.5 }, 'u', 186, 13, 7, 3, M.tafel(7));
}

function ausstattenOG(api, K, t, feld) {
  zellenBloecke(api, K, t, feld);
  savonarola(api, K, t, feld);
  verkuendigung(api, K, t);
  bibliothek(api, K, t, feld);
}

module.exports = { ausstattenOG };
