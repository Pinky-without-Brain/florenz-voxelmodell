'use strict';
// Gemeinsame Geometrie des Palazzo Pitti (Katalog: 20_Stadtmodell_Florenz/wahrzeichen/palazzo_pitti/BAUTEIL_KATALOG.md).
// Rahmen PI (θ = −33,1°): u entlang der Hauptfassade nach Nordost, w nach innen (Südost); Piazza bei w < 0.
// Lagen: L = Y − 83 (Plattenoberkante Lage 0). Zonen: F Seitenflügel (1 Geschoss), W westlicher Nebenbau
// (2 Geschosse), H Hauptkörper (3 Geschosse). Jede Zone hat ein eigenes Abstandsfeld dz (Randzelle = 1, auch an den
// Grenzen zu anderen Zonen und an den Höfen), Wandband = {dz ≤ t(L)}.
// Alles hier ist reine Geometrie (deterministisch); die Module setzen Blöcke über das Belegungsregister
// (zuerst gebaut gewinnt, reservierte Luft bleibt frei: Fugen, Fenster, Türen, Treppenlöcher).

const fs = require('node:fs');
const path = require('node:path');
const WZ = require('../../../tools/wahrzeichen');
const P = require('../../../tools/city/poly.js');
const { packKey } = require('../../../tools/geom/grid.js');
const ground = require('../../../tools/city/ground_stadt.js');

const DIR = path.resolve(__dirname, '..');
const PJ = JSON.parse(fs.readFileSync(path.join(DIR, 'project.json'), 'utf8'));
const BODEN_Y = PJ.bodenY;                           // 83
const Y = (L) => BODEN_Y + L;
const R = WZ.makeRahmen(PJ.rahmen);
const M = WZ.ladeMasken(PJ, { dir: DIR });
const MH = M.haupt;
const K2 = (x, z) => P.ck(x, z);
const ck3 = (x, y, z) => x + ',' + y + ',' + z;

// ---------------------------------------------------------------- Maße (Katalog §0.3, §0.4)
const U_FA = [0, 345.5];                 // Fassadenstreifen
const ACHSEN = [8, 25, 41, 58, 74, 91, 107, 123, 140, 156, 173, 189, 206, 222, 239, 255, 272, 288, 304, 321, 337];
const PORTAL_U = 173;
const KNIE = [7, 13];                    // Kniefenster-Achsen (Index)
const H_TOP = 74, H_GESIMS = [75, 76], H_TRAUFE = 77;
const W_TOP = 50, W_GESIMS = [51, 52], W_TRAUFE = 53;
const F_TOP = 20, F_DACH = [21, 22];
const DECKEN = { eg: [24, 25], pn: [49, 50], og: [73, 74] };
const STAND = { eg: 1, pn: 26, og: 51 };
const FENSTER_L = { eg: [6, 18], pn: [31, 43], og: [56, 68] };
const ZONE_NAMEN = { F: 'Seitenflügel', W: 'Nebenbau', H: 'Hauptkörper' };

// ---------------------------------------------------------------- Zellen
const ZELLEN = [];
const AN = new Map();
const HOEFE = MH.loecher();                      // 0 = L0, 1 = L1, 2 = L2 (Ammannati-Hof)
for (const [x, z] of [...MH.cells, ...HOEFE.flatMap((h) => h.cells)]) {
  if (AN.has(K2(x, z))) continue;
  const l = R.toLocal(x, z);
  const c = { x, z, u: l.u, w: l.w, gt: ground.groundTopY(x, z), hof: -1 };
  for (let i = 0; i < HOEFE.length; i++) if (HOEFE[i].has(x, z)) c.hof = i;
  if (c.hof < 0) c.zone = (c.w < 0 || c.u < 0 || c.u >= 345.5) ? 'F' : (c.u < 60 && c.w >= 50 ? 'W' : 'H');
  ZELLEN.push(c);
  AN.set(K2(x, z), c);
}
const zelle = (x, z) => AN.get(K2(x, z));
const MATERIAL = ZELLEN.filter((c) => c.hof < 0);
const ZM = {};
for (const z of ['F', 'W', 'H']) ZM[z] = WZ.Maske.vonZellen(MATERIAL.filter((c) => c.zone === z).map((c) => [c.x, c.z]));
for (const c of MATERIAL) {
  c.dz = ZM[c.zone].d8(c.x, c.z);                // Abstand zum Zonenrand
  c.d8 = MH.d8(c.x, c.z);                        // Abstand zur Außenkante (Höfe zählen als innen)
  c.dH = Infinity;                               // Abstand zum nächsten Hof
  c.hofSeite = -1;
  for (let i = 0; i < HOEFE.length; i++) { const d = MH.dLoch(i, c.x, c.z); if (d > 0 && d < c.dH) { c.dH = d; c.hofSeite = i; } }
}

// Flächiger Nachbar in der nächsten Tiefe (für Fugen: im gedrehten Raster hängen manche Außenzellen nur über Ecken an
// der Wand; ohne flächigen Nachbarn bleibt die Zelle voll, sonst würde sie zwischen zwei Lagerfugen schweben)
for (const c of MATERIAL) {
  c.tn = { d8: false, dH: false, dz: false };
  for (const [dx, dz] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) {
    const n = AN.get(K2(c.x + dx, c.z + dz));
    if (!n || n.hof >= 0) continue;
    for (const f of ['d8', 'dH', 'dz']) if (n[f] === c[f] + 1) c.tn[f] = true;
  }
}

/** Wandstärke der Zone in Lage L */
function t(c, L) {
  if (c.zone === 'F') return 5;
  return L <= 25 ? 5 : 4;
}
const topVon = (c) => (c.zone === 'F' ? F_TOP : c.zone === 'W' ? W_TOP : H_TOP);
const imWandband = (c, L) => c.hof < 0 && c.dz <= t(c, L);
// Fassadenstreifen: Wandband der Hauptfassade (Kantenabstand d8 ≤ t, vorderer Bereich w < 12)
const istFA = (c, L) => c.zone === 'H' && c.u >= U_FA[0] && c.u < U_FA[1] && c.w < 12 && c.d8 <= t(c, L);
const istHofband = (c, L) => c.hof < 0 && c.dH <= t(c, L) && c.dH <= c.dz;
const istAussen = (c, L) => c.hof < 0 && c.d8 <= t(c, L);

// ---------------------------------------------------------------- Kanten und Wandkoordinate s
const KANTEN = MH.kanten();
// Wandkoordinate einer Außenwandzelle: (Kante, s entlang der Kante, Länge)
function aussenKante(c) {
  if (c._ak !== undefined) return c._ak;
  const i = MH.naechsteKante(c.x, c.z);
  const k = KANTEN[i];
  c._ak = k ? { i, s: k.rahmen.toLocal(c.x, c.z).u, L: k.L } : null;
  return c._ak;
}
// Hofseite (im Rahmen PI sind die Höfe Rechtecke): { seite: 'u0'|'u1'|'w0'|'w1', s, L, s0 }
const HOF_BOX = HOEFE.map((h) => {
  let u0 = Infinity, u1 = -Infinity, w0 = Infinity, w1 = -Infinity;
  for (const [x, z] of h.cells) { const l = R.toLocal(x, z); u0 = Math.min(u0, l.u); u1 = Math.max(u1, l.u); w0 = Math.min(w0, l.w); w1 = Math.max(w1, l.w); }
  return { u0, u1, w0, w1 };
});
function hofKante(c) {
  const b = HOF_BOX[c.hofSeite];
  if (!b) return null;
  const d = { u0: b.u0 - c.u, u1: c.u - b.u1, w0: b.w0 - c.w, w1: c.w - b.w1 };
  const seite = Object.keys(d).sort((a, q) => d[q] - d[a])[0];
  const quer = seite[0] === 'u';
  return { seite, s: quer ? c.w - b.w0 : c.u - b.u0, L: quer ? b.w1 - b.w0 : b.u1 - b.u0 };
}
/** Achsen gleichmäßig auf einer Kante der Länge Lk: Teilung p (Ziel), Rand rand -> [s] */
function achsen(Lk, p, rand) {
  const n = Math.round((Lk - 2 * rand) / p) + 1;
  if (Lk < 2 * rand + 1 || n < 1) return [];
  if (n === 1) return [Lk / 2];
  const step = (Lk - 2 * rand) / (n - 1);
  return Array.from({ length: n }, (_, k) => rand + k * step);
}

// ---------------------------------------------------------------- Öffnungen
/** Rundbogenöffnung: Breite b, gerader Teil Lage l0..l1, darüber Halbkreis r = b/2. -> true, wenn (ds, L) offen */
function bogenOffen(ds, L, b, l0, l1) {
  const r = b / 2;
  if (L < l0) return false;
  if (L <= l1) return Math.abs(ds) < r;
  const h = L - l1 - 0.5;
  return h < r && Math.abs(ds) < Math.sqrt(r * r - h * h);
}
function bogenRahmen(ds, L, b, l0, l1, dicke) {
  if (bogenOffen(ds, L, b, l0, l1)) return false;
  return bogenOffen(ds, L, b + 2 * dicke, l0 - dicke, l1);
}

/**
 * Fenster in einer Wandzelle: 'glas' | 'rahmen' | 'luft' | null. tiefe = Abstand zur Wandaußenseite (1 = außen).
 * Glas in den Tiefen 1..3 (im gedrehten Raster flächenverbunden und trägt den Rahmen darüber), Rahmen in Tiefe 1,
 * innere Laibung Luft.
 */
function fensterArt(ds, L, b, l0, l1, tiefe) {
  if (bogenOffen(ds, L, b, l0, l1)) return tiefe <= 3 ? 'glas' : 'luft';
  if (tiefe === 1 && bogenRahmen(ds, L, b, l0, l1, 1)) return 'rahmen';
  return null;
}
function geschossFenster(c, L, ds, b, lagen, tiefe) {
  for (const [a, e] of lagen) {
    if (L < a - 1 || L > e + 1) continue;
    const r = fensterArt(ds, L, b, a, e - 4, tiefe);
    if (r) return r;
  }
  return null;
}
const lagenVon = (zone) => (zone === 'H' ? [FENSTER_L.eg, FENSTER_L.pn, FENSTER_L.og] : zone === 'W' ? [FENSTER_L.eg, FENSTER_L.pn] : [[5, 13 + 4]]);

/** Hauptfassade (FA): Fenster, Kniefenster, Portal. -> 'glas'|'rahmen'|'luft'|'portal'|'laibung'|'holz'|null */
function fassadenOeffnung(c, L) {
  const tiefe = c.d8;                         // FA: Tiefe = Abstand zur Außenkante (1 = außen)
  // Hauptportal 9 × 15 (11 gerade + Bogen), Laibung und Archivolte 2, offene Flügel 1 breit an der Innenseite
  const dp = c.u - PORTAL_U;
  if (bogenOffen(dp, L, 9, 1, 11)) return 'portal';
  if (bogenRahmen(dp, L, 9, 1, 11, 2)) return 'laibung';
  for (let k = 0; k < ACHSEN.length; k++) {
    if (k === 10) continue;
    const ds = c.u - ACHSEN[k];
    if (Math.abs(ds) > 5) continue;
    const lagen = KNIE.includes(k) ? [[4, 16], FENSTER_L.pn, FENSTER_L.og] : [FENSTER_L.eg, FENSTER_L.pn, FENSTER_L.og];
    const r = geschossFenster(c, L, ds, 7, lagen, tiefe);
    if (r) return r;
  }
  return null;
}

/** Außenwand (nicht FA): Fenster 7 × 13 (F: 5 × 9) an Kanten ≥ 24, Teilung ≈ 16,45, Rand 8. */
function aussenOeffnung(c, L) {
  // nur an der Maskenkante: Wände über niedrigeren Zonen (dz < d8) bleiben blind
  if (!istAussen(c, L) || c.d8 > c.dz) return null;
  const ak = aussenKante(c);
  if (!ak || ak.L < 24) return null;
  const b = c.zone === 'F' ? 5 : 7;
  for (const s0 of achsen(ak.L, c.zone === 'F' ? 16 : 16.45, 8)) {
    const ds = ak.s - s0;
    if (Math.abs(ds) > b / 2 + 1.5) continue;
    const r = geschossFenster(c, L, ds, b, lagenVon(c.zone), c.d8);
    if (r) return r;
  }
  return null;
}

/** Hofwand: Ammannati-Hof (L2) mit Blendarkaden an drei Seiten im EG, Fenster 7 × 13 sonst; L0/L1 kleine Fenster 3 × 5. */
function hofOeffnung(c, L) {
  if (!istHofband(c, L)) return null;
  const hk = hofKante(c);
  if (!hk) return null;
  const tiefe = c.dH;
  if (c.hofSeite === 2) {
    const blend = hk.seite !== 'w0';
    // Hof-Tor (Modul 7) liegt in der Vorderseite w0 bei u 173
    for (const s0 of achsen(hk.L, 16, 8)) {
      const ds = hk.s - s0;
      if (Math.abs(ds) > 6) continue;
      if (blend && L <= 14) {
        if (bogenOffen(ds, L, 9, 1, 9) && tiefe <= 2) return 'nische';
        if (bogenRahmen(ds, L, 9, 1, 9, 1) && tiefe === 1) return 'rahmen';
        continue;
      }
      const lagen = blend ? [FENSTER_L.pn, FENSTER_L.og] : [FENSTER_L.eg, FENSTER_L.pn, FENSTER_L.og];
      const r = geschossFenster(c, L, ds, 7, lagen, tiefe);
      if (r) return r;
    }
    return null;
  }
  for (const s0 of achsen(hk.L, 8, 4)) {
    const ds = hk.s - s0;
    if (Math.abs(ds) > 3) continue;
    for (const [a, e] of [[7, 11], [32, 36], [57, 61]]) {
      if (L < a || L > e) continue;
      if (Math.abs(ds) < 1.5) return tiefe <= 3 ? 'glas' : 'luft';
    }
  }
  return null;
}

/** Rustika-Fuge (§0.6): Außenlage, Lagerfuge (Fassade alle 4, Hof alle 2 Lagen) und Stoßfuge alle 8 im Verband. */
function fuge(c, L, s, hof) {
  if (!c.tn[hof ? 'dH' : 'd8']) return false;
  if (hof) return L % 2 === 0;
  if (L % 4 === 0) return true;
  const off = (Math.floor(L / 4) % 2) * 4;
  return ((Math.floor(s - off) % 8) + 8) % 8 === 0;
}

// ---------------------------------------------------------------- Belegungsregister
const REG = new WeakMap();
function belegung(ctx) {
  let b = REG.get(ctx.grid);
  if (b) return b;
  const typ = new Map();
  const key = (x, y, z) => packKey(x, y, z);
  b = {
    frei: (x, y, z) => !typ.has(key(x, y, z)) && !ctx.grid.has(x, y, z),
    set(w, x, y, z, t) {
      const k = key(x, y, z);
      if (typ.has(k) || ctx.grid.has(x, y, z)) return false;
      if (!M.alle.innen(x, z) && !(M.alle.dAussen(x, z) <= PJ.luftraum)) return false;
      w.set(x, y, z, t);
      typ.set(k, t);
      return true;
    },
    setL(w, c, L, t) { return b.set(w, c.x, Y(L), c.z, t); },
    luft(x, y, z) { if (!typ.has(key(x, y, z))) typ.set(key(x, y, z), null); },
    luftL(c, L) { b.luft(c.x, Y(L), c.z); },
    // reservierte Luft nachträglich füllen (Torflügel, Einbauten in Öffnungen)
    ersetzeLuft(w, x, y, z, t) {
      const k = key(x, y, z);
      if (typ.get(k) !== null || ctx.grid.has(x, y, z)) return false;
      w.set(x, y, z, t);
      typ.set(k, t);
      return true;
    },
    istLuft: (x, y, z) => typ.get(key(x, y, z)) === null
  };
  REG.set(ctx.grid, b);
  return b;
}

// Gelände mit Aushub (wie spec/ground.js): im Footprint höchstens bis bodenY − 1
const bodenTop = (x, z) => { const t = ground.groundTopY(x, z); return MH.innen(x, z) ? Math.min(t, BODEN_Y - 1) : t; };

// ---------------------------------------------------------------- Bauplan mit Stützpass
/**
 * Sammelt die Zellen eines Moduls (fest oder Luft), prüft lagenweise den Halt (R3: Flächenkontakt zu Darunterliegendem
 * oder zu früher Gesetztem, seitlich über feste Zellen derselben Lage) und schließt, wo eine feste Zelle über einer
 * Luftöffnung nur über Ecken hinge, die Luftzelle darunter (die Öffnung wird dort um eine Zelle kleiner).
 *   const p = bauplan(ctx); p.fest(teilId, x, y, z, typ); p.luft(x, y, z, art?); p.bauen();
 * art: Öffnungsart für ctx.oeffnung ('tor', 'arkade', …) oder undefined (nur reservierte Luft).
 */
function bauplan(ctx) {
  const B = belegung(ctx);
  const zellen = new Map();                 // key -> { x, y, z, teil, typ } | { x, y, z, luft: true, art }
  const reihenfolge = [];
  const key = (x, y, z) => packKey(x, y, z);
  const p = {
    fest(teil, x, y, z, typ) {
      const k = key(x, y, z);
      if (zellen.has(k) || !B.frei(x, y, z)) return;
      if (!reihenfolge.includes(teil)) reihenfolge.push(teil);
      zellen.set(k, { x, y, z, teil, typ });
    },
    festL(teil, c, L, typ) { p.fest(teil, c.x, Y(L), c.z, typ); },
    luft(x, y, z, art) {
      const k = key(x, y, z);
      if (zellen.has(k) || !B.frei(x, y, z)) return;
      zellen.set(k, { x, y, z, luft: true, art });
    },
    luftL(c, L, art) { p.luft(c.x, Y(L), c.z, art); },
    // Luft einer inneren Fensterlaibung: bewusst unzugänglich (Fensterbank über Kopfhöhe)
    laibungL(c, L) { p.luft(c.x, Y(L), c.z, 'laibung'); },
    bauen() {
      const istFest = (x, y, z) => { const e = zellen.get(key(x, y, z)); return e ? !e.luft : ctx.grid.has(x, y, z); };
      const ys = [...new Set([...zellen.values()].map((e) => e.y))].sort((a, b) => a - b);
      const N4 = [[1, 0], [-1, 0], [0, 1], [0, -1]];
      const nachLage = new Map();
      for (const e of zellen.values()) { let a = nachLage.get(e.y); if (!a) nachLage.set(e.y, a = []); a.push(e); }
      const schliessen = (x, y, z, tiefe) => {
        // Luftzelle unter (x, y, z) wird fest (Typ der Zelle darüber); falls auch sie keinen Halt hat, weiter nach unten
        const e = zellen.get(key(x, y - 1, z));
        const oben = zellen.get(key(x, y, z));
        if (!e || !e.luft || tiefe > 30) return;
        zellen.set(key(x, y - 1, z), { x, y: y - 1, z, teil: oben.teil, typ: oben.typ });
        if (!istFest(x, y - 2, z) && !hatSeitenhalt(x, y - 1, z)) schliessen(x, y - 1, z, tiefe + 1);
      };
      // Seitenhalt nur über Zellen desselben oder eines früher gebauten Bauteils (Bauschritte laufen bauteilweise)
      const rang = (teil) => reihenfolge.indexOf(teil);
      const frueher = (n, teil) => (n ? !n.luft && rang(n.teil) <= rang(teil) : false);
      const hatSeitenhalt = (x, y, z) => {
        const eigen = zellen.get(key(x, y, z));
        return N4.some(([dx, dz]) => {
          const n = zellen.get(key(x + dx, y, z + dz));
          const fest = n ? frueher(n, eigen.teil) : ctx.grid.has(x + dx, y, z + dz);
          return fest && istFest(x + dx, y - 1, z + dz);
        });
      };
      // Halt je Lage (die Bauteile sind so geschnitten, dass jede Lage in einem Bauschritt liegt): fest darunter,
      // Gelände, Nachbar aus früheren Modulen; seitlich über feste Planzellen derselben Lage (Flächenkontakt)
      for (const y of ys) {
        const lage = (nachLage.get(y) || []).filter((e) => !e.luft);
        const gehalten = new Set();
        const stack = [];
        for (const e of lage) {
          const ok = istFest(e.x, y - 1, e.z) || y <= bodenTop(e.x, e.z) + 1 ||
            N4.some(([dx, dz]) => ctx.grid.has(e.x + dx, y, e.z + dz)) || ctx.grid.has(e.x, y + 1, e.z);
          if (ok) { gehalten.add(key(e.x, y, e.z)); stack.push(e); }
        }
        while (stack.length) {
          const e = stack.pop();
          for (const [dx, dz] of N4) {
            const n = zellen.get(key(e.x + dx, y, e.z + dz));
            if (!n || n.luft || rang(n.teil) > rang(e.teil) || gehalten.has(key(n.x, y, n.z))) continue;
            gehalten.add(key(n.x, y, n.z)); stack.push(n);
          }
        }
        for (const e of lage) if (!gehalten.has(key(e.x, y, e.z))) schliessen(e.x, y, e.z, 0);
      }
      const teile = new Map(reihenfolge.map((id) => [id, ctx.part(id)]));
      const arten = new Map();
      for (const e of zellen.values()) {
        if (e.luft) {
          B.luft(e.x, e.y, e.z);
          if (e.art) { let a = arten.get(e.art); if (!a) arten.set(e.art, a = []); a.push({ x: e.x, y: e.y, z: e.z }); }
        }
      }
      for (const id of reihenfolge) for (const e of zellen.values()) if (!e.luft && e.teil === id) B.set(teile.get(id), e.x, e.y, e.z, e.typ);
      for (const [art, z] of arten) {
        if (art === 'laibung') ctx.unzugaenglich(z, 'Innere Fensterlaibung: Fensterbank über Kopfhöhe, kein Standplatz');
        else ctx.oeffnung(z, art);
      }
    }
  };
  return p;
}

// ---------------------------------------------------------------- Rollen
const T = Object.freeze({
  forte: WZ.typ('pietra_forte'), rustika: WZ.typ('pietra_forte_rustika'), bruch: WZ.typ('pietra_forte_bruch'),
  serena: WZ.typ('pietra_serena'), pflaster: WZ.typ('pflaster'), glas: WZ.typ('glas_fenster'), holz: WZ.typ('holz'),
  dach: WZ.typ('dachziegel'), putz: WZ.typ('putz_sand'), marmor: WZ.typ('marmor_weiss'), licht: WZ.typ('licht'),
  mauer: WZ.typ('mauerwerk'), gold: WZ.typ('gold'), wasser: WZ.typ('wasser'),
  fresko: (f) => WZ.fresko(f)
});

module.exports = {
  PJ, BODEN_Y, Y, R, M, MH, K2, ck3, P, WZ, T, ZELLEN, MATERIAL, AN, zelle, HOEFE, HOF_BOX, ZM,
  ACHSEN, PORTAL_U, H_TOP, H_GESIMS, H_TRAUFE, W_TOP, W_GESIMS, W_TRAUFE, F_TOP, F_DACH, DECKEN, STAND, FENSTER_L, ZONE_NAMEN,
  t, topVon, imWandband, istFA, istHofband, istAussen, aussenKante, hofKante, achsen, bogenOffen, bogenRahmen,
  fassadenOeffnung, aussenOeffnung, hofOeffnung, fuge, belegung, bauplan
};
