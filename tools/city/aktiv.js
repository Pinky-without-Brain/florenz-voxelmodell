'use strict';
// Stadtgrund-Kacheln aktivieren: node tools/city/aktiv.js <kachel,kachel,...>
// Ergänzt "aktiv" in projects/stadtgrund/project.json (sortiert, einzeilig); danach Stadtgrund bauen.
const fs = require('node:fs');
const path = require('node:path');
const f = path.resolve(__dirname, '..', '..', 'projects', 'stadtgrund', 'project.json');
const neu = (process.argv[2] || '').split(',').filter(Boolean).map(Number);
const text = fs.readFileSync(f, 'utf8');
const j = JSON.parse(text);
const aktiv = [...new Set([...j.aktiv, ...neu])].sort((a, b) => a - b);
fs.writeFileSync(f, text.replace(/"aktiv": \[[^\]]*\]/, `"aktiv": [${aktiv.join(', ')}]`));
console.log(`aktiv: ${aktiv.length} Kacheln (+${aktiv.length - j.aktiv.length})`);
