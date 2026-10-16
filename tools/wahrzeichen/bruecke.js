'use strict';
// Gemeinsamer Bauplan für die Arnobrücken (Wahrzeichen-Welle 4). Hauptmaske = Brückenfläche aus flaechen.json
// (project.json: "gebaeude": [], "flaechen": [...]). Rahmen: u über die Brücke (von Ufer zu Ufer), w quer.
// Aus der Maske werden abgeleitet: Breite je u, Pfeiler (Ausbuchtungen des Umrisses = Vorköpfe), Flussbereich
// (Gelände ≤ Wasserspiegel + 1), Fahrbahnhöhe an beiden Enden (Straße hinter dem Brückenende). Bögen spannen zwischen
// Ufer und Pfeilern; Fahrbahn mit Pflaster, Brüstungen an den Längsseiten, optional Statuen an den Ecken.
//
// cfg = { dir, form: 'ellipse'|'segment', kaempfer: Lagen über dem Wasser, dicke: Scheitelstärke unter der Fahrbahn,
//         buckel: Überhöhung der Fahrbahnmitte, bruestung: Höhe, statuen?: true, material: { stirn, bogen, kern, bruestung, belag } }

const fs = require('node:fs');
const path = require('node:path');
const WZ = require('./index.js');
const P = require('../city/poly.js');
const ground = require('../city/ground_stadt.js');

const N4 = [[1, 0], [-1, 0], [0, 1], [0, -1]];
const median = (a) => { const s = a.slice().sort((p, q) => p - q); return s.length ? s[Math.floor(s.length / 2)] : 0; };

function bruecke(cfg) {
  const DIR = cfg.dir;
  const PJ = JSON.parse(fs.readFileSync(path.join(DIR, 'project.json'), 'utf8'));
  const T = Object.assign({
    stirn: WZ.typ('pietra_forte'), bogen: WZ.typ('pietra_forte'), kern: WZ.typ('pietra_forte_bruch'), bruestung: WZ.typ('pietra_forte'),
    belag: WZ.typ('pflaster'), deckel: WZ.typ('pietra_serena'), statue: WZ.typ('marmor_weiss'), licht: WZ.typ('licht')
  }, cfg.material || {});

  let G = null;
  function geometrie() {
    if (G) return G;
    const masken = WZ.ladeMasken(PJ, { dir: DIR });
    const R = masken.rahmen, H = masken.haupt;
    const zellen = H.cells.map(([x, z]) => { const l = R.toLocal(x, z); return { x, z, u: l.u, w: l.w, d8: H.d8(x, z), gt: ground.groundTopY(x, z) }; });
    const byKey = new Map(zellen.map((c) => [P.ck(c.x, c.z), c]));
    const U0 = Math.floor(Math.min(...zellen.map((c) => c.u))), U1 = Math.ceil(Math.max(...zellen.map((c) => c.u)));
    // Breite und Mitte je u-Schnitt (1 Block)
    const schnitt = new Map();
    for (const c of zellen) { const k = Math.floor(c.u); let s = schnitt.get(k); if (!s) schnitt.set(k, s = { w0: Infinity, w1: -Infinity, gt: [] }); s.w0 = Math.min(s.w0, c.w); s.w1 = Math.max(s.w1, c.w); s.gt.push(c.gt); }
    const breiten = [...schnitt.values()].map((s) => s.w1 - s.w0);
    const basis = median(breiten);
    // Wasserspiegel: Median des Geländes in der Brückenmitte (DGM zeigt den Wasserspiegel)
    const mitte = zellen.filter((c) => Math.abs(c.u - (U0 + U1) / 2) < (U1 - U0) * 0.3).map((c) => c.gt);
    const W = median(mitte);
    const imFluss = (k) => { const s = schnitt.get(k); return s && median(s.gt) <= W + 1; };
    let F0 = U1, F1 = U0;
    for (let k = U0; k <= U1; k++) if (imFluss(k)) { F0 = Math.min(F0, k); F1 = Math.max(F1, k + 1); }
    // Fahrbahnhöhe an den Enden: höchstes Gelände knapp hinter dem Brückenende auf der Achse (Straße)
    const wm = (s) => (s.w0 + s.w1) / 2;
    const endHoehe = (u, richtung) => {
      const s = schnitt.get(Math.floor(u)) || { w0: -2, w1: 2 };
      let h = -Infinity;
      for (let d = 0; d <= 4; d++) for (let dw = -2; dw <= 2; dw++) { const p = R.toWorld(u + richtung * d, wm(s) + dw); h = Math.max(h, ground.groundTopY(Math.round(p.x), Math.round(p.z))); }
      return h;
    };
    const D0 = endHoehe(U0, -1), D1 = endHoehe(U1, 1);
    // Pfeiler: zusammenhängende u-Bereiche im Fluss mit Breite > basis + 2 (Vorköpfe)
    const pfeiler = [];
    let cur = null;
    for (let k = F0; k < F1; k++) {
      const s = schnitt.get(k), breit = s && (s.w1 - s.w0) > basis + 2;
      if (breit) { if (!cur) cur = [k, k + 1]; else cur[1] = k + 1; } else if (cur) { pfeiler.push(cur); cur = null; }
    }
    if (cur) pfeiler.push(cur);
    // Bögen zwischen Uferkante und Pfeilern
    const grenzen = [F0, ...pfeiler.flat(), F1];
    const boegen = [];
    for (let i = 0; i < grenzen.length; i += 2) if (grenzen[i + 1] - grenzen[i] >= 4) boegen.push([grenzen[i], grenzen[i + 1]]);
    G = { masken, R, H, zellen, byKey, U0, U1, W, F0, F1, D0, D1, pfeiler, boegen, basis, schnitt };
    return G;
  }

  const fahrbahn = (u) => {
    const g = geometrie();
    const t = Math.max(0, Math.min(1, (u - g.U0) / (g.U1 - g.U0)));
    const lin = g.D0 + (g.D1 - g.D0) * t;
    const tf = Math.max(0, Math.min(1, (u - g.F0) / Math.max(1, g.F1 - g.F0)));
    return Math.round(lin + (cfg.buckel || 0) * Math.sin(Math.PI * tf));
  };
  const laibung = (u) => {                                         // Unterkante des Bogens (Y) oder null (Pfeiler/Ufer)
    const g = geometrie();
    for (const [a, b] of g.boegen) {
      if (u < a || u >= b) continue;
      const K = g.W + cfg.kaempfer, C = Math.min(fahrbahn((a + b) / 2) - cfg.dicke, K + (b - a) * 0.6);
      const x = (u + 0.5 - (a + b) / 2) / ((b - a) / 2);
      const f = cfg.form === 'segment' ? Math.max(0, 1 - x * x) : Math.sqrt(Math.max(0, 1 - x * x));
      return Math.floor(K + (C - K) * f);
    }
    return null;
  };

  let PLAN = null;
  function plan() {
    if (PLAN) return PLAN;
    const g = geometrie();
    const zellen = new Map(), teile = new Map();
    const key = (x, y, z) => x + ',' + y + ',' + z;
    const set = (x, y, z, t, p) => { const k = key(x, y, z); if (zellen.has(k)) return false; zellen.set(k, { x, y, z, t, p }); let a = teile.get(p); if (!a) teile.set(p, a = []); a.push(k); return true; };
    const hat = (x, y, z) => zellen.has(key(x, y, z));
    // Längsseite: Außennachbar quer zur Achse (dort Brüstung, an den Enden nicht)
    const laengsseite = (c) => {
      if (c.d8 !== 1 || c.u < g.U0 + 2.5 || c.u > g.U1 - 2.5) return false;
      for (const [dx, dz] of N4) {
        if (g.H.has(c.x + dx, c.z + dz)) continue;
        const l = g.R.toLocal(c.x + dx, c.z + dz);
        if (Math.abs(l.w - c.w) > Math.abs(l.u - c.u)) return true;
      }
      return false;
    };
    const imPfeiler = (u) => g.pfeiler.some(([a, b]) => u >= a && u < b);

    // ---- Modul 0: Pfeiler und Widerlager
    for (const c of g.zellen) {
      const d = fahrbahn(c.u), lb = laibung(c.u);
      if (lb !== null) continue;
      const fuss = imPfeiler(c.u) || (c.u >= g.F0 && c.u < g.F1) ? Math.min(c.gt, g.W - 3) : c.gt;
      const teil = imPfeiler(c.u) ? 'pfeiler' : 'widerlager';
      for (let y = fuss + 1; y < d; y++) set(c.x, y, c.z, c.d8 === 1 ? T.stirn : T.kern, teil);
    }
    // ---- Modul 1: Bögen (Laibung, Stirn, Füllung bis unter die Fahrbahn); Luft unter den Bögen ist Durchfahrt (arkade)
    const durchfahrt = [];
    for (const c of g.zellen) {
      const lb = laibung(c.u); if (lb === null) continue;
      for (let y = c.gt + 1; y < lb; y++) durchfahrt.push({ x: c.x, y, z: c.z });
      const d = fahrbahn(c.u);
      for (let y = lb; y < d; y++) set(c.x, y, c.z, y === lb ? T.bogen : c.d8 === 1 ? T.stirn : T.kern, 'boegen');
    }
    // ---- Modul 2: Fahrbahn, Brüstungen, Statuen
    for (const c of g.zellen) {
      const d = fahrbahn(c.u);
      set(c.x, d, c.z, T.belag, 'fahrbahn');
      if (laengsseite(c)) for (let h = 1; h <= cfg.bruestung; h++) set(c.x, d + h, c.z, h === cfg.bruestung ? T.deckel : T.bruestung, 'bruestung');
    }
    if (cfg.statuen) {                                              // an den vier Ecken auf der Brüstung
      for (const ende of [g.U0 + 3, g.U1 - 4]) for (const seite of [-1, 1]) {
        const kand = g.zellen.filter((c) => laengsseite(c) && Math.abs(c.u - ende) < 1 && Math.sign(c.w - (g.schnitt.get(Math.floor(c.u)).w0 + g.schnitt.get(Math.floor(c.u)).w1) / 2) === seite);
        if (!kand.length) continue;
        const c = kand[0], d = fahrbahn(c.u) + cfg.bruestung;
        for (let h = 1; h <= 4; h++) set(c.x, d + h, c.z, T.statue, 'statuen');
      }
    }
    // ---- Licht: Laternen auf der Brüstung alle 12 Blöcke
    const lt = [];
    for (const c of g.zellen) {
      if (!laengsseite(c) || ((Math.floor(c.u) % 12) + 12) % 12 !== 0) continue;
      const k = key(c.x, fahrbahn(c.u) + cfg.bruestung, c.z), e = zellen.get(k);
      if (!e) continue;
      teile.set(e.p, teile.get(e.p).filter((q) => q !== k)); e.t = T.licht; e.p = 'licht'; lt.push(k);
    }
    teile.set('licht', lt);
    PLAN = { zellen, teile, durchfahrt };
    return PLAN;
  }

  function modul(n, liste) {
    return {
      module: n,
      build(ctx) {
        const Pl = plan();
        for (const id of liste) {
          const keys = Pl.teile.get(id) || [];
          if (!keys.length) continue;
          const cells = keys.map((k) => Pl.zellen.get(k));
          const typ = new Map(cells.map((c) => [c.x + ',' + c.y + ',' + c.z, c.t]));
          ctx.part(id).fill(cells, (x, y, z) => typ.get(x + ',' + y + ',' + z));
          if (id === 'boegen' && Pl.durchfahrt.length) ctx.oeffnung(Pl.durchfahrt, 'arkade');
        }
      }
    };
  }

  return { geometrie, plan, modul, fahrbahn, laibung };
}

module.exports = { bruecke };
