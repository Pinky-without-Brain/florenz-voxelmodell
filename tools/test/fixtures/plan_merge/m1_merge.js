'use strict';
// Synthetisches Testmodul.
module.exports = { module: 1, build(ctx) {
  ctx.part('a').fill(ctx.shapes.box(0, 64, 0, 9, 64, 9), 'stone_bricks');     // 100
  ctx.part('b').fill(ctx.shapes.box(20, 64, 0, 29, 64, 14), 'stone_bricks');  // 150
  ctx.part('c').fill(ctx.shapes.box(40, 64, 0, 89, 64, 29), 'stone_bricks');  // 50*30=1500
  ctx.part('d_pad'); // leer
} };
