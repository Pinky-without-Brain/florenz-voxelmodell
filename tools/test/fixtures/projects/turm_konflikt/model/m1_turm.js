'use strict';
// Testturm turm_konflikt: Sockel 7×7 (Y 64–65) und Schaft 5×5 (Y 66–85) um (3002, 1).
const CX = 3002, CZ = 1;

module.exports = { module: 1, build(ctx) {
  if (!ctx.project || ctx.project.id !== 'turm_konflikt' || !ctx.frame) throw new Error('ctx.project/ctx.frame fehlt');
  const { box } = ctx.shapes;
  ctx.part('sockel', { symmetry: { order: 4, cx: CX, cz: CZ } })
    .fill(box(CX - 3, 64, CZ - 3, CX + 3, 65, CZ + 3), 'stone_bricks');
  ctx.part('schaft', { symmetry: { order: 4, cx: CX, cz: CZ } })
    .fill(box(CX - 2, 66, CZ - 2, CX + 2, 85, CZ + 2), 'smooth_stone');
} };
