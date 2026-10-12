'use strict';
// R10: Das Markenwort darf nirgends vorkommen. Das Muster wird aus Zeichencodes gebildet.
const fs = require('node:fs');
const path = require('node:path');
const { capped, result } = require('./util.js');

// Treffer nur am Wortanfang (kein Buchstabe davor), damit z. B. deutsche Wörter mit der Silbe nicht treffen
const WORD = String.fromCharCode(108, 101, 103, 111);
const PATTERN = new RegExp('(?<![a-zäöüß])' + WORD, 'i');
const TEXT_EXT = new Set(['.js', '.mjs', '.cjs', '.json', '.md', '.html', '.htm', '.css', '.txt', '.svg', '.csv', '.yml', '.yaml']);
const SKIP_DIRS = new Set(['node_modules', '.git', 'build', '_archiv_v1']);
const MAX_BYTES = 8 * 1024 * 1024;

function walk(dir, cb, skip) {
  let entries;
  try { entries = fs.readdirSync(dir, { withFileTypes: true }); } catch (e) { return; }
  for (const e of entries) {
    const p = path.join(dir, e.name);
    if (skip && skip(p)) continue;
    if (e.isDirectory()) { if (!SKIP_DIRS.has(e.name)) walk(p, cb, skip); }
    else if (e.isFile()) cb(p);
  }
}

module.exports = function r10(ctx) {
  const root = ctx.root;
  // Erzeugte Webapp-Daten (Base64) und OSM-Rohdaten werden übersprungen
  const skipDirs = new Set([path.join(root, 'webapp', 'js', 'data', 'v2'), path.join(root, 'webapp', 'data'),
    path.join(root, 'data', 'osm')]);
  const files = new Set();
  for (const sub of ['tools', 'content', 'webapp', 'projects', 'data', '20_Stadtmodell_Florenz']) {
    walk(path.join(root, sub), (f) => {
      if (TEXT_EXT.has(path.extname(f).toLowerCase())) files.add(f);
    }, (p) => skipDirs.has(p));
  }
  walk(root, (f) => { if (f.toLowerCase().endsWith('.md')) files.add(f); });

  const errors = [];
  let total = 0;
  for (const f of [...files].sort()) {
    let text;
    try {
      if (fs.statSync(f).size > MAX_BYTES) continue;
      text = fs.readFileSync(f, 'utf8');
    } catch (e) { continue; }
    if (!PATTERN.test(text)) continue;
    text.split(/\r?\n/).forEach((l, i) => {
      if (PATTERN.test(l)) {
        total++;
        errors.push(`R10 ${path.relative(root, f).split(path.sep).join('/')}:${i + 1}: Markenwort`);
      }
    });
  }
  return result('R10', capped(errors), [], { total, filesScanned: files.size });
};
