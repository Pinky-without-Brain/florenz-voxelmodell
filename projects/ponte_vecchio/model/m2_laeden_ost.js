'use strict';
// Modul 2 – Läden Ost mit Loggia (Katalog §3); unter dem Corridoio Vasariano.
const { bauLaeden } = require('./_laeden.js');
module.exports = { module: 2, build(ctx) { bauLaeden(ctx, 'ost'); } };
