'use strict';
// Ausstattung der Räume des Palazzo Davanzati (Modul 5 und 6): Wandfelder (Fresken), Möbel, Kamine, Altana.
// Alles vereinfacht in vollen Blöcken (Rollen der Palette); Quellen und Stufen im BAUTEIL_KATALOG.
// Wandfelder ersetzen Zellen der Rohwände (Teil wechselt), Möbel stehen in freier Luft der Räume.

function ausstatten(api) {
  const { P, D, T, FR, TR, Y, F, zelleBei } = api;
  const DIRS = { n: [0, -1], s: [0, 1], w: [-1, 0], o: [1, 0] };
  const raumZellen = (name) => D.alle.filter((c) => c.zone === name);
  const farbe = (b) => (b === '.' ? null : FR({ r: 'rot', g: 'gruen', o: 'orange', y: 'gelb', b: 'blau', h: 'hellblau', w: 'weiss', k: 'braun', s: 'schwarz' }[b]));

  // Wandzellen, die im Geschoss i an die Luft des Raumes name grenzen (Seite = Lage der Wand vom Raum aus gesehen)
  function wandZellen(name, seite) {
    const out = new Map();
    const [du, dw] = DIRS[seite];
    for (const c of raumZellen(name)) {
      const w = zelleBei(c.iu + du, c.iw + dw);
      if (w && w.zone === 'wand') out.set(w.iu + ',' + w.iw, { w, a: (seite === 'n' || seite === 's') ? c.iu : c.iw });
    }
    return [...out.values()];
  }
  // Feld: Zeilen j0..j1 (relativ zum Boden, 1 = Stehzelle), fn(a - a0, j - j0) -> Typ oder null
  function feld(name, i, seite, j0, j1, fn, teil, aVon, aBis) {
    const ws = wandZellen(name, seite);
    if (!ws.length) return 0;
    const a0 = aVon === undefined ? Math.min(...ws.map((q) => q.a)) : aVon;
    let n = 0;
    for (const { w, a } of ws) {
      if (aBis !== undefined && (a < a0 || a > aBis)) continue;
      if (a < a0) continue;
      for (let j = j0; j <= j1; j++) {
        const e = P.get(w.x, Y(F[i] + j), w.z);
        if (!e || e.t === T.fenster) continue;
        const t = fn(a - a0, j - j0);
        if (t && P.ersetze(w.x, Y(F[i] + j), w.z, t, teil)) n++;
      }
    }
    return n;
  }
  // Block in einer freien Luftzelle des Raumes
  const block = (teil, iu, iw, i, j, t, name) => {
    const c = zelleBei(iu, iw);
    if (!c || (name && c.zone !== name)) return false;
    return P.set(c.x, Y(F[i] + j), c.z, t, teil);
  };
  const quader = (teil, name, i, u0, u1, w0, w1, j0, j1, t) => {
    let n = 0;
    for (let u = u0; u <= u1; u++) for (let w = w0; w <= w1; w++) for (let j = j0; j <= j1; j++) if (block(teil, u, w, i, j, t, name)) n++;
    return n;
  };
  const tisch = (teil, name, i, u0, u1, w0, w1) => quader(teil, name, i, u0, u1, w0, w1, 1, 1, T.holz);   // Tischplatte 1 hoch (begehbar)
  const stuhl = (teil, name, i, u, w, dir) => block(teil, u, w, i, 1, TR('holz', dir), name);
  const kamin = (teil, name, i, u, w, achse) => {          // Kaminöffnung 3 breit: Pfosten, Sturz, Rauchfang
    const pf = achse === 'w' ? [[u, w - 1], [u, w + 1]] : [[u - 1, w], [u + 1, w]];
    for (const [pu, pw] of pf) for (let j = 1; j <= 4; j++) block(teil, pu, pw, i, j, T.serena, name);
    block(teil, u, w, i, 5, T.forte, name); for (const [pu, pw] of pf) block(teil, pu, pw, i, 5, T.forte, name);
    for (let j = 6; j <= 8; j++) { block(teil, u, w, i, j, T.forte, name); for (const [pu, pw] of pf) block(teil, pu, pw, i, j, T.forte, name); }
  };
  const bett = (teil, name, i, u0, w0, laengs) => {          // Bettstatt 3 x 5: Decke rot, Pfosten an den Ecken
    const du = laengs === 'u' ? 5 : 3, dw = laengs === 'u' ? 3 : 5;
    quader(teil, name, i, u0, u0 + du - 1, w0, w0 + dw - 1, 1, 1, FR('rot'));
    for (const pu of [u0, u0 + du - 1]) for (const pw of [w0, w0 + dw - 1]) for (let j = 2; j <= 3; j++) block(teil, pu, pw, i, j, T.holz, name);
  };
  const rahmen = (a, b, w, h) => a === 0 || b === 0 || a === w - 1 || b === h - 1;

  const raeume = require('./_pd_felder.js');
  raeume({ P, D, T, FR, TR, Y, F, zelleBei, feld, block, quader, tisch, stuhl, kamin, bett, rahmen, farbe, raumZellen, DIRS });
}

module.exports = { ausstatten };
