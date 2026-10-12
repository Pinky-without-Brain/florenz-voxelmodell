/**
 * Chunk-Mesher (V3): Greedy Meshing je 16x16-Säule (x,z) über die volle Höhe.
 * Reiner Kern ohne DOM/Three.js, lauffähig in Node (require) und im Browser (window.ChunkMesher).
 *
 *   var w = ChunkMesher.createWorld({ yMin: 64, yMax: 300, typeInfo: function (name) { ... } });
 *   w.setRun(x, y, z0, len, w.typeId('stone_bricks'));
 *   var m = ChunkMesher.meshChunk(w, cx, cz, { variation: 0.05 });  // { opaque, transparent, quads } | null
 *
 * typeInfo(name) -> { transparent: bool, top: [r,g,b], side: [r,g,b] } (0..255). Standard: grau, opak.
 * Verdeckung: Fläche eines opaken Blocks entfällt nur gegen einen opaken Nachbarn (auch über Chunk-Grenzen);
 * gegen transparente Nachbarn bleibt sie. Transparente Fläche entfällt gegen opake Nachbarn und gegen
 * gleichen transparenten Typ.
 * Ausgabe je Teil: { positions: Float32Array, normals: Int8Array (normalisiert), colors: Uint8Array (normalisiert),
 * indices: Uint16Array|Uint32Array, quads }. Positionen sind Weltkoordinaten.
 */
(function (root, factory) {
  if (typeof module === 'object' && module.exports) module.exports = factory();
  else root.ChunkMesher = factory();
})(typeof self !== 'undefined' ? self : this, function () {
  'use strict';
  var CHUNK = 16;
  var PAD = CHUNK + 2;
  // Flächenhelligkeit je Richtung (Oberseite hell, Unterseite dunkel)
  var SHADE = { top: 1.0, bottom: 0.62, side: 0.86 };

  function chunkKey(cx, cz) { return (cx + 2048) * 4096 + (cz + 2048); }

  function defaultInfo() { return { transparent: false, top: [160, 160, 160], side: [140, 140, 140] }; }

  function createWorld(opts) {
    opts = opts || {};
    var yMin = opts.yMin | 0, yMax = opts.yMax | 0;
    var H = yMax - yMin + 1;
    var typeInfoFn = opts.typeInfo || defaultInfo;
    var names = [null]; // 1-basiert
    var infos = [null];
    var byName = Object.create(null);
    var chunks = new Map();

    function typeId(name) {
      var id = byName[name];
      if (id) return id;
      var inf = typeInfoFn(name) || defaultInfo();
      id = names.length;
      names.push(name);
      infos.push({ transparent: !!inf.transparent, top: inf.top, side: inf.side });
      byName[name] = id;
      return id;
    }

    function chunkAt(cx, cz, create) {
      var k = chunkKey(cx, cz);
      var c = chunks.get(k);
      if (!c && create) {
        c = { cx: cx, cz: cz, data: new Uint16Array(CHUNK * CHUNK * H), count: 0, version: 0 };
        chunks.set(k, c);
      }
      return c;
    }

    // Index innerhalb der Säule: (y * 16 + lz) * 16 + lx
    function set(x, y, z, id) {
      var ly = y - yMin;
      if (ly < 0 || ly >= H) return;
      var cx = x >> 4, cz = z >> 4;
      var c = chunkAt(cx, cz, id !== 0);
      if (!c) return;
      var i = (ly * CHUNK + (z & 15)) * CHUNK + (x & 15);
      if (c.data[i] === 0 && id !== 0) c.count++;
      else if (c.data[i] !== 0 && id === 0) c.count--;
      c.data[i] = id;
      c.version++;
    }

    function get(x, y, z) {
      var ly = y - yMin;
      if (ly < 0 || ly >= H) return 0;
      var c = chunks.get(chunkKey(x >> 4, z >> 4));
      return c ? c.data[(ly * CHUNK + (z & 15)) * CHUNK + (x & 15)] : 0;
    }

    function setRun(x, y, z0, len, id) {
      for (var k = 0; k < len; k++) set(x, y, z0 + k, id);
    }

    return {
      yMin: yMin, yMax: yMax, height: H,
      names: names, infos: infos, chunks: chunks,
      typeId: typeId, set: set, get: get, setRun: setRun, chunk: function (cx, cz) { return chunkAt(cx, cz, false); },
      blockCount: function () { var n = 0; chunks.forEach(function (c) { n += c.count; }); return n; }
    };
  }

  function hash3(x, y, z, d) {
    var h = Math.imul(x | 0, 73856093) ^ Math.imul(y | 0, 19349663) ^ Math.imul(z | 0, 83492791) ^ Math.imul(d + 1, 2654435761);
    h ^= h >>> 13; h = Math.imul(h, 1274126177); h ^= h >>> 16;
    return (h >>> 0) / 4294967296;
  }

  function newPart() {
    return { pos: [], nor: [], col: [], idx: [], quads: 0 };
  }

  function finish(p) {
    if (p.quads === 0) return null;
    var nv = p.pos.length / 3;
    return {
      positions: new Float32Array(p.pos),
      normals: new Int8Array(p.nor),
      colors: new Uint8Array(p.col),
      indices: nv > 65535 ? new Uint32Array(p.idx) : new Uint16Array(p.idx),
      quads: p.quads
    };
  }

  /**
   * Vermascht die Säule (cx, cz). Rückgabe null, wenn leer.
   * opts: variation (Standard 0.05, Helligkeitsstreuung je Fläche), maxQuad (Standard 16), skipFloor (Bodenflächen auf yMin weglassen).
   */
  function meshChunk(world, cx, cz, opts) {
    opts = opts || {};
    var variation = opts.variation === undefined ? 0.05 : opts.variation;
    var maxQuad = opts.maxQuad || 16;
    var c = world.chunk(cx, cz);
    if (!c || c.count === 0) return null;
    var H = world.height, yMin = world.yMin, infos = world.infos;
    var ox = cx * CHUNK, oz = cz * CHUNK;

    // Aufgefüllte Kopie (18 x H x 18) inklusive Randzeile der Nachbarn
    var P = new Uint16Array(PAD * H * PAD);
    for (var dz = -1; dz <= 1; dz++) {
      for (var dx = -1; dx <= 1; dx++) {
        if (dx !== 0 && dz !== 0) continue;
        var nc = (dx === 0 && dz === 0) ? c : world.chunk(cx + dx, cz + dz);
        if (!nc) continue;
        var x0 = dx === -1 ? 15 : 0, x1 = dx === 1 ? 0 : (dx === -1 ? 15 : 15);
        var z0 = dz === -1 ? 15 : 0, z1 = dz === 1 ? 0 : (dz === -1 ? 15 : 15);
        for (var y = 0; y < H; y++) {
          for (var lz = z0; lz <= z1; lz++) {
            for (var lx = x0; lx <= x1; lx++) {
              P[(y * PAD + (lz + dz * CHUNK + 1)) * PAD + (lx + dx * CHUNK + 1)] = nc.data[(y * CHUNK + lz) * CHUNK + lx];
            }
          }
        }
      }
    }
    function at(x, y, z) { // lokale Koordinaten, x,z in -1..16
      if (y < 0 || y >= H) return 0;
      return P[(y * PAD + (z + 1)) * PAD + (x + 1)];
    }

    var parts = [newPart(), newPart()]; // 0 opak, 1 transparent
    var dims = [CHUNK, H, CHUNK]; // Achsen x, y, z
    var maxMask = 0;
    for (var a = 0; a < 3; a++) for (var b = 0; b < 3; b++) maxMask = Math.max(maxMask, dims[a] * dims[b]);
    var mask = new Int32Array(maxMask);
    var q = [0, 0, 0], pos = [0, 0, 0];

    for (var d = 0; d < 3; d++) {
      var u = (d + 1) % 3, v = (d + 2) % 3;
      var du = dims[u], dv = dims[v], dd = dims[d];
      for (var s = -1; s < dd; s++) {
        // Maske der Flächen zwischen Schicht s und s+1
        var n = 0;
        for (var j = 0; j < dv; j++) {
          for (var i = 0; i < du; i++, n++) {
            pos[d] = s; pos[u] = i; pos[v] = j;
            var A = at(pos[0], pos[1], pos[2]);
            pos[d] = s + 1;
            var B = at(pos[0], pos[1], pos[2]);
            var m = 0;
            if (A !== B) {
              var tA = A ? infos[A].transparent : false, tB = B ? infos[B].transparent : false;
              // Fläche von A nach +d sichtbar, wenn B leer, oder A opak und B transparent, oder beide transparent (verschieden)
              if (A && (!B || (!tA && tB) || (tA && tB))) m = A * 2;
              else if (B && (!A || (!tB && tA) || (tB && tA))) m = B * 2 + 1;
              // Boden auf der untersten Ebene weglassen (optional)
              if (m && opts.skipFloor && d === 1 && s === -1) m = 0;
            }
            mask[n] = m;
          }
        }
        // Greedy zusammenfassen
        n = 0;
        for (var j2 = 0; j2 < dv; j2++) {
          for (var i2 = 0; i2 < du;) {
            var key = mask[n];
            if (key === 0) { i2++; n++; continue; }
            var w = 1;
            while (w < maxQuad && i2 + w < du && mask[n + w] === key) w++;
            var h = 1, done = false;
            while (j2 + h < dv && h < maxQuad && !done) {
              for (var k = 0; k < w; k++) if (mask[n + k + h * du] !== key) { done = true; break; }
              if (!done) h++;
            }
            // Fläche ausgeben
            var back = key & 1, id = key >> 1;
            var inf = infos[id];
            var part = parts[inf.transparent ? 1 : 0];
            var plane = s + 1; // Fläche liegt zwischen s und s+1
            var base = inf.transparent ? 1 : 0;
            q[d] = 0; q[u] = 0; q[v] = 0;
            var corner = [0, 0, 0];
            corner[d] = plane; corner[u] = i2; corner[v] = j2;
            var du3 = [0, 0, 0], dv3 = [0, 0, 0];
            du3[u] = w; dv3[v] = h;
            // Lokal -> Welt
            var wx = corner[0] + ox, wy = corner[1] + yMin, wz = corner[2] + oz;
            var p0 = [wx, wy, wz];
            var p1 = [wx + du3[0], wy + du3[1], wz + du3[2]];
            var p2 = [wx + du3[0] + dv3[0], wy + du3[1] + dv3[1], wz + du3[2] + dv3[2]];
            var p3 = [wx + dv3[0], wy + dv3[1], wz + dv3[2]];
            var nrm = [0, 0, 0]; nrm[d] = back ? -127 : 127;
            var shade = d === 1 ? (back ? SHADE.bottom : SHADE.top) : SHADE.side;
            var col = (d === 1 && !back) ? inf.top : inf.side;
            var jit = 1 + (hash3(wx, wy, wz, d * 2 + back) - 0.5) * 2 * variation;
            var f = shade * jit;
            var r8 = Math.max(0, Math.min(255, Math.round(col[0] * f)));
            var g8 = Math.max(0, Math.min(255, Math.round(col[1] * f)));
            var b8 = Math.max(0, Math.min(255, Math.round(col[2] * f)));
            var vi = part.pos.length / 3;
            var P4 = [p0, p1, p2, p3];
            for (var t = 0; t < 4; t++) {
              part.pos.push(P4[t][0], P4[t][1], P4[t][2]);
              part.nor.push(nrm[0], nrm[1], nrm[2]);
              part.col.push(r8, g8, b8);
            }
            // Wicklung: Vorderseite zeigt in Richtung der Normalen
            // (u, v) rechtshändig bei d=0,1,2 zyklisch: u x v = +d
            if (!back) part.idx.push(vi, vi + 1, vi + 2, vi, vi + 2, vi + 3);
            else part.idx.push(vi, vi + 2, vi + 1, vi, vi + 3, vi + 2);
            part.quads++;
            // Maske leeren
            for (var l = 0; l < h; l++) for (var k2 = 0; k2 < w; k2++) mask[n + k2 + l * du] = 0;
            i2 += w; n += w;
            void base;
          }
        }
      }
    }
    var op = finish(parts[0]), tr = finish(parts[1]);
    if (!op && !tr) return null;
    return { opaque: op, transparent: tr, quads: (op ? op.quads : 0) + (tr ? tr.quads : 0) };
  }

  return { CHUNK: CHUNK, createWorld: createWorld, meshChunk: meshChunk };
});
