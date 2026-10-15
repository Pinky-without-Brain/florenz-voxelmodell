'use strict';
// Ponte alle Grazie (Katalog: 20_Stadtmodell_Florenz/wahrzeichen/ponte_alle_grazie/). Bauplan in tools/wahrzeichen/bruecke.js.
const path = require('node:path');
const { bruecke } = require('../../../tools/wahrzeichen/bruecke.js');
module.exports = bruecke(Object.assign({ dir: path.resolve(__dirname, '..') }, { form: 'segment', kaempfer: 2, dicke: 2, buckel: 0, bruestung: 2 }));
