'use strict';
// Palette-Typ (tools/spec/palette.js) -> Bedrock-Blockname und Zustände (Minecraft 1.26).
// Namen und Zustände sind an der Weltkopie (Auenland, zuletzt 1.26.21) und am Wiki geprüft.
const nbt = require('./nbt_le.js');
const { TYPES } = require('../spec/palette.js');

/** Blockzustands-Version (häufigster und einziger Wert in der Weltkopie: 18168865 = 1.21.60.33). */
const BLOCK_VERSION = 18168865;

// Abweichungen der Bedrock-Namen von den Palettentypen (Java-Namen)
const ABWEICHUNG = {
  chiseled_quartz: 'chiseled_quartz_block',
  bricks: 'brick_block',
  terracotta: 'hardened_clay',
  end_stone_bricks: 'end_bricks'
};

// Zustände je Bedrock-Name: [name, 'byte'|'int'|'string', wert]
const AXIS_Y = [['pillar_axis', 'string', 'y']];
const ZUSTAENDE = {
  quartz_pillar: AXIS_Y,
  smooth_quartz: AXIS_Y,
  oak_log: AXIS_Y,
  oak_leaves: [['persistent_bit', 'byte', 1], ['update_bit', 'byte', 0]],
  water: [['liquid_depth', 'int', 0]],
  bedrock: [['infiniburn_bit', 'byte', 0]]
};

/** Typen, die zusätzlich zur Palette für das Gelände gebraucht werden. */
const EXTRA = ['bedrock'];

/** Alle Typen, die der Export kennt (Luft ist Id 0 und steht nicht hier). */
const ALLE_TYPEN = [...new Set([...TYPES, ...EXTRA])];

function bedrockName(type) {
  if (!ALLE_TYPEN.includes(type)) throw new Error(`Minecraft-Export: unbekannter Blocktyp "${type}"`);
  return 'minecraft:' + (ABWEICHUNG[type] || type);
}

function statesOf(type) {
  return ZUSTAENDE[bedrockName(type).slice(10)] || [];
}

function entryTag(name, states) {
  const m = new Map();
  for (const [k, t, v] of states) m.set(k, t === 'byte' ? nbt.byte(v) : t === 'int' ? nbt.int(v) : nbt.string(v));
  return nbt.compound([['name', nbt.string(name)], ['states', nbt.compound(m)], ['version', nbt.int(BLOCK_VERSION)]]);
}

const cache = new Map();
/** Palette-Eintrag als LE-NBT-Puffer (Wurzel-Compound ohne Namen). Typ 'air' ist erlaubt. */
function paletteEntry(type) {
  let b = cache.get(type);
  if (!b) {
    b = type === 'air' ? nbt.write('', entryTag('minecraft:air', [])) : nbt.write('', entryTag(bedrockName(type), statesOf(type)));
    cache.set(type, b);
  }
  return b;
}

/** Tabelle für Berichte: [{ type, name, states }] */
function tabelle() {
  return ALLE_TYPEN.map((t) => ({ type: t, name: bedrockName(t), states: statesOf(t) }));
}

module.exports = { BLOCK_VERSION, ABWEICHUNG, ZUSTAENDE, ALLE_TYPEN, bedrockName, statesOf, paletteEntry, tabelle };
