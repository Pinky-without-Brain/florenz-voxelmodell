'use strict';
// Ponte Santa Trinita (Katalog: 20_Stadtmodell_Florenz/wahrzeichen/ponte_santa_trinita/). Bauplan in tools/wahrzeichen/bruecke.js.
const path = require('node:path');
const { bruecke } = require('../../../tools/wahrzeichen/bruecke.js');
module.exports = bruecke(Object.assign({ dir: path.resolve(__dirname, '..') }, { form: 'ellipse', kaempfer: 3, dicke: 2, buckel: 2, bruestung: 2, statuen: true }));
