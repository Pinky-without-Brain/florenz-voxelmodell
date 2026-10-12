'use strict';
// Testturm turm_ost: Sockel 7×7 (Y 64–65) und Schaft 5×5 (Y 66–85) um (3000, 0).
const CX = 3000, CZ = 0;

module.exports = { module: 1, build(ctx) {
  if (!ctx.project || ctx.project.id !== 'turm_ost' || !ctx.frame) throw new Error('ctx.project/ctx.frame fehlt');
  const { box } = ctx.shapes;
  ctx.part('sockel', { symmetry: { order: 4, cx: CX, cz: CZ } })
    .fill(box(CX - 3, 64, CZ - 3, CX + 3, 65, CZ + 3), 'stone_bricks');
  ctx.part('schaft', { symmetry: { order: 4, cx: CX, cz: CZ } })
    .fill(box(CX - 2, 66, CZ - 2, CX + 2, 85, CZ + 2), 'stone_bricks');
} };
