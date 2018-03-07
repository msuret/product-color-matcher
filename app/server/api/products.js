"use strict";

var express = require('express');
var _ = require('lodash');
var db = require('../../db');

module.exports = express.Router()
  .get('/', (req, res) =>
    db.any('SELECT * FROM products ORDER BY id LIMIT ${limit} OFFSET ${offset}', _.defaults(req.query, {limit: 10, offset: 0}))
      .then(_.bindKey(res, 'json'))
      .catch(req.next)
  )
  .get('/:productId', (req, res) =>
    db.one('SELECT * FROM products WHERE id = ${productId}', req.params)
      .then(_.bindKey(res, 'json'))
      .catch(req.next)
  )
  .get('/:productId/neighbors', (req, res) =>
     //execute queries in a REPEATABLE READ transaction to make sure the row is not deleted between db queries
     db.tx(
       {mode: new db.$config.pgp.txMode.TransactionMode(db.$config.pgp.txMode.isolationLevel.repeatableRead, true)},
       //first make sure that the product exists to return a 404 if it doesn't
       t => t.one(
              'SELECT color_lab, cube_ll_coord(color_lab, 1) l, cube_ll_coord(color_lab, 2) a, cube_ll_coord(color_lab, 3) b FROM products WHERE id = ${productId}',
              req.params
            )
            .then(lab => t.any(
              'SELECT * FROM products WHERE id <> ${productId} ORDER BY color_lab <-> cube(ARRAY[${lab.l},${lab.a},${lab.b}]) LIMIT ${limit}',
               _.defaults(req.params, req.query, {lab, limit: 5})
           ))
     )
     .then(_.bindKey(res, 'json'))
     .catch(req.next)
  );