"use strict";

const fs = require('fs');
const csv = require('csv-parser');
const bulkStream = require('bulkstream');
const bluebird = require('bluebird');
const _ = require('lodash');
const db = require('../db');

const columns = new db.$config.pgp.helpers.ColumnSet(
  ['id', 'title', 'gender_id', 'composition', 'sleeve', 'photo', 'url'],
  {table: 'products'}
);

//insert rows in a transaction to stay in a stable state (the file wil be either totally accepted or totally rejected)
db.tx(
  t => {
    let rowCountPromise = bluebird.resolve(0);
    return bluebird.fromCallback(
      //read from the file provided in argument
      cb => fs.createReadStream(process.argv[2])
          .pipe(csv({separator: ';'}))
          //make groups of 100 rows to insert in bulk
          .pipe(bulkStream.create(100))
          .on('data', data =>
            //"increment" rowCountPromise by the number of rows affected by this bulk upsert
            rowCountPromise = bluebird.join(
              rowCountPromise,
              t.result(`${db.$config.pgp.helpers.insert(data, columns)} ON CONFLICT (id) DO UPDATE SET title = EXCLUDED.title, gender_id = EXCLUDED.gender_id, composition = EXCLUDED.composition, sleeve = EXCLUDED.sleeve, photo = EXCLUDED.photo, url = EXCLUDED.url`)
                   .get('rowCount'),
              _.add
            )
          )
          //once the end of the file is reached, end the transaction as soon as all queries returned
          .on('close', ()  => rowCountPromise.asCallback(cb))
      );
  }
)
.then(_.partial(console.log, 'Done, %i lines upserted'))
.catch(console.err)
.finally(db.$pool.end);