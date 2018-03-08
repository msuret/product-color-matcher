"use strict";

const assert = require('assert');
const sinon = require('sinon');
const vision = require('@google-cloud/vision');
const colorDetectionCmd = require('../app/cmd/colorDetection');
const db = require('../app/db');

describe('Color Detection Command', () => {

    const imagePropertiesStub = sinon.stub();

    before(() => {
        //prevent closing the database connection pool, we need it for other tests
        sinon.stub(db.$pool, "end");

        //fake calls to google vision API, because they're expensive
        imagePropertiesStub.resolves([{
                "imagePropertiesAnnotation": {
                    "dominantColors": {
                        "colors": [
                            {
                                "color": {
                                    "red": 69,
                                    "green": 42,
                                    "blue": 27
                                },
                                "score": 0.15197733,
                                "pixelFraction": 0.14140345
                            },
                            {
                                "color": {
                                    "red": 159,
                                    "green": 193,
                                    "blue": 252
                                },
                                "score": 0.12624279,
                                "pixelFraction": 0.046971671
                            }
                        ]
                    }
                }
            }]);

        sinon.stub(vision, 'ImageAnnotatorClient').callsFake(function () {
            this.imageProperties = imagePropertiesStub;
        });
      
        //insert a row in database
        return  db.none('TRUNCATE TABLE products')
                 .then(() => db.none('INSERT INTO products (id, photo) VALUES ($1, $2)', ['id0', 'http://example.com/example1.jpg']));

    });

    it('should fill color columns', () =>
        colorDetectionCmd.run()
            .then(() => {
                assert(db.$pool.end.called);
                assert(imagePropertiesStub.calledWith('http://example.com/example1.jpg'));
             })
            .then(() => db.one('SELECT color_rgb, color_lab FROM products'))
            .then(product => {
                assert.strictEqual(product.color_rgb, '(69, 42, 27)');
                assert.strictEqual(product.color_lab, '(20.045, 10.663, 14.931)');
            })
            
    );

    after(() => {
        db.$pool.end.restore();
        vision.ImageAnnotatorClient.restore();
    });
});


