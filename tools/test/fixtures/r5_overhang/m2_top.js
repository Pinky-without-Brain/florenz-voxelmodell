'use strict';
// Synthetisches Testmodul.
module.exports = { module: 2, build(ctx) {
  const t = ctx.part('top');
  t.fill(ctx.shapes.box(0, 61, 0, 4, 61, 4), 'stone_bricks');
  t.set(6, 61, 0, 'stone_bricks'); // überhängend
} };
