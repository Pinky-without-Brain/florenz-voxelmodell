'use strict';
// Freie Gebäude je Stadtgrund-Kachel (noch keinem Quartier/Wahrzeichen zugeordnet), * = Kachel aktiv.
//   node tools/city/frei_kacheln.js
const R=require('node:path').resolve(__dirname,'..','..');const fs=require('fs');
const iso=require(R+'/data/stadt/isolati.json').isolati;
const vor=new Set(Object.keys(require(R+'/data/stadt/vorrang.json').ids));
const andere=new Set(); for (const d of fs.readdirSync(R+'/projects')) { const f=R+'/projects/'+d+'/project.json'; if (!fs.existsSync(f)) continue; const j=JSON.parse(fs.readFileSync(f,'utf8')); if (j.type==='quartier') for (const g of j.gebaeude) andere.add(g); }
const { loadLandmarks } = require(R+'/tools/emit/stadtbasis.js'); const lm=new Set(loadLandmarks().landmarks.flatMap(l=>l.gebaeude));
const dom=new Set(['w43768260','w251650632','w166821303']);
const tile=(x,z)=>Math.floor((z+1488)/320)*15+Math.floor((x+3104)/320);
const c={};for(const i of iso){const t=tile(...i.schwerpunkt);for(const g of i.gebaeude){if(vor.has(g)||andere.has(g)||dom.has(g)||lm.has(g))continue;c[t]=(c[t]||0)+1;}}
const akt=new Set(require(R+'/projects/stadtgrund/project.json').aktiv);
let tot=0;let out='';for(let j=0;j<14;j++){let row='';for(let i=0;i<15;i++){const n=j*15+i;const v=c[n]||0;tot+=v;row+=(akt.has(n)?'*':' ')+String(n).padStart(3)+':'+String(v).padStart(3)+' ';}out+=row+'\n';}
console.log(out,'frei',tot);
