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
  // fast alle Zellen liegen auf Y 101; wenige Stützen (Säulen bis zur Traufdecke des Nebenbaus) stehen darüber
  assert.ok(decke.filter((c) => c[1] === 101).length > decke.length * 0.98);
  for (const c of decke) assert.ok(c[1] >= 101);
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
  assert.ok(sum > 590000 * 0.7 && sum < 800000 * 1.3, `gesamt ${sum}`);
  assert.ok(Math.abs(n[0] - 46000) < 46000 * 0.3, `M0 ${n[0]}`);
  assert.ok(Math.abs(n[1] - 55000) < 55000 * 0.3, `M1 ${n[1]}`);
  assert.ok(Math.abs(n[6] - 83000) < 83000 * 0.3, `M6 ${n[6]}`);
  assert.ok(n[7] > 120000 && n[7] < 260000, `M7 ${n[7]}`);
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

// ---------------------------------------------------------------- B1: dicht, begehbar, ausgestaltet
const B = require('../validate/begehbarkeit.js');
const palette = require('../spec/palette.js');
const { xOfKey, yOfKey, zOfKey } = require('../geom/grid.js');
const { loadSpecs } = require('../projects.js');

function erreichbarkeit() {
  const specs = loadSpecs(project);
  const maske = WZ.ladeMasken(project.json, { dir: project.dir, root: ROOT }).alle;
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
  return { vis, idx, maske, x0, z0, Xn, Zn, Yn, y0, stehbar: (x, y, z) => B.stehbar(R, idx(x, y, z), y - y0), erreicht: (x, y, z) => vis[idx(x, y, z)] === 1 };
}
const reach = erreichbarkeit();

test('Uffizien B1: keine Diagonalrisse (Schichten flächenverbunden)', () => {
  let risse = 0;
  grid.forEach((x, y, z) => {
    for (const dz of [1, -1]) {
      if (grid.has(x + 1, y, z + dz) && !grid.has(x + 1, y, z) && !grid.has(x, y, z + dz)) risse++;
    }
  });
  assert.equal(risse, 0);
});

test('Uffizien B1: R13 und R14 ohne Fehler und Lücken, Pflichtmodus gesetzt', () => {
  assert.equal(project.json.begehbarkeit, 'pflicht');
  const { analysiere } = require('../diag/begehbarkeit_bestand.js');
  const a = analysiere(project);
  assert.equal(a.r14.luecken, 0);
  assert.equal(a.r13.nichtErreichbareKomponenten, 0);
  assert.equal(Object.keys(a.risse).length, 0);
  assert.ok(world.oeffnungen.length > 0 && world.unzugaenglich.length > 0);
  for (const u of world.unzugaenglich) assert.ok(u.begruendung.length > 20);
});

test('Uffizien B1: echte Treppenblöcke in Wendeltreppen, Scalone und Corridoio-Treppe', () => {
  for (const part of ['treppen', 'scalone_treppe', 'korridor_treppe']) {
    const t = all.filter((c) => c[4] === part && palette.isTreppe(c[5]));
    assert.ok(t.length >= 20, `${part}: ${t.length} Treppenblöcke`);
  }
  assert.ok(all.filter((c) => c[4] === 'scalone_treppe' && palette.isTreppe(c[5])).length >= 36 * 5);
  assert.ok(all.filter((c) => c[4] === 'korridor_treppe' && palette.isTreppe(c[5])).length >= 23 * 6);
});

test('Uffizien B1: jedes Geschoss ist von außen erreichbar (EG, Mezzanin, Piano nobile, Galerie)', () => {
  const n = { 66: 0, 80: 0, 86: 0, 102: 0 };
  for (let xi = 0; xi < reach.Xn; xi++) for (let zi = 0; zi < reach.Zn; zi++) {
    const x = reach.x0 + xi, z = reach.z0 + zi;
    if (!M_UF.has(x, z)) continue;
    for (const y of [66, 80, 86, 102]) if (reach.stehbar(x, y, z) && reach.erreicht(x, y, z)) n[y]++;
  }
  for (const y of [66, 80, 86, 102]) assert.ok(n[y] > 15000, `Y ${y}: ${n[y]} erreichbare Stehzellen`);
});

test('Uffizien B1: Corridoio begehbar von der Galerie über Brücke und Treppe bis x = -528', () => {
  let bruecke = 0;
  for (const [x, z] of M_COR.cells) if (x >= -104 && x <= -84 && z <= 930 && reach.stehbar(x, 102, z) && reach.erreicht(x, 102, z)) bruecke++;
  assert.ok(bruecke >= 60, `Brückengang ${bruecke}`);
  let schnitt = 0;
  for (const [x, z] of M_COR.cells) if (x === -528 && reach.stehbar(x, 79, z) && reach.erreicht(x, 79, z)) schnitt++;
  assert.ok(schnitt >= 3, `Gang am Schnitt ${schnitt}`);
  const kt = all.filter((c) => c[4] === 'korridor_treppe');
  assert.equal(Math.min(...kt.map((c) => c[1])), 66);
  assert.ok(kt.some((c) => c[1] === 101 && palette.isTreppe(c[5])));
  // die Brücke endet offen zum Palazzo Vecchio: Gangzellen am PV-Ende sind deklarierte Öffnungen
  assert.ok(world.oeffnungen.some((o) => o.art === 'tor' && o.part === 'bruecke_korridor'));
});

test('Uffizien B1: Lichter in allen Innenräumen (höchstens 12 Blöcke zur nächsten Seelaterne)', () => {
  const lamps = [];
  grid.forEach((x, y, z, e) => { if (e.type === 'sea_lantern') lamps.push([x, y, z]); });
  assert.ok(lamps.length > 500);
  const K = 12, cell = new Map();
  for (const l of lamps) { const k = Math.floor(l[0] / K) + ',' + Math.floor(l[2] / K); (cell.get(k) || cell.set(k, []).get(k)).push(l); }
  let bad = 0, tot = 0;
  for (let xi = 0; xi < reach.Xn; xi++) for (let zi = 0; zi < reach.Zn; zi++) {
    const x = reach.x0 + xi, z = reach.z0 + zi;
    if (!reach.maske.innen(x, z)) continue;
    for (const y of [66, 79, 80, 86, 102]) {
      if (!reach.stehbar(x, y, z) || !reach.erreicht(x, y, z)) continue;
      let gedeckt = false;
      for (let h = 3; h <= 18 && !gedeckt; h++) gedeckt = grid.has(x, y + h, z);
      if (!gedeckt) continue;
      tot++;
      let ok = false;
      const kx = Math.floor(x / K), kz = Math.floor(z / K);
      for (let ax = kx - 1; ax <= kx + 1 && !ok; ax++) for (let az = kz - 1; az <= kz + 1 && !ok; az++) {
        for (const q of cell.get(ax + ',' + az) || []) if (q[1] > y && q[1] <= y + 20 && Math.hypot(q[0] - x, q[2] - z) <= 12) { ok = true; break; }
      }
      if (!ok) bad++;
    }
  }
  assert.ok(tot > 50000);
  assert.equal(bad, 0, `${bad} von ${tot} Stehzellen ohne Licht`);
});

test('Uffizien B1: Innenräume ausgestaltet (Räume, Bilder, Statuen, Content mit Quelle)', () => {
  const m9 = world.modules.find((m) => m.module === 9);
  const raeume = ['galerie_ostkorridor', 'galerie_westkorridor', 'galerie_arno_korridor', 'tribuna', 'sala_botticelli', 'sala_leonardo',
    'sala_michelangelo_raffael', 'scalone_ausstattung', 'galerie_saele_ost', 'galerie_saele_west', 'amtsraeume_eg', 'amtsraeume_mezzanin',
    'amtsraeume_piano_nobile'];
  for (const r of raeume) {
    const p = m9.parts.find((q) => q.id === r);
    assert.ok(p && p.keys.length > 0, `Bauteil ${r}`);
    const c = m9.content.parts[r];
    assert.ok(c && c.title && c.description && c.fact, `Content ${r}`);
  }
  for (const r of ['galerie_ostkorridor', 'tribuna', 'sala_botticelli', 'sala_leonardo', 'sala_michelangelo_raffael']) {
    assert.match(m9.content.parts[r].fact + m9.content.parts[r].description, /vereinfacht/);
    assert.match(m9.content.parts[r].fact, /Quelle/);
  }
  const fresko = (t) => palette.rolesOf(t).includes('fresko');
  const bilder = all.filter((c) => c[4] === 'sala_botticelli' && fresko(c[5]));
  assert.ok(bilder.length > 100);
  // Unterkante der Bilder 1 bis 2 Blöcke über der Gehfläche (Galerieboden Y 101, Stehhöhe Y 102)
  assert.ok(Math.min(...bilder.map((c) => c[1])) >= 103 && Math.min(...bilder.map((c) => c[1])) <= 104);
  assert.ok(all.filter((c) => c[4] === 'sala_botticelli' && c[5] === 'gold_block').length > 20);
  const stat = all.filter((c) => (c[4] === 'galerie_ostkorridor' || c[4] === 'galerie_westkorridor') && c[5] === 'smooth_quartz');
  assert.ok(stat.length >= 100);
  assert.ok(all.filter((c) => c[4] === 'corridoio_bilder').length > 500);
  assert.ok(all.filter((c) => c[4] === 'corridoio_licht').length >= 10);
});
