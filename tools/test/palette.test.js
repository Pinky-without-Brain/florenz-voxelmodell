'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const path = require('node:path');
const { PALETTE, TYPES, ROLES, typesForRole } = require('../spec/palette');
const { loadBlockTypes } = require('../validate/r7_palette');

const bt = loadBlockTypes(path.resolve(__dirname, '..', '..', 'webapp', 'js', 'data', 'block-types.js'));
const PUTZ = ['ocker', 'gelb', 'rosa', 'sand', 'weiss', 'grau', 'terrakotta'];

test('jede Putzfarbe aus dem Hausakte-Schema hat mindestens einen Typ', () => {
  for (const v of PUTZ) {
    assert.ok(ROLES.includes(`putz_${v}`), `Rolle putz_${v}`);
    assert.ok(typesForRole(`putz_${v}`).length >= 1, `Typ für putz_${v}`);
  }
});

test('alsoRoles: gelbe und orange Keramik dienen als Putz', () => {
  assert.deepEqual(typesForRole('putz_ocker'), ['yellow_terracotta']);
  assert.deepEqual(typesForRole('putz_terrakotta'), ['orange_terracotta']);
  assert.equal(PALETTE.yellow_terracotta.role, 'fresko');
  assert.ok(typesForRole('fresko').includes('yellow_terracotta'));
});

test('keine doppelten Typen, IDs sind snake_case', () => {
  assert.equal(new Set(TYPES).size, TYPES.length);
  for (const t of TYPES) assert.match(t, /^[a-z][a-z0-9]*(_[a-z0-9]+)*(@[nosw](_oben)?)?$/);
});

test('jeder Palettentyp hat einen Webapp-Eintrag', () => {
  for (const t of TYPES) {
    assert.ok(bt[t], `block-types.js fehlt ${t}`);
    assert.equal(bt[t].id, t);
  }
});

test('Wasser ist transparent markiert', () => {
  assert.equal(PALETTE.water.transparent, true);
});

const P = require('../spec/palette');

test('Treppen: 20 Materialien x 4 Richtungen x (normal, oben) am Ende der Palette, ROLES unverändert', () => {
  assert.equal(P.STAIR_BASES.length, 20);
  const stairs = TYPES.filter(P.isTreppe);
  assert.equal(stairs.length, 20 * 8);
  assert.deepEqual(TYPES.slice(TYPES.length - stairs.length), stairs, 'Treppen nur angehängt');
  assert.equal(TYPES.length, 53 + 160);
  assert.equal(ROLES.length, 40);
  assert.ok(!ROLES.includes('treppe'));
});

test('Treppen-API: treppeFuerRolle, treppe, treppeInfo', () => {
  assert.equal(P.treppeFuerRolle('mauerwerk'), 'stone_brick_stairs');
  assert.equal(P.treppeFuerRolle('pietra_forte_rustika'), 'tuff_brick_stairs');
  assert.equal(P.treppeFuerRolle('pflaster'), 'polished_tuff_stairs');
  assert.equal(P.treppeFuerRolle('marmor_weiss'), 'smooth_quartz_stairs');
  assert.equal(P.treppe('mauerwerk', 'n'), 'stone_brick_stairs@n');
  assert.equal(P.treppe('holz', 's', true), 'dark_oak_stairs@s_oben');
  assert.equal(P.treppe('brick_stairs', 'w'), 'brick_stairs@w');
  assert.deepEqual(P.treppeInfo('stone_brick_stairs@o'), { base: 'stone_brick_stairs', dir: 'o', oben: false, material: 'stone_bricks' });
  assert.equal(P.treppeInfo('stone_bricks'), null);
  assert.throws(() => P.treppeFuerRolle('glas'), /keine Treppe/);
  assert.throws(() => P.treppe('mauerwerk', 'x'), /n|o|s|w/);
  for (const rolle of Object.keys(P.TREPPE_FUER_ROLLE)) assert.ok(P.isTreppe(P.treppe(rolle, 'n')), rolle);
  assert.match(PALETTE['stone_brick_stairs@n'].de, /Aufstieg nach Norden/);
});

test('Webapp: Treppen-Einträge verweisen auf Vollblock und Richtung', () => {
  for (const [base, material] of P.STAIR_BASES.map((b) => [b[0], b[1]])) {
    assert.ok(bt[material], 'Vollblock ' + material);
    assert.ok(P.PALETTE[material], 'Palette ' + material);
    const e = bt[base + '@w_oben'];
    assert.equal(e.base, material);
    assert.deepEqual(JSON.parse(JSON.stringify(e.stair)), { dir: 'w', oben: true });
    assert.equal(e.color, bt[material].color);
  }
});
