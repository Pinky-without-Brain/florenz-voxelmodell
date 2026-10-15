'use strict';
// Projektfelder von Wahrzeichen (project.json) und Wahrzeichen-Vorrang.

const fs = require('node:fs');
const path = require('node:path');
const { Maske, ladeGebaeude } = require('./maske.js');
const { makeRahmen } = require('./rahmen.js');

const ROOT = path.resolve(__dirname, '..', '..');

/** Vorrang-Datei eines Datenordners -> Map osm-id -> Projekt-id (leer, wenn die Datei fehlt). */
function ladeVorrang(datenDir) {
  const f = path.join(datenDir, 'vorrang.json');
  const m = new Map();
  if (!fs.existsSync(f)) return m;
  const j = JSON.parse(fs.readFileSync(f, 'utf8'));
  for (const [id, projekt] of Object.entries(j.ids || {})) m.set(id, projekt);
  return m;
}

/** wahrzeichenVorrang(root) -> Map osm-id -> Projekt-id aus <root>/data/stadt/vorrang.json. */
function wahrzeichenVorrang(root = ROOT) {
  return ladeVorrang(path.join(root, 'data', 'stadt'));
}

const isNum = (v) => typeof v === 'number' && Number.isFinite(v);
// Bis wohin baut der Stadtgrund in den Spalten einer Maske? boden = bis bodenY − 1, frei = bis groundTopY
const GELAENDE_BIS = ['boden', 'frei'];

/** Prüft die Felder eines Wahrzeichens (type "wahrzeichen"); -> Liste von Problemtexten. "ohneMaske": true schaltet ab. */
function pruefeFelder(json) {
  const p = [];
  if (json.ohneMaske === true) return p;
  const idsOk = (a) => Array.isArray(a) && a.length > 0 && a.every((s) => typeof s === 'string' && s);
  // Hauptmaske aus Gebäuden oder (Brücken) aus Flächen von flaechen.json: "gebaeude": [] mit "flaechen": [...]
  const nurFlaechen = Array.isArray(json.gebaeude) && json.gebaeude.length === 0 && idsOk(json.flaechen);
  if (!idsOk(json.gebaeude) && !nurFlaechen) p.push('gebaeude muss eine nichtleere Liste von OSM-IDs sein (oder [] mit nichtleeren "flaechen")');
  if (json.flaechen !== undefined && !idsOk(json.flaechen)) p.push('flaechen muss eine nichtleere Liste von OSM-IDs sein');
  if (!isNum(json.bodenY)) p.push('bodenY muss eine Zahl sein');
  const r = json.rahmen;
  if (!r || typeof r !== 'object' || !isNum(r.ox) || !isNum(r.oz) || !isNum(r.thetaDeg)) {
    p.push('rahmen muss { ox, oz, thetaDeg } (Zahlen) enthalten');
  }
  if (json.luftraum !== undefined && !(isNum(json.luftraum) && json.luftraum >= 0)) p.push('luftraum muss eine Zahl >= 0 sein');
  if (json.gelaendeBis !== undefined && !GELAENDE_BIS.includes(json.gelaendeBis)) p.push(`gelaendeBis muss ${GELAENDE_BIS.join('|')} sein`);
  if (json.hauptGrenzen !== undefined) {
    const h = json.hauptGrenzen;
    if (!h || typeof h !== 'object') p.push('hauptGrenzen muss ein Objekt sein');
    else for (const k of ['xMin', 'xMax', 'zMin', 'zMax']) if (h[k] !== undefined && !isNum(h[k])) p.push(`hauptGrenzen.${k} muss eine Zahl sein`);
  }
  if (json.masken !== undefined) {
    if (!json.masken || typeof json.masken !== 'object' || Array.isArray(json.masken)) p.push('masken muss ein Objekt sein');
    else {
      for (const [name, s] of Object.entries(json.masken)) {
        const hatG = s && s.gebaeude !== undefined, hatF = s && s.flaechen !== undefined;
        if (!s || (!hatG && !hatF)) p.push(`masken.${name} braucht gebaeude oder flaechen`);
        else if ((hatG && !idsOk(s.gebaeude)) || (hatF && !idsOk(s.flaechen))) p.push(`masken.${name}.gebaeude/flaechen muss eine nichtleere ID-Liste sein`);
        else {
          for (const k of ['xMin', 'xMax', 'zMin', 'zMax']) if (s[k] !== undefined && !isNum(s[k])) p.push(`masken.${name}.${k} muss eine Zahl sein`);
          if (s.abzugAlle !== undefined && typeof s.abzugAlle !== 'boolean') p.push(`masken.${name}.abzugAlle muss true/false sein`);
          if (s.gelaendeBis !== undefined && !GELAENDE_BIS.includes(s.gelaendeBis)) p.push(`masken.${name}.gelaendeBis muss ${GELAENDE_BIS.join('|')} sein`);
          if (s.abzugProjekte !== undefined && !(Array.isArray(s.abzugProjekte) && s.abzugProjekte.every((x) => typeof x === 'string'))) {
            p.push(`masken.${name}.abzugProjekte muss eine Liste von Projekt-IDs sein`);
          }
        }
      }
    }
  }
  return p;
}

// Hauptgebäude eines anderen Projekts: dessen project.json, sonst die Vorrang-Einträge
function gebaeudeVon(pid, root, projectsRoot, vorrang, byId) {
  const j = projektJson(pid, root, projectsRoot);
  if (j && Array.isArray(j.gebaeude)) return j.gebaeude;
  return [...vorrang].filter(([id, p]) => p === pid && byId.has(id)).map(([id]) => id);
}

function projektJson(pid, root, projectsRoot) {
  const f = path.join(projectsRoot || path.join(root, 'projects'), pid, 'project.json');
  return fs.existsSync(f) ? JSON.parse(fs.readFileSync(f, 'utf8')) : null;
}

/**
 * ladeMasken(projectJson, { dir?, root?, projectsRoot? }) ->
 *   { id, haupt, masken: { name: Maske }, alle, luftraum, bodenY, rahmen, gelaendeBis: { haupt, <name>... } }
 * haupt: Gebäude aus "gebaeude", vereinigt mit den Flächen aus "flaechen" (Brücken: "gebaeude": [])
 * dir: Projektordner (für "daten", relativ dazu); root: Repository-Wurzel (Vorgabe: dieses Repository).
 * masken.<name>: { gebaeude? | flaechen?, xMin?, xMax?, zMin?, zMax?, abzugHaupt?, abzugProjekte?, abzugAlle?, gelaendeBis? }
 *   -> Vereinigung der Gebäude- und Flächenpolygone, beschnitten auf x/z, abzüglich der genannten Masken.
 *   abzugAlle: von den abzugProjekte wird die Gesamtmaske (Haupt- und Zusatzmasken) abgezogen, sonst nur die Hauptgebäude.
 * gelaendeBis: Vorgabe "boden" für die Hauptmaske, "frei" für Zusatzmasken (Stadtgrund, Welle 2).
 * alle = Vereinigung von haupt und allen Zusatzmasken.
 */
function ladeMasken(projectJson, opts = {}, _besucht = new Set()) {
  const root = opts.root || ROOT;
  const daten = projectJson.daten ? path.resolve(opts.dir || root, projectJson.daten) : undefined;
  const byId = ladeGebaeude(daten);
  const vorrang = wahrzeichenVorrang(root);
  const besucht = new Set(_besucht).add(projectJson.id);
  const abzugVon = (s, haupt) => {
    const abzug = [];
    if (s.abzugHaupt) abzug.push(haupt);
    for (const pid of s.abzugProjekte || []) {
      if (pid === projectJson.id) { if (!s.abzugHaupt) abzug.push(haupt); continue; }
      const j = s.abzugAlle ? projektJson(pid, root, opts.projectsRoot) : null;
      if (j && j.type === 'wahrzeichen' && Array.isArray(j.gebaeude) && !besucht.has(pid)) {
        abzug.push(ladeMasken(j, { root, projectsRoot: opts.projectsRoot, dir: path.join(opts.projectsRoot || path.join(root, 'projects'), pid) }, besucht).alle);
        continue;
      }
      const ids = gebaeudeVon(pid, root, opts.projectsRoot, vorrang, byId).filter((id) => byId.has(id));
      if (ids.length) abzug.push(Maske.ausGebaeude(ids, { daten }));
    }
    return abzug;
  };
  // Hauptmaske, optional beschnitten (hauptGrenzen: { xMin, xMax, zMin, zMax, abzugProjekte, abzugAlle })
  const hg = projectJson.hauptGrenzen || {};
  let haupt = Maske.ausGebaeude(projectJson.gebaeude, { daten, xMin: hg.xMin, xMax: hg.xMax, zMin: hg.zMin, zMax: hg.zMax });
  if (projectJson.flaechen) haupt = haupt.union(Maske.ausFlaechen(projectJson.flaechen, { daten, xMin: hg.xMin, xMax: hg.xMax, zMin: hg.zMin, zMax: hg.zMax }));
  if (hg.abzugProjekte) { const a = abzugVon({ ...hg, abzugHaupt: false }, null).filter(Boolean); if (a.length) haupt = haupt.minus(...a); }
  const masken = {};
  const gelaendeBis = { haupt: projectJson.gelaendeBis || 'boden' };
  for (const [name, s] of Object.entries(projectJson.masken || {})) {
    const abzug = abzugVon(s, haupt);
    const grenzen = { daten, xMin: s.xMin, xMax: s.xMax, zMin: s.zMin, zMax: s.zMax };
    const teile = [];
    if (s.gebaeude) teile.push(Maske.ausGebaeude(s.gebaeude, grenzen));
    if (s.flaechen) teile.push(Maske.ausFlaechen(s.flaechen, grenzen));
    let m = teile.length > 1 ? teile[0].union(...teile.slice(1)) : teile[0];
    if (abzug.length) m = m.minus(...abzug);
    masken[name] = m;
    gelaendeBis[name] = s.gelaendeBis || 'frei';
  }
  const alle = haupt.union(...Object.values(masken));
  return { id: projectJson.id, haupt, masken, alle, luftraum: projectJson.luftraum || 0,
    bodenY: projectJson.bodenY, rahmen: projectJson.rahmen ? makeRahmen(projectJson.rahmen) : null, gelaendeBis };
}

/**
 * Aussparungen des Stadtgrunds (data/stadt/aussparung.json): Spalten, in denen der Stadtgrund nichts baut, weil ein
 * Wahrzeichen dort von unten an baut (z. B. Brückenpfeiler im Arno). -> { eintraege, zellen: Set(P.ck), hat(x, z) }
 */
function ladeAussparung(datenDir = path.join(ROOT, 'data', 'stadt')) {
  const P = require('../city/poly.js');
  const f = path.join(datenDir, 'aussparung.json');
  const zellen = new Set();
  const eintraege = fs.existsSync(f) ? JSON.parse(fs.readFileSync(f, 'utf8')).eintraege || [] : [];
  for (const e of eintraege) {
    const r = makeRahmen(e.rahmen);
    const ecken = [[e.u[0], e.w[0]], [e.u[0], e.w[1]], [e.u[1], e.w[0]], [e.u[1], e.w[1]]].map(([u, w]) => r.toWorld(u, w));
    const xs = ecken.map((c) => c.x), zs = ecken.map((c) => c.z);
    for (let x = Math.floor(Math.min(...xs)); x <= Math.ceil(Math.max(...xs)); x++) {
      for (let z = Math.floor(Math.min(...zs)); z <= Math.ceil(Math.max(...zs)); z++) {
        const l = r.toLocal(x, z);
        if (l.u >= e.u[0] && l.u < e.u[1] && l.w >= e.w[0] && l.w < e.w[1]) zellen.add(P.ck(x, z));
      }
    }
  }
  return { eintraege, zellen, hat: (x, z) => zellen.has(P.ck(x, z)) };
}

module.exports = { ladeMasken, wahrzeichenVorrang, ladeVorrang, pruefeFelder, ladeAussparung, GELAENDE_BIS };
