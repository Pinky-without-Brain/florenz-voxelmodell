'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const { emitSite, gapToModel, MIN_GAP } = require('../emit/site.js');

test('Site: Datei wird geschrieben, Gebäude halten Abstand zum Modell', () => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'site-'));
  const r = emitSite({ outDir: dir });
  const text = fs.readFileSync(r.file, 'utf8');
  assert.match(text, /window\.SITE_V2 = /);
  const win = {};
  new Function('window', text)(win);
  const s = win.SITE_V2;
  assert.equal(s.landmarks.length, 6);
  assert.ok(s.buildings.length > 0);
  for (const b of s.buildings) assert.ok(gapToModel(b.poly) >= MIN_GAP);
});

test('Site: Polygon auf dem Modell wird erkannt', () => {
  assert.equal(gapToModel([[-10, -10], [10, -10], [10, 10], [-10, 10]]), 0);
});
