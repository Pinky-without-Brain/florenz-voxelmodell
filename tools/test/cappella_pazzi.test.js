'use strict';
// W6b: Cappella de' Pazzi und Kreuzgänge von Santa Croce (projects/cappella_pazzi): Konvent über palazzo.js (Secondo Chiostro, Cenacolo, Museumssäle),
// Kapelle mit eigenem Plan (_kap.js: Portikus, Würfelraum mit Pendentifs, Schirmkuppel, Scarsella), Begehbarkeit, Dichtheit, Nachbarprojekt santa_croce.
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const ROOT = path.resolve(__dirname, '..', '..');
const { getProject, loadSpecs } = require('../projects.js');
const { buildWorld } = require('../model/world.js');
const { laufe } = require('../validate/begehbarkeit_projekt.js');
const WZ = require('../wahrzeichen');
const KAP = require('../../projects/cappella_pazzi/model/_kap.js');
const RAUM = require('../../projects/cappella_pazzi/model/_raeume.js');

const project = getProject('cappella_pazzi', { root: ROOT });
const world = buildWorld({ project });
const grid = world.grid;
const ctx = { project, world, grid, ground: loadSpecs(project).ground, root: ROOT };
const R = WZ.makeRahmen(project.json.rahmen);
const BODEN_Y = 61;

/** Stehzelle auf Lage yr0 (Boden darunter, drei Luft darüber) nahe einer lokalen Position (nächste zuerst). */
function steh(u, w, yr0, rad = 2) {
  const offs = [];
  for (let du = -rad; du <= rad; du += 0.5) for (let dw = -rad; dw <= rad; dw += 0.5) offs.push([du, dw]);
  offs.sort((a, b) => Math.hypot(...a) - Math.hypot(...b));
  const y = BODEN_Y + yr0;
  for (const [du, dw] of offs) {
    const p = R.toWorld(u + du, w + dw), x = Math.round(p.x), z = Math.round(p.z);
    if (grid.has(x, y - 1, z) && !grid.has(x, y, z) && !grid.has(x, y + 1, z) && !grid.has(x, y + 2, z)) return { x, y, z };
  }
  return null;
}

test('Cappella Pazzi: Projektfelder, Masken und Fehlerfreiheit', () => {
  assert.equal(project.json.type, 'wahrzeichen');
  assert.equal(project.json.bodenY, 61);
  assert.equal(project.json.begehbarkeit, 'pflicht');
  assert.deepEqual(world.errors, []);
  const M = WZ.ladeMasken(project.json, { dir: path.join(ROOT, 'projects', 'cappella_pazzi') });
  assert.equal(M.haupt.loecher().length, 2);
  assert.ok(M.haupt.size > 26100 && M.haupt.size < 26260, String(M.haupt.size));             // Konvent r10782536
  assert.ok(M.masken.kapelle.size > 1600 && M.masken.kapelle.size < 1650, String(M.masken.kapelle.size));   // Kapelle w307539790
  assert.equal([...M.masken.kapelle.cells].filter(([x, z]) => M.haupt.has(x, z)).length, 0);  // Masken überlappen nicht
  assert.deepEqual(project.json.masken.kapelle.gebaeude, ['w307539790']);
});

test('Cappella Pazzi: Bauteile von Konvent und Kapelle, Kuppel als höchster Punkt, Saal mit Pendentifs', () => {
  const n = {};
  grid.forEach((x, y, z, e) => { n[e.part] = (n[e.part] || 0) + 1; });
  for (const p of RAUM.TEILE.concat(['treppe', 'hofarkaden', 'trennwaende', 'portikus_saeulen', 'portikus_gebaelk', 'kap_aussenwaende', 'kap_pendentifs', 'kap_tambour', 'kap_kuppel', 'kap_laterne',
    'portikus_decke', 'scarsella_gewoelbe', 'kap_pilaster', 'kap_apostel', 'kap_evangelisten', 'portikus_tondo', 'kap_altar', 'kap_bank'])) assert.ok(n[p] > 0, p);
  let hoechst = 0, hx = 0, hz = 0;
  grid.forEach((x, y, z) => { if (y > hoechst) { hoechst = y; hx = x; hz = z; } });
  assert.equal(hoechst, KAP.Y(KAP.LAT.kappe[3]));                    // die Laternenspitze ist der höchste Punkt
  const l = R.toLocal(hx, hz);
  assert.ok(Math.hypot(l.u - KAP.CU, l.w - KAP.CW) < 1.5);
  // sechs Säulen im Portikus: Schäfte (marmor_saeule) in sechs getrennten w-Gruppen
  const ws = new Set();
  grid.forEach((x, y, z, e) => { if (e.part === 'portikus_saeulen' && y === KAP.Y(6)) { const q = R.toLocal(x, z); ws.add(Math.round(q.w / 3)); } });
  assert.ok(ws.size >= 6);
});

test('Cappella Pazzi: Portale und Portikus als Öffnungen deklariert', () => {
  const arten = {};
  for (const o of world.oeffnungen) arten[o.art + '|' + o.part] = (arten[o.art + '|' + o.part] || 0) + o.keys.length;
  assert.ok(arten['tor|aussenwand'] >= 5 * 6 * 6, JSON.stringify(arten));
  assert.ok(arten['arkade|portikus_saeulen'] > 5 * 13 * 2, JSON.stringify(arten));
  assert.ok(arten['arkade|hofarkaden'] > 0);
});

test('Cappella Pazzi: alle Räume erreichbar, R13 und R14 ohne Befund', () => {
  const r = laufe(ctx, 'r13').einheiten[0];
  assert.equal(r.komponenten.filter((k) => !k.unzugaenglich).length, 0);
  const punkte = [['Cenacolo Nord', 2.5, 62, 1], ['Cenacolo Süd', 2.5, 92, 1], ['Halle A (Orcagna)', 5, 115, 1], ['Halle B (Vasari)', 36, 115, 1], ['Halle C mit Treppe', 62, 128, 1],
    ['Westflügel', 66, 200, 1], ['Loggia Secondo Chiostro', 74, 207, 1], ['Hof Secondo Chiostro', 100, 200, 1], ['Südtrakt', 110, 150, 1], ['Osttrakt', 150, 115, 1], ['Hof im Ostflügel', 245, 120, 1],
    ['Obergeschoss Halle C', 62, 128, 11], ['Obergeschoss Westflügel', 66, 200, 11],
    ['Portikus', 143, 70, 1], ['Portikus Mitte', 143, 80, 1], ['Saal Mitte', 161, 80, 1], ['Flügel Nord', 156, 66, 1], ['Flügel Süd', 156, 94, 1], ['Scarsella', 180, 81, 1]];
  for (const [name, u, w, yr] of punkte) {
    const s = steh(u, w, yr, 3);
    assert.ok(s, `keine Stehzelle: ${name}`);
    assert.ok(r.erreicht(s.x, s.y, s.z), `nicht erreichbar: ${name}`);
  }
  assert.equal(laufe(ctx, 'r14').einheiten[0].cluster.length, 0);
});

test('Cappella Pazzi: Licht im Saal, Portikus und Konvent höchstens 12 Blöcke von jeder Stehzelle', () => {
  const lichter = [];
  grid.forEach((x, y, z, e) => { if (e.part === 'kap_licht') lichter.push([x, z]); });
  assert.ok(lichter.length >= 6);
  const L = KAP.lade();
  let weit = 0;
  for (const c of L.cells) {
    if (c.zone !== 'saal' && c.zone !== 'portico' && c.zone !== 'sc') continue;
    if (!grid.has(c.x, BODEN_Y, c.z) || grid.has(c.x, BODEN_Y + 1, c.z) || grid.has(c.x, BODEN_Y + 2, c.z) || grid.has(c.x, BODEN_Y + 3, c.z)) continue;
    let d = Infinity;
    for (const [x, z] of lichter) d = Math.min(d, Math.hypot(x - c.x, z - c.z));
    if (d > 12.5) weit++;
  }
  assert.equal(weit, 0);
});

test('Cappella Pazzi: keine gemeinsame Zelle mit der Basilika santa_croce, Content mit Quelle und Vereinfachung', () => {
  const sc = getProject('santa_croce', { root: ROOT });
  const M = WZ.ladeMasken(project.json, { dir: path.join(ROOT, 'projects', 'cappella_pazzi') });
  const S = WZ.ladeMasken(sc.json, { dir: path.join(ROOT, 'projects', 'santa_croce') });
  assert.equal([...M.alle.cells].filter(([x, z]) => S.alle.has(x, z)).length, 0);
  for (const n of [6, 9]) {
    const j = JSON.parse(fs.readFileSync(path.join(ROOT, 'projects', 'cappella_pazzi', 'content', `modul_${n}.json`), 'utf8'));
    for (const [id, t] of Object.entries(j.parts)) {
      if (id.startsWith('licht') || id === 'kap_licht') continue;
      assert.ok(/ereinfacht/.test(t.caution + t.fact + t.description), `${n}/${id}: Hinweis „vereinfacht“`);
      assert.ok(t.fact.length > 20 && t.description.length > 40, `${n}/${id}`);
    }
  }
  const j6 = JSON.parse(fs.readFileSync(path.join(ROOT, 'projects', 'cappella_pazzi', 'content', 'modul_6.json'), 'utf8'));
  for (const id of RAUM.TEILE) assert.ok(j6.parts[id], id);
  assert.ok(!new RegExp(String.fromCharCode(76, 101, 103, 111), "i").test(JSON.stringify(j6)));
});

// ---------------------------------------------------------------- Primo Chiostro (W7c)
const PC = require('../../projects/cappella_pazzi/model/_pc.js');

test('Primo Chiostro: Zusatzmaske aus Rechtecken ohne Überlappung mit Konvent, Kapelle und Basilika', () => {
  const M = WZ.ladeMasken(project.json, { dir: path.join(ROOT, 'projects', 'cappella_pazzi') });
  const pc = M.masken.primo_chiostro;
  assert.ok(pc && pc.size > 6400 && pc.size < 6700, String(pc && pc.size));
  assert.equal(project.json.masken.primo_chiostro.rechtecke.length, 3);
  assert.equal(project.json.masken.primo_chiostro.gelaendeBis, 'boden');
  assert.equal([...pc.cells].filter(([x, z]) => M.haupt.has(x, z) || M.masken.kapelle.has(x, z)).length, 0);
  const S = WZ.ladeMasken(getProject('santa_croce', { root: ROOT }).json, { dir: path.join(ROOT, 'projects', 'santa_croce') });
  assert.equal([...pc.cells].filter(([x, z]) => S.alle.has(x, z)).length, 0);
});

test('Primo Chiostro: Bauteile, Pfeiler, Bögen als Arkade deklariert, zehn Zypressen, zwei Statuen', () => {
  const n = {};
  grid.forEach((x, y, z, e) => { n[e.part] = (n[e.part] || 0) + 1; });
  for (const p of ['chiostro_boden', 'chiostro_pfeiler', 'chiostro_bogen', 'chiostro_dach', 'chiostro_grabplatten', 'chiostro_zypressen', 'chiostro_statuen', 'chiostro_licht']) assert.ok(n[p] > 0, p);
  assert.ok(n.chiostro_boden > 5000, String(n.chiostro_boden));
  const ark = world.oeffnungen.filter((o) => o.art === 'arkade' && o.part === 'chiostro_bogen').reduce((s, o) => s + o.keys.length, 0);
  assert.ok(ark > 3000, `Arkade ${ark}`);
  let kap = 0, bronze = 0, dach = 0;
  grid.forEach((x, y, z, e) => {
    if (e.part === 'chiostro_pfeiler' && y === PC.Y(5)) kap++;
    if (e.part === 'chiostro_statuen' && e.type === 'cut_copper') bronze++;
    if (e.part === 'chiostro_dach') { dach++; assert.equal(y, PC.Y(PC.DACH)); }
  });
  assert.ok(kap > 40, `Kapitelle ${kap}`);
  assert.ok(bronze > 0);
  assert.ok(dach > 1500, `Dach ${dach}`);
  assert.equal(PC.ZYPRESSEN.length, 10);
  assert.equal(PC.STATUEN.length, 2);
});

test('Primo Chiostro: Gänge, Garten und Lobus erreichbar; Licht im Gang höchstens 12 Blöcke', () => {
  const r = laufe(ctx, 'r13').einheiten[0];
  for (const [name, u, w] of [['Nordgang', 60, 60.5], ['Garten Westarm', 40, 78], ['Südgang Arm', 40, 95], ['Westgang', 15, 78], ['Lobus Garten', 110, 112], ['Lobus Südgang', 110, 125.5], ['Lobus Ostgang', 136, 112]]) {
    const s = steh(u, w, 1, 2);
    assert.ok(s, `keine Stehzelle: ${name}`);
    assert.ok(r.erreicht(s.x, s.y, s.z), `nicht erreichbar: ${name}`);
  }
  const lichter = [];
  grid.forEach((x, y, z, e) => { if (e.part === 'chiostro_licht') lichter.push([x, z]); });
  assert.ok(lichter.length >= 20, String(lichter.length));
  for (const c of PC.lade().alle) {
    if (!c.gang || !grid.has(c.x, BODEN_Y, c.z) || grid.has(c.x, BODEN_Y + 1, c.z) || grid.has(c.x, BODEN_Y + 2, c.z) || grid.has(c.x, BODEN_Y + 3, c.z)) continue;
    assert.ok(lichter.some(([x, z]) => Math.hypot(x - c.x, z - c.z) <= 12.5), `Gang ohne Licht bei ${c.x},${c.z}`);
  }
});
