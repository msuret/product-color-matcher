var express = require('express');
var _ = require('lodash');
var db = require('../../db');

module.exports = express.Router()
  .get('/', (req, res) =>
    db.any('SELECT * FROM products ORDER BY id LIMIT ${limit} OFFSET ${offset}', _.defaults(req.query, {limit: 10, offset: 0}))
      .then(res.json.bind(res))
      .catch(req.next)
  );