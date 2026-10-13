'use strict';
// Bestandsaufnahme Begehbarkeit (B0): baut Projekte (ohne Emit), führt R13/R14 aus und sucht Diagonalrisse in dünnen Schichten.
// Aufruf: node tools/diag/begehbarkeit_bestand.js [projekt-id ...] [--json datei] [--csv ordner]
// Diagonalriss: zwei feste Zellen A = (x, y, z) und B = (x+1, y, z±1), die sich nur an einer Kante berühren
// (beide Nachbarzellen (x+1, y, z) und (x, y, z±1) sind nicht fest). In einer einzellig starken Wand ist das eine Lücke,
// durch die man hindurchsieht, auch wenn die Zellen sich "diagonal berühren".

const fs = require('node:fs');
const path = require('node:path');
const { buildWorld } = require('../model/world.js');
const { loadRegistry, loadSpecs } = require('../projects.js');
const { validate } = require('../validate/index.js');
const { xOfKey, yOfKey, zOfKey } = require('../geom/grid.js');

const ROOT = path.resolve(__dirname, '..', '..');

/**
 * Diagonalrisse je Bauteil: { "modul/bauteil" -> { paare, spalten, hoeheMax, spaltenListe: [{ x, z, dz, y0, y1, u?, w? }] } }.
 * Eine Rissspalte ist ein Paar (x, z)-(x+1, z+dz), das über aufeinanderfolgende y besteht.
 */
function diagonalrisse(world, rahmen) {
  const grid = world.grid;
  const spalten = new Map(); // "modul/bauteil|x|z|dz" -> [y]
  for (const m of world.modules) {
    for (const p of m.parts) {
      for (const k of p.keys) {
        const x = xOfKey(k), y = yOfKey(k), z = zOfKey(k);
        for (const dz of [1, -1]) {
          if (!grid.has(x + 1, y, z + dz)) continue;
          if (grid.has(x + 1, y, z) || grid.has(x, y, z + dz)) continue;
          const sk = `${m.module}/${p.id}|${x}|${z}|${dz}`;
          let l = spalten.get(sk);
          if (!l) spalten.set(sk, l = []);
          l.push(y);
        }
      }
    }
  }
  const out = new Map();
  for (const [sk, ys] of spalten) {
    const [teil, xs, zs, dzs] = sk.split('|');
    const x = +xs, z = +zs, dz = +dzs;
    ys.sort((p, q) => p - q);
    let a = out.get(teil);
    if (!a) out.set(teil, a = { paare: 0, spalten: 0, hoeheMax: 0, spaltenListe: [] });
    // Läufe aufeinanderfolgender y
    let y0 = ys[0], prev = ys[0];
    const flush = (y1) => {
      const l = rahmen ? rahmen.toLocal(x, z) : null;
      a.spalten++;
      a.paare += y1 - y0 + 1;
      a.hoeheMax = Math.max(a.hoeheMax, y1 - y0 + 1);
      a.spaltenListe.push({ x, z, dz, y0, y1, ...(l ? { u: +l.u.toFixed(1), w: +l.w.toFixed(1) } : {}) });
    };
    for (let i = 1; i < ys.length; i++) {
      if (ys[i] !== prev + 1) { flush(prev); y0 = ys[i]; }
      prev = ys[i];
    }
    flush(prev);
  }
  return out;
}

function analysiere(project, opts = {}) {
  const t0 = Date.now();
  const specs = loadSpecs(project);
  const world = buildWorld({ project });
  if (world.errors.length) throw new Error(`Projekt ${project.id}: ${world.errors[0].message}`);
  const r = validate({ grid: world.grid, world, stepsByModule: {}, project, ground: specs.ground, interfaces: specs.interfaces,
    root: ROOT, only: ['R13', 'R14'] });
  const r13 = r.find((x) => x.rule === 'R13'), r14 = r.find((x) => x.rule === 'R14');
  let rahmen = null;
  if (project.json && project.json.rahmen) rahmen = require('../wahrzeichen/rahmen.js').makeRahmen(project.json.rahmen);
  const risse = diagonalrisse(world, rahmen);
  return { id: project.id, title: project.title, type: project.type, blocks: world.grid.size,
    r13: r13.bericht, r14: r14.bericht, risse: risse ? Object.fromEntries(risse) : null, ms: Date.now() - t0 };
}

function csvEscape(v) { return /[;"\n]/.test(String(v)) ? '"' + String(v).replace(/"/g, '""') + '"' : String(v); }

function schreibeCsv(all, dir) {
  fs.mkdirSync(dir, { recursive: true });
  const risse = ['projekt;bauteil;x;z;dz;y_von;y_bis;hoehe;u;w'];
  const lecks = ['projekt;bauteil;art;klasse;zellen;x_von;x_bis;y_von;y_bis;z_von;z_bis;beispiel'];
  for (const a of all) {
    for (const [teil, v] of Object.entries(a.type === 'wahrzeichen' ? a.risse || {} : {}).sort()) { // Quartier: nur Kennzahlen im Bericht
      for (const s of v.spaltenListe.sort((p, q) => (p.w - q.w) || (p.x - q.x) || (p.z - q.z) || (p.y0 - q.y0))) {
        risse.push([a.id, teil, s.x, s.z, s.dz, s.y0, s.y1, s.y1 - s.y0 + 1, s.u === undefined ? '' : s.u, s.w === undefined ? '' : s.w].join(';'));
      }
    }
    if (a.r14) {
      for (const c of a.r14.lueckenListe) {
        const b = c.bbox;
        const klasse = c.diagonal ? 'Diagonalritze' : (c.zellen >= 4 && Math.min(b.x[1] - b.x[0], b.z[1] - b.z[0]) + 1 <= 3 && (b.y[1] - b.y[0] + 1) >= 2 ? 'Öffnung (Fenster, Tür, Tor)' : 'Spalt oder Loch');
        lecks.push([a.id, (c.bauteile[0] && c.bauteile[0].part) || '?', c.diagonal ? 'diagonal' : 'Loch', csvEscape(klasse), c.zellen, b.x[0], b.x[1], b.y[0], b.y[1], b.z[0], b.z[1], csvEscape(c.beispiel)].join(';'));
      }
    }
  }
  fs.writeFileSync(path.join(dir, 'BEGEHBARKEIT_BESTAND_RISSE.csv'), risse.join('\n') + '\n');
  fs.writeFileSync(path.join(dir, 'BEGEHBARKEIT_BESTAND_LECKS.csv'), lecks.join('\n') + '\n');
  return { risse: risse.length - 1, lecks: lecks.length - 1 };
}

if (require.main === module) {
  const args = process.argv.slice(2);
  let jsonOut = null, csvDir = null;
  const ids = [];
  for (let i = 0; i < args.length; i++) {
    if (args[i] === '--json') jsonOut = args[++i]; else if (args[i] === '--csv') csvDir = args[++i]; else ids.push(args[i]);
  }
  const reg = loadRegistry();
  const targets = ids.length ? reg.projects.filter((p) => ids.includes(p.id)) : reg.projects;
  const all = [];
  for (const p of targets) {
    const a = analysiere(p);
    all.push(a);
    const b = a.r13;
    console.log(`${a.id}: ${a.blocks} Blöcke, erreichbar ${b.anteil} % (${b.erreichbar} von ${b.innenZellen}), ` +
      `${b.nichtErreichbareKomponenten} Komponenten >= 20, Lücken ${a.r14 ? a.r14.luecken : '-'} (${a.r14 ? a.r14.lueckenDiagonal : '-'} diagonal), ` +
      `Diagonalrisse in ${a.risse ? Object.keys(a.risse).length : '-'} Bauteilen, ${a.ms} ms`);
  }
  if (jsonOut) fs.writeFileSync(jsonOut, JSON.stringify(all, null, 1));
  if (csvDir) console.log('CSV:', JSON.stringify(schreibeCsv(all, csvDir)));
}

module.exports = { analysiere, diagonalrisse, schreibeCsv };
