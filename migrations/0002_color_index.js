"use strict"

exports.up = pgm => pgm.createIndex(
  'products',
  'color_lab',
  {method: 'gist'}
);

exports.down = pgm => pgm.dropIndex(
  'products',
  'color_lab'
);