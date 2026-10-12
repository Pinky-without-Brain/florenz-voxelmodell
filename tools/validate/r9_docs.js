'use strict';
// R9: Die erzeugten Dokumente stimmen mit den Dateien auf der Platte überein.
// Läuft nur, wenn der Aufrufer ctx.docs setzt (build.js); sonst übersprungen.
const fs = require('node:fs');
const path = require('node:path');
const { capped, result } = require('./util.js');

const norm = (s) => s.replace(/\r\n/g, '\n');

// Erste abweichende Zeile (1-basiert) oder 0
function firstDiff(a, b) {
  const x = norm(a).split('\n'), y = norm(b).split('\n');
  const len = Math.max(x.length, y.length);
  for (let i = 0; i < len; i++) if (x[i] !== y[i]) return { line: i + 1, want: x[i], have: y[i] };
  return null;
}

const clip = (s) => (s === undefined ? '(Dateiende)' : s.length > 100 ? s.slice(0, 100) + '…' : s);

module.exports = function r9(ctx) {
  if (!ctx.docs) return result('R9', [], [], { total: 0, skipped: true });
  const { renderDocs } = require('../emit/docs.js');
  const only = ctx.docs.modules;
  const modules = ctx.world.modules.filter((m) => !only || only.includes(m.module));
  const docs = renderDocs({ modules, stepsByModule: ctx.stepsByModule, grid: ctx.grid, root: ctx.root,
    project: ctx.project, complete: ctx.docs.complete });
  const errors = [];
  for (const [rel, want] of docs) {
    const file = path.join(ctx.root, ...rel.split('/'));
    let have;
    try { have = fs.readFileSync(file, 'utf8'); } catch (e) { errors.push(`R9 ${rel}: Datei fehlt`); continue; }
    const d = firstDiff(want, have);
    if (d) errors.push(`R9 ${rel}:${d.line}: weicht ab (erwartet "${clip(d.want)}", vorhanden "${clip(d.have)}")`);
  }
  return result('R9', capped(errors), [], { total: errors.length, files: docs.size });
};
module.exports.firstDiff = firstDiff;
