/**
 * V3-Loader: Projektindex und Moduldaten nach Bedarf (file://-fähig: <script>-Tags werden per DOM eingefügt).
 *
 *   ProjectLoader.index()                 -> window.PROJECT_INDEX (+ Demo bei ?demo=1)
 *   ProjectLoader.loadBasis()             -> Promise<STADT_BASIS> (data/stadt/basis.js, erst bei Bedarf)
 *   ProjectLoader.loadModule(id, n)       -> Promise<{module,title,palette,steps:[{runs,...}]}> (Rohformat §6)
 *   ProjectLoader.loadProject(id)         -> Promise<Projekt im Format von window.PROJECT_FLORENCE> (Schritte mit blocks)
 *   ProjectLoader.fillWorld(world, id)    -> Promise<Blockzahl>: alle Module direkt in eine ChunkMesher-Welt (ohne Blockobjekte)
 * Der Dom (`duomo`) wird aus den bereits geladenen V2-Skripten gelesen (window.MODULE_DATA_V2 / PROJECT_FLORENCE).
 */
window.ProjectLoader = (function () {
  var scriptCache = {};
  var projectCache = {};
  window.PROJECT_DATA_V3 = window.PROJECT_DATA_V3 || {};

  function loadScript(src) {
    if (scriptCache[src]) return scriptCache[src];
    scriptCache[src] = new Promise(function (resolve, reject) {
      var s = document.createElement("script");
      s.src = src;
      s.async = true;
      s.onload = function () { resolve(); };
      s.onerror = function () { delete scriptCache[src]; reject(new Error("Datei nicht ladbar: " + src)); };
      document.head.appendChild(s);
    });
    return scriptCache[src];
  }

  function index() { return window.PROJECT_INDEX || []; }
  function entry(id) {
    var a = index();
    for (var i = 0; i < a.length; i++) if (a[i].id === id) return a[i];
    return null;
  }

  function loadBasis() {
    if (window.STADT_BASIS) return Promise.resolve(window.STADT_BASIS);
    return loadScript("data/stadt/basis.js").then(function () { return window.STADT_BASIS; });
  }

  function rawModule(id, n) {
    if (id === "duomo") return (window.MODULE_DATA_V2 || {})[n] || null;
    return (window.PROJECT_DATA_V3[id] || {})[n] || null;
  }

  function loadModule(id, n) {
    var raw = rawModule(id, n);
    if (raw) return Promise.resolve(raw);
    var e = entry(id);
    var m = e && e.modules.filter(function (x) { return x.n === n; })[0];
    if (!m) return Promise.reject(new Error("Modul " + n + " von " + id + " nicht im Index"));
    return loadScript(m.file).then(function () {
      var r = rawModule(id, n);
      if (!r) throw new Error("Moduldaten fehlen nach dem Laden: " + m.file);
      return r;
    });
  }

  function bytesOf(b64) {
    var bin = atob(b64);
    var bytes = new Uint8Array(bin.length);
    for (var i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i);
    return new DataView(bytes.buffer);
  }

  // Läufe [x,y,z0,len,typeIdx] -> fn(x, y, z0, len, typeIdx)
  function forEachRun(b64, fn) {
    var view = bytesOf(b64);
    for (var o = 0; o + 10 <= view.byteLength; o += 10) {
      fn(view.getInt16(o, true), view.getInt16(o + 2, true), view.getInt16(o + 4, true), view.getInt16(o + 6, true), view.getInt16(o + 8, true));
    }
  }

  function decodeRuns(b64, palette) {
    var blocks = [];
    forEachRun(b64, function (x, y, z0, len, t) {
      var type = palette[t];
      for (var k = 0; k < len; k++) blocks.push({ x: x, y: y, z: z0 + k, type: type });
    });
    return blocks;
  }

  function loadProject(id) {
    if (id === "duomo") return Promise.resolve(window.PROJECT_FLORENCE);
    if (projectCache[id]) return projectCache[id];
    var e = entry(id);
    if (!e) return Promise.reject(new Error("Unbekanntes Projekt: " + id));
    projectCache[id] = Promise.all(e.modules.map(function (m) { return loadModule(id, m.n); })).then(function (raws) {
      var modules = raws.map(function (m) {
        return {
          id: "modul_" + m.module, number: m.module, title: m.title, subtitle: m.subtitle || "", icon: m.icon || "🧱",
          status: "Verfügbar",
          steps: m.steps.map(function (s) {
            return { stepNumber: s.stepNumber, title: s.title, module: m.title, description: s.description, cameraHint: s.cameraHint,
              blocks: decodeRuns(s.runs, m.palette), tip: s.tip, caution: s.caution, fact: s.fact };
          })
        };
      });
      modules.sort(function (a, b) { return a.number - b.number; });
      return { id: id, title: e.title, subtitle: e.type, modules: modules, bounds: e.bounds };
    });
    return projectCache[id];
  }

  // Block-Eigenschaften für den Mesher
  var infoCache = {};
  function hexToRgb(h) {
    var v = parseInt(String(h).replace("#", ""), 16);
    return [(v >> 16) & 255, (v >> 8) & 255, v & 255];
  }
  function isTransparentType(type) {
    return type === "water" || (type.length > 14 && type.slice(-14) === "_stained_glass");
  }
  function blockInfo(type) {
    var c = infoCache[type];
    if (c) return c;
    var def = (window.BLOCK_TYPES && window.BLOCK_TYPES[type]) || { color: "#888888" };
    c = { transparent: isTransparentType(type), top: hexToRgb(def.topColor || def.color), side: hexToRgb(def.sideColor || def.color), stair: def.stair || null };
    infoCache[type] = c;
    return c;
  }

  // Bounding Box (Index) -> yMin/yMax für die Welt, mit Rand
  function worldFor(id) {
    var e = entry(id);
    var b = e && e.bounds ? e.bounds : { y0: 0, y1: 319 };
    return window.ChunkMesher.createWorld({ yMin: Math.max(0, b.y0 - 1), yMax: Math.min(511, b.y1 + 1), typeInfo: blockInfo });
  }

  function fillWorld(world, id) {
    var e = entry(id);
    if (!e) return Promise.reject(new Error("Unbekanntes Projekt: " + id));
    return Promise.all(e.modules.map(function (m) { return loadModule(id, m.n); })).then(function (raws) {
      var n = 0;
      raws.forEach(function (m) {
        var ids = m.palette.map(function (t) { return world.typeId(t); });
        m.steps.forEach(function (s) {
          forEachRun(s.runs, function (x, y, z0, len, t) { world.setRun(x, y, z0, len, ids[t]); n += len; });
        });
      });
      return n;
    });
  }

  // Demo-Projekt nur mit ?demo=1 (nicht im generierten Index)
  function loadDemoIfRequested() {
    try {
      if (new URLSearchParams(window.location.search).get("demo") === "1") return loadScript("data/_demo/projekt.js");
    } catch (e) { /* ignorieren */ }
    return Promise.resolve();
  }

  return {
    index: index, entry: entry, loadScript: loadScript, loadBasis: loadBasis, loadModule: loadModule, loadProject: loadProject,
    fillWorld: fillWorld, worldFor: worldFor, blockInfo: blockInfo, forEachRun: forEachRun, decodeRuns: decodeRuns,
    loadDemoIfRequested: loadDemoIfRequested
  };
})();
