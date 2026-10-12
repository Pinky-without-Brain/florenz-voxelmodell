const fs = require('fs');

global.window = {};

const moduleFiles = [
  { mod: 0, file: 'webapp/js/data/module_0_steps.js', name: 'MODULE_0_DATA' },
  { mod: 1, file: 'webapp/js/data/module_1_steps.js', name: 'MODULE_1_DATA' },
  { mod: 2, file: 'webapp/js/data/module_2_steps.js', name: 'MODULE_2_DATA' },
  { mod: 3, file: 'webapp/js/data/module_3_steps.js', name: 'MODULE_3_DATA' },
  { mod: 4, file: 'webapp/js/data/module_4_steps.js', name: 'MODULE_4_DATA' },
  { mod: 5, file: 'webapp/js/data/module_5_steps.js', name: 'MODULE_5_DATA' },
  { mod: 6, file: 'webapp/js/data/module_6_steps.js', name: 'MODULE_6_DATA' },
  { mod: 7, file: 'webapp/js/data/module_7_steps.js', name: 'MODULE_7_DATA' },
  { mod: 8, file: 'webapp/js/data/module_8_steps.js', name: 'MODULE_8_DATA' }
];

const allModules = [];
let grandTotalBlocks = 0;
let grandTotalSteps = 0;
let maxStepBlocks = 0;
let maxStepInfo = '';

const globalBlockMap = new Map();
const crossCollisions = [];

moduleFiles.forEach(mf => {
  global.window = {};
  require(`../${mf.file}`);
  const steps = global.window[mf.name];
  let modBlocks = 0;
  let modMax = 0;

  steps.forEach((s, sIdx) => {
    grandTotalSteps++;
    const count = s.blocks.length;
    modBlocks += count;
    grandTotalBlocks += count;

    if (count > modMax) modMax = count;
    if (count > maxStepBlocks) {
      maxStepBlocks = count;
      maxStepInfo = `Modul ${mf.mod} Step ${s.stepNumber} (${s.title}): ${count} blocks`;
    }

    s.blocks.forEach(b => {
      const k = `${b.x},${b.y},${b.z}`;
      if (globalBlockMap.has(k)) {
        const prev = globalBlockMap.get(k);
        if (prev.mod !== mf.mod) {
          crossCollisions.push({
            coord: k,
            modA: prev.mod,
            stepA: prev.step,
            modB: mf.mod,
            stepB: s.stepNumber
          });
        }
      } else {
        globalBlockMap.set(k, { mod: mf.mod, step: s.stepNumber });
      }
    });
  });

  allModules.push({
    mod: mf.mod,
    stepsCount: steps.length,
    totalBlocks: modBlocks,
    maxStepBlocks: modMax
  });
});

console.log('=== KATHEDRALE SANTA MARIA DEL FIORE: GESAMTAUDIT ===');
allModules.forEach(m => {
  console.log(`Modul ${m.mod}: ${m.stepsCount.toString().padStart(2)} Schritte, ${m.totalBlocks.toString().padStart(6)} Blöcke, Max Schritt: ${m.maxStepBlocks.toString().padStart(5)} Blöcke`);
});
console.log('----------------------------------------------------');
console.log(`Gesamtzahl Bauschritte: ${grandTotalSteps}`);
console.log(`Gesamtzahl Blöcke:     ${grandTotalBlocks}`);
console.log(`Größter Einzelschritt: ${maxStepInfo}`);
console.log(`Kollisionen zwischen verschiedenen Modulen: ${crossCollisions.length}`);

if (crossCollisions.length > 0) {
  console.log('Sample Kollisionen:', crossCollisions.slice(0, 10));
}
