'use strict';
// Synthetisches Testmodul: eine Lage, 162 Spalten zu je 89 Blöcken (14.418).
module.exports = { module: 1, build(ctx) {
  ctx.part('wide').fill(ctx.shapes.box(0, 56, 0, 161, 56, 88), 'stone_bricks');
} };
