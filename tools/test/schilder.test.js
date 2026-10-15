'use strict';
// Straßenschilder an Eckhäusern (tools/city/schilder.js) und ihre Block-Entity im Minecraft-Export.
const test = require('node:test');
const assert = require('node:assert/strict');
const { schilderFuerHaus, schildText } = require('../city/schilder.js');
const { schildEntity } = require('../minecraft/export.js');
const nbt = require('../minecraft/nbt_le.js');

test('schildText: Großbuchstaben, Umbruch auf 15 Zeichen, höchstens 4 Zeilen', () => {
  assert.equal(schildText('Via de\' Calzaiuoli'), "VIA DE'\nCALZAIUOLI");
  assert.equal(schildText('Piazza della Signoria'), 'PIAZZA DELLA\nSIGNORIA');
  const lang = schildText('a b c d e f g h i j k l m n o p q r s t u v w x y z aa bb cc dd ee ff gg hh ii jj kk');
  assert.ok(lang.split('\n').length <= 4);
  for (const z of lang.split('\n')) assert.ok(z.length <= 15);
});

// Haus 0..5 × 0..5 an der Ecke zweier Straßen: Via Uno im Westen (x < 0), Via Due im Norden (z < 0)
function umgebung() {
  const haus = [];
  for (let x = 0; x < 6; x++) for (let z = 0; z < 6; z++) haus.push([x, z]);
  const S = new Set(haus.map(([x, z]) => x + ',' + z));
  const belegt = new Set();
  return {
    plan: { id: 'h1', cells: haus, boden: 60 },
    env: {
      umfeld: { nameBei: (x, z) => (x < 0 && z >= 0 ? 'Via Uno' : z < 0 && x >= 0 ? 'Via Due' : null) },
      groundTopY: () => 59,
      hat: (x, y, z) => S.has(x + ',' + z) && y > 59 && y < 80,
      beanspruche: (x, y, z) => { const k = x + ',' + y + ',' + z; if (belegt.has(k)) return false; belegt.add(k); return true; }
    }
  };
}

test('schilderFuerHaus: je Straße ein Schild nahe der Ecke, vor der Wand, 7 Blöcke über dem Boden', () => {
  const { plan, env } = umgebung();
  const s = schilderFuerHaus(plan, env);
  assert.equal(s.length, 2);
  const uno = s.find((o) => o.name === 'Via Uno'), due = s.find((o) => o.name === 'Via Due');
  assert.equal(uno.x, -1); assert.equal(uno.richtung, 'w'); assert.ok(uno.z <= 1, 'nahe der Ecke');
  assert.equal(due.z, -1); assert.equal(due.richtung, 'n'); assert.ok(due.x <= 1, 'nahe der Ecke');
  for (const o of s) { assert.equal(o.y, 60 + 7); assert.ok(o.typ.startsWith('birch_wall_sign')); assert.ok(env.hat(o.x === -1 ? 0 : o.x, o.y, o.z === -1 ? 0 : o.z)); }
});

test('schilderFuerHaus: Haus an nur einer Straße bekommt kein Schild', () => {
  const { plan, env } = umgebung();
  env.umfeld.nameBei = (x, z) => (x < 0 ? 'Via Uno' : null);
  assert.equal(schilderFuerHaus(plan, env).length, 0);
});

test('schildEntity: Bedrock-NBT mit Text vorne, gewachst', () => {
  const buf = schildEntity({ x: 10, y: 70, z: -5, text: 'VIA UNO' });
  const v = nbt.toPlain(nbt.read(buf).tag);
  assert.equal(v.id, 'Sign');
  assert.deepEqual([v.x, v.y, v.z], [10, 70, -5]);
  assert.equal(v.FrontText.Text, 'VIA UNO');
  assert.equal(v.IsWaxed, 1);
});
