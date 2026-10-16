'use strict';
// Palazzo Davanzati (Museo di Palazzo Davanzati; Katalog: 20_Stadtmodell_Florenz/wahrzeichen/palazzo_davanzati/).
// Turmhaus des 14. Jh. (Davizzi) an der Via Porta Rossa: schmale hohe Fassade mit drei Erdgeschossbögen, drei
// Obergeschosse mit je fünf Fensterachsen, Altana (Dachloggia, 16. Jh.) unter weit vorspringendem Dach; dahinter ein
// enger Innenhof mit Portikus an zwei Seiten, Ziehbrunnen und einer Treppe, die an der Hofwand durch alle Geschosse läuft.
// Lokale Zellkoordinaten: iu = x + 659 (nach Osten), iw = z - 669 (nach Süden, Fassade bei iw 0). Lagen yr = Y - 63.
// Bauplan als Zellen im Speicher (tools/wahrzeichen/zellplan.js), die Module m0-m5 sind Teillisten.

const fs = require('node:fs');
const path = require('node:path');
const WZ = require('../../../tools/wahrzeichen');
const PAL = require('../../../tools/spec/palette.js');
const { neuerPlan } = require('../../../tools/wahrzeichen/zellplan.js');
const GRUND = require('../spec/ground.js');

const DIR = path.resolve(__dirname, '..');
const BODEN_Y = 63;
const OX = -659, OZ = 669;
const Y = (yr) => BODEN_Y + yr;
const F = [0, 11, 21, 31, 41];            // Oberkante der Geschossböden (Lage), F[4] = Dachboden / Altanaboden
const hash = (a, b, c) => (((a * 73856093) ^ (b * 19349663) ^ (c * 83492791)) >>> 0);

const T = {
  rustika: WZ.typ('pietra_forte_rustika'), putz: WZ.typ('putz_sand'), putzW: WZ.typ('putz_weiss'), mauer: WZ.typ('mauerwerk'),
  serena: WZ.typ('pietra_serena'), forte: WZ.typ('pietra_forte'), pflaster: WZ.typ('pflaster'), ziegel: WZ.typ('dachziegel'),
  holz: WZ.typ('holz'), gold: WZ.typ('gold'), bronze: WZ.typ('bronze'), weiss: WZ.typ('marmor_weiss'),
  orn: WZ.typ('marmor_ornament'), saeule: WZ.typ('marmor_saeule'), licht: WZ.typ('licht'), wasser: WZ.typ('wasser'),
  fenster: WZ.typ('glas_fenster'), bruch: WZ.typ('pietra_forte_bruch'), antik: WZ.typ('antik'), dunkel: WZ.typ('kontrast_dunkel')
};
const FR = (n) => WZ.fresko(n);
const TR = (rolle, dir) => PAL.treppe(rolle, dir);

// ---------------------------------------------------------------- Geometrie (lokal)
const HOF = { u0: 15, u1: 26, w0: 15, w1: 28 };
const RAUM = {
  N: { u0: 3, u1: 34, w0: 3, w1: 12 }, W1: { u0: 3, u1: 12, w0: 15, w1: 27 }, W2: { u0: 3, u1: 12, w0: 30, w1: 41 },
  S: { u0: 15, u1: 26, w0: 31, w1: 41 }, E1: { u0: 29, u1: 34, w0: 15, w1: 27 }, E2: { u0: 29, u1: 34, w0: 30, w1: 41 }
};
const RAUM_NAMEN = Object.keys(RAUM);
const ANBAU_W = 44;                                  // ab hier der eingeschossige Anbau
const ALTANA_W = 14;                                 // Altana-Zone: iw 0..14
const FASSADE_W = 2;                                 // Fassadenwand iw 0..2
const inR = (u, w, r) => u >= r.u0 && u <= r.u1 && w >= r.w0 && w <= r.w1;
// Türen: [u0, u1, w0, w1, Geschosse] (3 breit, 5 hoch ab Boden des Geschosses; Geschoss 4 = Altana)
const TUEREN = [
  [6, 8, 13, 14, [0, 1, 2, 3]],      // N - W1
  [6, 8, 28, 29, [0, 1, 2, 3]],      // W1 - W2
  [13, 14, 34, 36, [0, 1, 2, 3]],    // W2 - S
  [27, 28, 34, 36, [0, 1, 2, 3]],    // S - E2
  [30, 32, 28, 29, [0, 1, 2, 3]],    // E2 - E1
  [30, 32, 13, 14, [0, 1, 2, 3]],    // E1 - N
  [15, 17, 29, 30, [0, 1, 3]],       // Hof - S (Plattformen F1, F3; EG)
  [15, 17, 13, 14, [2, 4]],          // Hof - N (Plattformen F2 und Altana F4)
  [18, 20, 42, 43, [0]]              // S - Anbau
];
// Hoffenster (Glas durch beide Lagen der Hofwand), Geschosse 1..3, Höhe 5 ab F+3
const HOFFENSTER = [
  [22, 24, 13, 14, [1, 2, 3]], [15, 17, 13, 14, [1, 3]],
  [24, 26, 29, 30, [1, 2, 3]], [15, 17, 29, 30, [2]],
  [13, 14, 19, 21, [1, 2, 3]], [13, 14, 24, 26, [1, 2, 3]],
  [27, 28, 17, 19, [1, 2, 3]], [27, 28, 22, 24, [1, 2, 3]]
];
const BOEGEN = [8, 18, 28];                          // Mitten der drei Erdgeschossbögen (7 breit)
const FENSTER_U = [4, 11, 18, 25, 32];               // fünf Fensterachsen
const STUETZEN = [[1, 2], [7, 8], [14, 15], [21, 22], [28, 29], [34, 35]];   // Altana: 4 Säulen + 2 Pilaster

const bogenOben = (d) => (d <= 1 ? 7 : d === 2 ? 6 : 5);                 // Scheitelhöhe der flachen Bögen (Lage)
const ebene = (yr) => { for (let i = 3; i >= 0; i--) if (yr > F[i] && yr < F[i + 1]) return i; return yr > F[4] ? 4 : -1; };
const stuetze = (iu) => STUETZEN.some(([a, b]) => iu >= a && iu <= b);
const altanaDach = (iw) => 49 + Math.floor(iw / 4);

let L = null;
function lade() {
  if (L) return L;
  const json = JSON.parse(fs.readFileSync(path.join(DIR, 'project.json'), 'utf8'));
  const masken = WZ.ladeMasken(json, { dir: DIR });
  const H = masken.haupt;
  const alle = H.cells.map(([x, z]) => ({ x, z, iu: x - OX, iw: z - OZ, d8: H.d8(x, z), gt: GRUND.groundTopY(x, z) }));
  const byKey = new Map(alle.map((c) => [c.x + ',' + c.z, c]));
  for (const c of alle) c.zone = zoneVon(c);
  for (const c of alle) {
    if (c.zone !== 'wand') continue;
    if (c.iw <= FASSADE_W) c.sub = 'fassade';
    else if (c.d8 <= 2) c.sub = 'aussen';
    else if (imHofring(c.iu, c.iw)) c.sub = 'hofwand';
    else c.sub = 'innen';
  }
  L = { json, masken, H, alle, byKey };
  return L;
}
function zoneVon(c) {
  if (c.iw >= ANBAU_W) return c.d8 >= 3 ? 'anbau' : 'wand';
  if (inR(c.iu, c.iw, HOF)) return 'hof';
  for (const n of RAUM_NAMEN) if (inR(c.iu, c.iw, RAUM[n]) && c.d8 >= 3) return n;
  return 'wand';
}
function imHofring(u, w) {
  return !inR(u, w, HOF) && u >= HOF.u0 - 2 && u <= HOF.u1 + 2 && w >= HOF.w0 - 2 && w <= HOF.w1 + 2;
}
const zelleBei = (iu, iw) => lade().byKey.get((iu + OX) + ',' + (iw + OZ));
const zoneBei = (iu, iw) => { const c = zelleBei(iu, iw); return c ? c.zone : null; };
// Luft im Raum der Zelle (iu, iw) in Lage yr? (für Wandhäute)
function raumLuft(iu, iw, yr) {
  const z = zoneBei(iu, iw);
  if (!z) return false;
  if (z === 'hof') return true;
  if (z === 'anbau') return yr >= 1 && yr <= 10;
  if (!RAUM[z]) return false;
  const e = ebene(yr);
  if (e >= 0 && e <= 3) return true;
  return e === 4 && z === 'N' && yr <= 46;
}

// ---------------------------------------------------------------- Plan
let PLAN = null;
function plan() {
  if (PLAN) return PLAN;
  const D = lade();
  const P = neuerPlan();
  const set = P.set;

  // ---- Türen als Luft (vorab, damit keine Wand sie belegt)
  for (const [u0, u1, w0, w1, fl] of TUEREN) {
    for (const f of fl) {
      const y0 = f === 4 ? 42 : F[f] + 1;
      for (let u = u0; u <= u1; u++) for (let w = w0; w <= w1; w++) {
        const c = zelleBei(u, w);
        if (c) for (let yr = y0; yr <= y0 + 4; yr++) P.luft(c.x, Y(yr), c.z);
      }
    }
  }
  // drei Bögen in der Fassade (tor), Arkaden des Hofs nach Norden und Osten
  for (const c of D.alle) {
    if (c.iw <= FASSADE_W) {
      for (const ac of BOEGEN) {
        const d = Math.abs(c.iu - ac);
        if (d <= 3) for (let yr = 1; yr <= bogenOben(d); yr++) P.oeffnung('tor', 'fassade_eg', c.x, Y(yr), c.z);
      }
      if (!stuetze(c.iu)) {
        let a = c.iu; while (!stuetze(a - 1) && a > 1) a--;
        let b = c.iu; while (!stuetze(b + 1) && b < 36) b++;
        const mitte = c.iu > a && c.iu < b;
        for (let yr = 42; yr <= 46; yr++) if (yr < 46 || mitte) P.oeffnung('loggia', 'altana', c.x, Y(yr), c.z);
      }
    }
    const nord = c.iw >= 13 && c.iw <= 14 && ((c.iu >= 15 && c.iu <= 19) || (c.iu >= 22 && c.iu <= 26));
    const ost = c.iu >= 27 && c.iu <= 28 && ((c.iw >= 15 && c.iw <= 19) || (c.iw >= 22 && c.iw <= 26));
    if (nord || ost) {
      const t = nord ? (c.iu <= 19 ? c.iu - 17 : c.iu - 24) : (c.iw <= 19 ? c.iw - 17 : c.iw - 24);
      for (let yr = 1; yr <= (Math.abs(t) <= 1 ? 8 : 7); yr++) P.luft(c.x, Y(yr), c.z);
    }
  }

  const nachbarn = [[1, 0], [-1, 0], [0, 1], [0, -1]];
  const hautInnen = (c, yr) => nachbarn.some(([du, dw]) => raumLuft(c.iu + du, c.iw + dw, yr));
  const hofSeite = (c) => nachbarn.some(([du, dw]) => zoneBei(c.iu + du, c.iw + dw) === 'hof');
  const hofFenster = (c, yr) => {
    for (const [u0, u1, w0, w1, fl] of HOFFENSTER) {
      if (c.iu < u0 || c.iu > u1 || c.iw < w0 || c.iw > w1) continue;
      for (const f of fl) if (yr >= F[f] + 3 && yr <= F[f] + 7) return true;
    }
    return false;
  };
  const istDach = (iu, iw) => { const c = zelleBei(iu, iw); return !!c && c.zone !== 'hof' && iw > ALTANA_W && iw < ANBAU_W; };
  const dachE = (c) => {
    for (let r = 1; r <= 5; r++) {
      for (let a = -r; a <= r; a++) for (let b = -r; b <= r; b++) {
        if (Math.max(Math.abs(a), Math.abs(b)) === r && !istDach(c.iu + a, c.iw + b)) return r;
      }
    }
    return 5;
  };
  const dach = (c) => {
    const h = Math.min(dachE(c), 4);
    for (let yr = 42; yr <= 41 + h; yr++) set(c.x, Y(yr), c.z, T.ziegel, 'dach');
  };

  for (const c of D.alle) {
    const { x, z, iu, iw } = c;
    for (let y = c.gt + 1; y <= Y(-1); y++) set(x, y, z, T.bruch, 'fundament');
    set(x, Y(0), z, bodenTyp(c, 0), 'boden');
    if (c.zone === 'hof') continue;
    if (c.zone === 'anbau') { set(x, Y(11), z, T.ziegel, 'anbau_dach'); set(x, Y(12), z, T.ziegel, 'anbau_dach'); continue; }
    if (RAUM[c.zone]) {
      for (let i = 1; i <= 4; i++) set(x, Y(F[i]), z, bodenTyp(c, i), 'boden_' + i);
      if (c.zone === 'N') {
        set(x, Y(47), z, T.holz, 'altana');
        for (let yr = 48; yr <= altanaDach(iw); yr++) set(x, Y(yr), z, T.ziegel, 'dach');
      } else if (iw > ALTANA_W) dach(c);
      continue;
    }
    const sub = c.sub;
    const anbau = iw >= ANBAU_W;
    const top = anbau ? 10 : 41;
    for (let yr = 1; yr <= top; yr++) {
      if (P.istLuft(x, Y(yr), z)) continue;
      let t, p;
      if (sub === 'fassade') ({ t, p } = fassade(c, yr));
      else {
        p = sub === 'aussen' ? 'aussenwaende' : sub === 'hofwand' ? 'hofwaende' : 'innenwaende';
        t = T.mauer;
        if (hautInnen(c, yr)) t = T.putzW;
        else if (sub === 'hofwand' && hofSeite(c)) t = (yr <= 10 && (iw <= 14 || iu >= 27)) ? T.serena : T.putz;
        if (sub === 'hofwand' && hofFenster(c, yr)) t = T.fenster;
      }
      set(x, Y(yr), z, t, p);
    }
    if (anbau) { set(x, Y(11), z, T.ziegel, 'anbau_dach'); set(x, Y(12), z, T.ziegel, 'anbau_dach'); continue; }
    if (iw <= ALTANA_W) {
      for (let yr = 42; yr <= 47; yr++) {
        if (P.istLuft(x, Y(yr), z)) continue;
        const t = sub === 'fassade' ? T.serena : hautInnen(c, yr) ? T.putzW : sub === 'aussen' ? T.putz : T.mauer;
        set(x, Y(yr), z, t, 'altana');
      }
      for (let yr = 48; yr <= altanaDach(iw); yr++) set(x, Y(yr), z, T.ziegel, 'dach');
    } else dach(c);
  }

  // Dachvorsprung der Altana (zwei Zellen über die Fassade hinaus), Konsolen darunter
  for (const c of D.alle) {
    if (c.iw !== 0) continue;
    for (const dw of [1, 2]) {
      set(c.x, Y(48), c.z - dw, T.ziegel, 'dach'); set(c.x, Y(49), c.z - dw, T.ziegel, 'dach');
      if (dw === 1 && c.iu % 3 === 1) set(c.x, Y(47), c.z - dw, T.serena, 'dach');
    }
  }

  hofAusbau(P);
  fassadeSchmuck(P);
  require('./_pd_raeume.js').ausstatten({ P, D, T, FR, TR, Y, F, OX, OZ, zelleBei, zoneBei, RAUM, HOF, hash, raumLuft });
  deklariereHof(P, D);
  lichtSetzen(P, D);
  PLAN = P;
  return P;
}

// Boden je Zelle und Geschoss (Muster schon beim Setzen, damit jede Zelle beim Bau Halt hat)
function bodenTyp(c, i) {
  const { iu, iw } = c;
  const sch = ((Math.floor(iu / 3) + Math.floor(iw / 3)) & 1) === 1;
  if (c.zone === 'hof') return Math.abs((iu % 6) - 3) + Math.abs((iw % 6) - 3) <= 1 ? T.serena : T.pflaster;
  if (i === 0) return c.zone === 'N' && sch ? T.serena : T.pflaster;
  if (c.zone === 'N' && i === 1) return ((iu + iw) % 8 === 0 || iw === 3 || iw === 12) ? T.serena : T.ziegel;
  if (c.zone === 'S' && i === 3) return sch ? T.pflaster : T.forte;      // Küche: Steinplatten
  return T.ziegel;
}

function fassade(c, yr) {
  const { iu } = c;
  const aussen = c.iw === 0;
  const hautW = c.iw === FASSADE_W && raumLuft(c.iu, c.iw + 1, yr);
  if (yr <= 10) {
    let t = aussen ? T.rustika : (hautW ? T.putzW : T.mauer);
    for (const ac of BOEGEN) {
      const d = Math.abs(iu - ac);
      if (aussen && d <= 3 && yr === bogenOben(d) + 1) t = T.serena;
      if (aussen && d === 4 && yr <= 6) t = T.serena;
    }
    if (aussen && yr === 10) t = T.serena;
    return { t, p: 'fassade_eg' };
  }
  if ([11, 21, 31, 41].includes(yr)) return { t: aussen ? T.serena : T.mauer, p: 'fassade_og' };
  const f = ebene(yr);
  let t = aussen ? T.putz : (hautW ? T.putzW : T.mauer);
  const s0 = F[f] + 3, s1 = F[f] + 7;
  for (const fu of FENSTER_U) {
    const du = Math.abs(iu - fu);
    if (yr >= s0 && yr <= s1 && du <= 1 && (yr < s1 || du === 0)) return { t: T.fenster, p: 'fassade_og' };
    if (aussen && du <= 2 && yr >= s0 - 1 && yr <= s1 + 1) t = T.serena;
  }
  return { t, p: 'fassade_og' };
}

function hofAusbau(P) {
  // Ziehbrunnen: Kranz 3 x 3 um das Wasser, zwei Pfosten, Querbalken mit Seilrolle
  const bx = 23, bw = 22;
  const c0 = zelleBei(bx, bw);
  P.ersetze(c0.x, Y(0), c0.z, T.wasser, 'brunnen');
  for (let a = -1; a <= 1; a++) for (let b = -1; b <= 1; b++) {
    if (!a && !b) continue;
    const c = zelleBei(bx + a, bw + b);
    P.set(c.x, Y(1), c.z, T.serena, 'brunnen');
  }
  for (const a of [-1, 1]) {
    const c = zelleBei(bx + a, bw);
    for (let yr = 2; yr <= 5; yr++) P.set(c.x, Y(yr), c.z, T.holz, 'brunnen');
  }
  for (let a = -1; a <= 1; a++) { const c = zelleBei(bx + a, bw); P.set(c.x, Y(6), c.z, a ? T.holz : T.bronze, 'brunnen'); }
  // Seilrollen am Ziehschacht: je Geschoss ein Kupferblock in der Hofhaut der Südwand
  for (const yr of [5, 16, 26, 36]) { const c = zelleBei(23, 29); P.ersetze(c.x, Y(yr), c.z, T.bronze, 'brunnen'); }
  // Hoftreppe: vier Läufe an der Westwand (Stein, Stein, Holz, Holz), Plattformen, Kragsteine unter jeder Stufe
  const lauf = (iu, iw, y, richtung, n, rolle) => {
    const b = WZ.treppe.geradeTreppe({ start: { x: iu + OX, y: Y(y), z: iw + OZ }, richtung, stufen: n, breite: 2, rolle });
    for (const s of b) {
      P.set(s.x, s.y, s.z, s.typ, 'hoftreppe');
      if (!P.hat(s.x, s.y - 1, s.z)) P.set(s.x, s.y - 1, s.z, T.serena, 'hoftreppe');
    }
  };
  const platte = (w0, w1, yr) => {
    for (let u = 15; u <= 18; u++) for (let w = w0; w <= w1; w++) { const c = zelleBei(u, w); P.set(c.x, Y(yr), c.z, T.ziegel, 'hoftreppe'); }
  };
  lauf(16, 16, 1, 's', 11, 'pietra_serena');
  platte(27, 28, 11);
  lauf(17, 26, 12, 'n', 10, 'pietra_serena');
  platte(15, 16, 21);
  lauf(16, 17, 22, 's', 10, 'holz');
  platte(27, 28, 31);
  lauf(17, 26, 32, 'n', 10, 'holz');
  platte(15, 16, 41);
  for (const [u, w] of [[19, 15], [19, 16], [15, 17], [16, 17]]) { const c = zelleBei(u, w); for (const yr of [42, 43]) P.set(c.x, Y(yr), c.z, T.serena, 'hoftreppe'); }
}

function fassadeSchmuck(P) {
  // Wappen der Davanzati über dem Mittelbogen: Gold gerahmt, rotes Feld, weißer Balken
  for (let iu = 16; iu <= 20; iu++) for (let yr = 8; yr <= 9; yr++) {
    const c = zelleBei(iu, 0);
    P.ersetze(c.x, Y(yr), c.z, (iu === 16 || iu === 20) ? T.gold : (yr === 9 ? FR('weiss') : FR('rot')), 'wappen');
  }
  // Fackel- und Fahnenhalter (nur als volle Kupferblöcke) zwischen den Fenstern
  for (const iu of [8, 15, 22, 29]) for (const yr of [16, 26]) { const c = zelleBei(iu, 0); P.ersetze(c.x, Y(yr), c.z, T.bronze, 'ferri'); }
}

// Luft im Hof unter Plattformen und in der Hofwand als offen deklarieren (sonst zählt R14 sie als Eintritt von Außenluft)
function deklariereHof(P, D) {
  const colTop = new Map();
  for (const e of P.zellen.values()) { const k = e.x + ',' + e.z; if (!colTop.has(k) || colTop.get(k) < e.y) colTop.set(k, e.y); }
  for (const c of D.alle) {
    if (c.zone !== 'hof' && c.sub !== 'hofwand') continue;
    const top = colTop.get(c.x + ',' + c.z) || 0;
    for (let y = Y(1); y <= top; y++) if (!P.hat(c.x, y, c.z)) P.oeffnung('loggia', c.zone === 'hof' ? 'hoftreppe' : 'hofwaende', c.x, y, c.z);
  }
}

// Seelaternen im Boden: Stehzellen je Geschoss, Abstand höchstens 10
function lichtSetzen(P, D) {
  for (const f of F) {
    const steh = {};
    for (const c of D.alle) {
      const y = Y(f);
      const b = P.get(c.x, y, c.z);
      if (!b || b.p === 'hoftreppe' || b.p === 'brunnen' || b.p === 'dach' || b.p === 'anbau_dach') continue;
      if (P.hat(c.x, y + 1, c.z) || P.hat(c.x, y + 2, c.z) || P.hat(c.x, y + 3, c.z)) continue;
      if (f === 41 && c.zone !== 'N') continue;
      (steh[c.zone] || (steh[c.zone] = [])).push({ x: c.x, y: y + 1, z: c.z });
    }
    for (const zs of Object.values(steh)) for (const l of WZ.licht.lichtRaster(zs, { abstand: 9 })) P.ersetze(l.x, l.y, l.z, T.licht, 'licht');
  }
}

module.exports = {
  modul: (n, ids) => ({ module: n, build(ctx) { return plan().modul(n, ids, plan).build(ctx); } }),
  lade, plan, zelleBei, Y, T, F, OX, OZ
};
