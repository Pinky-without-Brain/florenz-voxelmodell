'use strict';
// Synthetisches Testmodul.
module.exports = { module: 1, build(ctx) {
  const w = ctx.part('layers');
  w.fill(ctx.shapes.box(0, 64, 0, 19, 75, 19), 'stone_bricks'); // 12 Lagen à 400
  w.fill(ctx.shapes.box(0, 76, 0, 19, 76, 9), 'stone_bricks');  // 200
} };
