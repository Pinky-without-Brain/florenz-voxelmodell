'use strict';
// Synthetisches Testmodul.
module.exports = { module: 3, build(ctx) {
  ctx.part('fine').set(10, 56, 10, 'stone_bricks'); // Build läuft für übrige Module weiter
} };
