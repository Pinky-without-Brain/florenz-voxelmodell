'use strict';
// V3 D4 und V5a: Palazzi der Welle 4 (tools/wahrzeichen/palazzo.js): fehlerfrei, Hof offen, Treppe erschließt alle Geschosse,
// dicht; V5a: Raumteilung mit Türen, ausgestaltete Räume mit Content und Quelle, Licht, Bargello-Freitreppe begehbar.
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const ROOT = path.resolve(__dirname, '..', '..');
const { getProject, loadSpecs } = require('../projects.js');
const { buildWorld } = require('../model/world.js');
const { laufe } = require('../validate/begehbarkeit_projekt.js');
const PAL = require('../spec/palette.js');

// [id, Bauplan-Datei, Nummer des Ausstattungsmoduls]
const PALAZZI = [['palazzo_strozzi', '_ps.js', 6], ['palazzo_rucellai', '_pr.js', 6], ['palazzo_medici_riccardi', '_pm.js', 6], ['bargello', '_ba.js', 7], ['ospedale_degli_innocenti', '_oi.js', 6]];
const N4 = [[1, 0], [-1, 0], [0, 1], [0, -1]];
const LICHT = PAL.typesForRole('licht')[0];

const cache = new Map();
function laden(id, lib) {
  if (!cache.has(id)) {
    const project = getProject(id, { root: ROOT });
    const world = buildWorld({ project });
    const PZ = require(`../../projects/${id}/model/${lib}`);
    const RA = require(`../../projects/${id}/model/_raeume.js`);
    cache.set(id, { project, world, PZ, RA, D: PZ.lade() });
  }
  return cache.get(id);
}

/** Stehbare Zellen eines Geschosses (Boden vorhanden, 3 Luft darüber), Zusammenhangskomponenten (4er-Nachbarschaft). */
function raumgruppen(L, s) {
  const { world, PZ, D } = L;
  const g = world.grid, y = PZ.Y(PZ.BASIS[s]);
  const steh = new Map();
  for (const c of D.haupt.concat(D.hofZellen)) {
    if (g.has(c.x, y, c.z) && !g.has(c.x, y + 1, c.z) && !g.has(c.x, y + 2, c.z) && !g.has(c.x, y + 3, c.z)) steh.set(c.x + ',' + c.z, c);
  }
  const gesehen = new Set(), gruppen = [];
  for (const [k0, c0] of steh) {
    if (gesehen.has(k0)) continue;
    const comp = [], st = [c0];
    gesehen.add(k0);
    while (st.length) {
      const c = st.pop();
      comp.push(c);
      for (const [dx, dz] of N4) {
        const k = (c.x + dx) + ',' + (c.z + dz);
        if (steh.has(k) && !gesehen.has(k)) { gesehen.add(k); st.push(steh.get(k)); }
      }
    }
    gruppen.push(comp);
  }
  return gruppen;
}

for (const [id, lib, nMod] of PALAZZI) {
  test(`${id}: fehlerfrei, Geschosse und Traufe, Hof ohne Dach, alles erreichbar und dicht`, () => {
    const L = laden(id, lib);
    const { project, world, PZ, RA, D } = L;
    assert.deepEqual(world.errors, []);
    assert.ok(D.hofZellen.length > 0);
    let ueberHof = 0, decke = 0;
    const hof = new Set(D.hofZellen.map((c) => c.x + ',' + c.z));
    world.grid.forEach((x, y, z, e) => {
      if (y > PZ.Y(0) && hof.has(x + ',' + z) && !e.part.startsWith('turm') && !(e.module === nMod && RA.TEILE.includes(e.part))) ueberHof++;
      if (e.part === 'decke' && y > decke) decke = y;
    });
    assert.equal(ueberHof, 0);
    assert.equal(decke, PZ.Y(PZ.TRAUFE));
    const ctx = { project, world, grid: world.grid, ground: loadSpecs(project).ground, root: ROOT };
    assert.equal(laufe(ctx, 'r13').einheiten[0].komponenten.filter((k) => !k.unzugaenglich).length, 0);
    assert.equal(laufe(ctx, 'r14').einheiten[0].cluster.length, 0);
    assert.ok(world.oeffnungen.some((o) => o.art === 'tor' || (o.art === 'arkade' && o.part === 'portikus')));
  });

  test(`${id}: ausgestaltete Räume sind eigene Bauteile mit Content, Quelle und Hinweis „vereinfacht“`, () => {
    const { world, RA } = laden(id, lib);
    const content = JSON.parse(fs.readFileSync(path.join(ROOT, 'projects', id, 'content', `modul_${nMod}.json`), 'utf8'));
    const anzahl = {};
    world.grid.forEach((x, y, z, e) => { if (e.module === nMod) anzahl[e.part] = (anzahl[e.part] || 0) + 1; });
    assert.ok(RA.TEILE.length >= 5, 'mindestens vier Räume oder Anlagen und das Licht');
    for (const t of RA.TEILE) {
      assert.ok(anzahl[t] > 0, `Bauteil ${t} ist leer`);
      const p = content.parts[t];
      assert.ok(p, `Content für ${t}`);
      for (const f of ['title', 'description', 'tip', 'caution', 'fact']) assert.ok(typeof p[f] === 'string' && p[f].length >= (f === 'title' ? 3 : 10), `${t}.${f}`);
      if (t !== 'licht_ausstattung') {
        assert.match(p.caution, /[Vv]ereinfacht/, `${t}: Hinweis vereinfacht`);
        assert.match(p.fact, /Quelle/, `${t}: Quelle`);
      }
    }
    assert.deepEqual(Object.keys(content.parts).sort(), RA.TEILE.slice().sort());
  });

  test(`${id}: jede Trennwand hat Türen (3 breit, 5 hoch), jedes Geschoss ist eine Raumgruppe`, () => {
    const L = laden(id, lib);
    const { PZ, RA, D } = L;
    const Pl = PZ.plan();
    assert.ok(RA.WAENDE.length >= 4, 'Raumteilung vorhanden');
    for (const w of RA.WAENDE) {
      assert.ok(w.tueren && w.tueren.length >= 1, 'jede Trennwand mit Tür');
      const ss = w.s === undefined || w.s === 'alle' ? PZ.cfg.geschosse.map((_, i) => i) : [].concat(w.s);
      for (const s of ss) {
        const teil = s === 0 ? 'trennwaende' : 'trennwaende_og';
        const tuer = Pl.oeff.get('tuer|' + teil) || [];
        const nahe = (q, y) => tuer.filter((o) => {
          if (o.y !== y) return false;
          const l = D.R.toLocal(o.x, o.z);
          const a = w.achse === 'u' ? l.u : l.w, t = w.achse === 'u' ? l.w : l.u;
          return Math.abs(a - w.v) < 1.2 && Math.abs(t - q) < 2;
        }).length;
        for (const q of w.tueren) {
          assert.ok(nahe(q, PZ.Y(PZ.BASIS[s] + 2)) >= 6, `Tür ${q} der Wand ${w.achse}=${w.v} im Geschoss ${s} (Lage 2)`);
          assert.ok(nahe(q, PZ.Y(PZ.BASIS[s] + 5)) >= 6, `Tür ${q} der Wand ${w.achse}=${w.v} im Geschoss ${s} (Lage 5)`);
        }
        assert.ok((Pl.teile.get(teil) || []).length > 0);
      }
    }
    for (let s = 0; s < PZ.cfg.geschosse.length; s++) {
      const gs = raumgruppen(L, s).filter((c) => c.length >= 12);
      assert.equal(gs.length, 1, `Geschoss ${s}: ${gs.map((c) => c.length).join(',')}`);
    }
  });

  test(`${id}: Licht in allen Räumen höchstens 12 Blöcke voneinander (Seelaternen im Boden)`, () => {
    const L = laden(id, lib);
    const { world, PZ, D } = L;
    const g = world.grid, hof = new Set(D.hofZellen.map((c) => c.x + ',' + c.z));
    for (let s = 0; s < PZ.cfg.geschosse.length; s++) {
      const y = PZ.Y(PZ.BASIS[s]), lichter = [];
      g.forEach((x, yy, z, e) => { if (yy === y && e.type === LICHT) lichter.push([x, z]); });
      assert.ok(lichter.length > 0, `Geschoss ${s}: Licht`);
      let schlecht = 0, gepr = 0;
      for (const c of raumgruppen(L, s).filter((q) => q.length >= 30).flat()) {
        if (hof.has(c.x + ',' + c.z)) continue;
        gepr++;
        let d = Infinity;
        for (const [lx, lz] of lichter) { const q = Math.hypot(lx - c.x, lz - c.z); if (q < d) d = q; }
        if (d > 12.01) schlecht++;
      }
      assert.ok(gepr > 100);
      assert.equal(schlecht, 0, `Geschoss ${s}: ${schlecht} Zellen weiter als 12 von einer Lichtquelle`);
    }
  });
}

test('Bargello: Freitreppe im Hof aus Treppenblöcken, Kopffreiheit 3, ohne die Wendeltreppe bis in die Galerie begehbar', () => {
  const L = laden('bargello', '_ba.js');
  const { world, PZ, RA } = L;
  const g = world.grid, FT = RA.FT;
  const stufen = [];
  g.forEach((x, y, z, e) => { if (e.part === 'freitreppe' && PAL.isTreppe(e.type)) stufen.push({ x, y, z }); });
  assert.ok(stufen.length >= 3 * FT.n - 8, `Treppenblöcke: ${stufen.length}`);
  for (const b of stufen) for (let h = 1; h <= 3; h++) assert.ok(!g.has(b.x, b.y + h, b.z), `Kopffreiheit über ${b.x},${b.y},${b.z}`);
  // Steigung: eine Lage je Block entlang der Laufrichtung (nach Westen), Spur z = Startzeile
  for (let k = 0; k < FT.n; k++) assert.ok(g.has(FT.x0 - k, PZ.Y(1) + k, FT.z0) && PAL.isTreppe(g.get(FT.x0 - k, PZ.Y(1) + k, FT.z0).type), `Stufe ${k}`);
  assert.ok(g.has(FT.bx[1], PZ.Y(PZ.BASIS[1]), FT.z0), 'Plattform der Verone auf Geschossbodenhöhe');
  // Erreichbarkeit: Start im Hof, Wendeltreppe (Teil treppe) zählt als Wand
  const fest = (x, y, z) => g.has(x, y, z) && g.get(x, y, z).part !== 'treppe';
  const steh = (x, y, z) => fest(x, y - 1, z) && !fest(x, y, z) && !fest(x, y + 1, z) && !fest(x, y + 2, z);
  const key = (x, y, z) => x + ',' + y + ',' + z;
  const seen = new Set(), q = [];
  const start = [FT.x0 + 1, PZ.Y(1), FT.z0];
  assert.ok(steh(...start), 'Startzelle im Hof');
  seen.add(key(...start)); q.push(start);
  const y0 = PZ.Y(0), y1 = PZ.Y(PZ.BASIS[1] + 6);
  while (q.length) {
    const [x, y, z] = q.pop();
    for (const [dx, dz] of N4) {
      const nx = x + dx, nz = z + dz;
      if (nx < FT.x0 - 60 || nx > FT.x0 + 40 || nz < FT.z0 - 60 || nz > FT.z0 + 40) continue;
      for (const dy of [0, 1, -1, -2, -3]) {
        const ny = y + dy;
        if (ny < y0 || ny > y1 || !steh(nx, ny, nz)) continue;
        const k = key(nx, ny, nz);
        if (!seen.has(k)) { seen.add(k); q.push([nx, ny, nz]); }
        break;
      }
    }
  }
  const tor = world.oeffnungen.find((o) => o.part === 'verone' && o.art === 'loggia' && o.module === 7);
  assert.ok(tor, 'Tor der Verone deklariert');
  assert.ok(seen.has(key(FT.x0 - FT.n + 1, PZ.Y(PZ.BASIS[1]) + 1, FT.z0)) || seen.has(key(FT.bx[1], PZ.Y(PZ.BASIS[1]) + 1, FT.z0)), 'Plattform erreichbar');
  const galerie = L.D.haupt.filter((c) => c.dHof >= 3 && c.dHof <= 7 && c.z < FT.bz[0] - 3 && c.x >= FT.tor[0] && c.x <= FT.tor[1]);
  assert.ok(galerie.length > 0);
  assert.ok(galerie.some((c) => seen.has(key(c.x, PZ.Y(PZ.BASIS[1]) + 1, c.z))), 'Galerie des 1. Obergeschosses von der Freitreppe aus erreichbar');
});

test('Medici Riccardi: Orpheus, Medaillons und Garten; Innocenti: Ruota nur als dichte Nische', () => {
  const m = laden('palazzo_medici_riccardi', '_pm.js');
  const teile = {};
  m.world.grid.forEach((x, y, z, e) => { if (e.module === 6) (teile[e.part] = teile[e.part] || new Set()).add(e.type); });
  assert.ok(teile.medaillons.size >= 3, 'Medaillons mit Gold, Weiß und Farbe');
  assert.ok(teile.garten_medici.has('water') || [...teile.garten_medici].some((t) => /water|wasser/i.test(t)), 'Brunnenwasser im Garten');
  const oi = laden('ospedale_degli_innocenti', '_oi.js');
  const ruota = [];
  oi.world.grid.forEach((x, y, z, e) => { if (e.part === 'ruota') ruota.push(e.type); });
  assert.ok(ruota.length > 20 && ruota.includes('cut_copper'), 'Ruota aus Rahmen, Bronze und Glas');
  assert.ok(!oi.world.oeffnungen.some((o) => o.part === 'ruota'), 'Ruota ist keine Öffnung');
});
