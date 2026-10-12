'use strict';
// Synthetisches Testmodul.
module.exports = { module: 1, build(ctx) {
  ctx.part('flat').fill(ctx.shapes.box(0, 64, 0, 59, 64, 49), 'stone_bricks'); // 3000 in einer Lage
} };
