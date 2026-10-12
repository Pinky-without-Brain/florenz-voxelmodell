'use strict';
// Synthetisches Testmodul.
module.exports = { module: 1, build(ctx) {
  const a = ctx.part('a');
  const b = ctx.part('b');
  a.fill(ctx.shapes.box(0, 56, 0, 3, 56, 3), 'stone_bricks');
  b.fillUnion(ctx.shapes.box(2, 56, 2, 5, 56, 5), 'stone_bricks'); // 4 Zellen überlappen
} };
