'use strict';
// Forte di Belvedere (Katalog: 20_Stadtmodell_Florenz/wahrzeichen/forte_belvedere/): Festung Bernardo Buontalentis (1590–95) auf dem Hügel
// südlich des Arno. Der OSM-Umriss (w24879633) ist die ganze Festung; die Palazzina del Belvedere (w160800063, Ammannati) steht in der
// Mitte. Plateau Y 185 (Lage 0 = Hofniveau), Wälle aus Pietra forte mit Wallkrone auf Lage 5 (Brüstung Lage 6–7), Bastionsplattformen an
// den Spitzen des Umrisses, Tor mit Rampe an der Costa San Giorgio, Stufen von der Hoffläche auf die Wallkrone, Palazzina in _fb_pal.js.
// Bauplan als Zellen im Speicher (tools/wahrzeichen/zellplan.js); die Module m0–m7 sind Teillisten.
const fs = require('node:fs');
const path = require('node:path');
const WZ = require('../../../tools/wahrzeichen');
const PAL = require('../../../tools/spec/palette.js');
const base = require('../../../tools/city/ground_stadt.js');
const { neuerPlan } = require('../../../tools/wahrzeichen/zellplan.js');
const GRUND = require('../spec/ground.js');

const DIR = path.resolve(__dirname, '..');
const ROOT = path.resolve(DIR, '..', '..');
const PJ = JSON.parse(fs.readFileSync(path.join(DIR, 'project.json'), 'utf8'));
const BODEN_Y = PJ.bodenY;
const Y = (yr) => BODEN_Y + yr;
const hash = (a, b, c) => (((a * 73856093) ^ (b * 19349663) ^ (c * 83492791)) >>> 0);

// ------------------------------------------------------------------ Maße (Stufe C, soweit im Katalog nicht anders vermerkt)
const ID_FORT = 'w24879633', ID_PAL = 'w160800063';
const WT = 7;                         // Wallstärke (Chebyshev-Abstand zum Umriss): Wallkrone d8 4..7, Brüstung d8 2..3, Absatz d8 1
const CROWN = 5;                      // Wallkrone = oberster Block auf Lage 5 (Stehhöhe 6)
const PARA = [6, 7];                  // Brüstung zwei Lagen hoch
const RAD_BASTION = 15;               // Plattform an den Spitzen: Radius
const TORW = 3;                       // Tor 7 breit (±3)
const N_STUFEN = CROWN;               // Stufen Hof → Wallkrone

const T = {
  forte: WZ.typ('pietra_forte'), bruch: WZ.typ('pietra_forte_bruch'), pfl: WZ.typ('pflaster'), serena: WZ.typ('pietra_serena'),
  rasen: WZ.typ('gruen_rasen'), weg: WZ.typ('gruen_weg'), licht: WZ.typ('licht'), gold: WZ.typ('gold'), mauer: WZ.typ('mauerwerk'),
  putz: WZ.typ('putz_weiss'), dach: WZ.typ('dachziegel'), glas: WZ.typ('glas_fenster'), holz: WZ.typ('holz'), saeule: WZ.typ('marmor_saeule'),
  weiss: WZ.typ('marmor_weiss'), orn: WZ.typ('marmor_ornament'), bronze: WZ.typ('bronze'), kontrast: WZ.typ('kontrast_dunkel'), rot: WZ.typ('marmor_rot')
};
const FR = (n) => WZ.fresko(n);

// ------------------------------------------------------------------ Laden
let L = null;
function lade() {
  if (L) return L;
  const masken = WZ.ladeMasken(PJ, { dir: DIR });
  const H = masken.haupt;
  const palMaske = WZ.Maske.ausGebaeude([ID_PAL]);
  const palR = WZ.makeRahmen({ ox: -501, oz: 2251.5, thetaDeg: 2.5 });
  const G = JSON.parse(fs.readFileSync(path.join(ROOT, 'data', 'stadt', 'gebaeude.json'), 'utf8'));
  const ring = G.gebaeude.find((g) => g.id === ID_FORT).polygon.aussen[0];

  // Spitzen des Umrisses (Bastionen): spitzer Winkel, konvex, beide Kanten mindestens 18 Blöcke
  const spitzen = [];
  ring.forEach((p, i) => {
    const a = ring[(i + ring.length - 1) % ring.length], b = ring[(i + 1) % ring.length];
    const v1 = [a[0] - p[0], a[1] - p[1]], v2 = [b[0] - p[0], b[1] - p[1]];
    const l1 = Math.hypot(...v1), l2 = Math.hypot(...v2);
    const ang = Math.acos((v1[0] * v2[0] + v1[1] * v2[1]) / (l1 * l2)) * 180 / Math.PI;
    if (ang > 105 || Math.min(l1, l2) < 18) return;
    const bx = v1[0] / l1 + v2[0] / l2, bz = v1[1] / l1 + v2[1] / l2, bl = Math.hypot(bx, bz);
    if (!H.innen(Math.round(p[0] + (bx / bl) * 4), Math.round(p[1] + (bz / bl) * 4))) return;
    spitzen.push({ x: p[0], z: p[1], winkel: Math.round(ang), i });
  });

  const alle = H.cells.map(([x, z]) => {
    const c = { x, z, d8: H.d8(x, z), gt: GRUND.groundTopY(x, z) };
    c.pal = palMaske.has(x, z);
    if (c.pal) { const l = palR.toLocal(x, z); c.pu = l.u; c.pw = l.w; c.dP = palMaske.d8(x, z); }
    return c;
  });
  const byKey = new Map(alle.map((c) => [c.x + ',' + c.z, c]));
  for (const c of alle) {
    c.zone = c.pal ? 'pal' : c.d8 <= WT ? 'wall' : 'hof';
    c.bastion = spitzen.some((s) => Math.hypot(c.x - s.x, c.z - s.z) <= RAD_BASTION);
  }
  L = { PJ, masken, H, palMaske, palR, ring, spitzen, alle, byKey };
  L.tor = torBestimmen(L);
  return L;
}
const zelleBei = (x, z) => lade().byKey.get(x + ',' + z);
const kronenZelle = (c) => c && c.zone !== 'pal' && ((c.zone === 'wall' && c.d8 >= 4) || (c.zone === 'hof' && c.bastion));

// ------------------------------------------------------------------ Tor (Rampe an der Costa San Giorgio)
// Tunnel in Nordrichtung durch die südöstliche Kurtine zwischen den Spitzen bei (−310,2317) und (−388,2342); die Stufen steigen zum
// Mund hin (Süden), die Landung am Mund liegt auf der Höhe des Geländes davor.
function torBestimmen(D) {
  const H = D.H;
  for (const x0 of [-352, -350, -354, -348, -356, -346, -358, -344, -360]) {
    let zs = null;
    for (let z = 2345; z >= 2300; z--) if (H.has(x0, z) && !H.has(x0, z + 1)) { zs = z; break; }
    if (zs === null) continue;
    const gtM = base.groundTopY(x0, zs + 2);
    const n = gtM - BODEN_Y;
    if (n < 0 || n > 1) continue;
    const zellen = new Map();       // 'x,z' -> { dM, bodenY (oberster fester Block) }
    for (let x = x0 - TORW; x <= x0 + TORW; x++) {
      let z = zs;
      while (!H.has(x, z) && z > zs - 6) z--;
      while (H.has(x, z + 1) && z < zs + 6) z++;
      for (let k = 0; H.has(x, z - k) && H.d8(x, z - k) <= WT; k++) {
        const dM = k;
        let boden;
        if (n === 0) boden = Y(0);
        else if (dM === 0) boden = Y(n);
        else if (dM <= n) boden = Y(1) + (n - dM);
        else boden = Y(0);
        zellen.set(x + ',' + (z - k), { dM, boden, stufe: n > 0 && dM >= 1 && dM <= n });
      }
    }
    // hinter dem Tunnel muss Hoffläche liegen
    let zEnd = zs; while (H.has(x0, zEnd - 1) && H.d8(x0, zEnd) <= WT) zEnd--;
    if (!H.has(x0, zEnd - 1) || H.d8(x0, zEnd - 1) <= WT) continue;
    return { x0, zMund: zs, n, zellen };
  }
  throw new Error('Forte Belvedere: kein Tor gefunden');
}

// ------------------------------------------------------------------ Treppen (Hof → Wallkrone)
function lauf(D, start, dir, n, breite) {
  return WZ.treppe.geradeTreppe({ start, richtung: dir, stufen: n, breite, rolle: 'pietra_forte' });
}
function wallTreppen(D) {
  const kand = [];
  const dirs = ['n', 'o', 's', 'w'];
  const tor = D.tor.zellen;
  for (const c of D.alle) {
    if (c.zone !== 'hof' || c.bastion || c.d8 < WT + 1 || c.d8 > WT + 6) continue;
    for (const dir of dirs) {
      const arr = lauf(D, { x: c.x, y: Y(1), z: c.z }, dir, N_STUFEN, 3);
      let ok = true;
      for (const b of arr) { const q = zelleBei(b.x, b.z); if (!q || q.zone !== 'hof' || q.bastion || q.d8 <= WT || tor.has(b.x + ',' + b.z)) { ok = false; break; } }
      if (!ok) continue;
      const d = WZ.treppe.DIR[dir];
      for (const b of arr.slice(-3)) for (let r = 1; r <= 2 && ok; r++) {
        const q = zelleBei(b.x + d[0] * r, b.z + d[1] * r);
        if (!kronenZelle(q) || (q.zone === 'wall' && q.d8 > WT)) ok = false;
        else if (q.zone === 'wall' && q.d8 < 4) ok = false;
      }
      if (!ok) continue;
      kand.push({ x: c.x, z: c.z, dir, mx: c.x + d[0] * 3, mz: c.z + d[1] * 3 });
    }
  }
  // Auswahl: Punkt mit größtem Abstand zu den gewählten (Farthest-Point), mindestens 38 Blöcke Abstand
  const gew = [];
  const torZ = D.tor.zellen.keys().next().value.split(',').map(Number);
  let cand = kand.slice().sort((a, b) => Math.hypot(a.mx - torZ[0], a.mz - torZ[1]) - Math.hypot(b.mx - torZ[0], b.mz - torZ[1]))[0];
  while (cand && gew.length < 40) {
    gew.push(cand);
    let best = null, bd = 0;
    for (const k of kand) {
      const d = Math.min(...gew.map((g) => Math.hypot(k.mx - g.mx, k.mz - g.mz)));
      if (d > bd) { bd = d; best = k; }
    }
    cand = bd >= 38 ? best : null;
  }
  return gew;
}

// ------------------------------------------------------------------ Hofoberfläche
function hofOberflaeche(D, c) {
  const pal = D.palMaske;
  // Pflasterstreifen: vom Tor zur Ostloggia der Palazzina und Platz rund um die Palazzina
  const t = D.tor;
  const a = [t.x0, t.zMund - 8], b = [-428, 2287];
  const dx = b[0] - a[0], dz = b[1] - a[1], l2 = dx * dx + dz * dz;
  const s = Math.max(0, Math.min(1, ((c.x - a[0]) * dx + (c.z - a[1]) * dz) / l2));
  const dist = Math.hypot(c.x - (a[0] + s * dx), c.z - (a[1] + s * dz));
  if (dist <= 3) return T.pfl;
  for (let dx2 = -6; dx2 <= 6; dx2 += 2) for (let dz2 = -6; dz2 <= 6; dz2 += 2) if (pal.has(c.x + dx2, c.z + dz2)) return T.pfl;
  if (c.d8 <= WT + 3) return T.weg;                                           // Kiesstreifen am Wallfuß
  return (hash(Math.floor(c.x / 14), 7, Math.floor(c.z / 14)) % 5) < 3 ? T.rasen : T.weg;   // Terrassen teils Rasen
}

// ------------------------------------------------------------------ Plan
let PLAN = null;
function plan() {
  if (PLAN) return PLAN;
  const D = lade();
  const P = neuerPlan();
  const set = P.set;
  const api = { P, D, T, FR, Y, hash };
  const PALZ = require('./_fb_pal.js');

  // ---- Palazzina zuerst: Öffnungen, Treppenlöcher, Treppen (setzt Luft vorab)
  PALZ.vorab(api);

  // ---- Öffnungen des Tors vorab: Tunnelluft von der Bodenoberkante bis Lage 4 (Tor)
  for (const [k, e] of D.tor.zellen) {
    const [x, z] = k.split(',').map(Number);
    for (let y = e.boden + 1; y <= Y(CROWN - 1); y++) P.oeffnung('tor', 'torweg', x, y, z);
  }

  // ---- Stufen Hof → Wallkrone
  const treppen = wallTreppen(D);
  D.treppen = treppen;
  for (const t of treppen) {
    const arr = lauf(D, { x: t.x, y: Y(1), z: t.z }, t.dir, N_STUFEN, 3);
    for (const b of arr) {
      set(b.x, b.y, b.z, b.typ, 'wallstufen');
      for (let y = Y(1); y < b.y; y++) set(b.x, y, b.z, T.bruch, 'wallstufen');
    }
  }

  // ---- Zellen
  for (const c of D.alle) {
    const { x, z } = c;
    for (let y = c.gt + 1; y <= Y(-1); y++) set(x, y, z, T.bruch, 'fundament');
    if (c.zone === 'pal') { PALZ.zelle(api, c); continue; }
    if (c.zone === 'hof') {
      if (!c.bastion) { set(x, Y(0), z, hofOberflaeche(D, c), 'hofflaeche'); continue; }
      // Plattform der Bastion: massiv bis Lage 4, Wallkrone Lage 5
      const rand = [[1, 0], [-1, 0], [0, 1], [0, -1]].some(([dx, dz]) => { const q = zelleBei(x + dx, z + dz); return q && q.zone === 'hof' && !q.bastion; });
      for (let yr = 0; yr <= CROWN; yr++) set(x, Y(yr), z, yr === CROWN ? T.pfl : rand ? T.forte : T.bruch, 'plattformen');
      continue;
    }
    // Wall
    const tor = D.tor.zellen.get(x + ',' + z);
    for (let yr = 0; yr <= PARA[1]; yr++) {
      const y = Y(yr);
      if (P.istLuft(x, y, z)) continue;
      let t, p = 'waelle';
      if (tor && y <= tor.boden) {
        if (y === tor.boden) { if (tor.stufe) continue; t = T.pfl; p = 'torweg'; } else t = T.bruch;
      } else if (tor && y < Y(CROWN)) continue;                            // Tunnelluft (als Tor deklariert)
      else if (yr < CROWN) {
        t = c.d8 <= 2 || c.d8 === WT ? ((hash(x, yr, z) % 6) === 0 ? T.bruch : T.forte) : T.bruch;
        if (c.d8 === 1 && yr === CROWN - 1) t = T.serena;                  // Absatz (Cordon) am Außenrand
      } else if (yr === CROWN) {
        if (c.d8 === 1) continue;                                          // Absatz bleibt auf Lage 4
        t = c.d8 <= 3 ? T.forte : T.pfl;
      } else {
        if (c.d8 < 2 || c.d8 > 3) continue;                                // Brüstung auf d8 2..3
        t = T.forte; p = 'brustwehr';
      }
      set(x, y, z, t, p);
    }
  }
  // Treppenblöcke des Tors
  for (const [k, e] of D.tor.zellen) {
    if (!e.stufe) continue;
    const [x, z] = k.split(',').map(Number);
    set(x, e.boden, z, PAL.treppe('pietra_forte', 's'), 'torweg');
  }
  require('./_fb_ausstattung.js').ausstatten(api);
  lichtSetzen(P, D);
  PLAN = P;
  return P;
}

/** Seelaternen: Torweg (Mitte) und Räume der Palazzina. */
function lichtSetzen(P, D) {
  const t = D.tor;
  const mitte = [...t.zellen.entries()].map(([k, e]) => ({ k, e })).filter(({ k, e }) => e.dM === t.n + 2 && Math.abs(+k.split(',')[0] - t.x0) <= 1);
  for (const { k, e } of mitte) {
    const [x, z] = k.split(',').map(Number);
    if (Math.abs(x - t.x0) === 0) P.ersetze(x, e.boden, z, T.licht, 'licht');
  }
  require('./_fb_pal.js').licht(P, D);
}

module.exports = {
  modul: (n, ids) => ({ module: n, build(ctx) { return plan().modul(n, ids, plan).build(ctx); } }),
  lade, plan, Y, T, FR, hash, zelleBei, wallTreppen, lauf, WT, CROWN, PARA, N_STUFEN, ID_FORT, ID_PAL, BODEN_Y
};
