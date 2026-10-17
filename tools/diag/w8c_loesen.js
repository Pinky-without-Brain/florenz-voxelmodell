'use strict';
// W8c: löst ein Gebäude aus seinem Quartier (Hausakte löschen, ID aus project.json entfernen) und trägt es in vorrang.json ein.
// Aufruf: node tools/diag/w8c_loesen.js <osm-id> <quartier> <projekt-id>
const fs = require('node:fs');
const [id, q, proj] = process.argv.slice(2);
const pj = `projects/quartier_${q}/project.json`;
const j = JSON.parse(fs.readFileSync(pj, 'utf8'));
const n = j.gebaeude.length;
j.gebaeude = j.gebaeude.filter((g) => g !== id);
if (j.gebaeude.length !== n - 1) throw new Error('ID nicht in gebaeude: ' + id);
const raw = fs.readFileSync(pj, 'utf8');
// Zeilenweise entfernen, damit das Format erhalten bleibt
const out = raw.split('\n').filter((l) => !new RegExp('^\\s*"' + id + '",?\\s*$').test(l)).join('\n').replace(/,(\s*\])/, '$1');
JSON.parse(out);
fs.writeFileSync(pj, out);
fs.unlinkSync(`projects/quartier_${q}/hausakten/${id}.json`);
const v = JSON.parse(fs.readFileSync('data/stadt/vorrang.json', 'utf8'));
v.ids[id] = proj;
if (!/Welle 8/.test(v.quelle)) v.quelle += ' und UEBERSICHT_WELLE8.md (Welle 8)';
fs.writeFileSync('data/stadt/vorrang.json', JSON.stringify(v, null, 2) + '\n');
console.log('gelöst:', id, '->', proj);
