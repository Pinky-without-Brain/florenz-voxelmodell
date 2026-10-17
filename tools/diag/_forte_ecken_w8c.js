'use strict';
// Hilfsskript W8c: Ecken des Forte-di-Belvedere-Umrisses mit Innenwinkel (konvex = Spitze), Kantenlängen, Gelände und Abstand zur Straße.
const fs = require('node:fs');
const path = require('node:path');
const base = require('../city/ground_stadt.js');
const ROOT = path.resolve(__dirname, '..', '..');
const G = JSON.parse(fs.readFileSync(path.join(ROOT, 'data', 'stadt', 'gebaeude.json'), 'utf8'));
const b = (G.gebaeude || G).find((x) => x.id === 'w24879633');
const r = b.polygon.aussen[0];
let a2 = 0;
for (let i = 0; i < r.length; i++) { const p = r[i], q = r[(i + 1) % r.length]; a2 += p[0] * q[1] - q[0] * p[1]; }
const sign = a2 > 0 ? 1 : -1;
console.log('Umlaufsinn', sign > 0 ? 'positiv (x→z)' : 'negativ');
r.forEach((p, i) => {
  const pr = r[(i + r.length - 1) % r.length], nx = r[(i + 1) % r.length];
  const v1 = [pr[0] - p[0], pr[1] - p[1]], v2 = [nx[0] - p[0], nx[1] - p[1]];
  const l1 = Math.hypot(...v1), l2 = Math.hypot(...v2);
  let ang = Math.acos((v1[0] * v2[0] + v1[1] * v2[1]) / (l1 * l2)) * 180 / Math.PI;
  const cr = (nx[0] - p[0]) * (p[1] - pr[1]) - (nx[1] - p[1]) * (p[0] - pr[0]);   // Orientierung
  const konvex = cr * sign * -1 > 0;
  console.log(String(i).padStart(2), p.join(',').padEnd(16), 'Winkel', ang.toFixed(0).padStart(4), konvex ? 'konvex' : 'konkav', 'zur Vorgängerkante', l1.toFixed(1), 'Gelände', base.groundTopY(Math.round(p[0]), Math.round(p[1])));
});
