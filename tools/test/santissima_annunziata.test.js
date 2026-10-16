'use strict';
// V3 D3: Santissima Annunziata (projects/santissima_annunziata): Portikus, Chiostrino, Tempietto, Tribuna, Begehbarkeit.
const test = require('node:test');
const assert = require('node:assert/strict');
const path = require('node:path');

const ROOT = path.resolve(__dirname, '..', '..');
const { getProject, loadSpecs } = require('../projects.js');
const { buildWorld } = require('../model/world.js');
const { laufe } = require('../validate/begehbarkeit_projekt.js');
const S = require('../../projects/santissima_annunziata/model/_sa.js');

const project = getProject('santissima_annunziata', { root: ROOT });
const world = buildWorld({ project });

test('Annunziata: fehlerfrei, 8 + 9 Kapellen, Tempietto-Säulen 5,25 m', () => {
  assert.deepEqual(world.errors, []);
  assert.equal(S.KAP.links + S.KAP.rechts, 17);
  let saeule = 0;
  world.grid.forEach((x, y, z, e) => { if (e.part === 'tempietto' && e.type === 'quartz_pillar') saeule = Math.max(saeule, y - S.Y(0)); });
  assert.equal(saeule, S.TEMPIETTO.saeule - 1);
});

test('Annunziata: Kuppel der Tribuna über dem Tambour, Hof ohne Dach', () => {
  let kuppelTop = 0, hofDach = 0;
  world.grid.forEach((x, y, z, e) => {
    if (e.part === 'kuppel' && y > kuppelTop) kuppelTop = y;
    if (y > S.Y(0)) { const c = S.zelleBei(x, z); if (c && c.zone === 'chiostrino' && c.u > 20 && c.u < 34 && c.w > 2 && c.w < 24) hofDach++; }
  });
  assert.equal(kuppelTop, S.Y(S.TRIB.tambour + Math.floor(S.TRIB.rKa)));
  assert.equal(hofDach, 0);
});

test('Annunziata: Portikus, Arkaden und Portale offen, alles erreichbar, dicht', () => {
  const arten = {};
  for (const o of world.oeffnungen) arten[o.art + '|' + o.part] = (arten[o.art + '|' + o.part] || 0) + o.keys.length;
  assert.ok(arten['tor|portikus'] > 100);
  assert.ok(arten['arkade|chiostrino'] > 100);
  const ctx = { project, world, grid: world.grid, ground: loadSpecs(project).ground, root: ROOT };
  assert.equal(laufe(ctx, 'r13').einheiten[0].komponenten.filter((k) => !k.unzugaenglich).length, 0);
  assert.equal(laufe(ctx, 'r14').einheiten[0].cluster.length, 0);
});
