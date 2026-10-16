'use strict';
// Loggia del Mercato Nuovo (Katalog: 20_Stadtmodell_Florenz/wahrzeichen/mercato_nuovo/): offene Markthalle von
// Giovanni Battista del Tasso (1547–51) für den Handel mit Seide und Gold. Rechteckige Halle auf Pfeilern und Säulen,
// ringsum Rundbögen, innen Kreuzgewölbe, darüber ein Attikageschoss mit kleinen Fenstern und ein Walmdach; an der
// Südseite der Bronzeeber (Fontana del Porcellino, Pietro Tacca 1633).
// Rahmen MN: u nach Osten (0..46,5), w nach Süden (0..63); Lagen yr = Y − 65.

const fs = require('node:fs');
const path = require('node:path');
const WZ = require('../../../tools/wahrzeichen');
const PAL = require('../../../tools/spec/palette.js');
const P = require('../../../tools/city/poly.js');

const DIR = path.resolve(__dirname, '..');
const GRUND = require('../spec/ground.js');
const BODEN_Y = 65;
const Y = (yr) => BODEN_Y + yr;

const U1 = 46.5, W1 = 63;
const JU = U1 / 3, JW = W1 / 4;            // drei Joche quer, vier längs
const KAEMPFER = 14, SCHEITEL_GW = 26, ATTIKA = 32, DACH = 6;

const T = {
  forte: WZ.typ('pietra_forte'), bruch: WZ.typ('pietra_forte_bruch'), serena: WZ.typ('pietra_serena'), putz: WZ.typ('putz_weiss'),
  ziegel: WZ.typ('dachziegel'), mauer: WZ.typ('mauerwerk'), ornament: WZ.typ('marmor_ornament'), bronze: WZ.typ('bronze'),
  weiss: WZ.typ('marmor_weiss'), licht: WZ.typ('licht'), pflaster: WZ.typ('pflaster')
};
const GLAS = PAL.typesForRole('glas');

let L = null;
function lade() {
  if (L) return L;
  const json = JSON.parse(fs.readFileSync(path.join(DIR, 'project.json'), 'utf8'));
  const masken = WZ.ladeMasken(json, { dir: DIR });
  const R = masken.rahmen, H = masken.haupt;
  const alle = H.cells.map(([x, z]) => { const l = R.toLocal(x, z); return { x, z, u: l.u, w: l.w, d8: H.d8(x, z), gt: GRUND.groundTopY(x, z) }; });
  const byKey = new Map(alle.map((c) => [P.ck(c.x, c.z), c]));
  L = { json, masken, R, H, alle, byKey };
  return L;
}
const zelleBei = (x, z) => lade().byKey.get(P.ck(x, z));
const rund = (y0, x, a) => (Math.abs(x) < a ? Math.floor(y0 + Math.sqrt(a * a - x * x)) : -1);
const nahe = (v, j, n, d) => { for (let k = 0; k <= n; k++) if (Math.abs(v - k * j) < d) return true; return false; };
// Pfeiler am Rand und Säulen innen auf den Jochgrenzen
const stuetze = (c) => nahe(c.u, JU, 3, 1.6) && nahe(c.w, JW, 4, 1.6);
function gewoelbe(c) {
  const ku = Math.min(2, Math.floor(c.u / JU)), kw = Math.min(3, Math.floor(c.w / JW));
  const du = (c.u - (ku + 0.5) * JU) / (JU / 2), dw = (c.w - (kw + 0.5) * JW) / (JW / 2);
  const f = (t) => Math.sqrt(Math.max(0, 1 - Math.min(1, Math.abs(t))));
  return Math.floor(KAEMPFER + 2 + (SCHEITEL_GW - KAEMPFER - 2) * Math.max(f(du), f(dw)));
}
const dachLage = (c) => ATTIKA + 1 + Math.min(DACH, Math.floor((c.d8 - 1) / 2));

let PLAN = null;
function plan() {
  if (PLAN) return PLAN;
  const D = lade();
  const zellen = new Map(), teile = new Map();
  const key = (x, y, z) => x + ',' + y + ',' + z;
  const luft = new Set();
  const set = (x, y, z, t, p) => {
    const k = key(x, y, z);
    if (zellen.has(k) || luft.has(k)) return false;
    zellen.set(k, { x, y, z, t, p }); let a = teile.get(p); if (!a) teile.set(p, a = []); a.push(k); return true;
  };
  const hat = (x, y, z) => zellen.has(key(x, y, z));
  const oeff = new Map();
  const oeffnung = (art, p, x, y, z) => { const k = art + '|' + p; if (!oeff.has(k)) oeff.set(k, []); oeff.get(k).push({ x, y, z }); luft.add(key(x, y, z)); };
  const unz = new Map();
  const unzug = (p, b, x, y, z) => { const k = p + '|' + b; if (!unz.has(k)) unz.set(k, []); unz.get(k).push({ x, y, z }); };
  const N8 = [[1, 0], [-1, 0], [0, 1], [0, -1], [1, 1], [1, -1], [-1, 1], [-1, -1]];

  // ---- Öffnungen: Rundbögen ringsum (Außenzellen d8 ≤ 2 zwischen den Pfeilern)
  for (const c of D.alle) {
    if (c.d8 > 2 || stuetze(c)) continue;
    const quer = c.w < 2.5 || c.w > W1 - 2.5;                      // Nord- und Südseite: Lage entlang u
    const v = quer ? c.u : c.w, j = quer ? JU : JW;
    const m = (Math.floor(v / j) + 0.5) * j;
    for (let yr = 1; yr <= rund(KAEMPFER, v - m, j / 2 - 1.6); yr++) oeffnung('arkade', 'boegen', c.x, Y(yr), c.z);
  }

  // ---- Modul 0: Fundament und Boden (Marmorrad in der Mitte: die „pietra dello scandalo“)
  for (const c of D.alle) for (let y = c.gt + 1; y <= Y(-1); y++) set(c.x, y, c.z, T.bruch, 'fundament');
  for (const c of D.alle) {
    const r = Math.hypot(c.u - U1 / 2, c.w - W1 / 2);
    set(c.x, Y(0), c.z, r < 2.5 ? (r < 1.2 ? T.weiss : T.ornament) : ((Math.floor(c.u / 3) + Math.floor(c.w / 3)) & 1 ? T.serena : T.pflaster), 'boden');
  }

  // ---- Modul 1: Pfeiler, Säulen und Bögen
  for (const c of D.alle) {
    if (stuetze(c)) {
      for (let yr = 1; yr <= KAEMPFER; yr++) set(c.x, Y(yr), c.z, yr === KAEMPFER ? T.ornament : (c.d8 <= 2 ? T.forte : T.serena), c.d8 <= 2 ? 'pfeiler' : 'saeulen');
      if (c.d8 <= 2) for (let yr = KAEMPFER + 1; yr <= SCHEITEL_GW; yr++) set(c.x, Y(yr), c.z, yr <= KAEMPFER + 8 ? T.serena : T.forte, 'boegen');   // Bogenzwickel über den Pfeilern
      continue;
    }
    if (c.d8 > 2) continue;
    for (let yr = 1; yr <= ATTIKA; yr++) {
      if (hat(c.x, Y(yr), c.z) || luft.has(key(c.x, Y(yr), c.z))) continue;
      if (yr > SCHEITEL_GW) break;
      set(c.x, Y(yr), c.z, yr <= KAEMPFER + 8 ? T.serena : T.forte, 'boegen');
    }
  }

  // ---- Modul 2: Kreuzgewölbe, Attika mit Fenstern
  for (const c of D.alle) {
    if (c.d8 <= 2 || stuetze(c)) continue;
    const dk = gewoelbe(c);
    let lo = dk;
    for (const [dx, dz] of N8) { const n = zelleBei(c.x + dx, c.z + dz); if (n && n.d8 > 2 && !stuetze(n)) { const nd = gewoelbe(n); if (nd < lo) lo = nd; } }
    for (let yr = Math.min(lo, dk); yr <= dk; yr++) if (!hat(c.x, Y(yr), c.z)) set(c.x, Y(yr), c.z, T.putz, 'gewoelbe');
    for (let yr = dk + 1; yr <= ATTIKA; yr++) if (!hat(c.x, Y(yr), c.z)) unzug('attika', 'Raum über den Gewölben (ohne Zugang)', c.x, Y(yr), c.z);
  }
  for (const c of D.alle) {                                          // Säulenköpfe bis an die Gewölbe
    if (!stuetze(c) || c.d8 <= 2) continue;
    for (let yr = KAEMPFER + 1; yr <= SCHEITEL_GW; yr++) { if (hat(c.x, Y(yr), c.z)) break; set(c.x, Y(yr), c.z, T.putz, 'gewoelbe'); }
  }
  for (const c of D.alle) {
    if (c.d8 > 2) continue;
    const quer = c.w < 2.5 || c.w > W1 - 2.5, v = quer ? c.u : c.w, j = quer ? JU : JW;
    const m = (Math.floor(v / j) + 0.5) * j;
    for (let yr = SCHEITEL_GW + 1; yr <= ATTIKA; yr++) {
      if (hat(c.x, Y(yr), c.z)) continue;
      const fe = c.d8 === 1 && Math.abs(v - m) < 1.5 && yr >= 28 && yr <= 30;
      set(c.x, Y(yr), c.z, fe ? GLAS[(Math.round(v) + yr) % GLAS.length] : (yr === ATTIKA ? T.serena : T.forte), 'attika');
    }
  }

  // ---- Modul 3: Walmdach
  for (const c of D.alle) {
    const top = dachLage(c);
    let lo = top;
    for (const [dx, dz] of N8) { const n = zelleBei(c.x + dx, c.z + dz); const nt = n ? dachLage(n) : ATTIKA + 1; if (nt < lo) lo = nt; }
    for (let yr = lo; yr <= top; yr++) if (!hat(c.x, Y(yr), c.z)) set(c.x, Y(yr), c.z, yr === top ? T.ziegel : T.mauer, 'dach');
    for (let yr = ATTIKA + 1; yr < lo; yr++) if (!hat(c.x, Y(yr), c.z)) unzug('dach', 'Dachraum (ohne Zugang)', c.x, Y(yr), c.z);
  }

  // ---- Modul 4: Fontana del Porcellino (Bronzeeber an der Südseite, innen vor dem mittleren Pfeiler) und Licht
  for (const c of D.alle) {
    if (Math.abs(c.u - (JU + 0.5)) > 1 || c.w < W1 - 6 || c.w > W1 - 4) continue;
    set(c.x, Y(1), c.z, T.serena, 'porcellino');
    set(c.x, Y(2), c.z, T.bronze, 'porcellino');
  }
  const steh = [];
  for (const c of D.alle) { const b = zellen.get(key(c.x, Y(0), c.z)); if (b && b.p === 'boden' && !hat(c.x, Y(1), c.z) && !hat(c.x, Y(2), c.z)) steh.push({ x: c.x, y: Y(1), z: c.z }); }
  const lt = [];
  for (const l of WZ.lichtRaster(steh, { abstand: 12 })) {
    const k = key(l.x, l.y, l.z); const e = zellen.get(k); if (!e || e.t !== T.pflaster && e.t !== T.serena) continue;
    teile.set(e.p, teile.get(e.p).filter((q) => q !== k)); e.t = T.licht; e.p = 'licht'; lt.push(k);
  }
  teile.set('licht', lt);

  PLAN = { zellen, teile, oeff, unz };
  return PLAN;
}

function modul(n, liste) {
  return {
    module: n,
    build(ctx) {
      const Pl = plan();
      for (const id of liste) {
        const keys = Pl.teile.get(id) || [];
        if (keys.length) {
          const cells = keys.map((k) => Pl.zellen.get(k));
          const typ = new Map(cells.map((c) => [c.x + ',' + c.y + ',' + c.z, c.t]));
          ctx.part(id).fill(cells, (x, y, z) => typ.get(x + ',' + y + ',' + z));
        }
        for (const [k, z] of Pl.oeff) { const [art, pp] = k.split('|'); if (pp === id) ctx.oeffnung(z, art); }
        for (const [k, z] of Pl.unz) { const i = k.indexOf('|'); if (k.slice(0, i) === id) ctx.unzugaenglich(z, k.slice(i + 1)); }
      }
    }
  };
}

module.exports = { modul, lade, plan, zelleBei, Y, BODEN_Y, T, KAEMPFER, ATTIKA, JU, JW };
