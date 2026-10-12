'use strict';
// Kontext des Hausgenerators: Parzellenraster, Umfeld, Boden und Pläne der Häuser eines Quartiers.

const { makeParzellen, istVorrangId } = require('./parzellen.js');
const { umfeldVon } = require('./umfeld.js');
const { planHaus } = require('./haus.js');
const A = require('./akte.js');

class Kontext {
  /**
   * opts: { parz, umfeld, groundTopY(x,z), akten: Map id -> Akte (gültige), projekt: Set ids }
   */
  constructor(opts) {
    this.parz = opts.parz;
    this.umfeld = opts.umfeld;
    this.groundTopY = opts.groundTopY;
    this.akten = opts.akten;
    this.projekt = opts.projekt;
    this.byId = opts.byId || new Map();
    this._plans = new Map();
    this._claims = new Set();
  }

  /** Wird das Haus gebaut (im Projekt und mit gültiger Akte)? Wahrzeichen-Vorrang zählt als gebaut. */
  gebaut(id) { return istVorrangId(id) || (this.projekt.has(id) && this.akten.has(id)); }

  /** Plan eines Hauses (gecacht); akte optional, sonst aus akten. */
  plan(id, akte) {
    let p = this._plans.get(id);
    if (!p) {
      const a = akte || this.akten.get(id);
      const g = this.byId.get(id);
      if (!a || !g) return null;
      p = planHaus(g, a, this);
      this._plans.set(id, p);
    }
    return p;
  }

  /** Beansprucht die Zelle für ein überstehendes Bauteil (Gesims); true, wenn sie noch frei war. Vorrangzellen nie. */
  beanspruche(x, y, z) {
    if (this.parz.istVorrang(x, z)) return false;
    const k = `${x},${y},${z}`;
    if (this._claims.has(k)) return false;
    this._claims.add(k);
    return true;
  }
}

/**
 * Bequemer Aufbau für Tests: gebaeude = alle Häuser (alle werden gebaut), akten = Objekt oder Map id -> Akte.
 * opts: { groundTopY, flaechen, vorrang: [{ id, polygon, projekt }] }.
 */
function makeKontext({ gebaeude, akten, groundTopY, flaechen, vorrang }) {
  const am = akten instanceof Map ? akten : new Map(Object.entries(akten || {}));
  const valid = new Map([...am].filter(([, a]) => A.validiere(a).length === 0));
  return new Kontext({
    parz: makeParzellen(gebaeude, { vorrang }),
    umfeld: umfeldVon(flaechen || {}),
    groundTopY: groundTopY || (() => 63),
    akten: valid,
    projekt: new Set(gebaeude.map((g) => g.id)),
    byId: new Map(gebaeude.map((g) => [g.id, g]))
  });
}

module.exports = { Kontext, makeKontext };
