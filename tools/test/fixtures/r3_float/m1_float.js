'use strict';
// Synthetisches Testmodul.
module.exports = { module: 1, build(ctx) {
  ctx.part('tower').fill(ctx.shapes.box(0, 56, 0, 2, 62, 2), 'stone_bricks');
  ctx.part('floater').set(10, 59, 10, 'stone_bricks'); // schwebt ohne Verbindung
} };
