'use strict';
// Hausakte: erlaubte Werte, Prüfung gegen 20_Stadtmodell_Florenz/HAUSAKTE_SCHEMA.md und Merkmalsvergleich.
// Die Aufzählungen zu geschosse.art, material, erdgeschoss.*, fenster.*, gesims.art und dach.* hat C1 festgelegt
// (das Schema nennt sie nur beispielhaft); siehe HAUSAKTE_SCHEMA.md, Abschnitt "C1-Festlegungen".

const ENUM = Object.freeze({
  typ: ['casa_a_schiera', 'casa_torre', 'palazzo_rinascimento', 'palazzo_cinquecento', 'palazzo_ottocento',
    'chiesa_minore', 'loggia', 'zweckbau'],
  geschossArt: ['eg', 'mezzanin', 'nobile', 'og', 'attika'],
  material: ['putz', 'bugnato_abgestuft', 'bugnato_glatt', 'bruchstein', 'stein_glatt'],
  putzfarbe: ['ocker', 'gelb', 'rosa', 'sand', 'weiss', 'grau', 'terrakotta'],
  egArt: ['portal_mittig', 'portal_seitlich', 'bottega_arcata', 'tor_und_fenster', 'geschlossen', 'loggia_offen',
    'portal_giebel'],
  egFenster: ['rechteck', 'rechteck_vergittert', 'kniefenster', 'rundbogen', 'keine'],
  fensterTyp: ['rechteck', 'rundbogen', 'bifora', 'tabernakel', 'rahmen_stuck'],
  rahmen: ['pietra_forte', 'pietra_serena', 'putz', 'keiner'],
  laeden: ['gruen', 'holz'],
  marcapiano: ['keiner', 'flach', 'vor'],
  gesimsArt: ['keiner', 'gronda_holz', 'putzgesims', 'cornicione_stein'],
  dachForm: ['walm', 'sattel', 'flach'],
  dachMaterial: ['coppi', 'terrasse']
});

const QUELLE_RE = /^(typologie|foto:mapillary:.+|foto:commons:.+|recherche:.+)$/;
const TOP_KEYS = ['id', 'typ', 'epoche', 'geschosse', 'fassade', 'dach', 'quelle', 'sicherheit', 'notiz', 'name', 'ensemble'];
const FASSADE_KEYS = ['kanten', 'achsen', 'material', 'putzfarbe', 'erdgeschoss', 'fenster', 'gesims', 'extras', 'eckquader', 'marcapiano'];

const isObj = (v) => v !== null && typeof v === 'object' && !Array.isArray(v);
const isInt = (v) => Number.isInteger(v);

/** Prüft eine Akte; Rückgabe: Liste von Fehlertexten (leer = gültig). */
function validiere(a) {
  const err = [];
  const need = (cond, msg) => { if (!cond) err.push(msg); };
  if (!isObj(a)) return ['Akte ist kein Objekt'];
  const unknown = (o, keys, where) => { for (const k of Object.keys(o)) if (!keys.includes(k)) err.push(`unbekanntes Feld ${where}${k}`); };
  unknown(a, TOP_KEYS, '');
  need(typeof a.id === 'string' && a.id.length > 0, 'id fehlt');
  need(ENUM.typ.includes(a.typ), `typ ungültig (${a.typ})`);
  need(typeof a.epoche === 'string' && a.epoche.length > 0, 'epoche fehlt');
  if (!Array.isArray(a.geschosse) || a.geschosse.length === 0) err.push('geschosse fehlt oder leer');
  else {
    a.geschosse.forEach((g, i) => {
      if (!isObj(g)) { err.push(`geschosse[${i}] kein Objekt`); return; }
      need(ENUM.geschossArt.includes(g.art), `geschosse[${i}].art ungültig (${g.art})`);
      need(isInt(g.hoeheBl) && g.hoeheBl >= 3 && g.hoeheBl <= 16, `geschosse[${i}].hoeheBl muss eine Ganzzahl 3..16 sein`);
    });
    need(a.geschosse[0] && a.geschosse[0].art === 'eg', 'das erste Geschoss muss art "eg" haben');
  }
  const f = a.fassade;
  if (!isObj(f)) err.push('fassade fehlt');
  else {
    unknown(f, FASSADE_KEYS, 'fassade.');
    need(f.kanten === 'strasse' || (Array.isArray(f.kanten) && f.kanten.every((i) => isInt(i) && i >= 0)),
      'fassade.kanten muss "strasse" oder eine Liste von Kantenindizes sein');
    need(isInt(f.achsen) && f.achsen >= 1 && f.achsen <= 15, 'fassade.achsen muss eine Ganzzahl 1..15 sein');
    need(ENUM.material.includes(f.material), `fassade.material ungültig (${f.material})`);
    need(f.putzfarbe === null || ENUM.putzfarbe.includes(f.putzfarbe), `fassade.putzfarbe ungültig (${f.putzfarbe})`);
    if (f.material === 'putz') need(f.putzfarbe !== null, 'fassade.putzfarbe fehlt bei material "putz"');
    const e = f.erdgeschoss;
    if (!isObj(e)) err.push('fassade.erdgeschoss fehlt');
    else {
      need(ENUM.egArt.includes(e.art), `fassade.erdgeschoss.art ungültig (${e.art})`);
      need(e.portalBreiteBl === undefined || (isInt(e.portalBreiteBl) && e.portalBreiteBl >= 3 && e.portalBreiteBl <= 11),
        'fassade.erdgeschoss.portalBreiteBl muss 3..11 sein');
      need(ENUM.egFenster.includes(e.fenster), `fassade.erdgeschoss.fenster ungültig (${e.fenster})`);
    }
    const w = f.fenster;
    if (!isObj(w)) err.push('fassade.fenster fehlt');
    else {
      need(ENUM.fensterTyp.includes(w.typ), `fassade.fenster.typ ungültig (${w.typ})`);
      need(ENUM.rahmen.includes(w.rahmen), `fassade.fenster.rahmen ungültig (${w.rahmen})`);
      need(w.laeden === null || w.laeden === false || ENUM.laeden.includes(w.laeden), `fassade.fenster.laeden ungültig (${w.laeden})`);
    }
    const g = f.gesims;
    if (!isObj(g)) err.push('fassade.gesims fehlt');
    else {
      need(ENUM.gesimsArt.includes(g.art), `fassade.gesims.art ungültig (${g.art})`);
      need(isInt(g.tiefeBl) && g.tiefeBl >= 0 && g.tiefeBl <= 3, 'fassade.gesims.tiefeBl muss 0..3 sein');
      if (g.art === 'keiner') need(g.tiefeBl === 0, 'fassade.gesims.tiefeBl muss 0 sein bei art "keiner"');
      else need(g.tiefeBl >= 1, 'fassade.gesims.tiefeBl muss 1..3 sein');
    }
    need(Array.isArray(f.extras) && f.extras.every((x) => typeof x === 'string'), 'fassade.extras muss eine Liste von Texten sein');
    need(f.eckquader === undefined || typeof f.eckquader === 'boolean', 'fassade.eckquader muss true/false sein');
    need(f.marcapiano === undefined || ENUM.marcapiano.includes(f.marcapiano), `fassade.marcapiano ungültig (${f.marcapiano})`);
  }
  const d = a.dach;
  if (!isObj(d)) err.push('dach fehlt');
  else {
    need(ENUM.dachForm.includes(d.form), `dach.form ungültig (${d.form})`);
    need(ENUM.dachMaterial.includes(d.material), `dach.material ungültig (${d.material})`);
    need(typeof d.altana === 'boolean', 'dach.altana muss true/false sein');
    need(d.kamine === undefined || (isInt(d.kamine) && d.kamine >= 0 && d.kamine <= 3), 'dach.kamine muss eine Ganzzahl 0..3 sein');
  }
  need(typeof a.quelle === 'string' && QUELLE_RE.test(a.quelle), `quelle ungültig (${a.quelle})`);
  need(typeof a.sicherheit === 'number' && a.sicherheit >= 0 && a.sicherheit <= 1, 'sicherheit muss 0..1 sein');
  need(typeof a.notiz === 'string', 'notiz fehlt');
  need(a.name === undefined || a.name === null || typeof a.name === 'string', 'name muss ein Text sein');
  need(a.ensemble === undefined || (typeof a.ensemble === 'string' && a.ensemble.length > 0), 'ensemble muss ein nicht-leerer Text sein');
  return err;
}

// Merkmale der Nachbarschaftsregel (HAUSAKTE §4 Regel 2)
const MERKMALE = ['putzfarbe', 'achsen', 'fenster.typ', 'gesims.art', 'erdgeschoss.art'];
function merkmale(a) {
  return [a.fassade.putzfarbe, a.fassade.achsen, a.fassade.fenster.typ, a.fassade.gesims.art, a.fassade.erdgeschoss.art];
}
/** Anzahl der Merkmale, in denen zwei Akten verschieden sind. */
function unterschiede(a, b) {
  const x = merkmale(a), y = merkmale(b);
  let n = 0;
  for (let i = 0; i < x.length; i++) if (x[i] !== y[i]) n++;
  return n;
}
/** Nachbarschaftsregel erfüllt? (>= 2 Unterschiede, oder gemeinsames Ensemble) */
function nachbarnOk(a, b) {
  if (a.ensemble && a.ensemble === b.ensemble) return true;
  return unterschiede(a, b) >= 2;
}

const summeHoehe = (a) => a.geschosse.reduce((s, g) => s + g.hoeheBl, 0);

module.exports = { ENUM, MERKMALE, validiere, merkmale, unterschiede, nachbarnOk, summeHoehe };
