'use strict';
// W8c: Forte di Belvedere (projects/forte_belvedere): Wälle mit begehbarer Wallkrone, Bastionsspitzen, Tor mit Rampe, Stufen zur Wallkrone,
// Hoffläche auf Plateauhöhe, Palazzina mit drei Geschossen und Loggia, Begehbarkeit, Licht, Content.
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const ROOT = path.resolve(__dirname, '..', '..');
const { getProject, loadSpecs } = require('../projects.js');
const { buildWorld } = require('../model/world.js');
const { laufe } = require('../validate/begehbarkeit_projekt.js');
const FB = require('../../projects/forte_belvedere/model/_fb.js');
const PZ = require('../../projects/forte_belvedere/model/_fb_pal.js');
const AU = require('../../projects/forte_belvedere/model/_fb_ausstattung.js');

const project = getProject('forte_belvedere', { root: ROOT });
const world = buildWorld({ project });
const grid = world.grid;
const Y = FB.Y;
const D = FB.lade();
const ctx = { project, world, grid, ground: loadSpecs(project).ground, root: ROOT };
const stehbar = (x, y, z) => grid.has(x, y - 1, z) && !grid.has(x, y, z) && !grid.has(x, y + 1, z) && !grid.has(x, y + 2, z);

test('Forte: Projektfelder, Maske, keine Baufehler, höchster Block', () => {
  assert.equal(project.json.bodenY, 185);
  assert.equal(project.json.begehbarkeit, 'pflicht');
  assert.deepEqual(project.json.gebaeude.slice(0, 2), ['w24879633', 'w160800063']);
  assert.deepEqual(world.errors, []);
  assert.equal(D.alle.length, 61185, 'Zellen von w24879633');
  let max = 0;
  grid.forEach((x, y) => { if (y > max) max = y; });
  assert.equal(max, Y(18), 'höchster Block: Walmdach der Palazzina (Lage 18)');
  assert.ok(D.spitzen.length >= 4, 'Bastionsspitzen ' + D.spitzen.length);
});

test('Forte: Hoffläche auf Plateauhöhe, Wälle mit Wallkrone Lage 5 und Brüstung Lage 6–7', () => {
  const hof = D.alle.filter((c) => c.zone === 'hof' && !c.bastion);
  assert.ok(hof.length > 40000);
  for (const c of hof.filter((q, i) => i % 97 === 0)) { assert.ok(grid.has(c.x, Y(0), c.z), 'Hofboden'); assert.ok(!grid.has(c.x, Y(1), c.z) || grid.get(c.x, Y(1), c.z).part === 'wallstufen' || grid.get(c.x, Y(1), c.z).part === 'pozzo', 'Hoffläche frei'); }
  const wall = D.alle.filter((c) => c.zone === 'wall' && c.d8 >= 4 && !D.tor.zellen.has(c.x + ',' + c.z));
  for (const c of wall.filter((q, i) => i % 53 === 0)) {
    assert.ok(grid.has(c.x, Y(FB.CROWN), c.z), 'Krone Lage 5');
    assert.ok(!grid.has(c.x, Y(FB.CROWN + 1), c.z), 'Krone frei darüber');
  }
  const para = D.alle.filter((c) => c.zone === 'wall' && (c.d8 === 2 || c.d8 === 3) && !D.tor.zellen.has(c.x + ',' + c.z));
  for (const c of para.filter((q, i) => i % 53 === 0)) { assert.ok(grid.has(c.x, Y(6), c.z) && grid.has(c.x, Y(7), c.z), 'Brüstung zwei Lagen'); assert.ok(!grid.has(c.x, Y(8), c.z)); }
});

test('Forte: Tor 7 breit, Tunnel mit mindestens 3 Lagen Kopffreiheit, deklariert (tor)', () => {
  const tor = D.tor;
  assert.ok(tor.zellen.size >= 7 * 6, 'Tunnelzellen ' + tor.zellen.size);
  for (const [k, e] of tor.zellen) {
    const [x, z] = k.split(',').map(Number);
    assert.ok(grid.has(x, e.boden, z), 'Boden');
    for (let y = e.boden + 1; y <= Y(FB.CROWN - 1); y++) assert.ok(!grid.has(x, y, z), 'Tunnelluft');
    assert.ok(Y(FB.CROWN - 1) - e.boden >= 3, 'Kopffreiheit');
  }
  const o = world.oeffnungen.filter((q) => q.art === 'tor');
  assert.ok(o.reduce((s, q) => s + q.keys.length, 0) >= 7 * 6 * 3);
  // Breite quer zum Tunnel
  const xs = new Set([...tor.zellen.keys()].map((k) => +k.split(',')[0]));
  assert.ok(xs.size >= 7);
});

test('Forte: Stufen zur Wallkrone (Treppenblöcke, Kopffreiheit 3) und Erreichbarkeit der Krone', () => {
  const stufen = [];
  grid.forEach((x, y, z, e) => { if (e.part === 'wallstufen' && /stairs/.test(e.type)) stufen.push([x, y, z]); });
  assert.ok(stufen.length >= 10 * FB.N_STUFEN * 3, 'Stufenblöcke ' + stufen.length);
  for (const [x, y, z] of stufen) for (let h = 1; h <= 3; h++) assert.ok(!grid.has(x, y + h, z), `Kopffreiheit über ${x},${y},${z}`);
  const r = laufe(ctx, 'r13').einheiten[0];
  let n = 0, ok = 0;
  for (const c of D.alle) {
    if (c.zone !== 'wall' || c.d8 < 4 || c.d8 > FB.WT) continue;
    const y = Y(FB.CROWN + 1);
    if (!stehbar(c.x, y, c.z)) continue;
    n++;
    if (r.erreicht(c.x, y, c.z)) ok++;
  }
  assert.ok(n > 5000, 'Kronenzellen ' + n);
  assert.ok(ok / n > 0.99, `Wallkrone erreichbar ${ok}/${n}`);
  let hofN = 0, hofOk = 0;
  for (const c of D.alle) { if (c.zone !== 'hof' || c.bastion || !stehbar(c.x, Y(1), c.z)) continue; hofN++; if (r.erreicht(c.x, Y(1), c.z)) hofOk++; }
  assert.ok(hofOk / hofN > 0.99, `Hoffläche erreichbar ${hofOk}/${hofN}`);
});

test('Forte: Palazzina dreigeschossig, Halle mit Bögen an beiden Enden, Räume erreichbar', () => {
  const r = laufe(ctx, 'r13').einheiten[0];
  assert.equal(r.komponenten.filter((k) => !k.unzugaenglich).length, 0);
  assert.ok(r.anteil > 95, String(r.anteil));
  for (const f of PZ.FL) {
    const cs = D.alle.filter((c) => c.pal && c.dP > 4 && stehbar(c.x, Y(f + 1), c.z));
    assert.ok(cs.length > 1500, `Geschoss ${f}: Stehzellen ${cs.length}`);
    const ok = cs.filter((c) => r.erreicht(c.x, Y(f + 1), c.z)).length;
    assert.ok(ok / cs.length > 0.9, `Geschoss ${f}: erreichbar ${ok}/${cs.length}`);
  }
  const bogen = world.oeffnungen.filter((q) => q.art === 'arkade' && q.part === 'pal_fassade');
  assert.ok(bogen.reduce((s, q) => s + q.keys.length, 0) > 150, 'Bogenzellen der Logge');
  // beide Enden der Halle: Bogenmitte offen von Lage 1 bis 3
  for (const west of [true, false]) {
    const c = D.alle.find((q) => q.pal && q.dP === 1 && (west ? q.pu < 5 : q.pu > 62) && Math.abs(q.pw - PZ.WCEN) < 0.6);
    assert.ok(c, 'Bogenzelle');
    for (let yr = 1; yr <= 3; yr++) assert.ok(!grid.has(c.x, Y(yr), c.z), 'Logge offen');
  }
  const dach = D.alle.filter((c) => c.pal && c.dP > 15);
  assert.ok(dach.some((c) => grid.has(c.x, Y(PZ.roofTop(c)), c.z) && !grid.has(c.x, Y(PZ.roofTop(c) + 1), c.z)));
  assert.equal(laufe(ctx, 'r14').einheiten[0].cluster.length, 0);
});

test('Forte: Licht im Torweg und in den Räumen der Palazzina höchstens 12 Blöcke von einer Seelaterne', () => {
  const lichter = [];
  grid.forEach((x, y, z, e) => { if (e.type === 'sea_lantern') lichter.push([x, y, z]); });
  assert.ok(lichter.length >= 20, 'Lichter ' + lichter.length);
  for (const f of PZ.FL) {
    for (const c of D.alle) {
      if (!c.pal || c.dP <= 3 || PZ.partition(c)) continue;
      const y = Y(f);
      if (!grid.has(c.x, y, c.z) || !stehbar(c.x, y + 1, c.z)) continue;
      const id = PZ.raumId(c);
      assert.ok(lichter.some(([lx, ly, lz]) => ly === y && Math.hypot(lx - c.x, lz - c.z) <= 12.01), `Zelle ${c.x},${c.z} (${id}) Geschoss ${f} ohne Licht`);
    }
  }
  for (const [k, e] of D.tor.zellen) {
    const [x, z] = k.split(',').map(Number);
    assert.ok(lichter.some(([lx, ly, lz]) => Math.abs(ly - e.boden) <= 1 && Math.hypot(lx - x, lz - z) <= 12.01), 'Torweg ohne Licht');
  }
});

test('Forte: Ausstattung mit Content, Quelle und Hinweis vereinfacht', () => {
  const content = JSON.parse(fs.readFileSync(path.join(ROOT, 'projects', 'forte_belvedere', 'content', 'modul_7.json'), 'utf8'));
  assert.deepEqual(Object.keys(content.parts).sort(), AU.TEILE.slice().sort());
  for (const p of Object.values(content.parts)) {
    for (const f of ['title', 'description', 'tip', 'caution', 'fact']) assert.ok(typeof p[f] === 'string' && p[f].length >= 3, f);
    assert.match(p.caution, /[Vv]ereinfacht/);
    assert.match(p.fact, /Quelle/);
  }
});
