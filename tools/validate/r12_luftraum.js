'use strict';
// R12: Luftraum (nur Wahrzeichen-Projekte mit Maskenfeldern, ARCHITEKTUR §10 "Wahrzeichen-Projekte (W0)").
// Jede Zelle des Projekts liegt in der Vereinigung der Projektmasken (Hauptmaske, Zusatzmasken; Lochzellen
// = Höfe zählen als innen) oder ihre Säule hat einen Chebyshev-Abstand dAussen <= luftraum zur Vereinigung.
const path = require('node:path');
const { xOfKey, yOfKey, zOfKey } = require('../geom/grid.js');
const { capped, result } = require('./util.js');

const BEISPIELE = 5;

module.exports = function r12(ctx) {
  const project = ctx.project;
  const json = project && project.json;
  if (!project || project.type !== 'wahrzeichen' || !json || json.ohneMaske === true || !Array.isArray(json.gebaeude)) {
    return result('R12', [], [], { total: 0, skipped: true });
  }
  const { ladeMasken } = require('../wahrzeichen/projekt.js');
  let m;
  try {
    m = ladeMasken(json, { dir: project.dir, root: ctx.root, projectsRoot: path.join(ctx.root, 'projects') });
  } catch (e) {
    return result('R12', [`R12 Masken nicht ladbar: ${e.message}`], [], { total: 0 });
  }
  const erlaubt = m.luftraum;
  const errors = [];
  let total = 0;
  const spalten = new Map(); // Säulenschlüssel -> Abstand (Infinity = gültig innen: -1)
  const abstand = (x, z) => {
    const k = x * 16384 + z;
    let d = spalten.get(k);
    if (d === undefined) {
      d = m.alle.innen(x, z) ? 0 : m.alle.dAussen(x, z);
      spalten.set(k, d);
    }
    return d;
  };
  for (const mod of ctx.world.modules) {
    for (const part of mod.parts) {
      let n = 0, maxD = 0;
      const bsp = [];
      for (const key of part.keys) {
        const x = xOfKey(key), z = zOfKey(key);
        const d = abstand(x, z);
        if (d <= erlaubt) continue;
        n++;
        if (d > maxD) maxD = d;
        if (bsp.length < BEISPIELE) bsp.push(`(${x},${yOfKey(key)},${z}) dAussen=${d === Infinity ? '>32' : d}`);
      }
      if (n) {
        total += n;
        errors.push(`R12 Modul ${mod.module}, Bauteil ${part.id}: ${n} Zellen außerhalb der Masken (Luftraum ${erlaubt}), z. B. ${bsp.join(', ')}`);
      }
    }
  }
  return result('R12', capped(errors), [], { total });
};
