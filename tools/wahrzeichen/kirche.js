'use strict';
// Gemeinsame Hilfen der Kirchen-Wahrzeichen der Welle 6 (Cestello, San Gaetano, Santa Maria Maggiore, Santi Apostoli).
// Rein additiv: Plan-Werkzeuge (Zellen im Speicher, erste Setzung gewinnt), Module als Teillisten, Licht, kleine Formfunktionen.
//
//   const W = kirche.werkzeuge();  -> { zellen, teile, set, ersetze, umteil, hat, frei, istFrei, oeffnung, unzug, key, oeff, unz, N4, N8 }
//   kirche.modul(planFn, oeffTeil)(n, [teilIds])  -> Modul im Format der Projekte (module, build(ctx))
//   kirche.licht(W, T, stehZellen) -> setzt Seelaternen (Teil 'licht') im Abstand <= 12
const WZ = require('./index.js');

const N4 = [[1, 0], [-1, 0], [0, 1], [0, -1]];
const N8 = N4.concat([[1, 1], [1, -1], [-1, 1], [-1, -1]]);
const key = (x, y, z) => x + ',' + y + ',' + z;

/** Halbkreisbogen: Höhe y0 + sqrt(a² − x²) für |x| < a, sonst −1. */
const rund = (y0, x, a) => (Math.abs(x) < a ? Math.floor(y0 + Math.sqrt(a * a - x * x)) : -1);
/** Ellipsen-Hilfe: sqrt(1 − t²), t auf 0..1 begrenzt. */
const ell = (t) => Math.sqrt(Math.max(0, 1 - Math.min(1, t * t)));
const mod = (a, n) => ((a % n) + n) % n;

function werkzeuge() {
  const zellen = new Map(), teile = new Map(), luft = new Set();
  const anTeil = (p, k) => { let a = teile.get(p); if (!a) teile.set(p, a = []); a.push(k); };
  const set = (x, y, z, t, p, force) => {
    const k = key(x, y, z);
    if (zellen.has(k) || (!force && luft.has(k))) return false;
    zellen.set(k, { x, y, z, t, p });
    anTeil(p, k);
    return true;
  };
  /** Zelle ersetzen (Typ und Teil), falls vorhanden. */
  const umteil = (x, y, z, t, p) => {
    const k = key(x, y, z), e = zellen.get(k);
    if (!e) return false;
    teile.set(e.p, teile.get(e.p).filter((q) => q !== k));
    e.t = t; e.p = p; anTeil(p, k);
    return true;
  };
  const hat = (x, y, z) => zellen.has(key(x, y, z));
  const frei = (x, y, z) => luft.add(key(x, y, z));
  const istFrei = (x, y, z) => luft.has(key(x, y, z));
  const oeff = new Map();
  const oeffnung = (art, p, x, y, z) => { const k = art + '|' + p; if (!oeff.has(k)) oeff.set(k, []); oeff.get(k).push({ x, y, z }); frei(x, y, z); };
  const unz = new Map();
  const unzug = (p, b, x, y, z) => { const k = p + '|' + b; if (!unz.has(k)) unz.set(k, []); unz.get(k).push({ x, y, z }); };
  return { zellen, teile, set, ersetze: umteil, umteil, hat, frei, istFrei, oeffnung, unzug, key, oeff, unz, N4, N8 };
}

/** Seelaternen an Stehzellen [{x, y, z}] (Boden-Einbau y − 1), Teil 'licht'. */
function licht(W, T, steh, abstand = 12) {
  const lt = [];
  for (const l of WZ.lichtRaster(steh, { abstand })) {
    const k = key(l.x, l.y, l.z), e = W.zellen.get(k);
    if (!e) continue;
    W.teile.set(e.p, W.teile.get(e.p).filter((q) => q !== k));
    e.t = T.licht; e.p = 'licht'; lt.push(k);
  }
  W.teile.set('licht', (W.teile.get('licht') || []).concat(lt));
  return lt.length;
}

/**
 * Werkzeuge für die Ausstattung: api = { D (mit D.cells [{x, z, u, w, d8}]), set, ersetze, zellen, key, Y }.
 *   cellsIn(r)  Zellen im Rechteck r = { u0, u1, w0, w1 } (Rahmen)
 *   quader(teil, r, j0, j1, typ|fn(c, j))  Blöcke setzen (Lagen j0..j1, nur freie Zellen)
 *   feld(teil, r, achse, start, B, H, j0, fn(q, jj, B, H), nurTeile, d8)  Farbfeld auf vorhandene Wandzellen (Teile nurTeile; d8: nur diese Wandlage)
 */
function ausstatter(api) {
  const { D, set, ersetze, zellen, key, Y } = api;
  const cellsIn = (r) => D.cells.filter((c) => c.u >= r.u0 && c.u < r.u1 && c.w >= r.w0 && c.w < r.w1);
  const quader = (teil, r, j0, j1, typ) => {
    for (const c of cellsIn(r)) for (let j = j0; j <= j1; j++) set(c.x, Y(j), c.z, typeof typ === 'function' ? typ(c, j) : typ, teil);
  };
  const feld = (teil, r, achse, start, B, H, j0, fn, nurTeile, d8) => {
    let n = 0;
    for (const c of cellsIn(r)) {
      if (d8 !== undefined && c.d8 !== d8) continue;
      const q = Math.floor((achse === 'u' ? c.u : c.w) - start);
      if (q < 0 || q >= B) continue;
      for (let jj = 0; jj < H; jj++) {
        const e = zellen.get(key(c.x, Y(j0 + jj), c.z));
        if (!e || (nurTeile && !nurTeile.includes(e.p)) || e.p === 'fenster') continue;
        const t = fn(q, jj, B, H);
        if (t == null) continue;
        ersetze(c.x, Y(j0 + jj), c.z, t, teil); n++;
      }
    }
    return n;
  };
  return { cellsIn, quader, feld };
}

// ------------------------------------------------------------------ Gemalte Felder (alles vereinfacht, nicht nach Vorbild)
// Jedes Motiv ist eine Farbfunktion (q, jj, B, H) -> Blocktyp; q Spalte 0..B−1, jj Zeile 0..H−1 (unten 0).
const _FR = (n) => WZ.fresko(n);
const _T = () => ({ gold: WZ.typ('gold'), holz: WZ.typ('holz'), weiss: WZ.typ('marmor_weiss') });
const _hash = (a, b, c) => ((a * 73856093) ^ (b * 19349663) ^ (c * 83492791)) >>> 0;
const _rahmen = (inner) => (q, j, B, H) => ((q === 0 || q === B - 1 || j === 0 || j === H - 1) ? _T().gold : inner(q - 1, j - 1, B - 2, H - 2));

const malerei = {
  rahmen: _rahmen,
  /**
   * Tafelbild mit Goldrahmen. o: { himmel, boden, gewand: [Farben], motiv: 'figur' | 'gruppe' | 'kreuz' | 'taufe' | 'geburt' | 'himmel' }
   */
  tafel: (o = {}) => _rahmen((q, j, B, H) => {
    const t = _T(), cx = Math.floor((B - 1) / 2), dx = Math.abs(q - cx);
    const himmel = _FR(o.himmel || 'hellblau'), boden = _FR(o.boden || 'braun'), g = o.gewand || ['rot', 'blau', 'weiss'];
    const bh = Math.max(1, Math.floor(H * 0.22));
    if (o.motiv === 'himmel') {                                    // Gloriole: Wolkenband, Gold im Zentrum
      const r = Math.hypot(q - cx, (j - H / 2) * 1.2);
      return r < 1.5 ? t.gold : (_hash(q, j, 3) % 4 === 0 ? _FR('weiss') : (r < 4 ? _FR('gelb') : himmel));
    }
    if (j < bh) return o.motiv === 'taufe' && dx <= 1 ? _FR('blau') : boden;
    if (o.motiv === 'kreuz') {
      for (const off of [-Math.floor(B / 4), 0, Math.floor(B / 4)]) {
        const x = cx + off, hoch = off === 0 ? H - 1 : H - 3;
        if (q === x && j <= hoch) return j === hoch - 1 ? _FR('orange') : t.holz;
        if (j === hoch - 2 && Math.abs(q - x) === 1) return t.holz;
      }
      if (j < bh + 2 && dx > 2) return _FR(g[(q + j) % g.length]);
      return himmel;
    }
    if (o.motiv === 'taufe') {
      if (dx === 0 && j < bh + 4) return j === bh + 3 ? _FR('orange') : (j === bh + 2 ? _FR('weiss') : _FR('braun'));
      if (dx === 0 && j === bh + 4) return t.gold;
      if (q >= B - 2 && j < bh + 4) return _FR(g[0]);
      return himmel;
    }
    if (o.motiv === 'geburt') {
      if (j < bh + 2 && dx <= 1) return _FR('weiss');
      if (j < bh + 3 && q === Math.floor(B / 4)) return _FR(g[0]);
      if (j === bh + 3 && dx === 0) return t.gold;
      return himmel;
    }
    if (o.motiv === 'gruppe') {
      const sp = q % 3;
      if (sp === 1 && j < bh + 4) return _FR(g[_hash(q, 5, 1) % g.length]);
      if (sp === 1 && j === bh + 4) return _FR('orange');
      return himmel;
    }
    if (dx <= 1 && j < bh + 4) return _FR(g[dx === 0 ? 0 : 1]);                // 'figur'
    if (dx === 0 && j === bh + 4) return _FR('orange');
    if (dx <= 1 && j === bh + 5) return t.gold;                                  // Heiligenschein
    return himmel;
  })
};

/**
 * Modul-Fabrik: planFn() -> { zellen, teile, oeff, unz }; oeffTeil: Abbildung Öffnungs-Teil -> Bauteil (z. B. { portal: 'fassade' }).
 * modul(n, liste) -> { module, build(ctx) }.
 */
function modul(planFn, oeffTeil = {}) {
  return (n, liste) => ({
    module: n,
    build(ctx) {
      const Pl = planFn();
      for (const id of liste) {
        const keys = Pl.teile.get(id) || [];
        if (keys.length) {
          const cells = keys.map((k) => Pl.zellen.get(k));
          const typ = new Map(cells.map((c) => [c.x + ',' + c.y + ',' + c.z, c.t]));
          ctx.part(id).fill(cells, (x, y, z) => typ.get(x + ',' + y + ',' + z));
        }
        for (const [k, z] of Pl.oeff) { const [art, pp] = k.split('|'); if ((oeffTeil[pp] || pp) === id) ctx.oeffnung(z, art); }
        for (const [k, z] of Pl.unz) { const i = k.indexOf('|'); if (k.slice(0, i) === id) ctx.unzugaenglich(z, k.slice(i + 1)); }
      }
    }
  });
}

module.exports = { werkzeuge, licht, modul, ausstatter, malerei, rund, ell, mod, N4, N8, key };
