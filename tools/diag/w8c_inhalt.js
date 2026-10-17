'use strict';
// Erzeugt die content/modul_N.json der Projekte der Welle 8c (torre_alberti, loggia_del_grano, forte_belvedere).
// Aufruf: node tools/diag/w8c_inhalt.js <projekt-id>
const fs = require('node:fs');
const path = require('node:path');
const ROOT = path.resolve(__dirname, '..', '..');
const id = process.argv[2];
const D = require('./w8c_texte.js')[id];
if (!D) { console.error('unbekanntes Projekt ' + id); process.exit(1); }
const dir = path.join(ROOT, 'projects', id, 'content');
fs.mkdirSync(dir, { recursive: true });
const aus = require(path.join(ROOT, 'projects', id, 'model', D.ausstattung)).INHALT;
D.module.forEach((m, n) => {
  const parts = {};
  for (const p of m.teile) {
    const t = D.teile[p] || aus[p];
    if (!t) throw new Error(`${id}: Text für Bauteil ${p} fehlt`);
    parts[p] = t;
  }
  fs.writeFileSync(path.join(dir, `modul_${n}.json`), JSON.stringify({ module: n, title: m.titel, subtitle: `Bautüte ${n}: ${m.untertitel}`, icon: m.icon, parts }, null, 2) + '\n');
});
console.log(id + ': ' + D.module.length + ' Content-Dateien');
