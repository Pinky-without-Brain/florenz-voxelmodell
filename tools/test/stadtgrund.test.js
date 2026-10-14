'use strict';
// V3 S0/S1: Stadtgrund als Projekt mit unabhängigen Kachel-Modulen (Spezifikation stadtgrund).
const test = require('node:test');
const assert = require('node:assert/strict');
const path = require('node:path');

const ROOT = path.resolve(__dirname, '..', '..');
const { getProject } = require('../projects.js');
const { listModules, isUnabhaengig, buildWorld } = require('../model/world.js');
const { loadStadtgrund } = require('../city/stadtgrund.js');
const { ladeBesitz, rasterVonGrid } = require('../city/besitz.js');
const { ladeAussparung } = require('../wahrzeichen/projekt.js');
const { VoxelGrid } = require('../geom/grid.js');
const ground = require('../city/ground_stadt.js');

const project = getProject('stadtgrund', { root: ROOT });
const q = loadStadtgrund(project);
const zellen = (pl, teil) => {
  const a = pl.teile[teil], out = [];
  for (let i = 0; i < a.length; i += 4) out.push([a[i], a[i + 1], a[i + 2], a[i + 3]]);
  return out;
};

test('Stadtgrund: Kachelraster 15 × 13, Modul n = j · 15 + i, unabhängige Module', () => {
  assert.equal(project.type, 'stadtgrund');
  assert.ok(isUnabhaengig(project));
  assert.equal(q.alleN.length, 195);
  const k = q.kachel(69);
  assert.deepEqual([k.i, k.j, k.x0, k.z0, k.x1, k.z1], [9, 4, -224, -208, 95, 111]);
  assert.ok(k.x0 <= 0 && k.x1 >= 0 && k.z0 <= 0 && k.z1 >= 0, 'Kuppelmitte liegt in Kachel 69');
  assert.deepEqual(listModules(project).numbers, project.json.aktiv.slice().sort((a, b) => a - b));
});

test('Besitzraster: Säulen-minY aus dem Grid, Dom-Spalten besessen', () => {
  const g = new VoxelGrid();
  const w = g.writer({ module: 0, part: 'a' });
  w.set(1, 70, 2, 'stone'); w.set(1, 65, 2, 'stone'); w.set(3, 80, 2, 'stone');
  const r = rasterVonGrid(g);
  assert.deepEqual([r.x0, r.z0, r.nx, r.nz], [1, 2, 3, 1]);
  assert.deepEqual([...r.werte], [66, 0, 81]);
  const b = ladeBesitz();
  assert.ok(b.projekte.includes('duomo'));
  assert.ok(b.minY(0, 0) < Infinity);
  assert.equal(b.minY(-3000, -1400), Infinity);
});

test('Stadtgrund Kachel 127 (Ponte Vecchio): Wasserspiegel Y 50, Pfeilerspalten leer, Bett W − 2', () => {
  const pl = q.plan(127);
  const wasser = zellen(pl, 'arno_wasser');
  assert.ok(wasser.length > 10000);
  const ys = new Set(wasser.map((c) => c[1]));
  assert.ok(ys.has(50) && ys.has(49), [...ys].join(','));
  const aus = ladeAussparung();
  for (const teil of Object.keys(pl.teile)) for (const c of zellen(pl, teil)) assert.ok(!aus.hat(c[0], c[2]), `Aussparung belegt: ${c}`);
  for (const c of zellen(pl, 'arno_bett')) assert.ok(c[1] <= 48);
});

test('Stadtgrund Kachel 114: Pflaster vor dem Palazzo Vecchio auf Y 68, Platzmuster mit ≈ 12 % Pietra serena', () => {
  const pl = q.plan(114);
  const WZ = require('../wahrzeichen');
  const pv = getProject('palazzo_vecchio', { root: ROOT });
  const m = WZ.ladeMasken(pv.json, { dir: pv.dir, root: ROOT }).alle;
  const nah = [...zellen(pl, 'plaetze_pflaster'), ...zellen(pl, 'plaetze_rand')].filter((c) => m.dAussen(c[0], c[2]) <= 6);
  assert.ok(nah.length > 500);
  for (const c of nah) assert.equal(c[1], 68);
  const p = zellen(pl, 'plaetze_pflaster');
  const ser = p.filter((c) => c[3] === 5).length / p.length;
  assert.ok(ser > 0.08 && ser < 0.18, String(ser));
});

test('Stadtgrund: Oberflächen frei liegender Spalten auf groundTopY (außer Glättung ≤ 3), Haut ohne Lücke nach unten', () => {
  const pl = q.plan(113);
  for (const teil of ['strassen_pflaster', 'hof_pflaster', 'rasen', 'gehwege']) {
    for (const c of zellen(pl, teil)) assert.ok(Math.abs(c[1] - ground.groundTopY(c[0], c[2])) <= 3, `${teil} ${c}`);
  }
});

test('Pipeline S0: --modules baut genau das genannte Modul in einem eigenen Grid, Prüfungen grün', () => {
  const w = buildWorld({ project, modules: [113] });
  assert.deepEqual(w.errors, []);
  assert.deepEqual(w.modules.map((m) => m.module), [113]);
  const { buildProject } = require('../build.js');
  const r = buildProject(project, { modules: [113], emit: false, strict: false }, { root: ROOT });
  assert.equal(r.code, 0, r.report.errors.join('\n'));
  assert.equal(r.report.moduleCount, 1);
  assert.equal(r.report.modules[0].module, 113);
});

test('Cross: Stadtgrund und Ponte Vecchio ohne gemeinsame Zellen', () => {
  const { checkCrossProject } = require('../validate/x_projects.js');
  const r = checkCrossProject(['ponte_vecchio', 'stadtgrund'], { root: ROOT });
  assert.equal(r.conflicts, 0);
  assert.deepEqual(r.errors, []);
});
