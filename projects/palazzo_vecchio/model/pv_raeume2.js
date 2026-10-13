'use strict';
// Palazzo Vecchio, B2: ausgestaltete Räume mit Trennwänden (Sala dei Gigli, Studiolo, Sala delle Carte Geografiche, Quartiere).
// Wandverkleidungen sind eine Lage Zellen, die an die Wand grenzt; Decken sind eine Lage unter der Geschossplatte.
const pv = require('./pv_lib.js');
const palette = require('../../../tools/spec/palette.js');
const { plan, GESCHOSSE } = require('./pv_plan.js');
const { hash, F, setzeFigur, TY } = require('./pv_raeume.js');

const inRect = (R, r) => r.u >= R.u0 && r.u < R.u1 && r.w >= R.w0 && r.w < R.w1;
const raum = (S, id) => plan(S.g).raeume.find((q) => q.id === id);

/**
 * Wandverkleidung: eine Lage Zellen im Raum R, die an eine feste Zelle (Wand) grenzen; y von yLo bis yHi.
 * mat(a, y, dx, dz): a = Koordinate längs der Wand (z bei Wand in x-Richtung, sonst x). null = frei lassen.
 */
function haut(S, W, R, yLo, yHi, mat, tag) {
  const cells = S.g.recs.filter((r) => inRect(R, r));
  let n = 0;
  for (let y = yLo; y <= yHi; y++) {
    const neu = [];                      // erst sammeln, dann setzen (sonst wüchse die Verkleidung über den ganzen Raum)
    for (const r of cells) {
      if (S.has(r.x, y, r.z)) continue;
      for (const [dx, dz] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) {
        if (!S.has(r.x + dx, y, r.z + dz)) continue;
        const t = mat(dx !== 0 ? r.z : r.x, y, dx, dz, r);
        if (t) neu.push([r, t]);
        break;
      }
    }
    for (const [r, t] of neu) if (S.put(W, r.x, y, r.z, t, tag)) n++;
  }
  return n;
}

/** Deckenlage unter der Platte (y = decke - 1, oder yTop) über den Zellen des Raumes. */
function decke(S, W, R, mat, tag, yTop) {
  const ge = GESCHOSSE[R.ge];
  const y = yTop === undefined ? ge.decke - 1 : yTop;
  let n = 0;
  for (const r of S.g.recs) {
    if (!inRect(R, r) || r.d8 <= pv.tWall(ge.stand)) continue;
    const t = mat(r, y);
    if (t && S.put(W, r.x, y, r.z, t, tag)) n++;
  }
  return n;
}

/** Lilie (Fleur-de-lis) 6 x 6: la, lb in 0..5. */
const lilie = (la, lb) => (la >= 2 && la <= 3 && lb >= 1 && lb <= 4) || ((la === 1 || la === 4) && lb === 2) || ((la === 0 || la === 5) && lb === 1);
const mod = (v, m) => ((Math.floor(v) % m) + m) % m;

/** Tisch aus Holz: eine Lage hoch (begehbar), x0/z0 Weltzelle, nx x nz Zellen. */
function tisch(S, W, x0, z0, nx, nz, y, tag) {
  for (let i = 0; i < nx; i++) for (let j = 0; j < nz; j++) S.put(W, x0 + i, y, z0 + j, TY.holz, tag);
}
const weltZelle = (S, u, w) => { const p = S.g.rf.toWorld(u, w); return { x: Math.round(p.x), z: Math.round(p.z) }; };

// ---------------------------------------------------------------- Sala dei Gigli (OG1): Lilien blau/gold
function gigli(ctx, S) {
  const W = ctx.part('sala_dei_gigli'), R = raum(S, 'gigli'), tag = 'sala_dei_gigli';
  let n = haut(S, W, R, 18, 31, (a, y) => {
    if (y <= 19) return TY.holz;                                        // Täfelung
    if (y === 30) return TY.gold;
    if (y === 31) return F('blau');
    return lilie(mod(a, 6), (y - 20) % 6) ? TY.gold : F('blau');
  }, tag);
  n += decke(S, W, R, (r) => (lilie(mod(r.u, 6), mod(r.w, 6)) ? TY.gold : F('blau')), tag);   // Lilien-Decke
  // langer Tisch mit Bank aus Treppenblöcken und Donatellos Judith (Bronze) auf einem Sockel
  const c = weltZelle(S, 67, 37);
  tisch(S, W, c.x - 5, c.z - 1, 11, 2, 17, tag);
  for (let i = 0; i < 11; i++) S.put(W, c.x - 5 + i, 17, c.z - 2, palette.treppe('holz', 'o'), tag);
  const j = weltZelle(S, 73, 32);
  setzeFigur(S, W, j.x, 17, j.z, { achse: 'x', dt: 1, pose: 1, stoff: TY.bronze, kopf: 'gold' }, tag);
  return n;
}

// ---------------------------------------------------------------- Studiolo Francesco I. (OG1): Bildtafeln dicht an dicht, Tonnengewölbe
function studiolo(ctx, S) {
  const W = ctx.part('studiolo_francesco'), R = raum(S, 'studiolo'), tag = 'studiolo_francesco';
  const FARB = ['rot', 'blau', 'gruen', 'gelb', 'weiss', 'orange', 'hellblau', 'braun'];
  let n = haut(S, W, R, 18, 31, (a, y) => {
    if (y === 18) return TY.holz;
    if (y >= 27) return F('blau');
    const la = mod(a, 4), lb = (y - 19) % 4;
    if (la === 0 || lb === 3) return TY.holz;                          // Rahmen der Schranktüren
    if (la === 2 && lb === 1) return TY.gold;
    return F(FARB[Math.floor(hash(Math.floor(a / 4), Math.floor((y - 19) / 4), 11) * FARB.length)]);
  }, tag);
  // Tonnengewölbe quer zur Raumachse: in der Mitte y 32, an den Rändern bis y 27 herab
  const wm = (R.w0 + R.w1) / 2, half = (R.w1 - R.w0) / 2;
  for (const r of S.g.recs) {
    if (!inRect(R, r) || r.d8 <= pv.tWall(GESCHOSSE.og1.stand)) continue;
    const q = Math.abs(r.w - wm) / half;
    const drop = Math.min(5, Math.floor(q * q * 6));
    for (let y = 32 - drop; y <= 32; y++) if (S.put(W, r.x, y, r.z, hash(r.x, y, r.z) > 0.9 && y === 32 - drop ? TY.gold : F('blau'), tag)) n++;
  }
  const c = weltZelle(S, 85, 33);                                       // kleiner Schreibtisch und Stuhl
  tisch(S, W, c.x - 1, c.z - 1, 3, 2, 17, tag);
  S.put(W, c.x + 2, 17, c.z, palette.treppe('holz', 'w'), tag);
  return n;
}

// ---------------------------------------------------------------- Sala delle Carte Geografiche (OG2)
function landkarte(seed, a, b) {
  if (b < 1) return TY.gold;
  const q = hash(seed, a >> 1, b >> 1);
  return q > 0.55 ? (hash(seed + 5, a, b) > 0.7 ? F('braun') : F('gruen')) : (b % 3 === 0 && a % 4 === 0 ? F('weiss') : F('hellblau'));
}
function carte(ctx, S) {
  const W = ctx.part('sala_carte_geografiche'), R = raum(S, 'carte'), tag = 'sala_carte_geografiche';
  let n = haut(S, W, R, 35, 48, (a, y, dx) => {
    if (y <= 37) return TY.holz;                                         // Unterschrank
    if (y >= 47) return y === 47 ? TY.gold : TY.holz;                    // Gesims
    const la = mod(a, 7), lb = y - 38;
    if (la === 0 || lb === 0 || lb === 8) return TY.holz;                // Schrankleisten
    return landkarte(Math.floor(a / 7) * 3 + (dx !== 0 ? 1 : 2), la, lb);
  }, tag);
  // Globus: Kugel R 4,4 auf Sockel, Meere blau, Kontinente grün/braun, goldener Äquator, weiße Polkappe
  const c = weltZelle(S, 73, 42), cy = 41;
  for (let dx = -1; dx <= 1; dx++) for (let dz = -1; dz <= 1; dz++) for (let y = 34; y <= 36; y++) S.put(W, c.x + dx, y, c.z + dz, TY.holz, tag);
  for (let dx = -5; dx <= 5; dx++) for (let dz = -5; dz <= 5; dz++) for (let dy = -4; dy <= 5; dy++) {
    const d = Math.sqrt(dx * dx + dz * dz + dy * dy);
    if (d > 4.4) continue;
    const lon = Math.atan2(dz, dx), lat = Math.asin(dy / Math.max(d, 0.01));
    let t;
    if (dy === 0) t = TY.gold;
    else if (dy >= 4) t = F('weiss');
    else t = hash(Math.round(lon * 3), Math.round(lat * 3), 21) > 0.5 ? (hash(Math.round(lon * 5), Math.round(lat * 5), 8) > 0.5 ? F('gruen') : F('braun')) : F('blau');
    if (S.put(W, c.x + dx, cy + dy, c.z + dz, t, tag)) n++;
  }
  // Luft um die Kugel (Standflächen auf der Wölbung) ist nicht begehbar
  const luft = [];
  for (let dx = -5; dx <= 5; dx++) for (let dz = -5; dz <= 5; dz++) for (let y = 37; y <= 47; y++) if (!S.has(c.x + dx, y, c.z + dz)) luft.push({ x: c.x + dx, y: y + S.bodenY, z: c.z + dz });
  ctx.unzugaenglich(luft, 'Luft um den großen Globus: die Standflächen liegen auf der Kugelwölbung zwei bis zwölf Blöcke über dem Boden und gehören zum Ausstellungsstück, nicht begehbar');
  return n;
}

// ---------------------------------------------------------------- Quartiere: Deckenfresken
function medaillon(r, cu, cw, rad, innen, ring) {
  const d = Math.hypot(r.u - cu, r.w - cw);
  if (d < rad - 1) return innen;
  if (d < rad) return ring;
  return null;
}
function leoneX(ctx, S) {
  const W = ctx.part('quartiere_leone_x'), R = raum(S, 'leone_x'), tag = 'quartiere_leone_x';
  let n = haut(S, W, R, 18, 31, (a, y) => (y <= 19 ? TY.holz : y === 20 ? TY.gold : y === 30 ? TY.gold : y === 31 ? F('gruen') : TY.putz_weiss), tag);
  n += decke(S, W, R, (r) => {                                         // Kassettendecke mit Medaillons im Raster 9
    const iu = Math.floor((r.u - R.u0) / 9), iw = Math.floor((r.w - R.w0) / 9);
    const m = medaillon(r, R.u0 + iu * 9 + 4.5, R.w0 + iw * 9 + 4.5, 3.4, F(['rot', 'blau', 'gelb'][(iu + iw) % 3]), TY.gold);
    return m || ((Math.floor(r.u) + Math.floor(r.w)) % 9 === 0 ? TY.holz : F('weiss'));
  }, tag);
  return n;
}
function elementi(ctx, S) {
  const W = ctx.part('quartiere_elementi'), R = raum(S, 'elementi'), tag = 'quartiere_elementi';
  const um = (R.u0 + R.u1) / 2, wm = (R.w0 + R.w1) / 2;
  const FARBEN = [['orange', 'rot'], ['hellblau', 'blau'], ['gruen', 'braun'], ['weiss', 'hellblau']];   // Feuer, Wasser, Erde, Luft
  let n = haut(S, W, R, 35, 47, (a, y) => (y <= 36 ? TY.holz : y === 37 ? TY.gold : y === 47 ? TY.gold : TY.putz_weiss), tag);
  n += decke(S, W, R, (r) => {
    const q = (r.u < um ? 0 : 1) + (r.w < wm ? 0 : 2);
    const [innen, aussen] = FARBEN[q];
    const cu = q % 2 === 0 ? (R.u0 + um) / 2 : (um + R.u1) / 2, cw = q < 2 ? (R.w0 + wm) / 2 : (wm + R.w1) / 2;
    return medaillon(r, cu, cw, 4.6, F(innen), TY.gold) || F(aussen);
  }, tag);
  return n;
}

module.exports = { gigli, studiolo, carte, leoneX, elementi, haut, decke };
