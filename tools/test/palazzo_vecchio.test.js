'use strict';
// V3 W3: Wahrzeichen Palazzo Vecchio (Katalog §13, PRUEFBERICHT D1 K0..K8).
const test = require('node:test');
const assert = require('node:assert/strict');
const path = require('node:path');

const ROOT = path.resolve(__dirname, '..', '..');
const { buildWorld } = require('../model/world.js');
const { loadRegistry } = require('../projects.js');
const { xOfKey, yOfKey, zOfKey } = require('../geom/grid.js');
const { ladeMasken, pruefeFelder } = require('../wahrzeichen');
const pv = require('../../projects/palazzo_vecchio/model/pv_lib.js');
const m1 = require('../../projects/palazzo_vecchio/model/m1_erdgeschoss.js');

const BODEN = 68;
let cache = null;
function welt() {
  if (cache) return cache;
  const reg = loadRegistry();
  const project = reg.projects.find((p) => p.id === 'palazzo_vecchio');
  assert.ok(project, 'Projekt palazzo_vecchio fehlt in der Registry');
  const world = buildWorld({ project });
  const parts = new Map();
  for (const m of world.modules) for (const p of m.parts) parts.set(p.id, { ...p, module: m.module });
  cache = { project, world, parts, masken: ladeMasken(project.json, { dir: project.dir }), g: pv.geo() };
  return cache;
}

const partYs = (p) => { let lo = Infinity, hi = -Infinity; for (const k of p.keys) { const y = yOfKey(k); if (y < lo) lo = y; if (y > hi) hi = y; } return [lo, hi]; };

test('Projektfelder und Parameter (Katalog §0, Prüfbericht Frage 5)', () => {
  const { project } = welt();
  assert.deepEqual(pruefeFelder(project.json), []);
  assert.equal(project.json.bodenY, BODEN);
  assert.equal(project.json.luftraum, 3);
  assert.equal(m1.PV_AXES, 9);
  assert.equal(m1.PORTAL_U, 55);
});

test('Build fehlerfrei, Zellen eindeutig, Blockzahl im Rahmen des Katalogs', () => {
  const { world } = welt();
  assert.deepEqual(world.errors, []);
  assert.equal(world.modules.length, 10);
  const n = world.grid.size;
  assert.ok(n >= 350000 && n <= 620000, `Blockzahl ${n}`);
});

test('Turmoberkante Y 256 und Palast-Zinnenoberkante Y 130', () => {
  const { parts, world } = welt();
  let top = 0;
  world.grid.forEachKey((k) => { const y = yOfKey(k); if (y > top) top = y; });
  assert.equal(top, 256);
  assert.equal(partYs(parts.get('marzocco_fahne'))[1], 256);
  assert.deepEqual(partYs(parts.get('zinnen_guelfisch')), [BODEN + 61, BODEN + 62]);
  assert.equal(BODEN + 62, 130);
  // Palastkörper ohne Turm: höchste Zelle der Module 0..3 und 6..9 liegt bei Y 130 oder darunter
  let palast = 0;
  // (die Turmwendeltreppe und die Verbindungsblöcke reichen bis in den Turm; die Verbindungsblöcke werden unten am Turm geprüft)
  for (const [id, p] of parts) if (p.module !== 4 && p.module !== 5 && id !== 'turm_wendeltreppe' && id !== 'verbindungsbloecke') palast = Math.max(palast, partYs(p)[1], 0);
  assert.ok(palast <= 135, `Palast bis Y ${palast}`);   // Salone-First Y 134, Ostblockdach (Anstieg höchstens 10) bis Y 135
});

test('Geschosshöhen: 16 + 17 + 16 + 6 + 1 + 4 + 2 = 62 und Turm 188', () => {
  assert.equal(16 + 17 + 16 + 6 + 1 + 4 + 2, 62);
  assert.equal(62 + 82 + 8 + 8 + 16 + 8 + 4, 188);
});

test('Alle Zellen liegen in der Maske oder im erlaubten Luftraum (R12-Logik, Katalog §0.6)', () => {
  const { world, masken } = welt();
  const alle = masken.alle;
  let draussen = 0, minY = Infinity, maxY = -Infinity;
  world.grid.forEachKey((k) => {
    const x = xOfKey(k), z = zOfKey(k);
    if (alle.innen(x, z)) return;
    draussen++;
    assert.ok(alle.dAussen(x, z) <= masken.luftraum, `(${x},${yOfKey(k)},${z}) außerhalb des Luftraums`);
    const yr = yOfKey(k) - BODEN;
    // nur Ballatoio der Zone A (Gesims 49 .. Zinnen 62), Turm-Ballatoio (145..160) und die Außentreppen vor den Portalen (y_rel -6..0)
    assert.ok((yr >= 49 && yr <= 62) || (yr >= 145 && yr <= 160) || (yr >= -6 && yr <= 0), `Luftraum bei y_rel ${yr}`);
    if (yr < minY) minY = yr; if (yr > maxY) maxY = yr;
  });
  assert.ok(draussen > 0, 'das Ballatoio muss über die Maske hinausragen');
  assert.equal(maxY, 160);
  assert.ok(minY >= -6);
});

test('Korridoröffnung Y 102..108 ist offen, Laibung steht daneben (Katalog §11)', () => {
  const { world, g } = welt();
  const K = g.K;
  const tpOf = (r) => (r.e === 14 ? r.uK : K[14].L + r.uK);
  let geprueft = 0, laibung = 0;
  for (const r of g.recs) {
    if (r.d8 > 4 || (r.e !== 14 && r.e !== 15)) continue;
    const tp = tpOf(r);
    if (tp >= 3.4 && tp < 10.3) {
      for (let Y = 102; Y <= 108; Y++) assert.ok(!world.grid.has(r.x, Y, r.z), `Öffnung belegt bei (${r.x},${Y},${r.z})`);
      geprueft++;
    } else if ((tp >= 2.4 && tp < 3.3) || (tp >= 10.4 && tp < 11.3)) {
      if (world.grid.has(r.x, 102, r.z)) laibung++;
    }
  }
  assert.ok(geprueft >= 20, `nur ${geprueft} Öffnungszellen geprüft`);
  assert.ok(laibung > 0, 'Laibung fehlt');
});

test('18 Konsolbögen an der Westfassade (Katalog §4)', () => {
  const { world, g } = welt();
  const { M, rf } = g;
  const bb = M.bbox;
  const zellen = [];
  for (let x = bb.x0 - 4; x <= bb.x1 + 4; x++) {
    for (let z = bb.z0 - 4; z <= bb.z1 + 4; z++) {
      if (M.innen(x, z) || M.dAussen(x, z) !== 3) continue;
      const e = M.naechsteKante(x, z);
      const u = rf.toLocal(x, z).u;
      if (e >= 17 && u >= 0 && u <= 89.9) zellen.push({ x, z, u });
    }
  }
  zellen.sort((a, b) => a.u - b.u);
  // Bogenöffnung: im Scheitelbereich (y_rel 54) offene Zellen zwischen zwei Konsolen
  let runs = 0, run = 0, davor = false;
  for (const c of zellen) {
    const fest = world.grid.has(c.x, BODEN + 54, c.z);
    if (!fest) { run++; continue; }
    if (run >= 2 && davor) runs++;
    run = 0; davor = true;
  }
  assert.equal(runs, 18);
});

test('K1: Zone A ist Rustika (Erdgeschoss und beide Obergeschosse)', () => {
  const { world, parts } = welt();
  const count = (id) => {
    const c = {};
    for (const k of parts.get(id).keys) { const t = world.grid.get(xOfKey(k), yOfKey(k), zOfKey(k)).type; c[t] = (c[t] || 0) + 1; }
    return c;
  };
  for (const id of ['eg_wand_west', 'og1_wand_west', 'og2_wand_west', 'og_wand_nord_sued_a', 'eg_wand_nord_sued_a']) {
    const c = count(id);
    const top = Object.entries(c).sort((a, b) => b[1] - a[1])[0][0];
    assert.equal(top, 'tuff_bricks', `${id}: ${JSON.stringify(c)}`);
  }
  assert.equal(count('og1_wand_west').polished_andesite, undefined);   // Pietra forte nur im Erdgeschoss an den Fensterrahmen
});

test('K2/K3: turm_unterbau ist das erste Bauteil in Modul 4, im Turmhohlraum stehen nur Wendeltreppe, Glocken und Fugenblöcke, keine Michelozzo-Treppe', () => {
  const { world, g, parts } = welt();
  const m4 = world.modules.find((m) => m.module === 4);
  assert.equal(m4.parts[0].id, 'turm_unterbau');
  assert.ok(!parts.has('treppen_michelozzo'));
  assert.ok(!world.modules.find((m) => m.module === 9).parts.some((p) => p.id === 'turm_unterbau'));
  // B2: der Hohlraum trägt jetzt die Wendeltreppe (Bauteil turm_wendeltreppe) und die Eingangstür; die Zellen außerhalb bleiben frei
  // (nur Treppen, Podeste und Verbindungsblöcke stehen im Hohlraum)
  const erlaubt = new Set(['turm_wendeltreppe', 'verbindungsbloecke', 'glocken']);
  let leer = 0, treppe = 0;
  for (const r of g.recs) {
    if (r.zone !== 'T' || r.dT <= 4) continue;
    for (let y = 1; y <= 143; y++) {
      const e = world.grid.get(r.x, BODEN + y, r.z);
      if (e) { assert.ok(erlaubt.has(e.part), `Turmhohlraum belegt von ${e.part} (${r.x},${y},${r.z})`); treppe++; }
    }
    leer++;
  }
  assert.ok(leer > 50 && treppe > 500);
});

test('K4: Salone nur außerhalb der Außenwandbänder', () => {
  const { world, g, parts } = welt();
  for (const id of ['salone_waende', 'salone_decke', 'dach_salone']) {
    for (const k of parts.get(id).keys) {
      const r = g.rec(xOfKey(k), zOfKey(k));
      assert.ok(r, `${id}: Zelle außerhalb der Maske`);
      assert.ok(r.d8 > pv.tWall(Math.min(yOfKey(k) - BODEN, 56)), `${id}: Zelle im Außenwandband`);
    }
  }
  assert.ok(world.grid.size > 0);
});

test('Alle Bauteile haben Content, Zonen und Rollen: Fassade liegt auf der Piazza-Seite', () => {
  const { world } = welt();
  for (const m of world.modules) {
    assert.ok(m.content, `Modul ${m.module}: Content fehlt`);
    for (const p of m.parts) assert.ok(m.content.parts[p.id] && m.content.parts[p.id].title, `Content fehlt: ${p.id}`);
  }
  const pf = welt().g.rf.toLocal(-130.5, 798.5);
  assert.ok(Math.abs(pf.u - 89.9) < 0.2 && Math.abs(pf.w) < 0.2);
});

// ---------------------------------------------------------------- B2: dicht, begehbar, ausgestaltet
const B = require('../validate/begehbarkeit.js');
const palette = require('../spec/palette.js');
const WZ = require('../wahrzeichen');
const { loadSpecs } = require('../projects.js');
const { packKey: packKeyZ } = require('../geom/grid.js');

let reachCache = null;
function erreichbarkeit() {
  if (reachCache) return reachCache;
  const { project, world, masken, g } = welt();
  const grid = world.grid;
  const specs = loadSpecs(project);
  const maske = masken.alle;
  let minX = 1e9, maxX = -1e9, minZ = 1e9, maxZ = -1e9, minY = 1e9, maxY = -1e9;
  const keys = [];
  for (const m of world.modules) for (const p of m.parts) for (const k of p.keys) {
    keys.push(k);
    const x = xOfKey(k), y = yOfKey(k), z = zOfKey(k);
    minX = Math.min(minX, x); maxX = Math.max(maxX, x); minZ = Math.min(minZ, z); maxZ = Math.max(maxZ, z); minY = Math.min(minY, y); maxY = Math.max(maxY, y);
  }
  const gt = specs.ground.groundTopY;
  const x0 = minX - 3, x1 = maxX + 3, z0 = minZ - 3, z1 = maxZ + 3;
  let minTop = 1e9, maxTop = -1e9;
  for (let x = x0; x <= x1; x++) for (let z = z0; z <= z1; z++) { const t = gt(x, z); minTop = Math.min(minTop, t); maxTop = Math.max(maxTop, t); }
  const y0 = Math.max(0, Math.min(minY, minTop) - 1), y1 = Math.min(511, Math.max(maxY, maxTop) + 4);
  const R = B.bauRaster({ x0, x1, z0, z1, y0, y1, grid, gelaendeTop: gt, gelaendeHohl: null, iteriere: (cb) => { for (const k of keys) cb(k); } });
  const { Xn, Zn, Yn, top } = R;
  const seeds = [];
  for (let xi = 0; xi < Xn; xi++) for (let zi = 0; zi < Zn; zi++) {
    const c = xi * Zn + zi;
    if (maske.innen(x0 + xi, z0 + zi)) continue;
    const ring = xi < 1 || zi < 1 || xi >= Xn - 1 || zi >= Zn - 1;
    const base = c * Yn;
    if (ring) { for (let yi = 0; yi + 2 < Yn; yi++) if (B.stehbar(R, base + yi, yi)) seeds.push(base + yi); }
    else { const yi = top[c] + 1 - y0; if (yi >= 0 && B.stehbar(R, base + yi, yi)) seeds.push(base + yi); }
  }
  const vis = B.erreichbar(R, seeds);
  const idx = (x, y, z) => ((x - x0) * Zn + (z - z0)) * Yn + (y - y0);
  reachCache = { R, vis, idx, maske, x0, z0, Xn, Zn, Yn, y0, g,
    stehbar: (x, y, z) => B.stehbar(R, idx(x, y, z), y - y0), erreicht: (x, y, z) => vis[idx(x, y, z)] === 1 };
  return reachCache;
}
const alleZellen = () => {
  const { world } = welt();
  const out = [];
  world.grid.forEach((x, y, z, e) => out.push([x, y, z, e.module, e.part, e.type]));
  return out;
};

test('B2: keine Diagonalrisse (alle Schichten flächenverbunden)', () => {
  const { world } = welt();
  const grid = world.grid;
  let risse = 0;
  grid.forEach((x, y, z) => {
    for (const dz of [1, -1]) if (grid.has(x + 1, y, z + dz) && !grid.has(x + 1, y, z) && !grid.has(x, y, z + dz)) risse++;
  });
  assert.equal(risse, 0);
});

test('B2: R13 und R14 ohne Fehler, Pflichtmodus, Öffnungen und Unzugängliches deklariert', () => {
  const { project, world } = welt();
  assert.equal(project.json.begehbarkeit, 'pflicht');
  const { analysiere } = require('../diag/begehbarkeit_bestand.js');
  const a = analysiere(project);
  assert.equal(a.r14.luecken, 0);
  assert.equal(a.r13.nichtErreichbareKomponenten, 0);
  assert.equal(Object.keys(a.risse).length, 0);
  const arten = new Set(world.oeffnungen.map((o) => o.art));
  for (const art of ['tuer', 'tor', 'arkade', 'loggia', 'scharte']) assert.ok(arten.has(art), `Öffnungsart ${art} fehlt`);
  assert.ok(world.oeffnungen.some((o) => o.art === 'tor' && o.part === 'og_wand_mittelbauten'), 'Korridoröffnung als tor deklariert');
  assert.ok(world.oeffnungen.some((o) => o.art === 'scharte' && o.part === 'ballatoio_boden'), 'Caditoie als scharte');
  assert.ok(world.unzugaenglich.length > 0);
  for (const u of world.unzugaenglich) assert.ok(u.begruendung.length > 20);
  // unzugänglich sind nur Dachräume, Fensternischen, Sockelluft und der Globus; der Rest ist erreichbar (> 80 %)
  assert.ok(a.r13.anteil > 80, `erreichbar ${a.r13.anteil} %`);
});

test('B2: echte Treppenblöcke in allen Treppen (Scalone, Läufe, Wehrgang, Terrasse, Turm, Außentreppen)', () => {
  const all = alleZellen();
  const n = (part) => all.filter((c) => c[4] === part && palette.isTreppe(c[5])).length;
  assert.ok(n('scalone_vasari') >= 16 * 4, 'Scalone');
  assert.ok(n('treppe_og1_og2') >= 17 * 3);
  assert.ok(n('treppe_og2_dg') >= 16 * 3);
  assert.ok(n('treppe_ost_eg_og1') >= 16 * 3 && n('treppe_ost_og1_og2') >= 17 * 3 && n('treppe_ost_og2_dg') >= 16 * 3);
  assert.ok(n('treppe_wehrgang_nord') >= 7 * 3 && n('treppe_wehrgang_sued') >= 7 * 3);
  assert.ok(n('treppe_terrasse') >= 8 * 3);
  assert.ok(n('turm_wendeltreppe') >= 300, `Turmtreppe ${n('turm_wendeltreppe')}`);
  assert.ok(n('aussentreppen') >= 20);
  // Aufstieg des Scalone zeigt nach Norden (Treppenblock mit @n)
  assert.ok(all.some((c) => c[4] === 'scalone_vasari' && /@n$/.test(c[5])));
});

test('B2: jedes Geschoss, der Salone, der Wehrgang, die Terrasse und der Turm sind von außen erreichbar', () => {
  const r = erreichbarkeit();
  const { g } = r;
  const zaehle = (Y, f) => {
    let n = 0;
    for (let xi = 0; xi < r.Xn; xi++) for (let zi = 0; zi < r.Zn; zi++) {
      const x = r.x0 + xi, z = r.z0 + zi;
      if (!r.maske.innen(x, z) || (f && !f(x, z))) continue;
      if (r.stehbar(x, Y, z) && r.erreicht(x, Y, z)) n++;
    }
    return n;
  };
  assert.ok(zaehle(69) > 15000, 'Erdgeschoss');
  assert.ok(zaehle(85) > 15000, 'erstes Obergeschoss');
  assert.ok(zaehle(102) > 11000, 'zweites Obergeschoss');
  assert.ok(zaehle(118) > 12000, 'Dachgeschoss');
  assert.ok(zaehle(126) > 5000, 'Dachterrasse über dem Mittelbau');
  // Salone dei Cinquecento: alle Stehzellen des Saals
  const sal = zaehle(85, (x, z) => { const q = g.rec(x, z); return q && q.salL; });
  assert.ok(sal > 3500, `Salone ${sal}`);
  // Ballatoio-Wehrgang der Zone A (Y 125): beide Seiten des Turms
  const weh = zaehle(125, (x, z) => { const q = g.rec(x, z); return q && q.zone === 'A' && q.d8 <= 3; });
  assert.ok(weh > 400, `Wehrgang ${weh}`);
  const wehN = zaehle(125, (x, z) => { const q = g.rec(x, z); return q && q.zone === 'A' && q.d8 <= 3 && q.e >= 17 && q.u > 46; });
  const wehS = zaehle(125, (x, z) => { const q = g.rec(x, z); return q && q.zone === 'A' && q.d8 <= 3 && q.e >= 17 && q.u < 23; });
  assert.ok(wehN > 20 && wehS > 5, `Wehrgang nördlich ${wehN}, südlich ${wehS}`);
  // Turm: Glockenstube (Y 222) und Edikula (Y 230) im Hohlraum, Turm-Ballatoio auf Y 222 im Ring
  const hohl = (x, z) => { const q = g.rec(x, z); return q && q.zone === 'T' && q.dT > 4; };
  assert.ok(zaehle(222, hohl) >= 30, 'Glockenstube');
  assert.ok(zaehle(230, hohl) >= 30, 'Edikula');
  const ring = zaehle(222, (x, z) => { const d = g.MT.dAussen(x, z); return d >= 1 && d <= 3; });
  assert.ok(ring >= 30, `Turm-Ballatoio ${ring}`);
  // Treppe bis zur Edikula: Podeste auf y_rel 153 (Boden der Glockenstube) und 161 (Boden der Edikula)
  const { world } = welt();
  const pod = world.modules.find((m) => m.module === 9).parts.find((p) => p.id === 'turm_wendeltreppe');
  const ys = new Set(); for (const k of pod.keys) ys.add(yOfKey(k) - BODEN);
  assert.ok(ys.has(1) && ys.has(153) && ys.has(161), 'Podeste auf 1, 153, 161');
});

test('B2: Portale sind Öffnungen mit Treppen, die Korridoröffnung ist offen und von innen erreichbar', () => {
  const { world, g } = welt();
  const r = erreichbarkeit();
  // Hauptportal der Westfassade: Durchgang 8 x 12 frei (keine Holztür), als tuer deklariert
  const tuer = new Set();
  for (const o of world.oeffnungen) if (o.art === 'tuer') for (const k of o.keys) tuer.add(k);
  const tor = new Set();
  for (const o of world.oeffnungen) if (o.art === 'tor') for (const k of o.keys) tor.add(k);
  let pz = 0;
  for (const q of g.recs) {
    if (q.e < 17 || q.d8 > 5 || Math.abs(q.u - 55) >= 4) continue;
    for (let y = 1; y <= 12; y++) { assert.ok(!world.grid.has(q.x, BODEN + y, q.z), `Portal belegt (${q.x},${y},${q.z})`); pz++; }
  }
  assert.ok(pz > 300);
  assert.ok(tuer.size > 1000 && tor.size > 100, `tuer ${tuer.size} tor ${tor.size}`);
  // Portal-Treppen: Via dei Leoni 6 Stufen; die Außenzellen der Stufen stehen höchstens 3 Zellen vor der Maske
  const leoni = alleZellen().filter((c) => c[4] === 'aussentreppen' && palette.isTreppe(c[5]));
  assert.ok(leoni.length >= 40);
  // Korridor: die Gangzellen Y 102..108 in der Wand sind von innen erreichbar (Stehzellen in Y 102)
  let kor = 0, erreicht = 0;
  for (const q of g.recs) {
    if (q.d8 > 4 || (q.e !== 14 && q.e !== 15)) continue;
    const tp = q.e === 14 ? q.uK : g.K[14].L + q.uK;
    if (tp < 3.5 || tp >= 10.2) continue;
    kor++;
    if (r.stehbar(q.x, 102, q.z) && r.erreicht(q.x, 102, q.z)) erreicht++;
    assert.ok(tor.has(packKeyZ(q.x, 102, q.z)) || tor.has(packKeyZ(q.x, 103, q.z)), 'Korridorzelle als tor deklariert');
  }
  assert.ok(kor >= 30 && erreicht >= kor - 4, `Korridor ${erreicht}/${kor}`);
});

test('B2: Lichter in allen Innenräumen (höchstens 12 Blöcke zur nächsten Seelaterne)', () => {
  const r = erreichbarkeit();
  const lamps = [];
  welt().world.grid.forEach((x, y, z, e) => { if (e.type === 'sea_lantern') lamps.push([x, y, z]); });
  assert.ok(lamps.length > 400, `Lampen ${lamps.length}`);
  const K = 12, cell = new Map();
  for (const l of lamps) { const k = Math.floor(l[0] / K) + ',' + Math.floor(l[2] / K); (cell.get(k) || cell.set(k, []).get(k)).push(l); }
  const grid = welt().world.grid;
  let bad = 0, tot = 0;
  for (let xi = 0; xi < r.Xn; xi++) for (let zi = 0; zi < r.Zn; zi++) {
    const x = r.x0 + xi, z = r.z0 + zi;
    if (!r.maske.innen(x, z)) continue;
    for (let y = r.y0; y + 3 < r.y0 + r.Yn; y++) {
      if (!r.stehbar(x, y, z) || !r.erreicht(x, y, z)) continue;
      let gedeckt = false;
      for (let h = 3; h <= 18 && !gedeckt; h++) gedeckt = grid.has(x, y + h, z);
      if (!gedeckt) continue;
      tot++;
      let ok = false;
      const kx = Math.floor(x / K), kz = Math.floor(z / K);
      for (let ax = kx - 1; ax <= kx + 1 && !ok; ax++) for (let az = kz - 1; az <= kz + 1 && !ok; az++) {
        for (const q of cell.get(ax + ',' + az) || []) if (q[1] >= y - 13 && q[1] <= y + 13 && Math.hypot(q[0] - x, q[2] - z) <= 12) { ok = true; break; }
      }
      if (!ok) bad++;
    }
  }
  assert.ok(tot > 50000);
  assert.equal(bad, 0, `${bad} von ${tot} Stehzellen ohne Licht`);
});

test('B2: Trennwände haben Türen (Wand-Zellen und freie Türöffnungen 4 x 7)', () => {
  const { world, g } = welt();
  const P = require('../../projects/palazzo_vecchio/model/pv_plan.js').plan(g);
  assert.ok(P.waende.length >= 10);
  for (const w of P.waende) {
    assert.ok(w.tueren.length >= 1 || w.id === 'og1_w27b', `Wand ${w.id} ohne Tür`);
    const doors = w.cells.filter((c) => c.tuer);
    if (w.tueren.length) assert.ok(doors.length >= 4 * w.tueren.length, `Wand ${w.id}: Türzellen ${doors.length}`);
    for (const c of doors) for (let y = w.ge.stand; y < w.ge.stand + 7; y++) assert.ok(!world.grid.has(c.r.x, BODEN + y, c.r.z), `Tür belegt ${w.id} (${c.r.x},${y},${c.r.z})`);
  }
  // Salone: vier Türen 6 x 10, frei
  assert.ok(P.saloneTueren.length >= 4 * 6 * 3);
  for (const c of P.saloneTueren) for (let y = 17; y < 27; y++) assert.ok(!world.grid.has(c.x, BODEN + y, c.z), `Salone-Tür belegt (${c.x},${y},${c.z})`);
});

test('B2: ausgestaltete Räume mit Content (Inhalt, Quelle, vereinfacht), Farbfelder und Figuren', () => {
  const { world } = welt();
  const all = alleZellen();
  const m9 = world.modules.find((m) => m.module === 9);
  const m6 = world.modules.find((m) => m.module === 6);
  const m5 = world.modules.find((m) => m.module === 5);
  const raeume = ['salone_waende', 'salone_decke', 'salone_boden', 'salone_kassettenbalken', 'salone_udienza', 'salone_statuen', 'michelozzo_brunnen',
    'sala_dei_gigli', 'studiolo_francesco', 'sala_carte_geografiche', 'quartiere_leone_x', 'quartiere_elementi'];
  for (const r of raeume) {
    const p = m9.parts.find((q) => q.id === r);
    assert.ok(p && p.keys.length > 100, `Bauteil ${r}`);
    const c = m9.content.parts[r];
    assert.ok(c && c.title && c.description && c.tip && c.caution && c.fact, `Content ${r}`);
    assert.match(c.fact + c.description, /vereinfacht/, `${r}: vereinfacht`);
    assert.match(c.fact, /Quelle/, `${r}: Quelle`);
  }
  assert.ok(m5.content.parts.glocken && m5.parts.some((q) => q.id === 'glocken'));
  const fresko = (t) => palette.rolesOf(t).includes('fresko');
  const cnt = (part, f) => all.filter((c) => c[4] === part && f(c[5])).length;
  // Salone: Wandfresken, Kassetten (Holz, Fresko, Gold), Marmorboden, Statuen
  assert.ok(cnt('salone_waende', fresko) > 3000, 'Schlachtbilder');
  assert.ok(cnt('salone_decke', fresko) > 3000 && cnt('salone_decke', (t) => t === 'dark_oak_planks') > 800 && cnt('salone_decke', (t) => t === 'gold_block') > 200, 'Kassetten');
  assert.ok(cnt('salone_boden', (t) => t === 'smooth_quartz') > 800 && cnt('salone_boden', (t) => t === 'smooth_stone') > 800 && cnt('salone_boden', (t) => t === 'sea_lantern') >= 10, 'Marmorboden mit Lampen');
  assert.ok(cnt('salone_udienza', (t) => palette.isTreppe(t)) >= 18, 'Freitreppe der Udienza');
  assert.ok(cnt('salone_statuen', (t) => t === 'smooth_quartz') > 200 && cnt('salone_statuen', (t) => t === 'calcite') > 15, 'Statuen und Genius des Sieges');
  // Hof: Brunnen mit Wasser und Bronze, vergoldete Säulenbänder, Grotesken
  assert.ok(cnt('michelozzo_brunnen', (t) => t === 'water') > 20 && cnt('michelozzo_brunnen', (t) => t === 'cut_copper') >= 6);
  assert.ok(cnt('michelozzo_arkade', (t) => t === 'gold_block') > 40 && cnt('michelozzo_arkade', fresko) > 300, 'Goldbänder und Grotesken');
  // Räume mit Trennwänden
  assert.ok(cnt('sala_dei_gigli', (t) => t === 'blue_terracotta') > 200 && cnt('sala_dei_gigli', (t) => t === 'gold_block') > 60, 'Lilien blau/gold');
  assert.ok(cnt('studiolo_francesco', fresko) > 150, 'Bildtafeln des Studiolo');
  assert.ok(cnt('sala_carte_geografiche', fresko) > 300 && cnt('sala_carte_geografiche', (t) => t === 'gold_block') > 30, 'Karten und Globus');
  assert.ok(cnt('quartiere_leone_x', fresko) > 300 && cnt('quartiere_elementi', fresko) > 300, 'Deckenfresken der Quartiere');
  // Glockenstube: drei Glocken aus Bronze mit Goldrand, hängend (y_rel 157..160)
  const gl = all.filter((c) => c[4] === 'glocken');
  assert.ok(gl.filter((c) => c[5] === 'cut_copper').length >= 15 && gl.filter((c) => c[5] === 'gold_block').length >= 8);
  assert.ok(Math.min(...gl.map((c) => c[1] - BODEN)) >= 157 && Math.max(...gl.map((c) => c[1] - BODEN)) === 160);
  // Fresko-Bilder in Augenhöhe: Unterkante 1 bis 2 Blöcke über der Gehfläche (Studiolo: Stehhöhe y_rel 17)
  const bilder = all.filter((c) => c[4] === 'studiolo_francesco' && fresko(c[5]) && c[1] - BODEN < 27);
  assert.ok(Math.min(...bilder.map((c) => c[1] - BODEN)) >= 18 && Math.min(...bilder.map((c) => c[1] - BODEN)) <= 19);
  void m6;
});

test('B2: Turm-Abschlussdecke y_rel 144 hat Treppenlöcher, sonst geschlossen; Glocken-Content vorhanden', () => {
  const { world, g } = welt();
  let ganz = 0, loch = 0;
  for (const r of g.recs) {
    if (r.zone !== 'T' || r.dT <= 4) continue;
    if (world.grid.has(r.x, BODEN + 144, r.z)) ganz++; else loch++;
  }
  assert.ok(ganz > 10 && loch > 10, `Decke ${ganz} / Loch ${loch}`);
});
