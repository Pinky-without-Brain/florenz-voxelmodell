'use strict';
// Fassaden des Hausgenerators (V3 C2b): Achsen, Fenster, Erdgeschoss, Bugnato, Marcapiano, Eckquader.
//   layoutKante(e, o) -> Fassade einer straßenseitigen Kante (reine Daten plus Zellfunktion)
//   zelle(fassade, s, v, c) -> null | 'offen' | 'glas' | Rolle   (Rolle der Wandzelle c im Geschoss s, Höhe v)
// Koordinaten: u = Abstand entlang der Kante (ab Kantenanfang, kontinuierlich), v = Höhe über dem Geschossboden.
// Zellen c stammen aus haus.js: { x, z, layer (1 außen, 2 innen), u, edge, hinten }.

const arches = require('../geom/arches.js');
const M = require('./material.js');

const MIN_LEN = 6;           // kürzere Kanten bekommen keine Öffnungen
const MARGIN = 2;            // Wand am Kantenende (Blöcke)
const SP_MIN = 5;            // kleinster Achsabstand
const SP_MAX = 9;            // größter Achsabstand
const TOL_FENSTER = 1.05;    // erlaubter Treppeneffekt (Blöcke) über eine Fensterbreite
const TOL_PORTAL = 1.7;      // dasselbe für Portale und Ladenbögen
const RECESS_MAX = 0.25;     // bis zu diesem |sin| des Kantenwinkels springen Fenster und Läden zurück (sonst bündig)

const mod1 = (x) => ((x % 1) + 1) % 1;

function hash3(a, b, c) {
  let h = Math.imul(a | 0, 0x27d4eb2d) ^ Math.imul(b | 0, 0x165667b1) ^ Math.imul(c | 0, 0x9e3779b1);
  h = Math.imul(h ^ (h >>> 15), 0x85ebca6b);
  h ^= h >>> 13;
  return (h >>> 0) / 4294967296;
}

// ------------------------------------------------------------------ Formen
function mkRect(uc, w, v0, h) { return { t: 'rect', uc, w, v0, h }; }

// Bogen über Rechteck: kind 'round' (Halbkreis) oder 'segment' (Korbbogen); Profil aus geom/arches.js
function mkArch(uc, w, v0, h, kind, rise) {
  const hw = w / 2;
  const r = rise || (kind === 'segment' ? Math.max(1, hw * 0.55) : hw);
  let rows = Math.ceil(r - 1e-9);
  if (rows >= h) rows = Math.max(1, h - 1);
  return { t: 'arch', uc, w, v0, h, rows, prof: arches.profileForRise(hw, r) };
}

function mkCircle(uc, w, vc) { return { t: 'circle', uc, w, vc, v0: Math.floor(vc - w / 2), h: Math.ceil(w) }; }

function inShape(sh, u, v) {
  const dx = u - sh.uc;
  switch (sh.t) {
    case 'rect':
      return dx >= -sh.w / 2 && dx < sh.w / 2 && v >= sh.v0 && v < sh.v0 + sh.h;
    case 'arch': {
      if (!(dx >= -sh.w / 2 && dx < sh.w / 2) || v < sh.v0) return false;
      const spring = sh.v0 + sh.h - sh.rows;
      if (v < spring) return true;
      return v + 0.5 <= spring + sh.prof(dx);
    }
    case 'circle': {
      const dv = v - sh.vc, r = sh.w / 2;
      return dx * dx + dv * dv <= r * r;
    }
    default:
      return false;
  }
}

// ------------------------------------------------------------------ Öffnungs-Elemente
function mkItem(shapes, o) {
  const it = Object.assign({
    shapes, outer: null, offen: false, frameRole: null, jamb: true, sill: true, hood: 0, shut: null, bars: false,
    barV: 0, konsole: false, ring2: false, lh: 0, vors: []
  }, o || {});
  let a = Infinity, b = -Infinity, v0 = Infinity, top = -Infinity;
  for (const sh of (it.outer ? [it.outer] : shapes)) {
    a = Math.min(a, sh.uc - sh.w / 2); b = Math.max(b, sh.uc + sh.w / 2);
    v0 = Math.min(v0, sh.v0); top = Math.max(top, sh.v0 + sh.h);
  }
  it.uL = a; it.uR = b; it.uc = (a + b) / 2; it.w = b - a; it.v0 = v0; it.top = top;
  it.bu0 = a - 5; it.bu1 = b + 5;
  return it;
}
function inItem(it, u, v) {
  for (const sh of it.shapes) if (inShape(sh, u, v)) return true;
  return false;
}

function itemOeffnung(it, u, v, c, lay) {
  if (!inItem(it, u, v)) return undefined;
  if (it.offen) return 'offen';
  if (it.bars && c.layer === 1 && v === it.barV) return 'pietra_forte';
  if (lay.recess) return c.layer === 1 ? (c.hinten ? 'offen' : 'glas') : 'glas';
  return c.layer === 1 ? 'glas' : 'offen';
}

// Rolle einer Zelle der Außenlage, die zum Element gehört (Rahmen, Haube, Läden, Konsolen); sonst null
function itemRolle(it, u, v) {
  if (it.outer) {
    const O = (a, b) => inShape(it.outer, a, b);
    if (O(u, v)) return v <= it.v0 + it.lh ? it.frameRole : null; // Mittelsäulchen und Sturz; darüber das Bogenfeld
    const below = O(u, v - 1) || O(u - 1, v - 1) || O(u + 1, v - 1);
    const same = O(u - 1, v) || O(u + 1, v);
    const under = O(u, v + 1) || O(u - 1, v + 1) || O(u + 1, v + 1);
    return (below || same || (under && it.sill)) ? it.frameRole : null;
  }
  const I = (a, b) => inItem(it, a, b);
  if (it.frameRole) {
    const below = I(u, v - 1) || I(u - 1, v - 1) || I(u + 1, v - 1);
    const same = I(u - 1, v) || I(u + 1, v);
    const under = I(u, v + 1) || I(u - 1, v + 1) || I(u + 1, v + 1);
    if (below || (same && it.jamb) || (under && it.sill)) return it.frameRole;
    if (it.ring2) {
      for (let du = -2; du <= 2; du++) {
        for (let dv = -2; dv <= 2; dv++) {
          if ((du || dv) && I(u + du, v + dv)) return ((Math.floor(u) + v) & 1) ? 'pietra_forte_rustika' : 'pietra_forte';
        }
      }
    }
    if (it.hood) {
      if (v === it.top + 1 && u >= it.uL - 2 && u < it.uR + 2) return it.frameRole;
      if (it.hood === 2 && v === it.top + 2 && u >= it.uL - 1 && u < it.uR + 1) return it.frameRole;
    }
    if (it.konsole && v === it.v0 - 2 && ((u >= it.uL - 1 && u < it.uL) || (u >= it.uR && u < it.uR + 1))) return it.frameRole;
  }
  if (it.shut && v >= it.v0 && v < it.shut.vTop) {
    const l = it.uL - it.shut.gap, r = it.uR + it.shut.gap;
    if ((u >= l - 1 && u < l) || (u >= r && u < r + 1)) return it.shut.role;
  }
  return null;
}

// ------------------------------------------------------------------ Achsen
/** Anzahl Achsen so wählen, dass der Abstand 5..9 Blöcke bleibt (nächste Zahl zum Wunsch der Akte). */
function achsenWahl(avail, wunsch) {
  const ok = [];
  for (let n = 1; n <= 16; n++) {
    const sp = avail / n;
    if (sp >= SP_MIN - 1e-9 && sp <= SP_MAX + 1e-9) ok.push(n);
  }
  let n;
  if (ok.includes(wunsch)) n = wunsch;
  else if (ok.length) n = ok.reduce((b, x) => (Math.abs(x - wunsch) < Math.abs(b - wunsch) ? x : b));
  else n = avail < SP_MIN ? 1 : Math.max(1, Math.round(avail / 7));
  return { n, sp: avail / n };
}

// Achsmitte so verschieben, dass die Zellmuster symmetrisch zur Mitte liegen (nur für achsparallele Kanten)
function snapper(e, achsparallel) {
  if (!achsparallel) return (uc) => uc;
  const ph = mod1(-(e.a[0] * e.dir[0] + e.a[1] * e.dir[1]));
  return (uc, w) => (Math.round(w) % 2 === 1
    ? Math.round(uc - ph) + ph
    : Math.round(uc - ph - 0.5) + ph + 0.5);
}

// Fensterhöhe nach Geschossart und -höhe (Blöcke); Sturz und Marcapiano brauchen je eine Reihe
function fensterMass(art, hs, marca, klein, w) {
  const vmin = hs <= 7 ? 1 : 2;                 // Brüstungshöhe: Sohlbankreihe liegt darunter
  const oben = hs - (marca ? 2 : 1);            // höchste Reihe des Sturzes
  const wunsch = klein ? Math.max(3, w) : (art === 'nobile' ? 6 : (hs >= 8 ? 5 : 4));
  const h = Math.min(wunsch, oben - vmin);
  const v0 = Math.min(Math.max(vmin, Math.floor((hs - h) / 2)), oben - h);
  return { h, v0 };
}

// ------------------------------------------------------------------ Layout einer Straßenkante
/**
 * o: { istHaupt, hauptAvail, akte, storeys, seedBit, rng, eckStart, eckEnd, putz }
 * Rückgabe: Fassade { items[s], vors[s], recess, L, ... }
 */
function layoutKante(e, o) {
  const { akte, storeys } = o;
  const f = akte.fassade, typ = akte.typ;
  const L = e.len;
  const n = storeys.length;
  const sinPhi = Math.min(Math.abs(e.dir[0]), Math.abs(e.dir[1]));
  const achsparallel = sinPhi < 0.02;
  const putz = o.putz;
  const palazzo = typ === 'palazzo_rinascimento' || typ === 'palazzo_cinquecento' || typ === 'palazzo_ottocento';
  const bugnato = f.material === 'bugnato_abgestuft' || f.material === 'bugnato_glatt';
  const lay = {
    edge: e.index, L, akte, storeys, items: storeys.map(() => []), vors: storeys.map(() => []),
    recess: sinPhi < RECESS_MAX, achsparallel, sinPhi, putz, haupt: !!o.istHaupt, n,
    rowBase: storeys.map((s) => s.base - storeys[0].base),
    egPfeiler: false,
    eck: (f.eckquader === undefined ? palazzo : !!f.eckquader) && L >= 3,
    eckStart: !!o.eckStart, eckEnd: !!o.eckEnd,
    eckRolle: (bugnato || f.material === 'stein_glatt') ? 'pietra_serena' : 'pietra_forte',
    marca: f.marcapiano !== undefined ? (f.marcapiano === 'keiner' ? null : f.marcapiano)
      : (typ === 'palazzo_rinascimento' ? 'vor' : palazzo ? 'flach' : null),
    marcaRolle: 'pietra_serena',
    nAxes: 0, spacing: 0, centers: []
  };
  const avail = L - 2 * MARGIN;
  if (L < MIN_LEN || avail < 3) return lay;

  const wMaxF = achsparallel ? 99 : Math.max(1, Math.floor(TOL_FENSTER / sinPhi));
  const wMaxG = achsparallel ? 99 : Math.max(3, Math.floor(TOL_PORTAL / sinPhi));
  const snap = snapper(e, achsparallel);

  // Achsen
  const wunsch = o.istHaupt ? f.achsen : Math.max(1, Math.round(f.achsen * avail / Math.max(1, o.hauptAvail)));
  const { n: nAx, sp } = achsenWahl(avail, Math.max(1, wunsch));
  lay.nAxes = nAx; lay.spacing = sp;
  const centers = [];
  for (let k = 0; k < nAx; k++) centers.push(MARGIN + (k + 0.5) * sp);
  lay.centers = centers;

  // Fensterbreite
  const wBase0 = typ === 'casa_torre' ? 2 : (sp >= 7 ? 3 : 2);

  // Rahmen, Läden
  const ftyp = f.fenster.typ, rahmen = f.fenster.rahmen;
  let frameRole = ftyp === 'rahmen_stuck' ? 'putz_weiss'
    : rahmen === 'pietra_forte' ? 'pietra_forte' : rahmen === 'pietra_serena' ? 'pietra_serena'
      : rahmen === 'putz' ? 'putz_weiss' : null;
  if (!frameRole && (ftyp === 'bifora' || ftyp === 'tabernakel')) frameRole = 'pietra_serena';
  if (frameRole === putz) frameRole = putz === 'putz_weiss' ? 'putz_grau' : 'putz_weiss';
  if (frameRole === 'pietra_serena' && f.material === 'stein_glatt') frameRole = 'pietra_forte'; // Kontrast zur Wand
  const steinRahmen = frameRole === 'pietra_forte' || frameRole === 'pietra_serena';
  const portalStein = rahmen === 'pietra_forte' ? 'pietra_forte' : 'pietra_serena';
  const laedenRolle = (f.material === 'putz' && f.fenster.laeden !== false && typ !== 'chiesa_minore')
    ? (f.fenster.laeden === 'holz' ? 'holz_sporto' : 'fensterladen') : null;

  // Fenster-Element (einfache Form) mit Rahmen und Läden; w wird dem Platz angepasst
  const fenster = (uc, w, v0, h, opts) => {
    const op = opts || {};
    let jamb = !!frameRole;
    const platz = Math.floor(sp - 2);
    if (platz < 2 && sp >= 3) { w = Math.min(w, wMaxF, 2); jamb = false; } // schmale Wand: Fenster ohne Pfosten
    else w = Math.max(1, Math.min(w, wMaxF, platz));
    let shut = null;
    if (laedenRolle && w >= 2) {
      while (w > 2 && w + 2 * 2 + 1 > sp) w--;
      if (w + 2 * 2 + 1 <= sp) { shut = { role: laedenRolle, gap: jamb ? 1 : 0, vTop: v0 + h }; }
      else if (w + 2 + 1 <= sp) { shut = { role: laedenRolle, gap: 0, vTop: v0 + h }; jamb = false; }
    }
    uc = snap(uc, w);
    let shape;
    if (op.arch && w >= 2) shape = mkArch(uc, w, v0, h, 'round');
    else shape = mkRect(uc, w, v0, h);
    if (shut && shape.t === 'arch') shut.vTop = v0 + h - shape.rows;
    const it = mkItem([shape], {
      frameRole, jamb, sill: !!frameRole, hood: op.hood || 0, shut, bars: !!op.bars,
      barV: v0 + Math.floor(h / 2), konsole: !!op.konsole
    });
    const sillVor = steinRahmen && frameRole && !op.konsole;
    if (sillVor) it.vors.push({ v: v0 - 1, u0: it.uL, u1: it.uR, role: frameRole });
    if (op.konsole && frameRole) {
      it.vors.push({ v: v0 - 1, u0: it.uL - 1, u1: it.uR + 1, role: frameRole });
      it.vors.push({ v: v0 - 2, u0: it.uL - 1, u1: it.uL, role: frameRole });
      it.vors.push({ v: v0 - 2, u0: it.uR, u1: it.uR + 1, role: frameRole });
    }
    return it;
  };

  // Biforie: zwei Lichter (2 breit) mit Mittelsäulchen unter einem Entlastungsbogen (5 breit)
  const bifora = (uc, v0, H) => {
    uc = snap(uc, 5);
    const lh = H - 2;
    const outer = mkArch(uc, 5, v0, H, 'segment', 2);
    const lights = [mkRect(uc - 1.5, 2, v0, lh), mkRect(uc + 1.5, 2, v0, lh)];
    const it = mkItem(lights, { outer, frameRole, lh, sill: true });
    it.vors.push({ v: v0 - 1, u0: it.uL, u1: it.uR, role: frameRole });
    return it;
  };

  // ---------------------------------------------------------------- Erdgeschoss
  const eg = storeys[0];
  const art = f.erdgeschoss.art;
  const items0 = lay.items[0];
  const blocked = [];
  const sideAxis = o.seedBit ? nAx - 1 : 0;
  const portal = (uc, pw) => {
    pw = Math.max(3, Math.min(pw, wMaxG, Math.floor(avail) - 2));
    const h = Math.max(Math.ceil(pw / 2) + 2, Math.min(eg.h - 2, Math.round(pw * 1.7)));
    uc = snap(uc, pw);
    items0.push(mkItem([mkArch(uc, pw, 0, h, 'round')], {
      offen: true, frameRole: portalStein, jamb: true, sill: false, ring2: palazzo || bugnato || f.material === 'bruchstein'
    }));
    blocked.push([uc - pw / 2 - 3, uc + pw / 2 + 3]);
    return { uc, pw, h };
  };
  const pwAkte = (() => {
    const b = f.erdgeschoss.portalBreiteBl || 5;
    return typ === 'chiesa_minore' ? Math.max(6, Math.min(8, b)) : Math.max(4, Math.min(6, b));
  })();

  const egFenster = (uc) => {
    const ef = f.erdgeschoss.fenster;
    if (ef === 'keine') return;
    const w = ef === 'rundbogen' ? Math.min(3, wBase0 + 0) : wBase0;
    let v0 = eg.h >= 9 ? 3 : 2;
    let h = Math.max(3, Math.min(5, eg.h - 6));
    if (ef === 'kniefenster') { v0 = 3; h = Math.max(3, Math.min(5, eg.h - 3 - v0)); }
    h = Math.min(h, eg.h - 3 - v0);
    if (h < 2) return;
    items0.push(fenster(uc, ef === 'rundbogen' ? Math.max(w, 3) : w, v0, h,
      { arch: ef === 'rundbogen', bars: ef === 'rechteck_vergittert', konsole: ef === 'kniefenster' }));
  };

  let ladenModus = false;
  if (o.istHaupt && art === 'loggia_offen') {
    lay.egPfeiler = true;
    const w = Math.max(3, Math.min(8, Math.floor(sp) - 2, wMaxG));
    const h = Math.max(5, eg.h - 2);
    for (const uc0 of centers) {
      const uc = snap(uc0, w);
      items0.push(mkItem([mkArch(uc, w, 0, h, 'round')], { offen: true, frameRole: 'pietra_forte', jamb: true, sill: false }));
    }
    ladenModus = true;
  } else if (o.istHaupt && art === 'bottega_arcata' && avail >= 7) {
    // Ladenbögen 5..7 breit; wenn möglich auf den Fensterachsen
    let sc = centers, ssp = sp;
    if (sp < 7 || sp > 9.99) {
      let best = 0;
      for (let k = 1; k <= 12; k++) { const s2 = avail / k; if (s2 >= 7 && s2 <= 9.99 && (!best || Math.abs(k - nAx) < Math.abs(best - nAx))) best = k; }
      if (best) { ssp = avail / best; sc = []; for (let k = 0; k < best; k++) sc.push(MARGIN + (k + 0.5) * ssp); }
      else sc = null;
    }
    if (sc) {
      const w = Math.max(3, Math.min(7, Math.floor(ssp) - 2, wMaxG));
      const hTot = Math.max(6, Math.min(9, eg.h - 2));
      const kind = o.rng() < 0.5 ? 'round' : 'segment';
      for (const uc0 of sc) {
        const uc = snap(uc0, w);
        const it = mkItem([mkArch(uc, w, 0, hTot, kind)], { frameRole: portalStein, jamb: true, sill: false });
        items0.push(it);
      }
      ladenModus = true;
    }
  }
  if (!ladenModus && o.istHaupt) {
    if (art === 'portal_mittig' || art === 'portal_giebel') {
      const p = portal(L / 2, pwAkte);
      if (art === 'portal_giebel' && eg.h - p.h >= 5) {
        items0.push(mkItem([mkCircle(snap(L / 2, 3), 3, p.h + (eg.h - p.h) / 2)], { frameRole: portalStein, jamb: true, sill: true }));
      }
    } else if (art === 'portal_seitlich' || art === 'tor_und_fenster') {
      portal(centers[sideAxis], Math.min(pwAkte, Math.max(3, Math.floor(sp) - 1)));
    }
  }
  if (!ladenModus && art !== 'geschlossen') {
    for (const uc of centers) {
      if (blocked.some(([a, b]) => uc >= a && uc <= b)) continue;
      egFenster(uc);
    }
  }

  // ---------------------------------------------------------------- Obergeschosse
  for (let s = 1; s < n; s++) {
    const st = storeys[s];
    const hs = st.h;
    const istOben = s === n - 1;
    const klein = st.art === 'attika' || st.art === 'mezzanin' || (istOben && n >= 4 && hash3(o.seed, s, 7) < 0.4);
    let w = klein ? Math.min(wBase0, 3) : wBase0;
    const mass = fensterMass(st.art, hs, !!lay.marca, klein, w);
    const h = mass.h, v0 = mass.v0;
    if (h < 2) continue;
    for (const uc of centers) {
      switch (typ === 'casa_torre' && ftyp === 'rechteck' ? 'rundbogen' : ftyp) { // Wohntürme haben Rundbogenfenster
        case 'rundbogen': {
          const wr = klein ? 2 : (sp >= 6 && wMaxF >= 3 ? 3 : 2);
          lay.items[s].push(fenster(uc, wr, v0, h, { arch: !klein }));
          break;
        }
        case 'bifora': {
          if (!klein && sp >= 8 && wMaxF >= 5 && h >= 5) lay.items[s].push(bifora(uc, v0, h));
          else lay.items[s].push(fenster(uc, w, v0, h, {}));
          break;
        }
        case 'tabernakel': {
          const ht = Math.min(h, hs - 3 - v0); // Platz für Sturz und Giebel
          const spitz = st.art === 'nobile' && v0 + ht + 2 <= hs - 1;
          lay.items[s].push(fenster(uc, w, v0, ht, { hood: spitz ? 2 : (v0 + ht + 1 <= hs - 2 ? 1 : 0) }));
          break;
        }
        case 'rahmen_stuck': {
          const ht = Math.min(h, hs - 3 - v0);
          lay.items[s].push(fenster(uc, w, v0, ht, { hood: v0 + ht + 1 <= hs - 2 ? 1 : 0 }));
          break;
        }
        default:
          lay.items[s].push(fenster(uc, typ === 'casa_torre' ? Math.min(w, 2) : w, v0, h, {}));
      }
    }
  }

  // Elemente -> Vorsprünge je Geschoss
  for (let s = 0; s < n; s++) for (const it of lay.items[s]) for (const vo of it.vors) lay.vors[s].push(vo);
  if (lay.marca === 'vor') {
    for (let s = 0; s < n - 1; s++) lay.vors[s].push({ v: storeys[s].h - 1, u0: -Infinity, u1: Infinity, role: lay.marcaRolle });
  }
  return lay;
}

// ------------------------------------------------------------------ Wandzellen
function bugnatoGrad(lay, s) {
  const m = lay.akte.fassade.material;
  if (m === 'bugnato_abgestuft') return s === 0 ? 3 : (s === 1 || lay.storeys[s].art === 'nobile') ? 2 : 1;
  return s === 0 ? 2 : 1;
}

// Grundwand der Straßenfassade ohne Öffnungen
function basis(lay, s, v, c) {
  const f = lay.akte.fassade, m = f.material;
  if (lay.egPfeiler && s === 0) return 'pietra_serena';
  if (c.layer === 2) return m === 'putz' ? lay.putz : (m === 'stein_glatt' ? 'pietra_serena' : 'pietra_forte_bruch');
  switch (m) {
    case 'putz': return lay.putz;
    case 'stein_glatt': return 'pietra_serena';
    case 'bruchstein': return hash3(c.x, lay.storeys[s].base + v, c.z) > 0.84 ? 'pietra_forte_rustika' : 'pietra_forte_bruch';
    default: {
      const g = bugnatoGrad(lay, s);
      if (g === 1) return 'pietra_forte';
      const u = Math.floor(c.u);
      if (g === 2) { // Quader 4 x 2, versetzt, zwei Töne
        const course = Math.floor(v / 2);
        const k = Math.floor((u + ((course & 1) ? 2 : 0)) / 4);
        return ((k + course) & 1) ? 'pietra_forte_rustika' : 'pietra_forte';
      }
      // stark: Quader 4 x 2 mit 1 Block Fuge, Fugen eine Lage tief zurückgesetzt, wo dahinter eine zweite Wandlage steht
      const course = Math.floor(v / 3);
      const kk = u + ((course & 1) ? 2 : 0);
      const jc = ((kk % 5) + 5) % 5;
      const fuge = (v % 3 === 2) || jc === 4;
      if (fuge) return c.hinten ? 'offen' : 'pietra_forte_bruch';
      const blk = Math.floor(kk / 5);
      return ((blk + course) & 1) ? 'pietra_forte_rustika' : 'pietra_forte_bruch';
    }
  }
}

function zelle(lay, s, v, c) {
  const items = lay.items[s], u = c.u;
  for (const it of items) {
    if (u < it.bu0 || u >= it.bu1) continue;
    const r = itemOeffnung(it, u, v, c, lay);
    if (r !== undefined) return r;
  }
  if (c.layer === 1) {
    for (const it of items) {
      if (u < it.bu0 || u >= it.bu1) continue;
      const r = itemRolle(it, u, v);
      if (r) return r;
    }
    if (lay.marca && s < lay.n - 1 && v === lay.storeys[s].h - 1) return lay.marcaRolle;
    if (lay.eck && ((lay.eckStart && u < ((lay.rowBase[s] + v) & 1 ? 1 : 2)) ||
        (lay.eckEnd && u > lay.L - ((lay.rowBase[s] + v) & 1 ? 1 : 2)))) return lay.eckRolle;
  }
  return basis(lay, s, v, c);
}

/** Vorsprünge eines Geschosses, die über der Zelle (Außenlage) bei u liegen: [{ v, role }] */
function vorsprungeAn(lay, s, u) {
  const out = [];
  for (const vo of lay.vors[s]) if (u >= vo.u0 && u < vo.u1) out.push(vo);
  return out;
}

module.exports = { layoutKante, zelle, vorsprungeAn, inShape, inItem, achsenWahl, hash3, MIN_LEN, MARGIN, SP_MIN, SP_MAX };
