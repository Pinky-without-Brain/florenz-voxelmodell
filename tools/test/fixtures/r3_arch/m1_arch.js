'use strict';
// Synthetisches Testmodul.
module.exports = { module: 1, build(ctx) {
  const p = ctx.part('pillars'); // 2 x 6x6x9 = 648
  p.fill(ctx.shapes.box(0, 56, 0, 5, 64, 5), 'stone_bricks');
  p.fill(ctx.shapes.box(8, 56, 0, 13, 64, 5), 'stone_bricks');
  // Bogen/Sturz über die Lücke, nur an den Enden gestützt (4 x 84 = 336)
  ctx.part('arch').fill(ctx.shapes.box(0, 65, 0, 13, 68, 5), 'stone_bricks');
} };
