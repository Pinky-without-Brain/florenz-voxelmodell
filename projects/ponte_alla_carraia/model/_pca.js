'use strict';
// Ponte alla Carraia (Katalog: 20_Stadtmodell_Florenz/wahrzeichen/ponte_alla_carraia/). Bauplan in tools/wahrzeichen/bruecke.js.
const path = require('node:path');
const { bruecke } = require('../../../tools/wahrzeichen/bruecke.js');
module.exports = bruecke(Object.assign({ dir: path.resolve(__dirname, '..') }, { form: 'ellipse', kaempfer: 2, dicke: 2, buckel: 1, bruestung: 2 }));
