'use strict';
// Diagnose Modul 4: Abwicklung der Ostfläche und einer Diagonalfläche (SO), Draufsichten.
// Aufruf: node tools/diag/m4_flaechen.js   -> build/diag/m4_flaechen.txt
const fs = require('node:fs');
const path = require('node:path');
const { buildWorld } = require('../model/world.js');

const world = buildWorld({ modules: [0, 1, 3, 4] });
const g = world.grid;
const SYM = {
  stone_bricks: 's', smooth_stone: 'p', smooth_quartz: 'Q', quartz_bricks: 'q', chiseled_quartz: 'C',
  quartz_pillar: 'I', dark_prismarine: 'g', polished_granite: 'r', polished_andesite: 'a', terracotta: 'T',
  blue_stained_glass: 'B', yellow_stained_glass: 'Y'
};
const ch = (x, y, z) => {
  const e = g.get(x, y, z);
  if (!e) return '.';
  return SYM[e.type] || '?';
};
const out = [];
const lines = (title, rows) => { out.push('', title, ...rows); };
const rowsRange = (y0, y1) => { const a = []; for (let y = y1; y >= y0; y--) a.push(y); return a; };

// Ostfläche: Außenhaut = größtes x mit Block (je u = z, v = y)
function face(title, uRange, cellAt) {
  const rows = [];
  const hdr = ['     ' + uRange.map((u) => (u % 10 === 0 ? String(Math.abs(u) % 100).padStart(2).slice(-1) : ' ')).join('')];
  for (const y of rowsRange(147, 175)) {
    let s = String(y).padStart(4) + ' ';
    for (const u of uRange) s += cellAt(u, y);
    rows.push(s);
  }
  lines(title, hdr.concat(rows));
}
const range = (a, b) => Array.from({ length: b - a + 1 }, (_, i) => a + i);
// Ost: Außenhaut von außen gesehen (größtes x), u = z
face('OSTFLAECHE (Aussenansicht von Osten, u = z von -30..30, v = y; Fenster-Zentrum Y 163)', range(-30, 30), (u, y) => {
  for (let x = 70; x >= 0; x--) if (g.has(x, y, u)) return ch(x, y, u);
  return '.';
});
// Ost: Schnitt in der Mitte (z = 0) durch die Wanddicke, u = x
{
  const rows = [];
  for (const y of rowsRange(147, 175)) {
    let s = String(y).padStart(4) + ' ';
    for (let x = 40; x <= 60; x++) s += ch(x, y, 0);
    rows.push(s);
  }
  lines('SCHNITT z = 0 (x 40..60, Ostwand: Kern hohl, Glasschicht x 49..50)', rows);
}
// SO-Diagonalfläche: Blick von Südosten, u = (x - z)/√2 gerundet über Spalten, hier Spalte t = x - z (gerade/ungerade dünn)
face('DIAGONALFLAECHE SUEDOST (Blick von SO; Spalte t = x - z von -44..44 Schritt 2; mit Exedra, Galerie, Gesims)',
  range(-22, 22), (i, y) => {
    const t = 2 * i;
    // Entlang der Normalen (1,1) von außen nach innen; Halbspalten x - z = t oder t + 1
    for (let s = 90; s >= 0; s--) {
      for (const tt of [t, t + 1]) {
        if ((s + tt) % 2 !== 0) continue;
        const x = (s + tt) / 2, z = (s - tt) / 2;
        if (g.has(x, y, z)) return ch(x, y, z);
      }
    }
    return '.';
  });
for (const y of [149, 163, 171]) {
  const rows = [];
  for (let z = -62; z <= 62; z++) {
    let s = '';
    for (let x = -62; x <= 62; x++) s += ch(x, y, z);
    rows.push(s);
  }
  lines(`DRAUFSICHT Y ${y} (x -62..62 nach rechts, z -62..62 nach unten, Osten rechts, Sueden unten)`, rows);
}
fs.mkdirSync(path.join(__dirname, '..', '..', 'build', 'diag'), { recursive: true });
const file = path.join(__dirname, '..', '..', 'build', 'diag', 'm4_flaechen.txt');
fs.writeFileSync(file, out.join('\n') + '\n');
console.log('geschrieben:', file);
const by = g.countsBy('part');
const m4 = ['tambour_ring', 'ochsenaugen', 'tribune_morte', 'kranzgesims', 'galerie_suedost'];
const tot = m4.reduce((a, p) => a + (by.get(p) || 0), 0);
for (const p of m4) console.log(p.padEnd(18), by.get(p));
console.log('Summe M4', tot);
