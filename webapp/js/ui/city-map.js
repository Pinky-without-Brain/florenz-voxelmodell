/**
 * Stadtplan (V3 B4): 2D-Karte aus STADT_BASIS auf einem Canvas. Projekte und Wahrzeichen als Marker
 * nach Status (gebaut grün, in Arbeit gelb, geplant grau-rot), Tooltip beim Überfahren, Klick wählt das Projekt.
 * Mausrad = Zoom, Ziehen = Verschieben.
 */
window.CityMap = (function () {
  var STATUS_LABEL = { gebaut: "gebaut", in_arbeit: "in Arbeit", geplant: "geplant" };
  var TYPE_LABEL = { wahrzeichen: "Wahrzeichen", quartier: "Quartier", stadtgrund: "Stadtgrund" };
  var canvas, ctx, tip, wrap, basis, index = [], terrain, off, offScale = 0.25;
  var view = { scale: 0.1, ox: 0, oz: 0 };
  var selected = null, hover = null, onPick = null, getCamera = null;
  var drag = null, raf = 0;

  function ringPath(g, r, s, tr) {
    var x = 0, z = 0;
    for (var j = 0; j < r.length; j += 2) {
      x = j === 0 ? r[0] : x + r[j]; z = j === 0 ? r[1] : z + r[j + 1];
      var X = (x / 2 - tr.x0) * s, Z = (z / 2 - tr.z0) * s;
      if (j === 0) g.moveTo(X, Z); else g.lineTo(X, Z);
    }
    g.closePath();
  }

  function buildOffscreen() {
    var tr = terrain;
    off = document.createElement("canvas");
    off.width = Math.ceil(tr.extX * offScale); off.height = Math.ceil(tr.extZ * offScale);
    var g = off.getContext("2d");
    var base = window.CityView && window.CityView.getBaseCanvas();
    if (base) g.drawImage(base, 0, 0, off.width, off.height);
    else window.CityView.paintBase(g, off.width, off.height, basis, tr, offScale);
    // Gebäude grau, Gebäude geladener/geplanter Projekte nach Status gefärbt
    var colored = {};
    index.forEach(function (e) { (e.gebaeude || []).forEach(function (id) { colored[id] = window.CityView.STATUS_COLORS[e.status] || "#999"; }); });
    g.beginPath();
    basis.buildings.forEach(function (b) { if (!colored[b.i]) b.o.forEach(function (r) { ringPath(g, r, offScale, tr); }); });
    g.fillStyle = "#7f7f86"; g.fill();
    var byColor = {};
    basis.buildings.forEach(function (b) { if (colored[b.i]) (byColor[colored[b.i]] = byColor[colored[b.i]] || []).push(b); });
    Object.keys(byColor).forEach(function (col) {
      g.beginPath();
      byColor[col].forEach(function (b) { b.o.forEach(function (r) { ringPath(g, r, offScale, tr); }); });
      g.fillStyle = col; g.fill();
    });
  }

  function fit() {
    var cw = canvas.clientWidth || 300, ch = canvas.clientHeight || 260;
    view.scale = Math.min(cw / terrain.extX, ch / terrain.extZ);
    view.ox = terrain.x0 - (cw / view.scale - terrain.extX) / 2;
    view.oz = terrain.z0 - (ch / view.scale - terrain.extZ) / 2;
  }

  function toScreen(x, z) { return [(x - view.ox) * view.scale, (z - view.oz) * view.scale]; }
  function toWorld(px, py) { return [px / view.scale + view.ox, py / view.scale + view.oz]; }

  function centerOf(e) { return window.CityView.centerOf(e); }

  function resizeCanvas() {
    var dpr = Math.min(window.devicePixelRatio || 1, 2);
    var w = canvas.clientWidth, h = canvas.clientHeight;
    if (!w || !h) return false;
    if (canvas.width !== Math.round(w * dpr) || canvas.height !== Math.round(h * dpr)) {
      canvas.width = Math.round(w * dpr); canvas.height = Math.round(h * dpr);
    }
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    return true;
  }

  function draw() {
    raf = 0;
    if (!off || !resizeCanvas()) return;
    var w = canvas.clientWidth, h = canvas.clientHeight;
    ctx.fillStyle = "#cfd8e0"; ctx.fillRect(0, 0, w, h);
    var s = view.scale, tr = terrain;
    ctx.imageSmoothingEnabled = true;
    ctx.drawImage(off, (tr.x0 - view.ox) * s, (tr.z0 - view.oz) * s, tr.extX * s, tr.extZ * s);
    // Marker
    index.forEach(function (e) {
      var c = centerOf(e), p = toScreen(c.x, c.z);
      if (p[0] < -10 || p[1] < -10 || p[0] > w + 10 || p[1] > h + 10) return;
      var r = e.id === "duomo" ? 8 : 6;
      ctx.beginPath(); ctx.arc(p[0], p[1], r, 0, Math.PI * 2);
      ctx.fillStyle = window.CityView.STATUS_COLORS[e.status] || "#999";
      ctx.fill();
      ctx.lineWidth = 2; ctx.strokeStyle = "#fff"; ctx.stroke();
      if (e.id === selected || e.id === hover) {
        ctx.beginPath(); ctx.arc(p[0], p[1], r + 4, 0, Math.PI * 2);
        ctx.lineWidth = 2.5; ctx.strokeStyle = e.id === selected ? "#FFD500" : "#1E232A"; ctx.stroke();
      }
    });
    // Kamera
    if (getCamera) {
      var cs = getCamera();
      if (cs) {
        var p = toScreen(cs.x, cs.z), t = toScreen(cs.tx, cs.tz);
        ctx.beginPath(); ctx.moveTo(p[0], p[1]); ctx.lineTo(t[0], t[1]);
        ctx.strokeStyle = "rgba(0,85,191,.8)"; ctx.lineWidth = 2; ctx.stroke();
        ctx.beginPath(); ctx.arc(p[0], p[1], 4, 0, Math.PI * 2); ctx.fillStyle = "#0055BF"; ctx.fill();
      }
    }
  }

  function schedule() { if (!raf) raf = requestAnimationFrame(draw); }

  function hit(px, py) {
    var best = null, bd = 11;
    index.forEach(function (e) {
      var c = centerOf(e), p = toScreen(c.x, c.z);
      var d = Math.hypot(p[0] - px, p[1] - py);
      if (d < bd) { bd = d; best = e; }
    });
    return best;
  }

  function showTip(e, px, py) {
    if (!tip) return;
    if (!e) { tip.style.display = "none"; return; }
    tip.innerHTML = "<strong>" + e.title + "</strong><br>" + (TYPE_LABEL[e.type] || e.type) + " · " + (STATUS_LABEL[e.status] || e.status);
    tip.style.display = "block";
    var w = wrap.clientWidth;
    tip.style.left = Math.min(w - 170, Math.max(4, px + 12)) + "px";
    tip.style.top = Math.max(4, py - 38) + "px";
  }

  function init(opts) {
    canvas = opts.canvas; tip = opts.tooltip; wrap = opts.wrap || canvas.parentNode;
    onPick = opts.onPick; getCamera = opts.getCamera;
    ctx = canvas.getContext("2d");
    function pos(ev) { var r = canvas.getBoundingClientRect(); return [ev.clientX - r.left, ev.clientY - r.top]; }
    canvas.addEventListener("pointerdown", function (ev) {
      var p = pos(ev);
      drag = { x: p[0], y: p[1], ox: view.ox, oz: view.oz, moved: false };
      canvas.setPointerCapture(ev.pointerId);
    });
    canvas.addEventListener("pointermove", function (ev) {
      var p = pos(ev);
      if (drag && ev.buttons) {
        var dx = p[0] - drag.x, dy = p[1] - drag.y;
        if (Math.abs(dx) + Math.abs(dy) > 4) drag.moved = true;
        if (drag.moved) { view.ox = drag.ox - dx / view.scale; view.oz = drag.oz - dy / view.scale; schedule(); showTip(null); return; }
      }
      var e = hit(p[0], p[1]);
      var id = e ? e.id : null;
      if (id !== hover) { hover = id; schedule(); }
      canvas.style.cursor = e ? "pointer" : "grab";
      showTip(e, p[0], p[1]);
    });
    canvas.addEventListener("pointerup", function (ev) {
      var moved = drag && drag.moved;
      drag = null;
      if (moved) return;
      var p = pos(ev), e = hit(p[0], p[1]);
      if (e && onPick) onPick(e.id, ev);
    });
    canvas.addEventListener("pointerleave", function () { hover = null; showTip(null); schedule(); });
    canvas.addEventListener("wheel", function (ev) {
      ev.preventDefault();
      var p = pos(ev), w0 = toWorld(p[0], p[1]);
      var f = ev.deltaY < 0 ? 1.25 : 0.8;
      var min = Math.min(canvas.clientWidth / terrain.extX, canvas.clientHeight / terrain.extZ) * 0.9;
      view.scale = Math.max(min, Math.min(2, view.scale * f));
      view.ox = w0[0] - p[0] / view.scale; view.oz = w0[1] - p[1] / view.scale;
      schedule();
    }, { passive: false });
    window.addEventListener("resize", function () { if (off) { fit(); schedule(); } });
  }

  function build(bas, idx) {
    basis = bas; index = idx; terrain = window.CityView.getTerrain();
    var t0 = performance.now();
    buildOffscreen();
    fit();
    schedule();
    return performance.now() - t0;
  }

  return {
    init: init, build: build, draw: schedule, fit: function () { if (terrain) { fit(); schedule(); } },
    select: function (id) { selected = id; schedule(); },
    refreshIndex: function (idx) { index = idx; if (off) { buildOffscreen(); schedule(); } },
    setIndex: function (idx) { index = idx; schedule(); },
    STATUS_LABEL: STATUS_LABEL, TYPE_LABEL: TYPE_LABEL
  };
})();
