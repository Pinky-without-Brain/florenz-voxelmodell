'use strict';
// Dokumentations-Emitter (Phase 6): erzeugt Bauanleitungen, Statistik-Blöcke und die Blockpalette.
// renderDocs() liefert alle Dateien im Speicher (deterministisch), emitDocs() schreibt sie.
// R9 vergleicht renderDocs() mit dem Stand auf der Platte.

const fs = require('node:fs');
const path = require('node:path');
const { unpackKey } = require('../geom/grid.js');
const { loadBlockTypes } = require('../validate/r7_palette.js');

const MARK_START = '<!-- STATISTIK:START -->';
const MARK_END = '<!-- STATISTIK:END -->';
const GEN_HEADER = '<!-- GENERIERT von tools/emit/docs.js – nicht von Hand ändern -->';

// Deutsche Überschriften und Kurzbeschreibung je Palettenrolle (Reihenfolge = erstes Auftreten in palette.js)
const ROLE_INFO = {
  marmor_weiss: ['Weißer Marmor (Bianco di Carrara)', 'Verkleidung, Pilaster, Rippen und Gesimse.'],
  marmor_ornament: ['Gemeißelter weißer Marmor', 'Gesimse, Schlusssteine und Zierbänder.'],
  marmor_saeule: ['Marmorsäulen', 'Säulen und Dienste.'],
  marmor_weiss_alt: ['Weißer Marmor, Variante', 'Calcit für Balustraden, Statuen und Maßwerk.'],
  marmor_gruen: ['Grüner Marmor (Verde di Prato)', 'Streifen, Rauten und Rahmen.'],
  marmor_rot: ['Roter Marmor (Rosso di Maremma)', 'Rautenfelder, Rosetten und Akzente.'],
  marmor_rot_alt: ['Roter Marmor, Variante', 'Rote Felder und Bodenmuster.'],
  mauerwerk: ['Mauerwerk', 'Tragende Wandkerne und Fundament.'],
  pietra_serena: ['Pietra serena', 'Innenseiten der Wände, Pfeiler und Treppen.'],
  pietra_forte: ['Pietra forte', 'Kapitelle, Gesimse und Auflager.'],
  ziegel_kuppel: ['Kuppelziegel', 'Innenschale der Kuppel im Fischgrätverband.'],
  dachziegel: ['Dachziegel', 'Dächer und Außenschale der Kuppel.'],
  kontrast_dunkel: ['Dunkler Kontraststein', 'Zugketten, Ringe und Bodenmuster.'],
  antik: ['Antikes Mauerwerk', 'Krypta und Ausgrabungen.'],
  holz: ['Holz', 'Türen, Glockenstuhl und Möbel.'],
  gold: ['Gold', 'Kugel, Kreuz, Mosaike und Glocken.'],
  bronze: ['Bronze und Kupfer', 'Bronzetüren und Zierteile.'],
  licht: ['Licht', 'Leuchtende Fenster und Lichtquellen.'],
  glas: ['Buntglas', 'Fenster und Ochsenaugen.'],
  fresko: ['Freskenfarben', 'Kuppelfresko und Uccello-Uhr.'],
  putz_gelb: ['Putz gelb', 'Gelb verputzte Fassaden der Stadthäuser.'],
  putz_rosa: ['Putz rosa', 'Rosa verputzte Fassaden.'],
  putz_sand: ['Putz sand', 'Sandfarbene Fassaden.'],
  putz_weiss: ['Putz weiß', 'Weiße Fassaden.'],
  putz_grau: ['Putz grau', 'Graue Fassaden.'],
  pietra_forte_rustika: ['Pietra forte, Rustika', 'Rustika-Mauerwerk der Palazzi.'],
  pietra_forte_bruch: ['Pietra forte, Bruchstein', 'Einfaches Bruchsteinmauerwerk.'],
  pflaster: ['Pflaster', 'Straßen und Plätze.'],
  gelaende_fels: ['Geländekörper', 'Felsiger Untergrund der Stadt.'],
  holz_sporto: ['Holz (Sporto)', 'Dachvorsprünge der Stadthäuser.'],
  fensterladen: ['Fensterläden', 'Grüne Läden an Hausfenstern.'],
  glas_fenster: ['Hausfenster', 'Graues Glas für Fenster der Stadthäuser.'],
  gruen_rasen: ['Rasen', 'Parks und Gärten.'],
  gruen_erde: ['Erde', 'Beete und Unterbau von Grünflächen.'],
  gruen_weg: ['Kieswege', 'Wege in Gärten und Parks.'],
  gruen_baum: ['Baumkronen', 'Laub von Bäumen und Hecken.'],
  gruen_stamm: ['Baumstämme', 'Stämme von Bäumen.'],
  wasser: ['Wasser', 'Arno und Brunnen.'],
  treppe: ['Treppen', 'Treppenblöcke mit Ausrichtung des Aufstiegs (Norden, Osten, Süden, Westen), auch umgedreht als Deckenstufe.']
};

const BUILD_HELP = [
  '- **Gerüst (Scaffolding):** Damit kommst du senkrecht an Wänden und Kuppel hoch.',
  '- **Silk-Touch-Spitzhacke:** Falsch gesetzte Glas-, Calcit- oder Prismarinblöcke baust du damit verlustfrei ab.',
  '- **Trank der Sanften Landung:** Ab Höhen über 200 Blöcken ein guter Schutz vor Abstürzen.',
  '- **Sortierkisten:** Sortiere dein Lager nach den Rollen dieser Liste, zum Beispiel eine Kiste je Marmorfarbe.'
];

// ---------------------------------------------------------------- Formatierung

// Tausenderpunkt nach deutscher Schreibweise, unabhängig von der ICU-Ausstattung
function n(v) {
  const s = String(Math.round(v));
  const neg = s.startsWith('-');
  const digits = neg ? s.slice(1) : s;
  return (neg ? '−' : '') + digits.replace(/\B(?=(\d{3})+(?!\d))/g, '.');
}
// Koordinaten ohne Tausenderpunkt, mit Minuszeichen "-"
const c = (v) => String(v);
function pct(part, total) {
  if (!total) return '0,0';
  return (Math.round((part / total) * 1000) / 10).toFixed(1).replace('.', ',');
}
const cell = (s) => String(s).replace(/\|/g, '\\|').replace(/\r?\n/g, ' ');

function typeNameOf(blockTypes, palette, type) {
  const bt = blockTypes[type];
  if (bt && bt.name) return bt.name;
  const p = palette.PALETTE[type];
  return p ? p.de : type;
}

// Textabsatz: Zeilenumbrüche des Contents bleiben als Absätze erhalten
function para(s) {
  return String(s).replace(/\r\n/g, '\n').trim();
}

function folderMap(root) {
  const out = new Map();
  for (const name of fs.readdirSync(root).sort()) {
    const m = /^(\d\d)_Modul_(\d)_/.exec(name);
    if (m && fs.statSync(path.join(root, name)).isDirectory()) out.set(Number(m[2]), name);
  }
  return out;
}

// ---------------------------------------------------------------- Statistik

function moduleStats(mod, steps, grid) {
  let blocks = 0, minX = Infinity, maxX = -Infinity, minZ = Infinity, maxZ = -Infinity;
  let minY = Infinity, maxY = -Infinity;
  for (const p of mod.parts) {
    for (const k of p.keys) {
      const { x, y, z } = unpackKey(k);
      blocks++;
      if (x < minX) minX = x; if (x > maxX) maxX = x;
      if (y < minY) minY = y; if (y > maxY) maxY = y;
      if (z < minZ) minZ = z; if (z > maxZ) maxZ = z;
    }
  }
  const sizes = steps.map((s) => s.count);
  const sum = sizes.reduce((a, b) => a + b, 0);
  const typeCounts = new Map();
  for (const s of steps) for (const k of s.cells) {
    const t = grid.typeOfKey(k);
    typeCounts.set(t, (typeCounts.get(t) || 0) + 1);
  }
  const imin = sizes.indexOf(Math.min(...sizes));
  const imax = sizes.indexOf(Math.max(...sizes));
  return {
    blocks, steps: steps.length, minX, maxX, minY, maxY, minZ, maxZ, typeCounts,
    min: sizes.length ? sizes[imin] : 0, max: sizes.length ? sizes[imax] : 0,
    minStep: imin >= 0 ? steps[imin].stepNumber : 0, maxStep: imax >= 0 ? steps[imax].stepNumber : 0,
    avg: sizes.length ? Math.round(sum / sizes.length) : 0, stepBlocks: sum
  };
}

const sortedCounts = (map) => [...map.entries()].sort((a, b) => (b[1] - a[1]) || (a[0] < b[0] ? -1 : a[0] > b[0] ? 1 : 0));

// Treppenblöcke je Material (alle Richtungen zusammengezählt); leer, wenn keine Treppen vorkommen
function treppenTabelle(counts, palette) {
  const je = new Map();
  for (const [t, v] of counts) {
    const info = palette.treppeInfo(t);
    if (info) je.set(info.base, (je.get(info.base) || 0) + v);
  }
  if (!je.size) return '';
  const namen = new Map(palette.STAIR_BASES.map((b) => [b[0], b[2]]));
  const rows = [...je.entries()].sort((a, b) => (b[1] - a[1]) || (a[0] < b[0] ? -1 : 1))
    .map(([base, v]) => `| ${cell(namen.get(base))} | \`${base}\` | ${n(v)} |`);
  return ['**Treppen je Material** (alle Richtungen)', '', '| Treppe | Basistyp | Anzahl |', '| :--- | :--- | ---: |', ...rows].join('\n');
}

function typeTable(entries, names, withShare, total) {
  const head = withShare ? '| Block | Typ | Anzahl | Anteil |\n| :--- | :--- | ---: | ---: |'
    : '| Block | Typ | Anzahl |\n| :--- | :--- | ---: |';
  const rows = entries.map(([t, v]) => `| ${cell(names(t))} | \`${t}\` | ${n(v)} |${withShare ? ` ${pct(v, total)} % |` : ''}`);
  return [head, ...rows].join('\n');
}

// ---------------------------------------------------------------- Bauanleitung je Modul

function renderGuide(mod, steps, grid, ctx) {
  const st = ctx.stats.get(mod.module);
  const names = ctx.names;
  const L = [];
  L.push(GEN_HEADER);
  L.push('');
  L.push(`# Bauanleitung Modul ${mod.module}: ${mod.meta.title}`);
  L.push('');
  if (mod.meta.subtitle) { L.push(`*${para(mod.meta.subtitle)}*`); L.push(''); }
  L.push('## Übersicht');
  L.push('');
  L.push('| Kennzahl | Wert |');
  L.push('| :--- | :--- |');
  L.push(`| Blöcke | ${n(st.blocks)} |`);
  L.push(`| Bauschritte | ${n(st.steps)} |`);
  L.push(`| Y-Bereich | ${c(st.minY)} bis ${c(st.maxY)} |`);
  L.push(`| X-Ausdehnung | ${c(st.minX)} bis ${c(st.maxX)} (${n(st.maxX - st.minX + 1)} Blöcke) |`);
  L.push(`| Z-Ausdehnung | ${c(st.minZ)} bis ${c(st.maxZ)} (${n(st.maxZ - st.minZ + 1)} Blöcke) |`);
  L.push(`| Kleinster Schritt | ${n(st.min)} Blöcke (Schritt ${mod.module}.${st.minStep}) |`);
  L.push(`| Mittlerer Schritt | ${n(st.avg)} Blöcke |`);
  L.push(`| Größter Schritt | ${n(st.max)} Blöcke (Schritt ${mod.module}.${st.maxStep}) |`);
  L.push('');
  L.push('## Gesamt-Stückliste');
  L.push('');
  L.push(typeTable(sortedCounts(st.typeCounts), names, true, st.stepBlocks));
  const trModul = treppenTabelle(st.typeCounts, ctx.palette);
  if (trModul) { L.push(''); L.push(trModul); }
  L.push('');
  L.push('## Bauteile in Bau-Reihenfolge');
  L.push('');
  L.push('| Nr. | Bauteil | Titel | Blöcke | Schritte |');
  L.push('| ---: | :--- | :--- | ---: | :--- |');
  const cparts = (mod.content && mod.content.parts) || {};
  mod.parts.forEach((p, i) => {
    const nums = steps.filter((s) => s.parts.includes(p.id)).map((s) => s.stepNumber);
    let rng = '–';
    if (nums.length) {
      const a = nums[0], b = nums[nums.length - 1];
      rng = a === b ? `${mod.module}.${a}` : `${mod.module}.${a}–${mod.module}.${b}`;
    }
    const title = (cparts[p.id] && cparts[p.id].title) || p.id;
    L.push(`| ${i + 1} | \`${p.id}\` | ${cell(title)} | ${n(p.keys.length)} | ${rng} |`);
  });
  L.push('');
  L.push('## Bauschritte');
  for (const s of steps) {
    L.push('');
    L.push(`### Schritt ${mod.module}.${s.stepNumber} – ${s.title}`);
    L.push('');
    L.push(`- **Y-Bereich:** ${c(s.yRange[0])} bis ${c(s.yRange[1])}`);
    L.push(`- **Blöcke:** ${n(s.count)}`);
    L.push(`- **Bauteile:** ${s.parts.map((p) => '`' + p + '`').join(', ')}`);
    const tc = new Map();
    for (const k of s.cells) { const t = grid.typeOfKey(k); tc.set(t, (tc.get(t) || 0) + 1); }
    L.push('');
    L.push('**Teileliste**');
    L.push('');
    L.push(typeTable(sortedCounts(tc), names, false, 0));
    const trSchritt = treppenTabelle(tc, ctx.palette);
    if (trSchritt) { L.push(''); L.push(trSchritt); }
    if (s.description) { L.push(''); L.push('**Beschreibung**'); L.push(''); L.push(para(s.description)); }
    if (s.tip) { L.push(''); L.push('**Tipp**'); L.push(''); L.push(para(s.tip)); }
    if (s.caution) { L.push(''); L.push('**Achtung**'); L.push(''); L.push(para(s.caution)); }
    if (s.fact) { L.push(''); L.push('**Fakt**'); L.push(''); L.push(para(s.fact)); }
  }
  L.push('');
  return L.join('\n');
}

// ---------------------------------------------------------------- Statistik-Blöcke

function moduleStatBlock(mod, ctx) {
  const st = ctx.stats.get(mod.module);
  const guide = `BAUANLEITUNG_MODUL_${mod.module}.md`;
  return [
    `**Statistik (generiert):** ${n(st.blocks)} Blöcke in ${n(st.steps)} Bauschritten, Y ${c(st.minY)} bis ${c(st.maxY)}, ` +
      `X ${c(st.minX)} bis ${c(st.maxX)}, Z ${c(st.minZ)} bis ${c(st.maxZ)}.`,
    `Schrittgröße: kleinster ${n(st.min)}, mittlerer ${n(st.avg)}, größter ${n(st.max)} Blöcke.`,
    '',
    `Zur vollständigen Bauanleitung mit Teilelisten: [${guide}](${guide})`
  ].join('\n');
}

function projectStatBlock(mods, ctx, folders) {
  const L = [];
  L.push(`**Statistik (generiert):** ${n(ctx.totalBlocks)} Blöcke in ${n(ctx.totalSteps)} Bauschritten, ${mods.length} Module. ` +
    `Maßstab 1:${ctx.dims.SCALE}, 1 Block = ${String(1 / ctx.dims.SCALE).replace('.', ',')} m.`);
  const b = ctx.bounds;
  L.push(`Ausdehnung des Modells: X ${c(b.minX)} bis ${c(b.maxX)}, Y ${c(b.minY)} bis ${c(b.maxY)}, Z ${c(b.minZ)} bis ${c(b.maxZ)}.`);
  L.push('');
  L.push('| Modul | Titel | Blöcke | Schritte | Bauanleitung |');
  L.push('| ---: | :--- | ---: | ---: | :--- |');
  for (const m of mods) {
    const st = ctx.stats.get(m.module);
    const f = folders.get(m.module);
    const g = `BAUANLEITUNG_MODUL_${m.module}.md`;
    L.push(`| ${m.module} | ${cell(m.meta.title)} | ${n(st.blocks)} | ${n(st.steps)} | [${g}](${f}/${g}) |`);
  }
  L.push(`| | **Summe** | **${n(ctx.totalBlocks)}** | **${n(ctx.totalSteps)}** | |`);
  return L.join('\n');
}

// Ersetzt den Bereich zwischen den Markern. Fehlen sie, werden sie nach der ersten Überschrift eingefügt.
// Der Text außerhalb der Marker bleibt unverändert; Zeilenende (LF/CRLF) der Datei bleibt erhalten.
function replaceMarkerBlock(text, body) {
  const crlf = text.includes('\r\n');
  const eol = crlf ? '\r\n' : '\n';
  const block = body.split('\n').join(eol);
  const a = text.indexOf(MARK_START);
  const b = text.indexOf(MARK_END);
  if (a >= 0 && b > a) {
    return text.slice(0, a) + MARK_START + eol + block + eol + text.slice(b);
  }
  const m = /^#[^\r\n]*(\r?\n)/m.exec(text);
  const ins = eol + MARK_START + eol + block + eol + MARK_END + eol;
  if (!m) return MARK_START + eol + block + eol + MARK_END + eol + eol + text;
  const at = m.index + m[0].length;
  return text.slice(0, at) + ins + text.slice(at);
}

// ---------------------------------------------------------------- Blockpalette

function renderPalette(ctx) {
  const { palette, names } = ctx;
  const total = ctx.totalBlocks;
  const totals = ctx.typeTotals;
  const roles = [];
  const vollTypen = palette.TYPES.filter((t) => !palette.isTreppe(t));
  // Treppen: eine Zeile je Material (alle 8 Typen zusammengezählt) statt 160 Einzelzeilen
  const treppeMaterial = palette.STAIR_BASES.map(([base, , name]) => {
    const typen = palette.TYPES.filter((t) => palette.PALETTE[t].stair && palette.PALETTE[t].stair.base === base);
    return { base, name, typen, v: typen.reduce((a, t) => a + (totals.get(t) || 0), 0) };
  });
  for (const t of palette.TYPES) {
    const r = palette.PALETTE[t].role;
    if (!roles.includes(r)) roles.push(r);
  }
  const L = [];
  L.push(GEN_HEADER);
  L.push('');
  L.push('# Materialliste und Blockpalette');
  L.push('');
  L.push(`Alle ${n(vollTypen.length)} erlaubten Vollblocktypen des Modells, gruppiert nach Rolle, dazu ${n(palette.STAIR_BASES.length)} Treppenmaterialien ` +
    `mit je ${n(palette.STAIR_DIRS.length * 2)} Typen (4 Ausrichtungen, jeweils normal und umgedreht; Rolle \`treppe\`). ` +
    `Das Modell besteht aus ${n(total)} Blöcken; es werden volle Würfelblöcke und Treppenblöcke verwendet. ` +
    'Quellen: `tools/spec/palette.js`, `webapp/js/data/block-types.js` und die Gesamtzahlen aus dem Build.');
  L.push('');
  L.push('Die toskanische Farbwelt: Weiß steht für Bianco di Carrara, Grün für Verde di Prato, Rot für Rosso di Maremma. ' +
    'Die Dächer und die Kuppel tragen das Terrakotta-Rot der florentinischen Dachlinie.');
  L.push('');
  L.push('## Gesamtübersicht');
  L.push('');
  L.push('| Rolle | Blocktypen | Blöcke | Anteil |');
  L.push('| :--- | ---: | ---: | ---: |');
  const roleTotals = new Map();
  for (const r of roles) {
    const ts = palette.TYPES.filter((t) => palette.PALETTE[t].role === r);
    roleTotals.set(r, ts.reduce((a, t) => a + (totals.get(t) || 0), 0));
    const info = ROLE_INFO[r] || [r, ''];
    const anzahl = r === 'treppe' ? `${treppeMaterial.length} Materialien` : ts.length;
    L.push(`| ${cell(info[0])} | ${anzahl} | ${n(roleTotals.get(r))} | ${pct(roleTotals.get(r), total)} % |`);
  }
  L.push(`| **Summe** | **${vollTypen.length}** | **${n(total)}** | **100,0 %** |`);
  for (const r of roles) {
    const info = ROLE_INFO[r] || [r, ''];
    const ts = palette.TYPES.filter((t) => palette.PALETTE[t].role === r)
      .sort((x, y) => ((totals.get(y) || 0) - (totals.get(x) || 0)) || (x < y ? -1 : 1));
    L.push('');
    L.push(`## ${info[0]}`);
    L.push('');
    if (info[1]) { L.push(info[1] + ` (Rolle \`${r}\`)`); L.push(''); }
    L.push('| Block | Typ | Anzahl | Anteil |');
    L.push('| :--- | :--- | ---: | ---: |');
    if (r === 'treppe') {
      for (const m of treppeMaterial.slice().sort((a, b) => (b.v - a.v) || (a.base < b.base ? -1 : 1))) {
        L.push(`| ${cell(m.name)} (4 Richtungen, normal und umgedreht) | \`${m.base}@n|o|s|w[_oben]\` | ${n(m.v)} | ${pct(m.v, total)} % |`.replace('n|o|s|w', 'n\\|o\\|s\\|w'));
      }
      continue;
    }
    for (const t of ts) {
      const v = totals.get(t) || 0;
      const also = (palette.PALETTE[t].alsoRoles || []).map((a) => '`' + a + '`').join(', ');
      const label = also ? `${names(t)} (auch: ${also})` : names(t);
      L.push(`| ${cell(label)} |\`${t}\` | ${n(v)} | ${pct(v, total)} % |`);
    }
  }
  L.push('');
  L.push('## Bauhilfen');
  L.push('');
  for (const l of BUILD_HELP) L.push(l);
  L.push('');
  return L.join('\n');
}

// ---------------------------------------------------------------- Einstieg

// ---------------------------------------------------------------- Neue Projekte (V3)

// README eines Projekts unter projects/<id>/docs/: Statistik, Modulübersicht, Gesamt-Stückliste
function renderProjectReadme(project, mods, ctx) {
  const L = [];
  L.push(GEN_HEADER);
  L.push('');
  L.push(`# ${project.title}`);
  L.push('');
  L.push(`*Projekt \`${project.id}\`, Art: ${project.type}*`);
  L.push('');
  L.push(`**Statistik (generiert):** ${n(ctx.totalBlocks)} Blöcke in ${n(ctx.totalSteps)} Bauschritten, ${mods.length} Module. ` +
    `Maßstab 1:${ctx.dims.SCALE}, 1 Block = ${String(1 / ctx.dims.SCALE).replace('.', ',')} m.`);
  const sts = mods.map((m) => ctx.stats.get(m.module)).filter((st) => st.blocks > 0);
  if (sts.length) {
    const lo = (k) => Math.min(...sts.map((st) => st[k])), hi = (k) => Math.max(...sts.map((st) => st[k]));
    L.push(`Ausdehnung des Modells: X ${c(lo('minX'))} bis ${c(hi('maxX'))}, Y ${c(lo('minY'))} bis ${c(hi('maxY'))}, Z ${c(lo('minZ'))} bis ${c(hi('maxZ'))}.`);
  }
  L.push('');
  L.push('| Modul | Titel | Blöcke | Schritte | Bauanleitung |');
  L.push('| ---: | :--- | ---: | ---: | :--- |');
  for (const m of mods) {
    const st = ctx.stats.get(m.module);
    const g = `BAUANLEITUNG_MODUL_${m.module}.md`;
    L.push(`| ${m.module} | ${cell(m.meta.title)} | ${n(st.blocks)} | ${n(st.steps)} | [${g}](${g}) |`);
  }
  L.push(`| | **Summe** | **${n(ctx.totalBlocks)}** | **${n(ctx.totalSteps)}** | |`);
  L.push('');
  L.push('## Gesamt-Stückliste');
  L.push('');
  L.push(typeTable(sortedCounts(ctx.typeTotals), ctx.names, true, ctx.totalBlocks));
  const trProjekt = treppenTabelle(ctx.typeTotals, ctx.palette);
  if (trProjekt) { L.push(''); L.push(trProjekt); }
  L.push('');
  return L.join('\n');
}

function renderProjectDocs({ project, modules, stepsByModule, grid, root, complete }) {
  const dims = require('../spec/dimensions.js');
  const palette = require('../spec/palette.js');
  const blockTypes = loadBlockTypes(path.join(root, 'webapp', 'js', 'data', 'block-types.js'));
  const mods = modules.slice().sort((a, b) => a.module - b.module);
  const ctx = prepareContext(mods, stepsByModule, grid, dims, palette, blockTypes);
  const base = path.relative(root, project.docsDir).split(path.sep).join('/');
  const out = new Map();
  for (const m of mods) {
    out.set(`${base}/BAUANLEITUNG_MODUL_${m.module}.md`, renderGuide(m, stepsByModule[m.module] || [], grid, ctx));
  }
  if (complete !== false) out.set(`${base}/README.md`, renderProjectReadme(project, mods, ctx));
  return out;
}

// Statistik und Namensauflösung für alle übergebenen Module
function prepareContext(mods, stepsByModule, grid, dims, palette, blockTypes) {
  const stats = new Map();
  const typeTotals = new Map();
  let totalBlocks = 0, totalSteps = 0;
  for (const m of mods) {
    const steps = stepsByModule[m.module] || [];
    const st = moduleStats(m, steps, grid);
    stats.set(m.module, st);
    totalBlocks += st.blocks;
    totalSteps += st.steps;
    for (const [t, v] of st.typeCounts) typeTotals.set(t, (typeTotals.get(t) || 0) + v);
  }
  return { dims, palette, stats, typeTotals, totalBlocks, totalSteps, bounds: null,
    names: (t) => typeNameOf(blockTypes, palette, t) };
}

/**
 * renderDocs({ modules, stepsByModule, grid, root, project?, complete? }) -> Map relativer Pfad (mit "/") -> Dateiinhalt.
 * Dom (kein project oder project.legacy): Projekt-README und Blockpalette entstehen nur, wenn alle Module 0..9 übergeben werden.
 * Neue Projekte: BAUANLEITUNG_MODUL_N.md und README.md unter projects/<id>/docs/ (README nur wenn complete !== false).
 */
function renderDocs({ modules, stepsByModule, grid, root, project, complete }) {
  if (project && !project.legacy) return renderProjectDocs({ project, modules, stepsByModule, grid, root, complete });
  const dims = require('../spec/dimensions.js');
  const palette = require('../spec/palette.js');
  const blockTypes = loadBlockTypes(path.join(root, 'webapp', 'js', 'data', 'block-types.js'));
  const folders = folderMap(root);
  const mods = modules.slice().sort((a, b) => a.module - b.module);

  const ctx = prepareContext(mods, stepsByModule, grid, dims, palette, blockTypes);

  const out = new Map();
  const rel = (...p) => p.join('/');
  const read = (relPath) => fs.readFileSync(path.join(root, ...relPath.split('/')), 'utf8');

  for (const m of mods) {
    const f = folders.get(m.module);
    if (!f) throw new Error(`Kein Modulordner für Modul ${m.module} (Muster NN_Modul_${m.module}_*)`);
    out.set(rel(f, `BAUANLEITUNG_MODUL_${m.module}.md`), renderGuide(m, stepsByModule[m.module] || [], grid, ctx));
    const rp = rel(f, 'README.md');
    out.set(rp, replaceMarkerBlock(read(rp), moduleStatBlock(m, ctx)));
  }

  const full = mods.length === 10 && mods.every((m, i) => m.module === i);
  if (full) {
    ctx.bounds = grid.bounds();
    out.set('README.md', replaceMarkerBlock(read('README.md'), projectStatBlock(mods, ctx, folders)));
    out.set('01_Materialien_und_Blockpalette/BLOCK_PALETTE.md', renderPalette(ctx));
  }
  return out;
}

/**
 * README eines Projekts mit unabhängigen Modulen (Stadtgrund): aus gesammelten Modulstatistiken statt aus einem Grid.
 * mods: [{ module, meta: { title } }], stats: Map Modul -> moduleStats(...). -> { rel, text }
 */
function renderReadmeAusStats({ project, mods, stats, root }) {
  const dims = require('../spec/dimensions.js');
  const palette = require('../spec/palette.js');
  const blockTypes = loadBlockTypes(path.join(root, 'webapp', 'js', 'data', 'block-types.js'));
  const sorted = mods.slice().sort((a, b) => a.module - b.module);
  const typeTotals = new Map();
  let totalBlocks = 0, totalSteps = 0;
  for (const m of sorted) {
    const st = stats.get(m.module);
    totalBlocks += st.blocks;
    totalSteps += st.steps;
    for (const [t, v] of st.typeCounts) typeTotals.set(t, (typeTotals.get(t) || 0) + v);
  }
  const ctx = { dims, palette, stats, typeTotals, totalBlocks, totalSteps, bounds: null, names: (t) => typeNameOf(blockTypes, palette, t) };
  const base = path.relative(root, project.docsDir).split(path.sep).join('/');
  return { rel: `${base}/README.md`, text: renderProjectReadme(project, sorted, ctx) };
}

// Schreibt alle Dateien; Rückgabe: { files: [Pfade], changed: [Pfade mit neuem Inhalt] }
function emitDocs({ modules, stepsByModule, grid, root, project, complete }) {
  const docs = renderDocs({ modules, stepsByModule, grid, root, project, complete });
  const files = [], changed = [];
  for (const [rel, text] of docs) {
    const file = path.join(root, ...rel.split('/'));
    let old = null;
    try { old = fs.readFileSync(file, 'utf8'); } catch (e) { old = null; }
    files.push(rel);
    if (old !== text) {
      fs.mkdirSync(path.dirname(file), { recursive: true });
      fs.writeFileSync(file, text);
      changed.push(rel);
    }
  }
  return { files, changed };
}

module.exports = { emitDocs, renderDocs, renderReadmeAusStats, moduleStats, replaceMarkerBlock, MARK_START, MARK_END, GEN_HEADER };
