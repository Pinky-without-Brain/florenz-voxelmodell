'use strict';
// V3 W4: Wahrzeichen Uffizien mit Corridoio Vasariano (projects/uffizi). Prüfliste aus BAUTEIL_KATALOG §13.
// Der Test baut das Projekt einmal im Speicher (kein Emit) und prüft die Geometrie am Grid.
const test = require('node:test');
const assert = require('node:assert/strict');
const path = require('node:path');

const ROOT = path.resolve(__dirname, '..', '..');
const { getProject } = require('../projects.js');
const { buildWorld } = require('../model/world.js');
const WZ = require('../wahrzeichen');

const project = getProject('uffizi', { root: ROOT });
const world = buildWorld({ project });
const grid = world.grid;
const masks = WZ.ladeMasken(project.json, { dir: project.dir, root: ROOT });
const M_UF = masks.haupt;
const M_COR = masks.masken.korridor;
const BODEN = 65;

// Zellen eines Bauteils (Modul/Bauteil) als Liste [x, y, z]
const partCells = (module, part) => {
  const out = [];
  grid.forEach((x, y, z, e) => { if (e.module === module && e.part === part) out.push([x, y, z]); });
  return out;
};
const all = [];
grid.forEach((x, y, z, e) => all.push([x, y, z, e.module, e.part, e.type]));
const kanten = M_UF.kanten();

test('Uffizien: Projektfelder und Maskengrößen', () => {
  assert.equal(project.type, 'wahrzeichen');
  assert.equal(project.json.bodenY, BODEN);
  assert.equal(M_UF.size, 36275);
  assert.equal(M_COR.size, 2943);
  assert.deepEqual(world.errors, []);
  assert.deepEqual(world.modules.map((m) => m.module), [0, 1, 2, 3, 4, 5, 6, 7, 8, 9]);
});

test('Uffizien: Traufe Lage 51 = Y 116, kein Bauteil der Module 1-5 darüber', () => {
  const ks = partCells(3, 'kranzgesims');
  assert.ok(ks.length > 3000);
  assert.equal(Math.max(...ks.map((c) => c[1])), BODEN + 51);
  assert.equal(BODEN + 51, 116);
  for (const [, y, , m] of all) if (m >= 1 && m <= 5) assert.ok(y <= 116, `Y ${y} in Modul ${m}`);
});

test('Uffizien: Piano-nobile-Decke liegt mit Oberkante Y 101', () => {
  const decke = [...partCells(7, 'decke_36'), ...partCells(3, 'loggia_boden')];
  assert.ok(decke.length > 20000);
  for (const c of decke) assert.equal(c[1], 101);
  // Lage 36 ist an allen Stellen des Gangs im Ostflügel (Galerieboden t 4..10) voll
  assert.ok(partCells(3, 'loggia_boden').length > 5000);
});

test('Uffizien: Korridorgang Y 102..108 ist frei (Brücke und Öffnung in Kante 41)', () => {
  // Brücke: Gang 7 breit zwischen den Wänden; Rahmen wie im Modul
  const P0 = { x: -97, z: 906.5 };
  const dl = Math.hypot(-6, 15);
  const ds = { x: -6 / dl, z: 15 / dl };
  const dn = { x: ds.z, z: -ds.x };
  let gang = 0, wand = 0;
  for (const [x, z] of M_COR.cells) {
    if (x > -84 || x < -104 || z > 930) continue;   // nur die Brücke (225 Zellen), nicht die Haarlinien
    const v = (x - P0.x) * dn.x + (z - P0.z) * dn.z;
    if (v >= 3.35 && v < 10.35) {
      gang++;
      for (let y = 102; y <= 108; y++) assert.ok(!grid.has(x, y, z), `Gang belegt bei (${x},${y},${z})`);
      assert.ok(grid.has(x, 101, z), 'Boden Oberkante Y 101');
      assert.ok(grid.has(x, 109, z), 'Decke ab Y 109');
    } else if (v < 3.35 || v >= 10.35) {
      wand++;
      assert.ok(grid.has(x, 103, z), `Wand fehlt bei (${x},${z})`);
    }
  }
  assert.ok(gang >= 90, `Gangzellen ${gang}`);
  assert.ok(wand >= 60, `Wandzellen ${wand}`);
  // Gegenöffnung in Kante 41: 7 breit, Y 102..108 frei, Wand darunter und darüber
  const e41 = kanten[41];
  let offen = 0, bandZellen = 0;
  for (const [x, z] of M_UF.cells) {
    if (M_UF.naechsteKante(x, z) !== 41 || M_UF.d8(x, z) > 4) continue;
    bandZellen++;
    const s = e41.rahmen.toLocal(x, z).u;
    if (s >= 3.35 && s < 10.35) {
      offen++;
      for (let y = 102; y <= 108; y++) assert.ok(!grid.has(x, y, z), `Öffnung belegt bei (${x},${y},${z})`);
      assert.ok(grid.has(x, 101, z) && grid.has(x, 109, z));
    }
  }
  assert.ok(bandZellen > 30);
  assert.ok(offen >= 20, `Öffnungszellen ${offen}`);
  assert.ok(Math.abs(e41.L - 13.7) < 0.1);
});

test('Uffizien: 22 Pfeiler mit Nische (Statuen) und die Serliana mit 28 Spalten', () => {
  const st = partCells(9, 'statuen');
  const koepfe = st.filter((c) => c[1] === BODEN + 8);
  assert.equal(koepfe.length, 22);
  assert.equal(st.length, 22 * 9);
  // Nische: 3 breit, 7 hoch (Lage 4..10) leer bzw. mit der Figur belegt; Pfeiler darunter voll
  for (const [x, , z] of koepfe) {
    assert.ok(grid.has(x, BODEN + 3, z), 'Pfeiler unter der Nische');
    assert.ok(!grid.has(x, BODEN + 9, z) && !grid.has(x, BODEN + 10, z), 'Nische oben frei');
  }
  const ser = partCells(4, 'serliana');
  assert.ok(ser.length > 500);
  // 28 Spalten im Rahmen UF (u 0..27)
  const us = new Set();
  const R = masks.rahmen;
  for (const [x, , z] of ser) us.add(Math.floor(R.toLocal(x, z).u));
  for (let u = 0; u <= 27; u++) assert.ok(us.has(u), `Spalte u=${u} fehlt`);
  // Mittelbogen: Rundbogen Spannweite 12, Kämpfer Lage 12, Scheitel Lage 18; Öffnung frei, Fries Lage 19..20 voll
  let offenMitte = 0;
  for (const [x, z] of M_UF.cells) {
    const l = R.toLocal(x, z);
    if (l.w < 276 || l.w > 278.4 || l.u < 13.5 || l.u >= 14.5) continue;
    for (let L = 1; L <= 17; L++) if (!grid.has(x, BODEN + L, z)) offenMitte++;
    assert.ok(grid.has(x, BODEN + 19, z) && grid.has(x, BODEN + 20, z), 'Fries über dem Bogen');
  }
  assert.ok(offenMitte >= 17, `offene Zellen in der Bogenmitte: ${offenMitte}`);
});

test('Uffizien: Lungarno Boden Oberkante Y 78, Dach Y 87, Querschnitt am Schnitt x = -528', () => {
  const boden = partCells(8, 'lungarno_boden');
  assert.ok(boden.length > 5000);
  assert.equal(Math.min(...boden.map((c) => c[1])), 77);
  assert.equal(Math.max(...boden.map((c) => c[1])), 78);
  const kor = partCells(8, 'lungarno_korridor');
  assert.equal(Math.min(...kor.map((c) => c[1])), 79);
  assert.equal(Math.max(...kor.map((c) => c[1])), 87);
  // Querschnitt bei x = -528: Platte 77..78, Gang 79..85 frei zwischen Wänden, Decke 86..87, keine Stirnwand bei x = -529
  const zs = [];
  for (const [x, z] of M_COR.cells) if (x === -528) zs.push(z);
  assert.ok(zs.length >= 10);
  let wandSeiten = 0, gangFrei = 0;
  for (const z of zs) {
    assert.ok(grid.has(-528, 77, z) && grid.has(-528, 78, z) && grid.has(-528, 86, z) && grid.has(-528, 87, z));
    if (grid.has(-528, 82, z)) wandSeiten++; else gangFrei++;
    assert.ok(!grid.has(-529, 82, z));
  }
  assert.ok(gangFrei >= 3 && wandSeiten >= 6, `Gang ${gangFrei}, Wand ${wandSeiten}`);
});

test('Uffizien: keine Zelle westlich von x = -528', () => {
  let min = Infinity;
  for (const [x] of all) if (x < min) min = x;
  assert.ok(min >= -528, `kleinstes x = ${min}`);
});

test('Uffizien: Module 0-7 und 9 nur in M_UF (plus Kranzgesims-Luftraum), Modul 8 nur in M_COR', () => {
  let ausserhalb = 0, luft = 0, kor = 0, falsch = [];
  for (const [x, y, z, m, part] of all) {
    if (m === 8) {
      kor++;
      if (!M_COR.has(x, z)) falsch.push(`M8 (${x},${y},${z}) ${part}`);
    } else if (M_UF.has(x, z)) {
      // innerhalb der Maske
    } else {
      ausserhalb++;
      // Luftraum: nur das Kranzgesims, eine Zelle über den Platz
      if (part === 'kranzgesims' && y >= BODEN + 50 && M_UF.dAussen(x, z) === 1) luft++;
      else falsch.push(`M${m} (${x},${y},${z}) ${part}`);
    }
  }
  assert.deepEqual(falsch.slice(0, 5), []);
  assert.ok(luft > 300, `Luftraum-Zellen ${luft}`);
  assert.equal(ausserhalb, luft);
  assert.ok(kor > 30000);
});

test('Uffizien: Blockzahlen je Modul im Rahmen der Geometrie des Katalogs', () => {
  const n = {};
  for (const [, , , m] of all) n[m] = (n[m] || 0) + 1;
  const sum = Object.values(n).reduce((a, b) => a + b, 0);
  assert.ok(sum > 590000 * 0.7 && sum < 590000 * 1.3, `gesamt ${sum}`);
  assert.ok(Math.abs(n[0] - 46000) < 46000 * 0.3, `M0 ${n[0]}`);
  assert.ok(Math.abs(n[1] - 55000) < 55000 * 0.3, `M1 ${n[1]}`);
  assert.ok(Math.abs(n[6] - 83000) < 83000 * 0.3, `M6 ${n[6]}`);
  assert.ok(Math.abs(n[7] - 166000) < 166000 * 0.3, `M7 ${n[7]}`);
  assert.ok(Math.abs(n[8] - 35000) < 35000 * 0.3, `M8 ${n[8]}`);
});

test('Uffizien: Hallenaufbau der Piazzale-Fassade (Gebälk, Mezzanin, Giebel, Dachloggia)', () => {
  // Gebälk Lage 13..14 und Kranzgesims Lage 50..51 sind aus Pietra serena
  const types = new Map();
  for (const [x, y, z, m, part, t] of all) {
    if (part === 'portikus_gebaelk' || part === 'kranzgesims') types.set(part + y, t);
    void x; void z; void m;
  }
  assert.ok(types.get('portikus_gebaelk' + (BODEN + 13)));
  assert.ok(types.get('kranzgesims' + (BODEN + 50)) && types.get('kranzgesims' + (BODEN + 51)));
  // 11 Joche je Flügel: 33 Fenster je Flügel im Mezzanin, ebenso im Piano nobile (Glas pro Fenster mehrfach)
  const glas = partCells(2, 'mezzanin_wand').filter((c) => c[1] === BODEN + 17);
  assert.ok(glas.length >= 66 * 3 * 0.7, `Mezzaninfenster-Zellen ${glas.length}`);
  // Statuenfüße stehen auf dem Nischenboden (Lage 4)
  const fuss = partCells(9, 'statuen').filter((c) => c[1] === BODEN + 4);
  assert.equal(fuss.length, 22 * 2);
});

test('Uffizien: Content in allen Modulen vorhanden, Statuen mit Hinweis', () => {
  for (const m of world.modules) {
    assert.ok(m.content, `Modul ${m.module} ohne Content`);
    for (const p of m.parts) assert.ok(m.content.parts[p.id], `Modul ${m.module}: Content für ${p.id}`);
  }
  const s = world.modules.find((m) => m.module === 9).content.parts.statuen;
  assert.match(s.title + s.description, /vereinfachte Blockfigur, nicht nach Vorbild/);
});
