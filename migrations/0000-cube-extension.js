"use strict"

exports.up = pgm => pgm.createExtension('cube', { ifNotExists: true });
//don't remove extension, it can still be used by other applications
exports.down = pgm => {};