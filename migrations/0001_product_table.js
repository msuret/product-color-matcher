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
    photo: 'character varying',
    url: {
      type: 'character varying',
      notNull: true
    }    
  },
  {ifNotExists: true}
);

exports.down = pgm => pgm.dropTable(
  'products',
  {ifExists: true}
);