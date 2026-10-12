/**
 * Stadtansicht (V3 B3): Gelände + alle OSM-Gebäude als LOD-Prismen (in wenigen großen Geometrien),
 * geladene Projekte als chunk-gemeshte Voxel (lazy, Reichweite und Speichergrenze einstellbar).
 * Eigene Szene und Kamera; läuft nur, solange die Ansicht aktiv ist.
 * Abhängigkeiten: THREE r128 + OrbitControls, ChunkMesher, ProjectLoader, window.STADT_BASIS.
 */
window.CityView = (function () {
  var CELL = 1200;            // Kantenlänge einer LOD-Zelle (Blöcke)
  var TERRAIN_STRIDE = 2;     // jeder 2. Datenknoten (8 Blöcke)
  var WALL_COLORS = [0xE8BA7E, 0xD48A5E, 0xDDB27A, 0xCFA070, 0xC98B62, 0xE3C08F, 0xD9A16F, 0xBF8A5F];
  var ROOF_COLORS = [0xA8523A, 0xB65E44, 0x9A4A36, 0xAF6A4E];
  var STATUS_COLORS = { gebaut: "#2e9e4f", in_arbeit: "#e8a317", geplant: "#9a7b7b" };

  var cfg = { showDist: 1400, maxChunks: 2500, meshMs: 12, flySpeed: 1 };
  var container, renderer, scene, camera, controls, sun;
  var basis = null, index = [];
  var terrain = null;         // { x0, z0, step, w, h, y: Int16Array, extX, extZ }
  var terrainMesh = null, baseCanvas = null;
  var lodGroup, lodCells = [], lodByBuilding = {};
  var pinGroup, pinSprites = [], highlightBox = null;
  var voxelProjects = {};     // id -> { id, entry, world, group, chunks:[{key,cx,cz,x,z,meshes,used}], near, hidden }
  var meshedCount = 0;
  var active = false, rafId = 0, lastT = 0, frames = 0, fpsT0 = 0, fps = 0, updateAcc = 0;
  var keys = {};
  var flight = null;
  var handlers = {};
  var opaqueMat, transMat;
  var stats = { buildings: 0, lodTris: 0, terrainTris: 0, chunksVisible: 0, chunksMeshed: 0, voxelBlocks: 0 };
  var pointerDown = null;

  // ---------------------------------------------------------------- Hilfen
  function decodeRing(arr) {
    var pts = [], x = 0, z = 0;
    for (var i = 0; i < arr.length; i += 2) {
      x = i === 0 ? arr[0] : x + arr[i];
      z = i === 0 ? arr[1] : z + arr[i + 1];
      pts.push([x / 2, z / 2]);
    }
    return pts;
  }

  function signedArea(pts) {
    var a = 0;
    for (var i = 0, n = pts.length; i < n; i++) {
      var p = pts[i], q = pts[(i + 1) % n];
      a += p[0] * q[1] - q[0] * p[1];
    }
    return a / 2;
  }

  function pointInRing(x, z, pts) {
    var inside = false;
    for (var i = 0, j = pts.length - 1; i < pts.length; j = i++) {
      var xi = pts[i][0], zi = pts[i][1], xj = pts[j][0], zj = pts[j][1];
      if ((zi > z) !== (zj > z) && x < (xj - xi) * (z - zi) / (zj - zi) + xi) inside = !inside;
    }
    return inside;
  }

  function smooth(a, b, v) { var t = Math.max(0, Math.min(1, (v - a) / (b - a))); return t * t * (3 - 2 * t); }

  // ---------------------------------------------------------------- Gelände
  function decodeTerrain(t) {
    var bin = atob(t.data);
    var bytes = new Uint8Array(bin.length);
    for (var i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i);
    var y = new Int16Array(bytes.buffer, 0, t.width * t.height);
    return { x0: t.x0, z0: t.z0, step: t.step, w: t.width, h: t.height, y: y,
      extX: (t.width - 1) * t.step, extZ: (t.height - 1) * t.step };
  }

  function groundY(x, z) {
    var T = terrain;
    if (!T) return 64;
    var fx = Math.max(0, Math.min(T.w - 1.001, (x - T.x0) / T.step)), fz = Math.max(0, Math.min(T.h - 1.001, (z - T.z0) / T.step));
    var c = Math.floor(fx), r = Math.floor(fz), tx = fx - c, tz = fz - r, i = r * T.w + c;
    return (T.y[i] * (1 - tx) + T.y[i + 1] * tx) * (1 - tz) + (T.y[i + T.w] * (1 - tx) + T.y[i + T.w + 1] * tx) * tz + 1;
  }

  // Bodenfarben und Flächen auf ein Canvas (px je 'pxPerBlock' Blöcke); auch für die 2D-Karte genutzt
  var GROUND = { sand: [194, 184, 160], green: [134, 160, 99], hill: [138, 152, 98] };
  function paintBase(ctx, w, h, bas, tr, scale) {
    // 1. Höhenfärbung pro Pixel
    var img = ctx.createImageData(w, h), d = img.data;
    for (var py = 0; py < h; py++) {
      var rz = Math.min(tr.h - 1, Math.max(0, Math.round(py / scale / tr.step)));
      for (var px = 0; px < w; px++) {
        var cx = Math.min(tr.w - 1, Math.max(0, Math.round(px / scale / tr.step)));
        var Y = tr.y[rz * tr.w + cx];
        var t = smooth(72, 125, Y);
        var o = (py * w + px) * 4;
        d[o] = GROUND.sand[0] + (GROUND.hill[0] - GROUND.sand[0]) * t;
        d[o + 1] = GROUND.sand[1] + (GROUND.hill[1] - GROUND.sand[1]) * t;
        d[o + 2] = GROUND.sand[2] + (GROUND.hill[2] - GROUND.sand[2]) * t;
        d[o + 3] = 255;
      }
    }
    ctx.putImageData(img, 0, 0);
    // 2. Flächen
    var s = scale;
    function path(list) {
      ctx.beginPath();
      for (var i = 0; i < list.length; i++) {
        var e = list[i], rings = e.o.concat(e.l || []);
        for (var k = 0; k < rings.length; k++) {
          var r = rings[k], x = 0, z = 0;
          for (var j = 0; j < r.length; j += 2) {
            x = j === 0 ? r[0] : x + r[j]; z = j === 0 ? r[1] : z + r[j + 1];
            var X = (x / 2 - tr.x0) * s, Z = (z / 2 - tr.z0) * s;
            if (j === 0) ctx.moveTo(X, Z); else ctx.lineTo(X, Z);
          }
          ctx.closePath();
        }
      }
    }
    function fill(list, color) { path(list); ctx.fillStyle = color; ctx.fill("evenodd"); }
    fill(bas.green, "#86a863");
    fill(bas.squares, "#d8cdb4");
    fill(bas.streets, "#aaa498");
    fill(bas.bridges, "#8d8478");
    fill(bas.water, "#5b86a6");
  }

  function buildTerrain() {
    var T = terrain, S = TERRAIN_STRIDE;
    var cw = Math.ceil((T.w - 1) / S) + 1, ch = Math.ceil((T.h - 1) / S) + 1;
    var pos = new Float32Array(cw * ch * 3), nor = new Float32Array(cw * ch * 3), uv = new Float32Array(cw * ch * 2);
    function Y(c, r) { return T.y[Math.min(T.h - 1, r) * T.w + Math.min(T.w - 1, c)]; }
    for (var r = 0; r < ch; r++) {
      for (var c = 0; c < cw; c++) {
        var dc = Math.min(T.w - 1, c * S), dr = Math.min(T.h - 1, r * S);
        var i = r * cw + c;
        pos[i * 3] = T.x0 + dc * T.step;
        pos[i * 3 + 1] = T.y[dr * T.w + dc] - 0.3;
        pos[i * 3 + 2] = T.z0 + dr * T.step;
        var nx = Y(dc - S, dr) - Y(dc + S, dr), nz = Y(dc, dr - S) - Y(dc, dr + S), ny = 2 * S * T.step;
        var l = Math.hypot(nx, ny, nz);
        nor[i * 3] = nx / l; nor[i * 3 + 1] = ny / l; nor[i * 3 + 2] = nz / l;
        uv[i * 2] = dc / (T.w - 1);
        uv[i * 2 + 1] = 1 - dr / (T.h - 1);
      }
    }
    var idx = new Uint32Array((cw - 1) * (ch - 1) * 6), n = 0;
    for (var r2 = 0; r2 < ch - 1; r2++) {
      for (var c2 = 0; c2 < cw - 1; c2++) {
        var a = r2 * cw + c2, b = a + 1, cc = a + cw, d = cc + 1;
        idx[n++] = a; idx[n++] = cc; idx[n++] = b;
        idx[n++] = b; idx[n++] = cc; idx[n++] = d;
      }
    }
    var geo = new THREE.BufferGeometry();
    geo.setAttribute("position", new THREE.BufferAttribute(pos, 3));
    geo.setAttribute("normal", new THREE.BufferAttribute(nor, 3));
    geo.setAttribute("uv", new THREE.BufferAttribute(uv, 2));
    geo.setIndex(new THREE.BufferAttribute(idx, 1));
    geo.computeBoundingSphere();
    stats.terrainTris = idx.length / 3;

    // Bodentextur: 2 Blöcke je Pixel
    var scale = 0.5;
    baseCanvas = document.createElement("canvas");
    baseCanvas.width = Math.ceil(T.extX * scale); baseCanvas.height = Math.ceil(T.extZ * scale);
    paintBase(baseCanvas.getContext("2d"), baseCanvas.width, baseCanvas.height, basis, T, scale);
    var tex = new THREE.CanvasTexture(baseCanvas);
    tex.anisotropy = Math.min(8, renderer.capabilities.getMaxAnisotropy());
    var mat = new THREE.MeshLambertMaterial({ map: tex, polygonOffset: true, polygonOffsetFactor: 1, polygonOffsetUnits: 1 });
    terrainMesh = new THREE.Mesh(geo, mat);
    scene.add(terrainMesh);
  }

  // ---------------------------------------------------------------- LOD-Gebäude
  function buildLod() {
    var T = terrain;
    var cells = {};
    var nx = Math.ceil(T.extX / CELL), nz = Math.ceil(T.extZ / CELL);
    function cellFor(x, z) {
      var cx = Math.max(0, Math.min(nx - 1, Math.floor((x - T.x0) / CELL)));
      var cz = Math.max(0, Math.min(nz - 1, Math.floor((z - T.z0) / CELL)));
      var k = cz * nx + cx;
      return cells[k] || (cells[k] = { pos: [], nor: [], col: [], idx: [], ranges: {}, vcount: 0 });
    }
    var wallC = WALL_COLORS.map(function (c) { return new THREE.Color(c); });
    var roofC = ROOF_COLORS.map(function (c) { return new THREE.Color(c); });
    var tmpV = [];
    var total = 0;

    basis.buildings.forEach(function (b) {
      var outers = b.o.map(decodeRing), holes = (b.l || []).map(decodeRing);
      var p0 = outers[0][0];
      var cell = cellFor(p0[0], p0[1]);
      var floor = b.b + 1, top = floor + b.h, bottom = floor - 5;
      var wc = wallC[b.w], rc = roofC[b.r];
      var start = cell.idx.length;
      // Löcher den Außenringen zuordnen
      var holesOf = outers.map(function () { return []; });
      holes.forEach(function (h) {
        for (var k = 0; k < outers.length; k++) if (pointInRing(h[0][0], h[0][1], outers[k])) { holesOf[k].push(h); return; }
      });
      function addWalls(ring, outward) {
        var area = signedArea(ring), sgn = (area > 0 ? 1 : -1) * (outward ? 1 : -1);
        for (var i = 0, n = ring.length; i < n; i++) {
          var p = ring[i], q = ring[(i + 1) % n];
          var dx = q[0] - p[0], dz = q[1] - p[1], len = Math.hypot(dx, dz);
          if (len < 0.01) continue;
          var nxv = sgn * dz / len, nzv = -sgn * dx / len;
          var v0 = cell.vcount;
          // unten p, unten q, oben q, oben p
          cell.pos.push(p[0], bottom, p[1], q[0], bottom, q[1], q[0], top, q[1], p[0], top, p[1]);
          for (var k = 0; k < 4; k++) cell.nor.push(nxv, 0, nzv);
          cell.col.push(wc.r * 0.78, wc.g * 0.78, wc.b * 0.78, wc.r * 0.78, wc.g * 0.78, wc.b * 0.78, wc.r, wc.g, wc.b, wc.r, wc.g, wc.b);
          // Dreiecksfolge so wählen, dass die Normale nach außen zeigt: (e x up) = (-dz, 0, dx)
          var dot = -dz * nxv + dx * nzv;
          if (dot > 0) cell.idx.push(v0, v0 + 1, v0 + 2, v0, v0 + 2, v0 + 3);
          else cell.idx.push(v0, v0 + 2, v0 + 1, v0, v0 + 3, v0 + 2);
          cell.vcount += 4;
        }
      }
      outers.forEach(function (ring, k) {
        addWalls(ring, true);
        holesOf[k].forEach(function (h) { addWalls(h, false); });
        // Dachfläche
        var contour = ring.map(function (p) { return new THREE.Vector2(p[0], p[1]); });
        var hv = holesOf[k].map(function (h) { return h.map(function (p) { return new THREE.Vector2(p[0], p[1]); }); });
        var tris = THREE.ShapeUtils.triangulateShape(contour, hv);
        tmpV.length = 0;
        contour.forEach(function (v) { tmpV.push(v); });
        hv.forEach(function (h) { h.forEach(function (v) { tmpV.push(v); }); });
        var base = cell.vcount;
        for (var i = 0; i < tmpV.length; i++) {
          cell.pos.push(tmpV[i].x, top, tmpV[i].y);
          cell.nor.push(0, 1, 0);
          cell.col.push(rc.r, rc.g, rc.b);
        }
        for (var t = 0; t < tris.length; t++) {
          var a = tris[t][0], bb = tris[t][1], c = tris[t][2];
          var ny = (tmpV[bb].y - tmpV[a].y) * (tmpV[c].x - tmpV[a].x) - (tmpV[bb].x - tmpV[a].x) * (tmpV[c].y - tmpV[a].y);
          if (ny > 0) cell.idx.push(base + a, base + bb, base + c); else cell.idx.push(base + a, base + c, base + bb);
        }
        cell.vcount += tmpV.length;
      });
      cell.ranges[b.i] = [start, cell.idx.length - start];
      lodByBuilding[b.i] = cell;
      total++;
    });

    lodGroup = new THREE.Group();
    var mat = new THREE.MeshLambertMaterial({ vertexColors: true });
    var tris = 0;
    Object.keys(cells).forEach(function (k) {
      var c = cells[k];
      var geo = new THREE.BufferGeometry();
      geo.setAttribute("position", new THREE.BufferAttribute(new Float32Array(c.pos), 3));
      geo.setAttribute("normal", new THREE.BufferAttribute(new Float32Array(c.nor), 3));
      geo.setAttribute("color", new THREE.BufferAttribute(new Float32Array(c.col), 3));
      c.indexAll = new Uint32Array(c.idx);
      c.idx = null; c.pos = c.nor = c.col = null;
      c.hiddenIds = {};
      c.hiddenCount = 0;
      geo.setIndex(new THREE.BufferAttribute(c.indexAll, 1));
      geo.computeBoundingSphere();
      c.geo = geo;
      c.mesh = new THREE.Mesh(geo, mat);
      lodGroup.add(c.mesh);
      lodCells.push(c);
      tris += c.indexAll.length / 3;
    });
    scene.add(lodGroup);
    stats.buildings = total;
    stats.lodTris = tris;
  }

  // Gebäude (IDs) in der LOD-Darstellung aus- bzw. einblenden
  function setLodHidden(ids, hidden) {
    var touched = [];
    ids.forEach(function (id) {
      var c = lodByBuilding[id];
      if (!c) return;
      var was = !!c.hiddenIds[id];
      if (hidden && !was) { c.hiddenIds[id] = true; c.hiddenCount++; }
      else if (!hidden && was) { delete c.hiddenIds[id]; c.hiddenCount--; }
      else return;
      if (touched.indexOf(c) < 0) touched.push(c);
    });
    touched.forEach(function (c) {
      var arr;
      if (c.hiddenCount === 0) arr = c.indexAll;
      else {
        var keep = 0, id, r;
        for (id in c.ranges) if (!c.hiddenIds[id]) keep += c.ranges[id][1];
        arr = new Uint32Array(keep);
        var o = 0;
        for (id in c.ranges) {
          if (c.hiddenIds[id]) continue;
          r = c.ranges[id];
          arr.set(c.indexAll.subarray(r[0], r[0] + r[1]), o);
          o += r[1];
        }
      }
      c.geo.setIndex(new THREE.BufferAttribute(arr, 1));
    });
  }

  // ---------------------------------------------------------------- Pins
  function pinTexture(color) {
    var cv = document.createElement("canvas");
    cv.width = cv.height = 64;
    var g = cv.getContext("2d");
    g.beginPath(); g.arc(32, 32, 26, 0, Math.PI * 2);
    g.fillStyle = color; g.fill();
    g.lineWidth = 6; g.strokeStyle = "#ffffff"; g.stroke();
    return new THREE.CanvasTexture(cv);
  }

  function centerOf(e) {
    if (e.bounds) return { x: (e.bounds.x0 + e.bounds.x1) / 2, z: (e.bounds.z0 + e.bounds.z1) / 2 };
    return { x: e.x || 0, z: e.z || 0 };
  }

  function buildPins() {
    pinGroup = new THREE.Group();
    var mats = {};
    Object.keys(STATUS_COLORS).forEach(function (k) {
      mats[k] = new THREE.SpriteMaterial({ map: pinTexture(STATUS_COLORS[k]), sizeAttenuation: false, depthTest: false, transparent: true });
    });
    index.forEach(function (e) {
      var c = centerOf(e);
      var top = e.bounds ? e.bounds.y1 : groundY(c.x, c.z) + 20;
      var s = new THREE.Sprite(mats[e.status] || mats.geplant);
      var big = e.status === "gebaut" ? 0.034 : 0.026;
      s.scale.set(big, big, 1);
      s.position.set(c.x, top + 30, c.z);
      s.renderOrder = 10;
      s.userData.pid = e.id;
      pinGroup.add(s);
      pinSprites.push(s);
    });
    scene.add(pinGroup);
  }

  function setSelected(id) {
    if (highlightBox) { scene.remove(highlightBox); highlightBox.geometry.dispose(); highlightBox = null; }
    var e = id && window.ProjectLoader.entry(id);
    if (!e || !e.bounds) return;
    var b = e.bounds;
    var g = new THREE.BoxGeometry(b.x1 - b.x0 + 4, Math.max(8, b.y1 - b.y0 + 4), b.z1 - b.z0 + 4);
    highlightBox = new THREE.LineSegments(new THREE.EdgesGeometry(g), new THREE.LineBasicMaterial({ color: 0xFFD500 }));
    highlightBox.position.set((b.x0 + b.x1) / 2, (b.y0 + b.y1) / 2, (b.z0 + b.z1) / 2);
    g.dispose();
    scene.add(highlightBox);
  }

  // ---------------------------------------------------------------- Voxel-Projekte (lazy je Chunk)
  function loadVoxels(id) {
    if (voxelProjects[id]) return Promise.resolve(voxelProjects[id]);
    var e = window.ProjectLoader.entry(id);
    if (!e || !e.modules.length) return Promise.reject(new Error("Projekt hat keine Daten: " + id));
    var world = window.ProjectLoader.worldFor(id);
    var t0 = performance.now();
    var vp = { id: id, entry: e, world: world, group: new THREE.Group(), chunks: [], near: false, loadMs: 0, blocks: 0 };
    voxelProjects[id] = vp;
    scene.add(vp.group);
    return window.ProjectLoader.fillWorld(world, id).then(function (n) {
      vp.blocks = n;
      world.chunks.forEach(function (c, key) {
        vp.chunks.push({ key: key, cx: c.cx, cz: c.cz, x: c.cx * 16 + 8, z: c.cz * 16 + 8, meshes: null, used: 0 });
      });
      vp.loadMs = performance.now() - t0;
      stats.voxelBlocks += n;
      updateVoxels(true);
      return vp;
    });
  }

  function makeMesh(part, mat) {
    var geo = new THREE.BufferGeometry();
    geo.setAttribute("position", new THREE.BufferAttribute(part.positions, 3));
    geo.setAttribute("normal", new THREE.BufferAttribute(part.normals, 3, true));
    geo.setAttribute("color", new THREE.BufferAttribute(part.colors, 3, true));
    geo.setIndex(new THREE.BufferAttribute(part.indices, 1));
    geo.computeBoundingSphere();
    var m = new THREE.Mesh(geo, mat);
    if (mat === transMat) m.renderOrder = 2;
    return m;
  }

  function meshOne(vp, ch) {
    var res = window.ChunkMesher.meshChunk(vp.world, ch.cx, ch.cz, { variation: 0.05 });
    ch.meshes = [];
    if (res) {
      if (res.opaque) ch.meshes.push(makeMesh(res.opaque, opaqueMat));
      if (res.transparent) ch.meshes.push(makeMesh(res.transparent, transMat));
    }
    ch.meshes.forEach(function (m) { vp.group.add(m); });
    meshedCount++;
  }

  function dropOne(vp, ch) {
    if (!ch.meshes) return;
    ch.meshes.forEach(function (m) { vp.group.remove(m); m.geometry.dispose(); });
    ch.meshes = null;
    meshedCount--;
  }

  function boxDist(cam, b) {
    var dx = Math.max(b.x0 - cam.x, 0, cam.x - b.x1), dy = Math.max(b.y0 - cam.y, 0, cam.y - b.y1), dz = Math.max(b.z0 - cam.z, 0, cam.z - b.z1);
    return Math.hypot(dx, dy, dz);
  }

  var meshBudgetOverride = 0;
  function updateVoxels(force) {
    var cam = camera.position, visible = 0, frameStart = performance.now();
    var deadline = performance.now() + (meshBudgetOverride ? 1e9 : cfg.meshMs), pending = 0;
    Object.keys(voxelProjects).forEach(function (id) {
      var vp = voxelProjects[id];
      if (!vp.chunks.length) return;
      var near = boxDist(cam, vp.entry.bounds) < cfg.showDist;
      if (near !== vp.near || force) {
        vp.near = near;
        setLodHidden(vp.entry.gebaeude || [], near);
      }
      vp.group.visible = near;
      var need = [];
      if (near) {
        vp.chunks.forEach(function (ch) {
          var d = Math.hypot(ch.x - cam.x, ch.z - cam.z) - 12;
          if (d < cfg.showDist) { ch.dist = d; need.push(ch); }
        });
        need.sort(function (a, b) { return a.dist - b.dist; });
      }
      var needSet = new Set(need);
      need.forEach(function (ch) {
        if (!ch.meshes) { if (performance.now() < deadline) meshOne(vp, ch); else pending++; }
        ch.used = performance.now();
        if (ch.meshes) { visible++; ch.meshes.forEach(function (m) { m.visible = true; }); }
      });
      vp.chunks.forEach(function (ch) {
        if (ch.meshes && !needSet.has(ch)) ch.meshes.forEach(function (m) { m.visible = false; });
      });
    });
    // Speichergrenze: am längsten unbenutzte Chunks verwerfen – nie Chunks, die gerade sichtbar sein sollen
    if (meshedCount > cfg.maxChunks) {
      var all = [];
      Object.keys(voxelProjects).forEach(function (id) {
        var vp = voxelProjects[id];
        vp.chunks.forEach(function (ch) { if (ch.meshes && ch.used < frameStart) all.push([vp, ch]); });
      });
      all.sort(function (a, b) { return a[1].used - b[1].used; });
      for (var i = 0; i < all.length && meshedCount > cfg.maxChunks * 0.85; i++) dropOne(all[i][0], all[i][1]);
    }
    stats.pending = pending;
    stats.chunksVisible = visible;
    stats.chunksMeshed = meshedCount;
  }

  // alle Chunks im Umkreis sofort vermaschen (für Messungen)
  function meshAllNow() {
    var t0 = performance.now();
    meshBudgetOverride = 100000;
    updateVoxels(true);
    meshBudgetOverride = 0;
    return performance.now() - t0;
  }

  // ---------------------------------------------------------------- Kamera
  function setCameraLookAt(eye, target) {
    camera.position.set(eye[0], eye[1], eye[2]);
    controls.target.set(target[0], target[1], target[2]);
    controls.update();
  }

  function viewFor(x, z, dist, azimuth, elevation) {
    var ty = groundY(x, z);
    var az = azimuth === undefined ? -0.6 : azimuth, el = elevation === undefined ? 0.75 : elevation;
    var h = Math.cos(el) * dist;
    return { target: [x, ty, z], eye: [x + Math.sin(az) * h, ty + Math.sin(el) * dist, z + Math.cos(az) * h] };
  }

  function flyTo(view, ms) {
    var dur = ms === undefined ? 1100 : ms;
    if (dur === 0) { setCameraLookAt(view.eye, view.target); return; }
    flight = {
      t0: performance.now(), dur: dur,
      e0: camera.position.clone(), t0v: controls.target.clone(),
      e1: new THREE.Vector3(view.eye[0], view.eye[1], view.eye[2]), t1: new THREE.Vector3(view.target[0], view.target[1], view.target[2])
    };
  }

  function flyToProject(e, ms) {
    var c = centerOf(e);
    var size = e.bounds ? Math.max(e.bounds.x1 - e.bounds.x0, e.bounds.z1 - e.bounds.z0, (e.bounds.y1 - e.bounds.y0)) : 60;
    var v = viewFor(c.x, c.z, Math.max(120, size * 1.7));
    if (e.bounds) v.target[1] = (e.bounds.y0 + e.bounds.y1) / 2 * 0.5 + groundY(c.x, c.z) * 0.5;
    flyTo(v, ms);
  }

  var HOME = { x: -150, z: 120, dist: 1000 };
  function homeView() { return viewFor(HOME.x, HOME.z, HOME.dist); }
  function overviewView() {
    var T = terrain;
    return viewFor(T.x0 + T.extX * 0.42, T.z0 + T.extZ * 0.45, 4300, -0.35, 0.95);
  }

  function updateFly(dt) {
    if (flight) {
      var t = Math.min(1, (performance.now() - flight.t0) / flight.dur);
      var s = t * t * (3 - 2 * t);
      camera.position.lerpVectors(flight.e0, flight.e1, s);
      controls.target.lerpVectors(flight.t0v, flight.t1, s);
      if (t >= 1) flight = null;
      return;
    }
    var f = (keys.w ? 1 : 0) - (keys.s ? 1 : 0), r = (keys.d ? 1 : 0) - (keys.a ? 1 : 0), u = (keys.e ? 1 : 0) - (keys.q ? 1 : 0);
    if (!f && !r && !u) return;
    var dist = camera.position.distanceTo(controls.target);
    var speed = Math.max(40, dist * 0.7) * (keys.shift ? 3 : 1) * cfg.flySpeed * dt;
    var fwd = new THREE.Vector3(); camera.getWorldDirection(fwd); fwd.y = 0;
    if (fwd.lengthSq() < 1e-6) fwd.set(0, 0, -1);
    fwd.normalize();
    var right = new THREE.Vector3().crossVectors(fwd, new THREE.Vector3(0, 1, 0));
    var mv = fwd.multiplyScalar(f * speed).add(right.multiplyScalar(r * speed));
    mv.y += u * speed;
    camera.position.add(mv);
    controls.target.add(mv);
  }

  // ---------------------------------------------------------------- Eingaben
  function pickPin(ev) {
    var rect = renderer.domElement.getBoundingClientRect();
    var ndc = new THREE.Vector2(((ev.clientX - rect.left) / rect.width) * 2 - 1, -((ev.clientY - rect.top) / rect.height) * 2 + 1);
    var rc = new THREE.Raycaster();
    rc.setFromCamera(ndc, camera);
    var hits = rc.intersectObjects(pinSprites, false);
    return hits.length ? hits[0].object.userData.pid : null;
  }

  function onKey(down) {
    return function (ev) {
      if (!active) return;
      if (ev.target && /INPUT|SELECT|TEXTAREA/.test(ev.target.tagName) && ev.target.type !== "range") return;
      var k = ev.key.toLowerCase();
      if (k === "shift") keys.shift = down;
      else if ("wasdqe".indexOf(k) >= 0 && k.length === 1) { keys[k] = down; if (down) flight = null; }
    };
  }

  // ---------------------------------------------------------------- Schleife
  function frame(now) {
    rafId = requestAnimationFrame(frame);
    var dt = Math.min(0.1, (now - lastT) / 1000 || 0.016);
    lastT = now;
    frames++;
    if (now - fpsT0 >= 1000) { fps = frames * 1000 / (now - fpsT0); frames = 0; fpsT0 = now; stats.fps = fps; }
    updateFly(dt);
    controls.update();
    updateAcc += dt;
    if (updateAcc > 0.12 || stats.pending > 0) { updateAcc = 0; updateVoxels(false); }
    renderer.render(scene, camera);
  }

  function resize() {
    if (!renderer || !container) return;
    var w = container.clientWidth || 800, h = container.clientHeight || 600;
    renderer.setSize(w, h);
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
  }

  // ---------------------------------------------------------------- Öffentliche API
  function init(el, h) {
    container = el;
    handlers = h || {};
    var w = el.clientWidth || 800, ht = el.clientHeight || 600;
    scene = new THREE.Scene();
    scene.background = new THREE.Color(0xCFE0EE);
    scene.fog = new THREE.FogExp2(0xDCE7F0, 0.00007);
    camera = new THREE.PerspectiveCamera(50, w / ht, 3, 20000);
    renderer = new THREE.WebGLRenderer({ antialias: true, preserveDrawingBuffer: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.5));
    renderer.setSize(w, ht);
    el.appendChild(renderer.domElement);
    scene.add(new THREE.AmbientLight(0xFFF3E0, 0.62));
    sun = new THREE.DirectionalLight(0xFFF6E5, 0.55);
    sun.position.set(0.55, 1, 0.35).multiplyScalar(1000);
    scene.add(sun);
    scene.add(new THREE.HemisphereLight(0xB2D8F7, 0xB09A7A, 0.2));
    opaqueMat = new THREE.MeshLambertMaterial({ vertexColors: true });
    transMat = new THREE.MeshLambertMaterial({ vertexColors: true, transparent: true, opacity: 0.55, depthWrite: false });
    controls = new THREE.OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.1;
    controls.maxPolarAngle = Math.PI / 2 - 0.03;
    controls.minDistance = 15;
    controls.maxDistance = 9000;
    controls.addEventListener("start", function () { flight = null; });
    renderer.domElement.addEventListener("pointerdown", function (e) { pointerDown = { x: e.clientX, y: e.clientY, t: performance.now() }; });
    renderer.domElement.addEventListener("pointerup", function (e) {
      if (!pointerDown) return;
      var moved = Math.hypot(e.clientX - pointerDown.x, e.clientY - pointerDown.y);
      pointerDown = null;
      if (moved > 5) return;
      var id = pickPin(e);
      if (id && handlers.onPick) handlers.onPick(id, e);
    });
    renderer.domElement.addEventListener("pointermove", function (e) {
      if (e.buttons) return;
      var id = pickPin(e);
      renderer.domElement.style.cursor = id ? "pointer" : "";
      if (handlers.onHover) handlers.onHover(id, e);
    });
    window.addEventListener("keydown", onKey(true));
    window.addEventListener("keyup", onKey(false));
    window.addEventListener("resize", resize);
    if (window.ResizeObserver) new ResizeObserver(resize).observe(el);
  }

  // Szene aus STADT_BASIS aufbauen; Rückgabe: Zeiten je Teil
  function buildScene(bas, idx) {
    basis = bas; index = idx || [];
    var t = {};
    var t0 = performance.now(), t1;
    terrain = decodeTerrain(basis.terrain);
    t1 = performance.now(); t.decode = t1 - t0; t0 = t1;
    buildTerrain();
    t1 = performance.now(); t.terrain = t1 - t0; t0 = t1;
    buildLod();
    t1 = performance.now(); t.buildings = t1 - t0; t0 = t1;
    buildPins();
    t.pins = performance.now() - t0;
    var v = homeView();
    setCameraLookAt(v.eye, v.target);
    return t;
  }

  function setActive(on) {
    if (on === active) return;
    active = on;
    if (on) {
      resize();
      lastT = performance.now(); fpsT0 = lastT; frames = 0;
      rafId = requestAnimationFrame(frame);
    } else {
      cancelAnimationFrame(rafId);
      keys = {};
    }
  }

  return {
    cfg: cfg, init: init, buildScene: buildScene, setActive: setActive, loadVoxels: loadVoxels, meshAllNow: meshAllNow,
    flyTo: flyTo, flyToProject: flyToProject, home: function (ms) { flyTo(homeView(), ms); }, overview: function (ms) { flyTo(overviewView(), ms); },
    setSelected: setSelected, groundY: groundY, centerOf: centerOf, resize: resize,
    decodeRing: decodeRing, paintBase: paintBase, getBaseCanvas: function () { return baseCanvas; },
    getTerrain: function () { return terrain; }, isVoxelLoaded: function (id) { return !!voxelProjects[id]; },
    getVoxelProject: function (id) { return voxelProjects[id]; },
    cameraState: function () {
      var d = new THREE.Vector3(); camera.getWorldDirection(d);
      return { x: camera.position.x, z: camera.position.z, dx: d.x, dz: d.z, tx: controls.target.x, tz: controls.target.z };
    },
    benchmark: function (n) {
      var gl = renderer.getContext();
      renderer.render(scene, camera); gl.finish();
      var t0 = performance.now();
      for (var i = 0; i < n; i++) renderer.render(scene, camera);
      gl.finish();
      return (performance.now() - t0) / n;
    },
    renderInfo: function () { return renderer.info.render; },
    stats: function () { return stats; }, STATUS_COLORS: STATUS_COLORS,
    renderOnce: function () { renderer.render(scene, camera); }, update: function () { updateVoxels(true); }
  };
})();
