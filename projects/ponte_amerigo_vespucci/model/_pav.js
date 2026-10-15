'use strict';
// Ponte Amerigo Vespucci (Katalog: 20_Stadtmodell_Florenz/wahrzeichen/ponte_amerigo_vespucci/). Bauplan in tools/wahrzeichen/bruecke.js.
const path = require('node:path');
const { bruecke } = require('../../../tools/wahrzeichen/bruecke.js');
module.exports = bruecke(Object.assign({ dir: path.resolve(__dirname, '..') }, { form: 'segment', kaempfer: 2, dicke: 2, buckel: 0, bruestung: 2 }));
