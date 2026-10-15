'use strict';
// Wahrzeichen-Kandidaten aus den Gebäuden; Abgleich mit der Liste aus STADTMODELL_PLAN §4.

const norm = (s) => String(s).normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().replace(/[’'`]/g, ' ').replace(/\s+/g, ' ').trim();

// Plan-Einträge: Suchmuster (auf normalisierte Namen), ausgeschlossene Muster, Beschreibung der Suchbegriffe.
const PLAN = [
  { name: 'Palazzo Vecchio', re: /palazzo vecchio|palazzo della signoria/ },
  { name: 'Uffizien', re: /uffizi/ },
  { name: 'Corridoio Vasariano', re: /corridoio vasariano|corridoio del vasari|vasariano/ },
  { name: 'Loggia dei Lanzi', re: /loggia dei lanzi|loggia della signoria|loggia de lanzi|loggia dell orcagna/ },
  { name: 'Orsanmichele', re: /orsanmichele|or san michele|orto di san michele/ },
  { name: 'Ponte Vecchio', re: /ponte vecchio/ },
  { name: 'Palazzo Pitti', re: /palazzo pitti|reggia pitti/ },
  { name: 'San Lorenzo', re: /basilica di san lorenzo|chiesa di san lorenzo|^san lorenzo$|basilica laurenziana|basilica di s\. lorenzo/, not: /mercato|biblioteca/ },
  { name: 'Cappelle Medicee', re: /cappelle medicee|cappella dei principi|sagrestia nuova|cappelle medicee/ },
  { name: 'Palazzo Medici Riccardi', re: /medici riccardi/ },
  { name: 'Santa Croce', re: /basilica di santa croce|^santa croce$|chiesa di santa croce/, not: /fontana|piazza|opera|pazzi/ },
  { name: 'Santa Maria Novella', re: /santa maria novella/, not: /stazione|piazza|farmacia|officina/ },
  { name: 'Bargello', re: /bargello|palazzo del podesta/ },
  { name: 'Badia Fiorentina', re: /badia fiorentina|badia di firenze|^badia$/ },
  { name: 'Palazzo Strozzi', re: /palazzo strozzi/, not: /sacrati/ },
  { name: 'Palazzo Rucellai', re: /palazzo rucellai/ },
  { name: 'Santissima Annunziata', re: /annunziata/, not: /piazza|via |ospedale|innocenti|spedale/ },
  { name: 'Ospedale degli Innocenti', re: /innocenti/ },
  { name: 'Santo Spirito', re: /santo spirito/, not: /piazza|via |ospedale|spedale/ },
  { name: 'Santa Maria del Carmine', re: /del carmine|^carmine$|chiesa del carmine|basilica del carmine/, not: /piazza|via / },
  { name: 'Santa Trinita', re: /santa trinita/, not: /ponte|piazza|via |borgo/ },
  { name: 'Mercato Nuovo', re: /mercato nuovo|loggia del porcellino|loggia del mercato/ },
  { name: 'Arcone di Piazza della Repubblica', re: /arcone|arco di piazza della repubblica|palazzo dell arcone/ }
];
// Arnobrücken: werden in der Brückenebene gesucht.
const BRIDGES = [
  { name: 'Ponte Vecchio', re: /ponte vecchio/ },
  { name: 'Ponte Santa Trinita', re: /ponte santa trinita/ },
  { name: 'Ponte alla Carraia', re: /ponte alla carraia/ },
  { name: 'Ponte alle Grazie', re: /ponte alle grazie/ },
  { name: 'Ponte Amerigo Vespucci', re: /amerigo vespucci/ },
  { name: 'Ponte alla Vittoria', re: /ponte alla vittoria/ },
  { name: 'Ponte San Niccolo', re: /san niccolo/ }
];

const CHURCH = new Set(['church', 'cathedral', 'chapel', 'basilica', 'monastery', 'convent', 'religious']);
const PALAZZO_RE = /^(palazzo|palazzina|loggia|torre|museo|teatro|villa|spedale|ospedale|convento|chiostro|biblioteca|accademia|galleria|forte|porta|casa)\b/;
const DOM_IDS = new Set(['w43768260', 'w166821303', 'w251650632']);

function names(b) { return [b.name, ...b._names].filter(Boolean).map(norm); }

function summarize(b, kriterien, planName) {
  const t = b.tags;
  return {
    id: b.id, name: b.name, flaecheBl: b.flaecheBl, hoeheBl: b.hoeheBl, hoeheQuelle: b.hoeheQuelle,
    wikidata: t.wikidata || null, kriterien, plan: planName || null,
    schwerpunkt: [Math.round(b._c[0] * 2) / 2, Math.round(b._c[1] * 2) / 2], isolato: b.isolato
  };
}

function buildLandmarks(buildings, areas) {
  const cand = new Map();
  const add = (b, why, planName) => {
    const c = cand.get(b.id) || summarize(b, [], null);
    if (!c.kriterien.includes(why)) c.kriterien.push(why);
    if (planName && !c.plan) c.plan = planName;
    cand.set(b.id, c);
  };
  for (const b of buildings) {
    const t = b.tags;
    const nm = names(b);
    if (!nm.length) continue;
    if (CHURCH.has(t.building) || t.amenity === 'place_of_worship') add(b, 'kirche');
    if (b.name && PALAZZO_RE.test(norm(b.name)) && (t.wikidata || t.historic)) add(b, 'palazzo/historisch');
    if (b.name && t.wikidata && b.flaecheBl >= 150) add(b, 'wikidata');
    if (b.name && /palazzo/.test(norm(b.name)) && b.flaecheBl >= 600) add(b, 'palazzo gross');
  }
  const planResult = [];
  for (const p of PLAN) {
    const hits = [];
    for (const b of buildings) {
      if (!names(b).some((n) => p.re.test(n) && !(p.not && p.not.test(n)))) continue;
      hits.push(b);
    }
    const own = (b) => (b.name && p.re.test(norm(b.name)) && !(p.not && p.not.test(norm(b.name)))) ? 1 : 0;
    hits.sort((a, b) => own(b) - own(a) || b.flaecheBl - a.flaecheBl);
    // Treffer, die ausschließlich über einen Teil (building:part) gefunden wurden, gelten ebenfalls (Name liegt im Teil).
    const sel = hits.length ? hits[0] : null;
    if (sel) add(sel, 'plan', p.name);
    planResult.push({ name: p.name, gefunden: hits.length > 0, treffer: hits.slice(0, 5).map((b) => ({ id: b.id, name: b.name, flaecheBl: b.flaecheBl })), gewaehlt: sel ? sel.id : null });
  }
  // Brücken
  const bridgeHits = [];
  const bnames = (areas.bruecken || []).filter((x) => x.name).map((x) => ({ x, n: norm(x.name) }));
  for (const br of BRIDGES) {
    const m = bnames.filter((o) => br.re.test(o.n));
    // Gebäude nur, wenn ihr Name selbst eine Brücke nennt (sonst trifft /san niccolo/ Kirche, Oratorium und Stadttor)
    const ponteBauten = buildings.filter((b) => b.name && /\bponte\b/.test(norm(b.name)) && br.re.test(norm(b.name)));
    bridgeHits.push({ name: br.name, bruecken: m.map((o) => o.x.id), gebaeude: ponteBauten.map((b) => b.id), gefunden: m.length > 0 || ponteBauten.length > 0 });
  }
  // Plan-Einträge für Brücken ergänzen
  for (const bh of bridgeHits) {
    const idx = planResult.findIndex((p) => p.name === bh.name);
    if (idx < 0) planResult.push({ name: bh.name, gefunden: bh.gefunden, treffer: [...bh.bruecken.slice(0, 5), ...bh.gebaeude.slice(0, 5)].map((id) => ({ id })), gewaehlt: null, quelle: 'brueckenebene' });
    else if (!planResult[idx].gefunden && bh.gefunden) { planResult[idx].gefunden = true; planResult[idx].quelle = 'brueckenebene'; planResult[idx].treffer = [...bh.bruecken, ...bh.gebaeude].slice(0, 5).map((id) => ({ id })); }
  }
  // Textsuche in allen Ebenen für nicht gefundene Einträge
  const layerNames = [];
  for (const k of ['strassen', 'plaetze', 'wasser', 'gruen', 'bruecken', 'mauern']) for (const x of areas[k] || []) if (x.name) layerNames.push({ ebene: k, id: x.id, name: x.name, n: norm(x.name) });
  for (const p of planResult) {
    if (p.gefunden) continue;
    const def = PLAN.find((q) => q.name === p.name);
    if (!def) continue;
    p.alternativen = layerNames.filter((o) => def.re.test(o.n)).slice(0, 5).map((o) => ({ ebene: o.ebene, id: o.id, name: o.name }));
  }

  for (const c of cand.values()) c.domKomplex = DOM_IDS.has(c.id);
  const kandidaten = [...cand.values()].sort((a, b) => (b.plan ? 1 : 0) - (a.plan ? 1 : 0) || b.flaecheBl - a.flaecheBl || (a.id < b.id ? -1 : 1));
  const nichtGefunden = planResult.filter((p) => !p.gefunden).map((p) => p.name);
  return { kandidaten, plan: planResult, nichtGefunden };
}

module.exports = { buildLandmarks, PLAN, BRIDGES, norm };
