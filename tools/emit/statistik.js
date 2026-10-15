'use strict';
// Statistikseite des Stadtmodells, vollständig gemessen (keine Zahl ohne Messung):
//   node tools/emit/statistik.js [--pdf <datei.pdf>]
// Quellen: webapp/data/projekte.js (Module, Grenzen), die Moduldaten (Blocktypen aus den Läufen gezählt),
// projects/*/project.json, data/stadt/gebaeude.json, build/minecraft/export_ergebnis.json (letzter Export, falls vorhanden),
// Repository (Zeilen, Tests, Commits). Schreibt 20_Stadtmodell_Florenz/STATISTIK.html; mit --pdf zusätzlich ein PDF
// (Chromium über Playwright).

const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const { execSync } = require('node:child_process');
const PAL = require('../spec/palette.js');

const ROOT = path.resolve(__dirname, '..', '..');
const WEB = path.join(ROOT, 'webapp');
const OUT = path.join(ROOT, '20_Stadtmodell_Florenz', 'STATISTIK.html');

const fmt = (n) => Math.round(n).toLocaleString('de-DE');
const mio = (n) => (n >= 1e6 ? (n / 1e6).toLocaleString('de-DE', { maximumFractionDigits: 2 }) + ' Mio' : fmt(n));
const m = (bl) => (bl / 2).toLocaleString('de-DE', { maximumFractionDigits: 1 }) + ' m';
const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;');

function ladeIndex() {
  const ctx = { window: {} };
  vm.runInNewContext(fs.readFileSync(path.join(WEB, 'data', 'projekte.js'), 'utf8'), ctx);
  return ctx.window.PROJECT_INDEX;
}

/** Blocktypen eines Moduls aus den Läufen zählen (ohne Blöcke zu erzeugen). */
function zaehleModul(datei, projektId, n, zaehler) {
  const ctx = { window: {} };
  vm.runInNewContext(fs.readFileSync(path.join(WEB, datei), 'utf8'), ctx);
  const d = projektId === 'duomo' ? ctx.window.MODULE_DATA_V2[n] : ctx.window.PROJECT_DATA_V3[projektId][n];
  for (const st of d.steps) {
    const buf = Buffer.from(st.runs, 'base64');
    for (let o = 0; o + 10 <= buf.length; o += 10) {
      const t = d.palette[buf.readInt16LE(o + 8)];
      zaehler.set(t, (zaehler.get(t) || 0) + buf.readInt16LE(o + 6));
    }
  }
}

function projektJson(id) {
  const f = path.join(ROOT, 'projects', id, 'project.json');
  return fs.existsSync(f) ? JSON.parse(fs.readFileSync(f, 'utf8')) : null;
}

function messe() {
  const idx = ladeIndex();
  const gebaut = idx.filter((e) => e.status === 'gebaut');
  const geplant = idx.filter((e) => e.status !== 'gebaut');
  const gesamt = new Map();
  const projekte = [];
  for (const e of gebaut) {
    const z = new Map();
    for (const mod of e.modules) zaehleModul(mod.file, e.id, mod.n, z);
    let treppen = 0, lampen = 0, schilder = 0, bloecke = 0;
    for (const [t, c] of z) {
      bloecke += c;
      gesamt.set(t, (gesamt.get(t) || 0) + c);
      if (PAL.isTreppe(t)) treppen += c;
      else if (PAL.rolesOf(t).includes('licht')) lampen += c;
      else if (PAL.rolesOf(t).includes('schild')) schilder += c;
    }
    const j = projektJson(e.id) || {};
    const b = e.bounds || {};
    projekte.push({
      id: e.id, titel: e.title, typ: e.type, bloecke, module: e.modules.length,
      schritte: e.modules.reduce((a, q) => a + (q.steps || 0), 0),
      hoehe: b.y1 !== undefined ? b.y1 - b.y0 + 1 : 0, ausX: b.x1 - b.x0 + 1, ausZ: b.z1 - b.z0 + 1,
      treppen, lampen, schilder, haeuser: e.type === 'quartier' ? (j.gebaeude || []).length : 0,
      begehbar: j.begehbarkeit === 'pflicht' || e.id === 'duomo'
    });
  }
  const rollen = new Map();
  for (const [t, c] of gesamt) {
    const r = PAL.isTreppe(t) ? 'treppe' : (PAL.rolesOf(t)[0] || t);
    rollen.set(r, (rollen.get(r) || 0) + c);
  }
  const gebaeude = JSON.parse(fs.readFileSync(path.join(ROOT, 'data', 'stadt', 'gebaeude.json'), 'utf8')).gebaeude.length;
  let minecraft = null;
  const mf = path.join(ROOT, 'build', 'minecraft', 'export_ergebnis.json');
  if (fs.existsSync(mf)) minecraft = JSON.parse(fs.readFileSync(mf, 'utf8'));
  const sh = (c) => { try { return execSync(c, { cwd: ROOT, encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'] }).trim(); } catch (e) { return ''; } };
  const jsDateien = sh("git ls-files 'tools/*.js' 'webapp/js/*.js' 'projects/*/model/*.js' 'projects/*/spec/*.js'").split('\n').filter(Boolean)
    .filter((f) => !f.includes('/js/data/v2/'));
  let zeilen = 0;
  for (const f of jsDateien) zeilen += fs.readFileSync(path.join(ROOT, f), 'utf8').split('\n').length;
  const testDateien = fs.readdirSync(path.join(ROOT, 'tools', 'test')).filter((f) => f.endsWith('.test.js'));
  let tests = 0;
  for (const f of testDateien) tests += (fs.readFileSync(path.join(ROOT, 'tools', 'test', f), 'utf8').match(/^test\(/gm) || []).length;
  return {
    projekte, geplant, rollen, gebaeude, minecraft,
    software: { zeilen, jsDateien: jsDateien.length, testDateien: testDateien.length, tests, commits: Number(sh('git rev-list --count HEAD')) || 0,
      dateien: sh('git ls-files').split('\n').filter(Boolean).length, typen: PAL.TYPES.length, treppenTypen: PAL.TYPES.filter(PAL.isTreppe).length,
      regeln: Math.max(...fs.readdirSync(path.join(ROOT, 'tools', 'validate')).map((f) => (/^r(\d+)_/.exec(f) || [0, 0])[1]).map(Number)) },
    stand: new Date().toLocaleDateString('de-DE', { day: 'numeric', month: 'long', year: 'numeric' })
  };
}

const ROLLE_DE = {
  dachziegel: 'Dachziegel', pflaster: 'Pflaster', putz_sand: 'Putz sandfarben', putz_weiss: 'Putz weiß', putz_rosa: 'Putz rosa', putz_gelb: 'Putz gelb',
  putz_grau: 'Putz grau', pietra_serena: 'Pietra serena', pietra_forte: 'Pietra forte', pietra_forte_bruch: 'Bruchstein (Fundament)',
  pietra_forte_rustika: 'Rustika', mauerwerk: 'Mauerwerk', fresko: 'Fresko / Keramik', wasser: 'Wasser (Arno)', gelaende_fels: 'Fels (Böschung)',
  marmor_weiss: 'Marmor weiß', holz: 'Holz', holz_sporto: 'Holz (Vordächer)', glas_fenster: 'Fensterglas', glas: 'Buntglas', treppe: 'Treppenblöcke',
  ziegel_kuppel: 'Ziegel (Kuppeln)', gruen_rasen: 'Rasen', gruen_erde: 'Erde', fensterladen: 'Fensterläden', kontrast_dunkel: 'Tiefenschiefer',
  marmor_gruen: 'Marmor grün', marmor_rot: 'Marmor rot', licht: 'Licht', antik: 'Bruchstein antik', gruen_weg: 'Kies', gruen_baum: 'Laub', gruen_stamm: 'Stämme'
};

function balken(liste, wert, label, farbe) {
  const max = Math.max(...liste.map(wert));
  return `<div class="bars">${liste.map((e) => `<div class="bar"><span class="bl">${esc(label(e))}</span><span class="bt"><span class="bf" style="width:${(wert(e) / max * 100).toFixed(1)}%;background:${farbe}"></span></span><span class="bv">${mio(wert(e))}</span></div>`).join('')}</div>`;
}

function html(S) {
  const P = S.projekte;
  const summe = (f, l = P) => l.reduce((a, e) => a + f(e), 0);
  const wz = P.filter((e) => e.typ === 'wahrzeichen').sort((a, b) => b.bloecke - a.bloecke);
  const qu = P.filter((e) => e.typ === 'quartier').sort((a, b) => b.bloecke - a.bloecke);
  const sg = P.filter((e) => e.typ === 'stadtgrund');
  const zeile = (e) => `<tr><td>${esc(e.titel.replace(/^Quartier /, ''))}${e.haeuser ? ` <span class="mut">(${fmt(e.haeuser)} Häuser)</span>` : ''}</td><td class="n">${fmt(e.bloecke)}</td><td class="n">${e.module}</td><td class="n">${fmt(e.schritte)}</td><td class="n">${m(e.hoehe)}</td><td class="n">${m(e.ausX)} × ${m(e.ausZ)}</td><td class="n">${fmt(e.treppen)}</td><td class="n">${fmt(e.lampen)}</td><td class="n">${e.schilder ? fmt(e.schilder) : '–'}</td><td class="c">${e.begehbar ? '✔' : '–'}</td></tr>`;
  const tab = (titel, l, fuss) => `<h2>${titel}</h2><table><thead><tr><th>Projekt</th><th>Blöcke</th><th>Module</th><th>Bauschritte</th><th>Höhe*</th><th>Ausdehnung</th><th>Treppen</th><th>Lampen</th><th>Schilder</th><th>begehbar</th></tr></thead><tbody>${l.map(zeile).join('')}</tbody>${fuss ? `<tfoot><tr><td>Summe</td><td class="n">${fmt(summe((e) => e.bloecke, l))}</td><td class="n">${summe((e) => e.module, l)}</td><td class="n">${fmt(summe((e) => e.schritte, l))}</td><td></td><td></td><td class="n">${fmt(summe((e) => e.treppen, l))}</td><td class="n">${fmt(summe((e) => e.lampen, l))}</td><td class="n">${fmt(summe((e) => e.schilder, l))}</td><td></td></tr></tfoot>` : ''}</table>`;
  const mats = [...S.rollen].sort((a, b) => b[1] - a[1]).slice(0, 14);
  const M = S.minecraft;
  const hausAnzahl = summe((e) => e.haeuser);
  return `<!doctype html><html lang="de"><head><meta charset="utf-8"><title>Florenz Voxelmodell – Statistik</title><style>
:root{--ink:#1d2430;--mut:#5d6675;--line:#d9dde3;--bg:#fff;--acc:#2a6db0;--soft:#f3f5f8}
*{box-sizing:border-box}body{font:13px/1.45 system-ui,-apple-system,"Segoe UI",sans-serif;color:var(--ink);background:var(--bg);margin:0;padding:28px 34px;max-width:1100px}
h1{font-size:26px;margin:0 0 4px}h2{font-size:16px;margin:26px 0 8px;padding-bottom:4px;border-bottom:1px solid var(--line)}
.sub{color:var(--mut);margin-bottom:18px}.tiles{display:grid;grid-template-columns:repeat(3,1fr);gap:10px}
.tile{background:var(--soft);border-radius:8px;padding:10px 12px}.tile b{display:block;font-size:22px}.tile span{color:var(--mut)}
table{width:100%;border-collapse:collapse;font-variant-numeric:tabular-nums;font-size:11.5px}td.n{white-space:nowrap}th,td{padding:4px 6px;border-bottom:1px solid var(--line);text-align:left;vertical-align:top}
th{font-weight:600;color:var(--mut);font-size:12px}td.n,th:not(:first-child){text-align:right}td.c{text-align:center}tfoot td{font-weight:600;border-top:2px solid var(--ink)}
.mut{color:var(--mut)}.bars{display:grid;gap:4px}.bar{display:grid;grid-template-columns:260px 1fr 90px;gap:8px;align-items:center}
.bt{background:var(--soft);height:12px;border-radius:0 4px 4px 0}.bf{display:block;height:12px;border-radius:0 4px 4px 0}.bv{text-align:right;font-variant-numeric:tabular-nums}
.cols{display:grid;grid-template-columns:1fr 1fr;gap:24px}.note{color:var(--mut);font-size:12px;margin-top:6px}
section{break-inside:avoid}@media print{body{padding:0}h2{break-after:avoid}}
</style></head><body>
<h1>Florenz als Voxelmodell</h1>
<div class="sub">Maßstab 1 : 2 (1 Block = 0,5 m) · Stand ${S.stand} · alle Zahlen gemessen aus den Projektdaten</div>
<div class="tiles">
<div class="tile"><b>${mio(summe((e) => e.bloecke))}</b><span>Blöcke in ${P.length} gebauten Projekten</span></div>
<div class="tile"><b>${fmt(summe((e) => e.schritte))}</b><span>Bauschritte in der Bauanleitung</span></div>
<div class="tile"><b>${fmt(hausAnzahl)}</b><span>Häuser in ${qu.length} Quartieren (von ${fmt(S.gebaeude)} Gebäuden)</span></div>
<div class="tile"><b>${wz.length}</b><span>Wahrzeichen gebaut, ${S.geplant.length} geplant</span></div>
<div class="tile"><b>${fmt(summe((e) => e.schilder))}</b><span>Straßenschilder an Eckhäusern</span></div>
<div class="tile"><b>${M ? mio(M.bloecke) : '–'}</b><span>Blöcke in der Minecraft-Welt${M ? ` (mit Gelände)` : ' (noch kein Export gemessen)'}</span></div>
</div>
<section>${tab('Wahrzeichen', wz, true)}</section>
<section>${tab('Stadtgrund', sg, false)}</section>
<section>${tab('Quartiere', qu, true)}<div class="note">* Höhe vom tiefsten bis zum höchsten Block. ✔ = Begehbarkeits-Standard verbindlich (Türen, Treppen, Böden, Licht; alle Räume erreichbar oder begründet gesperrt).</div></section>
<section><h2>Blöcke je Wahrzeichen</h2>${balken(wz, (e) => e.bloecke, (e) => e.titel, 'var(--acc)')}</section>
<section><h2>Häufigste Materialien (alle Projekte)</h2>${balken(mats.map(([r, c]) => ({ r, c })), (e) => e.c, (e) => ROLLE_DE[e.r] || e.r, 'var(--acc)')}</section>
<section class="cols"><div><h2>Minecraft-Welt (Bedrock)</h2>${M ? `<table><tbody>
<tr><td>Chunks · Subchunks</td><td class="n">${fmt(M.chunks)} · ${fmt(M.subchunks)}</td></tr>
<tr><td>Blöcke gesamt</td><td class="n">${fmt(M.bloecke)}</td></tr><tr><td>davon Projektblöcke</td><td class="n">${fmt(M.projektBloecke)}</td></tr>
<tr><td>Platzhalter-Häuser (noch nicht modellierte Gebäude)</td><td class="n">${fmt(M.haeuser)}</td></tr>
<tr><td>Straßenschilder mit Text</td><td class="n">${fmt(M.schilder || 0)}</td></tr>
<tr><td>Weltgröße</td><td class="n">${(M.dbBytes / 1048576).toLocaleString('de-DE', { maximumFractionDigits: 1 })} MB</td></tr>
<tr><td>Exportdauer</td><td class="n">${Math.round(M.ms / 1000)} s</td></tr></tbody></table>` : '<p class="mut">Noch kein Export gemessen.</p>'}</div>
<div><h2>Software</h2><table><tbody>
<tr><td>Zeilen JavaScript (Pipeline, Modelle, Webapp)</td><td class="n">${fmt(S.software.zeilen)}</td></tr>
<tr><td>JavaScript-Dateien</td><td class="n">${fmt(S.software.jsDateien)}</td></tr>
<tr><td>Prüfregeln</td><td class="n">R1–R${S.software.regeln}</td></tr>
<tr><td>Testdateien · Tests</td><td class="n">${S.software.testDateien} · ${S.software.tests}</td></tr>
<tr><td>Commits · Dateien im Repository</td><td class="n">${fmt(S.software.commits)} · ${fmt(S.software.dateien)}</td></tr>
<tr><td>Blocktypen in der Palette (davon Treppen)</td><td class="n">${S.software.typen} (${S.software.treppenTypen})</td></tr></tbody></table></div></section>
<section><h2>Noch geplant</h2><p>${S.geplant.map((e) => esc(e.title)).join(' · ')}</p></section>
<div class="note">Daten: OpenStreetMap-Mitwirkende (ODbL) · Gelände: Comune di Firenze, DTM LiDAR 2017 (CC BY 4.0)</div>
</body></html>`;
}

async function pdf(htmlDatei, ziel) {
  let pw;
  try { pw = require('playwright'); } catch (e) { pw = require('/opt/node-tools/node_modules/playwright'); }
  const b = await pw.chromium.launch(fs.existsSync('/opt/pw-browsers/chromium') ? { executablePath: '/opt/pw-browsers/chromium' } : {});
  const p = await b.newPage();
  await p.goto('file://' + htmlDatei, { waitUntil: 'load' });
  await p.pdf({ path: ziel, format: 'A4', margin: { top: '14mm', bottom: '14mm', left: '12mm', right: '12mm' }, printBackground: true });
  await b.close();
}

if (require.main === module) {
  (async () => {
    const t0 = Date.now();
    const S = messe();
    fs.writeFileSync(OUT, html(S));
    console.log(`${path.relative(ROOT, OUT)}: ${S.projekte.length} Projekte, ${fmt(S.projekte.reduce((a, e) => a + e.bloecke, 0))} Blöcke (${Date.now() - t0} ms)`);
    const i = process.argv.indexOf('--pdf');
    if (i > 0) { await pdf(OUT, path.resolve(process.argv[i + 1])); console.log('PDF: ' + process.argv[i + 1]); }
  })().catch((e) => { console.error(e); process.exitCode = 1; });
}

module.exports = { messe, html };
