'use strict';
// R11: Hausakten (nur Quartier-Projekte). Schema, Höhe (±2), Akte je Gebäude, Nachbarschaftsregel,
// Vielfalt-Kennzahl je Isolato (nur Info).
const A = require('../city/akte.js');
const { compareIds } = require('../city/parzellen.js');
const { capped, result } = require('./util.js');

const HOEHE_TOLERANZ = 2;
const fmt = (v) => String(Math.round(v * 100) / 100).replace('.', ',');

module.exports = function r11(ctx) {
  const project = ctx.project;
  if (!project || !project.meta || project.meta.generator !== 'quartier') {
    return result('R11', [], [], { total: 0, skipped: true, info: [] });
  }
  let q;
  try {
    q = require('../city/quartier.js').loadQuartier(project);
  } catch (e) {
    return result('R11', [], [], { total: 0, skipped: true, info: [] }); // Ladefehler meldet der Weltaufbau
  }
  const errors = [], warnings = [], info = [];
  let hausErr = 0;

  for (const id of q.ids) {
    if (q.aktenFehler.has(id)) {
      for (const m of q.aktenFehler.get(id)) { errors.push(`R11 Haus ${id}: ${m}`); hausErr++; }
      continue;
    }
    const a = q.akten.get(id);
    if (!a) { errors.push(`R11 Haus ${id}: keine Hausakte (hausakten/${id}.json)`); hausErr++; continue; }
    const g = q.byId.get(id);
    const sum = A.summeHoehe(a);
    if (Math.abs(sum - g.hoeheBl) > HOEHE_TOLERANZ) {
      errors.push(`R11 Haus ${id}: Geschosshöhen ergeben ${sum}, Gebäudehöhe ${g.hoeheBl} (erlaubt ±${HOEHE_TOLERANZ})`);
      hausErr++;
    }
  }
  const ohneGebaeude = q.aktenDateien.filter((n) => !q.projekt.has(n));
  for (const n of ohneGebaeude) warnings.push(`R11 hausakten/${n}.json gehört zu keinem Gebäude des Projekts`);

  // Nachbarschaftsregel
  const adj = q.adjazenz();
  let paare = 0, verletzt = 0;
  for (const id of q.ids) {
    const a = q.akten.get(id);
    if (!a) continue;
    for (const n of adj.get(id) || []) {
      if (!q.projekt.has(n) || compareIds(id, n) >= 0) continue;
      const b = q.akten.get(n);
      if (!b) continue;
      paare++;
      if (!A.nachbarnOk(a, b)) {
        verletzt++;
        errors.push(`R11 Nachbarn ${id} / ${n}: nur ${A.unterschiede(a, b)} Unterschied(e) in ${A.MERKMALE.join(', ')} (mindestens 2, oder gemeinsames "ensemble")`);
      }
    }
  }

  // Vielfalt je Isolato (Info)
  for (const iso of q.isolati) {
    const akten = iso.ids.map((id) => q.akten.get(id)).filter(Boolean);
    if (!akten.length) { info.push(`Isolato ${iso.id}: ${iso.ids.length} Häuser, keine gültigen Akten`); continue; }
    const sig = new Set(akten.map((a) => JSON.stringify(A.merkmale(a))));
    const typen = new Set(akten.map((a) => a.typ));
    info.push(`Isolato ${iso.id}: ${akten.length} Akten, ${sig.size} verschiedene Merkmalskombinationen (Vielfalt ${fmt(sig.size / akten.length)}), ${typen.size} Typen`);
  }
  return result('R11', capped(errors), capped(warnings), { total: hausErr + verletzt, nachbarpaare: paare, verletzt, info });
};
