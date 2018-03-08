var request = require('supertest');
const assert = require('assert');
const db = require('../app/db');

describe('API', () => {
  
  let app;
  
  before(() =>
     db.none('TRUNCATE TABLE products')
       .then(() => db.none('INSERT INTO products(id, photo, color_lab) VALUES' +
                          ' (${row1.id}, ${row1.photo}, ${row1.color_lab}),' +
                          ' (${row0.id}, ${row0.photo}, ${row0.color_lab}),' +
                          ' (${row2.id}, ${row2.photo}, ${row2.color_lab})',
                          {
                            row0: {
                              id: 'id0',
                              photo: 'http://example.com/example0.jpg',
                              color_lab: '(0,0,0)'
                            },
                            row1: {
                              id: 'id1',
                              photo: 'http://example.com/example1.jpg',
                              color_lab: '(10,10,10)'
                            },
                            row2: {
                              id: 'id2',
                              photo: 'http://example.com/example2.jpg',
                              color_lab: '(50,50,50)'
                            }
                          }
      ))
      .then(() => require('../app/server'))
      .then(a => {
        app = a;
      })
  );
  
  
  it('list products', ()=>
     request(app).get('/v1/products')
       .expect(200)
       .then(res => {
         assert.strictEqual(res.body.length, 3);
         //rows should be ordered by id
         assert.strictEqual(res.body[0].id, 'id0');
         assert.strictEqual(res.body[1].id, 'id1');
         assert.strictEqual(res.body[2].id, 'id2');
       })
  );
  
  it('list products with limit and offset', () =>
    request(app).get('/v1/products')
     .query({limit: 1, offset: 1})
     .expect(200)
       .then(res => {
         //only 2nd product should be returned 
         assert.strictEqual(res.body.length, 1)
         assert.strictEqual(res.body[0].id, 'id1');
       })
  );
  
  it('get product by id', () =>
     request(app).get('/v1/products/id2')
       .expect(200)
       .then(res => {
         assert.strictEqual(res.body.id, 'id2');
       })
  );
  
  it('get inexistant product by id should return 404', () =>
     request(app).get('/v1/products/foo')
       .expect(404)
  );
  
  it('get product neighbors', () =>
     request(app).get('/v1/products/id1/neighbors')
       .expect(200)
       .then(res => {
         //id1 is closer to id0 than id2
         assert.strictEqual(res.body.length, 2)
         assert.strictEqual(res.body[0].id, 'id0');
         assert.strictEqual(res.body[1].id, 'id2');
         return request(app).get('/v1/products/id2/neighbors')
           .expect(200);
       })
       .then(res => {
          //id2 is closer to id1 than id0
          assert.strictEqual(res.body.length, 2)
          assert.strictEqual(res.body[0].id, 'id1');
          assert.strictEqual(res.body[1].id, 'id0');
       })
      
  );
  
  it('get inexistant product neighbours should return 404', () =>
     request(app).get('/v1/products/foo/neighbors')
       .expect(404)
  );
  
  after(() => app.close());

});