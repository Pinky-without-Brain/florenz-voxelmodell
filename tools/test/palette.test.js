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
  for (const t of TYPES) assert.match(t, /^[a-z][a-z0-9]*(_[a-z0-9]+)*$/);
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
