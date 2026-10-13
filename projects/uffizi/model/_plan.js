'use strict';
// Uffizien: Belegungsplan der Module 1-7 und 9 (Katalog BAUTEIL_KATALOG.md, Korrekturen K0-K8).
// Jede Spalte der Maske M_UF hat Lagen L = Y - 65 (1..51 Gebäude, bis etwa 80 Tribuna). Die Regeln
// beanspruchen Zellen in der Reihenfolge "Details vor allgemeinen Bauteilen" (K0); das erste Bauteil
// gewinnt, spätere lassen die Zelle aus. Die Module lesen danach ihre Bauteile mit cells(name) aus.
// Die Regeln stehen in den Stufen _p_*.js; sie erhalten den Kontext P.

const { get, polylinie, SLOTS, AIR, TYP } = require('./_uf.js');

// ------------------------------------------------------------------ Bauteile (Reihenfolge = Bau-Reihenfolge)
const PART_LIST = [
  // Modul 1 Portikus
  ['portikus_pfeiler', 1], ['portikus_saeulen', 1], ['portikus_gebaelk', 1], ['portikus_rueckwand', 1],
  ['portikus_decke', 1], ['stirnwaende', 1],
  // Modul 2 Mezzanin und Piano nobile
  ['mezzanin_wand', 2], ['nobile_wand', 2], ['gurtgesimse', 2],
  // Modul 3 Dachloggia und Kranzgesims
  ['loggia_boden', 3], ['loggia_pfeiler_saeulen', 3], ['loggia_verglasung', 3], ['loggia_rueckwand', 3], ['kranzgesims', 3],
  // Modul 4 Südbau
  ['suedbau_waende', 4], ['serliana', 4], ['serliana_aufsatz', 4], ['durchgang_arno', 4], ['verone_arno', 4],
  // Modul 5 Rückseiten
  ['rueckseiten_sockel', 5], ['rueckseiten_wand', 5], ['rueckseiten_gesims', 5], ['loggia_anschluss', 5],
  ['ostnord_front', 5],
  // Modul 6 Dächer und Tribuna
  ['dach_nebenbau', 6], ['dach_fluegel', 6], ['tribuna_tambour', 6], ['tribuna_kuppel', 6], ['tribuna_laterne', 6],
  // Modul 7 Decken, Innenwände, Treppen
  ['decke_14', 7], ['decke_20', 7], ['decke_36', 7], ['decke_traufe', 7], ['spinnwand_fluegel', 7], ['trennwaende', 7],
  ['treppen', 7], ['scalone_treppe', 7], ['korridor_treppe', 7],
  // Modul 9 Statuen
  ['statuen', 9]
];
const PID = {};
PART_LIST.forEach(([n], i) => { PID[n] = i + 1; });

const MATS = [TYP.pietra_serena, TYP.putz_sand, TYP.pietra_forte, TYP.pflaster, TYP.marmor_ornament,
  TYP.glas_fenster, TYP.dachziegel, TYP.holz, TYP.marmor_weiss, TYP.pietra_forte_bruch];
const MAT = { serena: 0, putz: 1, forte: 2, pflaster: 3, kapitell: 4, glas: 5, dach: 6, holz: 7, weiss: 8, bruch: 9 };
/** Materialindex zu einem Namen aus MAT oder direkt zu einem Palettentyp (z. B. Treppenblock, Freskenkeramik); neue Typen werden angehängt. */
function matId(m) {
  if (MAT[m] !== undefined) return MAT[m];
  let i = MATS.indexOf(m);
  if (i < 0) { if (MATS.length >= 255) throw new Error('Zu viele Materialien im Plan'); MATS.push(m); i = MATS.length - 1; }
  return i;
}

// Höhen (Lagen)
const PORTIKUS = 14, MEZZ = 20, PN = 36, TRAUFE = 51, NB_TRAUFE = 44;
const ZONE_X = 0, ZONE_W = 1, ZONE_E = 2, ZONE_S = 3;
const K_GEN = 0, K_F = 1, K_ST = 2, K_SER = 3, K_SS = 4;   // Spaltenart

// Kanten mit besonderer Rolle (Katalog Modul 4/5)
const KANTEN_LA = new Set([27, 28, 29]);
const KANTEN_ON = new Set([38, 39, 40, 41]);
const KANTEN_FSR = new Set([51, 52, 53]);
const KANTE_KORRIDOR = 41;
const TUER_S0 = 3.35, TUER_S1 = 10.35;     // Öffnung in Kante 41 (Kantenabschnitt, Katalog §11)

const STUFEN = ['fassade', 'sued', 'wand', 'tribuna', 'dach', 'innen', 'treppen', 'decken', 'statuen', 'risse'];

let cache = null;

function plan() {
  if (cache) return cache;
  const S = get();
  const { N, cx, cz, uu, ww, d8, at, R, M } = S;
  const own = new Uint16Array(N * SLOTS);
  const mt = new Uint8Array(N * SLOTS);
  const over = [];                      // Zellen außerhalb der Maske (Kranzgesims +1): { x, z, L, part, mat }

  const claim = (i, L, part, mat) => {
    const k = i * SLOTS + L;
    if (own[k]) return false;
    const p = PID[part];
    if (!p) throw new Error(`Unbekanntes Bauteil ${part}`);
    own[k] = p; mt[k] = matId(mat);
    return true;
  };
  // Setzt auch auf bewusst leere Zellen (AIR), z. B. Statuen in Nischen
  const place = (i, L, part, mat) => {
    const k = i * SLOTS + L;
    if (own[k] && own[k] !== AIR) return false;
    own[k] = PID[part]; mt[k] = matId(mat);
    return true;
  };
  // Öffnungen für R14: air(i, L, art, teil) merkt die Zelle mit Art (tuer|tor|fenster_offen|arkade|loggia|scharte) und Bauteil
  const oeff = [];
  const air = (i, L, art, teil) => {
    const k = i * SLOTS + L;
    if (!own[k]) own[k] = AIR;
    if (art && own[k] === AIR) oeff.push({ k, art, teil });
  };
  const free = (i, L) => own[i * SLOTS + L] === 0;
  // Öffnung schneiden: macht die Zelle leer, auch wenn sie schon einem Bauteil gehörte (Portale, Türen in Wänden)
  const carve = (i, L) => { const k = i * SLOTS + L; own[k] = AIR; mt[k] = 0; };
  const range = (i, L0, L1, part, mat) => { for (let L = L0; L <= L1; L++) claim(i, L, part, mat); };

  // ---------------------------------------------------------------- Rahmen, Ebenen der Fassaden, Zonen
  const kant = M.kanten();
  const loc = (p) => R.toLocal(p.x, p.z);
  const eLoc = (i) => [loc(kant[i].a), loc(kant[i].b)];
  // Piazzale-Flächen als Linienzug aus den Polygonkanten (die OSM-Kanten gelten, nicht die Näherungsformel des Katalogs)
  const fw = (() => { const [a, b] = eLoc(31), [, c] = eLoc(32); return polylinie([[a.w, a.u], [b.w, b.u], [c.w, c.u]]); })();
  const fe = (() => { const [a, b] = eLoc(35), [, c] = eLoc(36); return polylinie([[c.w, c.u], [b.w, b.u], [a.w, a.u]]); })();
  const fsn = (() => { const [a, b] = eLoc(33), [, c] = eLoc(34); return polylinie([[a.u, a.w], [b.u, b.w], [c.u, c.w]]); })();

  const zone = new Uint8Array(N), kind = new Uint8Array(N), tF = new Uint8Array(N), tAll = new Uint8Array(N);
  const side = new Uint8Array(N);
  for (let i = 0; i < N; i++) {
    const u = uu[i], w = ww[i];
    let z = ZONE_X;
    if (w >= 276 && u >= -26 && u < 80) z = ZONE_S;
    else if (w >= 0 && w < 276 && fw(w) - u >= -0.3 && fw(w) - u < 40) z = ZONE_W;
    else if (w >= -4 && w < 276 && u - fe(w) >= -0.3 && u - fe(w) < 40) z = ZONE_E;
    zone[i] = z;
    let k = K_GEN;
    if (z === ZONE_W || z === ZONE_E) {
      const dd = z === ZONE_W ? fw(w) - u : u - fe(w);
      const t = Math.max(1, Math.floor(dd) + 1);
      tAll[i] = t; side[i] = z;
      if (t <= 14) { tF[i] = t; k = Math.floor(w) < 12 ? K_ST : K_F; }
    } else if (z === ZONE_S) {
      const fu = Math.floor(u);
      if (fu >= 0 && fu <= 27 && w < 283) k = K_SER;
      else if (w < 288) {
        const dW = fw(276) - u, dE = u - fe(275.8);
        if (dW >= -0.3 && dW < 14) { tF[i] = Math.max(1, Math.floor(dW) + 1); side[i] = ZONE_W; k = K_SS; }
        else if (dE >= -0.3 && dE < 14) { tF[i] = Math.max(1, Math.floor(dE) + 1); side[i] = ZONE_E; k = K_SS; }
      }
    }
    kind[i] = k;
  }
  const nearE = new Int16Array(N).fill(-1);
  for (let i = 0; i < N; i++) if (d8[i] <= 4 && kind[i] === K_GEN) nearE[i] = M.naechsteKante(cx[i], cz[i]);

  // Fassadenmodul 24 (Pfeiler 5, Öffnung 5, Säule 2, Öffnung 5, Säule 2, Öffnung 5) ab w = 12 + 24 k
  const elOf = (wl) => {
    if (wl <= 4) return { e: 'P', q: wl - 2, oi: -1 };
    if (wl <= 9) return { e: 'O', q: wl - 7, oi: 0 };
    if (wl <= 11) return { e: 'C', q: 0, oi: -1 };
    if (wl <= 16) return { e: 'O', q: wl - 14, oi: 1 };
    if (wl <= 18) return { e: 'C', q: 0, oi: -1 };
    return { e: 'O', q: wl - 21, oi: 2 };
  };
  const fmod = (w) => { const jw = Math.floor(w) - 12; const k = Math.floor(jw / 24); return { k, wl: jw - 24 * k }; };

  const P = { S, N, own, mt, over, SLOTS, AIR_ID: AIR, oeff, claim, place, air, carve, free, range, zone, kind, tF, tAll, side, nearE, fw, fe, fsn, kant,
    elOf, fmod, PID, MAT, matId,
    PORTIKUS, MEZZ, PN, TRAUFE, NB_TRAUFE, ZONE_X, ZONE_W, ZONE_E, ZONE_S, K_GEN, K_F, K_ST, K_SER, K_SS,
    KANTEN_LA, KANTEN_ON, KANTEN_FSR, KANTE_KORRIDOR, TUER_S0, TUER_S1,
    kranzSpalten: [], statuenNischen: [], tribuna: null, treppeKorridor: null };

  for (const st of STUFEN) require(`./_p_${st}.js`)(P);

  // Listen je Bauteil
  const lists = PART_LIST.map(() => []);
  for (let k = 0; k < own.length; k++) {
    const p = own[k];
    if (p && p !== AIR) lists[p - 1].push(k);
  }
  P.lists = lists;
  cache = P;
  return cache;
}

/** Zellen eines Bauteils als Gruppen je Material: [{ mat: 'typ', cells: [{x, y, z}] }]. */
function cells(name) {
  const P = plan();
  const { S, own, mt, lists, over } = P;
  const id = PID[name];
  if (!id) throw new Error(`Unbekanntes Bauteil ${name}`);
  const byMat = new Map();
  const add = (m, x, y, z) => {
    let a = byMat.get(m);
    if (!a) byMat.set(m, a = []);
    a.push({ x, y, z });
  };
  for (const k of lists[id - 1]) {
    const i = Math.floor(k / SLOTS), L = k - i * SLOTS;
    add(mt[k], S.cx[i], S.BODEN + L, S.cz[i]);
  }
  for (const o of over) if (PID[o.part] === id) add(matId(o.mat), o.x, S.BODEN + o.L, o.z);
  void own;
  return [...byMat.entries()].map(([m, list]) => ({ mat: MATS[m], cells: list }));
}

module.exports = { plan, cells, PART_LIST, PID, MATS, MAT, matId, STUFEN };
