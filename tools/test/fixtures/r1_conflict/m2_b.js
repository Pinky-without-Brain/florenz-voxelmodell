'use strict';
// Synthetisches Testmodul.
module.exports = { module: 2, build(ctx) {
  ctx.part('clash').set(2, 56, 2, 'stone_bricks');
} };
