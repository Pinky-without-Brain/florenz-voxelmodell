'use strict';
// Grotta del Buontalenti (Grotta Grande im Boboli-Garten; Katalog: 20_Stadtmodell_Florenz/wahrzeichen/grotta_buontalenti/).
// Vasari begann den unteren Teil der Fassade, Buontalenti baute 1583–93 für Francesco I. de' Medici den Rest:
// Fassade mit Tropfstein-Rustika, weitem Eingang zwischen zwei Säulen, Nischen für Ceres und Apollo (Bandinelli) und dem
// Medici-Wappen im Giebel; dahinter drei Kammern: (1) mit den „Gefangenen“ Michelangelos in den Ecken und bemaltem
// Gewölbe mit Oculus, (2) mit „Paris und Helena“ von Vincenzo de' Rossi, (3) mit Giambolognas Venus im Brunnenbecken.
// Rahmen GB: Ursprung (−769,5 | 1544) = Südostecke der Fassadenkante (OSM-Knoten), θ = 59,7°; u entlang der Fassade (0..18),
// w ins Gebäude (Fassade bei w = 0, hinten w ≈ 22). Lagen yr = Y − 76 (Boden yr 0, Stehzelle yr 1).

const fs = require('node:fs');
const path = require('node:path');
const WZ = require('../../../tools/wahrzeichen');
const PAL = require('../../../tools/spec/palette.js');
const P = require('../../../tools/city/poly.js');

const DIR = path.resolve(__dirname, '..');
const GRUND = require('../spec/ground.js');
const BODEN_Y = 76;
const Y = (yr) => BODEN_Y + yr;

// Zonen in w (lokal): Fassadenwand, Kammer 1, Trennwand 1, Kammer 2, Trennwand 2, Kammer 3
const FRONT_W = 3.0;
const P1 = [8.0, 10.0], P2 = [13.5, 15.5];
const UC = (w) => 9.0 + 0.215 * w;            // Mittellinie der Kammern (das Gebäude ist ein Parallelogramm)
const HW = 7.2;                                // Halbbreite des Tonnengewölbes
const WAND_TOP = 11, DACH = 12, KRONE = 10, KAEMPFER = 5;
const TUER_HALB = 2.6;                         // Eingang und Türen der Trennwände: 5 breit

const T = {
  rustika: WZ.typ('pietra_forte_rustika'), bruch: WZ.typ('pietra_forte_bruch'), serena: WZ.typ('pietra_serena'),
  forte: WZ.typ('pietra_forte'), mauer: WZ.typ('mauerwerk'), antik: WZ.typ('antik'), pflaster: WZ.typ('pflaster'),
  weiss: WZ.typ('marmor_weiss'), orn: WZ.typ('marmor_ornament'), saeule: WZ.typ('marmor_saeule'),
  weissAlt: WZ.typ('marmor_weiss_alt'), gold: WZ.typ('gold'), licht: WZ.typ('licht'), wasser: WZ.typ('wasser'),
  bronze: WZ.typ('bronze'), holz: WZ.typ('holz')
};
const MOOS = 'mossy_stone_bricks';
const GLAS = PAL.typesForRole('glas').find((t) => t.includes('white')) || PAL.typesForRole('glas')[0];
const hash = (x, y, z) => (((x * 73856093) ^ (y * 19349663) ^ (z * 83492791)) >>> 0);

let L = null;
function lade() {
  if (L) return L;
  const json = JSON.parse(fs.readFileSync(path.join(DIR, 'project.json'), 'utf8'));
  const masken = WZ.ladeMasken(json, { dir: DIR });
  const R = masken.rahmen, H = masken.haupt;
  const alle = H.cells.map(([x, z]) => {
    const l = R.toLocal(x, z);
    return { x, z, u: l.u, w: l.w, d8: H.d8(x, z), gt: GRUND.groundTopY(x, z) };
  });
  const byKey = new Map(alle.map((c) => [P.ck(c.x, c.z), c]));
  for (const c of alle) c.zone = zone(c);
  L = { json, masken, R, H, alle, byKey };
  return L;
}
function zone(c) {
  if (c.w < FRONT_W) return 'front';
  if (c.d8 <= 2) return 'wand';
  if (c.w >= P1[0] && c.w < P1[1]) return 'p1';
  if (c.w >= P2[0] && c.w < P2[1]) return 'p2';
  return c.w < P1[0] ? 'k1' : c.w < P2[0] ? 'k2' : 'k3';
}
const zelleBei = (x, z) => lade().byKey.get(P.ck(x, z));
const kammer = (c) => c && (c.zone === 'k1' || c.zone === 'k2' || c.zone === 'k3');
const tuerZelle = (c) => (c.zone === 'p1' || c.zone === 'p2') && Math.abs(c.u - UC(c.w)) < TUER_HALB;

// Gewölbeunterkante (Lage der untersten festen Zelle) über einer Kammerzelle
function decke(c) {
  const s = Math.abs(c.u - UC(c.w));
  return KAEMPFER + Math.round((KRONE - KAEMPFER) * Math.sqrt(Math.max(0, 1 - Math.min(1, s / HW) ** 2)));
}
// Oculus in Kammer 1 (Mitte der Kammer)
const OCULUS_W = 5.4, OCULUS_R = 1.9;
const oculus = (c) => c.zone === 'k1' && Math.hypot(c.u - UC(OCULUS_W), c.w - OCULUS_W) <= OCULUS_R;

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
    zellen.set(k, { x, y, z, t, p });
    let a = teile.get(p); if (!a) teile.set(p, a = []); a.push(k);
    return true;
  };
  const hat = (x, y, z) => zellen.has(key(x, y, z));
  const oeff = new Map();
  const oeffnung = (art, p, x, y, z) => { const k = art + '|' + p; if (!oeff.has(k)) oeff.set(k, []); oeff.get(k).push({ x, y, z }); luft.add(key(x, y, z)); };

  // Freie n × n-Standfläche in einer Kammer nahe (u, w) suchen (Gewölbe hoch genug, Abstand zur Wand)
  const freiN = (zn, u, w, hoch, n = 2) => {
    let best = null, bd = 1e9;
    for (const c of D.alle) {
      if (c.zone !== zn) continue;
      const d = Math.hypot(c.u - u, c.w - w);
      if (d >= bd) continue;
      let ok = true;
      for (let a = 0; a < n && ok; a++) for (let b = 0; b < n && ok; b++) {
        const q = zelleBei(c.x + a, c.z + b);
        if (!q || q.zone !== zn || q.d8 < 3 || decke(q) < hoch || oculus(q)) ok = false;
      }
      if (ok) { best = c; bd = d; }
    }
    if (!best) throw new Error(`Grotta: keine freie ${n} x ${n}-Fläche in ${zn} bei u ${u} w ${w}`);
    return best;
  };

  // ---- Modul 0: Fundament und Boden
  for (const c of D.alle) for (let y = c.gt + 1; y <= Y(-1); y++) set(c.x, y, c.z, T.bruch, 'fundament');
  for (const c of D.alle) {
    let t;
    if (kammer(c) || tuerZelle(c)) {
      const sch = (Math.floor(c.u / 2) + Math.floor(c.w / 2)) & 1;
      t = c.zone === 'k1' ? (sch ? T.serena : T.pflaster) : c.zone === 'k2' ? (sch ? T.forte : T.weiss) : (hash(c.x, 0, c.z) % 5 === 0 ? T.antik : (sch ? T.pflaster : T.serena));
    } else t = T.pflaster;
    set(c.x, Y(0), c.z, t, 'boden');
  }

  // ---- Modul 1: Fassade, Wappen, Außenwände
  // Wappen (Medici: Kugel auf Gold) über dem Sturz, 3 breit × 3 hoch, nur äußerste Lage
  for (const c of D.alle) {
    if (c.zone !== 'front' || c.w >= 1.2) continue;
    const du = c.u - 9.0;
    if (Math.abs(du) <= 1.4) for (let yr = 10; yr <= 12; yr++) {
      const rand = Math.abs(du) > 0.5 || yr === 10 || yr === 12;
      set(c.x, Y(yr), c.z, rand ? T.gold : WZ.fresko('rot'), 'wappen');
    }
  }
  const NISCHEN = [-7.0, 7.0];
  for (const c of D.alle) {
    if (c.zone !== 'front') continue;
    const du = c.u - 9.0, ad = Math.abs(du);
    for (let yr = 1; yr <= WAND_TOP + 1; yr++) {
      if (hat(c.x, Y(yr), c.z)) continue;
      // Eingang: 5 breit, bis yr 7, ganze Wandtiefe
      if (ad < TUER_HALB && yr <= 7) { oeffnung('tor', 'fassade', c.x, Y(yr), c.z); continue; }
      let t = T.rustika;
      if (ad < TUER_HALB + 1.2 && yr >= 8 && yr <= 9) t = T.orn;                                   // Sturz
      else if (c.w < 1.5 && Math.abs(ad - 5.0) < 1.0 && yr <= 8) t = T.saeule;                   // zwei Säulen
      else if (c.w < 1.5 && Math.abs(ad - 5.0) < 1.5 && yr === 9) t = T.orn;                     // Kapitelle
      else if (c.w < 1.5 && Math.abs(ad - 5.0) < 1.5 && yr >= 10) t = T.antik;                   // Tropfstein über den Kapitellen
      else if (yr === WAND_TOP + 1) t = T.weiss;                                                   // Kranzgesims
      else if (c.w >= 1.5 && yr > 2 && hash(c.x, yr, c.z) % 7 === 0) t = T.antik;
      // Nischen für Ceres und Apollo
      if (c.w < 1.0 && NISCHEN.some((n) => Math.abs(du - n) < 1.0) && yr >= 2 && yr <= 6) {
        oeffnung('relief', 'fassade', c.x, Y(yr), c.z);
        continue;
      }
      set(c.x, Y(yr), c.z, t, 'fassade');
    }
    // Giebelfeld über dem Kranzgesims
    for (let yr = WAND_TOP + 2; yr <= WAND_TOP + 4; yr++) {
      const hw = 9 - 3 * (yr - WAND_TOP - 2);
      if (ad <= hw) set(c.x, Y(yr), c.z, yr === WAND_TOP + 4 ? T.orn : T.weiss, 'fassade');
    }
  }
  // Seiten- und Rückwände: Außenlage Tuff, Innenlage Tropfstein/Moos
  for (const c of D.alle) {
    if (c.zone !== 'wand') continue;
    for (let yr = 1; yr <= WAND_TOP; yr++) {
      const t = c.d8 === 1 ? T.bruch : (hash(c.x, yr, c.z) % 3 === 0 ? MOOS : T.antik);
      set(c.x, Y(yr), c.z, t, 'seitenwaende');
    }
  }

  // ---- Modul 2: Trennwände (mit Türen), Gewölbe der drei Kammern, Dach mit Oculus
  for (const c of D.alle) {
    if (c.zone !== 'p1' && c.zone !== 'p2') continue;
    const tp = c.zone === 'p1' ? 'trennwand_1' : 'trennwand_2';
    const ad = Math.abs(c.u - UC(c.w));
    for (let yr = 1; yr <= WAND_TOP; yr++) {
      if (ad < TUER_HALB && yr <= 7) continue;                                                      // Tür 5 × 7
      const rahmen = ad < TUER_HALB + 1.1 && yr <= 8;
      set(c.x, Y(yr), c.z, rahmen ? T.serena : (hash(c.x, yr, c.z) % 4 === 0 ? MOOS : T.antik), tp);
    }
  }
  const FARBE = { k1: ['gruen', 'gelb'], k2: ['orange', 'rot'], k3: ['hellblau', 'weiss'] };
  for (const c of D.alle) {
    if (!kammer(c)) continue;
    const p = `kammer_${c.zone[1]}_gewoelbe`;
    const h = decke(c);
    if (oculus(c)) continue;
    for (let yr = h; yr <= WAND_TOP; yr++) {
      let t = T.mauer;
      if (yr === h) {
        const [a, b] = FARBE[c.zone];
        if (c.zone === 'k1') t = WZ.fresko(((Math.floor(c.u) + Math.floor(c.w)) & 1) ? a : b);             // Pergola
        else if (c.zone === 'k2') t = WZ.fresko(((Math.floor(c.u / 2) + Math.floor(c.w)) & 1) ? a : (hash(c.x, 1, c.z) % 5 === 0 ? 'braun' : b)); // Muscheln/Korallen
        else t = WZ.fresko(hash(c.x, 2, c.z) % 9 === 0 ? b : a);                                        // Himmel mit Vögeln
      }
      set(c.x, Y(yr), c.z, t, p);
    }
  }
  for (const c of D.alle) {
    if (oculus(c)) set(c.x, Y(DACH), c.z, GLAS, 'oculus');
    else set(c.x, Y(DACH), c.z, T.serena, 'dach');
  }

  // ---- Modul 3: Ausstattung
  // Statuen in den Nischen (Ceres und Apollo, vereinfacht, 1 × 1 × 4)
  for (const c of D.alle) {
    if (c.zone !== 'front' || c.w >= 1.0) continue;
    const du = c.u - 9.0;
    for (const n of NISCHEN) {
      if (Math.abs(du - n) >= 0.5) continue;
      for (let yr = 2; yr <= 5; yr++) set(c.x, Y(yr), c.z, yr === 2 ? T.serena : T.weiss, 'nischenstatuen');
    }
  }
  // Kammer 1: vier „Gefangene“ (Kopien), 2 × 2-Sockel, Körper 3 Lagen, Kopf, erhobener Arm
  for (const [u, w] of [[-4.3, 4.3], [4.3, 4.3], [-4.3, 6.6], [4.3, 6.6]]) {
    const c = freiN('k1', UC(w) + u, w, 8);
    for (let a = 0; a < 2; a++) for (let b = 0; b < 2; b++) {
      const q = { x: c.x + a, z: c.z + b };
      set(q.x, Y(1), q.z, T.serena, 'gefangene');
      for (let yr = 2; yr <= 4; yr++) set(q.x, Y(yr), q.z, T.weissAlt, 'gefangene');
    }
    set(c.x, Y(5), c.z, T.weissAlt, 'gefangene');
    set(c.x + 1, Y(5), c.z + 1, T.weissAlt, 'gefangene');
  }
  // Kammer 2: Paris und Helena (Vincenzo de' Rossi): Sockel 3 × 3, Paris 2 × 2 × 4 mit Kopf, Helena 1 × 2 auf seinem Arm
  {
    const c = freiN('k2', UC(11.8), 11.8, 9, 3);
    for (let a = 0; a < 3; a++) for (let b = 0; b < 3; b++) set(c.x + a, Y(1), c.z + b, T.serena, 'paris_helena');
    for (let a = 0; a < 2; a++) for (let b = 0; b < 2; b++) for (let yr = 2; yr <= 5; yr++) set(c.x + a, Y(yr), c.z + b, T.weiss, 'paris_helena');
    set(c.x, Y(6), c.z, T.weiss, 'paris_helena');
    for (let b = 0; b < 2; b++) for (let yr = 3; yr <= 5; yr++) set(c.x + 2, Y(yr), c.z + b, T.weissAlt, 'paris_helena');
    set(c.x + 2, Y(6), c.z + 1, T.weissAlt, 'paris_helena');
  }
  // Kammer 3: Brunnenbecken (Rand 2 hoch, Wasser, Sockel in der Mitte) mit Giambolognas Venus und vier Satyrn
  {
    const wc = 18.6, uc = UC(wc);
    const mitte = D.alle.filter((c) => c.zone === 'k3').sort((a, b) => Math.hypot(a.u - uc, a.w - wc) - Math.hypot(b.u - uc, b.w - wc))[0];
    const rim = [], wasser = [];
    for (const c of D.alle) {
      if (c.zone !== 'k3') continue;
      const d = Math.hypot(c.x - mitte.x, c.z - mitte.z);
      if (d <= 1.5) wasser.push(c); else if (d <= 2.5) rim.push(c);
    }
    for (const c of rim) { set(c.x, Y(1), c.z, T.serena, 'venus_brunnen'); set(c.x, Y(2), c.z, T.weiss, 'venus_brunnen'); }
    for (const c of wasser) {
      if (c.x === mitte.x && c.z === mitte.z) continue;
      set(c.x, Y(1), c.z, T.wasser, 'venus_brunnen');
    }
    for (let yr = 1; yr <= 3; yr++) set(mitte.x, Y(yr), mitte.z, T.serena, 'venus_brunnen');
    for (let yr = 4; yr <= 7; yr++) set(mitte.x, Y(yr), mitte.z, T.weiss, 'venus_brunnen');
    set(mitte.x + 1, Y(6), mitte.z, T.weiss, 'venus_brunnen');
    // vier Satyrn auf dem Beckenrand (Bronze, 2 Lagen über dem Rand): vier Randzellen in den Himmelsrichtungen
    for (const [dx, dz] of [[2, 0], [-2, 0], [0, 2], [0, -2]]) {
      const c = rim.find((q) => q.x === mitte.x + dx && q.z === mitte.z + dz);
      if (c) for (let yr = 3; yr <= 4; yr++) set(c.x, Y(yr), c.z, T.bronze, 'venus_brunnen');
    }
  }
  // Licht: Seelaternen im Boden (je Kammer mindestens zwei, Abstand ≤ 12)
  {
    const lt = [];
    for (const [zn, w, us] of [['k1', 6.0, [-5.4, 5.4]], ['k2', 11.7, [-4.8, 4.8]], ['k3', 18.6, [-5.6, 5.6]], ['k3', 16.7, [0]]]) {
      for (const u of us) {
        const cand = D.alle.filter((c) => c.zone === zn && c.d8 >= 3).sort((a, b) => Math.hypot(a.u - (UC(w) + u), a.w - w) - Math.hypot(b.u - (UC(w) + u), b.w - w));
        for (const c of cand) {
          const k = key(c.x, Y(0), c.z), e = zellen.get(k);
          if (!e || hat(c.x, Y(1), c.z)) continue;
          teile.set(e.p, teile.get(e.p).filter((q) => q !== k)); e.t = T.licht; e.p = 'licht'; lt.push(k);
          break;
        }
      }
    }
    teile.set('licht', lt);
  }

  PLAN = { zellen, teile, oeff };
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
      }
    }
  };
}

module.exports = { modul, lade, plan, zelleBei, Y, BODEN_Y, T, UC, decke, oculus };
