'use strict';
// Diagnose Modul 5: ASCII-Schnitte z = 0 und x = z, Abwicklung der Freskolage, Zahlen je Bauteil.
// Aufruf: node tools/diag/m5_schnitte.js   -> build/diag/m5_schnitte.txt
const fs = require('node:fs');
const path = require('node:path');
const { buildWorld } = require('../model/world.js');
const dome = require('../geom/dome.js');
const dims = require('../spec/dimensions.js');

const world = buildWorld({ modules: [5] });
const g = world.grid;
const LAY = dome.doubleDomeLayout(dims);
const SYM = {
  bricks: 'b', terracotta: 'T', stone_bricks: 'S', smooth_quartz: 'Q', polished_granite: 'r',
  black_concrete: 'K', red_terracotta: 'R', brown_terracotta: 'N', orange_terracotta: 'O',
  light_blue_terracotta: 'l', white_terracotta: 'w', yellow_terracotta: 'y', blue_terracotta: 'u', gold_block: 'G',
};
const ch = (x, y, z) => { const e = g.get(x, y, z); return e ? (SYM[e.type] || '?') : '.'; };

const out = [];
out.push('Legende: b bricks, T terracotta, S stone_bricks, Q smooth_quartz, r polished_granite; Fresko: K schwarz, R rot,');
out.push('N braun, O orange, l hellblau, w weiss, y gelb, u blau, G gold; | Kuppelachse');
function section(title, at) {
  out.push('', title);
  for (let y = LAY.eye.ringTopY + 1; y >= LAY.springY; y--) {
    let s = String(y).padStart(4) + ' ';
    for (let u = -60; u <= 60; u++) {
      const c = ch(...at(u, y));
      s += c === '.' && u === 0 ? '|' : c;
    }
    out.push(s);
  }
}
section('Schnitt z = 0 (x von -60 bis 60, Osten rechts)', (u, y) => [u, y, 0]);
section('Schnitt x = z (Diagonale, u = x = z)', (u, y) => [u, y, u]);

// Abwicklung der Freskolage: Winkel (Spalten, 1 Zeichen = 3 Grad) x Höhe, Zelle = innerste Zelle je Winkel/Höhe
out.push('', 'Abwicklung der Freskolage (Spalte = 3 Grad, 0 Grad = Osten, gegen den Uhrzeigersinn; Zeile = Y)');
const FRESCO_TYPES = new Set(['black_concrete', 'red_terracotta', 'brown_terracotta', 'orange_terracotta',
  'light_blue_terracotta', 'white_terracotta', 'yellow_terracotta', 'blue_terracotta', 'gold_block']);
for (let y = LAY.inner.yTop; y > LAY.springY; y--) {
  const row = new Array(120).fill(' ');
  g.forEach((x, yy, z, e) => {
    if (yy !== y || !FRESCO_TYPES.has(e.type)) return;
    let a = Math.atan2(-z, x) * 180 / Math.PI; if (a < 0) a += 360;
    row[Math.floor(a / 3) % 120] = SYM[e.type];
  });
  out.push(String(y).padStart(4) + ' ' + row.join(''));
}

// Zahlen
out.push('', 'Blöcke je Bauteil und Typ');
const rec = world.modules[0];
for (const p of rec.parts) {
  const types = {};
  g.forEach((x, y, z, e) => { if (e.part === p.id) types[e.type] = (types[e.type] || 0) + 1; });
  out.push(`${p.id}: ${p.keys.length}  ` + Object.entries(types).sort((a, b) => b[1] - a[1]).map(([t, n]) => `${t}=${n}`).join(', '));
}
out.push('Summe: ' + rec.parts.reduce((s, p) => s + p.keys.length, 0));

const dir = path.join(__dirname, '..', '..', 'build', 'diag');
fs.mkdirSync(dir, { recursive: true });
fs.writeFileSync(path.join(dir, 'm5_schnitte.txt'), out.join('\n') + '\n');
console.log(out.slice(0).filter((l, i) => i >= out.indexOf('Blöcke je Bauteil und Typ')).join('\n'));
console.log('geschrieben: build/diag/m5_schnitte.txt');
