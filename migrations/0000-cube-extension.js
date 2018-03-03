exports.up = pgm => pgm.createExtension('cube', { ifNotExists: true });
exports.down = pgm => pgm.dropExtension('cube', {ifExists: true});