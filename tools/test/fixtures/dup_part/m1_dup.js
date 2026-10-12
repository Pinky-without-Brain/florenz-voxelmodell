'use strict';
// Synthetisches Testmodul.
module.exports = { module: 1, build(ctx) {
  ctx.part('x').set(0, 56, 0, 'stone_bricks');
  ctx.part('x');
} };
