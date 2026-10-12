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

/** Prüft die Felder eines Wahrzeichens (type "wahrzeichen"); -> Liste von Problemtexten. "ohneMaske": true schaltet ab. */
function pruefeFelder(json) {
  const p = [];
  if (json.ohneMaske === true) return p;
  const idsOk = (a) => Array.isArray(a) && a.length > 0 && a.every((s) => typeof s === 'string' && s);
  if (!idsOk(json.gebaeude)) p.push('gebaeude muss eine nichtleere Liste von OSM-IDs sein');
  if (!isNum(json.bodenY)) p.push('bodenY muss eine Zahl sein');
  const r = json.rahmen;
  if (!r || typeof r !== 'object' || !isNum(r.ox) || !isNum(r.oz) || !isNum(r.thetaDeg)) {
    p.push('rahmen muss { ox, oz, thetaDeg } (Zahlen) enthalten');
  }
  if (json.luftraum !== undefined && !(isNum(json.luftraum) && json.luftraum >= 0)) p.push('luftraum muss eine Zahl >= 0 sein');
  if (json.masken !== undefined) {
    if (!json.masken || typeof json.masken !== 'object' || Array.isArray(json.masken)) p.push('masken muss ein Objekt sein');
    else {
      for (const [name, s] of Object.entries(json.masken)) {
        if (!s || !idsOk(s.gebaeude)) p.push(`masken.${name}.gebaeude muss eine nichtleere ID-Liste sein`);
        else {
          for (const k of ['xMin', 'xMax']) if (s[k] !== undefined && !isNum(s[k])) p.push(`masken.${name}.${k} muss eine Zahl sein`);
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
  const f = path.join(projectsRoot || path.join(root, 'projects'), pid, 'project.json');
  if (fs.existsSync(f)) {
    const j = JSON.parse(fs.readFileSync(f, 'utf8'));
    if (Array.isArray(j.gebaeude)) return j.gebaeude;
  }
  return [...vorrang].filter(([id, p]) => p === pid && byId.has(id)).map(([id]) => id);
}

/**
 * ladeMasken(projectJson, { dir?, root?, projectsRoot? }) ->
 *   { id, haupt, masken: { name: Maske }, alle, luftraum, bodenY, rahmen }
 * dir: Projektordner (für "daten", relativ dazu); root: Repository-Wurzel (Vorgabe: dieses Repository).
 * masken.<name>: { gebaeude, xMin?, xMax?, abzugHaupt?, abzugProjekte? } -> Maske abzüglich der genannten Masken.
 * alle = Vereinigung von haupt und allen Zusatzmasken.
 */
function ladeMasken(projectJson, opts = {}) {
  const root = opts.root || ROOT;
  const daten = projectJson.daten ? path.resolve(opts.dir || root, projectJson.daten) : undefined;
  const byId = ladeGebaeude(daten);
  const haupt = Maske.ausGebaeude(projectJson.gebaeude, { daten });
  const vorrang = wahrzeichenVorrang(root);
  const masken = {};
  for (const [name, s] of Object.entries(projectJson.masken || {})) {
    const abzug = [];
    if (s.abzugHaupt) abzug.push(haupt);
    for (const pid of s.abzugProjekte || []) {
      if (pid === projectJson.id) { if (!s.abzugHaupt) abzug.push(haupt); continue; }
      const ids = gebaeudeVon(pid, root, opts.projectsRoot, vorrang, byId).filter((id) => byId.has(id));
      if (ids.length) abzug.push(Maske.ausGebaeude(ids, { daten }));
    }
    masken[name] = Maske.ausGebaeude(s.gebaeude, { daten, xMin: s.xMin, xMax: s.xMax, abzug });
  }
  const alle = haupt.union(...Object.values(masken));
  return { id: projectJson.id, haupt, masken, alle, luftraum: projectJson.luftraum || 0,
    bodenY: projectJson.bodenY, rahmen: projectJson.rahmen ? makeRahmen(projectJson.rahmen) : null };
}

module.exports = { ladeMasken, wahrzeichenVorrang, ladeVorrang, pruefeFelder };
