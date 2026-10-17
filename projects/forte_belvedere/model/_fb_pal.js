'use strict';
// Palazzina del Belvedere (Ammannati, 1560er; OSM w160800063): weißer Kubus in der Mitte der Festung, drei Geschosse, im Erdgeschoss
// zwei durchgehende Logge in der Mitte der Längsseiten (hier: eine durchgehende Halle mit je drei Bögen an beiden Enden), Fenster nach
// oben kleiner, Uhr an der Nordfassade (18. Jh.), die oberen Geschosse nur über eine enge Treppe. Rahmen PL (θ 2,5°, Ursprung (−501 | 2251,5)):
// u nach Osten (0..74), w nach Süden (−9,5..73). Lagen yr = Y − 185: Böden 0, 5, 10, Decke 15, Dach 16..18.
const WZ = require('../../../tools/wahrzeichen');
const PAL = require('../../../tools/spec/palette.js');

const FL = [0, 5, 10], CEIL = 15;
const HALL_N = 26, HALL_S = 50, WCEN = 38;
const roofTop = (c) => 16 + Math.min(2, Math.floor(c.dP / 10));
const FB = () => require('./_fb.js');

function partition(c) {
  const w = c.pw, u = c.pu;
  if (Math.abs(w - HALL_N) <= 1.1 || Math.abs(w - HALL_S) <= 1.1) return true;
  return (w < 25 || w > 51) && (Math.abs(u - 24) <= 1.1 || Math.abs(u - 44) <= 1.1);
}
function tuerLuecke(c) {
  if (!(Math.abs(c.pw - HALL_N) <= 1.1 || Math.abs(c.pw - HALL_S) <= 1.1)) return false;
  return [12, 34, 56].some((uc) => Math.abs(c.pu - uc) <= 1.6);
}
function raumId(c) {
  const i = c.pu < 23 ? 0 : c.pu < 43 ? 1 : 2;
  return c.pw < HALL_N ? 'N' + i : c.pw < HALL_S ? 'H' : 'S' + i;
}
function bogenOben(c) {
  if (c.dP > 3 || !(c.pu < 12 || c.pu > 58)) return 0;
  for (const wb of [WCEN - 8, WCEN, WCEN + 8]) {
    const d = Math.abs(c.pw - wb);
    if (d <= 2.5) return 3 + (d <= 1.5 ? 1 : 0);
  }
  return 0;
}
let KR = null;
function kantenInfo(D, c) {
  if (!KR) KR = D.palMaske.kanten();
  if (c.pe === undefined) { c.pe = D.palMaske.naechsteKante(c.x, c.z); c.pue = KR[c.pe].rahmen.toLocal(c.x, c.z).u; c.pL = KR[c.pe].L; }
}
/** Fensterlage: 0 = keins, sonst Geschossindex 1..3 */
function fensterGeschoss(D, c, yr) {
  kantenInfo(D, c);
  if (c.pL < 8) return false;
  const f = yr >= 2 && yr <= 4 ? 0 : yr >= 7 && yr <= 9 ? 1 : yr >= 12 && yr <= 14 ? 2 : -1;
  if (f < 0) return false;
  const halb = f === 2 ? 0.6 : 1.0;
  let nah = false;
  for (let m = 4; m < c.pL - 3.5; m += 7) if (Math.abs(c.pue - m) <= halb) { nah = true; break; }
  if (!nah) return false;
  if (f === 0 && (c.pu < 12 || c.pu > 58) && Math.abs(c.pw - WCEN) <= 13.5) return false;   // Logge
  if (f === 2 && c.pe === 7 && Math.abs(c.pue - 17) < 3.5) return false;                    // Uhr
  return true;
}

// ------------------------------------------------------------------ Treppen
function sucheLauf(D, erlaubt, n, breite, dir, score, sperre) {
  let best = null;
  for (const c of D.alle) {
    if (!c.pal || !erlaubt(c)) continue;
    const arr = WZ.treppe.geradeTreppe({ start: { x: c.x, y: 0, z: c.z }, richtung: dir, stufen: n, breite, rolle: 'pietra_forte' });
    const zs = new Set();
    for (const b of arr) for (let dx = -1; dx <= 1; dx++) for (let dz = -1; dz <= 1; dz++) zs.add((b.x + dx) + ',' + (b.z + dz));
    const d = WZ.treppe.DIR[dir];
    for (const b of arr.slice(-breite)) for (let r = 1; r <= 3; r++) zs.add((b.x + d[0] * r) + ',' + (b.z + d[1] * r));
    let ok = true;
    for (const k of zs) { const q = D.byKey.get(k); if (!q || !q.pal || !erlaubt(q) || (sperre && sperre.has(k))) { ok = false; break; } }
    if (!ok) continue;
    const s = score(c);
    if (!best || s < best.s) best = { s, x: c.x, z: c.z, zs, dir, n, breite };
  }
  if (!best) throw new Error('Forte Belvedere: keine Treppenfläche in der Palazzina');
  return best;
}
let TR = null;
function treppen(D) {
  if (TR) return TR;
  const frei = (c) => c.dP > 5 && !partition(c) && raumId(c) === 'N0' && c.pu < 22 && c.pw < 24;
  const a = sucheLauf(D, frei, 5, 2, 's', (c) => c.pu + c.pw * 0.3);
  const b = sucheLauf(D, frei, 5, 2, 'o', (c) => c.pw * 2 - c.pu, a.zs);
  TR = { a, b };
  return TR;
}

// ------------------------------------------------------------------ Plan
function vorab(api) {
  const { P, D, Y } = api;
  const tr = treppen(D);
  const laeufe = [
    WZ.treppe.geradeTreppe({ start: { x: tr.a.x, y: Y(1), z: tr.a.z }, richtung: tr.a.dir, stufen: 5, breite: 2, rolle: 'pietra_forte' }),
    WZ.treppe.geradeTreppe({ start: { x: tr.b.x, y: Y(6), z: tr.b.z }, richtung: tr.b.dir, stufen: 5, breite: 2, rolle: 'pietra_forte' })
  ];
  D.palLaeufe = laeufe;
  for (const arr of laeufe) for (const c of WZ.treppe.treppenloch(arr.lauf)) P.luft(c.x, c.y, c.z);
  for (const c of D.alle) {
    if (!c.pal) continue;
    const h = bogenOben(c);
    for (let yr = 1; yr <= h; yr++) P.oeffnung('arkade', 'pal_fassade', c.x, Y(yr), c.z);
  }
  for (const arr of laeufe) {
    for (const b of arr) P.set(b.x, b.y, b.z, b.typ, 'pal_treppe');
    for (const b of arr) if (PAL.isTreppe(b.typ) && !P.hat(b.x, b.y - 1, b.z)) P.set(b.x, b.y - 1, b.z, api.T.forte, 'pal_treppe');
  }
}

function zelle(api, c) {
  const { P, D, T, Y, hash } = api;
  const { x, z } = c;
  const wand = c.dP <= 3;
  const top = roofTop(c);
  if (wand) {
    P.set(x, Y(0), z, T.forte, 'pal_boden');
    for (let yr = 1; yr <= top; yr++) {
      if (P.istLuft(x, Y(yr), z)) continue;
      let t, p = 'pal_fassade';
      if (yr === top) { t = T.dach; p = 'pal_dach'; }
      else if (yr > CEIL) { t = c.dP === 1 ? T.putz : T.mauer; p = 'pal_dach'; }
      else if (c.dP === 1) t = (yr <= 2) ? T.forte : (FL.includes(yr) || yr === CEIL) ? T.orn : T.putz;
      else t = c.dP === 2 ? T.mauer : T.putz;
      if (fensterGeschoss(D, c, yr)) { t = T.glas; p = 'pal_fenster'; }
      P.set(x, Y(yr), z, t, p);
    }
    return;
  }
  // Innenraum: Böden, Trennwände, Decke, Dach
  const hall = raumId(c) === 'H';
  P.set(x, Y(0), z, hall ? (((Math.floor(c.pu / 3) + Math.floor(c.pw / 3)) & 1) ? T.weiss : T.serena) : T.holz, 'pal_boden');
  for (const f of [FL[1], FL[2]]) P.set(x, Y(f), z, T.holz, 'pal_geschosse');
  P.set(x, Y(CEIL), z, T.mauer, 'pal_geschosse');
  if (partition(c)) {
    const luecke = tuerLuecke(c);
    for (const f of FL) for (let yr = f + 1; yr <= f + 4; yr++) {
      if (luecke && yr <= f + 3) continue;
      P.set(x, Y(yr), z, yr === f + 4 && luecke ? T.putz : T.putz, 'pal_trennwaende');
    }
  }
  for (let yr = CEIL + 1; yr <= top; yr++) P.set(x, Y(yr), z, yr === top ? T.dach : T.mauer, 'pal_dach');
}

/** Seelaternen: je Raum und Geschoss im Raster 12. */
function licht(P, D) {
  const { Y, T } = FB();
  for (const f of FL) {
    const gruppen = new Map();
    for (const c of D.alle) {
      if (!c.pal || c.dP <= 3 || partition(c)) continue;
      const y = Y(f);
      const b = P.get(c.x, y, c.z);
      if (!b || b.p === 'pal_treppe' || P.hat(c.x, y + 1, c.z) || P.hat(c.x, y + 2, c.z) || P.hat(c.x, y + 3, c.z) || P.istLuft(c.x, y + 1, c.z)) continue;
      const id = raumId(c);
      (gruppen.get(id) || gruppen.set(id, []).get(id)).push({ x: c.x, y: y + 1, z: c.z });
    }
    for (const zs of gruppen.values()) for (const l of WZ.licht.lichtRaster(zs, { abstand: 12 })) P.ersetze(l.x, l.y, l.z, T.licht, 'licht');
  }
}

module.exports = { vorab, zelle, licht, treppen, partition, raumId, roofTop, bogenOben, FL, CEIL, HALL_N, HALL_S, WCEN };
