'use strict';
// V3 D4: Arnobrücken (tools/wahrzeichen/bruecke.js): Bögen und Pfeiler aus dem OSM-Umriss, Zahl der Bögen wie in der
// Literatur, Fahrbahn bündig an den Enden, fehlerfrei und dicht.
const test = require('node:test');
const assert = require('node:assert/strict');
const path = require('node:path');

const ROOT = path.resolve(__dirname, '..', '..');
const { getProject, loadSpecs } = require('../projects.js');
const { buildWorld } = require('../model/world.js');
const { laufe } = require('../validate/begehbarkeit_projekt.js');

const BRUECKEN = [['ponte_santa_trinita', '_pst.js', 3], ['ponte_alla_carraia', '_pca.js', 5], ['ponte_alle_grazie', '_pgr.js', 5], ['ponte_amerigo_vespucci', '_pav.js', 3]];

for (const [id, lib, boegen] of BRUECKEN) {
  test(`${id}: ${boegen} Bögen, fehlerfrei, Durchfahrt frei, dicht`, () => {
    const B = require(`../../projects/${id}/model/${lib}`);
    const g = B.geometrie();
    assert.equal(g.boegen.length, boegen);
    assert.equal(g.pfeiler.length, boegen - 1);
    const project = getProject(id, { root: ROOT });
    const world = buildWorld({ project });
    assert.deepEqual(world.errors, []);
    // unter jedem Bogenscheitel liegt zwischen Wasser und Laibung nur Luft
    for (const [a, b] of g.boegen) assert.ok(B.laibung((a + b) / 2) > g.W + 3, 'Bogen ' + a);
    const ctx = { project, world, grid: world.grid, ground: loadSpecs(project).ground, root: ROOT };
    assert.equal(laufe(ctx, 'r14').einheiten[0].cluster.length, 0);
  });
}
