'use strict';
// Zellplan (W5c): Behälter für Wahrzeichen, die ihren Bauplan als Zellen im Speicher berechnen und danach in
// Bauteile (Module) aufteilen (Muster wie grotta_buontalenti/_gb.js, hier als gemeinsames Werkzeug).
//
//   const P = neuerPlan();
//   P.luft(x, y, z)                 Zelle bleibt Luft (set() lehnt sie ab)
//   P.oeffnung(art, teil, x, y, z)  Luftzelle als Öffnung deklarieren (ctx.oeffnung), bleibt Luft
//   P.set(x, y, z, typ, teil)       setzt eine freie Zelle (erste Setzung gewinnt), false bei belegt/Luft
//   P.ersetze(x, y, z, typ, teil)   ersetzt eine vorhandene Zelle (Typ und Teil), false wenn leer
//   P.hat(x, y, z), P.get(x, y, z)  Abfragen
//   P.modul(n, ids, planFn)         Moduldatei { module, build(ctx) } mit den Bauteilen ids (in dieser Reihenfolge)
// Teile ohne Zellen werden nicht registriert.

function neuerPlan() {
  const zellen = new Map(); // key -> { x, y, z, t, p }
  const teile = new Map();  // teil -> Set(key)
  const luftSet = new Set();
  const oeff = new Map();   // art|teil -> [{x,y,z}]
  const key = (x, y, z) => x + ',' + y + ',' + z;
  const liste = (p) => { let s = teile.get(p); if (!s) teile.set(p, s = new Set()); return s; };
  const P = {
    zellen, teile, oeff, key,
    luft(x, y, z) { luftSet.add(key(x, y, z)); },
    istLuft(x, y, z) { return luftSet.has(key(x, y, z)); },
    oeffnung(art, teil, x, y, z) {
      const k = art + '|' + teil;
      let a = oeff.get(k); if (!a) oeff.set(k, a = []);
      a.push({ x, y, z });
      luftSet.add(key(x, y, z));
    },
    set(x, y, z, t, p) {
      const k = key(x, y, z);
      if (zellen.has(k) || luftSet.has(k)) return false;
      zellen.set(k, { x, y, z, t, p });
      liste(p).add(k);
      return true;
    },
    ersetze(x, y, z, t, p) {
      const k = key(x, y, z);
      const e = zellen.get(k);
      if (!e) return false;
      if (e.p !== p) { teile.get(e.p).delete(k); liste(p).add(k); e.p = p; }
      e.t = t;
      return true;
    },
    hat: (x, y, z) => zellen.has(key(x, y, z)),
    get: (x, y, z) => zellen.get(key(x, y, z)) || null,
    anzahl: (p) => (teile.get(p) ? teile.get(p).size : 0),
    modul(n, ids, planFn) {
      return {
        module: n,
        build(ctx) {
          planFn();
          for (const id of ids) {
            const ks = teile.get(id);
            if (ks && ks.size) {
              const cells = [...ks].map((k) => zellen.get(k));
              const typ = new Map(cells.map((c) => [key(c.x, c.y, c.z), c.t]));
              ctx.part(id).fill(cells, (x, y, z) => typ.get(key(x, y, z)));
            }
            for (const [k, z] of oeff) {
              const [art, pp] = k.split('|');
              if (pp === id) ctx.oeffnung(z, art);
            }
          }
        }
      };
    }
  };
  return P;
}

module.exports = { neuerPlan };
