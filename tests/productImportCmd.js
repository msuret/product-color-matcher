"use strict";

const assert = require('assert');
const sinon = require('sinon');
const productImportCmd = require('../app/cmd/productImport');
const db = require('../app/db');

describe('Import Command', () => {

    
    before(() => {
        //prevent closing the database connection pool, we need it for other tests
        sinon.stub(db.$pool, "end");
        return  db.none('TRUNCATE TABLE products');
    });

    it('should load CSV rows in database', () =>
        productImportCmd.run(`${__dirname}/resources/csv_import_test.csv`)
               //db pool must be closed after the command
               .then(() => assert(db.$pool.end.called))
               .then(() => db.any('SELECT * FROM products ORDER BY id'))
               .then(products => {
                    assert.strictEqual(products.length, 2);
                    assert.strictEqual(products[0].id, 'id0');
                    assert.strictEqual(products[0].title, 'title0');
                    assert.strictEqual(products[0].gender_id, 'MAN');
                    assert.strictEqual(products[0].composition, 'composition0');
                    assert.strictEqual(products[0].sleeve, 'short');
                    assert.strictEqual(products[0].photo, 'http://example.com/example1.jpg');
                    assert.strictEqual(products[0].url, 'http://example.com/example1');
                    assert.strictEqual(products[1].id, 'id1');
                    assert.strictEqual(products[1].title, 'title1');
                    assert.strictEqual(products[1].gender_id, 'WOM');
                    assert.strictEqual(products[1].composition, 'composition1');
                    assert.strictEqual(products[1].sleeve, 'long');
                    assert.strictEqual(products[1].photo, 'http://example.com/example2.jpg');
                    assert.strictEqual(products[1].url, 'http://example.com/example2');
               })
    );

    after(() => {
        db.$pool.end.restore();
    });
});
