'use strict';
// Synthetisches Testmodul.
module.exports = { module: 1, build(ctx) {
  ctx.part('ok_block').set(0, 64, 0, 'stone_bricks');        // Gelände bis Y 63
  ctx.part('over_crypt').set(-170, 64, 0, 'stone_bricks');   // über dem Krypta-Hohlraum
} };
