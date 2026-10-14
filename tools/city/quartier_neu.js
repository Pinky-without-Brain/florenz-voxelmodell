'use strict';
// Neues Quartier aus Stadtgrund-Kacheln anlegen (Rezept UEBERGABE_V3 E1):
//   node tools/city/quartier_neu.js <id> "<Titel>" <kachel,kachel,...>
// Nimmt alle Isolati mit Schwerpunkt in den Kacheln (Kachel 320 × 320 ab x −3104, z −1488, n = j · 15 + i), ohne
// Isolati mit Wahrzeichen-Vorrang (data/stadt/vorrang.json), mit Gebäuden anderer Quartiere oder des Doms; Gebäude
// geplanter Wahrzeichen (loadLandmarks) werden ausgelassen. Schreibt projects/<id>/project.json (Begehbarkeit pflicht).
// Danach: node tools/city/akten_entwurf.js --project <id>, bauen, node tools/city/besitz.js, Stadtgrund neu bauen.
const path = require('node:path');
const R = path.resolve(__dirname, '..', '..');
const fs=require('fs');
const [id, titel, kl] = process.argv.slice(2); const kacheln = kl.split(',').map(Number);
const iso=require(R+'/data/stadt/isolati.json').isolati;
const vor=new Set(Object.keys(require(R+'/data/stadt/vorrang.json').ids));
const andere=new Set(); for (const d of fs.readdirSync(R+'/projects')) { const f=R+'/projects/'+d+'/project.json'; if (!fs.existsSync(f)) continue; const j=JSON.parse(fs.readFileSync(f,'utf8')); if (j.id!==id && j.type==='quartier') for (const g of j.gebaeude) andere.add(g); }
const { loadLandmarks } = require(R+'/tools/emit/stadtbasis.js'); const lm=new Set(loadLandmarks().landmarks.flatMap(l=>l.gebaeude));
const dom=new Set(['w43768260','w251650632','w166821303']);
const tile=(x,z)=>Math.floor((z+1488)/320)*15+Math.floor((x+3104)/320);
const ids=[]; let raus=0;
for (const i of iso) { const [x,z]=i.schwerpunkt; if (!kacheln.includes(tile(x,z))) continue; if (i.gebaeude.some(g=>vor.has(g)||andere.has(g)||dom.has(g))) continue; for (const g of i.gebaeude) { if (lm.has(g)) { raus++; continue; } ids.push(g); } }
const {compareIds}=require(R+'/tools/city/parzellen.js'); ids.sort(compareIds);
fs.mkdirSync(R+'/projects/'+id,{recursive:true});
fs.writeFileSync(R+'/projects/'+id+'/project.json', JSON.stringify({id, title:titel, type:'quartier', generator:'quartier', begehbarkeit:'pflicht', gebaeude:ids}, null, 2)+'\n');
console.log(id, ids.length, 'Häuser,', raus, 'Wahrzeichen-Gebäude ausgelassen');
