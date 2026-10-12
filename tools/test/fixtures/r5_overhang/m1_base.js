'use strict';
// Synthetisches Testmodul.
module.exports = { module: 1, build(ctx) {
  ctx.part('base').fill(ctx.shapes.box(0, 56, 0, 4, 60, 4), 'stone_bricks');
} };
