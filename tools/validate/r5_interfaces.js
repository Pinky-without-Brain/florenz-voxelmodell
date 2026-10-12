'use strict';
// R5: Schnittstellen (SUPPORTS inkl. coverage, OWNERSHIP, RESERVED).
const { fmt, unpack, capped, result } = require('./util.js');

module.exports = function r5(ctx) {
  const { grid } = ctx;
  const I = ctx.interfaces;
  const included = ctx.includedModules;
  const errors = [];

  for (const s of I.SUPPORTS || []) {
    if (!included.has(s.upper) || !included.has(s.lower)) continue;
    const bad = [];
    let nBad = 0;
    for (const k of ctx.keysByModule(s.upper)) {
      const c = unpack(k);
      if (c.y !== s.y) continue;
      if (c.y < 1 || grid.ownerModule(c.x, c.y - 1, c.z) !== s.lower) {
        nBad++;
        if (bad.length < 5) bad.push(k);
      }
    }
    if (nBad) {
      errors.push(`R5 ${s.name}: ${nBad} Blöcke von Modul ${s.upper} auf Y ${s.y} ohne Auflager von Modul ${s.lower}, z. B. ${bad.map(fmt).join(' ')}`);
    }
    if (s.coverage > 0) {
      let top = 0, covered = 0;
      for (const k of ctx.keysByModule(s.lower)) {
        const c = unpack(k);
        if (c.y !== s.y - 1 || !s.region(c.x, c.y, c.z)) continue;
        top++;
        if (grid.ownerModule(c.x, s.y, c.z) === s.upper) covered++;
      }
      if (top === 0 || covered / top < s.coverage) {
        errors.push(`R5 ${s.name}: Auflager-Deckung ${top ? (100 * covered / top).toFixed(1) : '0'} % (${covered}/${top}) < ${(100 * s.coverage).toFixed(0)} %`);
      }
    }
  }

  const own = (I.OWNERSHIP || []).filter((o) => included.has(o.module));
  const res = I.RESERVED || [];
  if (own.length || res.length) {
    const ownBad = own.map(() => []), resBad = res.map(() => []);
    const ownCount = own.map(() => 0), resCount = res.map(() => 0);
    grid.keysOf((k, m) => {
      const c = unpack(k);
      for (let i = 0; i < own.length; i++) {
        if (m !== own[i].module && own[i].test(c.x, c.y, c.z)) {
          ownCount[i]++;
          if (ownBad[i].length < 5) ownBad[i].push(`${fmt(k)} Modul ${m}`);
        }
      }
      for (let i = 0; i < res.length; i++) {
        if (m !== res[i].forModule && res[i].test(c.x, c.y, c.z)) {
          resCount[i]++;
          if (resBad[i].length < 5) resBad[i].push(`${fmt(k)} Modul ${m}`);
        }
      }
      return false;
    });
    own.forEach((o, i) => {
      if (ownCount[i]) errors.push(`R5 Hoheitsgebiet ${o.name} (Modul ${o.module}): ${ownCount[i]} fremde Blöcke, z. B. ${ownBad[i].join('; ')}`);
    });
    res.forEach((r, i) => {
      if (resCount[i]) errors.push(`R5 Reserviert ${r.name} (nur Modul ${r.forModule}): ${resCount[i]} fremde Blöcke, z. B. ${resBad[i].join('; ')}`);
    });
  }
  return result('R5', capped(errors), [], { total: errors.length });
};
