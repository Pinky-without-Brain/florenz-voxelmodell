'use strict';
// Palazzo Vecchio, B2: ausgestaltete Innenräume (BEGEHBARKEIT.md §2). Jeder Raum ist ein eigenes Bauteil von Modul 9 mit Content
// (Inhalt, Quelle, "vereinfacht"). Alle Bilder sind Farbfelder aus Fresko-Terrakotta, Figuren sind Blockfiguren.
const pv = require('./pv_lib.js');
const WZ = require('../../../tools/wahrzeichen');
const palette = require('../../../tools/spec/palette.js');
const { plan, GESCHOSSE } = require('./pv_plan.js');

const TY = pv.TY;
const F = (c) => WZ.fresko(c);

/** Deterministischer Zufall in [0, 1) aus drei ganzen Zahlen. */
function hash(a, b, c) {
  let h = (Math.imul(a | 0, 374761393) + Math.imul(b | 0, 668265263) + Math.imul(c | 0, 1274126177)) | 0;
  h = Math.imul(h ^ (h >>> 13), 1274126177);
  return ((h ^ (h >>> 16)) >>> 0) / 4294967296;
}

/** Schlachtenbild (Vasari, vereinfacht): Himmel, Hügel, Kampfgetümmel; a = 0..W-1 von links, b = 0..H-1 von unten. */
function schlacht(seed, a, b, W, H) {
  if (a < 1 || a >= W - 1 || b < 1 || b >= H - 1) return TY.gold;
  const hz = Math.round(H * 0.55);
  if (b >= hz + 3) return hash(seed, a >> 1, b >> 1) > 0.78 ? F('weiss') : F('hellblau');
  if (b >= hz) {
    const t = hash(seed + 1, a >> 2, 0);
    return t > 0.55 ? F('gruen') : t > 0.25 ? F('braun') : F('gruen');
  }
  if (a % 7 === 3 && b >= 3 && b <= 9) return F('gelb');                                  // Fahnenstangen
  const q = hash(seed + 2, a, b);
  if (q > 0.74) return [F('rot'), F('blau'), F('weiss'), F('schwarz'), F('rot'), F('gelb')][Math.floor(hash(seed + 3, a, b) * 6)];
  return b < 3 ? F('braun') : F('orange');
}

/** Freskenfarben des Hofes und der Kassetten. */
const KASSETTEN = ['blau', 'rot', 'gelb', 'gruen', 'hellblau', 'orange'];

// ---------------------------------------------------------------- Salone: Wände, Decke, Boden
/** Material der Salone-Wandzelle (Ring um das Lichtmaß, y_rel 17..56); undefined = Standard (Putz). */
function saloneWand(r, y) {
  const L = pv.SAL_LICHT;
  if (y > 52) return TY.putz_sand;
  const aufU = (r.u >= L.u0 - 1 && r.u < L.u0) || (r.u >= L.u1 && r.u < L.u1 + 1);
  const aufW = (r.w >= L.w0 - 1 && r.w < L.w0) || (r.w >= L.w1 && r.w < L.w1 + 1);
  if (aufU && r.w >= L.w0 && r.w < L.w1 && (r.w - L.w0) % 8 < 2) return TY.pietra_serena;   // Pilaster
  if (aufW && r.u >= L.u0 && r.u < L.u1 && (r.u - L.u0) % 8 < 2) return TY.pietra_serena;
  const stand = 17;
  if (aufW && r.u >= L.u0 && r.u < L.u1) {
    // Langwände: vier große Schlachtbilder je Wand (je 24 Blöcke, hinter den Pilastern durchlaufend), y 24..44
    const j = Math.floor((r.u - L.u0) / 24);
    if (y < stand + 3) return TY.pietra_serena;                 // Sockelzone
    if (y >= 24 && y <= 44 && j <= 3) {
      const a = Math.floor(r.u - L.u0 - 24 * j), b = y - 24;
      return schlacht((r.w < L.w0 + 20 ? 10 : 20) + j, a, b, 24, 21);
    }
    if (y === 45) return TY.gold;
    return TY.putz_sand;
  }
  if (aufU && r.w >= L.w0 && r.w < L.w1) {
    if (y < stand + 3) return TY.pietra_serena;
    if (r.u >= L.u1) {                                          // Nordwand hinter der Udienza: roter Damast mit Goldstreifen
      if (y >= 22 && y <= 44) return Math.floor(r.w - L.w0) % 6 === 0 ? TY.gold : F('rot');
      return y === 45 ? TY.gold : TY.putz_sand;
    }
    if (y >= 24 && y <= 44) {                                   // Südwand: ein breites Schlachtbild (36 Blöcke)
      const a = Math.floor(r.w - L.w0) - 4;
      if (a >= 0 && a < 36) return schlacht(99, a, y - 24, 36, 21);
    }
    return y === 45 ? TY.gold : TY.putz_sand;
  }
  return TY.putz_sand;
}

/** Kassette der Salone-Decke (y_rel 53): 8 x 8, Balken Holz, Felder Fresko, mittig ein goldenes Rosetten-Quadrat; in der Mitte ein großes Bildfeld. */
function kassette(r) {
  const L = pv.SAL_LICHT;
  const u = r.u - L.u0, w = r.w - L.w0;
  const cu = Math.floor(u / 8), cw = Math.floor(w / 8), a = u - cu * 8, b = w - cw * 8;
  // großes Mittelbild: Apotheose Cosimos I. (Vasari), 32 x 20 Blöcke, in Kreisen von innen nach außen
  if (u >= 36 && u < 68 && w >= 12 && w < 32) {
    if (u < 37 || u >= 67 || w < 13 || w >= 31) return TY.gold;
    const nu = (u - 52) / 15, nw = (w - 22) / 9, q = Math.hypot(nu, nw);
    return q < 0.22 ? F('weiss') : q < 0.5 ? F('gelb') : q < 0.78 ? F('hellblau') : F('blau');
  }
  if (a < 1 || b < 1) return TY.holz;
  if (a >= 3 && a < 5 && b >= 3 && b < 5) return TY.gold;
  return F(KASSETTEN[(cu * 3 + cw * 5) % KASSETTEN.length]);
}

/** Marmorboden des Salone (y_rel 16): Schachbrett 4 x 4 aus weißem Marmor und Pietra serena, roter Rand, Mittelstreifen. */
function saloneBoden(ctx, S) {
  const g = S.g, L = pv.SAL_LICHT;
  const w = ctx.part('salone_boden');
  const zellen = g.recs.filter((r) => r.salL && r.d8 > 5);
  const rest = (r) => {
    const du = Math.min(r.u - L.u0, L.u1 - r.u), dw = Math.min(r.w - L.w0, L.w1 - r.w);
    return Math.min(du, dw);
  };
  return S.band(w, zellen, 16, 16, (r) => {
    if (S.lampe(r.x, 16, r.z)) return TY.licht;
    if (rest(r) < 1.5) return TY.marmor_rot;
    if (Math.abs(r.w - 114) < 1.5) return TY.marmor_rot_alt;
    const k = Math.floor((r.u - L.u0) / 4) + Math.floor((r.w - L.w0) / 4);
    return k % 2 === 0 ? TY.marmor_weiss : TY.pietra_serena;
  }, 'salone_boden');
}

/** Hängende Kassettenbalken (y_rel 52) und goldene Knoten (y_rel 51) unter der Decke. */
function saloneKassettenbalken(ctx, S) {
  const g = S.g, L = pv.SAL_LICHT;
  const w = ctx.part('salone_kassettenbalken');
  const zellen = g.recs.filter((r) => r.salL && r.d8 > 3);
  let n = S.band(w, zellen, 52, 52, (r) => {
    const u = r.u - L.u0, ww = r.w - L.w0;
    const a = u - Math.floor(u / 8) * 8, b = ww - Math.floor(ww / 8) * 8;
    return a < 1 || b < 1 ? TY.holz : null;
  }, 'salone_kassettenbalken');
  n += S.band(w, zellen, 51, 51, (r) => {
    const u = r.u - L.u0, ww = r.w - L.w0;
    const a = u - Math.floor(u / 8) * 8, b = ww - Math.floor(ww / 8) * 8;
    return a < 1 && b < 1 ? TY.gold : null;
  }, 'salone_kassettenbalken');
  return n;
}


// ---------------------------------------------------------------- Blockfiguren
const SOCKEL = [];
for (let sx = -1; sx <= 1; sx++) for (let t = 0; t <= 2; t++) for (let h = 0; h <= 2; h++) SOCKEL.push([sx, t, h]);

/** Zellen einer Statue relativ (s quer, t Tiefe, h Höhe): Sockel 3 x 3 x 3, Figur ab h = 3. pose 0 ruhig, 1 Arme hoch, 2 Keule, 3 Schild. */
function figurZellen(pose, kopfTyp) {
  const out = [];
  for (const [sx, t, h] of SOCKEL) out.push({ s: sx, t, h, typ: 'sockel' });
  for (const sx of [-1, 1]) for (let h = 3; h <= 4; h++) out.push({ s: sx, t: 1, h, typ: 'figur' });      // Beine
  for (let sx = -1; sx <= 1; sx++) for (let h = 5; h <= 6; h++) out.push({ s: sx, t: 1, h, typ: 'figur' }); // Rumpf
  out.push({ s: 0, t: 1, h: 7, typ: 'figur' });                                                           // Kopf
  out.push({ s: 0, t: 1, h: 8, typ: kopfTyp || 'figur' });                                                // Haar oder Krone
  if (pose === 1) for (const sx of [-2, 2]) for (let h = 5; h <= 7; h++) out.push({ s: sx, t: 1, h, typ: 'figur' });
  if (pose === 2) { out.push({ s: -2, t: 1, h: 5, typ: 'figur' }); for (let h = 5; h <= 9; h++) out.push({ s: 2, t: 1, h, typ: h === 5 ? 'figur' : 'holz' }); }
  if (pose === 3) { out.push({ s: 2, t: 1, h: 5, typ: 'figur' }); for (let h = 5; h <= 6; h++) out.push({ s: -2, t: 1, h, typ: 'gold' }); }
  return out;
}

/** Luft über den Sockeln (Standfläche 3 Blöcke über dem Boden, nicht begehbar) für die spätere Deklaration vormerken. */
function sperre(S, xz, yLo, yHi) {
  const lst = S.statuenLuft || (S.statuenLuft = []);
  const seen = new Set(xz.map(([x, z]) => x * 8192 + z));
  for (const k of seen) { const x = Math.floor(k / 8192 + 0.5), z = k - x * 8192; for (let y = yLo; y <= yHi; y++) lst.push({ x, y: y + S.bodenY, z }); }
}

/** Setzt eine Figur; achse 'x': Breite entlang x, 'z': Breite entlang z; dt = +1/-1: Richtung der Tiefe. Rückgabe false, wenn Zellen nicht frei sind. */
function setzeFigur(S, W, x0, y0, z0, o, tag) {
  const zellen = figurZellen(o.pose, o.kopf).map((c) => {
    const x = o.achse === 'x' ? x0 + c.s : x0 + c.t * o.dt, z = o.achse === 'x' ? z0 + c.t * o.dt : z0 + c.s;
    return { x, z, y: y0 + c.h, typ: c.typ };
  });
  for (const c of zellen) {
    if (S.has(c.x, c.y, c.z) || S.carve.has(pv.keyOf(c.x, c.y + S.bodenY, c.z)) || !S.g.M.innen(c.x, c.z)) return false;
  }
  const typ = { sockel: TY.pietra_serena, figur: o.stoff || TY.marmor_weiss, holz: TY.holz, gold: TY.gold };
  for (const c of zellen) S.put(W, c.x, c.y, c.z, typ[c.typ], tag);
  sperre(S, zellen.map((c) => [c.x, c.z]), y0 + 3, y0 + 11);
  return true;
}

// ---------------------------------------------------------------- Salone: Udienza-Podium und Statuen
function udienza(ctx, S) {
  const g = S.g, P = plan(g), pod = P.podium;
  const w = ctx.part('salone_udienza');
  const zellen = g.recs.filter((r) => P.imPodium(r) && r.salL && r.d8 > 3);
  const lampen = new Set();
  for (const [u, ww] of [[86, 100], [86, 114], [86, 128]]) {
    const p = g.rf.toWorld(u, ww);
    lampen.add(Math.round(p.x) * 8192 + Math.round(p.z));
  }
  let n = 0;
  for (let y = 17; y <= 16 + pod.h; y++) {
    n += S.band(w, zellen, y, y, (r) => {
      if (y < 16 + pod.h) return TY.pietra_serena;
      if (lampen.has(r.x * 8192 + r.z)) return TY.licht;
      return r.u < pod.u0 + 1 ? TY.gold : (Math.floor((r.u + r.w) / 3) % 2 === 0 ? TY.marmor_weiss : TY.marmor_rot);
    }, 'salone_udienza');
  }
  // Freitreppe: drei Stufen in der Mitte der Südkante des Podiums, je Spalte eine Reihe (folgt der gedrehten Kante)
  const set = new Set(zellen.map((r) => r.x * 8192 + r.z));
  const stufe = palette.treppe('marmor_weiss', 'n');
  const fuell = TY.marmor_weiss;
  for (const r of zellen) {
    if (set.has(r.x * 8192 + r.z + 1) || r.w < 107 || r.w >= 121) continue;       // nur die Vorderkante (kleineres u = größeres z) in der Mitte
    for (let k = 0; k < 3; k++) {
      const z = r.z + 3 - k, y = 17 + k;
      if (set.has(r.x * 8192 + z)) continue;
      for (let yy = 17; yy < y; yy++) S.put(w, r.x, yy, z, fuell, 'salone_udienza');
      S.put(w, r.x, y, z, stufe, 'salone_udienza');
    }
  }
  return n;
}

function saloneStatuen(ctx, S) {
  const g = S.g, L = pv.SAL_LICHT;
  const w = ctx.part('salone_statuen');
  const rf = g.rf;
  const welt = (u, ww) => { const p = rf.toWorld(u, ww); return { x: Math.round(p.x), z: Math.round(p.z) }; };
  let n = 0;
  // Udienza: fünf Marmorstatuen auf dem Podium, an der Nordwand (Breite entlang x, Blick nach Süden = +z)
  const udPose = [0, 1, 0, 3, 0];
  udPose.forEach((pose, i) => {
    const c = welt(88, 100 + 8 * i + 4 * 0);
    if (setzeFigur(S, w, c.x, 20, c.z, { achse: 'x', dt: 1, pose, kopf: i === 2 ? 'gold' : undefined }, 'salone_statuen')) n++;
  });
  // Langwände: je sechs Statuen (Taten des Herkules, Vincenzo de' Rossi), vor jedem zweiten Joch
  for (const west of [true, false]) {
    for (let j = 1; j <= 11; j += 2) {
      const u = L.u0 + 8 * j + 5;
      const c = welt(u, west ? L.w0 + 2.5 : L.w1 - 4.5);
      if (setzeFigur(S, w, c.x, 17, c.z, { achse: 'z', dt: west ? 1 : -1, pose: [2, 1, 2, 3, 1, 2][(j - 1) / 2], stoff: TY.marmor_weiss }, 'salone_statuen')) n++;
    }
  }
  // Genius des Sieges (Michelangelo, Marmor): Sieger und Besiegter auf gemeinsamem Sockel an der Ostwand
  {
    const c = welt(37, L.w1 - 6);
    const cells = [];
    for (let sx = -2; sx <= 2; sx++) for (let t = 0; t <= 3; t++) for (let h = 0; h <= 2; h++) cells.push([sx, t, h, TY.pietra_serena]);
    // Sieger (stehend, 8 hoch) bei s = 1, Besiegter (kauernd, 4 hoch) bei s = -1
    for (let h = 3; h <= 4; h++) cells.push([1, 2, h, TY.marmor_weiss_alt], [2, 2, h, TY.marmor_weiss_alt]);
    for (let h = 5; h <= 7; h++) cells.push([1, 2, h, TY.marmor_weiss_alt], [2, 2, h, TY.marmor_weiss_alt]);
    cells.push([1, 2, 8, TY.marmor_weiss_alt], [1, 2, 9, TY.marmor_weiss_alt], [0, 2, 7, TY.marmor_weiss_alt]);       // Kopf, Arm
    for (let t = 1; t <= 3; t++) cells.push([-1, t, 3, TY.marmor_weiss_alt], [-2, t, 3, TY.marmor_weiss_alt]);       // Besiegter: Rücken
    cells.push([-1, 2, 4, TY.marmor_weiss_alt], [-1, 2, 5, TY.marmor_weiss_alt], [-1, 1, 4, TY.marmor_weiss_alt]);
    cells.push([0, 0, 2, TY.gold]);                                                                                // Namensschild
    const ok = cells.every(([sx, t, h]) => {
      const x = c.x - t, z = c.z + sx;      // Blick nach Westen (-x), Breite entlang z
      return !S.has(x, 17 + h, z) && !S.carve.has(pv.keyOf(x, 17 + h + S.bodenY, z)) && g.M.innen(x, z);
    });
    if (ok) { for (const [sx, t, h, typ] of cells) S.put(w, c.x - t, 17 + h, c.z + sx, typ, 'salone_statuen'); sperre(S, cells.map(([sx, t]) => [c.x - t, c.z + sx]), 20, 28); n++; }
  }
  if (S.statuenLuft && S.statuenLuft.length) {
    ctx.unzugaenglich(S.statuenLuft, 'Luft über den Statuensockeln: die Standfläche liegt drei Blöcke über dem Fußboden und ist Teil der Figurengruppe, nicht betretbar');
    S.statuenLuft = [];
  }
  return n;
}

// ---------------------------------------------------------------- Michelozzo-Hof: Putto-Brunnen
function hofBrunnen(ctx, S) {
  const g = S.g;
  const w = ctx.part('michelozzo_brunnen');
  const cx = -111, cz = 865;                                   // Mitte des Hofes (Loch 1)
  const rr = (x, z) => Math.hypot(x - cx, z - cz);
  const put = (x, y, z, t) => S.put(w, x, y, z, t, 'michelozzo_brunnen');
  // Becken: Rand 2 hoch, innen Wasser (1 hoch)
  for (let x = cx - 5; x <= cx + 5; x++) for (let z = cz - 5; z <= cz + 5; z++) {
    const d = rr(x, z);
    if (!g.M.innen(x, z) || g.M.has(x, z)) continue;
    if (d >= 3.3 && d < 4.8) { put(x, 1, z, TY.marmor_weiss); put(x, 2, z, d < 4.1 ? TY.marmor_ornament : TY.marmor_weiss); }
  }
  // Mittelstück: Sockel 3 x 3 (y 1..3), Schaft (y 4..6), Schale (y 7), Putto mit Delphin (Bronze, y 8..11)
  for (let dx = -1; dx <= 1; dx++) for (let dz = -1; dz <= 1; dz++) for (let y = 1; y <= 3; y++) put(cx + dx, y, cz + dz, TY.marmor_weiss);
  for (let dx = -1; dx <= 1; dx++) for (let dz = -1; dz <= 1; dz++) for (let y = 4; y <= 6; y++) put(cx + dx, y, cz + dz, dx === 0 && dz === 0 ? TY.marmor_saeule : TY.marmor_weiss);   // massiver Schaft: keine Hohlräume unter der Schale
  for (let dx = -1; dx <= 1; dx++) for (let dz = -1; dz <= 1; dz++) put(cx + dx, 7, cz + dz, TY.marmor_weiss_alt);
  for (let y = 8; y <= 9; y++) put(cx, y, cz, TY.bronze);                                  // Körper
  put(cx - 1, 8, cz, TY.bronze); put(cx + 1, 8, cz, TY.bronze);                           // Arme
  put(cx, 10, cz, TY.bronze); put(cx, 11, cz, TY.gold);                                   // Kopf, Haar
  for (const [dx, dz, y] of [[0, 1, 8], [0, 1, 9], [0, 1, 10]]) put(cx + dx, y, cz + dz, TY.bronze);   // Delphin
  // Wasser im Becken
  for (let x = cx - 4; x <= cx + 4; x++) for (let z = cz - 4; z <= cz + 4; z++) {
    if (rr(x, z) < 3.3 && g.M.innen(x, z) && g.M.has(x, z) === false) put(x, 1, z, TY.wasser);
  }
  return w;
}

module.exports = { hofBrunnen, hash, schlacht, saloneWand, kassette, saloneBoden, saloneKassettenbalken, udienza, saloneStatuen, setzeFigur, figurZellen, F, KASSETTEN, TY };
