'use strict';
// Entwurfs-Akten aus Typologie (HAUSAKTE_SCHEMA §4 Regeln 1 und 2).
//   entwurf(gebaeude, nachbarn, flaechen) -> Akte mit quelle "typologie", sicherheit <= 0.4
//   node tools/city/akten_entwurf.js --project <id>   schreibt fehlende Akten nach projects/<id>/hausakten/
// Deterministisch: alle Entscheidungen werden aus der Gebäude-ID gesetzt (FNV-1a + mulberry32).

const fs = require('node:fs');
const path = require('node:path');
const P = require('./poly.js');
const A = require('./akte.js');
const { umfeldVon } = require('./umfeld.js');

// ------------------------------------------------------------------ Zufall aus der ID
function fnv1a(s) {
  let h = 0x811c9dc5;
  for (let i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 0x01000193) >>> 0; }
  return h >>> 0;
}
function mulberry32(seed) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6D2B79F5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
const pick = (rand, list) => list[Math.floor(rand() * list.length) % list.length];
function shuffle(rand, list) {
  const a = list.slice();
  for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(rand() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; }
  return a;
}

// ------------------------------------------------------------------ Geometrie
/**
 * Straßenfront eines Gebäudes: { flaecheBl, front (längste straßenseitige Außenkante), strassenKanten, kanteMitte }.
 * Straßenseitig: Mehrheit der Messpunkte 1,5 Blöcke vor der Kante liegt in Straße/Platz/Wasser.
 */
function geometrie(g, umfeld) {
  const poly = P.normalize(g.polygon);
  const flaecheBl = g.flaecheBl || P.area(poly);
  const kanten = P.edges(poly).filter((e) => !e.hole);
  let front = 0, strassenKanten = 0, kanteMitte = null, laengste = 0, laengsteMitte = null;
  for (const e of kanten) {
    if (e.len > laengste) { laengste = e.len; laengsteMitte = [(e.a[0] + e.b[0]) / 2, (e.a[1] + e.b[1]) / 2]; }
    const n = Math.max(1, Math.floor(e.len / 2));
    let hit = 0;
    for (let i = 0; i < n; i++) {
      const t = ((i + 0.5) / n) * e.len;
      const px = e.a[0] + e.dir[0] * t, pz = e.a[1] + e.dir[1] * t;
      // 1,5 und 3 Blöcke vor der Kante: auch ein schmaler Spalt zur Straße zählt
      if (umfeld.klasse(Math.round(px + e.out[0] * 1.5), Math.round(pz + e.out[1] * 1.5)) ||
          umfeld.klasse(Math.round(px + e.out[0] * 3), Math.round(pz + e.out[1] * 3))) hit++;
    }
    if (hit * 2 >= n) {
      strassenKanten++;
      if (e.len > front) { front = e.len; kanteMitte = [(e.a[0] + e.b[0]) / 2 + e.out[0] * 1.5, (e.a[1] + e.b[1]) / 2 + e.out[1] * 1.5]; }
    }
  }
  if (!front) { front = laengste; kanteMitte = laengsteMitte; }
  return { flaecheBl, front, strassenKanten, kanteMitte, ohneStrasse: strassenKanten === 0 };
}

// Nächster Straßenname zur Hauptkante (für Titel); sonst null
function strassenName(g, umfeld) {
  const geo = geometrie(g, umfeld);
  if (!geo.kanteMitte) return null;
  const r = umfeld.nearestName(Math.round(geo.kanteMitte[0]), Math.round(geo.kanteMitte[1]), 40);
  return r ? r.name : null;
}

// ------------------------------------------------------------------ Typ aus Daten (Regel 1)
const KLEINBAU = new Set(['shed', 'garage', 'garages', 'roof', 'kiosk', 'service', 'industrial', 'warehouse', 'hut',
  'cabin', 'carport', 'container', 'greenhouse', 'static_caravan', 'transformer_tower', 'toilets']);
const KIRCHE = new Set(['church', 'chapel', 'cathedral', 'basilica', 'monastery', 'synagogue']);

function waehleTyp(g, geo, rand) {
  const name = g.name || '';
  const tags = g.tags || {};
  const b = tags.building || '';
  const h = g.hoeheBl;
  if (/\bTorre\b/i.test(name) || b === 'tower' || tags['tower:type']) return ['casa_torre', 'Name/Tags (Turm)'];
  if (KIRCHE.has(b) || tags.amenity === 'place_of_worship' || /^(San|Santa|Santo|Sant'|Chiesa|Oratorio|Cappella|Basilica)\b/i.test(name)) {
    return ['chiesa_minore', 'Name/Tags (Kirche)'];
  }
  if (/\bLoggia\b/i.test(name) || b === 'loggia') return ['loggia', 'Name (Loggia)'];
  if (KLEINBAU.has(b) || geo.flaecheBl < 120 || (h <= 12 && geo.ohneStrasse)) return ['zweckbau', 'Kleinbau/Nebengebäude'];
  if (/^(Palazzo|Palazzetto|Villa|Casa)\b/i.test(name) && geo.front >= 24) {
    const r = rand();
    return [r < 0.45 ? 'palazzo_rinascimento' : r < 0.85 ? 'palazzo_cinquecento' : 'palazzo_ottocento', 'Name (Palazzo)'];
  }
  if (geo.front <= 24 && h >= 34 && geo.flaecheBl < 300 && h / Math.max(geo.front, 1) >= 2.2) {
    return ['casa_torre', 'Proportion (schmal und hoch)'];
  }
  if (geo.front >= 44 && h >= 26) {
    const r = rand();
    return [r < 0.3 ? 'palazzo_rinascimento' : r < 0.75 ? 'palazzo_cinquecento' : 'palazzo_ottocento', 'Breite und Höhe'];
  }
  if (geo.front <= 34) return ['casa_a_schiera', 'schmale Front'];
  return [rand() < 0.5 ? 'palazzo_cinquecento' : 'casa_a_schiera', 'mittlere Front'];
}

// ------------------------------------------------------------------ Geschosse
const EG_HOEHE = { casa_a_schiera: 9, casa_torre: 9, palazzo_rinascimento: 11, palazzo_cinquecento: 10,
  palazzo_ottocento: 11, chiesa_minore: 14, loggia: 10, zweckbau: 8 };
const OG_HOEHE = { casa_a_schiera: 8, casa_torre: 8, palazzo_rinascimento: 9, palazzo_cinquecento: 9,
  palazzo_ottocento: 9, chiesa_minore: 9, loggia: 8, zweckbau: 8 };

/** Geschosshöhen, deren Summe genau der Gebäudehöhe entspricht (soweit die Schemagrenzen 3..16 es erlauben). */
function geschosse(typ, h) {
  const H = Math.max(3, Math.round(h));
  const eg0 = EG_HOEHE[typ], og0 = OG_HOEHE[typ];
  if (H <= eg0 + 4) return [{ art: 'eg', hoeheBl: Math.min(16, H) }];
  const eg = Math.min(eg0, H - 6);
  const rest = H - eg;
  let n = Math.max(1, Math.round(rest / og0));
  while (rest / n > 12) n++;
  while (n > 1 && rest / n < 6) n--;
  const base = Math.floor(rest / n), extra = rest - base * n;
  const out = [{ art: 'eg', hoeheBl: eg }];
  for (let i = 0; i < n; i++) {
    let art = 'og';
    if (i === 0 && (typ === 'palazzo_rinascimento' || typ === 'palazzo_cinquecento' || typ === 'palazzo_ottocento')) art = 'nobile';
    if (i === n - 1 && n >= 3 && typ === 'palazzo_ottocento') art = 'attika';
    out.push({ art, hoeheBl: base + (i >= n - extra ? 1 : 0) });
  }
  return out;
}

// ------------------------------------------------------------------ Optionen je Typ
const ALLE_PUTZ = A.ENUM.putzfarbe;
const OPT = {
  casa_a_schiera: { material: 'putz', putz: ALLE_PUTZ, achsen: [2, 5], fenster: ['rechteck', 'rahmen_stuck', 'rundbogen'],
    gesims: ['gronda_holz', 'putzgesims', 'keiner'], eg: ['bottega_arcata', 'portal_seitlich', 'tor_und_fenster'],
    rahmen: ['putz', 'pietra_serena', 'pietra_forte', 'keiner'], laeden: [null, 'gruen', 'holz'], epoche: '15.–17. Jh.' },
  casa_torre: { material: 'bruchstein', putz: [null], achsen: [1, 3], fenster: ['rundbogen', 'rechteck'],
    gesims: ['keiner', 'gronda_holz'], eg: ['tor_und_fenster', 'portal_seitlich', 'geschlossen'],
    rahmen: ['pietra_forte', 'pietra_serena'], laeden: [null], epoche: '13. Jh.' },
  palazzo_rinascimento: { material: ['bugnato_abgestuft', 'bugnato_glatt'], putz: [null], achsen: [5, 11],
    fenster: ['bifora', 'rundbogen', 'tabernakel'], gesims: ['cornicione_stein', 'cornicione_stein', 'putzgesims'],
    eg: ['portal_mittig', 'portal_seitlich', 'tor_und_fenster'], rahmen: ['pietra_serena', 'pietra_forte'], laeden: [null],
    epoche: '15. Jh.' },
  palazzo_cinquecento: { material: 'putz', putz: ALLE_PUTZ, achsen: [4, 9], fenster: ['tabernakel', 'rechteck', 'rahmen_stuck'],
    gesims: ['putzgesims', 'cornicione_stein', 'gronda_holz'], eg: ['portal_mittig', 'tor_und_fenster', 'portal_seitlich'],
    rahmen: ['pietra_serena', 'pietra_forte', 'putz'], laeden: [null, 'gruen'], epoche: '16.–17. Jh.' },
  palazzo_ottocento: { material: 'putz', putz: ['gelb', 'sand', 'weiss', 'grau', 'ocker'], achsen: [5, 11],
    fenster: ['rahmen_stuck', 'rechteck', 'tabernakel'], gesims: ['cornicione_stein', 'putzgesims'],
    eg: ['bottega_arcata', 'portal_mittig'], rahmen: ['putz', 'pietra_serena'], laeden: [null, 'gruen'], epoche: '19. Jh.' },
  chiesa_minore: { material: 'putz', putz: ['sand', 'weiss', 'grau', 'ocker'], achsen: [1, 3], fenster: ['rundbogen', 'rechteck'],
    gesims: ['putzgesims', 'cornicione_stein', 'keiner'], eg: ['portal_giebel'], rahmen: ['pietra_serena', 'pietra_forte'],
    laeden: [null], epoche: 'Mittelalter bis Neuzeit' },
  loggia: { material: 'stein_glatt', putz: [null], achsen: [3, 7], fenster: ['rundbogen'],
    gesims: ['cornicione_stein', 'keiner'], eg: ['loggia_offen'], rahmen: ['pietra_serena'], laeden: [null], epoche: '14.–15. Jh.' },
  zweckbau: { material: 'putz', putz: ['sand', 'grau', 'weiss', 'ocker', 'gelb'], achsen: [1, 4], fenster: ['rechteck'],
    gesims: ['keiner', 'putzgesims'], eg: ['geschlossen', 'tor_und_fenster'], rahmen: ['putz', 'keiner'],
    laeden: [null, 'holz'], epoche: '19.–20. Jh.' }
};
const SPACING = { casa_a_schiera: 7, casa_torre: 8, palazzo_rinascimento: 8, palazzo_cinquecento: 8, palazzo_ottocento: 8,
  chiesa_minore: 12, loggia: 9, zweckbau: 8 };

/**
 * entwurf(gebaeude, nachbarn, flaechen) -> Akte
 * gebaeude: Eintrag aus gebaeude.json; nachbarn: Akten angrenzender Häuser (Array); flaechen: flaechen.json oder Umfeld.
 */
function entwurf(gebaeude, nachbarn, flaechen) {
  const umfeld = umfeldVon(flaechen);
  const rand = mulberry32(fnv1a(gebaeude.id));
  const geo = geometrie(gebaeude, umfeld);
  const [typ, grund] = waehleTyp(gebaeude, geo, rand);
  const o = OPT[typ];
  const aGes = geschosse(typ, gebaeude.hoeheBl);
  const base = Math.max(o.achsen[0], Math.min(o.achsen[1], Math.round(geo.front / SPACING[typ])));
  const achsenOpt = [base, base - 1, base + 1].filter((v) => v >= o.achsen[0] && v <= o.achsen[1]);

  // Kandidaten über die fünf Vergleichsmerkmale, in Reihenfolge der ID-abhängigen Mischung
  const cands = [];
  const matOf = (i) => (Array.isArray(o.material) ? o.material[i % o.material.length] : o.material);
  for (const putz of o.putz) for (const achsen of achsenOpt) for (const ft of o.fenster) for (const gs of [...new Set(o.gesims)]) {
    for (const ega of o.eg) cands.push({ putz, achsen, ft, gs, ega });
  }
  const order = shuffle(rand, cands);
  const nb = nachbarn || [];
  const mk = (c) => ({ fassade: { putzfarbe: c.putz, achsen: c.achsen, fenster: { typ: c.ft }, gesims: { art: c.gs }, erdgeschoss: { art: c.ega } } });
  let chosen = null, bestScore = -1;
  for (const c of order) {
    const probe = mk(c);
    let m = 99;
    for (const a of nb) m = Math.min(m, A.unterschiede(probe, a));
    if (m >= 2) { chosen = c; break; }
    if (m > bestScore) { bestScore = m; chosen = c; }
  }
  const c = chosen;
  const material = matOf(Math.floor(rand() * 2));
  const tiefe = { keiner: 0, gronda_holz: 2, putzgesims: 1, cornicione_stein: typ === 'palazzo_rinascimento' ? 3 : 2 }[c.gs];
  const portalArt = c.ega.startsWith('portal') || c.ega === 'tor_und_fenster';
  const portalBreite = typ === 'chiesa_minore' ? 7 : (typ.startsWith('palazzo') ? 7 : 5);
  const egFenster = typ === 'palazzo_cinquecento' && rand() < 0.5 ? 'kniefenster'
    : pick(rand, ['rechteck_vergittert', 'rechteck', 'rundbogen']);
  const dachForm = typ === 'palazzo_ottocento' && rand() < 0.35 ? 'flach'
    : (typ === 'casa_a_schiera' || typ === 'zweckbau' || typ === 'chiesa_minore') ? 'sattel' : 'walm';
  const benannt = !!gebaeude.name;
  const akte = {
    id: gebaeude.id,
    typ,
    epoche: o.epoche,
    geschosse: aGes,
    fassade: {
      kanten: 'strasse',
      achsen: c.achsen,
      material,
      putzfarbe: material === 'putz' ? c.putz : null,
      erdgeschoss: {
        art: c.ega,
        ...(portalArt || c.ega === 'portal_giebel' ? { portalBreiteBl: portalBreite } : {}),
        fenster: c.ega === 'geschlossen' ? 'keine' : (c.ega === 'loggia_offen' ? 'keine' : egFenster)
      },
      fenster: { typ: c.ft, rahmen: pick(rand, o.rahmen), laeden: pick(rand, o.laeden) },
      gesims: { art: c.gs, tiefeBl: tiefe },
      extras: []
    },
    dach: { form: dachForm, material: dachForm === 'flach' ? 'terrasse' : 'coppi', altana: false },
    quelle: 'typologie',
    sicherheit: benannt ? 0.3 : 0.2,
    notiz: `Entwurf aus Typologie: Typ ${typ} nach ${grund}; Epoche, Achsen und Farbe sind Schätzungen.`
  };
  if (gebaeude.name) akte.name = gebaeude.name;
  return akte;
}

// ------------------------------------------------------------------ Kommandozeile
function parseArgs(argv) {
  const o = { project: null };
  for (let i = 0; i < argv.length; i++) {
    if (argv[i] === '--project') o.project = argv[++i];
    else throw new Error(`Unbekanntes Argument: ${argv[i]}`);
  }
  if (!o.project) throw new Error('--project <id> fehlt');
  return o;
}

/**
 * main(argv, env?) -> { geschrieben: [ids], vorhanden: n }. env: { root, projectsRoot, entries } wie build.js (Tests).
 */
function main(argv, env = {}) {
  const opts = parseArgs(argv);
  const { loadRegistry, ROOT } = require('../projects.js');
  const { loadQuartier } = require('./quartier.js');
  const root = env.root || ROOT;
  const reg = loadRegistry({ root, projectsRoot: env.projectsRoot || path.join(root, 'projects'), entries: env.entries });
  const project = reg.projects.find((p) => p.id === opts.project);
  if (!project) throw new Error(`Unbekanntes Projekt "${opts.project}"`);
  if (project.meta.generator !== 'quartier') throw new Error(`Projekt ${project.id} ist kein Quartier-Projekt`);
  const q = loadQuartier(project);
  fs.mkdirSync(q.aktenDir, { recursive: true });
  const vorhanden = new Map();
  for (const id of q.ids) {
    const f = path.join(q.aktenDir, id + '.json');
    if (fs.existsSync(f)) {
      try { vorhanden.set(id, JSON.parse(fs.readFileSync(f, 'utf8'))); } catch (e) { vorhanden.set(id, null); }
    }
  }
  const adj = q.parz.adjazenz();
  const geschrieben = [];
  for (const id of q.ids) { // aufsteigende IDs
    if (vorhanden.has(id) || (q.vorrangIds && q.vorrangIds.has(id))) continue; // Wahrzeichen-Vorrang: keine Hausakte
    const nach = [...(adj.get(id) || [])].map((n) => vorhanden.get(n)).filter(Boolean);
    const akte = entwurf(q.byId.get(id), nach, q.umfeld);
    fs.writeFileSync(path.join(q.aktenDir, id + '.json'), JSON.stringify(akte, null, 2) + '\n');
    vorhanden.set(id, akte);
    geschrieben.push(id);
  }
  return { geschrieben, vorhanden: q.ids.length - geschrieben.length };
}

module.exports = { entwurf, geometrie, strassenName, geschosse, waehleTyp, main, fnv1a, mulberry32 };

if (require.main === module) {
  try {
    const r = main(process.argv.slice(2));
    console.log(`Akten: ${r.geschrieben.length} neu geschrieben, ${r.vorhanden} schon vorhanden`);
  } catch (e) {
    console.error('Abbruch: ' + e.message);
    process.exitCode = 1;
  }
}

