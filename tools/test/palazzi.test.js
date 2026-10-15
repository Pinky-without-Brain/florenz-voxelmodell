'use strict';
// V3 D4: Palazzi der Welle 4 (tools/wahrzeichen/palazzo.js): fehlerfrei, Hof offen, Treppe erschließt alle Geschosse, dicht.
const test = require('node:test');
const assert = require('node:assert/strict');
const path = require('node:path');

const ROOT = path.resolve(__dirname, '..', '..');
const { getProject, loadSpecs } = require('../projects.js');
const { buildWorld } = require('../model/world.js');
const { laufe } = require('../validate/begehbarkeit_projekt.js');

const PALAZZI = [['palazzo_strozzi', '_ps.js'], ['palazzo_rucellai', '_pr.js'], ['palazzo_medici_riccardi', '_pm.js'], ['bargello', '_ba.js'], ['ospedale_degli_innocenti', '_oi.js']];

for (const [id, lib] of PALAZZI) {
  test(`${id}: fehlerfrei, Geschosse und Traufe, Hof ohne Dach, alles erreichbar und dicht`, () => {
    const project = getProject(id, { root: ROOT });
    const world = buildWorld({ project });
    assert.deepEqual(world.errors, []);
    const PZ = require(`../../projects/${id}/model/${lib}`);
    const D = PZ.lade();
    assert.ok(D.hofZellen.length > 0);
    let ueberHof = 0, decke = 0;
    const hof = new Set(D.hofZellen.map((c) => c.x + ',' + c.z));
    world.grid.forEach((x, y, z, e) => { if (y > PZ.Y(0) && hof.has(x + ',' + z) && !e.part.startsWith('turm')) ueberHof++; if (e.part === 'decke' && y > decke) decke = y; });
    assert.equal(ueberHof, 0);
    assert.equal(decke, PZ.Y(PZ.TRAUFE));
    const ctx = { project, world, grid: world.grid, ground: loadSpecs(project).ground, root: ROOT };
    assert.equal(laufe(ctx, 'r13').einheiten[0].komponenten.filter((k) => !k.unzugaenglich).length, 0);
    assert.equal(laufe(ctx, 'r14').einheiten[0].cluster.length, 0);
    assert.ok(world.oeffnungen.some((o) => o.art === 'tor' || (o.art === 'arkade' && o.part === 'portikus')));
  });
}
