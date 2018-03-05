const config = require('config');
const QueryStream = require('pg-query-stream');
const bluebird = require('bluebird');
const bluestream = require('bluestream');
const _ = require('lodash');
const vision = require('@google-cloud/vision');
const normalizeUrl = require('normalize-url');
const colourProximity = require('colour-proximity');
const db = require('../db');

const googleCloudClient = new vision.ImageAnnotatorClient({
  keyFilename: config.get('google-cloud.keyFile'),
  promise: bluebird
});

bluebird.fromCallback(cb =>
  db.stream(
    new QueryStream('SELECT id, photo FROM products WHERE color_rgb IS NULL OR color_lab IS NULL'),
    stream => bluebird.resolve(
      stream
        .pipe(bluestream.map(product =>
          //get the dominant color from Google Cloud Vision API
          googleCloudClient.imageProperties(normalizeUrl(product.photo))
            .then(_.property('[0].imagePropertiesAnnotation.dominantColors.colors[0].color'))
            .then(color =>
               //convert the color to Lab format and save it into database
               db.result(
                 'UPDATE products SET color_rgb = cube(ARRAY[${rgb.red},${rgb.green},${rgb.blue}]), color_lab = cube(ARRAY[${lab.l},${lab.a},${lab.b}]) WHERE id = ${id}',
                  {
                    rgb: color,
                    lab: _.zipObject(['l', 'a', 'b'], colourProximity.rgb2lab([color.red, color.green, color.blue])),
                    id: product.id
                  }
               )
            )
            .then(_.property('rowCount'))
        ))
        .pipe(bluestream.reduce(_.add, 0))
        .promise()
      )
      .asCallback(cb)
  )
)
.then(_.partial(console.log, 'Done, %i lines processed'))
.catch(console.err)
.finally(db.$pool.end);