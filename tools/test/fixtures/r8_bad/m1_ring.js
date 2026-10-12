'use strict';
// Synthetisches Testmodul.
module.exports = { module: 1, build(ctx) {
  const w = ctx.part('ring', { symmetry: { order: 4, cx: 0, cz: 0 } });
  w.fill(ctx.shapes.hollowBox(-6, 56, -6, 6, 60, 6, 1), 'stone_bricks');
  w.set(5, 58, 0, 'stone_bricks');
} };
