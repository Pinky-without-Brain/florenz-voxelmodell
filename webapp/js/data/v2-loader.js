/**
 * V2-Loader: dekodiert window.MODULE_DATA_V2 (Base64, Int16-LE-Läufe) in das V1-Format
 * window.MODULE_N_DATA. Überschreibt nur Module, für die V2-Daten vorhanden sind.
 */
(function () {
  var src = window.MODULE_DATA_V2;
  window.MODULE_META_V2 = window.MODULE_META_V2 || {};
  if (!src) return;

  function decodeRuns(b64, palette) {
    var bin = atob(b64);
    var bytes = new Uint8Array(bin.length);
    for (var i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i);
    var view = new DataView(bytes.buffer);
    var blocks = [];
    for (var o = 0; o + 10 <= bytes.length; o += 10) {
      var x = view.getInt16(o, true), y = view.getInt16(o + 2, true), z0 = view.getInt16(o + 4, true);
      var len = view.getInt16(o + 6, true), type = palette[view.getInt16(o + 8, true)];
      for (var k = 0; k < len; k++) blocks.push({ x: x, y: y, z: z0 + k, type: type });
    }
    return blocks;
  }

  Object.keys(src).forEach(function (key) {
    var m = src[key];
    var n = m.module !== undefined ? m.module : Number(key);
    window["MODULE_" + n + "_DATA"] = m.steps.map(function (s) {
      return {
        stepNumber: s.stepNumber,
        title: s.title,
        module: m.title,
        description: s.description,
        cameraHint: s.cameraHint,
        blocks: decodeRuns(s.runs, m.palette),
        tip: s.tip,
        caution: s.caution,
        fact: s.fact
      };
    });
    window.MODULE_META_V2[n] = { title: m.title, subtitle: m.subtitle, icon: m.icon };
  });
})();
