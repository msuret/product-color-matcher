"use strict"

exports.up = pgm => pgm.createTable(
  'products',
  {
    id:  {
      type: 'character varying',
      primaryKey: true,
      notNull: true
    },
    title: 'character varying',
    gender_id: 'character varying',
    composition: 'character varying',
    sleeve: 'character varying',
    photo:  {
      type: 'character varying',
      notNull: true
    },
    url: 'character varying',
    color_rgb: 'cube',
    color_lab: 'cube'
  },
  {ifNotExists: true}
);

exports.down = pgm => pgm.dropTable(
  'products',
  {ifExists: true}
);