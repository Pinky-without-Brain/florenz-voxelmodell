'use strict';
const { schilderFuerHaus } = require('./schilder.js');
// Quartier-Projekte (V3, ARCHITEKTUR §10): project.json { generator: "quartier", gebaeude: [ids] }.
// Je Isolato ein Modul (nach ID sortiert), je Haus ein Bauteil (Gebäude-ID) in aufsteigender ID-Reihenfolge.

const fs = require('node:fs');
const path = require('node:path');
const P = require('./poly.js');
const A = require('./akte.js');
const { makeParzellen, compareIds } = require('./parzellen.js');
const { umfeldVon } = require('./umfeld.js');
const { Kontext } = require('./kontext.js');
const { bauHaus } = require('./haus.js');
const { bauInnen } = require('./innen.js');
const strassenName = (...a) => require('./akten_entwurf.js').strassenName(...a);
const { loadSpecs } = require('../projects.js');
const { ladeVorrang } = require('../wahrzeichen/projekt.js');

const ROOT = path.resolve(__dirname, '..', '..');
const DEFAULT_DATEN = path.join(ROOT, 'data', 'stadt');
const MAX_MODULE = 511;
const NEIGHBOUR_MARGIN = 7;   // Blöcke: Gebäude in diesem Abstand kommen ins Parzellenraster (Vorsprünge: 2 × Gesimstiefe + 1)
const BUCKET = 64;

const TYP_NAME = {
  casa_a_schiera: 'Reihenhaus', casa_torre: 'Wohnturm', palazzo_rinascimento: 'Renaissance-Palazzo',
  palazzo_cinquecento: 'Palazzo des Cinquecento', palazzo_ottocento: 'Palazzo des Ottocento',
  chiesa_minore: 'Kleine Kirche', loggia: 'Loggia', zweckbau: 'Nebengebäude'
};
const FARBE_NAME = { ocker: 'Ocker', gelb: 'Gelb', rosa: 'Rosa', sand: 'Sand', weiss: 'Weiß', grau: 'Grau', terrakotta: 'Terrakotta' };

// Text zum Innenausbau eines Hauses (Bauteil "<id>_innen"); Zahlen aus dem Innenplan
function innenText(id, a, titel, plan) {
  const n = a.geschosse.length;
  const laden = a.fassade.erdgeschoss.art === 'bottega_arcata';
  const stein = a.typ.startsWith('palazzo') || a.typ === 'chiesa_minore';
  return {
    title: `${titel}: Innenausbau`,
    description: (n > 1 || a.dach.form === 'flach'
      ? `Geschossböden aus Cotto, ein Treppenhaus mit Podesttreppen aus ${stein ? 'Stein' : 'Holz'} bis ${a.dach.form === 'flach' ? 'auf die Dachterrasse' : 'ins oberste Geschoss'}, `
      : 'Ein hoher Raum ohne Obergeschoss, ') +
      `Seelaternen im Boden als Licht${laden ? ', im Erdgeschoss ein Laden mit Theke' : ''}, Tische, Stühle${n > 1 ? ' und Betten' : ''} aus Holz. Vereinfacht, nicht belegt.`,
    tip: 'Erst die Böden Geschoss für Geschoss legen, dann die Treppe von unten nach oben, zuletzt Licht und Möbel.',
    caution: 'Über jeder Stufe bleiben drei Blöcke Luft; das Treppenloch in der Decke darüber nicht schließen.',
    fact: 'Florentiner Wohnhäuser hatten oft Böden aus Cotto (gebranntem Ton) und Holzbalkendecken.'
  };
}

// ------------------------------------------------------------------ Datensatz
const datenCache = new Map();
function ladeDaten(dir) {
  const gf = path.join(dir, 'gebaeude.json'), ff = path.join(dir, 'flaechen.json');
  const key = dir + '|' + fs.statSync(gf).mtimeMs + '|' + (fs.existsSync(ff) ? fs.statSync(ff).mtimeMs : 0);
  const c = datenCache.get(dir);
  if (c && c.key === key) return c;
  const gebaeude = JSON.parse(fs.readFileSync(gf, 'utf8')).gebaeude;
  const flaechen = fs.existsSync(ff) ? JSON.parse(fs.readFileSync(ff, 'utf8')) : {};
  const byId = new Map();
  const buckets = new Map();
  for (const g of gebaeude) {
    byId.set(g.id, g);
    g._bb = P.bbox(P.normalize(g.polygon));
    for (let bx = Math.floor(g._bb.x0 / BUCKET); bx <= Math.floor(g._bb.x1 / BUCKET); bx++) {
      for (let bz = Math.floor(g._bb.z0 / BUCKET); bz <= Math.floor(g._bb.z1 / BUCKET); bz++) {
        const k = bx + ',' + bz;
        let l = buckets.get(k);
        if (!l) buckets.set(k, l = []);
        l.push(g);
      }
    }
  }
  const d = { key, dir, gebaeude, flaechen, byId, buckets };
  datenCache.set(dir, d);
  return d;
}

function nachbarn(daten, g, margin) {
  const bb = g._bb;
  const out = new Set();
  for (let bx = Math.floor((bb.x0 - margin) / BUCKET); bx <= Math.floor((bb.x1 + margin) / BUCKET); bx++) {
    for (let bz = Math.floor((bb.z0 - margin) / BUCKET); bz <= Math.floor((bb.z1 + margin) / BUCKET); bz++) {
      for (const h of daten.buckets.get(bx + ',' + bz) || []) {
        if (h.id === g.id) continue;
        const b = h._bb;
        if (b.x0 <= bb.x1 + margin && bb.x0 - margin <= b.x1 && b.z0 <= bb.z1 + margin && bb.z0 - margin <= b.z1) out.add(h);
      }
    }
  }
  return out;
}

// ------------------------------------------------------------------ Laden
const cache = new WeakMap();

/**
 * loadQuartier(project) -> Quartier-Daten (je Projektobjekt gecacht; Fehler werden erneut geworfen).
 * Wirft bei unbekannten Gebäude-IDs und Gebäuden außerhalb des Geländerasters.
 */
function loadQuartier(project) {
  const hit = cache.get(project);
  if (hit) {
    if (hit.error) throw hit.error;
    return hit.q;
  }
  try {
    const q = baue(project);
    cache.set(project, { q });
    return q;
  } catch (e) {
    cache.set(project, { error: e });
    throw e;
  }
}

function baue(project) {
  const meta = project.meta;
  if (meta.generator !== 'quartier') throw new Error(`Projekt ${project.id}: generator "quartier" erwartet`);
  if (!Array.isArray(meta.gebaeude) || !meta.gebaeude.length) throw new Error(`Projekt ${project.id}: "gebaeude" muss eine nichtleere ID-Liste sein`);
  const dir = project.dir || ROOT;
  const datenDir = meta.daten ? path.resolve(dir, meta.daten) : DEFAULT_DATEN;
  const daten = ladeDaten(datenDir);
  const specs = loadSpecs(project);
  const ground = specs.ground;
  const ids = [...new Set(meta.gebaeude)].sort(compareIds);
  const unbekannt = ids.filter((id) => !daten.byId.has(id));
  if (unbekannt.length) throw new Error(`Projekt ${project.id}: unbekannte Gebäude-IDs: ${unbekannt.slice(0, 10).join(', ')}${unbekannt.length > 10 ? ' …' : ''}`);

  // Gebäude, die über das Geländeraster hinausragen, stehen dort auf dem Randwert (ground_stadt klemmt die Abfrage)

  // Parzellenraster aus Projektgebäuden und direkten Nachbarn
  // Wahrzeichen-Vorrang (data/stadt/vorrang.json): eigene Polygone, kein Haus
  const vorrangMap = ladeVorrang(datenDir);
  const imVorrang = ids.filter((id) => vorrangMap.has(id));
  if (imVorrang.length) {
    throw new Error(`Projekt ${project.id}: Wahrzeichen-Gebäude gehören nicht in ein Quartier: ${imVorrang.map((id) => `${id} (${vorrangMap.get(id)})`).join(', ')}`);
  }
  const projekt = new Set(ids);
  const alle = new Map();
  const vorrang = new Map(); // id -> { id, polygon, projekt }
  for (const id of ids) {
    const g = daten.byId.get(id);
    alle.set(id, g);
    for (const h of nachbarn(daten, g, NEIGHBOUR_MARGIN)) {
      if (vorrangMap.has(h.id)) vorrang.set(h.id, { id: h.id, polygon: h.polygon, projekt: vorrangMap.get(h.id) });
      else alle.set(h.id, h);
    }
  }
  const vorrangListe = [...vorrang.values()].sort((a, b) => compareIds(a.id, b.id));
  const parz = makeParzellen([...alle.values()], { vorrang: vorrangListe });
  const umfeld = umfeldVon(daten.flaechen);

  // Akten
  const aktenDir = path.join(dir, 'hausakten');
  const aktenRoh = new Map();
  const aktenFehler = new Map();
  const akten = new Map();
  for (const id of ids) {
    const f = path.join(aktenDir, id + '.json');
    if (!fs.existsSync(f)) continue;
    let a;
    try { a = JSON.parse(fs.readFileSync(f, 'utf8')); } catch (e) { aktenFehler.set(id, [`Akte nicht lesbar (${e.message})`]); continue; }
    aktenRoh.set(id, a);
    const fe = A.validiere(a);
    if (a && a.id !== id) fe.unshift(`id "${a && a.id}" passt nicht zum Dateinamen ${id}.json`);
    if (fe.length) aktenFehler.set(id, fe); else akten.set(id, a);
  }
  let aktenDateien = [];
  try { aktenDateien = fs.readdirSync(aktenDir).filter((n) => n.endsWith('.json')).map((n) => n.slice(0, -5)); } catch (e) { aktenDateien = []; }

  const kontext = new Kontext({ parz, umfeld, groundTopY: ground.groundTopY, akten, projekt, byId: alle });

  // Isolati -> Module
  const jeIsolato = new Map();
  for (const id of ids) {
    const iso = daten.byId.get(id).isolato || 'I0000';
    if (!jeIsolato.has(iso)) jeIsolato.set(iso, []);
    jeIsolato.get(iso).push(id);
  }
  const isolati = [...jeIsolato.keys()].sort().map((iso, index) => ({ index, id: iso, ids: jeIsolato.get(iso).slice().sort(compareIds) }));
  if (isolati.length > MAX_MODULE + 1) throw new Error(`Projekt ${project.id}: ${isolati.length} Isolati, höchstens ${MAX_MODULE + 1} Module möglich`);

  const strassen = new Map(); // id -> Straßenname oder null
  const strasseVon = (id) => {
    if (!strassen.has(id)) strassen.set(id, strassenName(daten.byId.get(id), umfeld));
    return strassen.get(id);
  };
  for (const iso of isolati) {
    const zaehl = new Map();
    for (const id of iso.ids) { const s = strasseVon(id); if (s) zaehl.set(s, (zaehl.get(s) || 0) + 1); }
    let best = null;
    for (const [s, n] of [...zaehl].sort((a, b) => (b[1] - a[1]) || (a[0] < b[0] ? -1 : 1))) { best = s; break; }
    iso.strasse = best;
    iso.title = best ? `Isolato ${iso.id} – ${best}` : `Isolato ${iso.id}`;
  }

  const schilder = new Map(); // "x,y,z" -> { name, text, richtung } (Minecraft-Export)
  const q = {
    schilder,
    project, ids, byId: daten.byId, alle, parz, vorrang: vorrangListe, vorrangIds: new Set(vorrang.keys()), umfeld, ground, kontext, isolati, projekt,
    datenDir, flaechen: daten.flaechen, aktenDir, akten, aktenRoh, aktenFehler, aktenDateien, strasseVon,
    adjazenz: () => parz.adjazenz(),
    moduleNummern: () => isolati.map((i) => i.index),
    hausTitel(id) {
      const a = akten.get(id);
      if (a && a.name) return a.name;
      const g = daten.byId.get(id);
      if (a && g && g.name) return g.name;
      const s = strasseVon(id);
      return a && s ? `${TYP_NAME[a.typ]} an ${s}` : `Haus ${id}`;
    },
    contentFor(index) {
      const iso = isolati[index];
      if (!iso) return null;
      const parts = {};
      for (const id of iso.ids) {
        const a = akten.get(id);
        const titel = q.hausTitel(id);
        if (!a) {
          parts[id] = { title: titel, description: `Haus ${id}: keine gültige Hausakte vorhanden, es wird nichts gebaut.`,
            tip: 'Zuerst die Hausakte ergänzen.', caution: 'Ohne Akte entsteht kein Haus.', fact: 'Keine Angaben.' };
          continue;
        }
        const farbe = a.fassade.putzfarbe ? `Putzfarbe ${FARBE_NAME[a.fassade.putzfarbe]}` : 'Natursteinfassade';
        const sicher = a.sicherheit >= 0.5 ? 'belegt' : 'geschätzt';
        parts[id] = {
          title: titel,
          description: `${TYP_NAME[a.typ]} (${a.epoche}), ${a.geschosse.length} ${a.geschosse.length === 1 ? 'Geschoss' : 'Geschosse'}, ${farbe}. ` +
            `Quelle: ${a.quelle}, Angaben ${sicher} (Sicherheit ${String(a.sicherheit).replace('.', ',')}).`,
          tip: 'Erst Sockel und Bodenplatte setzen, dann die Wände Lage für Lage, zuletzt das Dach.',
          caution: 'Die Öffnungen der Fassade bleiben frei; Glas und Rahmen kommen mit der jeweiligen Wandlage.',
          fact: `Typologische Rekonstruktion aus dem OSM-Grundriss; die Angaben der Hausakte sind ${sicher}.`
        };
        parts[id + '_innen'] = innenText(id, a, titel);
      }
      parts.strassenschilder = { title: 'Straßenschilder',
        description: 'An den Eckhäusern hängt je Straße ein Schild mit dem Straßennamen, 3,5 m über der Straße an der Fassade nahe der Ecke.',
        tip: 'Das Schild sitzt an einer massiven Wandzelle und zeigt zur Straße.', caution: 'In Minecraft trägt das Schild den Namen; hier ist es ein heller Block.',
        fact: 'In Florenz hängen an den Straßenecken weiße Marmortafeln mit dem Straßennamen.' };
      return { module: index, title: iso.title, subtitle: `${project.title}: ${iso.ids.length} ${iso.ids.length === 1 ? 'Haus' : 'Häuser'}`,
        icon: '🏠', parts };
    },
    moduleBuild(index) {
      const iso = isolati[index];
      return {
        module: index,
        build(ctx) {
          for (const id of iso.ids) {
            const w = ctx.part(id, {});
            ctx.grundriss(kontext.parz.cellsOf(id)); // nur Metadaten für R13, ändert keine Blöcke
            const a = akten.get(id);
            if (!a) continue;
            bauHaus(w, daten.byId.get(id), a, kontext);
            // Innenausbau als eigenes Bauteil nach dem Rohbau (BEGEHBARKEIT §4)
            const plan = kontext.plan(id, a);
            if (plan && !plan.leer && plan.innen) {
              bauInnen(ctx.part(id + '_innen', {}), plan);
              for (const u of plan.innen.unzugaenglich) ctx.unzugaenglich(u.zellen, u.begruendung);
            }
          }
          // Straßenschilder an den Eckhäusern dieses Isolats (nach allen Häusern: die Wände müssen stehen)
          const liste = [];
          for (const id of iso.ids) {
            const plan = akten.has(id) ? kontext.plan(id, akten.get(id)) : null;
            if (!plan || plan.leer || !plan.cells) continue;
            liste.push(...schilderFuerHaus({ id, cells: plan.cells, boden: plan.boden }, {
              umfeld, groundTopY: kontext.groundTopY, hat: (x, y, z) => ctx.grid.has(x, y, z),
              beanspruche: (x, y, z, hid) => kontext.beanspruche(x, y, z, hid),
              frei: (x, z) => parz.owner(x, z) === null
            }));
          }
          if (liste.length) {
            const w = ctx.part('strassenschilder', {});
            for (const sch of liste) { w.set(sch.x, sch.y, sch.z, sch.typ); schilder.set(sch.x + ',' + sch.y + ',' + sch.z, sch); }
          }
        }
      };
    }
  };
  return q;
}

/** Cache eines Projekts freigeben (große Läufe: --all, --cross). */
function vergiss(project) { cache.delete(project); }

module.exports = { vergiss, loadQuartier, ladeDaten, TYP_NAME, MAX_MODULE };
