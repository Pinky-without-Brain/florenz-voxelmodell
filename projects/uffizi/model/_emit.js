'use strict';
// Gemeinsame Ausgabe der Bauteile aus dem Belegungsplan in die Module.
const { cells, plan, PART_LIST } = require('./_plan.js');

/** Öffnungen (R14) der Bauteile `names` deklarieren: Luftzellen, die der Plan als Öffnung gemerkt hat und die noch leer sind. */
const fertig = new WeakMap();      // je Bau (ctx.grid) die schon deklarierten Öffnungen

function deklariere(ctx, names) {
  const P = plan();
  const { S, own, SLOTS, AIR_ID, oeff } = P;
  const set = names ? new Set(names) : null;       // ohne names: alle noch nicht deklarierten
  const byArt = new Map();
  for (const o of oeff) {
    let done = fertig.get(ctx.grid);
    if (!done) fertig.set(ctx.grid, done = new Set());
    if (done.has(o) || (set && !set.has(o.teil))) continue;
    done.add(o);
    if (own[o.k] !== AIR_ID) continue;
    const i = Math.floor(o.k / SLOTS), L = o.k - i * SLOTS;
    let a = byArt.get(o.art);
    if (!a) byArt.set(o.art, a = []);
    a.push({ x: S.cx[i], y: S.BODEN + L, z: S.cz[i] });
  }
  for (const [art, list] of byArt) ctx.oeffnung(list, art);
}

/** emit(ctx, ['bauteil', ...]): registriert die Bauteile in dieser Reihenfolge und füllt sie je Material. */
function emit(ctx, names) {
  for (const name of names) {
    const groups = cells(name);
    const n = groups.reduce((a, g) => a + g.cells.length, 0);
    if (!n) continue;                      // leere Bauteile werden nicht angelegt
    const w = ctx.part(name);
    for (const g of groups) w.fill(g.cells, g.mat);
  }
  deklariere(ctx, names);
}

/** Nicht zugängliche Räume (R13) deklarieren: Plan-Schlüssel k = Spalte * SLOTS + Lage -> Weltzellen. */
function unzugaenglich(ctx, keys, begruendung) {
  const { S, SLOTS } = plan();
  const list = keys.map((k) => { const i = Math.floor(k / SLOTS), L = k - i * SLOTS; return { x: S.cx[i], y: S.BODEN + L, z: S.cz[i] }; });
  if (list.length) ctx.unzugaenglich(list, begruendung);
}

/** Alle Bauteile des Moduls n aus der Bauteilliste des Plans, in Listenreihenfolge. */
function emitModul(ctx, n) {
  emit(ctx, PART_LIST.filter(([, m]) => m === n).map(([name]) => name));
}

module.exports = { emit, emitModul, deklariere, unzugaenglich };
