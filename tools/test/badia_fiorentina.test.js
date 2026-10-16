'use strict';
// V3 D3: Badia Fiorentina (projects/badia_fiorentina): Saal, Presbyterium im Süden, sechseckiger Campanile 70 m.
const test = require('node:test');
const assert = require('node:assert/strict');
const path = require('node:path');

const ROOT = path.resolve(__dirname, '..', '..');
const { getProject, loadSpecs } = require('../projects.js');
const { buildWorld } = require('../model/world.js');
const { laufe } = require('../validate/begehbarkeit_projekt.js');
const { yOfKey } = require('../geom/grid.js');
const S = require('../../projects/badia_fiorentina/model/_bf.js');

const project = getProject('badia_fiorentina', { root: ROOT });
const world = buildWorld({ project });

test('Badia: fehlerfrei, Campanile bis Lage 140 (70 m)', () => {
  assert.deepEqual(world.errors, []);
  let maxY = 0;
  world.grid.forEach((x, y) => { if (y > maxY) maxY = y; });
  assert.equal(maxY - S.Y(0), S.TURM.top);
});

test('Badia: Hochaltar im Süden, Glockenöffnungen in drei Geschossen', () => {
  const alt = [];
  world.grid.forEach((x, y, z, e) => { if (e.part === 'hochaltar') alt.push(S.zelleBei(x, z)); });
  assert.ok(alt.length > 0 && alt.every((c) => c.zone === 'sued'));
  const ys = new Set();
  for (const o of world.oeffnungen) if (o.art === 'fenster_offen') for (const k of o.keys) ys.add(yOfKey(k));
  for (const [y0] of S.TURM.orden) assert.ok([...ys].some((y) => y >= S.Y(y0) && y < S.Y(y0) + 4), 'Geschoss ' + y0);
});

test('Badia: Portal offen, alles erreichbar, dicht', () => {
  const ctx = { project, world, grid: world.grid, ground: loadSpecs(project).ground, root: ROOT };
  assert.ok(world.oeffnungen.some((o) => o.art === 'tor'));
  assert.equal(laufe(ctx, 'r13').einheiten[0].komponenten.filter((k) => !k.unzugaenglich).length, 0);
  assert.equal(laufe(ctx, 'r14').einheiten[0].cluster.length, 0);
});

// ------------------------------------------------------------------ V5b: Ausstattung nach Quellen (Modul 6)
const fs = require('node:fs');
const H = require('./campanile_helfer.js');

test('Badia V5b: Ausstattungsteile vorhanden, am richtigen Ort, mit Content und Quelle', () => {
  const teile = ['lippi_tafel', 'giugni_grabmal', 'ugo_grabmal', 'cantoria_vasari', 'orgel_zeffirini', 'hochaltar_aufbau', 'chorgestuehl_lehnen', 'chorgestuehl_sitze', 'kassettendecke'];
  const content = JSON.parse(fs.readFileSync(path.join(ROOT, 'projects', 'badia_fiorentina', 'content', 'modul_6.json'), 'utf8'));
  for (const id of teile) {
    const z = H.zellen(world, id);
    assert.ok(z.length >= 15, id + ': ' + z.length);
    const p = content.parts[id];
    assert.ok(p && p.description.length > 40 && p.tip && p.caution && p.fact, id + ' Content');
    assert.match(p.caution + ' ' + p.fact, /it\.wikipedia|Del Tasso|Segaloni|Gamberai|Lippi|Vasari|Zeffirini|Mino/, id + ' Quelle');
    assert.match(p.caution, /Vereinfacht, nicht nach Vorbild/, id + ' Hinweis');
  }
  const zone = (id) => new Set(H.zellen(world, id).map((c) => S.zelleBei(c.x, c.z).zone));
  assert.deepEqual([...zone('lippi_tafel')], ['nord']);                       // Nordarm, links hinter dem Nordportal (Ostwand u = 52)
  assert.deepEqual([...zone('giugni_grabmal')], ['nord']);                    // nahe dem Eingang
  assert.deepEqual([...zone('ugo_grabmal')], ['saal']);                       // Ostwand des Saals
  assert.deepEqual([...zone('hochaltar_aufbau')], ['sued']);                  // Presbyterium im Süden
  assert.ok(H.zellen(world, 'lippi_tafel').every((c) => S.zelleBei(c.x, c.z).u === 52));
  assert.ok(H.zellen(world, 'ugo_grabmal').every((c) => S.zelleBei(c.x, c.z).u >= 63));
  // Bilder in Augenhöhe: Unterkante der Lippi-Tafel eine Lage über dem Boden (Lage 2), Farbfelder in mindestens drei Farben
  const lippi = H.zellen(world, 'lippi_tafel');
  assert.equal(Math.min(...lippi.map((c) => c.y)), S.Y(2));
  assert.ok(new Set(lippi.map((c) => c.type)).size >= 5);
  // Kassettendecke: hängende Rippen und Rosetten unter der Decke des Saals
  const kass = H.zellen(world, 'kassettendecke');
  assert.ok(kass.every((c) => c.y === S.Y(S.SAAL.decke - 1)));
  assert.ok(kass.some((c) => c.type === 'gold_block') && kass.some((c) => c.type === 'dark_oak_planks'));
});

test('Badia V5b: Ausstattung erreichbar und begehbar, Chorgestühl mit Treppenblock-Sitzen', () => {
  const ctx = { project, world, grid: world.grid, ground: loadSpecs(project).ground, root: ROOT };
  const e = laufe(ctx, 'r13').einheiten[0];
  assert.equal(e.komponenten.filter((k) => !k.unzugaenglich).length, 0);
  const vor = (u, w) => e.erreicht(77 + u, S.Y(1), 580 + w);
  assert.ok(vor(51, -22), 'vor der Lippi-Tafel');
  assert.ok(vor(43, -23), 'vor dem Grabmal Giugni');
  assert.ok(vor(62, 0), 'vor dem Grabmal des Markgrafen Hugo');
  assert.ok(vor(7, 0), 'vor der Orgel');
  assert.ok(vor(42, 13), 'vor dem Hochaltar');
  const sitze = H.zellen(world, 'chorgestuehl_sitze');
  assert.ok(sitze.length > 30 && sitze.every((c) => /_stairs@/.test(c.type)));
  assert.equal(laufe(ctx, 'r14').einheiten[0].cluster.length, 0);
});
