'use strict';
// R3: Baubarkeit. Schritte global in Reihenfolge; jeder Block muss über Flächenkontakte im Schritt
// einen Block erreichen, der an früher Gesetztes oder an das Gelände grenzt.
const { fmt, unpack, forNeighbors, capped, result } = require('./util.js');

const EXAMPLES_PER_STEP = 5;

module.exports = function r3(ctx) {
  const hasGroundContact = ctx.ground.hasGroundContact;
  const errors = [];
  const violations = [];
  const placed = new Set();
  let total = 0;
  for (const s of ctx.steps) {
    const inStep = new Set(s.cells);
    const seen = new Set();
    const stack = [];
    for (const k of s.cells) {
      let ok = false;
      const c = unpack(k);
      if (hasGroundContact(c.x, c.y, c.z)) ok = true;
      else forNeighbors(k, (n) => { if (!ok && placed.has(n)) ok = true; });
      if (ok) { seen.add(k); stack.push(k); }
    }
    while (stack.length) {
      const k = stack.pop();
      forNeighbors(k, (n) => {
        if (inStep.has(n) && !seen.has(n)) { seen.add(n); stack.push(n); }
      });
    }
    if (seen.size !== inStep.size) {
      const bad = [];
      let count = 0;
      for (const k of s.cells) {
        if (!seen.has(k)) { count++; if (bad.length < EXAMPLES_PER_STEP) bad.push(k); }
      }
      total += count;
      violations.push({ module: s.module, step: s.stepNumber, count, examples: bad.map(unpack) });
      errors.push(`R3 Modul ${s.module}, Schritt ${s.stepNumber}: ${count} Blöcke ohne Halt, z. B. ${bad.map(fmt).join(' ')}`);
    }
    for (const k of s.cells) placed.add(k);
  }
  return result('R3', capped(errors), [], { total, violations });
};
